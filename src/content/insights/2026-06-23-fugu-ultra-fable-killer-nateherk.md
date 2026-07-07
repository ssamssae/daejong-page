---
title: "Sakana Fugu Ultra 테스트 — Fable 킬러인가, 느린 오케스트레이터인가"
date: "2026-06-23"
source_url: "https://www.youtube.com/watch?v=GpSqBjW6hR4"
source_author: "Nate Herk | AI Automation"
---

## 한 줄 요약
Nate Herk는 Sakana Fugu Ultra를 Claude Code 안에서 직접 돌려 보고, 이것이 더 뛰어난 단일 모델이라기보다 여러 프런티어 모델을 자동 배분하는 오케스트레이션 API라고 설명한다. 그의 38개 테스트에서는 품질은 Opus 4.8과 거의 비슷했지만, Fugu가 훨씬 느리고 비쌌다고 말한다.

## 영상 메타
- URL: https://www.youtube.com/watch?v=GpSqBjW6hR4
- 채널: Nate Herk | AI Automation
- 길이: 12분 15초
- 업로드: 2026-06-23
- 조회수: 43,053 / 좋아요 1,277
- 시청일: 2026-06-23 KST (🍎 가 자막 추출 후 요약)

## 픽업
- **Fugu Ultra는 Fable보다 똑똑한 새 LLM이라기보다 모델 오케스트레이터다.** Nate는 Fugu가 Opus, GPT, Gemini 같은 여러 프런티어 모델을 하나의 API 뒤에서 동적으로 조율해 벤치마크 성능을 끌어올린다고 설명한다.
- **패턴 자체는 새롭지 않다.** 그는 Claude Code가 하위 에이전트나 Haiku/Sonnet/Opus 워커를 돌리는 방식과 비슷하다고 말한다. 차이는 사람이 직접 모델을 고르는 대신 Fugu가 어떤 모델이 어떤 일에 맞는지 자동으로 결정한다는 점이다.
- **모델 오케스트레이션의 핵심 질문은 두 가지다.** 첫째, 작업의 각 부분을 누가 맡을지 정하는 것. 둘째, 여러 모델의 응답을 어떻게 합쳐 최종 답으로 만들지 정하는 것이다.
- **OpenRouter Fusion API와는 방식이 다르다.** Nate는 Fusion이 같은 프롬프트를 여러 모델에 동시에 보내고 judge가 합치는 방식인 반면, Fugu는 작업을 나누고 각 부분을 적합한 모델에 위임하는 방식이라고 설명한다.
- **38개 테스트 결과는 대부분 동률이었다.** Codex가 만든 평가 세트로 Opus 4.8과 Fugu Ultra를 비교했을 때, 38개 중 36개가 동률이었고 나머지 2개는 Opus가 이겼다고 말한다.
- **비용과 속도는 Fugu 쪽이 크게 불리했다.** 전체 테스트에서 Fugu는 약 357분, Opus는 약 80분이 걸렸고, 비용도 Fugu가 약 50달러로 Opus의 약 10달러보다 5배 비쌌다고 설명한다.
- **Nate의 결론은 '미래 방향은 맞지만 지금 자기 용도에는 아니다'이다.** 그는 여러 모델의 강점을 조합하고 단위경제를 최적화하는 능력은 앞으로 중요해질 것이라고 보지만, 현재 자신의 지식작업에서는 Codex와 Claude Code 구독 조합이 더 낫다고 말한다.

## 용어
- **Sakana Fugu Ultra** [모델 · 구독]: Sakana AI가 제공하는 모델 오케스트레이션형 API. 영상에서는 단일 LLM이 아니라 여러 프런티어 모델을 조율하는 시스템으로 설명된다.
- **Model orchestration** [하니스 · 패턴]: 작업을 여러 모델이나 에이전트에 나누어 맡기고 결과를 합치는 방식. Fugu Ultra의 핵심 동작으로 소개된다.
- **Multi-agent system** [하니스 · 패턴]: 여러 에이전트나 모델이 각자 특화된 역할을 맡아 하나의 결과를 만드는 구조. 영상에서는 작은 물고기들이 큰 물고기를 이루는 비유로 설명된다.
- **Conductor model** [하니스 · 패턴]: 사용자 요청을 받아 작업을 쪼개고 적합한 모델에 위임하는 관리자 모델. Nate는 Fugu 안의 작은 manager model을 이렇게 설명한다.
- **Mixture of experts** [모델 · 구독]: 여러 전문가 모델의 강점을 조합해 더 좋은 결과를 얻는 접근. 영상에서는 GPT, Claude, Gemini의 강점을 함께 쓰는 맥락으로 언급된다.
- **OpenRouter Fusion API** [도구 통신 (MCP · CLI · API)]: 하나의 프롬프트를 여러 모델에 동시에 보내고 judge가 답을 병합하는 API 방식. Fugu와 비교 대상으로 나온다.
- **Slash goal prompt** [하니스 · 패턴]: Claude Code 같은 하니스에서 목표 중심으로 긴 작업을 맡기는 프롬프트 방식. Nate는 Fugu로 대시보드를 만든 첫 예시에 이 방식을 썼다고 말한다.
- **Unit economics** [빌링 · 운영]: 품질을 유지하면서 어떤 모델을 가장 싸고 효율적으로 쓸지 따지는 비용 구조. Nate는 앞으로 AI 활용에서 중요한 역량이 될 것이라고 말한다.
