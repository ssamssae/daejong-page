---
prevention_deferred: null
---

# D09 fleet-director 사이클 sweep family 4회 반복 — bats 와 primitive 의 push side-effect 누적

- **발생 일자:** 2026-05-13 08:36 KST (D09 implementer 시작) ~ 11:00 KST (4차 revert push)
- **해결 일자:** 2026-05-13 11:15 KST (P1 fix-now plan §9.8 sync 완료)
- **심각도:** high (review-before-push 룰 4회 반복 위반, 약 3.5 시간 손실, 룰 3종 박제 사이클)
- **재발 가능성:** low-after-fix (FLEET_NO_PUSH 가드 + parity prompt 표준 + sequential verification 룰 박제 후)
- **영향 범위:** ~/agent-fleet-state origin/main (24 noise commit + 24 audit-trail revert), D09 implementer/reviewer subagent flow, 강대종 룰 "main 직접 push 금지 · PR 없이 main 반영 금지"

## 증상

D09 source `3680caf feat(D09): 13 fleet shell primitives + bats tests` 와 fix `1b2c08b fix(D09): FLEET_NO_PUSH guard` 사이클 진행 중 같은 family 사고 4회 반복:

| sweep | noise SHA 범위 | 발생 시점 | revert SHA | 직접 원인 |
|-------|---------------|----------|------------|----------|
| 1차 (4 noise) | `f14bba6..64a111a` | implementer 1차 bats 실행 | 개별 4 commit (`55a5269..c4b5a55`) | plan §9.8 bats mission cleanup `git push` + fleet-kill/fleet-mission primitive 내부 push 가 unpushed D09 source `3680caf` 끌고 origin 박힘 |
| 2차 (8 noise) | `27b21a6..cf2014b` | FLEET_NO_PUSH guard fix-attempt subagent baseline bats | combined empty revert `d8bf73a` | subagent 가 guard 적용 **전** baseline bats 를 돌려 가드 없는 primitive 가 push 발화 (2 라운드 = 4+4 commit) |
| 3차 (8 noise) | `a13fbce..4ec8fad` | spec-reviewer + code-quality-reviewer 병렬 dispatch 후 parity bats | combined empty revert `efe5d4d` | spec-reviewer parity 단계가 `git format-patch -1 3680caf` 로 D09 source 단일 패치를 mac-mini 에 apply — 가드 들어가기 전 bats setup. apply 후 bats 실행 시 setup() FLEET_NO_PUSH=1 export 없음 → primitive push 활성. 병렬 reviewer 2 라운드 |
| 4차 (4 noise) | `eda8f33..95beb9e` | 3차 revert 직후 추가 발견 | combined empty revert `b0343d2` | 원인 가설 — mac-mini SSH-경유 FLEET_NO_PUSH propagate 미흡 또는 본진 BEFORE/AFTER race. 사후 직접 empirical 검증 시 PUSH BLOCKED OK 일관 — 정확한 원인 미확정 |

총 24 noise commit + 24 audit-trail revert 누적. tree 영향 net 0 (KILL/--release + mission_proposed/cleanup 쌍 모두 self-cancel). 강대종 force-push 금지 룰 따라 forward-only revert chain.

## 원인

1. **plan §9.8 bats cleanup 본문 자체에 `git push --quiet origin main` 박힘** — implementer 가 plan 그대로 따라도 push side-effect 발생 (1차). root cause document level.
2. **push-capable fleet primitive 9개 가드 부재** — fleet-kill / fleet-mission / fleet-ack / fleet-reject / fleet-abort / fleet-abort-mission / fleet-promote / fleet-pause / fleet-resume `git push` 라인이 unconditional. bats 가 invoke 하면 무조건 push (1차/2차).
3. **subagent prompt 룰 부재** — implementer / fix-worker / reviewer parity-check subagent 가 push-capable bats/primitive 실행 전 가드 환경변수 또는 격리 repo 사용 룰 미박제 (2차/3차).
4. **reviewer parity patch-apply 함정** — `git format-patch -1 <source>` 단독 사용. source commit 이 가드 빠진 상태면 mac-mini parity 검증이 사고 재발 (3차).
5. **병렬 reviewer dispatch** — spec-reviewer + code-quality-reviewer 가 같은 함정을 동시에 두 번 발화 (3차 8 commit = 2x 4 commit).
6. **최종 verification origin/main BEFORE/AFTER 비교 누락** — 단일 본진 챗봇 empirical 검증이 race 또는 cache 로 false-negative 가능 (4차 가설 1).

## 조치

### 즉시 fix (D09 close 시점)

- **D09 fix commit `1b2c08b`**: fleet-state `tests/primitives.bats` setup() 에 `export FLEET_NO_PUSH=1` + line 33 cleanup 에 가드 패턴 추가.
- **fleet primitive 10 라인 가드 추가** (~/.claude/automations/scripts/fleet-{abort-mission,abort,ack,kill[2],mission,pause,promote,reject,resume}.sh): 각 `git push --quiet origin main` 라인을 `{ [ "${FLEET_NO_PUSH:-0}" = "1" ] || git push --quiet origin main; }` 패턴으로 래핑. `set -euo pipefail` 하에서 `||` short-circuit 안전 (code-quality-reviewer empirical 3 케이스 검증 PASS).
- Mac mini 9 .sh 파일 scp + chmod (subagent 수행).
- 4 sweep audit-trail forward revert chain 으로 origin 명시 상쇄 (개별 4 + combined 8 + combined 8 + combined 4 = 4 revert mechanism).
- README D09 row + sweep 주의 단락 4회 분리 기록.

### 룰 박제 (D10+ 영구 적용)

`~/.claude/projects/-/memory/feedback_subagent_no_push_isolation.md` 룰 3종:

- **룰 1**: push-capable fleet-* primitive 또는 그 bats 실행 전 `export FLEET_NO_PUSH=1` 또는 격리 throwaway repo 필수. baseline/smoke/verify/debug 어떤 명목이든 예외 X.
- **룰 2**: reviewer parity patch-apply 시 source commit 단독 금지. 최종 guarded range 또는 `git pull --ff-only` 기준 사용.
- **룰 3**: 최종 verification 병렬 reviewer 금지. sequential 하나씩 + 실행 전후 `git rev-parse origin/main` 비교 필수.

### plan §9.8 본문 sync (P1 fix-now, D09 close 직후)

- plan §Day 9 헤더에 D09 사후 학습 5-rule annotation 박음.
- plan §9.8 setup() 에 `export FLEET_NO_PUSH=1` 추가.
- plan §9.8 mission cleanup 라인: `git add .` → `git add mission.json queue/` + 가드 패턴.

## 예방

- **(Stop 훅 강화)**: 향후 fleet-state 또는 자동화 repo 에서 push 발생 전 `FLEET_NO_PUSH` env 미설정 + review-required commit 상태 감지 시 차단 검토 (D10+ 별도 cycle).
- **(reviewer prompt 표준)**: D10 implementer dispatch 부터 룰 1/2/3 inline 의무. plan §Day 9 헤더 annotation 도 참조 가능.
- **(planning 단계 guard)**: future plan 본문에 `git push` 라인 박을 때 가드 패턴 default. plan 작성자 review 필수.

## 재발 이력

- 2026-05-12 D07-prereq `bc2bbbf` 사례 — `tests/*.test.sh` 의 `git push origin main` 이 implementer commit 끌고 origin 박힘. todos line 18 "fleet-state test harness push 격리" P1 등재.
- 2026-04-30 newsletter Substack Ep.3 이미지 업로드 누락 — 본 사이클과 다른 family 지만 "자동화 파이프라인이 한 단계 빠뜨리는" 공통 패턴.

## 관련 링크

- D09 follow-up queue: `~/.claude/projects/-/memory/project_fleet_d09_followup_queue.md` (7 follow-up: P1 plan §9.8 sync 완료 + P2 2건 + P3 4건)
- D09 trigger 메모리: `~/.claude/projects/-/memory/fleet_director_d01_trigger.md` (D01-D09 학습 trail)
- subagent 룰 메모리: `~/.claude/projects/-/memory/feedback_subagent_no_push_isolation.md`
- README D09 row + sweep 주의 단락: `~/agent-fleet-state/README.md` line 41-50
- D09 source commit: `3680caf`
- D09 fix commit: `1b2c08b`
- 4 audit-trail revert: `55a5269..c4b5a55` (1차) / `d8bf73a` (2차) / `efe5d4d` (3차) / `b0343d2` (4차)
- plan: `~/.claude/plans/plan-fleet-director-2026-05-10.md` §Day 9 (line 2114-2401, D09 사후 학습 annotation 박힘)
- todos line 18 close: D09 fix 와 같은 root cause family — 자동 매칭으로 close.
