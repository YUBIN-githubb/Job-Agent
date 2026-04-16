---
id: brandery-enum-solving
source: brandery-project
primary_competency: 기술적 문제해결
tags: [문제해결,원인분석,우선순위판단,논리적사고]
strength: 5
used_count: 0
last_used: 
---

# 정책-미션 구조를 Enum으로 전환하여 프롬프트 토큰 약 65% 절감

## Situation
시스템 프롬프트에 모든 플랫폼별 정책을 포함하면서 프롬프트 토큰이 약 3,700토큰까지 증가.
프롬프트가 길어진 이후 GPT가 "I'm sorry, I can't assist with that" 응답을 빈번하게 반환.
TPM(Token Per Minute) 제한이 30,000인 상황에서 1분에 약 8건밖에 요청 불가.

## Action
모든 정책, 미션별 필요 정책 리스트를 프롬프트에서 제거하고 Java Enum(플랫폼, 미션, 검수정책)으로 코드 레벨에서 관리.
플랫폼 Enum에 {미션 타입 : 검수 정책 리스트} 매핑을 Map 구조로 정의.
Enum을 순회하며 해당하는 플랫폼을 찾고, 그 안에서 해당하는 미션타입을 찾아 최종적으로 필요한 검수 정책만 가져오는 구조를 구현해 동적으로 유저 프롬프트에 정책을 주입.
if-else 분기, static Map 방식 대신 Enum + Stream API로 타입 안전성과 확장성 확보.

## Result
시스템 프롬프트 토큰 약 3,700 → 약 1,300으로 약 65% 절감.
"I'm sorry, I can't assist with that" 응답 해소.
TPM 기준 1분 최대 요청 가능 횟수 약 8건 → 약 17건 이상으로 증가.
새 플랫폼,미션타입 추가 시 Enum 상수 추가만으로 대응 가능, 프롬프트 수정 불필요.

## 이 에피소드의 핵심 메시지
"비효율적인 정적 프롬프트 구조를 Enum 기반의 동적 주입 방식으로 리팩토링하여, 프롬프트 토큰을 65% 절감하고 API 처리량을 2배 이상 올린 아키텍처 개선 경험."