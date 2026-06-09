# 2026-05-24 노트북 stop hook 헤더 누락 — reply tool 호출로 이중송신 가드 trigger

**날짜**: 2026-05-24 18:48~19:00 KST (약 12분)
**노드**: 💻 노트북 (root cause) / 🍎 본진 (진단·룰 강화)
**심각도**: low — 본진 1:1 / 그룹 mirror 둘 다 LIVE, 단지 노트북만 "💬 터미널 응답" 헤더 없이 reply 본문이 떠 다른 3 노드와 표준화 깨짐.

---

## 증상

[mac-mini-group-mirror-token-mismatch](2026-05-24-mac-mini-group-mirror-token-mismatch.md) closure 직후 형님 스크린샷 + "표준화가 안되어있네 노트북은 그냥 이모지 하나만 보내는데? 터미널응답이 없고" (msg23688). verify probe 사이클에서 🪟 WSL / 🏭 맥미니 / 🖥 데스크탑 3 노드는 "💬 터미널 응답\n\n<노드이모지>" 표준 형식으로 텔레그램에 mirror 됐는데 💻 노트북만 "<노드이모지>" 단독으로 떠 헤더 누락.

---

## 진단

`~/.claude/hooks/telegram-stop-ping.sh` 코드 양쪽(데스크탑 vs 노트북) diff 결과 **완전 동일** (48 lines 1글자도 다르지 않음). 코드는 깨끗.

차이는 노드 챗봇 행동:
- 정상 3 노드: verify probe 응답으로 터미널에 이모지 1자만 출력 → stop hook fire → `replied=0` → 헤더 prepend 후 텔레그램 sendMessage mirror
- 노트북: verify probe 응답으로 `mcp__plugin_telegram_telegram__reply` tool 직접 호출 → stop hook 의 `replied=$(jq ... | length)` ≥ 1 → "skip: telegram reply already sent this turn" 으로 hook skip → 헤더 prepend 0

→ root cause = **노드 챗봇이 reply tool 호출 → stop hook 이중송신 가드(`replied>0` 체크)에 걸려 헤더 mirror skip**.

원인 추정 = 본진 디렉티브 본문이 "응답 💻 1자만 reply" 라 박혀 있었고 "reply" 단어를 노트북 챗봇만 reply tool 호출 의미로 해석. 다른 3 노드는 자연어 "응답하다" 로 해석.

---

## Fix

3단계:
1. **본진 CLAUDE.md (`~/claude-skills/globals/CLAUDE.md` line 71~74) 룰 강화**: "노드 챗봇은 reply tool 호출 X — 터미널에 이모지 1자만 출력하면 stop hook 이 헤더 mirror. reply 호출 시 가드 trigger → 표준화 깨짐. 디렉티브 본문 표준 wording = '응답 X 1자만 터미널 출력 (reply tool X)'"
2. **노트북 측 메모리 박기**: `feedback_node_verify_no_reply_tool.md` + MEMORY.md 인덱스
3. **검증**: 노트북 단독 verify probe 3차 재발사 → "💬 터미널 응답\n\n💻" 표준 형식으로 텔레그램에 떴는지 형님 스크린샷 확인 → 풀그린

---

## 재발방지

- **본진 디렉티브 본문 표준 wording 의무화**: 앞으로 verify/probe 디렉티브 본문에 "응답 X 1자만 reply" 같은 wording 회피, "응답 X 1자만 터미널 출력 (reply tool X)" 로 작성. globals/CLAUDE.md line 71~74 룰로 박힘.
- **노드 챗봇 측 자율 가드**: 노트북 측 메모리 `feedback_node_verify_no_reply_tool.md` 에 동일 룰 박힘. 새 노드 추가 시 동일 메모리 박기.
- **hook 측 가드 변경 X**: stop hook 의 `replied>0` skip 가드 자체는 정당한 동작 (본진 reply + hook mirror 이중송신 방지). 가드 제거하면 본진 reply 시 메시지 2번 떠 도배. 가드 유지 + 챗봇 행동 정렬이 정답.

---

## 시간 분석

- 진단 12분: hook 코드 diff (5분) + 챗봇 행동 차이 추론 (3분) + 본진 CLAUDE.md 룰 강화 + 노트북 디렉티브 발사 (3분) + 검증 (1분).
- 짜증 지수 (형님 입장): 직전 mac-mini-group-mirror-token-mismatch closure 직후라 "또 표준화 깨짐" 의 누적 짜증.

---

## 관련 메모리 / 이슈

- 직전 사이클: [mac-mini-group-mirror-token-mismatch](2026-05-24-mac-mini-group-mirror-token-mismatch.md) — 같은 양방향 검증 사이클의 다른 root cause
- 새 메모리: `feedback_node_verify_no_reply_tool.md` (노트북 측 박음)
- 본진 CLAUDE.md 룰 강화: `~/claude-skills/globals/CLAUDE.md` line 71~74
