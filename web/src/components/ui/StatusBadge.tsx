import type { JobStatus } from '@/types/job'

const STATUS_STYLES: Record<JobStatus, string> = {
  수집완료: 'bg-gray-100 text-gray-600',
  분석완료: 'bg-blue-50 text-blue-700',
  문항분석완료: 'bg-indigo-50 text-indigo-700',
  자소서작성중: 'bg-yellow-50 text-yellow-700',
  자소서완료: 'bg-emerald-50 text-emerald-700',
  지원완료: 'bg-green-100 text-green-700',
  결과대기: 'bg-purple-50 text-purple-700',
  최종결과: 'bg-pink-50 text-pink-700',
  마감: 'bg-red-50 text-red-600',
}

interface StatusBadgeProps {
  status: JobStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  )
}
