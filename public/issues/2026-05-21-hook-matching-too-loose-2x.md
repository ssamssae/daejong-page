---
prevention_deferred: null
---

# 훅 매칭 느슨 2건 연속 — telegram-stop-ping tail -1 + reverse-reply-check contains 자기참조

- **발생 일자:** 2026-05-20 ~23:40 KST
- **해결 일자:** 2026-05-21 00:10 KST
- **심각도:** low
- **재발 가능성:** medium
- **영향 범위:** 5노드 claude-automations 훅 2개(telegram-stop-ping.sh, mac-report-reverse-reply-check.sh) + 본진 진단 워크플로우

## 증상
1. WSL 봇 챗에서 reply 정식 답변 아래에 `💬 터미널 응답: <터미널 평문>` 중복 버블이 매 turn 떴다. 다른 4노드는 없음.
2. WSL(송신 노드) 세션에서 `mac-report-reverse-reply-check` 가 헛BLOCK — 송신자는 reverse reply 의무가 없는데도 막힘.

## 원인
공통 패턴 = 두 훅 다 "매칭 조건이 의도보다 느슨 / 엉뚱한 라인 검사".

- **(1) telegram-stop-ping.sh**: 9행 `tail -1` 이 string-content user 마지막 라인을 집는데, paste-heavy 노드(WSL)는 directive paste / Stop훅 피드백이 type=user string 으로 끼어들어, 텔레그램 turn 이라도 마지막 라인이 그 noise → 가드가 엉뚱한 라인 검사 → skip 실패 → 발사. 본진은 텔레그램을 직접 받아 마지막 라인이 텔레그램이라 안 터짐(훅 md5 동일, turn 구조 차이).
  - ★**1차 오진단(틀림)**: "가드가 틀린 키 grep(`"server"` 가 아니라 `source=` 여야 하는 오타)" 으로 봤음. 실측 반박: jq -c 출력에서 `origin.server` 는 JSON 구조 따옴표라 `"server":"plugin:telegram:telegram"` 그대로 출력돼 매칭됨. 반대로 content 안 `source=` 는 `source=\"...\"` 로 이스케이프돼 bare-quote grep 으론 못 잡음. 즉 옛 키는 직접 telegram 라인에선 정상. 이 오진단으로 1줄 sed fix 를 출하했다가 양방향 검증에서 FAIL → 원복.
- **(2) mac-report-reverse-reply-check.sh**: 32행 `contains("[Mac report title:")` 가 마커 포함만 해도 매칭 → directive 가 마커를 '언급'한 텍스트 + 이 훅 자신의 BLOCK 사유가 transcript 에 user 로 재주입된 것까지 매칭(자기참조). 게다가 송신 노드에서도 동작(역할 분리 부재).
- **부수 오류**: 본진이 "본진엔 telegram-stop-ping 훅 없다" 고 단정 → `ls ~/.claude/hooks | grep` 필터에서 'telegram' 키워드를 빼먹은 오독. 실제 5노드 다 등록, md5 동일.

## 조치
- (1) telegram-stop-ping: 가드를 "이 turn 에서 telegram reply tool(`mcp__plugin_telegram_telegram__reply`)을 호출했나"로 교체(중복발송 방지, origin/라인 추측 회피). claude-automations push → 5노드 md5 `0efcf766` 통일.
- (2) reverse-reply-check: **B**(본진 hostname 한정 — 송신 노드 skip) + **A**(마커 앵커 `^(\[[^]]*\])?\[Mac report title:` — 선택적 [FROM→TO] 프리픽스 직후의 진짜 paste 만 매칭, 멘션/자기참조 배제). 5노드 md5 `30abaae1` 통일.
- 양 fix 모두 양방향 검증(positive 탐지 유지 + negative 오탐 제거) 후 출하.

## 예방 (Forcing function 우선)
1. **훅의 매칭/가드 패턴(grep/jq test/contains/tail)은 출하 전 실 transcript 바이트에 대고 positive+negative 둘 다 실측.** positive=진짜 케이스 탐지되나 / negative=오탐 케이스 배제되나. `jq -c` 의 따옴표 이스케이프(content 내 `"` → `\"`) 주의.
2. **검증 안 된 진단으로 fix 출하 금지** — 1차 오진단(상대 framing 앵커링 + 단방향 검증)이 이번 사고의 핵심. cross-device fix directive 의 acceptance bar 에 양방향 검증을 명시(이번 fix2 directive 에 적용함).
3. **훅 매칭은 contains 보다 앵커(^...) 우선** — Stop 훅의 reason 텍스트가 transcript 에 user 로 재기록돼 다음 turn 자기참조로 매칭되는 클래스 주의.
4. 파일 존재/부재 단정 전 정확한 grep(필터에 대상 키워드 누락 없는지) — "없다" 결론 전 `ls` 원본 한 번 더.

## 재발 이력
<처음 생성 — 비어있음>

## 관련 링크
- 훅: `~/.claude/hooks/telegram-stop-ping.sh` (md5 0efcf766), `~/.claude/hooks/mac-report-reverse-reply-check.sh` (md5 30abaae1) — claude-automations
- 메모리: `feedback_no_root_cause_fabrication.md` (다른 기기 보고로 단정 X)
- 관련 원본 사고: `issues/2026-05-13-mac-report-reverse-reply-missed.md` (이 훅을 만든 사고)
