# 2026-05-31 텔레그램 이중송신 #2 — reply 깜빡 turn 의 stop-ping 미러 + reply-check 강제 재발송

## 발생 시각
2026-05-31 ~10:20 KST (아니키 "또 두번 발사됨 이거 재발빈도 높음" msg 28895, 스크린샷 동일 메시지 2통)

## 노드
🍎 Mac 본진 (telegram-stop-ping.sh + telegram-reply-check.sh 둘 다 활성)

## 증상
본진이 텔레그램 답변을 reply 툴로 안 보내고 터미널 텍스트로만 출력한 turn에서, 같은 답변이 형 폰에 2통 — (1) "💬 터미널 응답" 헤더 붙은 stop-ping 미러본 + (2) 직후 reply 툴로 보낸 본문. 재발 빈도 높음(아니키 지적).

## 근본 원인 (직전 #1 flush-race 와 별개)
reply 툴 미호출 turn 에서 두 Stop 훅이 충돌:
1. `telegram-stop-ping.sh`: `replied`(이번 turn reply 툴 호출 수)==0 → 터미널 마지막 텍스트를 봇 챗에 미러(=발사 #1).
2. `telegram-reply-check.sh`: reply==0 → block → 본진이 강제로 reply 툴 재발송(=발사 #2).
→ 결과 2통.

2026-05-31 #1 fix(claude-automations 30e11e0)는 **replied>0 인데 flush 지연으로 0 으로 보이던 race**를 잡은 것 — 본 건은 **replied 가 진짜 0(reply 깜빡)인 케이스**라 #1 fix 로 안 잡힘. 과거 stop-ping 에 telegram-origin 가드가 있었으나 "reply-tool check 로 대체"하며 제거된 게 회귀 원인(replied==0 케이스 미커버).

## 조치 (fix #2, LIVE)
`telegram-stop-ping.sh`: 마지막 user 가 텔레그램 `<channel source=plugin:telegram:telegram>` origin 이고 이 host 에 `telegram-reply-check.sh` 가 존재하면 stop-ping skip. reply-check 가 canonical reply 를 강제하므로 stop-ping 미러는 무조건 중복. reply-check 없는 host(노드)는 fallback 으로 계속 미러(유실 방지). 비텔레그램 turn(슬래시 등)도 미러 유지.
- bash -n PASS. 시뮬: telegram-origin→skip / 비telegram(slash)→mirror / reply-check 존재 확인. claude-automations commit.

## 더 깊은 원인 (본진 행동)
reply 툴 호출을 깜빡하는 것 자체가 트리거. hook fix 는 깜빡해도 이중송신은 막는 forcing function. 텔레그램 origin turn 은 항상 reply 툴 경유가 hard rule([[feedback_telegram_reply_tool_mandatory]]).

## 관련
- 이슈 (#1 flush-race) tasks.md T-260531-04 :: progress (claude-automations 30e11e0)
- 코드 ~/.claude/automations/hooks/telegram-stop-ping.sh (claude-automations 심링크 SoT)
- [[feedback_telegram_reply_tool_mandatory]]
