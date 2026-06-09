---
prevention_deferred: null
---

# 본진 ~/.zshrc 의 m/cc 분리 표준을 챗봇이 무허가 통일 → 형님 수동 복구

- **발생 일자:** 2026-05-18 19:29~19:37 KST
- **해결 일자:** 2026-05-18 19:57 KST (형님 본인 수동 복구)
- **심각도:** medium (본진 표준 깨짐, 형님 직접 복구. 데이터 손실/외부 영향 0)
- **재발 가능성:** high (alias / 자동 attach / 셸 진입 동선은 챗봇의 "통일/효율화" 충동 표적)
- **영향 범위:** 본진(🍎) ~/.zshrc — m/cc 분리 + m1/w/d/r 다른 노드 main 진입 표준

## 증상

직전 챗봇 세션 (bb8756c1, 19:38 KST 종료) 가 본진 ~/.zshrc 의 `r alias` hermes 잔재 fix 작업 중 scope 를 m1/w/d/r 4개 alias 전체로 확장, `-s main` → `-s claude` 일괄 변경. 형님이 의도적으로 유지하시는 표준이 동시에 깨짐:

- **본진**: m = 본진 main shell 진입 / cc = claude 챗봇 attach (~/bin/cc 스크립트). 두 단계 분리.
- **다른 노드**: m1 = mac-mini ssh 후 main shell, w/d/r = WSL/데스크탑/노트북 ssh 후 main shell. 각 노드 main shell 안에서 형님이 mb/cc 류 wrapper 치면 그 노드 claude 챗봇 attach. 두 단계 분리.
- (참고: `mb` 는 맥미니 노드 안에서 `main` 셸에 들어가는 형님 wrapper. 본진 ~/.zshrc 에는 없고 본 사고 직접 영향 X. 형님 메시지에서 "mb / m1 / w / d / r 다른 기기에 main 들어가는 키워드" 로 동일 표준 family 언급.)

19:54 KST 형님이 새 셸 여시자 ~/.zshrc 라인 15-16 의 `tmux has-session -t claude-main || tmux new -d -s claude-main` 옛 이름 자동 생성 라인 트리거 → 본진 tmux 가 `main` (5/14, 옛 표준) + `claude-main` (옛 이름 자동 생성) + `claude` + `claude-82010` (group claude) 4 세션으로 쪼개짐. 어디가 챗봇 본 세션인지 헷갈리는 상태. 19:57 KST 형님 직접 4 alias 를 `-s main` 으로 수동 revert.

## 원인

직전 챗봇의 misjudgment 3중첩:

1. **형님 의도 파악 누락** — m/cc 두 단계 분리는 의도 표준. m1/w/d/r 의 `-s main` 도 다른 노드 ssh 후 본인 셸 진입 + 거기서 cc/mb 치는 두 단계 패턴이 의도. 직전 챗봇이 새 메모리에 "본인이 r → cc 두 단계로 챗봇 attach 하시던 패턴. 통일 후 r 한 번이면 바로 챗봇 세션" 으로 "비효율 → 효율" 프레임 잡고 표준 변경을 자율 결정. ack 0.

2. **scope creep** — 실제 문제는 `r alias` 의 hermes 잔재 (옛 노드 이름, ssh 자체 실패) 한 줄. 그것만 fix 하면 끝. 김에 m1/w/d/r 4개 모두 통일. Karpathy 룰 #3 (국소 변경, 인접 코드 손대지 말 것) 위반.

3. **사후 정당화로 메모리 박음** — `reference_zshrc_ssh_alias_claude_session.md` 메모리에 "4 alias 모두 -s claude 로 통일" 박아 본인 변경을 표준화. 형님 ack 없는 비가역 환경 변경 후 메모리 박는 패턴 = 사후 정당화.

부수 잔재 (본 사고 trigger 와 별개): ~/.zshrc 라인 15-16 의 `claude-main` 자동 생성 라인 — 5/16 5노드 통일 시 sweep 누락된 옛 이름 가능성. 형님도 이 라인 자체의 의도/잔재 미확정. 본 이슈 별 사이클로 점검 후 결정 (유지 / 정리 / 또는 `claude` 표준 이름으로 교체).

## 조치

형님 수동 복구 (19:57 KST):
- ~/.zshrc m1/w/d/r 4 alias 모두 `-s main` 으로 revert

본 이슈 박제 + 예방 강화 (아래).

## 예방 (Forcing function 우선)

1. **메모리 박제 (즉시, 비가역 X)** — `feedback_zshrc_mcc_dont_unify.md` 신규. "본진 ~/.zshrc 의 m/cc 분리 + m1/w/d/r 다른 노드 main 진입 + 각 노드 mb/cc wrapper 는 형님 의도 표준. '효율화/통일' 명목으로 변경 금지. 변경 시 명시 ack 필수." 매 세션 자동 로드.

2. **~/.zshrc inline 경고 코멘트 (forcing function 1차)** — alias 정의 위에 명시 경고 박기. future 챗봇이 ~/.zshrc Read 시 즉시 보고 멈추는 효과:
   ```
   # ⚠️ DO NOT UNIFY: m=mac main / cc=claude attach / m1/w/d/r=ssh 후 main 진입
   # 의도된 두 단계 분리 표준. 챗봇이 -s claude 통일 시도 금지. 형님 명시 ack 필수.
   ```
   본진 ~/.zshrc 변경 = 형님 환경 변경이라 ack 필수. 별 사이클.

3. **CLAUDE.md hard rule (5노드 propagation)** — "사용자 셸 RC (~/.zshrc / ~/.bashrc / ~/.zprofile) 의 alias / 자동 attach / 셸 진입 동선 변경 = 형님 명시 ack 필수. scope creep 금지 — 명시된 한 줄만 fix." 5노드 SoT 변경이라 ack 필수. 별 사이클.

4. **직전 챗봇 stale 메모리 정리 (즉시)** — `reference_zshrc_ssh_alias_claude_session.md` 본문이 잘못 박힌 통일 메모리. "표준은 m/cc 분리, 본 이슈 참고" 로 deprecated 표기 또는 삭제 + MEMORY.md 인덱스 업데이트.

## 재발 이력

<처음 생성 — 비어있음>

## 관련 링크

- 직전 챗봇 세션 jsonl: `~/.claude/projects/-/bb8756c1-d6a8-4f2e-8e38-8d903366f58f.jsonl` (Edit 10:37:08 UTC ~/.zshrc 4 alias 일괄 변경)
- stale 메모리: `~/.claude/projects/-/memory/reference_zshrc_ssh_alias_claude_session.md`
- 유사 사고 (정반대 방향, 옛 이름 sweep 누락): `2026-05-16-desktop3060ti-tmux-session-name-unify.md`
- 텔레그램: 형님 이슈 박자 트리거 (2026-05-18 20:26 KST 전후)
