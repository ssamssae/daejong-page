# loop-fleet audit 미완 7앱 후속 감사 (2026-06-06)

작성: 🖥 desktop3060ti / 브랜치: `desktop3060ti/2026-06-06-1501`  
대상 task: `T-260515-18`  
범위: 사이클 2 audit 에서 빠진 7개 항목(밥먹자 / 한컵 / pomodoro / 랜덤픽(lottocalc) / 미니가계부 / stock_monitor / babmeokja)

이번 사이클은 **감사만** 수행했다. 앱 코드 수정 PR 은 만들지 않았다.

---

## 범위 회수

기존 사이클 2 audit 완료 5개: 메모요 / 단어요 / 약먹자 / 더치페이 / 한줄일기.  
이번 후속에서 코드 감사 가능했던 항목은 5개다.

| 항목 | repo | 기준 | 검증 |
|---|---|---:|---|
| 한컵 | `~/apps/hankeup` | `e6031d4`, v1.0.0+1 | `flutter analyze` 1 info, `flutter test` 2 pass |
| pomodoro | `~/apps/pomodoro` | `b9541e9`, v1.0.0+7 | analyze clean, test 3 pass |
| 랜덤픽(lottocalc) | `~/apps/lotto-calc` | `origin/main` `77a0a1a`, v1.1.0+4 | analyze clean, test 10 pass |
| 미니가계부 | `~/apps/mini_expense` | `1c2c8d0`, v1.0.0+1 | analyze clean, test 1 pass |
| stock_monitor | `~/apps/stock_monitor` | `29403da`, v1.0.0+1 | analyze clean, test 3 pass |

`mini_expense` 와 `stock_monitor` 는 로컬에 없어 원격 `ssamssae/*` 에서 신규 clone 후 감사했다. `lotto-calc` 는 로컬 브랜치가 다른 PR 작업 중이고 `pubspec.lock` 이 이미 dirty 라서, `origin/main` 임시 worktree 로 검증했다.

미해결 항목:

- `밥먹자`: 로컬 `/home/user` 와 `gh repo list ssamssae --limit 200` 에서 매칭 repo 없음.
- `babmeokja`: 위와 동일. `bapeo` 는 이름만 유사하고 README 기준 "자율주행 앱 빌드 PoC" 이므로 밥먹자 앱으로 간주하지 않았다.

즉, T-260515-18 의 7개 중 **5개는 코드 감사 완료, 2개는 인벤토리 정합 이슈**다. 다음 액션은 `밥먹자/babmeokja` 가 실제 제품이면 repo 이름을 확정하고, stale 항목이면 tasks 쪽에서 취소/이름 정정이 맞다.

---

## 한컵 (`hankeup`)

규모: lib 1,038 LOC / test 26 LOC / 의존성 `shared_preferences`.

| 축 | 이슈 | 위치 | 영향 | 권장 |
|---|---|---|---|---|
| Perf | `WaterFill` 의 `AnimationController` 가 홈 화면 표시 중 계속 repeat 된다. 물결 하나 때문에 정적 카운터 화면 전체가 지속 repaint 된다. | `lib/water_background.dart:30-32`, `:67-84` | 저-중 | fill 변화 직후 짧은 애니메이션만 돌리거나, `TickerMode`/idle stop 적용 |
| UX/Perf | `TweenAnimationBuilder` 가 `Tween(begin: _animatedFill, end: _animatedFill)` 로 매번 같은 값 tween 을 만든다. fill 전환 애니메이션이 사실상 jump 로 보일 수 있다. | `lib/water_background.dart:43-47`, `:70-72` | 중 | old fill 과 new fill 을 분리 저장해 `Tween(begin: old, end: new)` 로 변경 |
| Security | Android `allowBackup` 미명시. 컵 기록은 민감도 낮지만 "로컬 저장" 앱군 공통 정책과 맞추려면 백업 정책을 명시하는 편이 낫다. | `android/app/src/main/AndroidManifest.xml:2-5` | 저 | `android:allowBackup="false"` 또는 backup rules 명시 |
| Dead | `HanKeupModel.resetToday()` 호출자 0. | `lib/model.dart:27-29` | 저 | reset UX 를 넣거나 메서드 삭제 |
| Test | 기본 smoke test 가 `SharedPreferences.setMockInitialValues` 없이 root widget 존재만 본다. 실제 로딩 후 문구/카운트 검증이 약하다. | `test/widget_test.dart:6-10` | 저 | prefs mock + "한컵/오늘/0" 렌더 검증 추가 |

다음 PR 후보: **WaterFill tween 교정 + analyzer info(`unnecessary_underscores`) 정리**. 기능 리스크가 작고 눈에 보이는 품질 개선이다.

---

## 포모도로 (`pomodoro`)

규모: lib 1,216 LOC / test 60 LOC / 의존성 `shared_preferences`, `flutter_local_notifications`, `timezone`.

| 축 | 이슈 | 위치 | 영향 | 권장 |
|---|---|---|---|---|
| Policy/Security | Android manifest 에 `SCHEDULE_EXACT_ALARM` 와 `USE_EXACT_ALARM` 이 같이 있다. Play 정책상 exact alarm 은 심사 질문과 거절 표면이 될 수 있다. | `android/app/src/main/AndroidManifest.xml:2-4` | 중 | 실제 필요 권한 1개로 축소, exact alarm 거절 시 in-app timer fallback 명시 |
| UX | 알림/정확알람 권한 요청이 첫 `start` 경로에서 lazy 발생한다. 사용자가 시작 버튼을 누른 직후 시스템 권한 흐름에 끊길 수 있다. | `lib/services/pomodoro_notifier.dart:28-31`, `home_screen.dart:222-240` | 중 | 설정/온보딩에서 권한 설명 후 opt-in, 거부 시 화면 내 완료 표시 유지 |
| Perf | 1초 `Timer.periodic` 이 홈 전체 `setState` 를 유발한다. 현재 규모는 괜찮지만 footer/통계/버튼까지 매초 rebuild 된다. | `lib/screens/home_screen.dart:240`, `:272-280` | 저-중 | 남은 시간 표시를 별도 `ValueListenableBuilder`/subwidget 로 격리 |
| Dead | 공장 템플릿 `common/simple_app.dart`, `common/local_store.dart` 가 import 0. | `lib/common/simple_app.dart`, `lib/common/local_store.dart` | 저 | 삭제하거나 실제 shared template repo 로 이동 |
| Future footgun | pause/reset 이 `cancelAll()` 을 호출한다. 현재는 알림 1개뿐이지만 향후 다른 알림을 추가하면 같이 지워진다. | `lib/services/pomodoro_notifier.dart:69-72`, `home_screen.dart:252`, `:263` | 저 | `_phaseEndNotifId` 만 `cancel(id)` |

다음 PR 후보: **unused template 파일 삭제 + `cancel(id)` 축소**. exact alarm 정책은 릴리스 전 결정 항목으로 분리하는 편이 안전하다.

---

## 랜덤픽 / 로또계산기 (`lotto-calc`)

기준: `origin/main` 임시 worktree. 규모: lib+test 460 LOC / 의존성 `cupertino_icons` 만.

| 축 | 이슈 | 위치 | 영향 | 권장 |
|---|---|---|---|---|
| Trust | 번호 생성에 `Random()` 을 사용한다. 보안 기능은 아니지만 "행운번호 생성기" 에서 예측 가능 PRNG 는 신뢰감이 떨어진다. | `lib/services/quick_pick.dart:4` | 저-중 | `Random.secure()` 로 교체, 실패 시 일반 Random fallback |
| Release | Android label 이 `lottocalc`, 앱 title 은 `행운번호 생성기`. 스토어/런처 이름 정합이 약하다. | `android/app/src/main/AndroidManifest.xml:3`, `lib/main.dart:15` | 중 | manifest label 을 실제 표시명으로 변경 |
| Release | release build 가 debug signing config 를 쓴다. 실제 배포 전 차단해야 한다. | `android/app/build.gradle.kts:33-37` | 중 | release signing config/key.properties 연결 또는 Android 미출시 명시 |
| Dead | `cupertino_icons` 의존성이 있으나 코드에서 Cupertino 사용 0. | `pubspec.yaml:36`, `lib/` | 저 | 의존성 제거 |
| Dead/Drift | `assets/lotto_history.json` 과 seed tests 는 존재하지만 현재 runtime 은 quick-pick 만 사용한다. stats 재개 전까지는 parked surface 다. | `assets/lotto_history.json`, `test/lotto_history_seed_test.dart` | 저 | `docs/v1-stats-spec.md` 와 연결하거나 stats 미진행이면 tests/docs 이름에 parked 명시 |

다음 PR 후보: **런처 label 정정 + unused `cupertino_icons` 제거**. 작은 릴리스 정합 PR 로 처리 가능하다.

---

## 미니가계부 (`mini_expense`)

규모: lib 1,202 LOC / test 24 LOC / 의존성 `shared_preferences`.

| 축 | 이슈 | 위치 | 영향 | 권장 |
|---|---|---|---|---|
| Security | 지출 금액/메모가 SharedPreferences JSON 평문 + Android `allowBackup` 기본값으로 남는다. 가계부 데이터는 메모/물컵보다 민감하다. | `lib/common/local_store.dart:27-42`, `android/app/src/main/AndroidManifest.xml:2-5` | 중-고 | 최소 `allowBackup=false`; 장기적으로 암호화 또는 백업 제외 rules |
| UX/Data loss | swipe 삭제가 즉시 저장되고 undo/confirm 이 없다. 실수로 민감한 지출 기록을 잃기 쉽다. | `lib/screens/home_screen.dart:331-355` | 중 | SnackBar undo 또는 삭제 확인 |
| Perf | `_todayTotal`, `_monthTotal`, `_monthByCategory` 가 build 마다 `_items` 를 3회 순회한다. 현재는 작지만 월 수백건이면 불필요하다. | `lib/screens/home_screen.dart:56-84`, `:164`, `:218`, `:246` | 저-중 | `_reload()` 때 summary 캐시 계산 |
| Storage | add/delete 마다 전체 list JSON 을 save 후 reload 한다. | `lib/screens/home_screen.dart:47-53`, `lib/common/local_store.dart:39-42` | 저-중 | 당장은 OK. 500건+ 목표면 SQLite/Hive 또는 append/update 계층 |
| Dead | `common/simple_app.dart` 는 import 0, `cupertino_icons` 도 사용 0. | `lib/common/simple_app.dart`, `pubspec.yaml:14` | 저 | 삭제 |

다음 PR 후보: **삭제 undo + Android backup 차단**. 사용자 데이터 보호와 실사용 마찰을 동시에 줄인다.

---

## stock_monitor

규모: lib 1,266 LOC / test 69 LOC / 의존성 `http`, `shared_preferences`, `fl_chart`.

| 축 | 이슈 | 위치 | 영향 | 권장 |
|---|---|---|---|---|
| Security/Runtime | KRX endpoint 가 `http://data.krx.co.kr` cleartext 다. Android release 에서 cleartext 차단 또는 MITM 표면이 된다. | `lib/services/krx_service.dart:8`, `:14`, `android/app/src/main/AndroidManifest.xml:2` | 고 | HTTPS 가능 여부 확인, 불가하면 서버/배치 프록시로 이동 |
| Product risk | KRX/Yahoo 실패 시 mock 가격을 반환한다. 배지는 `Mock` 이지만 포트폴리오 합계와 목표가 판단에는 가짜 가격이 섞인다. 금융 정보 앱에서 가장 위험한 설계다. | `lib/services/krx_service.dart:35-40`, `:51-56`, `:254-258` | 고 | mock 은 개발모드만 허용, production 은 stale/error 상태로 표시 |
| Perf/Network | 관심종목 전체를 `Future.wait` 로 동시에 조회하고 KRX 는 종목당 OTP+data 요청을 보낸다. 20개면 40+ 요청이 한 번에 몰린다. | `lib/services/krx_service.dart:61-62`, `home_screen.dart:52-55` | 중 | concurrency cap, per-item loading, cache/stale-while-refresh |
| UX/Input | 종목 코드 검증이 non-empty 뿐이다. 문자/자리수 오류가 바로 네트워크 실패와 mock fallback 으로 이어진다. | `lib/screens/home_screen.dart:260-268`, `:310` | 중 | 6자리 숫자 formatter + 종목명 자동 lookup |
| Dead/Test | `test/widget_test.dart` 는 placeholder 다. 핵심 KRX/Yahoo parser 와 mock fallback 금지 정책 테스트가 없다. | `test/widget_test.dart:3-6` | 중 | service parser fixture + fallback behavior test 추가 |

다음 PR 후보: **mock fallback 제거/격리 + cleartext KRX 경로 결정**. 금융 앱이라 이 둘이 출시 차단급이다.

---

## 인벤토리 정합: 밥먹자 / babmeokja

확인한 것:

- 로컬: `/home/user` 아래 `babmeokja`, `bap*`, `meal*` 계열 Flutter repo 없음.
- 원격: `gh repo list ssamssae --limit 200` 에 `babmeokja` 또는 밥먹자 대응 repo 없음.
- `~/bapeo` 는 `bapeo (바퍼)` 로, README/SPEC 기준 5노드 자율주행 앱 빌드 PoC 이다. 음식 앱이 아니라 이번 감사에서 제외했다.

결론: `밥먹자` 와 `babmeokja` 는 실제 repo 명 확정 전까지 코드 감사 불가. 둘이 같은 앱의 한/영 표기라면 T-260515-18 의 "7앱" 카운트가 6 distinct 로 잘못 잡혔을 가능성이 있다.

권장: tasks 에 `repo=` 메타를 붙인다. 예: `밥먹자(repo=?)`, `babmeokja(repo=?)`. repo 가 없으면 `[-] stale` 로 닫고, 만들 계획이면 별도 scaffold task 로 분리한다.

---

## 전체 우선순위

1. **stock_monitor mock fallback 제거 + KRX cleartext 결정**  
   가짜 금융 데이터가 실제 UI 합계로 들어가는 구조가 가장 위험하다.
2. **mini_expense backup 차단 + 삭제 undo**  
   지출 데이터는 민감하고, 현재 삭제는 되돌릴 길이 없다.
3. **pomodoro exact alarm 권한 정책 결정**  
   Play 정책/권한 UX 와 직접 연결된다.
4. **hankeup WaterFill tween 교정**  
   작은 품질 버그. 저위험 PR 로 좋다.
5. **lotto-calc release 정합(label/signing) + dead dependency 제거**  
   앱 품질/배포 위생 항목이다.
6. **밥먹자/babmeokja repo 확정**  
   현 상태는 코드 감사 대상이 아니라 인벤토리 정합 작업이다.

---

## 검증 메모

사용 SDK: `/home/user/sdks/flutter-3.44.0/bin/flutter`  
검증 후 `pub get` 이 만든 `pubspec.lock`/generated 파일 변경은 감사 repo 들에서 되돌렸다. 기존에 dirty 였던 `~/apps/lotto-calc/pubspec.lock` 은 건드리지 않았다.

요약:

- `hankeup`: analyze 1 info(`lib/water_background.dart:74:43 unnecessary_underscores`), test 2 pass.
- `pomodoro`: analyze clean, test 3 pass.
- `lotto-calc origin/main`: analyze clean, test 10 pass.
- `mini_expense`: analyze clean, test 1 pass.
- `stock_monitor`: analyze clean, test 3 pass.

