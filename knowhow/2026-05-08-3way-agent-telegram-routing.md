---
title: "3way 에이전트 텔레그램 메시지 표준화 — 맥북·WSL·맥미니 6방향 대칭 라우팅"
date: 2026-05-08
tags: [telegram, multi-device, agent-mesh, routing, macbook, wsl, macmini]
severity: medium
category: 멀티기기
---

## 배경

맥북·WSL·맥미니 3대가 서로 텔레그램으로 명령/결과를 주고받을 때, **수신자 채팅방**에 표준 포맷으로 메시지를 보내는 6방향 완전 대칭 구조.

## 포맷

```
[발신이모지→수신이모지] [타입] 내용 (HH:MM KST)
```

- 기기 이모지: 🍎=맥북 / 🪟=WSL / 🏭=맥미니
- 타입 4종: `[명령]` `[결과]` `[알림]` `[상태]`
- **메시지는 수신자 채팅방에 전송** (발신자 채팅방 X)

예시: 맥북 → 맥미니로 명령 보낼 때 → `@ssamssae_claw_bot` 채팅방에 `[🍎→🏭] [명령] build 시작 (14:32 KST)` 표시

## 핵심 구조

### 봇 토큰 매핑

각 기기마다 고유 봇이 있고, 수신 기기의 봇 토큰으로 전송:

| 기기 | 봇 | 토큰 env 변수 |
|------|-----|-------------|
| 맥북 | `@MyClaude` | `TELEGRAM_BOT_TOKEN_MACBOOK` |
| WSL | `@Myclaude2` | `TELEGRAM_BOT_TOKEN_WSL` |
| 맥미니 | `@ssamssae_claw_bot` | `TELEGRAM_BOT_TOKEN_MACMINI` |

모든 기기의 `~/.claude/channels/telegram/.env`에 3개 토큰 전부 등록.

### agent-msg-notify.sh

`~/.claude/automations/scripts/agent-msg-notify.sh <from> <to> <type> <summary>`

TO 기기별 named 토큰 선택 → fallback: 기존 BOT/PEER 토큰:

```bash
case "$TO_NORM" in
  macbook|mac|본진) TOKEN="${TELEGRAM_BOT_TOKEN_MACBOOK:-}" ;;
  wsl)              TOKEN="${TELEGRAM_BOT_TOKEN_WSL:-}" ;;
  macmini|mini)     TOKEN="${TELEGRAM_BOT_TOKEN_MACMINI:-}" ;;
esac
```

### 기기별 .env 설정

**공통 (3개 named 토큰 필수):**
```
TELEGRAM_BOT_TOKEN_MACBOOK=8312381862:...
TELEGRAM_BOT_TOKEN_WSL=8359951262:...
TELEGRAM_BOT_TOKEN_MACMINI=8618050273:...
TELEGRAM_CHAT_ID=538806975
```

**각 기기마다 자기 봇을 BOT_TOKEN으로:**
- 맥북: `TELEGRAM_BOT_TOKEN=8312381862:...` + `TELEGRAM_PEER_BOT_TOKEN=8359951262:...`
- WSL: `TELEGRAM_BOT_TOKEN=8359951262:...` + `TELEGRAM_PEER_BOT_TOKEN=8312381862:...`
- 맥미니: `TELEGRAM_BOT_TOKEN=8618050273:...` + `TELEGRAM_PEER_BOT_TOKEN=8312381862:...`

## 6방향 테스트 검증

```bash
# 맥북에서
~/.claude/automations/scripts/agent-msg-notify.sh macbook wsl 명령 "테스트"
~/.claude/automations/scripts/agent-msg-notify.sh macbook macmini 명령 "테스트"

# WSL에서
~/.claude/automations/scripts/agent-msg-notify.sh wsl macbook 결과 "테스트"
~/.claude/automations/scripts/agent-msg-notify.sh wsl macmini 명령 "테스트"

# 맥미니에서
~/.claude/automations/scripts/agent-msg-notify.sh macmini macbook 알림 "테스트"
~/.claude/automations/scripts/agent-msg-notify.sh macmini wsl 결과 "테스트"
```

각각 해당 수신자 채팅방에 메시지가 나타나야 함.

## 함정: OpenClaw dmScope 미러링

맥미니 OpenClaw의 `dmScope: per-channel-peer` 설정이 활성화되면 Codex 채팅방 답변이 맥북 채팅방에도 자동 미러링됨.

**해결**: `~/.openclaw/openclaw.json`에서 `session.dmScope`를 `main`으로 변경:

```json
{
  "session": {
    "dmScope": "main"
  }
}
```

허용값: `main` | `per-peer` | `per-channel-peer` | `per-account-channel-peer`  
`per-channel` 같은 무효값 입력 시 게이트웨이 **크래시 루프** 발생 주의.

변경 후 게이트웨이 재시작 필요:
```bash
launchctl kickstart -k gui/$(id -u)/ai.openclaw.gateway
```

두 openclaw 인스턴스가 동시 실행되면 구 인스턴스가 구 설정으로 미러링 지속 → `ps aux | grep openclaw`로 확인 후 구 프로세스 kill.

## 함정: mac-report.sh 자동 [결과] 알림 (2026-05-08)

mac-report.sh 끝에 `agent-msg-notify.sh $FROM_DEVICE macbook 결과 $TITLE` 호출이 있으면:
- WSL/맥미니가 본진에 보고를 보낼 때 **맥북 채팅방에 가짜 [결과] 메시지 자동 전송**
- 방향도 반대처럼 보여서 혼선 유발

**해결**: mac-report.sh 마지막 agent-msg-notify 호출 제거. 결과 알림은 수신측 Claude가 직접 보냄.

## 함정: telegram-stop-ping.sh의 mac-report 응답 포워딩 (2026-05-08)

`telegram-stop-ping.sh` stop hook은 터미널 세션(비텔레그램 입력) Claude 응답을 `💬 터미널 응답` 헤더로 @MyClaude 채팅에 포워딩함. mac-report로 본진 tmux가 깨어나 처리한 결과도 이 채널로 흘러들어 노이즈 발생.

**해결**: hook 상단에 `[Mac report title:` 패턴 감지 시 skip 추가:

```bash
if echo "$last_user" | grep -q '\[Mac report title:'; then
  echo "  skip: mac-report internal message" >> "$LOG"
  exit 0
fi
```

## 맥미니 자율 응답 불가 — 본진 SSH 코디 패턴 (2026-05-08)

맥미니는 2026-05-03 launchd 잡 전부 제거(OpenClaw 샌드박스 호스트로 전환) 이후 **inbox listener / 자율 응답 워커 없음**.

WSL→맥미니 왕복 테스트 결과:
- WSL이 `agent-msg-notify.sh wsl macmini 명령 "..."` 전송 → 맥미니 채팅방 도착 ✓
- 맥미니 자율 응답 X (inbox polling 워커 없음)
- **본진 코디 패턴**: 본진이 `ssh mac-mini "agent-msg-notify.sh macmini wsl 결과 ..."` 실행

```bash
# 본진에서 맥미니 대신 결과 전송
ssh mac-mini "source ~/.claude/channels/telegram/.env 2>/dev/null; \
  ~/.claude/automations/scripts/agent-msg-notify.sh macmini wsl 결과 '맥미니 수신 확인'"
```

새 LaunchAgent 추가는 5/3 결정 위반이므로 현재 패턴 유지. 자율 응답이 필요해지면 재검토.

## 관련 파일

- `~/.claude/automations/scripts/agent-msg-notify.sh` — 라우팅 헬퍼
- `~/.claude/automations/scripts/mac-report.sh` — WSL/맥미니→본진 보고 래퍼 (자동 알림 없음)
- `~/.claude/automations/scripts/wsl-directive.sh` — 맥→WSL 명령 전달
- `~/.claude/hooks/telegram-stop-ping.sh` — 터미널 응답 포워딩 (mac-report skip 포함)
- `~/.claude/channels/telegram/.env` — 토큰 설정 (각 기기별)
- `~/.openclaw/openclaw.json` — OpenClaw 설정 (맥미니)
