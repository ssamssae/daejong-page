---
prevention_deferred: null
---

# share_plus 10.1.4 + iOS 26 sharePositionOrigin 필수화 → 호출부 silent PlatformException

- **발생 일자:** 2026-05-19 09:00 KST
- **해결 일자:** 2026-05-19 09:54 KST
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** 메모요 (1.0.5+23 production) + share_plus 패키지 쓰는 모든 Flutter 앱 (약먹자/더치페이/한줄일기/한컵/포모도로 등 — 호출부 점검 필요)

## 증상

메모요 production 1.0.5+23 (iOS) 에서 AppBar overflow menu → "메모 내보내기" 탭해도 share sheet 안 뜨고 silent 무반응. 진행 표시·에러 토스트·콘솔 메시지 없이 dead-end. 본진 실기기 iPhone 17 (iOS 26.3.1) 에서 재현 → Xcode console attach 후에야 PlatformException 확인.

## 원인

iOS 26 부터 share_plus 10.1.4 가 iPad style presentation 요구 변경에 따라 `sharePositionOrigin` (Rect) 인자를 필수로 받는다. 메모요 호출부가 그 인자를 안 넘겨서 PlatformException 발생. onTap async 콜백에 try/catch 없어 Flutter 이벤트 루프가 예외를 swallow → 사용자에겐 silent. 패키지 버전 자체 changelog 가 명시 안 하고 iOS 호스트 OS 메이저 bump 와 같이 풀어진 게 함정 forcing 요인.

## 조치

메모요 1.0.6+24 surgical fix 4건 (commit 018753f, 본진 main 직접 push):
- `lib/services/share_service.dart` (또는 호출부) 에 `dart:ui` Rect import
- 메모 내보내기 호출 시그니처에 `sharePositionOrigin: Rect.fromLTWH(0, 0, 0, 0)` 명시 (iPad 가 아닌 폰 디폴트는 0-rect 로 충분)
- `XFile` mimeType 명시 (`application/json`)
- onTap async 콜백 전체를 try/catch 로 감싸 PlatformException catch + 사용자에게 SnackBar 등 surface
- `pubspec.yaml` 1.0.5+23 → 1.0.6+24 bump
- `fastlane/metadata/android/ko-KR/changelogs/24.txt` 한글 release notes 추가 (commit 6be209e)

본진 iPhone 17 debug install 후 share sheet 정상 출현, Xcode console PlatformException 0건 verify.

## 예방 (Forcing function)

1. **모든 Flutter 앱 share_plus 호출부 일제 점검** — `grep -rn 'Share\.share\|SharePlus\|share_plus' ~/apps ~/simple_memo_app ~/yakmukja ~/dutch_pay_calculator ~/hanjul ~/wordyo ~/pomodoro ~/hankeup 2>/dev/null` 한 줄로 호출부 surface 후 `sharePositionOrigin` 누락 + try/catch 누락 둘 다 같이 잡기.
2. **사용자 onTap/onPressed async 콜백은 try/catch 박는 룰** — pubspec/lib 레벨 lint rule (`unawaited_futures` + custom rule) 검토. silent PlatformException = UX dead-end 의 가장 흔한 형태. `~/.claude/skills/lints/flutter-callback-try-catch.dart` 형태로 룰 박기 후속 검토.
3. **iOS 메이저 bump 시 share_plus 같은 native bridge 패키지는 호출부 자체를 재검증** — 패키지 changelog 보다 OS 메이저 변경이 break 사유. 새 iOS 버전 출하 직후 일주일 안 모든 native bridge 호출 dogfood path 1회.

## 재발 이력

## 관련 링크

- 커밋: [018753f](https://github.com/ssamssae/simple_memo_app/commit/018753f) (silent fail fix), [6be209e](https://github.com/ssamssae/simple_memo_app/commit/6be209e) (fastlane ko release notes)
- 텔레그램: 형님 트리거 2026-05-19 09:00 KST
- 직전 사이클 핸드오프 컨텍스트 (메모요 1.0.6+24 + 1.0.7 진입 ack 흐름)
