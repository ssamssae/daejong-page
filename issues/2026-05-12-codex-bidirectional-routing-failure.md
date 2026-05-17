---
prevention_deferred: null
summary: "본진→Codex(맥미니) 명령은 가는데 회수 자동 경로 부재 → 형님이 직접 paste 운반해야만 본진이 인지"
---

# Codex(맥미니) ↔ 본진(Mac) 양방향 메시지 자동 회수 경로 부재

- **발생 일자:** 2026-05-12 (11:18 KST A 경로 ping 테스트 + 11:30 KST 경 B 경로 paste 운반)
- **해결 일자:** 미해결 — 회수 자동화 경로 없음. 사람 paste 운반이 유일 검증 경로.
- **심각도:** high (멀티 디바이스 fleet 운영에서 본진이 Codex 결과를 자동으로 받지 못함 = 강대종 hands-off 시간 확보 목표 자체와 충돌)
- **재발 가능성:** 100% (구조적 결함, 코드 변경 없으면 매번 재현)
- **영향 범위:** agent-mesh 6방향 소통, fleet-director Day implementer 결과 회수, 모든 macbook↔macmini 자동 워크플로우

## 증상

본진 챗봇이 Codex(맥미니)에 명령을 보낸 뒤 결과를 자동으로 회수할 수 없다. 강대종이 Codex 응답을 직접 paste 로 본진에 운반해야만 본진이 응답을 인지함.

구체적 테스트 (2026-05-12 11:18 KST):
1. 본진에서 `~/.claude/automations/scripts/agent-msg-notify.sh macbook macmini 명령 "ping. ... 답변은 A 경로(이 텔레그램 채팅 reply)로 보내세요."` 호출
2. `@ssamssae_claw_bot` Telegram chat 에 `[🍎→🏭] [명령] ping...` 메시지 박힘 (스크린샷 확인)
3. mac-mini gateway.log: `11:18:08 [ws] message.action 1036ms channel=telegram` ← 수신 ok
4. mac-mini agent-mesh.log: `11:18 [inbox-watcher] from=macbook body=ping...` → `inject OK: 1778552328-952739C4.json` → Codex 응답 출력 `mac-mini / 2026-05-12 11:19:04 KST`
5. **그러나** gateway.log 에 `[telegram] sendMessage ok chat=538806975` 0건 (= Codex 응답이 Telegram 으로 송신되지 않음)
6. 강대종 폰의 `@ssamssae_claw_bot` chat 에도 응답 안 옴 → 강대종이 다른 어디선가(미상) Codex 응답을 보고 본진 채팅에 paste 로 운반

## 원인

`agent-msg-notify.sh` 가 Telegram chat 으로 메시지를 박지만, mac-mini 의 `inbox-watcher` 가 그 Telegram 메시지를 가로채서 Codex 에 inbox 경로로 inject. Codex 입장에선 메시지가 "inbox 시스템 컨텍스트" 로 들어왔기 때문에 응답을 자기 session stdout 으로 출력하고 끝낸다. Telegram reply 로 라우팅하는 코드 경로가 inject 케이스엔 연결돼 있지 않다.

즉 CLAUDE.md "오답: openclaw system event → 채팅창에 안 보임" 함정과 사실상 같은 구조. agent-msg-notify.sh 가 "Telegram chat 으로 보내지만 inbox-watcher 가 가로채서 system inject 가 되는" 형태로 동작.

B 경로 (`inbox-write.sh --from macmini --to macbook --remote`) 도 검증 시점에 자동 작동 안 함 — Codex 가 응답을 inbox-write 로 다시 쏘는 행동을 trigger 할 명시 가이드/code path 부재. mesh-vote 디버깅 (2026-05-10) 때 한 번 작동했던 흔적은 있으나 (`agent-mesh.log` 18:06 `mesh-vote 1778403512 B+A patch dry test`) 일반 명령에서는 작동 안 함.

## 조치 (현재)

자동 회수 0 → 사람 paste 운반만 가능 상태 그대로 인정. PR #1 머지 같은 후속 액션도 강대종이 paste 로 review 본문을 본진에 옮겨 와서 본진이 컨텍스트 보충 후 판단.

**중요 결론 (강대종 명시 2026-05-12)**
- 현재 A/B 모두 자동 양방향 경로 아님.
- Codex 응답 회수는 **사람 paste 운반이 유일하게 검증된 경로**.
- `agent-msg-notify.sh` 관련 문구는 "명령 전달은 가능하지만 결과 자동 회수는 불가" 로 갱신 필요.

## 재발 방지 (follow-up)

todos / CLAUDE.md 갱신 필요:

1. **CLAUDE.md "맥미니(Codex) 명령 라우팅 — 필독" 섹션 갱신**: 현재 "정답: agent-msg-notify.sh ..." 표현은 명령 도착만 보장. 응답 자동 회수는 보장 X 임을 명시.
2. **fleet-director D07 implementer 영향 검토**: Day implementer 가 mac-mini 에서 결과를 origin 으로 commit/push 하는 형태이므로 양방향 메시지 회수 부재가 즉시 blocker 는 아님. 하지만 ad-hoc 명령 (예: status 확인, manual override) 에서는 강대종 paste 필수 사실 명시.
3. **장기 (P2)**: inbox-watcher 가 가로챈 메시지에 대해 Codex 가 응답할 때, Codex 가 명시적으로 Telegram reply tool 을 호출하도록 prompt template 강제. 또는 응답 후 자동으로 `inbox-write.sh --remote` 호출하는 wrapper.
4. **장기 (P3)**: Telegram chat 자체에 박힌 메시지를 inbox-watcher 가 가로채지 않게 분리. agent-msg-notify.sh 가 박는 메시지는 그대로 chat 에 보이고, Codex 가 chat 메시지로 응답 → chat 으로 reply 가는 정상 흐름 복구.

## 학습

- 문서(CLAUDE.md)와 실제 동작이 어긋날 때, 문서를 믿고 시간 쓰면 본질 진단이 늦어진다. "정답 / 오답" 으로 박혀 있어도 직접 reproducible 테스트로 확인하는 게 빠름.
- agent-mesh.log 와 gateway.log 의 분기 — "수신 ok" 와 "응답 송신 ok" 는 별개 이벤트. 메시지 도착만 확인하면 안 되고, 응답 라우팅의 last leg (sendMessage) 까지 확인해야 함.
- mesh-vote (2026-05-10) 가 한 번 작동했던 건 SESSION_ID + 명시적 라우팅 룰 inject 덕분으로 추정. 일반 자유 형식 명령으로는 안 됨 → 양방향 자동화는 명시적 protocol 위에서만 작동.
