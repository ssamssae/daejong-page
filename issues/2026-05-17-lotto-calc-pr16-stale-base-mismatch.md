# 2026-05-17 — lotto-calc PR #16 stale base mismatch (sweep step 0 git fetch+status 누락)

## 발생

2026-05-17 KST, WSL 노드(`DESKTOP-I4TR99I`)가 P2/P4 후속 PR 6개 sweep 작업 중 lotto-calc 만 base mismatch 사고 발생.

- 5/6 repo (wordyo, mini_expense, hanjul widget, hanjul lint, pomodoro) 는 step 0 `git fetch` + `git status` 수행 후 정상 분기 → MERGEABLE/CLEAN PR 생성
- lotto-calc 만 step 0 skip → 옛 commit `563edca` (PR #9 시드 파이프라인 시점) 위에 `wsl/lotto_calc-widget-test-fix-2026-05-17` 분기
- merge-base 가 563edca 인데 origin/main 은 그 사이 12 commit 진행 (stats_screen 추가, 아이콘 교체, store 메타 정리, 패키지 이름 `lottocalc` → `randompick`)
- 결과: PR #16 이 +296/-7, 7 파일, DIRTY/CONFLICTING 상태로 본진 검증에 적발됨

## 직접 원인

lotto-calc 디렉토리 진입 후 `git status` / `git fetch` 호출을 건너뛴 것. 다른 5 repo 와 동일 절차를 따랐어야 했음.

부수 효과 — 옛 base 의 home_screen 텍스트 (`로또번호 계산기` / `오늘의 6세트` / `다시 뽑기`) 와 origin/main 의 home_screen 텍스트 (`행운번호 생성기` / `번호 세트 5` / `새로 생성`) 가 달라서, 옛 base 기준으로 grep 한 widget_test patch 가 origin/main UI 와 맞지 않음. PR #16 의 패치 자체가 origin/main 기준에선 다시 깨짐.

## 조치 (WSL 자체 수정)

1. PR #16 close + comment 로 base mismatch 명시
2. local `main` → `origin/main` reset --hard (12 commit fast-forward)
3. 새 branch `wsl/lotto_calc-widget-test-fix-2026-05-17-v2` 를 origin/main 3c5d410 fresh 위에서 분기
4. `test/widget_test.dart` 단독 patch — 헤더 3건 (`행운번호 생성기` / `번호 세트 5` / `새로 생성`) + 패키지 이름 (`lottocalc` → `randompick`) + `A1~A5` 라벨 루프 minimal smoke 단순화 (`+6/-9`, 1 파일)
5. push + **PR #17 OPEN** — https://github.com/ssamssae/lotto-calc/pull/17

## 검증

- `flutter analyze` clean (No issues found)
- `widget_test.dart` 3건 PASS — 홈 화면 5세트+새로 생성 버튼 렌더링 / QuickPick.draw / QuickPick.drawSets
- `git diff origin/main..wsl/...-v2 --stat` → 1 파일 +6/-9. base mismatch 해소

본진 (Mac MBP) 가 GH API 로 PR #17 상태 검증: base=main fresh, +6/-9 단독파일, MERGEABLE/CLEAN. 5 ack'd PR (wordyo #32, mini_expense #1, hanjul #17, hanjul #16, pomodoro #1) 모두 squash 머지 완료, lotto #17 만 fresh ack 대기.

## 별건 — origin/main 자체의 broken state

`test/lotto_history_seed_test.dart` 2건이 origin/main 에서 `PathNotFoundException: assets/lotto_history.json` 으로 fail. origin/main 자체가 그 자산 파일을 git 에 가지고 있지 않음 (`git ls-files assets/` 비어 있음). 어제 sweep 보고서 시점(P2 보고서 10 PASS / 1 FAIL) 과 다름 — origin/main HEAD 가 그 사이 변동된 것으로 추정. 본 PR scope 밖, 별 사이클로 별 PR 처리.

## 교훈 + 행동 룰

- **모든 repo 작업 시작 전 step 0 `git fetch` + `git status` 필수, 무조건**. 5/6 repo 는 했지만 lotto-calc 하나 누락 → 사고. step 0 가 N건 일관되게 박혀 있어야 함.
- 추가 가드: `git checkout -b wsl/...` 직전에 `git log --oneline -1` 로 분기 base 출력. PR 보고서에 자동 inline.

기존 메모리 [[feedback_stale_branch_origin_default_check]] (자주 안 만지는 repo origin/HEAD branch + local 뒤처짐 fetch+비교 필수) 의 적용 누락 사례. 이미 룰은 있었으나 sweep 코드 패스에 inline 되지 못함이 root cause. 다음 사이클에 sweep 코드 path 에 step 0 자동 추가가 forcing function.

## 관련

- WSL 보고서 원본: 본진 mac-report.sh 받음, 보고 시각 2026-05-17 13:30 KST
- PR #16 closed: https://github.com/ssamssae/lotto-calc/pull/16
- PR #17 open: https://github.com/ssamssae/lotto-calc/pull/17
- 5 ack'd merge 시각: 본진 2026-05-17 04:41 KST (wordyo→mini_expense→hanjul→pomodoro 순)
