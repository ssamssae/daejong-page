---
source_type: video
source_url: https://www.youtube.com/watch?v=HQEm4rBKdec
source_author: Eric Tech
source_channel: Eric Tech
source_title: Graphify Solves Claude's Biggest Limitation (Finally)
source_duration: 11분 51초
source_published: 2026-05-18
consumed_at: 2026-05-21
tags: [claude, knowledge-graph, code-search, llm-tokens, agents, AI-automation, obsidian, mcp]
---

# Graphify — 코드베이스를 knowledge graph로 인덱싱해 LLM 토큰 절감 — Eric Tech

## 한 줄 요약
Andrej Karpathy의 "LLM knowledge base" 아이디어에서 출발한 Graphify 레포를 소개·실연하는 영상. 코드·문서 raw 파일을 knowledge graph로 변환해 LLM이 매번 원본을 읽지 않게 만들어 토큰을 대폭 줄이고, path·explain·query·Obsidian/MCP 생성 등 코드베이스 탐색 기능을 보여준다.

## 영상 메타
- URL: https://www.youtube.com/watch?v=HQEm4rBKdec
- 채널: Eric Tech
- 길이: 11분 51초
- 업로드: 2026-05-18
- 조회수: 64,089 / 좋아요 1,457
- 시청일: 2026-05-21 KST (🏭 맥미니가 자막 추출 후 요약)

## 픽업
- Graphify는 Karpathy가 쓴 "LLM knowledge base" 글에서 영감을 받은 레포로, 코드·문서 raw 파일을 knowledge graph로 인덱싱해 AI 에이전트가 매번 원본 파일을 읽지 않고도 정보를 질의·유지할 수 있게 한다.
- 코드베이스를 knowledge graph로 컴파일하면 LLM 토큰 사용량이 약 70% 줄고, 데모 벤치마크에선 질문당 약 27배의 토큰 절감을 보였다 — 더 빠르고, 토큰 적게 쓰고, 정보 탐색이 더 정확해진다.
- 주 용도는 "쓰기보다 읽기" — 기존 코드베이스를 탐색하거나 리서치할 때 적합하다고 발화자는 말한다.
- 설치는 Python 3.10+ 와 UV(파이썬판 NPM)가 필요하고, `graphify install`로 .claude 폴더에 skill과 claude.md가 등록된다. Claude Code(기본)·Codex·OpenCode·OpenClaw·Hermes 등 여러 에이전트 프레임워크를 지원한다.
- 그래프 빌드 시 추출 범위를 고를 수 있다 — code only / code+docs / 이미지 포함 full(이 경우 20만~40만 토큰 소요). 기존 기능 리서치 목적이면 code only를 추천한다.
- 결과물은 3종 — 인터랙티브 graph.html(노드를 토글해 admin 레이아웃·API 라우트 등 특정 레이어만 시각화), graph.reports, raw graph.json. 노드는 개별 파일/컴포넌트, 엣지는 그 연결을 뜻한다.
- 부가 기능으로 path(두 파일 간 최단 경로), explain(개념 설명), query(질의), `graphify raw --update`(변경된 파일만 재추출), 그리고 Obsidian vault·wiki·SVG·Neo4j RAG·MCP 서버 생성까지 가능하다.

## 용어
- **Knowledge graph** [지식 · 컨텍스트 자산]: 코드·문서 raw 파일을 노드(파일·컴포넌트) + 엣지(관계) 그래프로 인덱싱. LLM 이 매번 원본 안 읽고 그래프만 질의 → 토큰 약 70% 절감, 데모에선 질문당 27x.
- **Graphify** [지식 · 컨텍스트 자산]: Karpathy 의 "LLM knowledge base" 아이디어 구현 레포. 코드베이스 → knowledge graph 컴파일 + path / explain / query / Obsidian / Neo4j / MCP 서버 생성.
- **RAG / Neo4j (참고)** [지식 · 컨텍스트 자산]: Graphify 가 출력 가능한 그래프 형식 중 하나 — Neo4j 그래프 DB 위 RAG 패턴으로 변환 가능.
