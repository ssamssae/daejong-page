---
prevention_deferred: null
---

# 노트북 Claude Code SessionStart hook `/opt/homebrew/bin/node: not found` 실패

- **발생 일자:** 2026-05-15 (발견 시점)
- **해결 일자:** 2026-05-15 13:35 KST
- **심각도:** low
- **재발 가능성:** medium (desktop3060ti 잔존 — 본진 note)
- **영향 범위:** 💻 노트북 Claude Code 시작 시 SessionStart hook + Auto-update

## 증상
Claude Code 새 세션 시작 시 빨간 줄 2개 발생:
1) `SessionStart: startup hook Failed — /opt/homebrew/bin/node: not found`
2) Auto-update failed

## 원인
`~/.claude/settings.json` hook commands 에 macOS 본진 Homebrew node 경로
(`/opt/homebrew/bin/node`)가 하드코딩됨. 노트북(Ubuntu WSL2)에는 해당 경로
없으므로 hook 실행 시마다 실패. settings.json 을 기기 간 그대로 공유할 때
OS-specific 절대경로가 따라붙어 생기는 문제.

## 조치
1. `which node` → `/home/user/.local/node/bin/node` (v22.22.2) 확인
2. 백업: `~/.claude/settings.json.bak-2026-05-15-hookpath`
3. `sed -i "s|/opt/homebrew/bin/node|/home/user/.local/node/bin/node|g"` — 14개 치환
4. JSON 유효성 검증 (python3) + 잔존 0개 확인
5. 강대종 새 세션 시각 확인 → 빨간 줄 사라짐 ✅
6. 백업 삭제 (강대종 요청)

## 예방 (Forcing function 우선)
새 기기 Claude Code 초기 설정 시 settings.json hook command 에
OS-specific 절대경로(`/opt/homebrew/bin/node`, `/usr/bin/python3` 등)
대신 `$(which node)` 또는 `env node` 형태로 작성.
현재 노트북 노드 경로(`/home/user/.local/node/bin/node`)는 nvm/apt
재설치 시 깨질 수 있으므로, 다음 hook 수정 기회에 PATH-relative 로 교체 권고.

## 재발 이력
<처음 생성 시 비워둠>

## 관련 링크
- 텔레그램 메시지: id 716 (디렉티브), 720 (완료 보고), 722 (시각 확인)
- 본진 1.5차 note: desktop3060ti 동일 이슈 잔존, 별도 사이클 예정
