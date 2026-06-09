---
category: 인프라
tags: [ssh, tmux, liveness, false-negative, path, multi-node, homebrew, fleet]
first_discovered: 2026-05-22
related_issues:
  - 2026-05-30-macmini-tmux-liveness-false-negative
---

# 노드 세션 생존확인은 RUNNING/ABSENT/UNREACHABLE 3-상태로 — "못 찾음"을 "꺼짐"으로 단정하지 말 것

- **첫 발견:** 2026-05-22 (3회 재발: 05-22 · 05-30 · 06-07 끝에 코드로 박음)
- **재사용 영역:** 본진→노드 tmux/프로세스 생존확인, mesh-vote·loop-fleet 전제조건, 위임 대상 픽

## 한 줄 요약

`ssh <node> 'tmux has-session ...'` 처럼 **bare 명령**으로 노드 세션 생존을 확인하면, 비대화형 ssh 의 PATH 에 바이너리 경로(macOS 의 `/opt/homebrew/bin`)가 없어 `command not found` → 세션이 멀쩡히 살아있어도 "꺼짐"으로 **false-negative**. 정답은 상태를 **RUNNING / ABSENT / UNREACHABLE 3-상태**로 가르고, "바이너리 못 찾음 / ssh 실패"는 ABSENT(없음)가 아니라 **UNREACHABLE(판정 불가)**로 분리해 단정 자체를 막는 것.

## 차단 시그니처

```
# 본진이 노드를 "세션 꺼짐"으로 오판 → vote/위임에서 healthy 노드 제외
$ ssh <node> 'tmux has-session -t claude && echo RUNNING || echo ABSENT'
ABSENT          # ← 실제로는 RUNNING. tmux 가 not-found 라 || 분기가 발동
$ ssh <node> 'echo $PATH'
/usr/bin:/bin:/usr/sbin:/sbin      # /opt/homebrew/bin 없음 → tmux not-found
```

핵심 함정: **비대화형 ssh 는 `~/.zshrc`/`~/.zprofile` 을 안 읽는다.** macOS(homebrew)에서만 터지고 Linux 노드는 `/usr/bin/tmux`가 기본 PATH 라 우연히 동작 → 함정을 못 느끼다 macOS 노드에서만 반복.

## 왜 룰만으로는 안 막혔나

2회까지는 "macOS 노드는 풀패스 `/opt/homebrew/bin/tmux` 써라"를 메모리 룰로만 박았다. 하지만 이건 **사람이 매번 기억해서 지켜야 하는 룰** — 3번째 또 깨졌다. 약한 forcing function 의 전형. 해결은 코드로 강제하는 것.

## 정답 — 3-상태 헬퍼

```bash
#!/usr/bin/env bash
# node-session-check.sh <ssh-alias|local> <session>
# RUNNING(0) / ABSENT(1) / UNREACHABLE(3)
set -uo pipefail
node="${1:?}"; session="${2:?}"
SAFE_PATH='/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin'   # macOS+Linux 모두 커버

run() {  # PATH 강제 prepend → not-found(false-negative) 차단. $PATH 보존.
  local cmd="export PATH=$SAFE_PATH:\$PATH; $1"
  if [[ "$node" == local ]]; then bash -c "$cmd"
  else ssh -o ConnectTimeout=8 -o BatchMode=yes "$node" "$cmd"; fi
}

# 1) tmux 도달성 먼저 — 실패 = 바이너리 부재/ssh 불가 → UNREACHABLE (절대 ABSENT X)
run 'command -v tmux >/dev/null 2>&1' || { echo UNREACHABLE; exit 3; }

# 2) 도달 OK → has-session 결과는 신뢰 가능
if run "tmux has-session -t $session 2>/dev/null"; then echo RUNNING; exit 0
else echo ABSENT; exit 1; fi
```

두 가지가 핵심이다: (a) **PATH 를 명령 앞에 강제로 박아** 비대화형 셸 PATH 미로딩 함정을 원천 차단, (b) **도달성과 세션유무를 2단계로 분리** — tmux 자체를 못 부르면 "세션 없음"이 아니라 "판정 불가"다.

## 반패턴 (피하기)

```bash
# ❌ bare tmux + || fallback — not-found 가 "없음"으로 둔갑
ssh node 'tmux has-session -t s && echo UP || echo DOWN'

# ❌ "풀패스 쓰자"를 사람 기억에만 의존 (3번 깨진 룰)

# ❌ 빈 출력(tmux ls)을 "세션 0개"로 해석 — 사실은 tmux 미도달
```

## Forcing Function

- 노드 생존확인은 `node-session-check.sh` 경유가 표준. bare `tmux ... ||` 직접 작성 금지.
- 호출측은 **UNREACHABLE 을 받으면 상태 단정 금지** — "확인 불가"로 분리 보고 후 재측정.
- 회귀 테스트로 "ssh 실패=UNREACHABLE / 미존재 세션=ABSENT" 분리를 고정.

## 일반화

`command not found` / 빈 출력 / 타임아웃은 **"부재"의 증거가 아니라 "측정 실패"의 증거**일 수 있다. 원격 상태를 negative 로 단정하기 전, 측정 채널 자체가 살아있는지(바이너리 도달·연결 성공)를 먼저 확인하는 2단 판정은 ssh·API·헬스체크 전반에 적용된다.
