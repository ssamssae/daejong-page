#!/usr/bin/env bash
# test_site_search_excerpt.sh — 검색 미리보기 이중 변환 회귀 (T-261011-022).
# node 단위 테스트(scripts/test-site-search-excerpt.mjs, prebuild 에서도 실행)를
# 공개 페이지 검증 계약의 셸 검사 목록에서도 돌린다.
# 결과 줄 꾸밈 회귀는 tests/site-search.spec.mjs(Playwright, dist 를 :8772 로 띄워 실행)가 맡는다.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
node --test "$ROOT/scripts/test-site-search-excerpt.mjs"
echo "PASS test_site_search_excerpt"
