---
date: 2026-05-10
slug: session-clear-full-investigation
status: resolved
affected: session-clear skill (v0.7 ~ v2.0)
fixed_in: v2.1 Stop hook (spinner false-positive 제거)
severity: medium
recurrence: 10회 이상 (v0.7~v2.0 각 버전별 실패)
---

# session-clear 전 구현 실패 원인 + 최종 성공 분석

## 배경

텔레그램에서 "세션초기화" 트리거 → Claude Code tmux 세션에 `/clear` 전송.
2026-05-10 하루 동안 v0.7~v1.8까지 반복 실패 후 최종 성공.
13:37:16 KST 로그로 성공 확인:

```
[13:37:16] fired, marker=exists
[13:37:19] pane=%35 mode=0 idle, sending /clear
[13:37:20] done
```

## 버전별 실패 원인

| 버전 | 방식 | 실패 원인 |
|------|------|-----------|
| v0.7 | C-c → sleep 0.5 → /clear | C-c가 현재 실행 중인 Bash tool 자체를 kill (자기참조 버그) |
| v0.8 | bg sleep 1 + /clear 예약, 그 후 C-c | Bash tool subshell 종료 시 SIGHUP이 백그라운드 프로세스 kill |
| v1.0 | nohup+disown | nohup도 subshell 내 zsh에서 silent fail; zsh job table "not found" 오류 |
| v1.1 | polling (`grep 'shells\|esc to interrupt'`) | `· 8 shells`는 idle 상태에도 항상 표시됨 → 오탐으로 polling 무한 대기 (30초 헛돌기) |
| v1.2 | (nohup …&) subshell + polling 수정 | 백그라운드 방식 자체가 불안정, silent failure 지속 |
| v1.3 | Bash tool에서 직접 tmux send-keys | Bash tool PTY와 Claude 입력 스트림은 별개 → 자기 자신에게 send-keys 불가 |
| v1.4 | Stop hook 마커 방식 (새 turn 감지 없음) | /clear가 새 대화 turn 도중 발화 → 새 메시지 맥락 날림 |

## 핵심 근본 원인 3가지

### 1. 자기참조(Self-referential) 문제
현재 실행 중인 Bash tool에서 C-c 또는 send-keys로 자기 자신이 돌고 있는
tmux pane에 키입력을 보내면 Bash tool 자체가 종료됨 → v0.7~v0.8 공통.

### 2. 백그라운드 프로세스 생존 문제
Bash tool이 종료될 때 zsh가 SIGHUP을 보내 background job 전체 kill.
nohup/disown/subshell 모두 zsh 환경에서 완전하지 않음 → v0.8~v1.2 공통.

### 3. PTY 스트림 분리 문제
`tmux send-keys -t claude '/clear' Enter`는 pane의 키보드 입력 스트림에 주입.
Claude Code 내 Bash tool이 실행하는 것은 별도 subprocess → 두 스트림은 연결 안 됨.
"직접 Bash로 보내면 되지 않나?" 착각 → v1.3 실패.

## 최종 성공 아키텍처 (v1.8 + launchd rescue)

```
skill step 4: touch /tmp/do-session-clear
        │
        ├─ [정상] Stop hook (session-clear-trigger.sh v1.8)
        │         turn 완료 후 자동 발화
        │         → 3s wait → 새 turn 감지 → pane idle 확인 → /clear 전송
        │
        └─ [stuck] launchd rescue (session-clear-rescue.sh)
                  WatchPaths /private/tmp/do-session-clear 감지 즉시 발화
                  → 15s wait (Stop hook이 먼저 처리하면 마커 없으므로 exit)
                  → /clear 전송
```

### v1.8 핵심 추가: 새 turn 감지 abort
```bash
CONTENT=$($TBIN capture-pane -t "$PANE" -p 2>/dev/null)
if echo "$CONTENT" | grep -qE '\* (Running|Zesting|Crunching|Sautéed|Brewing)'; then
  exit 0  # 새 turn 시작됨 → /clear 중단
fi
```
→ 사용자가 세션초기화 후 빠르게 다른 메시지 보내도 새 turn 보호.

### v1.6 send-keys 핵심 3종
```bash
PANE=$($TBIN list-panes -a -F '#{session_attached} #{pane_id}' | awk '$1>0{print $2; exit}')
$TBIN send-keys -t "$PANE" -X cancel   # copy-mode 탈출
$TBIN send-keys -t "$PANE" C-u         # 잔여 버퍼 정리
$TBIN send-keys -t "$PANE" -l '/clear' # literal 플래그 (키 해석 방지)
$TBIN send-keys -t "$PANE" Enter
```

## v1.9/v2.0 추가 실패 (2026-05-10 오후)

v1.8 이후에도 추가로 2번 더 실패:

| 버전 | 방식 | 실패 원인 |
|------|------|-----------|
| v1.9 | `❯` 프롬프트 없으면 idle 판단 | `❯`는 AI 턴 실행 중에도 항상 표시 → 항상 idle로 오판, 턴 도중 /clear 전송 |
| v2.0 | spinner 체크 먼저, "esc to interrupt" 없으면 idle | `* Sautéed · 8 shells still running`이 spinner regex 매치 → "esc to interrupt" 없는 idle 상태에서 abort |

### v2.0 버그 상세

spinner 체크가 "esc to interrupt" 체크보다 먼저 실행:
```bash
# 잘못된 순서 (v2.0)
if grep spinner → abort   ← 여기서 "Sautéed · 8 shells" 매치 → abort
if grep "esc to interrupt" → continue
READY=1
```

백그라운드 셸 8개가 `* Sautéed for 4m 1s · 8 shells still running` 텍스트를 pane에 남기는데,
이게 spinner 정규식과 매치. "esc to interrupt"는 없는 상태(idle)임에도 abort.

로그: `[16:11:08] fired → [16:11:29] timeout waiting for idle, abort`

### v2.1 수정

spinner abort 완전 제거. "esc to interrupt" 단독으로만 idle 판단:
```bash
# v2.1 — 단순화
if echo "$CONTENT" | grep -q 'esc to interrupt'; then
  continue
fi
READY=1
break
```

**근거**: "esc to interrupt" 유무가 Claude Code의 유일한 실행 상태 표시.
- 있음 = AI 처리 중 (새 턴이든 현재 턴이든)
- 없음 = idle → /clear 전송 OK

spinner는 백그라운드 셸 텍스트와 구분이 불가 → 신뢰할 수 없는 신호.

## 교훈

1. `/clear` 전송은 **Claude Code 외부(Stop hook/launchd)**에서만 가능 — 내부 Bash tool에서 직접 불가
2. Stop hook은 정상 케이스, launchd rescue는 stuck 케이스 — 이중 안전망이 필수
3. **"esc to interrupt"가 유일한 실행 상태 신호** — `❯`, spinner, `8 shells` 는 모두 오탐 가능
4. 새 turn 감지는 "esc to interrupt"가 다시 나타나면 자동으로 커버됨 (별도 spinner 체크 불필요)

## 관련 파일
- `~/.claude/hooks/session-clear-trigger.sh` — Stop hook v2.1 (현재)
- `~/.claude/hooks/session-clear-rescue.sh` — launchd rescue v1.6
- `~/Library/LaunchAgents/com.daejongkang.session-clear-watcher.plist`
- `~/.claude/skills/session-clear/SKILL.md`
- `~/.claude/skills/issues/2026-05-10-session-clear-buffer-polling-bug.md` — v1.0~v1.2 버그 상세
- `~/.claude/skills/knowhow/session-clear-tmux-send-keys.md` — send-keys 패턴 정리
