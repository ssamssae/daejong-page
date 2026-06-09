# 💻 노트북 SDXL OOM cascade × 2회 (claude chatbot 동반사살)

- 날짜: 2026-05-25 (KST)
- 노드: 💻 notebook3060 (Lenovo Legion 5 / RTX 3060 / WSL2 Ubuntu, RAM ~10Gi)
- 발생 시각: 13:24 KST (1차) + 14:00 KST (2차, ~36분 간격)
- mesh-vote 트리거: 1779689180 (5/5 합의)
- 영향: claude chatbot 세션 동반 사망 → 형님 매번 구글 원격 수동 재기동 (2회 × 1~2분 손)

## 사실 (dmesg / journalctl)

```
[79004.832703] [  pid  ]   uid  tgid total_vm      rss pgtables_bytes swapents oom_score_adj name
[79004.833400] oom-kill:constraint=CONSTRAINT_NONE,nodemask=(null),cpuset=/,mems_allowed=0,global_oom,
               task_memcg=/user.slice/user-1000.slice/user@1000.service/app.slice/
                          tmux-spawn-4ae364d5-2425-4d9c-9392-b96da59faaec.scope,
               task=python,pid=111777,uid=1000
[79004.834112] Out of memory: Killed process 111777 (python)
               total-vm:52038064kB, anon-rss:9271696kB, file-rss:360kB, shmem-rss:79872kB,
               UID:1000 pgtables:27372kB oom_score_adj:200
```

- python pid 111777 = SDXL Turbo + Refiner 합친 pipeline (sd_cli.py, anon-rss 9.27GB → WSL2 10Gi 한계 초과)
- task_memcg scope = tmux-spawn-4ae364d5-… → SDXL python 이 claude tmux 와 **같은 tmux-spawn cgroup scope** 안에서 launch 됨
- global_oom 발동 → 같은 scope 의 claude (RSS 263MB, 본체는 작음) 도 같이 reap
- 자가복구 실패: 기존 `claude-chatbot.service` (Type=oneshot + RemainAfterExit=yes, Restart= 옵션 없음) → unit 은 "active (exited)" 유지, tmux/claude 자식 죽어도 재시작 트리거 안 박힘

## 진단

근본 원인 = **SDXL python 과 claude chatbot 이 같은 tmux-spawn cgroup scope 공유**. WSL2 RAM 한계 환경에서 ML python 이 OOM 한계 치면 같은 scope 전부 reap → innocent neighbor (claude) 동반 사망.

부차 원인 = oneshot unit → Restart= 디렉티브 무시. mesh-vote (B) 본인 답안의 핵심 (Restart=always, RestartSec=3, OOMScoreAdjust=-700) 가 빠진 패턴.

## fix (mesh-vote 1779689180 (B) WIN — 노트북 답안 4/5 채택)

본진 → 노트북 (a) 옵션 ack 후 노트북 자율 실행:

1. **기존 `claude-chatbot.service` 업그레이드** (`~/.config/systemd/user/`, 가역 백업 `.bak-2026-05-25-meshvote1779689180`):
   - Type: oneshot+RemainAfterExit=yes → **simple**
   - Restart=**always**, RestartSec=**3**
   - OOMScoreAdjust=**-700** (커널이 챗봇 우선 보호)
   - MemoryAccounting=**yes**
   - PATH: `%h/.bun/bin:` 맨 앞 추가 (SoT 표준 정합)
   - ExecStart: `tmux has-session ... || tmux new-session -d ...` + inline `while tmux has-session; do sleep 2; done; exit 1` polling loop (자식 사망 감지 → Restart 발동)
   - ExecStartPost: inline 통합 (Type=simple 호환)
2. ML/heavy workload 가이드 (강제 X, sd_cli.py wrapper 박을지 별 사이클): `systemd-run --user --scope -p MemoryMax=6G -p OOMScoreAdjust=+500 python sd_cli.py …` → 별 cgroup scope + 커널이 ML 우선 reap

## 검증

- systemd-analyze --user verify → PASS
- systemctl --user daemon-reload → PASS
- 검증 1 (status), 2 (tmux ls) → 옛 인스턴스 active 확인 (restart 전)
- 검증 3 (강제 kill → 자가복구) → 노트북 자살 동반이라 `systemd-run --user --unit=claude-chatbot-verify --collect` 별 unit 에 detach 스크립트로 위임, ~30초 후 mac-report.sh 로 결과 본진 보고

## 학습

1. **cgroup scope 공유 = 격리 부재** — tmux-spawn 안 한 scope 에 챗봇 + ML python 다 박으면 OOM cascade 불가피. systemd-run --scope 로 ML 분리 의무.
2. **oneshot + Restart 무시** — `Type=oneshot` 은 Restart= 디렉티브 자체를 무시. 자가복구 필요하면 Type=simple + 자식 사망 감지 로직 (polling/forking).
3. **OOMScoreAdjust 양방향** — 챗봇 보호만으론 global OOM 우선순위 동률, ML 쪽에도 +500 박아 reverse 격리해야 cascade 차단 확실.
4. **mesh-vote 의 강점** — 4 노드 답안이 거의 동일 결론 (OOMScoreAdjust + systemd-run scope) 수렴, mesh-vote 가 5/5 한 사이클 안에 표결+합의 후 즉시 본진 디렉티브로 fan-out 가능. 직전 사이클 codex/Claude 4 노드 task 분배와 동일 패턴.

## 5노드 글로벌 룰화 (2026-05-25)

CLAUDE.md 빠른 원칙에 한 줄 박음 (claude-skills 96ede57):
> "5노드 챗봇/장기 background 격리·자가복구 표준 — Linux 노드 챗봇/typing daemon/relay 등 장기 background 프로세스는 systemd --user unit (Restart=always, OOMScoreAdjust≤-500, MemoryAccounting=yes) 의무. ML/빌드/렌더 RAM-heavy 워크로드는 systemd-run --user --scope MemoryMax + OOMScoreAdjust=+500 별 cgroup scope 로 격리. turn hook SIGTERM/kill 금지, daemon lifecycle 은 flag 토글로만 제어."

## 뉴스레터 소재 angle (Ep13 후보)

제목 후보: "5노드 챗봇 멸망 사건 — 같은 cgroup 에 ML 박았더니 챗봇이 OOM 동반사살된 30분"

구조 후보:
1. 사고 발단 — SDXL 실험 한 줄 명령이 OOM cascade 두 번 (~36분 간격)
2. 진단 — task_memcg 가 tmux-spawn scope 라는 한 줄 발견의 의미
3. mesh-vote — 5 노드가 30초 만에 같은 결론 (격리+자가복구) 수렴
4. fix — Type=oneshot 함정 + Restart=always + OOMScoreAdjust 양방향
5. 글로벌 룰 — 5노드 표준 박은 한 줄
6. 메타 — 1인 개발자가 5노드 운영하면서 사고를 *룰 박는 기회* 로 전환하는 패턴

참고 angle: 직전 Ep12 까지 LIVE 상태, Ep13 자리 비어있음. 뉴스레터 발행은 별 사이클 (parking-lot).
