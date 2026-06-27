# codex-telegram-bridge stale-pid 자기영속 크래시 루프

- 날짜: 2026-06-26 (KST)
- 노드: 🪟 라이덴 (<desktop-host>, WSL) — 단, 동일 코드라 전 노드 잠재 취약
- 증상: 라이덴 코덱스 텔레그램 봇(MyCodex2 / mycodex2_ssamssae_bot)이 메시지에 응답 안 함
- 영향: codex 노드 텔레그램 입출력 불능, 봇 pending 업데이트 누적 알림

## 증상
아니키가 코덱스 봇에 "ㅎㅇ" 등을 보내도 무응답. `codex-bridge.service` 는 `active (running)` 으로 보이는데 실제 동작 안 함.

## 진단 (read-only)
- `journalctl --user -u codex-bridge.service`: 5초마다 `created session ... → session gone; exiting for service restart → status=1/FAILURE → Scheduled restart` 반복. **NRestarts 카운터 1320회**.
- Telegram API 정상: getMe ok=true (username mycodex2_ssamssae_bot), getWebhookInfo ok=true, pending=3, webhook url="" → 토큰/웹훅 문제 아님.
- ExecStart=`telegram-bridge-tmux-start.sh wsl` 가 tmux 세션 `telegram-bridge`(socket 동명) 안에서 러너 `codex-repl-bridge-run.sh wsl` 를 도는데, 러너가 즉시 종료 → tmux 세션 사망 → 서비스 재시작.
- 러너 직접 실행 시 첫 에러: **`runtime error: bridge already running pid=416`**.
- `ps -p 416` → 빈 결과 (죽은 pid). pid 파일 `~/.claude/state/codex-repl-bridge-wsl.pid` 내용 = `416`.

## 근본 원인
`codex-repl-telegram-bridge.py` 의 `acquire_lock()` 이 **naive pid-file + `process_alive()`(os.kill(pid,0))** 방식이었음:
```python
if existing.isdigit() and int(existing) != os.getpid() and process_alive(int(existing)):
    raise RuntimeError(f"bridge already running pid={existing}")
```
원래 한 번 죽은 브릿지가 stale pid 416 을 남겼고, 서비스가 5초마다 프로세스를 대량 spawn 하는 tight restart 루프에 들어가자 **죽은 pid 416 이 루프 자신의 spawn 프로세스로 PID 재사용**되어 `process_alive(416)` 이 간헐적으로 True → 매번 "already running" 으로 자살 → 루프가 스스로를 영속화. 자매 브릿지인 `claude-telegram-bridge.py` 는 `fcntl.flock` 을 써서 동일 증상이 없었음(차이 지점).

## 임시 복구 (2026-06-26 적용)
1. `~/.claude/state/codex-repl-bridge-wsl.pid` 백업 후 제거 (가역)
2. `systemctl --user reset-failed codex-bridge.service && systemctl --user restart codex-bridge.service`
→ active/running, NRestarts=0, 브릿지 python 프로세스 생존 확인.

## 재발방지 (영구)
`codex-repl-telegram-bridge.py` `acquire_lock()/release_lock()` 를 `claude-telegram-bridge.py` 와 동일한 **`fcntl.flock(LOCK_EX|LOCK_NB)`** 방식으로 전환.
- flock 은 프로세스 사망 시 커널이 자동 해제 → stale pid 가 애초에 생기지 않고, PID 재사용에 면역.
- 가드 주석(⚠️ 제거 금지) + 본 이슈 경로 박음.
- 5노드 전파(git pull + 각 노드 codex-bridge 재시작) + GitHub 릴리즈.

## 빠른 복구 커맨드 (재발 시)
```
rm -f ~/.claude/state/codex-repl-bridge-<node>.pid
systemctl --user reset-failed codex-bridge.service
systemctl --user restart codex-bridge.service
```

## 교훈
- 단일 인스턴스 락은 pid-file+os.kill 보다 **flock** 이 정석(자동 해제·PID 재사용 면역).
- tight restart 루프는 PID 재사용으로 stale-pid 체크를 깨뜨려 자기영속할 수 있음.
- "service active" ≠ "정상 동작" — NRestarts/로그 반복 패턴 확인 필요.
