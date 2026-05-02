---
category: iOS 빌드
tags: [apple-silicon, m1, m2, rosetta, flutter, ios, debug, iproxy]
first_discovered: 2026-04-29
related_issues:
  - 2026-04-29-rosetta-iproxy-attach
---

# Apple Silicon Mac 에서 Flutter iOS debug attach = Rosetta 필수

- **첫 발견:** 2026-04-29 (mac mini M1 에서 한줄일기 iOS debug attach 막힘)
- **재사용 영역:** 모든 Apple Silicon Mac (M1/M2/M3) 의 Flutter iOS debug 빌드 + USB attach

## 한 줄 요약

Flutter 가 함께 묶어 보내는 `iproxy` 바이너리(libusbmuxd) 가 **x86_64 빌드** 라 Apple Silicon Mac 에서 Rosetta 없이 실행 불가. **첫 셋업 시 Rosetta 1회 설치** 가 정답. release ipa 는 영향 없음 (debug attach 만).

## 차단 시그니처

```
Error: Flutter failed to run "/opt/homebrew/share/flutter/bin/cache/artifacts/libusbmuxd/iproxy ..."
The binary was built with the incorrect architecture to run on this machine.
If you are on an ARM Apple Silicon Mac, Flutter requires the Rosetta translation environment.
```

Xcode build/install 까지 정상 진행 (5~15s). 직후 위 에러 + 앱은 디바이스 설치됐지만 splash 에서 멈춤 (dart VM attach 실패).

## Rosetta 설치 (sudo 1회)

```bash
sudo softwareupdate --install-rosetta --agree-to-license
```

출력에 다음 경고 떠도 무해:
```
Package Authoring Error: 122-28065: Package reference com.apple.pkg.RosettaUpdateAuto is missing installKBytes attribute
```

마지막 줄 `Install of Rosetta 2 finished successfully` 확인.

## 검증

```bash
pgrep -x oahd && echo "Rosetta INSTALLED" || echo "Rosetta MISSING"
```

`oahd` = Rosetta 데몬. 미설치 시 미실행. 설치 직후 자동 실행됨.

## Forcing Function (스킬에 박기)

`/irun`, `/arun` SKILL.md 의 Mac mini SSH 라우팅 단계에 사전체크:

```bash
# Apple Silicon 빌드 호스트는 flutter run 호출 전 Rosetta 게이트
ssh mac-mini 'pgrep -x oahd >/dev/null' || {
  echo "❌ mac mini Rosetta 미설치. 다음 1회:"
  echo "   ssh -t mac-mini 'sudo softwareupdate --install-rosetta --agree-to-license'"
  exit 1
}
```

이미 적용됨 (claude-skills d281560).

## 셋업 체크리스트

새 Apple Silicon Mac 빌드 호스트 (Mac mini, MacBook, etc.) 셋업 순서:

1. **Rosetta 설치** ← 0순위, Xcode/Flutter 보다 먼저
2. Xcode 설치 (`mas get 497799835` 또는 직접 다운)
3. Xcode CLT (`xcode-select --install`)
4. Homebrew + brew packages
5. fvm + Flutter
6. 앱별 keystore / cert / API key

## 영향 범위 매트릭스

| 빌드 종류 | Rosetta 필요? |
|---------|------------|
| iOS release ipa (codesign + archive) | ❌ X (영향 없음) |
| **iOS debug + USB attach (dart VM)** | **✅ 필수** |
| Android release aab | ❌ X |
| Android debug + USB attach (adb) | ❌ X (adb 는 arm64 native) |
| Flutter Web 빌드 | ❌ X |

iOS debug attach 만 막힘. release 자동배포 사이클은 영향 0.

## 재사용 후보

- 모든 Apple Silicon 빌드 호스트 (현재 mac mini M1 + 본진 MacBook Pro M1/M2)
- 새 Mac mini 추가 시
- macOS 메이저 업그레이드 후 재발 가능 (재설치 1회)
- Flutter 신규 SDK 버전이 iproxy arm64 native 로 바뀌면 deprecated (현재 3.41.x 기준 여전히 x86_64)
