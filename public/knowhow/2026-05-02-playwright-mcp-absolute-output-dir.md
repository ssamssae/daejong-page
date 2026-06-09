---
category: 자동화
tags: [playwright, mcp, output-dir, cwd, enoent, mcp-json, absolute-path, plugin]
related_issues:
  - 2026-05-02-playwright-mcp-cwd-output-dir
---

# Playwright MCP .mcp.json 에 --output-dir 절대 경로 필수 — cwd=/ 에서 ENOENT 방지

- **첫 발견:** 2026-05-02 (Mac 본진 Claude Code가 cwd `/`로 시작, `mcp__plugin_playwright__browser_navigate` 100% fail — `mkdir '/.playwright-mcp' ENOENT`)
- **재사용 영역:** Claude Code가 루트 또는 권한 없는 cwd로 시작되는 모든 환경(Telegram session, headless daemon, Termius SSH 등)에서 Playwright MCP 사용.

## 한 줄 요약

`@playwright/mcp` 는 `--output-dir` 미지정 시 **프로세스 cwd 상대 경로** `.playwright-mcp`를 mkdir하려 한다. Claude Code가 cwd `/`로 시작하면 root 쓰기 권한 없어 모든 MCP tool call이 ENOENT로 실패. `.mcp.json` args에 **절대 경로** `--output-dir`을 박는 것이 근본 fix.

## 패턴

```json
// ~/.claude/plugins/cache/claude-plugins-official/playwright/unknown/.mcp.json
{
  "playwright": {
    "command": "npx",
    "args": [
      "@playwright/mcp@latest",
      "--output-dir", "/Users/<username>/.playwright-mcp"
    ]
  }
}
```

```bash
# 디렉터리 미리 생성 (1회)
mkdir -p ~/.playwright-mcp

# 적용 후 Claude Code 반드시 재시작 — running MCP server는 잘못된 cwd로 떠있어 변경 미반영
```

## 왜 이렇게 해야 하는가

- `@playwright/mcp` MCP server는 Claude CLI(부모 프로세스)로부터 cwd를 상속. Claude가 `/`에서 뜨면 서버도 `/`가 cwd.
- 출력 디렉터리를 cwd 상대 `.playwright-mcp`로 생성 시도 → root 쓰기 권한 없음 → ENOENT.
- `--output-dir` 인자가 없으면 매번 시작 cwd에 따라 동작 여부가 달라져 재현이 불규칙.

## 하지 말아야 할 것

- `--output-dir` 없이 plugin 배포 — Claude Code 시작 cwd에 따라 랜덤 fail
- plugin update 후 .mcp.json이 upstream으로 덮어써지면 fix 사라짐 → **update 직후 재확인 필수**
- 상대 경로 (`./output`) 사용 — cwd 문제 그대로 재현

## Forcing Function

- plugin update 후 체크리스트: `.mcp.json` args에 `--output-dir` 절대 경로 있는지 1줄 확인
- 영구 fix 후보: `~/.claude/settings.json` `mcpServers` override로 인자 박기 (Claude Code 지원 시)
- 재발 탐지: `grep -r "output-dir" ~/.claude/plugins/cache/*/playwright/**/.mcp.json` 0 hit = 재적용 필요

## 관련 이슈 (포스트모템)

- `issues/2026-05-02-playwright-mcp-cwd-output-dir.md`
