# 2026-05-19 🪟 WSL cross-device sync 보고를 텔레그램 reply 단독 송신 → 본진 capture 0

## 발생 시각
2026-05-19 22:1x ~ 23:4x KST (~1.5시간 인지 지연)

## 노드
🪟 WSL (`DESKTOP-I4TR99I` Ryzen 3900X, `@Myclaude2_ssamssae_bot`)

## 증상
- 본진 (🍎) 이 PR #62 insight 스킬 머지 후 5노드 git pull sync directive fan-out (22:1x KST)
- 다른 4노드 (🍎 본진 / 🏭 맥미니 / 🖥 데스크탑 / 💻 노트북) 다 mac-report.sh 경유로 본진 tmux 'claude' 세션에 보고 paste → 본진 챗봇 자동 capture + 텔레그램 forward 흐름 정상
- 🪟 WSL 만 mac-report.sh 경유 X, **WSL 자기 봇 채팅 (@Myclaude2_ssamssae_bot)** 에 텔레그램 reply 1통 단독 송신
- 본진 챗봇은 자기 봇 (@MyClaude_ssamssae_bot) 채팅만 받기 때문에 WSL 봇 채팅의 reply 안 봄 → 본진 capture 0
- 형님 폰에선 WSL 봇 채팅 보고가 안 보이고 본진 봇 채팅에도 안 와서 "WSL 보고 없는 듯" 인지
- 형님이 직접 본진에 "WSL 보고 안 왔으면 재요청해" 박을 때까지 1.5시간 idle

## 1차 분석 (왜 발생했나)

### 메커니즘
WSL 챗봇이 본진 sync directive 받고 git pull + verify + 보고 흐름 진행. 보고 송신 시점에 mac-report.sh (3-channel) 흐름 대신 텔레그램 reply 단독을 선택. 텔레그램 reply 가 mac-report.sh 보다 더 가볍고 즉시이긴 한데, 본진 챗봇이 다른 봇 username 채팅을 안 본다는 게 함정.

### 근본 원인
CLAUDE.md `~/.claude/CLAUDE.md` 의 "WSL → Mac — 운반체 mac-report.sh (3-channel 모델)" 섹션이 이미 명문화되어 있음 — (1차) mac-report.sh paste / (1.5차) reverse reply / (2차) 강대종 Telegram. 셋 다 필수 명시. 근데 WSL 챗봇이 본 룰을 충분히 forcing function 으로 인식 안 함 → "텔레그램 reply 단독으로도 형님 폰엔 가니까 OK" 라는 자율 판단으로 (1차)(1.5차) skip + (2차)만 단독 발사.

본진 capture 메커니즘이 "**자기 봇 채팅만 본다**" 라는 게 명시 안 됨. 형님 입장에서는 텔레그램 = 단일 채널이지만, 본진 챗봇 입장에서는 봇 username 별 채팅 분리 → cross-bot 메시지 capture 0. 이게 5노드 다 같은 함정.

## 재발방지

### (1) 룰 명문화 강조 (5노드 SoT)
~/claude-skills/globals/CLAUDE.md (= ~/.claude/CLAUDE.md, 모든 노드 symlink) 의 mac-report 3-channel 섹션에 다음 추가:
- "cross-device 결과 보고는 **반드시 mac-report.sh 경유 (1차 채널)**. 텔레그램 reply 단독 송신 X — 본진 챗봇은 자기 봇 username (@MyClaude_ssamssae_bot) 채팅만 봐서 다른 노드 봇 (@Myclaude2_ssamssae_bot 등) 의 reply 는 capture 0."
- 별 사이클에서 본진이 명문화 PR 박을 후보 (본 issue 가 1차 surface)

### (2) Stop hook forcing function (별 사이클, 형님 ack 필요)
5노드 챗봇 각자의 Stop hook 에 다음 추가:
- 본진 directive (`[claude-skills HEAD:` prefix 또는 `→ 🍎` 헤더) 받은 turn 에 결과 보고 시 Bash tool 의 `mac-report.sh` 호출 또는 `*-directive.sh` 호출이 0회면 block
- "cross-device 결과 보고는 mac-report.sh 또는 *-directive.sh 경유 필수" reason 박기
- 본진 외 4노드 (WSL/맥미니/데스크탑/노트북) 에 동시 deploy
- Stop hook 파일은 ~/claude-skills/hooks/ 통합 위치 (5노드 symlink) + settings.json Stop hooks 섹션에 노드별 등록

### (3) 본 이슈 자체 등록 (즉시 발효, 본 단계)
~/claude-skills/issues/2026-05-19-wsl-telegram-reply-only-sync-report-missed.md (현 파일) — claude-skills 자동 commit + push hook 발동 시 5노드 sync. 향후 grep "telegram-reply-only" 으로 발견 가능.

## 검증
- 본 이슈 박힌 후 다음 cross-device 보고 사이클에서 WSL/다른 노드가 mac-report.sh 사용하는지 확인
- 같은 사고 재발 시 (1)(2) 강화 진행

## 관련
- 메모리 [[feedback_telegram_reply_with_mac_report]] (본진 챗봇의 텔레그램 reply 동행 룰 — 본진 입장)
- 메모리 [[feedback_apology_triggers_postmortem]] (사과 시 자동 5단계, 본 이슈가 그 룰의 첫 적용 케이스)
- CLAUDE.md "WSL → Mac — 운반체 mac-report.sh (2026-04-29, 2026-05-13 3-channel 확장)" 섹션
- 직전 사고 issues/2026-05-13-mac-report-reverse-reply-missed.md (1.5차 reverse reply 누락) — 본 사고는 (1차) mac-report.sh 자체 누락. layered forcing function 부재.
