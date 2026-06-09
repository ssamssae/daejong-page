---
title: "텔레그램 plugin reply 툴이 사라졌을 때(ENOENT) — bot HTTP API 로 fallback + plist PATH fix"
tags: [telegram, plugin, enoent, launchd, plist, bun, http-api, silent-fail]
date: 2026-05-30
---

# 텔레그램 plugin reply 툴이 사라졌을 때(ENOENT) — bot HTTP API 로 fallback + plist PATH fix

챗봇 세션에 진입했는데 `mcp__plugin_telegram_telegram__reply` 툴이 안 보이면(ToolSearch 로 찾아도 No matching deferred tools, 또는 `/mcp` 가 `Failed to reconnect to plugin:telegram:telegram: ENOENT`), 텔레그램 채널이 죽은 상태다. 이때 터미널에 답을 써봤자 폰엔 0건 — 본인은 답한 줄 아는데 실제로는 silent fail 이다.

## 증상

tmux 데몬 폴링은 살아있어서 사용자 메시지는 tmux 까지 들어온다. 그런데 reply 가 외부로 못 나간다. 2026-05-28 16:08~17:14 KST 약 1시간 동안 본진이 자기 답이 폰에 가는 줄 알고 계속 응답했지만 한 통도 전달되지 않았다.

## 원인

`com.user.tmux-claude.plist` 의 `export PATH=` 라인에 `/Users/user/.bun/bin` 이 빠져 있으면, telegram plugin 이 spawn 하는 `bun` 바이너리가 ENOENT 로 못 떠서 reply 툴이 로드되지 않는다. launchd 는 `~/.bun/bin` 같은 glob 을 확장하지 않으므로 **반드시 절대경로**(`/Users/user/.bun/bin`)로 박혀 있어야 한다.

## 해결

1. `~/.claude/channels/telegram/.env` 의 `TELEGRAM_BOT_TOKEN` + `~/.claude/channels/telegram/access.json` 의 `allowFrom[0]`(= 사용자 chat_id) 를 읽는다.
2. HTTP API 로 폰에 진단 1통 — 채널이 끊겼고 고치는 중임을 먼저 알린다:

```
curl -s -X POST "https://api.telegram.org/bot${BOT}/sendMessage" -d "chat_id=${CHAT}" --data-urlencode "text=🍎 텔레그램 채널 끊김 진단 + fix 진행 중"
```

3. plist 의 PATH 에 `/Users/user/.bun/bin` 포함 여부 확인, 누락이면 PATH 맨 앞에 prepend.
4. v3 cold-restart — `kickstart -k` 단독은 기존 프로세스가 살아 있으면 새 plist 를 안 읽으므로 bootout/pkill/bootstrap 3단계:

```
launchctl bootout gui/$(id -u)/com.user.tmux-claude
pkill -KILL -f "claude --channels"
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.user.tmux-claude.plist
```

새 데몬이 정상 기동하면 새 세션에서 plugin 이 다시 로드되고 reply 툴이 복구된다.

## 재발 방지

세션 진입 시 텔레그램 발화에 응답해야 하는데 reply 툴이 없으면 곧장 이 패턴을 발사한다 — HTTP API fallback 으로 폰에 알린 뒤 plist 검증 + v3 restart. 단, 이 패턴은 **PATH 에 `~/.bun/bin` 누락이라는 특정 원인** 한정이다. plist 가 다른 이유(ProgramArguments / KeepAlive / RunAtLoad)로 깨진 케이스는 별도 진단이 필요하다.
