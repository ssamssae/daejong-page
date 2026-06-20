---
title: "[한글자막] Matt Pocock의 에이전틱 엔지니어링 워크플로우를 그대로 따라 해보세요"
date: "2026-06-21"
source_url: "https://www.youtube.com/watch?v=IK6H-lcGYm8"
source_author: "Tech Bridge"
---

# [한글자막] Matt Pocock의 에이전틱 엔지니어링 워크플로우를 그대로 따라 해보세요 — Tech Bridge

## 한 줄 요약
Matt Pocock은 AI 코딩의 격차가 최신 모델 추격보다 하니스, 코드베이스 구조, 스킬 설계, AFK 작업 큐, 사람의 전략 판단에서 난다고 설명한다. 전술 코딩은 AI에 위임하되, 제품 방향·아키텍처·검증 시스템은 사람이 더 강하게 쥐어야 한다는 대화다.

## 영상 메타
- URL: https://www.youtube.com/watch?v=IK6H-lcGYm8
- 채널: Tech Bridge
- 길이: 62분 24초
- 업로드: 2026-06-19
- 조회수: 1,097 / 좋아요 55
- 시청일: 2026-06-21 KST (🍎 가 자막 추출 후 요약)

## 픽업
- **AI는 전술 프로그래밍을 먹었고, 사람의 가치는 전략 프로그래밍으로 이동했다.** 구문 작성·버그 수정·커밋 생성 같은 전술 업무는 AI가 더 싸고 빠르게 처리하므로, 사람은 어려운 부분의 선설계, task scope, 모듈 경계, 테스트, 문서 라우팅을 잘해야 한다.
- **개발자의 실력이 AI의 상한이다.** Senior가 AI로 크게 증폭되는 이유는 코드베이스를 읽고 설계하고 방향을 줄 수 있는 도메인 판단이 있기 때문이다. 모델 구독만 바꾸는 것은 누구나 할 수 있고, 진짜 차이는 자신의 domain skill을 키우는 데서 난다.
- **좋은 스킬은 지식을 넣는 것이 아니라 절차와 상태를 설계한다.** Matt의 teach skill은 빈 workspace에서 사용자의 mission을 먼저 잡고, learning record·reference·HTML lesson을 로컬에 남기며 다음 수업으로 이어진다. 단순 정보 전달보다 사용자의 목표와 현재 수준에 맞춘 경로를 만드는 구조다.
- **스킬에는 procedure와 ability가 있고, Matt은 사람이 호출하는 procedure를 선호한다.** ability skill은 description이 context window에 새어 들어가므로 많아질수록 오염된다. 그는 grill-me, PRD, issue 쪼개기처럼 사람이 운전대를 잡고 필요할 때 호출하는 절차형 스킬이 더 낫다고 본다.
- **모델보다 하니스에 더 많은 통제권이 있다.** 프롬프트, 스킬, sandbox, GitHub Actions, 코드베이스 구조, 테스트, 문서 라우팅이 하니스다. 코드베이스가 바꾸기 쉬우면 더 싼 모델도 같은 일을 할 수 있고, token spend도 줄어든다.
- **루프보다 큐가 실제 개발 방식에 가깝다.** 무한 agentic loop보다 bug report·feature request·review 같은 작업 큐에서 agent가 항목을 집어 탐색·구현·리뷰하고 다시 사람에게 올리는 흐름이 현실적이다. human-in-the-loop checkpoint는 가능한 뒤로 밀되, 완전히 없애기보다 시스템이 잘 작동하는지 관찰하는 장치로 남겨야 한다.
- **AI 시대에도 제품과 사업의 기본은 바뀌지 않는다.** 고객과 대화하고, 실제 문제를 찾고, 기능을 더하기보다 단순하게 만드는 판단은 여전히 사람 몫이다. AI는 구현과 절차 일부를 빠르게 만들지만, 무엇을 만들지와 왜 만들어야 하는지는 사람이 정해야 한다.

## 용어
- **Harness** [하니스 · 패턴]: 모델을 둘러싼 실행 환경 전체. 프롬프트, 스킬, 도구, sandbox, 테스트, 코드베이스 구조, 작업 큐까지 포함한다.
- **Strategic programming** [워크플로우 · 문화]: 장기 설계, 모듈 경계, velocity, 테스트 전략처럼 코드베이스가 앞으로 잘 변하게 만드는 상위 수준의 프로그래밍 판단.
- **Tactical programming** [워크플로우 · 문화]: 구문 작성, 작은 버그 수정, 파일 편집, 커밋 생성처럼 당장 코드를 생산하는 현장 작업.
- **Procedure skill** [하니스 · 패턴]: 사용자가 명시적으로 호출해 특정 절차를 수행하게 하는 스킬. grill-me, PRD 작성, issue 분해처럼 사람 주도 흐름에 맞는다.
- **Ability skill** [하니스 · 패턴]: 모델이 상황에 맞춰 스스로 불러 쓰는 능력형 스킬. description이 context에 노출되므로 많아질수록 context 오염 위험이 있다.
- **AFK agent** [워크플로우 · 문화]: 사람이 키보드 앞에 붙어 있지 않아도 sandbox나 CI에서 독립적으로 탐색·구현·리뷰를 수행하는 agent.
- **AX (Agent Experience)** [하니스 · 패턴]: agent가 코드베이스에서 작업하기 쉬운 정도. 좋은 DX와 겹치지만, agent용 문서·테스트·구조·도구 경로까지 포함한다.
- **Zone of Proximal Development** [지식 · 컨텍스트 자산]: 학습자가 혼자서는 어렵지만 도움을 받으면 해낼 수 있는 영역. teach skill이 개인화 수업 난이도를 잡는 교육 이론으로 사용한다.
