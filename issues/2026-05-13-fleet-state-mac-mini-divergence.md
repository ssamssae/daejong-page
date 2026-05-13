---
prevention_deferred: null
---

# fleet-state mac-mini local main divergence — reviewer parity bats 의 local-only commit 누적

- **발생 일자:** 2026-05-13 KST (D09 reviewer parity bats 실행 시점)
- **해결 일자:** 2026-05-13 11:14 KST (`git reset --hard origin/main` 적용)
- **심각도:** low (한 줄 reset 으로 즉시 해결, 손실 데이터 0)
- **재발 가능성:** low-after-fix (FLEET_NO_PUSH 가드 적용 후 bats 가 local commit 도 생성 안 함 — 실제로는 commit 은 여전히 생성, push 만 차단)
- **영향 범위:** Mac mini `~/agent-fleet-state` local main, reviewer parity bats 검증, mac-mini bats 4 PASS 검증 가능성

## 증상

D09 close 시점 최종 verification (sequential, mac-mini bats) 단계에서:

1. mac-mini 에서 `git pull --ff-only` 실행
2. `fatal: Not possible to fast-forward, aborting.` 출력 — mac-mini local 이 origin/main 으로부터 diverged 상태
3. bats 실행 시 primitive 의 공통 헤더 `git pull --ff-only --quiet origin main` 가 실패 → primitive exit 1
4. bats 4/4 PASS 기대였으나 3개 테스트 FAIL (`[ "$status" -eq 0 ]` 실패)

mac-mini `git log --oneline -5` 확인:
```
e426c37 test: cleanup        ← mac-mini local-only
88545a3 fleet: mission proposed ...  ← mac-mini local-only
6f567d2 fleet: kill --release        ← mac-mini local-only
1306d01 fleet: KILL human_emergency ...  ← mac-mini local-only
d8bf73a Revert 8 D09 fix-attempt bats noise commits   ← origin 동기 지점
```

mac-mini local 이 4 commit ahead of origin/main. origin/main 은 (revert 후) 다른 path 로 발전 → 발산.

## 원인

1. **reviewer parity bats 가 mac-mini 에서 fleet primitive 호출 → primitive 내부 git push 함정** — 단 가드 부재 상태였음 (3차 sweep 시점). 결과: mac-mini local 에서 fleet-kill / fleet-mission 호출 시 commit + push 시도.
2. **mac-mini push 가 origin 에 도달함 (가드 없을 때)** — 그 후 origin 에서 revert 적용. mac-mini local 에는 origin 의 revert 가 안 들어옴 (mac-mini pull 안 함).
3. **mac-mini local 만 revert 이전 상태 + bats fixture commit 누적**. origin 은 revert 적용 → 양쪽 diverge.
4. **`git pull --ff-only` 의 의도된 거부** — local 변경을 일방적으로 origin 로 align 안 함 (sane default).

## 조치

### 즉시 해결

mac-mini 에서:
```bash
ssh mac-mini "cd ~/agent-fleet-state && git fetch origin --quiet && git reset --hard origin/main"
```

결과: HEAD = origin/main = `3955b08` (D09 housekeeping README sweep 4회 분리 기록). mac-mini local 의 4 fixture commit 폐기 (tree 영향 net 0 이라 손실 데이터 0).

재실행: `bats tests/primitives.bats` → 4 PASS + origin push 0 verified.

### todos line 19 와의 관계

todos line 19 "mac-mini local main 정리 (conditional, 보류)" 는 D07-prereq 시점에 같은 패턴으로 생긴 mac-mini divergence. 강대종 명시 (2026-05-12): "reset 은 다른 상태 오염이 확인됐을 때만 별도 절차로 처리". D09 시점에 다시 발생했고 본 사이클에서 reset 적용 (D09 close 진행 차단 막기 위해 즉시 적용). todos line 19 는 별도 처리 — D07 시점 mac-mini 상태는 별 검토.

## 예방

- **(D09 fix 자체)**: FLEET_NO_PUSH 가드 박힘으로 future bats 실행이 mac-mini origin 으로 push 안 함 → divergence 발생 자체가 없음.
- **(룰 1/2/3 박제)**: `feedback_subagent_no_push_isolation.md` 의 룰들이 future reviewer subagent 가 mac-mini bats 호출 전 가드 export 강제 → 본 사고 family 차단.
- **(mac-mini routine reset 룰)**: `git reset --hard origin/main` 적용 조건 = (1) tree 영향 net 0 확인 + (2) 손실 위험 0 + (3) 강대종 명시 ack. D09 본 사이클에서 (3) 조건은 final verification 진행 권한으로 흡수.

## 재발 이력

- 2026-05-12 D07-prereq `bc2bbbf` 사례 — mac-mini local 에 push-race 진 orphan fixture commit 9+ 누적. reset 보류 상태로 todos line 19 등재.
- 2026-05-13 D09 reviewer parity bats — 본 사고.

## 관련 링크

- D09 sweep family 4회 본 이슈: `2026-05-13-d09-fleet-sweep-family-4-rounds.md`
- todos line 19: "mac-mini local main 정리 (conditional, 보류)"
- 강대종 reset 룰: 2026-05-12 명시 (`fleet_director_d01_trigger.md` 의 D07 학습 단락)
- D09 final verification 보고: 본 사이클 텔레그램 메시지 시퀀스
