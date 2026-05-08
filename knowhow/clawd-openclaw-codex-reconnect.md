---
title: "Clawd on Desk + OpenClaw Codex 연동 끊길 때 재연결 방법"
tags: [clawd, openclaw, codex, mac-mini]
date: 2026-05-08
---

# Clawd on Desk + OpenClaw Codex 연동 끊길 때 재연결 방법

## 증상

Mac mini 에서 Clawd on Desk 펫이 sleeping 상태로 고정되고, OpenClaw 로 Codex 에 메시지를 보내도 thinking/working 애니메이션이 발생하지 않음.

`~/Library/Application Support/clawd-on-desk/session-debug.log` 에서:

```
source=openclaw-trajectory agentPid=- pidReachable=0
→ stale-delete unreachable
```

## 원인

OpenClaw 가 Codex 를 `app-server --listen stdio://` 모드(상시 서버)로 실행하기 때문에:

- `~/.codex/hooks.json` 미호출 (OpenClaw 보안 정책 — archive-only)
- `~/.codex/sessions/rollout-*.jsonl` 미생성 (CLI 세션과 다른 동작)
- Clawd 의 구형 소스 `openclaw-trajectory` 가 PID 체인을 찾지 못함

## 해결

Clawd on Desk 재시작. Tray 아이콘 또는 Dock → 우클릭 → Quit 후 재실행.

재시작 후 `openclaw-plugin` 소스로 자동 전환되며 올바른 PID 에 연결됨:

```
source=openclaw-plugin agentPid=<codex-pid> sourcePid=<openclaw-gateway-pid> pidReachable=1
```

OpenClaw 도 재시작했다면 Clawd 재시작도 병행할 것.

## 확인 방법

```bash
tail -5 ~/Library/Application\ Support/clawd-on-desk/session-debug.log
```

`openclaw-plugin` 소스에 `pidReachable=1` 이 보이면 정상.

## 핵심

| 소스 | 상태 |
|------|------|
| `openclaw-trajectory` | ❌ 구형, pidReachable=0 발생 |
| `openclaw-plugin` | ✅ 현재 정상 소스 |
| `codex-official` | ✅ hooks.json 경유 (CLI 모드에서만) |
