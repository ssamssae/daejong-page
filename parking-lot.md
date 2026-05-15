# Parking Lot — 사이드 프로젝트 + 언젠가 아이디어

해야 할 일은 아니지만 손이 가면 도전하고 싶은 모든 것들 — **사이드 프로젝트 후보** + **언젠가/여유 되면/이런 게 있으면 좋겠다** 류 아이디어를 한 통에 모아둔다. todos.md(진행중·완료·드롭) 와 분리해 우선순위 노이즈 없이 따로 보관. 실제 시작하면 todos.md `## 진행중` 으로 promote, 아니면 그대로 두거나 드롭으로 이동.

(2026-05-02: 기존 someday.md 폐지 후 「언젠가」 컨셉을 parking-lot 에 통합. SoT 단일화 = todos.md + parking-lot.md 두 통.)

(2026-05-03: 분기 사고 정리 — ~/todo/parking-lot.md 와 ~/daejong-page/parking-lot.md 양쪽 따로 운영되던 상태를 union 본문으로 통합. SoT = ~/todo/parking-lot.md, mirror = ~/daejong-page/parking-lot.md.)

(2026-05-15: 완료된 [x] 15건 정리 — 14건 WSL directive 식별분 + 1건 본진 자율 식별분(뉴스레터 자동 발행 cron). 각 항목 완료 일자·근거 inline 기록 후 제거. 본 정리는 강대종 명시 ack(msg_id 7047)로 진행.)

버전 이력은 git log 로 확인.

## 모아둠

- [ ] 🔧 다른 plugin (playwright / swift-lsp / superpowers) launchd spawn 환경 PATH 의존 점검 — mac mini 2026-05-14 plugin:telegram cache 사고의 root cause = launchd EnvironmentVariables PATH 누락 + plugin `.mcp.json` 의 bare 명령 (`bun`) → spawn 실패 패턴. 다른 plugin 의 `.mcp.json` command 가 같은 함정 (bun / homebrew 절대경로 외부 명령) 쓰는지 grep + 다른 노드 launchd 잡 PATH 도 일관 점검. 즉발 사고 없음, 잠재 가드. (추가: 2026-05-14, 출처: mac-report 17:09 KST 후속 5종 중 하나)

- [ ] 💡 고독사방지앱 만들기 — 컨셉/타깃/범위 미정. 아이디어 단계, repo 0 / 코드 0. brainstorm 필요. (추가: 2026-05-14, 트리거: WSL 위임)

- [ ] 💡 알아서(Araseo) v2 roadmap — v1 데모(제출 직전 패키지 + 게이트 위반 0건) 성공 후 확장. (1) Mission Queue / 텍스트 대시보드 (FEDA 픽셀아트 X), (2) 장기 메모리 — 앱 출시 후 reviews 학습 누적, (3) 자율 실행 사고율/개입시간 metric 자동 측정 + 일일 텔레그램 리포트, (4) 다중 컨셉 동시 빌드 (수면앱 + 가계부 동시), (5) OSS 공개 + 후원 채널 (Buy Me a Coffee / GitHub Sponsors). (추가: 2026-05-10, 트리거: brainstorm-araseo-2026-05-10.md)
- [ ] 🔧 3060Ti `~/.claude/automations` git repo 화 — 현재 flat copy 라 본진/WSL 가 claude-automations 에 push 한 hook 변경이 자동 sync 안 됨. 매번 scp 수동. `~/.claude/automations` 옮기고 git clone https://github.com/ssamssae/claude-automations.git 으로 교체 + `~/.claude/hooks → ~/.claude/automations/hooks` symlink 정리. 다른 기기와 동일 패턴. (추가: 2026-05-10, 트리거: placeholder-paste-loss 사고 복구 중 발견)
- [ ] 🔧 Codex→WSL [명령] 2번 수신 버그 — Mac mini Codex가 agent-msg-notify.sh 중복 호출로 WSL에 [명령] 2회 전송. AGENTS.md 규칙 점검 또는 호출 중복 방지 로직 추가 필요. (추가: 2026-05-08)

- [ ] 🤝 🔐 ASC Playwright 로그인 자동화 — Apple ID 2FA 장벽 우회. 방향: (1) Playwright persistent profile + Safari keychain 연동, (2) applescript 세션 재사용, (3) 비밀번호 secrets 저장 + TOTP 코드 자동생성. 현재는 로그인만 수동, 이후 전부 자동화 가능. (추가: 2026-05-05, 트리거: wordyo ASC 앱 생성 시도 중 발견)

- [ ] 🍎 📋 메모요 이용약관 추가 + Play Store 개인정보처리방침 URL 등록 + 앱 설정 내 정책 접근 — 테스터스 커뮤니티 피드백: 스토어 정책 필수 항목. (추가: 2026-05-05, 출처: TC 피드백 5번. 2026-05-13 부분 완료: privacy-memoyo.html 생성 — https://ssamssae.github.io/daejong-page/privacy-memoyo.html )

- [ ] 🍎 📋 메모요 ASO 최적화 — 앱 설명에 키워드(메모/노트/메모장 등) + 기능 불릿 추가. 전환율 향상 목적. (추가: 2026-05-05, 출처: TC 피드백 1번)

- [ ] 🍎 📋 메모요 Play Store 스크린샷 개선 — 다크모드/즉시 실행/빠른 편집 특화 기능 중심 스크린샷 교체. 텍스트 오버레이 추가. (추가: 2026-05-05, 출처: TC 피드백 2번)

- [ ] 🍎 📋 메모요 앱 평가 버튼 추가 — 설정 내 "앱 평가하기" 버튼 + 마일스톤 달성 시 인앱 프롬프트. Play Store 리뷰 유도. (추가: 2026-05-05, 출처: TC 피드백 6번)

- [ ] 🍎 📋 메모요 온보딩 튜토리얼 — 첫 실행 시 핵심 기능 안내 인터랙티브 워크스루 + 도움말 섹션. (추가: 2026-05-05, 출처: TC 피드백 3번)

- [ ] 🍎 📋 메모요 다국어 지원 — 설정에서 언어 선택 메뉴 추가. 현재 영어 고정. (추가: 2026-05-05, 출처: TC 피드백 4번)

- [ ] 🍎 🛠 secall 적용 — AI 채팅 세션 검색 및 브라우징 도구. 친구 후배 추천. 정확한 링크/설치법 확인 필요.  (추가: 2026-05-05)

- [ ] 🍎 💡 메모요 iCloud/Google 동기화 + 인앱결제 출시 — 동기화 버튼 추가 + 구독/일회결제 IAP 연동. 현재 무료·로컬 전용인 메모요를 유료 기능(클라우드 백업) 추가 후 재출시.  (추가: 2026-05-05)

- [ ] 🤝 💡 한줄일기 앱 개선 사이클 — 강대종 사용 중 발견한 개선사항 모음. 다음 버전 기획 시 꺼내기.  (추가: 2026-05-05)

- [ ] 🤝 💡 더치페이 앱 개선 사이클 — 강대종 사용 중 발견한 개선사항 모음.  (추가: 2026-05-05)

- [ ] 🤝 💡 약먹자 앱 개선 사이클 — 강대종 사용 중 발견한 개선사항 모음.  (추가: 2026-05-05)

- [ ] 🍎 💡 Claude Code STT 연결 — macOS 기본 받아쓰기(Fn×2) 또는 Superwhisper/Whisperkit 으로 음성 입력 연동. 카카오 AI 방 리스칼 추천, 만족도 높음.  (추가: 2026-05-05)

- [ ] 🍎 🐛 lottocalc irun 흰화면 버그 (2026-05-04) — iOS 26.3.1 실기기에서 debug/release 모두 흰화면. `flutter run --release` 는 빌드를 `Release-iphoneos/`에 뱉어 코드서명 미적용, `flutter build ios --release` + devicectl 설치해도 흰화면. iproxy Dart VM attach 실패도 동반. 원인 미확정(iOS 26 + Flutter 3.41.9 렌더링 호환 의심). 재시도 시 flutter doctor 상태 + iOS 26 release note 먼저 확인.

- [ ] 🤝 💡 막다른길 상세 렌더러 페이지 — dead-ends 카드 클릭 시 .md 내용을 렌더링해 보여주는 detail.html 신설. issue.html 방식 참고. 현재는 카드 클릭 비활성화 상태. (추가: 2026-05-05)

- [ ] self-heal: 반복 Tier2 패턴 자동 이슈화 (같은 패턴 2일 연속 → /issue 초안 텔레그램) — 2026-05-09 trio-vote 1표 탈락, 나중에 고려
- [ ] 메모요 1.0.4+21 AAB 빌드 후 프로덕션 업데이트 (현재 1.0.3으로 출시됨, 2026-05-10)

- [ ] mini ~/.claude/automations 를 정식 git repo 화 (현재 home 디렉터리가 빈 master + remote 없음, process-agent-inbox.sh 등 변경 추적 안 됨) — 2026-05-10
- [ ] mini inbox bucket 별 처리 카운트 모니터링 + 24h wsl/ 처리 0건이면 텔레그램 경고 (mesh 통신 silent fail 자동 감지) — 2026-05-10
- [ ] TELEGRAM_CHAT_ID_MACMINI 를 .env 에 별도 분리 (현재 강대종 chat 538806975 fallback 으로 Codex 챗과 사람 알림이 같은 채널 공유) — 2026-05-10

- [ ] 데스크탑 3060Ti(DESKTOP-0VAB3QC) Google RD 상태 확인 — stack.html 카드 🟡 확인 필요로 표기. CRD Host 설치/실행 여부 점검 후 ✅/❌ 확정 (2026-05-10)
- [ ] 데스크탑 3060Ti / 노트북 3060 agent-mesh 정식 편입 결정 — 두 노드 모두 sshd inactive 라 인바운드 라우팅 비대칭. 정식 편입 선결: (1) sshd 활성 (2) 텔레그램 봇 채널 강대종 직접 채팅 vs agent mesh routing 분리 (3) Codex CLI 활성 사용 검증. 결정 시점은 mesh 6방향 완성 후. (2026-05-10)
- [ ] GPU 작업 라우팅 — 3개 WSL 노드(WSL DESKTOP-I4TR99I RTX 2070S, 노트북 3060 RTX 3060 6GB, 데스크탑 3060Ti RTX 3060Ti 8GB) 중 데스크탑 3060Ti 만 nvidia-smi 정상 (CUDA 12.8 / driver 572.70 풀 가시성). WSL 본진/노트북은 /dev/dxg 브리지만. 향후 CUDA 작업 라우팅 시 데스크탑 3060Ti 1순위 후보 — 정책 결정 필요 (2026-05-10)
- [ ] 메모요 1.1.0+ 중장기 enhancement — Testers Community 피드백 6건 중 우선 3건은 1.0.4 진행중에 묶고, 잔여 2건은 사이즈 커서 1.1.0 이상으로 이월: (3) 첫 실행 onboarding walkthrough + Help/FAQ 섹션, (4) 다국어(flutter_localizations + 영어/일본어 로컬라이제이션). 보고서: `~/simple_memo_app/docs/feedback/2026-04-23_testers-community-feedback-report.pdf` (2026-05-12)

- [ ] 🍎 🛠 /loop 컨텍스트 누적 회피 — launchd → 텔레그램 → 새 세션 트리거 프로토타입 — 같은 세션에서 컨텍스트만 비우는 방법은 없음(/clear 가 ScheduleWakeup 큐 같이 날림). 우회: launchd/cron 이 N분마다 텔레그램 봇에 "/loop ..." 메시지 → 봇 → 새 Claude 세션이 깨어남 = /clear 효과 + 다음 iter 채팅방에서 연속 표시. 비교 대상 = (1) /compact 4~5 iter 마다 손호출, (2) /schedule cloud routine (본 채팅 분리). 첫 검증 ~1-2시간 예상. (추가: 2026-05-13, 트리거: backlog. 2026-05-14 plan 작성: `~/.claude/plans/plan-loop-context-avoidance-2026-05-14.md` — Phase 1~4 검증 + 위험 분석 + (1) /compact 손호출 대안 ROI 비교 권고)

- [ ] 🤝 🛠 약먹자 S3+S5 AdMob 정책 결정 사이클 — AdMob Android App ID 테스트 ID 잔존 (manifest:42) + google_mobile_ads dep (^5.3.0). 옵션 A (Android 출시 + 실 ID + 광고 인정) / B (iOS-only + Android dep 제거 + AdMob meta 제거) / C (양 OS 광고 완전 제거 + 수익 모델 재설계) 중 강대종 판단 필요. 결정 후 별도 PR. 의존: audit-2026-05-15 S3+S5 (PR #77), competitor-2026-05-15 (PR #81) (추가: 2026-05-15)
- [ ] 🤝 🛠 약먹자 P1 cold-start fix (1.0.4 후속) — `main.dart:36-37` NotificationService.init + AdsService.init 가 runApp 전 동기 await → cold-start TTI 1~3초 추가. fix: runApp 먼저 + addPostFrameCallback 또는 unawaited 백그라운드 init. App Store "느리다" 1점 리스크. 의존: refactor 1.0.3 머지 후 (추가: 2026-05-15)
- [ ] 🤝 🛠 약먹자 ASO 재작성 사이클 — AdMob 정책 결정 후 specs/aso-2026-05-15/yakmukja.md v2 (PR #72) + 포지셔닝 A/B/C 안 (PR #81 competitor) 결합. Play short/ASC keywords 100자 + Subtitle 30자 강화. (추가: 2026-05-15)
- [ ] 🤝 🛠 약먹자 ASC Subtitle 30자 강화안 — 현재 `복용 시간 알림 · 복용 기록` (16자) → `복용 시간 알림 · 복약 기록 · 카운트다운` (22자) 또는 포지셔닝 A안 ("자녀가 부모 폰에 5초 설치하는 약 알람") 압축형. ASO 재작성 사이클과 묶기 (추가: 2026-05-15)
- [ ] 🖥 더치페이 audit 차순위 묶음 정리 — P2 AdaptiveBanner setState 2회→1회 합치기 + D2 pubspec.yaml Flutter create boilerplate 주석 ~50줄 제거 + D3 `_AdaptiveBannerState._size` 필드 중복 제거 + D4 SplashScreen fade 중복(self _fadeOut + Navigator FadeTransition) 통합. 모두 저영향 cleanup, surgical PR 1~4개로 나눠 진행. (추가: 2026-05-15, 트리거: audit-2026-05-15 사이클)
- [ ] 🖥 더치페이 차액 정산 단발 입력 1.1 검토 — 누가 얼마 냈는지 1탭 입력 → 누가 누구에게 보낼지 출력. "고마운 정산" 점령 영역, 정공 충돌 시 진입 시점·차별점은 강대종 결정 사안. (추가: 2026-05-15, 트리거: competitor-2026-05-15 사이클)
- [ ] 🖥 더치페이 Android 출시 정책 확정 (audit D5) — README 는 iOS-only 명시, 코드는 멀티 OS(Platform.isAndroid 분기 + android/ 디렉토리) 유지. 영구 미배포면 Android 트리·분기 정리, 재개면 INTERNET permission 추가 등. 정책 결정 후 별 cleanup 사이클. (추가: 2026-05-15, 트리거: audit-2026-05-15 D5)

- [ ] 🍎 📱 메모요 1.0.5/1.0.6 후보 3종 (사이클 3 competitor PR #80 도출) — (a) PIN/생체인증 잠금 (Standard Notes privacy-first 메시지 흡수 + 에스메모 비밀 메모 견제), (b) 사용자 클라우드 옵션 (iCloud Drive / Google Drive 파일 export — 본 앱 서버 0 유지하면서 sync 욕구 흡수), (c) 위젯 추가 (에스메모 강력 USP 견제). 강대종 우선순위 판단 후 1.0.5 또는 1.0.6 분배. (추가: 2026-05-15 22:00)

- [ ] 🍎 📱 더치페이 1.1 카톡 공유 출력 P0 등재 (사이클 3 competitor PR #83 도출) — 계산 결과 카톡 메시지 1탭 공유. A 군 (한국 토종 1탭 계산기) 동등 진입. USP "권한 0" 훼손 X — OS 공유 시트만 사용. dutch_pay_calculator repo BACKLOG.md 에 P0 등재 + 별 사이클 구현. (추가: 2026-05-15 22:00)

- [ ] 🍎 📱 한줄일기 1.2 강화 4종 (사이클 3 competitor PR #84 도출) — (a) PDF 북 내보내기 (DayGram 유저 리텐션 강점 흡수, 12월 "올해 한 줄들" 공유 카드 형태), (b) Worker AI fallback (OpenAI timeout 시 캐시 위로 문장 반환 — "AI 가 잠시 바빠요" 메시지, 현재 _offlineStub() Worker 버전), (c) 한국어 AI 프롬프트 고도화 (마인디 한국 정서 강점 견제 + Worker system prompt A/B 구조), (d) 온보딩 첫 화면 AI 답글 즉시 경험 (DayGram 직접 경쟁 차별점 노출). (추가: 2026-05-15 22:00)

- [ ] 🍎 📱 약먹자 AdMob 정책 결정 사이클 (사이클 3 audit PR #77 + competitor PR #81 도출) — 옵션 A: Android 출시 + AdMob 실 ID 발급 (광고 노출 인정 + 마케팅 문구 수정) / 옵션 B: iOS-only + Android google_mobile_ads dep 제거 + AdMob meta 제거 (iOS 한정 배너 솔직 메시지) / 옵션 C: 광고 완전 제거 양 OS (광고 0 진정성 + 수익 모델 재설계, in-app 결제·Pro 티어). 강대종 판단 필요 — Medisafe 2026-01 유료 전환으로 무료 시장 빈자리 흡수 윈도우 열림. (추가: 2026-05-15 22:00)

- [ ] 🪟 🧹 단어요 theme.dart 잔재 cleanup 추가 — sheatLegend / heatSummaryFaint / heatSummaryStrong TextStyles 3개 (audit-2026-05-15 범위 밖 발견, 사이클 3 competitor PR #82 메모에서 surface). 사용 0 확인 후 삭제. wordyo repo. (추가: 2026-05-15 22:00)

- [ ] 🍎🪟🏭🖥💻 🚀 loop-fleet audit 미완 7앱 후속 사이클 — 사이클 2 audit 에서 5/12 만 처리 (메모요/단어요/약먹자/더치페이/한줄일기). 미완 = 밥먹자 / 한컵 / pomodoro / 랜덤픽(lottocalc) / 미니가계부 / stock_monitor / babmeokja. 5노드 × 2앱 = 1 사이클 또는 2 사이클로 마감. 출시된 앱 4개 (메모요/단어요/약먹자/더치페이) 우선 사이클 이미 끝났으니 후속은 active dev 정리. (추가: 2026-05-15 22:00)

- [ ] 🪟 🧹 단어요 perf 사이클 (사이클 2 audit PR #75 도출) — P1+P2: `_load` / `_computeCategoryStats` await-in-loop fix (`listCompleted` 패턴 신설) + P3: `getStreak` 90일 상한. wordyo repo. (추가: 2026-05-15 22:05, WSL 위임)

- [ ] 🪟 📱 단어요 카테고리 7번째 추가 검토 — 운동·헬스 영어 / 병원·약국 영어 / 데이팅 영어 중 1개. 사용자 시그널 수집 후 강대종 결정. wordyo repo. (추가: 2026-05-15 22:05, WSL 위임)

- [ ] 🪟 📱 단어요 Play Console A/B 테스트 (Custom store listing) — A안 = 현재 description (장면별 우선) vs B안 = 보상·게임화 강조 (메모리워드 류 후크). 비가역 액션, 강대종 ack 필요. 4주 conversion rate 비교. (추가: 2026-05-15 22:05, WSL 위임)

- [ ] 🪟 📱 단어요 Apple Search Ads 한국 캠페인 — USP 1 키워드 "상황별 영어 단어" / "비즈니스 영어 단어장" ~5만원 budget CPI 테스트. 비가역, 강대종 ack 필요. (추가: 2026-05-15 22:05, WSL 위임)

- [ ] 🪟 📱 단어요 역방향 패키지 검토 — 한→영 (한국어 단어장, 영어권 출장자 대상). 별 앱/패키지로 분리. 단어요 USP "상황별" 그대로 재활용 가능. (추가: 2026-05-15 22:05, WSL 위임)

- [ ] 🍎 📱 미니가계부(mini_expense) Flutter scaffold — 2026-05-13 결정만 박힌 상태 (project_mini_expense_revived.md), repo·코드 0. 다음 작업 빠르게 시작 가능하게 scaffold + 패키지 com.daejongkang.mini_expense 초기 세팅. (추가: 2026-05-15 22:05, WSL 위임)

- [ ] 🍎 🛠 본진 Mac 다음 기기 교체 시 RAM 24~32GB 검토 — 2026-05-15 점검에서 16GB 본진 swap 318MB 사용 + 누적 swapout 719,565 페이지(~11GB) 확인. claude.exe 452MB + iOS Simulator 16GB 마운트(98% 사용) + Chrome 다중 + ghostty + node 동시 부하 = 16GB unified memory 빠듯. 맥미니(같은 16GB)는 swap 0 으로 RAM 병목 X — 본진 워크로드 무게가 원인. M-series 사후 증설 불가, 다음 교체 시 결정. (추가: 2026-05-15, 트리거: 본진 vs 맥미니 비교 점검)

- [ ] 🍎 🔍 automations 의 `scripts/newsletter-auto-publish.sh` 미커밋 surface 처리 — /goodnight (2026-05-16 01:55 KST) 3 repo audit 에서 untracked 발견. plist + script LIVE 2026-05-15 19:20 KST 의 잔여 자동 commit hold 분. 다음 사이클 강대종 검토 후 commit 또는 별도 PR 으로 굴리기. (추가: 2026-05-16 01:55, session-clear 후속안)
