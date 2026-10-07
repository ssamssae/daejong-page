#!/usr/bin/env bash
# test_auto_merge_merge_step.sh — auto-merge.yml 'Merge non-sensitive PR' 스텝 픽스처 (T-261008-004).
#
# ■이 픽스처가 지키는 것
#   [1] 머지 토큰 = 실행마다 발급되는 GITHUB_TOKEN. 만료된 DEPLOY_PAT 가 남아 있어도 쓰지 않는다
#       (실측 2026-10-07: DEPLOY_PAT 401 Bad credentials 로 모든 PR 자동 머지 실패).
#   [2] 발행기가 먼저 머지한 PR(state=MERGED)은 다시 머지하지 않고 성공으로 끝낸다.
#   [3] 머지가 실제로 확인된 뒤에만 deploy.yml 을 workflow_dispatch 로 실행한다
#       (GITHUB_TOKEN 머지는 push 이벤트로 배포를 깨우지 못한다).
#   [4] 머지가 확인되지 않으면 배포를 실행하지 않고 실패로 끝낸다.
#   [5] mergeable 이 아니면 머지도 배포도 하지 않는다(기존 보류 동작 유지).
#
# ■룰을 베끼지 않는다 — 워크플로 스텝 run 블록을 그대로 추출해 실행한다.
# usage: test_auto_merge_merge_step.sh [workflow.yml]
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

python3 - "$WF" "$TMP/merge.sh" "$TMP/env.txt" <<'PY' || { echo "추출 실패 — 스텝 이름이 바뀌었는지 확인하라" >&2; exit 3; }
import sys, yaml
wf, out, envout = sys.argv[1:4]
doc = yaml.safe_load(open(wf, encoding="utf-8"))
for job in (doc.get("jobs") or {}).values():
    for step in (job.get("steps") or []):
        if step.get("name") == "Merge non-sensitive PR":
            open(out, "w", encoding="utf-8").write(step["run"])
            open(envout, "w", encoding="utf-8").write("\n".join(f"{k}={v}" for k, v in (step.get("env") or {}).items()))
            sys.exit(0)
sys.exit(1)
PY

# gh 스텁 — 호출을 기록하고 시나리오별 응답을 낸다(진짜 gh 안 씀).
mkdir -p "$TMP/bin"
cat >"$TMP/bin/gh" <<'EOF'
#!/usr/bin/env bash
echo "GH_TOKEN=${GH_TOKEN:-} :: $*" >>"$GH_LOG"
case "$*" in
  *"pr view"*"--json state"*)
    n=$(cat "$GH_STATE_COUNT" 2>/dev/null || echo 0); echo $((n+1)) >"$GH_STATE_COUNT"
    if [ "$n" -lt "${GH_STATES_BEFORE_MERGED:-0}" ]; then echo "${GH_INITIAL_STATE:-OPEN}"; else echo "${GH_FINAL_STATE:-MERGED}"; fi ;;
  *"pr view"*"--json mergeable"*) echo "${GH_MERGEABLE:-MERGEABLE}" ;;
  *"pr view"*"--json comments"*) echo 0 ;;
  *"api graphql"*) echo "${GH_AUTO_ALLOWED:-true}" ;;
  *) : ;;
esac
EOF
chmod +x "$TMP/bin/gh"
printf '#!/usr/bin/env bash\n:\n' >"$TMP/bin/sleep"; chmod +x "$TMP/bin/sleep"

run_case() { # $1=name; rest = env assignments
  local name="$1"; shift
  export GH_LOG="$TMP/$name.log" GH_STATE_COUNT="$TMP/$name.count"
  : >"$GH_LOG"; rm -f "$GH_STATE_COUNT"
  env PATH="$TMP/bin:$PATH" PR_NUMBER=42 GH_REPO=ssamssae/daejong-page \
    DEPLOY_PAT=expired-pat GITHUB_TOKEN_FALLBACK=gha-token GITHUB_TOKEN=gha-token "$@" \
    bash -euo pipefail "$TMP/merge.sh" >"$TMP/$name.out" 2>&1
  echo $?
}

echo "[1·3] 정상: MERGEABLE → 머지 → MERGED 확인 → deploy 실행"
rc=$(run_case normal GH_INITIAL_STATE=OPEN GH_STATES_BEFORE_MERGED=1)
[ "$rc" = 0 ] && ok "rc=0" || bad "rc=$rc $(tail -3 "$TMP/normal.out")"
grep -q "pr merge 42" "$TMP/normal.log" && ok "pr merge 호출" || bad "pr merge 미호출"
if grep "pr merge 42" "$TMP/normal.log" | grep -q -- "--auto"; then bad "--auto 로 머지(완료 확인 불가)"; else ok "--auto 없이 즉시 머지"; fi
if grep -q "expired-pat" "$TMP/normal.log"; then bad "만료 DEPLOY_PAT 사용"; else ok "DEPLOY_PAT 미사용"; fi
grep "pr merge 42" "$TMP/normal.log" | grep -q "GH_TOKEN=gha-token" && ok "GITHUB_TOKEN 으로 머지" || bad "머지 토큰이 GITHUB_TOKEN 아님"
grep -q "workflow run deploy.yml" "$TMP/normal.log" && ok "deploy.yml dispatch" || bad "deploy dispatch 없음"
m=$(grep -n "pr merge 42" "$TMP/normal.log" | head -1 | cut -d: -f1); d=$(grep -n "workflow run deploy.yml" "$TMP/normal.log" | head -1 | cut -d: -f1)
[ -n "$m" ] && [ -n "$d" ] && [ "$d" -gt "$m" ] && ok "머지 뒤에 배포" || bad "순서 오류 merge=$m deploy=$d"

echo "[2] 이미 머지된 PR → 머지·배포 없이 성공"
rc=$(run_case already GH_INITIAL_STATE=MERGED GH_STATES_BEFORE_MERGED=0 GH_FINAL_STATE=MERGED)
[ "$rc" = 0 ] && ok "rc=0" || bad "rc=$rc $(tail -3 "$TMP/already.out")"
grep -q "pr merge" "$TMP/already.log" && bad "이미 머지된 PR 을 다시 머지" || ok "재머지 없음"
grep -q "workflow run" "$TMP/already.log" && bad "이미 머지된 PR 로 배포 실행" || ok "배포 없음(발행기 push 가 배포)"

echo "[4] 머지 미확인 → 배포 없음 + 실패"
rc=$(run_case unconfirmed GH_INITIAL_STATE=OPEN GH_STATES_BEFORE_MERGED=99 GH_FINAL_STATE=OPEN)
[ "$rc" != 0 ] && ok "rc=$rc (실패)" || bad "미확인인데 rc=0"
grep -q "workflow run" "$TMP/unconfirmed.log" && bad "미확인인데 배포 실행" || ok "배포 없음"

echo "[5] CONFLICTING → 머지·배포 없음"
rc=$(run_case conflict GH_INITIAL_STATE=OPEN GH_MERGEABLE=CONFLICTING)
[ "$rc" = 0 ] && ok "rc=0 (기존 보류 동작)" || bad "rc=$rc"
grep -q "pr merge" "$TMP/conflict.log" && bad "충돌인데 머지" || ok "머지 없음"
grep -q "workflow run" "$TMP/conflict.log" && bad "충돌인데 배포" || ok "배포 없음"

echo "[perm] 워크플로가 actions: write 권한을 가진다(dispatch 용)"
python3 - "$WF" <<'PY' && ok "actions: write" || bad "actions: write 권한 없음"
import sys, yaml
doc = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
perm = (doc.get("jobs", {}).get("auto-merge", {}).get("permissions")) or doc.get("permissions") or {}
sys.exit(0 if perm.get("actions") == "write" else 1)
PY

echo "[race] 검사 잡: 머지 ref 가 사라져도(발행기 선머지) 실패하지 않고 PR head 로 검사한다"
python3 - "$WF" <<'PY' && ok "merge ref 실패 시 head sha 로 대체 checkout, 권한 contents:read 유지" || bad "검사 잡 경합 처리 없음/권한 변경"
import sys, yaml
doc = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
job = doc["jobs"]["verify-shared-sources"]
steps = job["steps"]
first = steps[0]; fb = steps[1]
ok = (job.get("permissions") == {"contents": "read"}
      and first.get("uses", "").startswith("actions/checkout") and first.get("continue-on-error") is True
      and first.get("id")
      and fb.get("uses", "").startswith("actions/checkout")
      and "head.sha" in str(fb.get("with", {}).get("ref", ""))
      and first["id"] in str(fb.get("if", "")) and "failure" in str(fb.get("if", "")))
sys.exit(0 if ok else 1)
PY

[ "$fails" = 0 ] && echo "PASS test_auto_merge_merge_step" || { echo "FAIL test_auto_merge_merge_step ($fails)"; exit 1; }
