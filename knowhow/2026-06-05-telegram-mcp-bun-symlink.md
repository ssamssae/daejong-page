---
title: "telegram MCP 가 bun 을 못 찾아 끊길 때 — bun 을 /opt/homebrew/bin 에 심링크로 근본 차단"
tags: [telegram, mcp, bun, path, symlink, homebrew, plugin, reconnect, launchd]
date: 2026-06-05
---

# telegram MCP 가 bun 을 못 찾아 끊길 때 — bun 을 /opt/homebrew/bin 에 심링크로 근본 차단

텔레그램 plugin(MCP)의 spawn 명령은 `bun run --cwd <plugin> --shell=bun --silent start` 다. 즉 plugin 이 뜨려면 실행 환경의 PATH 에서 `bun` 을 찾을 수 있어야 한다. 그런데 bun 은 보통 `~/.bun/bin/bun` 에만 있고 표준 PATH(`/opt/homebrew/bin`, `/usr/bin`, `/bin`)엔 없다. 그래서 PATH 에 `~/.bun/bin` 이 안 들어간 환경에서 세션이 뜨면 plugin 이 spawn 실패 → `/mcp` 가 `Failed to connect`(또는 ENOENT) → reply 툴이 로드되지 않아 폰으로 답이 안 나간다.

이 한 가지 원인이 **세 번 재발**했다 — 2026-05-14(mac-mini), 2026-05-28(본진, plist PATH 누락), 2026-06-05(본진, 바이너리 prefix 이전 중 임시 재기동).

## 왜 plist PATH fix 만으로는 안 막혔나

직전까지의 대책은 `com.user.tmux-claude.plist` 의 `export PATH` 라인에 `/Users/user/.bun/bin` 을 넣는 것이었다(2026-05-28). 이건 **launchd 정규 기동 경로**만 보장한다. 2026-06-05 에는 claude 바이너리를 `~/.npm-global` → `/opt/homebrew` prefix 로 옮긴 뒤 세션을 plist 를 안 거치고 임시로 재기동했는데, 그 임시 환경엔 plist 의 PATH 가 적용되지 않아 또 끊겼다. 즉 "어느 경로로 재시작했냐"에 대책이 의존하는 한, 새는 경로가 계속 생긴다.

## 근본 차단 — bun 을 표준 PATH 에 심링크

```sh
ln -s ~/.bun/bin/bun /opt/homebrew/bin/bun
```

claude 를 homebrew prefix(`/opt/homebrew`)로 설치해 두면 `/opt/homebrew/bin` 은 정규(plist)·비정규(바이너리 이전, 수동 임시 재시작) 어떤 재기동 경로에서도 PATH 에 거의 항상 들어 있다. bun 을 거기 심링크해 두면 PATH 조합과 무관하게 `bun` 이 잡힌다. 대책이 "재시작 경로"가 아니라 "bun 의 위치" 자체를 고치므로 새는 경로가 없다.

검증 — 최소 PATH(비정규 재기동 환경 모사)에서 bun 이 잡히는지:

```sh
env -i PATH=/opt/homebrew/bin:/usr/bin:/bin bash -c 'command -v bun'
# → /opt/homebrew/bin/bun  (PASS)
```

가역적이다. 되돌리려면 `rm /opt/homebrew/bin/bun` (심링크만 제거, 원본 `~/.bun/bin/bun` 은 그대로).

## 재발 시 첫 점검

같은 "telegram MCP Failed to connect / reply 툴 없음" 증상이 또 보이면 진단 순서를 단축한다:

```sh
ls -la /opt/homebrew/bin/bun     # 심링크 살아있나
```

없으면 위 `ln -s` 한 줄로 재생성. 있는데도 안 되면 그때서야 plist PATH / cold-restart(bootout→pkill→bootstrap) 등 기존 경로를 본다.

## 함께 보기

- 채널이 이미 끊긴 순간의 응급 대응(HTTP API fallback + plist fix)은 별도 노하우 `2026-05-30-telegram-plugin-enoent-http-fallback` 참조. 이 노하우(심링크)는 그 끊김이 **다시 일어나지 않게** 하는 영구 차단책이다.
