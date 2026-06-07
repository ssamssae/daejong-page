---
category: 멀티기기/자동화
tags: [self-orchestration, ssh, tmux, telegram-bot, voice, routing, self-target, stale-premise]
first_discovered: 2026-06-07
related_issues:
  - 2026-06-07-araseo-voice-home-self-target-dispatch
---

# self-orchestration에서 "자기 자신(home)" 타겟은 SSH·텔레그램 왕복이 불필요 — 로컬 tmux inject가 정석

- **첫 발견:** 2026-06-07 (Siri 음성비서 araseo-voice 구현 중)
- **재사용 영역:** 멀티노드 디스패처, 음성/봇 명령 라우팅, "노드→허브" 스크립트를 허브 자신에서 부를 때

## 한 줄 요약

여러 기기를 오케스트레이션하는 디스패처에서 **"허브(본진) 자신"을 타겟으로 라우팅할 때, 노드→허브용 SSH 주입 스크립트를 그대로 재사용하면 안 된다.** 그 스크립트는 본진 자신에서 실행되면 self-target 가드(hostname 감지)로 `rc=4` abort 한다(본진→본진 SSH는 publickey 거부 = 잘못된 진단 함정). 정답은 **home 타겟만 분기해서 SSH 없이 로컬에서 직접 tmux inject**(`load-buffer`/`paste-buffer`/`send-keys`) 하는 것. 더 일반화하면 — **자기 자신에게 보내는 명령은 네트워크(텔레그램/SSH)를 한 바퀴 돌 이유가 없다.**

## 차단 시그니처

```
# Siri 음성 "에어컨 꺼줘" → home(@MyClaude) 라우팅 → 본진에서 mac-directive.sh 호출
dispatch home rc=4 ❌ self-target 가드: 이미 본진에서 호출됨(USERui-MacBookPro.local).
본진→본진 SSH는 publickey 거부 = 잘못된 진단 함정.
```

핵심: `*-directive.sh` 류는 "**노드 → 본진(또는 본진 → 노드) SSH + tmux 주입**"용이다. 그 안에는 일부러 self-target 가드가 박혀 있어(예방), 발신지=수신지가 되면 멈춘다. home 라우팅이 이 스크립트를 타면 100% 막힌다.

## 해결

home 타겟만 별도 함수로 분기. 노드→본진 스크립트가 *SSH 이후* 실제로 하는 일은 결국 `tmux load-buffer -t claude <file> && paste-buffer -t claude && send-keys -t claude Enter` 다. home은 그걸 **SSH 한 홉만 빼고 로컬에서 직접** 실행해 본진 claude 세션에 명령을 꽂으면 된다. 셋업0·인증0·오프라인 무관.

```python
def dispatch_home_local(message: str) -> str:
    tmux = "/opt/homebrew/bin/tmux"
    session = os.environ.get("ARASEO_HOME_TMUX", "claude")
    if subprocess.run([tmux, "has-session", "-t", session]).returncode != 0:
        return f"home inject 실패: tmux '{session}' 없음"
    # load-buffer → paste-buffer → send-keys Enter (SSH 없음)
```

## 왜 다른 경로(텔레그램 봇)는 답이 아니었나

후보로 "유저봇(Telethon)이 봇 챗에 명령을 보내 본진 세션이 inbound로 받게" 하는 안도 있었다. 봇은 **자기가 send한 메시지를 inbound update로 다시 못 받기** 때문에, 봇 토큰으로 직접 보내면 채팅엔 떠도 세션이 실행을 안 하는 silent no-op이 난다 → 그래서 "사람 계정(유저봇)이 봇에 보내야" 한다는 정석이 나온다. **하지만 home은 로컬이다.** 그 inbound 문제 자체가 없는 곳이라, 텔레그램을 거칠 이유가 처음부터 없었다. (a)가 푸는 문제가 home엔 부재 → 로컬 tmux inject가 더 견고하고 손이 안 든다.

## 곁다리 교훈 — "코드 존재 ≠ 런타임 동작"

투표 2회가 Telethon을 "이미 쓰는 검증된 경로"라 가정하고 골랐으나, 구현 직전 실측에서 Telethon이 **완전 미설정**(API키 미발급, 유저봇 세션 파일 부재, 데몬 한번도 성공실행 안됨)이었다. 코드가 repo에 있다고 동작하는 게 아니다. **큰/비가역 작업은 착수 전 실측**(파일 존재·인증 상태·실행 이력)으로 stale 전제 위에 코드 쌓는 걸 차단하라.
