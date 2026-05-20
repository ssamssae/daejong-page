---
prevention_deferred: null
---

# fleet-clear rescue v0.8 pane-finding 로직이 grouped client 환경에서 본진 챗봇 pane 놓침

- **발생 일자:** 2026-05-19 14:17 KST
- **해결 일자:** 2026-05-19 14:18 KST (수동 우회 — 본진 챗봇 pane %44 에 직접 detached send-keys)
- **심각도:** medium (사이클 자체는 완료, 본진 자동 /clear 만 빗나감)
- **재발 가능성:** high (rescue 로직 fix 전까지 동일 환경에서 재발)
- **영향 범위:** 🍎 본진 fleet-clear 자동 /clear 단계 / session-clear-rescue.sh v0.8 / grouped client 가 main 세션에 attached 된 모든 시점

## 증상
14:17:38 KST `fleet-clear.sh` 정상 호출 → 본진 marker `/tmp/do-session-clear` touch 까지 진행. 그러나 launchd WatchPaths rescue hook (`~/claude-automations/hooks/session-clear-rescue.sh` v2.3 / v0.8 fallback 패턴) 이 본진 챗봇 pane 을 잘못 식별. trigger.log 14:17:53 에 "v0.8 always fired (pane=%35, 3s detached send-keys)" 박혔는데 실제 본진 챗봇 pane 은 %44 (claude session). /clear 가 %35 (다른 세션의 attached pane) 에 박혀 본진 챗봇은 마커 신호 받지 못함. 수동으로 detached send-keys 를 pane=%44 에 직접 박은 후 본진 self-clear 진행. 사이클 자체는 마무리.

## 원인
`session-clear-rescue.sh:19` 의 pane 선택 로직:
```bash
PANE=$($TBIN list-panes -a -F '#{session_attached} #{pane_id}' | awk '$1>0{print $2; exit}')
```
`session_attached > 0` 인 첫 pane 을 잡는 패턴 — grouped client (다른 기기/세션이 main 에 grouped session 으로 attach 한 경우) 환경에서 본진 챗봇이 attach 한 `claude` session pane 보다 다른 attached pane (예: main 세션의 사용자 터미널 창, mac alias `cc` grouped client) 이 `list-panes -a` 결과 앞쪽에 박힘. awk `exit` 으로 첫 매칭만 잡으니 본진 챗봇 pane 은 누락. fallback `[ -z "$PANE" ] && PANE="%35"` 도 본진 챗봇 pane 보장과 무관 (그냥 고정 hardcode).

## 조치
14:18 KST 수동: 본진 챗봇 pane %44 에 `tmux send-keys -t %44 ...` 직접 박아 self-clear 진행. 사이클 마무리 자체는 완료. 코드 fix = 2026-05-19 15:08 KST PR #32 (https://github.com/ssamssae/claude-automations/pull/32) 머지 (squash, commit 5fc38f8). session name 기준 4단계 fallback + hardcode %44 적용. 다음 fleet-clear 호출 시 실 검증 예정.

## 예방 (Forcing function 우선)
- (미적용, code-level) `session-clear-rescue.sh:19` 의 pane 선택을 **session name 기준** 으로 교체:
  ```bash
  PANE=$($TBIN list-panes -t claude -F '#{pane_id}' 2>/dev/null | head -1)
  [ -z "$PANE" ] && PANE=$($TBIN list-panes -a -F '#{session_name} #{session_attached} #{pane_id}' | awk '$1=="claude"{print $3; exit}')
  [ -z "$PANE" ] && PANE=$($TBIN list-panes -a -F '#{session_attached} #{pane_id}' | awk '$1>0{print $2; exit}')
  [ -z "$PANE" ] && PANE="%44"
  ```
  본진 챗봇은 항상 `claude` 라는 이름의 tmux session 에 박혀있다 (5노드 표준, CLAUDE.md). session name 기준 선택이 grouped client 함정 회피. 1순위 claude 세션 직접 지정 → 2순위 list -a 결과의 session_name=claude 매칭 → 3순위 기존 attached fallback → 4순위 hardcode `%44`.
- (적용) rescue log 에 grouped client 매칭 시 `[session_name]` 도 같이 남기기 — 다음 미스매치 시 원인 즉시 파악. 2026-05-19 15:23 KST PR #33 (https://github.com/ssamssae/claude-automations/pull/33) 머지 (squash, commit 57c1070). `tmux display-message -p -t <pane_id> -F '#{session_name}'` fetch, fallback "?". log 포맷: `pane=%XX, session=<name>`.

## 재발 이력
(처음 생성)

## 관련 링크
- 코드: `~/claude-automations/hooks/session-clear-rescue.sh:19`
- 로그: `/tmp/session-clear-trigger.log` 14:17:53 entry
- 본진 보고 메시지: telegram msg_id 19926 (2026-05-19 14:41:07 KST)
