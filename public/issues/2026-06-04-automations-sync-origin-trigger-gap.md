# 본진 자동 sync 무동작 3중 결함 — flock 부재 + origin-trigger 부재 + broadcast 작업브랜치 실패

- **발생 일자:** 2026-06-04 ~01:19 KST (PR #80 본진 squash 머지 직후 미전파로 표면화)
- **발견 일자:** 2026-06-04 ~01:39 KST (아니키 "동기화 싱크기능 안잡힌다" surface)
- **해결 일자:** 2026-06-04 ~01:50 KST (3중 결함 수정 + 5노드 라이브 검증 PASS, origin/main f195f69)
- **심각도:** high (본진 자동 sync hook 4개가 macOS 에서 통째로 무동작 — 장기간 미발견 가능성)
- **재발 가능성:** (수정 전) certain — macOS 본진에서 매 발동마다 재현

## 증상

PR #80(40% 하드클리어 누수 백스톱) 본진 squash 머지 후 5노드 HEAD 실측 — 머지가 본진에만 적용, 4노드 전부 미수신:

- 🍎 본진 `1e9eece` (main) ✓ / 🪟 라이덴 `1dafa2b`(작업브랜치) ✗ / 🏭 맥미니 `c04296f`(1 behind) ✗ / 🖥 데스크탑 `48dcb27`(작업브랜치) ✗ / 💻 노트북 `9be3fd1`(2 behind) ✗

## 원인 — 3중 결함이 겹침

### ① (최근본) flock 부재로 본진 sync hook 4개가 2번째 줄에서 즉시 종료

`stop-sync-automations` / `posttooluse-sync-automations` / `stop-sync-skills` / `posttooluse-sync-skills` 4개 hook 모두 상단에:

```bash
exec 9>/tmp/.claude-...-sync.lock
flock -n 9 || exit 0
```

**flock 은 Linux(util-linux) 전용 — macOS 엔 기본 미설치.** macOS 본진에서 `flock` → "command not found"(exit 127) → `|| exit 0` 발동 → **hook 이 락 잡기도 전에 즉시 종료**. 즉 본진의 자동 sync hook 4개가 통째로 한 번도 제대로 안 돌았음. 로그 한 줄도 안 남고 종료(라이브로 `flock: command not found` 확인). 노드(Linux)는 flock 있어 정상 → 사고가 "본진만" 새는 것처럼 보였음.

### ② origin-trigger 부재 — 4노드 broadcast 가 본진 local 변화(behind/ahead)에만 의존

(flock 을 고쳐도) 기존 broadcast 게이트는 본진 local 이 pull/push 로 변할 때만 발동. 본진이 `gh pr merge` 후 수동 `git pull` 로 local 을 먼저 최신화하면 behind=0/ahead=0 → broadcast skip. origin/main(=전파해야 할 source)이 움직였는데 본진 local 부산물 기준이라 새는 갭.

### ③ broadcast 의 `merge --ff-only origin/main` 이 작업 브랜치 노드에서 실패

broadcast 가 노드에서 `git merge --ff-only origin/main` 을 현재 체크아웃 브랜치 HEAD 에 적용 → 라이덴/데스크탑처럼 작업 브랜치(prefix) 체크아웃 + dirty 면 diverge/dirty 로 실패(라이브 로그 `Diverging branches can't be fast-forwarded` / `local changes would be overwritten`). main ref 만 갱신해야 하는데 현재 브랜치를 건드리려다 실패.

## 조치 (모두 적용 + 라이브 검증)

1. **flock → `command -v flock` 가드 (4개 hook)** — flock 있을 때만 락(Linux 기존동작 불변), 없으면 진행(macOS 복원).
2. **origin-trigger (stop-sync-automations)** — `~/.claude/state/last-synced-automations-sha` 에 마지막 전파 origin/main sha 기록, 매 본진 Stop 시 비교해 움직였으면 강제 broadcast(본진 `<mac-host>*` 한정 — 노드까지 주체면 mesh SSH 폭증). 의도적 안전장치라 `DO NOT REMOVE` 마커 + 본 이슈 참조 주석 포함. 격리 4/4 PASS.
3. **broadcast 작업브랜치 안전화** — 노드에서 현재 브랜치가 main 이면 `merge --ff-only`, 아니면 `fetch origin main:main` 으로 local main ref 만 ff(작업 브랜치·working tree 보존).

**라이브 검증:** 본진에서 hook 실행 → 로그 `origin/main moved (...), forcing 4-node broadcast` → 5노드 전부 `f195f69` 일치(라이덴·데스크탑은 작업 브랜치 보존한 채 main ref 갱신).

### 잔여 (후속)

라이덴·데스크탑은 작업 브랜치 체크아웃이라 **main ref 는 동기화됐지만 그 노드 working tree 의 hook 파일 자체는 작업 브랜치 버전**. 새 hook working tree 반영은 그 2노드가 main 복귀/rebase 시. 단 노드(Linux)는 flock 있어 옛 hook 도 동작하고, 전파 주체는 본진이라 기능상 영향 없음.

## 교훈

- **Linux 전제 스크립트(flock 등 util-linux)를 macOS 본진에 깔면 silent fail 한다.** `|| exit 0` 같은 방어가 "명령 부재"까지 삼켜서 무동작이 정상처럼 보임. 이식성 명령은 `command -v` 가드 필수.
- 전파 트리거는 "전파해야 할 사실의 source(origin/main)" 기준이어야지 "전파 주체의 local 부산물(behind/ahead)" 기준이면 source 가 다른 경로로 갱신될 때 샌다.
- 5노드 mesh 에서 노드는 작업 브랜치에 자주 머물므로, 전파는 항상 "현재 브랜치 무관 main ref ff" 여야 한다.
- 자동 동기화는 "돌았다고 가정" 하지 말고 **실제 로그·5노드 sha 일치로 검증**해야 한다(이 사고도 장기 무동작이었을 가능성).
