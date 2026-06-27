# telegram-poll-watchdog macOS 패턴 블라인드 — "FP0 검증"이 실제 타깃 대조를 빠뜨려 healthy 세션 20분마다 kill

- 날짜: 2026-06-10
- 노드: 🍎 본진 진단·수정 / 🏭 맥미니 피해자(T-260610-04 빌더)
- 관련 task: T-260610-04(watchdog 신설), T-260610-10(핫픽스+재발방지)
- 커밋: b508bad(핫픽스), 3c1b4fc(재발방지)

## 증상
아니키 "맥미니 텔레그램은 왜 죽는거야" → 텔레그램에 "⚠️ 맥미니 폴러 사망 감지 → ✅ 재시작 완료(poll-watchdog 자동복구)"가 ~20분마다 반복 표시. 맥미니 claude 세션이 주기적으로 kickstart 당함.

## 근본원인
오늘 신설한 telegram-poll-watchdog(T-260610-04)의 폴러 생존 감지 패턴 `PROC_PAT="claude-plugins-official/telegram"`(슬래시)가 **macOS에서 실제 프로세스를 못 잡음**.
- Linux 노드: 별도 `bun run --cwd .../claude-plugins-official/telegram/<ver> start` 워커 프로세스 존재 → 슬래시-path 매칭됨.
- macOS(본진·맥미니): telegram 플러그인을 claude 프로세스 인프로세스로 돌려 그 슬래시-path bun 워커가 **없음**. cmdline은 `claude --channels plugin:telegram@claude-plugins-official`(@형) → 슬래시 패턴 0매칭 → pgrep 영구 "dead" 오판.
- 맥미니 restart_cmd = `launchctl kickstart -k com.user.tmux-claude`. dead 오판 → 매 cooldown(15min)+tick(10min)마다 kickstart → `-k`가 healthy 세션을 실제 kill = "텔레그램 끊김"의 정체. **self-inflicted false-positive 루프.**

## 더 깊은 메타원인 (재발방지 대상)
T-260610-04 보고는 "macOS·Linux 동일 패턴으로 잡힘 = 결정론적, 오판0"이라 **FP0를 주장**했으나, **실제 running 프로세스에 패턴을 대조하는 검증을 하지 않음**. dry-run은 로직 흐름만 봤고 "이 패턴이 이 OS의 살아있는 폴러를 정말 매칭하나"를 안 봄. → "검증했다는데 실제 타깃 대조 안 한 갭".

## 수정 + 재발방지
1. 핫픽스(b508bad): PROC_PAT → `plugin:telegram@claude-plugins-official`.
2. 재발방지(3c1b4fc):
   - **OR 패턴**: 5노드 실측 매트릭스 결과 프로세스 signature 2형태(@형=5/5, slash형=맥미니만 부재) → `@형|slash형` OR 결합으로 전 노드 결정론. dry-run 3회 5노드 alive 안정.
   - **fail-safe 패턴미스 게이트(confirm_dead)**: dead 판정 시 kickstart 전 넓은 패턴(claude-plugins-official) 재확인 → broad alive면 진짜死 아닌 PROC_PAT 버그로 보고 재시작 skip + ALERT만. healthy 세션 kill을 구조적으로 차단(오늘 버그가 있었어도 20분 루프 대신 알림 1통).

## 교훈 (일반화)
프로세스/파싱 감지 패턴(pgrep, CSS/text 셀렉터 등)은 **"실제 살아있는 타깃에 매칭되는지 전 플랫폼에서 실측"** 한 뒤에만 FP0/검증완료를 주장한다. 로직 dry-run ≠ 타깃 대조. 그리고 오탐이 fail-harmful(세션 kill·데이터 삭제) 동작으로 이어지는 가드는 항상 **확정 전 ground-truth 재확인 게이트**를 둔다(fail-safe). 같은 클래스: scrape.ts plan=None(텍스트 셀렉터가 페이지 변하면 silent null) — 별 task로 분리.

---

## 정밀조사 후속 (T-260610-12, 2026-06-10 21:2x, 🍎 본진 실측)

아니키 "세션 두 번 나가짐, 왜 두번이나 조사해봐"(msg36329) 후속 정밀조사. **위 §근본원인 line 15 의 "`-k`가 healthy 세션을 실제 kill" 단정은 메커니즘상 틀렸음**을 실측으로 정정한다.

### kickstart -k 는 healthy 세션을 못 죽인다 (no-op) — 프로세스 증거
맥미니 실측 (`ps -o pid,ppid,pgid,sess`):
- tmux 서버 pid 63366: `PPID=1, PGID=63366, SESS=0` → `tmux new -d` 가 **setsid + 데몬화**해서 launchd 잡의 프로세스 그룹을 완전히 이탈. 자기 세션 리더·자기 pgroup·init 입양.
- claude 63367: 그 서버의 자식.
- plist 에 `AbandonProcessGroup` 없음(기본 false) → launchd 가 잡 종료 시 죽이는 건 **잡의 프로세스 그룹**뿐인데, tmux 서버는 이미 그 그룹을 떠났음.
- 잡 본체(`/bin/sh -c "tmux has-session || tmux new..."`)는 즉시 exit(one-shot). `launchctl print` = `state not running, last exit code = 0, runs = 8` — 8회 전부 clean exit.

따라서 `kickstart -k com.user.tmux-claude` 동작은:
1. 잡 not running → `-k` 가 죽일 인스턴스 프로세스 없음(데몬 서버는 pgroup 이탈로 unreachable).
2. 재실행 → `tmux has-session -t claude` 성공(서버 생존) → `||` 단락 → exit 0.
3. **순수 no-op. 세션 생성도 파괴도 안 함.** kickstart 는 세션 *부재* 시 생성만 가능, 살아있는 세션 파괴 불가.

### 그럼 아니키가 본 "두 번 나감"의 실체
- **낮**: 패턴오판이 맥미니를 영구 false-"dead" 로 봐서 매 tick `kickstart -k`(no-op) + "⚠️폴러 사망→✅재시작" **거짓 알림 스팸**. 세션이 실제로 죽은 게 아니라 알림 도배 + (만약 in-process 폴러가 진짜 죽었다면 no-op kickstart 가 그걸 못 살림 = *무효 복구*)가 "텔레그램 왜 끊김" 체감의 정체. **세션 파괴는 아님.**
- **밤**: 본진 수동 stacked-폴러 정리(낡은 세션 kill + 재생성) → 현 21:15:00 fresh claude 세션. 이건 의도된 수동 재시작이지 버그 아님.

### 4개 후속질문 결론
1. **메커니즘**: no-op (위 증거). 프로세스 증거만으로 확정 — 파괴적 테스트 불요.
2. **그룹세션 잔재**: claude-63776/64099 둘 다 `attached=1`(live ssh client) + `client-detached kill-session` hook 보유 → detach 시 자가소멸. 현재 고아 0. 정리 불필요.
3. **24h 안정성**: 베이스라인 `runs=8` 기록. 핫픽스(b508bad/3c1b4fc/7f249cc) 배포 확인, watchdog --dry-run 이 이제 맥미니 `alive` 판정. 폴러 telegram :443 ESTAB 다수 활성 = 봇 정상 폴링. 자동 churn 정지 예상 → 24h 후 runs 안 늘면 해결 확정.
4. **KeepAlive**: **추가하면 안 됨(해로움)**. one-shot 이 exit 0 즉시 종료라 KeepAlive=true 면 tight relaunch 루프. 현 설계(RunAtLoad 1회 생성 + 데몬화된 tmux 서버가 독립 persist + watchdog 가 진짜 死만 처리)가 정답. **진짜 후속 = macOS in-process 폴러死(claude 생존·폴러 thread 死) 시 `has-session` 단락으로 kickstart 가 무효인 갭** → 복구 동작을 force-recreate(kill-session 후 kickstart)로 고쳐야. 이 갭은 기존 T-260610-06(macOS poll-hung 자동복구)가 소유 — 중복 task 신설 X, 거기로 흡수.

### 교훈 추가
fail-harmful 로 *추정한* 동작(여기선 "kickstart 가 세션 kill")도 메커니즘 실측 전엔 단정 금지. 프로세스 그룹/세션(setsid)·launchd 잡 추적 경계를 `ps -o pgid,sess` 로 확인하면 "kill 한다/안 한다"가 추측 아닌 증거가 된다. 패턴오판의 실제 피해는 *세션 파괴*가 아니라 *거짓 알림 + 무효 복구*였음 — 피해 성격을 틀리게 적으면 다음 세션이 잘못된 fix(KeepAlive 추가 등)로 감.

### 교차조사 연결: 세션死 실제 원인 = 메모리 jetsam (맥미니 21:35 보고)
정밀조사 직후 맥미니가 독립적으로 "오늘 tmux 서버 2회(낮+21시경) 통째로 죽음, uptime 7일이라 재부팅·패닉 아님, 16GB 메모리 고갈 jetsam 강제종료 유력(free 260MB·swap 2GB·누적 swapout 143만)"을 보고. **이게 본진 조사의 미해결 빈칸("21:15:00 왜 fresh 세션?")을 메움**:
- kickstart no-op 확정과 무모순 — watchdog 가 죽인 게 아니라 **메모리 압력(jetsam 유력)이 tmux 서버를 통째로 SIGKILL → launchd RunAtLoad/재실행이 `tmux new` 로 재생성**. kickstart 는 "세션 부재 시 생성"만 하므로 정확히 이 역할.
- 증거 정합: tmux 서버 63366 + claude 63367 둘 다 `STARTED 21:15:00` 정확 일치 + ttys006 21:15 tailnet 로그인.
- 따라서 본진의 "밤=수동 정리" 추정을 **"밤=메모리 크래시(jetsam 유력) 후 launchd 재생성"으로 정정**. jetsam 킬 로그는 양쪽 다 유니파이드로그 롤오버로 미확보 → **"유력 추정"** 유지(확정 아님).
- 현 시점 메모리 free 53%·swap 2GB used = 당장 급한 압력 아니나 상시 타이트. 누적 swapout 143만은 7일 부팅 누적이라 시점 지표 아님.
- 진짜 fix = 메모리 압력 모니터/자동회수 + 빌드·claude/codex 세션·크롬·시뮬레이터 시간대 분리(맥미니 근본예방 제안 대기). watchdog/KeepAlive 영역 아님.
