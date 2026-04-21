'use server'
// Design Ref: §4.1 — Server Actions for essay save/update

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { ActionResult } from '@/types/essay'
import { toEssay, type Essay } from '@/types/essay'

const saveEssaySchema = z.object({
  jobId: z.string().uuid(),
  questionNumber: z.number().int().min(1),
  questionText: z.string().optional(),
  content: z.string(),
  episodeIds: z.array(z.string().uuid()),
})

export async function saveEssay(input: unknown): Promise<ActionResult<Essay>> {
  const session = await auth()
  if (!session) return { success: false, error: '로그인이 필요합니다' }

  const parsed = saveEssaySchema.safeParse(input)
  if (!parsed.success) return { success: false, error: '입력값을 확인해 주세요' }

  const supabase = await createClient()

  // upsert: 같은 job_id + question_number면 덮어쓰기
  const { data, error } = await supabase
    .from('essays')
    .upsert(
      {
        user_id: session.user.id,
        job_id: parsed.data.jobId,
        question_number: parsed.data.questionNumber,
        question_text: parsed.data.questionText,
        content: parsed.data.content,
        episode_ids: parsed.data.episodeIds,
        status: 'draft',
      },
      { onConflict: 'user_id,job_id,question_number' },
    )
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/jobs/${parsed.data.jobId}`)
  return { success: true, data: toEssay(data) }
}

export async function updateEssayStatus(
  essayId: string,
  status: 'draft' | 'review' | 'final',
): Promise<ActionResult<void>> {
  const session = await auth()
  if (!session) return { success: false, error: '로그인이 필요합니다' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('essays')
    .update({ status })
    .eq('id', essayId)
    .eq('user_id', session.user.id)

  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}
