---
prevention_deferred: null
---

# 자격증명 "인프라에 없음" 성급한 negative 단정 — 한 노드만 보고 본진 미확인

- **발생 일자:** 2026-06-07 19:08 KST
- **해결 일자:** 2026-06-07 19:26 KST
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** 5노드 전체 / 자격증명·시크릿 조회 / 보고 단정

## 증상
mini_expense iOS 출시 중 App Privacy 처리에 Apple ID 로그인이 필요했는데, 아니키가 "인프라에 박아놨을걸"이라고 했음에도 맥미니(🏭) 로컬 `~/.claude/secrets/` 만 grep 한 뒤 "Apple ID 비번은 인프라에 박혀있지 않다"고 단정 보고. 실제로는 본진(🍎) `~/.claude/secrets/apple-id.json` 에 apple_id+password 둘 다 존재. 아니키가 "맥북에 물어보면 안되?" 로 정정 → 본진 확인하니 바로 나옴.

## 원인
"시크릿/자격증명 없음" 을 단정하기 전에 본진 포함 전 노드 secrets 를 한 번에 훑는 표준 도구가 없었음. 그래서 현재 노드(맥미니) 로컬만 보고 부분 증거로 negative 단정. secrets 의 SoT 는 본진인데(스킬류가 본진에서 돌아 secret-set 도 ssh mac 으로 본진 저장) 정작 본진을 안 봄. 글로벌룰 "확인 없이 단정 금지"(2026-06-05) 와 [[memory feedback_verify_before_asserting_in_report]] 를 어긴 케이스.

## 조치
- 전 노드 secrets 일괄 검색 도구 `secret-find.sh` 신규 작성 (claude-automations main `8ac7127`). 본진+라이덴+맥미니+데스크탑+노트북 의 `~/.claude/secrets/` 를 한 번에 훑어 파일명·JSON 키 매칭 출력(값은 노출 X). 닿지 않는 노드는 `UNREACHABLE` 로 명시 → reachable 0건일 때만 "없음" 단정 가능하게 강제.
- "apple" 테스트 통과: 본진 apple-id.json(key:apple_id)·apple-id-password.json 정확히 검출 = 실패했던 시나리오 재현 방어 확인.

## 예방 (Forcing function 우선)
"자격증명/시크릿 없음" 을 보고하기 전 `secret-find.sh <키워드>` 를 1회 돌리고, UNREACHABLE 노드가 0개일 때만 "없음" 단정. UNREACHABLE 이 있으면 "N개 노드 미확인" 으로 분리 보고.

- **막을 코드/훅:** `~/claude-automations/scripts/secret-find.sh` (claude-automations main `8ac7127`) — 전 노드 secrets 일괄 검색 + UNREACHABLE 명시로 거짓 negative 차단.

## 재발 이력
<처음 생성 시 비워둠>

## 관련 링크
- 커밋: claude-automations `8ac7127` (secret-find.sh)
- 메모리: [[memory feedback_verify_before_asserting_in_report]] · [[memory feedback_handoff_stale_negative_assertion]] · [[memory feedback_verify_repl_session_before_status_claim]]
- 글로벌룰: CLAUDE.md "확인 없이 단정해서 보고 금지" (2026-06-05)
