# Parking Lot — 사이드 프로젝트 + 언젠가 아이디어

해야 할 일은 아니지만 손이 가면 도전하고 싶은 모든 것들 — **사이드 프로젝트 후보** + **언젠가/여유 되면/이런 게 있으면 좋겠다** 류 아이디어를 한 통에 모아둔다. todos.md(진행중·완료·드롭) 와 분리해 우선순위 노이즈 없이 따로 보관. 실제 시작하면 todos.md `## 진행중` 으로 promote, 아니면 그대로 두거나 드롭으로 이동.

(2026-05-02: 기존 someday.md 폐지 후 「언젠가」 컨셉을 parking-lot 에 통합. SoT 단일화 = todos.md + parking-lot.md 두 통.)

(2026-05-03: 분기 사고 정리 — ~/todo/parking-lot.md 와 ~/daejong-page/parking-lot.md 양쪽 따로 운영되던 상태를 union 본문으로 통합. SoT = ~/todo/parking-lot.md, mirror = ~/daejong-page/parking-lot.md.)

버전 이력은 git log 로 확인.

## 모아둠

- [x] 🤝 💡 한줄일기 + AI 응원 앱 (Flutter, 메모요 코드 80% 재활용. 하루 한 줄 일기 쓰면 AI가 공감+응원 한 줄 답글. 로컬 저장, 계정 0, 광고 0. 스택: Flutter + Cloudflare Workers 프록시 + GPT-4o mini. 2026-04-30 LIVE — 포트폴리오 엔트리)  (추가: 2026-04-17, 완료: 2026-05-03 — portfolio.html iOS LIVE·Android alpha LIVE·₩1,900 KOR 갱신)
- [x] 🤝 💡 바이브코딩 뉴스레터 (Claude Code 로 1인 앱 만드는 여정. 심사레이더 개발기 = 시즌 1. Substack 운영중 — 포트폴리오 엔트리)  (추가: 2026-04-19, 완료: 2026-05-03 — portfolio.html Ep.6 나누기 반영)
- [x] 🤝 💡 메모요 (운영중 Flutter 메모 앱 — 포트폴리오 엔트리. 세부 작업은 todos.md 진행중/완료 섹션에서 개별 관리)  (추가: 2026-04-19, 완료: 2026-05-03 — portfolio.html 엔트리 확인 (iOS·Android LIVE 기재 유지))
- [x] 🤝 💡 주식 모니터링 앱 (Flutter) — scaffold 완료 (2026-05-03, ~/apps/stock_monitor, com.daejongkang.stock_monitor, 관심종목 watchlist UI 뼈대. 다음=KRX API 연동)
- [x] 🤝 💡 Plan C 자동화 노하우 콘텐츠화 (Substack) — night-builder v2 / asc-deliver 자동 심사 제출 인사이트 1편. 1인 Flutter 개발자 타깃 콘텐츠. (완료: 2026-05-03 ep6-draft-2026-05-03.md 초안 생성, WSL PR 예정)
- [x] 🤝 🛠 /stack.html SVG 토폴로지 다이어그램 — WSL 작업 중 (2026-05-03 디렉티브 전송, PR 예정)
<!-- 2026-05-02 21:08 — L18 (이슈→노하우 5건 추가 이전) / L19 (WSL Flutter test SKILL 화) 둘 다 완료, todos ## 진행중 [x] 로 이전 -->
- [x] 🤝 💡 이슈 → 노하우 추가 이전 — WSL 작업 중 (2026-05-03 디렉티브 전송, PR 예정)
<!-- 2026-05-02 21:08 — L22 (lotto-calc dhlottery 자동 감지 cron) 완료, todos ## 진행중 [x] 로 이전 -->
- [x] 🍎 🧹 Flutter cache quarantine sweep — 완료 (2026-05-03, mac mini xattr -cr 실행)
<!-- 2026-05-03: lotto-calc stats 2건 제거 — 5/2 slim(lotto-calc) 커밋으로 통계 트랙 폐기됨. StatsScreen/lotto_stats.dart 모두 삭제된 상태라 stale. -->

- [x] 🍎 🛡 Mac mini SSH 보안 강화 — 완료 (2026-05-03, PasswordAuthentication no 적용, authorized_keys 5개 확인)

- [ ] 🍎 🔀 parallel-cycle v0.2 — 6개 고정 → N개 유연 지원 (2026-05-04). 현재 스킬이 정확히 6개 요구. 3+3이 아닌 2+2, 4+2 등 자유롭게 나눌 수 있도록 개선. 트리거: 다음 사이클 불편함 느낄 때.

- [ ] 🍎 🐛 lottocalc irun 흰화면 버그 (2026-05-04) — iOS 26.3.1 실기기에서 debug/release 모두 흰화면. `flutter run --release` 는 빌드를 `Release-iphoneos/`에 뱉어 코드서명 미적용, `flutter build ios --release` + devicectl 설치해도 흰화면. iproxy Dart VM attach 실패도 동반. 원인 미확정(iOS 26 + Flutter 3.41.9 렌더링 호환 의심). 재시도 시 flutter doctor 상태 + iOS 26 release note 먼저 확인.

- [ ] 🍎 🎨 Google Play 개발자 페이지 에셋 제작 (2026-05-04) — 개발자 아이콘 512×512px (JPEG/24비트 PNG, 투명 없음) + 헤더 이미지 4096×2304px 제작 후 Play Console 개발자 페이지에 업로드.

- [ ] 🍎 ✍️ Google Play 개발자 페이지 문구 작성 (2026-05-04) — 개발자 웹사이트 URL + 광고 문구 140자(영문 기준) 작성 후 Play Console에 입력.
