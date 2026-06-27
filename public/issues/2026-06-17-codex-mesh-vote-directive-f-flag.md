# codex-mesh-vote 첫 발사 실패 — SKILL.md 가 `-f` 로 프롬프트 전달 지시 (스크립트는 `-f`=파일경로)

- **날짜**: 2026-06-17 (KST)
- **노드**: 🍎 본진
- **증상**: `/codex-mesh-vote` 실행 Phase 1 에서 5노드 디렉티브가 전부 `file not found: <프롬프트 본문>` (exit 2) 으로 발사 실패. 표면적으로 "codex REPL 을 못 찾는다" 처럼 보임.

## 루트 원인

`codex-mesh-vote/SKILL.md` Phase 1 이 디렉티브를 이렇게 문서화:

```
**본진 디렉티브** (`~/.claude/automations/scripts/mac-codex-directive.sh -f`):
```

따라서 모델이 `mac-codex-directive.sh -f "<프롬프트 본문>"` 형태로 호출.

그러나 `<node>-codex-directive.sh` 들의 `-f` 는 **"프롬프트를 파일 경로에서 읽기"** 플래그:

```bash
if [[ "$1" == "-f" ]]; then
  [[ -n "${2:-}" ]] || usage
  src="$2"
  [[ -f "$src" ]] || { echo "file not found: $src" >&2; exit 2; }
```

→ `-f` 뒤의 프롬프트 *본문*을 파일 경로로 해석 → `[[ -f "<본문>" ]]` 실패 → `file not found` exit 2. 5노드 전부 동일하게 실패.

이건 codex 생존(preflight) 과 무관하다. 같은 세션 preflight 는 5/5 RUNNING 정상이었고, 발사 단계에서만 깨졌다. 즉 "REPL 못 찾음" 이 아니라 **인자 전달 방식 문서 오류**.

## 진짜 호출 규약 (스크립트 usage)

```
<node>-codex-directive.sh "<prompt>"          # positional (정답)
<node>-codex-directive.sh -f /path/to/file    # 파일에서 읽기
echo "<prompt>" | <node>-codex-directive.sh - # stdin
```

멀티라인 프롬프트 본문은 positional 인자로 그대로 넘기면 됨 (스크립트가 mktemp 로 받아 load-buffer).

## 재발방지

1. `codex-mesh-vote/SKILL.md` Phase 1 의 5개 디렉티브 헤더에서 `-f` 제거 → `"<프롬프트>"` (positional) 로 교체.
2. Phase 1 상단에 ⚠️ 경고 블록 추가: "프롬프트는 positional 로, `-f` 는 파일경로 플래그라 본문을 주면 file not found." (본 이슈 링크 박음)

## 비고

- 별개의 기존 false-negative(`bare tmux` PATH / WSL `-L codex` 소켓)는 `node-session-check.sh` + preflight 로 이미 방어됨 (issue `2026-05-30-macmini-tmux-liveness-false-negative`, T-260614-05). 본 이슈는 그와 다른 *발사 단계* 인자 버그.
- `mac-codex-directive.sh` 의 auto-detect 분기(`/`·`./`·`~/` 로 시작 + 파일이면 파일로 간주)는 멀티라인 프롬프트에는 트리거되지 않아 positional 이 안전.
