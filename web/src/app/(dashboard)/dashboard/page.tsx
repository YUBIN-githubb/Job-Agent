// Design Ref: §5.4 — Dashboard: 요약 카드 + 마감 임박 공고 + 최근 자소서
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { toJob } from '@/types/job'
import DashboardSummary from '@/features/dashboard/DashboardSummary'

export default async function DashboardPage() {
  const session = await auth()
  const supabase = await createClient()

  const [{ data: jobsData }, { data: essaysData }] = await Promise.all([
    supabase
      .from('jobs')
      .select('*')
      .eq('user_id', session!.user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('essays')
      .select('id, job_id, status, updated_at')
      .eq('user_id', session!.user.id),
  ])

  const jobs = (jobsData ?? []).map(toJob)
  const essays = essaysData ?? []

  // 마감 임박 공고 (7일 이내, 미완료)
  const today = new Date()
  const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcoming = jobs.filter((j) => {
    if (!j.deadline) return false
    const deadline = new Date(j.deadline)
    return (
      deadline >= today &&
      deadline <= sevenDaysLater &&
      !['지원완료', '마감', '최종결과'].includes(j.status)
    )
  })

  const stats = {
    total: jobs.length,
    inProgress: jobs.filter((j) =>
      ['수집완료', '분석완료', '문항분석완료', '자소서작성중', '자소서완료'].includes(j.status),
    ).length,
    applied: jobs.filter((j) => j.status === '지원완료').length,
    essaysDone: essays.filter((e) => e.status === 'final').length,
  }

  return <DashboardSummary stats={stats} upcoming={upcoming} jobs={jobs} />
}
