---
date: 2026-05-29
slug: desktop-cycle9-stale-main-prediction
severity: low (docs prediction 부정확, 코드/외부영향 0 — 사이클 #10 dogfood 시 main FF 후 verify 로 정정)
recurrence: medium (다른 baseline audit 사이클에 같은 함정 가능 — 일반화 룰 [[../memory feedback_baseline_audit_main_ff]] 박음으로 forcing function)
node: desktop3060ti
project: daejong-page/specs/8apps-version-footer.md (v1.2.2)
related:
  - feedback: feedback_baseline_audit_main_ff
  - feedback: feedback_dogfood_iterative_spec_refinement
---

## 사고 요약

2026-05-29 야간 오토파일럿 사이클 #9 (~02:30 KST) 데스크탑이 8 앱 footer 통일 spec v1.2.2 baseline audit 작성 시 `git fetch` 만 하고 `git pull --ff-only` 안 한 stale local main 기반으로 더치페이 row 부정확 박음. 다음 사이클 #10 (~02:35 KST) 더치페이 dogfood 시 main FF 후 verify 하니 prediction 과 실제 다름 → 정정 PR #149 (v1.3) 로 forcing function 룰화.

## 타임라인

- **사이클 #9 (~02:30 KST)** — 데스크탑 baseline audit. `cd ~/daejong-page && git fetch origin --prune` 한 후 prediction 표 작성. dutch_pay_calculator 도 같은 시점 audit. 로컬 main 은 이전 사이클 머지 시점 그대로 (fetch 만 한 상태) — origin/main 갱신 안 픽업.
- **사이클 #10 (~02:35 KST)** — 데스크탑 더치페이 dogfood 시작. `cd ~/dutch_pay_calculator && git fetch origin && git pull --ff-only origin main` 둘 다 실행. main HEAD 가 303e8b7 로 새로 들어옴. 이후 grep 으로 audit verify 결과:
  - prediction "AppColors X" → 실측 `lib/theme/app_theme.dart` 디렉토리 (textFaint `0xFF9CA3AF` 등 모든 토큰 존재)
  - prediction "theme.dart X" → 실측 디렉토리 존재
  - prediction "hintColor fallback 컬러 픽" → 실측 textFaint 매치 (약먹자와 동일 hex)
  - prediction "ads = body Column 마지막 child" → 실측 mid-body (line 464, 입력 → ads → 키패드)
- **사이클 #11 (~02:46 KST)** — 데스크탑 spec v1.3 PR #149 작성. 사후 정정 박스 + 더치페이 row 정정 + 메모요 row stale 의심 명시 + GC7 (baseline audit main FF 의무) + GC8 (B' broader 화) 룰 박음.

## 영향

- 영향 범위: docs only (`daejong-page/specs/8apps-version-footer.md` v1.2.2 baseline 표 4 row 중 1 row 부정확). 코드 / 외부영향 0.
- 사이클 #9 prediction 이 fan-out 시작 노드 (본진/맥미니/WSL) 한테 전달됐다면 더치페이 fan-out 시 "hintColor fallback + body 마지막 ads" 가정 → 실제 textFaint + mid-body 발견 → 작업 반복 + spec 신뢰 하락 사고 가능. 사이클 #10 dogfood 가 fan-out 전에 잡아냄 (dogfood 룰 [[../memory feedback_dogfood_iterative_spec_refinement]] 의 가치 입증).
- 메모요 row 도 사이클 #9 동시 audit, 같은 stale 위험 → spec v1.3 에 "재verify 필요" placeholder 박힘.

## 원인

직접: `git fetch` 만 실행 후 `git pull` 안 함. fetch 는 origin refs 만 업데이트, 로컬 main 브랜치 ref 는 그대로.

근본:
- 자동 룰 부재 — spec audit 단계 "main FF" 항목이 v1.2.2 spec 본문에 없었음 (v1.3 에서 step 0 으로 추가됨).
- 데스크탑 본인 메모리 부재 — 같은 함정 다음 사이클 재발 가능 위험.
- 사이클 #9 시점 "baseline audit 은 read-only 라 fetch 만으로 충분" 잘못된 직관 (실제로는 prediction 표 작성 자체가 main 기준 state-dependent).

## 해결

1. 사이클 #10 더치페이 dogfood 첫 단계로 main FF + 실측 verify (이미 함).
2. 사이클 #11 spec v1.3 PR #149 = 더치페이 row 정정 + 메모요 row stale 의심 명시 + GC7/GC8 룰 박음.
3. 사이클 #15 [[../memory feedback_baseline_audit_main_ff]] = 8 앱 footer 외 일반 prediction-style audit 룰로 일반화. 5 노드 sync 가능.

## 재발 방지

- spec v1.3 baseline audit 절차 step 0 = `git fetch + git pull --ff-only` 의무 (또는 `git grep origin/main` 워킹 트리 비건드림).
- 본진 fan-out 첫 단계로 메모요 baseline re-verify directive 권장 (v1.3 본문 명시).
- 메모리 entry forcing function — 다른 트랙 prediction-style audit 시 자동 적용.
- 사이클 #11 부터 데스크탑 본인 모든 spec PR 시작 시 main FF (GC7 본인 검증, 3 연속 사이클 #11/#12/#13/#14 시연).

## 비고

dogfood iterative refinement 룰 ([[../memory feedback_dogfood_iterative_spec_refinement]]) 가 사고를 fan-out 전 잡아냄 = "dogfood 한 번 = 7 노드 fan-out 한 번 보다 싸다" 입증. 한 번에 7 노드 fan-out 했으면 7 가지 다른 패턴 박혔을 위험 (특히 더치페이 B' 케이스).
