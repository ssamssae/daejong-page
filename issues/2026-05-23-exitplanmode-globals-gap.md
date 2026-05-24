# 2026-05-23 — ExitPlanMode 가 글로벌 룰 gap 으로 텔레그램 turn 에서 호출됨

## 증상

본진(🍎)이 텔레그램 turn 안에서 plan mode 진입 후 plan 파일 작성 + `ExitPlanMode` 호출. 형님 폰엔 plan approval UI 가 안 보임 (터미널 UI). 형님 msg23123 "또 터미널에 선택지띄우네 선택지 띄우지 말라니까 텔레그램으로만한다고" + msg23124 "글로벌 룰에 없는거냐". 폰에서 plan 승인 못 하는데 본진 시점에선 자동 승인 처리됨 → 의도 불일치 진행 위험.

## Gap 위치

기존 글로벌 룰 `~/claude-skills/globals/CLAUDE.md` (line 68~72) — "AskUserQuestion 등 터미널 UI 도구 금지" 섹션. 본문에 "그 외 터미널 UI 입력 도구" 라고만 박혀 있어서 본진이 "ExitPlanMode 는 입력 도구 아니라 plan approval 도구" 로 해석 → 룰 적용 제외. "등" 의 외연이 ExitPlanMode 까지 안 확장된 사고.

근거 사고 (직전 동일 카테고리): 🖥 데스크탑 `issues/2026-05-18-askuser-globals-gap.md` (AskUserQuestion 글로벌 룰 미적용). 이번 사고는 같은 카테고리의 ExitPlanMode 변종.

## Fix (forcing function 강화)

`~/claude-skills/globals/CLAUDE.md` line 68~72 섹션 본문 재작성:

- 섹션 제목 = "AskUserQuestion / ExitPlanMode 등 터미널 UI 도구 금지" (ExitPlanMode 명시).
- 본문 = `AskUserQuestion` / `EnterPlanMode` / `ExitPlanMode` / 그 외 입력·승인 도구 호출 금지 (구체 이름 명시).
- "plan 짜기 워크플로우" 신설 — 텔레그램 turn 한정으로 EnterPlanMode 진입 X, 대신 본진이 머릿속·임시 메모로 plan 작성 → 텔레그램 reply 본문에 plan 요약 + "진행할까요?" 자연어로 묻기 → 형님 ack 받고 실행. plan 파일이 필요한 경우만 Write 로 박고 ExitPlanMode 는 호출 X.

본진이 update-config 또는 hook 차원 enforcement 까지는 안 박음 — 룰 본문 명시화 + 같은 카테고리 사고 2건 surface 만으로 forcing function 충분 (애매하면 다음 사고 한 번 더 보고 결정).

## 메타 — 형님 메시지

msg23127 "업데이트 된 후로 하네스 문서를 대충읽는 경향이 짙어진 느낌적인 느낌이드는걸" — 본진 자가 평가도 동의. 룰 본문의 "등" / "기타" / "그 외" 같은 외연 단어 마주칠 때 본진이 "이게 내 케이스에 포함되나" 한 번 더 묻는 습관 필요. 다음 사고 시 추가 forcing function 검토.
