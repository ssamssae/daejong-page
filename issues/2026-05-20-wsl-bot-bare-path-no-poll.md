---
prevention_deferred: null
---

# 2026-05-20 — WSL 텔레그램 봇 무응답: 비대화형 ssh 기동 → bare PATH(node 누락) → 플러그인 폴링 정지

- **발생 일자:** 2026-05-20 11:59 KST
- **해결 일자:** 2026-05-20 12:10 KST
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** 모든 노드(WSL/맥미니/데스크탑/노트북)의 claude tmux 세션을 본진에서 원격 재기동할 때. 텔레그램 채널 플러그인(node 기반) 전반.

## 증상

WSL Claude Code 2.1.145 업데이트 후 세션을 재기동했는데 WSL 봇((WSL 봇))이 메시지에 답을 안 함. 형님이 "ㅎㅇ", "되네" 등을 보내도 무반응. 세션 화면엔 "Listening for channel messages from: plugin:telegram" 이 떠 있어 정상처럼 보였음.

## 원인

2단계로 겹친 실수. 둘 다 **비대화형 ssh 기동**에서 비롯.

1. **1차 (가벼움):** 세션 재기동을 `tmux new-session -d -s claude "claude"` 로 함 → `--channels plugin:telegram@claude-plugins-official` 플래그 누락 → 텔레그램 채널 자체가 안 붙음. (`cc` 래퍼는 이 플래그를 항상 붙임.)
2. **2차 (진짜 근본 원인):** 플래그를 붙여 다시 띄워도(`ssh wsl 'tmux new-session -d -s claude "claude --channels ..."'`) 여전히 무응답. claude 프로세스 PATH 가 bare(`/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:...`)로 떠서 **node(nvm v24.15.0) 경로가 빠졌음.** 텔레그램 채널 플러그인은 node 기반이라 PATH 에 node 가 없으면 "Listening" 표시만 뜨고 **실제 getUpdates 폴링을 못 함.** 그래서 메시지가 텔레그램에 도착(`getWebhookInfo` → `pending_update_count: 3`)해도 세션에 안 들어오고 봇이 침묵.

근본: `ssh host '명령'` 은 비대화형 셸이라 `.bashrc`(nvm/node + ~/bin PATH 세팅)를 소스하지 않음. claude 본체는 `/usr/bin/claude` 단일 바이너리라 잘 뜨지만, node 의존 플러그인은 PATH 부족으로 조용히 죽음. [[feedback_noninteractive_ssh_skips_bashrc]] 와 동일 뿌리.

## 진단 경로 (재현 시 그대로 쓸 것)

- `getWebhookInfo` → `pending_update_count` 가 0 이 아니면 = 봇이 메시지를 안 가져가는 중.
- `getUpdates?timeout=1` 직접 호출 → **409 충돌 없이** 메시지가 그냥 반환되면 = 플러그인이 폴링을 안 하고 있는 것 (폴링 중이면 409 가 떠야 정상).
- `/proc/<pid>/environ` 의 PATH 에 `nvm`/`node` 경로 유무 확인 → 없으면 bare PATH 기동 확정.

## 조치

대화형 tmux 셸에서 재기동: `ssh wsl 'tmux new-session -d -s claude'`(default 셸 = interactive non-login → .bashrc 소스 → nvm PATH 확보) 후 `tmux send-keys -t claude "claude --channels plugin:telegram@claude-plugins-official" Enter`, 신뢰 프롬프트 Enter. 검증: 새 프로세스 PATH 에 nvm node 들어감 ✓ / pending 3→0 소비 ✓ / pane 에 `← telegram · ssamssae: ...` 수신 라인 ✓.

## 예방 (Forcing function 우선)

1. **원격 세션 기동은 명령형 `tmux new-session "claude ..."` 금지.** 반드시 (a) 노드에서 `cc --new` (interactive 셸 → 풀 env 상속, canonical) 또는 (b) `tmux new-session -d -s claude`(빈 세션, .bashrc 소스되는 interactive 셸) + `send-keys` 로 claude 명령 주입.
2. **검증을 "Listening" 글자로 끝내지 말 것.** 텔레그램 채널 기동 검증은 3종 세트 필수 — `/proc/<pid>/environ` PATH 에 nvm 확인 + `getWebhookInfo` pending 0 소비 확인 + pane 에 `← telegram` 수신 라인 확인.
3. 메모리 2건으로 매 세션 로드: [[feedback_node_session_restart_use_cc_channels]] (세션 재기동 절차 + 검증), [[feedback_noninteractive_ssh_skips_bashrc]] (비대화형 ssh 진단 함정).

## 재발 이력

<처음 생성 — 비어둠>

## 관련 링크
- 메모리: `memory/feedback_node_session_restart_use_cc_channels.md`, `memory/feedback_noninteractive_ssh_skips_bashrc.md`
- 같은 사이클 선행 이슈: `issues/2026-05-20-cc-version-stale-always-on-node.md` (CC 버전 stale → 이 업데이트 작업의 발단)
- 텔레그램 메시지: id 20431 (형님 "이슈등록하고 재발방지등록해")
