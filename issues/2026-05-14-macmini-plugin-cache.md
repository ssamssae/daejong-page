---
prevention_deferred: null
summary: "맥미니 Claude Code 텔레그램 plugin cache 손상으로 MCP server spawn 침묵 실패 → 봇 응답 끊김"
---

# mac mini Claude Code 텔레그램 plugin cache 손상

- **발생 일자:** 2026-05-14 09:04 KST
- **해결 일자:** 2026-05-14 11:26 KST
- **심각도:** medium
- **재발 가능성:** medium
- **영향 범위:** mac mini `@MyClaude4` 봇 (Codex → Claude Code 전환 후 새 봇), Claude Code `plugin:telegram` MCP server spawn

## 증상

~7:12 KST 마지막 정상 응답 ("ㅎㅇ 👋") 후 9:04 KST 부터 봇 응답 없음. 진단 시점에:

- claude PID 살아있음 (welcome screen idle)
- `settings.json` `enabledPlugins.telegram@claude-plugins-official: true` 정상
- `installed_plugins.json` cache path 등록됨
- 그러나 ToolSearch `telegram` 검색 0건 (Gmail/Calendar/Drive 만 활성)
- claude 본체 자식 프로세스 0건 = MCP server spawn 침묵 실패
- `/plugin` 슬래시 실행 시 **"Failed to reconnect to plugin:telegram:telegram"** ← 결정적 단서

## 원인

plugin cache (`~/.claude/plugins/cache/claude-plugins-official/telegram`) 손상 추정. 9:21 KST 즈음 claude 한 번 죽었다 재시작된 흔적 (tmux `claude` 세션 새로 생성됨). root cause = **미확인** — 시스템 로그 9:00~9:30 구간 claude 관련 0건, `/tmp/com.user.tmux-claude.err.log` 비어있음. 후보:

- 시스템 업데이트
- `kill -9` 등 비정상 종료
- 디스크 IO 오류

## 조치

1. **옵션 A** `settings.json enabledPlugins.telegram` true→false→true 토글 — claude 결론 "in-flight 토글 현 세션 무효, 재시작 필요". 50% 진행 후 막힘.
2. **옵션 B** tmux kill + `launchctl kickstart` 재시작 — 새 세션 부팅됐지만 MCP server 여전 spawn X, ToolSearch telegram 여전 0건.
3. **옵션 C (성공)**:
   - `rm -rf ~/.claude/plugins/cache/claude-plugins-official/telegram`
   - `/exit` → `claude --dangerously-skip-permissions` 재시작
   - `/mcp` 화면에서 `plugin:telegram:telegram ✓ connected · 4 tools` 확인
   - 강대종 메시지 "되나" / "되냐지" → 봇 typing indicator 정상
4. **다른 노드 cache 점검** (본진 / WSL / desktop3060ti / hermes) — 전 노드 `0.0.6/` 정상 + claude 자식 프로세스 존재 = 본 사고는 mac mini 단발.

## 예방 (Forcing function)

**(a) claude SessionStart 훅 — MCP server spawn 검증** 채택.

- SessionStart hook 에서 plugin auto-reinstall 마친 시점에 `pgrep -P $(pgrep -f claude)` 자식 프로세스 ≥ 1 확인
- 0이면 텔레그램 경고 (cache reset 명령 inline) + claude 재시작 안내
- 5초 wait 대기 후 검증 — auto-reinstall 시간 변동성 고려 (false positive 우려, 검증 필요)

(검토 X 후보: (b) 외부 cron 30분 ping / (c) `/plugin` 슬래시 자동 cache reset)

⚠️ hook 본 구현은 별도 작업 — `~/.claude/automations/scripts/hooks/session-start/` 위치에 `mcp-spawn-verify.sh` 추가 + `settings.json` 등록 필요. 본 issue 박제는 forcing function 선택만 픽스.

## 재발 이력

(없음)

## 관련 링크

- 동시 작업: 데스크탑3060Ti mac-report (2026-05-14 11:23 KST) → 본진 paste 운반
- 동일 봇 같은 날 별건: `2026-05-14-rotate-token-channel-mode-dead.md` (00:55 KST, 원인 = rotate-token.sh `--channel` mode dead path, polling 401. 본 plugin cache 사고와 원인 레이어 다름)
- 텔레그램 메시지: surface 16568 / forcing function 컨펌 16571 / 채택 16587 / 박제 진행 보고
