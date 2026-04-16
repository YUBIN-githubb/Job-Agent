---
id: picket-racecondition-solving
source: picket-project
primary_competency: 기술적 문제해결
tags: [문제해결,원인분석,우선순위판단,논리적사고]
strength: 5
used_count: 0
last_used: 
---

# Redis 원자 연산을 이용한 티켓 예매 동시성 제어 로직 구현 

## Situation
티켓 예매 테스팅 시 다수 사용자의 동일 좌석 동시 요청으로 인한 Race Condition 발생, 티켓 중복 발권 문제 확인.

## Task
동시성 문제 해결을 통한 중복 발권 방지 필요.
선착순 티켓팅 특성상 Lock 획득 대기보다 빠른 실패 후 재시도 유도가 UX에 적합하다고 판단.

## Action
1. Redisson Lock의 Pub/Sub 대기 구조는 '빠른 실패 후 재시도'가 필요한 티켓팅 UX에 부적합하여 배제.
2. MySQL Named Lock은 Redis 대비 속도 느림 및 DB 커넥션 점유 리스크로 배제.
따라서,
기본 Redis 연산이면서 원자적인 동작으로 실행되는 setIfAbsent(SETNX) 사용.
Key(좌석ID)가 없을 때만 저장하여 별도 Lock 없이 단일 명령어로 원자성 보장.
Value에 유저 ID를 저장하여 좌석 선점 주체 구별.

## Result
Locust 동시성 테스트에서 약 2,000건 동시 요청 환경에서도 데이터 정합성 확보.
Lock 획득 대기 과정 제거로 시스템 리소스 절감 및 사용자 응답 속도 최적화.

## 이 에피소드의 핵심 메시지
"문제 원인 파악과 해결 방안 구상, 우선 순위 고려 후 현재의 상황에 최적한 방안으로 문제 해결. 동시성 문제를 해결해 본 경험."