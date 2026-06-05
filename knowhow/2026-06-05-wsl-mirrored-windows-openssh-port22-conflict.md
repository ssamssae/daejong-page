---
title: "WSL mirrored 전환 후 SSH 가 끊길 때 — Windows OpenSSH 가 :22 를 선점하는 충돌"
tags: [wsl, mirrored, networking, openssh, sshd, port-22, systemd, socket-activation, windows]
date: 2026-06-05
---

# WSL mirrored 전환 후 SSH 가 끊길 때 — Windows OpenSSH 가 :22 를 선점하는 충돌

WSL2 를 `networkingMode=mirrored` 로 바꾸고 `wsl --shutdown` 으로 적용한 뒤, WSL 안의 sshd 가 안 떠서 `ssh <node>` 가 `Connection refused` 가 되는 경우가 있다. WSL 은 멀쩡히 부팅됐고(Tailscale active, ping 정상) 포트 22 만 막힌다. 원인은 mirrored 모드의 네트워크 네임스페이스 공유 + 호스트의 Windows OpenSSH 다.

## 증상

```
ssh <node>            → Connection refused   (timeout 아님 = 호스트는 살아있음)
systemctl is-system-running   → degraded
systemctl status ssh.socket   → failed (Result: resources)
journalctl -u ssh.socket      → Failed to create listening socket (0.0.0.0:22): Address already in use
```

`refused` 와 `timeout` 을 구분하는 게 첫 단서다. timeout 이면 네트워크/Tailscale 문제, **refused 면 호스트는 닿는데 그 포트에 listener 가 없는 것** — 여기선 WSL sshd 가 바인딩에 실패한 상태다.

## 근본 원인 — mirrored 단일 네임스페이스 + Windows OpenSSH

Ubuntu 24.04 의 ssh 는 **socket-activated** 다(`ssh.service` 가 `ssh.socket` 에 의해 트리거). 그리고 `wsl --shutdown` 후에도 호스트 Windows 에 OpenSSH Server(sshd) 가 AUTO_START 로 돌고 있으면 그게 이미 `0.0.0.0:22` 를 잡고 있다.

- **NAT 모드(기본)**: WSL 과 Windows 가 별도 네트워크 스택 → 둘 다 각자 :22 를 가질 수 있어 공존.
- **mirrored 모드**: WSL 이 Windows 네트워크 네임스페이스를 공유 → :22 는 하나뿐. 먼저 잡은 Windows sshd 가 이기고, WSL `ssh.socket` 은 `Address already in use` 로 실패 → `ssh.service` 까지 dependency 실패.

즉 mirrored 전환 자체가 sshd 를 죽인 게 아니라, **mirrored 가 그동안 숨어 있던 Windows OpenSSH 와의 :22 충돌을 드러낸 것**이다. Windows OpenSSH 가 아예 없는 노드는 이 문제가 안 생긴다(그래서 같은 전환을 해도 어떤 노드는 무사고).

## 해결 — :22 를 WSL 에게 넘기기

호스트 Windows 에서 **관리자 권한 PowerShell** 로 Windows OpenSSH 를 끄고 disable 한 뒤, WSL ssh.socket 을 다시 띄운다(원격 SSH 세션은 보통 비-elevated 라 직접 못 끈다 — 호스트 손이 필요).

```powershell
Stop-Service sshd
Set-Service sshd -StartupType Disabled
wsl -d Ubuntu -u root -e bash -lc "systemctl reset-failed ssh.socket ssh.service; systemctl start ssh.socket; ss -tln | grep :22"
```

끝에 `LISTEN 0 ... 0.0.0.0:22` 가 보이면 WSL sshd 가 :22 를 잡은 것. 되돌리려면 `Set-Service sshd -StartupType Automatic; Start-Service sshd` (가역).

## WSL sshd 가 dark 일 때의 임시 진단 경로

mirrored 모드의 의외의 이점: WSL ssh 가 막혀도 **호스트 Windows 의 OpenSSH 로 들어가면** 거기서 `wsl -d Ubuntu -e bash -lc "..."` 로 WSL 안을 다 들여다보고 고칠 수 있다. 노드가 완전히 dark 가 아니라 "WSL :22 만 막힌" 상태라, 이 경로로 진단·복구를 호스트 손 한 번 없이 끌고 갈 수 있다(cmd 라 `grep`/`timeout`/`bash` 미인식 → `wsl -e` 경유하거나 `/mnt/c/Windows/System32/...` 풀패스).

## 재발 방지 — 전환 전에 미리 점검

다른 노드를 mirrored 로 바꾸기 **전에** 호스트에 Windows OpenSSH 가 떠 있는지 먼저 본다.

```
tasklist | findstr /i sshd        # 있으면 shutdown 전에 stop + disable 예약
```

있으면 `wsl --shutdown` 전에 미리 Windows sshd 를 disable 해 두면 전환 후 dark→복구 삽질이 0 이 된다.

## 한 줄 요약

mirrored 전환 후 WSL sshd refused = 호스트 Windows OpenSSH 가 :22 선점. 해결 = Windows sshd stop+disable(관리자), 그러면 WSL ssh.socket 이 :22 를 잡는다. 전환 전 `tasklist | findstr sshd` 로 미리 확인하면 재발 0.
