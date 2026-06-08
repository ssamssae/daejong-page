---
title: "I Tested Every Claude Code Feature, These 12 Are the Best"
date: "2026-06-03"
source_url: "https://youtu.be/vfWTyEreOEc"
source_author: "Nate Herk"
---

# Claude Code 전 기능 티어 랭킹 + Top 12 — Nate Herk | AI Automation

## 한 줄 요약
Claude 생태계 500시간 사용자가 Claude Code의 모든 기능을 D~S 티어로 매기고, "내 실제 일상 업무를 얼마나 바꾸는가" 기준으로 고른 top 12를 1위 skills부터 12위 /goal까지 풀어준 영상.

## 영상 메타
- URL: https://youtu.be/vfWTyEreOEc
- 채널: Nate Herk | AI Automation
- 길이: 20분 14초
- 업로드: 2026-06-03
- 조회수: 1,422 / 좋아요 104
- 시청일: 2026-06-04 KST (🍎 본진이 자막 추출 후 요약)

## 픽업
- 랭킹 기준은 "글로벌 인기나 멋짐"이 아니라 "내 실제 day-to-day 업무를 얼마나 바꾸는가"다. 발화자는 SaaS·소프트웨어 빌딩보다 지식노동·자동화 중심이라 본인 사용법 기준이라고 못박는다 — "당신은 쓰는 방식이 달라서 가치가 다르게 매겨질 것".
- 1위는 skills. "요리책 레시피"에 비유 — 매번 같은 프롬프트를 외워 말하는 대신 한 번 적어두면 에이전트가 일관되게 실행한다. 직접 빌드 + 남의 것/플러그인 pull + 스킬끼리 체이닝 가능. 4문장짜리 핸드오프 스킬처럼 단순해도 되고, Claude Code·Chat·Co-work 어디서나 쓴다.
- 2위 status line은 "가장 과소평가된 기능". 모델·effort·컨텍스트 윈도우(예: 27%, 274k/1M)를 하단에 가시화해 핸드오프·clear·compact 타이밍을 판단하게 해준다. /statusline에 원하는 걸 자연어나 스크린샷으로 지정. VS Code 확장에서 터미널로 갈아탄 주된 이유.
- 12위 /goal — definition of done을 명확히 주면 검증까지 해서 자리를 비워도 돌아오면 끝나 있다. "24시간 자율 실행" 데모는 불필요, 핵심은 objective 기준 한 줄. (웹사이트 글로브를 "즉시 로딩될 때까지 멈추지 마" 로 1.5시간 자율 최적화한 예시)
- 7위 /rewind — 틀린 응답에 "아니 그거 틀렸어 다시 해"라고 말하는 것보다, 이전 체크포인트로 롤백하는 게 컨텍스트 효율이 낫다(매번 캐시가 재로딩되는 구조 때문).
- 8위 agent teams vs 6위 sub agents 구분 — agent teams는 페르소나(초보/CEO 등) 패널이 서로 대화·디베이트하며 라운드를 거쳐 합의에 도달한다(토큰 집약적, 5시간 윈도우 남는 토큰 소진용). sub agents는 병렬로 돌되 서로 대화 못 하고 메인 세션과만 통신. 둘 다 .claude의 markdown으로 커스텀.
- 스케줄링·원격은 "실제 에이전트" 단위다 — routines(3위)는 deterministic 파이썬 스크립트가 아니라 Claude Code 터미널 자체를 cron에 걸고, remote control(4위)은 폰/웹에서 로컬 세션을 동기 제어한다(폰에서 친 "thank you"가 PC 세션에 그대로 반영).

## 용어
- **status line** [하니스 · 패턴]: 터미널 하단에 모델·effort·컨텍스트 사용량을 표시하는 줄. `/statusline`으로 자연어·스크린샷 지정 커스텀.
- **agent teams** [하니스 · 패턴]: 여러 페르소나 에이전트가 서로 대화·디베이트하며 합의에 도달하는 실험적 기능. settings에서 활성화 필요.
- **sub agents** [하니스 · 패턴]: 메인 세션이 invoke해 병렬로 작업하는 백그라운드 에이전트. 서로 대화 X, 메인과만 통신. .claude markdown으로 정의.
- **/goal** [워크플로우 · 문화]: definition of done 조건 충족까지 검증하며 멈추지 않는 슬래시 명령.
- **ultra plan** [하니스 · 패턴]: 클라우드의 다수 planning 에이전트에 큰 작업의 계획 수립을 offload하는 기능(백그라운드 task, 터미널은 계속 작업).
- **automemory (구 autodream)** [컨텍스트 · 캐시]: 프롬프트 없이 일정 간격마다 과거 작업을 검색해 메모리를 자동 개선하는 기능.
- **/rewind** [컨텍스트 · 캐시]: 코드와 대화를 이전 체크포인트로 롤백하는 명령. 정정 프롬프트보다 컨텍스트 효율적.
- **/loop** [워크플로우 · 문화]: 프롬프트를 cron으로 주기 반복. 세션 바운드이며 7일 후 자동 종료.
- **routines** [워크플로우 · 문화]: deterministic 스크립트가 아니라 실제 에이전트를 cron 스케줄에 거는 기능(`/schedule`, 로컬/클라우드).
- **remote control** [도구 통신 (MCP · CLI · API)]: 폰/웹에서 로컬 Claude Code 세션을 동기 제어하는 기능.
