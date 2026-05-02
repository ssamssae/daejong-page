---
category: 자동화
tags: [applescript, ios, simulator, coordinate, tap, retina, scaling]
related_issues:
  - 2026-04-17-simulator-tap-coordinate-drift
---

# AppleScript 좌표 기반 탭 자동화는 "단발 X, 검증+재시도 디폴트"

- **첫 발견:** 2026-04-17 (메모요 시뮬레이터 메모 탭 ±1 행 drift)
- **재사용 영역:** macOS GUI 자동화 전반 — iOS 시뮬레이터, 데스크톱 앱, 코어 그래픽 기반 좌표 입력 모두.

## 한 줄 요약

AppleScript 가 전달하는 좌표와 앱이 받는 좌표는 **macOS Retina 스케일링(2x) + 시뮬레이터 자체 하드웨어 스케일** 이 겹치면서 일정하지 않게 어긋난다. 특히 리스트 아이템 높이가 작으면 ±1 행 drift 가 일상. **단일 탭으로 끝내지 말고, 탭 후 결과 검증 → 실패 시 ±1 행 보정 후 재시도하는 패턴을 디폴트로 박는다.**

## 패턴 코드 (AppleScript)

```applescript
on tapWithVerify(targetX, targetY, expectedTitle)
    set rowHeight to 44 -- iOS 리스트 기본 row height
    repeat with offset in {0, -rowHeight, rowHeight}
        tell application "System Events"
            click at {targetX, targetY + offset}
        end tell
        delay 0.3
        if currentTitleMatches(expectedTitle) then
            return true
        end if
    end repeat
    error "tap failed after 3 attempts (offset 0/-/+ row)"
end tapWithVerify
```

## 핵심 룰

1. **탭 → 결과 검증 → 재시도** 가 디폴트. "한 번에 맞으면 좋고 아니면 재시도".
2. **가능하면 좌표 대신 accessibility identifier 기반 조작 우선** — AppleScript 한계면 XCUITest 계열 (`xcuitest run`) 으로 넘어감. 좌표 탭은 최후 수단.
3. **스케일 보정 상수** 를 스크립트 상단에 박아 환경별 차이를 한 곳에서 조정.
4. 검증 부재 = 재현 X = 디버깅 불가능. **결과 확인 코드 없는 좌표 탭은 PR 리뷰에서 reject**.

## 적용 후보

- iOS 시뮬레이터 스크린샷 자동화 (메모요·한줄일기·단어요·로또계산기)
- macOS GUI 앱 자동화 (cliclick, AppleScript)
- 데스크톱 Playwright (좌표 클릭 fallback)
- screenshot-test 류 시각 검증 자동화

## Forcing Function

- iOS 시뮬레이터 자동화 스크립트 상단에 "tap 후 결과 검증 + 재시도 패턴 필수" 주석 박기.
- `~/.claude/skills/` 안 좌표 탭 자동화 스킬 review 시 검증 코드 부재 라인 사전 점검.

## 함정

- 시뮬레이터 해상도/스케일 변경 (iPhone 모델 변경, Display & Brightness 변경) 시 보정 상수 재계산.
- `delay` 너무 짧으면 UI 반응 전 검증 진입해서 false negative — 0.3s 가 보통 안전선.

## 관련 이슈 (포스트모템)

- `issues/2026-04-17-simulator-tap-coordinate-drift.md` (이전됨)
