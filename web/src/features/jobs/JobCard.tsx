'use client'

import Link from 'next/link'
import type { Job } from '@/types/job'
import StatusBadge from '@/components/ui/StatusBadge'
import { deleteJob } from './actions'

interface JobCardProps {
  job: Job
}

export default function JobCard({ job }: JobCardProps) {
  async function handleDelete() {
    if (!confirm(`"${job.company} - ${job.title}" 공고를 삭제하시겠습니까?`)) return
    const result = await deleteJob(job.id)
    if (!result.success) alert(result.error)
  }

  const isExpired =
    job.deadline && new Date(job.deadline) < new Date() && job.status === '수집완료'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500">{job.company}</span>
            <StatusBadge status={job.status} />
            {isExpired && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-500">
                마감
              </span>
            )}
          </div>
          <Link
            href={`/jobs/${job.id}`}
            className="mt-1 block font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {job.title}
          </Link>
          <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
            {job.deadline && (
              <span>마감: {new Date(job.deadline).toLocaleDateString('ko-KR')}</span>
            )}
            <span>문항 {job.questions.length}개</span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="shrink-0 rounded-md px-2.5 py-1 text-xs text-red-400 border border-red-100 hover:bg-red-50 transition"
        >
          삭제
        </button>
      </div>
    </div>
  )
}
