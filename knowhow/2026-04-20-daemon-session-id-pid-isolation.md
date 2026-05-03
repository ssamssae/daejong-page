---
category: 자동화
tags: [daemon, claude-code, session-id, pid, isolation, hooks, telegram, pkill]
related_issues:
  - 2026-04-20-telegram-typing-midsession-drop
---

# Claude Code 훅 기동 데몬은 세션 ID 기반 PID 파일로 격리

- **첫 발견:** 2026-04-20 (텔레그램 typing 데몬이 sibling 세션 Stop 훅에 격추)
- **재사용 영역:** Claude Code 세션 수명주기에 딸린 모든 백그라운드 데몬 — UserPromptSubmit/Stop 훅에서 기동하는 모든 프로세스

## 한 줄 요약

Claude Code 가 Stop/UserPromptSubmit 훅에 JSON stdin 으로 `session_id` 를 넘겨준다. 이를 `jq -r '.session_id'` 로 파싱해 PID 파일 키로 쓰면 **병렬 세션 간 격추 0** + **오펀 세션 단독 kill 가능**. `pkill -f` 전역 패턴만 쓰면 sibling 세션이 멀쩡한 데몬을 죽인다.

## 패턴 코드

```bash
#!/usr/bin/env bash
# telegram-typing-start.sh — UserPromptSubmit hook

# 훅 stdin JSON 에서 session_id 추출
SESSION_ID=$(cat - | jq -r '.session_id // empty' 2>/dev/null)
# fallback: stdin 소진 후 transcript 경로 basename
if [ -z "$SESSION_ID" ]; then
  SESSION_ID="${CLAUDE_SESSION_ID:-fallback-$$}"
fi
# 8자 prefix 로 짧게
SID="${SESSION_ID:0:8}"

PID_FILE="/tmp/claude-daemon-${SID}.pid"
LOG_FILE="/tmp/claude-daemon-heartbeat.log"

# 같은 세션 daemon 이미 살아있으면 재스폰 대신 신호만
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  exit 0
fi

# TTY 완전 분리 (set -e 제거 필수)
nohup bash daemon-loop.sh "$SID" "$LOG_FILE" </dev/null >/dev/null 2>&1 &
echo $! > "$PID_FILE"
disown
```

```bash
#!/usr/bin/env bash
# telegram-typing-stop.sh — Stop hook

SESSION_ID=$(cat - | jq -r '.session_id // empty' 2>/dev/null)
SID="${SESSION_ID:0:8}"
PID_FILE="/tmp/claude-daemon-${SID}.pid"

# session_id 없으면 아무것도 하지 않음 (sibling 데몬 오격추 방지)
if [ -z "$SID" ] || [ "$SID" = "fallback" ]; then
  exit 0
fi

if [ -f "$PID_FILE" ]; then
  kill "$(cat "$PID_FILE")" 2>/dev/null || true
  rm -f "$PID_FILE"
fi
```

## 핵심 룰

1. **PID 파일 키 = session_id 8자 prefix** — 세션마다 다른 파일, 다른 PID.
2. **session_id 없으면 stop 훅은 아무것도 안 함** — `MISSING` 같은 단일 fallback 키 = 전역 nuke 재현. 안전 가드 필수.
3. **daemon-loop.sh 에서 `set -e` 금지** — 부수 오류로 silent 조기 exit 방지.
4. **TTY 3종 세트** — `</dev/null >/dev/null 2>&1 &` + `disown`. 부모 TTY 에 묶이면 parent exit 시 같이 죽음.
5. **heartbeat 로그** — `daemon-heartbeat.log` 에 60초마다 timestamp + HTTP 코드. 다음 "끊김" 신고 때 즉시 진단 가능.

## 기존 패턴(전역 pkill)과 차이

| 구분 | `bg-daemon-pkill-pattern` | 이 패턴 |
|------|--------------------------|---------|
| 오펀 청소 | `pkill -f <pattern>` 전역 | SessionStart 훅에서 "부모 없는 PID" 만 골라 kill |
| 세션 격리 | X (전역) | 세션별 PID 파일 `/tmp/...-<SID>.pid` |
| sibling 격추 위험 | 있음 | 없음 |
| Stop 훅 안전 가드 | 없음 | session_id 없으면 아무것도 안 함 |

## Forcing Function

- 새 Claude Code 훅 기동 데몬 PR review 체크리스트:
  - `jq -r '.session_id'` stdin 파싱 있는가?
  - PID 파일 경로에 session prefix 포함되는가?
  - Stop 훅에 session_id 없을 때 guard 있는가?
  - daemon-loop 에 `set -e` 없는가?
  - disown 있는가?

## 함정

- `CLAUDE_SESSION_ID` 환경변수는 훅 프로세스에 **주입되지 않음** — 반드시 stdin JSON 에서 파싱.
- stdin 은 1회 소비 — start/stop 스크립트 상단에서 변수에 저장 후 사용.
- UserPromptSubmit 훅은 transcript flush 전 발화 — transcript grep 으로 텔레그램 채널 확인 시 race 조심 (2026-04-26 3차 재발 원인). stdin `.prompt` 필드 읽기가 안전.

## 관련 이슈 (포스트모템)

- `issues/2026-04-20-telegram-typing-midsession-drop.md` (3차 재발 포함 전 과정)
- `knowhow/2026-04-15-bg-daemon-pkill-pattern.md` (전 단계 — 전역 pkill 패턴)
