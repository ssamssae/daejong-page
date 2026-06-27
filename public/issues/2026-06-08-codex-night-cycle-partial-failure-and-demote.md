# 2026-06-08 codex 야간 다이나믹 사이클 부분 실패 + codex 엔진 demote

## 증상
2026-06-08 새벽 codex 다이나믹(야간 work-stealing) 사이클이 5노드 중 **notebook(💻) 1대만** 살아 부분 실행. 본진(🍎) 01:52 보고: "codex 세션이 notebook3060 1대만 살아있고 라이덴·데스크탑은 unreachable, 맥미니는 세션 없음." 아니키 아침 발화: "노트북 코덱스 켜놨는데 왜 접속못해 이슈박고 재발방지 아키텍처 설정해".

## 실측 (2026-06-08 08:1x KST, 맥미니에서)
- **notebook3060 (💻)**: SSH OK, codex tmux 세션 살아있음. 09분 전 T-260526-11 작업 완료 + mac-report 송신 후 idle. context 45% / weekly 75% 남음 → **정상**. 아니키 "노트북 접속못해" 전제는 실측과 충돌 — 접속 실패는 notebook 이 아니라 아래 노드들.
- **라이덴(🪟, wsl)**: `ssh wsl` → `connect to host desktop-i4tr99i-1 port 22: Operation timed out` (unreachable).
- **데스크탑(🖥, desktop3060ti)**: `ssh desktop3060ti` → `port 22: Operation timed out` (unreachable).
- **맥미니(🏭) codex**: launchctl `com.daejong.codex-night-cycle` LastExitStatus=0 (게이트 통과 시 정상 동작), 단 codex 세션 자체는 보고상 없었음.

## 실제 root cause
codex fan-out 의 전제인 **WSL 노드(라이덴·데스크탑) SSH reachability 가 야간에 깨짐**. "5노드 24/7" 가정과 달리 WSL2 노드는 호스트 sleep / sshd 미기동 / WSL 종료로 unreachable 가능. codex-night-cycle 은 reachability preflight 없이 닿는 노드만으로 silent 부분 실행 → "5노드 다이나믹"이 실제론 1노드로 쪼그라들어도 경고 없음.

## 조치 (적용 완료)
아니키 동일 발화로 codex 요금제 29000원 다운 + codex 전면 중단 결정 → 다이나믹 엔진을 flaky codex fan-out 에서 claude 로 이전(blast radius 축소):
- `~/.choso/work-stealing.on` OFF (`worker-toggle.sh macmini-codex off`) → codex 야간 사이클 + macmini-codex 워커 동시 정지(게이트 no-op, launchd bootout 불필요).
- `~/.choso/manual-worker.backend` = `codex` → `claude`.
- 메모리 [[../../projects/-/memory/feedback_codex_demote_claude_default]], CLAUDE.md codex EOL 노트 확정.

## 재발방지 아키텍처 (제안 — GO 대기)
codex-mesh-vote 는 잔존하므로 노드 codex reachability 문제는 완전 소멸 X. 다음 중 택일/조합 제안:
1. **Reachability preflight gate** — 다이나믹/mesh-vote fan-out 발사 전 전 노드 SSH 1회 probe, 살아있는 노드 수 < 임계치면 silent 진행 대신 아니키 폰 1통 경고 + abort. (silent 부분실패 → fail-loud)
2. **WSL sshd autostart 보강** — 라이덴·데스크탑 Windows 부팅 시 WSL + sshd 자동 기동(작업 스케줄러), keep-alive. (근본이지만 WSL 노드 접근 필요 → 노드 복귀 후)
3. codex 의존 최소화는 이미 진행(다이나믹 claude 이전) — mesh-vote 만 codex reachability 전제.

→ 1번(preflight gate)은 신규 스크립트 = Preflight Evidence Gate 대상이라 VERIFY/GO 후 구현 예정.
