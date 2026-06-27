# 네이버 SmartEditor 본문 paste 무한 재시도 → 본진 55분 frozen·토큰 폭주

- **일시**: 2026-06-07 ~14:00 KST 전후 (발견·복구 14:52~14:59 KST)
- **노드**: 🍎 본진 (피해, naver 발행 중) / 🪟 라이덴 (진단·복구·수정 주체)
- **증상**: 본진 claude 세션이 단일 턴 하나에 `Fermenting 55m · ↓104.6k tokens` 로 갇힘. 아니키 텔레그램 메시지 5건(/worklog, "바시 커맨드 브이", "시리 호출…", "되냐이제", "왜 멈췄냐")이 큐에만 적체되고 미처리 → "맥북본진 답변이 안 와".

## 근본 원인

네이버 발행(naver-blog-publish §5 본문 입력)의 paste 경로는 **스크립트 루프가 아니라 모델이 SKILL.md 절차를 MCP 로 수동 실행**한다: NSPasteboard set → snapshot → browser_click(OS-level) → osascript Cmd+V. 이 경로는 **Mac frontmost = Playwright Chromium** 이어야만 OS-level Cmd+V 가 SmartEditor 에 전달된다(SMARTEDITOR.md §본문 입력 기존 명시).

- 아니키가 시리를 호출해 frontmost(포커스)가 Chromium 에서 다른 창으로 탈취됨("시리 호출해서 다른데 커서가 들어갔었음").
- → Cmd+V 가 엉뚱한 창에 가 본문 paste 0자.
- → SKILL.md 에 **"N회 실패 시 abort" 가드가 없어**, 모델이 새 paste 방법을 **무한 즉흥 재시도**(ClipboardEvent+DataTransfer 합성, clipboard API dispatch 등 — capture-pane 으로 확인). 55분·104k 토큰 소모.
- frontmost 탈취 후 **자동 복구/검증 단계도 없었음**(activate 만 하고 frontmost 됐는지 확인 안 함).

기존 SMARTEDITOR.md §검증 폴백이 `browser_press_key("ControlOrMeta+v")` 를 권했는데, **같은 문서가 그 방법은 SmartEditor 가상입력을 우회해 무효라고 명시** — 모순 폴백이 즉흥 재시도를 부추긴 면도 있음.

## 영향

- 본진 55분 무응답 + Anthropic 토큰 104k 낭비 (단일 턴).
- 아니키 메시지 5건 + 🪟 라이덴이 보낸 mac-report 2건 큐 적체.
- 데이터 손실 없음(발행 미완 상태로 멈춤일 뿐). 본진 프로세스·heartbeat 는 alive.

## 복구

🪟 라이덴이 `ssh mac` + `/opt/homebrew/bin/tmux capture-pane -t claude` 로 frozen 아닌 busy 임을 실측 → 아니키 go(ㄱ) → `tmux send-keys -t claude Escape` 1회로 멈춘 턴 Interrupted → 새 턴 라이브(thinking) 로 큐 처리 재개 확인. (frozen 아니라 busy 였으므로 세션 kill 불요.)

## 수정 (PR wsl/2026-06-08-naver-paste-loop-guard)

forcing-function 가드 3종 (DO NOT REMOVE 마커 + 본 issue 참조):
1. **SKILL.md §5** — paste 하드 가드: ① frontmost 선행 확인(activate + frontmost 검증) ② 정해진 경로(pb_set→snapshot→browser_click→key code 9 Cmd+V)로만 최대 2회 ③ 2회 실패=즉시 abort+텔레그램 보고. 즉흥 paste(ClipboardEvent/DataTransfer/clipboard API) **금지**.
2. **SMARTEDITOR.md §OS-level Cmd+V** — activate 후 `frontmost = Google Chrome` 검증 bash 가드(아니면 1회 재activate) + delay 0.6.
3. **SMARTEDITOR.md §검증** — 0자 시 모순 폴백(press_key v) 제거, bounded 2회 재시도→abort 규칙으로 교체.

## 후속 (이 PR 밖)

- 더 견고하게 하려면 paste 단계를 deterministic 헬퍼 스크립트로 빼고 frontmost-guard+글자수 검증+재시도 카운트를 코드로 강제(모델 자율 재시도 의존 제거). 별 task 후보.
- frontmost 탈취는 아니키 시리/수동 조작 시 재발 가능 → 자동 발행은 아니키 비활동 시간대 권장(기존 §주의 보강).
