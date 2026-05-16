---
prevention_deferred: null
---

# D07 install-launchd.sh smoke self-load — guard 검증 의도가 실 install 까지 가버린 사고

- **발생 일자:** 2026-05-16 16:55 KST (즈음)
- **해결 일자:** 2026-05-16 17:00 KST
- **심각도:** medium (실 부작용 0, 5분 worker spawn 발화 전 rollback 성공)
- **재발 가능성:** medium (스크립트 구조 단일 단계라 또 발생 가능)
- **영향 범위:** Mac 본진 `~/Library/LaunchAgents/` (rollback 완료), agent-fleet-state D07 게이트 청소 사이클, D0N strict trigger 룰 위반 사례 1건

## 증상

D07 follow-up queue 의 q#4 (install-launchd.sh hostname guard 추가) 패치를 검증할 의도로 `bash scripts/install-launchd.sh macbook` 직접 실행. guard 통과 후 스크립트가 그대로 plist 복사 + `launchctl load` 까지 진행됨. 비가역 외부영향 작업(launchd job 등록)이 검증 의도 안에서 실 install 까지 가버린 D0N 룰 위반.

## 원인

install-launchd.sh 가 단일 entry 스크립트로 (a) hostname guard → (b) plist 복사 → (c) launchctl load 가 한 통에 묶여있음. 가드 한 부분만 떼서 검증할 dry-run 모드 / 단위 테스트 entry 부재. "guard 검증" 의도가 곧 "전체 install 실행" 이 되는 구조적 위험.

## 조치

1. `launchctl unload ~/Library/LaunchAgents/com.fleet.*.plist` 즉시 실행
2. `rm ~/Library/LaunchAgents/com.fleet.*.plist` plist 파일 제거
3. `launchctl list | grep fleetdirector` 0 entries 확인 — 5분 worker spawn 발화 전 rollback 완료, 실 부작용 0
4. trio-vote (C) stash + stop 결정 (msg_id 17835) 따라 D07 게이트 청소 패치 stash@{0} (`d07-gate-cleanup-pre-stop 2026-05-16`) 보존
5. 재진입은 명시 ack 대기 (todos.md `D07 게이트 청소 재진입` 항목으로 박힘)

## 예방 (Forcing function 우선)

후보 ranking, 강대종 결정 필요:

(1순위) **install-launchd.sh 첫줄에 ack 환경변수 게이트 추가** — `if [[ -z "$D0N_ACK" ]]; then echo "[D0N] 비가역 작업. D0N_ACK=yes 환경변수 필요."; exit 1; fi`. 검증 의도면 D0N_ACK 빼고 호출 → 가드까지만 돌고 exit. 실 install 의도면 D0N_ACK=yes 명시. 가장 forcing.

(2순위) **--dry-run 플래그 추가** — `--dry-run` 인자 받으면 guard / plist generate 까지만 가고 copy + load 직전 STOP + diff 출력. ack 우회 가능성은 있지만 사람 의지 의존도 줄임.

(3순위) **guard 부분 별 함수 + 단위 테스트 entry 분리** — guard logic 을 `lib/guard.sh` 같이 sourced-only 함수로 빼고 `tests/guard_test.bats` 로 테스트. install-launchd.sh 는 guard 통과만 호출. 구조적 정합성 최고지만 작업 분량 큼.

본 작성 시점 1순위 채택 권장 — D0N strict trigger 룰을 스크립트 본체에 inline 으로 forcing function 화. 머지 사이클은 D07 게이트 청소 재진입 PR 에 묶어서.

## 재발 이력

## 관련 링크

- 메모리: `feedback_d0n_strict_trigger_no_chain.md` (D0N — ambiguous ack 거부 + chain 금지)
- todos: `~/todo/todos.md` 진행중 "D07 install-launchd.sh smoke self-load 사고 이슈 박제"
- trio-vote: 텔레그램 msg_id 17835 (stash + stop 결정)
- 관련 이슈: `2026-04-21-launchd-silent-job-dropout.md`, `2026-05-11-launchd-clear-trigger-abort-loop.md` (둘 다 install 자체 사고 아님 — 별건)
