---
prevention_deferred: null
---

# TELEGRAM_BOT_TOKEN_MACMINI 풀텍스트 conversation 노출

- **발생 일자:** 2026-05-13 23:38 KST
- **해결 일자:** 2026-05-14 01:01 KST
- **심각도:** medium
- **재발 가능성:** medium
- **영향 범위:** @ssamssae_claw_bot (mac mini), 본진+맥미니 ~/.claude/channels/telegram/.env

## 증상
OpenClaw decom Phase D 진행 중 mac mini Claude Code 봇 연결 셋업 단계에서 본진 .env 봇 토큰들 등록 상태 확인 위해 `grep "TELEGRAM_BOT_TOKEN" ~/.claude/channels/telegram/.env` 실행. 첫 호출에서 sed/awk 정제 안 함 → TELEGRAM_BOT_TOKEN_MACMINI 풀텍스트가 conversation 로그에 박힘 (`<bot_id>:<35자 hash>` 형식).

## 원인
secret 환경변수 grep 출력 정제 룰 부재. 두 번째 grep 호출에서는 sed redact 했지만 첫 호출이 raw 였음. "secret 파일 grep 결과 노출 금지" forcing function 이 hard rule 로 박혀있지 않았음.

## 조치
1. 즉시 강대종에게 사고 보고
2. setup 끝나면 BotFather rotate 권장 surface
3. 강대종이 BotFather rotate (옛 토큰 invalidate)
4. mac mini `~/.claude/channels/telegram/rotate-token.sh --alert` 로 .env 갱신
5. 본진 TELEGRAM_BOT_TOKEN_MACMINI sync (Python edit, 토큰 값 직접 노출 X)
6. mac mini claude session 재시작 → polling 정상 verify (getUpdates HTTP 409 = polling 잡음)

## 예방 (Forcing function)
secret 들어있는 .env / credential 파일 grep 결과 출력 시 무조건 정제. 표준 패턴:

```bash
grep "KEY=" file | awk -F= '{print "len="length($2), "tail="substr($2,length($2)-5)}'
```

또는 Python 으로 파일 읽고 key 별 length+tail 만 print.

⚠️ Hook 후보: 텔레그램 reply tool 의 pre-output 단에서 38자+ 토큰 형식 (`\d+:[A-Za-z0-9_-]{30,}`) 매칭 시 차단 또는 마스킹. (구현 deferred — Phase F 정리와 묶음)

## 재발 이력
(없음)

## 관련 링크
- 텔레그램 대화: 2026-05-13 23:38 ~ 2026-05-14 01:01 KST (OpenClaw decom Phase D 진행 중)
- 관련 이슈: `issues/2026-05-10-placeholder-paste-loss.md` (다른 봇 토큰 사고 — heredoc placeholder)
