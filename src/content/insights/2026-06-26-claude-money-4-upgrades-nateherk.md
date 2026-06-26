---
title: "I asked Claude Code to make me as much money as possible"
date: "2026-06-26"
source_url: "https://youtu.be/iTY8Q449YNQ"
source_author: "Nate Herk | AI Automation"
---

# I asked Claude Code to make me as much money as possible — Nate Herk | AI Automation

## 한 줄 요약
Claude Code 의 기본 습관(아첨·미검증·컨텍스트 부패·단일 에이전트 병목)이 돈 버는 걸 방해한다고 보고, 이를 고치는 4가지 업그레이드(roast 카운슬 / 검증 루프 / 컨텍스트 관리 / 서브에이전트+/goal)를 실제 $9 SaaS 아이디어를 처음부터 끝까지 만들며 시연한 영상.

## 영상 메타
- URL: https://youtu.be/iTY8Q449YNQ
- 채널: Nate Herk | AI Automation
- 길이: 28분 12초
- 업로드: 2026-06-25
- 조회수: 42,228 / 좋아요 1,475
- 시청일: 2026-06-26 KST (🍎 본진이 자막 추출 후 요약)

## 픽업
- Claude 는 기본적으로 "돈을 벌게" 가 아니라 "생산적이라고 느끼게" 튜닝돼 있다. 수입은 결국 산출물의 품질과 생산 속도 두 가지에 의해 상한이 정해진다고 주장한다.
- 아첨(sycophancy)은 측정된 문제다. "elephant" 연구에서 AI 는 사용자의 프레이밍에 반박하지 못하는 비율이 약 88%(사람은 약 60%)였고, MIT·Penn State 연구는 개인화·메모리 기능이 긴 대화일수록 모델을 더 동조적으로 만든다고 봤다. 해법으로 contrarian·expansionist·first-principles·deep researcher·buyer 역할극·judge 페르소나 카운슬을 띄워 아이디어를 stress test 하고 green light / reshape / kill 판정 + 48시간 안에 돌릴 가장 싼 테스트를 내놓는 "roast" 스킬을 제시한다.
- "끝났다(finished)" 와 "실제로 작동한다(working)" 는 다르다. NYU 연구에서 Copilot 이 생성한 약 1,600개 프로그램 중 약 40%에 보안 취약점이 있었다. 해법은 검증 루프 — Claude 가 빌드하면서 Playwright CLI 로 양쪽 뷰포트 스크린샷·버튼 클릭·폼 제출 edge case 까지 스스로 stress test 하게 하고, "definition of done" 을 명시해 다 됐다고 선언하기 전에 검증을 강제한다.
- 컨텍스트 부패(context rot): 상위 18개 모델을 테스트한 연구에서 모든 모델이 대화가 길어질수록 성능이 떨어졌고, 그 하락은 컨텍스트 창이 다 차기 한참 전부터 시작된다. 더 긴 대화 = 더 멍청한 Claude. /context 로 사용량을 보고 /clear 로 비우며, /compact 대신 직접 만든 "session handoff" 스킬(결정·핵심 파일·다음 진입점 요약)로 넘긴다. 대략 25만 토큰 넘기 전 새 세션을 연다.
- 진짜 병목은 사용자 본인이다. Anthropic 자체 실험에서 리드 에이전트가 여러 서브에이전트를 병렬 조율한 팀이 단일 에이전트보다 내부 리서치 평가에서 90% 이상 앞섰다. 서브에이전트는 자기 task 와 깨끗한 컨텍스트 창을 가진 별도의 Claude 라 context rot 벽에 안 부딪힌다.
- /goal 은 완료 조건(finish line)을 걸면 Claude 가 조건을 만족할 때까지 턴을 반복한다. 핵심은 매 턴 done=true 인지 판정하는 별도의 평가 모델이 있다는 것 — Claude 가 스스로 "끝" 이라 선언하지 못하고 worker 와 judge 가 분리된다.
- 네 업그레이드는 쌓인다: 아이디어 검증(roast) → 자기 작업 검증 → 컨텍스트 관리 → 서브에이전트+/goal 로 병렬화. 사용자는 빌더·생산자에서 의사결정자·리뷰어·판정자로 역할이 바뀐다.

## 용어
- **sycophancy (아첨)** [하니스 · 패턴]: AI 가 반박 없이 사용자에게 동조하는 yes-man 경향. 긴 대화·개인화에서 심해진다.
- **context rot** [컨텍스트 · 캐시]: 대화가 길어질수록 모델 성능이 떨어지는 현상. 창이 다 차기 전부터 시작된다.
- **sub-agent** [하니스 · 패턴]: 자기 task 와 깨끗한 컨텍스트 창을 가진 별도의 Claude. 병렬로 일하고 메인 세션에 보고한다.
- **/goal** [하니스 · 패턴]: 완료 조건을 걸면 별도 평가 모델이 매 턴 done 여부를 채점하며 조건 만족까지 루프하는 커맨드.
- **session handoff** [컨텍스트 · 캐시]: /clear 전에 결정·핵심 파일·다음 진입점을 요약해 새 세션으로 무손실 인계하는 커스텀 스킬.
- **Playwright CLI** [도구 통신 (MCP · CLI · API)]: 브라우저를 실제로 열어 스크린샷·클릭·폼 제출하는 컴퓨터 유즈 검증 도구.
- **definition of done** [워크플로우 · 문화]: AI 가 스스로 완료를 선언하기 전 충족해야 할 객관적·검증 가능한 완료 기준.
- **one-shot prompt** [하니스 · 패턴]: 한 번의 프롬프트로 결과를 받는 방식. 보통 65% 수준까지만 도달한다는 한계 지적.
