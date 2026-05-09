---
prevention_deferred: null
---

# /clear 후 이전 세션 typing daemon 좀비 잔류

- **발생 일자:** 2026-05-09 16:10 KST (/clear 시점)
- **해결 일자:** 2026-05-09 16:27 KST (수동 kill)
- **심각도:** low (UX — 작업 안 하는데 "입력 중" 표시)
- **재발 가능성:** high
- **영향 범위:** Telegram typing heartbeat daemon, session-clear 전후

## 증상
/clear 또는 세션 종료 후 텔레그램에서 "입력 중" 표시가 계속 남아 있음.
`/tmp/claude-telegram-typing-*.pid` 파일 2개(세션 b76ff59f, 8fd458c1)가
PID 13182, 19598로 살아있었고 heartbeat를 계속 전송 중이었음.

## 원인
Stop 훅(telegram-typing-stop.sh)은 Claude Code 프로세스 종료 시에만 발화.
`/clear` 는 대화만 리셋하고 프로세스는 유지 → Stop 훅 미발화.
결과적으로 이전 세션 ID(b76ff59f)의 daemon이 PID 파일과 함께 무기한 잔류.
새 세션이 시작돼도 이전 세션 PID 파일을 정리하는 로직이 없음.

## 조치
수동으로 두 PID(13182, 19598) kill + PID 파일 삭제.

## 예방 (Forcing function 우선)
1. **session-clear 스킬 Step 4에 cleanup 추가**: /clear 전송 직전
   모든 `/tmp/claude-telegram-typing-*.pid` 프로세스를 kill + 파일 삭제.
   → session-clear/SKILL.md Step 4 수정 완료 (2026-05-09).
2. **UserPromptSubmit hook(start.sh)에 고아 PID 정리 추가**: 새 세션 첫
   telegram prompt 수신 시, 현재 세션 ID와 다른 PID 파일 중 부모 프로세스가
   없는 것(孤兒)만 kill (sibling 데몬 보호 유지).
   → telegram-typing-start.sh 수정 완료 (2026-05-09).

## 재발 이력
<없음>

## 관련 링크
- 관련 이슈: `2026-04-20-telegram-typing-midsession-drop.md`
- 텔레그램 메시지: id 14701
