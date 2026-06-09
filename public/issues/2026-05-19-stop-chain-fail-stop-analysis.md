# Stop chain `||` 단축 평가 fail-stop 위험 분석

- 날짜: 2026-05-20 KST (이슈 파일명은 본진 directive 의 2026-05-19 슬러그 유지)
- 노드: 💻 노트북3060 (`@ssamssae_codex_bot`, DESKTOP-4MNJ1C0)
- 트리거: 🍎 본진 야간 자율 directive (cmd1 || cmd2 패턴이 hook fail-stop 측면에서 위험한지)

## 결론 (TL;DR)

노트북3060 의 `~/.claude/settings.json` 은 **이미 안전한 패턴 (별 entry 분리)** 으로 구성됨. `||` 단축 평가는 hook command 문자열 자체에는 등장하지 않고, 개별 hook 셸 스크립트 내부에서만 **방어적 가드** 용도로 쓰임. 별 entry 로 분리한 현재 구조 그대로 유지 권장 — 추가 액션 없음.

## 1. settings.json 구조 점검

`.hooks.{PreToolUse|PostToolUse|Stop|SessionStart|UserPromptSubmit|PermissionRequest}` 각 이벤트는 matcher 별로 `.hooks[]` 배열을 가지고, 배열의 각 entry 가 `{type: "command", command: "bash ~/...", timeout, async}` 형태로 분리됨. 예시 (Stop 이벤트):

```
Stop[0].hooks = [
  {command: "bash ~/.claude/hooks/session-clear-trigger.sh", timeout: 10, async: true},
  {command: "bash ~/.claude/hooks/telegram-reply-check.sh", timeout: 5},
  {command: "bash ~/.claude/hooks/mac-report-reverse-reply-check.sh", timeout: 5},
  {command: "bash ~/.claude/hooks/handoff-check.sh", timeout: 5},
  {command: "bash ~/.claude/hooks/activity-writer.sh", timeout: 10, async: true},
  {command: "bash ~/.claude/hooks/telegram-typing-stop.sh", timeout: 5, async: true},
  {command: "bash ~/.claude/hooks/telegram-stop-ping.sh", timeout: 10, async: true},
  {command: "python3 $HOME/.claude/automations/hooks/context-threshold-alert/alert.py", timeout: 10, async: true},
  {command: "bash ~/.claude/hooks/stop-check-repos-dirty.sh", timeout: 10, async: true},
  {command: "bash ~/.claude/hooks/stop-sync-skills.sh", timeout: 30, async: true},
]
```

- 각 entry 는 **독립 실행** — 하나의 hook 가 non-zero exit 해도 같은 array 의 다음 entry 실행에 영향 X (Claude Code harness spec).
- `command` 문자열 안에 `||` / `&&` / `;` chain 연산자 사용 사례: **0 건** (`jq` 로 전수 검사).

## 2. 셸 스크립트 내부 `||` 사용 패턴 분류

`~/.claude/hooks/*.sh` 안에서 발견된 `||` 30+ 케이스 분류:

### (A) Early exit guard — `[ -n "$x" ] || { log "skip"; exit 0; }` ✅ 안전

대표 사례:
- `memory-auto-push.sh:12`: `[ -n "$file_path" ] || { echo "skip: no file_path"; exit 0; }`
- `memory-auto-push.sh:25`: `[ -d "$memory_dir/.git" ] || { echo "skip"; exit 0; }`
- `handoff-check.sh:23,27`, `activity-writer.sh:14,25,30` 등

의도: 입력 누락/환경 부재 시 hook 자체를 즉시 성공 종료 (exit 0). hook 체인의 후속 entry 가 별 entry 이므로 별도 영향 없음.

### (B) Error tolerance — `cmd 2>/dev/null || true` ✅ 안전

대표 사례:
- `memory-auto-push.sh:43`: `git rebase --abort 2>/dev/null || true`
- `coord-auto-push.sh:38,59`, `posttooluse-sync-automations.sh:35,38,50,60-63`, `stop-sync-automations.sh:22,26`, `choso-ping.sh:27`

의도: 실패 가능 명령 (race 조건이 있는 git/ssh 등) 의 exit 코드를 swallow 해서 hook 가 무조건 0 으로 끝나도록. 이건 fail-stop 의 반대 (fail-pass) 인데, 의도적 — hook 가 깨지면 다른 hook 도 영향받아서 일부러 swallow.

### (C) Default value fallback — `var=$(cmd 2>/dev/null || echo 0)` ✅ 안전

대표 사례:
- `heartbeat-check.sh:62`: `last_ping=$(cat "$PING_FILE" 2>/dev/null || echo 0)`
- `skill-log.sh:5,13,22`, `mcp-spawn-verify.sh:38`

의도: 값 추출 실패 시 기본값으로 변수 채움. 본문 흐름에 영향 0.

### (D) "위험한" `cmd1 || cmd2` chain — **0 건**

수집된 모든 케이스가 `cmd || true` / `cmd || exit 0` / `cmd || echo default` / `cmd || { exit 0; }` 형태로 **두 번째 항이 부작용 없는 종료 / 무명령** 임. 첫 명령 실패가 두 번째 부작용 명령을 트리거하는 패턴 (= 잠재적 fail-stop 우회) 은 **발견되지 않음**.

## 3. 별 entry vs `||` chain 안전성 비교

| 방식 | fail isolation | observability | timeout | async 지원 |
|---|---|---|---|---|
| 별 entry (현재) | ✅ 각 entry 독립 | ✅ hook 별 log 추적 | ✅ entry 별 설정 | ✅ entry 별 async |
| `cmd1 || cmd2` chain | ⚠️ cmd1 fail 이 cmd2 트리거 | ⚠️ chain 단위 합산 | ⚠️ 합산 timeout | ❌ chain async X |

별 entry 패턴이 모든 축에서 우세. 현재 노트북3060 설정은 모범 사례 그대로.

## 4. 권장 / 비권장

✅ 권장 (현행 유지):
- 새 hook 추가 시 별 entry 로 분리, `{command: "bash ~/.claude/hooks/...", timeout, async}`
- 셸 스크립트 내부에서는 `[ ... ] || exit 0` / `cmd || true` 가드만 사용

❌ 비권장 (도입 X):
- settings.json command 문자열 안에 `cmd1 && cmd2` / `cmd1 || cmd2` 체인
- 한 entry 가 여러 책임 (skill log + telegram + git push 등) 동시 처리

## 5. 다른 노드 cross-check 후속 후보

이번 분석은 노트북3060 settings.json 에 한정. 본진(🍎) / WSL(🪟) / 맥미니(🏭) / 데스크탑(🖥) 도 동일 패턴 (별 entry) 인지 확인하려면 본진 directive 로 4 노드에 동시 점검 SSH 한 번 fan-out 하면 cheap. 본 사이클 scope 밖.

## 근거

- `jq '.hooks.Stop[0].hooks | length'` = 10
- `jq -r '.. | strings | select(test("\\|\\|"))'` 결과 = 0
- `grep -rn -E '\|\|' ~/.claude/hooks/*.sh` 결과 = 모두 (A)/(B)/(C) 패턴
