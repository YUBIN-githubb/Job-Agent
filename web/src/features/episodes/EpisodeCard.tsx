'use client'
// Design Ref: §5.4 — Episode card: title, primary_competency, strength, tags, edit/delete buttons

import { useState } from 'react'
import type { Episode } from '@/types/episode'
import TagBadge from '@/components/ui/TagBadge'
import StrengthStars from '@/components/ui/StrengthStars'
import { deleteEpisode } from './actions'
import EpisodeForm from './EpisodeForm'

interface EpisodeCardProps {
  episode: Episode
}

export default function EpisodeCard({ episode }: EpisodeCardProps) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`"${episode.title}" 에피소드를 삭제하시겠습니까?`)) return
    setDeleting(true)
    const result = await deleteEpisode(episode.id)
    if (!result.success) {
      alert(result.error)
      setDeleting(false)
    }
  }

  if (editing) {
    return (
      <EpisodeForm
        defaultValues={episode}
        episodeId={episode.id}
        onClose={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">{episode.title}</h3>
            <TagBadge tag={episode.primaryCompetency} variant="primary" />
          </div>
          <div className="mt-1">
            <StrengthStars value={episode.strength} />
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="rounded-md px-2.5 py-1 text-xs text-gray-500 border border-gray-200 hover:bg-gray-50 transition"
          >
            수정
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md px-2.5 py-1 text-xs text-red-500 border border-red-100 hover:bg-red-50 transition disabled:opacity-50"
          >
            {deleting ? '...' : '삭제'}
          </button>
        </div>
      </div>

      {episode.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {episode.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      {episode.coreMessage && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2 italic">
          &ldquo;{episode.coreMessage}&rdquo;
        </p>
      )}

      {episode.action && (
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{episode.action}</p>
      )}
    </div>
  )
}
