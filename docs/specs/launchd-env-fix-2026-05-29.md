# launchd 환경 fix spec — choso-node-broadcast / choso-todo-pull

- 작성: 2026-05-29 · 🖥 데스크탑 · autopilot cycle #5
- 트리거: 2026-05-29 02:00 KST 사이클 #3 헬스체크에서 두 launchd 잡 실패 발견
- **범위: 옵션 비교 spec (docs only). plist 편집·bootout/bootstrap 은 본진 자율 별 트랙.**
- 외부영향: 0

---

## 0. 근본 원인 한 줄 요약

두 잡 모두 **launchd 가 로그인 셸 환경(PATH / ssh-agent / git 설정)을 상속하지 않는다**는 동일 뿌리. launchd 는 최소 환경(`PATH=/usr/bin:/bin:/usr/sbin:/sbin`, ssh-agent 없음)으로 잡을 띄움.

---

## 1. choso-node-broadcast PATH fix

### 사실 확인 (실코드)
`choso-node-broadcast.sh` 는 sops 를 **직접 호출하지 않는다.** TELEGRAM_BOT_TOKEN 미설정 시 `exec ~/infra-config/scripts/decrypt-run.sh --profile telegram "$0"` 로 re-exec 하고, **`decrypt-run.sh:45` 의 `command -v sops` 가 PATH 에서 sops 를 못 찾아** `sops not found in PATH` (exit 3) 를 던진다. `/opt/homebrew/bin/sops` 는 실존하나 launchd 최소 PATH 에 미포함.

> 즉 fix 대상은 "decrypt-run.sh 가 보는 PATH" 다. broadcast.sh 는 이미 jq(`/opt/homebrew/bin/jq`)·curl(`/usr/bin/curl`) 은 풀패스로 박았으나 sops 는 하위 wrapper 소관이라 PATH 의존이 남음.

### 옵션 비교

| 옵션 | 방식 | 재현성 | 다른 호출경로 영향 | launchd 표준 | 5노드 일관성 | 가역성 | 평가 |
|------|------|--------|-------------------|--------------|--------------|--------|------|
| **(A)** plist `EnvironmentVariables.PATH=/opt/homebrew/bin:/usr/bin:/bin` | 잡 환경에 PATH 주입 | 높음(잡 단위 선언적) | broadcast→decrypt-run re-exec 가 PATH 상속 → 트리 전체 해결 | ✅ launchd 정석(env 는 plist 가 책임) | plist 는 노드별이라 각자 자기 brew 경로(/opt/homebrew vs /usr/local vs Linux /usr/bin) 지정 가능 | bootout/bootstrap 으로 즉시 롤백 | **권장** |
| (B) 스크립트 첫 줄 `export PATH=/opt/homebrew/bin:$PATH` | broadcast.sh 직접 set | 중간 | **이 잡만** 해결 — decrypt-run.sh 를 부르는 다른 launchd 잡은 여전히 깨짐 | △ 환경 책임이 스크립트로 샘 | 스크립트는 공유라 /opt/homebrew 하드코딩 시 Linux 노드서 무의미 라인 | git revert | 부분책 |
| (C) sops 풀패스(`/opt/homebrew/bin/sops`) | — | — | **decrypt-run.sh(infra-config) 를 편집해야 함** | ✗ | **✗ 최악** — Linux 3노드는 sops 가 /usr/bin·/usr/local/bin 라 /opt/homebrew 하드코딩 깨짐 | 편집권 본진+맥미니 한정 | **비권장** |

**결론**: (A). 환경 문제는 환경 선언(plist)으로 푸는 게 launchd 정석이고, re-exec 트리 전체에 PATH 가 상속돼 decrypt-run.sh 의 `command -v sops` 가 자연 통과. (C) 는 `command -v` 의 이식성을 깨고 노드별 경로 차이에 취약 + 편집 제한 repo 건드림.

---

## 2. choso-todo-pull SSH + pull fix

### 사실 확인
60초 주기. `git@github.com: Permission denied (publickey)` + `Cannot fast-forward to multiple branches`. `bash -lc` 로그인 셸을 띄워도 **launchd 세션엔 ssh-agent 가 없어** SSH_AUTH_SOCK 미설정 → deploy key 못 잡음. 그리고 현재 브랜치에 `branch.<name>.merge` 업스트림이 없어 `git pull` 이 머지 대상 브랜치를 단정 못 함.

### SSH 측 옵션

| 옵션 | 방식 | trade-off |
|------|------|-----------|
| (a) plist `EnvironmentVariables.SSH_AUTH_SOCK=<path>` | 에이전트 소켓 주입 | launchd 의 agent 소켓 경로는 세션별·휘발이라 **취약**(재부팅/재로그인 시 깨짐). 비권장 |
| **(b) ssh_config `IdentityFile` + `IdentitiesOnly yes`** (github.com 호스트 전용 deploy key) | 에이전트 없이 키파일 직접 사용 | **권장** — 헤드리스/비대화에 가장 견고, 에이전트 무의존. 키는 0600, 노드별 deploy key |
| (c) HTTPS remote + PAT | `https://` + credential helper/.netrc | 동작하나 PAT 평문 저장 = 시크릿 정책 위반(저장 시 infra-config sops 경유 필요), 로테이션 부담 |

### Pull 측 옵션

| 옵션 | 방식 | trade-off |
|------|------|-----------|
| **명시 pull** `git -C <repo> pull origin main --ff-only` | 잡 커맨드에 remote+branch+ff 명시 | **권장** — repo 의 branch 설정 부재와 무관하게 결정적. "multiple branches" 모호성 제거 |
| branch 설정 `git branch --set-upstream-to=origin/main main` | 업스트림 1회 설정 | 동작하나 잡이 가정하는 repo 상태(브랜치=main)에 의존. 명시 pull 이 더 방어적 |

**결론**: (b) ssh_config IdentityFile + 명시 `pull origin main --ff-only` 조합. 둘 다 "환경/상태 가정 제거 → 선언적 명시" 방향.

---

## 3. launchd(/systemd) 환경 일반 룰 — 박제 제안

새 스케줄 잡(launchd=🍎🏭 macOS / systemd --user=🪟🖥💻 Linux) 작성 시 체크리스트. **"로그인 셸이면 됐던 것"을 잡 환경에 절대 가정하지 말 것.**

- [ ] **PATH**: 잡이 부르는 모든 바이너리는 (1) 절대경로 박거나 (2) plist `EnvironmentVariables.PATH` / systemd `Environment=PATH=`. `bash -lc` 만으로 PATH 채워진다 가정 X. 하위 re-exec(wrapper) 도 PATH 상속 필요한지 확인.
- [ ] **SSH**: git/scp 등은 ssh-agent 가정 X. ssh_config `IdentityFile`+`IdentitiesOnly` 로 키파일 직접 지정.
- [ ] **HOME / USER**: launchd 는 보통 채우나 systemd --user 와 컨텍스트 다름. git/sops 가 `$HOME/.config`·`$HOME/.sops` 참조하니 HOME 명시 확인.
- [ ] **git ops**: `pull` 은 `origin <branch> --ff-only` 명시. 브랜치 업스트림 설정 가정 X. `-C <repo>` 로 cwd 의존 제거.
- [ ] **interactive-shell 의존 가드**: `.zshrc`/`.bashrc` alias·함수·자동 export 에 의존하는 명령 금지(비대화 셸은 이들 미로드).
- [ ] **검증**: `launchctl kickstart -k gui/$(id -u)/<label>` (systemd: `systemctl --user start <unit>`) 로 즉시 1회 실행 + `StandardErrorPath` 로그 확인 후 등록.
- [ ] **가역성**: 등록은 bootout↔bootstrap(systemd disable↔enable)로 가역. plist/unit 은 `_disabled/` 보관 패턴(삭제 X).

> 🖥 데스크탑(Linux) 관점 추가: 본 2건은 macOS launchd 잡이라 fix 주체는 본진/맥미니지만, 동일 "환경 비상속" 함정이 Linux systemd --user 에도 그대로 적용됨(로그인 셸 PATH·DBus/agent 미상속). 일반 룰은 5노드 공통.

---

## 4. 결론 / 핸드오프

- (1) **(A) plist PATH**, (2) **(b) IdentityFile + 명시 ff pull** 권장. 둘 다 "환경/상태 가정 제거 → 선언적 명시" 한 방향.
- 실제 plist 편집·bootout/bootstrap·decrypt-run 검증 = **본진 자율 별 트랙**(가역). 본 spec 은 옵션 비교까지.
- §3 체크리스트는 박제 후보 — 채택 시 5노드 launchd/systemd 작성 표준으로.
