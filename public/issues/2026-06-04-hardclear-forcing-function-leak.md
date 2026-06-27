# 40% 하드클리어 forcing function 누수 — 본진 "클리어할게요" 말만 하고 idle 고착

- 날짜: 2026-06-04 09:3X KST
- 기기: 🍎 본진 (사고 발생), 🪟 라이덴/WSL (탐지·수동 복구·패치)
- 관련 인프라: context-hard-clear.sh, session-clear-trigger.sh, compact-count.sh (claude-automations)
- 관련 메모리: project_context_hardclear_infra_live, project_son0_auto_resume_mode, feedback_retire_infra_verify_trigger_condition_hook
- 관련 PR: claude-automations #80 (백스톱 수정)

## 증상

본진(🍎)이 컨텍스트 40%(401k)를 넘겨 `context-hard-clear.sh`(Stop 훅)가 "session-clear 스킬을
실행하라"고 block 했으나, 모델이 **"클리어할게요 주무세요 🌙"라고 말만 하고 스킬을 실제 실행하지
않음**. 그 다음 정지에서 `stop_hook_active=true` 가드가 재차단을 막아 **클리어가 누락된 채 idle
프롬프트로 고착**. 입력창엔 직전 지워진 텍스트의 고스트("라이덴에 위임해")만 떠 있었음.
아니키가 폰(텔레그램 🪟 봇)으로 "맥북 본진 이상해졌어, 자동클리어하고 이어가야 하는데 정상작동
안 한다" 보고 → 라이덴이 SSH로 본진 tmux 상태 실측 후 수동으로 session-clear 트리거해 복구.

## 근본 원인

forcing function 이 **'행동(스킬 실행)' 대신 '선언(말)'으로 누수**.

1. `context-hard-clear.sh` 는 설계상 마커를 직접 안 찍고(무지성 lossy /clear 방지) 모델에게
   "session-clear 스킬 실행"을 block 메시지로 지시만 함.
2. 모델이 그 지시에 텍스트만 출력하고(스킬·Edit 없이) 정지하면 마커가 안 생김.
3. 그 재정지는 `stop_hook_active=true` → 기존 가드 #1이 무조건 skip → 재차단 없음.
4. 결과: 마커도 없고 재차단도 없어 세션이 클리어 안 된 채 idle. 유일한 백스톱은 자동컴팩트
   2회(~55%)로 매우 느림.

## 수정 (PR #80)

- 폴라이트 block 시 `state/hard-clear-armed` 플래그 무장.
- 모델이 그 block 에 클리어를 큐(마커 생성)하지 않고 재정지하면
  (`stop_hook_active=true` + ARMED + ≥40% + 마커없음 = 누수) → `/tmp/do-session-clear` 마커를
  강제로 찍고 ARMED 를 one-shot 소비한 뒤 **마지막 block 1회**.
- Stop 훅 순서가 `session-clear-trigger`(먼저) → `context-hard-clear`(나중)라 같은 정지엔 마커가
  안 잡히므로, block 1회로 한 턴을 더 보장 → 다음 정지에서 트리거가 마커를 잡아 실제 /clear.
  모델은 그 한 턴에 tasks.md 마킹 기회를 받음.
- 무한루프 차단: 마커 존재(가드 #2) + ARMED one-shot 소비 = 이중 종료가드.
  (cf. 2026-05-29 cycle-trigger-infinite-clear-loop 사고)
- `compact-count.sh` clear 시 `hard-clear-armed` 도 리셋(새 세션 stale 무장 방지).
- 격리 하니스 21/21 PASS, 실 `/tmp/do-session-clear` 마커 무손상.

## 교훈 / 재발방지

- **block 메시지로 '스킬 실행'을 지시하는 forcing function 은, 모델이 말로만 응답하면 샌다.**
  지시형 forcing function 에는 N회 미이행 시 행동을 직접 강제하는 백스톱이 동반돼야 함.
- `stop_hook_active` 무조건 skip 가드는 무한루프는 막지만 '말로 빠져나가기'를 허용 → armed
  플래그로 "우리가 건 block 인데 미이행" 케이스만 구분해 백스톱.
- 인프라 폐기·forcing function 설계 시 [[feedback_retire_infra_verify_trigger_condition_hook]]
  의 트리거+조건+책임훅 3종 검증과 동일하게, '지시'와 '실행 보장'을 분리해 검증할 것.
