---
prevention_deferred: "claude-telegram-bridge 가 비-텔레그램-origin turn(노드발 directive/작업)의 최종 답변도 flow-mirror 채널로 1장 미러하도록 — 진단만 완료, 코드 fix 미구현"
---

# claude-telegram-bridge 작업흐름 카드는 뜨는데 최종 보고가 노드 챗에 누락 — "마지막 보고 빼먹냐"

- **발생 일자:** 2026-06-27 ~19:25 KST (본진→맥미니 CF 토큰 수색 directive 처리 중)
- **해결 일자:** 미해결 (진단 완료, fix deferred)
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** 본진→노드 directive 등 **비-텔레그램-origin turn** 으로 들어온 작업의 최종 보고 → 노드 봇챗(아니키 관전 창)

## 증상
맥미니가 본진 directive(CF 토큰 권한 수색)를 처리하는 동안, 맥미니 봇챗에 `⚙️ 작업 흐름` 카드(도구 호출 단계: Inventory → Verify → ... → Send via mac-report)는 단계별로 다 떴다. 그런데 정작 그 **최종 보고 내용**("맥미니에도 CF 권한 토큰 없음")은 같은 챗에 안 떴다. 아니키: "왜 작업흐름 나오다가 마지막 보고는 빼먹냐."

## 원인
claude-telegram-bridge 에 미러가 두 갈래로 따로 돈다. `⚙️ 작업 흐름`(flow mirror)은 origin 을 안 가리고 도구 호출 단계마다 실시간 미러한다(노드발 작업도 보이게 하려는 의도). 반면 **최종 답변 미러는 그 turn 에 active nonce(=텔레그램에서 시작된 turn)가 있어야** 발동한다. CF 수색은 본진→맥미니 directive 라 비-텔레그램-origin → active nonce 없음 → final answer 미러 skip. 실제 보고는 `mac-report.sh` 로 본진 봇챗 + Mesh 그룹엔 정상 전송됐지만, 아니키가 보던 맥미니 봇챗엔 누락됐다.

## 조치
당일은 bridge 코드(`scripts/claude-telegram-bridge.py`)의 미러 게이팅을 읽어 원인 진단 후 아니키에게 설명. 보고 내용 자체는 mac-report 로 본진/그룹엔 도달돼 있었다. 코드 fix 는 deferred.

## 예방 (Forcing function 우선)
**prevention_deferred** — flow mirror 가 켜진 상태에서 노드발/비-텔레그램-origin turn 의 **최종 답변도 1장 미러**하도록 bridge 를 보강한다(중간 도구 단계만 보이고 결론이 사라지는 사각 제거). 같은 계열의 보고 경로 사각이 반복되고 있다.

- **막을 코드/훅:** `scripts/claude-telegram-bridge.py` final-answer 미러 게이트에 flow-mirror-on + non-telegram-origin 분기 추가 (미구현)

## 재발 이력
<처음 생성 — 비움>

## 관련 링크
- 같은 계열: `2026-06-26-node-report-missed-trigger-chat.md` (노드 보고가 트리거 챗에 누락), background turn 보고 미러 누락 메모리(`feedback_telegram_background_turn_not_mirrored`)
- 토글: flow mirror = `~/.choso/claude-bridge-flow-mirror.on`
