---
prevention_deferred: null
---

# SessionStart 훅 git pull --rebase race → Cannot rebase onto multiple branches

- **발생 일자:** 2026-05-19 01:29 KST
- **해결 일자:** 2026-05-19 08:50 KST
- **심각도:** medium
- **재발 가능성:** low (패치 후)
- **영향 범위:** 🏭 맥미니 SessionStart 훅 / claude-skills / claude-automations / daejong-page (5노드 모두 잠재 영향)

## 증상
01:29 KST 맥미니 SessionStart 훅에서 3 repo (claude-skills / claude-automations / daejong-page) 가 모두 `git pull --rebase --autostash` 로 "fatal: Cannot rebase onto multiple branches." 실패. 텔레그램에 실패 리포트 1통 (msg 4822). 7시간 뒤 강대종 확인 + 본진이 진단·수정.

## 원인
~/claude-skills/scripts/sync-health.sh (60~120초 주기 백그라운드 워커) 가 `git fetch` 박는 동안 SessionStart 훅의 `git pull --rebase --autostash` 가 같은 repo 의 FETCH_HEAD 를 동시 read/write 하면서 race. daejong-page 는 fetch refspec 이 `+refs/heads/*:refs/remotes/origin/*` (all-branches) 라 FETCH_HEAD 가 28줄짜리, race 윈도우가 특히 큼. 두 fetch 가 겹치면 FETCH_HEAD 가 일관성 깨진 상태에서 pull 이 multiple "for-merge" head 를 본 걸로 추정.

## 조치
본진이 `~/claude-skills/scripts/sync-health.sh:22` 에 `--no-write-fetch-head` 플래그 한 줄 추가 push (commit 9869c3f). 백그라운드 sync-health 의 fetch 가 FETCH_HEAD 파일을 안 건드리게 막아 SessionStart 의 pull 과 race 차단. 맥미니에서 즉시 ff-only 받아 HEAD 일치 확인 (9869c3fc60 / 34abfb078d / 0589406b00).

## 예방 (Forcing function 우선)
- (적용됨, code-level) sync-health.sh:22 `git fetch --quiet --no-write-fetch-head` — 백그라운드 fetch 가 FETCH_HEAD 안 건드림. 다른 백그라운드 워커 추가 시 동일 플래그 강제.
- (미적용 후속) 재발 시 SessionStart 훅에 `flock ~/.cache/session-pull-<repo>.lock` 가드 도입 — 다중 SessionStart 동시 실행 케이스 대비.

## 재발 이력
(처음 생성)

## 관련 링크
- 커밋: ssamssae/claude-skills@9869c3f
- 텔레그램: msg 4822 (실패) / 4825 (진단) / 4827 (sync 완료)
