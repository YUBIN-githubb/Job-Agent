# my-job-agent 구조

### job-scraper agent
채용공고를 수집하고 구조화하는 에이전트. company-analyst agent에게 md 파일로 된 채용공고를 넘겨준다.
- web-scraping skill
- data-parser skill
- jobs-db skill

## company-analyst agent
기업 정보를 분석하고 분석 리포트를 생성하는 에이전트. question-analyst agent에게 md 파일로 된 분석 리포트를 넘겨준다.
- web-research skill
- company-report skill


## question-analyst agent
자소서 문항 의도를 파악하고 키워드를 추출하는 에이전트. essay-writer agent에게 md 파일로 된 자소서 문항과 분석 결과를 넘겨준다. 
- question-decoder skill
- competency-map skill


## essay-writer agent
문항에 맞는 경험을 매칭하고 자소서 초안을 생성한 후 회고하는 에이전트.
사용자에게 최종 완성된 자소서 md 파일을 제출한다.
- find-experience skill
- essay-draft skill
- essay-review skill


## apply-manager agent
지원현황을 추적하고 일정관리, 알람을 보내는 에이전트.
apply-manager agent 이외의 agent들의 행동을 추적하고 기록하여 관리한다. 자소서가 완성이 되면 사용자에게 알람을 보내고 기록한다.
- tracker skill
