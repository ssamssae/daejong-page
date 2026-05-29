# 맥미니 ~/.claude/automations git repo 화 — spec (T-260510-08)

**Status**: 🟡 draft · 본진 review 펜딩
**Author**: 💻 노트북 / 2026-05-29 KST · branch `notebook/macmini-automations-spec-2026-05-29`
**Repo**: daejong-page (docs)
**대상**: mac-mini `~/.claude/automations`

---

## §0 ⚠️ 전제 정정 — "repo init" 은 이미 완료됨 (T-260510-08 stale)

디렉티브 전제("맥미니 `~/.claude/automations` 가 빈 master + remote 없음, 사실상 git repo 아님")는 **stale**. read-only ssh 감사(2026-05-29) 결과:

- `~/.claude/automations` 는 **symlink → `~/claude-automations`** (3노드 모두 동일, 생성일 2026-05-17).
- `~/claude-automations` 는 **정식 git repo** — remote `git@github.com:ssamssae/claude-automations.git`, `main` + macmini/ 피처 브랜치 9개, **.gitignore 이미 존재**, 186 tracked files.
- 본진(mac)·노트북·맥미니 **모두 같은 repo 를 clone** (본진=main, 맥미니=macmini/launchd-sick-fix-… 피처 브랜치).
- 즉 디렉티브가 요청한 (1)~(2) "repo init / remote 추가"는 **약 2주 전(5/15~17)부터 이미 완료** 상태. claude-skills/claude-memory/claude-coord 와 함께 **4-repo 표준 컨벤션** 의 일원.

→ 본 spec 은 "repo init 절차서"가 아니라 **이미 존재하는 repo 의 (3) sync 전략 / (4) .gitignore 점검 / (5) secrets 격리 + 실제 hygiene** 만 다룬다. 디렉티브의 🔴 "GitHub repo 신설 = 형님 ack" 외부영향도 **moot** (신설 불요).

> 본진 결정 요청: 본 reframe 으로 진행 OK 인지, 아니면 T-260510-08 자체를 "done(이미 repo)" 으로 닫을지.

---

## §1 현 상태 audit (mac-mini, read-only)

| 항목 | 값 |
|------|----|
| 경로 | `~/.claude/automations` → `~/claude-automations` (symlink) |
| remote | `git@github.com:ssamssae/claude-automations.git` (private) |
| tracked files | **186** (.sh 106 / .py 14 / .plist 20 / .json 17) |
| top dirs | `docs/ hooks/ launchd/ logs/ reports/ scripts/ sudoers/` |
| 브랜치 | `main` + macmini/ 피처 9개 |
| 현재 브랜치 | `macmini/launchd-sick-fix-2026-05-29` (main 대비 2 ahead / 2 behind) |
| untracked | 2건 — `scripts/claude_memory_sync.sh`, `scripts/todo_sync.sh` |
| .gitignore | **존재** (§4) |
| 활성 스크립트 예 | process-agent-inbox.sh, mac-mini-codex-directive.sh, wsl-codex-directive.sh, telegram-typing-daemon.sh, gmail-pop3-watcher.sh 등 |
| .bak/.log 잡파일 | 0 (이미 깨끗 / gitignore 처리) |

**관찰**: 변경 이력은 이미 추적 중(186 files committed). 디렉티브의 "변경 이력 추적 X" 도 stale.

---

## §2 명명 컨벤션 (이미 정합)

4-repo 표준: `claude-skills` / `claude-memory` / `claude-coord` / `claude-automations`. 대상 repo 는 이미 `claude-automations` 로 컨벤션 준수. **신규 이름 제안 불요** — `macmini-automations` 같은 host-별 신 repo 를 만들면 4-repo 컨벤션을 깨고 분기시킴(비추, §3-C 참조).

---

## §3 sync 전략 옵션 비교 (디렉티브 핵심 질문)

**현 de-facto = (A)** — 단일 `claude-automations` repo 를 5노드가 clone, macmini/·mac/ 등 prefix 브랜치로 작업 → 본진/맥미니가 main 머지(5노드 병렬 충돌방지 룰과 정합).

| 옵션 | 충돌 면적 | 운영 비용 | 발견성 | 5노드 일관성 |
|------|-----------|-----------|--------|--------------|
| **(A) 단일 repo + 전노드 clone, prefix 브랜치 머지** ★현행 | 중 (같은 파일 동시 수정 시 머지 충돌, prefix 로 완화) | **낮음** (이미 운영, 신 인프라 0) | 높음 (한 곳) | **높음** (4-repo 컨벤션 정합) |
| (B) 본진 SoT + 맥미니 read-only pull cron | 낮음 (단방향) | 중 (맥미니 자율 변경 불가 — 맥미니가 launchd 워커 호스트라 부적합) | 중 | 낮음 (맥미니 쓰기 막힘) |
| (C) host별 분리 repo (sync 안 함) | 0 | 높음 (공유 스크립트 N중 복제 + drift) | 낮음 | **낮음** (4-repo 컨벤션 파괴) |
| (D) hostname 디렉토리 분리(mac-only/ macmini-only/ shared/) 단일 repo | 낮음 (host별 파일 충돌 0) | 중 (기존 186 파일 재배치 비용) | 중-높음 | 높음 |

**추천: (A) 유지 (status quo)** + 아래 경량 보강(restructure X, Karpathy 룰3 surgical):
1. **host-specific 파일은 앞으로 prefix 컨벤션으로** — launchd plist·`*-directive.sh` 처럼 호스트 종속 파일은 신규부터 `launchd/macmini-*` / `scripts/macmini-*` 식 host prefix. 기존 186 파일 일괄 재배치 X (D 의 충돌-감소 이득을 비용 0 로 점진 흡수).
2. **sync 책임**: 본진/맥미니만 main 머지(현행). 맥미니는 launchd 워커 호스트라 (B) read-only 부적합 — (A) 유지가 정답.

→ (A) 가 이미 정답이자 현실. 디렉티브의 "양 host 자율 변경 충돌" 우려는 prefix 브랜치 + 본진/맥미니 머지 게이트로 이미 관리됨. 잔여 hygiene 은 §6.

---

## §4 .gitignore 점검 (이미 존재)

현행 (양호):
```
.DS_Store / *.swp *.swo *~ / .env .env.* (!.env.example) / __pycache__/ *.pyc / logs/
reports/night-*/[0-9]*.md / reports/night-*/*.json
scripts/gpt-relay/config.json / scripts/gpt-relay/reply*.md
```
**평가**: 토큰(.env)·잡파일·로그·생성물 모두 커버. **추가 후보**: `*.bak`(현재 0건이나 명시 권장), `*.tmp`/`tmp/`, launchd stderr 로그 경로가 `logs/` 밖이면 그 경로. 큰 변경 불요 — 1~2줄 보강.

---

## §5 secrets 격리 (mesh-vote 1780033787 결과와 정합)

**현 baseline**: 토큰 의존 스크립트(telegram-typing-daemon, agent-msg-notify, *-directive.sh, gmail-pop3-watcher 등 ~20개)는 **env-var 참조 + `.env`(gitignored)** 패턴. 평문 커밋 0 — baseline 격리 present.

**갭**: `.env` 는 로컬 전용·미커밋 → **복구/백업 불가** (노드 사망 시 토큰 분실, 수동 재발급). 디렉티브 제약 "복구/백업 가능"·"노드 간 안전 sync" 미충족.

**권장 (forward)**: 공유 secret(봇 토큰·API 키)을 **`~/infra-config` 의 sops+age** 로 이관 (codex mesh-vote 1780033787 **🏭 맥미니안 채택 결과와 일관** — "기존 infra-config sops+age 인프라 재사용 + 신규 도구 0"). 절차:
1. 공유 secret 식별 → `infra-config/secrets/automations-env.sops.yaml` 에 sops 암호화 저장(age recipient = 5노드).
2. 스크립트는 `decrypt-run.sh` wrapper 또는 경량 env-loader 로 런타임 복호 source.
3. `.env` 는 sops 미이관 로컬 전용 값만 잔류.
→ 복구=git+age키 백업, sync=infra-config git 채널, 평문 커밋 0 모두 충족.

⚠️ **token-literal 스캔**(하드코딩 토큰 잔존 여부)은 본 spec 미실시 — ssh 로그에 secret 노출 회피. **편집권한 노드(본진/맥미니)가 로컬에서** `grep` 으로 1회 verify 권장(§6-3).

---

## §6 실제 open items (T-260510-08 의 진짜 후속 — repo init 아님)

| # | 항목 | 성격 | 처리 주체 |
|---|------|------|-----------|
| 1 | macmini/ 피처 브랜치 9개 — 머지 완료분 정리(가역: merged 확인 후 delete, 미머지면 보존) | 가역 hygiene | 맥미니 |
| 2 | untracked 2건(`claude_memory_sync.sh`, `todo_sync.sh`) — commit vs gitignore 결정 | 가역 | 맥미니(소유) |
| 3 | secrets §5 sops 이관 + token-literal 로컬 verify | 가역(내부), 신중 | 본진/맥미니 |
| 4 | .gitignore 1~2줄 보강(§4) | 가역 | 아무 노드 prefix PR |

**모두 가역·내부 작업** — GitHub repo 신설 같은 외부영향 0(repo 이미 존재). 디렉티브 🔴 ack 게이트 해당 없음. 단 §5 secret 이관은 토큰 다루므로 본진/맥미니 신중 진행.

---

## §7 한계

- audit 는 mac-mini read-only ssh 1회 스냅샷(2026-05-29 KST). 브랜치/untracked 는 시점 변동.
- token-literal 하드코딩 스캔 미실시(secret 노출 회피, §5) — 편집권한 노드 로컬 verify 로 위임.
- sync 옵션 비용은 정성 평가. (D) 재배치 비용은 186 파일 실측 미산정.
- 본 spec 작성 시점 daejong-page main HEAD 기준. claude-automations repo 진화 시 §1 수치 재확인.
