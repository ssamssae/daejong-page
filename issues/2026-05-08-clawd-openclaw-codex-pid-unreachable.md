---
prevention_deferred: null
---

# Clawd on Desk — OpenClaw Codex 연동 실패 (openclaw-trajectory pidReachable=0)

- **발생 일자:** 2026-05-08 21:11 KST
- **해결 일자:** 2026-05-08 22:51 KST
- **심각도:** low
- **재발 가능성:** medium
- **영향 범위:** Mac mini Clawd on Desk ↔ OpenClaw Codex 세션 추적

## 증상
Clawd on Desk 가 Codex 를 추적하지 못해 펫이 sleeping 상태로 고정됨. OpenClaw 가 Codex 에 메시지를 보내도 Clawd 가 반응 없음 (thinking/working 애니메이션 미발생).

`session-debug.log`:
```
event sid=codex:openclaw-telegram-direct ... source=openclaw-trajectory
→ agentPid=- sourcePid=- pidReachable=0
→ stale-delete unreachable (10분 후 세션 삭제)
```

## 원인
OpenClaw 는 Codex 를 `app-server --listen stdio://` 모드(상시 서버)로 실행. 이 모드에서:
1. `~/.codex/hooks.json` 미호출 — OpenClaw 보안 정책 (archive-only)
2. `~/.codex/sessions/rollout-*.jsonl` 미생성 — CLI 세션 방식과 다름
3. Clawd 의 `openclaw-trajectory` 소스가 PID 체인 추적 실패 → pidReachable=0

## 조치
Clawd on Desk 재시작 (Quit 후 재실행). 재시작 후 `openclaw-plugin` 소스로 자동 전환되어 올바른 PID(98157=codex, 97403=openclaw gateway) 연결됨.

`session-debug.log` 재시작 후:
```
source=openclaw-plugin agentPid=98157 sourcePid=97403 pidReachable=1 ✅
BeforeToolCall 이벤트 정상 수신
```

## 예방
- Clawd 가 Codex 를 인식 못하면 → Clawd 재시작(Tray → Quit 후 재실행)
- OpenClaw 재시작 시에도 Clawd 재시작 병행
- `openclaw-plugin` 소스가 올바른 소스; `openclaw-trajectory` 는 구형 소스로 pidReachable=0 발생

## 재발 이력
<처음 생성>

## 관련 링크
- 텔레그램 메시지: id 14314
