---
date: 2026-05-29
node: 🪟 WSL (draft) · 🍎 본진 review 펜딩
title: 사이클 #1 OAuth fix rebase directive — archive 핸드오프 메모만 보고 PR 실제 범위 verify 누락
tags: [autopilot, directive, stale-assumption, karpathy-rule-1, verify-before-directive]
---

# 사이클 #1 OAuth fix rebase directive — archive 핸드오프 메모만 보고 PR 실제 범위 verify 누락

야간 오토파일럿 사이클 #1 (2026-05-29 새벽 진입 직전 또는 직후 추정) 에 본진이 메모요 1.0.7 OAuth fix 관련 rebase directive 를 발사할 때 archive 핸드오프 메모 / 직전 메모리 만 보고 결정. 맥미니가 surface — directive 가 실제 PR 범위와 어긋남.

## 사고 시점

본 issue 작성 시점 (사이클 #8) 에 본진이 정확한 사이클 번호와 PR 번호를 surface 했지만 WSL 측은 archive 직접 접근 못 함. **본 issue 는 본진 directive 작성 시점의 fact 만 박고, root cause 패턴 자체에 집중**.

## 사고 패턴

```
[본진 archive 핸드오프 메모]  →  본진 directive 작성  →  맥미니/WSL 실행
            ↑ stale
            │
            └── verify 누락: 실제 PR 의 origin/main vs target branch diff 1회 X
```

본진이 archive 핸드오프 메모 (직전 사이클 1줄 요약) 만 신뢰하고 directive 본문 작성. 그 메모에 명시된 "PR #N 의 범위" 또는 "X 가 fix 됐다" 단정이 **실제 PR diff 와 어긋남** — 맥미니가 directive 본문 보고 실행 시도 후 surface ("이거 X 가 빠져있는데요" 또는 "PR 이 명시된 fix 안 들어있어요").

Karpathy 룰 #1 (가정 명시 / Think Before Coding) 위반 — **본인 컨텍스트 stale 가능성 가정** 단계 빠짐. step 0 = `git fetch origin && diff origin/main..<target-branch>` 1회로 실제 fact 확보 후 directive 작성해야 함.

## 같은 패턴의 이전 사고와의 관계

본 사이클 archive 의 비슷한 사고 패턴:

- [[2026-05-23-stale-on-stale-context.md]] (가정) — 본진 컨텍스트 stale + git pull 단계 0 → 형님 발화 misroute (메모리 [[feedback_stale_check_before_recommend]] 의 사고 출처)
- 본 OAuth 사고는 같은 stale-on-stale 패턴의 **directive 작성 단계** 변형. 차이 = 형님 발화 응답이 아니라 자동 directive 발사라 잡힘 시점이 더 늦음 (맥미니가 surface 해야 발견).

## 근본 차이 — 본인 컨텍스트 vs archive 핸드오프 메모

- archive 핸드오프 메모 = 직전 사이클 자기 자신이 박은 1줄 요약 → 그 시점 가설 / 의도일 뿐, **현재 git fact 가 아님**
- 본진 directive = 미래 노드 실행 컨텍스트 → fact 기반 의무
- 둘 사이에 verify 1회 (git fetch + diff) 없으면 archive 의 가설이 directive 본문에 그대로 박힘

## 재발 방지 룰 후보

신규 메모리: [[../../projects/-home-ssamssae/memory/feedback_verify_pr_scope_before_directive.md]] — directive 박기 전 `git fetch origin + diff origin/main..<target>` 1회 의무. archive 핸드오프 메모는 컨텍스트 hint 일 뿐, fact 가 아님.

ack 4티어 변경: 본진 directive 발사 시 "PR <N> 의 실제 변경 범위 verify 완료" 단계 추가 — 발사 전 확인 1줄.

## 사고 카테고리

human factor / directive 작성 단계 verify 누락. Karpathy 룰 #1 (가정 명시) 위반의 directive 작성 단계 변형. archive 메모 wholesale 신뢰가 본질.

## 본 issue 의 한계

- 본 issue 는 본진 directive 본문에서 정정 ack 받은 fact 만 박음 — 본진이 사이클 #8 본 directive 본문에서 "사이클 #1 본진 OAuth fix rebase directive 가 archive 핸드오프 메모만 보고 PR #14 실제 범위 verify 안 한 사고. macmini 가 surface" 라고 명시. WSL 측은 본진 archive 직접 접근 0 — 본진이 본 draft review 시 (a) PR 번호 / (b) directive 본문 / (c) 맥미니 surface 본문 추가 필요.
