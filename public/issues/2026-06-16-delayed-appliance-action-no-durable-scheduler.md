# 2026-06-16 — "30분 후 에어컨 꺼줘" 가 안 꺼짐: 지연 가전제어용 durable 스케줄러 부재

- **노드**: 🪟 라이덴 (기록) / 사고 발생 세션은 미상(이전 세션, 노드 미확인)
- **트리거**: 아니키 "이전세션에서 30분 후 에어컨꺼달라고한거 안꺼진거 이슈박고 재발방지책 수립해" (2026-06-16 03:18 KST)
- **분류**: 신뢰성 / 자동화 인프라 갭 (외부영향 액션 누락)
- **상태**: 즉시 대응 완료(현 세션이 에어컨 수동 OFF), 근본 재발방지 = 미구축(설계+task 제안)

## 무슨 일이 있었나

아니키가 (정확한 시점 미상의) 이전 세션에서 **"30분 후 에어컨 꺼줘"** 를 요청. 30분 뒤 에어컨은 꺼지지 않았고, 한참 뒤 아니키가 직접 "아까 에어컨 꺼달라고 한거 껐어?" 로 확인. 현 세션(🪟 라이덴, 손0 auto-resume)이 상태를 확인 후 로컬 IR 토글로 **즉시 OFF 처리**(`1:True→False` 검증). 그 뒤 본 이슈 기록 지시.

## 검증된 사실 (실측)

- `tuya-control.py` 에 **지연/예약 발사 기능이 없음** — 내부 `time.sleep(spec.get("delay",1.5))` 는 멀티커맨드 시퀀스 간 간격일 뿐, "N분 후 발사" 가 아님. (grep: delay/schedule/at/cron/minute 매칭 0건)
- 🪟 라이덴에 **`at` 큐 없음**(atq 미설치), **에어컨 관련 cron 항목 없음**, 가전 예약/타이머 전용 스크립트 **부재**(`~/claude-skills/scripts/` 에 tuya-control.py 만).
- 즉 fleet 전체에 **세션과 독립적으로 살아남는 "지연 가전 액션" 메커니즘이 없음**.
- (별건·orthogonal) `wsl/tuya-ac-scene-redirect-T260616-02` 브랜치에 commit `2bf0070` = 죽은 `에어컨꺼/에어컨켜` SCENE 키 → 로컬 IR 토글 redirect 수정이 **미머지** 상태로 존재. 이건 *즉시* 명령의 잘못된 키 문제이지 *지연* 스케줄 갭과 다름.

## 추정 (미확정 — 어느 세션/노드가 드롭했는지 forensic 불가)

지연 가전 액션을 받은 이전 세션은 durable 스케줄러가 없으므로 다음 중 하나로 처리했을 것:
1. in-session 타이머(Bash `sleep 1800 && tuya...` background, 또는 ScheduleWakeup/loop) — **세션 클리어(40% 하드클리어 / `/clear`)나 노드 재시작 시 소멸**. 30분은 40% 하드클리어 윈도우보다 길어 거의 확실히 클리어에 걸림.
2. 구두 ack 만 하고 어떤 durable 타이머도 안 박음 → 조용히 드롭.

어느 쪽이든 **근본 원인 = 세션 생애주기에 묶인 타이머는 지연 외부영향 액션을 보장하지 못함.** 마킹/ledger 가 "커밋 없는 외부영향" 을 잡듯, 여기선 "미래 시점 외부영향" 을 잡을 OS-레벨 durable 스케줄이 없음.

## 재발방지책 (설계)

**원칙: 지연/예약 가전 액션은 세션이 아니라 OS-레벨 스케줄(launchd/타이머)에 박는다.** 채팅 세션이 클리어돼도 살아남아야 함.

권장 구현 (본진/맥미니 = 24/7 macOS + launchd + 집 LAN 직결 → 발사 호스트로 최적):

1. **`tuya-schedule.sh <delay|HH:MM> <device-key>`** (신규, 본진 소유)
   - 입력: 지연(예 `30m`)/절대시각 + 키(`에어컨`/`선풍기`/`물` 등).
   - 동작: 일회성 launchd job(`StartCalendarInterval`, label `com.claude.tuya-sched.<ts>`) 등록 → 목표 시각에 `tuya-control.py <key>` 발사 + **사전/사후 텔레그램 1통**(외부발신 검증 룰 정합) + 발사 후 job self-unload(가역).
   - 토글형 키(에어컨/선풍기)는 "꺼짐 보장"을 위해 발사 직전 상태 read 후 ON일 때만 토글(불가 시 사후 알림으로 결과 명시).
   - ad-hoc SMS launchd 패턴(`sms-job-template.sh`)·action-ledger 와 동형 — 발사 시 `action-ledger.sh log` 1줄.
2. **라우팅**: 지연 가전 발화("N분 후/몇시에 에어컨 꺼줘")는 본진 경유로 `tuya-schedule.sh` 호출. LAN 못 닿는 노드는 기존 relay 와 동일하게 본진이 발사 호스트.
3. **globals 가전 트리거 절(§8) 확장**: 즉시 토글 외에 "지연/예약" 케이스 = `tuya-schedule.sh` 명시.
4. (선택) Linux 노드 fallback: `at` 대신 `systemd-run --user --on-active=30min` 일회성 타이머.

## 즉시 조치 (완료)

- 현 세션이 에어컨 로컬 IR 토글로 OFF 확인(`1:True→False`).
- 본 이슈 기록 + 본진에 durable 스케줄러 구현 task 등록 요청(cross-node 인프라 = 본진 오케스트레이터 소유).

## 관련

- globals 가전 트리거 §8 / 외부발신 사전·사후 알림 룰 / action-ledger(커밋없는 외부영향) / ad-hoc SMS launchd wrapper 패턴
- 별건: `wsl/tuya-ac-scene-redirect-T260616-02`(즉시 명령 dead-scene redirect, 미머지)
