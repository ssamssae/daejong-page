# claude-automations GitHub PR 머지 → 5노드 ~/claude-automations 자동 pull 메커니즘 부재

- **발생 일자:** 2026-05-27 08:11 KST (PR #46/#47/#48 본진 squash 머지)
- **발견 일자:** 2026-05-27 08:15 KST (아니키 surface "초소 라이브 본진 대기상태 위아래 안맞음" + "wsl 도 대기 아이들인데 이전에 했던 작업이 표기됨" + "데스크탑도 마찬가지")
- **해결 일자:** 2026-05-27 08:18 KST (본진 SSH 으로 3 노드 수동 `git pull --ff-only` + diverging prefix branch -D)
- **심각도:** medium (UI 불일치 + 새 hook/script 코드 즉시 적용 안 됨)
- **재발 가능성:** high (sync 메커니즘 디자인 자체 결함, 매 PR 머지 시점 재발 가능)
- **영향 범위:** 5 노드 ~/claude-automations 의 hook / scripts 새 코드 적용 지연. choso 라이브 UI / agent-msg-notify 패턴 변경 / cross-device script 업데이트 등 광범위 영향

## 증상

PR #46 / #47 / #48 GitHub squash 머지 25분+ 후:

- 🍎 본진: HEAD `7dd7e29 codex-directive v3 fix` (3 commits behind origin/main 의 `6608d73 choso-ping active_goal`)
- 🪟 WSL: HEAD `bb0014c session-inject MTIME guard` (squash 전 prefix branch local commit, origin/main 과 diverging)
- 🖥 데스크탑: HEAD `03b8a55 systemd PATH STANDARD.md` (squash 전 prefix branch local commit, diverging)
- 🏭 맥미니: 6608d73 OK (PR 작성한 노드라 자기 commit 받음)
- 💻 노트북: 6608d73 OK (어떻게? — 추정: 자체 git pull 호출했거나 다른 sync 발동)

결과:
- choso 새 `active_goal_text/completed` payload 박는 choso-ping.sh hook 코드가 3 노드 (본진/WSL/desktop3060ti) 에 적용 안 됨
- queue.kangdaejong.com 본진 노드 타일 "지금 작업중" 영역 = hook label fallback 표시 (옛 브랜치 정보) 또는 "대기"
- WSL/데스크탑 노드 타일도 옛 prefix branch 정보 sticky
- 새 hook 가 sync 되었다면 5 노드 즉시 [목표 활성화] / [목표 완료] UX 적용됐어야

## 원인

### Root cause: GitHub `origin/main` 의 새 commits → 5 노드 `~/claude-automations` local pull 메커니즘 자체 부재

현재 ~/claude-automations sync hook 2개:

1. **posttooluse-sync-automations.sh** (PostToolUse hook): 본진이 `~/claude-automations` 안 파일 직접 Edit 했을 때만 trigger. file_path 패턴 매칭. 동작 = local commit + push + 4 노드 SSH fetch+merge. **origin → local pull X**.

2. **stop-sync-automations.sh** (Stop hook): 본진에 **unpushed commits** 있을 때만 trigger (`git rev-list --count '@{u}..HEAD'` > 0). 동작 = `git push` + 4 노드 SSH fetch+merge. PR 머지 직후 본진 unpushed=0 → **trigger 안 됨**.

즉 두 hook 모두 본진 local 변경 → 5노드 push 방향만 처리. **GitHub PR 머지 (외부 origin/main 갱신) → 본진 + 4노드 pull 방향 메커니즘이 없음**.

추가로 WSL + 데스크탑이 자기 prefix branch (`wsl/session-inject-fix-2026-05-27` / `desktop/systemd-path-std-2026-05-27`) 위에 머문 상태에서 PR 가 squash 머지되어 origin 의 prefix branch 가 삭제됨 → local 의 upstream tracking ref 부재 + diverging history → `git pull --ff-only` 자체 불가.

### 부가 사실

- ~/.claude/hooks 는 ~/.claude/automations/hooks symlink (=~/claude-automations/hooks 의 symlink). 즉 ~/claude-automations 만 sync 되면 hook 코드 즉시 반영. 그러나 ~/claude-automations 자체가 sync 안 된 게 문제.
- 맥미니가 6608d73 OK 인 이유 = PR #48 직접 작성+push 한 노드라 자기 commit 그대로 보유. 다른 노드들은 squash 머지된 새 sha 받아야 함.
- 노트북이 6608d73 OK 인 이유 = projects.yaml task release 작업 끝낼 때 ScheduleWakeup 없이 종료 → 그 사이 어떤 hook (Stop 또는 다른) 가 git pull 발동했을 가능성. 또는 자체 git pull 호출.

## 조치

### 즉시 (이미 적용)

본진 SSH 으로 3 노드 fix:
- 본진: `cd ~/claude-automations && git pull --ff-only origin main` → 6608d73 도달
- WSL: `git checkout main && git pull --ff-only origin main && git branch -D wsl/session-inject-fix-2026-05-27` → 6608d73 도달
- 데스크탑: 동일 패턴 → 6608d73 도달

5 노드 hook sha 일치 검증 (e54ea97a09509f6db47c9e693dc43531db032ab4c47cd774f34b069952b0ccdf).

### 후속 fix candidate

**(a) stop-sync-automations.sh 에 본진 origin → local pull 추가**: 본진이 main branch 일 때마다 `git fetch origin && git pull --ff-only origin main` 박음. 비용 0 (fetch 거의 무. 이미 최신이면 no-op). 본진 Stop 자주 발동되므로 PR 머지 후 다음 Stop 까지 latency 최대 ~몇 초.

**(b) 노드 stop-sync-automations 추가 (5노드)**: 각 노드도 main branch 인 경우 git pull. 그러나 노드는 prefix branch 위에서 작업하는 게 디폴트이라 main 위에 있는 시간 적음. (a) 처럼 효과적 X.

**(c) cron 매 5~10분 git fetch+pull (5노드)**: 가벼움. 그러나 hook 기반보다 latency 큼.

**(d) gh pr merge 직후 본진 자동 broadcast**: 본진이 gh pr merge 호출 직후 5 노드 SSH `git pull` directive 발사. 본진의 머지 wrapper 박을 수 있음.

**(e) GitHub Actions / webhook**: 머지 직후 webhook → 5노드 trigger. 복잡 + repo 외부 dependency.

**추천 = (a) + (d) 결합**. (a) = 본진이 자기 동기화, (d) = 머지 시점 5노드 동시 sync. (b)(c) 는 후순위.

### 자연 검증

(a) 적용 후 다음 PR 머지 사이클이 자연 검증. PR 머지 후 본진 Stop 5초 안에 origin/main 받는지 확인. PASS 시 closure 마킹.

## 예방 (Forcing function)

1. **PR 머지 후 sync 검증 step** — 본진 자율 PR 머지 룰 (feedback_self_pr_squash_merge_denial) 에 "머지 후 5 노드 ~/claude-automations git log --oneline -1 확인" 한 줄 추가. 차이 surface 시 즉시 broadcast sync directive.
2. **새 hook/script PR 머지 사후 라이브 검증 step** — choso 같이 사용자 가시 UI 영향 있는 PR 은 5노드 sync 도달 확인 후 closure 마킹.
3. **(a) stop-sync-automations.sh 본진 pull 라인 추가가 가장 robust forcing function** — 메모리/룰 의존 X, 코드 자체로 강제.

## 재발 이력

(이번이 첫 surface — 그러나 매 PR 머지 시점 재발 가능)

## 관련 링크

- ~/claude-automations/hooks/posttooluse-sync-automations.sh (line 18~ : file_path 매칭으로 local edit 만 trigger)
- ~/claude-automations/hooks/stop-sync-automations.sh (line 17~ : unpushed commit 있을 때만 trigger)
- PR #46 https://github.com/ssamssae/claude-automations/pull/46 (머지 commit 3928d48)
- PR #47 https://github.com/ssamssae/claude-automations/pull/47 (머지 commit a60c74f)
- PR #48 https://github.com/ssamssae/claude-automations/pull/48 (머지 commit 6608d73)
- 관련 메모리: [[../projects/-Users-user/memory/feedback_self_pr_squash_merge_denial]] (본진 self-PR 자율 머지 룰)
- 발견 텔레그램 메시지: 2026-05-27 08:15 KST "초소 라이브 본진 대기상태 위아래 안맞음" + 08:17 KST "wsl도 대기 아이들인데 이전에 햇던작업이 표기됨" + 08:17 KST "데스크탑도 마찬가지" + 08:21 KST "심링크 박았는데 왜 커밋이 뒤진거야? 이슈박자"
