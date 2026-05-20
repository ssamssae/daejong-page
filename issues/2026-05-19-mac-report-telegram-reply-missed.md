# 2026-05-19 mac-report paste 받은 turn 에 형님 폰 텔레그램 reply 누락

## 발생 시각
2026-05-19 22:1x KST (mac-mini 1.0.7+25 build PASS 보고 도착 직후 본진 첫 응답 turn)

## 노드
🍎 Mac 본진 (지휘관 챗봇, hostname USERui-MacBookPro 류)

## 증상
- 본진 tmux 'claude' 세션이 mac-mini 가 송신한 `[Mac report title: 메모요 1.0.7+25 release 빌드 완료 ...]` paste 를 받음
- 본진 챗봇이 (1차) 보고 처리 + (1.5차) reverse reply 만 보내고 종료
- 형님 폰 텔레그램에는 침묵 — 폰에서 결과 기다리던 형님이 "(a) Play Internal 가자 근데 위에 선택지 텔레그램으로 안왔는데 버그야?" 물어볼 때까지 챗봇 모름
- 직전 turn 의 Play Internal/TestFlight 선택지 (a/b/c/d) 도 terminal stdout 에만 있고 폰에 도달 0

## 1차 분석 (왜 빼먹었나)

### 메커니즘
1. `/clear` 후 SessionStart hook 으로 핸드오프 context 들어옴 + mac-mini 가 mac-report.sh 로 본진 tmux paste 송신
2. 본진 챗봇 입장에서 그 paste 메시지는 **`<channel source="plugin:telegram:telegram">` 태그가 없는** 일반 텍스트 input
3. Stop hook `telegram-reply-check.sh` 는 텔레그램 inbound 가 있을 때만 reply 강제 → 본 케이스는 trigger 안 됨 (정상 동작)
4. Stop hook `mac-report-reverse-reply-check.sh` 는 1.5차 reverse reply 누락만 catch → reverse reply 만 보냄
5. 본진 챗봇은 "형님이 폰에서 결과 기다린다" 의식 안 하고 terminal stdout 출력으로 충분하다고 판단
6. 결과: 폰 침묵, 형님이 "버그야?" 박아야 챗봇이 인지

### 근본 원인
**cross-device mac-report paste 처리 시 형님 폰 텔레그램 reply 동행 의무가 룰에 명문화 안 되어있음**. CLAUDE.md mac-report 3-channel 모델은 (1차) + (1.5차) + (2차 강대종 Telegram) 으로 명시되어 있었지만, (2차) 강제하는 forcing function (Stop hook) 이 없었음. `telegram-reply-check.sh` 는 telegram inbound 전제로만 동작하는 게 사각지대.

## 재발방지

### (1) 메모리 룰 신설 (즉시 발효)
`~/.claude/projects/-Users-user/memory/feedback_telegram_reply_with_mac_report.md`:
- mac-report paste (`[Mac report title:` 시작) 받은 turn 에 형님 폰 텔레그램 reply 1통 동행 디폴트
- channel 태그 없어도 ON
- MEMORY.md 인덱스에 한 줄 등재

### (2) Stop hook 신설 (forcing function, 2026-05-19 박음)
`~/.claude/hooks/mac-report-telegram-reply-check.sh`:
- mac-report-reverse-reply-check.sh 와 동일 패턴
- transcript 에서 마지막 `[Mac report title:` paste 의 timestamp 추출
- 그 시점 이후 assistant turn 에서 `mcp__plugin_telegram_telegram__reply` 호출 카운트
- 0 이면 block + reason 문구로 즉시 reply 송신 유도
- ~/.claude/settings.json Stop hooks 섹션에 mac-report-reverse-reply-check.sh 옆에 등록

### (3) 5노드 공통 룰 승격 (향후 검토)
WSL/desktop3060ti/notebook3060/mac-mini 도 mac-report 형식 paste 를 받는 일이 종종 있음 (각 노드 챗봇이 다른 노드에서 보고 받는 케이스). hook 자체는 본진 (Mac) 의 sync 채널이라 ~/claude-skills/hooks/ 통합 위치로 옮기고 5노드 fan-out 가능. 별 사이클에서 형님 ack 후 진행.

## 검증
- 메모리 박은 후 같은 turn 에 mac-mini 가 두 번째 mac-report (Play Internal 업로드 PUBLISHED) 송신 → 본진이 (1차) 처리 + (1.5차) reverse reply + (2차) 텔레그램 reply 셋 다 fire 완료. 룰 즉시 효과.
- Stop hook 강제 검증은 다음 mac-report paste 까지 대기 — 만약 챗봇이 reply 누락하면 block 시도되어야 함.

## 관련
- 메모리 [[feedback_telegram_reply_with_mac_report]]
- 메모리 [[feedback_telegram_reply_tool_mandatory]] — 텔레그램 inbound 일 때 reply 강제 (본 룰의 형제)
- 이슈 issues/2026-05-13-mac-report-reverse-reply-missed.md — 1.5차 reverse reply 누락 사고 (본 룰의 짝)
- CLAUDE.md "WSL → Mac — 운반체 mac-report.sh" 섹션
- Hook 파일 ~/.claude/hooks/mac-report-telegram-reply-check.sh
- Settings ~/.claude/settings.json Stop hooks 섹션
