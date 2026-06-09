---
category: 환경 설정
tags: [wsl, flutter, test, windows, cmd, pushd, unc]
related_issues:
  - 2026-05-02-wsl-flutter-test-crlf-unc
---

# WSL 에서 Windows-native flutter test 실행 — cmd.exe pushd UNC 우회

- **첫 발견:** 2026-05-02 (lotto-calc PR #3 V4 검증, WSL 측)
- **재사용 영역:** WSL 안에서 `flutter test` / `flutter analyze` / `flutter build` 등 Windows-native flutter 호출이 필요한 모든 작업

## 한 줄 요약

WSL bash 가 `/mnt/c/src/flutter/bin/flutter.bat` 직접 호출하면 CRLF/PATH 문제로 깨짐. `cmd.exe /c 'pushd <UNC> && C:\src\flutter\bin\flutter.bat test 2>&1 & popd'` 한 줄로 우회.

## 우회 명령

```bash
cmd.exe /c 'pushd \\wsl.localhost\Ubuntu\home\<user>\<project> && C:\src\flutter\bin\flutter.bat test 2>&1 & popd'
```

- `cmd.exe /c` — Windows cmd 컨텍스트 진입
- `pushd \\wsl.localhost\...` — UNC 경로를 임시 드라이브 (`Z:` 등) 로 자동 매핑 + cwd 전환
- `C:\src\flutter\bin\flutter.bat test 2>&1` — Windows-native flutter 호출, stderr 합치기
- `& popd` — 임시 드라이브 매핑 해제

## 왜 다른 방법이 안 되나

| 방법 | 결과 |
|------|------|
| WSL bash 에서 `/mnt/c/src/flutter/bin/flutter.bat test` 직접 | CRLF + PATH 분리로 깨짐 |
| `powershell.exe -Command "Set-Location ..."` + flutter | .bat 내부 cmd 가 UNC 거부 |
| `cp -r ~/apps/X /mnt/c/tmp/X_test && powershell.exe ... flutter test` | 동작은 함. 단점: 매번 복사 cost + 정리 필요 (parking-lot 19번 SKILL 화 후보) |
| **`cmd.exe /c 'pushd <UNC> && flutter.bat test & popd'`** | ✅ 복사 0, 한 줄, 본진/WSL 양쪽 재현 |

## 검증 결과

- **2026-05-02** lotto-calc PR #3 V4 검증: `flutter test` 8/8 PASS, 4.85s
- WSL 안에서 직접 호출 가능 → Windows 게이트 작업 (Android pipeline state 확인 등) 에 그대로 활용

## 재사용 체크리스트

- [ ] 프로젝트 경로의 UNC 표현 정확히 (`\\wsl.localhost\<distro>\home\<user>\<path>`)
- [ ] flutter.bat 절대 경로 (`C:\src\flutter\bin\flutter.bat`) 박기 — PATH 의존 X
- [ ] `2>&1` 로 stderr 합쳐서 로그 캡처
- [ ] `& popd` 로 임시 드라이브 매핑 해제 (안 하면 누적)
