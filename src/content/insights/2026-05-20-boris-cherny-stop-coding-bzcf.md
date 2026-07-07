---
title: "클로드 코드 총괄 : \"코딩하지 마라"
date: "2026-05-13"
source_url: "https://www.youtube.com/watch?v=is0zk47UjRc"
source_author: "Boris Cherny"
---

## 한 줄 요약
Claude Code 창시자 Boris Cherny 가 "본인은 작년 10월부터 코드 한 줄 안 썼고 모델이 100% 작성, 어떤 날은 하루 150 PR" 이라며 /loop·서브 에이전트·크로스 디스시플린 제너럴리스트로 굴러가는 Anthropic 내부 작업 방식과, 인쇄기 비유로 소프트웨어 빌딩이 곧 텍스트 메시지처럼 보편 스킬이 될 거라는 전망을 풀어낸 인터뷰.

## 영상 메타
- URL: https://www.youtube.com/watch?v=is0zk47UjRc
- 채널: BZCF | 비즈까페
- 길이: 24분 37초
- 업로드: 2026-05-13
- 조회수: 25,190 / 좋아요 637
- 시청일: 2026-05-19 KST (🖥 데스크탑3060Ti 가 자막 추출 후 요약)

## 픽업
- "For me coding is 100% solved." Boris 본인은 작년 10-11월부터 모델이 코드의 100%를 작성. 보통 하루 수십 PR, 일주일 전 하루 150 PR 기록을 세웠다고 함. 큰 복잡 코드베이스/마이너 언어는 아직이지만 "그냥 다음 모델 기다리면 된다" 는 입장.
- 개인 셋업은 폰이 메인. Claude 앱 코드 탭에 세션 5-10개, 수백 agent 동시 가동, 밤이면 수천 agent. 가장 강력한 도구는 `/loop` — cron 으로 반복 job 을 걸어 PR 베이비시팅(CI 수정·자동 rebase), CI 헬스 케어(플레이키 테스트 자동 fix), 트위터 피드백 30분마다 클러스터링 등 수십 loop 가 상시. 서버 사이드 등가물로 routines 도 새로 출시.
- Claude Code 는 출시 후 6개월간 PMF 가 없었다. 2026년 5월 Opus 4 부터 exponential 시작, 4→4.5→4.6→4.7 매 모델 릴리스마다 inflection point. "We were building for the next model" — 모델이 따라잡을 6개월을 앞서 product 를 빌드한 게 전제.
- 인쇄기 비유: 1400년대 유럽 문해율 10%, 인쇄기 발명 50년 만에 책 가격 100x 저렴, 200-300년 후 문해율 70%로. 소프트웨어 빌딩도 같은 궤도, 훨씬 빠르게. "회계 소프트웨어를 짜는 데 가장 적합한 사람은 엔지니어가 아니라 좋은 회계사다 — 도메인 지식이 어려운 부분, 코딩은 쉬운 부분."
- AI 시대 Hamilton Helmer 7 powers 재해석 — 스위칭 코스트·프로세스 파워는 약화(모델이 워크플로우/프로세스를 알아서 hill climb), 네트워크 효과·스케일 이코노미·코너드 리소스는 유지. 향후 10년 disruption 스타트업 수가 10x 증가할 거라 예측. 대기업은 프로세스/조직 재정렬 부담, 스타트업은 AI native 시작 가능.
- Anthropic 내부 작업 방식: "We have no more manually written code anywhere at the company." 모든 SQL·코드를 모델이 작성, Boris 의 Claude 들이 슬랙으로 다른 사람의 Claude 와 직접 대화하며 unknown 을 해소. 외부와 모델 갭은 거의 없고(같은 Opus 4.7 dogfood), 진짜 갭은 조직 프로세스·구조에 있다.
- 미래 팀은 디스시플린 횡단 제너럴리스트. 엔지니어 안에서의 generalist(iOS+web+server)가 아니라 디자인+코드, 데이터 사이언스+코드 같은 횡단. Clockwork Code 팀은 PM, EM, 디자이너, 데이터 사이언티스트, 파이낸스 담당, 사용자 리서처가 전원 코드를 짠다고 함.

## 용어
- **Routines (Cloud Routines)** [하니스 · 패턴]: Anthropic cloud 에서 돌아가는 saved Cloud Code config. 머신 꺼져있어도 동작. trigger = schedule / API call / GitHub event. 예: 매일 8am backlog triage.
- **/loop** [하니스 · 패턴]: cron 으로 반복 작업을 거는 가장 단순한 자동화. Boris Cherny 가 PR 베이비시팅·CI 헬스·트위터 피드백 클러스터링에 수십 개 상시 가동. "루프가 미래다."
- **Cross-disciplinary generalist** [워크플로우 · 문화]: 디자인 + 코드, 데이터 사이언스 + 코드 같이 디스시플린 횡단형 인재. Anthropic 의 Clockwork Code 팀은 PM·EM·디자이너·DS·재무·UR 전원 코딩.
- **Printing press analogy (인쇄술 비유)** [워크플로우 · 문화]: 1400년대 인쇄술이 유럽 문해율 10%→70% 까지 끌어올렸듯, 소프트웨어 빌딩도 보편 스킬로 민주화될 것이라는 Boris Cherny 의 비유. 50년보다 훨씬 빠르게.
- **7 powers (Hamilton Helmer)** [커리어 · 조직]: 사업 해자 프레임워크. AI 시대 = 스위칭 코스트·프로세스 파워 약화 / 네트워크 효과·스케일·코너드 리소스 유지. 향후 10년 disruption 스타트업 10x 예측.
