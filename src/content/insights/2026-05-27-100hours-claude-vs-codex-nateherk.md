---
title: "100 Hours Testing Claude Code vs ChatGPT Codex (honest results)"
date: "2026-05-26"
source_url: "https://www.youtube.com/watch?v=RLjaUES9P8A"
source_author: "Nate Herk"
---

## 한 줄 요약

Claude Code 와 ChatGPT Codex 를 features / pricing / 3 실측 use case (PDF · landing page · dashboard) 로 100시간 테스트 비교 — "어느 tool 이 더 좋냐가 아니라 지금 내 task 에 어느 게 맞냐" 라는 framing 으로 본질 차이 (Claude = 창의 / brainstorming / push back, Codex = 지시 준수 / code review / bug 찾기) 정리.

## 영상 메타

- URL: https://www.youtube.com/watch?v=RLjaUES9P8A
- 채널: Nate Herk | AI Automation
- 길이: 26분 34초
- 업로드: 2026-05-26
- 조회수: 6,587 / 좋아요 327
- 시청일: 2026-05-27 KST (🍎 본진이 자막 추출 후 요약)

## 픽업

- Claude Code 와 Codex 의 본질 차이 — Claude 는 더 창의적이고 brainstorming 에 강하며 사용자가 잘못된 방향 갈 때 push back 함. Codex 는 지시를 더 잘 따르고 code review · bug 찾기에 sharper. "둘 중 어느 게 더 좋냐가 아니라 지금 눈앞 task 에 어느 게 맞냐" 가 영상 thesis. 실용 패턴 = brainstorm / planning 은 Claude Code, 실행 / review 는 Codex.

- Hook events 양 차이 — Claude Code 30개 vs Codex 6개 (5x granularity). agent workflow 의 매 시점 (prompt submit / tool run / session start 등) 에 자동 trigger 박는 깊이 차이. Auto-delegating sub-agents 도 Claude Code 만 task 받으면 planner / explorer / reviewer 등 specialist 서브에이전트 자동 spawn — Codex 는 명시 요청 시에만 sub-agent 사용 (docs 명시).

- Third-party harness 정책 양극 — OpenAI 는 ChatGPT 구독 로그인 통해 Open Claw / Hermes 같은 외부 도구에 Codex 사용 명시 endorse (Sam Altman 5/2 트윗). Anthropic 은 Claude.ai 로그인을 third-party 제공 금지 — agent SDK 페이지에 "Unless previously approved, Anthropic does not allow third-party developers to offer Claude.ai login or rate limits for their products" 명시. 외부 agent harness 자주 쓰면 Codex 가 경제적 유리.

- Token efficiency 패턴 — Codex output tokens 가 Claude Code 보다 일관되게 2~5x 적음 (input 비슷). output tokens 가 더 비싸기 때문에 같은 work 에 Codex cost 더 적고 session limit 도 늦게 hit. 다만 task 종류별 역전 — 복잡 front-end (dashboard) 는 Claude 283K vs Codex 1.64M 으로 Claude 가 6x 적음, research-heavy 는 Codex 2.8M vs Claude 4.7M 으로 Codex 가 더 효율.

- 3 use case 실측 — dashboard 빌드는 Claude 가 2분, Codex 8분 (4x faster) + Claude 시각 polish 우위 (다크모드 / hover 자연 / 차트 그라데이션). landing page 는 Codex 가 3분 vs Claude 4분39초 더 빠르지만 시각 base 는 Claude 가 더 polished 라 "logo drop 1-prompt fix" 가능. research report PDF 는 Codex 가 8분 + 2.8M tokens 로 더 효율, 본문 spacing 도 Codex 가 client send 가능 수준 더 깔끔.

- Pricing tier 비교 — Anthropic 은 Claude Pro $20 / Max 5x $100 / Max 20x $200. OpenAI 는 ChatGPT Free·Plus $20 / Pro $200. **5월 31일까지 OpenAI promo 로 $100 tier 가 Codex 2x usage 제공 — 현재 AI coding agent 시장 best value 라고 평가**. Context window 도 Anthropic Opus/Sonnet 1M vs GPT-Codex 256K 로 Anthropic 우위.

- Tool lock-in 없는 portable mindset — agent 결과물은 결국 파일 + 폴더 (markdown / JSON / Python). CLAUDE.md ↔ AGENTS.md 작은 swap 만 하면 다른 agent (Codex / OpenClaw / Hermes / 다음 신생 tool) 에 그대로 import 가능. "Cloud Code 에서 6개월 빌드했다고 lock-in 된 거 아님 — 다른 agent 로 옮기는 거 안 어렵다" 가 mindset. portable skills + portable folders 가 본질.

## 용어

- **Auto-delegating sub-agents** [하니스 · 패턴]: agent 가 명시 요청 없이 자동으로 planner / explorer / code-reviewer 등 specialist 서브에이전트 spawn 하는 동작. Claude Code default 동작, Codex 는 docs 가 explicit 요청 필요 명시.
- **Hook events** [하니스 · 패턴]: agent session 의 특정 시점 (prompt submit / tool run / session start 등) 에 자동 trigger 박는 메커니즘. Claude Code 30개 / Codex 6개 (5x 차이).
- **/ultra-plan** [워크플로우 · 문화]: Claude Code 의 cloud planning session — 브라우저에서 plan inline comment 검토 후 터미널 execution 으로 다시 보냄. Pro/Max 3 free runs 후 run-billed.
- **/ultra-review** [워크플로우 · 문화]: Claude Code 의 multi-agent code review cloud session. multiple reviewer agent 가 reproduced findings 박힌 deep review 회신.
- **/loop** [하니스 · 패턴]: Claude Code 의 schedule 기반 recurring prompt + maintenance mode. prompt 없이도 maintenance loop 로 미완 task / PR comment / merge conflict 자율 처리.
- **/goal** [워크플로우 · 문화]: verifiable stopping condition 박은 long-running task — 단일 prompt 보다 큰 / open-ended backlog 보다 작은 영역. Codex native + Claude Code 도 영상 녹화 직후 출시.
- **Git work trees** [도구 통신 (MCP · CLI · API)]: 한 repo 안 여러 working copy 로 parallel task 가 main branch 충돌 없이 진행. Codex desktop app 의 native 통합 강점.
- **Claude agent SDK** [도구 통신 (MCP · CLI · API)]: Claude Code 의 engine 을 Python / TypeScript SDK 로 노출 — 본인 product 에 agent embed 가능. Bedrock / Vertex AI / Microsoft Foundry enterprise auth 도 함께 지원.
- **Open Claw / Hermes** [하니스 · 패턴]: third-party agent harness — proactive 동작 (native cron / heartbeat / skill 지원) 때문에 인기. ChatGPT sub 로그인 OK (Sam Altman endorse), Claude.ai 로그인은 third-party 금지.
- **Computer use (Codex QA)** [도구 통신 (MCP · CLI · API)]: agent 가 GUI 직접 조작 + QA 수행. Codex 의 polished flow = severity rating · expected vs actual · steps to reproduce · triage summary 자동 log.
