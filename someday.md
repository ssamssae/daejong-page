# Someday/Maybe

해야 할 일은 아니지만 언젠가 해도 좋을 것들. 진짜 할 일이 되면 [할일](./todos.html) 로 승격, 아니면 그대로 두거나 드롭. todos 와 분리해서 우선순위 노이즈 없이 따로 모아둠.

## 모아둠

- 🤝 🛠️ **핸드오프 가드 강화 (대안 C)** — Mac `~/.zshrc` 와 WSL `~/.bashrc` 의 claude-main tmux 가드를 "빈 세션 만들기" 에서 "빈 세션 만들고 그 안에 cc 자동 실행" 으로 강화. 현재는 동적 세션 탐색(대안 A) 으로 빈 셸 함정이 우회되고 있어 무리해서 안 해도 작동에 지장 없음. 하면 핸드오프가 한 단계 더 자연스러워짐. 단점: 평소 터미널 시작 흐름 바뀜(cc 자동 실행이 거슬릴 수 있음), 양 기기 가드 동시 변경 필요. 진행 시 합의 필수.  *(추가: 2026-04-26)*

- 🤝 ⚙️ **settings.json allow rule generic 화** — 현재 `handoffs/*` 만 cover 중인 specific Bash rule 을 `issues/` + `worklog/` 등 claude-skills repo 의 다른 sub-dir 도 cover 하게 확장. 2026-04-27 handoff commit harness sandbox false positive 사고에서 첫 paste 한 룰 3개가 handoffs 디렉토리만 매칭하는 한계. issue commit 등 다른 sub-dir 작업 시 같은 false positive 또 발생 가능성. handoff commit 첫 통과 검증 후 다음 진화 단계로 자연스러움. WSL 본진은 경로만 `/home/ssamssae/claude-skills`.  *(추가: 2026-04-27)*

- 🤝 🛡 **telegram-reply hook 검사 추가 (fenced 외 평문 paste 인용 detection)** — 현재 `~/.claude/hooks/telegram-reply-no-raw-id.sh` 는 fenced 안 명령 + 외부 한국어 sentence 동시 검출만 차단. fenced 없이 본문 평문에 명령어/JSON 인용한 경우는 못 잡음. 8번째 재발(2026-04-27 21:01 KST) 방지 강화 후보. 강대종님 컨펌 후 진행 예정이었던 것. false positive 트레이드오프 검토 필요.  *(추가: 2026-04-27)*

- 🤝 🛠 **신규 앱 repo 추가 스킬에 "양 기기 settings.json allow 룰 추가" step 박기** — hanjul push 차단 사건(2026-04-27 22:08 KST) 같은 것이 다른 앱 도입 시 재발 가능. 신규 앱 등록 시 Mac/WSL 양쪽 settings.json 에 push allow 룰 자동 박는 step 운영 패턴화. 아래 wildcard 룰 항목과 보완 또는 택일.  *(추가: 2026-04-27)*

- 🤝 🛠 **settings.json wildcard 룰 1개로 ~/apps/ 통합 커버** — `Bash(cd ~/apps/* && git push*)` 같은 패턴 한 줄로 ~/apps/ 하위 모든 앱 push 자동 허용. 위 신규 앱 추가 스킬 자동화의 더 가벼운 대안. 단점: 앱별 세분 통제 X. 양 기기 동시 박기 필요. 진행 시 합의.  *(추가: 2026-04-27)*

- 🤝 📝 **paste-block 재발 사례 7·8번째 텔레그램 outbox 스캔으로 복구** — 메모리 `feedback_paste_blocks_as_separate_message.md` 의 recurrences 4·5·6 까지만 시각/내용 박혔음. 7·8 은 prior session 이 issue 작성 시 미기재 (2026-04-27 21:00 ~ 21:01 KST 즈음 추정). 텔레그램 outbox mtime 기준 검색으로 복구 가능. forcing function 강화 위해 데이터 보존.  *(추가: 2026-04-27)*

- 🤝 🧹 **globals/CLAUDE.md 미커밋 commit** — Karpathy 4룰 변경이 `~/.claude/CLAUDE.md → globals/CLAUDE.md` symlink 통해 claude-skills 미커밋 변경으로 잡혀있음. Mac/WSL 양 기기 동기화 완료된 지금이 commit 적기. 한 줄 `git add + commit + push` 면 끝. 단순 정리.  *(추가: 2026-04-27)*

- 🍎 🌐 **Open WebUI mac-mini 셋업** — ChatGPT-style 셀프호스팅 UI for ollama. 이미 mac-mini 에 깔려있는 llama3.1:8b-instruct-q4_K_M 그대로 쓰고, Tailscale 별칭 mac-mini 로 폰/맥에서 `http://mac-mini:8080` 접속. OpenClaw 발화에서 파생. 빌드 추정 5~15분 (`brew install open-webui` 또는 docker). 본인 자체 호스팅 + Claude API 토큰 0.  *(추가: 2026-04-28)*

- 🍎 📧 **mail-watcher false positive 튜닝** — 4h 주기 운영하다 important=true 잘못 잡힌 케이스 누적되면 prompt 더 엄격화 또는 1차 keyword 필터에 false 통과 패턴 추가. 운영 1~2주 후 데이터 쌓이면. 위치 `~/secrets/mail-watcher/mail_watcher.py` 의 `ollama_classify` 함수.  *(추가: 2026-04-28)*

- 🍎 🐍 **mac-mini system Python 3.9.6 정리** — 지금 venv 만 brew python@3.14 사용 중, 시스템 Python 은 EOL 3.9.6 그대로. PATH 우선순위 정리하거나 system Python 그대로 둬도 됨 (사용 안 하면 무해). 정리 옵션.  *(추가: 2026-04-28)*

- 🤝 🤖 **/night-runner v2 ramp-up** — v1 안전모드(read-only 점검 5개, headless·commit·push·PR 0) 가 03:00 KST launchd 로 가동 후 신뢰 쌓이면 단계 올리기. 다음 단계 후보: BACKLOG 자동 picking, 가벼운 자동 PR(예: TODO·FIXME 라인 한두 개 정리), 7일 silence repo 의 README 자동 갱신 등. 자동 commit/push 가 들어가는 순간 가드 한 단계 더 필요(diff 미리보기 텔레그램 컨펌). 진행 시 합의 필수.  *(추가: 2026-04-29)*

- 🍎 🤖 **iOS Mac mini 빌드 자동화** — 2026-04-29 수동 4단계 복구(cert trust chain → Xcode 자동 provisioning → codesign partition list → DerivedData clean) 후 hanjul.ipa PASS 만 검증한 상태. 야간 자동 ipa 빌드는 별개 사이클. `com.claude.night-build-ios.plist` 류 launchd 잡 + 결과 알림. iOS 는 Apple cert 만료/갱신 같은 추가 가드가 Android 보다 까다로워 v2.0a Android 풀그린 안정화 후 진입.  *(추가: 2026-04-29)*

- 🍎 🛠 **Mac mini AGP 9+ newDsl 마이그레이션** — night-build v2.0a (2026-04-29) NOT IN SCOPE 였음. 현재 AGP 8 기반 4앱 빌드 풀그린이라 급하지 않음. AGP 9 가 강제되는 시점(Flutter SDK / Android Studio 메이저 업데이트)에 진행. 4앱 동시 마이그레이션 일관성 필요.  *(추가: 2026-04-29)*

- 🤝 🛠 **irun/arun SKILL.md 에 M1 mac mini Rosetta 사전체크 코드화** — `ssh mac-mini 'pgrep oahd'` 검사 → 실패 시 abort + `sudo softwareupdate --install-rosetta --agree-to-license` 안내 1줄 박기. 2026-04-29 이슈 `rosetta-iproxy-attach` 의 forcing function 을 글로만 적고 실제 SKILL 수정은 안 함. oahd = Rosetta 데몬 (미설치 시 미실행).  *(추가: 2026-04-29)*

- 🤝 🛠 **mac mini setup 체크리스트에 "Apple Silicon 빌드 호스트는 Rosetta 먼저" 항목** — globals/AGENT.md 또는 별도 setup checklist 에 박기. macOS 재설치 시 Xcode/flutter 셋업보다 우선 순서로 `sudo softwareupdate --install-rosetta --agree-to-license` 1줄. iOS debug attach 막힘 재발 방지.  *(추가: 2026-04-29)*

- 🤝 🛡 **/submit-app 출시 후 territory 자동 검증·복구 가드** — ASC 자동 출시(AFTER_APPROVAL) 가 territory record 를 만들지 않는 quirk 가 있어 출시 직후 공개 페이지가 404 가 되는 사고 발생. `/submit-app` 또는 후속 자동화에 출시 직후 `GET /v2/appAvailabilities/{appId}` 검증 + record 없으면 자동으로 174 territory + CHN 1 unavailable POST 단계 내장. 2026-04-30 약먹자·더치페이 unlist 사고(약 22분 만에 수동 복구) 재발 방지 가드.  *(추가: 2026-04-30)*

- 🤝 🛡 **/submit-app 에 reject → 자동 cancel & resubmit 통합** — Apple UNRESOLVED_ISSUES reject 시 옛 reviewSubmission `PATCH canceled=true` → 새 sub 에 appStoreVersion attach + `submitted=true` 우회 경로(2026-04-30 한줄일기 사례, 11:06 우회 → 13:29 승인 PASS) 를 `~/.claude/automations/scripts/asc-resubmit.py` 스크립트로 만들고 `/submit-app` 본체에서 호출되게 연결. lesson 은 `apple-reject-resubmit-via-cancel.md` 에 이미 정리돼있음. 위 territory 자동 검증·복구 가드 항목과 같은 흐름(출시 사이클 자동화 강화).  *(추가: 2026-04-30)*

- 🤝 🛡 **ASC Resolution Center 답글 ASC API 자동화** — territory/availability 변경 케이스에 한해 reject → 답글 → 재제출까지 한 번에. 답글은 ASC reviewSubmission messages 엔드포인트(별도 API) 사용. 강대종님이 4/29 손으로 친 답글을 대체. 위 cancel & resubmit 항목과 묶어서 한 사이클로 완결 가능.  *(추가: 2026-04-30)*

- 🤝 🔧 **자동발행 파이프라인에 이미지 업로드 단계 추가** — Ep.3 4장 이미지 누락 사고(2026-04-30 발견·수동 패치)의 근본 fix. Substack 자동발행이 본문 paste 만 하고 이미지 업로드는 안 하는 회귀. Playwright MCP 로 본문 paste 후 IMAGE 1~N placeholder 자리에 PNG 자동 업로드까지 묶기. lesson 자료: 2026-04-30 Ep.3 수동 패치 흐름(NSPasteboard + 4 file_upload).  *(추가: 2026-04-30)*

- 🤝 ✍️ **Ep.1·Ep.2·Ep.5 도 Ep.3 와 같은 이미지 회귀 검증/패치** — Ep.3 가 누락이었다면 다른 회차도 동일 가능성. curl probe 로 본문 img 카운트 확인 후 누락분 같은 PIL+Pretendard 라인으로 생성·업로드 + 기존 발행본 update. 위 자동발행 파이프라인 fix 와 묶어서 한 사이클로.  *(추가: 2026-04-30)*

- 🤝 🛠 **단어요 lib/ 브랜드 트리아지** — 2026-04-30 wordyo repo 부트스트랩 시 sed 일괄 변환 후 lib/ 안 14군데 잔여 한줄일기/hanjul 텍스트. 결정 지점 3개: (1) SharedPreferences 키 `hanjul_entries_v1` → `wordyo_entries_v1` 마이그레이션 정책, (2) Cloudflare Workers 신규 endpoint `hanjul-proxy` → `wordyo-proxy` 발급 + 코드 갱신, (3) UI 타이틀/PNG 파일명/theme 코멘트 일괄 갱신. 결정 후 1~2시간.  *(추가: 2026-04-30)*

- 🤝 🛰️ **한줄일기 Android alpha → production 자동 schedule** — 2026-04-30 19:00 alpha 트랙 vc=5 commit 직후 14일 카운트 시작 (Testers Community 결제 + 테스터 등록 후). 14일 통과 후 production 트랙 ₩1,900 KOR commit 1회 자동 사이클. /schedule 으로 5/14 경 1회성 agent 박아두면 망각 방지. 14일 카운트 정확한 시작점이 테스터 등록 시점이라 그 시점 확인 후 D-day 계산 필요.  *(추가: 2026-04-30)*

## 승격됨 (→ 할일)

(없음)

## 드롭

(없음)
