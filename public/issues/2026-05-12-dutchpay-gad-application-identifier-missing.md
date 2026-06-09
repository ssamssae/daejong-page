---
date: 2026-05-12
project: dutch_pay_calculator
severity: high
category: ios-build-launch
discovered_by: 강대종 phone test
resolved: yes
summary: "더치페이 release iPhone 설치 후 launch crash — Info.plist GADApplicationIdentifier 누락 원인"

---

# 더치페이 release 빌드 iPhone 설치 후 앱 launch crash — Info.plist GADApplicationIdentifier 누락

## 증상

- 더치페이 release IPA 빌드 + xcrun devicectl 으로 iPhone17 설치 성공
- 홈 화면 아이콘 탭 → 앱 즉시 종료 (스플래시도 안 뜨고 죽음)
- 강대종 발화: "더치페이는 왜 안켜지냐"
- 동일 시점에 약먹자는 정상 launch (광고 배너까지 정상 load)

## 원인

`lib/main.dart` 의 `await AdsService.init()` → `MobileAds.instance.initialize()` 호출 시점에
Google Mobile Ads SDK iOS 가 `GADInvalidInitializationException` throw:

> "The Google Mobile Ads SDK was initialized without an AdMob App ID. Google AdMob publishers should follow instructions here: https://googlemobileadssdk.page.link/admob-ios-update-plist to set a valid App ID."

`ios/Runner/Info.plist` 의 25 key 전수 확인 결과 **`GADApplicationIdentifier` key 자체가 없음**. SDK 가 init 단계에서 즉시 crash + 앱 종료.

약먹자 대비:
- 약먹자 Info.plist: `GADApplicationIdentifier` `ca-app-pub-7025432711849670~1525526197` 박혀있음 (2026-05-02 발급분, 정상 init)
- 더치페이: AdMob iOS 운영 ID 자체가 미발급 상태였음. `lib/services/ads_service.dart` 의 `_realIosBannerUnitId = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'` placeholder + `TODO: AdMob 콘솔에서 더치페이 iOS 배너 광고단위 생성 후 교체` 주석이 단서.

ads_service.dart 클래스 docstring 에도 본인이 적어둔 단계:
> AppId 도 Info.plist 의 GADApplicationIdentifier 교체 필요.

— 이 단계가 다음 AdMob 작업에 동시에 처리되지 않고 누락됨.

## 해결

AdMob 콘솔에서 더치페이 iOS App 신규 발급 + 배너 광고단위 발급 (2026-05-12 강대종 콘솔 클릭):

- App ID: `ca-app-pub-7025432711849670~7679626181`
- Banner Ad Unit ID: `ca-app-pub-7025432711849670/6556140410` (dutch_banner_ios)

코드 패치 (commit `3c5daa7 feat(ads): AdMob iOS 운영 ID 적용 (App ID + Banner Unit)`):

1. `ios/Runner/Info.plist` 에 GADApplicationIdentifier 신규 추가 (약먹자 reference 그대로 따라감, AdMob 운영 ID + 코멘트 1줄)
2. `lib/services/ads_service.dart` 의 `_realIosBannerUnitId` placeholder → 운영 Banner Unit ID 교체
3. main 직접 push (PR 흐름 우회, 강대종 자기 앱)

검증: release 빌드 재설치 → 앱 정상 launch + 배너 광고 load 확인 (강대종 ack 2026-05-12 12:39).

## 재발 방지

1. **AdMob SDK 새 앱 추가 시 5단계 체크리스트** (ads_service.dart docstring 에 이미 박혀있는데 실제 따라가지지 않음 — 더 표면화 필요):
   - AdMob 콘솔 앱 등록 → App ID `~` 형식 받기
   - AdMob 콘솔 광고단위 발급 → Unit ID `/` 형식 받기
   - `ios/Runner/Info.plist` `GADApplicationIdentifier` key 추가
   - `lib/services/ads_service.dart` `_realIosBannerUnitId` 교체
   - release 빌드 실기 검증 (앱 launch + 광고 load)

2. **다음 신규 AdMob 앱 발급 시 이 이슈 reference** 로 5단계 동시 처리 강제

3. **submit-app 스킬에 BLOCKING lesson 후보**: "release 빌드 IPA 제출 전 ios/Runner/Info.plist GADApplicationIdentifier 존재 확인" — Apple 심사는 통과하지만 사용자 phone 에서 즉시 crash 함정이라 user-facing critical
