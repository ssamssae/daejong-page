# 세션 재진입 stale 재실행 루프 — 맥미니가 끝낸 빌드·업로드·스샷을 반복

- 날짜: 2026-06-17 (01:0x~01:2x KST)
- 노드: 🏭 맥미니 (한줄일기 1.2.0 배포 위임 수행 중)
- 분류: 자동화 / stale 방어 / 멱등성
- 관련: docs/2026-06-17-idempotent-step-ledger-stale-anchor.md · [[feedback_anti_stale_lifecycle]] · [[project_stale_sync_architecture]] · 노하우 2026-06-17-stale-anchor-idempotent-step-ledger

## 증상

한줄일기 1.2.0 배포를 맥미니에 위임. 맥미니가 버전 bump·릴리스 빌드(AAB/ipa)·Play internal 업로드·iOS ASC 업로드·스토어 스크린샷까지 끝낸 뒤, **OpenAI/Anthropic API 정지로 세션이 끊겼다가 재진입**. 재진입한 세션이 옛 핸드오프 노트("P1 머지게이트" 등 stale)를 다시 읽고 **이미 완료한 빌드·업로드·스크린샷을 처음부터 다시 실행**. 아니키가 "했던거 또하고 스샷 또 찍는다 stale 좀 알려줘"로 지적.

## 타임라인

- 00:5x 맥미니 1차 보고: 빌드·업로드·ASC 버전 생성까지 완료, 본진 게이트로 핸드오프.
- 01:0x 맥미니 세션 API 정지 → 재진입. 재진입 세션이 stale 핸드오프 재독 → 완료 작업 재실행 조짐.
- 01:1x 아니키 지적("스테일 제발 좀 알려줘 작업내용 확실하게 박아줘").
- 01:1x 본진: ground-truth(완료 8종 + 남은 2개)를 tasks.md SoT 에 못박고, 맥미니에 "끝난 건 재실행 금지 + ASC/Play 실측 후 남은 2개만" STALE 앵커 디렉티브 발사.
- 01:1x 맥미니: 앵커대로 빌드·업로드·스샷·재검증 일절 안 하고 실측 확인 후 Android production 출시 + iOS 심사제출만 수행. 루프 차단됨.

## 근본 원인

세션 재진입은 컨텍스트를 prose(핸드오프·task details)로 복원한다. prose 는 sub-step 완료를 **기계가 체크 가능한 형태로** 담지 않으므로, 재진입 세션은 "이미 빌드함"을 안전하게 판정하지 못하고 가장 안전해 보이는 선택(재실행)을 한다. = **멀티스텝 in-flight 작업의 멱등성 부재.**

기존 stale 방어(task-ID 커밋링크·자동 [x] sweep·dedup·action-ledger log)는 "task 존재 시 상태 드리프트"와 "커밋 없는 외부영향"을 잡지만, "세션 재시작 시 sub-step 재실행"은 별도 사각이었다.

## 해결 (재발방지 아키텍처)

3레이어 (상세 = docs/2026-06-17-idempotent-step-ledger-stale-anchor.md):

1. **(LIVE) 멱등성 스텝 레저** — `action-ledger.sh step-done <task> <step> [artifact]` 로 비싼 스텝 완료 기록 + `step-check <task> <step>` 로 재실행 전 멱등 질의(전 노드 합산, exit 0=skip). 구현·테스트 5/5 통과.
2. **(컨벤션) STALE 앵커** — 멀티스텝 위임 디렉티브에 "이미 DONE(재실행 금지) + step-check/step-done 지시 + 남은 N개"를 못박음. 이번 사고를 즉시 차단한 수동판의 표준화.
3. **(스테이징) observe 훅** — `idempotent-step-guard.sh` PreToolUse 가 비싼 배포 명령에서 fresh 완료 step 감지 시 경고. 차단형이라 observe-canary(본진→fp관찰→5노드) 롤아웃, 무인 강행 X.

## 교훈

- **멱등성은 prose 가 아니라 ledger 로.** 재시작 세션은 글을 다시 읽지만 글은 멱등 판정을 못 한다.
- **비싼 스텝 실행 전 "이거 이미 했나?"를 기계에 물어라.** 같은 노드 재시작은 로컬 레저만으로도 차단.
- **위임엔 STALE 앵커 의무.** "끝난 것/남은 것"을 명령에 박으면 재진입 세션이 헛돌지 않는다.
- 가장 비싼 자동화 실수는 실패가 아니라 **이미 한 일을 모르고 다시 하는 것**.
