---
prevention_deferred: null
---

# loop-run WSL 태스크 ABORT 무한 재시도 + flutter PATH 미설정

- **발생 일자:** 2026-05-09 18:16 KST
- **해결 일자:** 2026-05-09 19:03 KST
- **심각도:** medium (loop-run WSL/macmini device 태스크 전체 불능)
- **재발 가능성:** low (수정 완료)
- **영향 범위:** loop-run WSL/macmini device 태스크

## 증상
loop-run이 WSL 태스크를 MAX_RETRY(2)까지 반복 후 에스컬레이션.
WSL Claude bot은 계속 ABORT 반환. 90초 대기 후 WSL_TIMEOUT → JUDGE FAIL.
flutter analyze도 PATH 미설정으로 실패.

## 원인
1. **WSL Claude ABORT**: directive에 `저장: OUTPUT=$(eval '...')| ssh ...` 형식의
   복잡한 bash one-liner를 포함시켰으나, WSL Claude bot이 이 포맷을 이해하지 못하고
   ABORT 반환. 90초 wait 후 WSL_TIMEOUT 기록 → JUDGE FAIL → 무한 재시도.
2. **flutter PATH 미설정**: WSL SSH 세션 기본 PATH에 `~/flutter/bin` 없음.
   `flutter analyze`가 command not found로 실패하는 구조적 문제.

## 조치
loop-run.sh WSL/macmini 케이스를 SSH 직접 실행으로 교체 (commit: TBD).
- WSL Claude bot 경유 제거 → `ssh wsl "bash -c ..."` 동기 실행
- command에 `flutter` 포함 시 `export PATH="$HOME/flutter/bin:$PATH"` 자동 prepend
- macmini 케이스 동일 구조로 개선

## 예방 (Forcing function 우선)
- **SSH 직접 실행 표준화**: WSL/macmini bash 태스크는 Claude bot directive 경유 금지.
  `ssh wsl "bash -c ..."` 동기 실행으로 결과 즉시 수집. ABORT/timeout 재발 구조적 불가.
- **flutter PATH 자동 주입**: command에 `flutter` 포함 시 PATH export 자동 prepend.
  WSL/macmini 양쪽 모두 적용.

## 재발 이력
<없음>

## 관련 링크
- 수정: `~/.claude/automations/scripts/loop-run.sh` WSL/macmini 케이스
- 관련 이슈: `2026-05-09-telegram-typing-zombie-after-clear.md`
- 텔레그램 메시지: id 14767
