---
category: 자동화
tags: [playwright, google, oauth, stealth, chrome]
related_issues:
  - 2026-04-16-playwright-chrome-google-login-blocked
  - 2026-05-02-google-oauth-playwright-stealth-bypass
---

# Playwright 로 Google OAuth 로그인 우회 — stealth 4종 디폴트

- **첫 발견:** 2026-04-16 (메모요 사전예약 자동 등록)
- **재발견:** 2026-05-02 (Play Console 세션 쿠키 export)
- **재사용 영역:** Google Workspace (Play Console / Gmail / Cloud Console / Workspace 관리), Google OAuth 가 필요한 모든 Playwright 자동화

## 한 줄 요약

Playwright 로 띄운 Chrome/Chromium 에서 Google 로그인하면 "로그인할 수 없음 / 안전하지 않은 브라우저" 차단됨. **stealth 4종 동시 적용** 으로 우회. 어느 하나 빠지면 차단.

## 우회 코드 (Node.js)

```js
const { chromium } = require('playwright');

const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',                                       // ① 실제 Chrome (chromium for testing X)
  args: [
    '--disable-blink-features=AutomationControlled',       // ② navigator.webdriver=false 강제
    '--disable-features=IsolateOrigins,site-per-process',  // ③ iframe 격리 시그니처 제거
  ],
  ignoreDefaultArgs: ['--enable-automation'],              // ④ Playwright 디폴트 자동화 플래그 제거
});

// (선택, 더 안전하게) addInitScript 로 navigator.webdriver 한번 더 덮어쓰기:
// await ctx.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });
```

## 4종 각각의 역할

| # | 옵션 | 차단되는 시그니처 | 단독으로 충분? |
|---|-----|----------------|--------------|
| ① | `channel: 'chrome'` | "Chrome for Testing" 식별 (메뉴바 + binary 시그니처) | ❌ |
| ② | `--disable-blink-features=AutomationControlled` | `navigator.webdriver === true` | ❌ |
| ③ | `--disable-features=IsolateOrigins,site-per-process` | iframe 격리 패턴 | ❌ |
| ④ | `ignoreDefaultArgs: ['--enable-automation']` | Playwright 디폴트 자동화 플래그 | ❌ |

**4종 모두 동시 적용해야 통과.** 하나만 빠져도 Google 차단 화면 (`accounts.google.com/v3/signin/rejected`) 진입.

## 차단 화면 (참고)

```
🚫 로그인할 수 없음
브라우저 또는 앱이 안전하지 않을 수 있습니다. 자세히 알아보기
다른 브라우저를 사용해 보세요.
```

이 화면 보이면 stealth args 점검. 1차 시도에서 보통 `channel: 'chrome'` 만 적용해 차단됨 (2026-05-02 사고).

## 패키지 / 환경

- `playwright` 모듈 필요. globally `npm i -g playwright` 또는 NODE_PATH 우회:
  ```
  NODE_PATH=/path/to/some-project/node_modules node script.js
  ```
- `chromium-1217+` 캐시: `~/Library/Caches/ms-playwright/` (macOS)
- 시스템 Chrome 설치: `/Applications/Google Chrome.app` (macOS), `channel: 'chrome'` 가 자동 발견

## 강대종 본인 디바이스 보너스

이미 Chrome 으로 본인 Google 계정에 로그인한 디바이스 = Google 입장에서 신뢰 디바이스. stealth args + 신뢰 디바이스 조합 = 1차 통과율 높음. 2FA 도 평소 채널 (휴대폰 prompt) 그대로.

## 적용 후보

1. `/create-play-app` 스킬 (Mac mini raw Playwright `create-play-app.js`)
2. `~/.claude/skills/submit-app/PHASE-B-SETUP.md` §3 Google 세션 쿠키 export
3. `/naver-publish` 스킬 (네이버는 별개, 자체 stealth 추가 필요)
4. Gmail OAuth 자동화 (mail-watcher v5 외 신규 OAuth)
5. Google Cloud Console / Workspace 관리

각 자동화 코드 상단에 "Google OAuth = stealth 4종 디폴트" 주석 박기.

## Forcing Function

- **템플릿화**: `~/.claude/automations/scripts/save-google-session.js` 표준화 (4종 디폴트 포함)
- **PHASE-B-SETUP.md §3.1 정정**: 4종 디폴트 코드 박기 (현재는 `chromium.launch({ headless: false })` 만)
- **/create-play-app 스킬 점검**: Mac mini `create-play-app.js` 도 동일 4종 디폴트 적용
- **메모리 박기**: `feedback_google_oauth_playwright_stealth.md` (모든 신규 Google OAuth 자동화 0차 reflex)

## 함정 (재발 시)

- Google 보안 정책 강화로 4종이 미래 차단될 수 있음. 다음 차단 시:
  - `puppeteer-extra-plugin-stealth` 도입 검토
  - User-Agent 명시 override (`userAgent: 'Mozilla/5.0 ... Chrome/<현재 버전>'`)
  - `addInitScript` 로 더 깊은 시그니처 mask (chrome runtime, plugins 등)
- 4/16 사고 때 메모요 자동 등록 1개에만 적용 = 일반화 누락 사고 (5/2 같은 함정 재발). **노하우 = 사건 분리 + 다른 자동화에 디폴트로 박기**.

## 관련 이슈 (포스트모템)

- `issues/2026-04-16-playwright-chrome-google-login-blocked.md` (메모요 사전예약 등록 사이클)
- `issues/2026-05-02-google-oauth-playwright-stealth-bypass.md` (Play Console 세션 쿠키 export 사이클)
