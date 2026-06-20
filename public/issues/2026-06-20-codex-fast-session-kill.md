---
date: 2026-06-20
node: Codex worker node
severity: high
status: resolved
tags: [codex, telegram, relay, tmux, systemd, session-lifecycle]
prevention_deferred: 2026-06-23
---

# Codex fast 모드 처리 중 session kill 로 텔레그램 중계 1시간 단절

- **발생 일자:** 2026-06-20 18:45 KST
- **해결 일자:** 2026-06-20 19:53 KST
- **심각도:** high
- **재발 가능성:** high
- **영향 범위:** Codex TUI, Telegram relay, tmux supervisor

## 증상

외부에서 텔레그램으로 Codex와 대화하던 중 relay가 끊겼고, 활성 세션 일부가 재시작/종료된 것처럼 보였다. 단순 TUI fast 모드 상태 변경이어야 했던 작업이 session lifecycle을 건드려 원격 복구 난도가 올라갔다.

## 원인

fast 모드 해제 확인을 설정파일 변경과 서비스/세션 재시작으로 처리했다. 이때 Codex TUI가 들어 있는 tmux 세션 안에서 tmux session kill 계열 명령이 실행되어, 뒤따라야 할 relay/supervisor 재시작이 안정적으로 완료되지 못했다.

## 조치

1. user systemd journal과 tmux bridge pane을 확인해 crash가 아니라 명시적인 stop 이후 미기동 상태였음을 확인했다.
2. Codex session 로그에서 서비스 stop + tmux session kill 명령을 확인했다.
3. 살아 있는 tmux 세션은 건드리지 않고 supervisor만 다시 붙였다.
4. 최종 상태는 relay와 supervisor 모두 active로 복구됐다.

## 예방 (Forcing function 우선)

활성 TUI 상태 변경은 세션 재시작이 아니라 slash command 주입으로 처리한다. relay/supervisor stop, tmux session kill 같은 lifecycle 명령은 명시 ack 없이는 실행하지 않는다.

- **막을 코드/훅:** `none`
  - deferred 2026-06-23: Codex PreToolUse hook 또는 wrapper 가드 설계 필요.
  - 가드 후보: relay/supervisor stop/restart, tmux session kill이 현재 Codex 세션 안에서 실행될 때 explicit lifecycle ack를 요구.

## 재발 이력

<처음 생성>

## 관련 링크

- 관련 이슈: `2026-06-18-codex-main-cx-tmux-routing.md`
- 관련 이슈: `2026-05-28-codex-ssh-attach-detached-loss.md`
