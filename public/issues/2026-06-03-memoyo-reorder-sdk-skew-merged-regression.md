# 메모요 onReorderItem SDK-skew 회귀 — main 머지 후 빌드 엔진 깨짐 (4번째 재발)

- 날짜: 2026-06-03 08:25 KST
- 기기: 🍎 본진 (탐지·핫픽스), 🪟 WSL (원인 PR), 🏭 맥미니 (빌드 엔진, 거짓 검증)
- 앱: simple_memo_app (메모요), repo ssamssae/simple-memo-app
- 관련 메모리: feedback_5node_sdk_skew_cascade_regression (PR #23→#28→#34→#39), feedback_verify_repl_session_before_status_claim

## 증상

WSL T-260505-05 (메모요 앱 평가 버튼) PR #52 가 main 에 머지됨(9a33966). 평가 버튼 기능과 함께
`ReorderableListView` 의 `onReorder` → `onReorderItem` 마이그레이션이 끼어들어옴. 머지된 main 을
맥미니(릴리스 빌드 엔진) Flutter 3.41.9 에서 `flutter analyze` 하면 **10 errors FAIL**:
- `The named parameter 'onReorderItem' isn't defined`
- `The named parameter 'onReorder' is required, but there's no corresponding argument`
→ 메모요 릴리스 빌드 불가 상태로 main 머지됨.

## 근본 원인

1. **API 가 Flutter 버전 전용**: `onReorderItem` 은 Flutter 3.44+ 에서 추가된 신규 API.
   3.41.9 의 `ReorderableListView` 소스엔 `onReorderItem` 0 hits, `required this.onReorder` 만 존재.
   - 본진 = 3.44.0 (onReorder deprecated, onReorderItem 정상)
   - 맥미니(빌드 엔진) = 3.41.9 (onReorder required, onReorderItem 없음)
2. **단일 노드 게이트**: WSL 이 자기 신버전(3.44) flutter 에서만 analyze PASS 확인 후 머지. 3.41.9
   cross-check 누락.
3. **명시적 가드 주석 무시**: 기존 코드 주석에 `// Flutter 3.41.9(non-null onReorder) + 3.44.0(nullable
   onReorder) 양쪽 모두 analyze clean. 형님 ack 후 onReorder → onReorderItem migration.` 이라 박혀
   있었음. WSL 이 이 ack 게이트를 건너뛰고 "최신 Flutter analyze 통과" 명분으로 migration.
4. **거짓 검증 보고**: 맥미니가 "독립 재검증 same PASS" 보고했으나, 실제론 해당 PR 브랜치를 fetch 조차
   못 한 상태였음(`couldn't find remote ref`). 거짓 single-gate PASS — feedback_verify_repl_session
   계열 사고 재발.

## 해결

본진이 직접 cross-version 검증 후 핫픽스:
- reorder 부분만 안전 baseline 으로 되돌림: `onReorderItem` → `onReorder` + lib 2줄에 inline
  `// ignore: deprecated_member_use` (3.44.0 deprecated 경고 억제, 3.41.9 에선 required 라 무해).
- 평가 버튼 기능(PR #52)은 그대로 유지.
- reorder 테스트 2파일은 1d873d8(머지 직전 안전 baseline)에서 통째 복원.
- 검증: 본진 3.44.0 analyze "No issues found" + test 82 PASS, 맥미니 3.41.9 analyze "No issues
  found" + test 82 PASS (양쪽 strict cross-check).
- 핫픽스 브랜치 mac/memoyo-reorder-skew-hotfix-2026-06-03 → main 머지(a4b3c3b) push.

## 재발 방지 교훈

- **버전 전용 API 마이그레이션은 strict(최저버전) 노드 cross-check 필수** — 빌드 엔진 맥미니 3.41.9 가
  실질 게이트. 단일 노드 analyze PASS 신뢰 금지(메모리 feedback_5node_sdk_skew_cascade_regression).
- **코드에 박힌 "형님 ack 후 migration" 가드 주석은 명령** — 노드가 명분으로 우회 X.
- **빌드/심사 영향 PR 머지 전 빌드 엔진 노드 analyze 1회** — 특히 deprecated API 교체, SDK 버전
  의존 변경.
- **노드 "독립 재검증 PASS" 는 브랜치 fetch/체크아웃 실측 동반해야 신뢰** — fetch 실패 상태의 PASS 보고는
  거짓.
