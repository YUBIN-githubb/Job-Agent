'use client'
// Design Ref: §5.4 — Dashboard: summary cards, 마감 임박, 최근 활동

import Link from 'next/link'
import type { Job } from '@/types/job'
import StatusBadge from '@/components/ui/StatusBadge'

interface Stats {
  total: number
  inProgress: number
  applied: number
  essaysDone: number
}

interface DashboardSummaryProps {
  stats: Stats
  upcoming: Job[]
  jobs: Job[]
}

export default function DashboardSummary({ stats, upcoming, jobs }: DashboardSummaryProps) {
  const recentJobs = jobs.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-0.5 text-sm text-gray-500">지원 현황을 한눈에 확인합니다</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="전체 공고" value={stats.total} color="gray" />
        <StatCard label="진행중" value={stats.inProgress} color="blue" />
        <StatCard label="지원완료" value={stats.applied} color="green" />
        <StatCard label="자소서 완성" value={stats.essaysDone} color="purple" />
      </div>

      {/* 마감 임박 공고 */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
              마감 임박
            </span>
            7일 이내 마감 공고
          </h2>
          <div className="space-y-2">
            {upcoming.map((job) => {
              const daysLeft = Math.ceil(
                (new Date(job.deadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
              )
              return (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 hover:bg-red-100 transition"
                >
                  <div>
                    <span className="text-xs text-gray-500">{job.company}</span>
                    <p className="text-sm font-medium text-gray-900">{job.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={job.status} />
                    <span className="text-xs font-semibold text-red-600">D-{daysLeft}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* 공고 목록 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">최근 공고</h2>
          <Link href="/jobs" className="text-xs text-blue-600 hover:text-blue-700">
            전체 보기 →
          </Link>
        </div>
        {recentJobs.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400">등록된 공고가 없습니다.</p>
            <Link
              href="/jobs"
              className="mt-2 inline-block text-sm text-blue-600 hover:underline"
            >
              공고 등록하기
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 transition"
              >
                <div>
                  <span className="text-xs text-gray-400">{job.company}</span>
                  <p className="text-sm font-medium text-gray-900">{job.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={job.status} />
                  {job.deadline && (
                    <span className="text-xs text-gray-400">
                      {new Date(job.deadline).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'gray' | 'blue' | 'green' | 'purple'
}) {
  const colors = {
    gray: 'bg-gray-50 text-gray-900',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    purple: 'bg-purple-50 text-purple-700',
  }
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-0.5 text-xs opacity-70">{label}</p>
    </div>
  )
}
