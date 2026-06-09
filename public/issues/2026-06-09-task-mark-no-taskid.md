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
- **D. 진행 중 task ↔ PR drift 감지** (2026-06-09 ep33 재발 후 추가) — B/C 는 "완료→`[x]`" 를 잡지만, **진행 중(`[ ]`/`[~]`) task 의 details 가 실제 PR 상태(제목/번호/머지)와 어긋난** 경우는 못 잡는다. task details 가 `PR #N` 을 참조하면 그 PR 의 현재 제목/머지여부를 대조해 drift 시 surface (stale-reconcile.py 확장). forcing 짝 = task 브랜치에 push 하는 주체(노드/오케스트레이터)가 details 도 같이 갱신.

- **막을 코드/훅:** `hooks/taskid-link-prepush-warn.sh` (B안, PR #117 머지, T-260609-32 — 노트북 canary, warn-only). A(T-260609-33)·D 는 본진 결재 후 추가, 5노드 롤아웃은 맥미니 리뷰 게이트.

## 재발 이력
- 2026-06-09 (같은 날 2번째 사례, **진행 중 변종**): ep33 재배정 커밋 `88f9010`(daejong-page, T-260606-03 브랜치)이 ① 커밋 메시지에 T-ID 미박힘 ② tasks.md L312 details 미갱신 → details 가 "ep32 충돌, 재배정 필요" 로 stale 잔존. PR #184 제목·파일은 이미 ep33 인데 task 기록만 옛 상태 → 노트북이 stale details 읽고 ep33 재배정을 "할 일" 로 오판(git pull + verify 로 중복 실행은 차단). 1차 사례(T-260607-02 아이콘=완료 `[x]` 누락)와 같은 뿌리(T-ID 미링크)지만, 이건 **완료가 아닌 진행 중 task 의 details↔PR drift** 변종 → 예방 D 추가.

## 관련 링크
- 커밋(미연결 사례): `ssamssae/lotto-calc@484ffda` (PR #22)
- 자동 sweep: `~/claude-automations/scripts/stale-reconcile.py`
- 메모리: `memory/feedback_auto_mark_todos_after_pr_merge.md` (본진-only 수동 폴백) · `memory/project_stale_sync_architecture.md` · `memory/feedback_anti_stale_lifecycle.md` · `memory/feedback_multiphase_task_registration.md` (자매 갭: task 미생성)
- 관련 task: T-260607-02 (1차 사례) · T-260606-03 (2차 재발, ep33 `88f9010`) · T-260609-32 (B안 canary) · T-260609-33 (A안 배선) · T-260609-30 (push→pull, A 흡수 후보)
- 텔레그램: 2026-06-09 22:16 KST "왜 아이콘 task 알아서 안 닫았냐" 흐름
