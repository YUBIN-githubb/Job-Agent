'use client'
// Design Ref: §5.4 — 공고 상태 변경 드롭다운

import { useState } from 'react'
import { JOB_STATUSES, type JobStatus } from '@/types/job'
import { updateJobStatus } from './actions'

interface JobStatusSelectorProps {
  jobId: string
  currentStatus: JobStatus
}

export default function JobStatusSelector({ jobId, currentStatus }: JobStatusSelectorProps) {
  const [status, setStatus] = useState<JobStatus>(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleChange(next: JobStatus) {
    setLoading(true)
    const result = await updateJobStatus(jobId, next)
    setLoading(false)
    if (!result.success) {
      alert(result.error)
      return
    }
    setStatus(next)
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value as JobStatus)}
      disabled={loading}
      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50"
    >
      {JOB_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  )
}
