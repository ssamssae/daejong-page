# claude-telegram-bridge — 백그라운드 task-notification 턴의 보고가 텔레그램에 미러 안 됨

- 날짜: 2026-06-26 (KST)
- 노드: 🏭 맥미니 (claude-telegram-bridge, @ssamssae_claw_bot)
- 증상: 텔레그램에서 시킨 긴 작업(코덱스↔클로드 3왕복 토론) 중, 라운드2/라운드3/최종결론 보고가 아니키 폰에 **안 도착**. 아니키가 받은 마지막 메시지는 "라운드2 진행 중...잠깐만요"(백그라운드 폴링 시작 직전).

## 진단 (실측)
- `~/.claude/state/claude-telegram-bridge-macmini.outbox.json` 의 sent_message_ids 타임스탬프를 보면 토론 구간 약 3시간(ts 1782447630 → 1782458995) 동안 outbox 전송이 거의 없음. 그 사이 터미널엔 라운드2/3/결론 텍스트를 여러 번 emit 했는데 실제 발송 0.
- `claude-telegram-bridge-egress.json`: 세션별 `claimed_turn_nonce` 로 발송을 관리. 텔레그램 origin 턴은 nonce 를 claim 하지만, **백그라운드 명령 완료(`<task-notification>`)로 재진입한 턴은 텔레그램 origin 이 아니라 nonce 를 claim 안 함** → 그 턴의 Stop 텍스트가 미러 대상에서 빠짐.

## 근본 원인
긴 폴링을 `run_in_background` 로 돌리면, 완료 시 `<task-notification>` 으로 턴이 재진입한다. 이 턴은 텔레그램 user 메시지가 트리거가 아니라 **내부 이벤트** 트리거라, 브릿지가 "이 턴의 최종 텍스트를 어느 텔레그램 메시지의 답으로 보낼지" 매핑을 못 해 미러를 건너뛴다. 결과적으로 사용자-facing 보고가 터미널에만 남고 폰엔 안 감.

## 임시 복구 (2026-06-26 적용)
누락된 토론 결론을 **Bot API sendMessage 직접 발송**(봇 토큰 + chat_id <CHAT_ID>)으로 재전송 → ok:true 확인.

## 재발방지
1. **행동 룰(즉시)**: 텔레그램-origin 작업 중에는 긴 대기/폴링을 `run_in_background` 로 돌려 task-notification 턴에 보고를 의존하지 말 것. 폴링은 foreground 의 bounded 턴으로 짧게 끊고, 백그라운드를 썼으면 **핵심 보고는 텔레그램-origin 턴에서 다시 내거나 Bot API sendMessage 직접 발송**으로 확정.
2. **직접발송 fallback**: 비-텔레그램-origin 턴에서 꼭 내보내야 할 보고는 mac-report 처럼 Bot API `sendMessage` 직접 경로 사용(미러 의존 X). 첫 줄에 `[직접발송]` 태그.
3. **인프라(후속 task)**: 브릿지가 active 텔레그램 세션 내에서는 task-notification 등 비-origin Stop 이벤트의 최종 텍스트도 미러하도록(마지막 활성 chat 으로) 개선 검토. 단 이중송신/오발송 가드 필요.

## 교훈
- "터미널에 보고 emit" ≠ "폰에 도착". 브릿지 미러는 텔레그램-origin 턴 기준이라, 백그라운드/내부 트리거 턴은 사각.
- 긴 작업일수록 중간보고를 직접발송으로 확정하는 게 안전.
