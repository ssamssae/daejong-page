---
prevention_deferred: null
---

# mac-report.sh ssh chain 의 zsh NOMATCH 가 mirror chain 통째로 skip

- **발생 일자:** 2026-05-25 18:37 KST (본 사이클 codex 정리 보고 누락 시점)
- **해결 일자:** 2026-05-25 19:04 KST (commit 90d9192 fix push)
- **심각도:** high
- **재발 가능성:** low (1줄 fix + 4 노드 동시 audit verify PASS)
- **영향 범위:** mac-report.sh (4 노드 → 본진 보고 전 경로), 본진 봇 chat + Agent Mesh Mirror 그룹 양쪽 mirror

## 증상
노트북 18:37 codex 정리 결과를 mac-report.sh 로 본진에 paste — 본진 tmux 세션엔 1833B 정상 도착 (inbox-paste.log 확인) 했는데, 본진 봇 chat 의 [💻→🍎][결과] 짧은 알림 + Agent Mesh Mirror 그룹의 풀바디 양쪽 mirror 가 둘 다 silent skip. 형님이 "노트북이 본진에 보낸 게 없는데" 지적해 surface.

## 원인
mac-report.sh 가 `set -euo pipefail` 모드인데, line 131~141 의 ssh oneliner 마지막 step `rm -f $HOME/.local/state/claude-directives/pending-*` 가 Mac 의 zsh 기본 NOMATCH 옵션 trigger → ssh 비-제로 exit → bash set -e 가 그 시점 script abort. 직후 line 146~ 의 agent-msg-notify (본진 chat 알림) + line 162~ 의 forward-to-group (그룹 풀바디 mirror) 둘 다 실행 0회. paste 자체는 ssh chain 의 첫 step 들 (cat / inbox-paste / rm REMOTE_TMP) 에서 이미 완료라 본진 tmux 엔 도착했지만 mirror 만 사라짐. 4 노드 audit 결과 노트북만 아니라 4 노드 동일 함정 (전수조사 직후 형님 지적).

## 조치
1 줄 fix (commit 90d9192): `rm -f pending-*` → `find ... -name 'pending-*' -delete 2>/dev/null; true` 로 교체. find 는 빈 매치도 정상 종료 + trailing `; true` 가 defense-in-depth (다른 어떤 미래 step 깨져도 mirror chain 은 fire). 4 노드 자율 git pull --ff-only 후 audit fan-out 으로 4/4 PASS verify (HEAD 90d9192 일치). todos L12 carry close.

## 예방 (Forcing function 우선)
1) mac-report.sh 의 mirror chain (agent-msg-notify + forward-to-group) 호출을 ssh 결과와 분리 — ssh 가 실패해도 mirror 는 시도. 이미 fix 에 반영 (find -delete + ; true 로 ssh 항상 exit 0).
2) 향후 mac-report 같은 critical script 에 ssh oneliner 박을 때 마지막 step 의 glob/NOMATCH safety 의무 — review checklist 항목 추가 (별 cycle).
3) "mac-report 호출했는데 형님 폰 알림 0" 패턴은 본진이 다음 형님 발화 도착 시 자동 surface (forcing function 사람 의지 의존 아님 — paste 도착했는데 같은 시각에 [<이모지>→🍎] 알림이 0 이면 mirror chain 깨진 시그널).

## 재발 이력
(처음 생성 — 없음)

## 관련 링크
- 커밋: claude-automations 90d9192
- 메모리: feedback_env_token_mismatch_trap (forward-to-group silent fail 친척 함정)
- 텔레그램 메시지: 형님 18:37 노트북 codex 결과 누락 지적 → 본진 audit 4/4 PASS 보고 (~19:14 KST)
- todos L12 carry close 근거
