---
name: jobs-db
description: >
  data-parser가 생성한 구조화된 공고 문서를 파일로 저장하고 관리한다.
  중복 체크, 인덱스 업데이트, 상태 전이, 공고 조회를 담당한다.
  "공고 저장", "저장된 공고 보여줘", "공고 상태 변경", "마감 임박 목록"
  같은 요청에 반응한다. 이 스킬은 파일 I/O와 메타데이터 관리만 하며,
  파싱이나 수집은 담당하지 않는다.
---

# jobs-db 스킬

## 역할

구조화된 공고 문서를 `data/jobs/` 아래 파일로 저장·조회·관리한다.
실제 DB 엔진 없이 파일 시스템과 마크다운 파일로 구성된 경량 저장소다.

**입력**: data-parser가 생성한 구조화 문서 (YAML + 마크다운)
**출력**: 저장된 파일 경로, 인덱스 업데이트 결과, 조회 결과

**이 스킬은 파싱이나 수집을 하지 않는다.** 원시 텍스트나 URL을 받으면
"data-parser를 먼저 호출하세요"로 거절한다.

## 작업 영역

```
data/jobs/
├── collected/              # 정상 저장된 공고
│   ├── {id}.md
│   └── ...
├── raw/                    # 파싱 실패 원시 텍스트
│   └── {ISO-timestamp}.txt
└── index.md                # 전체 공고 목록
```

## 저장 절차

### 1. 사전 검증
구조화 문서를 받으면 저장 전에 확인한다:
- YAML 프런트매터에 필수 필드(`id`, `company`, `position`) 존재 여부
- `id`가 파일명 규칙(`{slug}-{slug}-{YYMM}`)에 맞는지
- 불일치 시 data-parser로 다시 돌려보낸다

### 2. 중복 체크
- `data/jobs/collected/{id}.md` 파일 존재 여부 확인
- `source_url`이 같은 다른 파일이 있는지 Grep으로 확인
- 중복 발견 시 사용자에게 확인 요청 (아래 "중복 처리" 참조)

### 3. 파일 쓰기
- 경로: `data/jobs/collected/{id}.md`
- 내용: data-parser가 준 구조화 문서 그대로
- 성공 시 다음 단계로, 실패 시 에러 보고

### 4. 인덱스 업데이트
- `data/jobs/index.md`에 새 공고 항목 추가
- 마감일 기준 오름차순으로 정렬 유지
- 포맷은 아래 "인덱스 형식" 참조

### 5. 상태 반환
저장 결과를 job-scraper 에이전트에 전달:
```
{
  "path": "data/jobs/collected/samsung-electronics-semi-designer-2604.md",
  "status": "saved",
  "essay_question_count": 2,
  "deadline": "2026-05-15",
  "days_until_deadline": 29
}
```

## 인덱스 형식

`data/jobs/index.md`는 수동으로 관리하지 않는다. 스킬이 자동으로 유지한다.

```markdown
# 채용공고 인덱스

> 마지막 업데이트: 2026-04-16T10:30:00+09:00
> 총 공고: 5건 (수집완료 3, 지원중 1, 지원완료 1, 마감 0)

## 마감 임박 (D-7 이내)
- **[D-2]** [네이버 - 백엔드 엔지니어](collected/naver-backend-2604.md) (2026-04-18)
- **[D-5]** [카카오 - 프론트엔드 엔지니어](collected/kakao-frontend-2604.md) (2026-04-21)

## 진행중
- **[D-29]** [삼성전자 - 반도체 설계 엔지니어](collected/samsung-electronics-semi-designer-2604.md) (2026-05-15)
- **[상시]** [당근 - 서비스 기획자](collected/daangn-pm-2604.md) (상시모집)

## 마감됨
- [LG CNS - 데이터 엔지니어](collected/lg-cns-data-engineer-2603.md) (2026-04-10)
```

각 항목 포맷: `- **[D-N]** [회사 - 직무](경로) (마감일)`

## 중복 처리

### 같은 id의 파일이 이미 존재하는 경우
사용자에게 다음 선택지를 제시한다:

```
⚠️ 이미 같은 공고가 저장되어 있습니다:
   기존: data/jobs/collected/{id}.md (저장: 2026-04-10)
   신규: 지금 파싱된 공고

어떻게 처리할까요?
1. 덮어쓰기 (기존 파일 삭제)
2. 버전 저장 (기존은 유지, 신규는 {id}-v2.md로 저장)
3. 취소 (저장하지 않음)
```

### source_url이 같은 경우
id는 다른데 URL이 같으면 사용자에게 다음을 안내:
```
같은 URL의 공고가 이미 저장되어 있을 수 있습니다:
  기존: data/jobs/collected/{existing-id}.md
  신규 id: {new-id}
id 생성 규칙이 바뀌었을 수 있습니다. 확인해 주세요.
```

### 취소 선택 시
원시 텍스트는 `data/jobs/raw/`에 보관해 재참조 가능하게 한다.

## 조회 기능

### 전체 목록
`data/jobs/collected/*.md`를 Glob으로 가져와 각 파일의 프런트매터만
빠르게 읽어 목록으로 반환한다.

### 필터링 쿼리 지원
사용자 요청에 따라 다음 필터 적용:
- **상태 필터**: "수집완료", "지원중", "지원완료", "마감"
- **마감일 필터**: "D-7 이내", "이번 주", "4월 말까지"
- **회사 필터**: "삼성전자 공고 보여줘"
- **직군 필터**: "개발 직군만"
- **자소서 문항 유무**: "자소서 있는 공고만"

### 출력 형식
테이블 형식으로 간결하게:

```markdown
| 회사 | 직무 | 마감 | 상태 | 자소서 |
|---|---|---|---|---|
| 삼성전자 | 반도체 설계 | D-29 | 수집완료 | 2개 |
| 네이버 | 백엔드 | D-2 | 지원중 | 3개 |
```

## 상태 전이 관리

공고는 다음 상태를 거친다:
- `수집완료`: job-scraper가 저장한 초기 상태
- `분석완료`: company-analyst가 분석 리포트를 연결한 상태
- `문항분석완료`: question-analyst가 문항 분석을 연결한 상태
- `자소서작성중`: essay-writer가 작업 중
- `자소서완료`: essay-writer가 최종 자소서를 제출한 상태
- `지원완료`: 사용자가 실제 제출한 상태
- `마감`: 마감일이 지난 상태 (자동 전이)
- `결과대기`: 지원 후 결과 대기
- `최종결과`: 합격/불합격 확정

### 상태 변경 규칙
- 상태 전이 시 프런트매터의 `status` 필드 갱신
- 전이 이력을 프런트매터의 `status_history` 배열에 추가:
  ```yaml
  status_history:
    - status: 수집완료
      date: 2026-04-16T10:30:00+09:00
    - status: 분석완료
      date: 2026-04-16T14:20:00+09:00
      note: company-analyst 리포트 연결
  ```

### 자동 상태 전이
- 마감일이 지난 공고는 다음 조회 시 자동으로 `마감`으로 전이
- 단, `지원완료` 또는 `결과대기` 상태는 자동 전이하지 않음

## 공고와 다른 리소스 연결

공고 프런트매터에 관련 파일 경로를 기록한다:

```yaml
linked_files:
  company_report: data/reports/samsung-electronics-2604.md
  question_analysis: data/analyses/samsung-electronics-semi-designer-2604-q.md
  essays:
    - data/essays/samsung-electronics-semi-designer-2604-q1.md
    - data/essays/samsung-electronics-semi-designer-2604-q2.md
```

다른 에이전트(company-analyst, question-analyst, essay-writer)가 파일을
생성하면 각자 이 필드를 업데이트하도록 설계한다.
apply-manager는 이 연결 정보를 추적한다.

## 삭제 & 정리

### 공고 삭제
사용자 명시적 요청 시만:
- `data/jobs/collected/{id}.md` 삭제
- `data/jobs/archive/{id}.md`로 이동 (완전 삭제 대신)
- 인덱스에서 제거

### 오래된 raw/ 파일 정리
`data/jobs/raw/` 아래 30일 이상 된 파일은 사용자에게 정리 제안.
자동 삭제는 하지 않는다.

## 특수 상황 처리

### 파일 쓰기 실패
- 디스크 공간 부족, 권한 오류 등 → 사용자에게 에러 상세 보고
- 임시 텍스트는 `data/jobs/raw/{timestamp}.txt`에 보관 시도

### 인덱스 파일 손상
- index.md가 파싱 불가 상태면 자동 재생성
- `data/jobs/collected/*.md`를 Glob으로 모두 읽어 다시 조립
- 사용자에게 "인덱스를 재생성했습니다" 안내

### 구조화 문서 형식이 틀린 경우
data-parser의 출력이 예상 형식과 다르면:
- 저장하지 않고 에러 반환
- "data-parser의 출력이 예상 스키마와 다릅니다" 안내
- 파싱부터 다시 하도록 제안

## 작업 순서

### 저장 요청 시
1. 입력 검증 (구조화 문서 형식)
2. 중복 체크 (id + source_url)
3. 필요시 사용자 확인
4. 파일 쓰기
5. 인덱스 업데이트
6. 저장 결과 반환

### 조회 요청 시
1. 필터 조건 파싱
2. Glob으로 파일 목록 확보
3. 프런트매터만 빠르게 읽기
4. 필터링 & 정렬
5. 테이블 형식으로 출력

### 상태 변경 요청 시
1. 대상 공고 파일 Read
2. 현재 상태 확인
3. 전이 가능한지 검증
4. 프런트매터 업데이트 (status, status_history)
5. 파일 재쓰기
6. 인덱스 업데이트 필요시 수행

## 주의사항

- 이 스킬은 **파일 시스템과 메타데이터**만 다룬다. 파싱·분석·작성은
  다른 스킬/에이전트의 영역.
- index.md는 항상 자동 유지. 사용자가 직접 편집하지 않도록 주석으로 명시.
- 여러 공고를 동시에 처리할 때는 각 파일을 순차적으로 쓴다 (동시 쓰기 금지).
- apply-manager 에이전트가 이 저장소를 읽어 지원 현황을 추적하므로,
  status 필드의 정확성이 중요하다.