---
prevention_deferred: null
summary: "맥미니 Claude Code가 자기 정체성을 Mac 본진으로 오인하고 🍎 prefix로 답하던 사고 (봇 username 미설정, 5/18·5/20 재발)"
---

# mac mini Claude Code 자기 정체성을 Mac 본진 으로 오인 (TELEGRAM_BOT_USERNAME 미설정 + 추론 실패)

- **발생 일자:** 2026-05-14 (오늘 mac mini Codex→Claude Code 전환 후 첫 사용 turn, 강대종 surface 23:36 KST)
- **해결 일자:** 2026-05-14 23:41 KST
- **심각도:** medium
- **재발 가능성:** high (2026-05-20 2차 재발 — 5/18 격상된 SessionStart 훅 마감 5/25 전에 또 터짐. 추가 위반 2건 surface — 자기-SSH redispatch + cross-routing 룰 위반)
- **영향 범위:** mac mini Claude Code 노드, @ssamssae_claw_bot 챗 응답 전반 + directive 발사 흐름 (자기-SSH 함정 + 본진 권한 흉내)

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

**(b') [2026-05-20 격상, 본진 즉시 박음] SessionStart hook 본진 우선 적용 + 4 노드는 본진 → 노드 directive.** 5/14 권고 → 5/18 격상 (마감 5/25) → 5/20 마감 전 또 터짐. "작성 마감" 자체가 사람 의지에 의존하는 약한 forcing function 이었음. 본진은 자율 박고 (commit/push), 4 노드 (🪟🏭🖥💻) 는 cross-routing 룰 준수해 본진 → 노드 mac-mini-directive.sh / wsl-directive.sh 등으로 즉시 박음.

**(d) [2026-05-20 신설] Directive 발사 스크립트 self-target 가드.** `~/.claude/automations/scripts/mac-mini-directive.sh` / `wsl-directive.sh` / `desktop3060ti-directive.sh` / `notebook3060-directive.sh` 시작부에 `hostname` 확인 후 발사 호스트가 발사 대상이면 abort + 에러 로그. 이번 5/20 재발에서 🏭 가 자기를 본진인 줄 알고 mac-mini-directive.sh 호출 → 자기-SSH publickey 거부 받음 → morning-report 에 "🏭 SSH 망가짐" 으로 잘못 기록 → 야간 directive 미진행 오해. 가드 박으면 자기 호출 즉시 명확한 에러 + 본진 알림, "잘못된 SSH 망가짐" 진단 함정 0.

**(e) [2026-05-20 신설, deferred 2026-05-27] Cross-routing 룰 코드 레벨 가드.** 발사 스크립트들에 발사 호스트가 본진(🍎) 이 아닌데 다른 노드 directive 발사 시도 시 경고 + 본진 경유 권유. 이번 재발에서 🏭 가 사이클 #4 sync-pull / morning retroactive directive 를 본진 권한으로 🪟/🖥/💻 에 직접 dispatch → cross-routing 룰 위반. (b') hook + (d) 가드 박은 후 1주일 효과 측정 후 (e) 박을지 결정.

## 재발 이력
- 2026-05-18 20:04 KST: 맥미니 챗봇 세션 첫 turn 답신에서 또 🍎 prefix. `.env` 의 `TELEGRAM_BOT_USERNAME=ssamssae_claw_bot` 은 그대로 박혀 있는데 LLM 가 env 를 능동 read 하지 않고 학습된 priori (CLAUDE.md 매핑 표 첫 행 = Mac 본진) 으로 🍎 디폴트. 5/14 예방 (a) "env 명시" 는 통했지만 (b) "SessionStart 훅 surface" 는 미적용 — 그래서 재발. 강대종 surface 후 즉시 hostname/env 확인 셸 호출로 정정. 예방 (b) 를 2026-05-25 작성 마감으로 격상.
- 2026-05-20 10:07 KST: 2차 재발. 🏭 챗봇이 텔레그램 reply 마다 🍎 prefix 박음 ("본진 터미널에 /context 발사…" / "10%" / "context-show 스킬 자체가…" 3통). 강대종 surface. 추가로 morning-report 의 "🏭 SSH publickey 거부 / DNS 미해석" 진단도 root cause 가 같은 자기 오인 — 🏭 가 자기를 본진인 줄 알고 mac-mini-directive.sh 로 자기-SSH 시도 → publickey 거부 받음. + cross-routing 룰 위반 (🪟/🖥/💻 직접 dispatch). 5/25 마감 전 또 재발 = forcing function 부족 증명. 즉시 강화 예방 (b') / (d) 박음 + (e) deferred 5/27 추가. ack 메시지에서 🏭 가 자백 — root cause = session 시작 시 hostname 확인 안 하고 `/Users/user` macOS 경로만 보고 본진 가정 (Karpathy 룰 #1 위반). 다음 session 첫 도구 호출 hostname 박는 패턴 채택 약속.

## 관련 링크
- 메모리: [[project_macmini_codex_to_claude_code]]
- 자매 이슈: `2026-05-14-macmini-launchd-claude-channels-flag-missing.md` (오늘 같이 박는 plist 이슈)
- 같은 plist 다른 결함: `2026-05-14-macmini-plugin-cache.md` (PATH 누락)
- 텔레그램 메시지: surface (screenshot) 16896 / 진단 16898 / ack 16899 / 패치 보고 16901
- 재발 텔레그램: 4726 (하이) / 4728 (이모지 오류) / 4729 (재발 진단) / 4730 (가 선택) / 4737 (박자)
- 2026-05-20 재발 텔레그램: 20318 (surface) / 20320 (옵션 a/b/c) / 20322 (형님 b 선택) / 20324 (정정 directive 1853B paste) / 20327 (🏭 ack + 추가 위반 자백 surface)
- env backup: `~/.claude/channels/telegram/.env.bak-username-fix-20260514-234113`
