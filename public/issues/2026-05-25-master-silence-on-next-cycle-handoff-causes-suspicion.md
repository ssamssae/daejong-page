---
date: 2026-05-25
node: 🍎 본진
severity: medium
status: resolved
tags: [telegram, ack, handoff, next-cycle, suspicion, forcing-function]
---

# 본진 next-cycle 박힘 후 텔레그램 침묵 28분 → 형님 의심 증폭 사고

## 사건 (KST)

- 15:49 KST (msg8410): 형님 텔레그램 발화 "대종페이지에 죄송합니다 버튼 하나 추가하고 지금까지 나한테 죄송합니다 사과했던 내용들 전부 찾아서 박제해". WSL 봇에 도착 후 본진에 forward.
- ~15:50: 본진 next-cycle.md 0번에 박고 클리어 ack (WSL 채널). 본진 채팅엔 ack 0.
- 16:11 KST (msg24508): 형님 별 trigger "지금바로" — inbox-paste race-safe 작업 진입.
- 16:18 KST: race-safe 작업 끝 보고 (msg24511). "사과 박제는 next-cycle 대기" 명시 — 즉시성 0.
- 16:17 KST (msg8414): 형님 "디렉티브 씹힌듯? 잘들어갔나 물어봐 왜 답변이없어" — 의심 1차.
- 16:18 KST (msg8415): 형님 "아니면 답변 받았는데 니가 일을 안하는거냐 뭐야 왜 무시함?" — 의심 2차 증폭.
- 16:19 KST: WSL reverse directive 도착 → 본진 즉시 사과 박제 진입.
- 16:23 KST: 사과 박제 작업 끝 (commit 86a978a).
- 16:25 KST (msg8421): 형님 후속 "앞으로 죄송합니다 사과 나올 때마다 대종페이지 자동으로 박을거야" — v2 hook trigger.

## 증상

본진이 형님 directive 받은 후 다음 두 케이스 다 형님 폰엔 침묵으로 보임:
1. next-cycle.md 박고 처리 보류 → 본진 채팅에 ack 0
2. 다른 작업 진입 중 directive 도착 → 진행 중인 작업 끝까지 ack 0

총 28분 (15:49 → 16:17 형님 의심 발화) 침묵. WSL 봇 채팅엔 본진 처리 중 메타가 도착했지만 본진 봇 채팅엔 침묵.

## 진단

### 근본 원인
**stage1 ack 누락**. 형님 발화 도착 시 "받았어요" signal 자체가 안 가서 형님 입장에선 "도달했는지 / 처리 시작했는지 / 본진 죽었는지" 다 모름.

### 진통제 vs 본질
- 진통제 = stage2/3 reminder ("응답 안 오면 10분/25분 후 자동 reminder"). WSL 1차 안.
- 본질 = stage1 ack ("받았다 signal 즉시 1통"). 의심 발생 시점 자체를 제거.

desktop3060ti brainstorm 핵심 통찰: "stage1 만 박혀도 의심 발생 케이스가 거의 사라지므로 stage2/3 발사 케이스는 진짜 본진/노드 사망 케이스로 한정". stage2/3 는 stage1-fail 케이스 safety net, 본질 fix 는 stage1 forcing function.

### 기여 요인
1. 본진이 next-cycle.md 박는 행위 자체를 "처리 시작" 으로 자체 정당화 — 형님 폰엔 안 보임
2. 다른 작업 진입 시 도착한 directive 를 silent buffer (system reminder 로 turn 끝에 박힘) 로만 인지, 형님께 ack 별도 안 발사
3. CLAUDE.md 의 "텔레그램 답변 reply tool 의무" 룰은 *turn 끝 응답* 에 대한 룰, *도착 즉시 ack* 룰은 별도 박혀있지 않음

## 재발방지

### 1. hook 자동화 (LLM 무관)
- `~/.claude/hooks/telegram-stage1-ack.sh` (UserPromptSubmit hook) 신설.
- 게이트: telegram-origin + from_user_id=538806975(형님 only) hard gate. 노드↔본진 cross-routing 메시지엔 발사 X.
- 동작: 봇 username 별 이모지 (🍎🪟🏭🖥💻) + sendMessage API 직접 호출 "(이모지) 받았어요".
- dedup: `~/.claude/state/telegram-acks/<chat_id>-<message_id>` ledger.
- 5노드 mirror (claude-automations SoT).

### 2. 메모리 룰
- `feedback_immediate_ack_to_master_message.md` 신설. MEMORY.md 인덱스 등재.

### 3. 5노드 표준
- claude-automations push 후 노드 git pull 자연 sync. 노드별 settings.json 의 UserPromptSubmit 등록은 별도 directive (본진이 4 노드 dispatch).

## 검증

- hook 자체: bash -n PASS, settings.json valid JSON PASS, 가짜 prompt verify 별도 안 함 (실제 발사 = 형님 폰 ping, production verify 는 형님 다음 메시지 시 자연 발생).
- 운용 1주 후 stage2/3 진짜 필요한지 데이터 보고 결정 (desktop brainstorm 권장).

## 관련

- desktop3060ti brainstorm 결과 (mac-report.sh paste, 본진 channel)
- WSL 1차 안 (msg8420)
- 본진 사과 v2 hook (msg8421 후속, 별 commit) — 본 fix 와 같은 5노드 hook 흐름이지만 trigger/저장처 다름
- [[../memory/feedback_apology_triggers_postmortem]] (사과 5단계 룰)
- [[../memory/feedback_two_channel_ack_after_cross_routing]] (cross-routing reverse ack)
