---
category: 자동화
tags: [daemon, pkill, claude-code, lifecycle, orphan, cleanup]
related_issues:
  - 2026-04-15-telegram-typing-daemon-orphan
---

# 장시간 백그라운드 데몬은 pkill 패턴 매칭으로 전/후 청소 디폴트

- **첫 발견:** 2026-04-15 (텔레그램 typing-start 데몬 오펀 누적)
- **재사용 영역:** Claude Code 세션 수명주기에 딸린 모든 백그라운드 데몬 — typing-start, mail-watcher, telegram bot daemon, file watcher 등.

## 한 줄 요약

세션이 강제 종료되면 자식 데몬에 종료 신호가 전달되지 않아 오펀으로 살아남고, 다음 세션이 시작될 때 같은 데몬이 또 올라와 누적된다. **PID 기반 종료에 의존하지 말고 `pkill -f <고유패턴>` 를 데몬 기동 스크립트의 전/후 모두 박는다.**

## 패턴 코드

```bash
#!/usr/bin/env bash
# my-bg-daemon.sh — 장시간 백그라운드 데몬 기동 스크립트

DAEMON_PATTERN="my-bg-daemon-loop"   # ps 에 보이는 고유 식별 키워드

# 1) 기동 전: 같은 패턴 데몬 전부 청소 (이전 세션 오펀 + 중복 기동 방지)
pkill -f "$DAEMON_PATTERN" 2>/dev/null || true

# 2) 데몬 본체 시작
nohup python3 -u my-bg-daemon-loop.py >/tmp/my-bg-daemon.log 2>&1 &
echo $! > /tmp/my-bg-daemon.pid

# 3) 종료 훅 (trap, Stop hook, 또는 별도 stop 스크립트)에서도 같은 pkill
trap 'pkill -f "$DAEMON_PATTERN" 2>/dev/null' EXIT
```

## 핵심 룰

1. **PID 파일 단독 신뢰 금지** — 강제 종료 시 PID 파일은 stale, 실제 프로세스는 다른 PID 로 살아있을 수 있음.
2. **기동 전 청소가 0차 reflex** — `pkill -f` 한 줄을 스크립트 상단에 박아 idempotent 보장.
3. **고유 패턴 신중 선정** — `pkill -f python` 같은 광범위 패턴 X, `pkill -f my-bg-daemon-loop.py` 식 specific.
4. **종료 훅도 같은 pkill** — 정상 종료 경로에서도 명시적 cleanup, 시스템 신호 의존 X.

## 적용 후보

- 텔레그램 typing-start / typing-stop 데몬
- mail-watcher v5 (Gmail OAuth 폴링)
- telegram-bot/inbox listener
- 파일 감시 데몬 (fswatch / watchman 류)
- Claude Code SessionStart 훅에서 띄우는 모든 백그라운드 잡

## Forcing Function

- 신규 백그라운드 데몬 기동 스크립트 review 시 `pkill -f` 라인 존재 확인 = 0차 점검 항목.
- SessionStart 훅에서 관련 데몬이 1개 이하인지 확인하고, 1개 초과면 자동 pkill (재발 1회 더 보고 도입).

## 함정

- `pkill -f <pattern>` 의 pattern 이 너무 짧으면 무관한 프로세스까지 죽임. CLAUDE.md feedback 룰 `feedback_no_broad_kill.md` 도 같은 함정 — Stop-Process java 류 광범위 종료 금지.
- macOS 와 Linux pkill 옵션 차이 주의 (`-f` 는 양쪽 호환 OK).

## 관련 이슈 (포스트모템)

- `issues/2026-04-15-telegram-typing-daemon-orphan.md` (이전됨)
