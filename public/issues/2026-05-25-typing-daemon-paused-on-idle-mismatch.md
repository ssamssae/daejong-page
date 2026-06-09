# 🍎 본진 typing daemon — pause-flag fix 후 idle 시 silent vs 형님 기대 mismatch

- 날짜: 2026-05-25 (KST)
- 노드: 🍎 본진 (Mac, USERui-MacBookPro)
- 발생 시각: 본진 fix LIVE 적용 후 첫 idle 사이클 (15:28 KST 직후)
- mesh-vote 트리거: 1779689180 (A) WSL 안 3/5 채택
- 영향: 형님이 "보이다 갑자기 안 됨" 호소 2회 (오늘 같은 사이클 안에서)

## 사실 (heartbeat log)

```
15:23:35 [3022 sess=7c7dc976] heartbeat iter=75 http=200
15:24:50 [3022 sess=7c7dc976] heartbeat iter=90 http=200
15:26:05 [3022 sess=7c7dc976] heartbeat iter=105 http=200
15:27:20 [3022 sess=7c7dc976] heartbeat iter=120 http=200
15:28:23 [3022 sess=7c7dc976] heartbeat iter=135 http=PAUSED   ← Stop hook flag touch
15:29:23 [3022 sess=7c7dc976] heartbeat iter=150 http=PAUSED
(15:30:07 형님 "아직 입력중 안보임" 호소 도착)
(15:30:07 직후 start hook flag rm → 다음 iter http=200 복구)
```

- daemon PID 3022 = 살아있음 (etime 13:05, MAX_ITER 30분 안)
- API 호출 = 본진 turn 끝 직후 Stop hook 의 flag touch 로 PAUSED, 다음 형님 prompt 도착 시 start hook 의 flag rm 으로 200 복구
- 즉 fix 의도된 동작 정상 — 문제는 "정상 동작" 자체가 형님 기대와 다름

## 진단

mesh-vote 1779689180 (A) WSL 안의 의도된 동작 = **"daemon turn 너머 alive, idle 시 silent"**. spawn 비용·5분 갭은 0 이지만 idle 시점엔 form 끝나면 typing 안 보임 (silent).

형님 기대 = **"본진 alive 시그널을 항상 typing 으로"** — 본진이 reply 한 뒤 형님이 답 쓰는 동안에도 typing 인디케이터가 계속 보여야 "본진 살아있구나" 확신.

mesh-vote 결과 (A) WSL 3표 vs 본진 원안 (a) (Stop hook 자체 안 건드리고 daemon 30분 self-exit) 의 trade-off — WSL 안은 "idle 시 거짓 typing 0" 우선, 본진 원안은 "alive 시그널 지속" 우선. 본진이 직전 reply 에서 형님께 "원래 추천 (a) 옵션이면 form 끝나도 30분 동안 계속 typing 보이는 동작" 으로 trade-off surface, 형님 명시 결정 대기 중.

## fix 옵션 (형님 명시 ack 대기)

- (1) 현 상태 유지 (WSL 안 그대로) — idle 시 typing silent. 형님 입장에서 "안 보임" 호소 재발 가능
- (2) Stop hook 의 flag touch 도 제거 → daemon 30분 self-exit 까지 typing 계속 — 형님 alive 시그널 기대 충족, 거짓 신호 30분 caps
- (3) Stop hook 의 flag touch 를 N초 (예: 60초) 후 deferred touch — turn 끝나도 60초까지 typing 유지 (형님 답 쓸 시간 흡수), 그 후 자동 silent

mesh-vote 합의 변경은 본진 자율 X — 형님 명시 ack 필요.

## 학습

1. **mesh-vote 합의 vs 사용자 기대 충돌 surface 의무** — 5 노드 기술적 합의 (silent on idle) 와 사용자 UX 기대 (alive 시그널 지속) 가 충돌하면 본진이 적용 즉시 trade-off 명시 surface. 합의대로 박고 사후 호소 받는 패턴 회피.
2. **fix verify 가 "동작" 만 검증 ≠ "기대" 검증** — Stop/start hook + flag toggle 동작은 PASS 였지만 사용자 기대 충족은 별 verify. UX 영향 있는 fix 는 사용자 첫 idle 사이클 후 명시 confirm 받기.
3. **CLAUDE.md 1번 룰 (사용자 발화 사실·기록과 충돌) 의 확장** — 사용자 *기대* 가 mesh-vote 결과와 충돌하는 경우도 부드럽게 수용 X. "기대와 합의가 다른데 어느 쪽?" 명시 surface.
4. **typing 가시성은 본진 alive 의 1차 시그널** — 형님이 본진 죽었나 의심하는 forcing function. 형님 입장에서 우선순위 매우 높음. 거짓 신호 30분 caps 은 받아들일 만한 trade-off 일 수 있음 (형님 결정 대기).

## 관련

- 같은 사이클 박힌 노트북 OOM cascade issue: `2026-05-25-notebook-sdxl-oom-cascade-x2.md`
- mesh-vote 1779689180 결과 = (A) WSL pause-flag 3표 / (B) notebook OOMScoreAdjust+systemd unit 4표
- CLAUDE.md 빠른 원칙 박힌 글로벌 룰 (claude-skills 96ede57): "5노드 챗봇/장기 background 격리·자가복구 표준"
