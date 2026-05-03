# [초안] Plan C: Claude Code + 자동화로 App Store 심사 제출까지 자동화한 이야기

> 작성 날짜: 2026-05-03
> 상태: 초안 (미발행 — Substack/네이버 발행 전 검토 필요)
> 분량: ~1100자

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

App Store Connect API는 생각보다 많은 것을 못 한다.

- **App Privacy 질문지**: UI 전용, API 없음
- **가격 책정**: Pricing API가 있지만 신규 앱 최초 설정은 여전히 UI 필요
- **Health & Safety 카테고리**: 특정 앱 유형 전용 화면, API 없음

이 세 화면을 자동화하려면 브라우저를 직접 다뤄야 한다.

---

## Playwright로 브라우저 클릭 자동화

App Store Connect에서 이 화면들은 매번 수동으로 채워야 했다. Claude Code의 Playwright MCP를 붙이니 달라졌다.

```javascript
// App Privacy 체크박스 자동 클릭
await page.getByRole('checkbox', { name: /Third-party advertising/i }).check();
// 저장 버튼 — ref 직접 X, role+name으로
await page.getByRole('button', { name: '저장' }).click();
```

한 가지 배운 교훈: Playwright snapshot의 `[ref=e123]` 번호를 직접 쓰면 오클릭이 난다. DOM 순서 기반이라 취소 버튼이 먼저 나오기도 하기 때문이다. `role + name + dialog scope` 조합으로 바꿨더니 안정됐다.

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

## 1인 개발자가 재현 가능한 핵심 패턴 3가지

**1. 빌드는 스크립트, 실패는 큰 소리로**
`set -e` + 텔레그램 알림. 조용한 실패가 제일 비싸다.

**2. API가 없는 화면은 Playwright로 잡기**
App Store Connect, Play Console 모두 브라우저 자동화가 닿는다. 단, Google OAuth 차단을 피하려면 stealth 4종(channel, AutomationControlled, IsolateOrigins, enable-automation 제거)을 동시에 써야 한다.

**3. 운반체를 만들어라**
Mac mini(빌드 엔진) → 본진(검토) → WSL(코드 수정)로 결과가 자동으로 흐르게 만들어야 "자동화"다. 사람이 결과를 받아서 다음 기기로 복붙하면 자동화가 아니다.

---

지금 이 파이프라인은 앱 4개 기준으로 하루 평균 2~3시간의 반복 작업을 없앴다. 완성은 아니다 — App Store Review 가이드라인 변경으로 새 화면이 생기면 또 Playwright를 업데이트해야 한다. 하지만 그게 소프트웨어의 본질이기도 하다.

다음 편에서는 Play Console의 관리 게시(Managed Publishing) 함정과, closed test 14일 보류 사고 해결 이야기를 쓸 예정이다.

---

*태그: flutter, claude-code, automation, app-store, playwright, 1인개발, side-project*
