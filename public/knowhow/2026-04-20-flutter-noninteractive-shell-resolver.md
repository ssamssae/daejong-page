---
category: 환경 설정
tags: [flutter, fvm, zsh, claude-code, bash, path]
first_discovered: 2026-04-20
related_issues:
  - 2026-04-20-flutter-not-in-path
---

# Claude Code Bash 도구의 비대화형 zsh + flutter 절대 경로 resolver

- **첫 발견:** 2026-04-20 (한컵 APK 빌드 실패)
- **재사용 영역:** Claude Code Bash 도구로 실행되는 모든 Flutter / fvm / 외부 CLI 호출

## 한 줄 요약

Claude Code Bash 도구는 **비대화형 zsh** 를 띄우는데 `~/.zshrc` / `~/.zprofile` 가 로드되지 않음. fvm 같은 PATH 셋업이 interactive rc 에서만 박혀있으면 `flutter not found` 발생. **절대 경로 resolver 헤더** 를 스킬마다 박는 게 정답.

## 차단 시그니처

```
(eval):1: command not found: flutter
```

`flutter build apk --release` exit 0 이지만 APK 미생성. 출력 파일에 위 에러.

`zsh -i -c 'which flutter'` 도 not found — fvm 가 `~/.zshenv` 가 아니라 `~/.zshrc` (interactive 전용) 에 PATH 추가하기 때문.

## 정답 — Resolver 헤더

스킬 SKILL.md 또는 자동화 스크립트 상단에 박기:

```bash
FLUTTER_BIN="$(command -v flutter 2>/dev/null \
  || ls /Users/user/fvm/versions/*/bin/flutter 2>/dev/null | head -1 \
  || echo flutter)"

# 사용
$FLUTTER_BIN build apk --release
$FLUTTER_BIN test
```

3단계 폴백:
1. `command -v flutter` → PATH 에 있으면 그대로
2. fvm 절대 경로 glob → 가장 첫 버전 사용
3. 그냥 `flutter` → 마지막 폴백 (exit 시 명확한 에러)

## fvm 의 경우

fvm 자체도 비대화형 shell 에서 못 찾을 수 있음. fvm 절대 경로:

```bash
FVM_BIN="$HOME/fvm/default/bin/flutter"     # default 채널
# 또는
FVM_BIN="$HOME/fvm/versions/3.41.7/bin/flutter"  # 명시 버전
```

## 반패턴 (피하기)

```bash
# ❌ Claude Code Bash 에서 안 됨
flutter build apk --release

# ❌ 별도 PATH export 도 인용 escape 깨질 수 있음
PATH="$HOME/fvm/default/bin:$PATH" flutter build ...

# ❌ source ~/.zshrc — 안 권장 (사이드이펙트 + slow)
source ~/.zshrc && flutter build ...
```

## Forcing Function

- 모든 Flutter 호출 스킬 (`/irun`, `/arun`, `/land`, `/submit-app`, `night-build.sh` 등) = resolver 헤더 디폴트
- 새 자동화 작성 시 외부 CLI 절대 경로 자동 발견 패턴 1순위
- 일반화: Flutter 외에도 fastlane, pod, npx, gh 등 PATH 의존 CLI 모두 같은 resolver 적용

## 적용 일반화 (~~ 다른 CLI)

```bash
resolve_bin() {
  local name="$1"
  local fallbacks="${2:-}"  # space-separated absolute path candidates
  for path in $(command -v "$name" 2>/dev/null) $fallbacks; do
    [[ -x "$path" ]] && { echo "$path"; return 0; }
  done
  echo "$name"  # 마지막 폴백
}

FLUTTER_BIN=$(resolve_bin flutter "$HOME/fvm/versions/*/bin/flutter")
FASTLANE_BIN=$(resolve_bin fastlane "/opt/homebrew/bin/fastlane")
NODE_BIN=$(resolve_bin node "/opt/homebrew/bin/node")
```

## 재사용 후보

- /irun, /arun, /land Flutter 빌드 스킬
- /submit-app, fastlane lane, night-build.sh
- mac-mini SoT 자동배포 모든 Bash 스크립트
- 새 Mac/WSL 셋업 시 zshenv 우회 표준
