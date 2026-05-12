---
title: "Claude Code /loop 와 launchd / /schedule — 3가지 스케줄 메커니즘과 만료 정책"
date: 2026-05-13
tags: [claude-code, loop, cron, launchd, schedule, lifecycle, session]
severity: low
category: 챗봇/세션
---

## 배경

Claude Code 안에서 "주기적으로 실행" 을 구현하는 메커니즘이 3가지나 있어 헷갈리기 쉬움. 각각 종료 정책 / 세션 의존성 / 실제 수명이 전부 다르다. 한 번 정리:

1. Claude Code **내장 `/loop`** — fixed-interval / dynamic 2모드
2. Claude Code **`/schedule`** — Anthropic 원격 routine (cloud cron)
3. **macOS launchd / 시스템 cron** — OS 레벨

## 비교표

| | `/loop` fixed (`/loop 5m foo`) | `/loop` dynamic (`/loop foo`) | `/schedule` | macOS launchd |
|---|---|---|---|---|
| 메커니즘 | `CronCreate` (Anthropic in-session) | `ScheduleWakeup` (per-turn) | Anthropic 원격 routine | OS launchd plist |
| 세션 의존 | ✅ 세션 죽으면 멈춤 | ✅ 세션 죽으면 멈춤 | ❌ 독립 | ❌ 독립 |
| 자동 만료 | **7일 cap** | 자동 cap 없음 | (routine 설정) | 없음 (plist 살아있는 한 영구) |
| 끄는 법 | `CronDelete` / 세션 종료 | "loop stop" → 모델이 wakeup 생략 / 세션 종료 | `/schedule` 명령 | `launchctl unload` + plist 삭제 |
| 적합 케이스 | 짧은 in-session 폴링 (5분~수시간) | 모델이 스스로 페이스 정함 (지능형 loop) | 영속 cloud cron (예 일일 todo 리마인더) | 머신 부팅 시 / 영구 백그라운드 워커 |

## `/loop` 슬래시의 두 모드

`/loop` 의 첫 토큰이 `^\d+[smhd]$` 패턴이면 **fixed-interval**, 아니면 **dynamic**.

### fixed-interval

`/loop 5m /babysit-prs` → 5분마다 `/babysit-prs` 재실행.

내부:
1. `*/5 * * * *` cron 표현식으로 `CronCreate` 호출 → recurring=true 등록.
2. 등록과 동시에 즉시 1회 실행.
3. 매 5분마다 fire — Anthropic 의 session-attached scheduler 가 깨움.

종료:
- `CronDelete` (모델이 자연어 "stop" 받으면 호출)
- 세션 종료 / `/clear`
- **7일 자동 만료** — Anthropic 측 안전장치

확인 메시지에 박혀있음:
> _Runs until you close this session · For durable cloud-based loops, use /schedule_

### dynamic

`/loop check the deploy` 같이 interval 토큰 없으면 dynamic.

내부:
1. 모델이 prompt 한 번 실행.
2. 매 turn 끝에 `ScheduleWakeup(delaySeconds=N, prompt="/loop check the deploy")` 호출 → N초 뒤 다시 깨움.
3. N 은 모델이 매 iter 마다 결정 (캐시 윈도우 고려, 보통 1200–1800s).

종료:
- 모델이 `ScheduleWakeup` 안 부르면 그 시점에 체인 끊김 (자연어 "stop" 받았을 때).
- 세션 종료 / `/clear`.
- 자동 cap **없음** — 사실상 세션이 살아있는 한 무한.

## 실제 케이스 (2026-05-13 새벽)

`/loop 3` 한 번 입력 → "3" 이 시간 토큰 아니라 dynamic 진입. 모델이 직전 surface 한 옵션 3 (잡일 트랙) 으로 해석해 12 iter × 약 25–60 분 간격으로 4시간 44분 굴러감.

- iter 1~5: 25분 간격 (활동 많을 때)
- iter 6~11: 35분 (자체 픽 풀 줄어들면서)
- iter 12: 60분 (idle 모드)

사용자가 중간에 "뭐할까" 메시지 보내자 **현재 turn 은 깼지만 큐의 wakeup 은 여전히 살아있음** — 명시 stop 안 부르면 다음 fire 시간 되면 다시 깨움. dynamic loop 은 user 발화 한 번으론 영구 중단되지 않음.

## launchd 비교: 인스타포스트 예

`/insta-post` 자동 발행은 launchd 등록:

```bash
$ launchctl list | grep insta
-	0	com.claude.insta-post-nightly

$ ls ~/.claude/automations/launchd/com.claude.insta-post-nightly.plist
ok
```

이건 (3)번 mechanism — plist 살아있는 한 영구 발사. 세션·7일과 무관. 끄려면:

```bash
launchctl unload ~/Library/LaunchAgents/com.claude.insta-post-nightly.plist
rm ~/Library/LaunchAgents/com.claude.insta-post-nightly.plist  # 또는 비활성화
```

## 결정 트리

- **"이 세션 동안만 빠르게 폴링"** → `/loop Nm`
- **"모델이 스스로 페이스 정해서 굴려"** → `/loop <prompt>` (dynamic)
- **"세션 종료 후에도 매일 실행"** → `/schedule` 또는 launchd plist
- **"부팅 시부터 자동 실행 + 영구"** → launchd plist 만 정답

## 확인 명령

```bash
# 현재 등록된 in-session cron 확인 (CronList)
# → Claude Code 안에서 자연어 "what crons are running" 또는 CronList 직접

# 현재 깨워질 예정인 ScheduleWakeup 확인
# → Claude Code 안에서 자연어 "show pending wakeups"

# launchd 잡 목록
launchctl list | grep claude

# /schedule routines
# → Claude Code 안에서 /schedule list
```

## 함정

1. **fixed-interval `/loop 5m` 의 7일 cap 을 dynamic 에도 있다고 오해.** dynamic 은 cap 없음.
2. **user 가 다른 발화하면 dynamic loop 도 자동 종료된다고 오해.** 큐의 wakeup 은 살아있음. 명시 stop 필요.
3. **launchd 잡과 `/loop` 를 같은 cron 으로 묶어 생각.** 메커니즘이 전혀 다름 — 세션 의존성·만료가 정반대.
4. **`/schedule` 과 `/loop` 혼동.** 전자는 영구 cloud cron, 후자는 세션 한정.

## dynamic loop 의 컨텍스트·토큰 비용

dynamic 이 사실상 무한 굴러갈 수 있다 = 컨텍스트도 무한히 쌓이는가? 토큰은? 컨텍스트 다 차면?

### 토큰 소진

매 iter 마다 모델이 전체 대화 히스토리(시스템 프롬프트 + 누적 turn) 를 다시 읽음. 그래서:

- 초기엔 iter 당 input 토큰 = 시스템(~30k) + 누적 turn (작음) ≈ 35k 정도.
- 100 iter 쯤 가면 누적 turn 이 수십 만 토큰까지 가능 → input 비용 매 iter 곱하기.

**완화 장치 = prompt caching.** 시스템 프롬프트 + 이전 turn 의 안정된 prefix 부분은 캐시 hit 으로 10배 싸게 청구됨 (cache read 가격). 매 5분(=cache TTL) 안에만 깨면 효과 큼.

- 25분 wakeup → 매번 cache miss → input 비용 5–10배 커짐.
- 270초(4.5분) wakeup → cache hit → 1/10 가격.

`ScheduleWakeup` 도구 description 에 "5분 TTL" 가이드가 박혀 있음. 그래서 dynamic 에서 **딜레이를 300 초 바로 위로 잡으면 worst-of-both** — cache miss 페이 + 짧은 간격에 따른 잦은 fire. 250~270초 (cache 유지) 또는 1200초+ (한 번의 miss 를 길게 amortize) 가 권장.

### 컨텍스트 한계

Claude 모델은 윈도우 한계 있음 (Opus 4.7 200K 토큰). dynamic loop 이 그걸 넘기면?

- **자동 컴팩션** — Claude Code harness 가 대화 한계 임박하면 오래된 turn 을 요약으로 압축. user 입장에선 끊김 없이 계속 가능.
- 단 압축이 무손실 아님 — 세부 사항 / 정확한 파일 경로 / 메모리 등 손상 가능. 압축 직후 모델이 이전 컨텍스트 살짝 헷갈리는 케이스 종종 발생.
- harness 가 "context auto-compacted" 같은 알림 surface 함.

### 권장 사용 패턴

- **단기 dynamic loop (수 iter, 1~2시간)** = 안전. 컨텍스트 압박 약함, 토큰 비용도 통제 가능.
- **장기 dynamic loop (수십 iter, 반나절+)** = 모니터링 필요. fallback delay 길게 잡고, 자체 픽 풀 고갈되면 명시 stop.
- **사실상 영구 백그라운드 워크** = `/loop` 적합 X. launchd 또는 `/schedule` 로 옮길 것. 그쪽은 매 fire 가 별도 세션 = 컨텍스트 누적 0.

### 이번 세션 케이스

12 iter × 약 4시간 44분. iter 사이 평균 22분 (300초 cache TTL 초과) — cache hit 못 받고 매 iter input 비용 full price. 누적 컨텍스트도 약 50~60k 토큰 추가 (각 iter 의 search 결과 + tool output). 한계 200K 의 30% 정도 — 컴팩션 발동 전.

장기 굴리려 했다면 **`/schedule`** 또는 launchd plist 로 옮기는 게 비용·안정성 둘 다 우위.

## 관련

- `/schedule` 스킬 — durable cloud routine
- `/loop` 스킬 — in-session pacing
- `~/.claude/automations/launchd/` — 영구 launchd plist 모음
- 인스타포스트 (`com.claude.insta-post-nightly`) / night-runner (`com.claude.night-runner`) / nightly-update (`com.claude.nightly-update`) — launchd 잡 예시
