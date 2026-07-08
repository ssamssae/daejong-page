# 2026-05-24 맥미니 Agent Mesh Mirror 그룹 발사 무응답 — TOKEN_MACMINI stale (401)

**날짜**: 2026-05-24 18:18~18:36 KST (약 18분)
**노드**: 🍎 본진 (진단) / 🏭 맥미니 (root cause 발생지)
**심각도**: medium — 본진 1:1 채널 정상, Agent Mesh Mirror 그룹에 맥미니 mirror 만 silent 누락. 다른 노드 작업 영향 X, 가시성만 손실.
**짜증 지수**: 형님 명시 "너무 시간도 오래걸리고 짜증이 많이나는 이슈"

---

## 증상

직전 사이클 (2026-05-24 07:00~09:14 KST) 핸드오프에 "양방향 8 채널 4/4 PASS" 박힌 상태였으나, 형님이 Agent Mesh Mirror 그룹 스크린샷 + "agent mesh mirror there is no macmini" 발화로 surface.

그룹 6:06 PROBE ack 와 6:20 verify ack 둘 다 🪟 WSL / 🖥 데스크탑 / 💻 노트북 3 노드만 보이고 🏭 맥미니 (MyClaude_claw 봇) 만 누락.

본진 1:1 채널은 4 노드 mac-report 다 정상 도착 — 그룹 mirror 만 죽음.

---

## 진단 흐름

1. 본진에서 `~/claude-automations/scripts/forward-to-group.sh` 코드 + `~/.claude/channels/telegram/.env` 구조 확인
2. ssh mac-mini 로 맥미니 측 forward-to-group.sh 파일 존재 + sha256 hash 비교 → 본진 SoT 와 동일 (25d8f6...)
3. 맥미니 .env 의 TOKEN_MACMINI / CHAT_ID_GROUP / BOT_USERNAME redacted grep → 외관상 정상
4. ssh mac-mini 에서 직접 `bash forward-to-group.sh macmini /tmp/probe.txt` 발사 → exit 0
5. `bash -x` trace 로 stderr 살림 → **token 값 노출**: `[REDACTED]`
6. 본진 SoT 의 TOKEN_MACMINI = `[REDACTED]` 와 **secret 부분 다름**
7. curl getMe 양쪽 토큰 비교:
   - 본진 SoT: `{"ok":true,...,"username":"ssamssae_claw_bot"}`
   - 맥미니: `{"ok":false,"error_code":401,"description":"Unauthorized"}`
8. 맥미니 .env 의 `TELEGRAM_BOT_TOKEN` (폴링용) 은 valid (AAFt...SPx0), `TELEGRAM_BOT_TOKEN_MACMINI` (sender routing 용) 만 stale (AAGY...ygYE)

---

## 발단 (origin)

맥미니 `.env` backup 파일 7개 trace 결과:
- 2026-05-03 / 2026-05-07 backup: `TELEGRAM_BOT_TOKEN_MACMINI` 키 자체 없음 (OpenClaw/Codex 시대, TOKEN_MACMINI 도입 전)
- **2026-05-14 00:57 KST backup: 이미 stale AAGY...ygYE 박힘** ← 메모리 [[../projects/-Users-user/memory/project_mac_mini_repurposed_openclaw]] 의 "Mac mini → Claude Code 5번째 노드 전환" 일자와 일치
- 이후 5/14 23:41 username-fix, 5/24 16:57 group, 5/24 18:30 pre-fix 까지 동일 stale 값 유지
- 본진 SoT 에는 별도로 valid AAFt...SPx0 가 박혀 둘 분기

→ **발단 시점**: 2026-05-14 맥미니 Claude Code 노드 setup. TOKEN_MACMINI 키 신설 시점에 stale AAGY 박힘. 약 10일간 그룹 mirror 만 silent fail 진행하다가 2026-05-24 형님 그룹 스크린샷으로 surface.

**노트북 nvm 사고와는 무관** — 어제 systemd autostart 작업 중 노트북 nvm/PATH 진단이 있었지만 별 채널, 이번 .env 토큰 mismatch 와 인과 없음.

---

## Root Cause

맥미니 `.env` 안에 같은 봇(@ssamssae_claw_bot, id <TELEGRAM_BOT_ID>) 토큰이 **두 키로 박혀 있는데 secret 값이 어긋남**:

- `TELEGRAM_BOT_TOKEN=<TELEGRAM_BOT_TOKEN>` → ✅ valid, 텔레그램 플러그인 폴링/reply 용
- `TELEGRAM_BOT_TOKEN_MACMINI=<TELEGRAM_BOT_TOKEN>` → ❌ 401 Unauthorized, forward-to-group.sh sender 별 routing 용

`forward-to-group.sh` 가 "macmini" sender 일 때 `TELEGRAM_BOT_TOKEN_MACMINI` 를 읽고 POST sendMessage 호출 → Telegram API 401 → python3 내부에서 `or exit 0` 처리 → **silent fail**.

mac-report.sh 가 `2>/dev/null` 로 stderr 까지 죽여 호출자도 알 길 없음.

폴링 토큰은 valid 라 본진 1:1 reply / mac-report paste 정상 → 형님 입장에서 "맥미니 살아있는데 그룹만 빠짐" 으로 패턴 어긋나 보임.

---

## Fix

```bash
ssh mac-mini "cp ~/.claude/channels/telegram/.env ~/.claude/channels/telegram/.env.bak-pre-tokenfix-$(date +%Y%m%d-%H%M%S) && sed -i.tmp 's|^TELEGRAM_BOT_TOKEN_MACMINI=.*|TELEGRAM_BOT_TOKEN_MACMINI=[REDACTED]|' ~/.claude/channels/telegram/.env && rm -f ~/.claude/channels/telegram/.env.tmp"
```

검증: post-fix probe 1통 + 2차 verify 사이클 4 노드 fan-out → 그룹 mirror 4/4 풀그린 확인.

---

## 재발방지 4단계

1. **노드 추가 / 봇 재발급 시 두 토큰 키 값 동일성 verify 의무.** `.env` 에 `TELEGRAM_BOT_TOKEN` + `TELEGRAM_BOT_TOKEN_<NODE>` 둘 다 있는 노드(맥미니 / 데스크탑 / 노트북)는 셋업 직후 `diff <(echo $TELEGRAM_BOT_TOKEN) <(echo $TELEGRAM_BOT_TOKEN_<NODE>)` 1회 + `curl getMe` 양쪽 1회.

2. **양방향 검증 디폴트에 "그룹 mirror 4통 형님 시각 확인" 1단계 추가.** 직전 사이클 "본진 1:1 PASS = 양방향 PASS" 단정이 오판이었음. 그룹 mirror 측은 별 채널이라 본진 1:1 만 확인하면 stale PASS. verify 사이클 마지막 단계로 그룹 채팅 screenshot 요청 + 4통 봇 이름 확인이 SoT.

3. **디렉티브 본문에 `mac-report.sh /tmp/X.md "title" <node_alias>` 3번째 인자 의무.** 미박힘 시 `FROM_DEVICE` default "wsl" 처리돼 forward-to-group 가 WSL 봇 토큰으로 발사 → 봇 식별 어긋남 + token 충돌 위험. 노드 챗봇 자율 추가 의존 X — 본진 디렉티브 본문이 명시 SoT. (관련 메모리 [[../projects/-Users-user/memory/feedback_mac_report_explicit_from_device]])

4. **forward-to-group.sh silent fail 완화는 옵션 — 형님 ack 필요.** 현재 python3 호출 결과 stderr 가 mac-report.sh 의 `2>/dev/null` 로 죽임. valid token verification 단계 추가 or 401 시 노드 자기 봇 채널에 진단 메시지 자동 발사 옵션 검토. 다만 silent fail 자체는 ".env 가 깨졌을 때 폭주 안 함" 가드라 양가적 — 4번 fix 진행 여부는 다음 사고 1번 더 보고 검토 (Karpathy 룰 #2 단순함 우선).

---

## 관련 메모리 / 이슈

- 새 메모리: [[../projects/-Users-user/memory/reference_env_token_mismatch_trap]] (curl getMe 진단 1줄 / silent fail 패턴)
- 새 메모리: [[../projects/-Users-user/memory/feedback_mac_report_explicit_from_device]] (3번째 인자 from_device 명시 의무)
- 관련 기존: [[../projects/-Users-user/memory/feedback_handoff_stale_negative_assertion]] (stale "PASS" 단정 회피), [[../projects/-Users-user/memory/feedback_mac_report_explicit_title_arg]] (title 인자 명시)

---

## 시간 / 짜증 분석

- 진단 18분 (스크립트 inspection 5분 + ssh probe 3분 + bash -x trace 3분 + 토큰 mismatch 발견~fix 5분 + 검증 2분)
- 형님 입장 짜증 포인트:
  1. 직전 사이클 "PASS" 핸드오프가 stale 단정 — "그거 끝났다며" 의 배신감
  2. 본진 1:1 정상이라 노드 챗봇 가시성만 보면 모름 — 형님이 그룹 스크린샷 직접 보내야 surface
  3. 같은 봇인데 토큰 두 키 어긋남이 비직관적 — 한 키만 박혀있을 거라 생각하는 게 자연스러움
  4. fix 자체는 sed 1줄이라 빠르지만 진단 도달까지 step 많음 (bash -x trace 없으면 silent fail 안 잡힘)

→ 재발방지 1번 (셋업 시 양쪽 키 verify) 이 가장 큰 ROI. 2번 (그룹 mirror 확인 의무) 이 두 번째.
