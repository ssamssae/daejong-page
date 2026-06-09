---
category: iOS 빌드
tags: [ios, flutter, irun, devicectl, device-lock, error-translation]
first_discovered: 2026-04-20
related_issues:
  - 2026-04-20-irun-locked-iphone
---

# iOS device 잠금 상태에서 Flutter run = "Could not run Runner.app" 오탐 — devicectl pre-check + 폴백

- **첫 발견:** 2026-04-20 (실기기 USB attach 재배포 중 반복 실패)
- **재사용 영역:** USB 연결된 실기기로 `flutter run`/`/irun`/`/arun` 류 호출하는 모든 사이클

## 한 줄 요약

Flutter 가 출력하는 `Could not run build/ios/iphoneos/Runner.app on <UDID>` + "Try Xcode > Run" 안내는 실제 원인을 가리는 **번역 오탐**. install 은 성공했지만 `devicectl process launch` 가 잠금 거부(`SBMainWorkspace ... Locked`) 했을 가능성이 가장 흔하다. **flutter run 전에 device unlock 상태를 사전 체크**하고, **에러 매칭 시 devicectl 직접 호출로 진짜 원인을 surface** 하는 게 정답.

## 언제 쓰는가

- `/irun`, `/arun`, `flutter run` 류 스킬을 USB attach 모드로 호출할 때
- "Could not run Runner.app on <UDID>" 시그니처를 받았을 때
- Xcode 만 시키면 잘 되는데 Flutter CLI 만 실패하는 패턴
- 사용자가 폰을 책상 위에 잠긴 채로 두고 작업하는 경우 (일상)

## 차단 시그니처

```
Could not run build/ios/iphoneos/Runner.app on <UDID>.
Try launching Xcode and selecting "Product > Run" to fix the problem:
  open ios/Runner.xcworkspace

Error running application on <Device Name>.
```

빌드 자체는 정상 완료, install 도 성공 (앱은 폰에 올라감), launch 단계에서만 실패. Xcode 안내 따라가면 시간 낭비.

## 절차

### A. flutter run 호출 전 사전 게이트 (best)

```bash
xcrun devicectl device info connected --device "$UDID" 2>&1 \
  | grep -qi 'unlocked' \
  || { echo "❌ device locked: 아이폰 잠금 풀고 재시도"; exit 1; }
```

`info connected` 출력 중 `unlocked` 키 매칭. 잠긴 상태면 즉시 stop + 사용자에게 텔레그램 알림.

### B. "Could not run" 에러 매칭 시 devicectl 폴백 (fallback)

`flutter run` 의 stderr 를 모니터하다가 시그니처 매칭되면 install/launch 를 수동으로 분리 호출:

```bash
# install 만 따로
xcrun devicectl device install app \
  --device "$UDID" build/ios/iphoneos/Runner.app

# launch 따로 — 진짜 원인이 stderr 에 그대로 나옴
xcrun devicectl device process launch \
  --device "$UDID" "$BUNDLE_ID" 2>&1 | tee /tmp/devicectl-launch.log

# Locked 시그니처면 사용자에게 "잠금 풀어주세요"
grep -q 'Locked' /tmp/devicectl-launch.log \
  && echo "📱 device locked — 잠금 풀고 재시도 필요"
```

## 검증

- 게이트 추가 후 device unlock 상태에서 `flutter run` → 평소대로 install + launch 성공
- 잠금 상태에서 호출 → "device locked" 메시지로 즉시 스킵, Xcode 안내로 빠지지 않음
- "Could not run" 매칭 폴백은 잠금 외 진짜 launch 실패 (provisioning 만료 등) 도 stderr 그대로 surface

## 함정

- `Could not run` 시그니처에는 "Xcode 에서 Product > Run" 안내가 따라붙어 사람을 두 번 낚는다. **두 번 시도해보고도 같은 에러면 무조건 devicectl 분리 호출** 로 바꿔야 함 (낚시 무한루프 차단).
- `xcrun devicectl device install app` 자체는 잠금 무관하게 성공한다 — install OK 라고 launch OK 가 아니다.
- `info connected` 의 `unlocked` 키워드는 OS 버전 따라 출력 형태가 미묘하게 달라질 수 있어, 매칭이 빠지면 게이트가 false-negative 가 된다. 게이트 도입 시 실제 출력 sample 한 번 캡처해서 정규식 검증 권장.
- 일부 펌웨어/OS 조합에선 Face ID 잠금이 launch 거부에 반영되는 데 1~2초 lag 가 있어, "방금 풀었는데 또 막힘" 현상 가능. 사용자에게 "잠금 풀고 5초 후 재시도" 안내가 안전.

## 관련

- issues 원본: `2026-04-20-irun-locked-iphone.md`
- 적용 지점: `~/.claude/skills/irun/SKILL.md`, `~/.claude/skills/arun/SKILL.md` 의 install/launch 단계
- 참고 패턴: 「에러 메시지 ≠ 원인」 일반 원리 — Flutter CLI 가 native error 를 자체 문구로 번역하는 경우 흔하므로, 번역 layer 가 의심되면 native 도구로 분리 호출 디폴트
