# 2026-05-31 USER-QUERY 라우팅 갭 — 노드 경유 유저질문의 답이 발신챗 아닌 본진챗으로 빠짐

## 발생 시각
2026-05-31 (노트북 핸드오프 + 아니키 2회 발화: "작업 받아서 하면 텔레그램 가시적 알림 필요 / 5노드 표준화")

## 노드
🍎 Mac 본진 + 노드 4대(🪟🏭🖥💻) 공통 — cross-device USER-QUERY 흐름

## 분류
**신규** (root cause 다름). 증상은 2026-05-13 reverse-reply-missed / 2026-05-19 telegram-reply-missed 와 겹치나(채널 누락 계열), **근본 원인이 다름** — 기존 둘은 "본진이 회신 채널 자체를 빼먹음", 본 건은 "**회신을 보내긴 하지만 발신 origin chat_id 가 페이로드에 동봉 안 돼서 본진이 자기 챗으로 답함**". 아니키 1줄 컨펌 대기 항목(신규로 잠정 분류, 본진 판단).

## 증상
아니키가 노드(예: 💻 노트북) 봇 챗에서 질문 → 노드가 본진에 포워딩(mac-report / mac-directive) → 본진이 처리·답변. 그런데 답이 **발신 노드 챗(💻, 아니키가 물어본 곳)이 아니라 본진 챗(🍎)으로 빠짐**. 아니키 입장에서 자기가 물어본 챗에 답이 안 와서 "답 어디갔냐" 혼선.

## 근본 원인
1. **노드→본진 포워딩 페이로드에 발신 origin chat_id/노드가 동봉 안 됨** — 본진은 "이 보고가 어느 챗에서 시작된 유저질문인지" 알 방법이 없어 디폴트로 자기 챗(🍎 538806975)에 답함.
2. reverse-reply 자체는 기존 hook(`mac-report-reverse-reply-check.sh`)이 mac-report paste 에 대해 강제하나, "**어느 챗으로**" 라우팅하라는 신호가 없었음.
3. 인터럽트(작업 중 새 메시지 도착)가 Stop 훅을 우회할 수 있어 reverse-reply 타이밍도 늦어짐.

## 조치 (픽스 A/B/C)
### 픽스A — mac-report.sh USER-QUERY 마커 (코드, LIVE)
- `mac-report.sh` 에 env-gated 마커 추가: `MAC_REPORT_ORIGIN_CHAT` + `MAC_REPORT_ORIGIN_NODE` 둘 다 set 시 페이로드 title 줄 뒤에 `[USER-QUERY origin_chat=<id> origin_node=<emoji>]` 1줄 삽입.
- title 줄 **뒤**에 삽입 → reverse-reply hook 정규식(`^(\[[^]]*\])?\[Mac report title:`) 및 mirror chain 무영향. env 없으면 출력 0 변화(바이트 동일, isolation 테스트로 검증).
- 노드가 유저질문 포워딩 시 호출 예: `MAC_REPORT_ORIGIN_CHAT=538806975 MAC_REPORT_ORIGIN_NODE=💻 mac-report.sh report.md "질문 포워딩"`.
- 2026-05-31 결혼식 IG 캐러셀 건에서 수동 실증된 흐름을 코드화.

### 픽스B — 본진 reverse-reply FIRST (행동 룰)
- 본진이 `[USER-QUERY origin_chat=X origin_node=💻]` 마커를 보면: (1) origin 노드로 `<node>-directive.sh -f` reverse-reply **FIRST**(인터럽트 strand 방지), (2) 답을 origin 노드 경유로 origin_chat 에 라우팅(노드 stop hook 이 origin_chat 미러), (3) 본진 자기 챗엔 중복 발송 X.
- forcing function: 기존 `mac-report-reverse-reply-check.sh` 가 mac-report paste(이제 USER-QUERY 마커 포함)에 대해 reverse-reply 0회면 이미 block — 별도 hook 수술 불필요.

### 픽스C — 노드 SoT 직접조회 relay (행동 룰)
- 노드가 SoT 직접조회로 답 가능한 질문(자기 repo/파일/상태)은 본진 라운드트립 없이 직접 답. 본진 경유는 본진 SoT(tasks.md 등)·판단·정책이 필요한 질문 한정.

### 작업수신 가시알림 5노드 공통표준 (행동 룰)
- 노드가 directive(non-probe) 수신 → 첫 turn 에 한국어 1줄 "작업 수신: <1줄>, 시작합니다" 출력 → stop hook 자동 미러(아니키 폰 가시).
- 진행 중 1분+ → 기존 typing/heartbeat.
- 완료 → mac-report `노드보고`(가시).
- 신규 스크립트 0 — 기존 인프라(directive notify 명령 + stop hook 미러 + mac-report 노드보고) 조합으로 3단계 가시성 충족. probe/verify 응답(이모지 1자)은 별개.

## 재발 이력
(최초 기록)

## 관련 링크
- 이슈 issues/2026-05-13-mac-report-reverse-reply-missed.md — reverse-reply 채널 자체 누락(형제, root cause 다름)
- 이슈 issues/2026-05-19-mac-report-telegram-reply-missed.md — 본진→아니키 폰 텔레그램 reply 누락(형제, root cause 다름)
- 메모리 [[feedback_user_query_origin_routing]]
- 코드 ~/.claude/automations/scripts/mac-report.sh (픽스A, 심링크 SoT = claude-automations)
- tasks.md T-260531-04
