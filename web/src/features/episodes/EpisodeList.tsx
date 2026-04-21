'use client'
// Design Ref: §5.4 — Episode list: 카드 목록 + empty state + 추가 버튼

import { useState } from 'react'
import type { Episode } from '@/types/episode'
import EpisodeCard from './EpisodeCard'
import EpisodeForm from './EpisodeForm'

interface EpisodeListProps {
  episodes: Episode[]
}

export default function EpisodeList({ episodes }: EpisodeListProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">에피소드</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            자소서 재료가 되는 경험을 STAR 구조로 정리합니다
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition"
        >
          + 에피소드 추가
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <EpisodeForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {episodes.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">에피소드가 없습니다.</p>
          <p className="mt-1 text-sm text-gray-400">
            경험을 추가하면 AI가 자소서 문항에 맞는 에피소드를 찾아드립니다.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition"
          >
            첫 에피소드 추가하기
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {episodes.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} />
          ))}
        </div>
      )}
    </div>
  )
}
