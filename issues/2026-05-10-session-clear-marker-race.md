---
date: 2026-05-10
slug: session-clear-marker-race
status: resolved
affected: session-clear-trigger.sh (v2.1), session-clear-rescue.sh (v1.x)
fixed_in: trigger v2.2 + rescue v2.0
severity: medium
---

# session-clear 마커 조기 소모 레이스 컨디션

## 증상

```
[16:27:51] timeout waiting for idle, abort   ← launchd rescue가 active turn 중 timeout 후 마커 소모
[16:30:04] fired, marker=gone                ← Stop hook 발화했지만 마커 이미 없음 → exit 0
[16:34:12] fired, marker=gone                ← 같은 현상 반복
```

/clear가 전송되지 않거나 (Enter 없이 /clear만 입력된 것처럼 보임).

## 원인

### 두 스크립트가 하나의 마커를 경쟁

| 스크립트 | 트리거 시점 | 구버전 동작 |
|----------|------------|-------------|
| `session-clear-trigger.sh` (Stop hook) | 턴 완료 시 | 즉시 `rm -f MARKER` → polling → timeout 시에도 마커 소모됨 |
| `session-clear-rescue.sh` (launchd) | 마커 생성 즉시 → sleep 15 후 | sleep 후 `rm -f MARKER` → idle 확인 없이 즉시 send |

스킬이 마커를 **턴 도중** 생성 → launchd rescue 즉시 발화 → 15s sleep
→ rescue가 rm+send 실행 (idle 확인 없이) → Stop hook이 나중에 marker=gone → exit 0.

## 수정 (v2.2 / rescue v2.0)

**rm -f MARKER를 idle 확인 성공(READY=1) 후로 이동.**

```bash
# 전 (v2.1)
[ -f "$MARKER" ] || exit 0
rm -f "$MARKER"   ← 여기서 즉시 소모
...polling...
if timeout → exit 0  # 마커는 이미 사라진 상태

# 후 (v2.2)
[ -f "$MARKER" ] || exit 0
# rm 없음
...polling...
if timeout → exit 0  # 마커 살아있음 → Stop hook이 다음 turn end에 다시 시도
rm -f "$MARKER"   ← READY=1 후에만
```

rescue도 동일 패턴 적용 + 로깅 추가.

## 결과

launchd rescue가 active turn 중 timeout해도 마커가 유지됨
→ Stop hook이 turn end에 마커 발견 → idle 확인 → /clear 전송.
