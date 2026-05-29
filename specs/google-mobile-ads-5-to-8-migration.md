# google_mobile_ads 5.x → 8.x 메이저 마이그레이션 가이드 (더치페이 · 약먹자)

**Status**: 🟡 spec · 형님 ack 펜딩 (코드 변경/배포 트리거 X — spec only)
**Author**: 🪟 WSL / 2026-05-29 KST (낮 오토 cycle #1, T-260523-14)
**대상 앱**: `dutch_pay_calculator` (더치페이, iOS only) · `yakmukja` (약먹자, iOS only)
**현재 의존**: 두 앱 모두 `google_mobile_ads: ^5.3.0`
**목표**: `^8.x` 로 메이저 bump 시 breaking surface·작업 단계·위험·롤백을 사전 정의. 본 문서는 **실행 가이드일 뿐 코드 변경/pubspec bump/빌드/배포를 포함하지 않음**.

---

## 0. TL;DR (핵심 3줄)

1. **빌드 자체는 안 깨질 가능성이 높다.** 두 앱이 쓰는 광고 API는 v8에서 *deprecated(경고)일 뿐 removed가 아님*. 진짜 게이트는 **플랫폼 레벨** — iOS 배포 타겟 + Xcode 16, Android minSdk 23, Apple Privacy Manifest.
2. **두 앱 모두 배너 1종(adaptive anchored banner)만 사용.** Interstitial / Rewarded / Native / AppOpen 호출 0건 → 마이그레이션 표면이 작다.
3. **두 앱 모두 iOS-only 운영** (약먹자 Android는 test ID로 죽은 경로, 더치페이 Android 미빌드). → 실질 검증 포커스는 **iOS 빌드 + 배너 렌더 + App Store Privacy 심사**.

---

## 1. 버전별 breaking changes (5.3.0 → 8.x)

출처: [pub.dev google_mobile_ads changelog](https://pub.dev/packages/google_mobile_ads/changelog), [AdMob iOS 마이그레이션](https://developers.google.com/admob/ios/migration), [AdMob Android 릴리스 노트](https://developers.google.com/admob/android/rel-notes).

| 메이저 | Flutter/Dart 최소 | Android 네이티브 GMA | iOS 네이티브 GMA | UMP (consent) | 주요 API 변화 |
|--------|------------------|---------------------|-----------------|---------------|---------------|
| **6.0.0** | Flutter **3.27.0** / Dart **3.6.0** | 24.1.0 (minSdk **23**) | 12.2.0 | And 3.2.0 / iOS 3.0.0 | `isMounted` API 추가(배너 재활용), `AdMessageCodec` deprecated 수정 |
| **7.0.0** | (변경 없음) | 24.9.0 | 12.14.0 | And 4.0.0 / iOS 3.1.0 | Native Ad 템플릿 글자수 제한·패딩 수정 (배너 무관) |
| **8.0.0** | Flutter **3.38.1** / Dart **3.10.0** | **25.1.0** | **13.2.0** | And 4.0.0 / iOS 3.1.0 | SPM 지원, `isCollapsible` 추가, **iOS UISceneDelegate 전환**, anchored adaptive banner 사이즈 API **deprecated** |

### 1.1 누적 플랫폼 요구 (5.x 기준선 → 8.x 도달점)

- **Flutter floor: 3.38.1 / Dart 3.10.0** (v8). 5노드 현황 대비:
  - 두 앱 `pubspec.yaml` 의 `environment: sdk: ^3.10.4` → Dart 3.10.0 floor **이미 충족**.
  - 5노드 Flutter 버전 (SDK 정책 spec 기준): 🍎 3.44.0 / 🏭 3.41.9 / 💻 3.41.9 / 🪟 3.41.7 / 🖥 없음 → 빌드 노드(🏭 맥미니 전담)가 **3.38.1 이상이면 PASS**. 맥미니 3.41.9 충족. ⚠️ 단, `[[feedback_5node_sdk_skew_cascade_regression]]` 의 cascade 위험 — 단일 노드 PASS만 신뢰 X, strict 노드 cross-check 필요.
- **iOS 배포 타겟: iOS 13 + Xcode 16.0** (GMA iOS 13.x). 현재 두 앱 Podfile은 `platform :ios, '13.0'` 가 **주석 처리**됨 → Flutter 기본값(현재 Flutter 3.4x 기본 min = iOS 13~)에 의존. v8 후 **명시 13.0 이상 + 빌드 머신 Xcode 16 필수**.
- **Android minSdk 23 / compileSdk 35** (GMA 24+). 두 앱 모두 `compileSdk = flutter.compileSdkVersion`, `minSdk = flutter.minSdkVersion` 으로 Flutter 기본값 추종 → Flutter 3.4x 기본 minSdk(=21~23 버전에 따라 다름) 확인 필요. **단 두 앱 모두 Android 미운영**이라 실심사 영향 0, 빌드 통과만 보면 됨.

### 1.2 ⚠️ 핵심 — 두 앱이 쓰는 API는 "deprecated"이지 "removed"가 아니다

v8.0.0이 deprecated 처리한 메서드:
- `AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize()` ← **두 앱이 정확히 이걸 사용**
- `AdSize.getAnchoredAdaptiveBannerAdSize()` (미사용)

→ 대체 = `getLarge...AnchoredAdaptiveBannerAdSize()` 변종(예상 Flutter API: `getCurrentOrientationLargeAnchoredAdaptiveBannerAdSize(width)`).

**중요**: deprecated = 컴파일은 통과, analyzer 경고(info/warning)만 발생. 즉 **v8로 bump해도 배너 코드는 그대로 빌드·동작**한다. "Large" 변종은 단순 rename이 아니라 **더 큰(키 큰) 배너 포맷** — 전환하면 배너 높이/외관이 바뀌므로 시각 회귀가 생긴다. 따라서 본 마이그레이션에서 권장은:
- **1차: 기존 deprecated 메서드 유지** (경고 무시, 동작 동일, 시각 변화 0).
- **2차(선택): 별 사이클에서 large 배너 의도적 채택** 검토 (수익/UX 트레이드오프 — 본 spec 범위 밖, 후속 brainstorm 후보).

---

## 2. 두 앱 호출 패턴 인벤토리 (실측)

두 앱의 광고 코드는 `lib/services/ads_service.dart` 단일 파일 (구조 거의 동일).

| 사용 API | 더치페이 | 약먹자 | v8 영향 |
|----------|:-------:|:------:|---------|
| `MobileAds.instance.initialize()` | ✅ | ✅ | 변화 없음 |
| `AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(width)` | ✅ | ✅ | **deprecated 경고** (동작 유지) |
| `BannerAd(adUnitId, size, request: AdRequest(), listener: BannerAdListener(...))` | ✅ | ✅ | 변화 없음 |
| `BannerAdListener(onAdLoaded, onAdFailedToLoad)` | ✅ | ✅ | 변화 없음 (시그니처 동일) |
| `ad.load()` / `ad.dispose()` | ✅ | ✅ | 변화 없음 |
| `AdWidget(ad:)` | ✅ | ✅ | 변화 없음 |
| `LoadAdError` (`error.message`) | ✅ | ✅ | 변화 없음 |
| Interstitial / Rewarded / Native / AppOpen | ❌ | ❌ | 해당 없음 |

**광고 단위 ID 현황** (변경 불요, 참고용):
- 약먹자 iOS 운영 배너: `ca-app-pub-7025432711849670/6770114012` (2026-05-02 발급)
- 더치페이 iOS 운영 배너: `ca-app-pub-7025432711849670/6556140410` (2026-05-12 발급, dutch_banner_ios)
- 둘 다 release 빌드에서만 운영 ID, debug는 Google test ID. Android는 test ID 고정(미운영).

**결론**: 코드 변경 강제 요소 = **0줄** (deprecated 경고만). 마이그레이션의 무게중심은 코드가 아니라 **플랫폼 설정 + 심사 메타**.

---

## 3. 단계별 마이그레이션 plan

> 각 단계는 앱별로 **별 prefix 브랜치 + 별 PR** 권장 (더치페이 / 약먹자 동시 1 PR 금지 — 충돌·롤백 단위 분리). 실제 실행은 🔴 ack-pending (코드/빌드/배포 = 외부영향).

### (a) pubspec bump
```yaml
# 변경 전
google_mobile_ads: ^5.3.0
# 변경 후
google_mobile_ads: ^8.0.0
```
- `flutter pub get` → `pubspec.lock` 갱신.
- `environment: sdk` 는 `^3.10.4` 그대로 OK (v8 Dart 3.10.0 floor 충족).
- ⚠️ 빌드 노드 Flutter ≥ 3.38.1 확인 (`flutter --version`). 맥미니 3.41.9 OK. **strict(구버전) 노드 cross-check** — `[[feedback_5node_sdk_skew_cascade_regression]]` 회귀 패턴 차단.

### (b) BREAKING fix (코드)
- **강제 수정 0건.** `flutter analyze` 에서 `getCurrentOrientationAnchoredAdaptiveBannerAdSize` deprecated info 1건/앱 예상 → 경고 무시(동작 동일) 또는 large 변종 채택(시각 회귀 주의, 권장 보류).
- analyze가 deprecated를 **error로 승격**하는 lint 설정(`analysis_options.yaml` 의 `deprecated_member_use: error` 등)이 있으면 빌드 실패 가능 → 두 앱 `analysis_options.yaml` 사전 확인 필요. (없으면 info로 통과.)

### (c) iOS Info.plist — SKAdNetworkItems 갱신
- **현황: 두 앱 모두 `SKAdNetworkItems` 0개** (실측 grep 결과). GADApplicationIdentifier만 존재.
- GMA iOS 13.x SDK는 자체 Pod에 SKAdNetwork ID·Privacy Manifest를 번들하지만, **AdMob 권장은 앱 Info.plist에 Google SKAdNetworkItems 목록 명시**(어트리뷰션 정확도).
- 작업: [AdMob iOS SKAdNetwork 가이드](https://developers.google.com/admob/ios/ios14)의 최신 `SKAdNetworkIdentifier` 목록을 `Info.plist`에 추가. (마이그레이션과 독립한 **사전 누락 보강** 성격 — bump와 별개로도 권장.)

### (d) Privacy Manifest / UserDefaults / NSUserTrackingUsageDescription 점검
- **현황: 두 앱 모두 `PrivacyInfo.xcprivacy` 없음, `NSUserTrackingUsageDescription` 없음.**
- Apple은 2024년부터 앱·서드파티 SDK Privacy Manifest 요구. GMA Pod는 자체 `PrivacyInfo.xcprivacy` 동봉(SDK 측 충족) → 하지만 **앱 자체 Privacy Manifest**는 앱 책임.
  - 앱이 `UserDefaults` 사용 시 → `PrivacyInfo.xcprivacy`에 API 사용 사유(`CA92.1`) 선언 필요.
  - GMA가 IDFA 접근 시도 시 ATT 권한 필요 → `NSUserTrackingUsageDescription` 문자열 추가 검토.
- ⚠️ **두 앱이 이미 App Store LIVE** 상태에서 v5로 통과했다면, 현재 GMA 5.x Pod의 Privacy Manifest로 충족 중. v8 bump 시 Apple 심사가 더 엄격할 수 있어 **bump 후 첫 제출 전 Privacy 메타 재점검 필수**.
- ATT 정책 결정(IDFA 추적 동의 받을지)은 형님 판단 — 추적 안 하면 NSUserTracking 불요, non-personalized ads로 운영.

### (e) QA 매트릭스
| 항목 | 더치페이 | 약먹자 | 합격 기준 |
|------|:-------:|:------:|-----------|
| `flutter pub get` | ☐ | ☐ | 에러 0 |
| `flutter analyze` | ☐ | ☐ | error 0 (deprecated info 허용) |
| iOS release 빌드 (맥미니, Xcode 16) | ☐ | ☐ | 빌드 성공 |
| iOS 시뮬레이터 배너 렌더 | ☐ | ☐ | test 배너 표시 + 레이아웃 정상 |
| iOS 실기기(iPhone) 배너 렌더 | ☐ | ☐ | 배너 로드 + SafeArea 정상 |
| 앱 cold start (UISceneDelegate 전환 영향) | ☐ | ☐ | 크래시 0, 정상 기동 |
| `onAdFailedToLoad` 경로 | ☐ | ☐ | 에러 로그만, 크래시 0 |
| (Android, 약먹자) debug 빌드 | ☐ | — | test 배너, 빌드 통과 |

---

## 4. 위험 · 롤백 path

### 위험 요소
| 위험 | 확률 | 영향 | 완화 |
|------|:----:|:----:|------|
| **UISceneDelegate 전환**으로 iOS 기동/배너 attach 깨짐 | 中 | 高 | bump 후 cold start + 배너 렌더 실기기 검증 (QA e). Flutter 기본 AppDelegate 호환성 우선 확인 |
| Xcode 16 미만 빌드 머신 | 低 | 高 | 맥미니 Xcode 버전 사전 확인. 미달 시 업그레이드 먼저 |
| 5노드 SDK skew로 게이트 false PASS | 中 | 中 | strict 노드 cross-check, `[[feedback_5node_sdk_skew_cascade_regression]]` |
| Privacy Manifest 미비로 App Store 리젝 | 中 | 中 | 제출 전 Privacy 메타 재점검 (단계 d) |
| large 배너 자동 전환으로 시각 회귀 | 低 | 低 | deprecated 메서드 유지(1차), large는 보류 |
| Android minSdk 23 미달 빌드 실패 | 低 | 低 | 미운영이라 영향 작음, 빌드만 확인 |

### 롤백 path
- **코드/pubspec 레벨**: bump을 별 브랜치 + 별 PR로 → 문제 시 PR revert 1회 = `^5.3.0` 복귀. `pubspec.lock`도 함께 되돌림.
- **이미 머지된 후 빌드 실패 발견**: `git revert <merge-sha>` → main 즉시 복원, 재빌드로 검증.
- **App Store 제출 후 리젝**: 스토어 제출은 별 트리거(미운영 app도 아님 — 둘 다 LIVE). 리젝 시 이전 LIVE 버전 영향 0 (제출만 보류), 메타 수정 후 재제출.
- **불가역 경계**: pubspec bump·코드 수정·로컬 빌드는 전부 가역. **TestFlight/App Store 제출만 외부영향** → 그 단계는 별도 ack 게이트.

---

## 5. 실행 권장 순서 (ack 받은 후)

1. 맥미니 Flutter ≥ 3.38.1 + Xcode 16 사전 확인 (gate).
2. 앱별 브랜치: `<node>/gma8-dutchpay-2026-MM-DD`, `<node>/gma8-yakmukja-2026-MM-DD`.
3. (a) pubspec bump → (b) analyze → 단계 c/d 메타 점검 → (e) QA 매트릭스.
4. merge-gate PASS 후 PR → 본진/맥미니 머지.
5. 빌드·TestFlight·심사 제출은 **별 ack 사이클** (외부영향).

---

## 부록 — 출처
- [google_mobile_ads changelog (pub.dev)](https://pub.dev/packages/google_mobile_ads/changelog)
- [AdMob iOS SDK 마이그레이션](https://developers.google.com/admob/ios/migration)
- [AdMob Android 릴리스 노트](https://developers.google.com/admob/android/rel-notes)
- [Android GMA 25.0.0 발표 블로그](https://ads-developers.googleblog.com/2026/02/announcing-android-google-mobile-ads.html)
- [AdMob iOS SKAdNetwork / iOS 14 가이드](https://developers.google.com/admob/ios/ios14)
- 앱 실측: `~/apps/dutch_pay_calculator/lib/services/ads_service.dart`, `~/apps/yakmukja/lib/services/ads_service.dart` (2026-05-29 grep)
