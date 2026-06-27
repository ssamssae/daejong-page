---
name: 2026-05-29-autopilot-schedulewakeup-leak
date: 2026-05-29
type: incident
status: open
device: mac-master
related-skill: autopilot
---

# autopilot 마감 후 ScheduleWakeup 누수로 자동 재발화

## 증상

아니키가 텔레그램으로 보낸 msg27871: "오토파일럿 아까 끈거같은데 두번이나 왜 자꾸 켜졌어?"

2026-05-29 하루 동안 autopilot 트리거 흔적 4건:
1. ~13:01 KST — cycle 1~3 (9 PR 머지)
2. 14:29 KST — cycle 4 새로 시작. `state.json.bak-cycle4` trigger 메모: **"cycle #3 끝나자마자 재트리거 14:29 KST"**. cycle 3 자연 종료 후 1분 내 자동 재발화.
3. 16:25 KST — 또 새 사이클 (cycle 4 마감 15:59 + 26분 갭, PR #163~167)
4. 17:18 KST — 본진 새 세션 (아니키가 명시 종료 의도로 보낸 메시지가 아니라, /clear 후 다시 `/loop 오토파일럿 켜줘` 텍스트가 들어와서 본진이 새로 진입)

## 원인 추정

- CronList 비어 있음 (no scheduled jobs)
- TaskList 비어 있음 (no background tasks)
- launchctl list 에 autopilot 잡 0
- 텔레그램 channel 메타 없는 시점에 autopilot 재진입 → launchd / cron 트리거 아님

가장 가능성 큰 메커니즘: autopilot SKILL.md Step 5(e) "마감 시각 도달 → ScheduleWakeup 박지 X → 종료" 룰이 실제 본진 종료 코드에서 누락된 채로 박혔음. self-pace tick 이 마감 후에도 계속 살아 다음 wakeup 에 새 사이클로 재진입.

근거 패턴:
- (2) cycle 3 종료 직후 1분 내 재발화 = wakeup tick 이 종료 후 즉시 fire
- (3) cycle 4 마감 15:59 + 26분 갭 = wakeup tick 이 마감 전 박혀 있다가 25~55분 delay 후 fire

## 영향

- 아니키 명시 ack 없이 매 90분~3시간 자동으로 노드 fan-out 발생 → 의도하지 않은 토큰 소비 + 의도하지 않은 PR 머지/스토어 영향 가능성 (이번엔 docs/spec only PR 들이라 무사)
- 아니키 폰에서 "끄고 자려고 했는데 다시 켜짐" 인식 → trust 손실

## 즉시 조치 (이 turn)

- `state.json.stop_event` 박아 17:18 명시 종료 기록
- ScheduleWakeup 호출 X — 이 turn 끝나면 self-pace tick 완전 사망
- 노트북 T-260524-48 진행 중 작업은 자기 끝낼 때까지 굴리고 보고는 inbox 파일로 쌓이게

## Forcing function (follow-up)

autopilot SKILL.md / 본진 자율 종료 코드에 박을 룰:

1. **마감 도달 사이클 = 마지막 사이클**. morning-report 발사 후 ScheduleWakeup 절대 호출 X. 한 번 더 자고 일어나려는 충동을 코드 흐름에서 차단.
2. **stop_event 박힌 state.json 발견 시 = autopilot 진입 거부**. 새 트리거가 와도 "이전 사이클이 명시 종료됨, 새로 시작 ack 받음?" 한 줄 surface 후 stop.
3. **/loop 으로 autopilot 진입했을 때 마감 직전 텔레그램 한 줄 발사**: "🍎 autopilot N분 후 마감, 다음 사이클 박지 X" — 아니키가 잘못된 자동 발화 즉시 인식 가능.

## 관련

- skills/autopilot/SKILL.md Step 5
- feedback_workstealing_toggle_no_ack (별 룰, 토글은 그대로 유지)
- feedback_autopilot_keep_nodes_loaded (idle 방치 금지 룰 — 이 룰 위에 (1) 마감 = 진짜 종료 룰을 얹는 것)
