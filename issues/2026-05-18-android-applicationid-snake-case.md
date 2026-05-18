# 🐛 Android applicationId snake_case vs iOS Bundle camelCase 불일치 — Play API 패키지명 거부

**일자**: 2026-05-18
**기기**: 🏭 Mac mini (메모요 1.0.5+22, 1.0.5+23 store 업로드 사이클)
**상황**: fastlane supply 가 패키지명 camelCase 로 호출 → Play API 1차 거부
**해결됨**: ✅

## 증상

메모요 Android aab 업로드 시 fastlane supply 가 iOS Bundle ID 를 그대로 패키지명으로 사용:

```
com.daejongkang.simpleMemoApp (iOS Bundle, camelCase)
```

Play API 4xx 거부:
```
The package name 'com.daejongkang.simpleMemoApp' was not found.
```

## 원인

메모요는 **iOS bundle id 와 Android applicationId 가 다름**:

- iOS bundle id (ios/Runner.xcodeproj/project.pbxproj 의 PRODUCT_BUNDLE_IDENTIFIER): `com.daejongkang.simpleMemoApp` (camelCase)
- Android applicationId (android/app/build.gradle 의 `applicationId`): `com.daejongkang.simple_memo_app` (snake_case)

평소 두 ID 가 같아서 fastlane supply / submit-app 스킬이 iOS 기준 ID 를 Android 도 그대로 사용한 게 함정. 메모요 한정 케이스 — Flutter 프로젝트 init 시 자동 변환 또는 수동 차이 발생.

## 해결

fastlane supply 호출 시 `--package_name com.daejongkang.simple_memo_app` 으로 snake_case 명시:

```bash
fastlane supply --package_name com.daejongkang.simple_memo_app --aab build/app/outputs/bundle/release/memoyo-1.0.5-23.aab --track production --release_status draft
```

또는 fastlane/Appfile 에 `package_name "com.daejongkang.simple_memo_app"` 박기 — 매번 명시 불필요.

## 재발 가능 범위

- **메모요 한정** — 다른 앱 (포모도로, 로또, 한줄일기, 단어요 등) 은 두 ID 동일 가능성 큼. 출하 직전 점검 필수.
- **submit-app 스킬의 Android 업로드 단계** — fastlane supply 호출 시 hardcoded iOS ID 사용하면 메모요 같은 mismatch 케이스에서 거부

## 재발 방지 체크리스트

- [ ] 모든 Flutter 앱의 iOS bundle id vs Android applicationId grep 비교 (mismatch 발견 시 별 사이클로 정리)
- [ ] submit-app 스킬의 Android 업로드 step 에 "iOS bundle id 그대로 사용 X — android/app/build.gradle 의 applicationId 명시 추출" 가드 추가
- [ ] 메모요 fastlane/Appfile 에 `package_name` 명시 (영구 fix)
- [ ] 장기적으로 메모요 applicationId 를 iOS bundle 과 동일하게 통일할지 검토 (Play Store 등재된 앱 ID 는 변경 불가 — 신규 앱 출하 시만)

## 관련

- 메모요 1.0.5+22 release build 사이클 (2026-05-18) 1차 Android 업로드 거부
- 메모요 1.0.5+23 재업로드 사이클 (2026-05-18) 도 같은 함정 — snake_case 정정 후 PASS
- [[2026-05-18-cocoapods-utf8-encoding-bug]] 와 같은 사이클에서 surface
