# Parking Lot — 사이드 프로젝트 + 언젠가 아이디어

해야 할 일은 아니지만 손이 가면 도전하고 싶은 모든 것들 — **사이드 프로젝트 후보** + **언젠가/여유 되면/이런 게 있으면 좋겠다** 류 아이디어를 한 통에 모아둔다. todos.md(진행중·완료·드롭) 와 분리해 우선순위 노이즈 없이 따로 보관. 실제 시작하면 todos.md `## 진행중` 으로 promote, 아니면 그대로 두거나 드롭으로 이동.

(2026-05-02: 기존 someday.md 폐지 후 「언젠가」 컨셉을 parking-lot 에 통합. SoT 단일화 = todos.md + parking-lot.md 두 통.)

버전 이력은 git log 로 확인.

## 모아둠

- [ ] 🤝 💡 한줄일기 + AI 응원 앱 (Flutter, 메모요 코드 80% 재활용. 하루 한 줄 일기 쓰면 AI가 공감+응원 한 줄 답글. 로컬 저장, 계정 0, 광고 0. 스택: Flutter + Cloudflare Workers 프록시 + GPT-4o mini. 추정 빌드 5~7일 집중 / 2~3주 저녁작업. 쉬는날·할일 다 끝난 뒤 도전 예정)  (추가: 2026-04-17)
- [ ] 🤝 💡 바이브코딩 뉴스레터 (Claude Code 로 1인 앱 만드는 여정. 심사레이더 개발기 = 시즌 1. 주간/격주. 플랫폼 미정 — Substack/Beehiiv 후보. 1차 목표 구독자 100명)  (추가: 2026-04-19)
- [ ] 🤝 💡 메모요 (운영중 Flutter 메모 앱 — 포트폴리오 엔트리. 세부 작업은 todos.md 진행중/완료 섹션에서 개별 관리)  (추가: 2026-04-19)
- [ ] 🤝 💡 단어장 앱 (구체안 브레인스토밍 예정 — 핵심 기능/타겟 사용자/차별점 미정, 한줄일기·메모요 코드 자산 재활용 가능성 타진 필요)  (추가: 2026-04-22)
- [ ] 🤝 💡 주식 모니터링 앱 (Flutter) — 한국 종목 + KRX 공공데이터(일봉) 무료/합법 라인으로 v0 시작 후보. 본인 관심종목 가격 알람("종목 X -3% 도달") + 차트만, 추천/자동매매 X (투자자문업 등록 회피). 실시간 필요 시 키움/한투 OpenAPI 본인계좌 모드로 확장. 피해야 할 소스 = Yahoo 스크래핑·네이버/다음 금융 스크래핑 (ToS 위반·스토어 리젝 사례). 회사 로고는 정보 표시용만.  (추가: 2026-05-01, 2026-05-02 someday→parking-lot)
- [ ] 🤝 💡 Plan C 자동화 노하우 콘텐츠화 (Substack) — night-builder v2 / asc-deliver 자동 심사 제출 인사이트 1편. 1인 Flutter 개발자 타깃 콘텐츠. 트리거: Plan A (한줄일기 ASO) 1주차 결과 보고 결정 시점.  (추가: 2026-05-01, 2026-05-02 someday→parking-lot)
- [ ] 🤝 🛠 /stack.html SVG 토폴로지 다이어그램 (옵션 2번) — 카드 그리드 LIVE 후 반응 보고 추가 검토. Mac 본진 ↔ Mac mini / WSL / 3060 두 대(0vab3qc·4mnj1c0) 화살표 + mac-report.sh / wsl-directive.sh 운반체 라벨. 모바일 narrow 화면 대응 비용 1회 큼. 본진 SVG 직접 작성 또는 mermaid → SVG 변환 후보.  (추가: 2026-05-02 WSL session-close 라우팅)
<!-- 2026-05-02 21:08 — L18 (이슈→노하우 5건 추가 이전) / L19 (WSL Flutter test SKILL 화) 둘 다 완료, todos ## 진행중 [x] 로 이전 -->

- [ ] 🍎 🛠 옵시디언 일주일 매핑 self-check (2026-05-09 즈음) — 2026-05-02 본진 Mac 옵시디언 v1.12.7 설치 + `~/daejong-page/` vault 전환 완료 (.gitignore 에 `.obsidian/` 박음, .nojekyll 이미 존재로 Jekyll exclude 불필요). 일주일 본체만 사용 후 워크플로우 매핑 self-check. 매핑 OK 면 [[git repo + 자동 commit]] / [[iPhone Obsidian 앱 + .obsidian/ workspace sync]] / LLM 결합 평가 진입, 매핑 X 면 vault 닫고 폐기 (daejong-page 자체는 그대로 SoT 라 손해 0). LLM 결합 directive (2070S ollama + plugin) 는 이미 폐기 결정 — Claude Code Max 토큰이 .md 자동작성 = 더 강력.  (추가: 2026-05-02 session-close)
- [ ] 🍎 📱 iPhone Obsidian 앱 + `.obsidian/` workspace sync (옵시디언 매핑 OK 후) — 멀티기기 sync 위해 `.gitignore` 의 `.obsidian/` 룰 풀고 workspace.json + plugins/ commit 대상화. 단 workspace.json 자주 변경 = git dirty 노이즈 → `.obsidian/workspace.json` + `.obsidian/cache/` 만 ignore 유지, 나머지 sync 검토. 트리거: 옵시디언 일주일 매핑 self-check 통과 후.  (추가: 2026-05-02 session-close)
<!-- 2026-05-02 21:08 — L22 (lotto-calc dhlottery 자동 감지 cron) 완료, todos ## 진행중 [x] 로 이전 -->
- [ ] 🍎 🧹 flutter cache 739파일 quarantine sweep — 2026-05-02 pomodoro gen_snapshot dyld_start hang 진단 중 발견. `~/opt/homebrew/share/flutter/bin/cache/artifacts/` 안 739개 파일에 `com.apple.quarantine` xattr 박힘. 직접 원인은 macOS Gatekeeper 첫실행 dialog (mac mini headless 라 dyld 가 user 클릭 영구 wait, 강대종이 직접 OK 3번 클릭으로 unblock) 였지만 향후 Flutter SDK 업데이트 시 같은 dialog 재현 가능. 영구 fix = `xattr -cr ~/opt/homebrew/share/flutter/bin/cache/` 1줄 sweep + 사전 spctl bypass 룰 검토. 트리거 = 다음 Flutter SDK 업데이트 또는 Mac mini night-build 회기 1회 더 발생 시.  (추가: 2026-05-02 session-close abc 박아 결정)
