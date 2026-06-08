---
title: "Every Level of Claude Explained in 21 Minutes"
date: "2026-05-12"
source_url: "https://youtu.be/ZRb7D6R64hM"
source_author: "Nate Herk"
---

# Every Level of Claude Explained in 21 Minutes — Nate Herk

영상 메타:
- URL: https://youtu.be/ZRb7D6R64hM
- 채널: Nate Herk | AI Automation
- 길이: 21분 42초 (1302 sec)
- 업로드: 2026-05-12
- 조회수: 116,499 / 좋아요 4,397
- 시청일: 2026-05-18 KST (🖥 데스크탑3060Ti 가 자막 추출 후 요약)

저자 인용: "400+ 시간 Claude 안에서 mastered"

---

## 5 레벨 요약

### Level 1 — Enthusiast

질문 → 답 → 닫기. 검색바처럼 사용. 하루 30분 절약 수준.

**Quick win**: 스크린샷 paste (Claude 가 이미지 읽음 — 절반의 사람들이 타이핑으로 시간 낭비).

**Cheat code → L2**: 첫 project 생성 (reference docs + system prompt 박으면 모든 chat 안 preloaded).

### Level 2 — Beginner

Project 가 척추. 6 + 1 features stack:

1. **Memory + past chat search** — memory 는 free, 검색은 paid. Project knowledge base 와 결합 = "starting from zero 매번" 문제 해결.
2. **Connectors** — Slack/GDrive/Gmail/GitHub/Notion/Calendar 등 50+. + 버튼 클릭 → OAuth → 끝. 더 이상 paste X.
3. **File creation** — Excel (working formulas), PPT, Word, PDF. 모두 download 가능. **무료** 포함. Chat 가 deliverable tool 로 변신.
4. **Artifacts with persistent storage** — Claude API 직접 호출, public link publish 가능. 비코더가 customer feedback tracker 만들어 팀에 link 보내고 ship. Lovable/Bolt 없이 conversation 만으로.
5. **Inline visuals** — 차트/diagram chat 안에서 실시간 생성/변형. CSV 드롭 후 시각화. Ephemeral, free.
6. **Office add-ons (Excel/PPT/Word)** — 실제 MS 앱 안에서 작동. Cell citation, slide master / brand colors 보존. 2026-04 부터 셋 사이 context share.
7. (부가) Plugins, computer use

**5+ hr/주 절약. Claude 가 자기 비용을 갚기 시작.**

**천장**: chat 안에서만 — 머신 자체 작업 X.

**Cheat code → L3**: Claude Desktop 의 Co-work tab.

### Level 3 — Intermediate (Co-work)

**Paid only** (Pro/Max/Team/Enterprise). 5 features:

1. **File system access** — isolated VM + 허용 폴더에 read/write.
2. **Skills** — markdown 파일로 reusable workflow. 100+ 공개 (Anthropic 공식 16+, community marketplace). 한 번 빌드 → 어디서나 (co-work/chat/code) 실행.
3. **Scheduled tasks** — `/schedule`, 단 컴퓨터 ON + desktop app open 필요. Routines 는 cloud-based (L5 에서).
4. **Mobile control via Dispatch** — 폰 → desktop task 송신. 통근/체육관/회의 중 cloud 가 일하고 끝나면 ping.
5. **Claude Design** — Anthropic Labs. "Figma killer" 호칭. Brand 통째 (GitHub repo/codebase/design files/brand guides) 읽어서 design system 생성. Handoff bundle 으로 Cloud Code/Canva 로 ship. 비코더가 working frontend → cloud code 로 production 까지.

**10+ hr/주 절약. AI automation as service 의 최소 bar.**

**천장**: Co-work 는 safe/friendly 지만 less precise. Version control / engineering rigor 필요하면 outgrow.

**Cheat code → L4**: Folder structure 만들기 — about_me 파일, templates 폴더, projects 폴더, outputs 폴더 + 룰 ("Never edit my templates / Always deliver to outputs").

### Level 4 — Advanced (Claude Code)

Boris Churnney (Cloud Code 빌더) 가 **5 parallel sessions** 매일 운영. 번호 매긴 터미널 탭 + isolated workspace, 다 끝나면 검토. "Parallel productivity 아니라 다른 카테고리의 work".

5 things:

1. **CLAUDE.md** — project root, 매 session start 시 자동 로드. Tech stack / naming conventions / who you are / goal / "never do X". 200 lines 이내 권장 (매 conversation 마다 token 소모). 중요한 디테일은 별도 파일 + `@filename` reference (필요시만 read).
   - **핵심 습관**: Claude 가 실수할 때마다 "update your CLAUDE.md so you don't make that mistake again." 명령. Anthropic 자체 팀도 이 흐름. 몇 주면 self-train.

2. **Plan mode** — `shift+tab` 두 번. Claude 가 plan present + 승인 대기 + 질문.
   - **숨겨진 setting: Opus Plan** — Opus 가 plan, Sonnet 가 execute. 비용 절반 + 품질 유지.

3. **Sub agents** — specialized clouds (tests / security review / documentation). 각자 own context window, 병렬 OK, main session 으로 통신. "Small engineering team that can't talk to each other directly".

4. **Worktrees** — `claude-worktree feature-name`. Isolated git workspace + own branch. 3-4 개 sweet spot. Feature/bug fix/tests 병렬.

5. **MCP with asterisk** — **CLI 가 있으면 MCP 보다 CLI 우선**. Anthropic 자체 docs 가 명시. CLI 가 MCP 보다 60-70% 적은 token (context 에 안 로딩될 때까지).
   - **Tool search (2026-01 release)**: MCP overhead > 10% 시 auto-defer, 85% reduction.
   - 룰: **CLI first → API endpoints second → skills third → MCP only when nothing else fits**.

**Power moves**:

- **Master context window**: Opus 4.7 의 1M token 도 50% 넘으면 sloppy. `/compact` (proactively, warning 후에는 너무 늦음), `/context` (token 어디 가는지). Prompt caching = 60-90% cost drop on long sessions.
- **Auto mode + /focus**: `shift+tab` cycle to auto (safe commands 자동 classifier). `/focus` 로 intermediate steps 숨김. Boris 가 5 parallel session 운영하는 방식.
- **Verification loop** (Boris: "this level 의 가장 중요한 것"): Claude 가 자기 work 검증할 way 제공. Chrome extension 으로 browser 열어 UI test + iterate. **2-3x quality**.
- **Custom /commands**: 같은 prompt 두 번 쓰면 slash command 로. Boris 의 `/commit-push-pr` 하루 수십 번. `.claude/commands/` 폴더. 팀/조직 공유.
- 부가: `/re` 또는 `escape×2` (실패 attempt context drop), `/btw` (mid-task quick question, flow 안 깸), `/branch` (옛 `/fork` — conversation fork, git for conversation, worktree 와 페어), `/insights` (한 달 사용 패턴 분석: repetitive, token waste, skill 화 후보, CLAUDE.md 추가 후보 — 월 1회), `/output-style new` (personality 교체: code reviewer / no fluff / documentation writer).

**Freelance/agency 5-15K$ 프로젝트. Automation 아니라 real systems.**

**천장**: 병렬 work 수동 관리 — own bottleneck. Babysitting.

**Cheat code → L5**: 가장 repetitive 한 것 (review / dependency check / 수동 실행 skill) 을 첫 cloud automation 으로.

### Level 5 — Architect

Laptop closed/off/asleep 일 때도 work 진행. "잠자다 일어나니 PR review 끝나있음".

3 things:

1. **Cloud routines** — Anthropic cloud 에서 돌아가는 saved Cloud Code configs. 머신 꺼져있어도 OK. Trigger: schedule / API call / GitHub event. 예: 매일 8am backlog triage, weekly dep audit, PR open 즉시 review.

2. **Hooks** — safety rails, lifecycle events:
   - pre-tool-use (block dangerous commands)
   - post-edit (auto-format)
   - stop hook (long session 끝나면 Slack ping)
   - "Cool demo 아니라 production system 으로 trust 가능" 의 차이.

3. **Channels** — terminal 밖 session control: Discord, Telegram, iMessage (Mac), custom webhooks.
   - 양방향: external event → Claude trigger (calendar booking → research agent prepares briefing) OR 폰 → text Claude → real codebase 작업.

**Layered**:

- **Headless mode + Agent SDK**: `claude -p` 로 no-human prompt → output. Pipe to Slack/Datadog/another Claude agent. Python/TS SDK 로 own product 빌드. "User 에서 builder 로".
- **Remote control**: `/remote-control` + QR scan → local session 을 mobile/browser 로 bridge. 산책하면서 폰으로 코딩.
- **Autodream (memory consolidation)**: background sub agent 가 session 사이 memory files 정리 (contradicted facts delete / duplicates merge / yesterday → 실제 날짜). "Drift on stale info 방지". Turn on 필요.
- **Task budgets** (Opus 4.7 beta, API only): agent 에 token target 부여. Self-regulate, budget 다 쓰면 gracefully wrap up. Production agent cost control.
- **Agent teams** (experimental): multiple specialized clouds + lead agent. Sub agents 와 달리 **서로 message OK, shared channel, shared task list, debate 시킬 수 있음**. Token 많이 씀.
- **Discover/leverage**: 5K+ skills, 800+ MCP servers, 3K+ marketplaces. X/Reddit 가서 use case → open-source repo → customize. "가장 high-leverage skill = scratch 빌드 아니라 discover/leverage".

---

## ⚡ 영상의 가장 중요한 인사이트 (저자가 명시적으로 강조)

> "L5 의 stall 은 technical 이 아니라 **trust** 문제."

Cloud routines 셋업은 누구나 할 수 있지만 안 하는 이유 = "잠자는 동안 system 이 work 돌리는 게 reckless 하게 느껴짐, 특히 안 보이는 곳에서 뭐가 일어나는지 모르면."

해결책 = **운전 배우듯 empty parking lot 부터**:
- Low-stakes routine (daily standup summary only to you, no external send / weekly dep audit)
- 매일/매주 watch, don't touch — 몇 주 동안.
- Trust earned 되면 다음 10 runs trust.
- **Deterministic** (data 한 곳 → 다른 곳 옮기기) 자동화는 trust 쉬움.
- **Non-deterministic** (agents, skills) 은 trust 어려움 — 훨씬 강력하지만.

**"Trust 는 install 할 수 있는 feature 가 아니라 reps + time 이 필요한 skill."**

---

## 🧠 강대종 형님 시각 정리 (5노드 챗봇 운영자 관점)

### 이미 적용 중

- **CLAUDE.md self-train 패턴**: 형님은 `feedback_*` 메모리로 동등하게 운영 (실수 발견 즉시 룰 추가, 자동 메모리 시스템) — 영상 흐름의 강화 버전.
- **Plan mode**: 사용 중.
- **Worktrees**: parallel-cycle 스킬로 형님은 **5 물리 기기 병렬** (영상 저자는 한 머신 안 worktree — 형님이 한 단계 위).
- **Channels (Telegram)**: 5 봇 (🍎/🪟/🏭/🖥/💻) 으로 굳건히 운영. 영상이 다루는 정도를 훨씬 넘음.
- **Hooks**: telegram-reply-check.sh (Stop hook) 등 운영 중.
- **Cloud routines 형태**: macOS launchd 24/7 워커 (night-builder v2, night-runner v1) + OS cron — Anthropic Cloud routines 가 아니라 자체 호스트, 본질 동등.
- **Verification loop**: Playwright MCP + Naver 자동 발행 + Flutter UI test 등 영상의 Chrome extension 패턴 더 깊이.
- **Agent teams 형태**: mesh-vote / trio-vote / parallel-cycle — 영상이 "experimental" 라 부르는 패턴을 형님은 이미 production.
- **Trust ladder**: night-runner v1 안전모드 (read-only 5 점검만, code 수정/commit/push X) 가 정확히 영상이 말하는 "empty parking lot".

### 새 인사이트 / 적용 가치

1. **Opus Plan 모드** — Opus plan + Sonnet execute, 비용 절반. 형님 fast mode (Opus 4.7) 디폴트와 시너지. 큰 작업·복잡 plan 단계에 시도 가치.

2. **`/insights` 월 1회 도입** — 한 달 사용 패턴 분석 (repetitive / token waste / skill 화 후보 / CLAUDE.md 추가 후보). 형님 `/usage` 와 별개 — 패턴/습관 메타 분석. 형님 5노드 운영의 효율성 점검에 가치.

3. **`/btw` mid-task quick question** — main session conversation history 안 깸. 형님이 long session 운영 시 main context 보호용.

4. **`/branch` (옛 `/fork`)** — 같은 main session 안에서 conversation fork. mesh-vote/trio-vote 와 다른 패턴 — single session 내 분기. "Git for conversation".

5. **`/re` 또는 `escape×2`** — 실패 attempt 를 context 에서 drop. 형님 context window 절약에 직접 도움.

6. **Output styles (`/output-style new`)** — personality 교체. 형님의 "자연어 디폴트" 룰을 output style 로 자동 강제 가능 (텔레그램 채널 한정).

7. **Task budgets (Opus 4.7 beta, API only)** — agent token target self-regulate. 형님 Anthropic 비용 hard rule (시간당 100+ API call 사전 ack) 정신과 자연 연계. 5노드 자동 사이클 비용 안전망.

8. **autodream (memory consolidation)** — 형님 자동 메모리 시스템 (`~/.claude/projects/-home-user/memory/`) 과 비교/통합 가치. Contradicted facts auto-delete / "yesterday" → 실제 날짜 변환 — 형님 메모리 운영에 추가 lever.

9. **Agent SDK (Python/TS)** — `claude -p` headless + SDK 로 product 빌드. 형님의 daejong-page / choso 통합 가치 (worklog/insta-post 같은 곳).

10. **Remote control** — `/remote-control` 로 local session ↔ mobile bridge. 형님이 Termius SSH 로 외출 패턴의 alternative (또는 보완).

### 영상이 형님 시스템보다 약한 곳

- 5 물리 기기 mesh — 형님 시스템이 영상 저자 기준 한 단계 위.
- Production-grade hard rule (Anthropic API 비용 사전 ack / 셸 RC ack / main push PR 룰 등) — 영상은 hooks 까지만, 형님은 메모리 + 룰 + forcing function 까지 통합.
- 다국어 채널 (Naver blog / Substack / Telegram / 본인 사이트) 멀티 publish — 영상에 없음.

---

## 적용 권고 (forcing function 우선)

1. **`/insights` 첫 호출**: 한 달 사용 패턴 baseline 잡기. Worklog 와 별개 트랙.
2. **`/output-style new` 로 "자연어 디폴트" personality**: 텔레그램 채널 한정 output style 생성, 5노드 모두 같은 톤 강제.
3. **Opus Plan 도입**: 큰 작업 (mesh-vote / 큰 마이그레이션) 의 plan 단계에 자동 적용 — 비용 절감 + 품질 유지.
4. **Trust ladder 명시**: night-runner v1 (safe mode) → v2 (limited write) → v3 (full agent) 점진 확장 — 영상이 강조한 "L4 → L5 진짜 차이". 형님 이미 가고 있는 길이지만 메모리에 명시 박기 가치.

---

## 메타

- 형님 발화 (2026-05-18 15:32 KST 텔레그램 msg 1394): "요약해서 핵심 인사이트 뽑아서 내가 습득할만한 것들 정리해서 박아줘 나중에 쓰게"
- 원본 로컬 노트: `~/notes/2026-05-18-claude-5-levels-nateherk.md` (🖥 데스크탑3060Ti)
- 공개 박은 곳: `~/daejong-page/insights/2026-05-18-claude-5-levels-nateherk.md` (5노드 sync, 사이트 /insights 노출)

## 용어
- **Claude Opus 4.7** [모델 · 구독]: Anthropic 의 최상위 모델. 1M 토큰 컨텍스트 윈도우, plan 모드 / agent task 의 디폴트. 비용은 비싸지만 reasoning 품질 우위.
- **opus-plan (model alias)** [모델 · 구독]: "plan = Opus, execute = Sonnet" 토글. 비용 절반 + 품질 유지. 단 매 toggle 이 모델 스위치라 prompt cache 가 깨진다.
- **Claude Code** [모델 · 구독]: Anthropic 의 CLI 기반 코딩 에이전트. 터미널·VS Code·웹·모바일 다중 진입점. 5 parallel sessions 운영이 power user 패턴.
- **Claude Design** [모델 · 구독]: Anthropic Labs 의 디자인 도구. brand repo / codebase / Figma 파일을 읽어 design system 생성 → Claude Code 로 프로덕션 ship 까지.
- **CLAUDE.md / AGENT.md** [하니스 · 패턴]: 프로젝트 루트의 에이전트 운영체제 파일. 매 세션 자동 로드. tech stack / convention / "never do X" 룰. 200 lines 이내 권장(매 conversation 마다 token 소모).
- **Plan mode** [하니스 · 패턴]: `shift+tab` 두 번. 모델이 실행 전 plan 을 제시 + 사용자 승인 대기. 카파시 원칙 1 ("코딩 전에 생각하기") 의 핵심 도구.
- **Sub-agent (서브에이전트)** [하니스 · 패턴]: specialized cloud — 자기 자신만의 context window 를 가진 헬퍼 에이전트. 메인 컨텍스트 안 더럽히고 병렬 실행. 코드 리뷰·테스트·보안 분석에 적합. 서로 직접 통신 X (Agent Teams 와 구분).
- **Agent Teams** [하니스 · 패턴]: 실험 단계 — 여러 sub-agent + lead agent. sub-agent 와 달리 서로 message OK, shared channel/task list. 토큰 많이 씀.
- **Skill (스킬)** [하니스 · 패턴]: markdown 파일로 적은 작업 매뉴얼. name + description 만 자동 로드되고 본문은 필요할 때만 펼침 → 토큰 절약. "썸네일 만들어 줘" 같은 자연어로 자동 호출. 100+ 공개 (Anthropic 16+ + community).
- **Hook** [하니스 · 패턴]: lifecycle event 에 끼우는 자동 스크립트 — pre-tool-use (위험 명령 block), post-edit (auto-format), stop hook (Slack ping). "demo 가 아니라 production system 으로 trust 가능" 의 차이.
- **Worktree** [하니스 · 패턴]: `claude-worktree <feature>` — isolated git workspace + 독립 브랜치. 3~4 개가 sweet spot. feature / bug fix / tests 병렬.
- **Routines (Cloud Routines)** [하니스 · 패턴]: Anthropic cloud 에서 돌아가는 saved Cloud Code config. 머신 꺼져있어도 동작. trigger = schedule / API call / GitHub event. 예: 매일 8am backlog triage.
- **Headless mode** [하니스 · 패턴]: `claude -p '<prompt>'` — 사람 없이 prompt → output. Slack/Datadog/다른 Claude 에 pipe. Agent SDK (Python/TS) 로 product 빌드.
- **Channels (외부 채널 연동)** [하니스 · 패턴]: 터미널 밖에서 세션 제어 — Discord / Telegram / iMessage / 커스텀 webhook. 양방향 — 외부 이벤트 → Claude trigger, 폰 → text → 실제 codebase 작업.
- **Verification loop** [하니스 · 패턴]: 모델이 자기 work 를 검증할 way 를 제공하는 루프 — Chrome extension 으로 UI 열어 테스트 + iterate. Boris: "이 레벨에서 가장 중요한 것." 품질 2~3x.
- **Autodream (memory consolidation)** [하니스 · 패턴]: 백그라운드 서브에이전트가 세션 사이 memory 파일을 정리 — 모순 사실 삭제·중복 머지·"yesterday" 를 실제 날짜로. stale info drift 방지.
- **Context window** [컨텍스트 · 캐시]: 모델이 한 번에 볼 수 있는 토큰 한계. Opus 4.7 = 1M. 단 50% 넘으면 sloppy 해지고 "바보가 된다."
- **/compact** [컨텍스트 · 캐시]: 컨텍스트가 길어지기 전에 의미 손실 없이 압축. warning 후에는 너무 늦음 — proactive 사용 권장.
- **/context** [컨텍스트 · 캐시]: 현재 토큰이 어디로 가는지(system / project / 대화) 분석.
- **Prompt caching** [컨텍스트 · 캐시]: 재사용되는 prefix (시스템/프로젝트/대화 3계층) 를 캐시해 토큰 비용 60-90% drop. cache read 는 fresh input 대비 10% 비용.
- **Task budget (Opus 4.7 beta)** [컨텍스트 · 캐시]: agent 에 token target 부여 → self-regulate, budget 다 쓰면 gracefully wrap up. production agent 비용 통제.
- **MCP (Model Context Protocol)** [도구 통신 (MCP · CLI · API)]: 에이전트에게 사용 가능한 tool 목록을 표준화해 주는 protocol. "메뉴 씌운 API". 초기엔 모든 tool 을 컨텍스트에 로드해 토큰 폭주, 지금은 deferred(필요할 때만) 로 개선.
- **CLI-first 룰** [도구 통신 (MCP · CLI · API)]: "CLI 가 있으면 MCP 보다 CLI 우선" — Anthropic 공식 문서에 명시. CLI 가 MCP 대비 60~70% 적은 토큰. 우선순위 = CLI → API → Skills → MCP.
- **Tool search (deferred MCP)** [도구 통신 (MCP · CLI · API)]: 2026-01 release. MCP overhead 10% 넘으면 auto-defer, 85% token reduction.
- **Connectors** [도구 통신 (MCP · CLI · API)]: Slack / GDrive / Gmail / GitHub / Notion / Calendar 등 50+ 외부 서비스를 OAuth 한 번으로 채팅에 연결.
- **Fan-out (병렬 분배)** [워크플로우 · 문화]: 한 작업을 여러 sub-agent / worker 로 동시 분산. Boris 의 5 parallel session, 형님 5노드 mesh 가 사례. 토큰 분산이라 작은 일에는 배보다 배꼽 주의.
