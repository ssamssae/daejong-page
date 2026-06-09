# autopilot /loop 이 30% 넘어도 클리어 안 하고 재예약만 반복

- **날짜**: 2026-05-22
- **노드**: 🍎 본진 (autopilot 다이나믹 오토)
- **분류**: 구조적 갭 — 모델 self-observation 의존 게이트가 발화 불능
- **심각도**: 중 — 컨텍스트 무한 성장, 형님이 매번 수동으로 클리어 트리거해야 함 (재발 N회째)

## 증상

autopilot 다이나믹 /loop 가 매 사이클 inbox/PR 드레인 후 **항상 ScheduleWakeup 만 호출하고 끝남**. "30% 넘으면 핸드오프+clear" 룰이 박혀 있는데도 클리어를 **시도조차 안 함**. 형님이 "세션클리어 안 된 것 같은데?" / "재예약만 하고 클리어 안 했네" 라고 직접 지적해야 그제서야 클리어 진행. 클리어 계열 사고 9건째 패밀리(05-05, 05-09×2, 05-10×3, 05-11, 05-19, 05-22 directive-race) 위에 얹힌 **별도 모드**.

## 근본 원인 — 게이트가 모델 self-observation 에 의존하는데 모델은 자기 컨텍스트 %를 못 봄

1. `/loop` 다이나믹 스킬의 종결 지시는 "as the last action of this turn, call ScheduleWakeup" — 즉 **매 turn 끝은 구조적으로 재예약**으로 수렴.
2. "30% 핸드오프+클리어"는 CLAUDE.md 의 autopilot 컨벤션으로 그 위에 얹힌 **소프트 룰**. 발화하려면 모델이 (a) 현재 컨텍스트 %를 알고 (b) ScheduleWakeup 대신 session-clear 를 골라야 함.
3. **그런데 모델은 turn 안에서 자기 컨텍스트 윈도우 사용률을 직접 못 읽음.** /context 를 박지 않는 한 % 가시성 0 → "30% 넘었나?" 판단 자체가 불가능 → 디폴트로 재예약.
4. 결과: 클리어는 형님 명시 트리거 / 외부 캐치 메커니즘 때만 일어남. 자율 발화는 사실상 0. → 컨텍스트 계속 성장, 형님 손이 매번 필요.

핵심: **모델이 관측할 수 없는 수치(컨텍스트 %)를 모델 판단에 맡긴 게이트는 발화하지 않는다.** 룰이 있고 없고의 문제가 아니라 enforcement 경로가 없는 게 문제.

## 개선 후보 (본진 분석 + 추천)

- **(a) Stop 훅 결정론적 게이트**: `choso-ping.sh` 가 이미 매 Stop 이벤트마다 트랜스크립트 usage 로 `ctx_pct` 를 계산함(토큰 0, 전부 로컬). 이 값이 ≥30 이면 `do-session-clear` 마커 set + 핸드오프 트리거. 모델 self-observation 제거 → 결정론적 발화. **추천 — 이미 계산되는 수치를 재사용, 추가 비용 0.**
- **(b) 루프 프롬프트에 명시 측정 스텝**: 매 사이클 context-show fire 로직으로 실제 % 뽑아 비교. 단점: /context 박는 비용/노이즈 + 여전히 모델 판단 경유.
- **(c) 그냥 둠 + 형님 수동**: 현행. 형님 손 계속 필요 → 형님 손0 원칙 위반.

> **본진 추천: (a)**. ctx_pct 는 choso-ping 이 이미 매 Stop 에 계산 → 거기에 임계 비교 한 줄 + 마커 set 만 얹으면 됨. session-clear 는 5노드 공유 크리티컬 스킬이라 구현 전 형님 ack 필요.

## 상태

- ✅ **해결 (2026-05-22, mesh-vote C안 채택)**. 5노드 mesh-vote 결과 C안 4표 압승(B+ 낸 맥미니·데스크탑도 C로 전향). 형님 GO.
  - 구현: choso-ping.sh Stop 분기에 게이트 추가 — `ctx_pct≥30` AND `next-cycle.md mtime<600s(이번 사이클에 갓 써짐)` 면 `/tmp/do-session-clear` touch (claude-automations commit 4327793, syntax OK). 안전벨트(next-cycle.md freshness)로 무핸드오프 클리어 차단.
  - 루프 불변식: autopilot /loop 가 매 사이클 ScheduleWakeup 직전 next-cycle.md 를 현재 핸드오프로 재작성 → 게이트가 볼 fresh 파일 항상 보장. session-clear 본체 무수정.
  - 효과: 모델 self-observation 의존 제거 → 죽은 룰이 결정론적으로 발화.
- 연관: directive-race(2026-05-22) 는 "클리어 시도했으나 abort", 이건 "클리어 시도조차 안 함" — 둘 다 잡아야 자율 클리어 신뢰성 확보. (directive-race 는 별도 미해결.)

## 교훈

- 모델이 관측 불가한 상태(컨텍스트 %)를 조건으로 거는 자율 룰은 hook 같은 결정론적 enforcement 없이는 죽은 룰이다.
- "룰을 박았다" ≠ "발화한다". 발화 경로(누가 언제 무엇을 보고 트리거하나)를 명시하지 않은 룰은 형님 수동 트리거로 fallback 된다.
