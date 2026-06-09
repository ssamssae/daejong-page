---
category: 자동화
tags: [launchd, macos, bootstrap, verification, silent-failure, daemon, scheduling]
first_discovered: 2026-04-21
related_issues:
  - 2026-04-21-launchd-silent-job-dropout
---

# launchd register/bootstrap 직후 actually-running 검증 게이트 — silent fail 차단

- **첫 발견:** 2026-04-21 (등록된 잡 2개가 며칠~몇 주 침묵 실행 실패)
- **재사용 영역:** macOS LaunchAgent / LaunchDaemon 을 install.sh 또는 수동으로 등록하는 모든 자동화 사이클

## 한 줄 요약

`launchctl load`/`launchctl bootstrap` 가 **silent-fail** (exit 0 로 떨어졌는데 실제 등록은 안 됨) 하는 케이스가 일상적이다. plist 파일 존재 ≠ 잡 활성. **bootstrap 직후 `launchctl list` (또는 `print`) 로 actually-loaded 검증** + **list 에 없으면 stderr loud + exit 1** 두 단계가 디폴트 게이트. `unload`/`load` 한 짝은 silent fail 잘 일으키니 `bootout`/`bootstrap` 으로 교체.

## 언제 쓰는가

- 새 LaunchAgent plist 작성 + 등록할 때
- install.sh 류 셋업 스크립트가 launchctl 호출하는 모든 지점
- 주기적 (cron-like) 잡이 갑자기 안 도는 것 같을 때 진단
- macOS 메이저 업그레이드 후 자동화 잡 회귀 의심될 때

## 차단 시그니처

가시화 자체가 어려움. 흔한 발견 경로:
- `launchctl list | grep <prefix>` 결과에 plist 파일은 있는데 등록 라인이 안 보임
- 정해진 시각에 발동돼야 할 잡의 wrapper log (`/tmp/<job>-wrapper.log`) 가 며칠째 비어있음
- 사용자가 "그거 자동으로 돌고 있다며?" 라고 물었을 때 처음 알아차림

## 절차

### A. bootstrap + 검증 (best)

```bash
#!/usr/bin/env bash
set -e
PLIST="$HOME/Library/LaunchAgents/com.example.myjob.plist"
LABEL="com.example.myjob"
DOMAIN="gui/$(id -u)"

# 1) 깨끗한 상태로 만들기 (있으면 bootout)
launchctl bootout "$DOMAIN" "$PLIST" 2>/dev/null || true

# 2) bootstrap (load 보다 명시적, 실패 시 exit non-zero 잘 떨어짐)
launchctl bootstrap "$DOMAIN" "$PLIST"

# 3) actually-loaded 검증 — 가장 중요
if ! launchctl list | grep -q "$LABEL"; then
  echo "❌ launchctl bootstrap 성공처럼 보였지만 list 에 $LABEL 없음 (silent fail)" >&2
  echo "   plutil -lint '$PLIST' 로 syntax 재검증 + console.log 확인" >&2
  exit 1
fi

# 4) (옵션) print 로 next-fire 확인
launchctl print "$DOMAIN/$LABEL" | grep -E '(state|next .* fire)' || true
echo "✅ $LABEL bootstrapped + verified"
```

### B. 일별 헬스체크 (모든 잡 한 번에)

세션 의존 게이트만으로는 며칠간 세션 없이 지나가는 케이스를 못 잡으므로, 별도 daily 모니터:

```bash
#!/usr/bin/env bash
# launchd-health.sh — daily cron 또는 launchd 자체로 돌리고 결과 텔레그램 forward
set -u
PREFIX="com.claude"
EXPECTED=( "$HOME"/Library/LaunchAgents/${PREFIX}.*.plist )
LOADED=$(launchctl list | awk '{print $3}' | grep "^${PREFIX}\." | sort)
MISSING=()
for f in "${EXPECTED[@]}"; do
  label=$(basename "$f" .plist)
  grep -qx "$label" <<<"$LOADED" || MISSING+=("$label")
done
if (( ${#MISSING[@]} )); then
  printf '❌ launchd NOT LOADED: %s\n' "${MISSING[@]}"
  exit 1
fi
echo "✅ all $PREFIX.* loaded"
```

### C. Stop 훅 / 세션 종료 hook 에서 동일 검증

세션 종료마다 `~/Library/LaunchAgents/<prefix>.*.plist` ↔ `launchctl list` 대조 + 미등록 항목 텔레그램 surface. 일반 사용자 세션이 정기적으로 발생하는 환경에서 잘 통한다.

## 검증

- bootstrap 직후 `launchctl list | grep <label>` 한 줄 출력 → 등록 OK
- `launchctl print gui/$(id -u)/<label>` 출력에 `state = running` 또는 `next .* fire` 시각 → 스케줄 인식 OK
- wrapper log (`/tmp/<job>-wrapper.log`) 가 다음 발동 시각 이후 갱신되는지 1회 확인

## 함정

- `launchctl load` / `launchctl unload` 짝은 silent fail 사례가 누적돼 있다. **`bootstrap` / `bootout` 으로 교체 권장** (실패 시 exit code 가 잘 떨어짐).
- `bootstrap` 도 100% 안전은 아님. 그래서 직후 `list` 검증 단계를 **반드시** 거쳐야 함.
- `RunAtLoad=true` 인 plist 가 macOS 재시작 후 자동 재로드되는지는 LoginItem 설정 + plist 위치(`~/Library/LaunchAgents` vs `/Library/LaunchAgents`) 에 따라 달라진다. **재부팅 후 1회 헬스체크** 권장.
- `KeepAlive` 는 `StartCalendarInterval` 류 시간 기반 잡에는 부적합 (잡 종료 직후 재시작 → CPU 낭비). cron-like 잡은 `KeepAlive` 빼고 `StartCalendarInterval` 만 쓰는 게 맞다.
- `plutil -lint` 통과 ≠ 등록 가능. 의미상 키 누락 (예: `Label` 누락, `ProgramArguments` 빈 배열) 은 lint 통과해도 bootstrap 거부됨. lint 는 syntax 만 보장.
- 멀티 사용자 환경에서 domain 을 헷갈리면 (gui/<uid> vs system) bootstrap 는 성공해도 list 에 안 보임 — `id -u` 로 정확한 domain 박을 것.

## 관련

- issues 원본: `2026-04-21-launchd-silent-job-dropout.md`
- 적용 지점: `~/claude-automations/install.sh` (이미 bootout/bootstrap + list 검증 적용), `~/.claude/hooks/stop-check-repos-dirty.sh` (Stop 훅 LaunchAgent 로드 감지)
- 참고 패턴: 「register API 가 silent-fail 하는 모든 시스템」에 동일 패턴 적용 가능 — systemd `enable --now`, cron `crontab -l`, Windows scheduled task 등도 register 직후 list 검증 게이트 추천
