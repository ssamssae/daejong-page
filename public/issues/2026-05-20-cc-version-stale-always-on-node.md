# 2026-05-20 — 본진/WSL Claude Code 구버전 고착 (always-on 노드 nightly-update 영구 skip)

## 발생

2026-05-20 11:05 KST, 형님 "모든 클로드코드 버전 업데이트 됐는지 확인부터". 5노드 점검 결과:

| 노드 | 버전 | 상태 |
|------|------|------|
| 🍎 본진 Mac | 2.1.141 | 구버전 |
| 🪟 WSL | 2.1.143 | 구버전 |
| 🏭 맥미니 | 2.1.145 | 최신 |
| 🖥 데스크탑 | 2.1.145 | 최신 |
| 💻 노트북 | 2.1.145 | 최신 |

최신 = 2.1.145. 본진/WSL만 뒤처짐.

## 원인 (확정)

설계는 정상이고, always-on 노드에서 부작용이 터진 것:

1. **DISABLE_AUTOUPDATER=1** — 본진 `~/.zshenv`(Apr 24 set), WSL `~/.bashrc:128`. in-process 업데이터가 세션 도중 바이너리 atomic-swap 하다 stub-binary 죽이는 사고([[feedback_cc_dies_after_autoupdate]]) 막으려 의도적으로 끈 것. **올바른 결정 — 유지.**
2. 대체재 = `claude-code-nightly-update.sh` (Mac launchd / WSL systemd timer, 07:15 KST). 가드: `tmux has-session -t=claude` 활성 시 skip (라이브 프로세스와 race 방지).
3. **본진은 사실상 24/7 stationary** → tmux 'claude' 세션이 항상 살아있음 → 가드가 **매일 무조건 걸림**. nightly-update.log: `2026-05-06 ~ 05-20 전부 "cc session active, skipping this run"`. 2주+ 동안 단 한 번도 실행 안 됨 → 2.1.141 고착.
4. WSL은 낮 ON / 밤 OFF → 가끔 07:15에 세션 부재 윈도우가 열림 → 5/18에 2.1.132→2.1.143 1회 성공. 이후 윈도우 없어 2.1.143 정체.
5. 맥미니/데스크탑/노트북은 DISABLE_AUTOUPDATER 없음 → in-process 업데이터가 정상 작동 → 최신 유지. (이 노드들은 zombie 사고 미발생 또는 감내.)

근본 모순: in-process 업데이터 = 세션 손상 위험 / 가드 nightly cron = always-on 노드에서 영원히 안 뜸. 둘 다 always-on 노드를 커버 못 함. 그 사이 틈에 본진이 빠짐.

## 재발 방지 (적용)

`claude-code-nightly-update.sh` 의 skip 분기에 **staleness 알림** 추가:
- skip 직전 `claude --version`(로컬) vs `npm view @anthropic-ai/claude-code version`(최신) 비교
- 뒤처졌으면 로그에 `STALE` 기록 + 해당 노드 봇으로 텔레그램 1통 (수동 업데이트 명령 동봉)
- cron 이 하루 1회라 자연 dedup (최대 1통/일). chatbot turn 안 깨움 → API 비용 0.

효과: "조용한 영구 skip" → "보이는 actionable 알림". 형님이 편한 session-clear 윈도우에 수동 업데이트하면 됨.

수동 업데이트 명령:
- 본진(Mac): `cc` 세션 잠깐 종료 → `npm i -g @anthropic-ai/claude-code` → `cc`
- WSL: `sudo npm i -g @anthropic-ai/claude-code` (또는 nightly-update.sh 수동 1회)

## 검증 / 후속

- [x] **본진 2.1.145 업데이트 완료** (2026-05-20 11:23 KST) — cc 잠깐 종료 후 `npm i -g`, `claude --version` = 2.1.145 확인.
- [x] **본진 stale 알림 동작 검증 PASS** (2026-05-20 11:23 KST) — nightly-update.sh 수동 1회 실행 → 세션 활성으로 `cc session active, skipping this run` skip, 버전이 최신이라 `notify_if_stale` 가 버전 비교(line 27)에서 바로 빠져나가 STALE 라인·텔레그램 알림 둘 다 없음. 정상.
- [x] **WSL 2.1.145 업데이트 완료** (2026-05-20 11:35 KST) — 형님 ack("닫고 업데이트해") 후 tmux claude 세션 kill → `sudo npm i -g` (changed 2 packages in 11m) → `ssh wsl claude --version` = 2.1.145. `/usr/bin/claude` 심링크 정상 재생성. 5/18 잔재 staging(`.claude-code-ZjqcDZyQ`)·stale 심링크(`.claude-YH1GtpaY`)도 이번 install 이 자동 정리 → `claude-code` 디렉토리 하나만 잔존. 좀비 미발생.
- 알림이 매일 와서 시끄러우면 threshold(N일 연속) 추가 검토 — 단순함 우선, 일단 매일 1통. (본진/WSL 둘 다 최신이라 당분간 알림 안 와야 정상.)
