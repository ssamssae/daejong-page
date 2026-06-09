---
prevention_deferred: "2026-06-16"
---

# 수동큐 task가 T-ID를 커밋에 안 박아 자동 [x] sweep이 못 닫음

- **발생 일자:** 2026-06-09 10:43 KST (PR #22 머지) ~ 21:57 KST (아니키 발견)
- **해결 일자:** 2026-06-09 21:57 KST (본진 수동 [x] 마킹)
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** tasks.md 마킹 라이프사이클 / 수동큐→노드 디스패치 / `stale-reconcile.py` 자동 sweep

## 증상
T-260607-02(로또계산기 런처아이콘) PR #22가 머지 + 아니키 비주얼 PASS 까지 끝났는데도 tasks.md 항목이 `[?]` ack-pending 에 그대로 멈춰 있었다. 아니키가 "왜 아이콘 task 알아서 안 닫았냐"(2026-06-09 21:57 KST) 물을 때까지 `[x]` 로 전환되지 않음.

## 원인
결정론 자동 sweep(`~/claude-automations/scripts/stale-reconcile.py`)은 **origin 에 push 된 커밋 메시지의 task-ID(`T-YYMMDD-NN`)** 로 열린 task 를 닫는다. 그런데 이 task 는 **수동큐(q-1780999236-…)** 로 노드에 내려왔고, 큐 디스패치가 매핑된 `T-260607-02` 를 노드에 넘겨주지 않았다. 그래서 노드(💻)가 브랜치를 설명형(`notebook3060/lotto-icon-2026-06-09`)으로 짓고, 커밋·squash 머지 커밋(`484ffda`)에도 T-ID 를 안 박았다 → sweep 이 머지를 task 에 연결할 고리가 없음 → 자동 close 실패.

보강 요인:
1. **수동 폴백이 본진-only** — `feedback_auto_mark_todos_after_pr_merge` 는 본진(Mac)이 PR 보고 직접 마킹하는 흐름이라, 본진이 알아챌 때까지 누락.
2. **`[?]` ack-gate** — task 가 `[?]` 였던 건 자동생성 아이콘+라이브앱이라 비주얼 ack 게이트였기 때문. 사람 ack 가 텔레그램에서 일어나 커밋 시그널이 없어, ack 후에도 `[x]` 로 옮길 자동 경로 부재.

대조군: 디렉티브로 내려온 T-260606-03 은 디렉티브가 `notebook3060/T-260606-03-2026-06-09` 브랜치를 명시해 T-ID 가 정상 링크됨 → 수동큐 경로만의 갭.

## 조치
아니키 ack "닫아"(2026-06-09 21:57 KST)로 본진이 tasks.md L308 `[?]` → `[x]` 수동 마킹 + 근거(PR #22 / squash `484ffda` / 비주얼 PASS) inline 기록. 자동화 자체는 미수정(아래 예방으로 분리).

## 예방 (Forcing function 우선)
재발방지 아키텍처 2레이어 (결정론, 비용 0). 진행 중인 T-260609-30(push→pull 전환)·stale-sync 와 겹쳐 **본진 거버넌스 결재 후** 구현 (노드 단독 5노드 훅 구축 X).

- **A. 디스패치가 T-ID 운반** — 수동큐 item 이 tasks.md task 에 매핑되면 `manual-dispatch.sh` 가 디렉티브에 T-ID 를 실어 보내고, 노드는 `<node>/T-ID-날짜` 브랜치 + 커밋/PR 제목에 T-ID 박기 의무 (디렉티브엔 이미 있는 관례를 큐 경로로 확장). 마킹 누락 1차 원인(링크 부재) 제거.
- **B. pre-push 경고 훅** — `<node>/...` 브랜치가 추적 task 커밋을 `T-\d{6}-\d+` 도 `[no-task]` 마커도 없이 push 하면 경고 surface (머지 전 누락 감지).
- **C. (옵션) `[?]`→`[x]` ack-resolve** — `stale-reconcile.py` 는 링크된 push 커밋에 `[?]` 도 닫지만, ack-gate `[?]` task 의 PR 이 MERGED 면 silent 잔존 대신 본진 ack-close 후보로 surface.

- **막을 코드/훅:** `none` (deferred 2026-06-16 — 본진 결재 후 A/B 구현)

## 재발 이력
<처음 생성>

## 관련 링크
- 커밋(미연결 사례): `ssamssae/lotto-calc@484ffda` (PR #22)
- 자동 sweep: `~/claude-automations/scripts/stale-reconcile.py`
- 메모리: `memory/feedback_auto_mark_todos_after_pr_merge.md` (본진-only 수동 폴백) · `memory/project_stale_sync_architecture.md` · `memory/feedback_anti_stale_lifecycle.md` · `memory/feedback_multiphase_task_registration.md` (자매 갭: task 미생성)
- 관련 task: T-260607-02 (마킹 누락 당사자) · T-260609-30 (push→pull 아키텍처, A/B 흡수 후보)
- 텔레그램: 2026-06-09 22:16 KST "왜 아이콘 task 알아서 안 닫았냐" 흐름
