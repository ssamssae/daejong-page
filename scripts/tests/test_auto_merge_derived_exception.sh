#!/usr/bin/env bash
# test_auto_merge_derived_exception.sh — auto-merge.yml 훅 파생 파일 예외 픽스처 (T-260805-019).
#
# ■이 픽스처가 지키는 것
#   [1] insight PR(승인 컬렉션 md + 훅이 만든 ai-glossary.html.astro)은 ★통과한다
#   [2] ★음성 대조군 — 사람이 손댄 디자인·공개문안 PR 은 ★여전히 HOLD 다.
#       이게 제일 중요하다. [1] 만 보면 게이트를 그냥 열어버린 것과 구분이 안 된다.
#   [3] 파생 파일 이름이 ★다른 게이트(정책/인프라)를 여는 만능키가 되지 않는다
#
# ■룰을 베끼지 않는다 — .github/workflows/auto-merge.yml 의 'Detect sensitive files' 스텝
#   run 블록을 ★그대로 추출해 실행한다. 여기에 판정을 재구현하면 표가 두 벌이 되고
#   하나는 반드시 낡는다(T-260805-023 이 정확히 그 병이었다).
#
# usage: test_auto_merge_derived_exception.sh [workflow.yml]
#   인자로 다른 워크플로 파일을 주면 그것으로 돈다 — ★고치기 전 버전에 물려 빨강을
#   실증하는 용도(검증 1).
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
WF="${1:-$ROOT/.github/workflows/auto-merge.yml}"

fails=0
ok()  { echo "  ok   — $1"; }
bad() { echo "  FAIL — $1" >&2; fails=$((fails + 1)); }

[ -r "$WF" ] || { echo "워크플로 파일 없음: $WF" >&2; exit 2; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# ── 판정 스텝 추출 (재구현 금지) ──────────────────────────────────────────────
python3 - "$WF" "$TMP/detect.sh" <<'PY' || { echo "추출 실패 — 스텝 이름이 바뀌었는지 확인하라" >&2; exit 3; }
import sys, yaml
wf, out = sys.argv[1], sys.argv[2]
doc = yaml.safe_load(open(wf, encoding="utf-8"))
for job in (doc.get("jobs") or {}).values():
    for step in (job.get("steps") or []):
        if step.get("name") == "Detect sensitive files":
            open(out, "w", encoding="utf-8").write(step["run"])
            sys.exit(0)
sys.exit(1)
PY
chmod +x "$TMP/detect.sh"

# gh 스텁 — `gh pr diff --name-only` 가 케이스별 파일 목록을 낸다(진짜 gh 안 씀).
mkdir -p "$TMP/bin"
cat >"$TMP/bin/gh" <<'EOF'
#!/usr/bin/env bash
cat "$GH_STUB_FILES"
EOF
chmod +x "$TMP/bin/gh"

# $1=케이스명  $2=기대(sensitive true/false)  $3..=변경 파일들
run_case() {
  local name="$1" want="$2"; shift 2
  local d="$TMP/case$$RANDOM"; mkdir -p "$d"
  printf '%s\n' "$@" > "$d/files"
  : > "$d/out"
  ( cd "$d" \
    && PATH="$TMP/bin:$PATH" GH_STUB_FILES="$d/files" \
       GITHUB_OUTPUT="$d/out" GH_TOKEN=x \
       REPO_NAME=daejong-page PR_NUMBER=1 GH_REPO=ssamssae/daejong-page \
       PR_HEAD_REPO=ssamssae/daejong-page PR_BODY="" PR_TITLE="insights: sample" \
       bash "$TMP/detect.sh" >/dev/null 2>&1 )
  local got
  got="$(grep -m1 '^sensitive=' "$d/out" 2>/dev/null | cut -d= -f2)"
  local reason
  reason="$(grep -m1 '^reason=' "$d/out" 2>/dev/null | cut -d= -f2-)"
  if [ "$got" = "$want" ]; then
    ok "$name → sensitive=$got${reason:+ ($reason)}"
  else
    bad "$name → sensitive=${got:-<판정없음>} (기대 $want)${reason:+ reason=$reason}"
  fi
}

echo "── [1] insight PR — 승인 컬렉션 md + 훅이 만든 파생 .astro 는 통과 ─────────"
run_case "insight md + 훅 파생 ai-glossary" false \
  "src/content/insights/2026-08-05-sample.md" \
  "src/pages/ai-glossary.html.astro"
run_case "worklog md + 훅 파생 ai-glossary" false \
  "src/content/worklog/2026-08-05-sample.md" \
  "src/pages/ai-glossary.html.astro"
run_case "insight md 단독(파생 없음) — 종전에도 통과하던 형태" false \
  "src/content/insights/2026-08-05-sample.md"

echo "── [2] ★음성 대조군 — 사람이 손댄 디자인·공개문안은 여전히 HOLD ──────────"
run_case "★사람이 src/pages/ 직접 수정 (파생 아님)" true \
  "src/pages/index.astro"
run_case "★insight md + 사람이 손댄 다른 .astro" true \
  "src/content/insights/2026-08-05-sample.md" \
  "src/pages/about.astro"
run_case "★insight md + css 수정" true \
  "src/content/insights/2026-08-05-sample.md" \
  "src/styles/main.css"
run_case "★파생 파일 단독 (승인 컬렉션 없음 = 예외 조건 미충족)" true \
  "src/pages/ai-glossary.html.astro"
run_case "★승인 컬렉션 밖 content 가 섞인 mixed PR" true \
  "src/content/insights/2026-08-05-sample.md" \
  "src/content/policy/fleet.md"
run_case "★src/data/ 공개 데이터 수정" true \
  "src/data/fleet-policy.json"

echo "── [3] ★파생 예외가 다른 게이트의 만능키가 되지 않는다 ────────────────────"
run_case "★insight md + 파생 + .github/ 워크플로" true \
  "src/content/insights/2026-08-05-sample.md" \
  "src/pages/ai-glossary.html.astro" \
  ".github/workflows/auto-merge.yml"
run_case "★insight md + 파생 + hooks/" true \
  "src/content/insights/2026-08-05-sample.md" \
  "src/pages/ai-glossary.html.astro" \
  "hooks/post-commit"
run_case "★insight md + 파생 + CLAUDE.md" true \
  "src/content/insights/2026-08-05-sample.md" \
  "src/pages/ai-glossary.html.astro" \
  "CLAUDE.md"

echo
if [ "$fails" -eq 0 ]; then echo "PASS test_auto_merge_derived_exception"; exit 0
else echo "FAIL test_auto_merge_derived_exception ($fails)"; exit 1; fi
