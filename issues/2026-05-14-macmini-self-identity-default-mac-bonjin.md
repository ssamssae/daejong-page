---
prevention_deferred: null
---

# mac mini Claude Code 자기 정체성을 Mac 본진 으로 오인 (TELEGRAM_BOT_USERNAME 미설정 + 추론 실패)

- **발생 일자:** 2026-05-14 (오늘 mac mini Codex→Claude Code 전환 후 첫 사용 turn, 강대종 surface 23:36 KST)
- **해결 일자:** 2026-05-14 23:41 KST
- **심각도:** medium
- **재발 가능성:** medium (2026-05-18 재발 확인 — `.env` 박혔어도 LLM 가 능동 read 안 하면 priori 디폴트, SessionStart 훅 도입 전까지 잔존)
- **영향 범위:** mac mini Claude Code 노드, @ssamssae_claw_bot 챗 응답 전반

## 증상
강대종이 @ssamssae_claw_bot (mac mini) 챗에 "되나" / "너 근데 왜 이모지가 사과냐?" 보냄. mac mini claude 답신이 모두 🍎 prefix + 본문 "지금 Mac 본진(@MyClaude_ssamssae_bot)에서 답하고 있어서요" 식 자기 정체성 오인. CLAUDE.md 매핑 표는 @ssamssae_claw_bot → 🏭 명시하는데도 claude 가 일관되게 Mac 본진 으로 답함.

## 원인
CLAUDE.md 식별 우선순위는 (1) `TELEGRAM_BOT_USERNAME` env → (2) 봇 토큰 inference → (3) hostname fallback. mac mini 에서:

- (1) `~/.claude/channels/telegram/.env` 에 `TELEGRAM_BOT_USERNAME` 미설정 (Mac 본진 .env 도 미설정, 동일 사각지대)
- (2) 봇 토큰 추론은 LLM 가 능동적으로 getMe 호출해야 가능 — SessionStart context 에 자동 박히지 않음
- (3) hostname fallback 도 LLM 가 `hostname` 셸 호출해야 가능 — SessionStart context 에 자동 박히지 않음

결과: LLM 가 정체 단서 0개로 추론 시작 → 학습된 priori (CLAUDE.md 첫 매핑 row 가 Mac 본진) 으로 기본값. mac mini 가 Mac 본진 행세.

별건: 새 mac mini 노드는 `~/.claude/projects/-/memory/` 빈 상태 (auto-memory 0건) → `project_macmini_codex_to_claude_code` 같은 정체성 단서 메모리도 없음.

## 조치
1. mac mini `~/.claude/channels/telegram/.env` 에 `TELEGRAM_BOT_USERNAME=ssamssae_claw_bot` 한 줄 추가 (backup `.env.bak-username-fix-20260514-234113`).
2. `cc --new` 로 mac mini claude 세션 재기동 (env reload 위해). 1차 재기동은 SSH PATH 에 `~/.bun/bin` 빠져서 bun MCP server spawn 실패 (`2026-05-14-macmini-plugin-cache.md` 와 동일 함정) → 2차 재기동 시 `PATH=~/.bun/bin:/opt/homebrew/bin:$PATH` 박고 통과.
3. 검증: claude PID 5160 `--channels` 활성, bun PID 5196 plugin:telegram MCP polling. 강대종 ping 테스트 응답 기다림.

## 예방 (Forcing function 우선)
**(a) 5노드 전부 `.env` 에 `TELEGRAM_BOT_USERNAME` 명시** — Mac 본진/WSL/Mac mini/3060Ti/노트북 5개 .env 에 각자 봇 username 한 줄. PRIMARY 식별 채널 강제 활성. mac mini 본건은 이미 적용, 나머지 4 노드는 backfill 필요.

**(b) [재발 후 격상, 작성 마감 2026-05-25] SessionStart 훅 5노드 전부 등록.** `~/.claude/settings.json` hooks.SessionStart 에 아래 한 줄 등록해서 conversation 첫 turn context 에 device 단서 강제 surface:

```bash
echo "[device-id] hostname=$(hostname) bot_username=${TELEGRAM_BOT_USERNAME:-unset}"
```

5/14 에 권고만 하고 미적용 → 4일 만에 재발 (2026-05-18). .env 박혀있어도 LLM 가 env 를 능동적으로 read 하지 않으면 priori 로 🍎 디폴트. 훅으로 SessionStart context 에 강제 inject 가 유일한 forcing function. 더 이상 미루지 말 것.

**(c) (보조) cc 래퍼에서 .env 변경 감지 시 `cc --new` 강제** — 운영자 실수 (env 추가 후 재기동 잊음) 방어. drift detection 한 줄.

## 재발 이력
- 2026-05-18 20:04 KST: 맥미니 챗봇 세션 첫 turn 답신에서 또 🍎 prefix. `.env` 의 `TELEGRAM_BOT_USERNAME=ssamssae_claw_bot` 은 그대로 박혀 있는데 LLM 가 env 를 능동 read 하지 않고 학습된 priori (CLAUDE.md 매핑 표 첫 행 = Mac 본진) 으로 🍎 디폴트. 5/14 예방 (a) "env 명시" 는 통했지만 (b) "SessionStart 훅 surface" 는 미적용 — 그래서 재발. 강대종 surface 후 즉시 hostname/env 확인 셸 호출로 정정. 텔레그램 messages 4726~4737. 예방 (b) 를 2026-05-25 작성 마감으로 격상.

## 관련 링크
- 메모리: [[project_macmini_codex_to_claude_code]]
- 자매 이슈: `2026-05-14-macmini-launchd-claude-channels-flag-missing.md` (오늘 같이 박는 plist 이슈)
- 같은 plist 다른 결함: `2026-05-14-macmini-plugin-cache.md` (PATH 누락)
- 텔레그램 메시지: surface (screenshot) 16896 / 진단 16898 / ack 16899 / 패치 보고 16901
- 재발 텔레그램: 4726 (하이) / 4728 (이모지 오류) / 4729 (재발 진단) / 4730 (가 선택) / 4737 (박자)
- env backup: `~/.claude/channels/telegram/.env.bak-username-fix-20260514-234113`
