# launchd plist 에서 tmux 호출 — socket path 명시 필수

launchd 가 실행하는 셸/스크립트는 인터랙티브 셸이 아니라서 `TMUX` 환경변수가 inherit 되지 않는다. `tmux ls` / `tmux attach` 류를 명시적 socket path 없이 호출하면 새 서버 spawn 으로 떨어져서 기존 세션을 못 본다.

## 핵심

launchd → 셸 → tmux 호출 사이에서 TMUX env var 가 끊긴다. 인터랙티브 셸에서는 자동으로 default socket 을 찾지만, launchd 컨텍스트에서는 `-S /private/tmp/tmux-<uid>/default` 처럼 socket path 를 명시해야 기존 세션과 같은 서버에 붙는다.

## 증상

launchd plist 가 ProgramArguments 로 셸 스크립트를 호출:

```xml
<key>ProgramArguments</key>
<array>
  <string>/bin/bash</string>
  <string>-c</string>
  <string>tmux send-keys -t claude:0 "/clear" Enter</string>
</array>
```

이렇게만 두면 `tmux: no current client` 또는 빈 세션 리스트가 떨어진다. 기존 'claude' 세션이 살아있어도 launchd 의 tmux 가 다른 서버로 fork 했기 때문.

## 해결

```bash
# 1. 현재 사용자의 default socket 경로 조회
echo "/private/tmp/tmux-$(id -u)/default"
# 예: /private/tmp/tmux-501/default

# 2. plist 또는 launchd 가 호출하는 스크립트에서 -S 명시
TX=( tmux -S /private/tmp/tmux-501/default )
"${TX[@]}" send-keys -t claude:0 "/clear" Enter
"${TX[@]}" list-sessions
```

bash array 로 정의해두면 plist 안과 셸 스크립트 양쪽에서 동일하게 사용. UID 가 501 이 아니면 `/private/tmp/tmux-$(id -u)/default` 식으로 동적 결정.

## 검증

```bash
# 인터랙티브 셸에서:
tmux ls
# claude: 1 windows ...

# launchd-같은 환경(non-interactive) 시뮬레이션:
env -i /bin/bash -c 'tmux ls'
# error connecting to /private/tmp/tmux-501/default (No such file or directory)
# 또는 빈 출력

env -i /bin/bash -c 'tmux -S /private/tmp/tmux-501/default ls'
# claude: 1 windows ...
# → 명시하면 보임
```

## 다시 꺼내쓰는 법

- launchd plist 작성 시 tmux 호출 라인 있으면 무조건 `-S <socket>` 명시
- 셸 스크립트에서도 launchd 가 호출할 가능성이 있으면 `TX=( tmux -S ... )` array 디폴트
- 디버깅 시 `env -i bash -c '<command>'` 로 launchd-like 환경 재현해서 검증
