# Parking Lot — 사이드 프로젝트 + 언젠가 아이디어

해야 할 일은 아니지만 손이 가면 도전하고 싶은 모든 것들 — **사이드 프로젝트 후보** + **언젠가/여유 되면/이런 게 있으면 좋겠다** 류 아이디어를 한 통에 모아둔다. todos.md(진행중·완료·드롭) 와 분리해 우선순위 노이즈 없이 따로 보관. 실제 시작하면 todos.md `## 진행중` 으로 promote, 아니면 그대로 두거나 드롭으로 이동.

(2026-05-02: 기존 someday.md 폐지 후 「언젠가」 컨셉을 parking-lot 에 통합. SoT 단일화 = todos.md + parking-lot.md 두 통.)

(2026-05-03: 분기 사고 정리 — ~/todo/parking-lot.md 와 ~/daejong-page/parking-lot.md 양쪽 따로 운영되던 상태를 union 본문으로 통합. SoT = ~/todo/parking-lot.md, mirror = ~/daejong-page/parking-lot.md.)

버전 이력은 git log 로 확인.

## 모아둠

- [ ] 🤝 💡 한줄일기 + AI 응원 앱 (Flutter, 메모요 코드 80% 재활용. 하루 한 줄 일기 쓰면 AI가 공감+응원 한 줄 답글. 로컬 저장, 계정 0, 광고 0. 스택: Flutter + Cloudflare Workers 프록시 + GPT-4o mini. 2026-04-30 LIVE — 포트폴리오 엔트리)  (추가: 2026-04-17)
- [ ] 🤝 💡 바이브코딩 뉴스레터 (Claude Code 로 1인 앱 만드는 여정. 심사레이더 개발기 = 시즌 1. Substack 운영중 — 포트폴리오 엔트리)  (추가: 2026-04-19)
- [ ] 🤝 💡 메모요 (운영중 Flutter 메모 앱 — 포트폴리오 엔트리. 세부 작업은 todos.md 진행중/완료 섹션에서 개별 관리)  (추가: 2026-04-19)
- [ ] 🤝 💡 주식 모니터링 앱 (Flutter) — 한국 종목 + KRX 공공데이터(일봉) 무료/합법 라인으로 v0 시작 후보. 본인 관심종목 가격 알람("종목 X -3% 도달") + 차트만, 추천/자동매매 X (투자자문업 등록 회피). 실시간 필요 시 키움/한투 OpenAPI 본인계좌 모드로 확장. 피해야 할 소스 = Yahoo 스크래핑·네이버/다음 금융 스크래핑 (ToS 위반·스토어 리젝 사례). 회사 로고는 정보 표시용만.  (추가: 2026-05-01, 2026-05-02 someday→parking-lot)
- [ ] 🤝 💡 Plan C 자동화 노하우 콘텐츠화 (Substack) — night-builder v2 / asc-deliver 자동 심사 제출 인사이트 1편. 1인 Flutter 개발자 타깃 콘텐츠. 트리거: Plan A (한줄일기 ASO) 1주차 결과 보고 결정 시점.  (추가: 2026-05-01, 2026-05-02 someday→parking-lot)
- [ ] 🤝 🛠 /stack.html SVG 토폴로지 다이어그램 (옵션 2번) — 카드 그리드 LIVE 후 반응 보고 추가 검토. Mac 본진 ↔ Mac mini / WSL / 3060 두 대(0vab3qc·4mnj1c0) 화살표 + mac-report.sh / wsl-directive.sh 운반체 라벨. 모바일 narrow 화면 대응 비용 1회 큼. 본진 SVG 직접 작성 또는 mermaid → SVG 변환 후보.  (추가: 2026-05-02 WSL session-close 라우팅)
<!-- 2026-05-02 21:08 — L18 (이슈→노하우 5건 추가 이전) / L19 (WSL Flutter test SKILL 화) 둘 다 완료, todos ## 진행중 [x] 로 이전 -->
- [ ] 🤝 💡 이슈 → 노하우 측면 강한 거 추가 이전 — 첫 4건 (5/2 aab/ipa/flutter/rosetta) 이전 후 후속. 후보: 4/17 시뮬레이터 SharedPrefs cfprefsd 캐시, 4/17 시뮬레이터 좌표 drift, 4/26 mac-ssh-stale-socket, 4/15 telegram-typing-daemon-orphan, 4/24 playwright-mcp-misclick 등. 사건 측면 약하고 재사용 패턴 강한 것만 추려 노하우로 일반화 + 이전. 트리거 = goodnight 또는 별도 사이클, 시간 날 때.  (추가: 2026-05-02 session-close)
<!-- 2026-05-02 21:08 — L22 (lotto-calc dhlottery 자동 감지 cron) 완료, todos ## 진행중 [x] 로 이전 -->
- [ ] 🍎 🧹 flutter cache 739파일 quarantine sweep — 2026-05-02 pomodoro gen_snapshot dyld_start hang 진단 중 발견. `~/opt/homebrew/share/flutter/bin/cache/artifacts/` 안 739개 파일에 `com.apple.quarantine` xattr 박힘. 직접 원인은 macOS Gatekeeper 첫실행 dialog (mac mini headless 라 dyld 가 user 클릭 영구 wait, 강대종이 직접 OK 3번 클릭으로 unblock) 였지만 향후 Flutter SDK 업데이트 시 같은 dialog 재현 가능. 영구 fix = `xattr -cr ~/opt/homebrew/share/flutter/bin/cache/` 1줄 sweep + 사전 spctl bypass 룰 검토. 트리거 = 다음 Flutter SDK 업데이트 또는 Mac mini night-build 회기 1회 더 발생 시.  (추가: 2026-05-02 session-close abc 박아 결정)
<!-- 2026-05-03: lotto-calc stats 2건 제거 — 5/2 slim(lotto-calc) 커밋으로 통계 트랙 폐기됨. StatsScreen/lotto_stats.dart 모두 삭제된 상태라 stale. -->

- [ ] 🍎 🛡 Mac mini SSH 보안 강화 — PasswordAuthentication no 확인 + authorized_keys 에 본진/WSL 공개키만 유지. OpenClaw 샌드박스 호스트 전환 후 SSH 설정이 이전 그대로 남아있음. 재발방지: 외부 키 진입 차단. 트리거 = Mac mini 접속 시 여유 될 때.  (추가: 2026-05-03 session-close)
