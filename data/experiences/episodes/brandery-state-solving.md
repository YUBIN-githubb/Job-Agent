---
id: brandery-state-solving
source: brandery-project
primary_competency: 기술적 문제해결
tags: [문제해결,원인분석,우선순위판단,논리적사고]
strength: 5
used_count: 0
last_used: 
---

# 비동기 환경에서 중복 요청 방지를 위한 상태 관리 설계

## Situation
비동기 전환 후 API 응답이 오기 전에 다음 스케줄러가 동일 데이터를 재조회하여 중복 요청 발생 가능한 상태.
상태 관리로 데이터를 구분하는 시스템이 필요.
SELECT FOR UPDATE 방식은 다른 조회 API까지 차단하므로 사용 불가.

## Action
WAITING, IN_PROGRESS, DONE과 같은 상태 컬럼 추가 후 GPT API 요청 조건 설정.
조회 직후 IN_PROGRESS로 상태 변경하여 다음 스케줄러에서 재조회 차단.
API 성공 시 DONE으로 변경, 실패 시 WAITING으로 롤백.
모든 상태 변경을 @Transactional로 묶어 동시성 문제 방지.

## Result
중복 요청 문제 해결.
실패 건은 WAITING으로 자동 복구되어 다음 스케줄러에서 재처리.
상태 기반으로 처리 현황 모니터링 가능 (WAITING/IN_PROGRESS/DONE 건수 추적).

## 이 에피소드의 핵심 메시지
"상태 관리 기반의 동시성 제어 로직을 설계하여 비동기 스케줄러의 중복 요청을 막고 실패 건에 대한 자동 재처리 및 모니터링 환경을 구현한 경험."