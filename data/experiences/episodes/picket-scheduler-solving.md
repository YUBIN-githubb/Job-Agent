---
id: picket-scheduler-solving
source: picket-project
primary_competency: 기술적 문제해결
tags: [문제해결,원인분석,우선순위판단,논리적사고]
strength: 5
used_count: 0
last_used: 
---

# Spring Scheduler로 Redis 만료 데이터와 DB 간 정합성 불일치 해결

## Situation
좌석 선점 후 사용자가 결제 미완료 상태로 이탈할 경우, Redis 선점 키는 TTL로 삭제되지만 RDB 좌석 데이터는 선점 상태로 유지됨.
실제로는 빈 좌석임에도 예매 불가능한 현상 발생.

## Task
Redis 데이터 소멸과 RDB 데이터 간 동기화를 통한 데이터 정합성 확보 필요.
결제 미완료 좌석을 예매 가능 상태로 복구하여 다른 사용자의 예매 기회 확보 필요.

## Action
Spring Scheduler를 도입하여 주기적인 배치 작업으로 처리.
RDB상 선점된 상태이나 Redis에 해당 선점 Key가 존재하지 않는 데이터를 조회하는 로직 구현.
감지된 데이터를 예매 가능 상태로 자동 업데이트하도록 스케줄링 구현.

## Result
실제 예매 가능 좌석과 DB 데이터 간 불일치 문제를 Spring Scheduler 자동화로 해결, 운영 효율 향상.

## 이 에피소드의 핵심 메시지
"문제 발생을 파악하고 해결방법 논의, 배치작업을 구현한 경험"