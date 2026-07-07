---
title: "Understand-Anything vs Graphify: I Tested Both on My SaaS"
date: "2026-05-27"
source_url: "https://youtu.be/Ynv_WYO_slw"
source_author: "Eric Tech"
---

## 한 줄 요약
AI 코드베이스 분석 도구 Understand-Anything 과 Graphify 를 같은 SaaS 레포에 동시 적용해 토큰 소비·시각화·AI 쿼리 응답·온보딩·stale 갱신·로컬 모델 지원 6 축으로 정면 비교한다.

## 영상 메타
- URL: https://youtu.be/Ynv_WYO_slw
- 채널: Eric Tech
- 길이: 16분 20초
- 업로드: 2026-05-27
- 조회수: 8397 / 좋아요 247
- 시청일: 2026-05-29 KST (🖥 가 자막 추출 후 요약)

## 픽업
- AI 코드베이스 분석은 Understand-Anything 과 Graphify 두 도구가 같은 카테고리에 있고, 둘 다 Claude Code 플러그인으로 설치한다. Graphify 는 `uv tool` 로, Understand-Anything 은 plugin marketplace 등록 후 install 방식.
- 코드베이스를 그래프로 변환할 때 Understand-Anything 은 토큰 400K, Graphify 는 200K 가 들었다. 토큰 예산이 빠듯하면 Graphify 가 절반에 끝낸다.
- 대시보드 시각화는 Understand-Anything 이 우위. 컴포넌트마다 parent 노드와 child 노드를 trace 해 보여주고, 각 파일에 description·used-by 정보가 붙는다. Graphify 는 모든 연결 노드를 neighbor 로만 표시하고 부모/자식 구분이 없다.
- AI 가 두 도구에 같은 쿼리를 던졌을 때 Understand-Anything 은 flowchart 와 step-by-step algorithm 까지 시각화해 응답한다. Graphify 는 동일한 답이지만 텍스트 위주. 토큰 소비와 응답 시간은 두 도구가 비슷.
- 온보딩 산출물은 다르다. Graphify 는 77개 문서가 든 wiki 폴더, Understand-Anything 은 architecture layer 가 정리된 단일 MD 요약 파일. wiki 가 좋으면 Graphify, summarize 가 좋으면 Understand-Anything.
- 두 도구 모두 git commit 또는 branch checkout 트리거에 그래프를 auto-update 해 stale data 를 막는다 (`/graphify update`, `/understand auto-update`).
- 로컬 모델 지원은 Graphify 만 한다. 환경 변수로 Ollama 또는 AWS Bedrock 등 backend 지정 가능. Understand-Anything 은 IDE 가 연결된 provider 를 그대로 사용한다. 발화자 결론은 둘을 같이 쓰는 것 — 시각화/이해는 Understand, 토큰 절약과 로컬 모델은 Graphify.

## 용어
- **Understand-Anything** [도구 통신 (MCP · CLI · API)]: 코드베이스를 interactive knowledge base 로 변환하는 Claude Code 플러그인. `/understand` 슬래시로 분석 시작.
- **Graphify** [도구 통신 (MCP · CLI · API)]: 코드베이스를 knowledge graph 로 변환하는 도구. `uv tool` 로 설치하고 `/graphify` 슬래시로 호출, Ollama/Bedrock 등 로컬 모델 backend 지원.
- **knowledge graph** [지식 · 컨텍스트 자산]: 코드 파일·심볼·관계를 노드와 엣지로 표현한 자료구조. AI 가 코드 탐색 시 토큰을 적게 쓰게 만든다.
- **.understandignore** [하니스 · 패턴]: Understand-Anything 의 그래프 생성 제외 파일 패턴. .gitignore 컨벤션, test/storybook/migration/email-template 등 비핵심 파일 제외 권장.
- **uv tool** [도구 통신 (MCP · CLI · API)]: Python 패키지 매니저 uv 의 글로벌 도구 설치 명령. JS 진영의 npm/npx global 과 같은 역할.
- **Claude Code plugin marketplace** [하니스 · 패턴]: Claude Code 에서 플러그인을 추가하는 채널. `/plugin marketplace add <repo>` 로 등록 후 `/plugin install` 한다.
- **auto-update workflow** [워크플로우 · 문화]: git commit 또는 branch checkout 시점에 그래프를 자동 재생성하는 트리거. stale knowledge graph 방지 목적.
- **parent/child node trace** [지식 · 컨텍스트 자산]: Understand-Anything 이 지원하는 그래프 탐색 방식. neighbor 만 보여주는 Graphify 와 달리 부모/자식 관계를 명시.
