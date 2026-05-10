---
prevention_deferred: null
---

# Mac mini agent-inbox watcher — wsl/ 무시 + tmux 부재로 inject 양방향 죽음

- **발생 일자:** 2026-05-07 ~ 2026-05-10 (5/7 첫 stuck JSON, 5/10 17:30 KST 진단)
- **해결 일자:** 2026-05-10 18:08 KST
- **심각도:** medium
- **재발 가능성:** medium (새로운 inbox bucket 추가나 stdio 모드 환경 추가 시)
- **영향 범위:** mini 의 process-agent-inbox.sh / 6방향 mesh 통신 중 mini 양방향(🍎↔🏭, 🪟↔🏭)

## 증상
강대종이 "루프런 돌렸는데 맥미니랑 잘 소통 안 되더라" 보고. 6방향 점검 결과 mini 의 `~/agent-inbox/wsl/` 에 5/7~5/9 분 wsl→mini 메시지 7건이 stuck (자기소개/ping/debug 류). mini watcher 가 launchd 등록·30s 폴링·stderr 비어있는데도 wsl 발 메시지를 한 번도 처리하지 않음. macbook/ 발 메시지도 watcher 가 처리는 하나 inject 단계에서 "tmux session 'claude' not found" 로그만 쌓임.

## 원인
mini `~/.claude/automations/scripts/process-agent-inbox.sh` 의 두 가지 결함:

1. **`INBOX_DIR="$HOME/agent-inbox/macbook"` 단일 변수** — 87줄 for-loop 가 macbook/ 만 순회하고 wsl/ 는 본 적 없음. wsl/ 디렉터리는 `inbox-write.sh --from wsl --to macmini --remote` 가 적재만 하고 가져갈 사람 없는 사일런트 dropbox.
2. **mini 에 tmux 'claude' 세션 부재** — Codex 가 `codex app-server --listen stdio://` 로 도는 환경. watcher 의 inject 경로는 `tmux send-keys -t claude` 인데 그 세션이 존재하지 않으니 메시지가 들어왔어도 inject 무의미. fallback 도 로그 한 줄 외엔 없음.

부수: TELEGRAM_BOT_TOKEN_MACMINI 토큰은 `~/.claude/channels/telegram/.env` 에 정상 박혀있어서 봇 sendMessage 채널은 처음부터 살아있었음 (codex-directive.sh 가 이 패턴). watcher 만 그 채널을 안 쓰고 tmux 에 의존.

## 조치
mesh-vote(🍎🪟🏭 3기기 병렬 브레인스토밍 + 상호 투표) 결정: **B(b1)→A→C 순**.

### 패치 (한 파일)
mini `~/.claude/automations/scripts/process-agent-inbox.sh` (89줄 → 89줄, +`*.bak-1778403974` 백업):
- **A**: `INBOX_DIR` 단일 → `INBOX_DIRS=( "$HOME/agent-inbox/macbook" "$HOME/agent-inbox/wsl" )` array 2개 순회. PROCESSED_DIR 은 루프 안에서 동적 set.
- **B(b1)**: 새 함수 `send_codex_chat()` 추가 — `TELEGRAM_BOT_TOKEN_MACMINI` + `TELEGRAM_CHAT_ID_MACMINI` (없으면 `TELEGRAM_CHAT_ID` fallback) 로 sendMessage. inject 부분(73~80줄 tmux send-keys 블록) 을 `if send_codex_chat "$msg"; then ... else ... fi` 로 교체. send_typing 함수는 그대로 유지.

### 사전 정리 (Codex spam 방지)
mini `~/agent-inbox/wsl/*.json` 7건을 `~/agent-inbox/wsl/.processed/` 로 mv 후 패치 적용. 5/7~5/9 의 과거 메시지가 한꺼번에 Codex 챗에 spam 되는 거 방지.

### Dry test 통과
1. 새 JSON 1건을 mini wsl/ 에 적재 → `bash process-agent-inbox.sh` 직접 실행 → wsl/ 잔여 0 + .processed/meshvote1 도달 + 로그 `2026-05-10T18:06:41+0900 sent to Codex via telegram bot`.
2. 역방향 운반체: mini `mac-report.sh` → 본진 tmux 'claude' 그룹에 paste 도달 (267 bytes), mini `codex-to-wsl.sh` → mini→mac→wsl 2-hop relay 도달.

### 결과
6/6 mesh 채널 모두 회복. 패치 후 macbook ↔ mini 와 wsl ↔ mini 양쪽 inbox 라우팅이 같은 watcher 한 사이클로 처리됨.

## 예방 (Forcing function 우선)
1. **새 inbox bucket 추가 시 INBOX_DIRS array 에도 반드시 추가** — `inbox-write.sh` 가 새 `--from <X>` 값을 받기 시작하면 mini 의 `~/agent-inbox/<X>/` 가 생성되는데 watcher 가 자동으로 순회 안 함. 패치한 파일 줄 7 의 array 만 보면 됨.
2. **stdio 모드 / tmux 부재 환경에선 `tmux send-keys` inject 패턴 절대 금지** — Codex(stdio), 추후 Hermes/Jarvis 류 stdio 챗봇 추가 시 같은 함정. 항상 Telegram 봇 sendMessage 채널로 우회.
3. **inbox bucket 별 처리 카운트 모니터링** — watcher 로그에 "$inbox processed=N" 한 줄 누적시키고, 24h 동안 wsl/ 처리 0건이면 텔레그램 경고 (구현 미완, 차후).

## 재발 이력
(처음 생성)

## 관련 링크
- 이전 유사 이슈: `2026-05-08-codex-inject-websocket-silent-fail.md` (다른 운반체 codex-directive.sh 의 silent ok 문제), `2026-05-09-wsl-agent-msg-notify-bot-blocked.md` (WSL→Mac 봇차단)
- 노하우: `knowhow/mini-agent-inbox-bot-bridge.md` (이번 패치 패턴 정리)
- mesh-vote 세션: `~/tmp/mesh-vote/1778403512/` (3기기 안 + 투표 + 결과)
- mini 백업: `~/.claude/automations/scripts/process-agent-inbox.sh.bak-1778403974`
