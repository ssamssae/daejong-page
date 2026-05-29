# 🪟 WSL ~/.profile:30 tmux 자동세션 race-trap — 패치 옵션 spec

**Status**: 🟡 draft · **RC 변경 형님 ack 대기 (spec only, 패치 미적용)**
**Author**: 🪟 WSL / 2026-05-29 KST (낮 오토 cycle #4, 발견자=자기 cycle #3 RC sweep)
**근거 사고**: 본진 `2026-05-29-mac-zshrc-claude-empty-session-race` 와 동일 클래스

---

## 0. 발견 (cycle #3 RC sweep)

`~/.profile:30`:
```sh
# auto-create main tmux session on login (added 2026-04-30)
tmux has-session -t main 2>/dev/null || tmux new -s main -d
```

- **위치 맥락**: `~/.profile` 은 로그인 셸 RC. L12-16 에서 bash 면 `~/.bashrc` source, L20-27 PATH(~/bin, ~/.local/bin), L30 tmux, L31 cargo env.
- **race 메커니즘**: 로그인 셸마다 무조건 실행. `has-session` 가드는 있으나 **체크와 생성 사이가 비원자적** — keepalive/systemd/동시 ssh 로그인 등 둘 이상이 거의 동시에 진입하면 둘 다 "세션 없음" 판정 → 둘 다 `tmux new` → 빈/중복 세션 또는 한쪽 실패. 본진 맥 사고와 동일.
- **트리거 경로**: `~/.profile` 은 로그인 셸만 읽음. `ssh host 'cmd'`(non-interactive non-login)는 안 읽어 그 경로는 안전. `wsl`/`ssh -t`/Windows Terminal 진입(로그인 셸)이 트리거.
- **무관(오탐 아님)**: `~/.bashrc` L136-147 의 tmux 라인은 전부 alias(m/m1/mb/d/r) = 수동 트리거, auto-exec 아님.

---

## 1. 패치 옵션 3안

### 옵션 A — 인터랙티브 + non-TMUX 가드 (surgical)
```sh
# auto-create main tmux session on login (added 2026-04-30, guarded 2026-05-29)
case $- in *i*) [ -z "$TMUX" ] && tmux has-session -t main 2>/dev/null || tmux new -s main -d ;; esac
```
(또는 `[[ $- == *i* ]] && [[ -z "$TMUX" ]] && { tmux has-session -t main 2>/dev/null || tmux new -s main -d; }`)
- 인터랙티브 셸 + tmux 밖일 때만 실행 → 비인터랙티브/중첩 진입 race 차단.
- **자동세션 편의 보존**.

### 옵션 B — 라인 제거 (race-trap 자체 폐기)
- L29-30 두 줄 삭제. 자동세션을 외부(systemd-user 유닛 / keepalive)가 보장하면 충분.
- 가장 단순(Karpathy 룰2). **단 전제**: `main` 세션을 만드는 *다른* 확실한 경로 존재 확인 필요 — 없으면 로그인 시 자동 attach 편의 상실.

### 옵션 C — ~/.profile 폐기, ~/.bashrc 단독
- `~/.profile` 제거하고 그 내용(PATH ~/bin·~/.local/bin, cargo env, tmux)을 `~/.bashrc` 로 이관.
- **Ubuntu/WSL 의존성 주의**: WSL bash 는 보통 *로그인* 셸로 진입 → `.profile` 을 읽고 거기서 `.bashrc` 를 source 하는 구조. `.profile` 폐기 시 로그인 셸 PATH/cargo 설정이 누락될 수 있어 이관 검증 필수. 가장 침습적.

---

## 2. 비교 매트릭스

| 축 | A 가드 | B 제거 | C .profile 폐기 |
|----|--------|--------|-----------------|
| race 차단 | ✅ (인터랙티브+non-TMUX) | ✅ (라인 제거) | ✅ (race 라인 이관/제거) |
| 자동세션 편의 | 보존 | 외부 보장 시만 | 이관 시 보존 |
| 변경 표면 | 1줄 교체 | 2줄 삭제 | 파일 1개 폐기 + 내용 이관 |
| 침습도/위험 | 낮음 | 낮음(외부경로 확인 전제) | **높음**(로그인셸 PATH 누락 위험) |
| 롤백 | 1줄 복구 | 2줄 복구 | 파일 복원 |
| 선결조건 | 없음 | 대체 세션 생성 경로 verify | .bashrc 이관 + 로그인셸 동작 verify |

---

## 3. WSL 디폴트 픽 제안 (형님 ack 대상)

**옵션 A (인터랙티브+non-TMUX 가드)** 를 디폴트 제안:
- race 를 확실히 죽이면서 자동세션 편의 보존, 변경 1줄, 선결조건 0, 롤백 즉시.
- 옵션 B 는 "main 세션을 만드는 대체 경로"가 확인되면 더 단순(가장 Karpathy). [[project_wsl_chatbot_autostart]] 의 keepalive/autologin 이 세션을 보장하는지 verify 후 B 로 격상 가능.
- 옵션 C 는 로그인셸 PATH 누락 위험이 커 비추 — 별도 셸 정리 사이클로 분리.

---

## 4. 가드 / 적용 조건
- **본 문서는 spec only — RC 파일(.profile) 변경은 형님 명시 ack 필수** (globals: 셸 RC 변경 = 명시 ack, scope creep 금지). 발견~spec 까지만 자율, 패치 적용은 ack 게이트.
- 적용 시 명시된 1줄(또는 해당 라인)만 surgical 변경, 인접 라인 무수정.

## 5. 한계
- `main` 세션을 만드는 다른 경로(systemd-user / keepalive / launchd-equivalent) 전수 미확인 — 옵션 B 격상 전 verify 필요.
- 동시 로그인 race 의 실제 재현 빈도 미측정(이론적 race, 본진 맥에선 실제 빈 세션 사고 발생). WSL 에서 실발생 여부는 로그 부재로 미확정 — 예방적 가드 차원.
