---
id: brandery-promptengineering-solving
source: brandery-project
primary_competency: 기술적 문제해결
tags: [문제해결,원인분석,우선순위판단,논리적사고]
strength: 5
used_count: 0
last_used: 
---

# 프롬프트 엔지니어링으로 검수 정확도 및 응답 형식 최적화

## Situation
단순 지시형 프롬프트로는 GPT가 검수 절차를 일관되게 수행하지 못했음.
GPT 응답이 자연어 줄글로 와서 서비스에서 파싱하기 어려움.
검수 결과의 일관성이 부족.

## Action
마크다운 + 딕셔너리 스타일로 프롬프트를 구조화 (role, input, instructions, process, policies, output_json_format, example 섹션 분리).
Chain of Thought 추가 : "OCR 수행 → 해당 정책 조회 → 정책별 비교 → 결과 출력" 4단계 절차를 명시하여 추론 과정을 추적 가능하게 구현.
Few-Shot 기법 사용 : 출력 JSON 예시를 제공하여 응답 형식 고정.
temperature=0으로 설정하여 동일 입력에 대한 일관된 응답 보장.
이미지를 텍스트 프롬프트보다 먼저 배치하여 OCR → 검수 순서로 처리 유도.
출력을 JSON 형태(ocrText, reasoning, judgementName, judgementReason)로 강제하여 서버 파싱 용이하게 처리.
프롬프트 변경 이력을 문서화하고 테스트하며 반복 최적화 수행.

## Result
Chain of Thought 도입으로 GPT가 실수하는 지점을 reasoning 필드로 추적 가능.
JSON 포맷 출력으로 서버에서 별도 파싱 로직 없이 바로 활용 가능한 구조.

## 이 에피소드의 핵심 메시지
"프롬프트 구조화 및 CoT 기반의 엔지니어링을 통해 LLM 응답의 일관성을 확보. 서버 파싱에 최적화된 JSON 형태의 안정적인 AI 검수 파이프라인을 구축한 경험."