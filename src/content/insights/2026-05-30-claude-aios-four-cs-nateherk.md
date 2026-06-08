---
title: "I Turned Claude Opus 4.8 Into My Entire AI Operating System"
date: "2026-05-29"
source_url: "https://youtu.be/0WDkwMxj13s"
source_author: "Nate Herk"
---

# Claude Opus 4.8 을 통째로 내 AI 운영체제로 만든 법 — Nate Herk | AI Automation

## 한 줄 요약
Nate Herk 가 Claude Opus 4.8 을 자기 비즈니스 전체를 굴리는 개인 AI 운영체제(AIOS)로 만든 방식을 4C 프레임워크(Context·Connections·Capabilities·Cadence)와 마인드셋(컨텍스트가 왕, 단계적 신뢰, 권한 스코핑) 중심으로 설명하는 영상.

## 영상 메타
- URL: https://youtu.be/0WDkwMxj13s
- 채널: Nate Herk | AI Automation
- 길이: 28분 57초
- 업로드: 2026-05-29
- 조회수: 25,899 / 좋아요 1,043
- 시청일: 2026-05-30 KST (🏭 맥미니가 자막 추출 후 요약)

## 픽업
- **Default shift — Claude Code 를 모든 작업의 1순위로.** 코드뿐 아니라 브레인스토밍·글쓰기·사고까지 Chrome 이나 다른 앱 열기 전에 Claude Code 부터 연다. 같은 모델이지만 컨텍스트가 누적되고, tech stack 이 줄고, 잠재적으로 더 싸며 context switching 이 제거된다.
- **"Context is king, not the AI model."** 모두가 같은 모델을 쓰니 4.8 벤치마크는 의미 없다 — 모두가 4.8 을 쓰면 모두의 LinkedIn 글이 바이럴 되겠나. 모델=엔진, 내 컨텍스트=연료. 모델은 stateless 라 새 세션은 글로벌 룰·메모리부터 다시 로드한다. 토큰을 돈처럼 생각하라.
- **4C 프레임워크.** Context(비즈니스를 안다) → Connections(실제로 무엇을 만질 수 있나, API/MCP) → Capabilities(일하는 방식 = 스킬) → Cadence(랩탑이 닫혀있어도 명시적 요청 없이 자동 실행). 각 레이어는 앞 레이어 없이는 성립하지 않는다.
- **권한 = 키링 비유: instructions ≠ capabilities.** "이메일 보내지 마"라고 말하는 것과 send-email 키를 애초에 키링에 안 주는 것은 전혀 다르다. 키/툴이 존재하면 에이전트는 물리적으로 쓸 수 있다고 가정하라. 실제로 한 에이전트가 to-do 항목을 집어 15만 inbox 에 프로모 이메일 3건을 자동 발송한 사고가 있었다 — 그래서 엔드포인트를 scope 한다.
- **Bike method (단계적 신뢰).** 스킬·자동화 구축은 아이에게 자전거 가르치기와 같다. 헬멧 씌우고 "가라" 하지 않는다 — 손잡이 잡고 같이 걷다, 균형이 잡히면 손을 떼고, 신뢰가 쌓이면 보조바퀴를 뗀다. 만들기 쉬워진 것이 false sense of security 가 되면 안 된다. 매번 스킬을 쓸 때마다 좋아지니 시간 낭비가 아니다.
- **스킬 만드는 두 방식.** (a) cadence(매일/매주 반복하는 일)에서 skill creator 로 forward 구축, (b) reverse-engineer — 작업을 end-to-end 로 한 번 한 뒤 "방금 대화를 되짚어 어떻게 했는지 스킬로 만들어"라고 시킴(발화자가 더 자주 쓰는 방식). 스킬은 SOP 같은 큰 프로세스만이 아니라, 반복 입력하던 프롬프트 하나여도 된다(session handoff 슬래시 커맨드 예시).
- **"You can outsource your thinking, but you cannot outsource your understanding."** 화려한 대시보드는 불필요할 수 있다 — 시각화가 아니라 northstar/metric 이 중요하고, 필요하면 Claude Code 가 즉시 데이터를 끌어온다. Productivity 는 몇 시간 일했나가 아니라 목표에 실제로 가까워졌나로 정의된다.

## 용어
- **AIOS (AI Operating System)** [워크플로우 · 문화]: 모든 업무를 한 곳(Claude Code)에서 처리하도록 컨텍스트·연결·스킬을 쌓아올린 개인 AI 운영체제.
- **4C 프레임워크** [하니스 · 패턴]: Context·Connections·Capabilities·Cadence 네 레이어로 AIOS 아키텍처를 구성하는 틀.
- **3M 프레임워크** [워크플로우 · 문화]: Mindset·Method·Machine — AIOS 구축을 사고방식·방법·기계 세 축으로 보는 멘탈 모델.
- **Stateless model** [컨텍스트 · 캐시]: 세션마다 글로벌 룰·메모리 파일을 다시 로드하지 않으면 매번 초보 상태로 시작하는 모델 특성.
- **Reverse-engineered skill** [하니스 · 패턴]: 작업을 end-to-end 로 먼저 끝낸 뒤 그 대화를 되짚어 스킬로 추출하는 제작 방식.
- **Bike method** [워크플로우 · 문화]: 자동화에 단계적으로 신뢰를 부여하는 비유 — 아이 자전거 가르치듯 점진적으로 손을 뗀다.
- **The dip (단기 비용)** [커리어 · 조직]: 새 스킬 학습 초기에 수동보다 ~20% 느려지는 구간으로, 장기 효율을 위해 감수하는 비용.
- **/insights** [도구 통신 (MCP · CLI · API)]: Claude Code 로컬 세션을 분석해 무엇이 효과적인지·quick win·문제 지점을 HTML 리포트로 생성하는 커맨드.
- **MCP server** [도구 통신 (MCP · CLI · API)]: 에이전트가 외부 데이터·도구(Stripe·QuickBooks·school API 등)에 붙는 연결 엔드포인트.
