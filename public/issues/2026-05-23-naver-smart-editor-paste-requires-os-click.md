# 네이버 SmartEditor 본문 paste 가 진짜 OS-level click 1회를 요구

**날짜**: 2026-05-23 21:50~22:00 KST
**발생 노드**: 🍎 본진 (Ep12 네이버 발행 자동화 중)
**스킬**: `naver-blog-publish` v1
**상태**: ✅ 해결 (SKILL.md §5-2 절차 정정 + 검증 PASS 기록 추가)

## 증상

`/newsletter-publish 12` 흐름의 §4 네이버 발행 단계에서 본문 paste 가 0자 전달. SmartEditor ONE 의 본문 영역에 정정본 1766자를 paste 하려는데 placeholder paragraph ("글감과 함께 나의 일상을 기록해보세요!") 가 그대로 남고 1자도 안 들어감.

본진 환경 자체는 paste 준비 완료 상태 — `document.hasFocus()=true`, `activeElement=IFRAME`, iframe `innerFocus=true`, frontmost = "Google Chrome", clipboard 에 HTML+plain 둘 다 set 확인. 그런데도 SmartEditor 가 paste 를 안 받음.

## 잘못된 진단 흐름 (본진 30분 stuck)

1. SKILL.md §5-2 의 evaluate 안 `para.click()` 으로 placeholder paragraph 를 클릭 + `range.selectNodeContents(para).collapse(false)` 로 caret 끝 위치 set. → DOM `.click()` 호출. 표면적으로 PASS.
2. osascript `tell app "Google Chrome" to activate` + `keystroke "v" using command down` → SmartEditor 본문 변화 0.
3. Playwright `browser_press_key('ControlOrMeta+v')` synthetic Cmd+V → 변화 0.
4. osascript 의 `set index of (first window whose title contains "강대종") to 1` 추가로 정확한 window 선택 강화 → 변화 0.
5. Chrome multi-window 의심 → 확인하니 강대종 블로그 window 1개만, frontmost OK. 변화 0.
6. SmartEditor ONE 의 paste handler 가 2026-05-01 검증 시점 이후 업데이트로 깨졌을 가능성으로 가설 전환, 형님께 surface ("(a) 맥미니 위임 시도 (b) 스킬 디버깅 별 사이클").

## 형님 진단 (정답)

> "잘만되는데 본문 클릭 한번 하고 복붙을 하라고" (msg23040)

**즉 evaluate 안 DOM `para.click()` 만으론 SmartEditor 가 caret 위치 잡았다고 인식하지 않는다.** 진짜 OS-level click 이 본문 element 에 한 번 박혀야 SmartEditor 의 paste handler 가 활성화된다.

수정:
- Playwright `browser_click(target=ref)` 로 본문 placeholder paragraph element (snapshot 의 ref) 클릭. iframe 안 element 라도 Playwright 가 자동으로 frame chain 처리.
- 그 직후 osascript `keystroke "v" using command down` → 1766자 paste 한 번에 PASS.

## 추가 발견 (별 회귀)

임시저장 팝업 "작성 중인 글이 있습니다." 가 떠있을 때 SKILL.md §3 의 evaluate selector `[class*="layer_popup"], [class*="modal"]` 가 못 잡음. 실제 class = `se-popup-button*`. 본진의 layers=[] 결과를 보고 "팝업 없다" 라고 오판 → paste 시도 → SmartEditor 가 팝업 밑에 가려 paste 차단. 형님이 screenshot 보고 "팝업 떠있다" 알려준 후 발견.

대안 selector — 모든 visible button 중 텍스트가 "취소" 또는 "확인" 인 것 매치. 이번 사이클은 형님이 "취소든 확인이든 눌러" 라고 GO 줘서 cancel 클릭으로 새로 쓰기 진입.

## 교훈

1. **SmartEditor 같은 가상 입력 시스템은 OS-level click 을 요구한다** — DOM `.click()` 은 caret 만 위치, paste handler 는 활성화되지 않는다. SKILL.md 의 evaluate 절차에 "이후 반드시 browser_click 으로 OS-level 진짜 클릭 1회" 명시 필수.
2. **검증 안 되는 게이트는 false negative 일 가능성** — `[class*="modal"]` 같은 generic selector 가 빈 응답을 줘도 "팝업 없다" 단정 X. 시각 검증 (screenshot) 또는 다른 axis (button 텍스트 매치) 로 교차 확인.
3. **본진의 self-diagnosis 가 30분+ 헛돌 때 → 형님에게 빨리 SoS 보내는 게 답**. 본진은 osascript / Playwright / Chrome focus 셋 다 의심하면서 헤매고 있었고, 형님은 1초 만에 "본문 클릭 한번 하고 복붙" 정답 진단. 이 패턴 (사용자가 실제로 본문 클릭 → 복붙 절차를 일상에서 하면 알 수밖에 없는 것) 은 본진이 retrospect 으로 추론하기 매우 어려움.

## 후속

- ✅ `naver-blog-publish/SKILL.md` §5-2 본문 paste 절차에 "browser_click OS-level 1회 필수" 강조 박스 박음.
- ✅ 검증 PASS 기록에 2026-05-23 Ep12 사례 + 임시저장 팝업 selector 한계 정정 사항 추가.
- 후속 todos.md 별 사이클: §3 임시저장 팝업 selector fix (button 텍스트 매치로 robust 화).
- 후속: insta-post / submit-app 등 다른 본진 한정 자동화 스킬도 SmartEditor 류 가상 입력 시스템 사용 시 같은 함정 가능 → 점검.

## 관련 사고/메모리

- `reference_substack_publish_pipeline.md` — Substack tiptap 은 Playwright synthetic Cmd+V OK. SmartEditor 와 다름.
- 2026-05-01 naver-blog-publish v1 검증 PASS — 그 시점은 작동했음. SmartEditor 업데이트 가설은 폐기 (form 형님 진단으로 발견된 진짜 원인 = "본문 클릭 1회 필수" 가 그 시점에도 있었을 가능성 — 메커니즘 미세 차이로 우연 통과했을 수도).
