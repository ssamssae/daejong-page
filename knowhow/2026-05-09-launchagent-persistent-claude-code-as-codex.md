---
title: "LaunchAgent로 Claude Code를 상시 대기 Codex로 운영하는 패턴"
date: 2026-05-09
tags: [launchagent, claude-code, mac-mini, codex, agent-mesh, tmux, process-agent-inbox]
severity: low
category: 멀티기기
---

## 배경

맥미니를 Claude Code 디렉티브 처리 워커(Codex)로 쓸 때, 매번 수동으로 세션을 띄울 필요 없이 LaunchAgent가 자동으로 tmux에 Claude Code를 상시 유지하는 패턴.

## 구조

```
MacBook
  └─ codex-directive.sh -f directive.md
       ├─ Telegram (@ssamssae_claw_bot) → OpenClaw 수신
       └─ SCP → mac-mini:~/agent-inbox/macbook/<ts>-<id>.json
                    ↓
              process-agent-inbox.sh (launchd 30s 폴링)
                    ↓
              tmux send-keys → tmux `claude` 세션
                    ↓
              Claude Code (--dangerously-skip-permissions)
                    ↓
              inbox-write.sh --remote → MacBook 결과 보고
```

## LaunchAgent plist

`~/Library/LaunchAgents/com.user.tmux-claude.plist`:

```xml
<key>ProgramArguments</key>
<array>
  <string>/bin/sh</string>
  <string>-c</string>
  <string>cd ~ &amp;&amp; /opt/homebrew/bin/tmux has-session -t claude 2>/dev/null || /opt/homebrew/bin/tmux new -d -s claude '/opt/homebrew/bin/claude --dangerously-skip-permissions'</string>
</array>
<key>RunAtLoad</key>
<true/>
```

`has-session` 체크로 이미 살아있으면 재시작 안 함. 부팅 시 또는 세션이 죽었을 때만 재생성.

## 핵심 포인트

- `--dangerously-skip-permissions` 플래그 필수 — headless 환경에서 권한 프롬프트 없이 tool 실행
- tmux 세션명을 `claude`로 고정 → process-agent-inbox.sh가 `-t claude`로 직접 inject
- OpenClaw(Telegram Codex)와 별개 — 이 세션이 실제 디렉티브 실행 주체
- 세션이 죽어도 다음 부팅 또는 launchctl kickstart 시 자동 복구

## 주의사항

- OpenClaw 세션과 이 tmux claude 세션은 **독립적**으로 공존. 혼동 주의.
- 이 세션을 끄면 process-agent-inbox.sh inject 경로가 끊겨 Codex 디렉티브 전체 불능.
- 세션 제목("WSL Claude integration and...")은 최초 시작 시 컨텍스트이며 실제 역할과 무관.

## 확인 명령

```bash
# 맥미니에서 세션 상태 확인
ssh mac-mini "/opt/homebrew/bin/tmux list-sessions"

# LaunchAgent 활성화 여부
ssh mac-mini "launchctl list | grep tmux-claude"

# 세션 현재 화면
ssh mac-mini "/opt/homebrew/bin/tmux capture-pane -t claude -p | tail -20"
```
