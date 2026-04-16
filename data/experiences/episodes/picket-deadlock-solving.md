---
id: picket-deadlock-solving
source: picket-project
primary_competency: 기술적 문제해결
tags: [문제해결,원인분석,우선순위판단,논리적사고]
strength: 5
used_count: 0
last_used: 
---

# JPA 쓰기 지연으로 인한 Deadlock 해결 및 쿼리 순서 제어

## Situation
예매 기능 부하 테스트 중 특정 시점에 트랜잭션이 멈추는 Deadlock 현상 발생.
로그 분석 결과, INSERT 시 부모 테이블에 걸리는 Shared Lock과 UPDATE 시 필요한 Exclusive Lock이 두 스레드 간 순환 대기를 형성하는 것을 확인.

## Task
트랜잭션 내 쿼리 실행 순서를 INSERT → UPDATE에서 UPDATE → INSERT로 변경하여 Lock 획득 순서를 일관되게 재조정. Deadlock 발생 조건 제거 필요.

## Action
로직 상 메서드 호출 순서를 변경했으나 JPA 쓰기 지연의 내부 우선순위에 의해 여전히 INSERT가 먼저 실행되는 문제 발견.
UPDATE 로직 수행 직후 EntityManager.flush()를 명시적으로 호출하여 쓰기 지연 저장소의 UPDATE 쿼리를 DB에 즉시 전송, INSERT보다 먼저 실행되도록 제어.
복잡한 Lock 흐름을 도식화하여 팀 내 지식 공유 및 문제 해결 과정 문서화.

## Result
쿼리 실행 순서 제어로 순환 대기 조건 제거, Deadlock 이슈 해결.
지식 공유를 통해 팀 내 데이터베이스 Deadlock 관련 인사이트 전파.

## 이 에피소드의 핵심 메시지
"문제 발생을 파악하고 로그를 분석하며 그 원인을 찾으려 노력함. 데이터베이스의 Lock과 관련하여 문제를 해결한 경험."