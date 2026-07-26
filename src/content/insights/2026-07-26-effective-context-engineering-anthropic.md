---
title: "Effective Context Engineering for AI Agents"
date: "2026-07-26"
source_url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents"
source_author: "Anthropic (Applied AI)"
---

## 한 줄 요약
좋은 에이전트는 좋은 문장(프롬프트)이 아니라 좋은 '컨텍스트 살림'에서 나온다 — 모델의 주의력은 유한한 예산이므로, 매 추론 시점에 "결과 확률을 최대로 올리는 최소한의 고신호 토큰"만 창 안에 남기는 것이 컨텍스트 엔지니어링의 전부다.

## 출처 메타
- URL: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- 매체: Anthropic engineering 블로그
- 저자: Anthropic Applied AI 팀
- 수집일: 2026-07-26 KST (아니키가 전달한 커뮤니티 글 "[Claude 5 시대, 컨텍스트 설계 7가지 규칙]" 스샷이 발단 — 원문 커뮤니티 글은 미색인이라 그 글이 근거로 삼은 1차 출처인 이 글로 작성. 스샷에 보이던 규칙 4개가 전부 이 글의 섹션에 대응)

## 픽업
- 프롬프트 엔지니어링의 다음 단계가 컨텍스트 엔지니어링이다. 한 번 잘 묻는 기술이 아니라, 시스템 프롬프트·도구·대화 이력·외부 자료까지 "추론 시점에 모델 눈앞에 놓이는 토큰 전체"를 골라 유지하는 기술. "Context engineering refers to the set of strategies for curating and maintaining the optimal set of tokens (information) during LLM inference."
- 컨텍스트는 공짜가 아니다 — 창이 길어질수록 모델의 주의력이 얇게 발리며 성능이 실제로 내려간다(context rot). 그래서 컨텍스트는 "한계효용이 감소하는 유한 자원"으로 취급해야 한다: "Context, therefore, must be treated as a finite resource with diminishing marginal returns."
- 시스템 프롬프트에는 '적정 고도'가 있다. 조건문처럼 케이스를 하드코딩하면 부서지기 쉽고(brittle), 반대로 막연한 지침은 신호가 없다. 정답은 중간 고도 — "specific enough to guide behavior effectively, yet flexible enough to provide the model with strong heuristics." (스샷 규칙 ① '규칙보다 맥락'의 원형)
- 도구는 기능 자랑이 아니라 '헷갈릴 수 없음'이 품질이다. 겹치는 도구 여러 개보다 목적이 또렷한 소수가 낫다: "If a human engineer can't definitively say which tool should be used in a given situation, an AI agent can't be expected to do better." (스샷 규칙 ③ '예시보다 인터페이스')
- 예시는 엣지케이스 백과사전이 아니라 정예 화보집으로. 온갖 예외를 나열하는 대신 다양하고 대표적인 사례를 큐레이션하라 — "For an LLM, examples are the 'pictures' worth a thousand words." (스샷 규칙 ④ '말보다 자료')
- 다 미리 퍼 넣지 말고 필요할 때 연다(just-in-time). 자료 전체를 창에 붓는 대신 파일 경로·쿼리 같은 가벼운 참조만 들고 있다가 런타임에 열람 — 사람이 파일시스템·북마크로 일하는 방식과 같다. 에이전트가 스스로 관리하는 이 창은 "relevant subsets에 집중하게 하고, 방대하지만 무관한 정보에 빠져 죽지 않게 한다". (스샷 규칙 ② '필요할 때만 연다')
- 긴 작업(수십 분~수 시간)은 세 가지로 버틴다: ①compaction — 창이 차면 고충실도로 요약하고 새 창에서 이어가기 ②structured note-taking — 진행 상황을 창 밖 메모(NOTES.md·할일 파일)에 적고 필요할 때 다시 읽기 ③sub-agents — 부하 에이전트가 수만 토큰을 태워 탐색하고 본진에는 압축 요약만 반환. "Each subagent might explore extensively... but returns only a condensed, distilled summary of its work."
- 우리 플릿이 이미 이 셋을 살고 있다 — 45% 하드클리어+재개 포인터=compaction, tasks.md 단일 SoT=structured note-taking, 대량 읽기 서브에이전트 위임=sub-agent 패턴, MEMORY.md 인덱스+파일 분리=just-in-time. 이 글은 그 운영이 임기응변이 아니라 정석임을 1차 출처로 확인해준다.
- 결론은 한 문장이다: "find the smallest set of high-signal tokens that maximize the likelihood of your desired outcome." — 무엇을 넣을까가 아니라 무엇을 안 넣을까의 공학.

## 용어
- **Context engineering (컨텍스트 엔지니어링)** [하니스 · 패턴]: 추론 시점에 모델이 보는 토큰 전체(지침·도구·이력·자료)를 큐레이션·유지하는 전략. 프롬프트 엔지니어링의 상위 확장.
- **Context rot (컨텍스트 부패)** [모델 · 한계]: 컨텍스트가 길어질수록 모델이 개별 토큰에 주의를 덜 배분해 정확도가 내려가는 현상.
- **Attention budget (주의 예산)** [모델 · 한계]: 모델이 컨텍스트 전체에 나눠 쓰는 유한한 주의 자원 — 토큰을 넣을수록 예산이 얇게 발린다.
- **Right altitude (적정 고도)** [하니스 · 패턴]: 시스템 프롬프트가 하드코딩과 막연함 사이에서 잡아야 하는 구체성 수준.
- **Just-in-time retrieval / Progressive disclosure** [하니스 · 패턴]: 자료를 미리 다 넣지 않고 가벼운 참조(경로·링크)만 두고 필요 시점에 열어 단계적으로 발견하는 로딩 전략.
- **Compaction (압축 이월)** [하니스 · 패턴]: 컨텍스트 창이 차면 대화를 고충실도로 요약해 새 창에서 이어가는 장기작업 전략.
- **Structured note-taking (구조화 메모)** [하니스 · 패턴]: 진행 상황을 컨텍스트 밖 영속 메모에 기록해 창을 비우고도 상태를 잃지 않는 전략.
- **Sub-agent architecture (서브에이전트 구조)** [하니스 · 패턴]: 부하 에이전트가 대량 탐색을 전담하고 요약만 반환해 본체 창을 깨끗하게 유지하는 분업 구조.
