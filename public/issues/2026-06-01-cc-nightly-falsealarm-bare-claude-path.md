# 2026-06-01 claude-code nightly-update false alarm — bare `claude` PATH 미해결

## 증상
아니키 폰에 "❌ Claude Code 바이너리 자동 복구 실패 (<desktop-host>). 수동 점검 필요: npm i -g @anthropic-ai/claude-code" 가 **Linux 3노드(🖥 데스크탑·🪟 라이덴·💻 노트북) 동시에** 떠서 surface(msg29834). 자동복구가 실패했다는 알림.

## 진단 (실측, reinstall 전에)
- 4노드(본진+wsl+desktop+notebook) `claude --version` 다 **2.1.159 동일·정상**. 바이너리 안 깨짐, 버전 skew 없음 → 무작정 `npm i -g` 했으면 최신 끌어와 오히려 skew cascade 유발할 뻔.
- 노드 locale = C.UTF-8 정상.
- **근본원인 = `claude-code-nightly-update.sh` 의 `health_check_and_clean()` 가 bare `claude --version` 호출.** 스크립트 PATH(`/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:...`)에 노드의 nvm(`~/.nvm/.../bin`)·npm-global(`~/.npm-global/bin`) 경로가 없어, cron/systemd 비대화형 컨텍스트에서 `claude` 가 command-not-found → 멀쩡한 바이너리를 "손상→install.cjs 복구→여전히 못 찾음→복구 실패" 로 **오보**.
- macOS(본진·맥미니)는 claude 가 `/opt/homebrew/bin`(PATH 내)이라 안 뜸 → "Linux 3노드만 다뜸" 정확히 일치.

## 조치
`scripts/claude-code-nightly-update.sh` 에 `resolve_claude_bin()` 추가 — PATH → `npm prefix/bin/claude` → `~/.npm-global/bin/claude` → nvm 최신 node 순으로 풀패스 확보, `CLAUDE_BIN` 으로 전역. bare `claude --version` 7곳 전부 `"$CLAUDE_BIN" --version` 치환(health_check·notify_if_stale·BEFORE/AFTER). cf. feedback_node_liveness_full_tmux_path (같은 비대화형 PATH 함정).

## 검증
스크립트 제한 PATH 컨텍스트에서 resolve_claude_bin 실행 → 3노드 다 `~/.npm-global/bin/claude` 2.1.159 정상 회수. health_check line 79 가 version 매치 → return 0(healthy) → 오보 경로 차단. bash -n OK.

## 교훈
- 노드 알림이 와도 reinstall 전 실측(버전·동작·근본원인) — "복구 실패" 알림 ≠ 실제 손상. 성급한 일괄 reinstall 은 skew cascade 위험.
- 비대화형 cron/systemd 에서 노드 바이너리 호출은 bare 금지, 풀패스 리졸브 필수(tmux 풀패스 룰과 동형).
