---
prevention_deferred: null
---

# 2026-05-31 본진→아니키 메인 챗 누락 — 텔레그램 origin 아닌 turn 의 본진 보고가 그룹 전용 forward 로만 발사돼 메인 DM 안 뜸

- **발생 일자:** 2026-05-31 16:00 KST (추정 — 첫 그룹 전용 발사 시점)
- **해결 일자:** 2026-05-31 16:13 KST
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** 🍎 본진 — 텔레그램 origin 이 아닌 turn(SessionStart auto-resume / 노드 mac-report 자동 paste / 시스템·cron 트리거 skill)에서의 모든 본진→아니키 완료·진행 보고

## 증상
손0 auto-resume(첫이름 v0 완료) + 데스크탑 경유 insight 발행을 본진이 끝내고 보고했는데, 아니키 메인 챗(DM)에 아무것도 안 떴다. 아니키 "멈춘거같은데 텔레그램에 오지를 않네 답변이"(msg29174) → "메인쳇에 왜 누락된거야 이거 이슈인데?"(msg29176). 작업은 정상 완료됐고 그룹(Agent Mesh Mirror)에는 미러됐으나, 메인 DM 만 비어 아니키가 "멈춤"으로 오인.

## 원인
1. **본진 보고를 `forward-to-group.sh macbook` 단독 호출로 보냄** — 이 스크립트는 `TELEGRAM_CHAT_ID_GROUP`(Agent Mesh Mirror 그룹) 전용. 아니키 메인 DM(`TELEGRAM_CHAT_ID`)으로는 애초에 안 간다.
2. **해당 turn 들이 텔레그램 origin 이 아님** — SessionStart auto-resume, WSL mac-report 자동 paste, 시스템 트리거 insight 요청은 모두 incoming chat_id 가 없어 `reply` 툴을 못 쓴다. 그래서 본진이 "그룹 forward" 한쪽만 골라 발사.
3. **본진→아니키 DM proactive push 전용 경로가 부재** — 다른 watcher(gmail/korail 등)는 Mac 봇 토큰으로 아니키 chat 에 직접 sendMessage 하지만, 본진 보고용으로 묶인 표준 헬퍼가 없어 매번 forward-to-group 으로만 흘렀다. 표준("본진→아니키 보고 = 아니키 봇 챗 + 그룹 둘 다")의 (a) 채널이 구조적으로 빠져 있었음.

## 조치
1. **신규 헬퍼 `bonjin-report.sh` (코드, LIVE)** — `~/.claude/automations/scripts/bonjin-report.sh`. 한 번 호출로 (a) Mac 봇 토큰 → 아니키 DM(`TELEGRAM_CHAT_ID`) sendMessage + (b) `forward-to-group.sh macbook` 그룹 미러 둘 다 발사. decrypt-run re-exec 표준 패턴 + stdin("-")/파일 인자 지원. dual-channel 누락 방지 `⚠️ 제거 금지` 가드 마커 박음.
2. **self-test 검증 PASS** — 헬퍼로 검증 메시지 1통 발사 → `✅ 본진 보고 → 형님 DM` + `✅ 본진 보고 → 그룹` 양쪽 성공, 아니키 메인 챗 도착 실측 확인.
3. `forward-to-group.sh` 자체에 dual-channel 을 접어 넣는 안도 검토했으나, 공유 스크립트 의미 변경(surgical 위반) 회피 위해 전용 헬퍼 분리 채택.

## 예방 (Forcing function 우선)
- **본진이 텔레그램 origin 아닌 turn 에서 아니키께 보고할 땐 `forward-to-group.sh` 단독 금지 — 반드시 `bonjin-report.sh` 사용** (형님 DM + 그룹 동시). 이 룰을 `feedback_bonjin_report_dual_channel` 메모리로 박아 매 세션 로드(세션-로드 forcing function). insight 등 기존 forward-to-group macbook 직접 호출부도 점진 전환.
- 헬퍼에 `⚠️ 제거 금지` 가드 마커 + 이슈 경로 주석 → guard-comment-protect hook 이 무단 제거 deny.
- (검토됨, 미채택) forward-to-group.sh macbook 호출 시 자동 DM 동반 — 공유 스크립트 의미 변경이라 보류. 재발 시 이 안으로 승격.

## 재발 이력
(최초 기록)

## 관련 링크
- 코드: `~/.claude/automations/scripts/bonjin-report.sh` (신규, 심링크 SoT = claude-automations)
- 형제 이슈: `issues/2026-05-31-user-query-origin-routing-gap.md` (노드 경유 유저질문 라우팅 갭 — root cause 다름)
- 형제 이슈: `issues/2026-04-20-terminal-only-reply-missed-telegram.md` (터미널에만 답하고 reply 누락 — root cause 다름)
- 텔레그램 메시지: 누락 신호 msg29174 / "이거 이슈" msg29176
