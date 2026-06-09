# autopilot 노드 liveness false-negative — 맥미니가 멀쩡한데 "꺼짐"으로 야간 미가동

- **날짜**: 2026-05-22
- **노드**: 🍎 본진 (탐지 로직) / 🏭 맥미니 (피해 노드)
- **분류**: 자동화 버그 (cross-device liveness 체크)
- **심각도**: 중 — 멀쩡한 노드 1대를 6시간 야간 오토에서 통째로 미가동

## 증상

2026-05-22 새벽 야간 autopilot 가동 시, 본진이 노드 생존을 확인하다 "🏭 맥미니 챗봇 세션 꺼져있어 야간 배정 skip (직전 클리어 후 미재기동)" 으로 판정 → 맥미니를 밤새 한 번도 안 굴림. 아침에 맥미니가 직접 false-negative 보고: claude 챗봇 PID 1117 이 5/20 18:40 부터 1일 13시간 무중단 가동 중이었음(크래시·리부트 0). 즉 맥미니는 멀쩡히 살아있었다.

## 근본 원인

본진이 야간 모니터링에서 노드 생존을 **즉흥 명령**으로 체크:
```bash
ssh mac-mini 'tmux has-session -t claude 2>/dev/null && echo ALIVE || echo NONE'
```
- 비대화형 ssh 는 `.zshrc`/`.bashrc` 를 안 읽어 PATH 에 homebrew(`/opt/homebrew/bin`)가 없다.
- 맥미니는 tmux 가 `/opt/homebrew/bin/tmux` 에만 있음 → bare `tmux` = **command not found**.
- `2>/dev/null` 가 그 에러를 삼키고, command-not-found 의 비정상 종료코드가 `&& ... || echo NONE` 의 `||` 로 떨어짐 → **살아있는 노드가 NONE(죽음)으로 오판**.
- WSL/데스크탑/노트북은 tmux 가 `/usr/bin/tmux`(기본 PATH)라 통과 → 맥미니만 걸림.

핵심 함정: `cmd 2>/dev/null && A || B` 패턴은 **"명령이 없음"과 "조건이 거짓"을 구분 못 한다**. command-not-found 가 조용히 B(NONE)로 떨어진다.

기존에 같은 root cause 메모리(`feedback_noninteractive_ssh_skips_bashrc`, 2026-05-20 WSL cc 오진)가 있었는데도, liveness 체크가 helper 로 codify 안 돼 있어 매번 즉흥 bare-tmux 로 쳐서 재발. (참고: `mac-mini-directive.sh` 는 이미 `/opt/homebrew/bin/tmux` 풀패스를 쓰고 주석으로 이 함정을 경고하고 있었음 — 디렉티브 송신은 정상, liveness 체크만 누락.)

## 해결

1. **재사용 helper 신설**: `~/.claude/automations/scripts/node-alive.sh <node> [session]` — 노드별 tmux 절대경로(맥미니 `/opt/homebrew/bin/tmux`, 리눅스 `/usr/bin/tmux`)로 `has-session` 체크. reachability(ssh 실패=UNREACHABLE)와 세션 부재(NONE)를 구분, ALIVE/NONE/UNREACHABLE 한 줄 출력.
2. **autopilot SKILL.md §8 hard 룰 추가**: 노드 liveness 는 반드시 node-alive.sh 사용, 즉흥 bare-tmux ssh 체크 금지.
3. **메모리 갱신**: `feedback_noninteractive_ssh_skips_bashrc` 에 이 사례 추가 (2번째 재발 instance).

검증: 수정 후 4노드 체크 → wsl/desktop/notebook/**mac-mini 전부 ALIVE** (이전 맥미니만 NONE).

## 교훈

- 원격 노드의 도구 존재/세션 체크는 절대경로 또는 `bash -ic`(PATH 로드). bare 명령 + 비대화형 ssh 금지.
- `cmd 2>/dev/null && A || B` 는 command-not-found 를 "조건 거짓"으로 흡수하니, 존재 여부가 중요한 체크엔 쓰지 말 것.
- 같은 root cause 가 메모리에 있어도 **체크 경로가 codify 안 되면 재발**한다 → 반복되는 점검은 helper 스크립트로 박제.
