---
date: 2026-05-23
node: 💻 노트북 (Lenovo Legion 5, RTX 3060, Windows + WSL2 Ubuntu)
severity: medium
status: resolved
tags: [windows, sleep, modern-standby, power-plan, remote-access, tailscale, notebook]
---

# 노트북 Windows Balanced 5h idle sleep → Tailnet offline, 원격 노드 통째로 끊김

## 사건 (KST)

- ~10:24: 노트북에서 LLT IOCTL 작업 마지막 산출물 mtime (`~/research/llt-step3-notebook-2026-05-23.md`). 이후 노트북 idle.
- ~15:24 (추정): Windows Balanced power plan 의 STANDBYIDLE AC = 5시간 timeout 도달, 시스템이 일반 S3 sleep 진입. Tailscale daemon 도 같이 정지 → Tailnet 에 offline 표시 (relay tok 잔재만 보이는 상태).
- 16:32: 형님 "야 노트북 왜죽었냐" (msg 22870). 본진이 ping/SSH 모두 timeout 확인 → "노트북 죽음" 판단, 형님 가설 "LLT IOCTL 80% 배터리 보존 설정 중 드라이버 크래시" 채택, 6/3 점장님 SMS 셋업 사이클 끝 핸드오프에 진단 todo 박음.
- 18:19: 형님이 노트북 앞에서 키보드(엔터/스페이스) 두드려도 wake 안 됨. 본진이 "frozen 또는 완전 off" 추정해 전원 버튼 5~10초 길게 권장.
- 18:20: 형님 "전원이 꺼져있는데?" → 본진이 전원 버튼 짧게 한 번 권장.
- 18:20: 형님 "절전모드 같기도하고" → wake 시도.
- 18:23: 노트북 wake PASS. Tailnet active 회복, WSL ssh 진입 PASS. **WSL uptime = 1d 15h** (계속 살아있었음, sleep 동안 timer 정지 X).
- 18:23~18:26: 본진 진단:
  - Windows last boot: 2026-05-22 00:10 — **오늘 재부팅 흔적 0**, 죽었던 적 없음
  - BugCheck/Critical 이벤트: **3시간 이내 0건** — BSOD/드라이버 패닉 흔적 없음
  - LLT 마지막 작업 mtime 10:24 vs 사건 발생 15:24 = **5시간 차이** → 시간상 LLT IOCTL 과 sleep 인과 없음
  - 활성 power plan: `SCHEME_BALANCED (균형)` 기본값
  - **STANDBYIDLE AC = 0x4650 = 18000s = 5시간** (정확히 LLT 작업 종료~sleep 진입 갭과 일치)
  - STANDBYIDLE DC = 3시간 / HIBERNATEIDLE AC,DC = 3시간
  - Modern Standby (S0): 지원 안 함. S3 traditional sleep 지원.

## 원인

- **Windows 기본 Balanced power plan 의 5시간 idle sleep** 이 그대로 활성 상태였음. 노트북을 5노드 mesh 의 원격 챗봇 노드로 쓰는데, 외출 중 또는 idle 시간 5시간 넘어가면 자동으로 sleep 진입 → Tailscale daemon 정지 → 본진/형님 폰에서 SSH·텔레그램 다 끊김.
- 형님 가설(LLT IOCTL 크래시) 은 시간 매칭상 인과 없음. 단순 plug-and-play 기본 power 정책의 부작용.
- 키 입력으로 wake 안 됐던 건 S3 sleep + USB-HID wake 설정이 일부 안 잡힌 듯 — wake source = 전원 버튼만으로 좁혀진 상태로 보임. (추가 진단 미수행)

## 보정 + 재발 방지

권장 셋업 (admin powershell, 노트북에서 한 번만 실행):

```powershell
# Sleep timeout 무한 (sleep 진입 자체 차단)
powercfg /change standby-timeout-ac 0
powercfg /change standby-timeout-dc 0
# Hibernate timeout 무한
powercfg /change hibernate-timeout-ac 0
powercfg /change hibernate-timeout-dc 0
# Hibernate 자체도 끔 (디스크/RAM 절약, 원격 노드라 hibernate 불필요)
powercfg -h off
# 모니터 timeout 은 유지 (화면만 꺼지고 sleep 안 함, 전기 절약 효과 + sleep 차단 양립)
# powercfg /change monitor-timeout-ac 10   # 필요 시 조정
```

옵션으로 lid action (lid 닫혀도 안 자게):

```powershell
powercfg /setacvalueindex SCHEME_CURRENT SUB_BUTTONS LIDACTION 0
powercfg /setdcvalueindex SCHEME_CURRENT SUB_BUTTONS LIDACTION 0
powercfg /setactive SCHEME_CURRENT
```

**UAC 함정 (재검증으로 일부 폐기)**: 본진이 실제 실행해보니 powercfg /change 4줄은 **사용자 권한으로도 통과** (exit=0). Windows 최신 버전이 일부 power 설정 user 허용. `powercfg -h off` 만 진짜 admin 필요 (exit=1, "관리자 권한 필요" 한국어 에러). Windows 11 24H2 내장 sudo.exe 는 기본 비활성(Settings → For Developers → Sudo) 이라 SSH 비대화형으론 우회 불가.

→ **실제 셋업 결과**: timeout 4종 = 0(무한) 설정 PASS. `powercfg -h off` 는 미적용이지만 hibernate timeout 도 0(무한)이라 자동 hibernate 진입 차단됨 = sleep 실효 차단. 디스크 절약(hiberfil.sys) 효과만 못 봄.

남은 옵션 (필요 시):
- (A) 노트북 앞에서 admin PowerShell 한 번 열어 `powercfg -h off` 한 줄만 실행 → hiberfil.sys 회수
- (B) Settings → For Developers → Sudo 활성화 후 SSH 비대화형 sudo 호출 가능 (단, GUI prompt 가 인터럽트로 뜰 수 있음)

**검증 값** (실측): STANDBYIDLE AC/DC = 0x0, HIBERNATEIDLE AC/DC = 0x0 (이전 0x4650/0x2a30/0x2a30/0x2a30 에서 변경).

5노드 mesh 전파 후보: 데스크탑(🖥) 도 같은 함정 가능. WSL 봇 hostname 이 DESKTOP-0VAB3QC* 인 노드도 외출 중 sleep 들어가면 동일 증상. 데스크탑은 데스크톱 PC 라 sleep 기본값이 다를 수 있어 별도 점검 필요.

## Lesson

- 노트북 = 5노드 mesh 원격 노드로 쓰려면 **Windows 기본 power plan 부적합**. 셋업 단계에 sleep 무한 설정 forcing function 으로 박아야 함.
- "노트북 죽음" 첫 신호 받으면 가설 점프(LLT 크래시 등) 전에 `Windows last boot` + `BugCheck 이벤트` + `STANDBYIDLE timeout` 3개 먼저 확인. 5시간 idle 갭이면 거의 단순 sleep.
- Karpathy 룰 1 (가정 명시) — 형님 가설을 그대로 가설로 받아도 첫 진단으로 부정 가능한지 layer-0 사실(last boot, bugcheck) 먼저 비교.
