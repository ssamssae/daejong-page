# 더치페이 코드베이스 감사 (2026-05-15)

작성: 🖥 desktop3060ti / 브랜치: `desktop3060ti/audit-dutchpay-2026-05-15`
대상: `dutch_pay_calculator` (commit `303e8b7`, v1.0.3+7)
규모: 899 LOC Dart (main.dart 633, ads_service.dart 111, widget_test.dart 156)
의존성: `google_mobile_ads ^5.3.0` (외부 1개)
출시 정책: iOS-only (README: Android Play Console 보류)

본 감사는 **코드만 본 정적 분석** — `flutter analyze` / `flutter test` 실제 실행 X (이 기기에 flutter SDK 부재).

---

## 성능 (top 5)

| # | 이슈 | 위치(파일:라인) | 영향도 | 권장 fix |
|---|------|-----------------|--------|----------|
| P1 | SplashScreen cold-start 2초 지연 (1500ms 대기 + 500ms fade) — 즉시 계산이 본질인 경량 도구에 과함 | `lib/main.dart:62`, `:54-57` | 고 | 대기 800ms 이하로 단축, 또는 첫 frame 직후 즉시 전환 (fade 만 유지) |
| P2 | AdaptiveBanner 가 광고 1회 로드에 setState 2번 호출(`_size` → `_loaded`) → 광고 로딩 중 불필요한 rebuild 2회 | `lib/services/ads_service.dart:81`, `:71-72` | 중 | `ad.load()` 성공 후 단일 setState 로 `_size` + `_loaded` 동시 갱신 |
| P3 | 광고 로드 실패 시 재시도 없음 — 일시적 네트워크 단절(비행기→wifi 직후) 회복 시 광고 미노출 → 수익 손실 | `lib/services/ads_service.dart:74-77` | 중 | onAdFailedToLoad 후 backoff 재시도 (30s/60s/120s × 3회) 또는 다음 라이프사이클에 재시도 flag |
| P4 | 결과 무효화 패턴 3중 복붙 (`_perPerson = null; _remainder = null;`) → setState 비용은 무시 가능하나 잠재 누락 위험 | `lib/main.dart:156-157`, `:166-167`, `:178-179` | 저 | `_clearResult()` 헬퍼로 추출 |
| P5 | `MediaQuery.of(context)` build 마다 전체 의존성 등록 → 노치/회전/키보드 변화에도 전체 rebuild | `lib/main.dart:206` | 저 | Flutter 3.10+ 권장 `MediaQuery.sizeOf(context)` (size 만 의존) |

---

## 보안 (top 5)

| # | 이슈 | 위치(파일:라인) | 영향도 | 권장 fix |
|---|------|-----------------|--------|----------|
| S1 | AdMob 운영 광고 단위 ID 소스코드 하드코딩 (`ca-app-pub-7025432711849670/6556140410`) — repo public 시 invalid traffic 어택 표면 | `lib/services/ads_service.dart:37` | 중 | `--dart-define=ADMOB_BANNER_IOS=...` 빌드 인자로 주입, 코드는 `String.fromEnvironment` 사용 |
| S2 | `debugPrint` release 빌드에서도 호출 (AdMob 에러 메시지·광고 단위 ID 등 iOS Console.app 으로 노출 가능) | `lib/services/ads_service.dart:21`, `:75` | 저 | `if (kDebugMode) debugPrint(...)` 가드 또는 `logger` 패키지로 환경별 분기 |
| S3 | Android `AndroidManifest.xml` 에 `INTERNET` permission 명시 없음 — Flutter debug 가 자동 추가 중. iOS-only 정책상 deal-breaker 아니지만 Android 재개 시 광고 0 | `android/app/src/main/AndroidManifest.xml` | 저 | 정책상 보류 OK, 향후 Android 배포 결정 시 `<uses-permission android:name="android.permission.INTERNET"/>` 추가 |
| S4 | `AdsService.init()` 실패 silent — `_initialized=false` 인 채 진행, 이후 광고 요청 또 실패. Crash 미보고 → 강대종 본인 인지 불가 | `lib/services/ads_service.dart:17-23` | 저 | Sentry/Crashlytics 연동 또는 강대종 본인 채널 로그 (Telegram 봇 등) |
| S5 | `int.tryParse(_digits)` 10자리 한도(100억) — 현 한도에선 web 빌드 시 JS number 53bit 안전 영역 내. 한도 확장 시 정밀도 손실 위험 | `lib/main.dart:140`, `:152` | 저 | 한도 10자리 유지 (현 안전). 12자리 이상 확장 시 BigInt 검토 |

**총평**: iOS `Info.plist` 권한 요청 0개 (위치/카메라/알림 등 일체 없음) + `ITSAppUsesNonExemptEncryption=false` + `GADApplicationIdentifier` 박힘 → **사용자 프라이버시 측면 deal-breaker 없음**. 보안 top 5 는 robustness/노출 표면 정리 위주이고, 1.0.x 단계에선 차순위 사이클 OK.

---

## Dead code (top 5)

| # | 이슈 | 위치(파일:라인) | 영향도 | 권장 fix |
|---|------|-----------------|--------|----------|
| D1 | **테스트 vs UI 텍스트 미스매치** — 테스트는 `'1원은 누가 낼래?'` 기대, 실제 UI 는 `'남는 돈 1원'`. UI 가 commit `0f91bea` ("ui: 입력·결과 화면 디자인 개선") 에서 바뀐 후 테스트 미동기화 → `flutter test` FAIL 추정 | `test/widget_test.dart:115` vs `lib/main.dart:444` | 고 | 테스트 expect 를 `find.textContaining('남는 돈')` 또는 정확 텍스트로 갱신. CI 있으면 즉시 복구 |
| D2 | `pubspec.yaml` Flutter create boilerplate 주석 ~50줄 (assets/fonts/lints 가이드) — 운영 가치 0, 가독성 ↓ | `pubspec.yaml:3-4`, `:26-29`, `:39-43`, `:49-86` | 저 | 운영 관련 주석만 남기고 제거 (별도 cleanup PR 권장 — surgical scope 분리) |
| D3 | `_AdaptiveBannerState._size` 필드가 `_bannerAd.size` 와 정보 중복 — `_bannerAd!.size` 직접 참조 가능 | `lib/services/ads_service.dart:50`, `:81`, `:98` | 저 | `_size` 필드 제거, build 에서 `_bannerAd!.size` 직접 사용 |
| D4 | SplashScreen 페이드아웃(`_fadeOut`) + Navigator `PageRouteBuilder` FadeTransition 중복 — 두 fade 가 동시 실행, 시각효과는 합쳐지지만 코드 1줄 중복 | `lib/main.dart:58-72` | 저 | 하나로 통합 (Navigator FadeTransition 단독 또는 self fade 단독) |
| D5 | `Platform.isAndroid` 분기 + 멀티 OS 빌드 디렉토리 유지 — README 는 "Android 미배포" 명시. 코드/정책 미정렬 (강대종 결정 사안) | `lib/services/ads_service.dart:32`, `android/` 전체 | 저 | 즉시 제거 X — 정책 영구 확정 시 Android 디렉토리·분기 정리 |

**참고**: `grep TODO|FIXME|HACK|XXX lib/ test/` 결과 0개. 명시적 dead marker 0 — 위 항목들은 정적 분석으로 발견한 잠재 정리 후보.

---

## 종합 의견

**전체 건강도**: 단일 화면 도구로서 적정 규모(899 LOC). iOS `Info.plist` 권한 0 + 외부 의존성 1개(`google_mobile_ads`) + TODO/FIXME 0 + BACKLOG.md/README.md/issues/ 문서화 양호. Karpathy 4룰(simplicity / surgical / goal-driven) 기준으로 보면 잘 지켜진 코드베이스이며, 1.0.x 라인업에 어울리는 수준. ASO·배포 정책(iOS-only)이 코드에 일관 반영되었고, AdMob 운영 ID + `GADApplicationIdentifier` + Export Compliance 모두 박힘 — 출시 후 안정기 1.0.x 의 모습 그대로.

**가장 시급한 3 가지**:
1. **D1 테스트/UI 미스매치(고)** — `flutter test` 가 깨진 상태로 push 됐을 가능성. CI 있으면 즉시 적색, 없으면 도입 자체가 우선. fix 자체는 expect 한 줄 수정으로 5분 안에 끝남.
2. **P1 SplashScreen 2초(고)** — 즉시 계산이 본질인 도구에 cold-start 2초는 사용자 체감 비용 큼. 800ms 이하로 단축 시 체감 개선 즉각.
3. **P3 광고 재시도 + S1 AdMob ID 빌드 인자화(중)** — 둘 다 운영 수익에 직결. 광고 재시도는 일시 네트워크 회복 케이스를 잡고, 광고 단위 ID 빌드 주입은 repo 노출 표면을 줄임.

**다음 사이클 우선순위 1줄**: **D1 테스트 fix(고) → P1 SplashScreen 단축(고) → P3 광고 재시도 + S1 ID 인자화(중) → P2/P4/D3 ads/main 정리(저) → D5 Android 정책 확정 후 트리 정리(전략)**. 보안은 deal-breaker 없으니 별도 사이클 불요.

---

## 메모

- **flutter analyze / flutter test 미실행**: 이 기기(🖥 desktop3060ti)에 flutter SDK 없음. 모든 결론은 정적 코드 읽기 기반. D1 의 "테스트 FAIL 추정" 은 실제 실행으로 본진/WSL/Mac mini 에서 검증 필요.
- **코드만 본 감사**: 런타임 동작·실제 사용자 trace·Sentry 로그·App Store Review 피드백 등 외부 신호 미반영. UX 체감(P1 splash 등)은 강대종 직접 사용 피드백이 정답.
- **README 정책과 코드 정합성 OK**: iOS-only 출시 + AdMob 운영 ID + Export Compliance 모두 코드/Info.plist 에 일관 박힘. BACKLOG P0 두 항목(GADApplicationIdentifier · iOS-only README) 도 close 처리됨.
- **이번 사이클은 감사만**. fix PR 은 별도 사이클에서 우선순위순으로 진행.

---

## 출처

- 코드 commit: `303e8b7` (2026-05-15 시점 main HEAD)
- 핵심 파일: `lib/main.dart`, `lib/services/ads_service.dart`, `test/widget_test.dart`
- 정책 문서: `README.md`, `BACKLOG.md`, `notes/` (간접 참조)
- 관련 이슈: `~/.claude/skills/issues/2026-05-12-dutchpay-gad-application-identifier-missing.md` (close 처리됨)
