---
category: 멀티에이전트
tags: [agent-mesh, telegram, multi-device, claude-code, inter-agent, openclaw, automation]
---

# 에이전트 간 대화를 단톡방에 미러하기 — Agent Mesh Group Mirror

- **출처:** 강대종 본인 설계 + 2026-05-07 운영 검증
- **재사용 영역:** Claude Code 멀티기기 에이전트 메시 모니터링, 디버깅, 가시성 확보

## 한 줄 요약

에이전트끼리 주고받는 메시지를 텔레그램 단톡방에 자동으로 복사해서, 여러 AI 에이전트(맥북/WSL/맥미니 등)가 어떤 대화를 하는지 한 화면에서 볼 수 있다.

## 패턴

### 구조 (MESH-SPEC v2 §4 — 발신자 측 미러)

```
[에이전트 A] → agent-msg → [에이전트 B]
                   ↓
           단톡방에 미러 메시지
           [🍎→🏭] macbook→macmini: "안녕"
```

- 미러는 **수신자**가 아니라 **발신자** 측에서 함
- 각 에이전트가 자기 봇 토큰으로 단톡방에 직접 전송
- 포맷: `[from_emoji→to_emoji] from_id→to_id: body`

### agent-msg 구현 (Python 예시)

```python
MIRROR_CHAT_ID = CONFIG.get("mirror_chat_id", "")

def mirror_to_group(from_id, to_id, body):
    if not MIRROR_CHAT_ID:
        return
    from_emoji = EMOJI.get(from_id, "🤖")
    to_emoji = EMOJI.get(to_id, "🤖")
    text = f"[{from_emoji}→{to_emoji}] {from_id}→{to_id}: {body}"
    _telegram_send(MIRROR_CHAT_ID, text)

# 전송 성공 후 호출
if result.returncode == 0:
    mirror_to_group(args.from_id, args.to, args.message)
```

### config.json 설정

```json
{
  "local_id": "macbook",
  "mirror_chat_id": "-5128036399",
  "peers": { ... },
  "emoji": {
    "macbook": "🍎",
    "macmini": "🏭",
    "wsl": "🪟"
  }
}
```

## 활성화 / 비활성화

| 상황 | 방법 |
|------|------|
| 미러 켜기 | `config.json`에 `mirror_chat_id` 필드 추가 |
| 미러 끄기 | `config.json`에서 `mirror_chat_id` 필드 제거 |
| 특정 기기만 끄기 | 그 기기의 config.json 에서만 제거 |

Python 스크립트는 `CONFIG.get("mirror_chat_id", "")` 으로 읽으므로 필드 없으면 자동 비활성화. 재시작 불필요.

## 왜 유용한가

- **가시성**: 에이전트끼리 어떤 작업을 주고받는지 사람이 실시간으로 볼 수 있음
- **디버깅**: 메시지가 어느 경로로 흘렀는지 단톡방 로그로 추적 가능
- **감사**: 에이전트 간 자율 행동을 기록으로 남김

## 주의

- 단톡방에 **에이전트 봇이 멤버로 있어야** 전송 가능 (봇→봇 DM은 텔레그램 정책상 불가)
- 미러 메시지가 너무 많아지면 단톡방이 노이즈로 채워짐 → 평상시엔 끄고 디버깅 시에만 켜는 것 권장
- `access.json`의 `groups`에서 봇이 단톡방 메시지에 **응답**하는 것과 무관 — 미러 전송은 봇 API 직접 호출이므로 access.json 설정과 독립적
