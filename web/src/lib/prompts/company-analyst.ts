// Design Ref: §4.2 — company-analyst 프롬프트

export function buildCompanyAnalystPrompt({
  company,
  jobTitle,
  jobBody,
}: {
  company: string
  jobTitle: string
  jobBody?: string
}) {
  return `당신은 취업 자소서 작성을 돕는 기업 분석 전문가입니다.

## 분석 대상
- 기업: ${company}
- 포지션: ${jobTitle}
${jobBody ? `- 공고 본문:\n${jobBody.slice(0, 2000)}` : ''}

## 분석 항목 (자소서 작성에 유용한 내용 중심)

### 1. 기업 핵심 정보
- 주요 사업 영역과 서비스
- 최근 주요 이슈 또는 변화 (알려진 범위에서)

### 2. 이 직무에서 중요한 역량
- 공고 본문 기반으로 요구되는 핵심 역량 3~5개
- 각 역량이 왜 중요한지 한 줄 설명

### 3. 지원동기 작성 포인트
- 이 기관/기업을 선택해야 하는 구체적인 이유
- 이 시점에 지원하는 전략적 의미

### 4. 면접/자소서 주의사항
- 이 기관 특성상 강조하면 좋은 점
- 피해야 할 표현이나 접근 방식

자소서 작성에 바로 활용할 수 있도록 구체적이고 실용적으로 작성해 주세요.
공개된 정보가 부족하면 공고 본문 기반으로 분석하세요.`
}
