// Design Ref: §3.1 — Essay entity type definition

export type EssayStatus = 'draft' | 'review' | 'final'

export interface Essay {
  id: string
  userId: string
  jobId: string
  questionNumber: number
  questionText?: string
  content: string
  episodeIds: string[]
  status: EssayStatus
  reviewNotes?: string
  createdAt: string
  updatedAt: string
}

// Plan SC: server action result type for consistent error handling
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export function toEssay(row: Record<string, unknown>): Essay {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    jobId: row.job_id as string,
    questionNumber: row.question_number as number,
    questionText: row.question_text as string | undefined,
    content: (row.content as string) ?? '',
    episodeIds: (row.episode_ids as string[]) ?? [],
    status: (row.status as EssayStatus) ?? 'draft',
    reviewNotes: row.review_notes as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}
