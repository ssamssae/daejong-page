---
source_type: video
source_url: https://youtu.be/q5lg3npxjAc
source_author: Nate Herk
source_channel: Nate Herk | AI Automation
source_title: Opus 4.8 Just Dropped. Here's How To Actually Use It.
source_duration: 13분 44초
source_published: 2026-05-28
consumed_at: 2026-05-29
tags: [claude, opus-4-8, claude-code, prompting, effort-levels, AI-automation]
---

# Opus 4.8 Just Dropped. Here's How To Actually Use It. — Nate Herk | AI Automation

## 한 줄 요약
Opus 4.8 출시 직후 정리 영상으로, 4.7 의 불만(게으름·과도한 안전·토큰 폭증·태도)을 4.8 이 어떻게 정조준했는지와 effort 레버·프롬프트 방식 등 실사용 변화를 다룬다.

## 영상 메타
- URL: https://youtu.be/q5lg3npxjAc
- 채널: Nate Herk | AI Automation
- 길이: 13분 44초
- 업로드: 2026-05-28
- 조회수: 104,109 / 좋아요 2,770
- 시청일: 2026-05-29 KST (🍎 본진이 자막 추출 후 요약)

## 픽업
- Opus 4.8 은 4.7 위에 더 날카로운 판단, 자기 진행에 대한 정직함, 더 긴 독립 작업 능력을 얹은 모델이며 input/output 토큰 가격은 4.7 과 동일하다. effort level 의 높은 토큰 사용을 수용하려고 Claude Code 의 rate limit 만 올렸고, 5시간 롤링/주간 세션 한도는 건드리지 않았다.
- 이제 effort 가 가장 큰 레버다. CLI 에서 `effort` 로 low/medium/high(기본)/xhigh/max/ultra(=xhigh+workflows) 슬라이더를 조절하는데, 왼쪽일수록 빠르고 오른쪽일수록 똑똑하지만 토큰이 비싸다. 4.8 의 low 와 xhigh 차이는 거의 다른 버전(4.9)처럼 크고, 4.7 의 게으름·과도한 안전이 사실 effort 부족 문제였을 수 있다. 반대로 쉬운 일에 xhigh 면 overengineer 한다.
- 4.7 에 대한 커뮤니티 불만은 게으름(goal 을 너무 일찍 포기), 과도한 safety overreach/경직성, 비싼 token burn, 그리고 "태도"(stubborn·sassy)였다. 4.8 은 이걸 정면으로 겨냥해 goal 개념을 band-aid 인 /goal 명령이 아니라 모델 코어에 내장하고, 정직함·self-correction, 긴 작업 autonomy, 더 따뜻하고 협업적인 vibe 를 목표로 했다.
- 정직함은 수치로도 나온다. misaligned behavior(거짓 주장 정도, 낮을수록 좋음) 평가에서 4.8 은 4.7·Sonnet 4.6 의 거의 절반이다. "4시간 걸린다 해놓고 20분", "50개 push 했다 해놓고 실제 15개" 같은 거짓 보고를 줄였다.
- 프롬프트는 "하지 마"보다 "해라"로 쓰는 게 낫다. 문서의 예시 프롬프트들이 부정 지시보다 명시적 지시 위주였고, 거기에 더해 지시에는 why(이유)를 붙이라고 한다. 예를 들어 "M대시 쓰지 마" 대신 "내가 직접 쓴 것처럼 보이게 하고 싶고 내 스타일은 M대시를 안 쓴다"처럼 맥락을 주면 모델이 더 잘 따른다.
- 4.8 은 기본적으로 도구를 호출하기 전에 추론을 먼저 한다(서브에이전트 spawn·DB 조회 전에 스스로 접근법을 정함). 좋은 경우도 있지만 맥락을 먼저 당겨오고 싶을 땐 프롬프트로 조정해야 하고, 응답 길이도 고정 verbosity 가 아니라 task 복잡도에 따라 self-calibrate 한다(단순 조회는 짧게, open-ended 분석은 길게).
- 벤치마크는 신모델마다 항상 좋아 보이므로(마케팅) 걸러 들어야 하고, 남의 use case 가 내 use case 는 아니다. 발화자는 agentic computer use 는 벤치마크와 무관하게 codex+GPT-5.5 가 Opus 보다 낫다고 본다. 내 실제 4.7 워크플로의 pain point 를 먼저 파악하고 4.8 이 그걸 고치는지 직접 판단하라(반복 self-correction 은 memory·skill 파일로 줄이라).

## 용어
- **Effort level** [하니스 · 패턴]: Claude Code 에서 모델이 task 에 쏟는 추론·토큰 양을 조절하는 슬라이더(low~ultra).
- **Ultra code** [하니스 · 패턴]: xhigh effort 에 dynamic workflows 를 결합한 최상위 단계.
- **Dynamic workflows** [하니스 · 패턴]: 대규모 문제를 분해해 다루는 Claude Code 신기능(`workflows` 입력으로 시작).
- **Mythos** [모델 · 구독]: Anthropic 이 예고한 Opus 상위의 차세대 고지능 모델(현재 소수 조직이 cyber security 용으로 사용, 안전장치 강화 전 비공개).
- **Misaligned behavior** [기타]: 모델이 거짓·과장 주장(거짓 완료 보고 등)을 하는 정도를 재는 평가지표(낮을수록 좋음).
- **/goal** [하니스 · 패턴]: 모델이 목표를 향해 더 오래 작업하게 붙잡아주던 명령(band-aid) — 4.8 은 이 개념을 코어에 내장.
- **Rate limit vs session limit** [빌링 · 운영]: API 호출량 제한인 rate limit(4.8 에서 상향)과 5시간/주간 세션 한도(불변)는 서로 별개다.
- **Agentic computer use** [하니스 · 패턴]: 모델이 컴퓨터를 에이전트로 직접 조작하는 능력(발화자는 이 영역은 codex+GPT-5.5 가 Opus 보다 낫다고 평가).
