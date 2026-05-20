---
title: "Clawd on Desk 펫을 WSL2 챗봇에 1:1 연결하기 (Windows 노드)"
tags: [clawd, wsl2, claude-code, hooks, windows, multi-device]
date: 2026-05-20
---

# Clawd on Desk 펫을 WSL2 챗봇에 1:1 연결하기 (Windows 노드)

Windows 머신에서 도는 책상 펫앱 Clawd on Desk를, 그 머신의 **실제 일꾼**에 1:1로 연결하는 표준 절차 + 함정 모음. 데스크탑/노트북처럼 챗봇이 WSL2 안에서 도는 노드에 적용.

## 핵심 멘탈모델 (1:1의 정의)

"이 PC = Windows"가 아니다. 데스크탑/노트북 노드에서 실제로 작업하는 주체는 **그 PC의 WSL2 안에서 도는 Claude Code 챗봇**이다. 따라서 펫이 비춰야 할 대상도 WSL2 챗봇 → **WSL→펫 연결이 곧 올바른 1:1**. 별도 물리 머신(예: 라이젠 WSL 노드)은 자기 펫을 따로 가지므로 서로 안 섞인다. "머신 1대 = WSL2 챗봇 1개 = 펫 1개".

## 작동 방식

펫앱은 로컬 포트 **23333**에서 listen. 각 CLI 에이전트의 hook에 자기를 주입해, 세션/툴 이벤트마다 `clawd-hook.js <Event>`가 23333으로 신호 → 캐릭터 반응. hook 이벤트 10종: SessionStart, SessionEnd, UserPromptSubmit, PreToolUse, PostToolUse, PostToolUseFailure, Stop, SubagentStart, SubagentStop, Notification.

## 연결(추가) 절차 — WSL2 챗봇에 펫 물리기

WSL `~/.claude/settings.json`에 CLAWD_REMOTE powershell hook을 10종 이벤트별로 주입:

```
<powershell 풀패스> -NoProfile -Command '$env:CLAWD_REMOTE="1"; & "<node.exe>" "<clawd-hook.js>" <Event>'
```

기존 hook 그룹은 보존하고 clawd 그룹만 append(async:true, timeout:10). 편집 후 `python3 -m json.tool`로 JSON 유효성 검증. hook 라이브 발사 시 EXIT=0이면 23333에 정상 전달.

## 함정 (실측으로만 잡힘 — 경로 추정 금지)

1. **powershell.exe 풀패스 필수** ⭐ — WSL bash PATH에 bare `powershell.exe`가 없다. bare로 박으면 매 이벤트 command-not-found → 펫 무반응(조용히 실패). 반드시 `/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe`. (비대화형/WSL PATH 누락 계열 함정의 한 갈래.)
2. **설치 경로가 머신마다 다름** — `C:\Program Files\Clawd on Desk\` 인 데가 있고 `C:\Users\<U>\AppData\Local\Programs\Clawd on Desk\` 인 데가 있다. 둘 다 확인.
3. **WSL HOME 확인** — `/home/user` vs `/home/<other>`. settings.json 경로 추정 말고 실제 HOME 확인.
4. **node.exe / hook.js 실존 확인** — `C:\Program Files\nodejs\node.exe`, `...\resources\app.asar.unpacked\hooks\clawd-hook.js`.
5. **설치본은 SCP 복사** — 새 노드 설치 시 임의 인터넷 다운로드 금지. 이미 깐 노드 Downloads에서 `Clawd-on-Desk-Setup-x.y.z-x64.exe` + `install-clawd.ps1` SCP 복사. 사일런트 설치 `install-clawd.ps1 /S`.
6. **WSL에서 앱 기동 시 cmd.exe UNC 트랩** — `cmd.exe start`는 WSL UNC cwd 거부. powershell `Start-Process`로 우회.

## 네이티브 hook 제거 시 함정 (1:1 정리할 때)

펫이 Windows 네이티브 Claude까지 잡고 있으면(군더더기 연결) settings.json에서 지워도 **즉시 재주입돼 원복**된다. 원인: `clawd-prefs.json`(`AppData\Roaming\clawd-on-desk\`)의 `manageClaudeHooksAutomatically: true` + 앱 프로세스 실행 중 → settings.json을 watch하다 변경 감지 즉시 hook 재주입.

영구 제거하려면:
1. `manageClaudeHooksAutomatically: false`로 prefs 변경 (→ 앱 재시작해야 인식하기도 함).
2. 그 뒤 네이티브 settings.json에서 clawd-hook.js 직접호출 + **PermissionRequest(127.0.0.1:23333/permission)** 항목 제거.
3. 30초~1분 뒤 재grep해서 0건 유지(재주입 안 됨) 확인.

부작용: auto-manage를 끄면 그 머신의 다른 CLI 에이전트(codex/gemini/cursor 등) hook 자동관리도 같이 꺼진다. claude만 쓰는 노드면 무해. **추가(연결)는 auto-manage 켜진 채로도 되지만, 제거(정리)는 auto-manage를 꺼야 박힌다.**

## 검증 한계

챗봇은 헤드리스(WSL2)라 펫 캐릭터의 실제 시각 반응은 못 본다. hook EXIT=0 + JSON 유효까지가 챗봇이 확정할 수 있는 최대치. 캐릭터가 진짜 움직이는지는 사람이 다음 새 세션 SessionStart 때 화면으로 확인.

## 비고

이 노하우는 Windows/WSL2 노드 + Claude Code 챗봇 + settings.json hook 주입 케이스. macOS/맥미니 + OpenClaw/Codex 시절의 PID 체인 재연결은 별건([clawd-openclaw-codex-reconnect](clawd-openclaw-codex-reconnect.md), OpenClaw 2026-05-15 폐기로 history).
