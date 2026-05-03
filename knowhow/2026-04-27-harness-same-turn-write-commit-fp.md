---
category: Claude Code
tags: [claude-code, harness, sandbox, git, commit, write, false-positive, settings]
related_issues:
  - 2026-04-27-same-turn-commit-fp
---

# 같은 turn 내 Write→commit 묶음, harness false positive — settings.json 영구 룰로 해결

- **첫 발견:** 2026-04-27 (핸드오프 파일 Write 직후 commit + push 묶음 거부)
- **재사용 영역:** Claude Code 자동 모드에서 파일 생성 직후 git commit 을 같은 turn 에 실행하는 모든 워크플로우

## 한 줄 요약

Claude Code harness sandbox 가 같은 turn 안에서 Write 직후 commit 을 시도할 때 transcript flush timing race 로 "Write 흔적이 없다"는 false positive 를 낸다. 1회성 Allow 는 auto mode 에서 무용. **settings.json `permissions.allow` 에 영구 룰을 박아야만 해결된다.**

## 증상 패턴

```
Permission for this action has been denied.
Reason: Committing a file that was never written in this transcript —
the file was not created by any prior Write action, suggesting an
unverifiable/missing artifact being pushed to shared repo.
```

Write 툴이 "File created successfully" 를 반환한 직후임에도 commit 단계에서 위 거부 발생.

## 원인

harness sandbox 의 Write↔commit 매칭 로직이 transcript flush timing 에 의존한다. 같은 turn 내 `Write` 직후 `Bash(git commit)` 를 체이닝하면 sandbox 가 transcript 에서 직전 Write 를 못 보는 race condition 발생.

## 해결 — settings.json 영구 룰 (강대종님이 직접 추가)

```json
// ~/.claude/settings.json → permissions.allow 배열에 추가
"Bash(git commit*)",
"Bash(git push origin*)"
```

좁은 패턴 주의: `--force` 등은 별도 차단 유지. `git commit` + `git push origin <branch>` 범위만.

## 임시 우회

settings.json 수정 전까지:
- Write 다음 turn 에서 commit (같은 turn 연속 묶음 안 하기)
- 또는 강대종님이 터미널에서 직접 `git commit && git push`

## 핵심 룰

1. **auto mode 에서 1회성 Allow 는 무용** — `feedback_auto_mode_no_allow_prompt.md` 확인.
2. **settings.json 은 agent 가 자체 수정 불가** — `feedback_harness_self_modification_gate.md`. 강대종님이 직접 or `/update-config` 스킬 경유.
3. 거부 메시지가 "user can add a Bash permission rule" 을 안내하면 → settings.json 추가가 유일한 근본 해결.

## Forcing Function

harness sandbox false positive 가 의심되면:
1. `cat ~/.claude/hooks/*.sh | grep -i "commit\|write"` — 사용자 hook 거부인지 먼저 확인
2. 거부 메시지에 "sandbox" / "transcript" 키워드 있으면 harness FP 확정
3. settings.json `permissions.allow` 에 좁은 Bash 패턴 추가 요청 (agent 는 사용자 경유)

## 관련 이슈 (포스트모템)

- `issues/2026-04-27-same-turn-commit-fp.md`
- `feedback_auto_mode_no_allow_prompt.md`
- `feedback_harness_self_modification_gate.md`
