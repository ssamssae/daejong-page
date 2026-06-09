---
category: iOS 빌드
tags: [ios, simulator, plist, cfprefsd, simctl, defaults, sharedprefs]
related_issues:
  - 2026-04-17-simulator-sharedprefs-cache
---

# iOS 시뮬레이터 preferences 주입은 `simctl spawn defaults import` 만 쓴다

- **첫 발견:** 2026-04-17 (메모요 스크린샷·테스트 자동화에서 plist 주입 무효 사고)
- **재사용 영역:** 모든 iOS 시뮬레이터 테스트 자동화 — SharedPreferences·NSUserDefaults·CFPreferences 기반 데이터 주입.

## 한 줄 요약

iOS `cfprefsd` (Preferences Daemon) 가 plist 내용을 메모리에 캐시하기 때문에, **PlistBuddy/plutil 로 파일을 직접 수정해도 앱이 옛 값을 계속 읽는다.** 반드시 `xcrun simctl spawn` 경로로 시뮬레이터 내부의 `defaults` 커맨드를 호출해 cfprefsd 를 거치게 만들어야 한다.

## 패턴 코드

```bash
SIM_ID="$(xcrun simctl list devices | grep '(Booted)' | awk -F '[()]' '{print $2}' | head -1)"
DOMAIN="com.daejongkang.memoyo"          # 앱 번들 ID
PLIST_PATH="/tmp/memoyo-seed.plist"      # 미리 원하는 상태로 만들어둔 plist

# ❌ 이 경로는 cfprefsd 캐시를 못 건드려 무효:
#   /usr/libexec/PlistBuddy -c "Set :memos:0:title 'seed'" "<sim>/.../prefs.plist"
#   plutil -insert ... "<sim>/.../prefs.plist"

# ✅ simctl spawn defaults import — cfprefsd 거쳐 정상 반영
xcrun simctl spawn "$SIM_ID" defaults import "$DOMAIN" "$PLIST_PATH"

# 검증: 시뮬레이터에서 같은 defaults read 로 값 확인
xcrun simctl spawn "$SIM_ID" defaults read "$DOMAIN"
```

## 핵심 룰

1. **PlistBuddy/plutil 직접 수정 금지** — 파일은 바뀌지만 cfprefsd 가 invalidate 안 함.
2. **plist 파일 미리 원하는 상태로 빌드 → simctl spawn defaults import 로 주입** 이 표준 경로.
3. **앱 재실행 시 즉시 보임** — 추가 reset 절차 불필요.
4. 같은 함정은 `NSUbiquitousKeyValueStore` 같은 다른 CFPreferences 기반 저장소에도 가능 → 새 자동화 작성 시 simctl spawn 경로 확인.

## 적용 후보

- 메모요 / 한줄일기 / 단어요 등 모든 Flutter 앱 iOS 시뮬레이터 테스트 자동화
- iOS 스크린샷 자동화 (시드 데이터 주입 후 캡처)
- 앱 첫 실행 dialog 우회 (이미 동의함 상태로 prefs seed)

## Forcing Function

- iOS 시뮬레이터 테스트 자동화 스크립트 상단에 "PlistBuddy/plutil 직접 수정 금지, simctl spawn defaults import 만 사용" 주석 박기.
- `~/.claude/skills/` 안 iOS 자동화 스킬 review 시 PlistBuddy 직접 수정 라인 grep 으로 사전 점검.

## 함정

- `simctl spawn` 은 booted 시뮬레이터 ID 필요 — 부팅 안 된 상태면 `simctl boot <id>` 선행.
- domain 이 `com.apple.preferences` 가 아닌 앱 번들 ID 여야 함 (앱별 격리).

## 관련 이슈 (포스트모템)

- `issues/2026-04-17-simulator-sharedprefs-cache.md` (이전됨)
