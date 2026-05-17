---
summary: "Stop hook의 reverse-reply 감지 list에 mac-mini-directive.sh가 빠져 정상 회신을 미발화로 false positive 판정"
---

# 2026-05-17 — Stop hook 의 reverse-reply 감지 list 에 mac-mini-directive.sh 누락

## 발생

2026-05-17 06:38 KST, Mac 본진. memoyo-sync-loop cron fire #9 turn 종료 시점 stop hook 발화:

> 이번 세션에 `[Mac report title:` paste (WSL/mac-mini/desktop 등에서 Mac 본진으로 들어온 보고)를 받았는데 이번 turn 에 reverse reply 호출이 0회였습니다. ... `~/.claude/automations/scripts/wsl-directive.sh -f <reply_file>` (또는 다른 노드면 desktop3060ti-directive.sh / notebook3060-directive.sh / codex-directive.sh) 로 결과 회신 후 stop 하세요.

## 실제 상태 (false positive)

같은 turn 에서 mac-mini ASC freshness audit + RED5/YELLOW2 → 7 PR 보고에 대해 1.5차 reverse reply 이미 송신 완료:

```
~/.claude/automations/scripts/mac-mini-directive.sh -f /tmp/mac-mini-reply-asc-audit.txt
→ ✅ directive sent to Mac mini tmux session 'claude' (1837 bytes)
→ exit: 0
```

2차 강대종 Telegram 도 송신 완료 (http 200).

## 원인 추정

Stop hook 의 reverse-reply 감지 grep 패턴이 다음 4종만 cover:

- `wsl-directive.sh`
- `desktop3060ti-directive.sh`
- `notebook3060-directive.sh`
- `codex-directive.sh`

5번째 노드인 mac-mini (🏭, `@ssamssae_claw_bot`) 가 2026-05-14 Codex→Claude Code 노드로 전환된 후 `mac-mini-directive.sh` 가 도입됐는데, stop hook 의 감지 list 에는 반영되지 않음. 그래서 mac-mini-directive.sh 호출만 한 turn 은 false "reverse reply 0회" 판정.

## 임시 처리 (본 fire)

`mac-mini-directive.sh` 한 번 더 호출하여 hook 만족 시도 (단 hook 가 정말 grep 으로 wsl-directive.sh 만 보는 거라면 두 번째 호출도 인식 X — 효과 없음). 안전 fallback 으로 시도하고 issue 박음.

## 영구 해결 (강대종 / 자동화 정비 시)

Stop hook 스크립트 위치: 추정 `~/.claude/hooks/` 또는 `~/.claude/automations/hooks/` 의 reverse-reply check.

grep 패턴에 다음 추가:

```bash
# 기존
grep -E 'wsl-directive\.sh|desktop3060ti-directive\.sh|notebook3060-directive\.sh|codex-directive\.sh'
# 신규
grep -E 'wsl-directive\.sh|mac-mini-directive\.sh|desktop3060ti-directive\.sh|notebook3060-directive\.sh|codex-directive\.sh'
```

또는 더 유연하게:

```bash
grep -E '(wsl|mac-mini|desktop3060ti|notebook3060|codex)-directive\.sh'
```

추가로 codex-directive.sh 는 2026-05-16 폐기됐으므로 list 에서 제거 검토.

## 관련 문서

- CLAUDE.md "크로스 디바이스 디렉티브 송신" 섹션 (Mac → mac-mini METHOD A)
- `issues/2026-05-13-mac-report-reverse-reply-missed.md` (원본 사고, hook 강제 도입 배경)
- `issues/2026-05-16-codex-directive-deprecated.md` (codex-directive.sh 폐기)

## 본진 fire 영향

직전 cron fire #9 의 humanize 추출 작업 / SYNC_PROGRESS 마킹 / commit d4ce0a1 push / clear marker 박기 / 강대종 Telegram 2통 발사 모두 정상 완료. 본 false positive 가 작업 결과에 영향 0. 다음 cron fire 도 정상 진행.
