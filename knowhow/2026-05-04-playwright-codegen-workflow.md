---
category: 크롤링
tags: [playwright, codegen, 자동화, 브라우저, uv, chrome-devtools-mcp]
---

# Playwright codegen — 브라우저 조작 녹화로 자동화 코드 즉시 생성

- **출처:** AI 인사이더 클럽 (2026-04-16, 다수 공유)
- **재사용 영역:** 새 사이트 자동화 초안 작성, CSS 셀렉터 찾기 귀찮을 때

## 한 줄 요약

`playwright codegen`으로 브라우저 조작을 직접 녹화하면 Python/JS 코드가 자동 생성됨. 설치 없이 `uvx`로 바로 실행 가능.

## 패턴

### 1. uvx로 설치 없이 바로 실행

```bash
uvx --with playwright playwright codegen "https://target-site.com" -o demo.py
```

자동으로 브라우저 열림 → 마우스/키보드 조작 → 닫으면 `demo.py` 생성

### 2. 생성된 코드 실행

```bash
uv run --with playwright demo.py
```

### 3. Chrome DevTools AI 셀렉터 찾기

CSS 셀렉터 직접 안 찾아도 됨:
- F12 → AI 버튼 → "왼쪽 화면 login username, password 주소 찾아줘"
- → 자동으로 셀렉터 + JS 코드 생성 (무료)

### 4. chrome-devtools-mcp — CC에서 직접 브라우저 제어

```bash
claude mcp add chrome-devtools-mcp --scope user npx chrome-devtools-mcp@latest
claude --model sonnet --dangerously-skip-permissions -p \
  "Use chrome-devtools-mcp. 사이트 로그인 후 데이터 추출해줘."
```

CC가 직접 브라우저 탭을 제어 (Chrome 실행 중이어야 함)

## 주의

- codegen 생성 코드는 셀렉터가 깨지기 쉬움 → 안정적 속성 기반으로 수정 권장
- `--dangerously-skip-permissions`는 격리 환경에서만
- captcha 통과 불가 → captcha 사이트는 undetected-chromedriver 사용
