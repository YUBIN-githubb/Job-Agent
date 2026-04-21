// Design Ref: §4.2 — company-analyst Route Handler (non-streaming, 60초 이내)

import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { toJob } from '@/types/job'
import { buildCompanyAnalystPrompt } from '@/lib/prompts/company-analyst'

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const body = await req.json()
  const { jobId } = body as { jobId: string }

  if (!jobId) {
    return NextResponse.json({ error: 'jobId가 필요합니다' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: jobData } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', session.user.id)
    .single()

  if (!jobData) {
    return NextResponse.json({ error: '공고를 찾을 수 없습니다' }, { status: 404 })
  }

  const job = toJob(jobData)

  const prompt = buildCompanyAnalystPrompt({
    company: job.company,
    jobTitle: job.title,
    jobBody: job.body,
  })

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    prompt,
    maxTokens: 1500,
  })

  // 기업 분석 리포트 저장
  const { data: report, error } = await supabase
    .from('company_reports')
    .insert({
      user_id: session.user.id,
      job_id: jobId,
      company: job.company,
      content: text,
    })
    .select('id, content')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ reportId: report.id, content: report.content })
}
