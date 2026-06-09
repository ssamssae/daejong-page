---
category: 자동화
tags: [telegram, bot, api, msg-id, ux, debug]
related_issues:
  - 2026-04-27-telegram-msg-id-leak
---

# 텔레그램 Bot API raw msg ID 는 사용자 폰에 안 보인다

- **첫 발견:** 2026-04-27 (디버깅 중 "id 7930" 인용 → "7930이 누군데" 사용자 지적)
- **재사용 영역:** 텔레그램 reply 워크플로우 전체 — 메시지 전달 확인, 디버깅 보고, 재전송 안내 등 모든 케이스.

## 한 줄 요약

`mcp__plugin_telegram_telegram__reply` 가 반환하는 `sent (id: NNNN)` 은 **Bot API 내부 message_id** 다. 사용자 폰 텔레그램 UI 에는 이 ID 가 노출되지 않는다. "id 7930 받으셨어요?" 는 사용자에게 의미 없는 정보다. **메시지를 특정할 때는 발송 시각(KST) + 메시지 키워드** 로 가리켜라.

## 원인

Bot API `sendMessage` 응답에는 `message_id` 필드가 있어 개발 컨텍스트에 살아 있는다. 디버깅 중 이 ID 를 답장 텍스트에 그대로 쓰면 사용자 폰 UI 에는 의미 없는 숫자가 보인다. 텔레그램 클라이언트는 raw message_id 를 end-user 에게 노출하지 않는다.

## 올바른 특정 방법

| 상황 | 잘못된 표현 | 올바른 표현 |
|---|---|---|
| 이전 메시지 참조 | "id 7930 받으셨어요?" | "17:30 KST 에 보낸 요약본 받으셨어요?" |
| 재전송 안내 | "id 7932 로 다시 보냈어요" | "방금 17:35 KST 에 다시 보냈어요" |
| 디버깅 | "id 7930 이 실패한 것 같아요" | "15:30 KST 에 보낸 review_radar 요약이 안 갔나요?" |

## 자가 체크

답장 텍스트 작성 시:

- `(id: \d+)` 또는 `id \d{4,6}` 패턴이 있는가? → 있으면 시각+키워드로 교체
- fenced block 안의 ID 는 제외 (코드 예시용)

## 함정

- `reply_to` 파라미터로 이전 메시지를 thread 로 달면 사용자가 맥락을 볼 수 있어 raw ID 인용보다 낫다. 메시지 특정이 필요한 경우 `reply_to=<message_id>` 를 활용 고려.
- sent 결과에 ID 가 떠도 내부 로그용으로만 두고, 사용자 텍스트에는 절대 포함하지 않는다.

## 관련 이슈 (포스트모템)

- `issues/2026-04-27-telegram-msg-id-leak.md` — 원본 사고 상세
