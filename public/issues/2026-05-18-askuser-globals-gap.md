---
prevention_deferred: null
---

# AskUserQuestion 터미널 UI 띄움 — 본진 메모리 → globals 승격 누락 + 데스크탑 claude-skills stale 결합

- **발생 일자:** 2026-05-18 07:52 KST
- **해결 일자:** 2026-05-18 진행 중 (조치 1~5 중 1,3,4 완료; 2,5는 본진 응답 후 머지)
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** 5노드 챗봇 전반 (특히 본진 외 4 노드), 텔레그램 전용 사용 시간대

## 증상

🖥 데스크탑 챗봇이 형님 텔레그램 요청 처리 중 `AskUserQuestion` 도구로 옵션 선택지 UI 를 띄움. 형님은 텔레그램으로만 명령 내리는 상황(출근 후 등) — 터미널 화면 안 보임. 오늘은 우연히 출근 전이라 데스크탑 앞에 있어서 답할 수 있었지만, 평소 같으면 챗봇이 무한 대기. 형님 직접 발화: "터미널에서 선택지 입력하게 하지말라고 박았던거 같은데? 이것도 이슈 박고 재발방지 다시 또 설정해줘" / "텔레그램으로만 지금 명령내리고 있다고" / "본진에서 박았을텐데 왜 없었어".

## 원인

두 겹 결합.

1. **본진 메모리 → globals 승격 게이트 부재** — 본진이 박은 "터미널 UI 금지" 류 룰이 본진 메모리(`~/.claude/projects/-Users-user/memory/`)에만 박혔고 `~/claude-skills/globals/` 로 승격되지 않음. globals 만 5노드 symlink sync 됨. 메모리는 노드 로컬이라 본진 외 4 노드(🪟 WSL / 🏭 맥미니 / 🖥 데스크탑 / 💻 노트북)는 그 룰의 존재를 알 수가 없음.

2. **데스크탑/노트북 claude-skills repo 자동 pull 부재** — /pull-apps 스킬은 Flutter 앱 repo 전용. claude-skills 자체 sync 자동화 빠짐. 이번 시점 데스크탑이 17 commits stale 상태로 운영 중이었음. 본진 최신 globals 변경분이 도달 못 함.

검증: 데스크탑에서 ~/.claude/{CLAUDE,AGENT,RTK}.md + memory/ + claude-skills/ 전체 grep `"AskUser|선택지|터미널 입력|terminal UI"` → 0 hit. `git pull --ff-only` 후 재 grep 도 0 hit (즉 본진 globals 에도 안 박혀 있는 상태).

## 조치

1. ~/claude-skills 데스크탑에서 `git pull --ff-only` 로 17 commits 따라잡음 (origin/main 동기화).
2. `globals/CLAUDE.md` "텔레그램 답변 철칙" 섹션 끝에 "AskUserQuestion 등 터미널 UI 도구 금지, 텔레그램 평문으로 옵션 풀어서 묻기" 룰 추가 — 별도 commit. desktop/issue-askuser-2026-05-18 브랜치 → PR → 본진 머지.
3. 본 이슈 박기 — `~/.claude/skills/issues/2026-05-18-askuser-globals-gap.md`.
4. 데스크탑 노드 메모리에 `feedback_askuser_terminal_ui_forbidden.md` 작성 — globals 머지 전까지 데스크탑 노드 로컬 cache.
5. 본진에 mac-report — (a) 본진 메모리 → globals 승격 게이트 부재, (b) 데스크탑/노트북 claude-skills 자동 pull 메커니즘 부재 두 함정 보고. 본진이 본진 메모리 정리 + 자동 pull launchd/cron 결정 위임.

## 예방 (Forcing function 우선)

네 겹 안전망 후보. 어느 하나 빠지면 또 leak 위험.

1. **(a) `globals/CLAUDE.md` 텔레그램 답변 철칙에 "AskUserQuestion 금지" 룰 명시** (조치 2) — 5노드 symlink sync 채널. 시스템 컨텍스트에 매 세션 자동 로드.
2. **(b) 본진 메모리 → globals 승격 체크리스트** — feedback_* 메모리 새로 박을 때 "이 룰이 5노드 전체 적용돼야 하면 `globals/CLAUDE.md` 또는 `AGENT.md` 에도 박기" 한 줄 self-check. `/goodnight` 스킬에 본진 메모리 vs globals diff 점검 단계 추가 검토.
3. **(c) 데스크탑/노트북 claude-skills 자동 pull launchd/cron** — 30~60분 주기 `cd ~/claude-skills && git pull --ff-only`. 본진 결정 위임 (systemd timer vs cron, 주기).
4. **(d) 챗봇 매 turn 시작 step 0 에 `cd ~/claude-skills && git fetch -q && git status -sb`** — `behind N` 감지 시 자동 pull. Karpathy 룰 1 "stale-on-stale" 사고 방지와 같은 맥락. CLAUDE.md 빠른 원칙에 이미 "작업 시작 전 git pull" 있지만 ~/claude-skills 자체에는 미적용.

## 재발 이력

(없음, 새 이슈)

## 관련 링크

- 발생 텔레그램 메시지 id: 1279, 1280, 1281, 1283, 1284, 1286
- 직전 sync 사고: `2026-05-01-wsl-mac-race-skill-edit.md` (claude-skills base SHA stale, 다른 주제)
- 관련 paste-block: `2026-04-27-paste-block-mixed-r6.md` ("터미널에 입력하는거 따로줘야지" 강대종 발화)
- 관련 stdin lag: `2026-05-10-claude-code-terminal-stdin-lag.md` (다른 주제, stdin backpressure)
