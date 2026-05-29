# Windows host GUI/설정 자동화 길 spec (🖥 데스크탑 · 💻 노트북, 강대종 손0화)

**Status**: 🟡 spec · 형님 ack 펜딩 (실제 PowerShell 실행/reg 박기/Windows 설정 변경 X — spec only)
**Author**: 🪟 WSL / 2026-05-29 KST (낮 오토 cycle #1-b, T-260523-17)
**대상 노드**: 🖥 데스크탑(RTX 3060Ti, DESKTOP-0VAB3QC) · 💻 노트북(RTX 3060, DESKTOP-4MNJ1C0) — 둘 다 **Ubuntu WSL2 위 Claude Code**, Windows host 설정은 형님이 직접 GUI 클릭 중.
**목표**: WSL2 노드가 Windows host 설정(전원/WOL/sleep/RDP/디스플레이 등)을 형님 손 없이 만지는 자동화 경로를 사전 정의. **본 문서는 가이드일 뿐 실행/설정 변경 없음.**
**검증 베이스**: 🪟 WSL(DESKTOP-I4TR99I)에서 실측 — interop 메커니즘은 3 WSL2 노드 동일.

---

## 0. TL;DR (핵심 3줄)

1. **WSL→Windows interop는 이미 켜져 있고 `/mnt/c/...exe` 직접 호출이 가장 단순한 길.** 하지만 —
2. **WSL 유저는 non-admin Windows 계정에 매핑됨** (실측: `IsInRole(Administrator)=False`). 읽기(query)는 무권한 OK, **시스템 쓰기(전원·WOL·RDP·HKLM·서비스)는 전부 UAC 게이트 → Access Denied(Error 5)**.
3. **손0 nightly의 유일한 UAC-free 길 = 사전에 1회 admin으로 만든 "최고권한 예약 작업"을 standard 유저가 `schtasks /run`으로 트리거.** 작업 *생성*만 형님 1클릭, 이후 *트리거*는 UAC 재프롬프트 없음.

---

## 1. Windows host 자주 만지는 설정 inventory

| # | 설정 | 위치 | 쓰기에 admin 필요? | 빈도 |
|---|------|------|:---:|------|
| 1 | 전원 옵션 (sleep/hibernate timeout, AC/DC) | `powercfg`, 제어판>전원 | ✅ (`/change`, `/setacvalueindex`) | 中 |
| 2 | 활성 전원 계획 전환 | `powercfg /setactive` | ✅ | 中 |
| 3 | **WOL (NIC Wake on Magic Packet)** | 장치관리자>NIC>전원관리 + 고급 | ✅ (NIC 속성/드라이버) | 低(1회) |
| 4 | 모니터 sleep / "절전 시 끄기" | `powercfg` SUB_VIDEO | ✅ | 中 |
| 5 | RDP 활성화 | `fDenyTSConnections` reg + 방화벽 규칙 | ✅ | 低 |
| 6 | NLA (RDP 네트워크 수준 인증) | `UserAuthentication` reg | ✅ | 低 |
| 7 | 디스플레이 해상도/배율 | 설정>디스플레이 (GUI) / `QRes` 류 도구 | ❌(유저) ~ ✅ | 低 |
| 8 | Hyper-V / WSL 설정 (`.wslconfig`, `wsl --shutdown`) | `%UserProfile%\.wslconfig`, `wsl.exe` | ❌(.wslconfig는 유저파일) | 中 |
| 9 | Windows 보안센터 / Defender 예외 | 보안센터 GUI | ✅ + Tamper Protection | 低 🛑 |
| 10 | 절전 방지(keep-awake, 일시) | `SetThreadExecutionState` (유저 컨텍스트) | ❌ | 中 |

> **실측 기준선** (🪟 WSL, non-admin):
> - 읽기 OK: `powercfg /list`·`/query`·`/getactivescheme`, `Get-NetAdapter`, `reg query HKLM\...`, `schtasks /query` → 무권한 통과.
> - 쓰기 거부: `net session` → **시스템 오류 5(Access Denied)**. 시스템 power/NIC/HKLM 쓰기 동일하게 UAC 게이트.

---

## 2. 자동화 옵션 비교

### (a) PowerShell remoting (WinRM) — WSL ssh → host PowerShell
- 메커니즘: host에 WinRM 활성(`Enable-PSRemoting`) + WSL에서 `Enter-PSSession`/`Invoke-Command` 또는 ssh.
- 권한: **WinRM 활성화 자체가 admin 1회.** 세션이 admin 자격이면 elevated 명령 가능(UAC는 remoting 세션엔 적용 안 됨 — admin 토큰으로 접속하면 full).
- 단점: host에 admin 계정 자격증명을 WSL이 들고 있어야 함(보안 부담). NLA/방화벽 5985/5986 설정. localhost loopback이라 네트워크 노출은 작지만 **자격증명 평문 보관 금지** (`[[feedback_routine_no_hardcoded_secrets]]`).
- 적합도: 강력하지만 setup·보안 비용 큼. 동일 머신 안 WSL→host는 over-engineering.

### (b) Registry edit (`reg.exe` / PS `Set-ItemProperty`)
- 메커니즘: `/mnt/c/Windows/System32/reg.exe add ...` 또는 PS.
- 권한: **HKCU 쓰기 = 무권한 OK. HKLM 쓰기(RDP/NLA/전원 정책 대부분) = admin/UAC.**
- 단점: 잘못된 키가 부팅/로그인 막을 수 있음(고위험). 롤백은 `reg export` 백업 선행 필수.
- 적합도: HKCU 범위 설정엔 즉답, HKLM은 (e) 예약작업 경유 필요.

### (c) GUI macro (AutoHotkey / pynput) — 좌표 의존
- 메커니즘: host에서 AHK/pynput로 설정 앱 클릭.
- 권한: 클릭 대상이 elevated 창이면 macro도 elevated여야(UIPI). UAC 동의 창은 secure desktop이라 매크로 **불가**.
- 단점: 좌표/배율 깨짐(`[[feedback_pynput_dpi_awareness]]` — DpiAwareness 필수), Windows 업데이트로 UI 바뀜. 비결정적.
- 적합도: **최후수단.** 다른 길 다 막힐 때만. 손0 nightly엔 부적합.

### (d) WSL → `/mnt/c/...exe` 직접 호출 (powercfg/shutdown/wakeup)
- 메커니즘: interop으로 `powercfg.exe`, `shutdown.exe`, `schtasks.exe`, `reg.exe` 직접 실행. **실측: interop 켜짐, 다 호출됨.**
- 권한: **읽기 전부 OK. 시스템 쓰기는 non-admin이라 거부** — interop 호출도 결국 같은 유저 토큰.
- 단점: cmd.exe는 WSL UNC cwd 경고(`[[wsl-flutter-test]]` 함정). exe 자체는 정상.
- 적합도: **읽기/트리거의 1순위 표면.** 쓰기는 (e)와 결합.

---

## 3. 권한 요구 매트릭스

| 작업 | non-admin 직접 | UAC 프롬프트? | 손0 가능 경로 |
|------|:---:|:---:|------|
| 전원/sleep/WOL 상태 **읽기** | ✅ | X | (d) 직접 |
| `.wslconfig` 편집 + `wsl --shutdown` | ✅(유저파일) | X | (d) 직접 |
| 일시 절전 방지(keep-awake) | ✅ | X | `SetThreadExecutionState`(유저) |
| 전원계획 변경/NIC WOL/RDP/HKLM 쓰기 | ❌ | ✅ | **(e) 예약작업 트리거** |
| 서비스 토글(`sc config`) | ❌ | ✅ | (e) 예약작업 |
| Defender/보안센터 변경 | ❌ | ✅ + Tamper | 🛑 손0 불가(차단) |

핵심: **UAC 동의 창은 secure desktop**이라 어떤 자동화(매크로/스크립트)도 비대화형으로 통과 못 함. 따라서 손0의 본질은 "UAC를 *우회*"가 아니라 "**UAC가 *발생하지 않는* 길**(미리 승격된 작업 트리거)"를 까는 것.

---

## 4. ⭐ 손0 best path — 사전 승격 예약 작업 트리거 (UAC-free nightly)

```
[1회 setup, 형님 admin 1클릭]
  관리자 PowerShell:
    Register-ScheduledTask -TaskName "node-power-X" \
      -Action (...powercfg/reg 명령...) \
      -Principal (New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest) \
      -Settings (...)
  → 작업이 SYSTEM/최고권한으로 박힘. ACL을 standard 유저가 'run' 가능하게.

[이후 매번, WSL 노드가 무권한으로]
  /mnt/c/Windows/System32/schtasks.exe /run /tn "node-power-X"
  → UAC 재프롬프트 0. 작업이 SYSTEM 권한으로 실제 변경 수행.
```

- **실측 뒷받침**: standard 유저로 `schtasks /query` rc=0 통과 → 트리거(`/run`) 경로 유효. 작업 *생성*만 admin, *실행*은 무권한.
- 작업당 1개 액션을 고정(파라미터화는 작업이 읽는 파일/레지스트리 값으로). nightly = WSL이 `schtasks /run`만.
- WinRM(a) 대비 **자격증명 보관 0** — 트리거만 위임, 권한은 작업에 박혀있음.

### 4.1 WOL은 별 케이스 — Windows auth 아예 불요
- WOL 활성화(BIOS WOL ON + NIC "매직 패킷 허용" + 빠른시작 OFF)는 **1회 admin GUI/예약작업**.
- 활성화 후 **깨우기는 다른 노드가 매직 패킷 전송** → 대상 host는 꺼진 상태라 Windows 인증 자체가 없음. `wakeonlan <MAC>` (WSL/맥/리눅스 어디서나).
- 즉 WOL은 setup만 손1, 운영은 완전 손0.

### 4.2 절전 방지(일시)는 admin 0
- 빌드/렌더 중 sleep 방지는 전원계획을 바꾸지 말고 `SetThreadExecutionState(ES_CONTINUOUS|ES_SYSTEM_REQUIRED)`(유저 컨텍스트) 호출. 끝나면 해제. admin·UAC 0.

---

## 5. 위험 · 롤백

| 위험 | 영향 | 완화/롤백 |
|------|:---:|------|
| 잘못된 HKLM reg 키 → 부팅/로그인 차단 | 高 | 변경 전 `reg export <키> backup.reg` 필수. 롤백 = `reg import backup.reg`(예약작업 경유). 변경은 한 키씩, 즉시 검증 |
| WOL/sleep 설정 실수로 **host가 안 꺼지거나 안 깨어남** → 원격 접근 단절 | 高 | WOL은 끄기 전 깨우기 테스트 1회 먼저. sleep timeout 0(never)은 RDP/SSH 살아있는지 확인 후. **물리 접근 가능한 시간대에만 첫 적용** |
| 예약작업 권한 ACL 과다 → standard 유저가 임의 SYSTEM 실행 | 中 | 작업 액션을 고정 스크립트 1개로 한정, 인자 주입 금지. 작업명·액션 화이트리스트 |
| 디스플레이 해상도 변경 후 화면 안 나옴 | 中 | 15초 자동 되돌림 도구(QRes 타임아웃) 또는 RDP 세션 해상도만 |
| Defender 예외/Tamper 건드림 | 高 | 🛑 손0 범위 밖. 형님 직접만 |
| `wsl --shutdown` 중 노드 작업 유실 | 中 | 활성 세션 없을 때만, `.wslconfig` 변경 후 재시작은 노드 idle 확인 후 |

### 롤백 일반 원칙
- 모든 reg 쓰기 = export 백업 선행 → import 복원.
- 전원/NIC 변경 = `powercfg /query` / `Get-NetAdapterPowerManagement` 현재값 캡처 → 동일 명령으로 복원.
- 예약작업 자체 = `Unregister-ScheduledTask`(admin 1회)로 제거 = 전체 자동화 비활성(가역).
- **불가역 경계 없음** — 전부 설정 복원 가능. 단 *원격 접근 단절*은 물리 복구만 → 그래서 §5 첫 적용은 물리 접근 시간대 권장.

---

## 6. 권장 우선순위 (ack 받은 후 구현 순서)

1. **읽기 표면 먼저**(d): WSL이 host 전원/WOL/NIC 상태를 `/mnt/c/...exe`로 무권한 조회 — 즉시 가능, 위험 0.
2. **keep-awake**(§4.2): 빌드/렌더 sleep 방지, admin 0.
3. **WOL setup**(§4.1): 1회 admin → 운영 완전 손0. ROI 최고(외출 중 노드 깨우기).
4. **예약작업 프레임**(§4): 전원계획/RDP/HKLM 쓰기를 작업 1개씩 박아 `schtasks /run` 위임. 첫 적용은 물리 접근 시간대.
5. WinRM(a)·GUI매크로(c)는 **불채택**(보안/비결정성). 필요 시 별 brainstorm.

실제 PowerShell 실행·reg 박기·서비스 토글은 전부 🔴 ack 큐. admin elevation/UAC 우회/보안센터 변경은 🛑 차단.

---

## 부록 — 실측 로그 (🪟 WSL DESKTOP-I4TR99I, 2026-05-29)
- interop: `enabled`, `/etc/wsl.conf`에 [interop] 명시 없음(기본 ON)
- `IsInRole(Administrator)` → **False** (WSL 유저 = non-admin Windows 계정 `desktop-i4tr99i\user`)
- 무권한 통과: `powercfg /list`·`/getactivescheme`(활성 GUID 8c5e7fda… High Perf), `Get-NetAdapter`, `reg query HKLM`, `schtasks /query`(rc=0)
- 거부: `net session` → 시스템 오류 5(Access Denied)
- 존재 확인: `powercfg.exe`, `powershell.exe`(5.1), `shutdown.exe`, `schtasks.exe`, `reg.exe`, `rundll32.exe`, `sc.exe`
