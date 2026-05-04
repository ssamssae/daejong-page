---
category: 멀티기기
tags: [wsl, alias, tmux, bash, alias-mesh, multi-device]
related_issues: []
---

# WSL alias mesh 점검 — `m` alias 누락 시 리눅스 기본 명령어 충돌

- **첫 발견:** 2026-05-05 (WSL에서 `m` command not found, `w` 실행 시 uptime/who 출력)
- **재사용 영역:** WSL 환경 신규 셋업 또는 alias mesh 재구성 시 점검 체크리스트.

## 한 줄 요약

WSL `~/.bashrc`에 3-노드 alias mesh 일부(`m1`, `mb`)만 추가하고 `m`(자기 자신 tmux main attach)을 빠뜨리면, 리눅스 기본 명령어가 충돌하거나 command not found가 난다.

## alias 방향 표 (혼동 주의)

| 실행 위치 | 본진 main | Mac mini main | WSL main |
|---|---|---|---|
| **Mac 본진** | `m` (자신) | `m1` | `w` |
| **WSL** | `mb` | `m1` | `m` (자신) |

- WSL에서 본진 접속: `mb` (본진에서 WSL 접속하는 `w`와 **방향 반대**)
- WSL에서 `w`를 치면 리눅스 기본 `w`(who + uptime) 실행 → 혼동 주의

## 수정 방법

```bash
# WSL ~/.bashrc 에 추가
alias m='tmux attach -t main 2>/dev/null || tmux new -s main'
```

추가 후 `source ~/.bashrc` 실행.

## 점검 체크리스트 (WSL 신규 셋업 시)

```bash
grep 'alias m' ~/.bashrc   # m, m1, mb 세 개 모두 있어야 함
```

| alias | 있어야 할 값 |
|---|---|
| `m` | `tmux attach -t main 2>/dev/null \|\| tmux new -s main` |
| `m1` | `TERM=xterm-256color ssh -t mac-mini /opt/homebrew/bin/tmux new-session -A -s main` |
| `mb` | `TERM=xterm-256color ssh -t mac /opt/homebrew/bin/tmux new-session -A -s main` |
