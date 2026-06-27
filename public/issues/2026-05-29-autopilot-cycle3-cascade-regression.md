---
date: 2026-05-29
node: 🪟 WSL (draft) · 🍎 본진 review 펜딩
title: 5 노드 SDK skew 가 만든 3-회차 cascade 회귀 (PR #23 → #28 → #34 → #39)
tags: [autopilot, sdk-skew, cascade-regression, flutter, onreorder, memoyo]
---

# 5 노드 SDK skew 가 만든 3-회차 cascade 회귀 (PR #23 → #28 → #34 → #39)

야간 오토파일럿 사이클 #1~#7 (2026-05-29 새벽) 메모요 1.0.7 cycle 에서 같은 root cause 가 세 PR 에 걸쳐 forward/backward 양방향 회귀를 만든 사고. PR 4개 / 23h 전체 추적.

## Cascade 타임라인

| 사이클 | PR | 브랜치 | 변경 | 사용 SDK 추정 | 회귀 방향 | 잡힌 시점 |
|---|----|--------|------|--------------|-----------|-----------|
| #1 | #23 | wsl/memoyo-107-undo-snackbar-2026-05-29 | `onReorderItem: _onReorderFav/Normal` | 본진/WSL 3.44.0 (A 그룹) | — | 머지 후 노트북 (3.41.9, B 그룹) analyze 가 4 errors `missing_required_argument` + `undefined_named_parameter` catch |
| ~ | #28 | mac/memoyo-107-undo-snackbar-2026-05-29 (본진 직접 또는 노트북 작업 추정) | `onReorderItem` → `onReorder` (deprecated 옛 API) | 3.41.9 (B 그룹) 위 PASS | **A→B fix 가 deprecated 회귀** | 본진 3.44.0 위 info-level deprecation surface, 사이클 #7 audit 가 패턴화 |
| ~ | #34 | mac/memoyo-107-reorder-callback-safety-2026-05-29 | `reorderable.onReorder(0, 1)` 직접 호출 테스트 추가 | 3.41.9 (B 그룹, non-null 시그너처) PASS | **B → A nullable 회귀** | 사이클 #7 본 audit PR 의 merge-gate (3.44.0) rc=1 발견 |
| ~ | #39 | mac/... (본진 fix) | `reorderable.onReorder!(...)` (bang) | 3.44.0 PASS | A→B fix | 사이클 #8 ack 시점 머지 완료 |

3번의 회귀 사이에 매번 fix PR 1개씩 추가. 메모요 1.0.7 cycle 23h 안 4 PR (1 + 3 fix).

## Root cause 확정

`~/flutter` repo 의 commit `3e6c2071664 Deprecate onReorder callback (#178242)` (Navaron Bracke, 2026-01-29).

- 변경: `onReorder` deprecated + 시그너처 `ReorderCallback` (non-nullable) → `ReorderCallback?` (nullable). 새 `onReorderItem` named arg 도입.
- 첫 포함 stable: **3.42.0-0.0.pre**

5 노드 SDK audit (본진 ssh 1회):
- 🍎 본진 / 🪟 WSL = 3.44.0 (A 그룹, 변경 포함)
- 🏭 맥미니 / 💻 노트북 = 3.41.9 (B 그룹, 변경 미포함)
- 🖥 데스크탑 = flutter 없음 (C 그룹)

A/B 그룹 간 3 minor 차이가 forward-incompatible API + nullable 시그너처 둘 다 만들어, 같은 위젯 호출이 그룹마다 다른 결과:

```
B 그룹 (3.41.9)            A 그룹 (3.44.0)
─────────────────          ─────────────────
onReorder: required        onReorder?  nullable
onReorderItem: undefined   onReorderItem: valid
direct .onReorder(...)     direct .onReorder(...)  ← ERROR
   PASS                       unchecked_use_of_nullable_value
```

→ 각 PR 이 작성된 노드의 SDK 위에서는 PASS, 다른 그룹 위에서는 회귀. cascade.

## 왜 게이트가 못 잡았나

`~/claude-skills/autopilot/merge-gate.sh` 가 1 SDK 위에서만 `flutter analyze` 호출. 그 1 SDK 가 PASS = 게이트 PASS = main 머지. 다른 그룹 SDK 회귀는 머지 후 별 노드 analyze 가 catch → fix PR → 같은 패턴 반복.

5 노드 SDK 다양성이 정보 자원 이긴 한데, 게이트가 활용 안 함. **strict 노드 (B 그룹) 가 사실상 사후 회귀 catch 기로 운영되는 상태**.

## 해결 방향

본 사이클 #6 의 [[../specs/5node-flutter-sdk-policy-brainstorm.md]] v2 가 옵션 3 안 비교 + 디폴트 픽 = **옵션 3 v2 (B 그룹 2 노드만 cron audit)** 강화.

- v1 옵션 확정 후속 = 형님 ack + trio-vote / mesh-vote.
- B 그룹 SDK 업그레이드 (3.42.0+) → forward migration (`onReorder → onReorderItem`) 묶음 PR.
- 본 사이클 결과로 SDK 정책 v1 시급성 강화 (단순한 docs 자산이 아니라 메모요 cycle 비용 직접 영향).

## 재발 방지 룰 후보

- 메모리 신규: [[../../projects/-home-ssamssae/memory/feedback_5node_sdk_skew_cascade_regression.md]] — 5 노드 SDK skew cascade 가 cycle 비용 직접 만든다, SDK 정책 v1 우선순위 상승.
- ack 4티어 변경: "merge-gate 자체 호출 rc=0" 단일 노드 기준 → 본진/B 그룹 cross-check 옵션 강제 (옵션 2 v2 진입 시).
- audit 자동화: cron audit 인프라 (옵션 3 v2) 가 mesh-report 채널 으로 회귀 신호 즉시 surface.

## 관련 PR / 사이클 references

- PR #23 (UNDO 스낵바), PR #28 (회귀 fix), PR #34 (reorder 콜백 안전망 테스트), PR #39 (nullable bang fix)
- PR #33 (SDK 정책 v1 draft), PR #35 (SDK 정책 v2 audit), PR #37 (deprecated API audit + §8 cascade 재현 발견)
- Flutter commit `3e6c2071664` (~/flutter), Flutter PR #178242

## 사고 카테고리

infrastructure / forcing function 부족 — SDK 다양성을 정보 자원으로 활용하지 못하고 사후 회귀 catch 기로 운영. 단일 PR 가치 평가 자체는 정상 (각 PR 자기 노드 위에서 PASS) 인데 mesh 차원에서 cascade.
