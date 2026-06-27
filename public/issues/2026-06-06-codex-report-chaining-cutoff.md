# codex 노드 보고 끊김 — 이벤트 체이닝 work-stealing 토글 강결합 + self-heal 부재

2026-06-06 KST. 아니키 "자동 코덱스 중간보고가 일 끝날 때마다 안 온다" 보고 → 본진/맥미니 조사.

## 증상

codex-night-cycle 자동 사이클이 작동은 하는데, 노드 task 완료 보고(중간보고)가 "완료마다"가 아니라 "30분마다"로 뜸해짐. 아니키가 직접 중간보고를 요청해야 상태를 알 수 있는 상황.

## 근본 원인

이벤트 체이닝(노드 완료 → 다음 task 즉시 발사 + 그때 중간보고)의 트리거가 `mac-report.sh` 안에 있고(라인 232~248, DO NOT REMOVE 마커), **`~/.choso/work-stealing.on` 토글이 있을 때만** 발사하게 강결합돼 있다.

- 토글이 한 번이라도 off→on 으로 깜빡이면(오늘 13:05 무렵 off, 14:02 재on — worker-toggle 엔진 mutex 또는 수동 토글 추정), 진행 중이던 per-completion 체인이 끊긴다.
- **self-heal 이 없다.** 끊긴 뒤엔 30분짜리 launchd 안전망(StartInterval 1800)만 남아, 노드가 idle 이어도 최대 30분 방치된다.
- 그 결과 보고 cadence 가 '완료마다' → '30분마다'로 영구 degrade. 안전망이 (원 설계 의도인) 2분이 아니라 30분이라 degrade 폭이 크다.

### 타임라인 증거 (`~/.choso/codex-night-locks/` mtime + 사이클 로그)

- 12:40~13:05: `[event:--node X]` dense 발사 (work-stealing.on 활성, 체이닝 정상).
- 13:05~14:02: 발사 0 (work-stealing.on 부재 = 토글 off, "toggle OFF skip" 로그).
- 14:02~: work-stealing.on 재생성됐으나 `[heartbeat]`(30분 launchd)만 남고 `[event]` 체이닝 미복귀.

## 재발방지 아키텍처 (제안)

launchd 안전망을 30분 → **2분 self-healing watchdog** 로. 이미 존재하는 가드를 그대로 활용:
- `node_busy()`(codex REPL capture-pane 에서 'Working|esc to interrupt' 감지) → busy 노드 skip, 충돌 0.
- 픽업 lock dir(md5) dedup → 중복 발사 0.
- 빈 tick 안전: 픽업 0 이면 fire-lease 발급 전 `exit 0`(라인 146), 중간보고는 `FIRED>0` 가드 → 폰 스팸·lease 낭비 0.

→ 토글이 깜빡여도 2분 안에 idle 노드 자동 재충전. 이벤트 체이닝(초 단위 fast-path)은 그대로 두고(가드 마커 보존) 그 밑에 2분 floor 를 까는 belt-and-suspenders.

변경점: `com.daejong.codex-night-cycle.plist` StartInterval `1800 → 120` (+ payload 문구 "launchd 30분" → "2분" 정합). 이벤트 체이닝 트리거(mac-report.sh 232~248) 미수정.

## 미결 — codex 사용량 트레이드오프 (2026-06-06 발견)

같은 날 codex 5h 사용 한도 소진 발생(전 노드 gpt-5.5 xhigh → gpt-5.4-mini 강제 다운, "hit usage limit, try again 7:07 PM"). 2분 watchdog 은 노드를 더 촘촘히 채워 **하루 codex 사용량을 늘린다**(= 한도 더 빨리 소진). codex EOL(2026-06-06) + claude 백엔드 회귀와 맞물려, 2분 vs 더 완만한 주기는 아니키 결정 대기. fix 자체는 채택, 주기 숫자만 미확정.

## 상태

- 근본 원인 + 타임라인 확정. 이슈 기록.
- 구현(plist StartInterval) 은 주기 숫자 아니키 확정 후 박기 (HELD).
