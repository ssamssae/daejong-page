---
date: 2026-05-28
node: 🪟 notebook3060 / WSL
severity: medium
status: resolved
tags: [codex, ssh, tmux, attach, autostart, wrapper, wsl, notebook]
prevention_deferred: null
---

# WSL/노트북 codex SSH attach 죽음 사고 — frontend tty 직접 attached 상태에서 SSH 끊김으로 세션 동반 종료

- **발생 일자:** 2026-05-28 KST
- **심각도:** medium (작업 손실은 없었으나 codex 세션이 함께 죽어 재접속 필요)
- **재발 가능성:** high → low (wrapper + autostart 적용 후 낮아짐)
- **영향 범위:** WSL / 노트북 codex REPL, SSH attach 경유 세션

## 사건

노트북/WSL 쪽 codex 가 tmux 내부 wrapper 없이 SSH 프론트엔드 tty 에 직접 붙은 상태로 돌다가, SSH 연결이 끊기면서 codex 세션도 같이 종료됐다. 결과적으로 작업은 살아 있어도 attach 경로가 끊겨 재진입이 필요했다.

## 관찰된 사실

1. 본진/맥미니처럼 tmux main 안에서 codex 를 띄운 패턴이 아니었다.
2. WSL/노트북은 frontend tty 직접 attached 상태라 SSH 끊김이 곧 codex 종료로 이어졌다.
3. 노트북 쪽은 detached tmux 세션은 무사했고, systemd user side 는 4분 갭 뒤 자가복구했다.
4. 사고 후 wrapper/auto-start 적용으로 reattach 경로를 표준화했다.

## 근본 원인

- codex REPL 이 tmux 보호막 없이 SSH attach 에 직접 매달려 있었다.
- SSH disconnect / session loss 가 곧 codex exit 로 전파됐다.
- 재접속 시 자동 복구 장치가 없어서 사람이 다시 들어가야 했다.

## 재발방지

1. codex 는 tmux main 세션 안에서만 띄운다.
2. WSL/노트북은 wrapper script + systemd user unit 으로 autostart 한다.
3. reattach 후 idempotent skip 이 확인돼야 정상으로 간주한다.

## 관련 task

- `T-260528-14` — WSL/노트북 codex SSH attach 죽음 사고 issue 박기
- `T-260528-12` — WSL/노트북 codex tmux main wrapper 영구화

## 상태

- 원인 기록과 재발방지 패턴을 issue 로 고정.
- wrapper / autostart 적용 이후 재현 방지 상태로 전환.
