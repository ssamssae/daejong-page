---
prevention_deferred: null
summary: "Claude Code 터미널에 키 입력 시 3~4타에 한 글자씩 들어가는 지연, 세션 재시작으로 복구"
---

# Claude Code 터미널 입력 지연 (3~4타에 1글자)

- **발생 일자:** 2026-05-10 (이전 세션, 정확 시각 불명)
- **해결 일자:** 2026-05-10 17:08 KST (새 세션 / 현재 세션에서 정상 확인)
- **심각도:** medium
- **재발 가능성:** medium
- **영향 범위:** Mac 본진 Claude Code 터미널 세션 전반 (강대종 직접 입력 UX)

## 증상
Claude Code 가 띄워진 터미널에 키보드로 텍스트 입력 시 3~4타에 한 글자씩만 화면에 들어감. 입력 자체 누락은 아니고 지연만 발생. 새 세션(=/clear 또는 프로세스 재시작) 후 정상.

## 원인
정확 root cause 미확정(당시 진단 안 함). 가장 유력한 가설은 **세션 컨텍스트 비대 → Claude Code 메인 프로세스 stdin 처리 backpressure**. 부가 후보: MCP 서버 1개 hang(특히 playwright/telegram), 시스템 swap, tmux scrollback buffer 비대. 출력은 정상이고 입력만 느린 패턴이라 터미널 자체 꼬임보다 process backpressure 에 가까움.

## 조치
이번 건은 사용자 관찰만 하고 새 세션 시작으로 자연 해소됨. 코드/설정 변경 없음.

## 예방 (Forcing function)
**강대종이 "터미널 입력 느려/지연/한 글자씩" 류 발화 시 Claude 가 묻지 말고 즉시 다음 진단을 직접 Bash 로 실행** 후 결과를 텔레그램 회신:
1. `top -l 1 -o cpu -n 15` — claude / node 류 CPU 점유 상위 프로세스
2. `vm_stat | head -15` — swapouts 카운트 (메모리 압박)
3. `tmux display -p '#{history_size}' 2>/dev/null` (tmux 안이면) — scrollback 라인 수
4. `ps -ef | grep -E "claude|mcp" | head -20` — MCP 서버 프로세스 상태

세 번 이상 재발하면 진단 데이터 패턴 보고 자동 감지(컨텍스트 길이 임계 알림) 도입 검토. 1차 응급 처치는 `/clear` + (필요 시) Claude Code 재시작.

## 재발 이력
(처음 생성)

## 관련 링크
- (없음)
