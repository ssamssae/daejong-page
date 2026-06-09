# 맥미니 tmux liveness false-negative — healthy 노드를 votes+위임에서 제외

- **일시**: 2026-05-30 ~09:30~10:00 KST
- **노드**: 🍎 본진 (진단 주체) / 🏭 맥미니 (피해 노드)
- **증상**: mesh-vote + codex-mesh-vote 양 vote 와 자동화 하드닝 노드 위임에서 본진이 맥미니를 "세션 꺼짐"으로 판정해 제외. 실제로는 맥미니 claude·codex tmux 세션 다 살아있고 codex REPL idle 상태였음.

## 근본 원인

본진이 노드 생존확인을 `ssh 맥미니노드 'tmux has-session -t codex'` / `tmux ls` 처럼 **bare `tmux`** 로 수행. 비대화형 ssh 는 `~/.zshrc`/`~/.zprofile` 을 안 읽어 macOS(M1)의 `/opt/homebrew/bin` 이 PATH 에 없음 → `tmux: command not found` → command-not-found 를 "세션 없음" 으로 오판.

- Linux 노드(🪟🖥💻)는 tmux 가 `/usr/bin/tmux` (비대화형에도 PATH) 라 우연히 동작 → macOS 노드만 함정.
- choso API 기반 노드감지(work-steal-scan IDLE 목록)는 맥미니 정상 인식 → 버그는 **tmux liveness 체크 패턴 한정**.
- 풀패스 `/opt/homebrew/bin/tmux ls` 로 재확인하니 claude·codex 세션 다 보임.

기존 메모리 `feedback_noninteractive_ssh_skips_bashrc` (2026-05-20, WSL cc 오진) 의 교훈을 liveness 체크에 적용 안 한 본진 실수. 아니키 msg28344 "맥미니 세션 안 껴져있어 뭐지" → msg28345 "아까도 못잡더만 착각했어, 조치 필요".

## 영향

- 양 vote(mesh-vote SID 1780101187 / codex-mesh-vote SID 1780100816) 가 4노드로 진행 (맥미니 제외). **결과 영향 없음** — 정족수(≥3) 충족 + 수렴 강해 맥미니 1표가 결론 안 바꿈. 재투표 불요.
- 자동화 하드닝 위임도 4노드 기준으로 분배 (실제 작업은 🪟+🖥 2노드라 맥미니 제외가 분배엔 무영향).

## 조치

1. 메모리 `feedback_node_liveness_full_tmux_path` 박음 — liveness 체크는 macOS 풀패스 tmux 분기 / 또는 `bash -ic`.
2. 자동화 하드닝 다음 라운드 항목으로 등록: mesh-vote·codex-mesh-vote·loop-fleet·codex-loop-fleet 전제조건 liveness 체크 예시를 노드 OS 별 tmux 풀패스로 분기 (tasks.md T-260530-04).

## 교훈

healthy 노드를 침묵으로 제외하기 전 풀패스 재확인 1회. command-not-found ≠ 세션 부재.

## 재발 이력

- 2026-06-07 ~10:46 KST: 본진이 advisor 와이어링 위임 대상 픽 중 `ssh 맥미니노드 'tmux has-session -t claude'` 로 맥미니를 "세션 부재"로 또 오판 → 솔로로 전환(빌드 자체는 무사고, synced repo). 맥미니 mac-report 실측("claude 세션 Jun 6 18:52 생성, 활성")이 정정. 비대화형 ssh PATH=`/opt/homebrew/opt/openjdk@17/.../bin:/usr/bin:/bin:/usr/sbin:/sbin` (homebrew 경로 없음) 실측 확인 — 같은 함정 3번째(2026-05-22·05-30·06-07). **기존 예방(메모리 룰 = "풀패스로 기억해서 쓰기")이 사람-기억 의존이라 또 깨짐 → 코드 forcing function 으로 승격.** 아니키 msg34241 "왜 꺼져있다 판단했는지 보고" + msg34244 "이슈박고 재발방지 아키텍처 만들어".

## 예방 (강화 — 2026-06-07, 코드 forcing function)

- **막을 코드/훅:** `~/claude-automations/scripts/node-session-check.sh` (commit 7da11a2)
  - 노드 세션 상태를 **3-상태** 로 반환: `RUNNING`(exit0) / `ABSENT`(exit1) / `UNREACHABLE`(exit3). **tmux 바이너리 부재·ssh 실패는 ABSENT 가 아니라 UNREACHABLE** — false-negative 를 구조적으로 차단(호출측이 UNREACHABLE 받으면 "꺼짐" 단정 금지).
  - 내부에서 `PATH=/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH` 강제 prepend → macOS(homebrew)·Linux 둘 다 tmux not-found 차단. `$PATH` 보존.
  - 회귀 테스트 `scripts/tests/test_node_session_check.sh` ALL PASS (ssh실패=UNREACHABLE / 미존재세션=ABSENT 분리 검증).
  - 사용법: `node-session-check.sh <ssh-alias|local> <session>`. 노드 생존확인 시 bare `tmux ... ||` 패턴 대신 이 헬퍼 경유가 표준.
- 메모리 `feedback_node_liveness_full_tmux_path`(2026-05-30) 는 룰 레벨 유지하되, 본 헬퍼가 "기억" 의존을 코드로 대체.
