---
prevention_deferred: null
---

# Linux tmux 노드 마우스 휠 스크롤 안 됨 (mouse off default)

- **발생 일자:** 2026-05-18 07:49 KST
- **해결 일자:** 2026-05-18 08:00 KST
- **심각도:** low
- **재발 가능성:** medium (신규 Linux 노드 추가 시마다 재현)
- **영향 범위:** 💻 notebook3060, 🖥 desktop3060ti — Linux tmux 노드 신규 셋업 시

## 증상

`/context` 같이 한 화면 넘는 출력을 보려고 마우스 휠 굴려도 스크롤 0. 위쪽 내용 확인 불가. 형님이 노트북에서 `/context` 친 후 그래프 못 보고 신고 (텔레그램 msg 992) → 데스크탑3060Ti 도 동일 (msg 994).

## 원인

tmux 디폴트가 `mouse off`. 휠 입력을 tmux 가 캡처 안 하고 그대로 무시. 노트북3060 / 데스크탑3060Ti 둘 다 `~/.tmux.conf` 자체가 없어서 디폴트 그대로 굳어있었음.

설치 직후 신규 Linux 노드는 (Ubuntu/WSL2 디폴트 tmux 5.0 기준) 항상 이 상태로 시작 — 사용자가 한 번이라도 휠을 굴려보기 전까지 묻혀있음.

## 조치

양 노드 동일 절차:

1. `~/.tmux.conf` 생성:
   ```
   set -g mouse on
   set -g history-limit 50000
   ```
2. attached 세션 전부 핫리로드 (재접속 불요):
   ```bash
   tmux ls | cut -d: -f1 | while read s; do
     tmux source-file -t "$s" ~/.tmux.conf
   done
   ```
3. 검증: `tmux show-options -g mouse` → `mouse on`, `tmux show-options -g history-limit` → `history-limit 50000`.

노트북3060 은 로컬에서, 데스크탑3060Ti 는 `ssh desktop3060ti` 로 동일 한 줄 + 핫리로드.

## 예방 (Forcing function 우선)

두 단계로 박음:

1. **knowhow note** — 동시 생성: `knowhow/tmux-mouse-wheel-linux.md`. 절차 + 키보드 fallback (Ctrl+B [ → PageUp) 명시. 신규 Linux 노드 셋업 시 첫 단계로 참조.
2. **본진 메모리** — `reference_tmux_mouse_wheel_linux` 으로 박아 신규 Linux 노드 셋업 디렉티브 자동 인용. 노트북3060 메모리에도 동일 사본.

추가 forcing function (deferred — 작성 마감 없음): `~/claude-skills/setup/linux-node-init.sh` 셋업 스크립트화. 현재 추가 예정 노드 없으니 다음 신규 노드 셋업 직전에 만듦. 위 두 단계로 즉시 필요는 충족됨.

## 재발 이력

(없음 — 첫 발생)

## 관련 링크

- 텔레그램: msg 992 (보고 — 노트북3060), 993 (조치 응답), 994 (데스크탑3060Ti 확장 요청), 995 (이슈+노하우 초안), 996 (ack)
- knowhow: `knowhow/tmux-mouse-wheel-linux.md`
- 메모리: `~/.claude/projects/-home-user/memory/reference_tmux_mouse_wheel_linux.md` (노트북3060 측), 본진 동기화 미정
