// Design Ref: §4.2 — company-analyst Route Handler (web_search 포함)

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { toJob } from '@/types/job'
import { buildCompanyAnalystPrompt } from '@/lib/prompts/company-analyst'

const anthropic = new Anthropic({
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

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 10000,
    tools: [{ type: 'web_search_20250305' as const, name: 'web_search' }],
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')

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
