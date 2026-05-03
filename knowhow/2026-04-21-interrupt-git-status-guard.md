---
category: 워크플로우
tags: [git, interrupt, untracked, orphan, session-start, skill-file, stop-hook, safety-net]
related_issues:
  - 2026-04-21-orphan-skill-file-after-interrupt
---

# 세션 중단 후 미커밋 파일 방지 — git status 가드 패턴

- **첫 발견:** 2026-04-21 (세션 interrupt 후 9시간 뒤 orphan 파일 발견)
- **재사용 영역:** Claude Code 세션이 도중에 중단(인터럽트/컨텍스트 스위치)된 뒤 다음 세션에서 상태 이어받기. 스킬 파일, 이슈, 노하우 등 중요 문서를 Write 하는 모든 작업에 적용.

## 한 줄 요약

`Write()` 로 파일을 생성한 뒤 세션이 중단되면 `git add/commit/push` 가 누락된 채 로컬 디스크에만 남는다. **세션 시작 첫 단계로 `git status` 를 돌려 untracked/unstaged 파일을 잡는 것이 가장 단순한 안전망.**

## 패턴 (재사용 가능한 절차)

### 1. 세션 시작 안전망 (권장)

```bash
# 매 세션 첫 작업 전 두 줄
cd ~/.claude/skills && git status --short
cd ~/daejong-page   && git status --short
```

untracked/unstaged 가 있으면 즉시 처리:

```bash
git add <file>
git commit -m "recover: add orphan file from previous session"
git push
```

### 2. 파일 쓰기는 commit 까지 한 묶음으로

```
Write() → git add → git commit → git push
```

사용자 확인 대기 없이 하나의 응답 안에서 완료. 가역 작업이므로 즉시 진행 OK.

### 3. Stop 훅 감지 (자동화)

```bash
#!/bin/bash
# ~/.claude/hooks/stop-check-repos-dirty.sh
for repo in ~/.claude/skills ~/daejong-page; do
  dirty=$(cd "$repo" && git status --porcelain 2>/dev/null)
  if [ -n "$dirty" ]; then
    echo "WARNING: $repo 미커밋 변경 감지"
    # 텔레그램 경보 추가 가능
  fi
done
```

`settings.json` Stop 훅으로 등록하면 세션 종료마다 자동 감지.

## 체크리스트 (세션 시작 시)

- [ ] `git status --short` 실행 (skills + daejong-page 양쪽)
- [ ] untracked 파일 있으면 내용 확인 후 커밋
- [ ] unstaged 변경 있으면 의도 확인 후 커밋 또는 stash

## 주의

- 파일이 로컬에 있어도 Mac 디스크 장애 시 영구 유실 — git push 까지 완료해야 안전
- `/clear` 세션 초기화는 이전 세션의 untracked 상태를 자동으로 감지하지 않음 — 명시적 확인 필수
- `commit --amend` 대신 신규 커밋 선호 (이전 커밋 파괴 방지)
