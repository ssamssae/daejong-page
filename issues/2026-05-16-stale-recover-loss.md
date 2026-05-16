---
prevention_deferred: null
---

# fleet-state stale-recover 가 5분 cron cycle 마다 작업자 commit 까지 origin/main 으로 reset

- **발생 일자:** 2026-05-16 11:48 KST (commit dd69be8 직후, 본진 launchd 다음 fire)
- **해결 일자:** 2026-05-16 11:55 KST (launchctl bootout + reset --hard dd69be8 + force-free push + PR #5)
- **심각도:** high (작업자 commit 분실 + 5분 주기 자동 재현 + 작업자 detection 없음)
- **재발 가능성:** high (root cause 미해결, 본진/Mac mini launchd 작업자 commit 위에 있는 동안 매 cycle 재현 가능)
- **영향 범위:** fleet-state repo + 본진/Mac mini launchd 가 동작 중인 모든 작업자 워크플로우

## 증상

fleet-state cron-template 갱신 PR 작업 도중, 본진에서 작업자 commit dd69be8 (3 files +55/-1) 생성 직후 launchd-macbook (5분 cycle) 가 fire. reflog 보니 commit 직후 reset 6번 연속:

```
HEAD@{0}: reset: moving to origin/main
HEAD@{1}: commit: cron-template: stdout redirect /tmp/cron-<node>.out 으로 통일 ...
HEAD@{2}: checkout: moving from main to mac/cron-template-tmp-redirect-2026-05-16
HEAD@{3}: reset: moving to origin/main
...
```

local working tree + branch HEAD 둘 다 origin/main 으로 되감김. `git push` 는 reset 후 시점이라 origin tip = e406f7b 그대로, `gh pr create` 시도 "No commits between main and \<branch\>" 실패. 새 파일 (`scripts/desktop3060ti-cron-template.txt`, `scripts/notebook3060-cron-template.txt`) 도 working tree 에서 사라짐.

## 원인

`scripts/lib/stale-recover.sh::recover_stale_claims` 가 `git status --porcelain | grep '^.. (claims/|log/)'` 패턴 매칭 시 `release_losing_recover` 호출 → working tree + HEAD 모두 origin/main 으로 reset. 작업자가 같은 repo 에서 commit 작성 중이어도 detection 없이 dirt 전체 처리. cron 5분 주기로 영구 fire.

본 사고의 trigger 는 본진 launchd-macbook.plist 의 StandardOutPath/Err 가 `~/agent-fleet-state/log/launchd-macbook.{out,err}` 로 redirect 된 것 — 매 fire 마다 untracked dirt 생성 → stale-recover 가 매번 release 호출 → 위에 있던 작업자 commit 까지 reset. cron stdout redirect 가 git tracked dir 안에 있는 self-perpetuating dirt 함정 (WSL 도 동일 패턴이었으나 작업자 commit 위에 없어 가시화 안 됨).

## 조치

1. `launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.fleetdirector.macbook.plist` — 본진 launchd 일시 unload (가역)
2. `git reset --hard dd69be8` — reflog 의 commit 복구, working tree + HEAD 같이
3. `git push origin mac/cron-template-tmp-redirect-2026-05-16` — origin tip 갱신, fast-forward (force 불필요)
4. `gh pr create` → PR #5 (https://github.com/ssamssae/fleet-state/pull/5)
5. PR #5 squash 머지 → main a82a18f
6. 본진 plist `StandardOutPath`/`StandardErrorPath` 키 값을 `~/agent-fleet-state/log/launchd-macbook.{out,err}` → `/tmp/launchd-macbook.{out,err}` 로 Edit 갱신 (root cause = log/ 경로 redirect 이 untracked dirt 생성)
7. `log/launchd-macbook.{err,out}` rm + working tree `git status` clean 확인
8. `launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.fleetdirector.macbook.plist` → fleet-director 복귀

## 예방 (Forcing function 우선)

1. **stale-recover 가 release_losing_recover 호출 전 HEAD ahead 체크** — `git rev-list --count origin/main..HEAD` 결과 > 0 이면 (작업자 commit 위에 있음) release 거부 + log 후 return 0. dirt 는 작업자가 정리할 거란 가정. fleet-director D08 root cause fix. **1순위 forcing function**.
2. **cron/launchd stdout redirect 를 git tracked dir 밖으로** — 본 사이클에서 이미 fix 완료 (WSL crontab `/tmp/cron-wsl.out` + 본진 plist `/tmp/launchd-macbook.{out,err}`). fleet-state source plist + `install-launchd.sh` SoT 동기화는 D08 follow-up PR.
3. **작업자 workspace lock** — fleet-state worker (`run-worker.sh`) 가 시작 시 `.working-dir-lock` 또는 sentinel 체크. 작업자가 작업 중일 때 touch → worker skip. (1) 보다 약한 forcing function 이라 backup.

## 재발 이력

(처음 생성 시 비워둠)

## 관련 링크

- commit (잃었다 복구): `dd69be8` (fleet-state)
- PR: https://github.com/ssamssae/fleet-state/pull/5
- 머지 SHA: `a82a18f` (main, squash)
- 텔레그램: 사고 surface msg_id 17964, (B) ack msg_id 17970, OK ack msg_id 17977
- family: `2026-05-12-fleet-state-tests-auto-push-leak.md` (fleet-state design 결함이 작업자 작업물에 damage 주는 family)
- 메모리: 없음 (forcing function (1) 채택되면 `feedback_*` 메모리 추가 검토)
