---
prevention_deferred: 2026-07-05
---

# 코덱스 텔레그램 브릿지 typing-stuck — codex REPL 중단(interrupt) 상태를 못 풀어 입력중 무한 표시

- **발생 일자:** 2026-06-28 12:3x KST
- **해결 일자:** 2026-06-28 12:4x KST
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** 라이덴(🪟 WSL) codex 노드 / `codex-repl-telegram-bridge.py` (`codex-bridge.service`) — codex 브릿지를 쓰는 전 노드 잠재 공통

## 증상
라이덴 코덱스 세션은 idle인데 텔레그램에 "입력 중…"(typing) 표시가 멈추지 않고 계속 나옴. 아니키가 "라이덴 코덱스 세션 멈춰있는데 왜 텔레그램 타이핑 계속 나오냐 무슨버그냐"로 신고, 스크린샷("이버그다")으로 확인.

## 원인
codex REPL이 Context 82%까지 찬 상태에서 턴 도중 **"Conversation interrupted … Something went wrong"** 에러로 죽은 채 idle로 남음. 그런데 텔레그램 브릿지(`codex-repl-telegram-bridge.py`)는 계속 살아 돌면서 codex의 중단(interrupted) 상태를 **"턴 진행 중"으로 잘못 붙들고** typing(sendChatAction)을 반복 송신함. 즉 브릿지가 codex의 비정상 종료/중단을 감지해 turn-in-progress 상태를 클리어하는 경로가 없음.

## 조치
`codex-bridge.service` 정상 재시작(systemd, kill 아님). 좀비 "턴 진행 중" 상태를 붙들고 있던 옛 브릿지 프로세스(PID 1124230)가 새 프로세스(2354880)로 교체되며 active 정상화 → 붙들려 있던 턴 상태가 비워져 typing 멈춤. **수동 재시작 = band-aid**(근본 원인 미해결).

## 예방 (Forcing function 우선)
근본 수정은 별도 task로 등록함(아직 코드 미반영 → `prevention_deferred: 2026-07-05`).

- **막을 코드/훅:** `none` (계획: T-260628-15) — `codex-repl-telegram-bridge.py`가 codex REPL의 interrupted/dead 상태를 감지(state.json 의 turn 상태 + pane 의 `Something went wrong` / `Conversation interrupted` 패턴)하면 typing 데몬을 stop하고 좀비 턴 상태를 clear 하는 가드를 추가, codex-bridge 쓰는 5노드 공통 배포. 구현·머지 후 이 라인을 commit SHA로 갱신.

## 재발 이력
<처음 생성>

## 관련 링크
- 후속 task: `~/todo/tasks.md` T-260628-15 (codex-bridge typing-stuck 근본 수정)
- 인접 이슈(클로드 브릿지/다른 메커니즘): `issues/2026-05-09-telegram-typing-zombie-after-clear.md`, `issues/2026-05-21-typing-indicator-drops-during-bg-work.md` — 본건은 *codex* 브릿지가 *REPL 중단*을 못 푸는 별개 메커니즘
- 텔레그램: 아니키 신고 + "이버그다" 스크린샷 (2026-06-28 12:3x KST)
