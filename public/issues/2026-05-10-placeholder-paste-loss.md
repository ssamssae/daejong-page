---
prevention_deferred: null
date: 2026-05-10
host: USERui-MacBookPro (Mac 본진)
status: resolved
related: feedback_telegram_paste_placeholders, 2026-04-26-paste-block-label-leak, 2026-04-27-paste-block-mixed-r6
summary: "본진이 보낸 명령 안의 <placeholder> 문자열이 그대로 paste 되어 3060Ti 봇 토큰 .env가 덮어써진 사고"

---

# Telegram paste 명령 안 `<...>` placeholder 가 그대로 paste 되어 3060Ti .env 봇 토큰 덮어써짐

- **발생 일자:** 2026-05-10 20:46 KST
- **해결 일자:** 2026-05-10 21:01 KST
- **심각도:** medium (transcript 에서 복구 성공. transcript GC 됐으면 high — 봇 자체 분실)
- **재발 가능성:** medium (cross-device 셋업 paste 안내마다 재발 가능. 기존 paste-block hook 미검사 패턴)
- **영향 범위:** 모든 cross-device paste 셋업 안내 (Mac→WSL, Mac→3060Ti, Mac→Mac mini)

## 증상

3060Ti WSL 셋업 안내로 본진이 보낸 heredoc 명령 안에 `TELEGRAM_BOT_TOKEN=<여기에 봇 토큰 붙여>` 형태 placeholder 가 인라인 박혀있었음. 강대종이 명령을 그대로 paste→실행하자 placeholder 문자열(한글 + angle bracket 포함) 이 그대로 `~/.claude/channels/telegram/.env` 에 기록되어 원본 봇 토큰 (3060Ti 전용 봇, identifier (비공개)) 이 덮어써짐.

이후 3060Ti Stop 훅(`telegram-stop-ping.sh`) 이 발화될 때마다 `.env` source 단계에서 bash syntax error (`syntax error near unexpected token 'newline'`) 로 침묵 실패. 강대종 입장에선 "터미널에 친 응답이 텔레그램에 안 옴" 으로 관찰됨.

## 원인

paste-용 명령 블록(heredoc) 내부에 `<...>` placeholder 를 인라인으로 박았는데, paste 맥락은 "이 명령을 그대로 실행" 신호가 강해서 사용자가 placeholder 를 식별/치환해야 한다는 신호가 약함. fenced block 안 시각적으로도 본문 텍스트와 구분이 약함.

기존 paste-block 이슈들 (`2026-04-26-paste-block-label-leak`, `2026-04-27-paste-block-mixed-r6`) 은 "fenced block + 외부 한국어 안내문 동시 송신" 패턴을 다루는데, placeholder-in-block 은 fenced 안에 placeholder 가 있는 별개 케이스라 기존 PreToolUse hook (`telegram-reply-no-raw-id.sh`) 검사에 들어있지 않았음.

부수 원인 (셋업 자체):
- 3060Ti WSL `~/.claude/CLAUDE.md` 가 옛 파일 그대로였음 → SoT symlink 화 안 됨
- `~/.local/bin/jq` 미설치 → Stop 훅이 jq 의존인데 침묵 실패

## 조치 (이미 완료)

1. **토큰 복구** — `~/.claude/projects/-home-user/*.jsonl` (최근 2일) grep 으로 봇 토큰 패턴 매치 → 원본 토큰 복구. Telegram getMe 으로 bot identity 검증.
2. **`.env` 복원** — `~/.claude/channels/telegram/.env` 에 복구한 토큰 1줄 재기록 (chmod 600). 임시 파일은 즉시 삭제.
3. **`jq` 정적 바이너리 설치** — `~/.local/bin/jq` 1.7.1 (sudo 불가 환경 우회).
4. **`telegram-stop-ping.sh` PATH 보강** — 1번째 줄에 `export PATH="$HOME/.local/bin:$PATH"` 추가. SoT claude-automations 에 commit+push.
5. **3060Ti CLAUDE.md symlink 화** — 옛 파일 백업 후 `~/.claude/CLAUDE.md` → `~/claude-skills/globals/CLAUDE.md` symlink. claude-skills repo clone 포함.
6. **`desktop-0vab3qc` = 🎨 매핑 추가** — claude-skills SoT 에 commit+push (이건 원래 작업 목표였음).
7. **memory `feedback_telegram_paste_placeholders.md`** — 같은 사고 재발 방지 룰 작성.
8. **end-to-end 검증** — 3060Ti 에서 Stop 훅 수동 발화 → exit 0 + Telegram sendMessage 도착 확인.

## 예방 (Forcing function)

### A. PreToolUse hook 보강 (1순위)

`~/.claude/hooks/telegram-reply-no-raw-id.sh` (기존 paste-purity hook) 에 검사 추가:

- reply text 의 fenced ` ``` ` block 본문 추출
- 각 block 본문에 `<[가-힣]{1,15}>` (한글 1~15자 들어간 angle bracket pair) 또는 `<[A-Z_][A-Z0-9_ -]{2,30}>` (UPPER_SNAKE 식 placeholder) 매칭 시 → block
- reason: "Paste 블록 안에 `<...>` placeholder 금지. 값 직접 박거나 별도 메시지로 분리하라."
- false positive (`<file` shell redirect 단독) 는 angle pair `<...>` 폐포 매칭이라 안 걸림. heredoc redirect (`<<'EOF'`) 도 안 걸림.
- 매칭 시 본 세션이 분리 패턴(값 텍스트 별도 / 명령 별도)으로 재전송하면 통과.

### B. 대안 패턴 (hook 부재 동안 + hook 와 병행)

cross-device paste-용 secret/환경별 값 셋업 시:

- **본진 SSH 가능하면 paste 자체 회피** — Tailscale SSH 으로 본진에서 직접 ssh 으로 들어가 처리. 오늘 사고 후 복구 단계가 정확히 이 패턴 (paste 0회).
- **SSH 안 되는 경우** — 비밀값/환경별 값은 별도 텍스트 메시지로만 안내 ("BotFather 에서 받은 토큰 1줄을 새 파일에 직접 작성"). 명령 메시지엔 절대 인라인 placeholder 로 박지 말 것. 명령은 `mkdir -p <dir>` 같은 진짜 그대로 실행 가능한 것만 보냄.

### C. 운영 룰 (수동 보강)

- transcript jsonl 에 토큰이 그대로 기록돼있던 덕에 복구 가능했음. 이건 secret 노출 측면에선 문제이나 backup 측면에선 도움. transcript GC 정책 변경 시 이 의존성 인지.
- `.env` 같은 secret 파일 수정 후 즉시 봇 프로세스 재시작 필요 시: 재시작 전 `grep TELEGRAM_BOT_TOKEN .env` 1줄로 sanity check (값 길이 ≥ 40 자).

## 재발 이력

(처음 생성, 비워둠)

## 관련 링크

- 메모리: `feedback_telegram_paste_placeholders.md`
- 비슷한 패턴 (paste-block 다른 케이스): `2026-04-26-paste-block-label-leak.md`, `2026-04-27-paste-block-mixed-r6.md`
- 다음 작업: PreToolUse hook 검사 추가 (별도 PR — `telegram-reply-no-raw-id.sh` 에 placeholder-in-fenced 검사 1블록 추가)
