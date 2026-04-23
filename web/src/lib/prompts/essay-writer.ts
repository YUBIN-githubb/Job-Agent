// Design Ref: §2.2 — CLAUDE.md 핵심 원칙을 서버 프롬프트에 이식
// Plan SC: 경험 창작 금지 원칙 서버에서 강제

import type { Episode } from '@/types/episode'

export function buildEssayPrompt({
  questionText,
  charLimit,
  episodes,
  company,
  jobTitle,
  companyReport,
}: {
  questionText: string
  charLimit?: number
  episodes: Episode[]
  company: string
  jobTitle: string
  companyReport?: string
}) {
  const episodeContext = episodes
    .map(
      (ep, i) => `
[에피소드 ${i + 1}] ${ep.title}
- 핵심 역량: ${ep.primaryCompetency}
- 태그: ${ep.tags.join(', ')}
- Situation: ${ep.situation ?? ''}
- Task: ${ep.task ?? ''}
- Action: ${ep.action ?? ''}
- Result: ${ep.result ?? ''}
- 핵심 메시지: ${ep.coreMessage ?? ''}
`.trim(),
    )
    .join('\n\n')

  const companyContext = companyReport
    ? `\n\n[기업 분석]\n${companyReport}`
    : ''

  const lengthRule = charLimit
    ? `5. 분량: ${Math.round(charLimit * 0.8)}~${charLimit}자 (제한 ${charLimit}자)`
    : '5. 분량: 400~550자'

  return `당신은 취업 자소서 작성 전문가입니다.

## 지원 정보
- 기업: ${company}
- 포지션: ${jobTitle}
- 문항: ${questionText}
${companyContext}

## 사용 가능한 에피소드
아래 에피소드 중 문항에 가장 적합한 것을 활용해 자소서를 작성하세요.

${episodeContext}

## 작성 규칙 (반드시 준수)
1. 위에 제공된 에피소드에 없는 경험은 절대 만들어내지 않습니다
2. 에피소드의 구체적 수치와 고유명사를 그대로 사용합니다
3. 첫 문장은 "저는 ~한 경험이 있습니다"로 시작하지 않습니다
4. 금지 표현: "열정을 다해", "귀사의 인재상에 부합", "~같습니다"
${lengthRule}
6. 문어체로 작성합니다

자소서 본문만 작성하세요. 제목이나 설명 없이 바로 본문으로 시작하세요.`
}
