# Issues Index

_자동 생성됨. 이 파일은 수동 편집 금지 — `python3 ~/.claude/skills/issue/tools/regen_index.py` 로만 갱신._
_마지막 생성: 2026-05-27 00:39 KST_

| 날짜 | slug | 제목 | 심각도 | 재발 가능성 | 재발 이력 | 예방 deferred |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-05-27 | [codex-directive-enter-fix-v2-fails-on-linux-tmux](2026-05-27-codex-directive-enter-fix-v2-fails-on-linux-tmux.md) | codex-directive v2 Enter 두 번 fix 가 Linux tmux 3.4 + 1KB+ 본문에서 submit 실패 | medium (자동화 단방향 silent fail — 형님이 "엔터 두번 누른거 맞냐" 의심으로 surface) | high (codex-directive 1KB+ 본문 발사 자체가 트리거 — mesh-vote / brainstorm / 긴 directive 전체 영향) | — | — |
| 2026-05-26 | [hook-archive-refs-gap](2026-05-26-hook-archive-refs-gap.md) | hook archive 표준화 후 5노드 settings.json refs cleanup 누락 (handoff-check.sh 잔재) | low (시각 노이즈, 동작 영향 0) | medium (다른 hook archive 사이클에 같은 함정 가능) | — | — |
| 2026-05-26 | [five-node-cascade-failure](2026-05-26-five-node-cascade-failure.md) | 2026-05-26 — 5 노드 cascade failure (어휘 분류기 + stale + singleton) | ? | ? | — | — |
| 2026-05-26 | [choso-live-task-ttl](2026-05-26-choso-live-task-ttl.md) | 초소 LIVE 섹션 stale node_task TTL 부재 + hangeul_label bare 단어 junk 노출 | low (시각 표시 버그, 데이터/외부영향 0) | low (코드 forcing function + 테스트 박힘) | — | — |
| 2026-05-25 | [typing-daemon-paused-on-idle-mismatch](2026-05-25-typing-daemon-paused-on-idle-mismatch.md) | 🍎 본진 typing daemon — pause-flag fix 후 idle 시 silent vs 형님 기대 mismatch | ? | ? | — | — |
| 2026-05-25 | [toml-config-root-vs-subkey-trap](2026-05-25-toml-config-root-vs-subkey-trap.md) | 사고 요약 | ? | ? | — | — |
| 2026-05-25 | [notebook-sdxl-oom-cascade-x2](2026-05-25-notebook-sdxl-oom-cascade-x2.md) | 💻 노트북 SDXL OOM cascade × 2회 (claude chatbot 동반사살) | ? | ? | — | — |
| 2026-05-25 | [master-silence-on-next-cycle-handoff-causes-suspicion](2026-05-25-master-silence-on-next-cycle-handoff-causes-suspicion.md) | 본진 next-cycle 박힘 후 텔레그램 침묵 28분 → 형님 의심 증폭 사고 | ? | ? | — | — |
| 2026-05-25 | [master-ack-surface-rule-violation-x2](2026-05-25-master-ack-surface-rule-violation-x2.md) | 🍎 본진 ack 요청 옵션 surface 룰 위반 × 2회 (같은 사이클) | ? | ? | — | — |
| 2026-05-25 | [mac-report-nomatch-skips-mirror](2026-05-25-mac-report-nomatch-skips-mirror.md) | mac-report.sh ssh chain 의 zsh NOMATCH 가 mirror chain 통째로 skip | high | low (1줄 fix + 4 노드 동시 audit verify PASS) | — | — |
| 2026-05-25 | [codex-mirror-helper-evolution-v1-v4](2026-05-25-codex-mirror-helper-evolution-v1-v4.md) | 사고 요약 | ? | ? | — | — |
| 2026-05-25 | [claude-cyber-verification-block](2026-05-25-claude-cyber-verification-block.md) | 본진 audit directive 어휘 cyber 분류 → 노트북 Claude Code 세션 prompt 차단 | medium (단일 prompt 차단, 세션 자체 살아있음) | medium (시스템 orchestration 작업마다 cyber 어휘 노출 위험) | — | — |
| 2026-05-24 | [wsl-ack-missing-after-cross-routing](2026-05-24-wsl-ack-missing-after-cross-routing.md) | 2026-05-24 본진→WSL ack 운반체 누락 — 형님 WSL 채팅 침묵 사고 | ? | ? | — | — |
| 2026-05-24 | [notebook-to-mac-ssh-kex-mismatch](2026-05-24-notebook-to-mac-ssh-kex-mismatch.md) | 2026-05-24 노트북→본진 SSH KEX/HostKey mismatch 30초 silent hang | ? | ? | — | — |
| 2026-05-24 | [notebook-stop-hook-reply-tool-skip](2026-05-24-notebook-stop-hook-reply-tool-skip.md) | 2026-05-24 노트북 stop hook 헤더 누락 — reply tool 호출로 이중송신 가드 trigger | ? | ? | — | — |
| 2026-05-24 | [notebook-autologin-wake-unlock](2026-05-24-notebook-autologin-wake-unlock.md) | 노트북 Windows 부팅 자동로그인 + 슬립 wake 잠금 해제 (Hello 정책 우회) | low | medium | — | — |
| 2026-05-24 | [master-node-idle-deadlock](2026-05-24-master-node-idle-deadlock.md) | 2026-05-24 본진↔노드 양쪽 idle 데드락 — picks 분기 답이 잘못된 채널로 발사 | ? | ? | — | — |
| 2026-05-24 | [mac-mini-group-mirror-token-mismatch](2026-05-24-mac-mini-group-mirror-token-mismatch.md) | 2026-05-24 맥미니 Agent Mesh Mirror 그룹 발사 무응답 — TOKEN_MACMINI stale (401) | ? | ? | — | — |
| 2026-05-24 | [context-percent-mis-estimation](2026-05-24-context-percent-mis-estimation.md) | 컨텍스트 % 체감 추정으로 핸드오프+클리어 강행 | ? | ? | 4회 | — |
| 2026-05-23 | [notebook-balanced-sleep-5h-cuts-remote-access](2026-05-23-notebook-balanced-sleep-5h-cuts-remote-access.md) | 노트북 Windows Balanced 5h idle sleep → Tailnet offline, 원격 노드 통째로 끊김 | ? | ? | — | — |
| 2026-05-23 | [noninteractive-ssh-claude-binary-misdiagnosis](2026-05-23-noninteractive-ssh-claude-binary-misdiagnosis.md) | 사건 | ? | ? | — | — |
| 2026-05-23 | [naver-smart-editor-paste-requires-os-click](2026-05-23-naver-smart-editor-paste-requires-os-click.md) | 네이버 SmartEditor 본문 paste 가 진짜 OS-level click 1회를 요구 | ? | ? | — | — |
| 2026-05-23 | [macos-system-settings-fullauto-pass](2026-05-23-macos-system-settings-fullauto-pass.md) | macOS Sequoia 시스템 설정 풀자동 토글 PASS (본진 자립성 5단계 캘리브레이션) | low (자립성 키운 성공 사례 — 기능 사고 아니라 자동화 능력 확장) | low (성공 패턴 박힘, knowhow 로 재사용) | — | — |
| 2026-05-23 | [linux-trust-prompt-autostart-gate](2026-05-23-linux-trust-prompt-autostart-gate.md) | 2026-05-23 — Linux 노드 챗봇 autostart trust prompt 게이트 (PASS) | ? | ? | — | — |
| 2026-05-23 | [hook-misdiagnosis-symlink](2026-05-23-hook-misdiagnosis-symlink.md) | context-threshold-alert hook 경로 symlink 오진 사고 | ? | ? | — | — |
| 2026-05-23 | [exitplanmode-globals-gap](2026-05-23-exitplanmode-globals-gap.md) | 2026-05-23 — ExitPlanMode 가 글로벌 룰 gap 으로 텔레그램 turn 에서 호출됨 | ? | ? | — | — |
| 2026-05-23 | [anthropic-cyber-content-block](2026-05-23-anthropic-cyber-content-block.md) | 본진 Claude Code 응답 차단 (Anthropic Usage Policy cyber content 분류기 트리거) | high (본진 전 응답 채널 차단, 형님 일반 메시지 포함 거부) | medium (OAuth/admin elevation/원격 send-keys 패턴은 본진 일상 작업 영역, 추상화 forcing function 없이는 또 트리거 가능) | — | — |
| 2026-05-22 | [loop-reschedules-without-clear](2026-05-22-loop-reschedules-without-clear.md) | autopilot /loop 이 30% 넘어도 클리어 안 하고 재예약만 반복 | ? | ? | — | — |
| 2026-05-22 | [autopilot-sessionclear-directive-race](2026-05-22-autopilot-sessionclear-directive-race.md) | autopilot 야간 작업 증발 — session-clear 마커 ↔ directive 도착 race | ? | ? | — | — |
| 2026-05-22 | [autopilot-macmini-liveness-false-negative](2026-05-22-autopilot-macmini-liveness-false-negative.md) | autopilot 노드 liveness false-negative — 맥미니가 멀쩡한데 "꺼짐"으로 야간 미가동 | ? | ? | — | — |
| 2026-05-21 | [typing-indicator-drops-during-bg-work](2026-05-21-typing-indicator-drops-during-bg-work.md) | 텔레그램 "입력중…" 인디케이터가 cross-turn 백그라운드 작업 중 끊김 | low (기능 정상, UX/안심 신호만) | high (긴 빌드/인코딩/배포를 백그라운드로 돌릴 때마다) | — | — |
| 2026-05-21 | [stuck-loop-session-side-effects](2026-05-21-stuck-loop-session-side-effects.md) | 안 닫힌 loop 세션이 Clawd stale 행 + 타이핑 데몬 죽임 (sibling 세션 부작용) | medium | high | — | — |
| 2026-05-21 | [hook-matching-too-loose-2x](2026-05-21-hook-matching-too-loose-2x.md) | 훅 매칭 느슨 2건 연속 — telegram-stop-ping tail -1 + reverse-reply-check contains 자기참조 | low | medium | — | — |
| 2026-05-21 | [autopilot-idle-nodes-token-saving](2026-05-21-autopilot-idle-nodes-token-saving.md) | autopilot 6시간 야간 운영 중 본진이 노드를 ~5시간 idle 방치 (임의 "토큰절약") | medium | high (autopilot 자율 운영 디폴트 동작에 내재) | — | — |
| 2026-05-20 | [wsl-bot-bare-path-no-poll](2026-05-20-wsl-bot-bare-path-no-poll.md) | 2026-05-20 — WSL 텔레그램 봇 무응답: 비대화형 ssh 기동 → bare PATH(node 누락) → 플러그인 폴링 정지 | medium | high | — | — |
| 2026-05-20 | [memoyo-drive-oauth-dup-gcp-project](2026-05-20-memoyo-drive-oauth-dup-gcp-project.md) | 메모요 Drive 백업 — 동명 GCP 프로젝트 분산으로 앱이 보는 쪽에 Drive API 미활성 | medium | medium | — | — |
| 2026-05-20 | [mac-report-binary-image-paste](2026-05-20-mac-report-binary-image-paste.md) | 맥미니 mac-report 가 스크린샷 PNG 바이너리를 본문 텍스트로 paste → 본진 컨텍스트 폭증 | medium | high | — | — |
| 2026-05-20 | [context-show-self-trigger-stuck](2026-05-20-context-show-self-trigger-stuck.md) | context-show 본진 자기 자신 trigger 시 손0 원칙 위반 | ? | ? | — | — |
| 2026-05-20 | [choso-css-cache-stale-render](2026-05-20-choso-css-cache-stale-render.md) | 초소 PR #6 머지·배포 후에도 라이브가 옛 화면 — CSS 캐시로 새 HTML 이 무스타일 렌더 | low | high | — | — |
| 2026-05-20 | [cc-version-stale-always-on-node](2026-05-20-cc-version-stale-always-on-node.md) | 2026-05-20 — 본진/WSL Claude Code 구버전 고착 (always-on 노드 nightly-update 영구 skip) | ? | ? | — | — |
| 2026-05-19 | [wsl-telegram-reply-only-sync-report-missed](2026-05-19-wsl-telegram-reply-only-sync-report-missed.md) | 2026-05-19 🪟 WSL cross-device sync 보고를 텔레그램 reply 단독 송신 → 본진 capture 0 | ? | ? | — | — |
| 2026-05-19 | [stop-chain-fail-stop-analysis](2026-05-19-stop-chain-fail-stop-analysis.md) | Stop chain `\|\|` 단축 평가 fail-stop 위험 분석 | ? | ? | — | — |
| 2026-05-19 | [share-plus-ios26-silent-fail](2026-05-19-share-plus-ios26-silent-fail.md) | share_plus 10.1.4 + iOS 26 sharePositionOrigin 필수화 → 호출부 silent PlatformException | medium | high | — | — |
| 2026-05-19 | [sessionstart-pull-rebase-race](2026-05-19-sessionstart-pull-rebase-race.md) | SessionStart 훅 git pull --rebase race → Cannot rebase onto multiple branches | medium | low (패치 후) | — | — |
| 2026-05-19 | [mac-report-telegram-reply-missed](2026-05-19-mac-report-telegram-reply-missed.md) | 2026-05-19 mac-report paste 받은 turn 에 형님 폰 텔레그램 reply 누락 | ? | ? | — | — |
| 2026-05-19 | [fleet-clear-rescue-pane-mismatch](2026-05-19-fleet-clear-rescue-pane-mismatch.md) | fleet-clear rescue v0.8 pane-finding 로직이 grouped client 환경에서 본진 챗봇 pane 놓침 | medium (사이클 자체는 완료, 본진 자동 /clear 만 빗나감) | high (rescue 로직 fix 전까지 동일 환경에서 재발) | — | — |
| 2026-05-19 | [desktop3060ti-icm-hook-trace](2026-05-19-desktop3060ti-icm-hook-trace.md) | 🖥 데스크탑3060Ti — icm hook 정체 trace (2026-05-19) | ? | ? | — | — |
| 2026-05-19 | [desktop3060ti-fabrication-cross-routing](2026-05-19-desktop3060ti-fabrication-cross-routing.md) | 🖥 데스크탑3060Ti — cross-routing directive + fabrication 사고 (2026-05-19) | ? | ? | — | — |
| 2026-05-18 | [wsl-cc-nightly-update-zombie](2026-05-18-wsl-cc-nightly-update-zombie.md) | 2026-05-18 — WSL cc 좀비 사고 (nightly-update atomic swap 충돌) | ? | ? | — | — |
| 2026-05-18 | [tmux-wheel-scroll](2026-05-18-tmux-wheel-scroll.md) | Linux tmux 노드 마우스 휠 스크롤 안 됨 (mouse off default) | low | medium (신규 Linux 노드 추가 시마다 재현) | — | — |
| 2026-05-18 | [notebook-stale-sync](2026-05-18-notebook-stale-sync.md) | 노트북3060 claude-skills repo 4 commit stale (issues/INDEX.md UU conflict 사일런트) — "가전" 트리거 룰 누락으로 "에어컨 켜" 발화 무반응 | medium | high | — | — |
| 2026-05-18 | [mac-zshrc-mcc-broken](2026-05-18-mac-zshrc-mcc-broken.md) | 본진 ~/.zshrc 의 m/cc 분리 표준을 챗봇이 무허가 통일 → 형님 수동 복구 | medium (본진 표준 깨짐, 형님 직접 복구. 데이터 손실/외부 영향 0) | high (alias / 자동 attach / 셸 진입 동선은 챗봇의 "통일/효율화" 충동 표적) | — | — |
| 2026-05-18 | [find-bfs-inventory-false-alarm](2026-05-18-find-bfs-inventory-false-alarm.md) | `find` shell function (bfs wrapper) 로 인한 mac-mini credential inventory false alarm | medium | high | — | — |
| 2026-05-18 | [fastlane-supply-aab-already-used-on-promote](2026-05-18-fastlane-supply-aab-already-used-on-promote.md) | 🐛 fastlane supply --rollout aab 재업로드 — Version code 23 has already been used | ? | ? | — | — |
| 2026-05-18 | [cocoapods-utf8-encoding-bug](2026-05-18-cocoapods-utf8-encoding-bug.md) | 🐛 CocoaPods 1.16.2 + Ruby 4.0.3 UTF-8 인코딩 버그 — `pod install` 즉사 | ? | ? | — | — |
| 2026-05-18 | [askuser-globals-gap](2026-05-18-askuser-globals-gap.md) | AskUserQuestion 터미널 UI 띄움 — 본진 메모리 → globals 승격 누락 + 데스크탑 claude-skills stale 결합 | medium | high | — | — |
| 2026-05-18 | [asc-deliver-whatsnew-required](2026-05-18-asc-deliver-whatsnew-required.md) | 🐛 asc-deliver --submit whatsNew null → 409 STATE_ERROR | ? | ? | — | — |
| 2026-05-18 | [android-applicationid-snake-case](2026-05-18-android-applicationid-snake-case.md) | 🐛 Android applicationId snake_case vs iOS Bundle camelCase 불일치 — Play API 패키지명 거부 | ? | ? | — | — |
| 2026-05-17 | [tuya-memory-concurrent-write-conflict](2026-05-17-tuya-memory-concurrent-write-conflict.md) | 2026-05-17 — tuya_devices.md 동시 쓰기로 인한 autostash 충돌 (반복 발생) | ? | ? | — | — |
| 2026-05-17 | [stop-hook-mac-mini-directive-not-detected](2026-05-17-stop-hook-mac-mini-directive-not-detected.md) | 2026-05-17 — Stop hook 의 reverse-reply 감지 list 에 mac-mini-directive.sh 누락 | ? | ? | — | — |
| 2026-05-17 | [mac-report-sender-id-missing](2026-05-17-mac-report-sender-id-missing.md) | mac-report body 에 sender 노드 신원 누락 → 본진 챗봇 "출처불명" 식별 사고 | medium (식별 사고 자체는 cosmetic, 다만 reverse reply 발송 실패로 송신 노드 idle 위험) | low (스크립트 자동화 + idempotent guard 박힌 후) | — | — |
| 2026-05-17 | [lotto-calc-pr16-stale-base-mismatch](2026-05-17-lotto-calc-pr16-stale-base-mismatch.md) | 2026-05-17 — lotto-calc PR #16 stale base mismatch (sweep step 0 git fetch+status 누락) | ? | ? | — | — |
| 2026-05-17 | [gh-pages-cert-provisioning-stuck](2026-05-17-gh-pages-cert-provisioning-stuck.md) | GH Pages custom domain cert provisioning 멈춤 → 브라우저 빨간 경고 | medium | medium | — | — |
| 2026-05-16 | [stale-recover-loss](2026-05-16-stale-recover-loss.md) | fleet-state stale-recover 가 5분 cron cycle 마다 작업자 commit 까지 origin/main 으로 reset | high (작업자 commit 분실 + 5분 주기 자동 재현 + 작업자 detection 없음) | high (root cause 미해결, 본진/Mac mini launchd 작업자 commit 위에 있는 동안 매 cycle 재현 가능) | — | — |
| 2026-05-16 | [ssh-alias-mismatch](2026-05-16-ssh-alias-mismatch.md) | 본진 챗봇이 SSH alias 대신 hostname 그대로 사용 → 두 시간 timeout 추적 | medium (작업 두 시간 헛다리, 동시 진행 task 지연) | medium (CLAUDE.md hostname 컬럼과 ssh alias 가 매번 헷갈리는 패턴) | — | — |
| 2026-05-16 | [desktop3060ti-tmux-session-name-unify](2026-05-16-desktop3060ti-tmux-session-name-unify.md) | desktop3060Ti tmux 세션 이름 'claude-main' 잔존 — cc / .bashrc SoT 미통일 | low (실 directive 운반 영향 0 — 운반체 타겟 'claude' 와 별 group 'claude-main' 격리) | low (SoT 양쪽 다 'claude' 로 박힘) | — | — |
| 2026-05-16 | [d07-install-launchd-smoke-self-load](2026-05-16-d07-install-launchd-smoke-self-load.md) | D07 install-launchd.sh smoke self-load — guard 검증 의도가 실 install 까지 가버린 사고 | medium (실 부작용 0, 5분 worker spawn 발화 전 rollback 성공) | medium (스크립트 구조 단일 단계라 또 발생 가능) | — | — |
| 2026-05-15 | [notebook-hook-path-macos-node](2026-05-15-notebook-hook-path-macos-node.md) | 노트북 Claude Code SessionStart hook `/opt/homebrew/bin/node: not found` 실패 | low | medium (desktop3060ti 잔존 — 본진 note) | — | — |
| 2026-05-15 | [macmini-reverse-asym](2026-05-15-macmini-reverse-asym.md) | mac-mini 의 ~/.ssh/config 본진 향 alias 'mac' 누락 — mac-report.sh reverse channel 비대칭 | medium (loop-fleet/mesh 운영에서 mac mini 결과 자동 회수 0, 강대종 paste 운반 필요) | low (config 한 줄 fix, 회귀 위험 낮음) | — | — |
| 2026-05-15 | [codex-directive-routing-stale](2026-05-15-codex-directive-routing-stale.md) | codex-directive.sh routing stale — mac-mini Claude Code 노드 전환 후 옛 Codex inbox 경로 사용 | medium (mac-mini 노드 작업 분배 0, loop-fleet 매번 4/5 PASS 천장) | high (구조적 — 2026-05-15 loop-fleet 사이클 1+2 둘 다 재현, 코드 변경 없으면 매 사이클 재현) | — | — |
| 2026-05-14 | [rotate-token-channel-mode-dead](2026-05-14-rotate-token-channel-mode-dead.md) | rotate-token.sh --channel mode OpenClaw decom 후 dead path | medium | low | — | — |
| 2026-05-14 | [macmini-self-identity-default-mac-bonjin](2026-05-14-macmini-self-identity-default-mac-bonjin.md) | mac mini Claude Code 자기 정체성을 Mac 본진 으로 오인 (TELEGRAM_BOT_USERNAME 미설정 + 추론 실패) | medium | high (2026-05-20 2차 재발 — 5/18 격상된 SessionStart 훅 마감 5/25 전에 또 터짐. 추가 위반 2건 surface — 자기-SSH redispatch + cross-routing 룰 위반) | 2회 | — |
| 2026-05-14 | [macmini-plugin-cache](2026-05-14-macmini-plugin-cache.md) | mac mini Claude Code 텔레그램 plugin MCP server spawn 실패 (launchd PATH 누락) | medium | low (PATH 박힌 후) | — | — |
| 2026-05-14 | [macmini-launchd-claude-channels-flag-missing](2026-05-14-macmini-launchd-claude-channels-flag-missing.md) | mac mini launchd tmux-claude plist `--channels` 플래그 누락 (cc 첫 진입 시 텔레그램 incoming listen 안 됨) | medium | low (plist 패치 후 차단) | — | — |
| 2026-05-14 | [macmini-bot-token-grep-leak](2026-05-14-macmini-bot-token-grep-leak.md) | TELEGRAM_BOT_TOKEN_MACMINI 풀텍스트 conversation 노출 | medium | medium | — | — |
| 2026-05-14 | [launchd-plist-path](2026-05-14-launchd-plist-path.md) | tmux-claude.plist 의 PATH 누락으로 텔레그램 plugin 자동 재기동 시 spawn 실패 | medium (특정 사용자 봇 통로 끊김, 외부 데이터 손실 없음) | high (본진 `com.user.tmux-claude.plist` / `com.user.tmux-main.plist` 에도 같은 PATH 누락 잔존) | — | — |
| 2026-05-13 | [mac-report-reverse-reply-missed](2026-05-13-mac-report-reverse-reply-missed.md) | mac-report 1차 회신 누락 — Mac→WSL reverse reply 빠뜨림 | medium | medium-high (2026-04-20 telegram-only reply 와 동일 패턴, 채널 누락 일반화 함정) | — | — |
| 2026-05-13 | [fleet-state-mac-mini-divergence](2026-05-13-fleet-state-mac-mini-divergence.md) | fleet-state mac-mini local main divergence — reviewer parity bats 의 local-only commit 누적 | low (한 줄 reset 으로 즉시 해결, 손실 데이터 0) | low-after-fix (FLEET_NO_PUSH 가드 적용 후 bats 가 local commit 도 생성 안 함 — 실제로는 commit 은 여전히 생성, push 만 차단) | 2회 | — |
| 2026-05-13 | [desktop3060ti-claude-automations-absent](2026-05-13-desktop3060ti-claude-automations-absent.md) | desktop3060ti `~/.claude/automations/` repo 부재 — WSL 디렉티브 회수 시 surface | medium (다기기 회수 자동화의 호환성 함정 surface) | medium (다른 기기에서도 같은 패턴 가능 — hermes, 향후 추가 노드) | 1회 | — |
| 2026-05-13 | [d09-fleet-sweep-family-4-rounds](2026-05-13-d09-fleet-sweep-family-4-rounds.md) | D09 fleet-director 사이클 sweep family 4회 반복 — bats 와 primitive 의 push side-effect 누적 | high (review-before-push 룰 4회 반복 위반, 약 3.5 시간 손실, 룰 3종 박제 사이클) | low-after-fix (FLEET_NO_PUSH 가드 + parity prompt 표준 + sequential verification 룰 박제 후) | 2회 | — |
| 2026-05-12 | [fleet-state-tests-auto-push-leak](2026-05-12-fleet-state-tests-auto-push-leak.md) | fleet-state test harness 의 git push 가 리뷰 미통과 commit 까지 origin 으로 끌고 올라감 | medium (process 룰 위반 — 코드 손상 X, 보안 영향 X. 그러나 "commit 은 review 후" 원칙 무력화) | 100% (현재 test harness 구조 유지 시 매번 발생) | — | — |
| 2026-05-12 | [dutchpay-gad-application-identifier-missing](2026-05-12-dutchpay-gad-application-identifier-missing.md) | 더치페이 release 빌드 iPhone 설치 후 앱 launch crash — Info.plist GADApplicationIdentifier 누락 | ? | ? | — | — |
| 2026-05-12 | [codex-bidirectional-routing-failure](2026-05-12-codex-bidirectional-routing-failure.md) | Codex(맥미니) ↔ 본진(Mac) 양방향 메시지 자동 회수 경로 부재 | high (멀티 디바이스 fleet 운영에서 본진이 Codex 결과를 자동으로 받지 못함 = 강대종 hands-off 시간 확보 목표 자체와 충돌) | 100% (구조적 결함, 코드 변경 없으면 매번 재현) | — | — |
| 2026-05-11 | [routine-todos-collision-pat-leak](2026-05-11-routine-todos-collision-pat-leak.md) | Anthropic Cloud routine 이 /todo 스킬 파일경로에 매일 commit + prompt 안 GitHub PAT 평문 노출 | medium (데이터 손실 0. 다만 PAT 평문 노출은 high.) | medium (routine 재활성화 시 같은 문제, 다른 routine 도 같은 패턴 가능) | — | — |
| 2026-05-11 | [launchd-clear-trigger-abort-loop](2026-05-11-launchd-clear-trigger-abort-loop.md) | launchd 자동 /clear 트리거 abort 반복 — busy-loop 시 fire 마다 timeout | medium | low (2026-05-16 v2.6 patch 후. 이전: high) | 2회 | — |
| 2026-05-10 | [session-clear-marker-race](2026-05-10-session-clear-marker-race.md) | session-clear 마커 조기 소모 레이스 컨디션 | ? | ? | — | — |
| 2026-05-10 | [session-clear-full-investigation](2026-05-10-session-clear-full-investigation.md) | session-clear 전 구현 실패 원인 + 최종 성공 분석 | ? | ? | — | — |
| 2026-05-10 | [session-clear-buffer-polling-bug](2026-05-10-session-clear-buffer-polling-bug.md) | session-clear /clear 씹힘 — 입력 버퍼 + polling 조건 버그 | ? | ? | — | — |
| 2026-05-10 | [placeholder-paste-loss](2026-05-10-placeholder-paste-loss.md) | Telegram paste 명령 안 `<...>` placeholder 가 그대로 paste 되어 3060Ti .env 봇 토큰 덮어써짐 | medium (transcript 에서 복구 성공. transcript GC 됐으면 high — 봇 자체 분실) | medium (cross-device 셋업 paste 안내마다 재발 가능. 기존 paste-block hook 미검사 패턴) | — | — |
| 2026-05-10 | [mini-agent-inbox-bot-bridge](2026-05-10-mini-agent-inbox-bot-bridge.md) | Mac mini agent-inbox watcher — wsl/ 무시 + tmux 부재로 inject 양방향 죽음 | medium | medium (새로운 inbox bucket 추가나 stdio 모드 환경 추가 시) | — | — |
| 2026-05-10 | [loop-run-92771-failure-analysis](2026-05-10-loop-run-92771-failure-analysis.md) | loop-run run-92771 실패 원인 분석 + 수정 | ? | ? | — | — |
| 2026-05-10 | [claude-code-terminal-stdin-lag](2026-05-10-claude-code-terminal-stdin-lag.md) | Claude Code 터미널 입력 지연 (3~4타에 1글자) | medium | medium | — | — |
| 2026-05-09 | [wsl-agent-msg-notify-bot-blocked](2026-05-09-wsl-agent-msg-notify-bot-blocked.md) | WSL agent-msg-notify.sh → Telegram 봇차단으로 Mac 수신 불가 | medium (WSL→Mac 양방향 통신 미작동) | high (구조적 오해, WSL이 잘못된 경로 계속 사용) | — | — |
| 2026-05-09 | [typing-indicator-stop-on-midtask-wait](2026-05-09-typing-indicator-stop-on-midtask-wait.md) | 작업 중간 확인 대기 시 입력 중 표시 꺼짐 | low (UX — 봇 죽었나 오해 유발) | low (수정 완료) | — | — |
| 2026-05-09 | [telegram-typing-zombie-after-clear](2026-05-09-telegram-typing-zombie-after-clear.md) | /clear 후 이전 세션 typing daemon 좀비 잔류 | low (UX — 작업 안 하는데 "입력 중" 표시) | high | — | — |
| 2026-05-09 | [play-managed-publishing-on](2026-05-09-play-managed-publishing-on.md) | Play Console 관리 게시 ON — 심사 통과 후 미발행 | medium | high | 2회 | — |
| 2026-05-09 | [loop-run-wsl-abort-flutter-path](2026-05-09-loop-run-wsl-abort-flutter-path.md) | loop-run WSL 태스크 ABORT 무한 재시도 + flutter PATH 미설정 | medium (loop-run WSL/macmini device 태스크 전체 불능) | low (수정 완료) | — | — |
| 2026-05-09 | [clear-queued-during-processing](2026-05-09-clear-queued-during-processing.md) | /clear 처리 중 큐 지연 — 슬래시 커맨드 큐잉 동작 | low (기능 동작은 정상, UX 혼선) | high (설계 동작, 항상 해당) | — | — |
| 2026-05-08 | [mac-report-fake-result-notify](2026-05-08-mac-report-fake-result-notify.md) | mac-report.sh 래퍼가 자동으로 가짜 [결과] 알림 생성 | medium | low | — | — |
| 2026-05-08 | [codex-session-relay-telegram-mirror](2026-05-08-codex-session-relay-telegram-mirror.md) | codex-session-relay가 Codex 응답을 본진 채팅에 중복 미러링 | ~~medium~~ → **high** (재발로 격상) | ~~low~~ → **high** (자동화 작업 중 실수 재기동 패턴 확인) | 3회 | — |
| 2026-05-08 | [codex-inject-websocket-silent-fail](2026-05-08-codex-inject-websocket-silent-fail.md) | Codex inject WebSocket 무음 실패 — directive ok 리턴했지만 미도달 | medium | medium | — | — |
| 2026-05-08 | [clawd-openclaw-codex-pid-unreachable](2026-05-08-clawd-openclaw-codex-pid-unreachable.md) | Clawd on Desk — OpenClaw Codex 연동 실패 (openclaw-trajectory pidReachable=0) | low | medium | — | — |
| 2026-05-06 | [hanjul-openai-org-member-removed](2026-05-06-hanjul-openai-org-member-removed.md) | 한줄일기 AI 응원 기능 중단 — OpenAI Organization 멤버 remove로 API 키 접근 차단 | high (유료 앱 핵심 기능 전체 중단) | medium | — | — |
| 2026-05-05 | [session-clear-triggered-goodnight](2026-05-05-session-clear-triggered-goodnight.md) | "세션클리어하자" → /goodnight 잘못 발화 사고 | ? | ? | — | — |
| 2026-05-04 | [lottocalc-irun-white-screen](2026-05-04-lottocalc-irun-white-screen.md) | lottocalc irun 흰화면 버그 | ? | ? | — | — |
| 2026-05-02 | [policy-race-mac-wsl](2026-05-02-policy-race-mac-wsl.md) | 본진·WSL 가 globals/CLAUDE.md 를 stale-on-stale 로 동시 수정 — 「지휘관 1명 원칙」 폐기 사이클의 race | medium (정책 파일 → 잘못 통합되면 두 작업자 행동 룰 자체가 깨짐) | medium (정책 갱신 사이클 또는 같은 파일 동시 작업 발생 시 동일 패턴) | — | — |
| 2026-05-02 | [playwright-mcp-cwd-output-dir](2026-05-02-playwright-mcp-cwd-output-dir.md) | Playwright MCP server cwd 가 `/` 일 때 `/.playwright-mcp` mkdir ENOENT | medium (Playwright MCP 도구 호출 100% 실패 → Substack republish · Play Console 자동화 등 차단) | high (plugin update / cache 재생성 시 .mcp.json 원복되면서 재현) | — | — |
| 2026-05-02 | [google-oauth-playwright-stealth-bypass](2026-05-02-google-oauth-playwright-stealth-bypass.md) | Playwright 로 띄운 Chrome 에서 Google OAuth 로그인 차단 — stealth args 3종 우회 성공 | medium (`/create-play-app` 자동화 + Play Console 신규 등록 자동화 전체가 차단되는 함정) | high (Google 자동화 차단 정책 상시 강화 추세, 규칙 변경 시 또 깨질 수 있음) | — | — |
| 2026-05-01 | [wsl-mac-race-skill-edit](2026-05-01-wsl-mac-race-skill-edit.md) | Mac 본진 push 직후 WSL 가 stale base 로 같은 repo 작업 시작 — race 자동 merge | low (이번엔 충돌 라인 안 겹쳐 git 이 자동 해결) | medium (handoff 패턴 + 본진 동시작업이 일상) | — | — |
| 2026-05-01 | [ep5-backfill-overwrite](2026-05-01-ep5-backfill-overwrite.md) | Substack backfill 이 Ep5 원본 prose 를 덮어씀 — 컨벤션 두 갈래 공존 | medium | high (다음 ep 도 substack-first 면 같은 사고) | — | — |
| 2026-04-28 | [cf-colo-region-block](2026-04-28-cf-colo-region-block.md) | CF colo region-block 으로 친구 wifi 에서만 OpenAI 호출 거부 | high (1900원 유료 출시 블로커) | medium (CF Workers 에서 OpenAI/Anthropic 등 region-block 권역 API 를 직접 호출하는 모든 앱) | — | — |
| 2026-04-27 | [wsl-hanjul-push-classifier-block](2026-04-27-wsl-hanjul-push-classifier-block.md) | WSL 측 hanjul main push 가 auto-mode classifier 에 막힘 + Mac SSH 우회도 동일 룰로 막힘 | medium | high (다른 앱·다른 기기에도 동일 발생 가능) | 3회 | — |
| 2026-04-27 | [telegram-msg-id-leak](2026-04-27-telegram-msg-id-leak.md) | 텔레그램 답장에 Bot API raw msg ID 인용해서 사용자 혼선 | low | high (이번이 첫 기록이지만 매 reply 마다 발생 가능한 패턴) | — | — |
| 2026-04-27 | [same-turn-commit-fp](2026-04-27-same-turn-commit-fp.md) | 같은 turn 내 Write→commit 묶음, harness sandbox false positive 거부 | medium | high (METHOD A 무복붙 핸드오프 매번 같은 흐름) | — | — |
| 2026-04-27 | [paste-block-mixed-r6](2026-04-27-paste-block-mixed-r6.md) | 복붙 블록 별도 메시지 룰 6번째 재발 (오늘만 4번) | medium | high (메모리·CLAUDE.md 룰만으론 6번째까지 어김) | 3회 | — |
| 2026-04-27 | [harness-default-branch-push-block](2026-04-27-harness-default-branch-push-block.md) | `git push origin main` 하네스 차단 — default branch 직접 push | medium | high — repo 마다 분류기 판단이 다르고, 작업 끝마다 같은 패턴 반복 | — | — |
| 2026-04-26 | [tahoe-ssh-cli-block](2026-04-26-tahoe-ssh-cli-block.md) | macOS Tahoe 26.x: systemsetup -setremotelogin 이 Full Disk Access 부족으로 차단 | low | medium | — | — |
| 2026-04-26 | [review-status-disabled-blind-spot](2026-04-26-review-status-disabled-blind-spot.md) | review-status-check _disabled 이동 후 17h 동안 Apple issue 메일 누락 | high (App Store 제출 일정 + 사용자 신뢰 영향, 2개 앱 동시 영향) | high (forcing function 없음, _disabled/ 폴더의 다른 모니터링·알림 잡들 다 같은 위험) | — | — |
| 2026-04-26 | [paste-block-label-leak](2026-04-26-paste-block-label-leak.md) | 복붙 메시지에 라벨/안내 텍스트 섞어 보냄 → PowerShell 명령 깨짐 | medium | high (이번이 3-4번째) | — | — |
| 2026-04-26 | [heartbeat-rule-soft-enforcement](2026-04-26-heartbeat-rule-soft-enforcement.md) | 작업 중 5분 하트비트 룰 강제력 부재로 12분간 침묵 | medium (UX, 사용자가 진행 상태 파악 못 함) | high (메모리 룰 만으로는 강제력 없음 — 작업 몰입 시 timestamp 추적 실패가 일상) | 3회 | — |
| 2026-04-26 | [handoff-method-a-fallback-regression](2026-04-26-handoff-method-a-fallback-regression.md) | /handoff METHOD A 회귀 — 무복붙 인프라 두고 복붙 폴백으로 빠짐 | medium | medium | — | — |
| 2026-04-26 | [handoff-claude-main-empty-shell](2026-04-26-handoff-claude-main-empty-shell.md) | /handoff Primary 첫 실전 — claude-main 세션은 살아있는데 안에서 Claude Code 가 안 돌고 있었음 | ? | ? | — | — |
| 2026-04-26 | [handoff-active-session-marker-mismatch](2026-04-26-handoff-active-session-marker-mismatch.md) | 발생 | ? | ? | — | — |
| 2026-04-25 | [wsl-playwright-mcp-install-blocked](2026-04-25-wsl-playwright-mcp-install-blocked.md) | WSL Playwright MCP 플러그인 설치 — 하네스 자기수정 게이트로 차단 | ? | ? | — | — |
| 2026-04-24 | [ios-ipad13-screenshot-mandatory](2026-04-24-ios-ipad13-screenshot-mandatory.md) | App Store 심사 제출: iPad 13" 스크린샷 누락으로 "심사에 추가" 차단 | medium (심사 제출 지연 수십 분) | high (iPhone 전용으로 기획한 앱을 App Store 에 올릴 때마다 동일하게 발견됨) | — | — |
| 2026-04-24 | [insta-autopost-mac-mirror-missing](2026-04-24-insta-autopost-mac-mirror-missing.md) | 4/24 인스타 자동 포스팅 누락 — Mac 호출 시 시크릿/인프라 부재 | ? | ? | — | — |
| 2026-04-23 | [ios-gidclientid-missing](2026-04-23-ios-gidclientid-missing.md) | iOS GoogleSignIn GIDClientID 누락 크래시 (심사레이더) | high (앱 첫 화면 전 강제 종료) | high (google_sign_in 쓰는 신규 Flutter 앱 iOS 첫 빌드에서 동일하게 재현) | — | — |
| 2026-04-21 | [orphan-skill-file-after-interrupt](2026-04-21-orphan-skill-file-after-interrupt.md) | 세션 중단 직후 방금 만든 스킬 파일이 커밋/푸시 없이 로컬에만 남음 | medium (데이터 유실 가능성 — Mac 디스크 단일 장애점 의존, 단일 파일 규모) | high (인터럽트/컨텍스트 스위치가 일상적, 현재 가드 없음) | 2회 | — |
| 2026-04-21 | [memoyo-signup-ghost-form](2026-04-21-memoyo-signup-ghost-form.md) | 메모요 스토어 드롭 후 2주 동안 홈페이지 사전예약 폼이 살아있어서 이메일 계속 수집 | low (개인 데이터 소규모 + 악의적 수집은 아님). 단 사용자 기대 이탈 위험은 있음. | medium (다른 앱/스킬 드롭 시 동일 구조 — 백엔드만 끄고 입력 채널 남김 — 재현 가능) | — | — |
| 2026-04-21 | [memory-skill-duplication](2026-04-21-memory-skill-duplication.md) | 메모리에 스킬 파일로 유도 가능한 내용을 중복 저장 | low (메모리 오염, 토큰 낭비) | high (가드 없음) | — | — |
| 2026-04-21 | [mac-wsl-todos-desync](2026-04-21-mac-wsl-todos-desync.md) | Mac 과 WSL 이 같은 심사레이더 작업을 병렬로 붙잡고 todos 정합성 파탄 | medium (잘못된 커밋 1건 + 사용자 혼란 + 양 기기 불일치, 다만 실제 파괴적 액션은 없음) | high (현재 구조상 기기 간 todo 상태 sync 가 인간 개입에만 의존) | — | — |
| 2026-04-21 | [launchd-silent-job-dropout](2026-04-21-launchd-silent-job-dropout.md) | launchd 가 등록된 잡을 소리 없이 떨궈서 수 주 동안 자동 스케줄 유실 | medium (자동화 잡 2개가 몇 주간 침묵 실행 실패 가능성) | medium (launchd 수동 편집 시마다 동일 현상 가능) | 1회 | — |
| 2026-04-20 | [terminal-only-reply-missed-telegram](2026-04-20-terminal-only-reply-missed-telegram.md) | Telegram-origin 질문에 터미널로만 답하고 reply 툴 호출 누락 | high (사용자 의사소통 차단) | high (같은 세션에서 여러 번 반복 확인됨) | 9회 | — |
| 2026-04-20 | [telegram-typing-midsession-drop](2026-04-20-telegram-typing-midsession-drop.md) | 텔레그램 typing 표시가 채팅 중 "한번 쏘고" 완전 정지 | low (UX, 응답 중 상태 불투명) | medium | 12회 | — |
| 2026-04-20 | [telegram-client-delivery-lag](2026-04-20-telegram-client-delivery-lag.md) | 텔레그램 답변이 "안 오는 것처럼" 보인 지연 현상 | medium | medium | — | — |
| 2026-04-20 | [irun-locked-iphone](2026-04-20-irun-locked-iphone.md) | /irun 재배포 시 "Could not run Runner.app" 반복 — 실제 원인은 아이폰 잠금 | medium | high | — | — |
| 2026-04-19 | [android-text-selection-twotone](2026-04-19-android-text-selection-twotone.md) | Android 텍스트 선택 블록이 2가지 톤으로 표시됨 | low (시각적 문제, 기능 정상) | low (Flutter TextField BoxHeightStyle 정책 이슈로 고정) | — | — |
| 2026-04-16 | [playwright-chrome-google-login-blocked](2026-04-16-playwright-chrome-google-login-blocked.md) | Playwright Chromium 으로 Google 로그인 시 "안전하지 않은 브라우저" 차단 | medium (자동화 블로킹) | medium (Google 보안 정책 변경 시 재현 가능) | — | — |
| 2026-04-16 | [play-console-testers-google-group](2026-04-16-play-console-testers-google-group.md) | Play Console testers API 가 개별 이메일을 받지 않음 | medium (베타 테스터 자동 추가 블로킹) | low (Google 정책 변경 없으면 고정) | — | — |
| 2026-04-12 | [ios-relaunch-crash](2026-04-12-ios-relaunch-crash.md) | iOS 재실행 시 SharedPreferencesPlugin 크래시 | high (앱 사용 불가) | medium (Flutter 메이저 업데이트 시 lifecycle 관련 회귀 가능) | — | — |

## 룰

- 매 이슈는 자기 파일 하나. `YYYY-MM-DD-<slug>.md`
- 이 INDEX 는 `/issue` 스킬이 저장할 때마다 전체 덮어쓰기로 재생성됨.
- 재발 가능성 high 인데 forcing function 없으면 적극적으로 설치. 이 index 가 "손 안 댄 debt" 추적판 역할도 겸함.
