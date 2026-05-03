---
category: Claude Code
tags: [claude-code, harness, git, push, default-branch, settings, permissions, solo-dev]
related_issues:
  - 2026-04-27-harness-default-branch-push-block
  - 2026-04-27-wsl-hanjul-push-classifier-block
---

# 하네스가 default branch 직접 push 를 PR review 우회로 차단 — settings.json 좁은 allow 로 해결

- **첫 발견:** 2026-04-27 (hanjul .dart 수정 후 `git push origin main` 거부)
- **재사용 영역:** solo-dev repo 에서 매 작업 후 `git push origin main` 을 하는 모든 워크플로우

## 한 줄 요약

하네스 분류기가 `git push origin main` 을 "PR review 우회"로 판단, 명시적 승인이 없으면 거부한다. CLAUDE.md 의 "끝나면 즉시 git push" 는 general guidance 로 인식돼 승인으로 안 쳐준다. **`settings.json permissions.allow` 에 `Bash(git push origin main)` 를 박아야 한다.**

## 비대칭 동작

같은 세션에서도 **파일 종류 + repo 성격**에 따라 분류기 판단이 다르다:

| 상황 | 결과 |
|------|------|
| `claude-skills` repo `.md` 1개 push | 통과 |
| `hanjul` repo `.dart` 코드 + production 영향 | 거부 |

meta/docs repo 는 통과, 앱 코드 repo 는 거부 경향.

## 해결 — settings.json 영구 룰

```json
// ~/.claude/settings.json → permissions.allow 배열에 추가
"Bash(git push origin main)"
```

**force push 는 별도 유지:**
- `git push --force*` 는 allow 금지
- `git push origin main` (일반 fast-forward) 만 허용

## 대안 — CLAUDE.md "명시 승인" 강화

분류기가 "specifically authorize" 키워드를 본다면:

```
작업 끝나면 즉시 git push origin main (default branch 직접 push OK — solo dev repo, PR review 없음)
```

단, settings.json 영구 룰이 가장 확실한 해결.

## C 옵션 — 항상 PR 분기 (solo dev 에선 오버헤드)

solo dev repo 에서 매 작업마다 `wsl/<task>-<date>` 브랜치 + PR 은 하루 6~8개 PR 누적. 코드 repo 는 이 선택지를 피하는 게 현실적.

단, **multi-device CLAUDE.md 규칙** (Mac/WSL 병렬 작업)이 있는 repo 는 충돌 방지를 위해 PR 분기가 올바름 — settings.json allow 와 혼용 가능.

## Forcing Function

- 새 repo 셋업 시 settings.json push allow 여부 먼저 확인
- 거부 메시지에 "bypasses PR review" 키워드 → 이 패턴으로 즉시 진단
- `feedback_respect_harness_denial.md`: 거부 나오면 우회 시도 X, 강대종님에게 알림

## 관련 이슈 (포스트모템)

- `issues/2026-04-27-harness-default-branch-push-block.md` (WSL 뷰 — 옵션 A/B/C 상세)
- `issues/2026-04-27-wsl-hanjul-push-classifier-block.md` (Mac 뷰 — canonical)
- `feedback_auto_mode_no_allow_prompt.md`
