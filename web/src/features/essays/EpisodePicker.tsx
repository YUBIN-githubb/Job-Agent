'use client'
// Design Ref: §5.4 — Episode picker modal: 에피소드 선택

import type { Episode } from '@/types/episode'
import TagBadge from '@/components/ui/TagBadge'
import StrengthStars from '@/components/ui/StrengthStars'

interface EpisodePickerProps {
  episodes: Episode[]
  selected: string[]
  onChange: (ids: string[]) => void
  onClose: () => void
}

export default function EpisodePicker({
  episodes,
  selected,
  onChange,
  onClose,
}: EpisodePickerProps) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[80vh] flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">에피소드 선택</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {episodes.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            등록된 에피소드가 없습니다.{' '}
            <a href="/episodes" className="text-blue-600 underline">
              에피소드 추가하기
            </a>
          </p>
        ) : (
          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {episodes.map((ep) => {
              const checked = selected.includes(ep.id)
              return (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => toggle(ep.id)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    checked
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${checked ? 'text-blue-700' : 'text-gray-900'}`}>
                      {ep.title}
                    </span>
                    <TagBadge tag={ep.primaryCompetency} variant={checked ? 'primary' : 'default'} />
                    <StrengthStars value={ep.strength} />
                  </div>
                  {ep.coreMessage && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-1 italic">
                      &ldquo;{ep.coreMessage}&rdquo;
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition"
          >
            선택 완료 ({selected.length}개)
          </button>
        </div>
      </div>
    </div>
  )
}
