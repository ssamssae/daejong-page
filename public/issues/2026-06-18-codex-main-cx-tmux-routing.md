---
date: 2026-06-18
node: 🪟 WSL / 🖥 desktop3060ti / 💻 notebook3060
severity: medium
status: resolved
tags: [codex, tmux, main, cx, wrapper, desktop3060ti, notebook3060, wsl]
prevention_deferred: null
---

# codex/main tmux 라우팅 사고 — `d`/`m`/`cx`가 main과 codex 사이를 잘못 오감

- 발생 일자: 2026-06-18 KST
- 영향 범위: WSL에서 데스크탑 `d`, 데스크탑 `cx` 후 `m`, 노트북 `M` 후 `cx`
- 상태: resolved

## 사건

1. WSL CLI에서 `d`를 누르면 데스크탑 main이 아니라 codex 화면으로 붙었다.
2. 데스크탑에서 `cx` 접속 후 `m`을 누르면 main shell로 돌아가지 않고 codex가 다시 붙었다.
3. 노트북 `M`으로 main에 들어간 뒤 `cx`를 치면 `cx: 지금 다른 tmux(클로드 쪽) 안입니다. detach 후 또는 새 터미널에서 cx 실행하세요.` 문구가 뜨며 codex로 전환되지 않았다.

## 관찰된 사실

1. WSL `~/.bashrc`의 `d` alias는 `ssh desktop3060ti /usr/bin/tmux new-session -A -s main`이었다. 원격 `main` 세션의 active pane이 `tmux`라서 main attach가 곧 codex처럼 보였다.
2. 데스크탑 `~/home/<user>/bin/m`은 단순 `tmux new-session -A -s main` 래퍼였다. shell pane을 선택하거나 nested pane을 회피하지 않았다.
3. 데스크탑 `~/home/<user>/bin/cx`는 `WRAPPER_VERSION="2026-06-18-nested-tmux"` 구버전이었다. default tmux main 안에서 codex tmux를 nested attach했다.
4. 데스크탑 `~/.bashrc`에는 `alias m='tmux attach -t main ...'`가 남아 있어 `~/home/<user>/bin/m` 래퍼를 shadowing했다.
5. 노트북의 실제 `cx`는 `~/home/<user>/.local/bin/cx`가 먼저 잡혔다. 이 파일은 `cx bridge` 기능이 있는 별도 wrapper였고, non-codex tmux 안에서 에러를 출력하고 종료하는 분기가 남아 있었다.
6. 노트북 `~/.bashrc`의 `alias m='tmux new-session -A -s main'`도 `~/home/<user>/bin/m` 래퍼를 타지 않았다.

## 근본 원인

- WSL 3노드의 codex는 전용 tmux socket `-L codex`의 `codex` 세션에서 돌고, main 작업공간은 default tmux socket의 `main` 세션에서 돈다.
- plain `tmux attach/new-session` alias는 active window가 nested tmux/codex일 때 그대로 잘못 붙는다.
- `cx`가 default tmux 안에서 codex를 nested attach하면 main pane 자체가 codex attach 상태가 되어 `m`으로 복귀하는 동작이 꼬인다.
- wrapper 파일을 고쳐도 shell alias나 PATH 우선순위(`~/.local/bin/cx` > `~/bin/cx`)가 남으면 실제 실행 경로는 계속 구버전을 탄다.

## 수정

### WSL

- `~/.bashrc`:
  - `alias d='TERM=xterm-256color ssh -t desktop3060ti ~/home/<user>/bin/m'`

### desktop3060ti

- `~/home/<user>/bin/m`을 shell pane 선택형 wrapper로 교체.
  - default socket `main` 세션을 보장한다.
  - `bash|zsh|sh|fish` pane을 우선 선택한다.
  - shell pane이 없으면 `main-shell` window를 만든다.
  - 다른 tmux socket 안에서 실행되면 `detach-client -E`로 main attach로 교체한다.
- `~/home/<user>/bin/cx`를 `WRAPPER_VERSION="2026-06-18-detachE-cross-tmux"` 버전으로 교체.
  - default tmux 안에서 `cx` 실행 시 nested attach하지 않는다.
  - codex grouped client를 만든 뒤 현재 main client를 `detach-client -E`로 codex attach로 교체한다.
- `~/.bashrc`:
  - `alias m='~/home/<user>/bin/m'`
  - `alias d='~/home/<user>/bin/m'`
- 이미 떠 있는 `main` bash에도 live alias를 주입했다.

### notebook3060

- `~/home/<user>/.local/bin/cx`와 `~/home/<user>/bin/cx`를 `WRAPPER_VERSION="2026-06-18-detachE-cross-tmux-bridge"` 버전으로 교체.
  - `cx bridge` 기능은 유지했다.
  - non-codex tmux 안에서 에러 종료하지 않고 `detach-client -E`로 codex attach로 교체한다.
- `~/home/<user>/bin/m`을 desktop3060ti와 같은 shell pane 선택형 wrapper로 설치.
- `~/.bashrc`:
  - `alias m='~/home/<user>/bin/m'`
- 이미 떠 있는 `main` bash에도 live alias를 주입했다.

## 검증

desktop3060ti:

```bash
grep -n 'WRAPPER_VERSION\|detach-client -E' ~/home/<user>/bin/cx
# WRAPPER_VERSION="2026-06-18-detachE-cross-tmux"

grep -n 'alias m=\|alias d=' ~/home/<user>/.bashrc
# alias m='~/home/<user>/bin/m'
# alias d='~/home/<user>/bin/m'

tmux display-message -p -t main 'main=#{window_name} #{pane_current_command}'
# main=bash bash

tmux -L codex display-message -p -t codex 'codex=#{window_name} #{pane_current_command}'
# codex=node node
```

notebook3060:

```bash
grep -n 'WRAPPER_VERSION\|detach-client -E\|cx bridge' ~/home/<user>/.local/bin/cx ~/home/<user>/bin/cx
# WRAPPER_VERSION="2026-06-18-detachE-cross-tmux-bridge"
# detach-client -E present
# cx bridge comment present

grep -n 'alias m=' ~/home/<user>/.bashrc
# alias m='~/home/<user>/bin/m'

bash -n ~/home/<user>/.local/bin/cx
bash -n ~/home/<user>/bin/cx
bash -n ~/home/<user>/bin/m
# syntax-ok

tmux display-message -p -t main 'main=#{window_name} #{pane_current_command}'
# main=bash bash

tmux -L codex display-message -p -t codex 'codex=#{window_name} #{pane_current_command}'
# codex=node node
```

## 백업

- WSL: `~/.bashrc.bak-d-main-20260618-233206`
- desktop3060ti:
  - `~/home/<user>/bin/m.bak-d-main-20260618-233206`
  - `~/home/<user>/bin/cx.bak-m-return-20260618-233803`
  - `~/home/<user>/.bashrc.bak-m-wrapper-20260618-233843`
- notebook3060:
  - `~/home/<user>/.bashrc.bak-cx-m-wrapper-20260618-234410`
  - `~/home/<user>/bin/cx.bak-cx-m-wrapper-20260618-234410`
  - `~/home/<user>/.local/bin/cx.bak-cx-m-wrapper-20260618-234410`

## 재발방지

- `main` 진입은 plain `tmux new-session -A -s main` alias가 아니라 `~/home/<user>/bin/m` wrapper를 타야 한다.
- `cx`는 default tmux 안에서 nested attach하거나 에러 종료하면 안 된다. cross-socket 전환은 `detach-client -E`가 정석이다.
- Linux 노드에서 `cx` 수정 전후에는 반드시 `type -a cx`로 실제 실행 경로를 확인한다. 노트북은 `~/home/<user>/.local/bin/cx`가 먼저 잡힐 수 있다.
- wrapper를 고친 뒤 `~/.bashrc` alias shadowing도 같이 확인한다.
- 수정 후 검증은 `main=bash bash`, `codex=node node`처럼 두 socket의 active pane을 분리 확인한다.

## 관련 문서

- `~/claude-skills/knowhow/codex-tmux-main-cx-routing.md`
- `~/claude-skills/issues/2026-05-28-codex-ssh-attach-detached-loss.md`
- `~/.claude/projects/-home-ssamssae/memory/MEMORY.md`의 `codex main/cx tmux 라우팅 정석` 인덱스
