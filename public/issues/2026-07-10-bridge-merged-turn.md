---
prevention_deferred: 2026-07-14
---

# claude-telegram-bridge busy-inject 병합 턴 — 유령 active_turn 8분 + 무관 답변 오귀속

- **발생 일자:** 2026-07-09 23:33 KST
- **해결 일자:** 2026-07-09 23:45 KST (watchdog 재시작 + 후속 인바운드로 외형상 해소 — 구조 수리는 T-260710-27 진행 중)
- **심각도:** medium
- **재발 가능성:** high (실제로 다음날 아침 재발 — 재발 이력 참조)
- **영향 범위:** 맥미니 claude 세션 / `claude-telegram-bridge.py` busy-inject promote 경로 / 고착 구간 인바운드 지연 + 오귀속 답장 1건

## 증상
2026-07-09 23:33 아니키가 "(외부 사용자 문의 전달 메시지)"를 보낸 뒤 세션이 무반응처럼 보였다. active_turn 이 461초 이상 고착, typing 인디케이터 지속, 그러나 터미널은 유휴(Context 16%). 23:45 에야 답장이 왔는데, 그 답장은 이 질문과 무관한 WSL 보고(T-260709-67) 처리 결과였다.

## 원인
브릿지 로그(`/tmp/claude-telegram-bridge-macmini.log` 484~745행)·큐(`queue.jsonl` qid 26f6fc684e)·세션 transcript(69408a41) 삼각 실측으로 확정.

1. **병합 턴 무인지 (근인 A):** 23:32:59 PowerShell 로그 메시지(턴 A 시작) 5초 뒤 23:33:04 문제의 메시지가 도착, state=generating 이라 busy-inject 로 composer 에 타이핑됐고 23:33:06 transcript 에 user 메시지로 안착 — 즉 **턴 A 에 병합**됐다. 턴 A 의 최종답변(23:35:05 발송)이 실제로 두 질문을 함께 답했다("외부 사용자…" 직접 언급). 그런데 브릿지는 23:35:07 이 nonce 를 active_turn 으로 promote 하고 **전용 답변을 기다리기 시작** — 올 답이 없으므로 busy_state()=generating 오판이 고착됐다 (아니키 관측 461s+ 는 이 구간).
2. **재시작 후 오귀속 (근인 B):** 23:40:13 watchdog 이 stale bridge process 로 브릿지를 재시작. 23:42:34 무관한 인바운드(WSL mac-report)가 새 턴 B 를 시작하자, 재시작된 브릿지는 잔류 pending nonce 와 턴 B 산출물을 **트리거 user 메시지 일치 검증 없이** 짝지어 원 질문의 reply 로 발송했다(23:45:04). "주입 유실"로 보였지만 실체는 **유실 0 + 지연 8분 + 오귀속 1건**이다.
3. 인접 결함: `2026-07-07-bridge-active-turn-ghost-10min-outage.md` 와 증상은 같으나(BUSY 루프·watchdog 회복) 근인이 다르다 — 그쪽은 tmux 세션 사망(PR#495 로 수리 완료), 이번은 세션 생존 상태의 병합 턴. PR#495 레일은 이 경로를 커버하지 못한다.

## 조치
당시 자동 회복: 23:40:13 watchdog stale-process 재시작 → 23:42:34 후속 인바운드가 턴을 깨움. 이번 포스트모템(T-260709-83, 2026-07-10)에서 유실 아님·오귀속 발생을 로그로 확정하고, 동일 근인 A 의 익일 재발(T-260710-27)에 수리 트랙이 열려 있음을 확인, 오귀속(근인 B) 가드 요구를 T-260710-27 에 노트로 추가했다.

## 예방 (Forcing function 우선)
수리 트랙 = T-260710-27 (desktop3060ti, 2026-07-10 재발분 재현 로그 확보됨). 요구 레일 3개:

1. **병합 턴 즉시 해제:** promote 시점에 transcript 를 확인해, promoted nonce 의 user_uuid 가 이미 완료된 턴의 컨텍스트에 선행 포함돼 있으면(뒤따르는 assistant final 존재) 전용 답변 대기 대신 delivered 처리로 즉시 해제 — 900s TTL 대기 제거.
2. **오귀속 차단:** pending nonce 에 assistant final 을 짝지을 때 그 턴의 트리거 user 메시지 uuid 가 nonce 의 user_uuid 와 일치할 때만 발송. 불일치면 ambient 경로로 보내고 nonce 는 stale 해제.
3. **회귀 테스트:** 연속 2메시지 병합 턴 fixture + 재시작 후 무관 턴 fixture.

- **막을 코드/훅:** `none` (deferred — 작성 마감 2026-07-14, T-260710-27 PR 로 갱신 예정)
- **기존 안전망:** watchdog stuck_pending/stale-process 재시작 (이번 회복 주역, 단 ~5-8분 공백), active_turn_idle_timeout 900s (2026-07-10 06:52 재발 건은 이 TTL 로 자체 해소).

## 재발 이력
- 2026-07-10 06:52: 동일 근인 A 재발 (연속 2메시지 병합 턴 → promote 고착 15분, 큐 3건 대기) — T-260710-27 로 등재, 재현 로그 확보, 응급 복구 완료.

## 관련 링크
- task: `T-260709-83` (본 포스트모템), `T-260710-27` (근본 수리 트랙)
- 인접 이슈: `issues/2026-07-07-bridge-active-turn-ghost-10min-outage.md` (같은 증상군, 다른 근인 — tmux 사망, PR#495 수리 완료)
- 증거: 브릿지 로그 484~745행 / queue.jsonl qid `26f6fc684e` / transcript uuid `3292372e`(질문)·`69c4f95c`(병합 답변)·`32261a9e`(오귀속 답변)
- 텔레그램 메시지: 질문 id 17813, 오귀속 답장 id 17822
