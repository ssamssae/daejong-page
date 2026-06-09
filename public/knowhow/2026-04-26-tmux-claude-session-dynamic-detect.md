---
category: 자동화
tags: [tmux, handoff, claude-code, session-detection, capture-pane, grep-marker, ssh, dynamic]
related_issues:
  - 2026-04-26-handoff-claude-main-empty-shell
  - 2026-04-26-handoff-active-session-marker-mismatch
---

# tmux Claude Code 세션 탐색은 이름 하드코딩 X — 동적 마커 grep + process fallback

- **첫 발견:** 2026-04-26 (Mac→WSL 핸드오프 ssh+send-keys가 빈 bash `claude-main` 세션에 도착 → 인스타 자동화 미실행. 당일 두 번째 사고: auto mode footer 바뀌어 마커 grep 0 hit)
- **재사용 영역:** SSH+tmux send-keys로 원격 Claude Code 세션에 명령을 inject하는 모든 핸드오프·자동화 흐름.

## 한 줄 요약

원격 tmux 세션 이름을 하드코딩(`-t claude-main`)하면 그 세션에 Claude Code가 안 돌고 있을 때 silent fail. **세션 목록을 순회하며 capture-pane + 마커 grep 으로 활성 Claude Code 세션을 동적 탐색**하고, grep miss 시 process/attach 상태로 fallback하는 2-layer 탐색이 정답.

## 패턴

```bash
# Layer 1 — capture-pane 마커 grep
peer_session=$(ssh "$peer_user@$peer_host" '
  for s in $(tmux list-sessions -F "#{session_name}" 2>/dev/null); do
    tmux capture-pane -t "$s" -p -S -200 2>/dev/null \
      | grep -qE "auto mode (on|\(shift)|Bypass Permissions|Claude (Opus|Sonnet|Haiku|Code)|⏵⏵|shells · ↓" \
      && echo "$s" && break
  done
')

# Layer 2 — process/attach fallback (마커 grep 0 hit 시)
if [ -z "$peer_session" ]; then
  if ssh "$peer_user@$peer_host" 'pgrep -af "^claude " >/dev/null 2>&1'; then
    peer_session=$(ssh "$peer_user@$peer_host" \
      'tmux list-sessions -F "#{session_name}:#{session_attached}" 2>/dev/null \
       | awk -F: "$2==1{print $1; exit}"')
  fi
fi

# 전송 or 텔레그램 fallback
if [ -n "$peer_session" ]; then
  ssh "$peer_user@$peer_host" \
    "tmux send-keys -t '$peer_session' '<command>'; sleep 0.5; tmux send-keys -t '$peer_session' Enter"
else
  # 텔레그램으로 fallback 알림
  echo "No active Claude session found — falling back to Telegram"
fi
```

## 왜 이렇게 해야 하는가

- Claude Code UI footer/header는 모드(auto/bypass/일반)마다 다르고 버전 업데이트로 바뀜. 단일 마커 grep은 언제든 깨질 수 있음.
- `capture-pane` 기본은 현재 viewport만 — `-S -200` 으로 history 포함해야 header의 `Claude X.X` 라인도 잡힘.
- 하드코딩 세션 이름(`claude-main`)은 사용자가 다른 터미널에서 `cc` 직접 실행하면 빈 bash가 됨. 동적 탐색만이 실제 활성 인스턴스를 보장.

## 하지 말아야 할 것

- `-t claude-main` 같은 고정 세션 이름 → 빈 bash 수신, 명령이 bash로 해석됨 (2026-04-26 사고 재현)
- 마커 1~2개만 grep → auto/bypass 중 한 모드에서만 동작, 반대 모드 fail (2026-04-26 두 번째 사고)
- process check 없이 grep miss = 실패로 확정 → 마커만 바뀐 경우 불필요한 fallback 발생

## Forcing Function

- 핸드오프 스킬(`handoff/SKILL.md`)의 detection 함수를 위 2-layer 패턴으로 표준화
- 마커 변경 시 단일 파일(`claude-detection.sh`)만 수정하도록 분리
- 새 Claude Code 버전 배포 후 핸드오프 smoke test 1회 (footer 변경 조기 감지)

## 관련 이슈 (포스트모템)

- `issues/2026-04-26-handoff-claude-main-empty-shell.md`
- `issues/2026-04-26-handoff-active-session-marker-mismatch.md`
