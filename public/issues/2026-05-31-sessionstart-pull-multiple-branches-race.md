# SessionStart pull 실패 — "Cannot rebase onto multiple branches" (automations)

- **날짜**: 2026-05-31 12:38 KST
- **노드**: 🍎 본진 (<mac-host>)
- **증상**: SessionStart hook(`session-start-git-pull.sh`)이 automations repo 에서
  `fatal: Cannot rebase onto multiple branches.` 로 실패, 텔레그램에 pull 실패 1통 발사.

## 진단

- 직후 수동 `git pull --rebase --autostash` → `ok (up-to-date)`. 재현 안 됨 = 일시적.
- `branch.main.merge` = `refs/heads/main` 단일 (정상). `branch.mac/*` 잔재 추적 config 는
  옛 로컬 브랜치용이라 main pull 과 무관 (무해 clutter).
- 원인 = **동시 fetch race**. SessionStart 때 automations repo 에 여러 hook
  (sync-health, posttooluse-sync-automations 등)이 동시에 fetch/pull. 한 프로세스의
  fetch 가 `remote.origin.fetch = +refs/heads/*` 로 FETCH_HEAD 에 전체 브랜치를
  쓰는 동안 pull 프로세스가 중간 상태를 읽으면 여러 for-merge 라인이 보여
  "Cannot rebase onto multiple branches" 발생. 2026-05-25 에 처리한 "cannot lock ref"
  race 의 형제 케이스.

## 조치

- `session-start-git-pull.sh` retry 가드 grep 패턴에 `Cannot rebase onto multiple branches`
  추가 → lock-ref race 와 동일하게 sleep 2 후 1회 silent retry. retry 도 실패면 알림 발사.
- 최소 surgical 변경 (Karpathy 룰 #3). 기존 retry 블록 로직 그대로, 패턴만 확장.
