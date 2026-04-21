/**
 * 기존 data/experiences/episodes/*.md → Supabase episodes 테이블 마이그레이션
 *
 * 사용법:
 *   1. .env.local에 SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL 설정
 *   2. pnpm migrate
 *
 * Plan SC: 기존 13개 에피소드 Supabase로 마이그레이션 완료
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'

// .env.local 로드 (tsx가 자동으로 처리하지 않으므로 직접 로드)
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      process.env[key] = value
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const userId = process.env.MIGRATION_USER_ID // 마이그레이션 대상 user ID

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다.')
  process.exit(1)
}

if (!userId) {
  console.error('❌ MIGRATION_USER_ID가 없습니다. .env.local에 추가해 주세요.')
  console.error('   Supabase Dashboard > Authentication > Users에서 user ID를 확인하세요.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

// 에피소드 MD 파일 디렉토리 (이 스크립트는 web/ 안에 있으므로 상위로 이동)
const EPISODES_DIR = path.join(__dirname, '..', '..', 'data', 'experiences', 'episodes')

function parseEpisodeMd(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const { data: frontmatter, content: body } = matter(content)

  // STAR 섹션 파싱
  const situationMatch = body.match(/## Situation\n([\s\S]*?)(?=\n## |$)/)
  const taskMatch = body.match(/## Task\n([\s\S]*?)(?=\n## |$)/)
  const actionMatch = body.match(/## Action\n([\s\S]*?)(?=\n## |$)/)
  const resultMatch = body.match(/## Result\n([\s\S]*?)(?=\n## |$)/)
  const coreMessageMatch = body.match(/## 이 에피소드의 핵심 메시지\n([\s\S]*?)(?=\n## |$)/)

  // 제목 파싱 (# 으로 시작하는 첫 번째 줄)
  const titleMatch = body.match(/^# (.+)/m)
  const title = titleMatch ? titleMatch[1].trim() : frontmatter.id ?? path.basename(filePath, '.md')

  return {
    episode_id: frontmatter.id ?? path.basename(filePath, '.md'),
    source: frontmatter.source ?? null,
    title,
    primary_competency: frontmatter.primary_competency ?? '문제해결/분석',
    tags: frontmatter.tags ?? [],
    strength: frontmatter.strength ?? 3,
    situation: situationMatch ? situationMatch[1].trim() : null,
    task: taskMatch ? taskMatch[1].trim() : null,
    action: actionMatch ? actionMatch[1].trim() : null,
    result: resultMatch ? resultMatch[1].trim() : null,
    core_message: coreMessageMatch ? coreMessageMatch[1].trim() : null,
    used_count: frontmatter.used_count ?? 0,
    last_used: frontmatter.last_used ?? null,
  }
}

async function migrate() {
  console.log('🚀 에피소드 마이그레이션 시작...')
  console.log(`📁 소스: ${EPISODES_DIR}`)
  console.log(`👤 대상 User ID: ${userId}`)

  if (!fs.existsSync(EPISODES_DIR)) {
    console.error(`❌ 에피소드 디렉토리를 찾을 수 없습니다: ${EPISODES_DIR}`)
    process.exit(1)
  }

  const files = fs
    .readdirSync(EPISODES_DIR)
    .filter((f) => f.endsWith('.md'))

  console.log(`\n📝 마이그레이션할 파일: ${files.length}개`)

  let success = 0
  let skipped = 0
  let failed = 0

  for (const file of files) {
    const filePath = path.join(EPISODES_DIR, file)
    try {
      const episode = parseEpisodeMd(filePath)

      // 이미 존재하는지 확인
      const { data: existing } = await supabase
        .from('episodes')
        .select('id')
        .eq('user_id', userId)
        .eq('episode_id', episode.episode_id)
        .single()

      if (existing) {
        console.log(`  ⏭️  ${episode.episode_id} (이미 존재, 건너뜀)`)
        skipped++
        continue
      }

      const { error } = await supabase.from('episodes').insert({
        user_id: userId,
        ...episode,
      })

      if (error) {
        console.error(`  ❌ ${file}: ${error.message}`)
        failed++
      } else {
        console.log(`  ✅ ${episode.episode_id}: "${episode.title}"`)
        success++
      }
    } catch (e) {
      console.error(`  ❌ ${file}: ${(e as Error).message}`)
      failed++
    }
  }

  console.log('\n────────────────────────────')
  console.log(`✅ 성공: ${success}개`)
  console.log(`⏭️  건너뜀: ${skipped}개`)
  console.log(`❌ 실패: ${failed}개`)

  if (failed > 0) process.exit(1)
}

migrate()
