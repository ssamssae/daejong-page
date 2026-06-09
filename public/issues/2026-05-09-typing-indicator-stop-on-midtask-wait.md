---
prevention_deferred: null
summary: "작업 중간 확인 대기 시 텔레그램 입력 중 표시가 꺼져 봇이 죽었다고 형님이 오해할 수 있는 상태"
---

# 작업 중간 확인 대기 시 입력 중 표시 꺼짐

- **발생 일자:** 2026-05-09 23:45 KST
- **해결 일자:** 2026-05-09 23:50 KST
- **심각도:** low (UX — 봇 죽었나 오해 유발)
- **재발 가능성:** low (수정 완료)
- **영향 범위:** Telegram typing indicator, 작업 중간 사용자 확인 대기 상황

## 증상
Claude가 작업 중간에 "BACKLOG.md 기록할까요?" 같은 확인 요청을 보내고 대기 중인데
Telegram "입력 중" 표시가 꺼짐. 사용자가 봇이 죽었거나 응답 안 한다고 오해 가능.

## 원인
Stop 훅(`telegram-typing-stop.sh`)이 매 턴 종료 시 typing 데몬을 무조건 kill.
작업 완전 종료와 작업 중간 확인 대기를 구분하지 않아서 대기 중에도 typing 꺼짐.

## 조치
1. `~/.claude/hooks/telegram-typing-stop.sh`: `~/.claude/state/telegram-waiting` 플래그 존재 시 데몬 kill 스킵
2. `~/.claude/hooks/telegram-typing-start.sh`: UserPromptSubmit 시 플래그 자동 삭제
3. `~/.claude/hooks/telegram-typing-wait.sh` 신규 생성: Claude가 확인 대기 진입 시 플래그 설정용

## 예방 (Forcing function 우선)
- **코드 레벨 (완료)**: Stop 훅에 플래그 체크 추가. 플래그 있으면 typing 데몬 유지.
- **사용 규칙**: 작업 중간 확인 요청 reply 전에 `bash ~/.claude/hooks/telegram-typing-wait.sh` 호출.

## 재발 이력
<없음>

## 관련 링크
- 텔레그램: 2026-05-09 23:46 KST "작업 중에는 입력 중이 떠야지" 메시지
