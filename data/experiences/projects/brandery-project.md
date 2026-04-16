---
id: brandery-project
type: project
period: 2025.07 - 2025.08
context: 테크 스타트업 인턴 개발자
team_size: 1
episodes: [brandery-state-solving,brandery-promptengineering-solving,brandery-policystyle-prompt-solving,brandery-enum-solving,brandery-async-solving]
---

# 테크 스타트업 인턴 개발자 프로젝트 - AI 이미지 검수 기능 개발

테크 스타트업 인턴 개발자로 X2E(X to Earn) 서비스 "브랜더리" 백엔드 파트에 근무. 
브랜더리 서비스는 사용자가 플랫폼별 미션에 해당하는 제품을 구매,좋아요,리뷰 등으로 미션을 수행 후 인증하기 위해 이미지를 업로드하면, 어드민에서 검수 담당자가 이미지를 확인하고 미션 통과 여부를 판단하는 구조. 
서비스 초기에는 수작업으로 충분히 감당 가능했으나 사용자 수 증가에 따라 검수 대기 건수가 급증하면서 수동 처리의 한계에 직면.
이를 해결하기 위해 AI 검수 자동화 프로젝트를 기획하였고 설계부터 구현까지 전반을 담당하여 개발.

- 브랜더리 서비스의 AI 기반 미션 이미지 검수 시스템 설계 및 개발 담당
- 프롬프트 엔지니어링을 통한 검수 정확도 최적화 및 테스트 문서화
- 동기 → 비동기 API 호출 전환으로 처리량 개선
- 스케줄링 기반 자동 검수 파이프라인 구현

- Backend : Java, Spring Boot, Spring WebFlux, Spring Scheduler
- AI : OpenAI GPT API, 프롬프트 엔지니어링 (Chain of Thought, Few-Shot, 구조화된 프롬프트)
- Database : MySQL
- InFra : AWS EC2