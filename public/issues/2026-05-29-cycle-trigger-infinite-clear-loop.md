# 본진 세션 30분마다 저절로 초기화 — cycle-trigger launchd 잡 + next-cycle.md 잔재 무한 /clear 루프

- **발생 일자:** 2026-05-29 07:17 KST 부터 (cycle-trigger.log 첫 fire) ~ 21:56 KST 까지 종일
- **가시화:** 2026-05-29 22:00 KST (아니키 msg "왜 저절로 세션이 초기화되는건지 알아봐줘 이거 심각한버그같다" + 스크린샷)
- **해결 일자:** 2026-05-29 ~22:00 KST (본진 자율 fix, 가역)
- **심각도:** HIGH (본진 세션 컨텍스트가 30분마다 통째로 날아감 — 작업 연속성·핸드오프 손실, 아니키 trust 손실)
- **재발 가능성:** 없음 (2026-06-04 폐기 마무리 검증 완료 — 아래 「폐기 마무리」 섹션). 루프 트리거(cycle-trigger 잡) bootout + 조건 파일(next-cycle.md) 부재 + 책임훅·systemd·launchd 전부 `_disabled/`.
- **막을 코드/훅:** [[feedback_retire_infra_verify_trigger_condition_hook]] (폐기=트리거+조건+책임훅 3종 세트 검증) + next-cycle.md 인프라 전부 `_disabled/` 이관 (skills/automations 양 repo, verified 2026-06-04)

## 증상

본진 claude 세션이 아무도 안 시켰는데 30분 간격으로 저절로 /clear (초기화) 됨. 이 사고를 진단한 세션 자체도 21:56:38 cycle-trigger fire 로 초기화된 직후 아니키 "바로 시작"(21:57:36) 으로 시작됨 — 진단자가 방금 당한 케이스.

## 탐지 (Phase 1 root cause investigation)

1. `~/.claude/skills/issues/` 최근 파일 → autopilot-schedulewakeup-leak, mac-zshrc-empty-session-race 등 검토 (둘 다 별건 — 전자는 autopilot 재발화, 후자는 cc 안 붙음).
2. `grep -rln "/clear" ~/.claude/hooks ~/.claude/automations` → session-clear-trigger.sh (Stop hook), session-clear-rescue.sh (WatchPaths), **cycle-trigger.sh** 발견.
3. `launchctl list | grep -Ei "cycle|clear"` → `com.daejong.cycle-trigger` (loaded, exit 0), `com.claude.next-cycle-rescue` (loaded, **exit 127** = 스크립트 부재), `com.daejongkang.session-clear-watcher` (exit 0).
4. cycle-trigger.plist: `StartInterval=1800` (30분), `cycle-trigger.sh` 호출.
5. cycle-trigger.sh: `[[ -f ~/.claude/next-cycle.md ]] || exit 0` 후 존재 시 tmux `claude` 세션에 `/clear` (TRIGGER_MSG 기본값) paste + Enter.
6. `stat ~/.claude/next-cycle.md` → **존재** (mtime 07:49, 1812 bytes).
7. **`cycle-trigger.log` → 07:17~21:56 KST 30분 간격 30줄 전부 `fired: pasted '/clear'`** ← 스모킹건.
8. session-clear-trigger.log 의 21:5x 다발 fire 는 전부 `marker=gone` no-op (진단 세션의 Stop hook 자기 turn 들) — 별건 무해, 2차 벡터 아님.

## 근본 원인

**폐기 절반(incomplete retirement).** 2026-05-28 next-cycle.md 인프라 폐기 (CLAUDE.md hard rule) 때:
- SessionStart inject/archive 훅 → `_disabled/` 로 이동 (이 훅이 /clear 후 next-cycle.md 를 archive 로 치워 cycle-trigger 를 idempotent 1-shot 으로 만들던 책임자).
- **그런데 30분마다 /clear 쏘는 `com.daejong.cycle-trigger` launchd 잡은 안 끔.** + `next-cycle.md` 파일도 디스크에 잔존.

결과: archive 훅이 죽어 next-cycle.md 가 영원히 안 치워짐 → cycle-trigger 의 `[[ -f next-cycle.md ]]` 가 항상 true → 30분마다 무한 /clear. cycle-trigger.sh 주석("SessionStart hook will auto-archive")이 이미 없는 훅을 전제로 박혀 있어 idempotent 가정이 깨진 채 영구 루프.

## 조치 (전부 가역)

1. `mv ~/.claude/next-cycle.md ~/.claude/_archive/next-cycle-2026-05-29-2200KST.md` — 루프 조건 즉시 소멸 (launchctl 0, 순수 파일 이동).
2. `launchctl bootout gui/$(id -u)/com.daejong.cycle-trigger` + plist → `~/Library/LaunchAgents/_disabled/`.
3. `launchctl bootout gui/$(id -u)/com.claude.next-cycle-rescue` + plist → `_disabled/` (exit 127 죽은 같은 폐기 인프라 동반 정리).
4. `_disabled/RETIRED.md` 에 복원법 기록.
5. 검증: `launchctl list` 에서 두 잡 소멸 PASS + next-cycle.md 부재 PASS + nightly-update 가 plist 재bootstrap 안 함 확인 (durable).

## 재발방지

1. **인프라 폐기 = 트리거+조건+책임훅 3종 세트로 검증** — 어떤 자동화를 폐기할 때 (a) 트리거(launchd/cron 잡) (b) 조건 파일 (c) 그 조건을 청소하던 책임 훅 셋을 한 번에 확인. 하나만 빼면 나머지가 fail-deadly 루프. [[feedback_verify_pr_scope_before_directive]] 의 폐기-검증 버전.
2. **follow-up (별 task)** — session-clear / autopilot / todo / globals SKILL.md 에 남은 next-cycle.md 쓰기/참조 잔재 청소. 이제 cycle-trigger 죽어 무해하나 폐기 마무리.
3. **Linux 노드 점검 (별 task)** — claude-automations/systemd/next-cycle-rescue.{service,timer} 존재. 5노드(🪟🖥💻)에 동일 무한 clear 루프 있는지 sweep (codex 백엔드는 auto-compact 라 영향 다를 수 있음).
4. **재발 시** — "세션 저절로 초기화" 패턴 잡히면 즉시 `tail ~/.claude/automations/logs/cycle-trigger.log` + `launchctl list | grep cycle` 확인.

## 폐기 마무리 (2026-06-04, 🪟 라이덴 검증)

위 「재발방지」 #2 (skills 잔재 청소) · #3 (Linux 노드 systemd sweep) follow-up 별 task 를 검증·종결. 폐기 절반(incomplete retirement) 상태가 완전 해소됐다.

- **#2 skills 잔재 청소 — 완료 확인.** session-clear/autopilot/todo/globals SKILL.md 의 실제 좀비 재생성 코드(클리어마다 next-cycle.md 를 `cat >` 로 쓰던 session-clear 2.5절 write 블록)는 `b92dfa2` 로 이미 RETIRED. claude-skills `_disabled/` 외 live write/regeneration grep = **0건**. 남은 next-cycle 참조는 전부 정당한 자산이라 보존: (a) globals/CLAUDE.md 폐기 hard rule, (b) session-clear 2.5 RETIRED 정정 노트 + v2.x changelog 히스토리, (c) todo/autopilot SKILL.md 의 정확한 폐기 안내, (d) issue 포스트모템(불변), (e) `_disabled/fleet-clear` 아카이브. 이들을 지우면 audit trail 손실이라 미제거(국소 변경 원칙).
- **#3 Linux 노드 systemd sweep — 완료 확인.** automations `origin/main` 의 next-cycle 인프라 5종(`session-start-next-cycle-inject.sh` 훅 / `com.claude.next-cycle-rescue.plist` / `next-cycle-rescue.sh` / `next-cycle-rescue.service` / `.timer`) 전부 `_disabled/` 이관 완료(PR #83 등). 🪟 라이덴 실측: live `~/.claude/next-cycle.md` 부재, 활성 systemd `--user` next-cycle unit/timer 0건. 무한 clear 루프 벡터 소멸.

남은 별건(이 이슈 범위 밖, 본진 surface): 일부 노드의 automations **로컬 클론이 정체 브랜치(`wsl/deepseek-vote-2026-06-01`)에 묶여** PR #83 미반영 — 그 노드가 돌리는 choso-ping.sh 는 (이제 inert 한) next-cycle dead 게이트 구버전을 아직 실행. 클론을 main 으로 복귀시키면 해소. 정체 브랜치 처분(PR #81)은 본진/merge-janitor 결정.
