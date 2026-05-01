# Someday/Maybe

이 파일은 /someday 스킬과 대화를 통해 자동 관리됩니다. 수동으로 편집해도 됩니다.
**해야 할 일은 아니지만 언젠가 해도 좋을 것들** — todos.md 와 분리해 우선순위 노이즈 안 만들고 따로 모아둡니다. 진짜 할 일이 되면 todos.md 로 승격(promote), 아니면 그대로 두거나 드롭.

버전 이력은 git log 로 확인합니다.

## 모아둠

- [ ] 🪟 🛠 WSL Termius "Mac" 프로파일 startup command 점검 — 2026-05-02 00:13 KST WSL→Mac SSH 직후 prompt 안 보이는 사고. 본진 진단 결과 SSH·zsh·tmux 다 정상이었고 `claude-36745` group 세션이 자동 생성됨 (Termius 프로파일 시작 명령으로 추정). 재발 시 fix: Termius "Mac" 프로파일 startup 빈 칸으로 두거나 `tmux attach -t main || tmux new -s main` 로 명시. 트리거: 같은 사고 재발 또는 일과 중 점검. (추가: 2026-05-02)

- [ ] 🍎 🎨 클라우드 봇 프사 v2 — 1차본 (원형 주황 + 흰 SF Pro Bold C, 640×640) 적용 완료(2026-05-01 BotFather), 강대종님 "어설프지만" 평가. v2 후보: (a) 색조 더 깊은 주황(예: #E67700) (b) 글자 더 굵은 weight (Black/Heavy) (c) 다른 폰트(Inter/Pretendard Black) (d) 미세 그라데이션 또는 그림자. 시간 날 때 1~2안 더 뽑아서 비교. (추가: 2026-05-02)

- [ ] 🤝 📈 주식 모니터링 앱 (Flutter) — 한국 종목 + KRX 공공데이터(일봉) 무료/합법 라인으로 v0 시작 후보. 본인 관심종목 가격 알람("종목 X -3% 도달") + 차트만, 추천/자동매매 X (투자자문업 등록 회피). 실시간 필요 시 키움/한투 OpenAPI 본인계좌 모드로 확장. 피해야 할 소스 = Yahoo 스크래핑·네이버/다음 금융 스크래핑 (ToS 위반·스토어 리젝 사례). 회사 로고는 정보 표시용만. (추가: 2026-05-01)

- [ ] 🍎 📧 mail-watcher false positive 튜닝 — 4h 주기 운영하다 important=true 잘못 잡힌 케이스 누적되면 prompt 더 엄격화 또는 1차 keyword 필터에 false 통과 패턴 추가. 운영 1~2주 후 데이터 쌓이면. 위치 ~/secrets/mail-watcher/mail_watcher.py 의 ollama_classify 함수. (추가: 2026-04-28)


- [ ] 🤝 🤖 /night-runner v2 ramp-up — v1 안전모드(read-only 점검 5개, headless·commit·push·PR 0) 가 03:00 KST launchd 로 가동 후 신뢰 쌓이면 단계 올리기. 다음 단계 후보: BACKLOG 자동 picking, 가벼운 자동 PR(예: TODO·FIXME 라인 한두 개 정리), 7일 silence repo 의 README 자동 갱신 등. 자동 commit/push 가 들어가는 순간 가드 한 단계 더 필요(diff 미리보기 텔레그램 컨펌?). 진행 시 합의 필수. (추가: 2026-04-29)

- [ ] 🍎 🤖 iOS Mac mini 빌드 자동화 — 2026-04-29 수동 4단계 복구(cert trust chain → Xcode 자동 provisioning → codesign partition list → DerivedData clean) 후 hanjul.ipa PASS 만 검증한 상태. 야간 자동 ipa 빌드는 별개 사이클. com.claude.night-build-ios.plist 류 launchd 잡 + 결과 알림. iOS 는 Apple cert 만료/갱신 같은 추가 가드가 Android 보다 까다로워 v2.0a Android 풀그린 안정화 후 진입. (추가: 2026-04-29)

- [ ] 🍎 🛠 Mac mini AGP 9+ newDsl 마이그레이션 — night-build v2.0a (2026-04-29) NOT IN SCOPE 였음. 현재 AGP 8 기반 4앱 빌드 풀그린이라 급하지 않음. AGP 9 가 강제되는 시점(Flutter SDK / Android Studio 메이저 업데이트)에 진행. 4앱 동시 마이그레이션 일관성 필요. (추가: 2026-04-29)

- [ ] 🤝 🛡 /submit-app 가드 3종 본체 통합 + 실호출 wiring — **dry-run 골격 PR #5 머지 완료 (2026-05-02 8870e1a).** 잔여: (1) /submit-app 본체에서 territory verify → resubmit → RC 답글 호출 흐름 통합, (2) 174 territory id 실제 리스트 ASC 캐시, (3) ASC credentials 연결 + --apply 모드 검증. 모두 실 ASC PATCH/POST 동반 = 컨펌 필수 사이클로 분리. (someday W6+W7+W8 후속, 추가: 2026-05-02)

- [ ] 🤝 🔧 자동발행 파이프라인에 이미지 업로드 단계 추가 — Ep.3 4장 이미지 누락 사고(2026-04-30 발견·수동 패치)의 근본 fix. Substack 자동발행이 본문 paste 만 하고 이미지 업로드는 안 하는 회귀. Playwright MCP 로 본문 paste 후 IMAGE 1~N placeholder 자리에 PNG 자동 업로드까지 묶기. /submit-app 의 4단계 우회와 같은 결의 자동화 강화. lesson 자료: 2026-04-30 Ep.3 수동 패치 흐름(NSPasteboard + 4 file_upload). (추가: 2026-04-30)

- [ ] 🤝 ✍️ Ep.1·Ep.2·Ep.5 도 Ep.3 와 같은 이미지 회귀 검증/패치 — Ep.3 가 누락이었다면 다른 회차도 동일 가능성. curl probe 로 본문 img 카운트 확인 후 누락분 같은 PIL+Pretendard 라인으로 생성·업로드 + 기존 발행본 update. 위 자동발행 파이프라인 fix 와 묶어서 한 사이클로 처리하면 자연스러움. (추가: 2026-04-30)

- [ ] 🍎 🛠 단어요 빌드/배포 = Mac mini SoT 통합 — 본진 push 권한 룰 wordyo 미등록 상태에서 PR 흐름 유지(2026-04-30 23:29 KST 결정). Mac mini SoT 자동 배포 시스템(project_auto_deploy_setup_in_progress.md, 4앱 REGISTERED) 에 wordyo 추가 + AAB 자동 빌드 등록 작업 미실행. 단어요 v1 첫 Android 출시 직전에 박으면 됨. (추가: 2026-04-30)

- [ ] 🤝 📸 한줄일기 스크린샷 A/B 1차 시안 — 5/2 14:00 KST 원격 라우틴(`trig_01MBgY9ED6UFEHfJDujixn14`) 결과 + ASC 라이브 metadata baseline (`store/aso-checkpoints/2026-05-01-live-baseline.md`) 받은 후 design-lab 에서 첫 3컷 카피·레이아웃 작업. 한줄일기 ASO 시각 채널 보강. 트리거: 5/2 라우틴 결과 검토 시. (추가: 2026-05-01)

- [ ] 🤝 ✍️ 한줄일기 Promotional Text 170자 안 작성 — 심사 없이 즉시 반영 가능, 가장 빠른 ASO 수정 영역. 라이브 ~100자 → 170 budget 70자 미사용. "광고·로그인 없는 ₩1,900 paid AI 일기" 핵심 차별화 메시지 surface. 트리거: 5/2 라우틴 결과와 함께 검토. (추가: 2026-05-01)

- [ ] 🤝 ✍️ Plan C 자동화 노하우 콘텐츠화 (Substack) — night-builder v2 / asc-deliver 자동 심사 제출 인사이트 1편. 1인 Flutter 개발자 타깃 콘텐츠. 트리거: Plan A (한줄일기 ASO) 1주차 결과 보고 결정 시점. (추가: 2026-05-01)

- [ ] 🤝 🖼 Substack 회귀 의심 3편 이미지 패치 사이클 — 21:55 KST WSL 점검 결과 /p/3-ai (3시간만에 로컬 AI), /p/32b (거절을 큐에서 다시 돌리는 법), /p/f33 (이 뉴스레터가 여기 도착하기까지) 본문 이미지 0~1 (회귀 의심). curl 정적 grep 한계라 Playwright 로 재검증 필요. Ep 번호 매핑 후 누락분 PIL+Pretendard 라인으로 생성·업로드 + 발행본 update. (someday #16 후속, 추가: 2026-05-01 session-close)

- [ ] 🍎 🛰️ 새 프로젝트 발굴 (WSL 라우팅 사안) — 강대종님 2026-05-01 20:59 KST "새로운 프로젝트 발굴" + 21:24 KST "진행" 발화. WSL 가 21:24 KST mac-report.sh 로 본진 라우팅. 본진(지휘관)이 활성앱(한줄일기/약먹자/더치페이/포모도로/단어요) + 드롭이력(가계부/모닝브리핑/이브닝랩/심사레이더/라이브액티비티) + 라이프스타일 매핑 grep 후 후보 1~3개 surface → 강대종 결정 → wsl-directive.sh 라우팅. 다음 본진 새 세션에서 처리. (추가: 2026-05-01)

<!-- 2026-05-01 청소: 승격됨/드롭 archive 섹션 폐기. promote 시 → 모아둠에서 제거 + todos.md 진행중 추가 (history 는 git log). drop 시 → 모아둠에서 제거 + todos.md ## 보류/취소 추가 (cancelled.html 에서 보임). 자세한 정책은 SKILL.md 참고. -->

