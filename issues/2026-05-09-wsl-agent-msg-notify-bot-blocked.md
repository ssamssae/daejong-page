---
prevention_deferred: null
---

# WSL agent-msg-notify.sh → Telegram 봇차단으로 Mac 수신 불가

- **발생 일자:** 2026-05-09 21:06 KST
- **해결 일자:** 미완 (WSL 수정 필요)
- **심각도:** medium (WSL→Mac 양방향 통신 미작동)
- **재발 가능성:** high (구조적 오해, WSL이 잘못된 경로 계속 사용)
- **영향 범위:** WSL이 Mac에 명령/결과 전달 시도할 때마다 사일런트 실패

## 증상

WSL 봇(@Myclaude2)이 `agent-msg-notify.sh macbook macmini 명령 "..."` 로
`[🪟→🍎] [명령] [claude-skills HEAD: c673f22]` 를 9:06 KST에 Telegram으로 전송.
강대종님 화면에는 보이지만 Mac Claude 봇은 수신하지 못함.
Mac이 inbox 조회 시 "오늘 새 메시지 없음" 응답.

## 원인

Telegram Bot API는 봇끼리 서로의 메시지를 읽지 못함(privacy off 해도 차단됨).
`agent-msg-notify.sh`는 Telegram으로 전송 → Mac 봇 수신 불가.
파일 기반 경로(`inbox-write.sh --remote`)만 실제로 작동함.

**3기기 검증 당시 blind spot**: mesh-vote 검증은 `~/tmp/mesh-vote/` SSH 파일 공유를 테스트했으나, `agent-inbox` 파일 기반 통신의 WSL→Mac 경로는 별도 검증하지 않음.
맥미니→Mac 경로만 `test2: log check` 1회 검증됨(07:19 KST, process-agent-inbox.sh 로그).

## 올바른 경로

| 경로 | 방식 | Mac 수신 | 용도 |
|---|---|---|---|
| agent-msg-notify.sh | Telegram | ❌ 봇차단 | 강대종님 알림(사람이 읽는 것) |
| inbox-write.sh --remote | SSH 파일 | ✅ launchd 30s 픽업 | Mac 봇이 읽어야 할 명령/결과 |

## 조치

WSL이 Mac 봇에게 전달해야 할 메시지(명령/결과)는 반드시:
```bash
~/.claude/automations/scripts/inbox-write.sh \
  --from wsl --to macbook --type 명령 \
  --body "메시지" --remote
```

단순 알림(강대종님이 볼 것)은 agent-msg-notify.sh 계속 사용 OK.

## 예방

WSL SKILL.md 또는 자동화 스크립트에서 macbook target 메시지는 inbox-write.sh --remote 사용 명시.
agent-msg-notify.sh 주석에 "봇 수신 불가 — 강대종님 알림 전용" 경고 추가.
