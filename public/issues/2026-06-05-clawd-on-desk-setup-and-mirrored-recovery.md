# Clawd on Desk 노드별 세팅법 + WSL mirrored 표준화 / 복구 노하우

- **작성:** 2026-06-05 KST (🍎 본진)
- **계기:** 아니키 "clawd on desk 켰는데 codex 세션이 안 붙네" → claude 복구 → codex mirrored 표준화 → wsl --shutdown brick → 복구. 다음에 grep 해서 바로 따라하도록 박음.
- **심각도:** medium (잘못하면 노드 ssh 접속 끊겨 dark 위험)

---

## 0. 핵심 결론 (요약)

- **5노드 전부 펫은 Windows Clawd on Desk.exe 를 씀** (라이덴의 Linux AppImage `~/clawd-on-desk/squashfs-root` 는 **안 쓰는 잔재**. 프로세스·autostart 0건 실측).
- Clawd 서버 포트는 **Windows 쪽** `C:\Users\USER\.clawd\runtime.json` (보통 port 23333). WSL 쪽 `~/.clawd/runtime.json` 은 부재.
- **claude 훅** (`~/.claude/settings.json`) = 전 노드 **Windows powershell 브리지** 형태로 통일됨 (라이덴 포함).
- **codex 훅** (`~/.codex/hooks.json`) = 2가지 분기:
  - WSL **networkingMode=mirrored** 노드 → Linux 네이티브 (`/usr/bin/node` + codex-hook.js), 127.0.0.1:23333 직결. **초록불(활성) 정상.**
  - WSL **NAT**(기본) 노드 → Linux node 가 Windows 서버에 못 닿음(refused) → powershell 브리지 필요(단 codex 초록불 미점등 이슈 있었음).
- **표준(정석)** = WSL 노드 전부 **mirrored + codex Linux 네이티브 훅** (라이덴과 동일). claude 는 powershell 브리지 유지(라이덴도 그럼).

---

## 1. 노드별 Clawd 구성 실측 (2026-06-05)

| 노드 | 펫 | runtime.json | claude 훅 | codex 훅 | mirrored |
|---|---|---|---|---|---|
| 🪟 라이덴 (<desktop-host>) | Windows Clawd.exe | Windows측 23333 | powershell 브리지 | Linux 네이티브 `/usr/bin/node` | **mirrored** (그래서 codex 초록불 OK) |
| 💻 노트북 (<desktop-host>) | Windows Clawd.exe | Windows측 23333 | powershell 풀패스 | Linux 네이티브 (2026-06-05 전환) | **mirrored** (2026-06-05 전환) |
| 🖥 데스크탑 (<desktop-host>) | Windows Clawd.exe | Windows측 23333 | powershell 풀패스 | Linux 네이티브 (2026-06-05 전환, icm 훅 보존) | **mirrored** (2026-06-05 전환, +Windows OpenSSH disable 동반 — §6) |

- Windows Clawd codex-hook.js 경로(노트북/데스크탑): `/mnt/c~/Users/<user>/AppData/Local/Programs/Clawd on Desk/resources/app.asar.unpacked/hooks/codex-hook.js`
- 라이덴 codex-hook.js(잔재 squashfs): `~/home/<user>/clawd-on-desk/squashfs-root/resources/app.asar.unpacked/hooks/codex-hook.js`

### claude 훅 = powershell 풀패스 (WSL 공통 함정)
WSL bash PATH 에 bare `powershell.exe` 없음 → settings.json 훅에 **풀패스 필수**:
`/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe`
(bare 면 매 이벤트 command-not-found silent fail → 펫에 세션 0개. 이게 "세션 안 붙음" 1순위 원인.)

### codex 훅 Linux 네이티브 (mirrored 노드)
`~/.codex/hooks.json` 6이벤트(SessionStart/UserPromptSubmit/PreToolUse/PostToolUse/Stop=t30, PermissionRequest=t600) 각:
```
"/usr/bin/node" "<codex-hook.js 경로>"
```
(event arg 없음 — codex-hook.js 가 stdin 으로 hook_event_name 수신. codex-hook.js 는 runtime.json 부재 시 기본 23333 fallback.)
`~/.codex/config.toml [features] hooks=true` 필요. **옛 `codex_hooks=true` 키는 deprecated** — codex 기동 시 빨간 경고줄 뜨면 그 줄 `sed -i '/codex_hooks/d'` 로 제거(hooks=true 만 유지).

---

## 2. mirrored 표준화 절차 (NAT → mirrored 전환)

⚠️ **`.wslconfig` 변경은 `wsl --shutdown` 이 필수** (WSL2 VM 전체 재시작해야 적용). 이게 brick 위험의 근원.

1. **스테이징** (노드 claude 가): `.wslconfig` `[wsl2]` 아래 `networkingMode=mirrored` 추가(백업 먼저). codex hooks.json Linux 네이티브로 교체(백업). claude 훅은 건드리지 마.
2. **⚠️ 사전 필수 — sshd 자동복구 보강** (안 하면 brick):
   - 노드 sshd 는 보통 **systemd disabled** + WSL 안에서 돎 → `wsl --shutdown` 하면 죽고 자동복구 안 됨.
   - autostart `.vbs`(`claude-wsl-autostart.vbs` = `wsl.exe -d Ubuntu --exec /usr/bin/sleep infinity`)는 **Windows 로그인 때만** 실행 → 수동 shutdown 후 안 살아남.
   - **베스트**: shutdown 전에 `sudo systemctl enable ssh` + `sudo ssh-keygen -A` (sudo 비번 필요 = 아니키 손 or 노드 claude 에 위임). 그러면 재기동 시 sshd 자동.
   - **sudo 비번 못 쓰면**: Windows 스케줄 작업 안전망 (아래 §3) 으로 자동복구.
3. **shutdown** (본진이 컨트롤, 노드 self-shutdown 금지): `ssh <node> 'cmd.exe /c "wsl --shutdown"'`
4. **검증** (재기동 후): `timeout 3 bash -c "echo > /dev/tcp/127.0.0.1/23333"` → REACHABLE 이면 mirrored OK. codex REPL 재기동(또는 새 세션) → 펫에 codex 초록불.

---

## 3. brick 복구 안전망 (sudo 비번 없이 hands-off)

`wsl --shutdown` 후 sshd 가 안 살아나면 ssh/디렉티브 경로 둘 다 끊겨 노드 dark. 안전망:

1. **복구 .bat** `C:\Users\USER\wsl-mirrored-recover.bat`:
   ```bat
   @echo off
   wsl.exe -d Ubuntu -u root --exec /usr/sbin/sshd
   wscript.exe "C:\Users\USER\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\claude-wsl-autostart.vbs"
   ```
   ⚠️ **함정**: 위 .bat 단독으로는 sshd 가 **호스트키/`/run/sshd` 부재로 조용히 실패**함(2026-06-05 노트북 실제 사고). 제대로 띄우려면:
   ```bash
   sudo ssh-keygen -A          # 호스트키 생성 (이게 빠지면 sshd 안 뜸)
   sudo mkdir -p /run/sshd     # 권한분리 디렉토리
   sudo systemctl start ssh    # 또는 sudo /usr/sbin/sshd
   sudo systemctl enable ssh   # 부팅 자동기동 (영구 해결, 재발 방지)
   ```
2. **Windows 스케줄 작업** (1분마다 .bat 재실행 → shutdown 타이밍 무관 자동복구):
   ```
   schtasks /create /tn ClaudeWslMirroredRestart /tr "C:\Users\USER\wsl-mirrored-recover.bat" /sc minute /mo 1 /f
   ```
   ⚠️ **복구 후 반드시 삭제** (안 하면 매분 cmd 창이 번쩍거림 = 2026-06-05 "검은 화면 번쩍" 사고):
   ```
   schtasks /delete /tn ClaudeWslMirroredRestart /f
   ```
3. **wsl -u root 는 무패스워드** (WSL 기본) — sudo 비번 없이 root 작업 가능. 단 `systemctl enable ssh` 같은 영구 설정은 사람 손(sudo 비번) 권장.

### 노드 dark 됐을 때 ssh 복구 (사람 손)
sshd 안 떠서 ssh 안 되면 — 노드 WSL 셸에서:
```bash
sudo bash -c "mkdir -p /run/sshd && ssh-keygen -A && systemctl enable --now ssh"; ss -tln | grep :22
```
(sudo 비번 1회. `Connection refused` = sshd 미기동(호스트키 의심), `timeout` = 네트워크/Tailscale 문제 — 구분.)

---

## 4. /insights 5노드 회수 메커니즘 (별건이지만 같은 날 정립)

- `/insights` = Claude Code 빌트인. **인터랙티브 TUI 라 tmux scrollback 엔 안 남음** (capture-pane 무용).
- **정본 = `~/.claude/usage-data/report.html`** (/insights 실행 시 자동 저장, 타임스탬프본도). 이 파일 읽으면 깨끗한 분석 전문.
- 스크립트 `~/claude-automations/scripts/insights-fire.sh` — send-keys `/insights` → 새 `report-*.html` 폴링 → "At a Glance" 추출 → 텔레그램 forward. context-show fire.sh 패턴 동형.

---

## 5. 교훈

- **mirrored 가 ssh 경로 망친 거 아님** — 2026-06-05 ssh 안 된 진짜 원인은 sshd 미기동(호스트키). Tailscale·네트워크는 mirrored 후에도 정상(refused≠timeout 으로 구분). 성급히 "mirrored side-effect" 단정 X.
- shutdown 전에 **sshd 영구 자동기동(enable)** 박아두면 전 과정이 매끄러움 — 노트북 삽질의 핵심 원인은 이걸 안 한 것.
- `/insights` 처럼 "TUI 라 회수 못 해" 같은 단정 금지 — 파일 산출물(report.html) 찾으면 됨("되게 하라").

---

## 6. ⚠️ mirrored + Windows OpenSSH = :22 충돌 (2026-06-05 데스크탑 전환에서 발견)

데스크탑 mirrored 전환 시 §2 절차는 다 맞았는데, `wsl --shutdown` 재기동 후 **WSL sshd 가 안 떠서 `ssh desktop3060ti` 가 refused** 됐다. §5 교훈("mirrored side-effect 아님")과 달리 이번엔 **진짜 mirrored side-effect** 였다 — 원인이 §1·§3 과 다르니 별도 박음.

- **증상**: WSL 재기동·Tailscale active·ping 정상인데 port 22 만 `Connection refused`. `systemctl is-system-running` = `degraded`, `systemctl status ssh.socket` = `failed (Result: resources)` + 로그 `Failed to create listening socket (0.0.0.0:22): Address already in use`.
- **근본원인**: Ubuntu 24.04 ssh 는 **socket-activated**(ssh.service `TriggeredBy: ssh.socket`). mirrored 모드는 WSL 이 Windows 네트워크 네임스페이스를 공유 → **데스크탑에 돌던 Windows OpenSSH sshd(AUTO_START)가 이미 0.0.0.0:22 점유** → WSL ssh.socket 바인딩 실패 → ssh.service dependency 실패. NAT 모드일 땐 Windows :22 와 WSL :22 가 별 스택이라 공존했으나 mirrored 단일 스택에선 충돌.
- **왜 노트북/라이덴은 무사고였나**: 그 노드들엔 **Windows OpenSSH 가 아예 없음**(`tasklist | findstr sshd` → none, WSL 이 :22 단독 소유). 데스크탑만 Windows OpenSSH AUTO_START 였던 게 anomaly.
- **정석 해결**(노트북과 동일): **Windows OpenSSH sshd stop + disable** → :22 비면 WSL ssh.socket 이 잡음. 관리자 PowerShell(원격 ssh 세션은 NOT_ADMIN 이라 직접 불가 → 아니키 손):
  ```powershell
  Stop-Service sshd; Set-Service sshd -StartupType Disabled; wsl -d Ubuntu -u root -e bash -lc "systemctl reset-failed ssh.socket ssh.service; systemctl start ssh.socket; ss -tln | grep :22"
  ```
- **임시 복구·진단 경로 (WSL sshd dark 일 때 핵심)**: mirrored 모드에선 **Windows 쪽 Tailscale 노드(`desktop-0vab3qc`, suffix 없음)로 ssh 하면 Windows OpenSSH cmd 로 떨어짐**. 거기서 `wsl -d Ubuntu -u user -e bash -lc "..."` 로 WSL 명령 실행·진단·schtasks 제어 다 가능 (WSL sshd 안 떠도 노드 안 죽음). cmd 라 grep/timeout/bash 미인식 → 풀패스(`/mnt/c/Windows/System32/...`)나 `wsl -e` 경유. 이 경로 덕에 아니키 schtasks 깜빡임 제거·진단 전부 hands-off 로 했다.
- **alias 변경 불필요**: 전환 후에도 `desktop3060ti`(→ `desktop-0vab3qc-2`, WSL tailscale0 <tailnet-ip>)가 그대로 WSL :22 노출. mirrored 라 eth0 는 Windows IP(<tailnet-ip>) 공유로 보이지만 WSL tailscaled 는 자기 노드 IP 유지.
- **검증 PASS**(2026-06-05): systemd running / ssh.socket active / :22 2소켓 / eth0 mirrored(NAT 탈출) / Clawd 23333 REACHABLE / hooks node 6·powershell 0·icm 4 보존 / codex_hooks 0 / Windows sshd START_TYPE=4 DISABLED / codex 펫 초록불(아니키 확인).
- **교훈**: 다음 노드(라이덴 등) mirrored 전환 전 **`tasklist | findstr sshd` 로 Windows OpenSSH 선점 여부 먼저 확인** — 있으면 shutdown 전에 stop+disable 예약. 그래야 이번 dark→복구 삽질 0.

## 관련
- 메모리 [[reference_wsl_clawd_pet_hooks]]
- 글로벌룰 "되게 하라" / "천천히 정확하게 추론하라"
