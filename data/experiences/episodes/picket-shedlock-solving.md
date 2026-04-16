---
id: picket-shedlock-solving
source: picket-project
primary_competency: 기술적 문제해결
tags: [문제해결,원인분석,우선순위판단,논리적사고]
strength: 5
used_count: 0
last_used: 
---

# 분산 환경에서의 스케줄러 중복 실행 방지를 위한 ShedLock 기반 동시성 제어 시스템 구축

## Situation
초기 단일 인스턴스 환경에서 향후 트래픽 증가 대비 Scale-out 고려 과정 중 Scheduler 중복 실행 문제 발생.
Spring Scheduler는 인스턴스별 개별 동작하므로 서버 다중화 시 동일 작업 중복 실행으로 데이터 정합성 문제 위험 존재.

## Task
다중 인스턴스 환경에서도 작업이 오직 한 번만 실행되도록 보장하는 분산 스케줄링 환경 구축 필요.
신규 인프라 도입 없이 기존 자원 활용으로 시스템 복잡도 최소화 필요.

## Action
스케줄러 동시성 제어 라이브러리인 ShedLock 적용.
Lock 저장소로 별도 RDB 테이블 생성 대신 기존 스택인 Redis 활용.
인프라 관리 포인트를 늘리지 않으면서 인메모리 기반의 빠른 성능 확보.

## Result
서버 Scale-Out 시에도 스케줄러 중복 실행이 발생하지 않는 분산 아키텍처 기반 인프라 구축.

## 이 에피소드의 핵심 메시지
"단일 서버에서 분산 아키텍처로 전환하며 발생하는 동시성 제어 문제를 해결. 트래픽 증가에 유연하게 대응할 수 있는 확장 가능한 시스템 설계 경험."