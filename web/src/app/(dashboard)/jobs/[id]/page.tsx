// Design Ref: §5.4 — Job detail: 공고 정보 + 문항별 EssayEditor
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { toJob } from '@/types/job'
import { toEpisode } from '@/types/episode'
import { toEssay } from '@/types/essay'
import StatusBadge from '@/components/ui/StatusBadge'
import EssayEditor from '@/features/essays/EssayEditor'
import JobStatusSelector from '@/features/jobs/JobStatusSelector'
import CompanyAnalystPanel from '@/features/jobs/CompanyAnalystPanel'

interface Props {
  params: Promise<{ id: string }>
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  const supabase = await createClient()

  const [{ data: jobData }, { data: episodeData }, { data: essayData }, { data: reportData }] =
    await Promise.all([
      supabase.from('jobs').select('*').eq('id', id).eq('user_id', session!.user.id).single(),
      supabase.from('episodes').select('*').eq('user_id', session!.user.id).order('created_at', { ascending: false }),
      supabase.from('essays').select('*').eq('job_id', id).eq('user_id', session!.user.id),
      supabase.from('company_reports').select('content').eq('job_id', id).eq('user_id', session!.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ])

  if (!jobData) notFound()

  const job = toJob(jobData)
  const episodes = (episodeData ?? []).map(toEpisode)
  const essays = (essayData ?? []).map(toEssay)

  return (
    <div className="space-y-6">
      {/* 공고 헤더 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">{job.company}</span>
              <StatusBadge status={job.status} />
            </div>
            <h1 className="mt-1 text-xl font-bold text-gray-900">{job.title}</h1>
            {job.deadline && (
              <p className="mt-1 text-sm text-gray-400">
                마감: {new Date(job.deadline).toLocaleDateString('ko-KR')}
              </p>
            )}
          </div>
          <JobStatusSelector jobId={job.id} currentStatus={job.status} />
        </div>
      </div>

      {/* 기업 분석 */}
      <CompanyAnalystPanel jobId={job.id} initialReport={reportData?.content} />

      {/* 에피소드 없음 경고 */}
      {episodes.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          등록된 에피소드가 없습니다.{' '}
          <a href="/episodes" className="font-medium underline">
            에피소드를 먼저 추가해 주세요.
          </a>{' '}
          에피소드 없이는 자소서를 생성할 수 없습니다.
        </div>
      )}

      {/* 문항별 자소서 에디터 */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900">
          자소서 문항 ({job.questions.length}개)
        </h2>
        {job.questions.map((question) => {
          const existingEssay = essays.find((e) => e.questionNumber === question.number)
          return (
            <EssayEditor
              key={question.number}
              jobId={job.id}
              question={question}
              episodes={episodes}
              existingEssay={existingEssay}
            />
          )
        })}
      </div>
    </div>
  )
}
