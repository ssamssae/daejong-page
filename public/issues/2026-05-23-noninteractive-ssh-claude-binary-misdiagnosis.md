---
title: 비대화형 SSH 에서 claude binary 부재로 오진 → 형님 "노드 표준화로 다 깔았잖아" 정정
date: 2026-05-23
related: feedback_noninteractive_ssh_skips_bashrc
nodes: 🍎 본진, 🪟 라이젠
---

# 사건

🪟 WSL Ryzen 챗봇 응답 0 사고 진단 중, 본진이 `ssh wsl 'which claude'` + `ssh wsl 'find ~ -maxdepth 4 -name claude'` 둘 다 0건 결과 보고 "라이젠에 Claude Code CLI 자체가 설치 안 됨" 단정. 형님께 surface — "라이젠 챗봇이 사실은 한 번도 진짜로 polling 시작한 적 없을 수 있음" + CLI 설치 진행 안 surface.

형님 정정 (msg23094/msg23099): "라이젠에 우분투 설치되어있잖아 노드 표준화로 다같이 했잖아 무슨소리야? 저번에 npm으로 통일해서 다시 다 깔았던걸로 기억하는데 무슨소리냐고"

본진이 `ssh wsl 'bash -ic "which claude"'` (interactive shell) 으로 재진단 → `/home/ssamssae/.nvm/versions/node/v24.15.0/bin/claude` 확인. CLI 설치돼있음. 형님 정확, 본진 오진.

# 근본 원인

본진이 메모리 `feedback_noninteractive_ssh_skips_bashrc` 룰을 **알고 있었으면서** ("ssh host '명령' 으로 alias/PATH/cc 진단 X. bash -ic 로 확인.") 진단 단계에서 적용 안 함.

기여 요인:
1. **find 함정** — `find ~ -maxdepth 4 -name claude` 는 PATH 와 무관한 파일시스템 검색이라 PATH 룰 적용 안 한다고 본진이 오판. 실제로는 nvm 경로 `~/.nvm/versions/node/v24.15.0/bin/claude` 가 maxdepth 4 안에 들어있었지만 nvm 내부 디렉토리 구조가 깊어 `~/.nvm/versions/node/v24.15.0/bin/` 의 maxdepth = 5 (4 단계 안에서 `bin` 폴더는 찾았지만 그 안 파일 못 찾음). depth 한 단계 더 늘렸으면 발견했을 것.
2. **노트북 검증과 비교 안 함** — 본진이 노트북 unit/lingering 까지는 비교 진단했는데 "노트북에 claude binary 가 어디에 있는지" 1번 확인했으면 라이젠도 같은 위치 검색하거나 노트북과 다른 위치 가능성 surface 가능.
3. **stale 회상** — 메모리 `project_wsl_chatbot_autostart.md` 의 "Ryzen·Desktop 동일 셋업 롤아웃은 형님 ack 후" 문구를 보고 라이젠은 아직 미적용으로 단정. 실제로는 그 후속 사이클에서 형님이 5노드 표준화로 다 박았는데 본진 메모리 갱신 안 됨.

# 진짜 원인 (찾았던 것)

claude-chatbot.service unit 본문의 `Environment=PATH=%h/.local/bin:%h/.npm-global/bin:%h/.local/node/bin:%h/fvm/default/bin:/usr/local/sbin:...` 에 **nvm 경로 (`~/.nvm/versions/node/v24.15.0/bin`) 가 없음**. systemd 가 service 띄울 때 그 PATH 만 쓰니까 claude binary 못 찾고 fail. tmux new-session 안 claude 실패는 service ExecStart exit 0 (oneshot/RemainAfterExit=yes) 라 systemctl 관점에선 "active" 로 false positive.

# 예방

(a) **진단 룰 강화** — 비대화형 SSH 의 `which`/`find ~ -maxdepth N` 결과만으로 binary 부재 단정 금지. 최소:
1. `ssh host 'bash -ic "which <bin>"'` (interactive 통과)
2. `ssh host 'bash -lc "which <bin>"'` (login shell 통과)
3. `find ~ -name <bin>` (maxdepth 제한 X, 또는 `-maxdepth 8` 이상)
4. 다른 노드 (이미 working) 의 같은 binary 위치 확인 + 라이젠 동일 위치 점검
   넷 다 통과 후에야 "부재" 단정 가능.

(b) **메모리 갱신 forcing function** — 5노드 표준화 같은 광범위 작업이 끝나면 즉시 관련 메모리 (`project_wsl_chatbot_autostart.md` 등) 의 "ack 후" 같은 stale 표현 정리. 형님이 "다 깔았다" 발언한 시점 본진이 메모리 갱신했어야.

(c) **사과 룰 자율 진행** — 본진이 이 issue 박는 것 자체가 룰 적용. 메모리 갱신 + 진단 강화는 다음 사이클부터 작동력 시험.

# 영향

- 형님 "무슨소리냐" 직접 정정 (msg23094, msg23099) — 본진이 잘못된 가설로 한 메시지 surface, 형님 시간 낭비.
- 진짜 원인 (PATH 미스매치) 은 본진이 정정 후 결국 찾음 — 해결안 (B: symlink 표준화) 형님 ack 대기 중.
- task #9 새로 박힘 (라이젠 service PATH 패치 fix).

# 관련 메모리

- [[feedback_noninteractive_ssh_skips_bashrc]] (원본 룰, 위반)
- [[feedback_apology_triggers_postmortem]] (사과 룰 적용)
- [[project_wsl_chatbot_autostart]] (stale 가능성 — "Ryzen·Desktop 동일 셋업 롤아웃은 형님 ack 후" 표현 정정 필요)
