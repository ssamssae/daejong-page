# 2026-06-04 — autopilot 이 "끝난 결정"을 재탕한 사고 (stale orphan task 재dispatch)

## 한 줄
결정/완료가 **형제·대체 task 를 무효화**했는데 그 task 를 안 닫아서, autopilot work-steal-scan 이 열린 `[ ]`/`[~]` 로 읽고 재dispatch → 아니키가 어제 확정·아웃시킨 작업(첫이름 다크톤)을 다시 함 → "엉뚱한데 토큰낭비했네" 질책.

## 증상
- 아니키가 2026-06-03 첫이름 디자인 톤을 **다크블루로 FINAL 확정**하고 대안 3톤 시안을 **아웃**시킴(T-260603-30 `[x]` 완료·배포 LIVE).
- 2026-06-04 autopilot 이 "첫이름 랜딩 다크 프리미엄 톤 **대안 시안** → preview" 를 데스크탑에 분배 → 시안 제작 + preview 2개 배포.
- 아니키: "첫이름 톤 하지말라니까 어제 다끝낸거라고 어이가없네 / 톤이 디자인 아니야??? / 어제 마무리한거 찾아봐 / 엉뚱한데 토큰낭비했네 / 이슈박고 재발방지 박아 타스크 끝난거 박았는데 왜 또".

## 근본 원인 (왜 재발방지가 안 먹혔나)
- 아니키는 **완료된 task(T-260603-30)를 `[x]` 로 마킹**하고 이슈·재발방지도 박음 = 정확히 함.
- 그러나 그 톤 결정이 **무효화한 다른 형제 task 2개**가 안 닫힌 채 열려 있었음:
  - `T-260602-04` (6/2 vrl-benchmark 다크 대안 시안) = `[ ]` 미착수 그대로
  - `T-260601-09` (6/1 v2 랜딩 다듬기) = `[~]` 진행중 그대로
- `work-steal-scan.sh` 의 픽업 소스 = tasks.md 의 `[ ]`/`[~]` **열린 항목 그대로** (의미·결정이력 무시).
- → autopilot 이 "끝난 톤(T-260603-30)"은 안 건드렸지만, **안 닫힌 형제 orphan 2개**를 "아직 할 일"로 보고 재실행.
- 동류 2차: REPL 복구 candidate(T-260530-07)도 "REPL NO-MAIN(죽음)" **전제가 stale**(실제 ALIVE) — 작업 텍스트뿐 아니라 **상태 전제**도 stale 가능.

핵심: **완료 task 마킹만으로 부족 — 그 결정이 죽인 형제/대체 task 도 같이 닫아야 한다.** 그리고 "수동 supersedes 링크" 에 의존하면 사람이 까먹는다(이번이 정확히 그것).

## 즉시 조치 (RECONCILE)
- T-260602-04 `[-]` 취소, T-260601-09 `[-]` 취소 (다크블루 FINAL 로 supersede, 사유·교훈 inline).
- done-but-open 2건 닫음: T-260529-16(next-cycle, PR#99 종결) `[x]`, T-260430-01(단어요 통합, 맥미니 점검) `[x]`.
- T-260530-07(REPL) `[x]` (점검 ALIVE), lottocalc T-260504-03 자율-dispatch-제외 주석(코드fix 완료, 배포=ack게이트).
- cheotireum 메모리 톤 LOCK + queue.md STALE 금지 마커.

## 구조적 fix (mesh-vote SESSION 1780556546, 7모델)
- 5 codex 만장일치: supersedes/closes 링크 + 결정시 연쇄 closure + dispatch 전 decision-log 게이트.
- 🔮 Gemini / 🧠 DeepSeek 이질표 핵심 지적: **명시적 링크는 사람이 까먹으면 무용(=사고 근인)** → 자동/의미기반 검증(전역 state 쿼리 / 키워드 역스캔).
- **종합 채택 = dispatch 전 '의미기반 staleness 게이트'** (수동 링크 비의존):
  1. `work-steal-scan.sh` — "최근 종료/취소 결정" 섹션 + `★ RECONCILE-GATE` 리마인더 출력 (가드 마커, DO NOT REMOVE). 본진 LLM 이 대조할 컨텍스트 노출.
  2. `autopilot/SKILL.md §9.4` — **RECONCILE-GATE 를 dispatch 전 1순위 필수 스텝**으로 박음(가드 마커). 각 후보가 (a) 끝난 결정에 죽은 orphan 인지 (b) 전제(상태주장)가 여전히 참인지 의미 대조 → orphan/stale 이면 dispatch X + tasks.md 닫기. Step 4(e) 흐름에도 연결.

## 노하우 (재사용 룰)
1. **결정이 여러 task 를 무효화하면, 완료 task 만 닫지 말고 죽은 형제·대체 task 도 즉시 `[-]`/`[x]` 로 닫아라.** (단방향 "완료 마킹"으로는 형제 orphan 이 살아남음.)
2. **자동 일감탐색(scan)은 열린 항목을 의미 없이 읽는다 — dispatch 전 "이 항목이 이미 끝난 결정에 죽은 건 아닌지" 의미 대조 게이트 필수.**
3. **수동 링크(supersedes:) 에 의존하지 마라 — 사람이 까먹는다(이 사고가 증거). LLM 의미 대조가 정답.**
4. **작업 텍스트뿐 아니라 "상태 전제"(미구현/죽음/없음)도 stale 가능 — dispatch 전 전제 검증(verify-first).** (REPL ALIVE 케이스, 엔진 mock→실제 3회 차단과 동류.)
5. 이건 아니키가 반복 지적한 "노드·세션 간 싱크/표준화 안 됨" 의 한 갈래 — 완료·확정 상태가 자동화 큐와 desync.

## 관련
- 메모리: project_cheotireum_naming_service(톤 LOCK), feedback_verify_pr_scope_before_directive, feedback_verify_repl_session_before_status_claim
- 동류 사고: 첫이름 "엔진 mock→실제" stale 전제 3회 차단(메모리 동일 파일)
