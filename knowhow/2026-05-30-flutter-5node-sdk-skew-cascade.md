---
title: "5노드 Flutter SDK skew (3.41 ↔ 3.44) 가 만드는 forward/backward 회귀 cascade"
tags: [flutter, sdk-skew, multi-node, regression, reorderablelistview, merge-gate, deprecation]
date: 2026-05-30
---

# 5노드 Flutter SDK skew (3.41 ↔ 3.44) 가 만드는 forward/backward 회귀 cascade

여러 기기가 같은 Flutter repo 를 만지는데 SDK 버전이 다르면, 한 기기에서 PASS 받은 PR 코드가 다른 기기 SDK 위에서 회귀한다. **단일 노드의 merge-gate PASS(rc=0) 하나만 믿으면 안 된다.**

## 증상

- A 그룹(Flutter 3.44.0)에서 작업 → A 위 PASS → 머지 → B 그룹(3.41.9) 노드의 analyze 가 forward-incompatible API 를 잡아 회귀.
- B 그룹에서 작업 → B 위 PASS → 머지 → A 그룹 노드가 deprecated alias / nullable 시그너처 차이를 잡아 회귀.
- fix PR 도 같은 패턴을 반복해서 한 사이클에 3개 PR 이 나온다(메모요 1.0.7 의 PR #23 → #28 → #34 → #39).

## 원인

Flutter 3.42(commit `3e6c2071664`)가 `ReorderableListView` 의 `onReorder` 를 deprecate 하면서 시그너처를 nullable 로 바꾸고 새 `onReorderItem` API 를 도입했다. 구 stable 3.41.9 엔 이 변경이 없고 3.42.0+(3.44.0 포함)에만 있다. 그래서 **같은 위젯 호출이 SDK 버전에 따라 valid 여부가 갈린다**. 단일 SDK 위에서 도는 게이트는 이 mesh 차원의 회귀를 구조적으로 못 잡는다. forward-compatible 진화가 잦은 Flutter 진영에서 SDK skew 는 곧바로 사이클 비용이 된다.

## 해결 / 대응

- 본진 게이트가 PASS 했다고 다른 노드도 PASS 라고 가정하지 않는다. 특히 3.42~3.44 사이 deprecation 을 받은 API — `ReorderableListView` · `Color.withOpacity` · `Tooltip` · `InputDecoration` · `Switch` · `RadioListTile` — 를 만질 때.
- 신규 PR 은 두 그룹 SDK 위에서 모두 통과하는 코드를 선호한다 — dual-callback 이나 nullable-aware 호출(`!` / `?.call()`).
- `onReorderItem` 같은 3.42+ 신규 forward API 는 전 노드 SDK 통일 또는 구 그룹 업그레이드 후에만 안전하게 쓴다.
- deprecated 옛 API 로 되돌리는 backward fix 는 단기 봉합일 뿐 — 미래 Flutter major 에서 `onReorder` 가 완전히 제거되면 다시 회귀한다.

## 재발 방지

근본 해결은 SDK 통일(fvm 핀)이거나, merge-gate 가 두 SDK 그룹을 모두 cross-check 하도록 강화하는 것이다. 게이트 정책이 확정되기 전까지는 cycle 마다 cascade 회귀 위험이 남으므로, 위 deprecation 목록의 위젯을 건드리는 PR 은 strict 그룹(구 SDK) 노드의 analyze 를 한 번 더 거치게 한다.
