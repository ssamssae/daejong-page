---
prevention_deferred: null
summary: "desktop3060Ti tmux에 'claude-main' 잔존 → 폰 termius 진입 시 본진과 다른 격리 세션으로 빠지는 사고"
---

# desktop3060Ti tmux 세션 이름 'claude-main' 잔존 — cc / .bashrc SoT 미통일

- **발생 일자:** 2026-05-16 (CLAUDE.md "5노드 tmux 세션 이름 통일 (2026-05-16)" 변경 후 desktop3060Ti 측 SoT 미반영 잔존이 드러남)
- **해결 일자:** 2026-05-16 16:00 KST (~/bin/cc + ~/.bashrc 패치 + 백업)
- **심각도:** low (실 directive 운반 영향 0 — 운반체 타겟 'claude' 와 별 group 'claude-main' 격리)
- **재발 가능성:** low (SoT 양쪽 다 'claude' 로 박힘)
- **영향 범위:** desktop3060Ti 로컬 — `~/bin/cc`, `~/.bashrc` SSH 자동 attach 분기

## 증상

본진이 desktop3060Ti `tmux ls` 점검 시 'claude' 세션(group claude) 과 별도로 'claude-main' group + 'claude-main-<pid>' attached client 가 계속 살아남. 강대종 폰 termius 로 desktop3060Ti 접속 → 즉시 Claude Code 화면 진입 (일반 shell 진입 경로 불가) → /clear 같은 명령을 본진과 공유하는 'claude' 세션에 못 보내고 별 'claude-main' 인스턴스로 들어가 격리됨.

## 원인

desktop3060Ti 세 곳의 SoT 가 미통일:

1. `desktop3060ti-directive.sh` (본진 운반체) — `claude` 세션 paste (CLAUDE.md 표준)
2. `~/.bashrc` L131 — `claude` 세션 백그라운드 자동 생성 (Claude Code 실행)
3. `~/.bashrc` L133-137 — SSH 접속 시 `exec tmux attach -t =claude` (자동 attach)
4. **`~/bin/cc` L7 — `SESSION="claude-main"` (옛 이름 잔존)**

cc 가 grouped tmux session 패턴(`tmux new-session -t SESSION -s SESSION-<pid>`)이라 호출마다 'claude-main' group + 새 client 생성. termius Pro Startup Snippet 의심까지 갔으나 false positive — 실제는 ~/bin/cc 가 root cause.

추가로 .bashrc 의 SSH 자동 attach 동작이 강대종 의도("termius → m → 공유 main → cc → Claude Code") 와 어긋남 — 강제로 'claude' 세션에 attach 시켜서 일반 shell 진입 경로 차단.

## 해결

두 파일 패치 (백업 `*.bak-2026-05-16`):

1. **`~/bin/cc` L7**: `SESSION="claude-main"` → `SESSION="claude"` (CLAUDE.md 5-node tmux unify 정합)
2. **`~/.bashrc` L136**: `exec tmux attach -t =claude` → `exec tmux new-session -A -s main` (다른 노드 termius 루틴 통일 — ssh 들어오면 공유 main shell, 강대종이 cc 치면 Claude Code)

변경 라인 옆에 inline 주석 마커 추가 (`# 2026-05-16 unified: ...`).

## 검증

- `grep "^SESSION=" ~/bin/cc` → `SESSION="claude"` 확인 ✅
- `sed -n "133,138p" ~/.bashrc` → `exec tmux new-session -A -s main` 확인 ✅
- 백업 사이즈: cc.bak 2016 bytes / .bashrc.bak 5424 bytes ✅
- 강대종 폰 termius 재접속 → 'main' shell 자동 진입 → `cc` 침 → 'claude' group 공유 attach → /clear 본진 영향 (검증 진행 중, msg_id 17782)

## 예방

- desktop3060Ti 로컬 dotfiles SoT 점검 cron 후보 — `/daejong-page-sync` 또는 별도 `dotfile-sot-drift` cron 에 흡수. CLAUDE.md 5-node 통일 룰 박는 시점에 모든 노드 grep 으로 잔재 확인하는 step 자동화.
- 추후 5-node 통일 류 룰 변경 시: 각 노드의 ~/bin/* wrapper 와 ~/.bashrc/~/.zshrc 자동 attach 분기 둘 다 sweep 필요 (단일 점검).

## 관련 메모리

- CLAUDE.md "크로스 디바이스 디렉티브 송신" — 5노드 tmux 세션 이름 통일 SoT
- backup 위치: `desktop3060Ti:~/bin/cc.bak-2026-05-16`, `desktop3060Ti:~/.bashrc.bak-2026-05-16`
- 본진 ack: msg_id 17779 "진행"
