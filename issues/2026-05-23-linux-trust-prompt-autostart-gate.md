# 2026-05-23 — Linux 노드 챗봇 autostart trust prompt 게이트 (PASS)

## 증상

형님이 노트북(💻, @ssamssae_codex_bot) 수동 재부팅 후 텔레그램 봇이 자동으로 안 붙음. "ㅎㅇ" 4건 응답 0. 본진 진단 시 systemd-user `claude-chatbot.service` 가 `active(exited)` 상태이고 tmux 'claude' session 도 살아있고 claude process(pid 340) 도 도는데 tmux pane 캡처가 trust prompt 화면에서 정지: "Quick safety check ... ❯ 1. Yes, I trust this folder / 2. No, exit". 본진에서 `r`(노트북 main session) → `cc`(claude grouped) 진입해도 같은 이유로 화면 안 그려져 멈춤.

## 진짜 원인

Linux 의 Claude Code 는 비대화형 환경에서 시작될 때 매번 workspace trust prompt 를 띄움. 형님 보강 정보(msg23131) — "맥미니 맥북은 1 2 안떠 근데 우분투 3노드는 뜨더라고 선택지가 1 항상 눌러서 로그인했었음". 즉 OS-specific 동작: macOS 는 trust 우회 메커니즘이 있고 Linux 는 매 부팅마다 prompt 가 다시 뜸. systemd 가 stdin 을 TTY 로 안 주니까 답을 입력할 방법 없음 → 무한 정지.

검증 과정에서 두 가설 먼저 틀림:
1. **`--dangerously-skip-permissions` 가 trust 도 우회한다** (맥미니 패턴 흉내) — 박았는데 trust prompt 그대로 떴음.
2. **사람이 한 번 1 박으면 어딘가 저장된다** — restart 했더니 trust prompt 다시 떴음. Linux 에선 저장 X.

세 번째 시도가 진짜 답.

## Fix (ExecStartPost 자동 Enter)

`~/.config/systemd/user/claude-chatbot.service` 에 다음 한 줄 추가:

```
ExecStartPost=/bin/bash -c 'sleep 6 && tmux send-keys -t claude Enter'
```

ExecStart 가 tmux new-session -d (background) 로 즉시 return → ExecStartPost 가 6초 대기 (claude binary 가 trust prompt 띄울 시간) → tmux send-keys Enter (디폴트 ❯ 가 "1. Yes, I trust" 에 박혀있어 Enter 만으로 통과).

3노드 통일 sed 한 줄:
```bash
sed -i "/^ExecStop=/i ExecStartPost=/bin/bash -c 'sleep 6 && tmux send-keys -t claude Enter'" ~/.config/systemd/user/claude-chatbot.service
```

`claude --dangerously-skip-permissions --channels ...` 플래그는 trust 우회 아니지만 permission prompt 우회용으로 같이 박아둠 (맥미니와 동일 패턴, risk 새로 도입 X).

## 검증 (PASS)

노트북 진짜 Windows 재부팅 검증:
- 재부팅 발사 23:41:44 KST (`/mnt/c/Windows/System32/shutdown.exe /r /t 0`)
- SSH 복귀 23:42:43 KST
- claude polling 23:42:55 KST ("Listening for channel messages")
- pending_update_count = 0, last_error = none
- 형님이 그 사이 보낸 "ㄷㅚ냐"/"되냐" 노트북 봇이 즉시 받아 처리
- **총 1분 11초만에 사람 손 0 풀복구**

추가 검증: 본진 `r` → `cc` 노트북 진입 freezing 도 같은 뿌리로 자동 해결 (형님 msg23135 확인).

## Fan-out (PASS)

라이젠(🪟 @Myclaude2_ssamssae_bot) + 데스크탑(🖥 @jarvice_ssamssae_bot) 동일 sed 한 줄씩 fan-out 완료. 3노드 systemd unit 본문 동일이라 명령 한 줄로 통일.

## 라이젠 2층 게이트 — bun PATH 부재 (별도 fix)

라이젠 fan-out 후에도 봇이 폴링 안 함 (pending=9 쌓임, "Listening for channel messages" 출력만 떠도 false positive). 본진이 /mcp 메뉴 확인 → `plugin:telegram:telegram · ✘ failed` + ENOENT. 추가 진단:

- plugin telegram 의 시작 Command 가 `bun run --cwd ... start` (사진 첨부 확인)
- 라이젠 bun 위치 = `/home/ssamssae/.bun/bin/bun` (1.3.12) — 표준 bun 설치 위치
- 데스크탑 bun 위치 = `/home/user/.npm-global/bin/bun` (1.3.13) — npm-global 거쳐 설치
- 라이젠 unit Environment PATH 에 `%h/.bun/bin` 부재 → bun 못 찾음 → ENOENT
- 데스크탑은 PATH 에 `%h/.npm-global/bin` 있어서 OK

Fix = sed 한 줄로 PATH 맨 앞에 `%h/.bun/bin:` 추가:
```bash
sed -i 's|Environment=PATH=%h/.local/bin|Environment=PATH=%h/.bun/bin:%h/.local/bin|' ~/.config/systemd/user/claude-chatbot.service
```

검증: restart 후 /mcp 메뉴에서 `plugin:telegram:telegram · ✔ connected · 4 tools` + pending_update_count=0 PASS. 형님 라이젠 수동 재부팅 검증 + `w` alias 진입 + cc grouped attach 까지 풀그린.

**교훈** — 노드별 bun 설치 위치 다름. systemd unit PATH 표준화 시 `~/.bun/bin` + `~/.npm-global/bin` 둘 다 박는 게 안전. 데스크탑/노트북도 향후 bun 위치 바뀌면 같은 사고 가능성 — 다음 unit 표준 갱신 시 두 디렉토리 다 포함 권장.

**Bonus 사고** — 본진이 진단 중 `rm -rf ~/.claude/plugins/cache` 명령으로 plugin cache 통째 삭제 (캐시 corruption 가설 시도). 실제 원인은 cache 와 무관 (bun PATH) — cache 는 dynamically configured 라 plugin 본문은 marketplaces/ 디렉토리 사용. 그래도 cache 삭제는 무영향 가역 (자동 재생성). 다음 진단 시 cache rm 보다 read-only 진단 (find + which + journal) 먼저 시도.

## 다음

- 5노드 챗봇 자가복구 헬스체크 (cron 으로 getWebhookInfo polling, dead detect 시 텔레그램 알림) — backlog.
- Mac 2노드는 launchd 기반이라 별 메커니즘 — 본 fix 영향권 X.
- session-start-next-cycle-inject.sh line 45 unbound variable hook 에러 — 별 진단.
