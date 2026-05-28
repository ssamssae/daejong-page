# 한줄일기 — 8apps version footer 통일 migration plan

**Status**: 🟡 draft · 본진 작업 plan
**Author**: 🪟 WSL / 2026-05-29 KST
**Repo**: kangdaejong/daejong-page · branch `wsl/hanjul-footer-migration-plan-2026-05-29`
**Parent spec**: [[8apps-version-footer.md]] (T-260529-03, 데스크탑 작성 PR #143 머지)
**Target app**: `~/apps/hanjul` (`com.daejongkang.hanjul`, pubspec `1.1.0+6`)
**담당 노드**: 🍎 본진 (parent spec §앱별 노드 분배에서 본진에 할당)

---

## 0. 본 문서의 의도

부모 spec `8apps-version-footer.md` 가 8 앱 통일 footer 패턴을 정의했고, 한줄일기는 본진 담당. 하지만 한줄일기는 다른 7 앱과 달리 **이미 footer 가 있다** — 다만 `kAppVersion` 하드코드 상수 + 인라인 Text 위젯의 제 3 패턴이라 통일 spec 의 dart-define widget 패턴으로 마이그레이션 필요. 본 plan 은 그 마이그레이션 단계 + 검증 체크리스트 + 회귀 가드를 정리한다.

---

## 1. 현 상태 verify

`~/apps/hanjul` 위 origin/main 기준 verify (2026-05-29 KST):

- 파일: `lib/screens/root_shell.dart`
- 라인 10~12: `kAppVersion` 상수 (pubspec `1.1.0` 과 수동 동기화 — 주석 "자동화하려면 --dart-define=APP_VERSION 또는 package_info_plus" 라고 미래 자기 자신에게 남김)
- 라인 108~115: `Text('v$kAppVersion', style: TextStyle(fontFamily: 'Pretendard', fontSize: 10, fontWeight: FontWeight.w500, color: AppColors.textTertiary, letterSpacing: -0.1))` 인라인 위젯
- 위치: `_buildShell` 의 `bottomNavigationBar` Container → SafeArea → Padding → Column 내부 (`_NavItem` row 아래 SizedBox 2 다음 줄)
- AppColors: `AppColors.textTertiary` 와 Pretendard 폰트 둘 다 이미 박혀있음
- 광고 없음
- `package_info_plus` 미사용

## 2. 목표 상태 (parent spec §빌드 흐름)

- 새 파일: `lib/widgets/version_footer.dart`
  ```dart
  import 'package:flutter/material.dart';
  import '../theme.dart';

  class VersionFooter extends StatelessWidget {
    const VersionFooter({super.key});

    @override
    Widget build(BuildContext context) {
      const version = String.fromEnvironment('APP_VERSION', defaultValue: 'dev');
      return Padding(
        padding: const EdgeInsets.only(bottom: 4),
        child: Text(
          'v$version · 강대종',
          style: const TextStyle(
            fontFamily: 'Pretendard',
            fontSize: 10,
            fontWeight: FontWeight.w500,
            color: AppColors.textTertiary,
            letterSpacing: -0.1,
          ),
        ),
      );
    }
  }
  ```
  - 한줄일기는 이미 `AppColors.textTertiary` + Pretendard 가 있어 parent spec 의 `Theme.of(context).hintColor` fallback 없이 strict 본판 채택
  - parent spec 의 brand mark ` · 강대종` 명시
  - `Padding(bottom: 4)` 는 parent spec 의 형식 + 한줄일기 기존 `SizedBox(height: 2)` 위쪽 여백과 자연 결합

- `root_shell.dart` 수정:
  - L1-2 imports 위에 `import '../widgets/version_footer.dart';` 추가
  - L10-12 의 `kAppVersion` 상수 + 위 주석 2 줄 삭제 (`Karpathy 룰3 surgical` — 한 줄도 남기지 말 것, 통일 widget 으로 의도 자체가 옮겨갔으므로)
  - L107-115 의 `const SizedBox(height: 2)` + `Text(...)` 두 위젯 삭제 후 `const VersionFooter()` 1 줄로 교체. 기존 SizedBox 의 2px 여백은 VersionFooter 의 `Padding(bottom: 4)` 가 흡수 (4px 으로 약간 늘어남 — parent spec 디폴트 따름, 시각 회귀 허용 범위)

- 빌드 흐름 (CI / fastlane / submit-app):
  - 현 한줄일기 빌드 명령에 `--dart-define=APP_VERSION=$(grep '^version:' pubspec.yaml | awk '{print $2}' | cut -d+ -f1)` 추가
  - 누락 시 footer 가 `vdev · 강대종` 으로 보임 → 빌드 자동화 누락 시그널 (회귀 신호)

---

## 3. 마이그레이션 단계 (본진 작업 순서)

본진이 `~/apps/hanjul` 에서 직접 수행. 추정 소요 5~10 분 + analyze/test ~3 분.

1. `cd ~/apps/hanjul && git fetch origin && git checkout main && git pull --ff-only origin main`
2. prefix 브랜치 분기: `git checkout -b mac/hanjul-version-footer-2026-05-29`
3. 새 파일 작성: `lib/widgets/version_footer.dart` (§2 코드 그대로)
4. `lib/screens/root_shell.dart` 수정:
   - `import '../widgets/version_footer.dart';` 추가 (다른 `import` 들 사이 알파벳 순서 적당 위치)
   - `kAppVersion` 상수 + 주석 2 줄 삭제
   - `SizedBox(height: 2)` + `Text('v$kAppVersion', ...)` 두 위젯 삭제, `const VersionFooter()` 1 줄로 교체
5. `flutter analyze --no-fatal-infos` PASS 확인
6. `flutter test` PASS 확인 (회귀 0 — 기존 위젯 테스트가 footer 텍스트 검사 X 일 가능성 높지만 모든 테스트 통과 확인)
7. (선택) iOS 시뮬레이터 또는 Android 에뮬레이터에서 `flutter run --dart-define=APP_VERSION=1.1.0` 후 footer 가 `v1.1.0 · 강대종` 으로 렌더되는지 시각 검증
8. `~/claude-skills/autopilot/merge-gate.sh ~/apps/hanjul` rc=0 확인
9. commit + push + PR (`mac/hanjul-version-footer-2026-05-29` → `main`)
10. 빌드 스크립트 dart-define 주입 (별 PR 또는 본 PR 와 묶어서) — 한줄일기 빌드 자동화 위치 확인 후

---

## 4. 검증 체크리스트

| # | 항목 | 확인 방법 |
|---|------|-----------|
| 1 | `kAppVersion` 상수 잔재 0 | `grep -r "kAppVersion" lib/` → 0 매치 |
| 2 | `version_footer.dart` import 위치 | `root_shell.dart` 상단 import 블록에 위치 |
| 3 | 인라인 Text 위젯 잔재 0 | `grep -n "v\\\$kAppVersion\|fontSize: 10, fontWeight: FontWeight.w500" lib/screens/root_shell.dart` → 0 매치 (단, 본진이 다른 fontSize:10 위젯 박았으면 distinct check 필요) |
| 4 | `flutter analyze --no-fatal-infos` | 0 error/warning |
| 5 | `flutter test` | 모든 테스트 PASS (회귀 0) |
| 6 | dart-define 시 footer 텍스트 | `flutter run --dart-define=APP_VERSION=1.1.0` 시 화면 하단에 `v1.1.0 · 강대종` 표시 |
| 7 | dart-define 누락 시 footer 텍스트 | `flutter run` (--dart-define 없이) 시 `vdev · 강대종` 표시 — 명시적 dev 시그널 |
| 8 | `~/claude-skills/autopilot/merge-gate.sh ~/apps/hanjul` | rc=0 |

---

## 5. 회귀 위험 + 가드

- **시각 회귀 (낮)** — 기존 `SizedBox(height: 2)` 가 사라지고 `Padding(bottom: 4)` 로 바뀌면서 footer 상하 여백이 2 → 4px 변경. parent spec 디폴트 따름, 한줄일기만 다른 spacing 유지하려면 `VersionFooter(padding: EdgeInsets.only(bottom: 2))` named param 추가 안 가능 (parent spec widget signature 고정). v1 은 4px 수용, v1.x 에서 spacing token 통일 시 재정렬.
- **빌드 자동화 누락 (중)** — `--dart-define=APP_VERSION=...` 누락 시 store 에 올라가는 빌드의 footer 가 `vdev · 강대종` 으로 나옴. 한줄일기 빌드 호스트 (mac-mini night-builder 또는 본진 fastlane) 의 빌드 명령을 본 PR 와 묶어 갱신 필수.
- **AppColors.textTertiary 변경 시 (저)** — theme.dart 의 `textTertiary` 변경 시 모든 8 앱 footer 동시 영향. parent spec 의 명시적 trade-off (통일 footer 가 가치 > 개별 color 자유).
- **위젯 테스트 회귀 (저)** — 기존 한줄일기 테스트 중 footer 의 `v1.1.0` 텍스트를 직접 검사하는 게 있으면 깨짐. grep 으로 확인 후 필요 시 `find.text('v')` 또는 `find.byType(VersionFooter)` 로 패치.

---

## 6. 외부영향 + 비 goal

- iOS / Android store 메타 변경 0
- pubspec dependency 변경 0 (별 패키지 도입 X)
- 색·로고·typography 통일 brand 가이드 미정의 (parent spec § 비 goal v1.x 위임)
- about 다이얼로그 / 회사 사이트 링크 / 오픈소스 라이센스 페이지 v1 안 함
- package_info_plus 마이그레이션 v1 안 함 (parent spec § 비 goal)

---

## 7. 머지 후 처리

- 본진이 PR squash merge 후 `~/todo/tasks.md` 의 T-260529-03 [~] working entry 의 `:: details:` 라인에 "한줄일기 본진 마이그레이션 PR <#N> 머지" 한 줄 inline 추가 (parent spec § 검증 끝나면 절차)
- 8 앱 모두 머지 후 T-260529-03 [~] → [x] 완료 마킹

---

## 8. 본 plan 의 한계

- 한줄일기 빌드 자동화 위치 (mac-mini night-builder vs 본진 fastlane vs scripts/) 미수집 — 본진이 step 10 진입 시 실측 후 dart-define 주입 위치 확정
- iOS 시뮬레이터 / Android 에뮬레이터 실측 안 한 상태에서 spacing 4px 채택 — 실측 후 spec parent 와 정합 안 맞으면 별 사이클에서 정정
- 다른 7 앱 (단어요/메모요/더치페이/약먹자/포모도로/한컵/로또) 의 footer 작업 진행 상태 미확인 — 본 plan 은 한줄일기 단독, 8 앱 mesh 동기화는 parent spec § 앱별 노드 분배가 담당
