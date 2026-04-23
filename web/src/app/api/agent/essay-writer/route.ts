// Design Ref: §4.2 — Essay writer Route Handler
// Plan SC: 경험 창작 금지 — episodeIds 비어 있으면 400 반환

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { toEpisode } from '@/types/episode'
import { toJob } from '@/types/job'
import { buildEssayPrompt } from '@/lib/prompts/essay-writer'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const body = await req.json()
  const { jobId, questionNumber, episodeIds } = body as {
    jobId: string
    questionNumber: number
    episodeIds: string[]
  }

  // Plan SC: 에피소드 없으면 생성 차단
  if (!episodeIds || episodeIds.length === 0) {
    return NextResponse.json(
      { error: '에피소드를 선택해 주세요. 에피소드 없이는 자소서를 생성할 수 없습니다.' },
      { status: 400 },
    )
  }

  const supabase = await createClient()

  // 공고 조회
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
  const question = job.questions.find((q) => q.number === questionNumber)
  if (!question) {
    return NextResponse.json({ error: '문항을 찾을 수 없습니다' }, { status: 404 })
  }

  // 에피소드 조회 (소유권 검증 포함)
  const { data: episodeData } = await supabase
    .from('episodes')
    .select('*')
    .in('id', episodeIds)
    .eq('user_id', session.user.id)

  if (!episodeData || episodeData.length === 0) {
    return NextResponse.json({ error: '선택한 에피소드를 찾을 수 없습니다' }, { status: 404 })
  }

  const episodes = episodeData.map(toEpisode)

  // 기업 분석 리포트 조회 (있으면 포함)
  const { data: reportData } = await supabase
    .from('company_reports')
    .select('content')
    .eq('job_id', jobId)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const prompt = buildEssayPrompt({
    questionText: question.text,
    charLimit: question.charLimit,
    episodes,
    company: job.company,
    jobTitle: job.title,
    companyReport: reportData?.content,
  })

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')

  return NextResponse.json({ content: text })
}
