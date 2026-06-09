---
title: "앤트로픽 2026-06-15 빌링 분리 회피 4가지 — 회색지대 자동화를 보강재로"
tags: [anthropic, billing, gray-zone, browser-mcp, playwright, deepseek, multi-agent]
date: 2026-05-24
---

# 앤트로픽 2026-06-15 빌링 분리 회피 4가지 — 회색지대 자동화를 보강재로

2026-06-15 부터 Anthropic 이 Claude Code 빌링을 **인터랙티브 사용 ↔ 프로그램/에이전트 사용** 두 통으로 쪼갠다. 인터랙티브(웹 채팅·터미널 직접 명령) 는 기존 Pro·Max 구독 한도 그대로지만, 프로그램/에이전트(Claude Agent SDK, `claude -p` 헤드리스, Claude Code GitHub Actions, third-party agents) 는 **별도 monthly credit pool** 로 분리된다. Pro $20 → $20 credit / Max5× $100 → $100 credit / Max20× $200 → $200 credit, 차감은 full API rate, 월말 미소진분은 expire. 자동화·에이전트 워크로드가 인터랙티브와 한 통에 묶여 있던 fairness 문제를 종량제로 푸는 변경이다.

본인 5노드(🍎🪟🏭🖥💻) 전부 Claude Code 라 6/15 이후 4노드(🪟🏭🖥💻) 의 night-runner / night-builder / autopilot / 챗봇 polling 이 별도 credit pool 을 잡아먹는다. Max $200 credit 으로 한 달치 5노드 자동잡이 충분한가가 핵심 질문이고, 거기서 빠져나오는 **회피 4가지** 가 codersera 등에서 정리됐다.

## 회피 4가지

1. **DeepSeek V4 헤드리스 CLI 갈아타기** — 입력 100만 토큰 $0.14, 출력 $0.28. Claude 대비 입력 10~35×, 출력 최대 90× 싸다. 야간 read-only 점검·로그 정리·요약 같은 대량 루틴에 적합. 추론 품질은 Claude 보다 낮음.
2. **오픈소스 에이전트 프레임워크 + 자체 API 키** — Aider / Cline / OpenCode 같은 무료 도구에 본인이 직접 발급한 Anthropic Console API 키 (또는 DeepSeek·Groq·Together 등) 박아 쓰기. 비용은 모델 제공자 가격 그대로, 유연성 최고, 운영 부담은 ↑. ⚠️ Claude Code 가 들고 있는 OAuth 토큰 재사용 금지(정책 위반).
3. **Cursor IDE 통합 에이전트** — Cursor $20/월 Pro tier 가 agentic + tab-autocomplete 번들. Claude Code 대신 Cursor 안에서 에이전트 작업. IDE 중심 개발자에게 자연.
4. **혼합 전략** — 어려운 추론·판단·코드 = Claude, 단순 루틴(파일 정리·요약·로깅·night-runner read-only) = 저비용 제공자. 본인 5노드 구조엔 본진/맥미니 = Claude 유지, 나머지 노드 야간 잡 일부 = DeepSeek/오픈소스 분리가 가장 자연스러운 fallback.

## 회색지대 자동화 = 5번째 회피, 사실상 보강재

위 4가지가 "모델을 갈아타거나 풀을 갈아탄다" 라면, 회색지대 자동화는 **호출 자체를 줄인다**. 네이버·인스타·당근·부동산처럼 공식 API 가 막힌 사이트는 어차피 LLM 호출 없이 사람처럼 클릭해 자동화해야 하는데, 이걸 헤드리스 SDK 가 아니라 **인터랙티브 챗봇 안의 Playwright MCP / BrowserMCP** 로 굴리면 LLM 호출은 챗봇 본인 추론 한 번이고 브라우저 클릭 자체는 0 토큰이다.

핵심 동작 = 본인이 평소 켜둔 Chrome 창 또는 별도 영속 프로필에 attach → DOM 읽고 클릭. 본인 로그인 세션·쿠키·핑거프린트 그대로라 Cloudflare·네이버 봇 탐지를 clean chromium 보다 훨씬 잘 통과한다. 본진 맥은 이미 Playwright MCP + persistent context 로 네이버 블로그 자동 발행 / 유튜브 스튜디오 업로드 / Play Console "앱 만들기" 폼 / ASC 심사 클릭이 이 방식으로 돌고 있다. 같은 일을 Anthropic Computer Use 시각 방식으로 돌리면 클릭 한 번에 LLM 1만 토큰 + 5~15초 — 회색지대 자동화 한 시간이 빌링 풀 한 달치를 갉아먹는 구조라 절대 피해야 한다.

## 본진 5노드 적용 = 두 갈래 분리 설계

설계 부담을 줄이는 길은 4가지 + 회색지대 보강을 동시에 늘어놓는 게 아니라 **두 갈래로만 갈라두는 것**.

- **인터랙티브 풀에 묶기** — 형님이 텔레그램으로 챗봇 깨워서 명령하는 모든 흐름. 회색지대 자동화 (네이버·유튜브·Play Console·ASC) 는 전부 여기. Max 구독 인터랙티브 한도 안에서 돌고 6/15 후에도 풀 변동 없음.
- **자율잡 풀에 묶기 (선택)** — night-runner / night-builder / autopilot / cron / loop-fleet 같이 사람 없이 도는 자율잡. 6/15 이후 별도 credit pool 로 빠지므로 (a) Anthropic credit 으로 좁혀서 routine 으로 묶거나, (b) DeepSeek·오픈소스로 라우팅. 본진/맥미니 = Claude 유지, 4노드 야간잡 = DeepSeek/오픈소스 + 본인 API 키 가 본인 구조에 가장 자연.

4갈래 다 동시 설계 X, 인터랙티브 vs 자율잡 두 갈래로만 가르면 머리가 덜 아프고, 회색지대 자동화가 인터랙티브 쪽 무게를 더 키워주는 보강재 역할이다. 본진 5노드 mesh + Playwright MCP persistent 가 이미 그 방향으로 짜여 있어서 새로 갈아엎지 않고 위에 올리기만 하면 된다.

## 다음 행동

- 6월 1일~14일 사이 본인 5노드의 일일 자율잡 토큰 소비량 실측 (autopilot 6h 사이클 + night-builder + night-runner 합산).
- $200 credit 시뮬 — 실측 토큰을 full API rate 로 환산해서 한 달치 cover 가능한지 계산.
- credit 초과 위험이면 4노드 중 1~2개 야간잡 먼저 DeepSeek 로 라우팅 PoC (혼합 전략).
- 새로 추가하는 자동화는 디폴트로 인터랙티브 풀 (Playwright MCP persistent) 쪽에 깔기. 헤드리스 SDK 디폴트 금지.

## 비고

자세한 빌링 변경 사실·출처는 [[reference_anthropic_billing_2026_06_15]] 메모리에 박혀 있고, OAuth 토큰 외부 도구 재사용 금지 정책은 [[reference_anthropic_oauth_token_policy]]. BrowserMCP 의 개념 정리는 [정보 탭](../info.html) "BrowserMCP — 본인 Chrome 에 붙어 회색지대 사이트 자동화" 카드 참고.
