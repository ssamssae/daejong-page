#!/usr/bin/env bash
# install-pii-guard-hook.sh — pre-push PII 가드 활성화 (멱등).
#
# daejong-page 는 core.hooksPath=hooks (repo-tracked) 모델 — scripts/install-hooks.sh 와 동일.
# repo-tracked hooks/pre-push 가 모든 노드 clone 에 자동 배포되므로, 이 스크립트는
#   (1) core.hooksPath=hooks 보장
#   (2) hooks/pre-push + scripts/pii-guard.sh 실행권한 보장
# 만 수행한다 (literal .git/hooks/pre-push 는 core.hooksPath=hooks 하에선 무시되므로 사용 X).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

git config core.hooksPath hooks

HOOK="hooks/pre-push"
if [ ! -f "$HOOK" ]; then
  echo "❌ $HOOK 없음 — repo 에 커밋됐는지 확인" >&2
  exit 1
fi
chmod +x "$HOOK" scripts/pii-guard.sh 2>/dev/null || true

echo "✅ pre-push PII 가드 활성 (core.hooksPath=hooks, $HOOK)"
echo "   우회: PII_GUARD_OVERRIDE=1 git push ..."
