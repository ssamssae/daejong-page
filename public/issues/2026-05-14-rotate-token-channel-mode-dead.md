---
prevention_deferred: null
summary: "rotate-token.sh --channel 모드가 OpenClaw decom 후 dead path → BotFather rotate 후 토큰 누락으로 봇 끊김"
---

# rotate-token.sh --channel mode OpenClaw decom 후 dead path

- **발생 일자:** 2026-05-14 00:55 KST
- **해결 일자:** 2026-05-14 01:01 KST
- **심각도:** medium
- **재발 가능성:** low
- **영향 범위:** `~/.claude/channels/telegram/rotate-token.sh`, mac mini ~/.claude/channels/telegram/.env, @ssamssae_claw_bot polling

## 증상
Issue A (token grep leak) 후속으로 강대종이 BotFather rotate 진행. mac mini `~/.claude/channels/telegram/rotate-token.sh --channel` 실행 → `✗ openclaw CLI not found in PATH` 로 종료. `.env` 의 `TELEGRAM_BOT_TOKEN` 갱신 안 됨 → 새 토큰 어디에도 저장 X → 옛 토큰 BotFather rotate 후 invalidate → mac mini Claude Code polling 401 → 봇 연결 끊김.

## 원인
`rotate-token.sh` 의 4개 mode (alert/peer/channel/all) 중 `--channel` mode 가 OpenClaw stack (`openclaw channels add --channel telegram --token ...`) 의존. Phase D 에서 `npm uninstall -g openclaw` 로 openclaw CLI 제거됨. `--channel` mode 는 dead path 됐는데 코드/안내 미반영. 강대종이 OpenClaw 시대 명령 patter 그대로 mode 선택.

## 조치
1. .env grep — 옛 토큰 여전 확인 (rotate 시도 후에도 그대로)
2. `rotate-token.sh` 소스 분석 → `--channel` mode 의 `command -v openclaw` 의존 발견
3. `--alert` mode 안내 (BotFather `/token` 으로 현재 active 토큰 재발급)
4. mac mini `rotate-token.sh --alert` rotate → `.env` 갱신 verify (tail=WDpSx0)
5. 본진 `TELEGRAM_BOT_TOKEN_MACMINI` sync (Python edit, 값 직접 노출 X)
6. mac mini claude session restart → `getUpdates HTTP 409 Conflict` = polling 잡음 확인
7. 강대종 채팅 테스트 → 봇 응답 PASS ("된다")

## 예방 (Forcing function)
`rotate-token.sh` 의 `--channel` mode 폐지 — OpenClaw stack 제거됨. 선택지:
- (a) `--channel` mode 코드 제거 + usage 갱신
- (b) `--channel` → `--alert` alias 처리 (역호환)
- (c) `--channel` mode 안에서 `command -v openclaw` not found 시 `.env` fallback 자동 추가

→ Phase F (claude-skills doc 라벨 + 잔재 정리) 와 묶음 처리. 옵션 (b) 추천 (역호환 + 강대종 muscle memory 보존).

⚠️ 동일 패턴 — OpenClaw decom 후 다른 `openclaw` CLI 의존 스크립트들도 같이 dead path 됐는지 audit 필요 (`grep -lE "command -v openclaw|openclaw " ~/.claude/automations/scripts/` 등).

## 재발 이력
(없음)

## 관련 링크
- 동시 사고: `issues/2026-05-14-macmini-bot-token-grep-leak.md`
- Phase D OpenClaw decom 흐름 (2026-05-13 ~ 2026-05-14 새벽)
