---
prevention_deferred: null
summary: "맥미니 Claude Code 노드 전환 후에도 본진이 옛 codex-directive.sh를 호출해 routing이 stale 상태로 남은 사고"
---

# codex-directive.sh routing stale — mac-mini Claude Code 노드 전환 후 옛 Codex inbox 경로 사용

- **발생 일자:** 2026-05-15 10:13 KST (loop-fleet 사이클 1 paste 시점)
- **해결 일자:** 미해결 — fix 는 별도 todo (mac-mini-directive.sh 신규 또는 codex-directive.sh 수정)
- **심각도:** medium (mac-mini 노드 작업 분배 0, loop-fleet 매번 4/5 PASS 천장)
- **재발 가능성:** high (구조적 — 2026-05-15 loop-fleet 사이클 1+2 둘 다 재현, 코드 변경 없으면 매 사이클 재현)
- **영향 범위:** `codex-directive.sh` / `agent-msg-notify.sh` macmini 케이스 / `loop-fleet` 매핑 (mac-mini 슬롯) / cross-device directive 송신 일반

## 증상

본진이 mac-mini 슬롯에 task 분배할 때 `~/.claude/automations/scripts/codex-directive.sh -f /tmp/loop-fleet-macmini.txt` 호출하면:

```
✅ directive sent to Codex (Mac mini) via Telegram
✅ directive queued to mac-mini inbox (tmux inject pending)
```

반환만 나오고 mac-mini Claude Code 노드가 receipt 응답 / 작업 결과 텔레그램 reply / mac-report.sh 발사 0. 즉 실수령 미확인. 2026-05-15 loop-fleet 사이클 1+2 둘 다 정확히 같은 패턴 재현.

## 원인

mac-mini 가 2026-05-14 Codex/OpenClaw 워크스페이스에서 **Claude Code 5번째 노드**로 전환됨 (메모리: `project_macmini_codex_to_claude_code.md`, brew cask claude-code 설치 + `@ssamssae_claw_bot` 채팅). 하지만 `codex-directive.sh` 는 옛 routing 그대로 사용:

1. Telegram broadcast (Codex 가 봇 채팅에서 자기 명령 수신)
2. `~/.openclaw/inbox-write.sh --remote` 류 inbox 큐

→ mac-mini Claude Code 의 tmux 'claude' (또는 'claude-main') 세션에 **직접 paste** 메커니즘 미구현. WSL 의 `wsl-directive.sh` / 데스크탑3060Ti 의 `desktop3060ti-directive.sh` / 노트북3060 의 `notebook3060-directive.sh` 처럼 SCP + tmux load-buffer + paste-buffer + Enter 패턴이 mac-mini 슬롯에는 없음.

부수적: agent-msg-notify.sh 의 macmini 케이스도 Telegram 송신만이라 본진 → mac-mini 자동 수신 보강 X.

## 조치

이번 사이클은 fix 안 함:
1. 사이클 1 (10:13 KST) — paste 결과 surface, follow-up todo 등재.
2. 사이클 2 (10:42 KST) — 동일 라우팅 한계 재현, 보고.
3. /goodnight (14:00 KST) — 본 이슈 박제 + 별도 fix todo 등재 (다음 세션 트리거 받으면 진행).

코드 fix 는 별도 작업 사이클에서 진행 — 본 issue 가 forcing function.

## 예방 (Forcing function 우선)

**1순위 — mac-mini-directive.sh 신규**: `wsl-directive.sh` / `notebook3060-directive.sh` 패턴 그대로 따라 SCP + tmux 'claude' load-buffer + paste-buffer + Enter. SSH host alias = mac-mini 그대로. claude-automations PR 1건.

**2순위 — CLAUDE.md 매핑 룰 갱신**: cross-device directive 송신 섹션에 mac-mini Claude Code 분기 추가 (codex-directive.sh 는 옛 Codex 워크스페이스용으로 보존 또는 deprecate, 새 mac-mini-directive.sh 가 default).

**3순위 — agent-msg-notify.sh macmini 케이스 보강**: directive paste 경로도 같이 발사 (Telegram broadcast 와 별개).

**4순위 — loop-fleet SKILL.md 매핑**: ASSIGN[macmini] paste 분기 case 가 새 스크립트 호출하게 갱신.

**5순위 — INDEX 검증**: 본 fix 적용 후 loop-fleet 다음 사이클에 mac-mini 노드 receipt 응답 또는 mac-report.sh 송신 검증 — receipt 없으면 즉시 surface.

## 재발 이력

<처음 생성>

## 관련 링크

- 메모리: `project_macmini_codex_to_claude_code.md` (2026-05-14 노드 전환)
- 관련 이슈: `2026-05-12-codex-bidirectional-routing-failure.md` (Codex → 본진 회수 부재, 본 이슈와 방향 반대지만 같은 transition 사고 패턴)
- 텔레그램: 17057 (사이클 2 paste 결과), 17070 (사이클 2 종합 보고), 17075 (alias rename 후속 보고에서 routing 한계 surface)
