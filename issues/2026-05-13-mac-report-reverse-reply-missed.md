---
prevention_deferred: null
---

# mac-report 1차 회신 누락 — Mac→WSL reverse reply 빠뜨림

- **발생 일자:** 2026-05-12 23:56 KST
- **해결 일자:** 2026-05-13 00:01 KST (지적 받고 즉시 wsl-directive.sh 송신)
- **심각도:** medium
- **재발 가능성:** medium-high (2026-04-20 telegram-only reply 와 동일 패턴, 채널 누락 일반화 함정)
- **영향 범위:** Mac 본진 챗봇 / WSL→Mac mac-report 흐름 / 양방향 cross-device communication

## 증상
WSL 가 mac-report.sh 로 PR #8 머지 상태 질의를 보냄. Mac 본진 챗봇이 받아서 처리 (gh pr view → 머지 실행 → 강대종 Telegram 답장 2통). 그러나 **WSL 측 tmux 로 결과 회신 0건**. WSL 는 강대종 paste 없이는 결과 모름 → "왜 답변은 안할까? wsl에게" 지적.

## 원인
1. CLAUDE.md 의 mac-report 흐름 문구 "본진 챗봇이 자동으로 깨어나 보고서 fetch + 검토 + 회신" 에서 **"회신" 수신자 명시 안 됨**. 본진 챗봇이 "회신 = 강대종 Telegram 답장" 으로만 해석.
2. WSL→Mac 메시지를 일반 사용자 메시지처럼 처리 → 답변 = 사용자(강대종 Telegram) → WSL 도 답을 받아야 한다는 점 인지 못함
3. 2026-04-20 lesson (Stop hook for missed Telegram reply) 은 telegram channel 한정 — WSL 역방향 채널엔 forcing function 0

## 조치
- 누락 인지 후 즉시 `wsl-directive.sh -f /tmp/wsl-reply-pr8.txt` 송신 (2141 bytes, ✅ delivered to WSL tmux 'claude')
- 본 이슈 기록 (메모리 시작점)

## 예방 (Forcing function 우선)
**(A) Stop 훅 추가** (자동 강제, 차후 사이클):
- 새 훅 `~/.claude/hooks/mac-report-reverse-reply-check.sh`
- transcript JSONL 파싱 → `[Mac report title:` paste 감지 (이번 세션)
- 같은 세션 turn 들에서 `wsl-directive.sh` / `mac-directive.sh` / `agent-msg-notify.sh ... wsl ...` 호출 0회면 `{"decision":"block","reason":"..."}` 반환
- codex-report (mac-mini→Mac) 도 같이 커버: `[Codex report:` / `[Mac mini report:` 감지 시 `codex-directive.sh` 강제
- `stop_hook_active` 플래그 무한 루프 방지
- 6 시나리오 pipe-test 통과 후 settings.json `hooks.Stop` 등록

**(B) CLAUDE.md 명시 보강** (인간 의식, 본 사이클 적용):
- mac-report 흐름 설명에 1.5단계 추가: "본진 처리 완료 후 wsl-directive.sh 로 결과 회신 REQUIRED — 강대종 Telegram 답장(2차)과 별개 단계"
- 2-channel 이 아니라 **3-channel** (1차 Mac 처리 → 1.5차 WSL reverse reply → 2차 강대종 Telegram) 으로 모델 업데이트

## 재발 이력

## 관련 링크
- 비슷한 채널 누락 이슈: `2026-04-20-terminal-only-reply-missed-telegram.md`
- 머지 commit: 310ff8b (ssamssae/araseo-voice main)
- WSL 측 후속 청소 step 들: PR #8 머지 결과 메시지 (텔레그램 id 16028, 16032)
- 강대종 지적 메시지: 텔레그램 id 16031
