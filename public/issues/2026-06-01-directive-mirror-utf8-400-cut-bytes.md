# 2026-06-01 directive 미러 알림 UTF-8 400 — cut -c 바이트 절단 (T-260531-05)

## 증상
💻 노트북: "directive 보낼 때 봇챗 미러 알림 1건이 이모지 인코딩 문제(UTF-8 400)로 계속 실패. directive 본문은 본진에 정상 도달하니 기능엔 지장 없음." 아니키가 T-260531-05("노트북 이모지 사소한 버그") 정체로 확정(msg29839).

## 진단
- directive 전송 본문(scp→tmux load-buffer→paste)은 byte-perfect(별 진단에서 hexdump 100% 일치 확인). 데이터 무손실 — 깨진 건 데이터가 아니라 "봇챗 미러 알림" 발송.
- 미러 알림 경로 = `*-directive.sh` → `first_line=$(head -1 "$src" | cut -c1-80)` → `agent-msg-notify.sh` (텔레그램 sendMessage).
- **근본원인: `cut -c1-80` 이 GNU 환경(Linux 노드)에서 바이트 단위 절단.** 한글(3byte)·이모지(4byte) 섞인 줄을 byte 80 에서 자르면 멀티바이트 문자 중간이 잘려 invalid UTF-8 → 텔레그램이 400(strings must be encoded in UTF-8) 거부.
- 확정 실측(notebook, C.UTF-8): 한글 85자(255byte) → `cut -c1-80` = 81byte, `python decode utf-8` INVALID. (BSD cut=macOS 는 글자단위라 본진은 무증상 → Linux 노드만.)

## 조치
- `scripts/utf8-head.sh` 신규 — stdin 첫 줄을 python 으로 UTF-8 "글자" N자(기본 80) 절단, 플랫폼/locale 무관 항상 valid UTF-8 출력.
- 9개 `*-directive.sh`(mac/wsl/<macmini-host>/desktop3060ti/notebook3060 + codex 변형)의 `cut -c1-80` → `"$(dirname "$0")/utf8-head.sh"` 치환. bash -n 전수 통과.
- 5노드 배포(본진 edit, notebook/<macmini-host> main pull, wsl/desktop stale-branch라 checkout origin/main -- 파일).

## 검증
notebook(GNU cut) 실측: `cut -c1-80` → 81byte INVALID / `utf8-head.sh` → 240byte(80글자) VALID UTF-8 ✓. fix 작동 확정.

## 교훈
- 비대화형/크로스플랫폼에서 멀티바이트 문자열 절단은 `cut -c`/`head -c`(바이트) 금지 → 글자단위 도구(python). cf. feedback_node_liveness_full_tmux_path (같은 비대화형 함정 계열).
- macOS BSD ≠ GNU coreutils 동작 차이(cut -c)가 "본진은 멀쩡한데 Linux 노드만 깨짐" 패턴 만든다 (cc nightly false alarm 과 동일 구조).
