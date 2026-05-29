# Spec — 외출 중 🖥 데스크탑 원격 전원 (WOL 켜기 + 원격 끄기, 손0화)

- 작업 ID: T-260523-18
- 작성: 2026-05-29 / 🖥 데스크탑 (autopilot 사이클 #1-b, spec-only)
- 범위: **분석·스펙 only.** 실제 BIOS 설정 / NIC WOL 활성화 / shutdown 호출 / Tailnet 정책 변경 일절 없음.
- 데이터 출처: 본 데스크탑(DESKTOP-0VAB3QC)에서 read-only PowerShell/systemctl 실측 (2026-05-29).

---

## 0. 한 줄 결론

NIC 드라이버 WOL 은 **이미 전부 켜져 있고** SSH 경로(Tailnet)도 살아있어, 원격 전원은 거의 다 갖춰져 있다. 단 **두 개의 함정**이 핵심: (1) **Fast Startup 이 켜져 있어(HiberbootEnabled=1) 완전종료(S5)에서 WOL 이 안 깬다** → 타겟 상태를 **Sleep(S3)** 으로 잡는 게 정답. (2) 물리 NIC 가 공인 IP(220.71.65.157)라 **magic packet 은 WAN 으로 라우팅 불가** → 외출 中 켜기는 반드시 **집 LAN 상시가동 노드를 Tailnet 경유 relay** 로 보내야 한다.

---

## 1. 현재 데스크탑 상태 inventory (실측)

### 1.1 NIC

| 항목 | 값 |
|---|---|
| 물리 NIC | Intel(R) Ethernet Connection (17) I219-V |
| **MAC (magic packet 대상)** | **04-7C-16-04-45-06** |
| LinkSpeed | 1 Gbps |
| LAN IP (물리 NIC) | 220.71.65.157 (KT 공인대역 — WAN broadcast 불가, §6 참조) |
| Tailscale IP | 100.70.173.66 |
| WSL vEthernet | 172.18.224.1 (내부, 무관) |

### 1.2 NIC WOL 드라이버 설정 (`Get-NetAdapterAdvancedProperty`)

| 속성 | 현재값 |
|---|---|
| Wake on Magic Packet | **Enabled** ✅ |
| Wake from S0ix on Magic Packet | **Enabled** ✅ |
| Wake on Pattern Match | Enabled |
| Enable PME | Enabled ✅ |
| Wake on Link Settings | Disabled |
| Energy Efficient Ethernet | On |

→ **드라이버 레벨 WOL 은 추가 작업 불필요.** 이미 magic packet 수신 대기 상태.

### 1.3 전원/wake 상태

- **Fast Startup: `HiberbootEnabled = 1` (켜짐)** ⚠️ — 함정. `shutdown /s` 가 하이브리드 종료(S4 유사)로 떨어져 많은 보드에서 NIC 가 완전 절전 → **S5 에서 WOL 미동작**. "절전(sleep)에선 깨는데 종료하면 안 깬다" 의 전형 원인.
- `powercfg /devicequery wake_armed`: **Intel I219-V 가 wake-armed 목록에 있음** ✅. 단 **Razer DeathAdder V2 Pro (마우스/키보드)도 armed** → 의도치 않은 wake(스푸리어스) 가능성 (§5.2).
- BIOS WOL 옵션: **OS 에서 직접 read 불가** — BIOS 의 "Power On By PCIE/PCI" / "Wake on LAN" / "ErP/Deep Sleep" 항목 확인은 부팅 시 BIOS 진입 필요(🔴 형님 손 1회). 드라이버 WOL 이 켜져 있어도 BIOS ErP Ready=Enabled 면 S5 에서 전원이 완전히 끊겨 WOL 불가. **S3 타겟이면 BIOS 영향 최소** (이것도 S3 권장 이유).

### 1.4 원격 접속 경로 (끄기용)

| 경로 | 상태 |
|---|---|
| Windows OpenSSH `sshd` | **Running / Automatic** ✅ |
| WSL `ssh.service` | **active (enabled)** ✅ |
| Tailscale SSH capability | **advertised** (DESKTOP-0VAB3QC) ✅ |
| `~/.ssh/authorized_keys` | 4개 키 (본진/노드 접근 가능) ✅ |

→ 끄기용 원격 명령 landing 경로는 3중으로 확보됨. 데스크탑이 **켜져 있을 때만** Tailscale/sshd 가 살아있음(끌 때는 켜져 있으니 OK).

---

## 2. 켜기 (WOL) 옵션 비교

> 전제: magic packet 은 L2 broadcast → **WAN 라우팅 불가**. 외출 中 직접 데스크탑으로 못 쏜다. 반드시 **집 LAN 상시가동 노드**가 로컬 broadcast 를 대신 쏴야 한다. 데스크탑 자신의 Tailscale 은 꺼져 있을 때 offline 이라 relay 못 함 → **다른** 상시 노드 필요.

| 옵션 | 흐름 | 네트워크 요구 | 권한/보안 | 평가 |
|---|---|---|---|---|
| **(a) Mac 본진/맥미니 relay (권장)** | 외출 中 폰/Mac → Tailnet → 집 LAN 상시노드(Mac 본진 또는 맥미니, 데스크탑과 **같은 물리 LAN**) → `wakeonlan 04:7C:16:04:45:06` 로컬 broadcast → 데스크탑 wake | 상시노드가 데스크탑과 동일 L2 LAN + Tailnet 접근 | Tailnet ACL 로 누가 relay 노드 닿는지 통제. WAN 노출 0 | **최선** — 손0, WAN 침입면 0. Mac `brew install wakeonlan` 만 |
| (b) 휴대폰 WOL 앱 | 폰 WOL 앱 → 같은 LAN(집 와이파이) 또는 Tailnet subnet router 경유 broadcast | 폰이 집 LAN 안이거나 Tailnet subnet route | 앱 신뢰성·권한 의존 | 외출 中(집 밖)이면 LAN 밖이라 subnet router 필요 — relay 노드 있으면 (a) 가 더 단순 |
| (c) 라우터 cron + magic packet | 라우터(OpenWrt 등)가 스케줄·트리거로 LAN broadcast | 라우터 펌웨어 커스텀 가능해야 | 라우터 설정 변경 = 🛑 차단(directive ack) | 비권장 — 시간 트리거라 "외출 中 임의 시점 켜기" 못 함 |

**권장 = (a).** 단 §1.3 Fast Startup/BIOS 때문에 **데스크탑을 S3 sleep 으로 두는 경우에만 신뢰성 보장.** 완전종료 상태면 (a)도 BIOS ErP/Fast Startup 영향으로 실패할 수 있음(§4).

---

## 3. 끄기 옵션 비교

| 옵션 | 명령 | 평가 |
|---|---|---|
| **(a) ssh → `shutdown.exe /s` (WSL→Windows)** | Tailnet → WSL sshd → `/mnt/c/Windows/system32/shutdown.exe /s /t 0 /f` | 동작은 함. **단 Fast Startup ON 이라 하이브리드 종료 → 다음 WOL 실패 위험.** 완전종료 원하면 §4 Fast Startup off 선행 필요 |
| **(b) PowerShell `Stop-Computer`** | Tailnet → Win OpenSSH → `powershell Stop-Computer -Force` | (a)와 동일 결과(Fast Startup 영향 동일). 차이 미미 |
| **(c) 원격 Sleep (권장)** | Tailnet → ssh → `rundll32.exe powrprof.dll,SetSuspendState 0,1,0` | **S3 진입 → WOL 신뢰성 최고.** 데이터 손실 0(세션 유지). 전력 소량. 손0화 최적 |
| (참고) ssh→자기자신 race | WSL 안에서 ssh 로 자기 host shutdown | **실질 race 없음** — shutdown.exe 는 OS 종료 스케줄만 걸고 WSL 은 host 와 함께 내려감. ssh 세션 drop 은 정상(예상 동작). 단 종료 확인 응답은 못 받으니 fire-and-forget 로 설계 |

**권장 = (c) Sleep.** 완전종료(전력 0)가 꼭 필요할 때만 (a)/(b) + §4 Fast Startup off (🔴 ack).

---

## 4. WOL 활성화 단계 (실행 시 — 전부 🔴 ack 대기, 본 spec 에선 미실행)

드라이버 WOL 은 이미 켜짐(§1.2)이라 추가 활성화 거의 불필요. 남은 건 **완전종료(S5)에서도 WOL 되게 하려는 경우**의 선행 작업:

1. **Fast Startup off** (S5 WOL 핵심) — `powercfg /h off` (hibernate+fast startup 동시 off) 또는 레지스트리 `HiberbootEnabled=0`. 영향: 부팅 약간 느려짐, hibernate 불가. 🔴 ack.
2. **BIOS 확인 (형님 손 1회)** — 재부팅 → BIOS → "Wake on LAN / Power On by PCIE" Enabled, "ErP Ready / Deep Sleep" Disabled. 🔴 ack(물리 BIOS 진입).
3. (드라이버는 이미 됨, 재설정 불필요) 만약 초기화됐다면: `Set-NetAdapterAdvancedProperty -Name <NIC> -DisplayName 'Wake on Magic Packet' -DisplayValue Enabled` + `Enable-NetAdapterPowerManagement`.

> **S3 sleep 타겟으로 가면 1·2 전부 생략 가능** — 현재 상태 그대로 WOL 동작. 이것이 손0화·무변경 경로라 권장.

---

## 5. 가드

### 5.1 외출 中 실수 끄기 방지 (끄기 전 active 검사)

원격 끄기 명령 실행 전, 데스크탑에 **활성 사용자/최근 입력**이 있으면 abort:
- `quser` (query user) 로 active 세션 확인, 또는 PowerShell `GetLastInputInfo` 로 idle 시간 측정 → idle < N분이면 "사용 중일 수 있음" abort + 텔레그램 1통.
- Sleep(옵션 c) 면 데이터 손실 0이라 위험 낮지만, 사용 중 강제 sleep 도 방해되므로 동일 가드 적용 권장.

### 5.2 스푸리어스 wake 방지

Razer 마우스/키보드가 wake-armed → 진동·간섭으로 의도치 않은 wake 가능. 필요 시 `powercfg /devicedisablewake "Razer DeathAdder V2 Pro"` 로 NIC 만 남기고 disarm. 🔴 ack(입력장치 wake 동작 변경).

---

## 6. 위험 분석

- **WOL 침입면**: 물리 NIC 가 공인 IP(220.71.65.157)다. **WAN 에서 UDP 7/9 포트포워딩 절대 금지** — magic packet 을 인터넷에 노출시키고(브로드캐스트라 어차피 동작도 안 함) 침입면만 키운다. 반드시 **Tailnet relay**(§2-a)로만. 누가 데스크탑/relay 노드에 닿는지는 **Tailnet ACL** 로 통제 — 외출 폰·Mac 본진만 허용, 그 외 차단.
- **shutdown 데이터 손실**: 완전종료(a/b)는 미저장 작업 손실 가능 → §5.1 active 가드 필수. **Sleep(c)는 세션 유지라 손실 0** — 또 하나의 sleep 권장 이유.
- **Tailnet 정책 변경**은 directive 상 🔴 ack — 본 spec 은 "ACL 로 relay/desktop 접근 제한" 방향만 제시, 실제 ACL 편집 미실행.

---

## 7. 권장 최종 아키텍처 (손0화)

```
[타겟 상태 = Sleep(S3), 완전종료 아님]

켜기:  외출 폰/Mac ──Tailnet──▶ 집 LAN 상시노드(Mac 본진/맥미니)
                                  └─ wakeonlan 04:7C:16:04:45:06 (로컬 broadcast)
                                       └─▶ 🖥 데스크탑 S3→ON (현재 설정 그대로 동작)

끄기:  외출 폰/Mac ──Tailnet──▶ 🖥 데스크탑(100.70.173.66) ssh
                                  └─ [active 가드 통과 시] rundll32 ...SetSuspendState 0,1,0 → S3
```

- 변경 필요: 집 LAN 상시노드에 `wakeonlan`(또는 동급) 설치 1회 + relay 한 줄 스크립트. NIC/BIOS/Fast Startup **무변경**.
- 완전종료(전력 0) 모드를 추가로 원하면 §4-1,2(Fast Startup off + BIOS) 별도 🔴 ack 사이클.

---

## 8. ack 4티어 매핑

- 🟢 자율(본 spec 후 별 사이클): relay 노드에 `wakeonlan` 설치 + relay/active-guard 스크립트 작성(외부영향 0).
- 🔴 큐(형님 ack): Fast Startup off, NIC/Razer wake 동작 변경, 실제 shutdown/sleep 첫 발사 검증, Tailnet ACL 편집.
- 🛑 차단: 라우터 설정 변경, WAN 포트포워딩(WOL 인터넷 노출).

> 다음 사이클 후보: (1) 집 LAN 에 데스크탑과 동일 L2 인 상시노드(Mac 본진/맥미니) 확정 → relay 스크립트 1줄 작성. (2) S3 sleep round-trip 1회 검증(켜기·끄기) — 🔴 첫 발사 ack.
