---
id: brandery-async-solving
source: brandery-project
primary_competency: 기술적 문제해결
tags: [문제해결,원인분석,우선순위판단,논리적사고]
strength: 5
used_count: 0
last_used: 
---

# 동기 → 비동기 API 호출 전환으로 처리량 개선

## Situation
GPT API 응답 시간이 건당 7~12초로 매우 긴 상황.
동기(blocking) 방식으로 15건 처리 시 약 3분 소요.
스케줄링 10분 간격, 회당 15건 기준으로 하루 최대 2,160건 처리 가능.
응답 대기 시간 동안 TPM 여유분을 활용하지 못하는 비효율 발생.

## Action
WebClient의 block() 호출을 제거하고 Mono 반환으로 비동기 전환.
subscribe()의 성공/실패 콜백함수에서 각각 handleSuccess(), handleError() 메서드로 처리하도록 구현.
콜백함수 내 DB 작업을 별도 클래스(@Transactional)로 위임하여 프록시 기반 트랜잭션 정상 동작 보장.

## Result
응답 대기 중에도 다음 요청을 발송하여 TPM 활용률 향상.
스케줄링 간격을 10분 → 1분으로 단축.

## 이 에피소드의 핵심 메시지
"동기식 API 호출을 비동기로 전환하여 스케줄링 주기를 10분에서 1분으로 단축하고, 비동기 콜백 환경에 맞춘 안전한 트랜잭션 처리 구조를 구축한 경험."