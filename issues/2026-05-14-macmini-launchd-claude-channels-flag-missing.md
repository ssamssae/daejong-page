---
prevention_deferred: null
---

# mac mini launchd tmux-claude plist `--channels` 플래그 누락 (cc 첫 진입 시 텔레그램 incoming listen 안 됨)

- **발생 일자:** 2026-05-14 (재부팅 후 매번 재발, 강대종 surface 23:30 KST)
- **해결 일자:** 2026-05-14 23:34 KST
- **심각도:** medium
- **재발 가능성:** low (plist 패치 후 차단)
- **영향 범위:** mac mini Claude Code 노드 (Codex→Claude Code 전환 후 신규), `@ssamssae_claw_bot` 봇 incoming 수신 경로

## 증상
재부팅 후 Ghostty → `m` (tmux main attach) → `cc` 첫 진입 시 텔레그램 플러그인 "연결안된상태" — 강대종이 봇 채팅에 보내도 mac mini claude 가 incoming 메시지 못 받음. /exit 후 다시 `cc` (또는 `cc --new`) 하면 정상화. 강대종 보고 원문: "고스티 켜고 m 누르고 cc 눌러서 들어가면 텔레그램 플러그인 연결안된상태임 거기서 다시 나와서 다시들어가면 또 됨".

## 원인
`~/Library/LaunchAgents/com.user.tmux-claude.plist` 의 `ProgramArguments[2]` 부팅 명령이 `--channels plugin:telegram@claude-plugins-official` 플래그 없이 claude 띄움. `~/bin/cc` 래퍼의 CLAUDE_CMD 는 해당 플래그 포함. 결과 부팅 시퀀스:

1. launchd RunAtLoad → plist 가 `claude --dangerously-skip-permissions` (--channels 없음) 으로 `claude` tmux 세션 생성. MCP server (bun plugin:telegram) 는 `enabledPlugins` 설정으로 자동 spawn 되어 outgoing reply 툴은 동작, 그러나 incoming 메시지 폴링은 비활성.
2. 강대종 `m` → `cc` → cc 가 `tmux has-session -t claude` 체크해서 YES → 기존 세션 재사용 (fresh new-session 안 함). grouped client attach → 텔레그램 incoming 안 들어옴.
3. /exit 후 `cc --new` → 세션 죽이고 fresh 생성, 이번엔 cc 가 --channels 포함해 띄움 → 정상.

검증: 진단 시점 살아있는 claude tmux 세션 = 23:29:09 생성 (재부팅 22:56 + 강대종 cc 재진입 시점), `main` 세션 = 22:58:47 (boot 직후 plist). pane 에 `Listening for channel messages from: plugin:telegram@claude-plugins-official` 줄 present = 현재 세션은 두 번째 진입 결과로 --channels 활성 상태.

별건: 같은 plist 가 오늘 아침 PATH 누락으로 MCP server spawn 자체 실패한 이슈 → `2026-05-14-macmini-plugin-cache.md`. 그건 17:44 PATH 패치로 해결. 본 이슈는 PATH 와 별개로 --channels 플래그 빠진 두 번째 결함.

## 조치
1. plist `ProgramArguments[2]` 를 `cd ~ && tmux has-session -t claude 2>/dev/null || tmux new -d -s claude /opt/homebrew/bin/claude --dangerously-skip-permissions --channels plugin:telegram@claude-plugins-official` 로 PlistBuddy `Set` 패치.
2. backup = `com.user.tmux-claude.plist.bak-channels-fix-20260514-233413`.
3. `plutil -lint` OK 확인.
4. `launchctl bootout gui/501 ...` → `launchctl bootstrap gui/501 ...` reload.
5. `launchctl print` 으로 program 라인에 `--channels plugin:telegram@claude-plugins-official` 등록 확인 + PATH (오늘 17:44 fix) 환경변수 보존 확인.
6. 현재 살아있는 23:29 claude 세션은 건드리지 않음 (강대종 작업 중) — 다음 재부팅 또는 `cc --new` 때 진짜 검증.

## 예방 (Forcing function 우선)
**(a) drift detection — cc 래퍼 CLAUDE_CMD 와 plist ProgramArguments[2] 의 claude 인자 비교** — 둘이 갈라지면 즉시 텔레그램 경고. SessionStart 훅 또는 daily cron 으로 실행. shell 한 줄:

```bash
CC_FLAGS=$(grep -oE 'claude --[^"]*' ~/bin/cc | head -1)
PLIST_FLAGS=$(/usr/libexec/PlistBuddy -c "Print ProgramArguments:2" ~/Library/LaunchAgents/com.user.tmux-claude.plist | grep -oE 'claude --[^|]*' | head -1)
[ "$CC_FLAGS" != "$PLIST_FLAGS" ] && echo "DRIFT: cc=$CC_FLAGS plist=$PLIST_FLAGS"
```

**(b) (보조) launchd plist 부팅 직후 claude 자식 프로세스가 `bun ... plugin:telegram ... start` polling 모드인지 검증 hook** — `2026-05-14-macmini-plugin-cache.md` (b) 와 통합 후보.

## 재발 이력

## 관련 링크
- 메모리: [[project_macmini_codex_to_claude_code]] (2026-05-14 mac mini Codex→Claude Code 전환)
- 자매 이슈: `2026-05-14-macmini-plugin-cache.md` (같은 plist, PATH 누락 결함)
- 텔레그램 메시지: surface 16885 / 강대종 추가 단서 16888 / 진단 보고 16889 / ack 16891 / 패치 보고 16893
- plist backup: `~/Library/LaunchAgents/com.user.tmux-claude.plist.bak-channels-fix-20260514-233413`
