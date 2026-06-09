---
prevention_deferred: null
---

# 디렉티브 주입 묵음 stuck — carry#1-v3 미포팅 + bracketed-paste lock

- **발생 일자:** 2026-06-08 13:30 KST (반복 패턴, 당일 표면화)
- **해결 일자:** 2026-06-08 23:22 KST (PR #113 머지)
- **심각도:** high
- **재발 가능성:** high
- **영향 범위:** 5노드 `*-directive.sh` 전체 (본진→노드 디렉티브 발신 경로)

## 증상
본진→노드 디렉티브가 노드 Claude Code 입력창에 텍스트만 박히고 제출(Enter)이 안 됨 = 묵음 실패. 라이덴 "A안으로 가", 데스크탑 "PR113 머지해줘"가 입력창에 stuck 된 채 방치. "가끔씩 이렇게 떠있다"는 반복 패턴.

## 원인
`*-directive.sh` 의 주입이 `tmux paste-buffer` + `Enter` 1회 fire-and-forget 구조. 노드 세션이 busy / 렌더 지연 / bracketed-paste lock 상태면 Enter 가 제출로 안 먹혀 텍스트가 입력창에 남는다. **codex 스크립트(`*-codex-directive.sh`)엔 이미 carry#1-v3 fix(`paste-buffer -p` 종료마커 + Enter×5 + sleep 0.3s)가 박혀 있었으나, claude 스크립트 5개(wsl/desktop3060ti/notebook3060/mac/mac-mini-directive.sh)엔 미포팅** 이 진짜 근본원인. 그래서 claude 디렉티브만 stuck 나고 codex 는 안 났다.

## 조치
- PR #113 (claude-automations main 2685e07, squash) — claude 5개 스크립트에 carry#1-v3 포팅: `paste-buffer` → `paste-buffer -p`, Enter 1회 → Enter×5 + sleep 0.3s, 가드 마커(DO NOT REMOVE) 부착. surgical +20/-10, bash -n 5/5 PASS.
- 수동 복구 노하우(본진 실측):
  - **bracketed paste lock**: 이 상태에선 일반 Enter / C-u 가 안 먹는다. paste 종료마커 `ESC[201~` (`tmux send-keys -H 1b 5b 32 30 31 7e`) 를 보내야 paste 가 닫히고 제출됨.
  - **grouped session 함정**: `claude`(base) + `claude-NNNN`(attached) 그룹에서 `send-keys` 타깃이 base(`-t claude`)냐 attached suffix(`-t claude-2805`)냐로 먹고 안 먹고가 갈림 — 라이덴은 base, 데스크탑은 attached 라야 먹었음.

## 예방 (Forcing function 우선)
- **막을 코드/훅:** `https://github.com/ssamssae/claude-automations/pull/113` (carry#1-v3 포팅) + 후속 자동화 `scripts/directive-submit-verify.sh`(T-260608-65, 제출검증+종료마커/grouped 재시도 자동복구) + T-260608-66(세션 liveness 재발방지: node-session-check.sh 강제 + 세션명 리졸버 + tripwire 확장).
- carry#1-v3 가드 마커로 회귀 방지(guard-comment-protect 훅이 마커 제거 편집 deny).

## 재발 이력
<처음 생성>

## 관련 링크
- PR: https://github.com/ssamssae/claude-automations/pull/113
- 커밋: claude-automations main 2685e07
- 관련 이슈: 2026-05-30-macmini-tmux-liveness-false-negative (세션 liveness false-negative, 같은 측정-신뢰 계열)
- 측정 함정 기록: 세션 liveness 체크 시 'main' vs 'codex' 세션명 혼동 + macOS bare-tmux false-negative 로 "REPL 미기동" 오보 반복 → node-session-check.sh / node-tmux-bin.sh 강제 필요(T-260608-66).
