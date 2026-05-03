# 제출 버튼이 스스로 눌릴 때

_바이브코딩 뉴스레터 Ep.6 — Plan C, 빌드부터 심사 제출까지 자동화한 이야기_

> 작성: 2026-05-03
> 상태: 초안 (미발행 — Substack/네이버 발행 전 검토 필요)

---

> 4월 29일 새벽 6시 43분, Apple 메일이 왔다. 거절이었다.
>
> 나는 이미 자러 간 상태였다. Mac mini 는 혼자 빌드를 끝내고, 서명을 끝내고, 업로드를 끝낸 뒤였다. 인간이 필요한 게 하나만 남아있었다. **심사 제출 버튼.** 그걸 내가 자고 일어나서 눌렀고, 6시 43분에 거절이 왔다.
>
> 이건 자동화 미완성의 이야기가 아니다. **자동화가 막히는 정확한 지점** 을 찾아낸 이야기다.

이 뉴스레터는 1인 인디 개발자가 Claude Code 두 대(Mac·WSL)와 함께 의사결정을 내리는 흐름의 기록이다. Ep.1 은 **만들기**, Ep.2 는 **죽이기**, Ep.3 는 **빼기**, Ep.4 는 **잇기**, Ep.5 는 **돌리기** 였다. 이번 Ep.6 는 **자동화** — 반복 작업을 기계에게 맡기는 과정, 그리고 기계가 혼자 못 하는 것을 정확하게 발견하는 과정이다.

---

## 1막 — Plan A 의 한계

4월 초, 앱이 세 개가 됐다. 한줄일기, 약먹자, 더치페이. 모두 Flutter, 모두 iOS + Android 타깃.

릴리스 루틴이 생겼다. 각 앱마다:

1. `flutter build appbundle --release`
2. `jarsigner` 로 서명
3. Play Console 에 AAB 드래그앤드롭
4. `flutter build ipa`
5. Xcode Organizer 에서 App Store Connect 업로드
6. App Store Connect 에서 메타데이터 입력
7. 심사 제출 버튼 클릭

3개 앱 × 7단계 = 21번의 수작업. 빌드 시간을 빼면 실제 손이 가는 클릭만 40분이다. 매 릴리스마다.

이걸 "Plan A" 라고 부르기로 했다. 모든 게 수동이고, 모든 단계에 내가 있어야 한다.

---

## 2막 — Plan B 의 시작

Ep.4 에서 Substack 발행을 자동화했다. 그 과정에서 배운 게 하나 있다. **API 가 없어도 브라우저는 있다.** Playwright 로 클릭할 수 있으면 자동화할 수 있다.

같은 논리를 빌드 파이프라인에 적용했다.

첫 번째 시도: Mac mini 에 cronjob 을 걸었다. 새벽 2시에 켜져서 빌드하고, 결과를 텔레그램으로 알려주는 스크립트. 결과는 절반의 성공이었다. 빌드는 됐다. 그런데 **업로드가 조용히 실패하고 있었다.** `|| true` 로 에러를 삼키는 패턴이 문제였다.

```bash
# 문제가 있는 패턴
flutter build appbundle --release || true
jarsigner -keystore ... || true
```

로그에는 "완료" 가 찍혔다. 실제로는 keystore 파일이 없어서 서명이 안 됐다. **조용한 실패** 가 제일 비싸다는 걸 그 때 배웠다.

수정 후:

```bash
# 올바른 패턴
set -euo pipefail
flutter build appbundle --release 2>&1 | tee /tmp/build-${app}.log
jarsigner -keystore "$KEYSTORE_PATH" ...
```

`set -e` 하나가 세 시간짜리 디버깅 세션을 막아준다.

---

## 3막 — night-builder v2 의 탄생

빌드 + 서명까지 자동화한 게 night-builder v1 이었다. v2 는 멀티 앱 + 텔레그램 결과 리포트를 추가했다.

구조는 단순하다:

```bash
APPS=(hanjul wordyo pomodoro hankeup)

for app in "${APPS[@]}"; do
  cd ~/apps/$app
  flutter clean && flutter pub get
  flutter build appbundle --release
  
  # 서명
  jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
    -keystore "$KEYSTORE_PATH" \
    -storepass "$KEYSTORE_PASS" \
    "build/app/outputs/bundle/release/app-release.aab" \
    "$KEY_ALIAS"
  
  # 결과 텔레그램 전송
  send_telegram "✅ $app AAB 빌드+서명 완료"
done
```

여기서 keystore 8개 파일을 Mac mini 에 rsync 하는 게 v2 가 v1 과 달라진 핵심이다. keystore 가 없으면 서명이 안 되고, 서명이 없으면 Play Console 이 거부한다. Mac mini 에 keystore 가 있는지 없는지를 v1 은 확인 안 했다.

v2 검증 결과: PASS 4, FAIL 0.

---

## 4막 — 진짜 막히는 벽

빌드와 서명까지 자동화됐다. 다음은 업로드와 심사 제출이다. 여기서 두 개의 벽을 만났다.

### 벽 1: App Store Connect API 의 구멍

App Store Connect API 는 생각보다 많은 것을 **못 한다**:

- **App Privacy 질문지**: UI 전용, API 없음
- **가격 책정 최초 설정**: Pricing API 가 있지만 신규 앱은 UI 필요
- **Health & Safety 카테고리**: 앱 유형 특화 화면, API 없음
- **심사 제출 자체**: API 로 가능하지만, 위 3개 중 하나라도 미완이면 제출 실패

이 세 화면을 채우지 않으면 `xcrun altool --upload-package` 가 성공해도 심사 제출 API 가 에러를 던진다.

### 벽 2: Google Play API 의 관리 게시 함정

Play Console 에는 **Managed Publishing (관리 게시)** 설정이 있다. 이게 ON 이면 검토가 통과해도 앱이 자동으로 배포되지 않는다. 수동으로 "게시" 버튼을 눌러야 한다.

신규 앱 등록 시 이 설정이 기본으로 ON 된다. API 로는 이 설정을 해제할 수 없다. UI 에서만 토글 가능하다. 이것 때문에 14일을 기다렸다. 검토 통과 후 게시가 안 돼서.

---

## 5막 — Playwright 가 API 를 대체하는 법

두 벽을 같은 도구로 뚫었다. Playwright MCP.

App Store Connect 에서 App Privacy 체크박스를 클릭하는 건 사람이 하는 것과 다를 게 없다. Playwright 가 동일한 클릭을 한다. 차이는 사람이 자리에 없어도 된다는 것이다.

```javascript
// App Privacy 질문지 자동화 핵심
const page = playwright.page;

// ❌ 이렇게 하면 오클릭 (ref 번호가 DOM 순서 기반이라 취소 버튼이 먼저 나옴)
await page.click('[ref=e123]');

// ✅ role + name + dialog scope 조합
const dialog = page.locator('[role=dialog]').last();
await dialog.getByRole('checkbox', { name: /Third-party advertising/i }).check();
await dialog.getByRole('button', { name: '저장' }).click();
```

ref 번호를 직접 쓰지 않는 게 핵심이다. Playwright MCP 의 `browser_snapshot` 이 제공하는 `[ref=eNNN]` 번호는 DOM 순서 기반이라, 화면 구조가 살짝 바뀌면 다른 요소를 클릭한다.

### Google OAuth 차단 우회

Play Console 에 접근하려면 Google 로그인이 필요하다. 그런데 일반 Playwright Chrome 에서 Google 로그인하면 "안전하지 않은 브라우저" 로 차단된다. stealth 4종을 동시에 적용해야 한다:

```javascript
const browser = await chromium.launch({
  args: [
    '--disable-blink-features=AutomationControlled',
    '--disable-features=IsolateOrigins,site-per-process',
    '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end'
  ]
});

// channel: 'chrome' (설치된 실제 Chrome 사용)
const context = await browser.newContext({ channel: 'chrome' });
// + navigator.webdriver = false override
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => false });
});
```

하나라도 빠지면 Google 이 차단한다.

---

## 6막 — asc-deliver 로 IPA 업로드까지

App Privacy 와 가격을 Playwright 로 채우고 나면, IPA 업로드와 심사 제출은 API 로 자동화할 수 있다.

```bash
# IPA 업로드
xcrun altool --upload-package Runner.ipa \
  --type ios \
  --apiKey "$ASC_KEY_ID" \
  --apiIssuer "$ASC_ISSUER_ID"

# 심사 제출 (App Store Connect API)
curl -X POST "https://api.appstoreconnect.apple.com/v1/appStoreVersionSubmissions" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"data":{"type":"appStoreVersionSubmissions","relationships":{"appStoreVersion":{"data":{"type":"appStoreVersions","id":"'"$VERSION_ID"'"}}}}}'
```

업로드부터 심사 제출까지 사람 손이 안 간다. 결과는 텔레그램으로 온다.

---

## 1인 개발자가 재현 가능한 핵심 패턴

**1. 빌드는 스크립트, 실패는 크게**

`set -euo pipefail` + 텔레그램 알림. 조용한 실패가 제일 비싸다. 빌드 로그를 파일로 남기면 디버깅 시간이 반으로 줄어든다.

**2. API 없는 화면은 Playwright 로**

App Store Connect, Play Console 모두 브라우저 자동화가 닿는다. ref 번호 대신 `role + name + scope` 조합으로 클릭하면 안정성이 높다. Google OAuth 차단은 stealth 4종이 해답이다.

**3. 운반체를 설계하라**

Mac mini(빌드) → 본진(리뷰) → WSL(코드 수정) 흐름이 자동으로 이어져야 진짜 자동화다. 결과를 사람이 받아서 다음 기기로 전달하는 순간, 그건 반자동화다. `mac-report.sh` 같은 운반체가 빠진 자동화는 절반짜리다.

**4. API 가 없는 곳이 자동화의 병목이다**

App Privacy, 관리 게시 설정, Health & Safety — 이런 화면들이 API 를 열지 않는 이유가 있다. 정책 결정이 필요한 화면이기 때문이다. 이 화면들을 어떻게 처리하느냐가 자동화 파이프라인의 수준을 가른다.

---

지금 이 파이프라인은 앱 4개 기준으로 하루 평균 2~3시간의 반복 작업을 없앴다. 완성은 아니다. App Store Review 가이드라인이 바뀌면 Playwright 스크립트도 업데이트해야 한다. Play Console UI 가 바뀌면 selector 를 다시 찾아야 한다.

하지만 그게 소프트웨어의 본질이기도 하다. 완성된 자동화란 없다. **유지 비용이 낮은 자동화** 가 있을 뿐이다.

그리고 4월 29일 새벽 6시 43분의 그 거절 메일 — 그 이후로 한줄일기 iOS 는 1.0 이 승인됐고, Android 는 알파 트랙에 올랐다. 심사 제출 버튼은 아직 사람이 누른다. 하지만 그 버튼 위에 도달하는 데 걸리는 시간이 40분에서 0분이 됐다.

다음 편에서는 Play Console 의 관리 게시 함정과 closed test 14일 보류 사고를, 그리고 그 사이에 태어난 로또번호 계산기 앱 이야기를 쓸 예정이다.

---

*태그: flutter, claude-code, automation, app-store, playwright, night-builder, 1인개발, side-project, cicd*
