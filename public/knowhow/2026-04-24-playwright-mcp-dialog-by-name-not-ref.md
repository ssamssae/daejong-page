---
category: 자동화
tags: [playwright, mcp, dialog, asc, role, getByRole, ref]
related_issues:
  - 2026-04-24-playwright-mcp-content-rights-dialog-misclick
---

# Playwright MCP 다이얼로그 확정 버튼은 ref 직접 X, role+name+dialog scope 우선

- **첫 발견:** 2026-04-24 (App Store Connect 콘텐츠 권한 다이얼로그 "완료" 오클릭 → "취소" 눌러 저장 무효)
- **재사용 영역:** Playwright MCP 로 다이얼로그/모달 자동화하는 모든 흐름 — App Store Connect, Play Console, Substack, 네이버 블로그, Google OAuth dialog, 일반 form modal.

## 한 줄 요약

Playwright snapshot 의 `[ref=eXXX]` 번호는 DOM 순서 기반이라 **"먼저 나오는 게 긍정 버튼" 같은 직관 규칙이 깨진다.** 다이얼로그에 "취소"/"완료" 같은 쌍 확정 버튼이 있으면 ref 번호 직접 클릭은 오클릭의 직접 원인. **반드시 role-based selector + name 매칭 + dialog scope 안에서 찾도록** 박는다.

## 패턴 코드

```js
// ❌ ref 번호 직접 (snapshot 보고 무의식 매핑 → 오클릭)
await page.locator('[ref=e459]').click();   // 의도 "완료", 실제 "취소"

// ✅ role + name (텍스트 매칭, ref 무관)
await page.getByRole('button', { name: '완료' }).click();

// ✅✅ dialog scope 안에서 찾기 (페이지에 같은 name 버튼 여러 개일 때)
await page
  .getByRole('dialog')
  .getByRole('button', { name: '완료' })
  .click();

// ✅✅ heading 으로 다이얼로그 식별 (제목으로 찾기)
await page
  .getByLabel('콘텐츠 권한')
  .getByRole('button', { name: '완료' })
  .click();
```

## 핵심 룰

1. **ref 번호 직접 지정은 모호한 selector 일 때만 최후 수단** — 같은 name 버튼이 페이지에 여러 개거나 DOM 구조 복잡할 때.
2. **다이얼로그 닫은 뒤 snapshot 재확인** — 다이얼로그가 예상과 다르게 닫혔거나 저장 안 됐는지 페이지 주요 필드 값으로 한 줄 검증.
3. **App Store Connect 류 자동화는 atomic 헬퍼로 감싼다** — "라디오 선택 + 완료 확정 + 저장 verify" 를 한 함수로 묶고 내부에서만 ref 다룸.
4. **확정 버튼 클릭 후 페이지 레벨 저장 한 번 더** — 다이얼로그 닫혀도 페이지 외부 form 이 dirty 상태일 수 있음. ASC 는 특히 "다이얼로그 저장 + 페이지 저장" 두 단계 필수.

## 적용 후보

- `/submit-app` 스킬 (App Store Connect / Play Console 폼 자동화)
- `/create-play-app` 스킬 (Play 앱 만들기 폼)
- `/naver-publish` 스킬 (SmartEditor ONE 발행 모달)
- newsletter-publish (Substack 발행 dialog)
- 모든 신규 Playwright MCP 자동화 코드

## Forcing Function

- Playwright MCP 자동화 review 시 `[ref=` 직접 클릭 라인 grep — atomic 헬퍼 외 사용은 reject.
- App Store Connect 자동화 헬퍼 라이브러리 (`asc-helpers.js` 등) 에 "다이얼로그 라디오 + 완료" atomic 함수 표준화.
- 1회성 자동화 스크립트도 `getByRole({ name })` 패턴을 디폴트로 박기.

## 함정

- 다국어 페이지에서 `name: '완료'` 가 영어 페이지면 `'Done'` 으로 바뀜. 환경별 분기 또는 i18n key 매핑 필요.
- disabled 상태 버튼은 snapshot 에 ref 가 없을 수 있음 — 활성화 대기 (`waitFor({ state: 'visible' })`) 후 클릭.
- ref 번호는 같은 페이지 안에서도 snapshot 호출마다 바뀔 수 있음 — 호출 사이에 변동 가능 가정.

## 관련 이슈 (포스트모템)

- `issues/2026-04-24-playwright-mcp-content-rights-dialog-misclick.md` (이전됨)
