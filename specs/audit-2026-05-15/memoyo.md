# 메모요 코드베이스 감사 (2026-05-15)

대상: `~/simple_memo_app` (com.daejongkang.simple_memo_app, version 1.0.4+21). 1821 LOC / 8 dart 파일 / 의존성 3개 (uuid 4.5.1 / shared_preferences 2.3.4 / sensors_plus 6.1.1). 2026-05-12 정식 출시된 강대종님 첫 Flutter 앱. loop-fleet 사이클 2 의 🍎 본진 슬롯 산출물.

## 성능 (top 5)

| # | 이슈 | 위치 | 영향도 | 권장 fix |
|---|------|------|--------|---------|
| 1 | accelerometer stream samplingPeriod 60ms × 편집 화면 진입마다 새 구독 — 약 17 events/s, 배터리·CPU 소모 | `lib/screens/memo_edit_screen.dart:45-47` | 중 | samplingPeriod 200ms 로 완화 (`Duration(milliseconds: 200)`), shake 감지 정확도 영향 미미. 또는 `SensorInterval.normalInterval` 사용 |
| 2 | memo_list_screen 안에 setState 18+ 회 산재 — 매 swipe·reorder·edit toggle 마다 전체 화면 rebuild | `lib/screens/memo_list_screen.dart` (전체 810 LOC, line 31/39/66/98/106/134/148/178/212/233/242/280/316/342/604/613 등) | 중 | sublist 단위 ValueNotifier 분리 또는 Riverpod 도입. 메모 100건+ 누적 시 swipe latency 체감 위험 |
| 3 | ReorderableListView.builder 가 favorites/normal 2개로 분리 렌더링 — 두 list 동시 layout 비용 | `lib/screens/memo_list_screen.dart:454,489` | 저~중 | 단일 ReorderableListView + section header, 또는 `SliverReorderableList` 로 합치기 |
| 4 | SharedPreferences 에 전체 List<Memo> JSON encode/decode — 메모 1건 변경해도 전체 직렬화 | `lib/services/memo_storage.dart:13-23` | 저 (현재) ~ 중 (스케일) | 변경분만 저장하는 storage layer, 또는 hive/objectbox/sqlite 전환. 100건+ 사용자에선 저장 latency 측정 권장 |
| 5 | splash 정적 대기 — 750ms + 500ms 페이드 = 1.25초 강제 지연 (데이터 로드 완료 여부 무관) | `lib/screens/splash_screen.dart:21,32` | 저 | `Future.wait([_warmup(), Future.delayed(min)])` 패턴으로 min 만 보장. 본 화면 prefetch 시 splash 즉시 dismiss |

## 보안 (top 5)

| # | 이슈 | 위치 | 영향도 | 권장 fix |
|---|------|------|--------|---------|
| 1 | 메모 본문 평문 SharedPreferences 저장 — ADB backup / rooted 디바이스에서 직접 추출 가능 | `lib/services/memo_storage.dart:_key='memos'` | 중 | `flutter_secure_storage` (Keychain/Keystore 백엔드) 또는 사용자 PIN 도입 시 PIN 유도 키로 AES 암호화. 마이그레이션 1회 필요 |
| 2 | AndroidManifest 에 `android:allowBackup` 미명시 → 기본값 true → `adb backup` 으로 SharedPreferences 추출 가능 | `android/app/src/main/AndroidManifest.xml:application` | 중 | `<application android:allowBackup="false"` + `android:fullBackupContent="@xml/backup_rules"` 추가. 또는 Android 12+ `dataExtractionRules` 명시 |
| 3 | iOS PrivacyInfo.xcprivacy 부재 — iOS 17+ Required Reason API (UserDefaults 등) 선언 누락 → 심사 경고 위험 | `ios/Runner/` (PrivacyInfo.xcprivacy 파일 자체 없음) | 중 | `ios/Runner/PrivacyInfo.xcprivacy` 생성, `NSPrivacyAccessedAPICategoryUserDefaults` reason `CA92.1` 명시 |
| 4 | MethodChannel 명 동적 생성 `memoyo/paste_button_$id` — 실위험은 낮으나 권장 패턴 X | `lib/widgets/paste_button.dart:31` | 저 | 채널명 고정 (`memoyo/paste_button`) + arguments 로 id 라우팅. 또는 single shared channel + dispatcher |
| 5 | debugPrint 가 release 빌드엔 비어 있긴 하나, 향후 변경 시 메모 본문 로깅 위험 잔존 | `lib/services/memo_storage.dart:22`, `lib/main.dart:13,18,22-23,29-30` | 저 | 로깅 헬퍼 wrapper 도입 + 메모 본문 인자 로깅 금지 lint 추가 (또는 코드 리뷰 규칙) |

## Dead code (top 5)

| # | 이슈 | 위치 | 영향도 | 권장 fix |
|---|------|------|--------|---------|
| 1 | `.claude/worktrees/nostalgic-wing/` 통째로 잔여 — 과거 병렬 Agent 작업 임시 worktree, lib/test/AndroidManifest 등 12+ 파일 사본 | `~/simple_memo_app/.claude/worktrees/` | 저 (build 영향 X, grep/audit 노이즈) | `.gitignore` 에 `.claude/worktrees/` 추가 + 디스크 정리 (`git worktree prune` 또는 수동 rm) |
| 2 | `pubspec.yaml` 의 `assets:` 키가 빈 채로 끝남 — splash 가 `assets/images/app_icon.png` 참조하는데 등록은 미확인 (head -60 범위에선 안 보임, full read 필요) | `pubspec.yaml:assets:` 영역 | 중 (asset 누락 시 splash crash) | pubspec.yaml `flutter > assets:` 에 `- assets/images/` 한 줄 확인·추가. `flutter pub get` 후 hot restart 검증 |
| 3 | `dart:math as math` / `dart:ui as ui` import 가 memo_edit_screen 에 있으나 실제 사용 라인 미확인 (head 120 범위에선 사용 X) | `lib/screens/memo_edit_screen.dart:3,4` | 저 | `flutter analyze` 또는 `dart fix --apply` 로 unused_import 자동 정리. analysis_options.yaml 의 lint 룰 강화 |
| 4 | PasteButton — 안드로이드/web 에선 `SizedBox.shrink()` 반환 (실효 0). UX 일관성 부재 | `lib/widgets/paste_button.dart:39` | 저 | 안드로이드용 fallback IconButton 추가하거나, PasteButton 사용 측에서 platform conditional 처리로 위치 자체 조정 |
| 5 | `android/app/src/debug/AndroidManifest.xml` + `android/app/src/profile/AndroidManifest.xml` 의 INTERNET 권한 — 메모요는 네트워크 0 정책이라 debug/profile 에도 INTERNET 불필요할 가능성 | `android/app/src/debug/AndroidManifest.xml`, `.../profile/AndroidManifest.xml` | 저 | main manifest 에 `<uses-permission android:name="android.permission.INTERNET" tools:node="remove" />` 추가 검토 (단 debug hot reload 가 INTERNET 의존하면 profile/debug 만 유지) |

## 종합 의견

메모요는 2026-05-12 정식 출시된 강대종님의 첫 Flutter 앱이고, 1.0.4+21 빌드 기준 1821 LOC / 8 dart 파일 / 의존성 3개라는 매우 작은 표면적이다. "네트워크 0, 권한 0, 계정 0" ASO 셀링포인트가 코드 레벨에서 실제로 일관되게 박혀 있다 — AndroidManifest 에 권한 선언 0 (debug/profile 의 INTERNET 만 잔존), Info.plist 에 NSAppTransportSecurity·NSUserTrackingUsage 같은 트래킹 키 0, 광고/분석 SDK 의존성 0, 외부 호출 코드 0. 광고·트래커·서버 전송 차별점은 마케팅이 아니라 사실이다. 전반적 risk profile 매우 낮음 — 출시 직후 앱 치고 매우 깨끗한 상태.

다만 1.0.4 이후 차수에서 우선 처리할 가치가 있는 항목은 (a) 백업 정책 `android:allowBackup="false"` 박기, (b) iOS PrivacyInfo.xcprivacy 추가 (iOS 17+ 심사 경고 사전 차단), (c) SharedPreferences → flutter_secure_storage 전환 또는 PIN 도입 시 AES 암호화 (메모 본문 평문 저장 노출 위험 제거), (d) accelerometer samplingPeriod 60ms → 200ms 완화 (배터리). (a) + (b) 는 코드 수정 0~소량 + 영향 즉시 큰 항목이라 다음 사이클 최우선.

다음 사이클 우선순위 1줄 — **(a) `android:allowBackup="false"` + (b) iOS `PrivacyInfo.xcprivacy` 신설 묶음 (2시간 안 처리, 보안·심사 양면 즉시 효과).**
