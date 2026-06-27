# 본진 ~/.zshrc 의 claude tmux 자동 생성 라인이 launchd plist 와 race — cc 가 빈 zsh 세션에 grouped attach

- **발생 일자:** 2026-05-29 07:28 KST 직전 (형님 cc 안 붙는 증상 발견)
- **가시화:** 2026-05-29 07:29:25 KST (형님 msg27671 "m 메인세션에서 cc가 안붙는 증상이 있었어")
- **해결 일자:** 미정 (이슈 박는 시점 ack 대기, .zshrc line 16 제거 fix 후보)
- **심각도:** medium (cc 가 안 붙는 것처럼 보임. 실제 채널/세션은 다른 경로로 살아있어 데이터 손실 0. 형님 진입 동선만 깨짐)
- **재발 가능성:** high (launchd plist 가 어떤 이유로 죽거나 멈추면 매 새 zsh 진입마다 빈 claude 세션이 만들어짐)
- **영향 범위:** 🍎 본진 `cc` 진입 동선 + `~/.zshrc` line 16 의 fail-deadly 자동 생성

## 증상

형님 m alias (`tmux attach -t main 2>/dev/null || tmux new -s main`) 으로 main 세션 진입 후 `cc` 호출 → 화면 변화 0. main 세션의 zsh prompt 가 그대로 보이고, cc 가 silent 으로 5번 호출된 흔적이 남음 (`tmux capture-pane -t main:0 -p` 결과 `user@<mac-host> ~ % cc` 5줄).

가시 증상:
- main 세션 화면이 cc 호출 후에도 zsh prompt 그대로
- `tmux ls` 결과: `claude` (group claude), `claude-98322` (group claude, attached), `claude-98931` (group claude, attached), `main` 모두 존재
- claude REPL 실제 살아있음 — PID 98325 `claude --channels plugin:telegram@claude-plugins-official`
- 단 PID 98325 의 PPID = 961, PID 961 = `tmux new -d -s claude` (decrypt-run.sh 없는 단순 명령)

## 탐지

본진 자가 진단 (07:35~07:45 KST):

1. `cc` 실행 경로 확인 — `~/Users/<user>/bin/cc` (Apr 18 변경 후 그대로, 한 달 무수정)
2. `claude` 바이너리 위치 — `/opt/homebrew/bin/claude` 정상, `~/.bun/bin/claude` 부재
3. `tmux ls` + `list-clients` → claude/claude-98322/claude-98931/main 4 세션, ttys000/ttys004 가 grouped client 둘 다 attached+focused
4. `tmux capture-pane -t main:0` → cc 5번 silent fail 흔적
5. `ps -ww -p 98325 -o pid,ppid,command` → PPID 961 = `tmux new -d -s claude`
6. `stat -f '%Sm' /tmp/com.user.tmux-claude.{out,err}.log` → mtime = 2026-05-28 16:08:10 KST (어제 telegram plugin ENOENT 사고 시점 이후 launchd 재실행 0)
7. `~/.zshrc` line 16 발견: `tmux has-session -t claude 2>/dev/null || tmux new -d -s claude`

## 근본 원인

`~/.zshrc` line 16 이 zsh 시작 시 `tmux has-session -t claude` 검사 후 false 면 `tmux new -d -s claude` (claude REPL **없이** 빈 zsh 만 띄움) 으로 자동 세션을 만든다.

`com.user.tmux-claude.plist` 의 RunAtLoad program 은:
```
tmux has-session -t claude || tmux new -d -s claude 'cd ~/Users/<user> && export PATH=... && exec ~/Users/<user>/infra-config/scripts/decrypt-run.sh --profile telegram /opt/homebrew/bin/claude --channels plugin:telegram@claude-plugins-official'
```
즉 빈 세션이 아니라 claude REPL 까지 띄움. 두 명령이 같은 `claude` 이름 세션을 두고 race 하는데, **먼저 만든 쪽이 이긴다** (둘 다 has-session 검사로 skip 처리).

타이밍:
- 어제 2026-05-28 16:08 KST telegram plugin ENOENT 사고 (issues/2026-05-28-mac-telegram-plugin-enoent.md) 회복 후 launchd plist 가 그 시점 이후 다시 안 돔 (`/tmp/com.user.tmux-claude.{out,err}.log` mtime 정확히 5/28 16:08:10).
- 사이 어딘가에 claude 세션이 죽음.
- 오늘 새벽 어떤 시점에 형님이 (또는 자동화가) 새 zsh 를 열자 line 16 의 `tmux has-session` false → `tmux new -d -s claude` 으로 **claude REPL 없는 빈 zsh 세션 (PID 961) 생성**.
- 그 빈 세션 안에서 추후 어떤 동작으로 `claude --channels plugin:telegram@claude-plugins-official` 이 첫 윈도우에 실행되어 PID 98325 가 살아남. 단 plist 의 decrypt-run.sh wrapper 가 안 끼어 있어서 환경변수 fallback 경로로 띄워진 상태.

형님이 m → main 진입 → `cc` 시도 시점에 이미 빈 또는 PPID 961 짜리 비표준 세션이 존재. cc 는 `tmux has-session -t claude` PASS 으로 ensure_base skip → `tmux new-session -d -t claude -s claude-<PID>` 으로 grouped client 만들고 `switch-client` → 그 client view 가 보여주는 세션 화면 = claude REPL 화면. 단 비표준 세션 진입 시점이라 형님 입장에서 "안 붙음" 으로 해석.

(참고 — 형님 가설 "본진/맥미니/노트북 3명이 업데이트하다가 깨진 거 같다" 와 직접 관계는 없음. 다만 어제 telegram plugin ENOENT 사고 회복 commit 흐름 [42d1da6, 383d9f6] 에서 plist 단독 책임으로 정리됐어야 할 자동 생성 라인이 .zshrc 에 남아 race 가능성을 살려둔 게 간접 원인.)

## 복구 (ack 대기)

### 후보 A (추천) — .zshrc line 16 제거

```diff
-# 본진 챗봇 세션 자동 유지 (5노드 표준, 2026-05-16 통일 후 2026-05-18 이름 fix)
-tmux has-session -t claude 2>/dev/null || tmux new -d -s claude
+# claude tmux 세션 생성은 launchd com.user.tmux-claude.plist 단독 책임.
+# 죽으면 `launchctl kickstart -k gui/$(id -u)/com.user.tmux-claude` 으로 명시 복구.
```

이유:
- plist 가 RunAtLoad + state=active 으로 책임 (decrypt-run.sh wrapper + bun PATH 포함 완전한 환경).
- .zshrc 의 빈 세션 자동 생성은 plist 가 죽었을 때 fail-deadly: 빈 세션을 만들어 plist 의 has-session 검사를 PASS 시켜버려 plist 재시도가 의미를 잃음.
- 죽었을 때 명시 복구가 더 안전 — 어제 v3 cold-restart 패턴 (`launchctl bootout` + `pkill -KILL -f "claude --channels"` + `launchctl bootstrap`) 이 표준.

### 후보 B — line 16 을 plist 와 동일 명령으로 맞춤

```diff
-tmux has-session -t claude 2>/dev/null || tmux new -d -s claude
+tmux has-session -t claude 2>/dev/null || tmux new -d -s claude 'cd ~/Users/<user> && exec ~/Users/<user>/infra-config/scripts/decrypt-run.sh --profile telegram /opt/homebrew/bin/claude --channels plugin:telegram@claude-plugins-official'
```

장점: zsh 진입만으로 claude REPL 까지 자동 복구.
단점: 명령 복잡도 ↑, plist 와 .zshrc 두 곳에 똑같은 명령 박혀 sync drift 위험.

### .zshrc 변경 = hard rule 형님 명시 ack 필수

CLAUDE.md ("사용자 셸 RC 파일 변경 = 형님 명시 ack 필수, scope creep 금지") 룰 적용. ack 없이 진행 금지.

## 재발방지

1. **글로벌 룰 — RC 파일 fail-deadly 자동화 검토** — `~/.zshrc` / `~/.bashrc` 의 자동 세션 생성/attach 라인이 launchd/systemd 와 race 하는지 점검. fail-deadly 패턴 (= 빈 상태를 만들어 상위 책임자의 retry 를 막음) 잡히면 (a) 제거 (b) 상위 책임자와 동일 명령 으로 강제 sync. 메모리에 박을 것 (`feedback_rc_fail_deadly_session_seed`).

2. **launchd plist 재시작 헬스체크 추가 (deferred)** — `/tmp/com.user.tmux-claude.{out,err}.log` mtime + `launchctl print` `runs` 카운트 + `tmux capture-pane -t claude:0` 화면 sanity check. plist 가 죽었거나 빈 세션만 띄운 상태 자동 탐지. 본 사이클은 별 task 로 분리.

3. **cc 스크립트의 base 세션 무결성 검증 추가 (deferred)** — `ensure_base` 안에서 `tmux list-windows -t claude` pane PID 의 command 가 `claude --channels` 인지 확인. 빈 zsh 만 있으면 (= line 16 race 결과) `kill_all_group` 후 plist 패턴으로 재생성. 별 task.

4. **plist 단독 책임 명시 docstring** — `com.user.tmux-claude.plist` 와 `.zshrc` 양쪽에 "claude 세션 생성은 plist 단독 책임" 주석 박아 다음 챗봇이 .zshrc 에 자동 생성 라인 도로 추가하는 사고 방지. 본 fix commit 에 포함.

5. **재발 시 본 이슈 참조** — main 세션 cc 안 붙는 패턴 잡히면 즉시 (a) `ps -p $(tmux list-windows -t claude -F '#{pane_pid}') -o command` 확인 (b) PPID 가 `tmux new -d -s claude` 단순 명령이면 line 16 race 확정 (c) `launchctl kickstart -k` 또는 v3 cold-restart 으로 plist 재가동.

## 사이드 노트

- cc 스크립트 line 75-77 의 `set-hook -t "$CLIENT" client-detached "kill-session -t =$CLIENT"` + `switch-client -t "=$CLIENT"` 조합은 정상 동작 (의도된 grouped client 자동 청소). 본 사고와 무관. 단 switch-client 가 잘못 trigger client-detached hook 가능성은 별 task 로 한 번 reproduce 시도 필요.
- 동일 RC race 패턴이 다른 노드 (맥미니/WSL/desktop3060ti/notebook3060) `~/.bashrc`/`~/.zshrc` 에도 있는지 sweep 검사 필요. 별 task.
- 형님 두 번째 메시지 (주간 토큰 22시 리셋이 지금 이미 리셋) 는 별 이슈 — anthropic 사이드 또는 scrape SoT 정의 변화 가설. 별 reply 으로 surface 후 진행.
