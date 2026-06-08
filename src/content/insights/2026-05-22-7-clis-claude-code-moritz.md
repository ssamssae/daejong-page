---
title: "7 CLIs to 10x Your Claude Code"
date: "2026-05-11"
source_url: "https://www.youtube.com/watch?v=CDC7mNaNzI8"
source_author: "Moritz | AI Builder"
---

# 7 CLIs to 10x Your Claude Code — Moritz | AI Builder

## 한 줄 요약
AI 에이전트가 다른 소프트웨어와 통신하는 방식으로 CLI 가 MCP·API 를 빠르게 대체하고 있다는 주장과 함께, 발화자가 Claude Code 생산성을 끌어올린다고 소개하는 7개 CLI 도구(GWS, Higgsfield, Playwright, Apify, Postiz, WhatsApp, Summarize)와 보너스 도구들을 데모로 보여주는 영상.

## 영상 메타
- URL: https://www.youtube.com/watch?v=CDC7mNaNzI8
- 채널: Moritz | AI Builder
- 길이: 25분 12초
- 업로드: 2026-05-11
- 조회수: 1934 / 좋아요 40
- 시청일: 2026-05-22 KST (🏭 가 자막 추출 후 요약)

## 픽업
- CLI(command line interface)는 1960년대부터 있던 텍스트 in/out 프로그램인데, AI 가 chat 에서 agentic 으로 넘어가면서 에이전트가 컴퓨터에서 행동을 취하는 효율적 통로로 재부상 중이다. Open Claw 제작자 Peter Steinberger 가 CLI 의 대표적 옹호자.
- API 는 사람에겐 편하지만 에이전트에겐 단계가 많다 — 문서 읽기, 요청 구성, 인증 처리, 응답 파싱. MCP 는 "메뉴를 씌운 API" 로 에이전트에게 쓸 수 있는 tool 목록을 주는 방식. 초기엔 모든 tool 을 컨텍스트에 로드해 토큰을 먹었으나 지금은 deferred(필요할 때만 로드) 로 개선됐다.
- 같은 작업(캘린더 읽고 이메일 초안)을 비교하면 MCP 는 4회 round trip, GWS CLI 는 2~3회로 CLI 가 더 효율적이고 토큰을 덜 먹는다. 다만 발화자도 MCP vs CLI 중 무엇이 지배적이 될지는 아직 미정이라 대부분 회사가 둘 다 만들고 있다고 본다.
- CLI 의 결정적 단점은 로컬 전용이라는 것 — 내 머신에 산다. Claude Code 의 remote routine 은 로컬 환경 복사본을 클라우드에 띄우므로 로컬 CLI 가 안 따라간다. 매 실행마다 설치+토큰 주입해야 하니 결국 "wrapper 씌운 API" 처럼 된다. 반면 MCP 는 remote routine 에 쉽게 포함된다.
- GWS CLI 는 Google Workspace 전체(Drive·Sheets·Gmail·Calendar·Docs·Slides·Tasks 등)를 다루고, OAuth 수동 셋업(Google Cloud Console 에서 client JSON 발급 + 서비스별 enable)이 필요해 설치가 까다롭다. 대신 Sheets MCP 는 아예 없어서 CLI 가 MCP 보다 기능이 넓고, Gmail MCP 가 초안만 가능한 것과 달리 GWS 는 메일 발송까지 된다.
- 도구별 특징: Higgsfield(이미지·비디오 생성, 설치 시 skill 도 같이 깔림) · Playwright(브라우저 제어, 계정·인증 불필요로 설치 가장 쉬움) · Apify(actor 단위 웹 스크래핑, 여러 actor 를 엮어 리드 enrich) · Postiz(여러 SNS 예약 발행) · WhatsApp(메시지 읽기·요약·발송, 음성 다운로드+전사) · Summarize(아티클·유튜브 빠른 요약).
- printingpress.dev 의 "CLI printing press" 는 다른 CLI 를 만들어주는 도구 — 웹사이트나 API 를 가리키며 "notion" 이라 하면 그에 맞는 CLI 를 생성해준다. 커뮤니티가 CLI 로 얼마나 기울고 있는지 보여주는 사례.

## 용어
- **MCP (Model Context Protocol)** [도구 통신 (MCP · CLI · API)]: 에이전트에게 사용 가능한 tool 목록을 표준화해 주는 protocol. "메뉴 씌운 API". 초기엔 모든 tool 을 컨텍스트에 로드해 토큰 폭주, 지금은 deferred(필요할 때만) 로 개선.
- **CLI-first 룰** [도구 통신 (MCP · CLI · API)]: "CLI 가 있으면 MCP 보다 CLI 우선" — Anthropic 공식 문서에 명시. CLI 가 MCP 대비 60~70% 적은 토큰. 우선순위 = CLI → API → Skills → MCP.
- **Tool search (deferred MCP)** [도구 통신 (MCP · CLI · API)]: 2026-01 release. MCP overhead 10% 넘으면 auto-defer, 85% token reduction.
