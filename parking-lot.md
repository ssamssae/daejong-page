# Parking Lot — 사이드 프로젝트 + 언젠가 아이디어

해야 할 일은 아니지만 손이 가면 도전하고 싶은 모든 것들 — **사이드 프로젝트 후보** + **언젠가/여유 되면/이런 게 있으면 좋겠다** 류 아이디어를 한 통에 모아둔다. todos.md(진행중·완료·드롭) 와 분리해 우선순위 노이즈 없이 따로 보관. 실제 시작하면 todos.md `## 진행중` 으로 promote, 아니면 그대로 두거나 드롭으로 이동.

(2026-05-02: 기존 someday.md 폐지 후 「언젠가」 컨셉을 parking-lot 에 통합. SoT 단일화 = todos.md + parking-lot.md 두 통.)

(2026-05-03: 분기 사고 정리 — ~/todo/parking-lot.md 와 ~/daejong-page/parking-lot.md 양쪽 따로 운영되던 상태를 union 본문으로 통합. SoT = ~/todo/parking-lot.md, mirror = ~/daejong-page/parking-lot.md.)

버전 이력은 git log 로 확인.

## 모아둠

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

- [ ] 🍎 ⏳ 행운번호 생성기 심사 결과 대기 (2026-05-05 제출) — 2.3.6 거절 대응: 슬롯머신 애니메이션→페이드 교체, 앱이름 변경, 키워드 정리, 면책 문구 추가. 재거절 시 Resolution Center Appeal 준비 (경쟁앱 근거: SMART LOTTO id1544943147, Lotto Lottery Number Generator id1209851150).

- [ ] 🍎 💡 코레일 앱 mitmproxy API 스니핑 — iOS 시뮬레이터 + mitmproxy 로 코레일 앱 네이티브 API 엔드포인트 추출. PerimeterX 미적용 예상. 추출 후 Python으로 직접 호출하면 봇탐지 우회 가능. (추가: 2026-05-05, 막다른길: korail-playwright-bot-detection)

- [ ] 🍎 💡 코레일 앱 Appium 자동화 — 웹 자동화(Playwright) 대신 iOS 시뮬레이터 앱 UI 직접 조작. CDP 기반 아닌 Appium XCUITest 드라이버 사용 → PerimeterX 웹 탐지 레이어 완전 우회. (추가: 2026-05-05, 막다른길: korail-playwright-bot-detection)

- [ ] 🤝 💡 막다른길 상세 렌더러 페이지 — dead-ends 카드 클릭 시 .md 내용을 렌더링해 보여주는 detail.html 신설. issue.html 방식 참고. 현재는 카드 클릭 비활성화 상태. (추가: 2026-05-05)
