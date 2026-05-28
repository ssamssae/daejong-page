# 본진 텔레그램 MCP plugin ENOENT — plist PATH 에 ~/.bun/bin 누락으로 reply 툴 미로드 1시간

- **발생 일자:** 2026-05-28 16:08 KST 직후 (decrypt-run.sh wrap 적용 재기동 시점)
- **가시화:** 2026-05-28 16:10 KST (형님 "코덱스 몇 시 보트 진행" 메시지 reply 안 감)
- **해결 일자:** 2026-05-28 17:14:58 KST (본진 자력 v3 restart 성공, 새 daemon pid 68182 정상 plugin 로드)
- **심각도:** high (텔레그램 양방향 채널 1시간 silent 끊김, 형님 폰에 본진 응답 0)
- **재발 가능성:** medium (decrypt-run.sh wrap / plist 수동 편집 시마다 PATH 상속 끊길 위험)
- **영향 범위:** 🍎 본진 텔레그램 채널 (mcp__plugin_telegram_telegram__reply 툴 부재)

## 증상

16:10 KST 형님 "코덱스 몇 시 보트 진행" → 16:45~46 "왜 멈췄냐 / 멈췄냐" 흐름. 본진 응답 0건 보이는 상태로 약 35분 경과. tmux `claude` 세션은 살아있어서 폴링은 정상 동작 — 형님 메시지가 tmux 까지 도달했지만 reply 가 외부로 못 나감.

가시 증상:
- 본진 turn 에 `mcp__plugin_telegram_telegram__reply` 툴이 안 박힘 (ToolSearch "select:mcp__plugin_telegram_telegram__reply" → No matching deferred tools)
- `/mcp` 명령 → `Failed to reconnect to plugin:telegram:telegram: ENOENT`
- `ps aux | grep "claude --channels"` → daemon pid 47081 정상 running
- bot HTTP API 직접 호출 (curl sendMessage) 은 PASS — 폴링 / 봇 토큰은 문제 없음

## 탐지

16:49:01 KST 본진 자가 진단 (b66d864e 세션):
1. 폴링 데몬 pid 살아있음 확인 (ps)
2. `ToolSearch` 결과 reply 툴 zero matches → plugin init 실패 확정
3. bot HTTP API fallback 으로 형님 폰에 진단 1통 발사 (msg27058)

17:13~17:14 KST WSL 측 병렬 진단 (ebfe5e77 세션):
- 형님 "하이" (msg9010) WSL 채널로 도달
- WSL 이 `ssh mac '/opt/homebrew/bin/tmux capture-pane -t claude -p'` 로 본진 tmux 화면 캡처 → ENOENT 메시지 확인
- 본진 plugins filesystem 검증: installed_plugins.json / marketplace / telegram 0.0.6 cache / bun-node which/version
- 17:15:12 KST 형님께 원인 분석 reply (msg9014): "plist PATH 에 ~/.bun/bin 빠져있던 게 root cause"

## 근본 원인

`com.user.tmux-claude.plist` 의 inline `export PATH` 에 `~/.bun/bin` (= `/Users/user/.bun/bin`) 누락.

```xml
<string>... export PATH=/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin && exec /Users/user/infra-config/scripts/decrypt-run.sh --profile telegram /opt/homebrew/bin/claude --channels plugin:telegram@claude-plugins-official</string>
```

- telegram plugin 의 `.mcp.json` 은 `bun run --cwd ${CLAUDE_PLUGIN_ROOT} --shell=bun --silent start` 로 spawn
- `bun` 바이너리 위치 = `/Users/user/.bun/bin/bun` (homebrew/usr 어디에도 없음)
- launchd 가 plist 의 정의된 PATH 외 부모 셸의 `.zshrc` PATH 를 상속 안 함 → MCP server 가 `bun` 못 찾고 ENOENT
- daemon 본체 (`claude --channels`) 는 `/opt/homebrew/bin/claude` 절대경로라 정상 시작 → 폴링 OK, plugin spawn 만 실패 → reply 툴 누락

타이밍: 16:08 KST 에 코덱스(직전 사이클)가 `com.user.tmux-claude.plist` 의 `command` 를 `decrypt-run.sh --profile telegram` wrap 으로 전환 + restart 적용. 이 wrap 변환 자체는 OK 였지만 PATH 라인이 누락된 상태로 plist 가 박혀있던 것을 깨우지 못함 (직전 비교 검증 갭).

## 복구

본진 자력 fix (b66d864e 세션 17:13~17:14 KST):
1. 진단 (~/.claude/plugins/cache/.../telegram/0.0.6/.mcp.json 읽음 → bun spawn 명령 확인)
2. `which bun` 실패 + `~/.bun/bin/bun` 실재 확인
3. plist 의 symlink 추적: `~/Library/LaunchAgents/com.user.tmux-claude.plist` → `/Users/user/claude-automations/launchd/com.user.tmux-claude.plist`
4. Edit: PATH 문자열 prepend `/Users/user/.bun/bin:` (한 라인 surgical change)
5. `/tmp/restart-v3.sh` 발사 — `launchctl bootout` + `pkill -KILL -f "claude --channels"` + `launchctl bootstrap` + tmux session 재생성 검증

17:14:58 KST 새 daemon pid 68182 + tmux `claude` session 재생성 → 새 c8139fdf 세션이 17:15:03 KST 부터 backlog 메시지 처리 시작 → reply 툴 정상 박힘.

WSL 측 기여: 같은 root cause 진단을 SSH 경유 병렬 도달 + 형님께 별 채널 reply (msg9014). 실제 fix 액션은 본진이 수행.

## 재발방지

1. **글로벌 룰 — 본진 telegram plugin 이 죽으면 ToolSearch + HTTP API fallback 패턴**: reply 툴이 turn 에 안 박혀있으면 (ToolSearch zero) 즉시 bot HTTP API curl 으로 형님께 진단 1통 발사. 본 사이클 16:49 KST 패턴이 표준. 메모리에 박을 것 (`feedback_telegram_plugin_enoent_http_fallback`).

2. **plist PATH 검증 자동화 (deferred)** — `com.user.tmux-claude.plist` 의 PATH 라인에 `~/.bun/bin` 포함 확인. 후보 = launchd plist 가 정의한 PATH 와 `~/.zshrc`/login shell PATH diff 비교 health check. 본진 launchd plist 수동 편집 (코덱스 wrap, decrypt-run, profile 정리 등) 후 자동 verify 단계 추가. 본 사이클은 별 task 로 분리 (구현 비용 30분+).

3. **plist 수동 편집 후 cold-restart 검증 의무** — `launchctl kickstart -k` 만 쓰면 기존 프로세스 살아있으면 새 plist 안 읽음 (사이클 17:05 v1 sticky issue). `launchctl bootout` + `pkill -KILL -f "claude --channels"` + `launchctl bootstrap` 의 v3 패턴이 표준. 이미 본진 자력 fix 흐름에서 검증됨.

4. **direct fallback 메커니즘 표준화 (deferred)** — bot HTTP API curl 호출을 wrapper 스크립트로 박아 본진 reply 툴 부재 시 즉시 호출 가능. 본 사이클은 inline curl 으로 즉응했지만, 재발 시 더 빠른 fallback 가능. 별 task.

5. **재발 시 본 이슈 참조 + 즉시 v3 패턴 재발사** — 동일 ENOENT 패턴 잡히면 진단 단계 skip, plist PATH 검증 + v3 restart 발사 1동작.

## 사이드 노트

- 본진 자체 16:49 KST 진단 → 17:14 KST fix 까지 약 25분 소요. 형님 폰 침묵 = 16:10 ~ 17:14 KST 약 1시간 (재기동 후 backlog 처리 포함).
- 형님 인식: "wsl 에서 복구해줬어" — 실제는 본진 자력 fix + WSL 병렬 진단 reply 둘 다 17:14~17:15 동시간에 진행. WSL reply (msg9014) 가 형님 폰에 17:15:13 KST 도달했고 본진 c8139fdf 첫 reply 가 17:16:34 KST 도달. WSL 진단 채널이 형님 입장에서는 가시적 "복구해줬다" 신호.
- 이 사고로 직전 사이클 핸드오프가 stale carry 박음 — c8139fdf 세션의 next-cycle.md 가 "본진 정상 흐름" 만 기록하고 16:08~17:14 plugin ENOENT 1시간 갭 누락. 재발방지로 핸드오프 carry 작성 시 ToolSearch reply 부재 자동 verify 추가 검토 (별 task).
