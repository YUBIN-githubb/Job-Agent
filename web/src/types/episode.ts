// Design Ref: §3.1 — Episode entity type definition

export interface Episode {
  id: string
  userId: string
  episodeId: string
  source?: string
  title: string
  primaryCompetency: string
  tags: string[]
  strength: 1 | 2 | 3 | 4 | 5
  situation?: string
  task?: string
  action?: string
  result?: string
  coreMessage?: string
  usedCount: number
  lastUsed?: string
  createdAt: string
}

export const PRIMARY_COMPETENCIES = [
  '리더십/조직관리',
  '협업/커뮤니케이션',
  '문제해결/분석',
  '도전/실패극복',
  '자기개발/학습',
  '실행력/주도성',
  '윤리/책임감',
] as const

export type PrimaryCompetency = (typeof PRIMARY_COMPETENCIES)[number]

export const COMPETENCY_TAGS: Record<PrimaryCompetency, string[]> = {
  '리더십/조직관리': ['리더십', '팀장경험', '역할분배', '동기부여', '의사결정'],
  '협업/커뮤니케이션': ['협업', '팀워크', '갈등관리', '설득', '경청'],
  '문제해결/분석': ['문제해결', '원인분석', '데이터기반판단', '가설검증'],
  '도전/실패극복': ['도전정신', '실패경험', '회복탄력성', '한계돌파'],
  '자기개발/학습': ['자기주도학습', '역량개발', '꾸준함', '성장마인드셋'],
  '실행력/주도성': ['주도성', '기획', '실행력', '프로세스개선', '결과도출'],
  '윤리/책임감': ['책임감', '윤리의식', '정직', '원칙준수'],
}

export const CONTEXT_TAGS = ['인턴', '대외활동', '학교프로젝트', '동아리', '공모전']

// Supabase snake_case → camelCase 변환
export function toEpisode(row: Record<string, unknown>): Episode {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    episodeId: row.episode_id as string,
    source: row.source as string | undefined,
    title: row.title as string,
    primaryCompetency: row.primary_competency as string,
    tags: (row.tags as string[]) ?? [],
    strength: row.strength as 1 | 2 | 3 | 4 | 5,
    situation: row.situation as string | undefined,
    task: row.task as string | undefined,
    action: row.action as string | undefined,
    result: row.result as string | undefined,
    coreMessage: row.core_message as string | undefined,
    usedCount: (row.used_count as number) ?? 0,
    lastUsed: row.last_used as string | undefined,
    createdAt: row.created_at as string,
  }
}
