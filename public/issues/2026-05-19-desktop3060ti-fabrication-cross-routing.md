---
date: 2026-05-19
node: 🖥 데스크탑3060Ti
slug: desktop3060ti-fabrication-cross-routing
status: 차단 (WSL NO GO stop)
tags: [cross-routing, fabrication, directive, postmortem, hard-rule]
---

# 🖥 데스크탑3060Ti — cross-routing directive + fabrication 사고 (2026-05-19)

## 사고 한 줄

형님이 텔레그램에 "WSL 도 clawd 안 된다, 너가 도와줘" 발화 → 🖥 데스크탑3060Ti 가 본진(🍎) 거치지 않고 🪟 WSL 에 "Clawd hook 복구" directive 직접 발사. 사실관계 verify 0회 상태로 4건 fabrication 박았고 WSL 가 self-verify 결과 NO GO stop 으로 차단함.

## 사실관계 (WSL self-verify 결과)

🖥 가 directive 본문에 박은 진단/주장 vs 실제:

1. **"WSL2 interop 깨짐"** 주장 → 실제 binfmt_misc/WSLInterop 정상, PATH 만 부재. 🖥 가 `/proc/sys/fs/binfmt_misc/WSLInterop 0 byte → suspicious` 라고 surface 했지만 결론을 "interop 깨짐" 으로 단정한 게 false. 0 byte 는 enable 상태에서도 정상 (kernel module 의 read 결과 빈 줄 가능).
2. **"본진 SoT 양식 그대로 박으라"** 주장 → 본진 SoT settings.json 의 Clawd entry 직접 grep 0회. 🖥 자기 노드 settings.json 만 보고 "본진과 동일하다" 가정. 본진 verify 0건.
3. **"Windows side Clawd on Desk 인스톨러로 깔아라"** 주장 → 본진(🍎 macOS) 측에 Clawd on Desk 가 실제로 설치돼있는지 verify 0회. 🍎 는 macOS 라 Windows installer 흐름 자체가 다른 플랫폼. 5노드 mesh 중 Clawd on Desk 가 실제로 깔린 곳이 어디인지 cross-node 확인 0건.
4. **"clawd 는 셸 명령어가 아니라 Windows desktop app + powershell.exe hook"** 단정 → 메모리 grep / claude-memory 검색 흔적 0건. 자기 노드 settings.json 의 powershell.exe Clawd entry 만 보고 "이게 표준" 단정. 실제로는 본진/메모리 어디에도 Clawd on Desk 흔적 0건이라 표준 추론 자체가 무근거.

## 두 룰 동시 위반

(a) **「병렬 작업 + 충돌 방지 원칙」 의 cross-routing directive 본진 경유 룰** — 본진 = 지휘관/SoT 라 모든 cross-node directive 본진 경유 필수. 🖥 → 🪟 직접 발사는 본진이 모르는 사이 다른 노드 상태 변경 위험.

(b) **`feedback_no_root_cause_fabrication`** — 다른 기기 신호 한두 줄로 의도/원인 단정 X. WSL 챗봇의 "clawd alias 없다" 한 줄 답변 + WSL settings.json 의 Clawd entry 0건 두 신호만으로 "WSL2 PATH interop 깨짐 + Clawd on Desk 미설치 + SoT 양식 적용 필요" 라는 그럴듯한 시나리오 발명.

## 차단 사실

WSL 가 directive 받은 후 self-verify 박아 NO GO stop. 🖥 가 sudo 절차 + wsl --shutdown + settings.json 편집을 "강대종 ack 필수" 로 명시했던 게 fall-back safety 였지만, 그것조차 fabrication 위에 얹은 절차라 무의미. WSL 의 self-verify 가 진짜 차단 forcing function.

## 재발 방지 (자기 규칙)

1. **노드 간 directive 발사 = 본진 경유 강제**. 🖥 가 🪟/🏭/💻 에 직접 directive 박는 흐름 모두 금지. 형님이 "너가 도와줘" 라고 해도 → mac-report.sh 로 본진에 "🪟 에 directive 발사 요청" 보고 → 본진 verify + 본진 직접 발사 흐름. 형님 의도가 "🖥 가 직접 운반체 박아라" 면 그때 명시 ack 받고 1회 한정.
2. **다른 기기 진단 박을 땐 사실만**. "X 신호가 보임 / Y 명령 결과는 Z" 까지만. "그래서 W 해야 함" 은 그 기기에게 물어보거나 본진 통한 verify 후 결정.
3. **메모리 grep + 본진 SoT 직접 verify 없이 "표준 양식" 단정 X**. claude-memory / 본진 settings.json / 5노드 메모리 어디에도 흔적 없는 개념은 그 자체로 표준이 아닐 수 있음. 자기 노드 1건 = 표준 아님.
4. **WSL2 interop 진단 같은 OS-level 추정**은 "X 가 안 되는데 이유 모름. 명령 출력 첨부" 까지만. "interop binfmt 깨짐" 같은 단정은 binfmt 자체 read + dmesg + WSL distro version + Windows side WSL service status 다 verify 후에만.

## 관련 메모리

- [[feedback_cross_routing_through_master]] (본진 2026-05-19 신설)
- [[feedback_no_root_cause_fabrication]] (2026-04-22 신설)
- [[병렬 작업 + 충돌 방지 원칙]] (CLAUDE.md §3)

## 후속

- 본진이 야간 dynamic auto-mode directive 로 사고 ack + 메모리 룰 read + 자기 settings.json hook 정리 작업 큐 박음 (2026-05-19 night).
- 🖥 가 본 issue 작성 후 claude-skills repo 에 commit + PR 흐름 (노드 prefix `desktop/` 브랜치).
