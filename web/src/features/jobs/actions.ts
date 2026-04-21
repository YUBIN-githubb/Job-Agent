'use server'
// Design Ref: §4.1 — Server Actions for job CRUD

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { jobSchema, updateJobStatusSchema } from './schemas'
import type { ActionResult } from '@/types/essay'
import { toJob, type Job, type JobStatus } from '@/types/job'

export async function createJob(formData: unknown): Promise<ActionResult<Job>> {
  const session = await auth()
  if (!session) return { success: false, error: '로그인이 필요합니다' }

  const parsed = jobSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: '입력값을 확인해 주세요' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      user_id: session.user.id,
      job_id: parsed.data.jobId,
      company: parsed.data.company,
      title: parsed.data.title,
      deadline: parsed.data.deadline || null,
      body: parsed.data.body || null,
      questions: parsed.data.questions,
      status: '수집완료',
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/jobs')
  return { success: true, data: toJob(data) }
}

export async function updateJobStatus(
  id: string,
  status: JobStatus,
): Promise<ActionResult<void>> {
  const session = await auth()
  if (!session) return { success: false, error: '로그인이 필요합니다' }

  const parsed = updateJobStatusSchema.safeParse({ status })
  if (!parsed.success) return { success: false, error: '유효하지 않은 상태값입니다' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('jobs')
    .update({ status: parsed.data.status })
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/jobs')
  revalidatePath(`/jobs/${id}`)
  return { success: true, data: undefined }
}

export async function deleteJob(id: string): Promise<ActionResult<void>> {
  const session = await auth()
  if (!session) return { success: false, error: '로그인이 필요합니다' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/jobs')
  return { success: true, data: undefined }
}
