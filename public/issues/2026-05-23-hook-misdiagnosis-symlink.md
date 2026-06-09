---
date: 2026-05-23
node: 🍎 본진
severity: low
status: resolved
tags: [hook, symlink, misdiagnosis, context-threshold-alert]
---

# context-threshold-alert hook 경로 symlink 오진 사고

## 사건 (KST)

- ~11:53: SessionStart hook 으로 본진 세션 클리어 후, 형님이 "35%까지 왜 초기화 안 됐는지? 스틸워커 켜졌을 때만 작동하는 건가?" 의문 (msg 22791).
- ~11:55: 본진이 답변 — 30% 자동 클리어는 hook 강제가 아니라 본진 self-check 자율 룰이고, 다음 사이클에 PreToolUse hook 으로 forcing function 박는 거 검토 가능 (msg 22792).
- ~03:26 (D+1): 형님 "박자" ack (msg 22795).
- ~03:30: 본진이 settings.json + ~/.claude/hooks/ 확인 → 이미 `context-threshold-alert/` 디렉토리 박혀 있고 35% threshold 로 작동하던 상태 발견. settings.json 에 등록 경로는 `$HOME/.claude/automations/hooks/context-threshold-alert/alert.py` 인데 실제 파일이 `~/.claude/hooks/context-threshold-alert/alert.py` 에도 있는 걸 보고 **"경로 오타로 매 Stop turn silent fail 중" 단정**. 이 가설로 settings.json 경로 `automations/hooks/` → `hooks/` 로 변경하고 THRESHOLD_PCT 35→30 으로 낮춤. 가짜 transcript 로 hook 발사 검증 PASS 후 형님께 "박힘" 보고 (msg 22799).
- ~03:34: 형님이 텔레그램 스샷 첨부 "그 메시지는 이미 오고 있었어" (msg 22801) — 35% 알림이 본진 폰에 이미 정상 도착했다는 증거.
- ~03:35: 본진이 inode 확인 → `~/.claude/hooks` 자체가 `~/claude-automations/hooks/` 로 가는 symlink. 두 경로 inode 16847280 동일 = 같은 파일. settings.json 의 `automations/hooks/` 경로는 처음부터 정상 작동 중이었고 "경로 오타 silent fail" 진단은 완전히 틀린 것 확인. 사과 + 정정 보고 (msg 22803).
- ~03:39: 형님 "니가 잘못진단해서 별사이클 한건데 당연히 삭제해야지" (msg 22805) — 5노드 표준화 별 사이클 폐기 확정.
- ~03:41: 형님 "트리오보트 30 35 결정해 니가" (msg 22807) — 임계값 결정 위임.
- ~03:43: trio-vote 진행, 3-0 만장일치 [A 30%] 결정 (msg 22808). 30% 박힌 상태 유지.

## 원인

1. **inode/symlink 확인 step 누락**: settings.json 경로와 실제 파일 디렉토리만 보고 "다르네 → silent fail" 단정. `test -L`, `readlink`, `stat -f "%i"` 한 줄도 안 확인.
2. **외관 차이 = 작동 차이 fallacy**: macOS 자동화 환경에 symlink 광범위 사용됨 (~/.claude/skills, ~/.claude/hooks, ~/.claude/automations 등). 경로 표기 차이가 실제 파일 차이를 함의하지 않음.
3. **검증 너무 좁은 범위**: 가짜 transcript 발사 테스트만 했는데, "원래 hook 이 작동 중이었는지" 는 검증 안 함. 형님 폰 텔레그램에서 과거 알림 도착 이력만 확인했으면 즉시 잡혔을 사고.

## 보정 + 재발 방지

- alert.py THRESHOLD_PCT 35→30 (실질 변경, trio-vote 만장일치 GO)
- settings.json 경로 `hooks/` → `automations/hooks/` 원복 (SoT 표기 일관성)
- README + settings-snippet path 표기 동기화
- 본진 메모리 `feedback_inode_check_before_silent_fail_claim` 박음: hook silent fail 단정 전 stat/readlink/test -L 검증 step 강제

## Lesson

- 자동화 환경 가설 검증할 때 외관 경로만 보고 단정 X. inode 같은 layer-1 사실로 confirm.
- 형님 폰 텔레그램 알림 도착 이력 = layer-0 ground truth. "hook 작동 여부" 가설은 그 로그 먼저 보고 시작.
- Karpathy 룰 1 (가정 명시) 의 구체 케이스 — "경로가 다르네" 라는 표면 관찰을 "silent fail 중" 이라는 강한 단정으로 침묵 점프하지 말 것.
