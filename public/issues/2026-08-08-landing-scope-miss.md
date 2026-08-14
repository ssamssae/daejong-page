---
prevention_deferred: 2026-08-16
---

# directive 착탄 검증기 pinned-scope-miss 오탐 — 정상 착탄 2회를 PENDING 보류

- **발생 일자:** 2026-08-08 22:47 KST (1차) / 23:31 KST (2차)
- **해결 일자:** 2026-08-08 23:33 KST (수동 확인 우회)
- **심각도:** low
- **재발 가능성:** high
- **영향 범위:** 본진 오케 배차 플로우 전반 (`*-directive.sh` → directive-landing-verify)

## 증상
본진→테미스 배차 2회(T-260808-029·T-260808-030) 모두 발사 스크립트가 exit 7 로 끝나며 `LANDING-VERDICT: PENDING reason=pinned-scope-miss` 를 냈다. 착탄 자체는 nonce 로 감지됐고("노드 트랜스크립트에 nonce 흔적 확인") 실제로 워커가 즉시 작업을 시작했는데, 검증기가 성공 판정을 거부해 매번 수동 확인이 필요했다.

## 원인
(추정) 검증기가 발사 전에 대상 pane 의 당시 트랜스크립트(c92b24f6…)를 landing 검증 범위로 고정(pin)하는데, 대상 세션이 클리어·재시작으로 활성 트랜스크립트가 다른 파일(1b3e812a…)로 넘어가 있으면 고정 스코프가 낡는다. 검증기는 LANDED 3증거(nonce·user 이벤트·모델 턴 개시)를 새 트랜스크립트에서 이미 잡고도, pinned 파일과 다르다는 이유로 PENDING 처리한다.

## 조치
2회 모두 수동 확인으로 착탄 실증 후 진행: 대상 트랜스크립트에서 T-id grep(11회/16회 명중) + `tmux-repl-busy.sh claude` rc=0(작업 개시) 실측. 검증기 지침("재발사 금지 — 중복 주입")은 준수, 재발사 없음.

## 예방 (Forcing function 우선)
directive-landing-verify 가 nonce+user 이벤트+모델 턴 3증거를 **같은 트랜스크립트**에서 잡으면, pinned 파일과 달라도 LANDED(세션 귀속을 그 트랜스크립트로 갱신)로 판정하게 수리. pinned-scope-miss 는 "귀속 갱신됨" 정보 라벨로 강등.

- **막을 코드/훅:** `none`
  - (deferred — 작성 마감 2026-08-16) 수리 대상 = `claude-automations/scripts/directive-landing-verify.py` 판정부. 8/16 전 재발 시 티켓 승격해 코드 수리 선행.

## 재발 이력

## 관련 링크
- 배차 로그: T-260808-029 / T-260808-030 (tasks.md, 둘 다 완주 [x])
- 관련 이슈(별건): 2026-07-03-macmini-double-dispatch-duplicate-build.md — 재발사 금지 지침의 근거 사고
