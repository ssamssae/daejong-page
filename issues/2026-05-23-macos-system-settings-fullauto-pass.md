---
prevention_deferred: null
---

# macOS Sequoia 시스템 설정 풀자동 토글 PASS (본진 자립성 5단계 캘리브레이션)

- **발생 일자:** 2026-05-23 ~02:00 KST (형님 "토글 켜" 명령 + 본진 1차 시도 5번 실패)
- **해결 일자:** 2026-05-23 ~02:36 KST (cliclick + osascript UI scripting hybrid 5단계 캘리브레이션으로 풀자동 PASS)
- **심각도:** low (자립성 키운 성공 사례 — 기능 사고 아니라 자동화 능력 확장)
- **재발 가능성:** low (성공 패턴 박힘, knowhow 로 재사용)
- **영향 범위:** macOS GUI 자동화 전반. macOS Sequoia(15+) 의 시스템 설정 풀자동화 채널 확보.

## 증상
형님이 본진 Mac 의 iCloud 연락처 토글 ON 을 강대종 손0 로 요청 (텔레그램 msg22751 "토글 켜", msg22757 권한 승인, msg22762 Chrome Remote Desktop 으로 본진 화면 모니터링). 본진은 5번 연속 자동화 시도 실패:

1. `osascript reveal pane "com.apple.systempreferences.AppleIDSettings"` → -1728 (pane id 매칭 실패)
2. `open "x-apple.systempreferences:com.apple.preferences.AppleID"` URL scheme + pane list 조회 → -1712 (AppleEvent timeout)
3. `tell process "System Settings" to click (first button whose name is "iCloud")` → -1719 (invalid index, 이름으로 button 매칭 안 됨)
4. cliclick c:800,163 (image preview 좌표 600x376 가정 기반 추정) → Ghostty 터미널 클릭됨 (좌표 빗나감)
5. Playwright 가정 검토 → Playwright 는 브라우저(Chrome/Edge 등) 안 웹페이지만 자동화하는 도구라 macOS 네이티브 시스템 설정 다이얼로그는 못 다룸 (LLT 케이스와 동일 함정)

본진은 솔직히 "macOS 시스템 설정 자동화 능력 밖" 으로 fallback 권유했으나, 형님 격려 메시지 (msg22768 "너의 자립성을 키워 주는 거야 내가 할 수 있지만") + msg22773 "모두 보기 눌러" 가이드로 본진이 다시 진심 시도 → 5단계 hybrid 캘리브레이션으로 풀자동 PASS.

## 원인
**1차 실패의 근본 원인:** macOS Sequoia(15+) 의 System Settings 는 옛 AppKit 기반 시스템 환경설정에서 **SwiftUI 기반으로 재작성**됨. 이 때문에:

1. **pane id 가정 변동** — `com.apple.preferences.AppleIDPrefPane` 같은 옛 pane id 가 새 pane id 와 다름. 무작위 시도로 못 잡음.
2. **AXButton 대다수 unnamed** — entire contents 결과의 13개 AXButton 모두 `name = missing value`. SwiftUI 가 자동으로 accessibility label 안 붙임. 이름 기반 매칭 (`whose name is "iCloud"`) 전부 실패.
3. **AppleEvent 응답 지연** — URL scheme 으로 패널 열 때 시스템 설정이 transitional state 라 osascript 명령 처리 늦어져 timeout.
4. **좌표 매핑 누적 오차** — image preview dimension(LLM 이 보는 사이즈) 명시 hint 없어 image x/y → logical pixel 변환이 추정. 첫 시도 (800, 163) 가 시스템 설정 창 외부 hit.

**중간 깨달음:** Playwright/UI scripting/cliclick 단독으론 안 됨. 세 도구의 hybrid + 단계별 캘리브레이션이 정답.

## 조치
**0. 사전 권한 부여 (형님 Mac 손 1회)** — Privacy & Security → 손쉬운 사용 / Automation 에 Terminal/Claude 권한 부여. AppleEvent timeout 해소.

**1. Window frame 추출 (logical pixel 단위)** — osascript 으로 정확한 좌표 기준점 확보:
```applescript
tell application "System Events"
  tell process "System Settings"
    return position of window 1 & size of window 1
  end tell
end tell
```
결과: position=(829, 44), size=(723, 960). 이게 모든 캘리브레이션의 reference frame.

**2. 사이드바 첫 row click (Apple 계정)** — frame 기반 좌표 추정 + cliclick:
```bash
cliclick c:939,159
```
좌표 = window.x + 사이드바폭_절반(110) = 939, window.y + 헤더(50) + 검색바(30) + 행_절반(20) = 159. → Apple 계정 패널 전환 PASS.

**3. 오른쪽 패널 "iCloud" 항목 click** — frame + 행 spacing 추정:
```bash
cliclick m:1301,440  # mouse 먼저 이동
# screencapture 로 cursor 위치 image 확인
# 빗나가면 y 미세조정
cliclick c:1301,440
```
y=384 추정 → cursor 가 "결제 및 배송" 위 → y=440 으로 조정 → "iCloud" 행 PASS.

**4. "모두 보기" 버튼 click (modal sheet 띄우기)** — image 분석 기반 y 조정 + cliclick:
```bash
cliclick c:1500,290
```
좌표 = window 우측 끝(1552) - padding(50) = 1500. "iCloud에 저장됨" 섹션 헤더 y ≈ window.y + 헤더(280) - 10 = 290. → "iCloud에 저장됨" sheet 띄움 PASS.

**5. "연락처" toggle click (UI scripting name 매칭)** — name 잡히는 element 는 element click 으로 정확:
```applescript
tell application "System Events"
  tell process "System Settings"
    set sheetItems to entire contents of (sheet 1 of window 1)
    repeat with i in sheetItems
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
AXCheckBox name="연락처" pos=(1360, 493) size=(36, 16) 발견 → click → 토글 ON (시각적 파란색 확인) PASS.

**6. "완료" 버튼 click (sheet commit)** — AXButton unnamed 이라 좌표 + entire contents 의 position dump 로 우측 하단 button 식별:
```bash
# AXButton dump → B13 pos=(1342, 920) size=(64, 24) 확인
cliclick c:1374,932  # 가운데 좌표
```
→ Sheet 닫힘 + commit PASS.

## 예방 (Forcing function 우선)

1. **knowhow 박기 (재사용 패턴)** — `~/daejong-page/knowhow/macos-sequoia-system-settings-fullauto.md` 에 본 hybrid 패턴 박음. 다음 macOS GUI 자동화 시 5단계 절차 즉시 채택:
   1) `position of window 1 + size of window 1` 으로 frame 추출
   2) `entire contents of window 1` 으로 element 트리 dump (name + role + position + size 추출)
   3) name 잡히는 element 는 UI scripting `click i` (가장 정확)
   4) name 없는 element 는 좌표 cliclick (좌표 = element position + size/2)
   5) image preview dimension 모를 때는 `cliclick m:x,y` mouse 만 이동 후 screencapture 로 verify

2. **첫 fallback 권유 → 자립성 의지 trigger** — 자동화 첫 시도 막혔다고 즉시 형님 손 fallback 권유 X. 적어도 5단계 시도 후 솔직히 보고. 형님 격려 ("자립성 키워주는 거") = 본진이 angle 바꿔 재시도하는 트리거. memory 신설 후보: `feedback_self_reliance_over_fallback.md`

3. **cliclick + osascript hybrid 가 macOS Sequoia 정답** — 도구 하나에 집착 X. Playwright 는 브라우저 전용이라 네이티브 시스템 설정 불가 (LLT 케이스와 동일 함정). cliclick 단독은 좌표 추정 누적 오차. osascript 단독은 SwiftUI element name 매칭 한계. 셋 다 적시 활용이 핵심.

4. **frame 기반 좌표 추정 공식** — 사이드바 row 좌표 = (window.x + 110, window.y + 50 + 30 + row_index * 35). 오른쪽 패널 row 좌표 = (window.x + 220 + panel_width/2, window.y + 헤더_height + row_index * 40). 다음 macOS 버전 업데이트 시 row spacing 만 재캘리브레이션.

## 재발 이력
<처음 생성 시 비워둠>

## 관련 링크
- 텔레그램 사이클 합치: msg22737~22776 (형님 트리거 + 본진 진행 + 형님 가이드 + 본진 5단계 PASS)
- 형님 폰 Chrome Remote Desktop 이미지: msg22762 / msg22765 / msg22773 (본진 화면 가이드)
- 본진 진행 캡처: `/tmp/cap1.png` / `/tmp/after-click.png` / `/tmp/after-icloud-click.png` / `/tmp/after-modu.png` / `/tmp/after-toggle.png` / `/tmp/after-done.png`
- 형님 인정 메시지: msg22776 ("오늘일 이슈박고 노하우 박고 뉴스레터감이다 연락처 토글혼자 킨거")
- 관련 메모리: `feedback_user_hands_off_when_automation_exists` (강대종 손0 룰), `feedback_nct_autonomous_decision` (자율 결정 범위)
- 관련 노하우: `~/daejong-page/knowhow/macos-sequoia-system-settings-fullauto.md` (별도 박음)
- 관련 이슈: `2026-05-23-anthropic-cyber-content-block.md` (오늘 같은 사이클, 다른 도메인 — 본진 차단 사고와 자동화 성공 사고가 같은 날)
