# 2026-05-24 본진→WSL ack 운반체 누락 — 형님 WSL 채팅 침묵 사고

**날짜**: 2026-05-24 20:25~20:43 KST (약 18분)
**노드**: 🍎 본진 (root cause) / 🪟 WSL (피해)
**심각도**: medium — 작업은 정상 진행됐으나 형님이 WSL 채팅에서 ack 답 기다리며 침묵 사고, 본진이 무관한 (f) 작업 진행 중 인지 못 함

---

## 증상

형님이 WSL 채팅(@Myclaude2_ssamssae_bot) 에서 본진에 "Gmail 배너 건 본진에 공유" directive 발사 (20:25 KST). WSL 챗봇이 mac-report.sh 로 본진 tmux 에 paste + WSL 채팅에 "본진에 directive 1078 bytes 송신 완료. 본진이 보고 추가 안내 필요하면 회신할 거고, 액션 없으면 ack 만 올 거야" 안내.

본진은 turn 안에서 system-reminder 로 WSL 컨텍스트 받고 (i) 픽 (fetcher 유지) 처리 + 본진 채팅(🍎) 에만 결과 보고. **WSL 채팅으로 reverse ack 발사 누락**.

20:42 KST 형님 본진 채팅에 "라이젠 기다리는데 답변은 안줄꺼니" (msg 23772) + WSL 채팅 스크린샷 첨부 → 본진이 ack 누락 인지.

---

## 진단

CLAUDE.md 의 cross-device 송수신 § 절차:
- forward path (노드→본진): mac-report.sh 자동 paste (행위자 = 송신 노드 챗봇)
- reverse path (본진→노드 ack): `*-directive.sh -f <body>` 명시 호출 필수 (행위자 = 본진)

본진은 forward 만 받았으면 자동 인지하지만 reverse 는 *명시적 호출* 안 하면 안 감. 본진 채팅에 보고하면 그게 노드 채팅에도 mirror 될 거라는 잘못된 가정이 root cause — 텔레그램 봇별 채팅이 완전 분리돼있어 본진 봇 reply 가 WSL 봇 채팅에 노출되지 않음.

추가 원인: 본진이 (i) 픽 받고 자동 (f) 진입한 chain 안에서 reverse ack 단계가 빠짐. [[feedback_result_report_next_step_chain]] 룰이 결과 → next-step chain 묶으라고 했는데, 그 chain 에 "원 노드 ack" 단계가 명시되지 않아 침묵 누락.

---

## Fix

1. 새 메모리 박음: [feedback_two_channel_ack_after_cross_routing](../memory/feedback_two_channel_ack_after_cross_routing.md)
2. MEMORY.md 인덱스에 한 줄 추가 (`feedback_cross_routing_through_master` 다음 라인)
3. 즉시 ack 발사: `~/claude-automations/scripts/wsl-directive.sh -f /tmp/wsl-ack-gmail-banner.txt` (650 bytes, 20:43 KST)
4. WSL 챗봇 ack 응답 도착 확인: `[🪟→🍎] [ack] POP3 fetcher LIVE 컨텍스트 받음 ... WSL 측 추가 액션 없음` (paste msg)

---

## 룰 보강

본진 응답 발사 시 forcing function 한 줄:
- 노드→본진 directive 라우팅으로 도착했으면 응답 시 **본진 채팅 reply + 원 노드 `*-directive.sh -f` 둘 다 발사**
- ack body 본문 = 디렉티브 외부발신 본문 글자 그대로 룰 적용 (`[본진→🪟]` 자율 prefix X)

다음 단계 = hook 박을지 검토 (PreToolUse 로 reply 톨 호출 시 cross-routing 컨텍스트 인지하면 directive 발사 미수행 시 경고). 같은 사고 1회 더 나면 hook 진입.

---

## 연관 메모리·이슈

- [[feedback_cross_routing_through_master]] — 노드 간 직접 X, 본진 경유
- [[feedback_apology_triggers_postmortem]] — 사과 시 5단계 자율 진행 (이 이슈가 그 룰의 결과물)
- [[feedback_result_report_next_step_chain]] — chain 안에 "원 노드 ack" 명시 안 됨 → 본 메모리로 보강
- CLAUDE.md `## 크로스 디바이스 송수신` — reverse path mandatory 한 줄 강조 필요 (별 사이클 carryover)
