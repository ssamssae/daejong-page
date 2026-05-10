---
prevention_deferred: null
---

# launchd 자동 /clear 트리거 abort 반복 — busy-loop 시 fire 마다 timeout

- **발생 일자:** 2026-05-11 00:52 KST
- **해결 일자:** 2026-05-11 00:57 KST (자연 idle 도래로 1회 발화 성공, 구조적 fix 는 미완)
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** Mac 본진 launchd `com.daejongkang.session-clear-watcher` → `~/.claude/automations/hooks/session-clear-trigger.sh` v2.2, 자동 /clear 파이프라인

## 증상
새 텔레그램 메시지가 연속 도착하는 동안 자동 /clear 트리거가 fire 마다 20초 idle 폴링 중 "esc to interrupt" 못 사라져 timeout abort. v2.2 fix 로 마커 파일은 abort 시 유지되지만, 결국 자연 idle 도래까지 5+회 abort 누적. 강대종 입장에서는 "/clear 가 한참 안 됨" 으로 보임.

로그(`/tmp/session-clear-trigger.log`):
```
[00:52:07] fired, marker=exists
[00:52:19] rescue: marker still exists after 15s, idle-check start
[00:52:28] timeout waiting for idle, abort
[00:52:41] rescue: timeout, abort
[00:54:00] fired, marker=exists
[00:54:20] timeout waiting for idle, abort
... (5+회 abort 반복) ...
[00:57:31] fired, marker=exists
[00:57:33] pane=%2 mode=0 ready(❯), sending /clear
[00:57:34] done
```

## 원인
v2.2 트리거가 tmux pane 캡처 결과에서 "esc to interrupt" 부재를 idle 시그널로 사용 (`for i in $(seq 1 20); do sleep 1; ...`). 텔레그램 메시지 도착 → 새 turn 시작 → busy 마커("esc to interrupt") 갱신. 메시지 간격이 20초 이내면 idle window 영원히 안 옴 → abort. rescue 스크립트도 같은 idle-check 로직 사용해 동시 abort.

v2.1 → v2.2 fix 는 "abort 시 마커 파일 보존"만 해결한 것 (이전엔 마커가 polling 전 rm 돼서 영원히 못 발화). 즉 "발화 못 함" 자체는 v2.2 에서도 그대로 남음. 결과적으로 자연 idle 갭이 생길 때까지 노이즈 abort 가 누적되며, 강대종이 그 사이 "안 됨" 으로 인지하게 됨.

## 조치
2026-05-11 00:57 KST: 자연 idle 도래로 v2.2 트리거가 /clear 1회 발화 성공.
즉시 코드 수정 없음 — 강대종이 직접 /clear 입력 또는 외부 `tmux send-keys -t claude:0 -l '/clear' && tmux send-keys -t claude:0 Enter` 우회 안내됨.

## 예방 (Forcing function 우선)
1. **trigger v2.3 — retry counter + 텔레그램 알림**: abort 시 `/tmp/do-session-clear.retry` 카운터 증가. 5회 누적 abort 시 텔레그램 1통 알림 ("자동 /clear N분째 fire 못 함. 직접 입력 또는 외부 tmux send-keys 필요"). 알림 본문에 외부 강제 명령(`tmux send-keys -t claude:0 -l '/clear' && tmux send-keys -t claude:0 Enter`) 한 줄 박아 long-press copy 즉시 우회 가능. 마커는 v2.2 그대로 유지. 발화 성공 시 카운터 리셋.
2. 알림은 사람 의지 의존 최소화 — 강대종이 모르고 30분 대기하는 사고 차단(이번 건의 핵심).
3. (옵션) `~/.claude/automations/scripts/force-clear.sh` 추가 — idle 무시 강제 send-keys. 텔레그램 봇 트리거 "/force-clear" 호출 시 발화. 강대종 명시 호출 = 본인 책임이라 입력 중 박혀도 허용.

## 재발 이력

## 관련 링크
- 트리거 코드: `~/.claude/automations/hooks/session-clear-trigger.sh` (v2.2)
- launchd plist: `~/Library/LaunchAgents/com.daejongkang.session-clear-watcher.plist`
- 로그: `/tmp/session-clear-trigger.log` (00:52~00:57 abort 5+회)
- 인접 이슈: `2026-05-09-clear-queued-during-processing.md` (다른 건 — 응답 처리 중 슬래시 큐잉, 정상 동작)
- 이전 fix: v2.1 → v2.2 (rm -f MARKER 를 polling 후로 이동)
