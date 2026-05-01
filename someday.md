# Someday/Maybe

이 파일은 /someday 스킬과 대화를 통해 자동 관리됩니다. 수동으로 편집해도 됩니다.
**해야 할 일은 아니지만 언젠가 해도 좋을 것들** — todos.md 와 분리해 우선순위 노이즈 안 만들고 따로 모아둡니다. 진짜 할 일이 되면 todos.md 로 승격(promote), 아니면 그대로 두거나 드롭.

버전 이력은 git log 로 확인합니다.

## 모아둠

- [ ] 🤝 ⚙️ settings.json allow rule generic 화 — 현재 handoffs/* 만 cover 중인 specific Bash rule 을 issues/ + worklog/ 등 claude-skills repo 의 다른 sub-dir 도 cover 하게 확장. 2026-04-27 handoff commit harness sandbox false positive 사고에서 첫 paste 한 룰 3개가 handoffs/ 디렉토리만 매칭. issue commit 등 다른 sub-dir 작업할 때 같은 false positive 또 날 가능성. handoff commit 첫 통과 검증 후 다음 진화 단계로 자연스러움. WSL 본진은 경로만 /home/ssamssae/claude-skills.  (추가: 2026-04-27)

- [ ] 🤝 🛠 신규 앱 repo 추가 스킬에 "Mac/WSL 양쪽 settings.json allow 룰 추가" step 박기 — hanjul push 차단 사건(2026-04-27 22:08 KST) 같은 것이 다른 앱 도입 시 재발 가능. 신규 앱 등록 시 양 기기 settings.json 에 push allow 룰 자동 박는 step 운영 패턴화. wildcard 룰 박힌 후엔 자동 흡수.  (추가: 2026-04-27)

- [ ] 🍎 📧 mail-watcher false positive 튜닝 — 4h 주기 운영하다 important=true 잘못 잡힌 케이스 누적되면 prompt 더 엄격화 또는 1차 keyword 필터에 false 통과 패턴 추가. 운영 1~2주 후 데이터 쌓이면. 위치 ~/secrets/mail-watcher/mail_watcher.py 의 ollama_classify 함수. (추가: 2026-04-28)

- [ ] 🤝 🛠 install.sh hostname case 패턴에 mac-mini* 추가 — 현재 ~/claude-automations/install.sh 의 case 분기 `*.local|Daejong*|USER*` 가 Mac mini hostname `mac-mini` 매칭 안 함. 4/29 00:36 night-runner-check 직접 launchctl bootstrap 으로 우회했지만, 다음 Mac mini 잡 install 시 같은 우회 반복. 한 줄 패치로 자동화. (추가: 2026-04-29)

- [ ] 🤝 🤖 d19a315 night-build Mac mini 측 install — claude-automations d19a315 commit 이 com.claude.night-build.plist + scripts/night-build.sh push 했지만 Mac mini 측 git pull + launchctl bootstrap 안 거쳤음. 02:00 KST 잡 사실상 가동 0. 위 install.sh 패치 후 함께 처리 가능. 단 night-build.sh 의 사전 조건(flutter, ~/apps 등) Mac mini 충족 여부 별도 검증 필요. (추가: 2026-04-29)

- [ ] 🤝 📨 night-runner v1.1 — 보고서 텔레그램 inline 본문 또는 Mac 본진 SCP fetch. 현 v1 은 Mac mini 로컬 reports/night-runner/YYYY-MM-DD.md 에만 보고서 저장 + 텔레그램 알림은 path 만. 강대종님 검토 위해 SSH 로 cat 또는 별도 sync 필요. v1.1: 텔레그램 알림에 보고서 본문 inline (truncate 포함) 또는 Mac 본진이 매일 06:30 SCP fetch. (추가: 2026-04-29)

- [ ] 🍎 📦 dutch_pay_calculator Mac mini clone + flutter brew install — night-runner-check v1 의 점검 실효성 확보. 현재 Mac mini 에 dutch_pay_calculator 미clone 으로 보고서 SKIPPED. + flutter 미설치로 test/lint 도 SKIPPED. clone (~30초) + brew install --cask flutter (~10~30분, 1GB 다운로드) 필요. 첫 실효 점검까지 가는 마지막 마일. (추가: 2026-04-29)

- [ ] 🍎 🖥 Chrome Remote Desktop mac-mini 호스트 데몬 재설치 — 옛 등록 흔적만 남고 데몬 부재 → 웹 UI 에서는 "온라인" 으로 보여도 실제 연결 X. 본진에서 https://remotedesktop.google.com/access 다시 셋업 필요. 이게 되면 Xcode 같은 GUI 설치도 폰에서 마우스로 처리 가능. (추가: 2026-04-29)

- [ ] 🤝 🤖 /night-runner v2 ramp-up — v1 안전모드(read-only 점검 5개, headless·commit·push·PR 0) 가 03:00 KST launchd 로 가동 후 신뢰 쌓이면 단계 올리기. 다음 단계 후보: BACKLOG 자동 picking, 가벼운 자동 PR(예: TODO·FIXME 라인 한두 개 정리), 7일 silence repo 의 README 자동 갱신 등. 자동 commit/push 가 들어가는 순간 가드 한 단계 더 필요(diff 미리보기 텔레그램 컨펌?). 진행 시 합의 필수. (추가: 2026-04-29)

- [ ] 🍎 🤖 iOS Mac mini 빌드 자동화 — 2026-04-29 수동 4단계 복구(cert trust chain → Xcode 자동 provisioning → codesign partition list → DerivedData clean) 후 hanjul.ipa PASS 만 검증한 상태. 야간 자동 ipa 빌드는 별개 사이클. com.claude.night-build-ios.plist 류 launchd 잡 + 결과 알림. iOS 는 Apple cert 만료/갱신 같은 추가 가드가 Android 보다 까다로워 v2.0a Android 풀그린 안정화 후 진입. (추가: 2026-04-29)

- [ ] 🍎 🛠 Mac mini AGP 9+ newDsl 마이그레이션 — night-build v2.0a (2026-04-29) NOT IN SCOPE 였음. 현재 AGP 8 기반 4앱 빌드 풀그린이라 급하지 않음. AGP 9 가 강제되는 시점(Flutter SDK / Android Studio 메이저 업데이트)에 진행. 4앱 동시 마이그레이션 일관성 필요. (추가: 2026-04-29)

- [ ] 🤝 🛡 /submit-app 출시 후 territory 자동 검증·복구 가드 — ASC 자동 출시(AFTER_APPROVAL) 가 territory record 를 만들지 않는 quirk 가 있어 출시 직후 공개 페이지가 404 가 되는 사고 발생. `/submit-app` 또는 후속 자동화에 출시 직후 `GET /v2/appAvailabilities/{appId}` 검증 + record 없으면 자동으로 174 territory + CHN 1 unavailable POST 단계 내장. 2026-04-30 약먹자·더치페이 unlist 사고(약 22분 만에 수동 복구) 재발 방지 가드. (추가: 2026-04-30)

- [ ] 🤝 🛡 /submit-app 에 reject → 자동 cancel & resubmit 통합 — Apple UNRESOLVED_ISSUES reject 시 옛 reviewSubmission PATCH canceled=true → 새 sub 에 appStoreVersion attach + submitted=true 우회 경로(2026-04-30 한줄일기 사례, 11:06 우회 → 13:29 승인 PASS)를 `~/.claude/automations/scripts/asc-resubmit.py` 스크립트로 만들고 `/submit-app` 본체에서 호출되게 연결. lesson 은 `apple-reject-resubmit-via-cancel.md` 에 이미 정리돼있음. 위 territory 자동 검증·복구 가드 항목과 같은 흐름(출시 사이클 자동화 강화). (추가: 2026-04-30)

- [ ] 🤝 🛡 ASC Resolution Center 답글 ASC API 자동화 — territory/availability 변경 케이스에 한해 reject → 답글 → 재제출까지 한 번에. 답글은 ASC reviewSubmission messages 엔드포인트(별도 API) 사용. 강대종님이 4/29 손으로 친 답글을 대체. 위 cancel & resubmit 항목과 묶어서 한 사이클로 완결 가능. (추가: 2026-04-30)

- [ ] 🤝 🔧 자동발행 파이프라인에 이미지 업로드 단계 추가 — Ep.3 4장 이미지 누락 사고(2026-04-30 발견·수동 패치)의 근본 fix. Substack 자동발행이 본문 paste 만 하고 이미지 업로드는 안 하는 회귀. Playwright MCP 로 본문 paste 후 IMAGE 1~N placeholder 자리에 PNG 자동 업로드까지 묶기. /submit-app 의 4단계 우회와 같은 결의 자동화 강화. lesson 자료: 2026-04-30 Ep.3 수동 패치 흐름(NSPasteboard + 4 file_upload). (추가: 2026-04-30)

- [ ] 🤝 ✍️ Ep.1·Ep.2·Ep.5 도 Ep.3 와 같은 이미지 회귀 검증/패치 — Ep.3 가 누락이었다면 다른 회차도 동일 가능성. curl probe 로 본문 img 카운트 확인 후 누락분 같은 PIL+Pretendard 라인으로 생성·업로드 + 기존 발행본 update. 위 자동발행 파이프라인 fix 와 묶어서 한 사이클로 처리하면 자연스러움. (추가: 2026-04-30)

- [ ] 🤝 🛠 단어요 lib/ 브랜드 트리아지 — 2026-04-30 wordyo repo 부트스트랩 시 sed 일괄 변환 후 lib/ 안 14군데 잔여 한줄일기/hanjul 텍스트 (UI 타이틀, SharedPreferences 키 hanjul_entries_v1, Cloudflare Workers URL hanjul-proxy.ssamssae.workers.dev, stats PNG 파일명, theme.dart 코멘트). 결정 지점 3개: (1) SharedPreferences 키 hanjul_entries_v1 → wordyo_entries_v1 마이그레이션 정책 (신규 시작 vs 기존 사용자 키 임포트), (2) Cloudflare Workers 신규 endpoint hanjul-proxy → wordyo-proxy 발급 + 코드 갱신, (3) UI 타이틀/PNG 파일명/theme 코멘트 일괄 갱신. 결정 후 sed + 수동 손질 1~2시간. (추가: 2026-04-30)

- [ ] 🤝 📚 단어요 카드 학습 진척률 UX (학습완료/즐겨찾기/SRS) — step 3b-3 시드 6카테고리 교체 끝나면 검토. 학습 인터랙션 다음 단계 후보. 현 swipe/tap next 5단어 modulo 순환만 있고 학습 트래킹/즐겨찾기/간격 반복 없음. v1 출시 후 자기쓰기 단계에서 우선순위 결정 권고. (추가: 2026-04-30)

- [ ] 🍎 🛠 단어요 빌드/배포 = Mac mini SoT 통합 — 본진 push 권한 룰 wordyo 미등록 상태에서 PR 흐름 유지(2026-04-30 23:29 KST 결정). Mac mini SoT 자동 배포 시스템(project_auto_deploy_setup_in_progress.md, 4앱 REGISTERED) 에 wordyo 추가 + AAB 자동 빌드 등록 작업 미실행. 단어요 v1 첫 Android 출시 직전에 박으면 됨. (추가: 2026-04-30)

- [ ] 🤝 📸 한줄일기 스크린샷 A/B 1차 시안 — 5/2 14:00 KST 원격 라우틴(`trig_01MBgY9ED6UFEHfJDujixn14`) 결과 + ASC 라이브 metadata baseline (`store/aso-checkpoints/2026-05-01-live-baseline.md`) 받은 후 design-lab 에서 첫 3컷 카피·레이아웃 작업. 한줄일기 ASO 시각 채널 보강. 트리거: 5/2 라우틴 결과 검토 시. (추가: 2026-05-01)

- [ ] 🤝 ✍️ 한줄일기 Promotional Text 170자 안 작성 — 심사 없이 즉시 반영 가능, 가장 빠른 ASO 수정 영역. 라이브 ~100자 → 170 budget 70자 미사용. "광고·로그인 없는 ₩1,900 paid AI 일기" 핵심 차별화 메시지 surface. 트리거: 5/2 라우틴 결과와 함께 검토. (추가: 2026-05-01)

- [ ] 🤝 ✍️ Plan C 자동화 노하우 콘텐츠화 (Substack) — night-builder v2 / asc-deliver 자동 심사 제출 인사이트 1편. 1인 Flutter 개발자 타깃 콘텐츠. 트리거: Plan A (한줄일기 ASO) 1주차 결과 보고 결정 시점. (추가: 2026-05-01)

- [ ] 🤝 🛡 wsl-directive.sh 에 main HEAD SHA 자동 첨부 가드 — 2026-05-01 wsl-mac-race-skill-edit /issue 의 forcing function (c) 코드화. 디렉티브 발송 시점 main HEAD SHA 를 운반체가 본문에 자동 1줄 첨부 → WSL 측이 그 SHA 와 본인 작업 base 가 다르면 경고. mac-report.sh 거울 구조에 추가. 다음 race 발생 전 적용 가치. 트리거: 다음 wsl-directive.sh 호출 흐름에서 동시 또는 별도 PR. (추가: 2026-05-01)


## 승격됨 (→ todos.md)

- 🛠 기기 역할 구조 업데이트 (WSL 직접 개발자 브랜치 정책) — 2026-05-01 14:48 KST P 승격. 강대종님 명시 "다음 세션 첫 작업 OK".
- 🧹 wsl-mac-race-skill-edit 이슈 기록 + 가이드 — 2026-05-01 14:48 KST P 승격. 오늘 사건 신선할 때 /issue 작성.
- 🍅 pomodoro main push allowlist + ~/apps/* wildcard 룰 — 2026-05-01 14:48 KST P 승격 (someday 22+76 묶음).
- 🛠 irun/arun Rosetta 사전체크 SKILL 코드화 + Mac mini setup 체크리스트 Rosetta 항목 — 2026-05-01 14:48 KST P 승격 (someday 52+54 묶음).
- 🛰️ 한줄일기 Android alpha→production /schedule 1회성 등록 — 2026-05-01 14:48 KST P 승격. 14일 카운트 트리거.
- 🌙 night-build launchd schedule 활성화 + 텔레그램 자동 송신 — 2026-05-01 14:48 KST P 승격. v2.0a 풀그린 후 활성화 한 줄.
- 📱 한줄일기 v1.1 iOS Mac mini 이전 재개 — 2026-05-01 14:48 KST P 승격. 본진 키보드 직접 가용.

## 드롭

- 🧹 globals/CLAUDE.md 미커밋 commit (Karpathy 4룰) — **이미 완료** (확인 2026-04-27 23:35 KST). globals/CLAUDE.md line 23 에 "## 코딩 행동 룰 (Karpathy 4룰, 2026-04-27 도입)" 박혀있고 git status clean. 어느 세션에선가 commit + push 끝났음. 추가 작업 불필요.

- 🛠️ 핸드오프 가드 강화 (대안 C) — 2026-05-01 14:48 KST D. 대안 A(동적 세션 탐색)로 우회 작동 중 + 평소 터미널 시작 흐름 변경 단점 + 양 기기 동시 변경 필요. 가치 대비 리스크 작지 않음.

- 🛡 telegram-reply hook fenced 외 평문 paste 인용 detection — 2026-05-01 14:48 KST D. 8번째 재발(2026-04-27 21:01 KST) 후 후속 재발 추가 안 보임 + false positive 트레이드오프 검토 비용. 9번째 재발 발생 시 재기소.

- 📝 paste-block 7·8번째 텔레그램 outbox 스캔 복구 — 2026-05-01 14:48 KST D. 4·5·6 까지 복구된 forcing function 충분 + 7·8 추가 보존 marginal value. 추가 재발 없으면 불필요.

- 🌐 Open WebUI mac-mini 셋업 — 2026-05-01 14:48 KST D. "새 인프라 권장 전 워크플로우 매핑 확인" 룰(memory feedback_check_workflow_before_infra) 적용. OpenClaw 발화에서 파생됐으나 실무 매핑 unclear, mail-watcher 처럼 매핑 명확한 인프라부터 우선.

- 🐍 mac-mini system Python 3.9.6 정리 — 2026-05-01 14:48 KST D. 사용 안 하면 무해, 정리 가치 낮음. PATH 정리 필요한 사례 발생 시 재기소.

- 🔍 goodnight step 1.5 4/27~4/30 안 돈 원인 진단 — 2026-05-01 14:48 KST D. -mtime -1 → -7 우회로 작동. root cause 미진단이지만 -7 윈도우 충분, 다음 사고 발생 시 재진단.

- 📩 Ep.5 Substack subscribe buttons 사후 추가 — 2026-05-01 14:48 KST D. 0 구독자 효과 작음 + 발행본 retro update 비용. 구독자 100명 도달 시 재기소.
