# my-job-agent

개인 취업 준비를 위한 자소서 작성 자동화 에이전트 시스템.
채용공고 수집부터 자소서 완성, 지원 추적까지의 전체 파이프라인을
5개 서브에이전트와 11개 스킬로 구성한다.

## 프로젝트 구조

```
data/
├── experiences/
│   ├── projects/             # 프로젝트 원본 (배경 정보)
│   │   └── {project-id}.md
│   └── episodes/             # 에피소드 (자소서 재료, STAR 구조)
│       └── {episode-id}.md
├── jobs/
│   ├── collected/            # 수집·구조화된 공고
│   │   └── {job-id}.md
│   ├── raw/                  # 파싱 실패 원시 텍스트
│   └── index.md              # 공고 인덱스
├── reports/                  # 기업 분석 리포트
│   └── {company-slug}-{YYMM}.md
├── analyses/                 # 문항 분석 결과
│   └── {job-id}-questions.md
├── essays/                   # 자소서
│   ├── {job-id}-q{N}.md         # 문항별 개별 파일
│   ├── {job-id}-q{N}.review.md  # 검토 이력
│   └── {job-id}-final.md        # 전체 통합본
└── tracking/                 # 지원 현황 추적
    ├── dashboard.md
    ├── weekly-{YYYY-MM-DD}.md
    └── alerts.md
```

## 에이전트 파이프라인

5개 에이전트가 순차적으로 동작한다. 각 에이전트는 MD 파일을 생성하고,
다음 에이전트가 그 파일을 입력으로 사용한다.

```
job-scraper → company-analyst → question-analyst → essay-writer → 사용자
                                                                    ↑
apply-manager ──────── 전체 파이프라인 횡단 감시 ──────────────────────┘
```

### 에이전트 간 소통 규약
- 에이전트끼리 직접 호출하지 않는다.
- 모든 소통은 **파일 시스템**을 통해 이루어진다.
- 각 에이전트는 산출물을 표준 경로에 저장하고, 공고 파일의
  `linked_files` 프런트매터에 경로를 기록한다.
- 다음 에이전트는 `linked_files`를 읽어 이전 단계 산출물을 찾는다.

### linked_files 규약
공고 파일(`data/jobs/collected/{id}.md`)의 프런트매터에
각 에이전트의 산출물 경로를 누적 기록한다:

```yaml
linked_files:
  company_report: data/reports/{company-slug}-{YYMM}.md
  question_analysis: data/analyses/{job-id}-questions.md
  essays:
    - data/essays/{job-id}-q1.md
    - data/essays/{job-id}-q2.md
  essays_final: data/essays/{job-id}-final.md
```

## 사용 방법

### 전체 파이프라인 실행
공고 URL 또는 본문을 주고 자소서 완성까지 한 번에 진행:

```
이 공고로 자소서까지 써줘
[공고 URL 또는 본문 붙여넣기]
```

이 경우 오케스트레이터가 다음 순서로 에이전트를 호출한다:
1. @job-scraper — 공고 수집 및 구조화
2. @company-analyst — 기업 분석 리포트 생성
3. @question-analyst — 자소서 문항 분석
4. @essay-writer — 경험 매칭 → 초안 작성 → 퇴고

각 단계 사이에 사용자 확인을 요청한다.
사용자가 "건너뛰기"를 선택하면 해당 단계를 생략하고 다음으로 넘어간다.

### 단계별 개별 실행
특정 단계만 실행하고 싶을 때:

```
@job-scraper 이 공고 정리해줘 [URL/본문]
@company-analyst 삼성전자 분석해줘
@question-analyst 이 공고 문항 분석해줘
@essay-writer 1번 문항 자소서 써줘
@apply-manager 현황 알려줘
```

### 현황 확인
```
현황 알려줘
마감 임박 공고 있어?
주간 리포트 만들어줘
```

## 오케스트레이션 규칙

### 전체 파이프라인 실행 시

사용자가 "자소서까지 써줘" 같은 end-to-end 요청을 하면
다음 절차를 따른다:

**1단계: job-scraper**
- 공고 수집 및 구조화
- 완료 후 사용자에게 파싱 결과 요약 제시
- 자소서 문항이 추출되었는지 확인
- "기업 분석으로 넘어갈까요?" 확인

**2단계: company-analyst**
- 기업 분석 리포트 생성
- 기존 리포트가 있으면 재사용 여부 확인
- 완료 후 자소서 활용 포인트 요약 제시
- "문항 분석으로 넘어갈까요?" 확인

**3단계: question-analyst**
- 각 문항의 의도 분석 + 역량 매핑
- 에피소드 DB 커버리지 사전 체크 결과 공유
- 부족한 역량이 있으면 에피소드 추가 권장
- "자소서 작성으로 넘어갈까요?" 확인

**4단계: essay-writer**
- 작성 계획 제시 (문항별 에피소드 배정)
- 각 문항마다: find-experience → essay-draft → essay-review
- 문항별로 사용자 확인 후 다음 문항 진행
- 전체 완성 후 통합본 제시

**각 단계 사이의 사용자 확인은 생략 불가.** 파이프라인이 자동으로
끝까지 달리면 사용자가 중간 결과를 검토할 수 없다.

### 단계 건너뛰기
사용자가 특정 단계를 건너뛰고 싶을 때:

- "기업 분석 건너뛰고 바로 자소서 써줘"
  → company-analyst 생략, question-analyst부터 시작
  → 지원동기 문항은 공고 본문만으로 작성 (company-report 없이)
  → "기업 분석 없이 작성하면 지원동기 문항 품질이 낮을 수 있습니다" 경고

- "문항 분석 건너뛰고 바로 써줘"
  → question-analyst 생략
  → essay-writer가 자체적으로 간이 분석 수행
  → "question-analyst를 거치면 더 정확한 매칭이 가능합니다" 경고

### 에러 발생 시
한 단계에서 실패하면 다음 단계로 넘어가지 않는다:

- job-scraper 실패 → "공고 수집에 실패했습니다. 본문을 직접 붙여넣어 주세요."
- company-analyst 실패 → "기업 분석을 건너뛰고 진행할까요?"
- essay-writer 실패 (에피소드 0개) → "이 역량의 에피소드를 추가해 주세요."

## 핵심 원칙

### 1. 경험 창작 금지
에피소드 DB(`data/experiences/episodes/`)에 없는 경험을 자소서에 쓰지 않는다.
매칭 후보가 없으면 "에피소드를 추가해 주세요"라고 안내한다.

### 2. 사용자 주도
에피소드 선택, 초안 수정, 최종 확정은 모두 사용자가 결정한다.
essay-review의 제안을 자동 반영하지 않는다.

### 3. 파일 시스템이 진실의 원천
모든 상태, 산출물, 이력은 `data/` 아래 MD 파일에 기록된다.
메모리나 대화 맥락에 의존하지 않고, 파일을 읽어 현재 상태를 파악한다.

### 4. 에이전트 경계 존중
각 에이전트는 자기 영역의 파일만 쓰고, 다른 에이전트 영역의 파일은 읽기만 한다.
유일한 예외: 공고 파일의 `linked_files`와 `status`는 관련 에이전트가 갱신.

### 5. 합법적 수집
웹 수집 시 robots.txt를 존중하고, 봇 차단을 우회하지 않는다.
수집이 불가하면 사용자 수동 입력으로 전환한다.

### 6. 자소서 품질 기준
- 첫 문장은 "저는 ~한 경험이 있습니다"로 시작하지 않는다
- 에피소드의 구체적 수치와 고유명사를 보존한다
- 금지 표현: "열정을 다해", "귀사의 인재상에 부합", "~같습니다"
- 같은 공고 내 동일 에피소드 재사용 금지

## 에피소드 파일 규약

에피소드 파일(`data/experiences/episodes/{id}.md`)은
YAML 프런트매터 + STAR 본문으로 구성한다:

```yaml
---
id: {episode-id}
source: {project-id}           # 프로젝트 파일 연결 (선택)
primary_competency: 문제해결    # 핵심 역량 1개
tags: [문제해결, 데이터분석, 주도성]  # 3~5개
strength: 4                    # 설득력 1~5
used_count: 1                  # 자소서 사용 횟수
last_used: 삼성전자 2026 상반기  # 마지막 사용
---

# 에피소드 제목

## Situation
[상황]

## Task
[과제]

## Action
[행동 — 가장 구체적으로]

## Result
[결과 — 수치 포함]

## 이 에피소드의 핵심 메시지
[한 문장]
```

### 역량 태그 표준
7개 카테고리:
- 리더십/조직관리: 리더십, 팀장경험, 역할분배, 동기부여, 의사결정...
- 협업/커뮤니케이션: 협업, 팀워크, 갈등관리, 설득, 경청...
- 문제해결/분석: 문제해결, 원인분석, 데이터기반판단, 가설검증...
- 도전/실패극복: 도전정신, 실패경험, 회복탄력성, 한계돌파...
- 자기개발/학습: 자기주도학습, 역량개발, 꾸준함, 성장마인드셋...
- 실행력/주도성: 주도성, 기획, 실행력, 프로세스개선, 결과도출...
- 윤리/책임감: 책임감, 윤리의식, 정직, 원칙준수...

맥락 태그: 인턴, 대외활동, 학교프로젝트, 동아리, 공모전...
기술 태그: Python, Java, SQL, 데이터분석, 설계, CAD...

표준 사전에 없는 태그를 임의로 만들지 않는다.

## 공고 파일 상태 흐름

```
수집완료 → 분석완료 → 문항분석완료 → 자소서작성중 → 자소서완료 → 지원완료 → 결과대기 → 최종결과
                                                                              ↗
                              (마감일 경과 시) → 마감 ──────────────────────────
```

apply-manager의 tracker 스킬이 linked_files를 근거로 상태를 자동 승격하고,
마감일이 지난 미제출 건은 자동으로 `마감`으로 전이한다.

## 에이전트별 요약

| 에이전트 | 역할 | 스킬 | 산출물 경로 |
|---|---|---|---|
| job-scraper | 공고 수집·구조화 | web-scraping, data-parser, jobs-db | data/jobs/collected/ |
| company-analyst | 기업 분석 | web-research, company-report | data/reports/ |
| question-analyst | 문항 분석 | question-decoder, competency-map | data/analyses/ |
| essay-writer | 자소서 작성 | find-experience, essay-draft, essay-review | data/essays/ |
| apply-manager | 지원 추적 | tracker | data/tracking/ |

## 자주 쓰는 명령

```
# 전체 파이프라인
이 공고로 자소서까지 써줘 [URL/본문]

# 단계별
@job-scraper 이 공고 정리해줘 [URL/본문]
@company-analyst 삼성전자 분석해줘
@question-analyst 이 공고 문항 분석해줘
@essay-writer 1번 문항 자소서 써줘
@essay-writer 자소서 검토해줘

# 관리
@apply-manager 현황 알려줘
@apply-manager 삼성전자 제출 완료
@apply-manager 주간 리포트 만들어줘
@apply-manager LG CNS 합격!

# 경험 관리
내 에피소드 목록 보여줘
리더십 관련 에피소드 있어?
```

## 주의사항

- 이 시스템은 **개인 취업 준비** 용도다. 대량 크롤링, 상업적 수집, 타인 대리 작성에 사용하지 않는다.
- 자소서의 최종 품질은 **에피소드 DB의 풍부함**에 달려 있다. 에피소드가 3개 미만이면 문항 매칭에 한계가 있으므로, 최소 5개 이상의 에피소드를 정리해 두는 것을 권장한다.
- 에이전트와 스킬은 반복 사용하며 개선해 나가는 것이 정상이다. 처음부터 완벽할 수 없으므로, 테스트 결과를 보고 description과 SKILL.md를 다듬어 간다.