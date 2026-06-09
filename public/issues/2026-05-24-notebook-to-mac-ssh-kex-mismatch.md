# 2026-05-24 노트북→본진 SSH KEX/HostKey mismatch 30초 silent hang

## 한 줄 요약

노트북(💻 OpenSSH 9.6p1) → 본진(🍎 OpenSSH 10.2p1) SSH 가 banner exchange 후 KEX init 단계에서 본진 sshd 가 **응답도 close 도 안 한 채 silent drop** → client 30초 후 keepalive timeout. `KexAlgorithms curve25519-sha256` + `HostKeyAlgorithms ssh-ed25519` 두 줄 narrow 박으면 PASS. 노트북만 발현 (WSL/데스크탑은 narrow 없이도 PASS).

## 증상 (형님 발화 → 본진 인지)

- 핸드오프 in-flight 4번: "노트북 → 본진 SSH publickey reset 별 진단 사이클" (publickey 단계로 추정했으나 실제는 더 앞 KEX 단계)
- 2026-05-24 05:00 KST 형님: "노트북에서 디렉티브 쏘는데 도착안하는데 원인 찾아줘"
- 노트북측 `bash ~/claude-automations/scripts/mac-directive.sh "..."` → `error: Mac (mac) unreachable` (`ssh -o ConnectTimeout=5 mac true` 가 5s 안에 fail)
- 본진→노트북 SSH 는 정상 (Tailscale ping 3ms, ssh ControlMaster=no PASS, nc 22 PASS)
- 노트북→본진 한 방향만 막힘

## 진단 로그 (결정적)

노트북에서 `ssh -vvv -o ConnectTimeout=10 -o BatchMode=yes 100.74.85.37 true` →

```
debug1: Connection established.                       ← TCP connect PASS
debug1: identity file /home/user/.ssh/id_ed25519 type 3
debug1: Local version string SSH-2.0-OpenSSH_9.6p1 Ubuntu-3ubuntu13.16
debug1: Remote protocol version 2.0, remote software version OpenSSH_10.2   ← banner exchange PASS
debug1: Authenticating to 100.74.85.37:22 as 'user'
debug1: load_hostkeys: fopen /home/user/.ssh/known_hosts2: No such file
debug3: order_hostkeyalgs: no algorithms matched; accept original          ← known_hosts 비어있어서 default list send
debug3: send packet: type 20
debug1: SSH2_MSG_KEXINIT sent                                              ← KEX init 송신
Timeout, server desktop-4mnj1c0-1 not responding.                          ← 30s 후 client keepalive timeout
```

= 본진 sshd 가 노트북 client 의 KEX init 받은 후 **응답 패킷도 close 도 보내지 않음** = silent drop.

추가 환경 확인:
- 본진 macOS Application Firewall: `globalstate=0 (disabled)`, `stealthenabled=off`, sshd `incoming permitted`
- 본진 Tailscale SSH: `RunSSH: false` (normal sshd 사용, Tailscale 가로채기 X)
- 본진 sshd_config: KexAlgorithms/Ciphers/MACs/AllowUsers 등 명시 라인 0 (전부 디폴트)
- 노트북 ~/.ssh/known_hosts: 본진 host key entry **0** (다른 노드는 entry 있음)
- 노트북 ssh client OpenSSH 9.6p1 / 본진 sshd OpenSSH 10.2p1 LibreSSL 3.3.6

KEX narrow 시도 — `ssh -o KexAlgorithms=curve25519-sha256 -o HostKeyAlgorithms=ssh-ed25519 100.74.85.37 true` →
```
debug3: receive packet: type 20
debug1: SSH2_MSG_KEXINIT received       ← 본진이 응답!
debug2: local client KEXINIT proposal
...
```
정상 진행. KEX/HostKey algorithm 좁히면 본진 sshd 가 즉시 응답.

## 근본 원인 가설

OpenSSH 10.x (본진) sshd 가 KEX init 받을 때, client 가 보낸 algorithm list 중 **어떤 deprecated/legacy algorithm 의 처리에서 silent drop** (close 메시지도 안 보내고 응답 packet 자체 미발신). 정확히 어떤 algorithm 인지는 narrow down 하지 않음 (해결책이 더 안전하면 충분). OpenSSH 10.0 release notes 에 "removed support for SHA1-based host key algorithms" 언급 — 이게 silent drop 의 race 원인 가능성.

다른 3노드(🪟 WSL Ryzen, 🖥 데스크탑3060Ti, 🏭 맥미니) 도 같은 OpenSSH 9.6 일 가능성 높지만 narrow 없이 본진→PASS — 차이 = 그 노드들은 known_hosts 에 본진 entry 가 이미 있어서 `order_hostkeyalgs` 가 본진의 ssh-ed25519 키 algorithm 을 우선 send. 노트북은 known_hosts 비어있어서 default 전체 list 송신 → race 발현.

## Fix (노트북 한정)

노트북 ~/.ssh/config 의 `Host mac` 블록에 두 줄 추가:

```
Host mac
    KexAlgorithms curve25519-sha256
    HostKeyAlgorithms ssh-ed25519
    HostName user-macbookpro-1
    User user
```

KEX 한 줄만 박으면 timeout 124 그대로 — HostKeyAlgorithms 도 같이 박아야 PASS.

검증 — `for i in 1 2 3; do ssh -o ConnectTimeout=10 mac true; done` 3회 연속 PASS. `bash ~/claude-automations/scripts/mac-directive.sh "test"` = `✅ directive sent to Mac tmux session 'claude' (84 bytes)`.

## 재발방지

1. **노트북 ~/.ssh/config 의 Host mac entry 표준화**: `KexAlgorithms curve25519-sha256` + `HostKeyAlgorithms ssh-ed25519` 두 줄 lock. config 백업 = `~/.ssh/config.bak-2026-05-24-HHMM`.
2. **mac-directive.sh wrapper inline 옵션 (선택)**: 노트북측 mac-directive.sh 의 `ssh -o ConnectTimeout=5 "$MAC_HOST" true` 호출에 `-o KexAlgorithms=curve25519-sha256 -o HostKeyAlgorithms=ssh-ed25519` 추가하면 config 안 박혀도 작동. 다만 mac-directive.sh 는 SoT = claude-skills repo 의 5노드 공유 스크립트이므로 노드별 config 박는 게 깔끔.
3. ~~**known_hosts 에 본진 host key 박기 (장기 해결)**: `ssh-keyscan -T 5 -H user-macbookpro-1 >> ~/.ssh/known_hosts` 가 PASS 하면 한 줄 박혀, 그 후 default ssh 도 narrow 자동 선택 가능.~~ ⚠️ **2026-05-24 06:08 KST 검증 결과 stale — narrow 두 줄 영구 유지가 정답**. `ssh -o StrictHostKeyChecking=accept-new mac` 로 known_hosts 에 ed25519/rsa/ecdsa-nistp256 3개 자동 추가 PASS (ssh-keyscan 단독은 banner 만 받고 0개 — 같은 KEX race). 그 후 narrow 두 줄 제거 → ssh mac → `Connection reset by 100.74.85.37 port 22`. 원인 = **KexAlgorithms 는 host key 와 무관 (KEX = key exchange, HostKey = server 인증)** 이라 known_hosts 가 KEX algorithm list 를 좁혀줄 수 없음. HostKeyAlgorithms 만 known_hosts 가 자동으로 좁혀줘 OK 지만 KEX race 그대로 살아남. → `~/.ssh/config.bak-narrow-2026-05-24` 에서 즉시 복원, ssh mac 3회 재검증 PASS. **노트북 ~/.ssh/config Host mac 의 narrow 두 줄은 영구 lock**, 표준화 도달 불가.
4. **다른 노드 같은 패턴 추가 발현 시 동일 패치**: `ssh -o ConnectTimeout=8 <node> 'timeout 10 ssh -o ConnectTimeout=6 -o BatchMode=yes mac true'` probe 가 fail = 같은 KEX race → 같은 두 줄 ~/.ssh/config 박기.

## 비-자명한 사실

- macOS application firewall + sshd_config 디폴트 빈 상태가 normal — KEX race 와 무관.
- "publickey reset" 같은 메시지가 보였다는 이전 추정은 stale — 실제는 publickey 까지 가지 않고 KEX init 단계 silent drop. 핸드오프 in-flight 4번 fact 정정.
- 본진→노트북 SSH 는 정상 (양방향 비대칭). Tailscale routing 양방향 살아있음.
- 본진 macOS 가 동시 두 LAN IP (192.168.0.31 en0 + 0.30 다른 interface) 들고 있음 — 둘 다 sshd LISTEN, TCP connect PASS. KEX layer 만 race.

## 후속 (next session)

- ~~노트북 ~/.ssh/known_hosts 에 본진 entry 박기~~ ✅ 2026-05-24 06:00 KST 완료 (ed25519/rsa/ecdsa 3개 자동 추가) — 단 narrow 제거는 fail, narrow 영구 유지. §재발방지 §3 update 박힘.
- 정확히 어느 algorithm 이 silent drop trigger 인지 좁히기 (KexAlgorithms 단독 narrow 했을 때 결과 — KEX 좁히면 PASS 였으니, 노트북 default KEX list 중 본진 OpenSSH 10.2 가 거부하는 옛 entry 가 silent drop trigger). 본진 sshd debug log capture (`sudo /usr/sbin/sshd -ddd -p 2222`) + 노트북 한 발사 매치하면 정확 algorithm 식별 가능 — 시간 여유 있을 때.
