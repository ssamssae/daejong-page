---
title: "How to Build Claude Subagents Better Than 99% of People"
date: "2026-06-09"
source_url: "https://youtu.be/e18sdZLwP7o"
source_author: "Nate Herk | AI Automation"
---

## 한 줄 요약
Claude Code 서브에이전트가 무엇이고(메인=오케스트레이터, 서브=독립 컨텍스트 일꾼), 언제·어떻게 써야 잘 쓰는지를 컨텍스트 보존·비용 절감·병렬화 관점에서 정리한 실전 가이드.

## 영상 메타
- URL: https://youtu.be/e18sdZLwP7o
- 채널: Nate Herk | AI Automation
- 길이: 26분 42초
- 업로드: 2026-06-09
- 조회수: 9,139 / 좋아요 379
- 시청일: 2026-06-09 KST (🍎 가 자막 추출 후 요약)

## 픽업
- 메인 세션이 오케스트레이터다. 서브에이전트는 메인하고만 1:1로 대화하고 일을 받아 리포트를 돌려준다 — 서브에이전트끼리는 서로 대화하지 못한다(1:many 아님). 메인이 5개를 띄워도 그들은 서로 모른다.
- 서브에이전트의 첫 번째 가치는 컨텍스트를 깨끗하게 유지하는 것이다. 리서치·대량 파일 읽기처럼 메인 컨텍스트를 오염시킬 작업을 fresh chat에 위임하면, 22.8K 토큰을 써도 그게 메인 세션을 오염시키지 않고 요약만 돌아온다.
- 비용을 크게 아낄 수 있다. 메인은 Opus로 대화하면서 서브에이전트는 Haiku/Sonnet으로 돌릴 수 있다. 300페이지 리포트에서 요약 몇 줄만 필요하면 Haiku 서브에이전트에 위임하라 — "똑똑한 보스(Opus) + 값싼 일꾼(Haiku)" 구조.
- 커스텀 서브에이전트는 마크다운 파일 한 개이고, skill.md와 실체가 똑같다(이름만 다름). 상단 YAML front matter(name·description·tools·model·color·memory) + 본문 지시로 구성되며, progressive disclosure 덕분에 Claude는 name+description만 먼저 읽고 적용 여부를 판단해 안 쓸 땐 본문 토큰을 소비하지 않는다.
- description이 곧 트리거다 — 정밀할수록 misfire(원할 때 발동 안 함 / 원치 않을 때 발동)가 준다. 안 됐으면 "왜 안 됐나"를 보고 description을 고치며 반복 튜닝한다. "use proactively"를 넣으면 자주 발동한다(YAML 따옴표 안 닫으면 파싱이 깨지니 주의).
- 권한은 프롬프트가 아니라 도구 제한으로 강제하라. tools/disallowed tools/허용 MCP를 명시하면 read-only 서브에이전트를 만들 수 있고, 이건 "하지 마"라고 부탁하는 것보다 강하다 — "AI가 데이터를 만질 수 있으면 만진다고 가정하라."
- 핵심 판단 질문은 "다시는 안 읽을 더미를 채팅에 쏟아낼 참인가?"이고 yes면 위임이다. 단 빠른 단일 편집, 스텝이 서로 의존(1→2→3→4), 에이전트끼리 대화가 필요(=agent team), 전체 대화 컨텍스트가 필요한 경우엔 쓰지 않는다. 대량 병렬은 dynamic workflows(Opus 4.8 도입, 41~210개까지 spin up)로 가되 세션 한도를 빠르게 먹으니 주의하고, 트리거 워드는 "workflow"에서 "ultra code"로 바뀌었다.

## 용어
- **서브에이전트 (subagent)** [하니스 · 패턴]: 메인 세션이 일을 위임하는 독립 컨텍스트의 하위 에이전트. 마크다운 1개로 정의되며 메인하고만 1:1로 통신한다.
- **progressive disclosure** [컨텍스트 · 캐시]: Claude가 front matter(name+description)만 먼저 읽고 적용 여부를 판단 → 안 쓰면 본문 토큰을 소비하지 않는 지연 로딩 방식.
- **YAML front matter** [하니스 · 패턴]: 스킬/서브에이전트 md 상단의 설정 블록(name·description·tools·model·color·memory). 따옴표를 안 닫으면 파싱이 깨진다.
- **misfire** [워크플로우 · 문화]: 서브에이전트가 원할 때 발동하지 않거나 원치 않을 때 발동하는 현상. description 정밀화로 줄인다.
- **disallowed tools / permission layer** [도구 통신 (MCP · CLI · API)]: 서브에이전트가 쓸 도구·MCP를 명시 제한(read-only 등)하는 권한 계층. 프롬프트로 "하지 마"라고 하는 것보다 강한 강제.
- **dynamic workflows** [하니스 · 패턴]: Opus 4.8에서 도입된, 메인이 대량 서브에이전트(수십~수백 개)를 병렬 위임하는 기능. 트리거 워드 "ultra code"(구 "workflow"), 세션 한도를 빠르게 소진한다.
- **agent team** [하니스 · 패턴]: 서브에이전트와 달리 에이전트끼리 대화하고 태스크리스트를 공유하는 오케스트레이션. 비대화·1:1인 서브에이전트보다 비싸다.
- **max turns** [빌링 · 운영]: 서브에이전트가 리서치·검토 루프에 빠지지 않게 거는 최대 턴 제한 레버.
