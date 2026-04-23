'use client'
// Design Ref: §5.4 — 기업 분석 실행/조회 버튼 + collapsible 리포트

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
        <div className="mt-3 space-y-1">
          <p className="text-xs text-gray-500 animate-pulse">Claude가 기업을 분석하고 있습니다...</p>
          <p className="text-xs text-gray-400">웹 리서치를 포함하므로 5~10분 정도 소요될 수 있습니다.</p>
        </div>
      )}

      {report && open && (
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ children }) => (
                <div className="my-3 overflow-x-auto">
                  <table className="w-full border-collapse text-xs">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-gray-200">{children}</thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-gray-200">{children}</tbody>
              ),
              tr: ({ children }) => <tr>{children}</tr>,
              th: ({ children }) => (
                <th className="px-3 py-1.5 text-left font-semibold text-gray-700 whitespace-nowrap">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-1.5 text-gray-600 align-top">{children}</td>
              ),
              h1: ({ children }) => (
                <h1 className="text-base font-bold text-gray-900 mt-4 mb-2 first:mt-0">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-sm font-semibold text-gray-800 mt-4 mb-1.5 first:mt-0">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-medium text-gray-700 mt-3 mb-1">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-xs leading-relaxed text-gray-700 my-1.5">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-4 my-1.5 space-y-0.5">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-4 my-1.5 space-y-0.5">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-xs text-gray-700 leading-relaxed">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">{children}</strong>
              ),
              hr: () => <hr className="border-gray-200 my-3" />,
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {children}
                </a>
              ),
            }}
          >
            {report}
          </ReactMarkdown>
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
