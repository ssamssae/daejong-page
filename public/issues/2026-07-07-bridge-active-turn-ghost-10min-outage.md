---
prevention_deferred: null
---

# claude-telegram-bridge active_turn 유령 잔류 — Fable 리밋 후 인바운드 10분 먹통

- **발생 일자:** 2026-07-07 20:28 KST
- **해결 일자:** 2026-07-07 21:12 KST (코드 fix PR merge)
- **심각도:** high
- **재발 가능성:** medium
- **영향 범위:** 노트북 claude 세션 / `claude-telegram-bridge.py` 인바운드 주입 경로 / watchdog 회복 전까지 텔레그램 메시지 미주입

## 증상
20:33:20 KST 아니키가 텔레그램으로 보낸 `"ㅎㅇ"`(update 268907106)가 큐에는 들어갔지만 Claude 세션에 주입되지 않았다. 이후 약 10분 동안 브릿지는 3~4초 간격으로 `BUSY skip inject state=generating` 만 반복했고, 20:43:00 watchdog 재시작 전까지 후속 인바운드가 처리되지 않았다.

## 원인
원인 사슬은 다음 순서로 확정됐다.

1. 20:28:19 KST 텔레그램 인바운드 update 268907105가 당시 노트북 claude 세션 `99cdc125`에 주입되어 턴이 진행 중이었다.
2. 20:28:59 KST 해당 세션 JSONL 마지막 assistant가 `"You've reached your Fable 5 limit. Run /usage-credits to continue or switch models with /model."` 로 끝났다. Fable 5 리밋이 턴 중간에 걸렸고, 브릿지는 이 턴의 정상 최종답변을 받지 못해 `active_turn` 을 계속 보유했다.
3. 20:30:55 KST `claude-tmux.service` main process가 `exit status=1` 로 종료되며 tmux 세션이 소멸했다. 브릿지 로그에는 `JSONL watch error: tmux session not found` 가 남았다. systemd 는 20:30:59 KST 새 세션 `9ca8b861` 로 재기동했다.
4. 20:30:56 KST 브릿지가 재바인딩했지만, 죽은 옛 세션 파일 `99cdc125.jsonl` offset `3094388` 을 계속 watch 했다.
5. 코드 실측상 `release_completed_active_turn_if_recorded` 는 queue terminal/outbox 기록이 없어 불발했고, `release_stale_active_turn_if_idle` 은 pending_* 가드(`claude-telegram-bridge.py:3127`)에 차단됐다. 동시에 `busy_state()` 는 active_turn 존재 시 무조건 `"generating"` 으로 단락했다(`claude-telegram-bridge.py:2990-2991`).
6. 그 결과 죽은 턴의 `active_turn` 이 유령처럼 남아 후속 인바운드는 큐잉만 되고 주입되지 않았다.

요약: Fable 리밋(턴 중) → Claude 프로세스 사망(tmux 소멸) → 브릿지 `active_turn` 유령 잔류 + stale 세션 재바인딩 → `busy_state` 영구 `"generating"` → 인바운드 큐잉만 되고 미주입 → watchdog 10분 임계로만 회복.

## 조치
20:43:00 KST 기존 `claude-bridge-watchdog` 의 `stuck_pending_check` 가 `"queued msg not injected"` 임계에 도달해 브릿지를 재시작했다. 새 프로세스가 현행 세션 `9ca8b861` 에 바인딩했고, `QUEUE stuck pending age=587s` 를 감지한 뒤 지연경고 봉투로 후속 메시지를 주입했다. 공백은 총 약 10분이었다.

근본 수정은 T-260707-52 / claude-automations PR#495 에서 적용됐다. `tmux session not found` 또는 capture_pane의 tmux 세션 소멸 확인 시 진행 중 `active_turn` 을 즉시 `stale_released` 로 해제하고, 회귀 테스트를 추가했다.

## 예방 (Forcing function 우선)
tmux 세션 소멸이 확인된 순간 브릿지가 죽은 턴을 더 이상 진행 중으로 붙들지 않게 한다. watchdog 10분 임계까지 기다리는 대신 다음 폴링 사이클에서 후속 인바운드가 주입될 수 있어야 한다.

- **막을 코드/훅:** `https://github.com/ssamssae/claude-automations/pull/495` — T-260707-52 "Release bridge active_turn on tmux session loss" (작성 시점 `MERGED`, mergedAt `2026-07-07T12:12:15Z`)
- **기존 안전망:** `claude-bridge-watchdog` `stuck_pending_check` 는 이번 회복의 주역이었다. 단 임계까지 약 10분 공백이 생기는 한계가 있어, PR#495가 즉시 해제 레일을 보강한다.

## 재발 이력
<처음 생성>

## 관련 링크
- 코드 fix: `https://github.com/ssamssae/claude-automations/pull/495`
- task: `T-260707-52`
- 인접 이슈: `issues/2026-06-26-telegram-bridge-background-turn-not-mirrored.md`
- 인접 이슈: `issues/2026-06-27-bridge-flow-mirror-final-report-missed.md`
- 인접 이슈: `issues/2026-06-28-codex-bridge-typing-stuck-on-interrupt.md`
