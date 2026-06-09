---
category: iOS 배포
tags: [ios, app-store, app-store-connect, screenshot, ipad, flutter, targeted-device-family, submission]
first_discovered: 2026-04-24
related_issues:
  - 2026-04-24-ios-ipad13-screenshot-mandatory
---

# App Store 심사 제출: iPhone Only 앱도 iPad 13" 스크린샷 필수

- **첫 발견:** 2026-04-24 (약먹자·더치페이 심사 제출 시 "심사에 추가" 버튼 차단)
- **재사용 영역:** Flutter/네이티브 iOS 앱을 App Store 에 처음 제출하는 모든 경우

## 한 줄 요약

Flutter 기본 Runner.xcodeproj 의 `TARGETED_DEVICE_FAMILY` 가 `1,2`(iPhone+iPad)로 기본 설정돼 있어, iPhone 전용으로 기획해도 App Store Connect 는 **iPad 13" 스크린샷(2048×2732)을 필수**로 요구한다.

## 오류 메시지

App Store Connect 에서 "심사에 추가" 클릭 시:

```
심사에 추가할 수 없음
13 iPad 디스플레이에 대한 스크린샷을 업로드해야 합니다.
```

iPhone 6.5" 스크린샷, 로그인 정보 해제, 연락처, 개인정보 처리방침, 카테고리, 연령 등급, 가격 — 모두 통과해도 이 한 줄에서 막힌다.

## 해결책 A — sips 리사이즈 (빠른 임시 해결)

iPhone 스크린샷을 iPad 사이즈로 강제 리사이즈:

```bash
# iPad 13" 요구 사이즈: 2048×2732 (portrait) 또는 2732×2048 (landscape)
mkdir -p screenshots/ios_ipad13
sips -z 2732 2048 screenshots/ios65/*.png --out screenshots/ios_ipad13/
```

종횡비 왜곡이 생기지만 현재(2026-04-24 기준) Apple 자동 검증은 **사이즈 정합성만 체크**하고 비율 왜곡으로 reject 하지 않음을 확인. Human review 에서 트집 잡힐 가능성은 낮지만 0은 아님.

## 해결책 B — TARGETED_DEVICE_FAMILY = 1 (근본 해결)

Flutter 앱을 진짜 iPhone 전용으로 선언:

```
# ios/Runner.xcodeproj/project.pbxproj 내 모든 TARGETED_DEVICE_FAMILY 값을
# "1,2" → "1" 로 변경
```

또는 Xcode > Target > General > Deployment Info > iPad 체크박스 해제.

이렇게 하면 App Store Connect 가 iPad 스크린샷을 요구하지 않음. 단, **이미 iPad 지원으로 등록된 앱은 변경 어려움** (고객 기기 풀이 줄어 거절될 수 있음).

## 제출 전 체크리스트 (iOS 심사 스크린샷)

- [ ] iPhone 6.5" (1284×2778 또는 1320×2868) 스크린샷 준비
- [ ] iPad 13" (2048×2732) 스크린샷 최소 1장 준비
  - 없으면 `sips -z 2732 2048` 로 iPhone 스크린샷 리사이즈
- [ ] App Store Connect 상단 "iPhone" → "iPad" 탭 전환 후 업로드
- [ ] "심사에 추가" 클릭 전 두 디바이스 탭 모두 스크린샷 있는지 확인

## 자동화 스크립트에 통합하는 방법

`/submit-app` 스킬 또는 배포 스크립트에 추가할 iPad 스크린샷 자동 생성 단계:

```bash
#!/usr/bin/env bash
# iPhone 스크린샷 → iPad 13" 사본 자동 생성
IPHONE_DIR="screenshots/ios65"
IPAD_DIR="screenshots/ios_ipad13"
mkdir -p "$IPAD_DIR"

for f in "$IPHONE_DIR"/*.png; do
  basename=$(basename "$f")
  sips -z 2732 2048 "$f" --out "$IPAD_DIR/$basename"
done
echo "✅ iPad 13\" 스크린샷 생성: $IPAD_DIR"
```

## 함정

- "iPhone Only 앱인데 iPad 스크린샷이 왜 필요해?" → Flutter 기본 xcodeproj 가 iPad 지원으로 빌드되기 때문. Flutter 로 만든 앱은 기본적으로 iPad 에서도 돌아가도록 빌드됨.
- 자동화 배포 스크립트가 iPhone 스크린샷만 업로드하고 iPad 를 빠뜨리면 무조건 블로킹. 스크린샷 업로드 후 "심사에 추가" 전 iPad 탭 확인 단계 필수.
- `sips -z HEIGHT WIDTH` 순서 주의 — `sips -z 2732 2048` 는 height=2732, width=2048 (portrait). landscape 이면 `-z 2048 2732`.

## 관련

- issues 원본: `2026-04-24-ios-ipad13-screenshot-mandatory.md`
- 관련 패턴: `2026-04-19-ios-ipa-arm64-only-lipo-check.md` — IPA 아키텍처 체크
- Apple 공식 요구 사이즈: iPhone 6.5" + iPad 13" Pro M4 (최소 세트, 2025-2026 기준)
