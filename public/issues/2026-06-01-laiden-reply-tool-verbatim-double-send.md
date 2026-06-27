# 2026-06-01 라이덴 reply 툴 verbatim 이중송신 (dedup 가드 신설)

## 증상
아니키 "왜 두번씩말하냐" + 스크린샷 2장. 🪟 라이덴(WSL) 봇 챗에 동일 보고("세 번째도 헛걸음… 세션은 멀쩡합니다, 제 호출 방식 문제였어요")가 토씨 그대로 2번 노출.

## 오진 → 정정
- 본진 1차 답변: "(1)시작 (2)먹통 두 단계 보고라 그렇다" → **틀림**. 스크린샷 2가 동일 문단 verbatim 2회임을 보여줘 정정.
- 2차 추정 후보: stop-hook(telegram-stop-ping.sh) dedup 가드 실패 → **아님**. 실측 결과 WSL hook 최신(0 behind origin) + 가드 4겹 다 있고, `/tmp/claude-stop-hook.log` 상 정상 동작(대부분 skip, 발사 1회).

## 근본원인 (transcript 실측)
WSL transcript `5922f1f0-…jsonl` 에서 `mcp__plugin_telegram_telegram__reply` tool_use 중 "헛걸음/세션은 멀쩡/호출 방식 문제" 텍스트가 **2회** 발사(헛걸음-reply=2, 그 transcript 총 reply 툴 18회). 즉 stop-hook 버그가 아니라 **라이덴이 reply 툴 자체를 같은 텍스트로 두 번 호출**. 노드 룰("노드 챗봇 reply 툴 직접 호출 X, 정본=mac-report 자동미러/stop-hook mirror") 위반 + verbatim 중복.

## 조치 — telegram-reply-dedup.sh (PreToolUse 가드 신설)
`~/claude-automations/hooks/telegram-reply-dedup.sh` (commit, 5노드 symlink 체인 ~/.claude/hooks→automations→claude-automations 로 전파).
- mcp reply 직전 (chat_id+text) sha256 해시, `~/.claude/state/reply-dedup/<hash>` 에 timestamp 기록.
- WINDOW=120s 내 동일 해시 재발사 시 exit 2 차단 + 가이드 메시지. 5분 지난 엔트리 자동 청소.
- mac-report.sh(curl)·stop-hook(curl) 은 reply 툴 미경유라 영향 0. 다른 텍스트는 통과.
- stop-hook dedup(터미널 미러 vs 강제 reply 중복용)과 **별 차원** — 둘 다 유지.
- 등록: 본진 settings.json reply 매처 그룹에 추가, WSL settings.json 에 reply 매처 그룹 신설(백업 `.bak.20260601-dedup`). 나머지 3노드(🏭🖥💻)는 추후 fanout.

## 검증
본진·WSL 양쪽 로컬 테스트: 1st allow / 2nd 동일텍스트 exit2 차단 / 다른텍스트 allow / non-reply 통과. ✓

## 가드 마커
hook 상단 `⚠️ 제거 금지 (DO NOT REMOVE)` 박스 — guard-comment-protect.sh 가 무단제거 deny.
