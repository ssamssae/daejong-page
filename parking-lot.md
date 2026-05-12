# Parking Lot — 사이드 프로젝트 + 언젠가 아이디어

해야 할 일은 아니지만 손이 가면 도전하고 싶은 모든 것들 — **사이드 프로젝트 후보** + **언젠가/여유 되면/이런 게 있으면 좋겠다** 류 아이디어를 한 통에 모아둔다. todos.md(진행중·완료·드롭) 와 분리해 우선순위 노이즈 없이 따로 보관. 실제 시작하면 todos.md `## 진행중` 으로 promote, 아니면 그대로 두거나 드롭으로 이동.

(2026-05-02: 기존 someday.md 폐지 후 「언젠가」 컨셉을 parking-lot 에 통합. SoT 단일화 = todos.md + parking-lot.md 두 통.)

(2026-05-03: 분기 사고 정리 — ~/todo/parking-lot.md 와 ~/daejong-page/parking-lot.md 양쪽 따로 운영되던 상태를 union 본문으로 통합. SoT = ~/todo/parking-lot.md, mirror = ~/daejong-page/parking-lot.md.)

버전 이력은 git log 로 확인.

## 모아둠

- [ ] 💡 알아서(Araseo) v2 roadmap — v1 데모(제출 직전 패키지 + 게이트 위반 0건) 성공 후 확장. (1) Mission Queue / 텍스트 대시보드 (FEDA 픽셀아트 X), (2) 장기 메모리 — 앱 출시 후 reviews 학습 누적, (3) 자율 실행 사고율/개입시간 metric 자동 측정 + 일일 텔레그램 리포트, (4) 다중 컨셉 동시 빌드 (수면앱 + 가계부 동시), (5) OSS 공개 + 후원 채널 (Buy Me a Coffee / GitHub Sponsors). (추가: 2026-05-10, 트리거: brainstorm-araseo-2026-05-10.md)
- [ ] 🔧 3060Ti `~/.claude/automations` git repo 화 — 현재 flat copy 라 본진/WSL 가 claude-automations 에 push 한 hook 변경이 자동 sync 안 됨. 매번 scp 수동. `~/.claude/automations` 옮기고 git clone https://github.com/ssamssae/claude-automations.git 으로 교체 + `~/.claude/hooks → ~/.claude/automations/hooks` symlink 정리. 다른 기기와 동일 패턴. (추가: 2026-05-10, 트리거: placeholder-paste-loss 사고 복구 중 발견)
- [ ] 🔧 Codex→WSL [명령] 2번 수신 버그 — Mac mini Codex가 agent-msg-notify.sh 중복 호출로 WSL에 [명령] 2회 전송. AGENTS.md 규칙 점검 또는 호출 중복 방지 로직 추가 필요. (추가: 2026-05-08)

- [ ] 🤝 🔐 ASC Playwright 로그인 자동화 — Apple ID 2FA 장벽 우회. 방향: (1) Playwright persistent profile + Safari keychain 연동, (2) applescript 세션 재사용, (3) 비밀번호 secrets 저장 + TOTP 코드 자동생성. 현재는 로그인만 수동, 이후 전부 자동화 가능. (추가: 2026-05-05, 트리거: wordyo ASC 앱 생성 시도 중 발견)

- [ ] 🍎 📋 메모요 개인정보처리방침/이용약관 추가 — 테스터스 커뮤니티 피드백: 스토어 정책 필수 항목. Play Store 링크 + 앱 설정 내 접근 가능하게. (추가: 2026-05-05, 출처: TC 피드백 5번)

- [ ] 🍎 📋 메모요 ASO 최적화 — 앱 설명에 키워드(메모/노트/메모장 등) + 기능 불릿 추가. 전환율 향상 목적. (추가: 2026-05-05, 출처: TC 피드백 1번)

- [ ] 🍎 📋 메모요 Play Store 스크린샷 개선 — 다크모드/즉시 실행/빠른 편집 특화 기능 중심 스크린샷 교체. 텍스트 오버레이 추가. (추가: 2026-05-05, 출처: TC 피드백 2번)

- [ ] 🍎 📋 메모요 앱 평가 버튼 추가 — 설정 내 "앱 평가하기" 버튼 + 마일스톤 달성 시 인앱 프롬프트. Play Store 리뷰 유도. (추가: 2026-05-05, 출처: TC 피드백 6번)

- [ ] 🍎 📋 메모요 온보딩 튜토리얼 — 첫 실행 시 핵심 기능 안내 인터랙티브 워크스루 + 도움말 섹션. (추가: 2026-05-05, 출처: TC 피드백 3번)

- [ ] 🍎 📋 메모요 다국어 지원 — 설정에서 언어 선택 메뉴 추가. 현재 영어 고정. (추가: 2026-05-05, 출처: TC 피드백 4번)

- [ ] 🍎 🛠 rtk (Rust Token Killer) 적용 — 쉘 명령어 출력 60~90% 토큰 압축. `rtk init -g` 로 Claude Code 훅 등록. github.com/rtk-ai/rtk  (추가: 2026-05-05)

- [ ] 🍎 🛠 superpowers 플러그인 적용 — /brainstorm·/write-plan·/execute-plan 슬래시 커맨드로 계획→TDD→디버깅 워크플로우 강제. `/plugin install superpowers@superpowers-marketplace`. github.com/obra/superpowers  (추가: 2026-05-05)

- [ ] 🍎 🛠 secall 적용 — AI 채팅 세션 검색 및 브라우징 도구. 친구 후배 추천. 정확한 링크/설치법 확인 필요.  (추가: 2026-05-05)

- [ ] 🍎 💡 메모요 iCloud/Google 동기화 + 인앱결제 출시 — 동기화 버튼 추가 + 구독/일회결제 IAP 연동. 현재 무료·로컬 전용인 메모요를 유료 기능(클라우드 백업) 추가 후 재출시.  (추가: 2026-05-05)

- [ ] 🤝 💡 한줄일기 앱 개선 사이클 — 강대종 사용 중 발견한 개선사항 모음. 다음 버전 기획 시 꺼내기.  (추가: 2026-05-05)

- [ ] 🤝 💡 더치페이 앱 개선 사이클 — 강대종 사용 중 발견한 개선사항 모음.  (추가: 2026-05-05)

- [ ] 🤝 💡 약먹자 앱 개선 사이클 — 강대종 사용 중 발견한 개선사항 모음.  (추가: 2026-05-05)

- [x] 🤝 💡 한줄일기 + AI 응원 앱 — WSL 포트폴리오 반영 작업 중 (2026-05-03 디렉티브 전송)
- [x] 🤝 💡 바이브코딩 뉴스레터 — WSL 포트폴리오 반영 작업 중 (2026-05-03 디렉티브 전송)
- [x] 🤝 💡 메모요 — WSL 포트폴리오 반영 작업 중 (2026-05-03 디렉티브 전송)
- [x] 🤝 💡 주식 모니터링 앱 (Flutter) — scaffold 완료 (2026-05-03, ~/apps/stock_monitor, com.daejongkang.stock_monitor, 관심종목 watchlist UI 뼈대. 다음=KRX API 연동)
- [x] 🤝 💡 Plan C 자동화 노하우 콘텐츠화 (Substack) — night-builder v2 / asc-deliver 자동 심사 제출 인사이트 1편. 1인 Flutter 개발자 타깃 콘텐츠. (완료: 2026-05-03 ep6-draft-2026-05-03.md 초안 생성, WSL PR 예정)
- [x] 🤝 🛠 /stack.html SVG 토폴로지 다이어그램 — WSL 작업 중 (2026-05-03 디렉티브 전송, PR 예정)
<!-- 2026-05-02 21:08 — L18 (이슈→노하우 5건 추가 이전) / L19 (WSL Flutter test SKILL 화) 둘 다 완료, todos ## 진행중 [x] 로 이전 -->
- [x] 🤝 💡 이슈 → 노하우 추가 이전 — WSL 작업 중 (2026-05-03 디렉티브 전송, PR 예정)
<!-- 2026-05-02 21:08 — L22 (lotto-calc dhlottery 자동 감지 cron) 완료, todos ## 진행중 [x] 로 이전 -->
- [x] 🍎 🧹 Flutter cache quarantine sweep — 완료 (2026-05-03, mac mini xattr -cr 실행)
<!-- 2026-05-03: lotto-calc stats 2건 제거 — 5/2 slim(lotto-calc) 커밋으로 통계 트랙 폐기됨. StatsScreen/lotto_stats.dart 모두 삭제된 상태라 stale. -->

- [x] 🍎 🛡 Mac mini SSH 보안 강화 — 완료 (2026-05-03, PasswordAuthentication no 적용, authorized_keys 5개 확인)

- [ ] 🍎 💡 Claude Code STT 연결 — macOS 기본 받아쓰기(Fn×2) 또는 Superwhisper/Whisperkit 으로 음성 입력 연동. 카카오 AI 방 리스칼 추천, 만족도 높음.  (추가: 2026-05-05)

- [ ] 🍎 🐛 lottocalc irun 흰화면 버그 (2026-05-04) — iOS 26.3.1 실기기에서 debug/release 모두 흰화면. `flutter run --release` 는 빌드를 `Release-iphoneos/`에 뱉어 코드서명 미적용, `flutter build ios --release` + devicectl 설치해도 흰화면. iproxy Dart VM attach 실패도 동반. 원인 미확정(iOS 26 + Flutter 3.41.9 렌더링 호환 의심). 재시도 시 flutter doctor 상태 + iOS 26 release note 먼저 확인.

- [x] 🍎 🎨 Google Play 개발자 페이지 에셋 제작 (2026-05-04) — 완료: daejong-page/store/play-dev-assets/ (아이콘 512×512 + 헤더 4096×2304) commit 382736a.

- [x] 🍎 ✍️ Google Play 개발자 페이지 문구 작성 (2026-05-04) — 완료: daejong-page/store/play-developer-profile.md. 한국어 84자 / 영어 135자 최종.

- [ ] 🍎 💡 코레일 앱 mitmproxy API 스니핑 — iOS 시뮬레이터 + mitmproxy 로 코레일 앱 네이티브 API 엔드포인트 추출. PerimeterX 미적용 예상. 추출 후 Python으로 직접 호출하면 봇탐지 우회 가능. (추가: 2026-05-05, 막다른길: korail-playwright-bot-detection)

- [ ] 🍎 💡 코레일 앱 Appium 자동화 — 웹 자동화(Playwright) 대신 iOS 시뮬레이터 앱 UI 직접 조작. CDP 기반 아닌 Appium XCUITest 드라이버 사용 → PerimeterX 웹 탐지 레이어 완전 우회. (추가: 2026-05-05, 막다른길: korail-playwright-bot-detection)

- [ ] 🤝 💡 막다른길 상세 렌더러 페이지 — dead-ends 카드 클릭 시 .md 내용을 렌더링해 보여주는 detail.html 신설. issue.html 방식 참고. 현재는 카드 클릭 비활성화 상태. (추가: 2026-05-05)

- self-heal: 반복 Tier2 패턴 자동 이슈화 (같은 패턴 2일 연속 → /issue 초안 텔레그램) — 2026-05-09 trio-vote 1표 탈락, 나중에 고려
- 메모요 1.0.4+21 AAB 빌드 후 프로덕션 업데이트 (현재 1.0.3으로 출시됨, 2026-05-10)

- 헤르메스 에이전트 설치 후 stack.html 노트북 행 반영 (강대종님 설치 완료 후) — 2026-05-10
- loop-run retry 환경 복구 step: git rebase --abort 등 사전 상태 정상화 로직 추가 — 2026-05-10
- mini ~/.claude/automations 를 정식 git repo 화 (현재 home 디렉터리가 빈 master + remote 없음, process-agent-inbox.sh 등 변경 추적 안 됨) — 2026-05-10
- mini inbox bucket 별 처리 카운트 모니터링 + 24h wsl/ 처리 0건이면 텔레그램 경고 (mesh 통신 silent fail 자동 감지) — 2026-05-10
- TELEGRAM_CHAT_ID_MACMINI 를 .env 에 별도 분리 (현재 강대종 chat 538806975 fallback 으로 Codex 챗과 사람 알림이 같은 채널 공유) — 2026-05-10

- Mac mini OpenClaw 에이전트 홈(`/Users/user/.openclaw/agents/main/agent/codex-home/home`) 의 `~/claude-skills` 동기 여부 확인 — macOS 사용자 홈은 이미 clone+동기됨 확인. 에이전트 홈은 별도 환경. CLAUDE.md line 178 에 "별도 관리" 표기됨 (2026-05-10)
- 데스크탑 3060Ti(DESKTOP-0VAB3QC) Google RD 상태 확인 — stack.html 카드 🟡 확인 필요로 표기. CRD Host 설치/실행 여부 점검 후 ✅/❌ 확정 (2026-05-10)
- 데스크탑 3060Ti / 노트북 3060 agent-mesh 정식 편입 결정 — 두 노드 모두 sshd inactive 라 인바운드 라우팅 비대칭. 정식 편입 선결: (1) sshd 활성 (2) 텔레그램 봇 채널 강대종 직접 채팅 vs agent mesh routing 분리 (3) Codex CLI 활성 사용 검증. 결정 시점은 mesh 6방향 완성 후. (2026-05-10)
- GPU 작업 라우팅 — 3개 WSL 노드(WSL DESKTOP-I4TR99I RTX 2070S, 노트북 3060 RTX 3060 6GB, 데스크탑 3060Ti RTX 3060Ti 8GB) 중 데스크탑 3060Ti 만 nvidia-smi 정상 (CUDA 12.8 / driver 572.70 풀 가시성). WSL 본진/노트북은 /dev/dxg 브리지만. 향후 CUDA 작업 라우팅 시 데스크탑 3060Ti 1순위 후보 — 정책 결정 필요 (2026-05-10)
<<<<<<< Updated upstream
- 메모요 1.1.0+ 중장기 enhancement — Testers Community 피드백 6건 중 우선 3건은 1.0.4 진행중에 묶고, 잔여 2건은 사이즈 커서 1.1.0 이상으로 이월: (3) 첫 실행 onboarding walkthrough + Help/FAQ 섹션, (4) 다국어(flutter_localizations + 영어/일본어 로컬라이제이션). 보고서: `~/simple_memo_app/docs/feedback/2026-04-23_testers-community-feedback-report.pdf` (2026-05-12)
=======
- 페다(Feda) 스타일 자율 AI 조직 구현 — 강대종 발화 의존도 낮춘 multi-agent 자율 운영. 출발점 후보: (A) 에이전트 상태 1화면 대시보드 (B) 공유 inbox/blackboard SoT 강화 (C) 자율 트리거 늘리기 (cron+정책). 부족점 = 시각화/공유 메모리/자율 트리거. (2026-05-10, 트리거 = mstoday 페다 기사)
- 데스크탑 3060Ti Clawd on Desk ↔ 데스크탑 WSL Ubuntu24 Claude/Codex 연결 — v0.7.0 설치 완료(보임). 같은 PC 안 에이전트만 감지하는 구조라 데스크탑 Windows Clawd가 WSL 안의 Claude 세션 잡으려면 별도 hook 셋업 필요할 수 있음. 가이드: github.com/rullerzhou-afk/clawd-on-desk/blob/main/docs/guides/codex-wsl-clarification.md (2026-05-10)
- araseo-voice MINOR 정정 phase 2 — (1) `_JAMKKANMAN` substring 매치 위험: "잠깐만이라도/요" 도 mute 트리거. word-boundary 또는 anchor 패턴으로 좁히기. (2) `detect_mute` 의 `int(n_raw)` upper-bound 가드 없음: "듣지 마 99999시간" → 사실상 영구 mute. clamp 추가. (3) `detect_mute` 0분 케이스 docstring 명시. (4) `relogin.py` 의 `session_path_actual = session_path.with_suffix(".session")` no-op alias 정리 (plan 일탈 회피로 보류 중). (2026-05-12)
- araseo-voice hermes-via-wsl.sh wrapper 정식화 — 헤르메스 sshd 가 Windows OpenSSH 라 cmd.exe 떨어져서 기본 hermes-directive.sh 가 tmux 못 찾음. `wsl bash -c` 강제 진입 wrapper 임시 작성 (`/tmp/hermes-via-wsl.sh`). `~/.claude/automations/scripts/` 정식 위치 이전 + 본가 hermes-directive.sh patch 또는 별도 스크립트 결정 필요. 강대종 명시 승인 후 진행. (2026-05-12)
>>>>>>> Stashed changes
