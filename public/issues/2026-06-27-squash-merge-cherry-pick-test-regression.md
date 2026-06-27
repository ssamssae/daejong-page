---
prevention_deferred: null
---

# squash-merge 된 PR 의 후속 작업 브랜치 — main 베이스로 옮기면 테스트 회귀

- **발생 일자:** 2026-06-27 ~20:45 KST (첫이름 모바일 QA E2E 머지 처리 중)
- **해결 일자:** 2026-06-27 21:00 KST (머지 중단으로 회귀 방지, 재작업 과제로 분리)
- **심각도:** medium
- **재발 가능성:** medium
- **영향 범위:** squash-merge 된 PR 위에 쌓인 후속 prefix 브랜치를 main 에 반영하는 머지 워크플로우

## 증상
첫이름 모바일 QA E2E fix(`macmini/cheotireum-mobile-e2e-fix-260627`, HEAD `1eb52de`)는 base 인 desktop 모바일앱 브랜치(`84d3a53`) 위에서 게이트가 전부 GREEN 이었다(flutter test 19+2skip / QA_MODE 21 / analyze 0 / worker npm 전부 PASS). 그런데 그 fix 를 origin/main(`d061883`) 위로 cherry-pick(텍스트 충돌 없이 clean)한 뒤 다시 게이트를 돌리니 flutter test 1건이 FAIL 했다 — `test/widget_test.dart` 가 옛 문구 "생년월일을 입력해 주세요" 위젯을 찾는데 0개 발견.

## 원인
원 PR(#24, desktop 모바일앱 → main)이 **squash-merge** 되며 main HEAD 가 `d061883 "improve naming input and payment guardrails (#24)"` 이 됐다. squash 라 desktop 의 개별 커밋은 main 에 ancestor 로 존재하지 않고, 게다가 squash 에 포함된 naming-input 개선이 desktop 베이스에는 없던 변경이라 main 과 desktop 베이스가 의미적으로 diverge 했다. cherry-pick 은 텍스트 레벨에선 clean 했지만, 바뀐 입력 문구를 기대하는 위젯 테스트가 main 베이스에서 깨졌다. "desktop 베이스 게이트 green" 만 믿고 머지했으면 회귀를 main 에 흘릴 뻔했다.

## 조치
머지 게이트 금지사항("테스트 실패/head mismatch/dirty 면 merge 금지")을 적용해 main 머지를 중단했다. 임시 cherry-pick 브랜치는 삭제하고 작업 브랜치는 그대로 보존. fix 를 main(`d061883`) 베이스로 재정렬(생년월일 입력 문구/검증을 main 기준으로 갱신)하는 재작업 과제로 분리(T-260622-02).

## 예방 (Forcing function 우선)
squash-merge 된 PR 의 **후속 작업 브랜치는 머지 전 반드시 (1) main 베이스로 rebase/cherry-pick 한 뒤 (2) main 베이스에서 게이트를 재실행**해서 green 을 확인한다. "base 브랜치에서 green" 만으로 머지 판단 금지 — squash 는 base 브랜치와 main 을 diverge 시키므로 base-green 이 main-green 을 보장하지 않는다.

- **막을 코드/훅:** 머지 게이트 절차에 "squash divergence 시 main-base 재게이트 필수" 박기 (merge-janitor / 오케 머지 체크리스트)

## 재발 이력
<처음 생성 — 비움>

## 관련 링크
- 관련 작업: T-260622-02 (첫이름 모바일 앱 출시/IAP/영수증 검증), PR #24 (desktop 모바일앱 → main, squash-merged)
