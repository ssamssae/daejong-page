# 자동 디스패처 staleness 게이트 — 채택 설계 (T-260606)

2026-06-06 mesh-vote(🖥데스크탑·💻노트북·🏭맥미니·🤖GPT 4표) 수렴 + 아니키 "설계채택" 결정.
**상태: 설계 채택, 빌드는 별도 task (MVP=L1 결정론부터).**

## 문제
codex-night-cycle / manual-dispatch 가 tasks.md 에서 task 를 결정론적으로 픽업·발사하는데,
이미 끝난 결정으로 superseded/stale 된 task(죽은 orphan, 전제 무효)를 거르는 게이트가 약함.
stale 발사 = 토큰 낭비 + 잘못된 작업. (예: 밥먹자/babmeokja repo 부재, T-260512-05 이미 PR#62 완료.)

## 채택 설계: 발사 직전 2단 게이트 (발사분 1건에만, 백로그 전체 스캔 X)
- **L1 결정론 (0토큰, MVP 먼저)** — 픽 직후 발사 직전 체크:
  - task-ID 가 이미 git log/PR 에 커밋·머지됐나
  - 대상 버전/파일이 이미 목표 상태인가 (참조 artifact 실측: 파일 존재? "미구현"인데 생겼나?)
  - tasks.md status 가 이미 [x]/[-] 인가 + 자동 [x] sweep
  - 보류/ack 마커(크레덴셜·외부발송·HOLD) 있나
  - supersedes 마커/형제 link 로 닫힌 것인가
  → 대부분 stale 여기서 잡힘 (실측: 2026-06-06 세션 stale 7건 전부 L1 결정론만으로 판별됨)
- **L2 경량 LLM (잔여만, 2차)** — L1 통과한 "애매" 후보만 1콜 premise-verify:
  - task + 현 repo 상태(버전·최근 커밋·관련 tasks.md) → STALE/LIVE 판정
  - STALE 이면 발사 말고 skip + 아니키 flag + tasks.md 표기(재픽 루프 차단)
- **GPT 추가(선택)**: task 에 precondition_hash/origin_decision/epoch 박아 발사 직전 HEAD 와
  재검증, 불일치면 quarantine.
- **노트북 제안(권장)**: 게이트 통과 task 에 verifiable done-signal(수락조건) 부착 의무화 →
  task 자기검증 가능.

## 빌드 순서
1. MVP = L1 결정론만 (비용 0, 다수 커버). 2. 운영 보며 L2 LLM 폴백 추가. 3. precondition_hash/done-signal 점진.

근거 기존 [[feedback_close_sibling_tasks_and_staleness_gate]] · [[project_stale_sync_architecture]] 와 정합.
