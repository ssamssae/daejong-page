# session-clear /clear 안 발화 — 실패 모드 카탈로그 + v0.8 fallback 갈아타기

`/clear` 가 안 먹힐 때 의심해야 하는 실패 모드 5종 + 각 fix + 권장 흐름. 2026-04~05 사이 발견된 마커 / polling / 큐잉 / busy-loop 함정을 한 자리에 묶음.

## 핵심

session-clear 는 launchd WatchPaths 가 `/private/tmp/do-session-clear` 마커 생성을 감지하면 trigger 스크립트가 tmux 'claude' 세션의 pane 에 `/clear`+Enter 를 send-keys 하는 구조. 깨지는 자리 5군데:

1. **polling 조건 오탐** — pane 에 `shells` 토큰이 idle 에도 항상 보여 false busy 판정
2. **입력 버퍼 잔여** — `/clear` 가 잔여 텍스트와 붙어 명령 깨짐
3. **마커 조기 소모 race** — abort 전에 marker 가 rm 돼서 다음 fire 가 영원히 안 옴
4. **/clear 큐잉** — 응답 처리 중 입력은 즉시 실행 X, 큐에 들어감 (정상 동작)
5. **busy-loop abort** — 챗봇 turn 진행 중 ("esc to interrupt" 잔존) 폴링 timeout abort

## 실패 모드 카탈로그

### 1. polling 조건 오탐 (v1.1 → v1.2 fix, 2026-05-10)

```bash
# 잘못
grep -qE 'shells|esc to interrupt|Running|⎿'
```
`* 8 shells` 라인이 idle 상태에도 항상 표시 → polling 이 영원히 idle 판정 못 함 → /clear 전송 X (최대 30s 대기 후 abort).

**Fix**: grep 조건에서 `shells` 제거. 단독 신호는 `esc to interrupt` 하나만.
**이슈**: `2026-05-10-session-clear-buffer-polling-bug.md`

### 2. 입력 버퍼 잔여 (v1.2 C-u 추가, 2026-05-10)

debugging 도중 `TIMING_TEST` 같은 텍스트가 readline 버퍼에 남으면 `/clear` 가 `❯ TIMING_TEST/clear` 로 붙어 명령 인식 불가. C-c 는 interrupt 만 보내고 라인은 안 지움.

**Fix**: `/clear` 전 `C-u` (라인 클리어) → `-l '/clear'` → Enter 순서.
**이슈**: `2026-05-10-session-clear-buffer-polling-bug.md`

### 3. 마커 조기 소모 race (v2.1 → v2.2 fix, 2026-05-10)

이전 trigger 스크립트는 `[ -f $MARKER ]` 체크 직후 `rm -f $MARKER` → polling. polling timeout abort 시 marker 이미 없어 다음 fire 가 영원히 안 옴 → 강대종이 한참 기다려도 /clear 안 됨.

**Fix**: `rm -f $MARKER` 를 polling **이후 (READY 일 때만)** 로 이동. abort 시 marker 보존 → 자연 idle 도래 시 재fire.
**이슈**: `2026-05-10-session-clear-marker-race.md`, `2026-05-10-session-clear-full-investigation.md`

### 4. /clear 큐잉 동작 (정상, 2026-05-09)

응답 처리 중 텔레그램에서 `/clear` 입력 시 즉시 실행 X. 현재 응답 끝난 뒤 자동 발화. 사용자 입장에서는 "안 먹힌 것처럼" 보이는 UX 함정.

**Fix**: 코드 수정 X (Claude Code 설계 동작). 강대종이 "안 됨" 으로 인지하지 않게 챗봇이 "큐에 들어갔어요, 응답 끝나면 자동 실행" 안내 권장.
**이슈**: `2026-05-09-clear-queued-during-processing.md`

### 5. busy-loop abort — turn 진행 중 fire (2026-05-11 / 2026-05-13 두 번 재발)

가장 빈번한 실제 사고 모드. 시나리오:

1. 강대종 "세션클리어" 발화
2. 챗봇 session-clear 스킬 실행: 후속안 박기 + Telegram reply + `touch /tmp/do-session-clear`
3. **같은 turn 안에서** marker 가 launchd watcher 를 발화시킴
4. 그러나 챗봇 turn 은 아직 안 끝남 (reply 송신 직후, 다음 stop hook 까지 진행 중) → pane 에 `esc to interrupt` 잔존
5. polling 20s 동안 `esc to interrupt` 안 사라짐 → trigger abort, rescue 도 같은 패턴 abort
6. 강대종 "또 안되는디" → 챗봇 marker 재touch → 같은 패턴 또 abort

**Fix (2026-05-13 박제 — 4 조건 명시)**:
- (a) 동일 marker/job abort **3회 누적 시 marker 재시도 금지**
- (b) 즉시 v0.8 fallback 발동 (nohup detached send-keys, 3s delay):
  ```bash
  TBIN=/opt/homebrew/bin/tmux
  PANE=$($TBIN list-panes -a -F '#{session_attached} #{pane_id}' | awk '$1>0{print $2; exit}')
  rm -f /tmp/do-session-clear   # marker 경로 차단
  nohup bash -c "sleep 3 && \
    $TBIN send-keys -t $PANE -X cancel 2>/dev/null; \
    $TBIN send-keys -t $PANE C-u 2>/dev/null; \
    sleep 0.2; \
    $TBIN send-keys -t $PANE -l '/clear' 2>/dev/null; \
    sleep 0.3; \
    $TBIN send-keys -t $PANE Enter 2>/dev/null" \
    >/dev/null 2>&1 &
  disown
  ```
  3초 detached delay 가 챗봇 turn 종료 시점을 흡수 → polling 함정 우회.
- (c) fallback 발동 시 timestamp + retry count 자동 append (issue 재발 이력)
- (d) **챗봇 행동 룰**: marker touch 와 Telegram reply 를 **같은 turn 에 묶지 말 것**. 권장 흐름:
  1) Telegram reply (후속안 보고) → turn 종료
  2) **다음 turn** 에서 marker touch 1줄만 → 즉시 idle 진입 보장

**이슈**: `2026-05-11-launchd-clear-trigger-abort-loop.md` (2026-05-13 재발 등재)

## 권장 흐름 (지금 기준)

1. **/session-clear 트리거** → 후속안 추출 → todos/parking-lot 박기 → Telegram reply 송신 → turn 종료
2. **다음 turn** 에서 typing daemon kill + `touch /tmp/do-session-clear` 1줄 + 빈 응답
3. launchd watcher 가 즉시 idle pane 감지 → /clear 발화 → 세션 초기화

**stuck 시 외부 강제** (어떤 기기에서든):
```bash
ssh mac 'touch /private/tmp/do-session-clear'
```

**3회 abort 누적 시** → marker 재시도 금지, 위 5번 (b) v0.8 fallback 발동.

## 관련 이슈 5건

- `2026-05-09-clear-queued-during-processing.md` — /clear 큐잉 (정상 동작)
- `2026-05-10-session-clear-buffer-polling-bug.md` — shells 오탐 + 입력 버퍼 (v1.1 → v1.2)
- `2026-05-10-session-clear-marker-race.md` — 마커 조기 소모 race (v2.1 → v2.2)
- `2026-05-10-session-clear-full-investigation.md` — 전 구현 실패 원인 종합
- `2026-05-11-launchd-clear-trigger-abort-loop.md` — busy-loop abort (2026-05-13 재발 등재 + v0.8 fallback 박제)

## 관련 정보

- SKILL: `~/.claude/skills/session-clear/SKILL.md` (v2.0, 2026-05-13 turn 분리 절차 + 4-A fallback 섹션 추가)
- 메모리: `feedback_session_clear_marker_busy_loop.md` (다음 세션부터 자동 로드)
- launchd plist: `~/Library/LaunchAgents/com.daejongkang.session-clear-watcher.plist`
- 로그: `/tmp/session-clear-trigger.log` (fire/abort 히스토리)
- trigger: `~/.claude/hooks/session-clear-trigger.sh` (v2.4)
- rescue: `~/.claude/hooks/session-clear-rescue.sh` (v2.1, retry counter)
