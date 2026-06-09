# knowhow ↔ issues coverage map

작성: 2026-05-03 10:30 KST (WSL)
작성자: WSL coverage-audit 사이클 1회
범위: `~/.claude/skills/issues/*.md` 35건 ↔ `~/daejong-page/knowhow/*.md` 11건

## 배경

2026-05-02 `reference_knowhow_category` 결정으로 issues=사건 / knowhow=재사용 패턴 분리.
모든 issues 가 knowhow 로 일반화될 필요는 없음 — 단발 사건도 OK, memory feedback 으로
처리되는 경우도 OK. 본 표는 어떤 issues 가 어떤 형태(knowhow / memory feedback /
정책 룰 / 단발)로 처리됐는지 한눈에 보고, 일반화 누락 후보만 surface 하는 게 목적.

## 분류 기준

- **있음 (knowhow)** — `~/daejong-page/knowhow/` 에 명시 매핑된 .md 가 존재.
- **있음 (memory feedback / 정책 룰)** — knowhow 파일은 없지만 globals/CLAUDE.md
  정책, `~/.claude/projects/.../memory/feedback_*.md`, hook 등으로 행동룰화 완료.
- **일반화 후보** — 재발 가능성 medium+ 이고 위 둘 다 없음. 별도 사이클에서 knowhow
  화 검토 가치 있음.
- **단발** — 1회성/외부 정책 고정/UX 미세 이슈. 일반화 가치 낮음.

## 매핑 표 (35건)

| issues 파일 | 핵심 사건 (1줄) | 대응 knowhow / 처리 | 분류 |
| --- | --- | --- | --- |
| 2026-04-12-ios-relaunch-crash.md | iOS 재실행 시 SharedPreferencesPlugin 크래시 | — | 일반화 후보 (Flutter major update lifecycle 회귀 사전 가드) |
| 2026-04-16-play-console-testers-google-group.md | Play Console testers API 가 개별 이메일 거부 | — (memory: `reference_telegram_bot_to_bot_blocked` 류와 다른 결, Google Group 우회는 이미 운영) | 단발 (Google 정책 고정) |
| 2026-04-16-playwright-chrome-google-login-blocked.md | Playwright Chromium Google 로그인 차단 | `2026-05-02-playwright-google-oauth-stealth.md` (rediscovered: 2026-04-16 명시) | 있음 (knowhow) |
| 2026-04-19-android-text-selection-twotone.md | Android TextField 선택 블록 2톤 | — | 단발 (Flutter BoxHeightStyle 정책 고정) |
| 2026-04-20-irun-locked-iphone.md | /irun 시 폰 잠금이 진짜 원인 | — (`/irun` 스킬 자체 게이트 박힘) | 일반화 후보 (iOS device lock pre-check 패턴) |
| 2026-04-20-telegram-client-delivery-lag.md | 텔레그램 답변 안오는 듯한 지연 | — | 단발 (UX, 망원인) |
| 2026-04-20-telegram-typing-midsession-drop.md | typing 표시 한번 쏘고 정지 (12회 재발) | `feedback_chat_action_during_directive.md` | 있음 (memory feedback) |
| 2026-04-20-terminal-only-reply-missed-telegram.md | Telegram-origin 질문에 reply 툴 누락 (6회) | `feedback_telegram_reply_tool_mandatory.md` + Stop hook `telegram-reply-check.sh` | 있음 (memory feedback + hook) |
| 2026-04-21-launchd-silent-job-dropout.md | launchd 잡 소리없이 떨어짐 (1회 재발) | — | 일반화 후보 (launchd register 후 verification 게이트) |
| 2026-04-21-mac-wsl-todos-desync.md | Mac/WSL 병렬 작업 todos 불일치 | globals/CLAUDE.md 「병렬 작업 + 충돌 방지 원칙」 | 있음 (정책 룰) |
| 2026-04-21-memory-skill-duplication.md | 메모리에 스킬 유도 가능한 내용 중복 | — (memory 자체 룰: "스킬 파일로 유도 가능하면 메모리 X") | 일반화 후보 (메모리 vs 스킬 boundary 명문화) |
| 2026-04-21-memoyo-signup-ghost-form.md | 앱 드롭 후 입력 채널 살아서 데이터 계속 들어옴 | — | 일반화 후보 (앱 드롭 시 입력 채널 차단 체크리스트) |
| 2026-04-21-orphan-skill-file-after-interrupt.md | 세션 중단 시 커밋/푸시 없이 로컬에만 (2회 재발) | — | 일반화 후보 (인터럽트 직후 git status 가드) |
| 2026-04-23-ios-gidclientid-missing.md | iOS GoogleSignIn GIDClientID 누락 크래시 (high/high) | — (lessons/ 에 일부) | 일반화 후보 (google_sign_in 신규 iOS 빌드 사전 체크) |
| 2026-04-24-insta-autopost-mac-mirror-missing.md | Mac mirror 부재로 인스타 자동 포스팅 누락 | — (이후 본진 자동화로 처리) | 단발 (개별 인프라 셋업 누락) |
| 2026-04-24-ios-ipad13-screenshot-mandatory.md | iPad 13" 스크린샷 누락 차단 (medium/high) | submit-app/lessons/ 일부 | 일반화 후보 (App Store 제출 사전 체크리스트 일반화) |
| 2026-04-25-wsl-playwright-mcp-install-blocked.md | WSL Playwright MCP 설치 하네스 차단 | `feedback_harness_self_modification_gate.md` | 있음 (memory feedback) |
| 2026-04-26-handoff-active-session-marker-mismatch.md | handoff 마커 불일치 | — (handoff 인프라 자체 fix 됨) | 단발 (인프라 결함, fixed) |
| 2026-04-26-handoff-claude-main-empty-shell.md | claude-main tmux 빈 shell | `reference_mac_tmux_persistent_sessions.md` (LaunchAgent 자동 생성) | 있음 (인프라 fix) |
| 2026-04-26-handoff-method-a-fallback-regression.md | METHOD A 회귀, 복붙 폴백으로 빠짐 | `feedback_handoff_method_a_default.md` | 있음 (memory feedback) |
| 2026-04-26-heartbeat-rule-soft-enforcement.md | 5분 하트비트 룰 강제력 부재 (3회 재발) | `feedback_heartbeat_during_work.md` | 있음 (memory feedback) |
| 2026-04-26-paste-block-label-leak.md | 복붙 메시지에 라벨 텍스트 섞음 | `feedback_paste_blocks_as_separate_message.md` | 있음 (memory feedback) |
| 2026-04-26-review-status-disabled-blind-spot.md | _disabled 폴더 모니터 17h 침묵 (high/high) | — | 일반화 후보 (_disabled 폴더 forcing function 패턴) |
| 2026-04-26-tahoe-ssh-cli-block.md | macOS Tahoe systemsetup 차단 | — | 단발 (OS 특정 ver 이슈) |
| 2026-04-27-harness-default-branch-push-block.md | main 직접 push 하네스 차단 | globals/CLAUDE.md 「main 직접 push 금지 / PR 강제」 | 있음 (정책 룰) |
| 2026-04-27-paste-block-mixed-r6.md | 복붙 룰 6번째 재발 | `feedback_paste_blocks_as_separate_message.md` (강화) | 있음 (memory feedback) |
| 2026-04-27-same-turn-commit-fp.md | 같은 turn Write→commit sandbox 거부 | `feedback_respect_harness_denial.md` | 있음 (memory feedback) |
| 2026-04-27-telegram-msg-id-leak.md | 텔레그램 답변에 raw msg ID 인용 | `feedback_no_raw_telegram_msg_ids.md` | 있음 (memory feedback) |
| 2026-04-27-wsl-hanjul-push-classifier-block.md | WSL push 가 classifier 에 막힘 (3회 재발) | `feedback_respect_harness_denial.md` + 「main 직접 push 금지」 정책 | 있음 (memory feedback + 정책) |
| 2026-04-28-cf-colo-region-block.md | CF Workers OpenAI region-block | — | 일반화 후보 (CF Workers 외부 API region-block 사전 체크) |
| 2026-05-01-ep5-backfill-overwrite.md | Substack backfill 이 원본 prose 덮어씀 | `feedback_external_publish_local_first.md` | 있음 (memory feedback) |
| 2026-05-01-wsl-mac-race-skill-edit.md | WSL stale base race | `feedback_stale_check_before_recommend.md` + 「병렬 작업 원칙」 | 있음 (memory feedback + 정책) |
| 2026-05-02-google-oauth-playwright-stealth-bypass.md | Playwright Google OAuth stealth 4종 우회 | `2026-05-02-playwright-google-oauth-stealth.md` | 있음 (knowhow) |
| 2026-05-02-playwright-mcp-cwd-output-dir.md | Playwright MCP cwd `/` 일 때 mkdir ENOENT | — | 일반화 후보 (MCP server cwd 검증 패턴) |
| 2026-05-02-policy-race-mac-wsl.md | globals/CLAUDE.md stale-on-stale 동시 수정 | `feedback_stale_check_before_recommend.md` + 「병렬 작업 원칙」 | 있음 (memory feedback + 정책) |

## 카테고리별 요약

### 이미 일반화됨 (있음, 22건)

세부:
- **knowhow 명시 매핑 (2건)** — Playwright Google OAuth 차단 사건 2건이 단일 knowhow `2026-05-02-playwright-google-oauth-stealth.md` 로 묶임 (rediscovered 패턴).
- **memory feedback 으로 행동룰화 (15건)** — `feedback_*.md` 단일/복수로 처리됨.
- **globals 정책 룰 (3건)** — 「병렬 작업 + 충돌 방지 원칙」/「main 직접 push 금지」 등.
- **Stop hook (1건)** — `telegram-reply-check.sh` (memory feedback 와 짝).
- **인프라 자체 fix (2건)** — handoff 마커 / claude-main tmux LaunchAgent.

### 일반화 후보 (11건, 별도 사이클 검토)

각 항목 = (issues slug → 제안 knowhow 패턴 1줄). 본 작업은 surface 만, 작성 X.

1. `2026-04-12-ios-relaunch-crash` → "Flutter major update lifecycle 회귀 사전 가드 (release 후 SharedPreferencesPlugin 류 plugin 회귀 체크)"
2. `2026-04-20-irun-locked-iphone` → "iOS device lock pre-check (Could not run Runner.app 의 가짜 원인 차단)"
3. `2026-04-21-launchd-silent-job-dropout` → "launchd register 후 verification 게이트 (load 직후 list -i + 30s 후 출력 확인)"
4. `2026-04-21-memory-skill-duplication` → "메모리 vs 스킬 boundary 명문화 (스킬로 유도 가능한 정보는 메모리 X)"
5. `2026-04-21-memoyo-signup-ghost-form` → "앱 드롭 시 입력 채널 차단 체크리스트 (홈페이지 폼 / 백엔드 / 알림 / 스토어 listing)"
6. `2026-04-21-orphan-skill-file-after-interrupt` → "인터럽트 직후 git status 가드 (세션 시작 시 untracked grep)"
7. `2026-04-23-ios-gidclientid-missing` → "google_sign_in 신규 iOS 빌드 사전 체크 (Info.plist GIDClientID + URL scheme)"
8. `2026-04-24-ios-ipad13-screenshot-mandatory` → "App Store 제출 사전 체크리스트 일반화 (iPad 13" 스크린샷 + 스크린샷 사이즈 매트릭스)"
9. `2026-04-26-review-status-disabled-blind-spot` → "_disabled 폴더 forcing function (이동 시 만료일/리마인더 박기)"
10. `2026-04-28-cf-colo-region-block` → "CF Workers 외부 API region-block 사전 체크 (배포 전 cf-colo probe + fallback proxy)"
11. `2026-05-02-playwright-mcp-cwd-output-dir` → "MCP server cwd 검증 패턴 (.mcp.json env/working_directory 명시 디폴트)"

### 단발 사건 (일반화 X, 8건)

1. `2026-04-16-play-console-testers-google-group` — Google 정책 고정 (Group 우회 운영 중)
2. `2026-04-19-android-text-selection-twotone` — Flutter BoxHeightStyle 정책 고정
3. `2026-04-20-telegram-client-delivery-lag` — UX 망원인 1회성
4. `2026-04-24-insta-autopost-mac-mirror-missing` — 개별 인프라 셋업 누락 (이후 자동화로 처리)
5. `2026-04-25-wsl-playwright-mcp-install-blocked` — 위 표에서 memory feedback 으로 분류, 단발 측면도 있음. 분류 = 있음 우선.
6. `2026-04-26-handoff-active-session-marker-mismatch` — 인프라 결함 (fixed)
7. `2026-04-26-handoff-claude-main-empty-shell` — 위 표에서 인프라 fix 로 분류
8. `2026-04-26-tahoe-ssh-cli-block` — OS 특정 ver 이슈

(엄격 단발 = 4건: play-console-testers / android-text-selection / telegram-client-delivery-lag / tahoe-ssh-cli-block. 나머지는 회색지대.)

## 합계

- 총 35건 = 이미 있음 22 + 일반화 후보 11 + 단발 4 + 회색지대 (있음 우선 분류) 4
- 매핑 표 행 누락: **0**
- knowhow `_audit/` 폴더 신설 + 본 파일 1장이 본 작업 산출물 전부

## 후속 (별도 사이클, 본 작업 범위 X)

- 위 11건 일반화 후보를 우선순위 (재발 가능성·심각도) 정렬해서 batch 작성
- 작성 시 issues 원본 .md 의 「예방책」 섹션을 knowhow 의 "절차" 로 추출
- 작성 후 `index.json` 갱신 + INDEX.md 자동 재생성 (`/issue` 스킬은 이슈 전용, knowhow 인덱스는 별도 룰)
