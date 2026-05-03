---
category: iOS 빌드
tags: [ios, flutter, google-sign-in, oauth, gidclientid, info-plist, fail-fast]
first_discovered: 2026-04-23
related_issues:
  - 2026-04-23-ios-gidclientid-missing
---

# google_sign_in 신규 iOS 빌드 = GIDClientID + URL scheme 사전 체크 게이트

- **첫 발견:** 2026-04-23 (Android 만 검증된 신규 앱이 iOS 첫 시뮬 런치에서 즉시 강종)
- **재사용 영역:** `google_sign_in` 또는 다른 Google OAuth 의존성 추가하는 모든 신규 Flutter 앱

## 한 줄 요약

`google_sign_in` 의 OAuth 매칭 방식이 **Android 와 iOS 가 다르다** — Android 는 SHA-1 + 패키지명으로 GCP 가 자동 매칭(코드 변경 0)인데, iOS 는 `Info.plist` 의 `GIDClientID` 키 + reversed URL scheme 가 없으면 첫 sign-in 시 `NSInvalidArgumentException: No active configuration` 으로 즉시 강종한다. **pre-build 단계에 자동 게이트** + **Dart `Platform.isIOS` fail-fast** 두 겹으로 막는 게 정답.

## 언제 쓰는가

- 신규 Flutter 앱에 `google_sign_in` (또는 `googleapis`, `firebase_auth` 의 GoogleAuthProvider 등) 의존성 추가할 때
- 기존 앱이 Android 에서만 검증되다가 iOS 빌드를 처음 시도할 때
- flutter-factory 류 템플릿/스캐폴드 단계에서 "OAuth 붙임" 옵션 켰을 때
- `RealGmailService` / `GoogleSignIn().signIn()` 첫 호출 직전

## 차단 시그니처

```
*** Terminating app due to uncaught exception 'NSInvalidArgumentException',
reason: 'No active configuration. Make sure GIDClientID is set in Info.plist.'
```

스택: `GIDSignIn signInWithOptions` → `FLTGoogleSignInPlugin` → Dart 호출. 첫 프레임 뜨기 전 강종이라 **Android 만 테스트한 사이클은 100% 놓친다**.

## 절차

### A. pre-build 셸 게이트 (`tools/check_ios_oauth.sh`)

```bash
#!/usr/bin/env bash
# pubspec 에 google_sign_in 또는 OAuth 의존성 있으면 Info.plist 검증
set -e

if grep -qE '^\s*(google_sign_in|googleapis_auth|firebase_auth):' pubspec.yaml; then
  PLIST=ios/Runner/Info.plist
  if ! /usr/libexec/PlistBuddy -c "Print :GIDClientID" "$PLIST" >/dev/null 2>&1; then
    echo "❌ $PLIST 에 GIDClientID 누락"
    echo "   GCP 콘솔에서 iOS OAuth Client (bundle: com.<your>.<app>) 만들고"
    echo "   Info.plist 에 GIDClientID + reversed URL scheme 추가 필요"
    exit 1
  fi
  if ! /usr/libexec/PlistBuddy -c "Print :CFBundleURLTypes" "$PLIST" \
       | grep -q 'com.googleusercontent.apps.'; then
    echo "❌ $PLIST CFBundleURLTypes 에 reversed client URL scheme 누락"
    exit 1
  fi
  echo "✅ iOS OAuth 셋업 OK"
fi
```

`flutter build ios` / `flutter run` 직전 hook 또는 `new_app.sh` 마지막 단계에 박는다.

### B. Dart `Platform.isIOS` fail-fast (런타임 보강)

OAuth 진입점에서 native NSException 전에 친절한 Dart 에러로 변환:

```dart
import 'dart:io' show Platform;
import 'package:flutter/services.dart' show rootBundle;

Future<void> _ensureSignedIn() async {
  if (Platform.isIOS) {
    final infoPlist = await rootBundle.loadString('ios/Runner/Info.plist');
    if (!infoPlist.contains('<key>GIDClientID</key>')) {
      throw StateError(
        'iOS Info.plist 에 GIDClientID 누락 — '
        'pre-build 게이트(tools/check_ios_oauth.sh) 미실행 가능성',
      );
    }
  }
  await GoogleSignIn().signIn();
}
```

native exception 보다 stack trace 가 훨씬 짧고, 디버깅 시간 대폭 단축.

### C. Info.plist 셋업 (1회, 게이트 통과 조건)

GCP 콘솔에서 iOS OAuth Client 생성 후 발급된 client ID = `<NUM>-<HASH>.apps.googleusercontent.com`:

```xml
<key>GIDClientID</key>
<string>NUM-HASH.apps.googleusercontent.com</string>

<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.NUM-HASH</string>
    </array>
  </dict>
</array>
```

reversed URL scheme = client ID 의 첫 두 segment 를 `.` 기준 역순 + 앞에 `com.googleusercontent.apps.` 붙임.

## 검증

- 게이트 PASS 후 iOS 시뮬에서 Google 로그인 consent 다이얼로그 정상 노출
- 게이트 미통과 상태로 빌드 시도 → 셸 게이트가 exit 1 로 빌드 차단
- Dart fail-fast 도 동작 확인: 일부러 GIDClientID 키 빼고 빌드 → `StateError` 가 깔끔하게 떨어지는지

## 함정

- "Android 에선 SHA-1 만 등록하면 끝이라 iOS 도 비슷할 것" 직관이 가장 큰 함정. **iOS 는 bundle ID 매칭이 아니라 Info.plist 키 매칭**.
- GCP 콘솔에서 OAuth Client "Android 용" 만들고 끝나는 실수 자주 발생. iOS 용은 별도 Client 생성 필요 (bundle ID 입력란 다름).
- reversed URL scheme 만 빠뜨려도 OAuth 흐름이 redirect 단계에서 깨진다 (GIDClientID 만으론 부족).
- `RealGmailService` / 비슷한 OAuth wrapper 가 Android 만 코멘트로 가정하고 있는 경우, 그 가정이 코드 동작 자체에 박혀있어 iOS 분기를 안 만든 채로 머지될 수 있음. **OAuth wrapper 작성 시 첫 줄에 "iOS 는 Info.plist GIDClientID 의존" 명시** 권장.
- 첫 빌드 검증을 Android 폰(Galaxy S24 등) 에서만 하면 iOS 경로가 런타임에 발견되지 않음. **"OAuth 의존성 = iOS 시뮬 빌드도 1회 강제 검증"** 룰 박을 만함.

## 관련

- issues 원본: `2026-04-23-ios-gidclientid-missing.md`
- 템플릿 위치: flutter-factory `tools/check_ios_oauth.sh` (pre-build hook)
- 참고 패턴: 「Android-first 가정의 iOS 분기 누락」 — `google_sign_in` 외에도 push notification (FCM APNs key), URL launcher (LSApplicationQueriesSchemes) 등 동일 패턴이 흔하므로, OAuth 외 native 의존성 추가 시 iOS 사이드 체크 필수
