---
prevention_deferred: null
summary: "Codex inject WebSocket이 성공 리턴했지만 실제 미도달 → 10분 후 형님이 결과 안 와서 발견"
---

# Codex inject WebSocket 무음 실패 — directive ok 리턴했지만 미도달

- **발생 일자:** 2026-05-08 14:13 KST
- **해결 일자:** 2026-05-08 14:21 KST
- **심각도:** medium
- **재발 가능성:** medium
- **영향 범위:** codex-directive.sh → Mac mini Codex 연동

## 증상
codex-directive.sh 가 "✅ directive sent to Codex" 를 리턴했지만 Codex에서 실행 또는 응답이 없었음. 10분 대기 후 사용자가 "왜 결과 안 와?" 로 발견.

## 원인
OpenClaw inject gateway(ws://100.120.156.7:18789) 프로세스는 살아있었으나 MacBook→Mac mini WebSocket 연결이 실제로 실패하는 상태였음. codex-directive.sh 가 inject 시도 후 연결 실패를 에러로 처리하지 않고 ok 를 리턴함 (추정).

## 조치
SSH 직접 접속(`ssh mac-mini`)으로 환경 확인 및 `git -C ~/claude-skills pull` 수동 실행.

## 예방 (Forcing function 우선)
codex-directive.sh 전송 전 `nc -z -w3 100.120.156.7 18789` 헬스체크 추가. 연결 실패 시 즉시 에러 출력하고 전송 중단. silent ok 제거로 사용자가 실패를 즉시 인지 가능.

## 재발 이력
<처음 생성>

## 관련 링크
- 텔레그램 메시지: id 14110~14112
