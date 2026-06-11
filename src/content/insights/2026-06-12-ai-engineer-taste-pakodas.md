---
title: "How to Be a 30x AI Engineer with a Taste"
date: "2026-06-12"
source_url: "https://pakodas.substack.com/p/how-to-be-a-30x-ai-engineer-with-a-taste"
source_author: "Pratik Bhavsar"
---

# How to Be a 30x AI Engineer with a Taste — Pratik Bhavsar (Substack)

## 한 줄 요약
AI가 코드를 생성하는 시대에 엔지니어를 차별화하는 건 'taste(내적 평가 함수의 품질)'이며, 저자는 이를 recognition·compass·vision 세 형태로 나누고 3개월 훈련법·모델 주도 개발 습관·커리어 재배치로 키우는 법을 제시한다.

## 출처 메타
- URL: https://pakodas.substack.com/p/how-to-be-a-30x-ai-engineer-with-a-taste
- 매체: Substack (pakodas.substack.com)
- 저자: Pratik Bhavsar
- 수집일: 2026-06-12 KST (🪟 라이덴이 본문 fetch 후 요약)

## 픽업
- taste는 "내적 평가 함수의 품질"이며, 코드 생산 비용이 0으로 수렴하는 시대의 차별화 요소다. recognition(좋은 걸 알아봄)·compass(왜 한쪽이 더 나은지 분간)·vision(처음부터 설계)의 세 형태로 나뉜다. "taste가 더 좋은 사람보다 두 배 열심히 일하고도 절반의 가치를 낼 수 있다."
- taste는 3개월에 걸쳐 단계적으로 키운다. 1개월 recognition: 존경하는 개발자 툴 10개와 논문 10개를 깊이 뜯어보며 첫인상·감탄·혼란·차용할 결정을 기록. 2개월 compass: 주 1회 두 구현을 나란히 놓고 왜 한쪽이 나은지 '취향'이 아니라 '메커니즘'으로 500자 서술, 매일 창작자의 결정 하나를 골라 "왜 뻔한 대안 대신 이걸?"이라 묻기. 3개월 vision: 소유한 것을 재설계하고, 제1원리로 시스템을 설계하고, 자신의 taste를 남이 따를 수 있는 문서·시스템으로 인코딩.
- 모델 릴리스마다 코드를 지운다 — "새 모델이 나올 때마다 우리는 코드를 왕창 삭제한다. 모델 주위에 코드를 최대한 적게 두려 한다" (Boris Cherny, Claude Code).
- 평가의 대상이 바뀐다 — 생성된 코드가 아니라 '프롬프트'를 리뷰하고, AI가 만든 PR에는 그 프롬프트를 함께 첨부하게 한다. 리뷰는 계층화한다: 비핵심 코드는 AI 리뷰만, 핵심 로직은 사람 리뷰를 필수로.
- 에이전트 시스템은 도입 비용이 있어도 sandbox 모드를 디폴트로 둔다.
- 커리어를 taste 쪽으로 재배치한다 — 코딩 속도 경쟁을 멈추고 인접 역량(제품 사고·디자인·비즈니스 이해)에 투자하며, taste가 결과에 직접 닿는 역할(파운딩 엔지니어·테크리드·플랫폼/스태프+ 엔지니어)을 고르고, taste를 보여주는 공개 포트폴리오를 쌓는다.
- 지금이 변곡점이라는 신호로 인용 — Malte Ubl(Vercel CTO) "소프트웨어 생산 비용이 0으로 수렴 중", Andrej Karpathy(2025.12) "프로그래머로서 이렇게 뒤처진 느낌은 처음이다. 이 직업이 극적으로 리팩토링되고 있다", 그리고 글의 결론 "taste는 늘 그 일이었다. 우리가 그걸 코드 안에 숨겨왔을 뿐이다."

## 용어
- **Taste** [워크플로우 · 문화]: 결과물의 품질을 스스로 판별하는 '내적 평가 함수의 품질'. recognition·compass·vision 세 형태로 나뉜다.
- **Recognition / Compass / Vision** [워크플로우 · 문화]: taste의 세 형태 — 좋은 걸 알아봄 / 왜 한쪽이 나은지 분간 / 처음부터 설계함.
- **Evaluation function (내적 평가 함수)** [워크플로우 · 문화]: 저자가 taste를 정의하는 방식 — 어떤 산출물이 좋은지 판단하는 내부 기준.
- **Sandbox mode** [하니스 · 패턴]: 에이전트를 격리 환경에서 실행해 시스템에 부작용을 못 내게 하는 디폴트 안전 설정.
- **Tiered review (계층형 리뷰)** [워크플로우 · 문화]: 코드 중요도별로 리뷰 강도를 나눔 — 비핵심은 AI 리뷰, 핵심 로직은 사람 리뷰 필수.
- **Prompt-with-PR** [하니스 · 패턴]: AI 생성 PR에 그것을 만든 프롬프트를 첨부해 리뷰 맥락으로 삼는 관행.
