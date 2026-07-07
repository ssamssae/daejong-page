---
title: "Every Level of a Claude Second Brain Explained"
date: "2026-06-18"
source_url: "https://www.youtube.com/watch?v=DTCyvo6cC54"
source_author: "Nate Herk | AI Automation"
---

## 한 줄 요약
Claude Code(또는 어떤 AI 에이전트든)와 함께 쓰는 second brain을 5단계 레벨로 분류하고, 각 레벨의 작동 방식·적합한 사용 사례·한계를 설명한다. 높은 레벨이 무조건 좋은 게 아니라 현재의 실제 고통점(pain point)에 맞는 최소 레벨을 고르는 것이 핵심이다.

## 영상 메타
- URL: https://www.youtube.com/watch?v=DTCyvo6cC54
- 채널: Nate Herk | AI Automation
- 길이: 30분 59초
- 업로드: 2026-06-17
- 조회수: 3927 / 좋아요 261
- 시청일: 2026-06-18 KST (🍎 가 자막 추출 후 요약)

## 픽업
- **CLAUDE.md는 라우터다.** "정보를 찾으려면 이 폴더를 봐라"는 routing rule이 없으면 AI는 전체 코드베이스를 뒤지거나 아예 포기한다. 레벨 1의 핵심은 CLAUDE.md에 "X는 /context에 있다"는 명시적 경로를 박는 것이다.
- **데이터 설계는 역방향으로(reverse engineer from the question).** 나중에 어떤 질문을 던질지를 먼저 정하고, 그에 맞는 저장 구조를 결정해야 한다. 농구공이 들어갈 골대 모양을 먼저 알아야 공 모양을 설계할 수 있다.
- **벡터 DB(semantic search)는 만능이 아니다.** "3월 5일 회의 요약해줘"처럼 전체 문서가 필요한 질문에 chunk 기반 벡터 검색은 일부 chunk만 가져와 핵심을 놓친다. 전문을 통째로 읽어야 하는 경우엔 그냥 마크다운 파일이 더 정확하다.
- **second brain에는 '에버그린' 데이터만 넣어라.** 슬랙 스레드·고객 이메일처럼 다음 주면 바뀌는 데이터는 노이즈다. "1년 뒤에도 이 기억이 유용할까?"를 기준으로 ingestion 여부를 판단하고, 변동 데이터는 접근 경로만 second brain에 기록해 실시간으로 fetch하게 한다.
- **레벨 4(Knowledge Graph)는 관계 체인 추적이 필요할 때만 도입한다.** "Jordan은 Acme에서 일하고, Acme는 Postpilot의 지지를 받는다"처럼 엔티티 간 의미 있는 관계를 따라가야 할 때 유효하다. Nate는 현재 프로젝트 규모에서 레벨 2 LLM Wiki로 충분하다고 판단해 지금도 레벨 2를 쓴다.
- **하나의 프로젝트 안에서 폴더마다 다른 레벨을 쓸 수 있다.** YouTube 트랜스크립트 폴더는 벡터 DB(레벨 3), 비즈니스 컨텍스트 폴더는 마크다운(레벨 2), 결정 로그는 레벨 1 식으로 데이터 특성에 따라 다른 구조를 혼용하는 것이 맞다.
- **데이터를 Claude에 보내는 것은 Anthropic 전송을 의미한다.** 클라이언트 데이터·민감 정보를 second brain에 넣을 경우, 오픈소스 로컬 모델 경유를 고려해야 한다고 영상에서 직접 경고한다.

## 용어
- **LLM Wiki** [지식 · 컨텍스트 자산]: 마크다운 파일들이 서로 링크로 연결된 계층형 지식 저장소. Karpathy의 LLM Wiki 개념을 Claude 프로젝트에 적용한 레벨 2 패턴. 인덱스 파일이 드릴다운 경로를 안내한다.
- **auto-memory** [하니스 · 패턴]: Claude Code의 `/memory` 토글을 켜면 AI가 세션 중 MEMORY.md를 자동으로 업데이트하는 기능. 사용자가 수동으로 메모리 파일을 관리하지 않아도 된다.
- **벡터 임베딩(Embeddings)** [컨텍스트 · 캐시]: 텍스트 chunk를 의미 기반 3차원 공간의 좌표로 변환하는 과정. 유사한 의미의 chunk는 공간상 가까이 배치되어 semantic search가 가능해진다.
- **LightRAG** [하니스 · 패턴]: 엔티티·관계 그래프를 마크다운 파일에서 자동 추출해 knowledge graph를 구성하는 오픈소스 RAG 프레임워크. Obsidian보다 관계 체인 추적에 강하다.
- **GBrain** [워크플로우 · 문화]: Y Combinator CEO Gary Tan이 만든 "always-on" AI second brain 개념. 메모리를 지속적으로 동기화·갱신해 레벨 5에 해당하는 자율 업데이트 구조를 구현한다.
- **AGENTS.md** [하니스 · 패턴]: Codex가 프로젝트 진입 시 자동 로드하는 시스템 프롬프트 파일. Claude Code의 CLAUDE.md와 동일한 역할로, 동일 내용을 두 파일로 유지하면 멀티 에이전트 환경에서 tool-agnostic second brain이 된다.
- **하이브리드 검색 + 리랭킹(Hybrid Search + Reranking)** [컨텍스트 · 캐시]: 벡터 similarity search와 키워드 검색을 결합한 뒤 relevance 점수로 재정렬하는 고급 벡터 검색 기법. 단순 chunk 검색의 정확도 한계를 보완한다.
