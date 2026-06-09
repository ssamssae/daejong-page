---
category: 자동화
tags: [korail, playwright, perimeter-x, bot-detection, anti-bot, stealth]
date: 2026-05-05
---

# 코레일 Playwright 봇 자동화 — 막다른 길

- **시도 날짜:** 2026-05-05
- **목표:** 서울→진영 2026-05-23 09:04 KTX 일반실 좌석 모니터링 + 자동예약

## 뭘 시도했나

### v1 — headless + 직접 API
- `letskorail.com` API 직접 호출 (YYYYMMDD 파라미터)
- headless Playwright, 고정 3분 폴링
- 결과: 세션 만료 + 탐지

### v2 — headed + stealth 패치
- `headless=False` (실제 브라우저 창)
- `navigator.webdriver = undefined` 패치
- `Device=BH → WB` FormData/fetch/XHR 치환
- 랜덤 딜레이 150~270초
- 결과: `-8002 macro_err1` → 즉시 차단

### v3 — playwright-stealth + 퍼시스턴트 프로필
- `playwright-stealth 2.0.3` 적용
- `navigator.hardwareConcurrency`, `deviceMemory`, `maxTouchPoints`, `permissions.query` 추가 패치
- `launch_persistent_context(PROFILE_DIR)` — PerimeterX deviceId 재사용
- 베지어 곡선 마우스 이동 (`human_click()`)
- 결과: 시작 1분 만에 `-8002` 차단

### v4 — MCP Playwright (별개 브라우저 인스턴스)
- Claude Code Playwright MCP로 직접 UI 조작 (봇 스크립트 0)
- 결과: `-8003` 차단 (MCP가 `--no-sandbox` 플래그 사용)

## 왜 막혔나

코레일이 도입한 **PerimeterX (현 HUMAN Security)** 가 다층 탐지를 한다:

| 탐지 레이어 | 내용 |
|---|---|
| JS 핑거프린트 | `navigator.webdriver`, CDP 흔적, WebGL SwiftShader |
| 행동 분석 | 마우스 이동 궤적, 클릭 간격, 스크롤 없음 |
| 네트워크 | `--no-sandbox` 플래그, Device=BH 파라미터 |
| 서버사이드 | 동일 IP/계정 반복 요청, 계정 레벨 플래그 |

JS 레이어 패치로 일부 탐지를 늦출 수 있지만, **서버사이드 계정/IP 플래그는 클라이언트 패치로 해결 불가**.

## 남은 선택지 (미시도)

1. **코레일 앱 + mitmproxy 스니핑** → 네이티브 API 직접 호출 (PerimeterX 미적용 예상)
2. **iOS 시뮬레이터 + Appium** → 웹 자동화 아닌 앱 UI 자동화
3. **모바일 핫스팟으로 IP 변경** 후 단발성 수동 체크

## 결론

브라우저 자동화(Playwright/Selenium/CDP 기반) 경로는 **코레일 korail.com 기준 막힌 길**. 앱 API 경로나 수동 체크로 우회해야 함.
