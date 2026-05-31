#!/usr/bin/env bash
# pii-guard.sh — 공개 콘텐츠 PII pre-push 가드 (forcing function, 2026-05-30).
#
# 사용:
#   pii-guard.sh <file> [file ...]      # 지정 파일 스캔
#   pii-guard.sh --diff <gitrange>      # git diff 범위의 변경 파일 스캔 (예: origin/main..HEAD)
#
# 공개 렌더 경로만 스캔: sorry/ newsletter/ insights/ worklog/ webtoons/ habits/ knowhow/
#   + *.html + **/index.json. worklog-source/ 등 내부 경로는 제외 (index.json 포함).
#
# match 시: 위반 file:line:matched 출력 + exit 1 (차단). 무매치 exit 0.
# PII_GUARD_OVERRIDE=1 → 경고만 출력 + exit 0 (아니키 본인 명시 게시 예외).
#
# 근거: feedback_no_pii_on_public_pages, feedback_confirm_recipient_before_external_send.
# 아니키 본인 이름/번호도 디폴트 차단 (과보호가 누락보다 안전) — override 로 의도 게시.
# bash 3.2 호환 (macOS push 지점). mapfile/연관배열 미사용.

set -uo pipefail

# 스캔 정규식 (ERE). 공개 콘텐츠 한정.
#  - KR 휴대폰 / 국제(+82) / 이메일 / 주민번호류
RE='01[016789][- ]?[0-9]{3,4}[- ]?[0-9]{4}|\+82[- ]?1[0-9][- ]?[0-9]{3,4}[- ]?[0-9]{4}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|[0-9]{6}[- ][0-9]{7}'

# 아니키 본인 연락처 화이트리스트 (T-260531-21). 본인 공개 게시 의도(포트폴리오 연락처·
# 언론 제보 회신처 등)라 3rd-party PII 와 구분해 위반에서 제외. 정확히 일치하는 매치만 통과 —
# 전화번호/주민번호/타인 이메일은 그대로 차단. 공개룰 "본명 강대종 = 아니키 본인 한정" 와 동일 정신.
WHITELIST_PII='ssamssae@naver.com gayoremix@gmail.com'

# === 스캔 대상 파일 수집 ===
files=()
if [ "${1:-}" = "--diff" ]; then
  range="${2:-}"
  if [ -z "$range" ]; then echo "usage: pii-guard.sh --diff <gitrange>" >&2; exit 2; fi
  while IFS= read -r f; do
    [ -n "$f" ] && files+=("$f")
  done < <(git diff --name-only "$range" 2>/dev/null)
elif [ "$#" -gt 0 ]; then
  files=("$@")
else
  echo "usage: pii-guard.sh <file...> | --diff <gitrange>" >&2
  exit 2
fi

# === 공개 렌더 경로 판정 ===
# 내부 경로(worklog-source/) 제외가 공개 매치보다 우선.
is_public() {
  local p="$1"
  case "$p" in
    worklog-source/*) return 1 ;;
  esac
  case "$p" in
    sorry/*|newsletter/*|insights/*|worklog/*|webtoons/*|habits/*|knowhow/*) return 0 ;;
    *.html) return 0 ;;
    */index.json|index.json) return 0 ;;
  esac
  return 1
}

if [ "${#files[@]}" -eq 0 ]; then
  exit 0
fi

violations=0
out=""
for f in "${files[@]}"; do
  [ -n "$f" ] || continue
  is_public "$f" || continue
  [ -f "$f" ] || continue   # 삭제/미존재 파일 skip
  hits=$(grep -noHE "$RE" "$f" 2>/dev/null || true)
  # 화이트리스트 매치 제거 — file:line:matched 의 matched 가 본인 연락처면 drop.
  if [ -n "$hits" ] && [ -n "$WHITELIST_PII" ]; then
    filtered=""
    while IFS= read -r line; do
      [ -n "$line" ] || continue
      matched="${line#*:}"; matched="${matched#*:}"   # file: 와 line: 제거 → 매치값
      skip=0
      for w in $WHITELIST_PII; do
        [ "$matched" = "$w" ] && { skip=1; break; }
      done
      [ "$skip" = "0" ] && filtered+="$line"$'\n'
    done <<< "$hits"
    hits="${filtered%$'\n'}"
  fi
  if [ -n "$hits" ]; then
    out+="$hits"$'\n'
    violations=$((violations + 1))
  fi
done

if [ "$violations" -gt 0 ]; then
  if [ "${PII_GUARD_OVERRIDE:-0}" = "1" ]; then
    echo "⚠️ PII 감지 (PII_GUARD_OVERRIDE=1 통과):" >&2
    printf '%s' "$out" >&2
    exit 0
  fi
  echo "❌ 공개 콘텐츠 PII 차단 — push 거부:" >&2
  printf '%s' "$out" >&2
  echo "→ 의도된 공개 게시면 PII_GUARD_OVERRIDE=1 로 재시도" >&2
  exit 1
fi

exit 0
