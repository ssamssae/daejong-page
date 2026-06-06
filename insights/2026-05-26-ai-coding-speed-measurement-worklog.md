---
source_type: article
source_url: ./worklog-source/2026-05-26_v1.0.0.md
source_author: 강대종
source_channel: worklog
source_title: AI 코딩 속도 측정 (인사이트 d안)
source_published: 2026-05-26
consumed_at: 2026-06-06
tags: [ai-coding, worklog, productivity, measurement, shipping, claude-code]
---

# AI 코딩 속도 측정 — 체감이 아니라 ship 으로 본다

## 한 줄 요약
일주일 worklog로 보면 AI 코딩은 "빨라진 느낌"보다 실제 ship 속도와 PR 성과로 재야 한다. 체감은 쉽게 부풀고, 속도 판단은 PR 수·완료율·사이클 타임 같은 실측으로만 의미가 있다.

## 출처 메타
- 원본: `worklog-source/2026-05-26_v1.0.0.md`
- 시점: 2026-05-26 worklog 항목
- 분류: 내부 회고 메모를 공개 인사이트로 재정리

## 픽업
- AI 코딩은 손이 빨라지는 게 아니라 "결정이 덜 마찰나는 것처럼 보이는" 효과를 먼저 준다. 그래서 체감 속도는 실제 생산성과 쉽게 어긋난다.
- 비교 기준은 감각이 아니라 산출물이어야 한다. 한 주 동안 ship 한 PR 수, feature 완료 수, rework 비율, 막힌 시간 같은 지표가 있어야 전후 비교가 된다.
- 이 관찰은 "도구가 좋아졌다"는 얘기보다 "내 작업 루프가 더 매끈해졌는지"를 묻는 쪽에 가깝다. AI 도구 사용량이 늘어도 결과가 안 늘면 속도 향상은 착시다.
- 따라서 AI 도입 효과 측정은 전후 1주씩 최소한의 로그만 남겨도 된다. 로그가 없으면 기억은 편향되고, 체감은 거의 항상 과대평가된다.

## 적용
- AI 도구 사용 전후로 `PR 수`, `merged count`, `cycle time`, `rework ratio` 4개만 기록하면 충분하다.
- "오늘 빨랐나" 대신 "이번 주 ship 이 늘었나"를 묻는다.
- 속도 개선이 실제로 나오면 다음 단계는 더 빠른 생성이 아니라 더 적은 rework와 더 짧은 reviewer wait 를 만드는 것이다.

## 용어
- **체감 속도** [워크플로우 · 문화]: 작업이 빨라진 것처럼 느끼는 주관적 인상.
- **실측 속도** [워크플로우 · 문화]: PR/feature/사이클 타임 같은 산출 기준으로 측정한 실제 속도.
- **cycle time** [지식 · 컨텍스트 자산]: 하나의 작업이 시작에서 완료까지 걸리는 시간.
