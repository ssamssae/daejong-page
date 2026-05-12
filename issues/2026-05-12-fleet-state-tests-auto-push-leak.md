---
prevention_deferred: null
---

# fleet-state test harness 의 git push 가 리뷰 미통과 commit 까지 origin 으로 끌고 올라감

- **발생 일자:** 2026-05-12 (D07-prereq triad 작업 중)
- **해결 일자:** 미해결 (follow-up todo 등록, D07 cron 통합 전 처리 예정)
- **심각도:** medium (process 룰 위반 — 코드 손상 X, 보안 영향 X. 그러나 "commit 은 review 후" 원칙 무력화)
- **재발 가능성:** 100% (현재 test harness 구조 유지 시 매번 발생)
- **영향 범위:** agent-fleet-state private repo, fleet-director 모든 Day implementer 워크플로우

## 증상

D07-prereq triad implementer 가:
1. 6항목 패치를 working tree 에 작성
2. 로컬에 `bc2bbbf` 단일 commit 작성 (origin/main 보다 1 commit 앞섬)
3. `bash tests/*.test.sh` 풀 실행
4. `tests/stale-recover.test.sh` / `tests/claim-race.test.sh` 가 fixture 생성·정리 도중 `git push --quiet origin main` 호출

결과: tests 의 fixture-cleanup push 가 local main HEAD 전체를 origin/main 까지 끌어올림. **`bc2bbbf` (리뷰 미통과 implementer commit) 가 spec-reviewer / code-quality-reviewer 호출 전에 origin/main 에 박힘.**

memory `fleet_director_d01_trigger.md` line 28 의 "commit 은 review 후" 원칙 위반. 같은 family: D04#1 sweep, D05#1.

## 원인

`tests/*.test.sh` 는 fleet-state 자체 repo 안에서 실행되며, fixture 를 `git commit + git push origin main` 으로 origin 에 박는 방식으로 격리한다. `git push` 가 **branch HEAD 전체** 를 origin/main 까지 fast-forward push 하기 때문에, fixture 가 아닌 working-tree-ahead commit (implementer 의 unreviewed commit) 도 함께 올라간다.

즉 test harness 는 "fixture 만 push 한다" 는 의도였지만, git push semantics 상 그 위에 쌓인 모든 ancestor commit 까지 같이 push 됨. fixture push 와 implementer commit push 가 분리되지 않는다.

## 조치 (현재 작업)

bc2bbbf 자체는 force-push revert 시 위험이 더 큼 (공유 branch 파괴 가능성):
- 그대로 두고 spec-reviewer / code-quality-reviewer 가 **이미 origin 에 박힌 bc2bbbf SHA 를 직접 검토**
- 문제 발견 시 force-push 없이 **follow-up commit 으로 fix-forward**
- code 와 process 를 분리해 수습: code 는 review 로 정상화, process 는 별도 격리 패치로 재발 방지

## 재발 방지 (follow-up)

todos.md "fleet-state test harness push 격리" 로 등록. 해법 후보 3가지:

1. **별도 branch push**: tests 가 `git push origin HEAD:refs/heads/test-fixtures` 처럼 main 이 아닌 별도 ref 로 fixture 를 push. main 에는 implementer 의 review 후 push 만 도달.
2. **ephemeral worktree clone**: tests 가 본 워크트리에서 분리된 `git worktree add` 환경에서 돌고, 그 안에서 push 한 fixture 만 origin/main 으로 머지.
3. **implementer 변경 stash 후 push**: tests 가 시작 시점에 implementer 의 staged/unstaged 변경을 stash, fixture push 후 pop. main 에 stash 내용이 끼지 않음.

D07 cron 통합 전 우선 처리.

## 학습

- "follow-up 큐는 같은 failure mode 가 연속 2회 재현되면 active blocker 로 격상" 룰 (memory fleet_director_d01_trigger.md line 116) — D04#1 sweep / D05#1 sweep 의 process 변종. failure-mode 측면에서 3번째 family member 후보 → same-family 3rd-instance 룰에 따라 D07 시작 전 active blocker 격상.
- v0.1 격리 = process 측면에서 명확한 boundary 부재. test harness 가 production push semantics 와 동일 (`git push origin main`) 를 사용한 것 자체가 디자인 결함. integration test 와 production push 는 다른 메커니즘이어야 함.
