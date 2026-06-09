---
prevention_deferred: null
---

# 텔레그램 "입력중…" 인디케이터가 cross-turn 백그라운드 작업 중 끊김

- **발생 일자:** 2026-05-21 19:08~19:20 KST (엘리헤어 리뷰 쇼츠 ffmpeg 빌드 중)
- **발견 일자:** 2026-05-21 19:18 KST (형님 지적, msg 21468 "입력중... 안떠 아이들같은디")
- **심각도:** low (기능 정상, UX/안심 신호만)
- **재발 가능성:** high (긴 빌드/인코딩/배포를 백그라운드로 돌릴 때마다)
- **영향 범위:** 텔레그램 세션에서 1분+ 백그라운드 작업(ffmpeg/빌드/배포) 진행 중 형님 체감

## 증상
영상 인코딩을 `run_in_background` 로 돌리고 챗봇이 turn 을 끝낸 뒤 wakeup/알림을 기다리는 동안, 텔레그램 "입력중…" 인디케이터가 ~5초 후 사라져 형님이 "멈춘 거 아니냐(idle 같다)"고 의심. 실제로는 백그라운드 ffmpeg 가 정상 진행 중이었음.

## 원인
기존 typing 데몬(`~/.claude/hooks.bak/telegram-typing-{start,daemon,stop}.sh`)은 **turn 단위**로 설계됨 — UserPromptSubmit 훅에서 spawn → Stop 훅에서 kill. 챗봇이 긴 작업을 백그라운드로 던지고 turn 을 끝내면 Stop 이 발생해 데몬이 죽음. 즉 인디케이터 수명이 "작업"이 아니라 "turn"에 묶여 있어, turn 을 넘기는 백그라운드 작업은 구조적으로 커버 못 함. (게다가 이 데몬들은 현재 hooks.bak 으로 비활성 상태 — 텔레그램 플러그인이 turn 중 typing 을 자체 처리.)

## 조치
- `~/claude-automations/scripts/tg-typing.sh` 신설 — turn 이 아니라 **작업 수명**에 묶인 keepalive. `start [max_min]` 로 켜고 `stop` 으로 끔. 4초마다 sendChatAction(typing), 기본 15분 안전캡 자동 종료, stopfile 즉시 종료. 토큰 비용 0(텔레그램 API 만). 토큰은 ps 노출 피하려 .env 직접 read.
- 챗봇 운영 룰: 텔레그램 세션에서 1분+ 백그라운드 작업(ffmpeg/빌드/배포) 시작 시 `tg-typing.sh start` 동반 호출, 완료/재진입 시 `stop`. 메모리 `feedback_tg_typing_keepalive_for_bg_work` 신설.

## 예방 (Forcing function)
1. **메모리 룰**(이번 사이클): `feedback_tg_typing_keepalive_for_bg_work` — telegram 세션 + 긴 bg 작업 = start/stop 동반.
2. **자동 wiring 은 형님 결정 대기**: PreToolUse 훅으로 `run_in_background` Bash 감지 시 자동 start 도 가능하나 settings.json 변경 + per-event 비용이라 형님 ack 후에만. 디폴트는 수동 호출(환경 변경 0).

## 재발 이력
<처음 생성>

## 관련 링크
- 스크립트: `~/claude-automations/scripts/tg-typing.sh`
- 비활성 선행 구현: `~/.claude/hooks.bak/telegram-typing-{start,daemon,stop}.sh`
- 메모리: `feedback_chat_action_during_directive`, `feedback_tg_typing_keepalive_for_bg_work`
- 텔레그램: msg 21468(지적) → 21469(살아있음 안내)
