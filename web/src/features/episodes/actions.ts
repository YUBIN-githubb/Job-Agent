'use server'
// Design Ref: §4.1 — Server Actions for episode CRUD
// Plan SC: user_id 검증으로 RLS 이중 보호

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { episodeSchema } from './schemas'
import type { ActionResult } from '@/types/essay'
import { toEpisode, type Episode } from '@/types/episode'

export async function createEpisode(
  formData: unknown,
): Promise<ActionResult<Episode>> {
  const session = await auth()
  if (!session) return { success: false, error: '로그인이 필요합니다' }

  const parsed = episodeSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: '입력값을 확인해 주세요' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('episodes')
    .insert({
      user_id: session.user.id,
      episode_id: parsed.data.episodeId,
      source: parsed.data.source,
      title: parsed.data.title,
      primary_competency: parsed.data.primaryCompetency,
      tags: parsed.data.tags,
      strength: parsed.data.strength,
      situation: parsed.data.situation,
      task: parsed.data.task,
      action: parsed.data.action,
      result: parsed.data.result,
      core_message: parsed.data.coreMessage,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/episodes')
  return { success: true, data: toEpisode(data) }
}

export async function updateEpisode(
  id: string,
  formData: unknown,
): Promise<ActionResult<Episode>> {
  const session = await auth()
  if (!session) return { success: false, error: '로그인이 필요합니다' }

  const parsed = episodeSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: '입력값을 확인해 주세요' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('episodes')
    .update({
      episode_id: parsed.data.episodeId,
      source: parsed.data.source,
      title: parsed.data.title,
      primary_competency: parsed.data.primaryCompetency,
      tags: parsed.data.tags,
      strength: parsed.data.strength,
      situation: parsed.data.situation,
      task: parsed.data.task,
      action: parsed.data.action,
      result: parsed.data.result,
      core_message: parsed.data.coreMessage,
    })
    .eq('id', id)
    .eq('user_id', session.user.id) // RLS 이중 보호
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/episodes')
  return { success: true, data: toEpisode(data) }
}

export async function deleteEpisode(id: string): Promise<ActionResult<void>> {
  const session = await auth()
  if (!session) return { success: false, error: '로그인이 필요합니다' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('episodes')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/episodes')
  return { success: true, data: undefined }
}
