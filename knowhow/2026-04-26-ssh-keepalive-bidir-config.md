---
category: 환경 설정
tags: [ssh, keepalive, mac, wsl, sleep, stale-socket, terminal]
related_issues:
  - 2026-04-26-mac-ssh-stale-socket-overnight
---

# 양방향 SSH config 에 ServerAliveInterval 박기 = stale 소켓 차단 영구 fix

- **첫 발견:** 2026-04-26 (Mac sleep 후 Windows Terminal "Mac" 탭이 stale 소켓 들고 묶임)
- **재사용 영역:** Mac ↔ WSL ↔ Mac mini ↔ 3060 노드 SSH 워크플로우 전반. 새 기기 추가 시 동일 패턴 적용.

## 한 줄 요약

서버 측 sleep / 네트워크 끊김 시 클라이언트 측에는 stale 소켓이 살아있는 듯 남아 키 입력에 반응 안 한다. **양쪽 `~/.ssh/config` 에 `ServerAliveInterval 60` + `ServerAliveCountMax 3` 박으면 1분마다 keepalive, 3분 안에 죽은 연결 자동 종료.** 한 번 박으면 영구 fix.

## 표준 config (양쪽 동일 박기)

```
# ~/.ssh/config (perms 600)

Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    TCPKeepAlive yes

Host mac
    HostName user-macbookpro-1
    User user

Host mac-mini
    HostName mac-mini
    User user

Host wsl desktop
    HostName desktop-i4tr99i-1
    User ssamssae
```

검증:
```bash
chmod 600 ~/.ssh/config
ssh -G mac | grep -i alive   # ServerAliveInterval 60 확인
ssh mac 'echo OK'             # 풀그린 PASS
ssh wsl 'echo OK'             # 풀그린 PASS
```

## 핵심 룰

1. **`Host *` 글로벌 블록에 keepalive 박는 게 0차 reflex** — 잊고 풀네임만 쓰는 다른 명령에서도 자동 적용.
2. **양쪽 다 박아야 안전** — Mac→WSL 측만 박으면 WSL→Mac 흐름은 여전히 stale 가능.
3. **단축어 alias** (`ssh mac`, `ssh wsl`, `ssh mac-mini`) 로 SSH 사용 통일 — 메모리 `reference_ssh_keepalive_bidir.md` 와 같이 박힘.
4. **신규 기기 추가 시** = config 파일에 Host 블록 1개 추가 + perms 600 확인 + ssh -G 로 keepalive 상속 확인. 매뉴얼 명시 룰.

## 적용 후보

- 모든 신규 SSH 호스트 (Tailscale 노드 추가, GitHub Codespaces 등)
- macOS 메이저 업그레이드 후 ~/.ssh/config 회귀 점검
- LaunchAgent / launchd 로 SSH 잡 자동화 시 사전 keepalive 검증

## Forcing Function

- 메모리 `reference_ssh_keepalive_bidir.md` 에 양쪽 config 상태 영구 기록.
- 새 기기 추가 회로에 keepalive config 박기 단계를 명문화 (이번 3060 두 대 추가 시점에 동일 패턴 적용).
- SSH stale 사고 재발 시 0차 점검 = `ssh -G <host> | grep alive` 로 keepalive 상속 확인.

## 함정

- `ServerAliveInterval` 너무 짧으면 (예: 5초) 모바일 네트워크에서 false positive 로 끊길 수 있음 → 60 이 보통 안전선.
- 일부 NAT/방화벽이 60초 idle 도 끊어버림 → 30 으로 낮춰야 할 수도.
- `~/.ssh/config` perms 600 아니면 OpenSSH 가 무시 → 적용 안 됨. chmod 필수.

## 관련 이슈 (포스트모템)

- `issues/2026-04-26-mac-ssh-stale-socket-overnight.md` (이전됨)
