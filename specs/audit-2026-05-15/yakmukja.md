# 약먹자 코드베이스 감사 (2026-05-15)

**대상**: yakmukja (com.daejongkang.yakmukja), v1.0.2+5, Flutter
**위치**: `~/apps/yakmukja` (lib 7 파일, ~3,300줄)
**작성 기기**: Mac mini (🏭)
**감사 범위**: 성능 / 보안 / dead code (각 top 5)
**전제**: `fvm` PATH 부재로 `flutter analyze` 실행 불가 → 코드 정적 리딩 + manifest/pubspec 정적 검사 기반.

---

## 성능 (top 5)

| # | 이슈 | 위치 | 영향도 | 권장 fix |
|---|------|------|--------|----------|
| P1 | `NotificationService.init()` + `AdsService.init()` 가 `runApp()` 전에 동기 await — 타임존 초기화 + Android 권한 다이얼로그 + AdMob SDK init 누적 → cold-start TTI 1~3초 추가 | `lib/main.dart:36-37` | 고 | runApp 먼저 호출 + `WidgetsBinding.instance.addPostFrameCallback` 또는 `unawaited(...)` 로 백그라운드 init |
| P2 | `HomeScreen` 이 `Timer.periodic(1초)` 로 화면 전체 `setState` — 카드 N개 다 rebuild | `lib/screens/home_screen.dart:25-27` | 중 | 카운트다운 영역만 `ValueNotifier<DateTime>` + `_CountdownBanner` 로컬 Timer 로 격리, 카드 리빌드는 Hive listenable 만 |
| P3 | `Medicine.isTaken` 가 `List<String>.contains()` (O(n)) — 매초 setState × 카드수 = O(n²)/초 | `lib/models/medicine.dart:41` + `home_screen.dart:47/162/359` | 중 | `takenRecords` 를 `Set<String>` 캐시로 들고 다니거나, `_todayTakenSet` 계산을 build 한 번에서만 |
| P4 | `_todayEntries` + `_groupByPeriod` 가 build 내부 — 매초 setState 시마다 `box.values` 전수 순회 + sort | `lib/screens/home_screen.dart:184-206` | 중 | listenable 변경 시에만 재계산 — `late final` field + Hive `addListener` 또는 `useMemoized` (riverpod/hooks 도입 시) |
| P5 | `scheduleForMedicine` 가 매번 전체 cancel→다시 N개 schedule — 시간 1개만 추가해도 N 알림 재등록 | `lib/services/notification_service.dart:50-82` | 저 | diff 알고리즘 (변경된 시간만 add/cancel). N 작아 cost 가벼움 → 우선순위 낮음, 알아두기만 |

---

## 보안 (top 5)

| # | 이슈 | 위치 | 영향도 | 권장 fix |
|---|------|------|--------|----------|
| S1 | Android `allowBackup` / `dataExtractionRules` 미설정 → default 자동 Google Drive 백업에 Hive 파일 포함. ASO 광고 "데이터 서버 전송 없음" 과 직접 모순 | `android/app/src/main/AndroidManifest.xml` (3-12행, application 태그 속성 부재) | 고 | `<application android:allowBackup="false" android:dataExtractionRules="@xml/data_extraction_rules">` 추가 + `res/xml/data_extraction_rules.xml` 작성 |
| S2 | 알림 페이로드 평문 — 잠금화면에 "혈압약 2알 드실 시간입니다" 노출. 정신과·HIV·피임약 등 민감 처방 사용자 우려 | `lib/services/notification_service.dart:62` (`body: '${medicine.name} ${medicine.dosage}...'`) | 고 | (a) 본문은 일반화 ("드실 약이 있어요"), 약 이름은 앱 진입 후만, 또는 (b) Android `setVisibility(VISIBILITY_PRIVATE)` + iOS `interruptionLevel=passive` |
| S3 | AdMob Android App ID = Google **테스트 ID** (`ca-app-pub-3940256099942544~3347511713`) — TODO 미해결. Android 미출시 정책이라지만 manifest 잔류 시 향후 출시 ＝ AdMob 정책 위반 | `android/app/src/main/AndroidManifest.xml:42` + `lib/services/ads_service.dart:42-43` | 고 | Android 미출시 명시 → AdMob meta-data 통째 제거, ads_service `Platform.isAndroid` 분기에서 banner 미노출 (SizedBox.shrink) |
| S4 | Hive 박스 평문 저장 — 약 데이터 plaintext on disk. 분실 폰 + USB 시건 해제 시 약 정보 추출 가능 | `lib/main.dart:20` (`Hive.openBox<Medicine>` 인자에 `encryptionCipher` 없음) | 중 | `HiveAesCipher(key)` + 키는 `flutter_secure_storage` (Keychain/Keystore). 1회 마이그레이션 필요 |
| S5 | INTERNET 권한 묵시적 추가 — `google_mobile_ads` 가 매니페스트 merge 시 자동 주입 → ASO "인터넷 권한 사용 X" 와 모순. 사용자 신뢰 리스크 | `pubspec.yaml:51` (`google_mobile_ads: ^5.3.0`) + merged manifest | 중 | Android 미출시 결정과 묶어 google_mobile_ads dependency 제거 (iOS-only 광고 필요 시 platform 분리). 또는 마케팅 문구를 "광고 외 데이터 전송 없음" 으로 수정 |

추가 메모:
- `ITSAppUsesNonExemptEncryption=false` 명시 ✅ (iOS Info.plist:54-55)
- Android 13+ `requestExactAlarmsPermission()` 호출 ✅ (notification_service.dart:40)
- 잠금/생체인증 없음 — 폰 잠금 해제된 상태에서 누구나 약 목록 확인 가능. 의료 앱 baseline 으로는 약함 (별도 이슈로 분리 후보)

---

## Dead code (top 5)

| # | 이슈 | 위치 | 영향도 | 권장 fix |
|---|------|------|--------|----------|
| D1 | `Medicine.memo` 필드 — HiveField(3) 등록되어 있으나 edit screen 에서 `memo: ''` 하드코딩, UI 노출 0 | `lib/models/medicine.dart:17` + `lib/screens/medicine_edit_screen.dart:260` | 중 | 옵션 1: UI 노출 (메모 textfield 추가) / 옵션 2: 필드 제거 + Hive schema migration (typeId 유지) |
| D2 | `AdsService._realAndroidBannerUnitId` 의 값이 실 ID 가 아닌 **테스트 ID** — 이름과 의미 mismatch (semantic dead) | `lib/services/ads_service.dart:42-43` | 중 | 변수 제거 + `bannerAdUnitId` getter 에서 `Platform.isAndroid → SizedBox.shrink` 로 분기. S3 과 함께 처리 |
| D3 | `widget_test.dart` placeholder (`expect(1+1, 2)`) — 회귀 안전망 0, dead test | `test/widget_test.dart` | 저 | Medicine 모델 + DoseTime + isTaken/pruneOldRecords 단위 테스트로 교체 (trivial, ~20분) |
| D4 | DEVLOG.md "사용 패키지" 표에 `url_launcher ^6.3.2` 존재 — pubspec 에는 없음 (제거됨 또는 stale). docs↔code 불일치 | `DEVLOG.md` (사용 패키지 표) | 저 | DEVLOG 정정 또는 자동 생성 스크립트 도입 (`flutter pub deps --json` 기반) |
| D5 | Splash logo `errorBuilder` fallback — assets/images/logo.png 존재 시 도달 불가. 다만 빌드 시 누락 가능성 대비 보존 가치 있음 (semi-dead) | `lib/screens/splash_screen.dart:77-82` | 저 | 액션 X — 보존 권장. 단, 빌드 시 logo.png 누락 시 verbose log 추가 권장 |

추가 메모:
- `_FatalErrorApp` (main.dart:44-86) — Hive init 실패 시만 진입. dead 가 아닌 production fallback path. 보존.
- pubspec.yaml 의 80+줄 기본 주석 (asset/font 가이드) — 신규 Flutter 프로젝트 템플릿 default. 정리 후보지만 우선순위 매우 낮음.

---

## 종합 의견

**1) 코드 품질 자체는 1인 개발 1.0.x 수준 기대치 이상.** lib 7 파일, ~3,300줄에 비해 production 디테일이 잘 잡혀 있다. Hive 박스 corruption 자동 복구 (main.dart:21-25), `_FatalErrorApp` fallback, `pruneOldRecords` 30일 자동 정리, `_notificationId` snapshot before delete (notification_service.dart:86-95), `taskAffinity=""` Android 추가 — 1인 개발자가 흔히 놓치는 엣지케이스를 의식적으로 처리한 흔적이 곳곳에 보임. M3 + dark theme + CupertinoPicker 휠 UI 의 디자인 일관성도 단단함.

**2) 가장 큰 risk 는 "마케팅 정책과 코드 실태 사이의 갭".** ASO 와 store_metadata.md 가 광고하는 "광고 없음", "데이터 서버 전송 없음", "인터넷 권한 사용 X", "100% 로컬 전용" 4개 주장 중 코드 실태로 검증되는 것은 사실상 "Hive 평문이지만 외부 전송 0" 한 줄뿐. 실제로는 (a) AdMob 통합 + iOS 실 광고 노출 (S3, S5), (b) Android allowBackup 미설정으로 Google Drive 자동 백업 (S1), (c) 알림 페이로드에 약 이름·복용량 평문 노출 (S2), (d) Hive 박스 자체 plaintext (S4) — 4건 모두 ASC/Play 정책 위반 직접 사유는 아니지만, 사용자 신뢰·리뷰 평점·향후 리젝 사유 잠재력 모두 보유. 1.0.3+ 로 가기 전 마케팅 문구↔코드 둘 중 하나로 정합 필수.

**3) 두 번째 risk 는 cold-start UX.** notification_service.init + ads_service.init 동기 await (P1) + splash_screen 1.5s 고정 delay = 콜드 부팅 시 3~4초 블랭크. 디자인 품질에 비해 첫인상이 떨어진다. iOS App Store 리뷰가 "앱이 느리다"로 1점 박을 수 있는 패턴. P1 fix 만 들어가도 체감 1초 단축 가능.

**다음 사이클 우선순위 1줄**: **[묶음 1] S1+S2+S3+S5 — "마케팅↔코드 정합 패치" 1 PR 로 묶어 1.0.3 릴리스 차기 차단. P1 (cold-start) 은 1.0.3 와 별도 1.0.4 후속.**
