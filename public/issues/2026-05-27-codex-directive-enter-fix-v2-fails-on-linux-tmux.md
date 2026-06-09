# codex-directive v2 Enter 두 번 fix 가 Linux tmux 3.4 + 1KB+ 본문에서 submit 실패

- **발생 일자:** 2026-05-27 00:32 KST (codex-mesh-vote Phase 1 fan-out 시 3노드 silent submit 실패로 발견)
- **해결 일자:** 2026-05-27 00:38 KST (수동 추가 Enter 3회로 즉시 복구) → 2026-05-27 02:00 KST (v3 패치 4 SSH 스크립트 적용, 자연 검증 사이클 대기)
- **심각도:** medium (자동화 단방향 silent fail — 형님이 "엔터 두번 누른거 맞냐" 의심으로 surface)
- **재발 가능성:** high (codex-directive 1KB+ 본문 발사 자체가 트리거 — mesh-vote / brainstorm / 긴 directive 전체 영향)
- **영향 범위:** 4 codex-directive 스크립트 (wsl/desktop3060ti/notebook3060/mac-mini) 중 Linux ssh+tmux 3 노드 (WSL/desktop/notebook)

## 증상

codex-mesh-vote 1779809294 Phase 1 fan-out 시 5노드 디렉티브 발사 후 60s 폴링:
- 🍎 본진 (mac-codex-directive.sh 로컬 tmux Enter 1번) → 응답 도착 ✅
- 🏭 맥미니 (mac-mini-codex-directive.sh ssh+tmux+Enter 두 번 v2 fix) → 응답 도착 ✅
- 🪟 WSL / 🖥 데스크탑 / 💻 노트북 (각 ssh+tmux+Enter 두 번 v2 fix) → 응답 0건, capture-pane 캡처 시 디렉티브 본문이 input box 에 그대로 남아있음 (submit 안 됨) ❌

증상 캡처 (Linux 3노드 공통):
```
완료 후 결과를 본진에 저장 (codex shell 도구로):

ssh mac "cat > ~/tmp/codex-mesh-vote/.../wsl-result.md" << 'EOF'
[당신 답변]
EOF
```

→ EOF 블록까지 그대로 input box 에 표시. codex agent 가 paste 받았지만 submit trigger 가 안 박혀 working 진입 X. Context 0% used 유지.

수동 추가 Enter 3회 (`ssh wsl "tmux send-keys -t main Enter; sleep 0.3; tmux send-keys -t main Enter; sleep 0.3; tmux send-keys -t main Enter"`) 후 즉시 codex working 진입, 응답 도착.

이전 검증 (carry #1 v2 fix 자연 검증, 같은 사이클 ~30분 전) 에선 짧은 `/clear` 7 바이트로 4 노드 PASS — 본문 크기에 따라 깨지는 패턴.

## 원인 (추정)

### Root cause: Linux tmux 3.4 vs macOS tmux 3.6a 의 paste-buffer + send-keys Enter 처리 차이

5노드 tmux 버전 점검:
- 🍎 본진 (macOS M-series) → tmux 3.6a
- 🏭 맥미니 (macOS M1) → tmux 3.6a
- 🪟 WSL → tmux 3.4
- 🖥 데스크탑 → tmux 3.4
- 💻 노트북 → tmux 3.4

codex CLI 는 5노드 모두 codex-cli 0.133.0 동일. tmux 버전이 유일한 변수.

가설:
1. **tmux 3.4 paste-buffer 가 bracketed-paste 종료 시퀀스를 명시적으로 박지 않음.** tmux 3.5+ 부터 paste-buffer 의 bracketed paste 처리가 개선됐을 가능성. codex REPL 은 ratatui 류 TUI 로 bracketed paste 모드에서 입력 stream 종료 시점을 paste-end marker (`\e[201~`) 로 판정. tmux 3.4 가 paste 종료 marker 를 안 박거나 늦게 박으면 codex input 이 "still pasting" 상태에 묶여 Enter 가 newline 으로 누적.
2. **paste-buffer 후 sleep 2 가 Linux 에선 부족.** load-buffer + paste-buffer 는 비동기 — 큰 buffer 일수록 paste 완료 시점이 늦어짐. 2.4KB 본문의 paste 가 Linux tmux 에서 더 오래 걸리고, Enter 가 paste 중간에 도착하면 newline 으로 흡수되고 submit 트리거 X.
3. **codex multi-line input 의 submit 임계 — Linux build 에서 더 보수적.** 같은 codex CLI 라도 OS 별 stdin 처리 동작 미세 차이로 Linux 에선 추가 Enter 가 더 필요할 가능성.

가장 가능성 높은 = 가설 1 + 2 의 조합. 실증 = paste-buffer 직후 추가 sleep 또는 추가 Enter 가 즉시 복구.

### 부가 사실

`tmux paste-buffer -p` (bracketed paste 명시 송신) flag 는 tmux 3.4 / 3.6a 양쪽 다 지원 (양쪽 `tmux paste-buffer -p -b dummy` → `no buffer dummy` 동일 에러, flag 자체는 인식). 즉 paste-buffer -p 로 통일하면 OS 무관 일관 동작 가능성 높음.

## 조치

### 즉시 (이미 적용)

Phase 1 + Phase 3 fan-out 시 Linux 3 노드 (wsl/desktop3060ti/notebook3060) 에 디렉티브 호출 직후 수동 추가 Enter 3회 박아 codex submit 트리거. 5노드 결과 전부 수집 완료.

### 후속 fix v3 (2026-05-27 02:00 KST 적용 완료)

`~/claude-automations/scripts/` 4 SSH 스크립트:
- `wsl-codex-directive.sh` / `desktop3060ti-codex-directive.sh` / `notebook3060-codex-directive.sh` (Linux 3 노드): (a) Enter 5회 + sleep 0.3s 간격 + (b) `paste-buffer -p` 통일 둘 다 적용
- `mac-mini-codex-directive.sh` (macOS): (b) `paste-buffer -p` 만 통일, Enter 두 번 유지 (PASS 상태 보존)
- `mac-codex-directive.sh` (로컬 macOS tmux): 변경 없음 (PASS 상태 + 로컬이라 SSH/scp 함정 없음)

자연 검증 사이클 = 다음 codex-mesh-vote / brainstorm / 큰 directive (1KB+) 발사. PASS 시 closure 마킹.

### 후속 fix 검토 히스토리 (v3 적용 전 candidate 평가)

3 candidate 검토:

**(a) Enter 회수 늘리기 (브루트포스 v3)**: Linux ssh+tmux 3개 스크립트의 v2 Enter 두 번 → Enter 다섯 번 (sleep 0.3s 간격). 단순, 작은 본문에선 무해 (codex 가 빈 Enter 무시). 함정 = sleep 누적 1.2~1.5s, 작은 본문 발사 latency 증가.

**(b) paste-buffer -p 통일 (semantic fix)**: 양 OS tmux 가 지원하므로 4 노드 스크립트 모두 `paste-buffer -p` 로 통일. bracketed paste 종료 marker 가 명시 박혀 codex input 이 submit 가능 상태로 즉시 전이. Enter 두 번 유지. 함정 = paste-buffer -p 가 정말 모든 codex REPL 빌드에서 일관 동작하는지 추가 검증 필요.

**(c) capture-pane verify loop (가장 robust)**: 디렉티브 발사 후 매 0.5s 마다 capture-pane → input box 가 비었으면 break, 아니면 Enter 추가 발사. 최대 10회 반복. 함정 = capture-pane 비교 로직 복잡도, false positive 가능성 (codex 가 prompt placeholder 가 빈 input 으로 표시되는지 등).

추천 = (a) + (b) 동시 적용. (b) 가 root cause fix 이지만 검증 안 된 상태이므로 (a) 의 안전벨트로 둠. (c) 는 v4 후보로 보류 (codex prompt UI 안정성 검증 후).

### 자연 검증

이 v3 패치 후 codex-mesh-vote / brainstorm / 큰 directive 발사가 자연 검증 사이클. 다음 1~2번 발사 모두 silent submit 실패 없이 PASS 시 closure 마킹.

## 예방 (Forcing function)

1. **스크립트 변경 시 OS pair test** — codex-directive 류 cross-device 스크립트는 macOS + Linux 양쪽에서 (a) 짧은 본문 (`/clear` 7B) (b) 큰 본문 (2KB+) 두 케이스 모두 자연 검증 후 merge. 이번 v2 fix 박을 때 작은 본문만 검증해서 함정 놓침.
2. **capture-pane verify hook 후보** — fan-out 스크립트가 자동으로 N초 후 input box 비었는지 검증, stale 면 텔레그램 warning. background hook 으로 박을 수 있음. v4 검토.
3. **5노드 tmux 버전 monitoring** — tmux 3.4 / 3.6a 혼재 자체가 이번 함정 원인. tmux 업그레이드 자체는 노드 운영 변경이라 형님 ack 필요 — 본진 자율 X. 다음 노드 셋업 사이클에 tmux 3.6+ 통일 검토.

## 재발 이력

(이번이 첫 surface — 다만 carry #1 v2 fix 박힌 시점 이후 큰 본문 발사가 처음 자연 검증 진행. 사용자 ack 시점이 root cause 만남)

## 관련 링크

- 디렉티브 스크립트: `~/claude-automations/scripts/wsl-codex-directive.sh` (line 73-74 v2 fix), 동일 패턴 `desktop3060ti-codex-directive.sh` / `notebook3060-codex-directive.sh` / `mac-mini-codex-directive.sh`
- carry #1 v2 fix 박은 commit: `~/.claude/projects/-Users-user/sessions/` 의 직전 사이클 핸드오프 (commit hash 미박제 — handoff 텍스트 only)
- mesh-vote 본 사이클: `~/tmp/codex-mesh-vote/1779809294/` (5 result + 5 vote 박혀있음)
- 관련 메모리: [[../projects/-Users-user/memory/project_5node_codex_baseline]] (5노드 codex CLI 2.1.150 통일)
- 발견 텔레그램 메시지: 2026-05-27 00:31 KST "엔터 두번 누른거 맞냐" + 00:31 KST "맥은 잘 들어오는거같은데 우분투는 왜 문제일까?" + 00:32 KST "이거 스킬에 넣었던거같은데 왜 엔터 안눌렀는지 알아보고 이슈박아줘"
