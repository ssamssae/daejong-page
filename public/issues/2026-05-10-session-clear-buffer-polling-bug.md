---
date: 2026-05-10
slug: session-clear-buffer-polling-bug
status: resolved
affected: session-clear skill
versions: v1.0, v1.1
fixed_in: v1.2
summary: "텔레그램 '세션초기화' 트리거 시 /clear가 전송 안 되거나 무시되는 입력 버퍼 + polling 조건 버그"

---

# session-clear /clear 씹힘 — 입력 버퍼 + polling 조건 버그

## 증상
텔레그램에서 "세션초기화" 입력 시 /clear가 전송되지 않거나 무시됨.

## 근본 원인 (2개)

### 원인 1: `shells` 조건 오탐 (v1.1 버그)
polling 조건에 `shells` 포함:
```
grep -qE 'shells|esc to interrupt|Running|⎿'
```
- `· 8 shells` 는 Claude Code idle 상태에서도 항상 표시됨
- 결과: idle 상태인데도 "shells" 매칭 → /clear 전송 안 함 (최대 30초 대기 헛돌기)

### 원인 2: 입력 버퍼 잔여 텍스트 (v1.0~v1.1 공통)
디버깅 중 `TIMING_TEST` 텍스트가 입력 버퍼에 남은 상태에서 `/clear` 전송 시:
- `❯ TIMING_TEST/clear` 로 붙어서 명령 인식 불가
- C-c는 버퍼를 완전히 지우지 않음 (readline에서 C-c = interrupt, C-u = 라인 지우기)

## 수정 내용 (v1.2)

1. `shells` grep 조건 제거 → `esc to interrupt` 만 체크
2. `/clear` 전 `C-u` 추가 → 잔여 버퍼 강제 정리
3. `disown $!` → `(nohup ... &)` subshell 방식 → zsh job table "not found" 오류 방지

```bash
(nohup bash -c "
  TBIN=$TMUX_BIN
  for i in $(seq 30); do
    sleep 1
    pane=$($TBIN capture-pane -t claude -p 2>/dev/null | tail -4)
    if ! echo "$pane" | grep -qE 'esc to interrupt|Running|⎿'; then
      $TBIN send-keys -t claude C-u
      sleep 0.2
      $TBIN send-keys -t claude '/clear' Enter
      break
    fi
  done
" >/dev/null 2>&1 &)
$TMUX_BIN send-keys -t claude C-c
```

## 교훈
- `8 shells` 는 open shell 세션 수 표시 (idle 포함) — 실행 중 표시는 `esc to interrupt`
- `/clear` 전 항상 C-u 로 버퍼 클린
- nohup 백그라운드는 subshell `(cmd &)` 방식이 zsh에서 더 안정적
