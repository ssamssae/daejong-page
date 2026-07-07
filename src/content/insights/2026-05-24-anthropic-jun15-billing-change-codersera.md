---
title: "Anthropic's June 15 Billing Change — What Every Claude Code & Agent SDK User Must Do"
date: "2026-05"
source_url: "https://codersera.com/blog/anthropic-june-2026-billing-change-claude-code/"
source_author: "Codersera"
---

## 한 줄 요약
2026-06-15 부터 Anthropic 이 Claude Code 빌링을 "사람이 직접 치는 사용" 과 "프로그램·에이전트가 자동으로 호출하는 사용" 두 통으로 나누고, 자동화 쪽은 별도 monthly credit pool (Pro $20 / Max5× $100 / Max20× $200) 에서 full API rate 로 차감되도록 종량제로 분리한다. 한도 초과 시 사용자가 선택할 수 있는 대안 4가지(DeepSeek 헤드리스 CLI / 오픈소스 프레임워크+자체 키 / Cursor IDE / Claude+저비용 혼합)를 정리한 글.

## 출처 메타
- URL: https://codersera.com/blog/anthropic-june-2026-billing-change-claude-code/
- 매체: Codersera Blog (개발자 도구 가이드 전문)
- 발행: 2026-05
- 시청일: 2026-05-24 KST (🍎 본진 WebSearch + WebFetch 추출)

## 빌링 구조 변경 (2026-06-15 시행)
- **인터랙티브 사용** (웹 채팅, 터미널 직접 명령) → 기존 Pro/Max 구독 한도 그대로 유지.
- **프로그램/에이전트 사용** (Claude Agent SDK, `claude -p` 헤드리스, Claude Code GitHub Actions, third-party agents) → 별도 monthly credit pool 로 분리.
  - Pro $20/mo → $20 credit / Max5× $100 → $100 credit / Max20× $200 → $200 credit.
  - 차감은 full API rate (Console API 가격 그대로, 할인 없음).
  - 월말 미소진분 expire (next month 로 안 굴러감).
- 부수 변경: 2026-05-13 Claude Code weekly limit 50% 증가 발표 (anti-Codex 대응, 2026-07-13 만료 예정).

## 사용자 대응 옵션 4가지

### 1. DeepSeek V4 헤드리스 CLI 갈아타기
- 토큰 비용 100만 토큰당 입력 $0.14 / 출력 $0.28. Claude 대비 입력 10~35×, 출력 최대 90× 싸다.
- 대량 루틴 작업(야간 잡, read-only 점검, 파일 정리, 로그 요약) 에 적합.
- 단점: 추론 품질이 Claude 대비 낮음 — 어려운 판단/설계엔 안 어울림.

### 2. 오픈소스 에이전트 프레임워크 + 자체 API 키
- Aider / Cline / OpenCode 같은 무료 도구에 본인이 직접 만든 Anthropic Console API 키 (또는 다른 제공자 키) 박아 쓰기.
- 비용 = 선택한 모델 제공자 가격 그대로. 유연성 최고.
- 단점: 운영 부담 ↑ (셋업·디버깅·업데이트 직접).

### 3. Cursor IDE 통합 에이전트
- Cursor $20/월 Pro tier 에 agentic + tab-autocomplete 번들.
- Claude Code 의 CLI 워크플로우 대신 Cursor 안에서 에이전트 굴리기.
- IDE 중심 개발자 (VS Code/Cursor 안에 머무는 패턴) 적합.

### 4. 혼합 전략 (Claude + 저비용 제공자)
- 어려운 추론/판단/코드 = Claude. 단순 루틴 = 저비용 제공자.
- 가장 균형 잡힌 선택지로, 대부분의 운영 규모에 무난.

## 강대종 5노드 적용

5노드 (🍎🪟🏭🖥💻) 다 Claude Code 라 6/15 이후 4노드(🪟🏭🖥💻) 의 자동 작업이 별도 credit pool 잡아먹는다. 가장 무거운 자동화 = autopilot 야간 6h 사이클 + night-builder + night-runner + 챗봇 polling. Max 플랜 $200 credit 으로 한 달치 5노드 자동 굴리는 게 충분한지 시뮬이 필요한 상황. credit 초과 시 자연스러운 fallback 은 옵션 4(혼합 전략) — 본진/맥미니 = Claude 유지(설계·판단·빌드/배포), 야간 read-only 점검·로그 요약·파일 정리 같은 단순 루틴 = DeepSeek 또는 오픈소스+자체 API 키로 분리.

옵션 2의 "자체 API 키" 는 OAuth 토큰 재사용이 아니라 Console API 키 별도 발급 의미 — 2026-05-21 박은 OAuth 토큰 외부 도구 사용 금지 정책 그대로 유효.

## 픽업
- 빌링 분리 = 인터랙티브 1인 워크로드와 24/7 에이전트 워크로드가 본질적으로 다른 자원 소비 패턴이라는 Anthropic 의 정책 인정. fairness 측면에선 합리적이지만 24/7 자동화 운영자는 비용 의식이 강제됨.
- 모델 사용을 "비싼 Claude 1개로 다 처리" 에서 "역할별로 모델 골라 쓰는 혼합" 으로 옮겨가는 시대 신호. Karpathy 의 "harness over model" 인사이트와 정합 — 모델 자체보다 모델을 어떻게 배치하는 하니스가 승부.
- credit 월말 expire 룰 = 미소비 절약 인센티브 X (월말 몰아 쓰기 또는 평소 풍족 사용 두 패턴). 자동화 운영자에겐 평소 풍족 사용이 자연스러움.

## 관련 메모리/인사이트
- [Anthropic OAuth 토큰 정책 — 도구 재사용 금지 (2026-05-21)](../insights/) — 옵션 2 의 "자체 API 키" = Console API 키 별도 발급 의미.
- [프롬프트 말고 하네스 — 안드레 카파시 코덱스 6원칙 (2026-05-23 바이브랩스)](2026-05-23-harness-not-prompt-codex-vibelabs.md) — "모델 자체 < 하니스 설계" 신호와 정합.
- 본진 박제 메모리: `reference_anthropic_billing_2026_06_15.md` (5노드 자동 sync).

## 용어
- **Claude Pro / Max5× / Max20×** [모델 · 구독]: Anthropic 구독 티어. 각각 $20 / $100 / $200 / 월. 2026-06-15 부터 인터랙티브 사용과 자동화(에이전트) 사용이 분리되며 자동화는 별도 monthly credit pool 에서 차감.
- **Monthly credit pool** [빌링 · 운영]: 2026-06-15 부터 Claude Code 자동화(에이전트) 사용분이 별도로 차감되는 월 단위 크레딧 풀. Pro $20 / Max5× $100 / Max20× $200, full API rate 종량제. 월말 expire — 평소 풍족 사용이 자동화 운영자에게 자연스러움.
- **Interactive vs Programmatic usage** [빌링 · 운영]: 2026-06-15 빌링 분리의 핵심 — 사람이 직접 치는 1인 인터랙티브 워크로드와 24/7 에이전트 워크로드가 본질적으로 다른 자원 패턴이라는 Anthropic 의 정책 인정.
- **DeepSeek 헤드리스 CLI** [빌링 · 운영]: Anthropic 한도 초과 시 대안 1 — DeepSeek 모델을 헤드리스 CLI 로 자체 호출.
