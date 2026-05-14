---
prevention_deferred: null
---

# tmux-claude.plist 의 PATH 누락으로 텔레그램 plugin 자동 재기동 시 spawn 실패

- **발생 일자:** 2026-05-14 09:04 KST (mac-mini 자동 재기동 시점부터 재발 패턴)
- **해결 일자:** 2026-05-14 19:23 KST
- **심각도:** medium (특정 사용자 봇 통로 끊김, 외부 데이터 손실 없음)
- **재발 가능성:** high (본진 `com.user.tmux-claude.plist` / `com.user.tmux-main.plist` 에도 같은 PATH 누락 잔존)
- **영향 범위:** mac-mini Claude Code 의 텔레그램 봇 `@MyClaude4`. 잠재적으로 본진의 동일 plist 잡

## 증상
mac-mini 텔레그램 봇 (`@MyClaude4`) 이 9:04 AM 부터 강대종 메시지에 응답 안 함. `/mcp` 화면에 `plugin:telegram:telegram` 등장 X. `/plugin` 입력 시 `Failed to reconnect to plugin:telegram:telegram` 노출. claude 본체 프로세스의 자식 프로세스 0건 — 즉 telegram MCP server 가 spawn 자체 안 됨.

1차 임시 복구: cache 디렉토리 (`~/.claude/plugins/cache/claude-plugins-official/telegram`) 삭제 + `claude --dangerously-skip-permissions` 수동 재시작 → 일시 복구. 약 2시간 후 자동 재기동 시점에 동일 증상 재발.

## 원인
두 가지 root cause 가 겹침:

1. **launchd plist 의 EnvironmentVariables.PATH 누락** (진짜 원인):
   - `.mcp.json` 의 spawn 명령 = `bun run --cwd ${CLAUDE_PLUGIN_ROOT} --shell=bun --silent start`
   - bun 실제 위치 = `/Users/user/.bun/bin/bun` (homebrew 가 아님)
   - launchd 잡 `com.user.tmux-claude` 의 PATH = `/usr/bin:/bin:/usr/sbin:/sbin` (bun 없음)
   - → launchd 가 claude 부팅하면 plugin spawn 시 bun 못 찾음 → MCP server 안 뜸 → "Failed to reconnect"
   - 강대종 수동 `claude --dangerously-skip-permissions` 시엔 zsh login PATH (`~/.bun/bin` 포함) → 일시 복구
   - 비교: `com.claude.agent-inbox-watcher` plist 엔 EnvironmentVariables.PATH 박혀있어서 정상 작동

2. **plist 자체가 invalid XML** (보조 원인, strict mode 충돌):
   - line 11 의 `<string>cd ~ && ... 2>/dev/null || ...</string>` 에서 `&&` 가 XML escape 안 됨 (`&amp;&amp;` 이어야 함)
   - 어제까지는 launchd 가 우연히 받아들였지만 오늘부터 strict 해진 정황 (macOS 업데이트 등 추정, 정확한 trigger 미확인)
   - plutil / PlistBuddy 둘 다 "Encountered unknown ampersand-escape sequence at line 11" 로 read 거부
   - 이 invalid XML 때문에 PlistBuddy 로 EnvironmentVariables 추가 시도하면 plist 가 더 broken 됨

## 조치
1. Python `plistlib` 으로 plist 새로 작성 (XML escape 자동 처리)
   - `&&` → `&amp;&amp;`
   - `2>` → `2&gt;`
   - `plutil -lint` 검증: OK
2. `EnvironmentVariables.PATH` = `/Users/user/.bun/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin` 추가
3. `launchctl bootout gui/501/com.user.tmux-claude` + `launchctl bootstrap gui/501 <plist>` 재로드
4. 옛 claude tmux 세션 kill + `launchctl kickstart -k gui/501/com.user.tmux-claude` → 새 claude 세션 19:15:38 부팅
5. 검증: 새 claude PID 24854 의 자식 24867 = `bun run --cwd .../telegram/0.0.6 --shell=bun --silent start` ← telegram MCP server 정상 spawn ✅
6. 백업 4개 보관:
   - `.bak.2026-05-14` (자동 백업 추정)
   - `.bak-rtk-2026-05-14` (원본 2차)
   - `.bak-rtk-2026-05-14-broken` (PlistBuddy 손상본)
   - 현재 = plistlib valid
7. 추가: 본진 launchd 점검 결과 `com.user.tmux-claude.plist` + `com.user.tmux-main.plist` 둘 다 PATH 누락 (동일 함정). 본진 SoT 영역이라 직접 미수정, mac-report 로 surface 만.

## 예방 (Forcing function 우선)
1. **자동 plist lint hook**: 모든 노드 (Mac 본진 / mac-mini / WSL / desktop3060ti) 의 `~/Library/LaunchAgents/com.user.*.plist` + `com.claude.*.plist` 또는 동등 systemd unit 에 대해:
   - `plutil -lint` 통과 검증 (XML valid)
   - `EnvironmentVariables.PATH` 존재 + homebrew/bun 경로 포함 여부 검증
   - 매주 1회 cron 또는 새 plist 추가 시 git commit hook 강제
   - 실패 시 강대종 텔레그램 즉시 알림

2. **plist 작성 표준 = Python `plistlib` 만**: PlistBuddy / 수동 XML 편집 금지 (XML escape 실수 ↓). 새 launchd 잡 만들 때 항상 `plistlib.dump()` 경유. 보일러플레이트 1개 마련 (`~/.claude/skills/...` 또는 `~/claude-skills/snippets/`).

3. **plugin install 시 spawn command 가 minimal PATH 에서 찾히는지 검증**: 새 plugin install 시 `.mcp.json` 의 `command` 값을 추출해서 `/usr/bin:/bin:/usr/sbin:/sbin` 환경에서 `command -v` 로 찾을 수 있는지 검증. 못 찾으면 EnvironmentVariables.PATH 박는 안내.

## 재발 이력
(초기 작성. 이번이 첫 박제.)

## 관련 링크
- 1차 mac-report (cache rm 임시 복구): `/tmp/mac-mini-telegram-plugin-recovery-2026-05-14.md`
- 2차 mac-report (root cause 영구 패치): `/tmp/mac-mini-telegram-plugin-rootcause-patch-2026-05-14.md`
- 본진 동일 함정 잔존: `~/Library/LaunchAgents/com.user.tmux-claude.plist` + `com.user.tmux-main.plist` (둘 다 EnvironmentVariables.PATH 없음)
- 텔레그램 메시지: id 978 (재발 보고), id 985 (root cause 확정), id 999 (영구 패치 완료)
- RTK 0.39 설치 동시 진행 (mac-mini brew install): `rtk init -g` + settings.json PreToolUse hook 추가
- 관련 메모리: (있다면 추가)
