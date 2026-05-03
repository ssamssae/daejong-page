# Plan C: Claude Code + 자동화로 App Store 심사 제출까지 자동화한 이야기

> 작성 날짜: 2026-05-03
> 상태: 발행 완료 (2026-05-03 20:17 KST)
> Substack: https://daejongkang.substack.com/p/plan-c-claude-code-app-store
> 네이버: https://blog.naver.com/ssamssae/224273569613
> 분량: ~2700자

---

1인 Flutter 개발자로 앱을 여러 개 관리하다 보면, 빌드하고 스크린샷 찍고 App Store Connect에 올리는 루틴이 어느 순간 하루 반나절을 먹기 시작한다. "이걸 자동화할 수 없을까?" 라는 생각은 누구나 하지만, 실제로 끝까지 막는 벽들이 있다.

나는 그 벽을 Claude Code + Playwright로 넘었다. 완전하지는 않지만, 실제로 동작하는 자동화 파이프라인이 됐다.

---

## night-builder v2: 멀티 앱 AAB 자동 빌드

야간에 Mac mini가 자동으로 켜져서 4개 앱의 Android AAB를 빌드하고 서명한다. 핵심은 단순하다.

```bash
for app in hanjul wordyo pomodoro hankeup; do
  flutter build appbundle --release
  jarsigner -keystore $KEYSTORE_PATH ...
done
```

문제는 keystore 파일 경로와 환경변수 관리였다. 처음에는 빌드가 조용히 실패했다 — `set -e` 없이 `|| true`로 오류를 삼키는 패턴이 원인이었다. 지금은 각 앱의 빌드 결과를 텔레그램으로 즉시 받는다.

---

## 진짜 막히는 부분: App Store Connect API의 한계

App Store Connect API는 생각보다 많은 것을 못 한다. 단순히 "공식 API가 있으니 자동화 가능하겠지"라고 가정하면 벽에 부딪힌다.

구체적으로 막히는 세 가지다.

**App Privacy 질문지 — API 없음**

앱이 수집하는 데이터 종류를 카테고리별로 체크하는 화면이다. 식별 데이터, 사용 데이터, 진단 데이터 등 수십 개의 체크박스를 앱마다 채워야 한다. App Store Connect API에 이 화면을 처리하는 엔드포인트가 없다. 공식 문서 어디에도 없다. UI에서만 된다.

**App Privacy 질문지를 건너뛰면 심사 제출 자체가 안 된다.** 새 앱을 등록할 때마다 이 화면을 통과해야 다음 단계로 넘어간다.

**가격 책정 — 부분 지원**

Pricing API는 존재한다. 하지만 신규 앱의 최초 가격 설정, 특히 특정 국가별 가격 플랜 지정은 여전히 웹 UI에서만 처리된다. API로 가격을 올리려고 하면 "앱이 아직 설정되지 않았다"는 오류가 나온다. 웹에서 한 번 해줘야 API도 먹힌다.

**Privacy Manifest 업로드 — 방법이 없다**

2024년부터 Apple이 요구하는 `PrivacyInfo.xcprivacy` 파일 관련 설정이다. 빌드에 포함되어 자동으로 처리되는 부분도 있지만, 심사 중 추가 질문이 오면 App Store Connect 웹에서 응답해야 한다. API로 이 응답을 제출하는 방법은 공개되어 있지 않다.

이 세 화면을 자동화하려면 브라우저를 직접 다뤄야 한다.

---

## Playwright로 뚫기 — App Privacy/Pricing 클릭 자동화

Claude Code에 Playwright MCP를 연결하면 브라우저를 직접 제어할 수 있다. App Store Connect의 웹 UI가 Playwright 앞에서는 그냥 HTML이다.

**기본 흐름**

```
browser_navigate → appstoreconnect.apple.com 로그인 세션
browser_snapshot → 현재 페이지 DOM 구조 확인
browser_click → 필요한 버튼/체크박스 클릭
browser_wait_for → 다음 화면 로드 대기
```

로그인은 Safari의 자동 로그인 세션을 그대로 쓴다. Playwright가 Chrome을 새로 뜨게 하면 Apple ID 2단계 인증이 걸린다. Safari가 이미 로그인된 상태면 쿠키를 공유해서 인증 없이 들어가진다.

**App Privacy 체크 흐름**

```javascript
// 앱 페이지 → App Privacy 탭 이동
await page.goto('https://appstoreconnect.apple.com/apps/<APP_ID>/distribution/appprivacy');

// 카테고리별 체크박스 선택
// ref 번호 직접 사용 X — DOM 순서가 바뀌면 취소 버튼을 클릭하게 됨
await page.getByRole('checkbox', { name: /contact info/i }).check();
await page.getByRole('checkbox', { name: /usage data/i }).check();

// 각 카테고리 안에서 세부 항목도 체크
// dialog scope로 범위 제한 — 팝업 안의 버튼과 밖의 버튼 혼동 방지
const dialog = page.getByRole('dialog');
await dialog.getByRole('checkbox', { name: /name/i }).check();
await dialog.getByRole('button', { name: '저장' }).click();
```

한 가지 중요한 교훈: Playwright snapshot의 `[ref=e123]` 번호를 직접 쓰면 오클릭이 난다. DOM 순서 기반이라 취소 버튼이 먼저 나오기도 하기 때문이다. `role + name + dialog scope` 조합으로 바꿨더니 안정됐다.

**Pricing 설정 흐름**

```javascript
// Pricing 탭 이동
await page.goto('https://appstoreconnect.apple.com/apps/<APP_ID>/distribution/pricing');

// 가격 티어 선택 (예: Tier 2 → ₩1,900)
await page.getByRole('combobox', { name: /base country/i }).selectOption('KOR');
await page.getByRole('option', { name: /1,900/i }).click();

// 확인 모달
const confirmModal = page.getByRole('dialog', { name: /가격 설정/i });
await confirmModal.getByRole('button', { name: '확인' }).click();
```

---

## asc-deliver로 IPA/AAB 업로드까지

빌드 → 업로드는 `xcrun altool` (구) 또는 `asc-deliver` 로 자동화한다. 새 방법이 더 안정적이다.

```bash
xcrun altool --upload-package Runner.ipa \
  --type ios --apiKey $ASC_KEY_ID \
  --apiIssuer $ASC_ISSUER_ID
```

업로드가 끝나면 심사 제출 API를 호출하고, 결과를 텔레그램으로 받는다. 업로드부터 심사 제출까지 손을 안 댄다.

---

## 결과와 한계 — 완전 자동화는 아직

실제로 자동화된 것과 아직 수동인 것을 구분해 두는 게 중요하다. 과장하면 다음에 같은 작업을 할 때 다시 실망한다.

**자동화된 것**

- Flutter 빌드 (`flutter build ipa`, `flutter build appbundle`)
- 코드 서명 (`codesign`, `jarsigner`)
- TestFlight / Play 내부 트랙 업로드
- 메타데이터 업데이트 (앱 이름, 설명, 키워드) — fastlane deliver
- 스크린샷 캡처 — iOS 시뮬레이터 + `applesimutils`
- App Privacy 설문 클릭 — Playwright
- Pricing 설정 클릭 — Playwright
- 심사 제출 클릭 — ASC API `PATCH reviewSubmissions`
- 제출 결과 알림 — 텔레그램

**여전히 수동인 것**

- 심사 결과 대응 (리젝 메일 읽기, 사유 분석)
- 리젝 시 앱 코드 수정
- 첫 번째 앱 등록 폼 (App Store Connect에서 "새 앱 만들기" 클릭)
- Play Console 신규 앱 등록 (정책상 API 불가, 웹 UI만)
- Apple ID 2단계 인증 (새 브라우저 세션이면 무조건 수동)

**시간 절약 효과**

앱 하나 기준으로 측정했다. 빌드부터 심사 제출까지 수동으로 하면 45분 이상 걸렸다. 스크린샷 크기 맞추고, 각 언어별 메타데이터 복붙하고, App Privacy 체크박스 하나씩 누르고, 가격 설정하고, 제출 버튼 누르고.

지금은 스크립트 실행 후 자리를 비우면 된다. 5분 내외로 텔레그램에 "심사 대기" 알림이 온다. 앱 4개면 예전에는 3시간 작업이었고, 지금은 커피 한 잔 마시는 동안 끝난다.

---

## 1인 개발자가 재현 가능한 핵심 패턴 3가지

**1. 빌드는 스크립트, 실패는 큰 소리로**
`set -e` + 텔레그램 알림. 조용한 실패가 제일 비싸다.

**2. API가 없는 화면은 Playwright로 잡기**
App Store Connect, Play Console 모두 브라우저 자동화가 닿는다. 단, Google OAuth 차단을 피하려면 stealth 4종(channel, AutomationControlled, IsolateOrigins, enable-automation 제거)을 동시에 써야 한다.

**3. 운반체를 만들어라**
Mac mini(빌드 엔진) → 본진(검토) → WSL(코드 수정)로 결과가 자동으로 흐르게 만들어야 "자동화"다. 사람이 결과를 받아서 다음 기기로 복붙하면 자동화가 아니다.

---

## 어디서부터 시작할까 — 1인 개발자 권고

처음부터 전체 파이프라인을 만들려고 하면 지친다. 단계별로 쌓는 게 현실적이다.

**Step 1: fastlane deliver로 메타데이터 자동화**

가장 시작하기 쉽고 효과가 명확하다. `Deliverfile`에 앱 이름, 설명, 키워드, 스크린샷 경로를 넣고 `fastlane deliver`만 실행하면 된다. App Store Connect 웹에서 언어별로 복붙하던 작업이 사라진다. 여기서만 30분을 아낄 수 있다.

```ruby
# Deliverfile 예시
app_identifier "com.daejongkang.hanjul"
username "your@apple.id"
metadata_path "./metadata"
screenshots_path "./screenshots"
skip_binary_upload true  # 빌드 업로드는 별도로
```

**Step 2: ASC API로 빌드 업로드**

fastlane의 `upload_to_app_store` 또는 `xcrun altool`로 IPA를 TestFlight에 올린다. API 키(`AuthKey_*.p8`)를 발급받고 환경변수로 관리하면 2단계 인증 없이 CI에서도 올릴 수 있다. 이 단계를 마치면 빌드 → 업로드까지 완전 자동이 된다.

**Step 3: Playwright로 나머지 클릭 자동화**

App Privacy, Pricing처럼 API가 없는 화면만 남긴다. Claude Code에 Playwright MCP를 연결하고, 화면 스냅샷을 찍어 어떤 버튼을 눌러야 하는지 Claude에게 물으면 된다. 스크립트를 직접 짜지 않아도, "이 화면에서 App Privacy를 설정해줘"라고 지시하면 Claude가 클릭 흐름을 만든다.

이 세 단계를 순서대로 밟으면, 세 번째 단계를 마칠 때 앱 심사 제출이 명령어 하나로 끝난다.

---

지금 이 파이프라인은 앱 4개 기준으로 하루 평균 2~3시간의 반복 작업을 없앴다. 완성은 아니다 — App Store Review 가이드라인 변경으로 새 화면이 생기면 또 Playwright를 업데이트해야 한다. 하지만 그게 소프트웨어의 본질이기도 하다.

다음 편에서는 Play Console의 관리 게시(Managed Publishing) 함정과, closed test 14일 보류 사고 해결 이야기를 쓸 예정이다.

---

*태그: flutter, claude-code, automation, app-store, playwright, 1인개발, side-project*
