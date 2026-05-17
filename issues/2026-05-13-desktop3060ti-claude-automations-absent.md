---
prevention_deferred: null
summary: "desktop3060ti에 ~/.claude/automations/ repo가 부재해 WSL 디렉티브 회수 시 surface된 셋업 누락"
---

# desktop3060ti `~/.claude/automations/` repo 부재 — WSL 디렉티브 회수 시 surface

- **발생 일자:** 2026-05-13 11:02 KST (WSL 디렉티브 회수 phase 2 desktop3060ti reverse reply)
- **해결 일자:** 미해결 (강대종 결정 보류)
- **심각도:** medium (다기기 회수 자동화의 호환성 함정 surface)
- **재발 가능성:** medium (다른 기기에서도 같은 패턴 가능 — hermes, 향후 추가 노드)
- **영향 범위:** desktop3060ti 챗봇 노드 자동화 호환성, WSL 디렉티브 회수 가정 ("타 OS 는 코드만 박힘 no-op")

## 증상

WSL 디렉티브 (session-clear v2.4/v2.0 회수 2/2) 발사 — 4기기 (본진 + Mac mini + desktop3060ti + hermes) 에 동일 페이로드 페이스트. desktop3060ti reverse reply 결과:

```
| repo | 기대 SHA | 실제 결과 |
|---|---|---|
| claude-skills | 0ba9ae3 | ✅ 0ba9ae3 (fast-forward 30 commits) |
| claude-automations | b921190 | ❌ repo 미설치 |
```

desktop3060ti `~/.claude/automations/` 디렉토리 상태:
```
$ ls -la ~/.claude/automations/
scripts/    # 디렉토리 1개만
$ ls ~/.claude/automations/scripts/
mac-report.sh  macmini-report.sh  wsl-directive.sh   # 3개만
$ ls ~/.claude/automations/hooks/
ls: cannot access: No such file or directory
```

- claude-automations git repo 자체가 desktop3060ti 에 clone 안 됨
- scripts/ 3개는 (수동 복사 추정, 출처 불명)
- hooks/session-clear-trigger.sh 자체 부재
- WSL 디렉티브 가정 "타 OS 는 코드만 박힘 (no-op)" 가 이 기기엔 안 맞음 — **코드 자체 부재**

검증 `bash -n` / `grep` 은 대상 파일 부재로 실행 불가 (N/A).

## 원인

1. **claude-automations repo 가 desktop3060ti 에 clone 된 적 없음** — 기기 셋업 시 자동화 repo sync 룰 부재. WSL 셋업 가이드 또는 새 기기 onboarding 문서에 누락.
2. **scripts/ 3개의 출처 불명** — mac-report.sh / macmini-report.sh / wsl-directive.sh 가 어떻게 들어왔는지 trace 안 됨. 수동 복사 추정.
3. **WSL 디렉티브 발사자가 desktop3060ti 의 자동화 repo 상태 모름** — "타 OS 는 no-op" 가정이 잘못된 전제 (코드 자체 부재).

## 조치

### 즉시 (강대종 결정 보류)

case A — clone 필요:
```bash
ssh desktop3060ti "cd ~ && git clone https://github.com/ssamssae/claude-automations.git && rm -rf ~/.claude/automations && ln -s ~/claude-automations ~/.claude/automations"
```
+ 자동 동기화 룰 (cron 또는 session start pull) 검토.

case B — chatbot 노드만이라 hooks 불필요:
- 현재 상태 유지 (session-clear keepalive 는 WSL 만 해당이라 desktop3060ti 무관).
- WSL 디렉티브 발사자가 4기기 일괄 회수 패턴에서 desktop3060ti / hermes 등 chatbot-only 노드 분리 처리 룰 박을 것.

### 본 사이클 (D09 close 직전)

issue 파일 박제 — 본 파일. 강대종 결정은 별 후속.

## 예방

- **(기기 onboarding 표준)**: 새 노드 셋업 시 `~/claude-skills` + `~/claude-automations` 둘 다 clone + `~/.claude/skills/` + `~/.claude/automations/` symlink 작업 매뉴얼 정립. WSL / desktop3060ti / hermes / 미래 노드 동일.
- **(WSL 디렉티브 발사 표준)**: 4기기 일괄 회수 디렉티브 발사 시 phase 0 으로 각 기기 자동화 repo 존재 검증 (`ssh <host> "test -d ~/claude-automations/.git"`) → 부재 기기는 회수 대상에서 자동 제외 + 강대종에 surface.
- **(automations 노드 policy)**: chatbot-only 노드 vs 자동화 host 노드 구분. chatbot-only 는 hooks 자체 불필요 → 회수 대상 제외 (case B 패턴).

## 재발 이력

- 첫 발견 사례. 비슷한 cross-device automation 가정 함정은 2026-05-08 Codex 양방향 결과 회수 불가 사고와 결의 공통 (자동화가 가정 잘못 잡고 진행).

## 관련 링크

- WSL 디렉티브 회수 흐름 메모리: `~/.claude/projects/-/memory/project_cross_bot_ack_channel_followup.md` (cross-bot ack forward 인프라 후속)
- 비슷한 cross-device 자동화 함정: `~/.claude/CLAUDE.md` "맥미니(Codex) 명령 라우팅 — 필독" 단락 (결과 자동 회수 불가)
- desktop3060ti 노드 정의: CLAUDE.md "현재 기기 빠른 식별" 표 line 5 (`desktop-0vab3qc*` 🖥)
- 본 사이클 텔레그램 메시지 시퀀스 (16296)
