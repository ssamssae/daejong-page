# Parking Lot — 사이드 프로젝트 + 언젠가 아이디어

해야 할 일은 아니지만 손이 가면 도전하고 싶은 모든 것들 — **사이드 프로젝트 후보** + **언젠가/여유 되면/이런 게 있으면 좋겠다** 류 아이디어를 한 통에 모아둔다. todos.md(진행중·완료·드롭) 와 분리해 우선순위 노이즈 없이 따로 보관. 실제 시작하면 todos.md `## 진행중` 으로 promote, 아니면 그대로 두거나 드롭으로 이동.

(2026-05-02: 기존 someday.md 폐지 후 「언젠가」 컨셉을 parking-lot 에 통합. SoT 단일화 = todos.md + parking-lot.md 두 통.)

(2026-05-03: 분기 사고 정리 — ~/todo/parking-lot.md 와 ~/daejong-page/parking-lot.md 양쪽 따로 운영되던 상태를 union 본문으로 통합. SoT = ~/todo/parking-lot.md, mirror = ~/daejong-page/parking-lot.md.)

(2026-05-15: 완료된 [x] 15건 정리 — 14건 WSL directive 식별분 + 1건 본진 자율 식별분(뉴스레터 자동 발행 cron). 각 항목 완료 일자·근거 inline 기록 후 제거. 본 정리는 강대종 명시 ack(msg_id 7047)로 진행.)

버전 이력은 git log 로 확인.

## 모아둠

- [ ] 🤝 블라인드(Blind) 가입 + 마이너스베타스튜디오 회사 인증 (직장인 익명 커뮤니티 앱에 내 회사로 가입하기) — daejong@kangdaejong.com Email Routing 셋업 후 시도. 마이너스베타스튜디오는 2026-05-04 개업 신생 회사라 블라인드 DB 미등록 가능성 높음. 신규 회사 등록 신청 시 사업자등록증(878-21-02478) + 회사 이메일(daejong@kangdaejong.com) 둘 다 첨부. 가입 자체는 형님 손, 회사 인증은 블라인드 admin review 며칠 걸릴 수 있음. (추가: 2026-05-17 14:45 KST, /session-clear 후속안)
- [ ] 🤝 🔧 ssamssae/kangdaejong-com push 자동 배포 셋업 (회사 홈페이지에 코드 올리면 자동으로 사이트 갱신되게 만들기) — 회사 페이지(kangdaejong.com) repo 에 변경 push 시 wrangler 수동 호출 없이 자동 빌드+배포. 옵션 3개: (1) Cloudflare Pages Git Integration(dashboard 클릭 1회, 가장 단순) / (2) GitHub Actions workflow + Secrets 에 CF API 토큰 / (3) Mac mini cron/launchd + 매 N분 git pull 후 변경 시 wrangler deploy. 현재 Direct Upload 만 셋업돼 매 push 마다 `wrangler pages deploy dist --project-name kangdaejong-com` 명시 호출 필요. 콘텐츠 자주 안 바뀌면 ROI 작음 — 가벼운 별 사이클. 메모리 [[reference_cf_api_token_wrangler]] 와 연계. (추가: 2026-05-17 18:10 KST, /session-clear 후속안)
- [ ] 🍎 🤝 메모요 sync 재개 (Firebase 프로젝트 생성 + 크레덴셜 두 파일 배치) (메모 앱 클라우드 동기화 기능 다시 켜기 위한 인증 파일 준비) — 메모요 sync 자율루프(`com.daejongkang.memoyo-sync-loop`) 가 S3 비가역 hold 에서 종료된 상태. 재개 시점: 형님이 Firebase Console 에서 프로젝트 생성 → `google-services.json` (Android) 와 `GoogleService-Info.plist` (iOS) 다운로드 → `~/simple_memo_app/android/app/` + `~/simple_memo_app/ios/Runner/` 각각 배치. 끝나면 `launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.daejongkang.memoyo-sync-loop.plist` 한 줄로 루프 복귀 → S4 부터 자율 진행. plist+runner 보존 (PR #30 merge 후). 메모리 [[project_memoyo_sync_loop_2026_05_17]]. (추가: 2026-05-17 14:45 KST, /session-clear 후속안)
- [ ] 🔧 다른 plugin (playwright / swift-lsp / superpowers) launchd spawn 환경 PATH 의존 점검 (Mac 자동 실행되는 백그라운드 도구들이 명령 경로 못 찾는 함정 미리 점검) — mac mini 2026-05-14 plugin:telegram cache 사고의 root cause = launchd EnvironmentVariables PATH 누락 + plugin `.mcp.json` 의 bare 명령 (`bun`) → spawn 실패 패턴. 다른 plugin 의 `.mcp.json` command 가 같은 함정 (bun / homebrew 절대경로 외부 명령) 쓰는지 grep + 다른 노드 launchd 잡 PATH 도 일관 점검. 즉발 사고 없음, 잠재 가드. (추가: 2026-05-14, 출처: mac-report 17:09 KST 후속 5종 중 하나)

- [ ] 💡 고독사방지앱 만들기 — 컨셉/타깃/범위 미정. 아이디어 단계, repo 0 / 코드 0. brainstorm 필요. (추가: 2026-05-14, 트리거: WSL 위임)

- [ ] 💡 알아서(Araseo) v2 roadmap (앱 자동 제작 도구 다음 버전 큰 그림 짜기) — v1 데모(제출 직전 패키지 + 게이트 위반 0건) 성공 후 확장. (1) Mission Queue / 텍스트 대시보드 (FEDA 픽셀아트 X), (2) 장기 메모리 — 앱 출시 후 reviews 학습 누적, (3) 자율 실행 사고율/개입시간 metric 자동 측정 + 일일 텔레그램 리포트, (4) 다중 컨셉 동시 빌드 (수면앱 + 가계부 동시), (5) OSS 공개 + 후원 채널 (Buy Me a Coffee / GitHub Sponsors). (추가: 2026-05-10, 트리거: brainstorm-araseo-2026-05-10.md)
- [ ] 🔧 3060Ti `~/.claude/automations` git repo 화 (데스크탑 컴퓨터의 자동화 스크립트 폴더를 코드 저장소로 묶어 다른 기기와 자동 동기화되게 하기) — 현재 flat copy 라 본진/WSL 가 claude-automations 에 push 한 hook 변경이 자동 sync 안 됨. 매번 scp 수동. `~/.claude/automations` 옮기고 git clone https://github.com/ssamssae/claude-automations.git 으로 교체 + `~/.claude/hooks → ~/.claude/automations/hooks` symlink 정리. 다른 기기와 동일 패턴. (추가: 2026-05-10, 트리거: placeholder-paste-loss 사고 복구 중 발견)
- [ ] 🔧 Codex→WSL [명령] 2번 수신 버그 (맥미니에서 보낸 명령이 WSL 컴퓨터에 두 번 도착하는 중복 문제 고치기) — Mac mini Codex가 agent-msg-notify.sh 중복 호출로 WSL에 [명령] 2회 전송. AGENTS.md 규칙 점검 또는 호출 중복 방지 로직 추가 필요. (추가: 2026-05-08)

- [ ] 🤝 🔐 ASC Playwright 로그인 자동화 (애플 개발자 사이트 로그인을 자동화해서 매번 손으로 안 치게 만들기) — Apple ID 2FA 장벽 우회. 방향: (1) Playwright persistent profile + Safari keychain 연동, (2) applescript 세션 재사용, (3) 비밀번호 secrets 저장 + TOTP 코드 자동생성. 현재는 로그인만 수동, 이후 전부 자동화 가능. (추가: 2026-05-05, 트리거: wordyo ASC 앱 생성 시도 중 발견)

- [ ] 🍎 📋 메모요 이용약관 추가 + Play Store 개인정보처리방침 URL 등록 + 앱 설정 내 정책 접근 (메모 앱에 법적 필수 문서 붙이고 스토어에 링크 등록하기) — 테스터스 커뮤니티 피드백: 스토어 정책 필수 항목. (추가: 2026-05-05, 출처: TC 피드백 5번. 2026-05-13 부분 완료: privacy-memoyo.html 생성 — https://ssamssae.github.io/daejong-page/privacy-memoyo.html )

- [ ] 🍎 📋 메모요 ASO 최적화 (메모 앱이 스토어 검색에 더 잘 노출되도록 설명·키워드 다듬기) — 앱 설명에 키워드(메모/노트/메모장 등) + 기능 불릿 추가. 전환율 향상 목적. (추가: 2026-05-05, 출처: TC 피드백 1번)

- [ ] 🍎 📋 메모요 Play Store 스크린샷 개선 (메모 앱 스토어 페이지에 보여줄 화면 사진을 더 매력적으로 교체) — 다크모드/즉시 실행/빠른 편집 특화 기능 중심 스크린샷 교체. 텍스트 오버레이 추가. (추가: 2026-05-05, 출처: TC 피드백 2번)

- [ ] 🍎 📋 메모요 앱 평가 버튼 추가 (메모 앱 안에서 별점 남기기 유도하는 버튼·팝업 만들기) — 설정 내 "앱 평가하기" 버튼 + 마일스톤 달성 시 인앱 프롬프트. Play Store 리뷰 유도. (추가: 2026-05-05, 출처: TC 피드백 6번)

- [ ] 🍎 📋 메모요 온보딩 튜토리얼 (메모 앱 첫 실행 때 사용법 안내 화면 만들기) — 첫 실행 시 핵심 기능 안내 인터랙티브 워크스루 + 도움말 섹션. (추가: 2026-05-05, 출처: TC 피드백 3번)

- [ ] 🍎 📋 메모요 다국어 지원 (메모 앱에 영어/일본어 등 외국어 메뉴 추가하기) — 설정에서 언어 선택 메뉴 추가. 현재 영어 고정. (추가: 2026-05-05, 출처: TC 피드백 4번)

- [ ] 🍎 🛠 secall 적용 (지난 AI 대화 내용을 검색·열람하는 도구 설치해보기) — AI 채팅 세션 검색 및 브라우징 도구. 친구 후배 추천. 정확한 링크/설치법 확인 필요.  (추가: 2026-05-05)

- [ ] 🍎 💡 메모요 iCloud/Google 동기화 + 인앱결제 출시 (메모 앱에 클라우드 백업 유료 기능 붙여 재출시) — 동기화 버튼 추가 + 구독/일회결제 IAP 연동. 현재 무료·로컬 전용인 메모요를 유료 기능(클라우드 백업) 추가 후 재출시.  (추가: 2026-05-05)

- [ ] 🤝 💡 한줄일기 앱 개선 사이클 (한 줄 일기 앱 직접 써보며 모은 개선 아이디어들 정리해서 다음 버전에 반영) — 강대종 사용 중 발견한 개선사항 모음. 다음 버전 기획 시 꺼내기.  (추가: 2026-05-05)

- [ ] 🤝 💡 더치페이 앱 개선 사이클 (더치페이 계산기 앱 직접 써보며 모은 개선 아이디어들 정리) — 강대종 사용 중 발견한 개선사항 모음.  (추가: 2026-05-05)

- [ ] 🤝 💡 약먹자 앱 개선 사이클 (약 복용 알림 앱 직접 써보며 모은 개선 아이디어들 정리) — 강대종 사용 중 발견한 개선사항 모음.  (추가: 2026-05-05)

- [ ] 🍎 💡 Claude Code STT 연결 (AI 코딩 도구에 음성으로 명령 내리는 받아쓰기 기능 붙이기) — macOS 기본 받아쓰기(Fn×2) 또는 Superwhisper/Whisperkit 으로 음성 입력 연동. 카카오 AI 방 리스칼 추천, 만족도 높음.  (추가: 2026-05-05)

- [ ] 🍎 🐛 lottocalc irun 흰화면 버그 (2026-05-04) (로또 계산기 앱을 아이폰에서 켰을 때 화면이 하얗게만 뜨는 버그 잡기) — iOS 26.3.1 실기기에서 debug/release 모두 흰화면. `flutter run --release` 는 빌드를 `Release-iphoneos/`에 뱉어 코드서명 미적용, `flutter build ios --release` + devicectl 설치해도 흰화면. iproxy Dart VM attach 실패도 동반. 원인 미확정(iOS 26 + Flutter 3.41.9 렌더링 호환 의심). 재시도 시 flutter doctor 상태 + iOS 26 release note 먼저 확인.

- [ ] 🤝 💡 막다른길 상세 렌더러 페이지 (포트폴리오 사이트에서 실패한 프로젝트 카드 클릭하면 자세한 설명 페이지 열리게 만들기) — dead-ends 카드 클릭 시 .md 내용을 렌더링해 보여주는 detail.html 신설. issue.html 방식 참고. 현재는 카드 클릭 비활성화 상태. (추가: 2026-05-05)

- [ ] self-heal: 반복 Tier2 패턴 자동 이슈화 (같은 문제가 이틀 연속 반복되면 자동으로 이슈 기록 초안 만들어 알림) (같은 패턴 2일 연속 → /issue 초안 텔레그램) — 2026-05-09 trio-vote 1표 탈락, 나중에 고려
- [ ] 메모요 1.0.4+21 AAB 빌드 후 프로덕션 업데이트 (메모 앱 다음 버전 빌드해서 플레이스토어 정식 출시) (현재 1.0.3으로 출시됨, 2026-05-10)

- [ ] mini ~/.claude/automations 를 정식 git repo 화 (맥미니의 자동화 스크립트 폴더를 코드 저장소로 묶어 변경 이력 남기기) (현재 home 디렉터리가 빈 master + remote 없음, process-agent-inbox.sh 등 변경 추적 안 됨) — 2026-05-10
- [ ] mini inbox bucket 별 처리 카운트 모니터링 + 24h wsl/ 처리 0건이면 텔레그램 경고 (기기 사이 메시지 큐가 조용히 죽었는지 자동 감지해 텔레그램 알림) (mesh 통신 silent fail 자동 감지) — 2026-05-10
- [ ] TELEGRAM_CHAT_ID_MACMINI 를 .env 에 별도 분리 (맥미니 봇 알림용 텔레그램 채팅 아이디를 사람 알림 채팅과 분리해 섞이지 않게 하기) (현재 강대종 chat 538806975 fallback 으로 Codex 챗과 사람 알림이 같은 채널 공유) — 2026-05-10

- [ ] 데스크탑 3060Ti(DESKTOP-0VAB3QC) Google RD 상태 확인 (데스크탑 컴퓨터에 구글 원격 데스크톱이 실제로 깔려 돌고 있는지 확인) — stack.html 카드 🟡 확인 필요로 표기. CRD Host 설치/실행 여부 점검 후 ✅/❌ 확정 (2026-05-10)
- [ ] 데스크탑 3060Ti / 노트북 3060 agent-mesh 정식 편입 결정 (데스크탑·노트북 두 기기를 다른 기기들과 자동으로 명령 주고받는 메시 네트워크에 정식 합류시킬지 결정) — 두 노드 모두 sshd inactive 라 인바운드 라우팅 비대칭. 정식 편입 선결: (1) sshd 활성 (2) 텔레그램 봇 채널 강대종 직접 채팅 vs agent mesh routing 분리 (3) Codex CLI 활성 사용 검증. 결정 시점은 mesh 6방향 완성 후. (2026-05-10)
- [ ] GPU 작업 라우팅 (그래픽카드 쓰는 무거운 AI 작업을 어느 컴퓨터로 보낼지 규칙 정하기) — 3개 WSL 노드(WSL DESKTOP-I4TR99I RTX 2070S, 노트북 3060 RTX 3060 6GB, 데스크탑 3060Ti RTX 3060Ti 8GB) 중 데스크탑 3060Ti 만 nvidia-smi 정상 (CUDA 12.8 / driver 572.70 풀 가시성). WSL 본진/노트북은 /dev/dxg 브리지만. 향후 CUDA 작업 라우팅 시 데스크탑 3060Ti 1순위 후보 — 정책 결정 필요 (2026-05-10)
- [ ] 메모요 1.1.0+ 중장기 enhancement (메모 앱의 더 큰 업데이트에 묶을 사용법 안내·다국어 같은 장기 과제 모음) — Testers Community 피드백 6건 중 우선 3건은 1.0.4 진행중에 묶고, 잔여 2건은 사이즈 커서 1.1.0 이상으로 이월: (3) 첫 실행 onboarding walkthrough + Help/FAQ 섹션, (4) 다국어(flutter_localizations + 영어/일본어 로컬라이제이션). 보고서: `~/simple_memo_app/docs/feedback/2026-04-23_testers-community-feedback-report.pdf` (2026-05-12)

- [ ] 🍎 🛠 /loop 컨텍스트 누적 회피 — launchd → 텔레그램 → 새 세션 트리거 프로토타입 (반복 작업 도중 AI 기억이 가득 차는 문제를, 일정 주기마다 자동으로 새 대화방을 열어 회피하기) — 같은 세션에서 컨텍스트만 비우는 방법은 없음(/clear 가 ScheduleWakeup 큐 같이 날림). 우회: launchd/cron 이 N분마다 텔레그램 봇에 "/loop ..." 메시지 → 봇 → 새 Claude 세션이 깨어남 = /clear 효과 + 다음 iter 채팅방에서 연속 표시. 비교 대상 = (1) /compact 4~5 iter 마다 손호출, (2) /schedule cloud routine (본 채팅 분리). 첫 검증 ~1-2시간 예상. (추가: 2026-05-13, 트리거: backlog. 2026-05-14 plan 작성: `~/.claude/plans/plan-loop-context-avoidance-2026-05-14.md` — Phase 1~4 검증 + 위험 분석 + (1) /compact 손호출 대안 ROI 비교 권고)

- [ ] 🤝 🛠 약먹자 S3+S5 AdMob 정책 결정 사이클 (약 복용 앱에 광고를 정식으로 붙일지, 안드로이드 빼고 갈지, 광고 자체를 뺄지 결정) — AdMob Android App ID 테스트 ID 잔존 (manifest:42) + google_mobile_ads dep (^5.3.0). 옵션 A (Android 출시 + 실 ID + 광고 인정) / B (iOS-only + Android dep 제거 + AdMob meta 제거) / C (양 OS 광고 완전 제거 + 수익 모델 재설계) 중 강대종 판단 필요. 결정 후 별도 PR. 의존: audit-2026-05-15 S3+S5 (PR #77), competitor-2026-05-15 (PR #81) (추가: 2026-05-15)
- [ ] 🤝 🛠 약먹자 P1 cold-start fix (1.0.4 후속) (약 앱 처음 켤 때 1~3초 멍하니 뜨는 문제 손보기) — `main.dart:36-37` NotificationService.init + AdsService.init 가 runApp 전 동기 await → cold-start TTI 1~3초 추가. fix: runApp 먼저 + addPostFrameCallback 또는 unawaited 백그라운드 init. App Store "느리다" 1점 리스크. 의존: refactor 1.0.3 머지 후 (추가: 2026-05-15)
- [ ] 🤝 🛠 약먹자 ASO 재작성 사이클 (약 앱 스토어 설명·키워드를 광고 정책 결정에 맞춰 다시 쓰기) — AdMob 정책 결정 후 specs/aso-2026-05-15/yakmukja.md v2 (PR #72) + 포지셔닝 A/B/C 안 (PR #81 competitor) 결합. Play short/ASC keywords 100자 + Subtitle 30자 강화. (추가: 2026-05-15)
- [ ] 🤝 🛠 약먹자 ASC Subtitle 30자 강화안 (약 앱 앱스토어 부제목을 더 매력적인 문구로 짧고 강하게 다듬기) — 현재 `복용 시간 알림 · 복용 기록` (16자) → `복용 시간 알림 · 복약 기록 · 카운트다운` (22자) 또는 포지셔닝 A안 ("자녀가 부모 폰에 5초 설치하는 약 알람") 압축형. ASO 재작성 사이클과 묶기 (추가: 2026-05-15)
- [ ] 🖥 더치페이 audit 차순위 묶음 정리 (더치페이 앱 코드 점검에서 나온 자잘한 정리 항목들 한 번에 청소) — P2 AdaptiveBanner setState 2회→1회 합치기 + D2 pubspec.yaml Flutter create boilerplate 주석 ~50줄 제거 + D3 `_AdaptiveBannerState._size` 필드 중복 제거 + D4 SplashScreen fade 중복(self _fadeOut + Navigator FadeTransition) 통합. 모두 저영향 cleanup, surgical PR 1~4개로 나눠 진행. (추가: 2026-05-15, 트리거: audit-2026-05-15 사이클)
- [ ] 🖥 더치페이 차액 정산 단발 입력 1.1 검토 (누가 얼마씩 냈는지 한 화면에서 입력하면 누가 누구에게 보내야 하는지 바로 알려주는 기능 검토) — 누가 얼마 냈는지 1탭 입력 → 누가 누구에게 보낼지 출력. "고마운 정산" 점령 영역, 정공 충돌 시 진입 시점·차별점은 강대종 결정 사안. (추가: 2026-05-15, 트리거: competitor-2026-05-15 사이클)
- [ ] 🖥 더치페이 Android 출시 정책 확정 (audit D5) (더치페이 앱을 안드로이드에도 낼지, 아이폰 전용으로 갈지 확정하기) — README 는 iOS-only 명시, 코드는 멀티 OS(Platform.isAndroid 분기 + android/ 디렉토리) 유지. 영구 미배포면 Android 트리·분기 정리, 재개면 INTERNET permission 추가 등. 정책 결정 후 별 cleanup 사이클. (추가: 2026-05-15, 트리거: audit-2026-05-15 D5)

- [ ] 🍎 📱 메모요 1.0.5/1.0.6 후보 3종 (사이클 3 competitor PR #80 도출) (메모 앱 다음 업데이트 후보 — 비밀번호 잠금·클라우드 백업 옵션·홈 위젯 중 우선순위 정하기) — (a) PIN/생체인증 잠금 (Standard Notes privacy-first 메시지 흡수 + 에스메모 비밀 메모 견제), (b) 사용자 클라우드 옵션 (iCloud Drive / Google Drive 파일 export — 본 앱 서버 0 유지하면서 sync 욕구 흡수), (c) 위젯 추가 (에스메모 강력 USP 견제). 강대종 우선순위 판단 후 1.0.5 또는 1.0.6 분배. (추가: 2026-05-15 22:00)

- [ ] 🍎 📱 더치페이 1.1 카톡 공유 출력 P0 등재 (사이클 3 competitor PR #83 도출) (더치페이 계산 결과를 한 번에 카카오톡으로 공유하는 기능 다음 버전 최우선 과제로 등록) — 계산 결과 카톡 메시지 1탭 공유. A 군 (한국 토종 1탭 계산기) 동등 진입. USP "권한 0" 훼손 X — OS 공유 시트만 사용. dutch_pay_calculator repo BACKLOG.md 에 P0 등재 + 별 사이클 구현. (추가: 2026-05-15 22:00)

- [ ] 🍎 📱 한줄일기 1.2 강화 4종 (사이클 3 competitor PR #84 도출) (한 줄 일기 앱 다음 업데이트 4가지 — PDF 책 내보내기·AI 답글 안정화·한국어 답변 품질·온보딩 첫 인상 개선) — (a) PDF 북 내보내기 (DayGram 유저 리텐션 강점 흡수, 12월 "올해 한 줄들" 공유 카드 형태), (b) Worker AI fallback (OpenAI timeout 시 캐시 위로 문장 반환 — "AI 가 잠시 바빠요" 메시지, 현재 _offlineStub() Worker 버전), (c) 한국어 AI 프롬프트 고도화 (마인디 한국 정서 강점 견제 + Worker system prompt A/B 구조), (d) 온보딩 첫 화면 AI 답글 즉시 경험 (DayGram 직접 경쟁 차별점 노출). (추가: 2026-05-15 22:00)

- [ ] 🍎 📱 약먹자 AdMob 정책 결정 사이클 (사이클 3 audit PR #77 + competitor PR #81 도출) (약 앱 광고 방향 3안 중 결정 — 실광고 붙이기·아이폰만 출시·광고 빼고 유료화) — 옵션 A: Android 출시 + AdMob 실 ID 발급 (광고 노출 인정 + 마케팅 문구 수정) / 옵션 B: iOS-only + Android google_mobile_ads dep 제거 + AdMob meta 제거 (iOS 한정 배너 솔직 메시지) / 옵션 C: 광고 완전 제거 양 OS (광고 0 진정성 + 수익 모델 재설계, in-app 결제·Pro 티어). 강대종 판단 필요 — Medisafe 2026-01 유료 전환으로 무료 시장 빈자리 흡수 윈도우 열림. (추가: 2026-05-15 22:00)

- [ ] 🪟 🧹 단어요 theme.dart 잔재 cleanup 추가 (단어 학습 앱 디자인 파일에서 안 쓰는 코드 세 줄 청소) — sheatLegend / heatSummaryFaint / heatSummaryStrong TextStyles 3개 (audit-2026-05-15 범위 밖 발견, 사이클 3 competitor PR #82 메모에서 surface). 사용 0 확인 후 삭제. wordyo repo. (추가: 2026-05-15 22:00)

- [ ] 🍎🪟🏭🖥💻 🚀 loop-fleet audit 미완 7앱 후속 사이클 (지난번 5대 동시 코드 점검에서 빠진 나머지 7개 앱도 마저 점검) — 사이클 2 audit 에서 5/12 만 처리 (메모요/단어요/약먹자/더치페이/한줄일기). 미완 = 밥먹자 / 한컵 / pomodoro / 랜덤픽(lottocalc) / 미니가계부 / stock_monitor / babmeokja. 5노드 × 2앱 = 1 사이클 또는 2 사이클로 마감. 출시된 앱 4개 (메모요/단어요/약먹자/더치페이) 우선 사이클 이미 끝났으니 후속은 active dev 정리. (추가: 2026-05-15 22:00)

- [ ] 🪟 🧹 단어요 perf 사이클 (사이클 2 audit PR #75 도출) (단어 학습 앱 데이터 불러오는 속도 느린 부분 고치기) — P1+P2: `_load` / `_computeCategoryStats` await-in-loop fix (`listCompleted` 패턴 신설) + P3: `getStreak` 90일 상한. wordyo repo. (추가: 2026-05-15 22:05, WSL 위임)

- [ ] 🪟 📱 단어요 카테고리 7번째 추가 검토 (단어 학습 앱에 운동/병원/데이팅 영어 중 한 카테고리 더 넣을지 검토) — 운동·헬스 영어 / 병원·약국 영어 / 데이팅 영어 중 1개. 사용자 시그널 수집 후 강대종 결정. wordyo repo. (추가: 2026-05-15 22:05, WSL 위임)

- [ ] 🪟 📱 단어요 Play Console A/B 테스트 (Custom store listing) (단어 학습 앱 스토어 설명 두 가지 안을 실제 사용자에게 4주 노출해 어느 쪽이 설치 잘 되는지 비교) — A안 = 현재 description (장면별 우선) vs B안 = 보상·게임화 강조 (메모리워드 류 후크). 비가역 액션, 강대종 ack 필요. 4주 conversion rate 비교. (추가: 2026-05-15 22:05, WSL 위임)

- [ ] 🪟 📱 단어요 Apple Search Ads 한국 캠페인 (단어 학습 앱을 앱스토어 검색광고에 5만원 정도 태워보고 효과 측정) — USP 1 키워드 "상황별 영어 단어" / "비즈니스 영어 단어장" ~5만원 budget CPI 테스트. 비가역, 강대종 ack 필요. (추가: 2026-05-15 22:05, WSL 위임)

- [ ] 🪟 📱 단어요 역방향 패키지 검토 (단어 학습 앱을 거꾸로 — 영어권 사용자가 한국어 배우는 버전으로 — 별도 앱으로 낼지 검토) — 한→영 (한국어 단어장, 영어권 출장자 대상). 별 앱/패키지로 분리. 단어요 USP "상황별" 그대로 재활용 가능. (추가: 2026-05-15 22:05, WSL 위임)

- [ ] 🍎 📱 미니가계부(mini_expense) Flutter scaffold (미니 가계부 앱 처음 뼈대 코드 만들기 — 아직 결정만 있고 코드 0) — 2026-05-13 결정만 박힌 상태 (project_mini_expense_revived.md), repo·코드 0. 다음 작업 빠르게 시작 가능하게 scaffold + 패키지 com.daejongkang.mini_expense 초기 세팅. (추가: 2026-05-15 22:05, WSL 위임)

- [ ] 🪟 🧹 WSL 작업 브랜치 `wsl/issue-prevention-action-field-2026-05-14` 마무리 (WSL 컴퓨터가 만든 작업 가지 하나, 코드는 올라갔는데 정식 합치기 안 한 상태 마무리) (claude-skills, fda0e69 "issue: prevention-action 필수 필드 추가" — origin push 됨, PR/머지 미완). (추가: 2026-05-16 01:30, WSL 위임)

- [ ] 🪟 🧹 WSL 작업 브랜치 `wsl/session-clear-keepalive-2026-05-13` 마무리 (WSL 컴퓨터가 만든 또 다른 작업 가지 마무리해 본 코드에 합치기) (claude-automations, 9dc37d3 "hook: session-clear-trigger.sh v2.4 WSL idle keepalive" — origin push 됨, PR/머지 미완). (추가: 2026-05-16 01:30, WSL 위임)

- [ ] 🍎 🧹 CLAUDE.md "현재 기기 빠른 식별" 표에 SSH alias 컬럼 추가 (AI 설정 문서의 기기 표에 원격 접속 이름 칸을 추가해 헷갈림 방지) — 2026-05-16 SSH alias 미스매치 이슈 (`issues/2026-05-16-ssh-alias-mismatch.md`) 예방 forcing function. hostname 컬럼 외에 alias 컬럼 별도로 한눈 구분. (추가: 2026-05-16 01:30, 본진 책임)

- [ ] 🍎🏭💻🖥🪟 📦 vsnap-create.sh 미구현 (홈페이지 박제용 버전 스냅샷 만드는 스크립트가 어느 기기에도 없어 새로 만들어야 함) — daejong-page-sync 스킬의 /vsnap-create 트리거가 호출할 스크립트가 어느 노드에도 없음 (memory project_vsnap_create_sh_unimplemented.md). 작성 옵션 둘 강대종 결정 후 commit + 모든 노드 배포. (추가: 2026-05-16 01:30)

- [ ] 🍎 🔍 automations 의 `scripts/newsletter-auto-publish.sh` 미커밋 surface 처리 (뉴스레터 자동 발행 스크립트가 코드 저장소에 등록 안 된 채 떠다니는 상태 정리) — /goodnight (2026-05-16 01:55 KST) 3 repo audit 에서 untracked 발견. plist + script LIVE 2026-05-15 19:20 KST 의 잔여 자동 commit hold 분. 다음 사이클 강대종 검토 후 commit 또는 별도 PR 으로 굴리기. (추가: 2026-05-16 01:55, session-clear 후속안)

- [ ] 🪟 🛡️ parallel-cycle/SKILL.md L138 의 WSL session-clear 분기에 sentinel 가드 모델 확장 검토 (병렬 작업 종료 단계에서 WSL 쪽 자동 청소가 잘못 도는 것 막을 안전장치를 같은 방식으로 더 박을지 검토) — PR #45 (v1.0 sentinel 가드 5-c/5-d) 후속 권고. 본 사이클은 본진 chatbot 의 자동 /clear 만 가드. WSL session-clear (parallel-cycle 다단계 sync 마지막) 도 같은 sentinel 패턴 박을지 별 PR 분석 + 결정. WSL 본인이 디렉티브 받아 분석부터. (추가: 2026-05-16 13:28 KST, session-clear 후속안, WSL PR #45 surface)

- [x] 🍎 🛠 Tuya 에어콘/선풍기 IR 디바이스 등록 — ✅ 완료 2026-05-17 09:53 KST. (1) Tuya cloud secret rotation 처리 (`dd13…8f1f` → `1273…8412`, mac-mini 터미널에서 tuya-rotate-secret.sh 로 stty -echo 입력 + .env 갱신 + auth 검증, .env 본진 scp 회수). (2) 디바이스 19개 enumerate 성공 — Air Conditioner ebae8a8fbccec3ead0m6al (infrared_ac, online=True), Fan eb71551ca79d77d38d2xtl (infrared_fan, online=True), IR controller Pro eb5456bc8db6fcb0bfhb6o. IR 전용 endpoint `/v2.0/infrareds/...` 는 "No permissions API not subscribed" 거부지만 일반 `/v1.0/iot-03/devices/{id}/commands` 로 PowerOn/PowerOff 통함. (3) tuya-control.py 에 IR_DEVICES dict + control_ir_device() 추가 (claude-skills commits 5239d3c + 5a180a1), tuya_devices.md 에 IR 섹션 신설. mac-mini pull 까지 동기화 OK. 사용 = `python3 ~/claude-skills/scripts/tuya-control.py 에어콘 on|off`. "30분 후 꺼" wrapper 는 강대종 판단으로 정식 폐기 — `(sleep 1800 && python3 ~/claude-skills/scripts/tuya-control.py 에어콘 off) &` 한 줄로 충분 (Mac 본진/맥미니 24/7 가동, detached sleep 안 끊김). 텔레그램 18667→18691 흐름.

## 마이크로 위생작업 (2026-05-17 신설, WSL 위임)

> ROI 0~소, 보안/품질 마이크로 위생, 진짜 비빌 데 없을 때 손대는 일회성 점검·정리. parking-lot 보다 한 단계 deeper. 시급도 항상 low.

### 보안 위생 라인 (우선순위 권장)

- [ ] 🍎🏭🪟🖥💻 🛡️ claude-skills + claude-automations gitleaks/trufflehog secrets scan (코드 저장소 두 곳을 도구로 한 번 훑어 옛날 비밀번호·토큰 잔여 노출이 있는지 점검) — 한 번 돌려서 옛 토큰 잔여 누설 점검. OpenClaw 시절 잔재 / .bak 디렉토리 흔적 hit 가능성 ~50%. 30분 일회성. hit 있으면 다음 액션 surface 멀티플라이어 효과. (추가: 2026-05-17 23:55, WSL 위임)

- [ ] 🍎🏭🪟🖥💻 🛡️ GitHub SSH 키 분기 자동 회전 cron (깃허브 접속용 인증 열쇠를 분기마다 새로 만들어 바꾸는 작업을 자동화) — 신규 ed25519 생성 → GitHub API (fine-grained PAT 1년 만료) 로 키 등록 → 구 키 삭제 흐름 cron 화. 5노드 동시 셋업 약 1시간. 2026-05-17 14:45 강대종 보류. (추가: 2026-05-17 23:55, WSL 위임)

- [ ] 🍎🏭🪟🖥💻 🛡️ 5노드 git commit -S GPG signing 동기화 (코드 변경 기록에 본인 디지털 서명을 박아 위조 방지 + 깃허브 인증 배지 받기, 5대 기기 모두) — commit fraud 방지 + GitHub verified 배지. 5노드 GPG key 동기 1~2시간 한 번이면 영구. (추가: 2026-05-17 23:55, WSL 위임)

- [ ] 🏭 🛡️ insta-post 자동 발행 이미지 EXIF 제거 검증 (인스타그램 자동 업로드 그림에 위치·카메라 정보가 묻어 새어나가는지 점검) — 위치/카메라 메타데이터 누설 가능. 15분 점검. (추가: 2026-05-17 23:55, WSL 위임)

### 비-보안 위생 라인

- [ ] 🍎🏭🪟🖥💻 🧹 /tmp 누적 보고 md 청소 (기기마다 임시 폴더에 쌓인 옛날 보고 파일들 한 번 비우기) — mac-report / std-label / mesh-mirror 류 누적 파일들. 보안 0, 디스크/검색 noise 위생. 5분. (추가: 2026-05-17 23:55, WSL 위임)

- [ ] 🪟 🧹 WSL finished 작업 브랜치 cleanup (WSL 가 끝낸 작업 가지 두 개가 본 코드 합쳐진 뒤에도 안 지워졌는데 청소하기) — `wsl/parallel-cycle-sentinel-guard-2026-05-16`, `wsl/bak-gitignore-cleanup-2026-05-17` main merge 후 미정리. 10분. (추가: 2026-05-17 23:55, WSL 위임)

- [ ] 🏭 🧹 Mac mini night-runner reports/ prune (맥미니 야간 점검이 매일 남기는 보고 파일이 100개 넘게 쌓였는데 90일 지난 건 자동 삭제하게 설정) — 매일 1건씩 쌓여 100+개 추정. 90일 이상 자동 prune cron 추가. 30분. (추가: 2026-05-17 23:55, WSL 위임)

- [ ] 🍎 🧹 Flutter 앱별 README freshness 점검 (앱 출시 후에도 옛 내용 그대로 남아있는 안내문서 있는지 한 번 훑기) — 출시 후 README 가 stale 한지 grep. 약 30분. (추가: 2026-05-17 23:55, WSL 위임)

- [ ] 🍎 🎨 multi-node task dashboard spec (5노드 작업 상태를 웹 페이지로 한눈에 보는 대시보드) — FEDA/AgentGround 영감, 본진 surface (2026-05-18 새벽 paste pending 의 Windows 트레이 브리지 대안). 5노드 (🍎/🪟/🏭/🖥/💻) 각자 현재 진행 작업 / idle / 실패 상태를 웹에 실시간 시각화. choso phase 1 (read-only 5타일) 의 확장 또는 별 프로젝트. brainstorm 부터 시작. 1-2주 호흡. (추가: 2026-05-18 11:32 KST, /session-clear 후속안)

- [ ] 🍎 🎨 /loop dynamic 자동 clear+resume 패턴 (긴 자율 작업이 컨텍스트 꽉 차면 알아서 세션 클리어하고 checkpoint 부터 다시 시작하는 기능) — 2026-05-18 새벽 paste pending. 컨텍스트 90% 차면 (a) 현재 상태 checkpoint 저장 (b) /clear 발사 (c) checkpoint 읽고 작업 이어가기. 기술 가능. trade-off = 위험 작업 (rm -rf / force push / DB 마이그) 중 clear = 데이터 손실 위험. checkpoint 형식 일반화 어려움. 별 spec → plan 사이클로 신중. 본진 권고 = 현재는 컨텍스트 차면 종료 + 형님께 알리는 게 안전. (추가: 2026-05-18 11:32 KST, /session-clear 후속안)

- [ ] 🏭 🛠 맥미니 dev/스토어 환경 셋업 묶음 (맥미니에서 Flutter 빌드·서명·업로드가 매끄럽게 굴러가도록 도구 5개 한 번에 설치) — (1) fvm 설치 (`brew install leoafarias/fvm/fvm`, 본진 directive 의 `fvm flutter ...` 호환), (2) ANDROID_HOME + adb PATH `~/.zshrc` export (`/opt/homebrew/share/android-commandlinetools`, 현재 local.properties 만), (3) CocoaPods UTF-8 locale (`export LANG=en_US.UTF-8` `~/.zshrc`), (4) `android/app/memoyo-upload-keystore.jks` + Play Service Account JSON 안전 채널 동기화 (signed aab + Publisher API 업로드용, 현재 .jks 부재 → /submit-app 막힘), (5) (선택) Ruby 3.x via rbenv (시스템 ruby 2.6.10 + bundler 1.17.2 구버전, fastlane / 최신 CocoaPods 호환 잠재 이슈). 강대종 "어느 거부터 갈까요" 응답 대기 (텔레그램 4636). (추가: 2026-05-18 07:10 KST, 맥미니 local 흡수)

- [x] 🌐 💡 초소 phase 3 brainstorm — write path / 노드 자동 reporting (외부 노출까지 끝난 초소 데크에 5노드 자동 작업 보고 채널 + (조건부) 자연어 입력 박을지 brainstorm) — phase 1 read-only 정책 + phase 2 외부 노출 매듭 후 후속. 후보 방향: (a) 5노드 각자 현재 작업/idle 상태 자동 reporting (`fleet-state` 자료원 또는 새 ping endpoint) → 초소 데크에 노드별 활성 작업 한 줄 + 마지막 ping 시각 표시. (b) write path — 외부에서 자연어 todo 추가 박을지 (현재 정책은 변경=텔레그램 본진 자연어 위임). 보안 측면 CF Access OTP 통과한 형님 본인만 접근 가능하므로 write 도 가능은 하나 read-only 정책 의도 = "외부 채널이 SoT 안 되게". (c) phase 1 에서 미루는 todo 의 자연어 번역 graceful degrade 가 옛 todo 어디까지 잡는지 sample 점검. brainstorm 부터 시작, 큰 호흡 (1~2시간), plan/spec 사이클 권장. 메모리 [[reference_fedaground_dashboard]] 와 비교 시점. (추가: 2026-05-18 17:45 KST, choso phase 2 매듭 후속) → ✅ 2026-05-18 21:55 KST 본진 trio-vote 3-0 [C] 비판론자 안 만장일치 → ssamssae/choso/PHASE3.md (commit d542eba) spec 박힘. 채택 = Claude Code hooks 9개 자동 등록 + PreToolUse mtime 마커파일 touch + Mac mini cron 60s stale (>3min) 감지 → 노드 death 판정. clawd-on-desk 패턴 본진 인프라로 이식. 후속 todos.md "초소 phase 3 구현 진입" 박힘.
