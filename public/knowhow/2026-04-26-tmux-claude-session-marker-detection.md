---
category: 인프라
tags: [tmux, claude, detection, handoff, grep, capture-pane]
related_issues:
  - 2026-04-26-handoff-active-session-marker-mismatch
  - 2026-04-26-handoff-claude-main-empty-shell
---

# tmux capture-pane 으로 Claude 세션 감지 — 마커 확장 + viewport 범위 패턴

- **첫 발견:** 2026-04-26 (WSL auto mode footer 마커 미스매치 → 핸드오프 발사 실패)
- **재사용 영역:** Mac↔WSL 핸드오프 탐지, launchd/cron 기반 자동화에서 Claude 세션 활성 여부 확인, 멀티기기 워크플로우 peer detection 전반.

## 한 줄 요약

`tmux capture-pane` 기본값은 현재 viewport 만 캡처하고, grep 마커는 Claude Code UI 업데이트마다 바뀐다. **마커 확장 + `-S -200` viewport 확대 + 프로세스 fallback 3단계** 를 모두 적용해야 false-negative 0에 가까워진다.

## 표준 탐지 코드

```bash
detect_claude_session() {
  local host=$1

  # 1단계: 시각 마커 grep (viewport 200줄 버퍼)
  local session
  session=$(ssh "$host" '
    for s in $(tmux list-sessions -F "#{session_name}" 2>/dev/null); do
      tmux capture-pane -t "$s" -p -S -200 2>/dev/null \
        | grep -qE "auto mode (on|\(shift)|Bypass Permissions|Claude (Opus|Sonnet|Haiku|Code)|⏵⏵|shells · ↓" \
        && echo "$s" && break
    done
  ')

  # 2단계: 프로세스 fallback (마커 없어도 claude 프로세스 살아있으면)
  if [ -z "$session" ]; then
    if ssh "$host" 'pgrep -af "^claude " >/dev/null 2>&1'; then
      session=$(ssh "$host" \
        'tmux list-sessions -F "#{session_name}:#{session_attached}" 2>/dev/null \
         | awk -F: "$2==1{print \$1; exit}"')
    fi
  fi

  echo "$session"
}
```

## 핵심 룰 3가지

### 1. grep 마커는 모드 무관 키워드로

| 마커 | 적용 조건 | 안정성 |
|---|---|---|
| `auto mode \(shift` | shift+tab 안내 떠있을 때만 | ❌ 불안정 |
| `Bypass Permissions` | bypass 모드 footer 일 때만 | ❌ 불안정 |
| `⏵⏵` | auto/bypass 모두에 나타나는 footer 아이콘 | ✅ 안정 |
| `shells · ↓` | manage 안내 (모드 무관) | ✅ 안정 |
| `Claude (Opus\|Sonnet\|Haiku\|Code)` | header (viewport 위쪽) | ⚠️ viewport 확대 필요 |

**안정적인 마커 우선** — `⏵⏵`, `shells · ↓` 처럼 모드 변경에 무관한 패턴 사용.

### 2. `-S -200` 으로 viewport 확대

기본 `capture-pane -p` 는 현재 화면만 잡는다. header 에 있는 "Claude Sonnet X.X" 같은 마커는 스크롤로 올라가 있으면 안 잡힌다. `-S -200` 으로 위쪽 200줄 버퍼까지 캡처.

### 3. 프로세스 fallback

마커가 또 바뀌어도 `pgrep -af "^claude "` + attached session 확인으로 이중 보증. 이 2단계를 항상 뒤에 둔다.

## 신규 기기 추가 시 체크리스트

1. 탐지 스크립트 적용 후 `detect_claude_session <hostname>` 수동 검증
2. 3가지 시나리오 확인:
   - Claude 세션 attached → 세션명 반환 ✅
   - 빈 bash tmux 만 있고 claude 프로세스 X → 빈 문자열 ✅
   - claude 프로세스 있고 attach 안 됨 → 가장 최근 세션 또는 빈 문자열 (정책 결정 필요) ✅
3. Claude Code UI 업데이트 후 재검증 (마커 바뀔 가능성)

## 함정

- tmux 세션명이 숫자(`0`, `1`)인 경우 `-t 0` 이 첫 번째 window 로 해석될 수 있음 → 세션명에 문자 포함 권장 (`claude`, `main`)
- `pgrep -af` 는 명령줄 전체를 보기 때문에 `claude-skills` 경로 같은 무관한 프로세스에도 매칭될 수 있음 → `^claude ` 시작 앵커 필수
- SSH 연결 지연 > 5초면 탐지 루프가 느려짐 → keepalive 설정 선행 필수 (`reference_ssh_keepalive_bidir.md`)

## 관련 이슈 (포스트모템)

- `issues/2026-04-26-handoff-active-session-marker-mismatch.md` — 원본 사고, 탐지 코드 상세 분석
- `issues/2026-04-26-handoff-claude-main-empty-shell.md` — 같은 detection 함수 또 다른 false-negative
