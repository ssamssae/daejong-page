---
prevention_deferred: null
---

# codex 노드 전부 idle — A게이트 ssh 가 루프 stdin 삼킴 (SC2095)

- **발생 일자:** 2026-06-06 22:0x KST
- **해결 일자:** 2026-06-06 23:48 KST
- **심각도:** high
- **재발 가능성:** medium
- **영향 범위:** 자동 사이클 — codex 워커 노드(라이덴/데스크탑/노트북) dispatch 경로(routing-lib A게이트, codex-night-cycle)

## 증상
자동 사이클에서 codex 워커 노드가 전부 idle — 오케스트레이터가 노드 dispatch 를 한 번 돌리면 첫 노드 이후로 일감이 주입되지 않음. 노드는 살아있으나 디렉티브가 도착하지 않아 일을 안 함.

## 원인
A게이트 dispatch 루프가 `while read ... ; do ssh <node> ...; done` 형태였는데, 루프 내부 `ssh` 가 `-n` 없이 호출돼 **루프의 stdin(노드 목록) 을 통째로 삼킴**(shellcheck SC2095). 첫 iteration 의 ssh 가 남은 노드 목록을 다 빨아들여 루프가 1회만 돌고 종료 → 둘째 노드부터 dispatch 안 됨 = 전 노드 idle 근인.
추가로 #106 에서 `TASK_LEASE` 변수가 정의보다 reap 사용이 앞서 unbound(SC2154) 회귀.

## 조치
- (1) routing-lib A게이트: 루프 내 `ssh` → `ssh -n` 으로 stdin 격리. 커밋 `daee74c`.
- (2) codex-night-cycle: `TASK_LEASE` 정의를 reap 사용 앞으로 이동(unbound 회귀 fix). 커밋 `39f737c`.
- (3) 재발방지 forcing function: `scripts/tests/test_shellcheck_critical.sh` — 워커 픽/디스패치 경로(routing-lib·codex-night-cycle·*worker*·mac-report)에서 SC2095(ssh stdin 삼킴)·SC2154(unbound) 두 버그 클래스를 hard-fail. 커밋 `f6f88a0`. (검증: 현재 PASS, `-n` 제거 시 SC2095 FAIL.)

## 예방 (Forcing function 우선)
- **막을 코드/훅:** `~/claude-automations/scripts/tests/test_shellcheck_critical.sh` (커밋 f6f88a0) — SC2095/SC2154 회귀를 워커 경로에서 hard-fail.
  - ⚠️ **현재 hook 미연결(2026-06-12 발견)**: 원래 이 테스트는 맥미니 `.git/hooks/pre-commit` 에 직접 연결돼 .sh 스테이징 시 자동 실행됐으나, 2026-06-10 동일 hook 슬롯이 `pre-commit-policy-regen.sh`(T-260610-02) 심볼릭링크로 **덮어써짐** → policy-regen 훅이 shellcheck 테스트를 chaining 하지 않아 가드가 비활성. **단일 hook 슬롯 clobber 패턴** — 두 forcing function 이 같은 `.git/hooks/pre-commit` 슬롯을 다투다 나중 것이 앞 것을 무력화. 복구안 = policy-regen 훅이 shellcheck 테스트를 chaining 하도록 wrapper 화(또는 pre-commit dispatcher 도입). [[feedback_infra_guard_protect_marker]]

## 재발 이력
<처음 생성 시 비워둠>

## 관련 링크
- 커밋: daee74c (ssh -n), 39f737c (TASK_LEASE unbound), f6f88a0 (shellcheck 회귀가드)
- 관련 이슈: 2026-06-08-codex-night-cycle-partial-failure-and-demote.md
- 메모리: `feedback_infra_guard_protect_marker`
