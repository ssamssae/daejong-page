---
category: 자동화
tags: [macos, sequoia, system-settings, swiftui, osascript, cliclick, ui-scripting, accessibility, gui-automation]
related_issues:
  - 2026-05-23-macos-system-settings-fullauto-pass
---

# macOS Sequoia (15+) 시스템 설정 풀자동화 — cliclick + osascript hybrid 패턴

- **첫 발견:** 2026-05-23 (본진 Mac iCloud 연락처 토글 ON 5단계 캘리브레이션 풀자동 PASS)
- **재사용 영역:** macOS 15+ 의 모든 시스템 설정 패널 조작. Apple ID / iCloud / Privacy & Security / 사운드 / 키보드 등 SwiftUI 기반 패널 전반.

## 한 줄 요약

macOS Sequoia(15+) 의 시스템 설정은 옛 AppKit 기반 시스템 환경설정에서 **SwiftUI 로 재작성**되어, 옛 pane id / `whose name is "..."` 매칭이 거의 안 통한다. 단일 도구(Playwright / cliclick / osascript) 만으론 풀자동 불가. **5단계 hybrid 패턴**으로 가야 한다: `frame 추출 → entire contents element dump → name 잡히면 UI scripting / 없으면 좌표 cliclick → mouse 만 이동 + screencapture 로 좌표 verify → 단계별 캘리브레이션`.

## 5단계 패턴

### 1) Window frame 추출 (logical pixel 기준점)

```applescript
tell application "System Events"
  tell process "System Settings"
    return position of window 1 & size of window 1
  end tell
end tell
```

결과 형식: `{x, y, width, height}` (concat 된 string 형태로 반환됨, parse 필요). 이게 모든 좌표 계산의 reference. **창 위치는 사용자가 옮길 수 있으므로 자동화 시작마다 매번 재추출.**

### 2) Entire contents element dump (트리 + name + role + position + size)

```applescript
tell application "System Events"
  tell process "System Settings"
    set allItems to entire contents of window 1
    set namedItems to ""
    repeat with i in allItems
      try
        set n to name of i
        if n is not missing value and n is not "" then
          set namedItems to namedItems & "[" & n & "]"
        end if
      end try
    end repeat
    return namedItems
  end tell
end tell
```

자주 빈 결과 또는 `(unnamed)` 만 나오는 element 가 있음 — 이게 SwiftUI 의 한계. **name 잡히는 element 와 안 잡히는 element 가 섞여있다고 가정**.

### 3) name 잡히는 element 는 UI scripting `click` (가장 정확)

```applescript
tell application "System Events"
  tell process "System Settings"
    set allItems to entire contents of window 1
    repeat with i in allItems
      try
        if name of i is "연락처" and role of i is "AXCheckBox" then
          click i
          return "clicked"
        end if
      end try
    end repeat
  end tell
end tell
```

`role` 필터링 중요 — 같은 name 의 element 가 여러 개일 수 있음 (AXStaticText 라벨 + AXCheckBox 토글). **클릭 가능한 role 만 (AXCheckBox / AXButton / AXRadioButton / AXMenuItem) 클릭.**

### 4) name 없는 element 는 좌표 cliclick (osascript 으로 position 추출 후)

```applescript
-- entire contents 안 모든 AXButton 의 position + size dump
tell application "System Events"
  tell process "System Settings"
    set sheetItems to entire contents of (sheet 1 of window 1)
    set btnPos to ""
    set idx to 0
    repeat with i in sheetItems
      try
        if role of i is "AXButton" then
          set idx to idx + 1
          set btnPos to btnPos & "B" & idx & ":pos=" & (position of i as string) & "/size=" & (size of i as string) & " "
        end if
      end try
    end repeat
    return btnPos
  end tell
end tell
```

결과에서 우측 하단 (높은 x + 높은 y) 작은 size 의 button = "완료" / "OK" / "확인" 등의 commit button. position + size/2 = 가운데 좌표로 cliclick.

```bash
cliclick c:1374,932  # 가운데 좌표
```

### 5) Mouse 만 이동 + screencapture 로 좌표 verify (정확도 안 보일 때)

```bash
cliclick m:1500,290  # mouse 이동만, click X
sleep 1
screencapture -x -C /tmp/probe.png  # cursor 포함 캡처
# Read image 로 cursor 위치 확인
# 빗나가면 좌표 미세조정 후 재시도, 정확하면 cliclick c: 으로 click
```

**핵심:** 첫 시도에 click 하지 말고 mouse 이동 + verify → 정확하면 click. 빗나가면 click 안 한 상태로 미세조정 → 안전.

## 핵심 룰

1. **단일 도구 한계 인정 + hybrid 디폴트.** Playwright = 브라우저 전용 (네이티브 시스템 설정 X), cliclick 단독 = 좌표 추정 누적 오차, osascript 단독 = SwiftUI element name 매칭 한계. 셋 다 적시 활용.
2. **frame 매번 추출** — 창 위치 사용자가 옮길 수 있고 macOS 버전 업데이트 시 default 위치 변동. 자동화 시작마다 osascript 으로 새로 추출.
3. **클릭 가능 role 만 click** — AXStaticText 클릭하면 효과 없음. AXCheckBox / AXButton / AXRadioButton / AXMenuItem 필터.
4. **AppleEvent timeout 함정** — `with timeout of N seconds ... end timeout` 으로 명시. 권한 부재 시 -1712 발생 → Privacy & Security → Automation 권한 부여 (형님 손 1회 사전 셋업).
5. **modal sheet 는 별도 element 트리** — sheet 안 element 는 `entire contents of (sheet 1 of window 1)` 으로 접근. window 1 의 entire contents 와 별개.

## 적용 후보

- macOS 시스템 설정의 모든 패널 자동화 (Apple ID / iCloud / Privacy & Security / Sound / Keyboard 등)
- 다른 SwiftUI 기반 macOS 앱 자동화 (Finder, Safari 설정 등)
- macOS 시스템 다이얼로그 (Save / Open / Print) 자동화 시 sheet 트리 접근
- 다음 macOS 버전 업데이트 시 (Sequoia 16+) 같은 패턴 + frame/spacing 만 재캘리브레이션

## Forcing Function

- 다음 macOS GUI 자동화 작업 진입 시 **첫 5분에 frame + entire contents dump** 부터. 도구 selection 고민 X.
- 자동화 막혔다고 즉시 "형님 손 fallback" 권유 X — 적어도 5단계 시도 후 솔직히 보고. (근거: 본진이 1차 5번 실패 후 fallback 권유했지만 형님 "자립성 키워주는 거" 격려로 5단계 hybrid 풀자동 PASS 한 사이클)
- 신규 패널 자동화 시 본 knowhow 파일 grep 우선: `~/daejong-page/knowhow/` 안 macos / system-settings / cliclick 키워드.

## 함정

- **macOS 버전 업데이트** 시 entire contents 트리 구조 변동 가능 — 첫 자동화 막히면 트리 재 dump 후 element role/name 매칭 재검토.
- **권한 다이얼로그** — 첫 자동화 시 macOS 가 Privacy & Security → 손쉬운 사용 / Automation 권한 요청. 형님 Mac 화면 앞에서 1회 부여 필수. 헤드리스 X.
- **screencapture cursor 식별 어려움** — cursor 가 image preview 안에서 작아 식별 안 될 수 있음. mouse 위치 sips crop 으로 zoom in 가능. 또는 frame 기반 추정으로 우회.
- **좌표 단위 = logical pixel** — Retina 화면이라도 cliclick 좌표는 logical (보통 physical/2). 좌표 추정 시 `system_profiler SPDisplaysDataType | grep -i "Looks like"` 로 logical resolution 확인.

## 관련 이슈 (포스트모템)

- `issues/2026-05-23-macos-system-settings-fullauto-pass.md` (본 노하우의 첫 적용 사이클, 5단계 캘리브레이션 PASS process 전체)
