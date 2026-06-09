---
category: iOS 빌드
tags: [ios, ipa, arm64, lipo, app-store, flutter]
first_discovered: 2026-04-19
related_issues:
  - 2026-04-19-ipa-x86-64-slice-rejection
---

# iOS 릴리즈 IPA = arm64-only 보장 + lipo 검증

- **첫 발견:** 2026-04-19 (약먹자 IPA App Store 검증 reject)
- **재사용 영역:** 모든 iOS 앱 릴리즈 빌드 (한줄일기 / 메모요 / 더치페이 / 약먹자 / 단어요 / lottocalc 등)

## 한 줄 요약

iOS 릴리즈 IPA 에 시뮬레이터용 x86_64 슬라이스가 섞여 있으면 App Store Connect 가 검증 단계에서 reject. **빌드 직후 `lipo -info` 로 arm64-only 검증** 을 배포 스크립트의 고정 단계로 박기.

## 차단 시그니처

App Store Connect 업로드 후:

```
ERROR ITMS-90087: "Unsupported Architectures. The executable contains
unsupported architectures '[x86_64]'."
```

## 검증 한 줄

```bash
# IPA 안 Runner.app 의 메인 실행파일 아키텍처 확인
unzip -p build/ios/ipa/<app>.ipa Payload/Runner.app/Runner | file -
# 또는
lipo -info build/ios/iphoneos/Runner.app/Runner

# 기대: "Mach-O 64-bit executable arm64"
# X86_64 슬라이스가 보이면 빌드 설정 회귀
```

## 빌드 설정 lock

Xcode 프로젝트 + Pods 양쪽:

```
EXCLUDED_ARCHS[sdk=iphonesimulator*] = arm64    # 시뮬은 x86_64 만
EXCLUDED_ARCHS[sdk=iphoneos*]        = (없음, arm64 만 자동)
ONLY_ACTIVE_ARCH = YES (Debug), NO (Release)
VALID_ARCHS      = arm64
```

Pods 에도 동일 적용 — 일부 Cocoapod 가 자체 빌드 설정으로 시뮬용 x86_64 강제할 수 있음.

## Forcing Function

- 배포 스크립트 (`/submit-app`, fastlane lane 등) 에 `lipo -info` 검증 단계 박기:
  ```bash
  IPA_ARCH=$(unzip -p "$IPA" "Payload/${APP}.app/${APP}" | file - | grep -oE '(arm64|x86_64)' | sort -u)
  if [[ "$IPA_ARCH" != "arm64" ]]; then
    echo "❌ IPA 아키텍처: $IPA_ARCH (arm64-only 가 아님)"
    exit 1
  fi
  ```
- 새 iOS 앱 사이클 = 이 검증 단계 디폴트
- 메모리: "iOS 릴리즈 IPA = arm64-only, 배포 직전 lipo 검증 필수"

## 회귀 트리거

- Pod 신규 추가/업데이트 (특히 네이티브 swift/objc Pod)
- Flutter 엔진 업그레이드 (드물지만 가능)
- Xcode 메이저 버전 업
- `pod update` 또는 `flutter pub upgrade` 후 첫 릴리즈 빌드

이런 시점 직후엔 `lipo -info` 더블체크.

## 재사용 후보

- 한줄일기 / 메모요 / 더치페이 / 약먹자 / 포모도로 / lottocalc 등 모든 iOS 앱
- night-builder v2 의 iOS 빌드 단계 (현재 Android only, iOS 추가 시 이 검증 디폴트)
- Mac mini SoT 자동배포 시스템의 ipa 빌드 lane
