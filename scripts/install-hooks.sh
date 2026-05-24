#!/usr/bin/env bash
# repo-tracked hooks/ 디렉토리를 활성화. 노드 clone 직후 1회 실행.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
git config core.hooksPath hooks
echo "✅ core.hooksPath = hooks (repo-tracked post-commit 활성화)"
