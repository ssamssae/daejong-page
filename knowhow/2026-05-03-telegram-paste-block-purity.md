---
category: 텔레그램
tags: [telegram, paste, copy, code-block, reply, mobile, ux, powershell, shell]
first_discovered: 2026-04-26
related_issues:
  - 2026-04-26-paste-block-label-leak
---

# 텔레그램 복붙용 명령어는 단독 메시지 — 설명 텍스트 0줄 혼합 금지

- **첫 발견:** 2026-04-26 (PowerShell 한 줄 명령 + 안내 라벨 혼합 → 폰 복붙 시 syntax error)
- **재사용 영역:** 텔레그램을 통해 명령어·스크립트·설정값을 복붙용으로 전달하는 모든 상황

## 한 줄 요약

모바일 텔레그램의 **long-press copy = 메시지 전체 복사**다. 명령어와 설명 텍스트가 같은 메시지에 섞여 있으면, 사용자가 복붙할 때 라벨·안내 문구까지 같이 붙어서 명령이 깨진다. 복붙용 블록은 **명령어만 든 별도 메시지 1통**으로 분리하는 게 원칙이다.

## 언제 쓰는가

- 셸 명령어, PowerShell, adb, flutter 등 1줄 이상 실행 명령을 텔레그램으로 전달할 때
- 설정 파일 내용, API 키, URL 등 그대로 복붙해야 하는 값을 전달할 때
- 복붙 방법을 안내하면서 명령어도 같이 보내고 싶을 때 (이 경우 2통으로 분리)
- `[이 명령어를 터미널에 복붙하세요]` 같은 라벨을 달고 싶을 때

## 패턴 (올바른 예)

### 메시지 1 — 설명

```
Windows PowerShell(관리자)를 열고 다음 명령어를 붙여넣으세요:
```

### 메시지 2 — 명령어만 (복붙 전용)

```
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

두 메시지는 **별도 reply 2번**으로 보낸다. 한 메시지에 넣으면 안 된다.

## 함정

- `[관리자 PowerShell 창에 그대로 복붙 + 엔터]` 같은 안내를 괄호로 감싸면 "이건 주석처럼 무시되겠지" 직관이 생기지만, **폰은 그런 거 모른다** — 전체 복사.
- "한두 줄 컨텍스트는 OK" 예외 조항을 두면 Claude 가 안내 텍스트를 계속 끼워넣는 패턴으로 회귀함. 예외 0줄이 원칙.
- ` ```block``` ` 코드 펜스 안에 있어도 마찬가지 — 코드 블록 밖의 라벨이 포함된 메시지는 long-press 시 전부 복사됨.
- 텍스트 에디터에서는 "안내 텍스트는 코드 위에 주석처럼" 자연스럽지만, 텔레그램 UX 에서는 **메시지 단위 = 복사 단위** 라는 차이가 있음.

## 검증 방법

1. 작성한 메시지를 보내기 전: 이 메시지에 실행 명령어와 한국어/영어 설명이 같이 있는가?
2. 있으면 → 설명 메시지 / 명령어 메시지 2통으로 분리 후 전송
3. 명령어 메시지 내에는 주석(`#`)도 최소화 — 필요하면 앞 설명 메시지에서 처리

## 관련

- issues 원본: `2026-04-26-paste-block-label-leak.md`
- 메모리: `feedback_paste_blocks_as_separate_message.md` — "복붙 블록은 별도 메시지"
- 연관 자동화: `~/.claude/hooks/telegram-reply-paste-purity.sh` — PreToolUse hook 후보 (명령행+설명 혼합 감지 시 block)
