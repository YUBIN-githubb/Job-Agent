'use client'
// Design Ref: §5.4 — Essay editor: 스트리밍 생성 + 편집 + 저장 + 글자수

import { useState } from 'react'
import type { Episode } from '@/types/episode'
import type { Essay } from '@/types/essay'
import type { EssayQuestion } from '@/types/job'
import EpisodePicker from './EpisodePicker'
import { saveEssay } from './actions'
import TagBadge from '@/components/ui/TagBadge'

interface EssayEditorProps {
  jobId: string
  question: EssayQuestion
  episodes: Episode[]
  existingEssay?: Essay
}

export default function EssayEditor({
  jobId,
  question,
  episodes,
  existingEssay,
}: EssayEditorProps) {
  const [selectedEpisodeIds, setSelectedEpisodeIds] = useState<string[]>(
    existingEssay?.episodeIds ?? [],
  )
  const [showPicker, setShowPicker] = useState(false)
  const [content, setContent] = useState(existingEssay?.content ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function handleGenerate() {
    if (selectedEpisodeIds.length === 0) {
      alert('에피소드를 먼저 선택해 주세요.')
      return
    }
    setIsLoading(true)
    setGenerateError('')
    setContent('')
    setSaved(false)
    try {
      const res = await fetch('/api/agent/essay-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          questionNumber: question.number,
          episodeIds: selectedEpisodeIds,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setGenerateError(data.error ?? '자소서 생성에 실패했습니다')
        return
      }
      setContent(data.content)
    } catch {
      setGenerateError('네트워크 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    const result = await saveEssay({
      jobId,
      questionNumber: question.number,
      questionText: question.text,
      content,
      episodeIds: selectedEpisodeIds,
    })
    setSaving(false)
    if (!result.success) {
      setSaveError(result.error)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const selectedEpisodes = episodes.filter((e) => selectedEpisodeIds.includes(e.id))

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      {/* 문항 */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">Q{question.number}</span>
          {question.charLimit && (
            <span className="text-xs text-gray-400">제한 {question.charLimit}자</span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-700">{question.text}</p>
      </div>

      {/* 에피소드 선택 */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-500">사용 에피소드:</span>
          {selectedEpisodes.length === 0 ? (
            <span className="text-xs text-gray-400">선택 없음</span>
          ) : (
            selectedEpisodes.map((ep) => (
              <TagBadge key={ep.id} tag={ep.title} variant="primary" />
            ))
          )}
          <button
            onClick={() => setShowPicker(true)}
            className="text-xs text-blue-600 hover:text-blue-700 underline"
          >
            {selectedEpisodeIds.length === 0 ? '에피소드 선택' : '변경'}
          </button>
        </div>
      </div>

      {/* 자소서 편집기 */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">자소서</span>
          <span
            className={`text-xs ${content.length > (question.charLimit ?? 550) ? 'text-red-500' : 'text-gray-400'}`}
          >
            {content.length}{question.charLimit ? ` / ${question.charLimit}` : ''}자
          </span>
        </div>
        <textarea
          value={isLoading ? content : content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
          rows={10}
          placeholder="에피소드를 선택하고 자소서 생성 버튼을 눌러주세요."
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-none"
        />
        {isLoading && (
          <p className="mt-1 text-xs text-blue-500 animate-pulse">AI가 자소서를 생성 중입니다...</p>
        )}
        {generateError && (
          <p className="mt-1 text-xs text-red-500">{generateError}</p>
        )}
        {saveError && (
          <p className="mt-1 text-xs text-red-500">{saveError}</p>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleGenerate}
          disabled={isLoading || selectedEpisodeIds.length === 0}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isLoading ? '생성 중...' : content ? '재생성' : '자소서 생성'}
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !content || isLoading}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          {saving ? '저장 중...' : saved ? '✓ 저장됨' : '저장'}
        </button>
      </div>

      {showPicker && (
        <EpisodePicker
          episodes={episodes}
          selected={selectedEpisodeIds}
          onChange={setSelectedEpisodeIds}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
