# autopilot 야간 작업 증발 — session-clear 마커 ↔ directive 도착 race

- **날짜**: 2026-05-22
- **노드**: 💻 노트북 (피해) / 🍎 본진 (autopilot 오케스트레이션)
- **분류**: 자동화 race condition (session-clear v2.3 ↔ autopilot directive)
- **심각도**: 중 — 노드 1대가 야간 배정 작업(한줄일기 ASO)을 0건 실행, 산출물 증발

## 증상

야간 autopilot 에서 💻 노트북에 todo #8(한줄일기 ASO 리서치+스크린샷 컨셉) directive 를 보냈으나 노트북이 작업을 **한 번도 실행 못 함**. `~/agent-inbox/master/*notebook*` 보고 0건, `~/research/hanjul-aso-*.md` 산출물 없음.

## 근본 원인 — 클리어와 directive 의 경합

타임라인:
1. 형님 "세션초기화" 지시 → 노트북 session-clear 스킬 발동, 마커(`/tmp/do-session-clear`) set.
2. **직후** 본진 autopilot 야간 directive(ASO) 도착.
3. session-clear v2.3 룰대로 directive 를 `~/.claude/next-cycle.md` 에 접어넣고 "클리어 → 새 세션 재주입" 으로 넘김(존중+보존 의도).
4. 그런데 `/clear` 발사 전에 후속 메시지 연달아 도착: (a) 보고방식 변경 directive (b) 본진 야간종료 morning 인사.
5. session-clear trigger 는 연속 메시지/"esc to interrupt" 동안 abort → `/clear` 끝내 미발사 → 새 세션 안 열림 → **next-cycle.md 재주입 안 일어남 → ASO 작업 루프가 한 번도 안 돎**.
6. morning 인사 받고 next-cycle.md 제거 + idle.

핵심: **next-cycle.md 핸드오프는 "클리어→새 세션 재주입"을 전제하는데, 클리어가 연속 메시지로 abort 되면 핸드오프가 영영 소비 안 되고 작업이 증발한다.** 야간엔 directive 가 연속으로 들어와 trigger 가 계속 abort → 클리어 무한 지연 → 작업 무한 지연.

## 개선 후보 (본진 분석 + 추천)

- **(a) 핸드오프 fallback → in-session 실행**: directive 가 next-cycle.md 에 접힌 뒤 클리어가 N초 내 미발사면, 클리어 포기하고 **현재 세션에서 directive 즉시 실행**. → 작업 증발 0. 단점: 컨텍스트 안 비워짐(클리어 목적 일부 상실).
- **(b) 작업 채널 디커플**: autopilot 야간 directive 는 마커 set 상태여도 별도 worker 세션을 먼저 spawn. 단점: 노드별 worker 세션 인프라 추가(무거움).
- **(c) stuck 경보**: trigger 가 마커 set 후 일정 시간 클리어 못 하면 텔레그램/inbox 경보. 단점: 증발 자체는 안 막고 가시성만.

> **본진 추천: (a) + (c)**. (a)가 핵심 — 작업이 절대 증발 안 하게 in-session fallback. (c)는 싸게 얹는 안전망(클리어 지연 가시화). (b)는 인프라 과투자라 보류.

## 상태

- 이슈 기록 완료(이 파일). **수정 방향 = 형님 픽 대기** — session-clear 는 5노드 공유 크리티컬 스킬이라 (a)/(b)/(c) 중 형님 결정 후 구현.
- 연관: autopilot 노드 미가동 사고 2건째(1건째 = 맥미니 liveness false-negative, issues/2026-05-22-autopilot-macmini-liveness-false-negative.md). 둘 다 "야간에 노드가 멀쩡/배정됐는데 실제 일은 0" 패턴.

## 교훈

- 자율 야간 운영에서 형님의 인터랙티브 트리거(session-clear)와 자동 directive 가 같은 채널(tmux paste)으로 경합하면 작업이 조용히 증발할 수 있다.
- 핸드오프(next-cycle.md)는 "반드시 클리어가 성공한다"를 암묵 전제 → 클리어 실패 경로의 fallback 이 없으면 작업 유실.
