'use client'
// Design Ref: §5.4 — 기업 분석 실행/조회 버튼 + collapsible 리포트

import { useState } from 'react'

interface CompanyAnalystPanelProps {
  jobId: string
  initialReport?: string
}

export default function CompanyAnalystPanel({
  jobId,
  initialReport,
}: CompanyAnalystPanelProps) {
  const [report, setReport] = useState(initialReport ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(!!initialReport)

  async function handleAnalyze() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/agent/company-analyst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '기업 분석에 실패했습니다')
        return
      }
      setReport(data.content)
      setOpen(true)
    } catch {
      setError('네트워크 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">기업 분석</h2>
        <div className="flex gap-2">
          {report && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="rounded-md px-3 py-1.5 text-xs text-gray-500 border border-gray-200 hover:bg-gray-50 transition"
            >
              {open ? '접기' : '펼치기'}
            </button>
          )}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 transition disabled:opacity-50"
          >
            {loading ? '분석 중...' : report ? '재분석' : 'AI 기업 분석'}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}

      {loading && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <span className="animate-pulse">Claude가 기업을 분석하고 있습니다...</span>
        </div>
      )}

      {report && open && (
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-gray-700 font-sans">
            {report}
          </pre>
        </div>
      )}

      {!report && !loading && (
        <p className="mt-2 text-xs text-gray-400">
          AI 기업 분석 버튼을 눌러 공고 맞춤 기업 분석 리포트를 생성하세요.
        </p>
      )}
    </div>
  )
}
