---
prevention_deferred: null
---

# 안 닫힌 loop 세션이 Clawd stale 행 + 타이핑 데몬 죽임 (sibling 세션 부작용)

- **발생 일자:** 2026-05-20 19:27 KST (memoyo-loop 세션 stuck 시작)
- **해결 일자:** 2026-05-21 00:35 KST (stuck 세션 종료)
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** 🍎 본진 — 자율 loop/directive 세션, Clawd on Desk 활동 표시, 텔레그램 입력중(typing) 인디케이터

## 증상
1. Clawd on Desk(본진 데스크탑 펫)에 `simple_memo_app` 행이 둘 뜸 — 하나는 활성(12초 전), 하나는 4시간 전 stale 한 채 안 사라짐.
2. 텔레그램 "입력중" 표시가 작업 중인데 뜨다가 금방 꺼짐(예전엔 답변 직전까지 계속 떴음).

## 원인
본진에 claude 세션이 둘 떠 있었다 — 메인 텔레그램 세션(PID 2131) + memoyo #14 돌리려던 `memoyo-loop` tmux 세션(PID 19793, 19:27 시작). memoyo-loop 은 디렉티브 paste 시 따옴표가 안 닫힌 채 들어가 zsh `bquote>` quote-continuation 프롬프트에 박제됨 → ~5시간 idle, 자동 종료 메커니즘 없어 무한 잔존.

이 안 닫힌 sibling 세션이 두 부작용을 동시에 냈다:
- **(증상1)** Clawd 훅이 세션별 활동을 cwd(프로젝트)명 행으로 표시하는데, stuck 세션이 안 죽으니 "4시간 전" stale 행으로 남음.
- **(증상2)** `telegram-typing-start.sh` 의 orphan 청소 로직이 "부모 프로세스 죽은 데몬"을 지우는데, 타이핑 데몬은 `nohup` 으로 띄워 부모(훅 프로세스)가 즉시 사라지고 ppid=1(init)이 된다. `kill -0 1` 은 비루트에서 EPERM(실패) → "부모 죽음"으로 오판. 청소 루프는 현재 세션 PIDFILE 만 skip 하므로, **두 번째 세션의 훅 활동이 메인 세션의 타이핑 데몬을 형제 orphan 으로 오인해 죽임.** heartbeat 로그상 sibling 활성 동안 데몬이 `start, iter=0` 후 60초 내 반복 사망 확인.

## 조치
- 멈춘 `memoyo-loop` tmux 세션 종료(`tmux kill-session`), orphan claude(PID 19793) 정리 → Clawd stale 행 해소 + 타이핑 간섭 소스 제거.
- 메모리 정정: `reference_wsl_clawd_pet_hooks` 가 "Clawd=WSL"로만 적혀 본진 증상을 WSL 탓으로 헛짚게 했음 → `memory/reference_clawd_on_desk_mac_main.md` 신설(본진 맥북에도 `/Applications/Clawd on Desk.app` 설치 사실 + 세션 행 표시/ stale 함정 기록), MEMORY.md 인덱스 갱신.

## 예방 (Forcing function 우선)
1. **타이핑 orphan 청소를 ppid 기준 → PIDFILE 세션 생존 기준으로 교체** (코드 수정, 다음 사이클): `telegram-typing-start.sh` 의 orphan 판정에서 `ppid==1`(정상 detached nohup 데몬)을 "부모 죽음"으로 보지 말 것. PIDFILE 이 가리키는 세션의 claude 프로세스가 실제 살아있는지로만 청소 판단. → sibling 세션이 떠 있어도 남의 데몬 안 죽임.
2. **자율 loop/directive 세션 idle 타임아웃**: spawn 시 무활동 타임아웃(예: 30분) 걸어 stuck 세션이 무한 잔존하지 못하게 자동 self-close. 이는 핸드오프의 stale-detector / autopilot 자율화 작업과 같은 결 — 한 번에 얹기.
3. **감지**: heartbeat 로그에 `start, iter=0` 가 짧은 시간 내 N회 반복되면 sibling 간섭 의심으로 본진에 알림(저비용 로그 grep).

## 재발 이력
<처음 생성>

## 관련 링크
- 메모리: `memory/reference_clawd_on_desk_mac_main.md`, `memory/reference_wsl_clawd_pet_hooks.md`
- 훅: `~/.claude/hooks/telegram-typing-start.sh`, `telegram-typing-daemon.sh`
- 텔레그램 메시지: id 20992~21008
