'use client'

import { useState } from 'react'
import type { Job, JobStatus } from '@/types/job'
import JobCard from './JobCard'
import JobForm from './JobForm'

const STATUS_FILTERS: { label: string; value: JobStatus | 'all' }[] = [
  { label: '전체', value: 'all' },
  { label: '진행중', value: '자소서작성중' },
  { label: '완료', value: '자소서완료' },
  { label: '지원완료', value: '지원완료' },
]

interface JobListProps {
  jobs: Job[]
}

export default function JobList({ jobs }: JobListProps) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<JobStatus | 'all'>('all')

  const filtered =
    filter === 'all' ? jobs : jobs.filter((j) => j.status === filter)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">공고</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            지원할 공고를 등록하고 자소서를 작성합니다
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition"
        >
          + 공고 등록
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <JobForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* 필터 */}
      <div className="mb-4 flex gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
              filter === f.value
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">
            {filter === 'all' ? '등록된 공고가 없습니다.' : '해당 상태의 공고가 없습니다.'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition"
            >
              첫 공고 등록하기
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
