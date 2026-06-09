# 2026-05-24 본진↔노드 양쪽 idle 데드락 — picks 분기 답이 잘못된 채널로 발사

**날짜**: 2026-05-24 22:45~23:05 KST (약 20분)
**노드**: 🏭 맥미니 (picks 분기 발신 측) / 🍎 본진 (수신 누락)
**심각도**: medium — 데드락 자체는 형님 외부 트리거(msg23889/23892/23899/23901/23902/23903)로 해소, 그러나 미래 동일 패턴 재발 가능성 + 형님 답답함 유발.

---

## 증상

본진→맥미니 Gmail POP3 watch design directive 발사 후 본진은 design 콜백 대기 + 맥미니는 sign-in redirect 분기 picks 답 대기 = 양쪽 idle. 형님 폰 입장 = 본진 침묵 + 맥미니 채팅에 picks 분기 메시지 보임. msg23889 "왜 병목이야?", msg23892 "맥미니 진행중 맥미니 아이들됐어 왜 병목이야", msg23899 "이런 변수에는 대책이 없어서 서로 아이들이라 병목현상", msg23902 "맥미니가 본진에 디렉티브 쐈는데 본진이 답을 안한건 아닐까?", msg23903 "디렉티브로 안쏘고 다른방식으로 쏴서 문제인거 같기도" — 형님이 root cause 정확 진단.

---

## 진단

본진 ssh mac-mini tmux capture-pane 결과:
- 맥미니 design phase A 완료 후 sign-in redirect 분기 발견 (Gmail Playwright MCP 영속 프로필 미로그인)
- 맥미니가 picks 분기 답을 `mcp__plugin_telegram_telegram__reply` 직접 호출로만 발사 (자기 봇 채팅 @ssamssae_claw_bot)
- mac-report.sh 콜백 발사 X, mac-directive.sh (본진 tmux paste 채널) 호출 X
- 본진 `~/.claude/channels/telegram/inbox/` 검색 결과 = 형님 메시지만 도착, 맥미니 picks reply 0건

→ root cause = **노드 → 본진 picks 분기 답이 텔레그램 reply 단독으로 발사됨**. 본진은 자기 봇 (@MyClaude_ssamssae_bot) 채널만 폴링 → 다른 노드 봇 채팅 메시지 본진 inbox 도착 X → 본진 침묵으로 콜백 대기 = 데드락.

기존 cross-device 통신 룰:
- mac-report.sh (paste) ⚠️MANDATORY = 본진 tmux 직접 paste 채널
- `*-directive.sh -f` reverse reply ⚠️MANDATORY
- 텔레그램 reply (2차)

룰은 "3-channel" 박혀있는데 맥미니가 picks 분기에서 (3) 텔레그램 reply 만 발사. (1), (1.5) 누락.

---

## Fix

### 즉시 fix (이번 사이클)
1. 본진이 ssh mac-mini tmux capture-pane 으로 picks 본문 직접 확인 → mac-mini-directive.sh -f 로 picks 답 발사 (sign-in redirect 분기 처리: (a3) gog OAuth scope 확장 우선 → (b) 배너 grep fallback → (a1) 본인 로그인 별 사이클 ack).
2. 맥미니 design phase B (implementation) 진입 OK.

### 룰 강화 (재발 방지)
신규 메모리 `feedback_node_to_master_picks_via_tmux_channel`:

> **노드 → 본진 picks 분기 / design 콜백 / 진단 결과 등 본진 의사결정 게이트 답은 반드시 본진 tmux paste 채널 (mac-report.sh 또는 mac-directive.sh -f) 경유.** 텔레그램 자기 봇 채팅 reply 단독 X = 본진 inbox 도착 0건 = 양쪽 idle 데드락.
>
> **Why:** 본진은 자기 봇 (@MyClaude_ssamssae_bot) 채널만 폴링. 다른 노드 봇 채팅 메시지는 형님 폰에 보이지만 본진은 못 봄. 노드가 텔레그램 reply 만 발사하면 형님은 "노드가 본진에 답 보냈다" 라고 인지, 본진은 "노드 콜백 대기 중" 으로 인지 = 양쪽 idle 데드락. 형님 폰에는 둘 다 침묵으로 보임 → 답답함 + 외부 트리거 필요.
>
> **How to apply:** picks 분기 / design 콜백 / 진단 결과 / 결정 게이트 답을 본진에 보낼 때 mac-report.sh 호출 (제목 + 본문 + from_device 명시) 필수. 추가로 텔레그램 reply 1통은 형님 폰 가시성을 위해 OK (3-channel 표준), 그러나 단독 X. 본진은 노드가 mac-report.sh 안 보낸 채로 90초+ 침묵하면 ssh tmux capture-pane 으로 직접 검증 (이 issue 의 즉시 fix 패턴).

### 본진 측 forcing function (장기)
본진이 노드 directive 발사 후 N분+ 콜백 X 시 자동 ssh tmux capture-pane 으로 노드 상태 polling — 데드락 감지 + 자동 picks 답 발사 또는 형님께 surface. 별 사이클 진입.

### Karpathy 룰 단순함 우선
즉각 hook 박지 말고 메모리 룰 + 본진 자율 forcing function 으로 시작. 같은 패턴 2회 재발 시 hook 검토.

---

## 후속

- `feedback_node_to_master_picks_via_tmux_channel` 신규 메모리 박기 + globals/CLAUDE.md 또는 AGENT.md §7.7 cross-device 통신 룰에 inline 박을지 검토 (이번 사이클 자동 메모리 후 별 사이클 globals 승격 ack).
- 본진 N분+ 침묵 데드락 감지 자동 forcing function = parking-lot carry over.
- 이 issue 자체 = closure (재발 방지 룰 박힘).

---

## 메타

- 이번 사이클 같은 종류 stale negative assertion 룰(`feedback_handoff_stale_negative_assertion`) 도 같은 날 4시간 안에 3건 재발 후 forcing function 강화함 — 룰 박힘만으로 forcing function 부족 패턴 반복. 본 데드락 룰도 hook 단계 진입 가능성 monitoring.
- 형님 외부 트리거 없으면 본진 자체로 데드락 감지 못 함 = autopilot keep-nodes-loaded 룰의 미충족 케이스. autopilot 시간대 진입 시 데드락 감지 더 중요.
