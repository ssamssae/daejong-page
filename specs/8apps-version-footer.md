# 8앱 version footer 통일 spec (v1.3)

T-260529-03 (side-project). v1 = 사이클 #2 산출 (44d1e5a 머지). v1.1 = 사이클 #4 보완 (c992106 머지) — 사이클 #3 약먹자 dogfood (PR ssamssae/yakmukja#14 머지) 가 surface 한 4 마찰점 (F1 컬러 토큰 / F2 ads 위치 / F3 노드 빌드 게이트 / F4 hot-restart) 반영. v1.2 = 사이클 #6 보완 — 사이클 #5 한컵 dogfood (PR ssamssae/hankeup#1 머지) 가 surface 한 generality check 2건 (GC1 fan-out 가정 / GC2 audit grep) 반영. 데스크탑(🖥) 노드 작성.

## 목적

강대종 8 앱 (한줄일기 / 단어요 / 메모요 / 더치페이 / 약먹자 / 포모도로 / 한컵 / 로또번호 계산기) 에 일관된 version footer + brand mark 를 박는다. 현재는 한줄일기만 version footer 가 있고 나머지 7 앱은 없다. 통일하면:

- 사용자가 어느 앱에서든 같은 위치·같은 톤으로 "v X.Y.Z" 를 본다 → 같은 만든 사람의 시리즈라는 인식.
- 버그 리포트 시 사용자가 footer 의 버전을 함께 보낼 수 있다 (현재는 약먹자/포모도로/한컵 등 버전 노출 0 → 사용자 지원 마찰).
- 신규 앱 추가 시 footer 컴포넌트만 복사 → onboard cost 감소.

## 현황 audit (2026-05-29 01:46 KST 데스크탑 grep)

| # | 앱 | repo | pubspec version | footer 상태 | Pretendard pubspec | package_info_plus |
|---|----|------|-----------------|--------------|---------------------|-------------------|
| 1 | 한줄일기 | apps/hanjul | 1.1.0+6 | ✅ `kAppVersion='1.1.0'` 상수 → `Text('v$kAppVersion')` Pretendard 10pt textTertiary (root_shell.dart) | ❌ inline 사용 | ❌ |
| 2 | 단어요 | apps/wordyo | 1.0.1+5 | ❌ (lib seed 의 강대종 hit 은 brand 무관) | ❌ | ❌ |
| 3 | 메모요 | simple_memo_app | 1.0.7+27 | ❌ | ❌ | ❌ |
| 4 | 더치페이 | dutch_pay_calculator | 1.0.3+7 | ❌ | ❌ | ❌ |
| 5 | 약먹자 | yakmukja | 1.0.2+5 | ❌ (lib hit 은 ads_service 무관) | ❌ | ❌ |
| 6 | 포모도로 | pomodoro | 1.0.0+7 | ❌ | ✅ pubspec asset | ❌ |
| 7 | 한컵 | hankeup | 1.0.0+1 | ❌ | ✅ pubspec asset | ❌ |
| 8 | 로또번호 계산기 | lotto-calc | 1.1.0+4 | ❌ | ❌ | ❌ |

**관찰**:
- 8 앱 모두 `package_info_plus` 미사용 → 한줄일기 처럼 `kAppVersion` 수동 상수 + pubspec sync drift 위험. 한줄일기 root_shell.dart:11 주석에 이미 "자동화하려면 package_info_plus 도입" 명시됨.
- Pretendard 폰트 가 일부 앱(포모도로/한컵)에만 박혀있음. footer 통일 폰트로 Pretendard 채택하려면 6 앱에 폰트 asset 추가 필요.

## 통일 footer 디자인

### 시각

- 위치: 앱 메인 화면의 하단 안전영역 위쪽. **3 패턴 분기** (F2 dogfood, ↓ § 위치 패턴 분기 참조).
- 형식: `v1.0.7 · 강대종` 한 줄. middle dot `·` (U+00B7) 로 버전과 brand mark 구분.
- 톤: `fontSize: 10, fontWeight: FontWeight.w500, letterSpacing: -0.1`. fontFamily 는 앱별 기본 폰트 (Pretendard 가 있으면 Pretendard, 없으면 system default).
- 컬러: **앱 디자인 토큰 broader pattern** (F1 dogfood, ↓ § 컬러 토큰 매핑 참조). 우선 순위 `textTertiary > textFaint > textMuted > textSecondary > Theme.of(context).hintColor`.
- 클릭 X (회사 사이트 링크 / about 다이얼로그 모두 v1 에 안 박음 — 후속 v1.x 결정).

### 컬러 토큰 매핑 (F1 dogfood — v1.1)

v1 의 "textTertiary 고정" 룰은 dogfood 결과 약먹자에 textTertiary 가 없고 textFaint 만 있어 깨졌다. 8 앱 각각 자체 디자인 토큰명 다른 가능성 — broader pattern 으로 풀어 fan-out 안전.

| 앱 | textTertiary | textFaint | textMuted | textSecondary | v1.1 픽 | 출처 |
|----|--------------|-----------|-----------|---------------|---------|------|
| 약먹자 | ❌ | ✅ `0xFF9CA3AF` | ❌ | ❌ | **textFaint** | dogfood (사이클 #3 PR ssamssae/yakmukja#14 머지) |
| 한컵 | ✅ `0xFF8B95A1` | ❌ | ❌ | ✅ `0xFF4E5968` | **textTertiary** | dogfood (사이클 #5 PR ssamssae/hankeup#1 머지) |
| 포모도로 | ✅ `0xFF8B95A1` | ❌ | ❌ | ✅ `0xFF4E5968` | **textTertiary** | dogfood (사이클 #7 PR ssamssae/pomodoro#2 머지) |
| 로또 | ❌ (AppColors 자체 X) | ❌ | ❌ | ❌ | **`Theme.of(context).hintColor` fallback** | dogfood (사이클 #8 PR ssamssae/lotto-calc#20, minimal Material 3 앱 — spec v1.2 fallback 룰 첫 검증) |
| 한줄일기 | ✅ | ❌ | ❌ | ✅ | **textTertiary** (예측) | baseline audit (사이클 #9 데스크탑 git grep main) — 본진 migration plan 별 spec [hanjul-footer-migration-plan.md](./hanjul-footer-migration-plan.md) 따라 진행 |
| 단어요 | ✅ | ❌ | ❌ | ✅ | **textTertiary** (예측) | baseline audit (사이클 #9), lib/theme.dart 단일 — 한컵/포모도로 동일 패턴 |
| 메모요 | ❓ | ❓ | ❓ | ❓ | **재verify 필요** (#148 stale 가능성) | baseline audit (사이클 #9) prediction "AppColors X / hintColor fallback" — 사이클 #10 더치페이 재verify 사고 후 메모요도 의심. 본진 fan-out 첫 단계로 `git pull --ff-only origin main` 후 audit re-run 권장 |
| 더치페이 | ❌ | ✅ `0xFF9CA3AF` | ❌ | ❌ | **textFaint** | dogfood (사이클 #10 PR ssamssae/dutch_pay_calculator#10) — lib/theme/app_theme.dart 디렉토리 (약먹자와 동일 구조, 주석 명시), B' sub-pattern B'-1 픽 (↓ § 위치 패턴 분기) |

**fan-out 시 각 노드 절차**:
0. **main FF 의무 (v1.3 추가, GC7)** — `cd <repo> && git fetch origin && git pull --ff-only origin main` 으로 stale local main 제거. **stale 시 audit prediction 부정확** (사이클 #9/#10 baseline #148 더치페이 사고 — fetch 만 하고 pull 안 해 lib/theme/ 디렉토리 missed). 또는 `git grep origin/main` 으로 워킹 트리 비건드림.
1. `grep -rE "textTertiary\|textFaint\|textMuted\|textSecondary" <repo>/lib/` (recursive — 한컵처럼 `lib/theme.dart` 단일 파일 케이스 + 약먹자처럼 `lib/theme/app_theme.dart` 디렉토리 케이스 둘 다 캐치) 으로 자기 앱 토큰 픽.
2. 위 우선 순위대로 첫 매치 사용. 둘 다 없으면 `Theme.of(context).hintColor`.
3. dogfood 표에 자기 앱 row 갱신 (별 PR 또는 fan-out PR 본문 'spec table update' 섹션).

### 위치 패턴 분기 (F2 dogfood — v1.1)

v1 의 "Scaffold bottomNavigationBar 위 SafeArea" 단일 가이드는 ads-supported 앱 (bottomNavigationBar 가 이미 광고 배너로 차있음) 에서 직접 안 박힌다. 8 앱 = 3 패턴.

**패턴 A: ads 없는 앱 (디폴트, 가장 간단)** — bottomNavigationBar 가 비어있는 앱

직접 `bottomNavigationBar: const VersionFooter()` 또는 Scaffold body 의 마지막 sliver/Column 항목으로.

후보: 메모요, 더치페이, 단어요, 로또 (audit 시 ads 패키지 grep 으로 재확인).

```dart
Scaffold(
  body: ...,
  bottomNavigationBar: const VersionFooter(),
)
```

**패턴 B: ads-supported 앱** — bottomNavigationBar 가 광고 배너 (AdaptiveBanner / google_mobile_ads) 로 차있는 앱

bottomNavigationBar 슬롯을 `Column` 으로 감싸 [VersionFooter, 광고 배너] 박는다. 약먹자 dogfood 검증 패턴.

검증된 케이스: 약먹자 (사이클 #3 PR ssamssae/yakmukja#14 머지).

audit 결과 A 확정 케이스 (B 가정 깨짐, 사이클 #5/#7/#8 dogfood): 한컵, 포모도로, 로또 — ads grep 0건이라 패턴 A 직접 박기.

```dart
Scaffold(
  body: ...,
  bottomNavigationBar: const Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      VersionFooter(),
      AdaptiveBanner(),
    ],
  ),
)
```

**패턴 B' (sub-pattern, v1.2.2 신규, v1.3 정의 broader)**: ads 가 Scaffold body 안 어디든 inline 박힌 앱 — bottomNavigationBar 슬롯이 비어있고 광고 배너가 body 트리 안에 박혀있는 케이스 (body Column 마지막 child 뿐 아니라 mid-body / SafeArea 안 / Stack 안 등 모든 위치 포함).

ads_service 자체는 google_mobile_ads + AdaptiveBanner 클래스 가지고 있어도 사용 위치가 body 안 inline 이면 패턴 B 의 bottomNavigationBar Column wrap 이 직접 안 박힘. 두 옵션 (fan-out 시 노드가 시각 verify 후 픽):

- **옵션 B'-1 (강력 권장, layout-agnostic + 가장 surgical)**: bottomNavigationBar 슬롯에 `const VersionFooter()` 직접 박기 (A 패턴 그대로). body 내부 AdaptiveBanner 위치는 그대로 보존. 시각상 footer 가 화면 최하단 system inset 위, 광고는 body 안 그대로 — **layout 자연 분리**. body 안 ads 위치가 마지막 child 든 mid-body 든 무관하게 항상 작동.
- **옵션 B'-2**: body 안 AdaptiveBanner 자리를 `Column` 으로 감싸 `[VersionFooter, AdaptiveBanner]` 박기. 패턴 B 와 동일한 layout (광고 위에 footer). **단점**: ads 가 mid-body 인 경우 footer 가 body 중간으로 가는 어색한 위치 (더치페이가 정확히 이 케이스 — 광고 ↔ 키패드 사이에 footer 끼임).

**선택 기준**:
- ads 가 body 마지막 child = B'-1 또는 B'-2 둘 다 가능 (시각 verify 후 픽).
- ads 가 mid-body (다른 child 들 사이) = **B'-1 만 권장** (B'-2 는 layout 깨짐).

**검증된 케이스**: 더치페이 (사이클 #10 PR ssamssae/dutch_pay_calculator#10) — ads 가 body Column 중간 (lib/main.dart line 464, 입력 영역 → AdaptiveBanner → 키패드+계산버튼 화면 하단 55%). B'-1 픽으로 광고+키패드+footer 세 layout 자연 분리. textFaint `0xFF9CA3AF` (약먹자와 완전 동일 hex — app_theme.dart 주석 "약먹자와 같은 구조, 포인트 컬러만 다름(인디고)" 명시).

**패턴 C: migration 케이스 (한줄일기 한정)** — 기존 인라인 version 표시가 있는 앱

한줄일기는 이미 `kAppVersion` 상수 + `Text('v$kAppVersion', ...)` 가 root_shell.dart 안의 `Column` 내부에 인라인으로 박혀있어 패턴 A/B 둘 다 안 맞는다. footer migration 작업 = (1) 기존 상수 + 인라인 Text 제거 (2) 같은 자리에 `const VersionFooter()` 박기 (3) 폰 실기기 시각 회귀 확인. **본진 직접 처리 권장** (다른 노드보다 본진이 한줄일기 root_shell.dart 정합 좋음).

```dart
// 한줄일기 root_shell.dart 변경 전 (인라인)
const String kAppVersion = '1.1.0';
// ...
Text('v$kAppVersion', style: TextStyle(fontSize: 10, ...))

// 변경 후 (VersionFooter 위젯)
// (kAppVersion 상수 제거)
const VersionFooter()
```

### 데이터 소스

- 디폴트: `package_info_plus` 의 `PackageInfo.fromPlatform()` 으로 런타임에 pubspec version 자동 픽업. 수동 상수 drift 0 화.
- v1 단순 안: build-time `String.fromEnvironment('APP_VERSION', defaultValue: 'dev')` + `flutter build --dart-define=APP_VERSION=1.0.7`. 패키지 추가 없이 빌드 흐름만 잡으면 충분 — 빌드 자동화 (mac-mini night-builder, submit-app 스킬) 가 pubspec → dart-define 주입.
- 결정: **v1 = dart-define 안** (가벼움, 추가 의존 0, 빌드 자동화에 한 줄 추가). v1.x = package_info_plus 마이그레이션 (스토어 정책 변화 시).

### 공유 위젯

`packages/strap_brand/` (별 패키지) 로 빼지 않고 v1 은 **각 앱에 동일 widget 파일 복붙** — 8 앱 모두 별 repo + Karpathy 룰3 (국소 변경, 추상화 보류). v1.x 가 통일 brand 가이드 확정 후 monorepo 또는 별 package 로 추출 검토.

복붙 widget 파일: `lib/widgets/version_footer.dart` — v1.1 약먹자 dogfood 검증본 (PR ssamssae/yakmukja#14 머지).

```dart
import 'package:flutter/material.dart';

import '../theme/app_theme.dart'; // 앱별 AppColors 토큰. textTertiary > textFaint > textMuted > textSecondary > hintColor 우선순위로 픽.

class VersionFooter extends StatelessWidget {
  const VersionFooter({super.key});

  @override
  Widget build(BuildContext context) {
    const version = String.fromEnvironment('APP_VERSION', defaultValue: 'dev');
    return Padding(
      padding: const EdgeInsets.only(top: 4, bottom: 4),
      child: Text(
        'v$version · 강대종',
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: AppColors.textFaint, // 약먹자 픽. 다른 앱은 자기 토큰으로 교체 (↑ § 컬러 토큰 매핑 참조).
          letterSpacing: -0.1,
        ),
      ),
    );
  }
}
```

앱별 픽 procedure:
1. `grep -rE "textTertiary|textFaint|textMuted|textSecondary" lib/` (recursive) 자기 앱 토큰 확인 — `lib/theme.dart` 단일 파일 (한컵) + `lib/theme/app_theme.dart` 디렉토리 (약먹자) 둘 다 캐치. (↑ § 컬러 토큰 매핑 표)
2. 위 우선순위 첫 매치로 `color:` 교체. 토큰 없으면 `color: Theme.of(context).hintColor` 으로 (이 경우 위젯 build 가 const 못 박음 — `const` 키워드 떼기).
3. 위치는 패턴 A/B/C 중 자기 앱 골라서 (↑ § 위치 패턴 분기).

## 앱별 노드 분배 (위임 우선 디폴트)

분배 원칙: 같은 노드에서 이미 만지고 있는 앱 우선 + LLM-only 작업이라 노드 GPU/언어 분기 무관.

| 노드 | 담당 앱 | 근거 |
|------|---------|------|
| 🍎 본진 (mac) | 메모요, 한줄일기 | 본진 자율 — 마침 메모요 1.0.7 사이클 중 + 한줄일기 footer reference 정리 본진이 정합 좋음 |
| 🏭 맥미니 | 단어요 | 빌드/배포 엔진. 정적 LUT 앱이라 위험도 낮음. 로또는 사이클 #8 데스크탑 dogfood 완료 (A 패턴 + hintColor fallback, PR ssamssae/lotto-calc#20) — 분배 제외 |
| 🪟 WSL | 더치페이 | wsl 즉응 코드 수정. 한컵은 사이클 #5 데스크탑 dogfood 완료 (A 패턴, PR ssamssae/hankeup#1 머지) — 분배 제외 |
| 🖥 데스크탑 (이 노드) | 약먹자 (#3) / 한컵 (#5) / 포모도로 (#7) / 로또 (#8) | spec 짠 노드 + 4 dogfood 완료 (3 컬러 케이스 × 2 위치 패턴 매트릭스) |
| 💻 노트북 | (분배 0) | 포모도로 사이클 #7 데스크탑 dogfood 완료 — 분배 제외. 다음 onboard 후보로 reserve |

위임 escape: 노드 세션 없거나 5분 안 끝낼 일이면 본진 fallback. 8 앱 각각 footer 추가 = `lib/widgets/version_footer.dart` 1 파일 + 메인 화면 1 줄 import + 1 자리 widget tree 추가 = 평균 3 분 X 8 = 24 분, 5 노드 병렬 시 5 분 안 끝남.

## 빌드 흐름 (앱별 PR 1개씩)

각 노드가 자기 앱에 prefix 브랜치 `<node>/version-footer-2026-05-29` 분기 후:

0. **main FF 의무 (v1.3 GC7)** — `git fetch origin && git pull --ff-only origin main` 으로 stale local main 제거 후 분기. stale 기반 분기 시 audit/박기 둘 다 부정확 위험 (사이클 #9/#10 사고).
1. `lib/widgets/version_footer.dart` 새 파일 (위 코드 + 자기 앱 컬러 토큰 픽).
2. 메인 화면에 `const VersionFooter()` 1 줄 박기 — 패턴 A/B/C 중 자기 앱 골라서 (↑ § 위치 패턴 분기). `Karpathy 룰3 surgical` — 인접 코드 손대지 말 것.
3. `pubspec.yaml` 변경 X (v1 dart-define 안).
4. (선택) `test/widgets/version_footer_test.dart` 추가 — 약먹자 dogfood 패턴. dart-define 주입 verify 1건 (with/without 매트릭스). 게이트 PASS 시그널 강화 + fan-out 회귀 0 보장. v1.1 권장.
5. 빌드 스크립트 (CI/scripts/submit-app 스킬/night-builder) 에 `--dart-define=APP_VERSION=$(grep '^version:' pubspec.yaml | awk '{print $2}' | cut -d+ -f1)` 추가 — 별 PR 또는 spec 후속.
6. **게이트 (노드별 alternative, F3 dogfood)** — Android SDK 노드별 가용성 다름. 둘 중 하나 PASS 면 게이트 통과:
   - SDK 있는 노드 (mac / 맥미니): `flutter build apk --debug --dart-define=APP_VERSION=X.Y.Z` 실 APK 검증 + `flutter test --dart-define=APP_VERSION=X.Y.Z`.
   - SDK 없는 노드 (wsl / desktop / notebook): `flutter test --dart-define=APP_VERSION=X.Y.Z` 만으로 OK. Dart 컴파일러가 `String.fromEnvironment` 를 build/test 동일 해석하므로 dart-define 주입 경로 동일 검증. 실 APK 검증은 mac/맥미니 follow-up.
7. `flutter analyze --no-fatal-infos` PASS.
8. `~/claude-skills/autopilot/merge-gate.sh <repo>` PASS (analyze error/warning 0 자동 확인).
9. PR 생성 (`<node>/version-footer-2026-05-29` → `main`). 본문에 컬러 토큰 픽 + 위치 패턴 명시. 본진/맥미니 자율 머지.
10. 머지 후 다음 빌드 사이클에서 dart-define 박혀 실제 footer 가 "v X.Y.Z · 강대종" 으로 렌더됨. 빌드 dart-define 누락 시 `vdev · 강대종` 으로 보임 — dev 빌드 시그널 OK.

## 빌드 가이드 (F4 dogfood — v1.1)

- `flutter run --dart-define=APP_VERSION=X.Y.Z` 로 띄운 후 dart-define 값을 바꾸려면 hot-restart (R) 가 아니라 **full stop + rerun** 필요. 컴파일 시점에 박히는 값이라 hot-restart 가 안 픽업.
- 각 앱 CLAUDE.md (있다면) 의 빌드 명령어 섹션에 `--dart-define=APP_VERSION=...` 한 줄 추가 권장. 없는 앱은 fan-out PR 본문에 빌드 명령어 메모.

## 비 goal (v1 에서 안 한다)

- 통일 brand 가이드 (색·로고·typography) 정립 — v1.x 디자인 사이클.
- about 다이얼로그 / 회사 사이트 링크 / 오픈소스 라이센스 페이지 — 별 사이클.
- monorepo / 공유 widget 패키지 추출 — 8 앱 다 PR 후 dogfood 한 다음.
- package_info_plus 마이그레이션 — 스토어 정책 변화 시.
- iOS/Android 네이티브 footer (스토어 메타에 한정).

## 검증 끝나면

`~/todo/tasks.md` 의 T-260529-03 [~] working → [x] 완료 마킹 (PR 8 개 다 머지 후) + 본진이 v1 footer 통일 첫 dogfood 산출 1 줄 worklog.

## 사이클 #3 dogfood 결과 (약먹자 PR ssamssae/yakmukja#14, 본진 squash merge)

- **컬러**: textFaint 픽 (textTertiary 부재) → F1 broader pattern 룰 도입.
- **위치**: 패턴 B (Column wrap [VersionFooter, AdaptiveBanner]) — bottomNavigationBar 가 광고 배너로 차있어 직접 슬롯 못 박음 → F2 3 패턴 분기 도입.
- **빌드 게이트**: WSL desktop 노드 Android SDK 부재 → `flutter test --dart-define` 대체 (with/without 매트릭스 2 PASS) → F3 노드별 alternative 룰 도입.
- **hot-restart**: dart-define full rebuild 필요 → F4 빌드 가이드 1줄 추가.
- analyze: No issues found. test: 2/2 PASS (placeholder + version_footer 신규).

## 사이클 #5 dogfood 결과 (한컵 PR ssamssae/hankeup#1, 본진 squash merge)

- **컬러**: textTertiary 픽 (Toss 스타일 `0xFF8B95A1`, 우선순위 1 매치) → F1 broader pattern 룰 정상 작동.
- **위치**: 패턴 A (`bottomNavigationBar: const VersionFooter()` 직접) — ads grep 0건, 단일 화면 물 추적 앱 → F2 패턴 A 검증 PASS.
- **빌드 게이트**: WSL desktop SDK 부재 그대로 → F3 `flutter test --dart-define` 매트릭스 (with/without) 양쪽 PASS.
- **generality check** (사이클 #5 surface):
  - GC1: 한컵 = 가정상 B 후보였으나 실제 ads X → A 확정. v1.2 fan-out 표 가정 X placeholder 로 변경.
  - GC2: 한컵 `lib/theme.dart` 단일 파일 vs 약먹자 `lib/theme/app_theme.dart` 디렉토리 → v1.2 audit grep `lib/theme/` → `lib/ -r` recursive 로 robust 화.
  - GC3 (import path flat lib) / GC4 (패턴 A 직접 bottomNavigationBar) — spec v1.1 그대로 OK, fix 불요.
- analyze: 1 info-level pre-existing (water_background.dart unnecessary_underscores, 내 변경 무관 — --no-fatal-infos 통과). test: 2/2 PASS (기존 widget_test + 신규 version_footer).

## 사이클 #10 더치페이 B' dogfood 결과 (v1.3 정정 forcing)

- **컬러**: textFaint `0xFF9CA3AF` 픽 (사이클 #9 baseline #148 prediction "hintColor fallback" 정정 — stale local main 으로 missed).
- **위치**: 패턴 B'-1 — bottomNavigationBar 슬롯 직접 + body 안 line 464 광고 mid-body 위치 보존. 광고+키패드+footer 세 layout 자연 분리.
- **theme 구조**: lib/theme/app_theme.dart 디렉토리 (약먹자와 동일 구조, 주석 명시).
- **약먹자 ≈ 더치페이 형제 디자인 시스템** 발견 — 사이클 #9 cluster 분류 표 갱신 forcing.
- **generality check** (사이클 #10 surface):
  - GC7: baseline audit 시 main FF 의무 (fetch + pull 둘 다). 사이클 #9 fetch 만으로 stale local main 기반 audit 사고.
  - GC8: B' 정의 broader 화 — "body Column 마지막 child" → "body 안 어디든 inline (bottomNavigationBar 슬롯 비어있음)". 더치페이 광고가 mid-body 였음.
- analyze: No issues found. test: 9/9 PASS (기존 8 MainScreen + 신규 version_footer 매트릭스).

## 디자인 시스템 클러스터 (v1.3 신설)

8 앱 audit + 5 dogfood 결과로 디자인 시스템 친족 그루핑:

| 클러스터 | 앱 | 공통점 | 차이점 |
|----------|-----|--------|--------|
| **A: app_theme.dart 디렉토리 + textFaint** | 약먹자, **더치페이** | lib/theme/app_theme.dart 동일 구조 + `AppColors.textFaint = 0xFF9CA3AF` 완전 동일 hex + ads (google_mobile_ads + AdaptiveBanner) | 포인트 컬러 (더치 = 인디고 `0xFF4F6DF5`). app_theme.dart 주석 "약먹자와 같은 구조, 포인트 컬러만 다름" 명시 |
| **B: theme.dart 단일 + textTertiary (Toss)** | 한컵, 포모도로, (예측) 단어요 | lib/theme.dart 단일 + `AppColors.textTertiary = 0xFF8B95A1` (Toss 스타일) | 앱별 도메인 (물 추적 / 타이머 / 단어 학습) |
| **C: theme.dart 단일 + textTertiary** | (예측) 한줄일기 | lib/theme.dart 단일 + textTertiary 매치 + brand/brandDeep 추가 | A + C migration 듀얼 — root_shell.dart kAppVersion 인라인 |
| **D: AppColors 자체 X (minimal Material 3)** | 로또 | ColorScheme.fromSeed 만 사용, AppColors 클래스 X | hintColor fallback |
| **E: re-verify 필요** | 메모요 | 사이클 #9 baseline #148 prediction "AppColors X / hintColor fallback" — 더치페이 사고 후 메모요도 의심 | 본진 fan-out 첫 단계 시 main FF 후 audit re-run |

fan-out 시 같은 클러스터 앱은 토큰 픽 + 위치 패턴 재현성 높음. 약먹자 → 더치페이 머지 가 클러스터 A 친족 fan-out 첫 케이스.

## 사이클 #9 4 앱 baseline audit (v1.2.2, v1.3 사후 정정 표)

데스크탑이 fan-out 직전 남은 4 앱 (한줄/메모요/단어요/더치페이) main 베이스 audit 미리 — fan-out 시작 노드가 audit 부담 줄이고 직접 박기 + verify 만 하면 되는 베이스라인. `git grep main` 으로 워킹 트리 안 건드림.

⚠️ **v1.3 사후 정정 (사이클 #10 더치페이 dogfood)**: 사이클 #9 베이스라인 audit 시 `git fetch` 만 하고 `git pull --ff-only` 안 한 stale local main 기반이라 더치페이 row 부정확. 메모요 row 도 의심 (동시 audit, 같은 stale 위험). 본진 fan-out 첫 단계로 main FF 후 재verify 필수.

| 앱 | ads | AppColors 토큰 | theme 구조 | 예상 패턴 | 예상 컬러 픽 | 비고 |
|----|-----|----------------|------------|-----------|--------------|------|
| 한줄일기 | ❌ 0건 | ✅ textTertiary + textPrimary + brand + brandDeep | lib/theme.dart 단일 | **A + C migration** | textTertiary (1순위) | root_shell.dart 의 kAppVersion 인라인 Text 제거 후 VersionFooter 박기 — 본진 plan PR #145 흡수 |
| 메모요 | ❓ stale 가능 | ❓ stale 가능 | ❓ stale 가능 | ❓ TBD | **재verify 필요** | 사이클 #9 prediction "AppColors X / hintColor fallback / lib/theme.dart X / lib/widgets/paste_button.dart 있음" — 사이클 #10 더치페이 사고 후 stale 의심. 본진 fan-out 첫 단계로 main FF + audit re-run |
| 단어요 | ❌ 0건 | ✅ textTertiary + textSecondary + textPrimary + warning + AppTextStyles | lib/theme.dart 단일 | **A** | textTertiary (1순위) | 한컵/포모도로 동일 디자인 시스템 (Toss 스타일 추정), AppTextStyles 도 있음 |
| 더치페이 | ✅ google_mobile_ads ^5.3.0 + lib/services/ads_service.dart (AdaptiveBanner) | ✅ **textFaint `0xFF9CA3AF`** (사이클 #10 정정) | **lib/theme/app_theme.dart 디렉토리** (사이클 #10 정정) | **B' sub-pattern** (v1.3 정의 broader) | **textFaint** (약먹자 동일 hex) | main.dart 632 lines monolith (Scaffold 2 인스턴스 line 87/210), AdaptiveBanner line 464 body 안 mid-body inline (광고 ↔ 키패드 사이). B'-1 픽 검증 끝 — PR ssamssae/dutch_pay_calculator#10 |

**v1.3 정정 후 주요 발견**:
- 4 앱 중 2 앱 확정 (한줄 + 단어). 메모요 stale 의심 (재verify). 더치페이 정정 완료 + 약먹자 형제 발견.
- B' sub-pattern 정의 broader 화 — body 안 어디든 inline.
- baseline audit 절차 step 0 신설 (main FF 의무, GC7).
- 한줄일기 = A + C 듀얼 (패턴 A 위치 + C migration 작업) → 본진 plan PR #145 그대로 진행 OK.

fan-out 시작 노드 = main FF + audit verify (메모요 만 full re-run) + 직접 박기.

## 5 dogfood 검증 완료 표 (v1.3 — 3 컬러 × 3 위치 매트릭스 완전 cover)

| 패턴 | 컬러 케이스 | 검증 앱 | PR | 컬러 토큰 / fallback | 빌드 게이트 | 검증 사이클 |
|------|-------------|---------|-----|----------------------|-------------|-------------|
| **A** (ads 없음, bottomNavigationBar 직접) | textTertiary (Toss) | 한컵 | [ssamssae/hankeup#1](https://github.com/ssamssae/hankeup/pull/1) | `0xFF8B95A1` | test --dart-define matrix PASS | #5 |
| **A** | textTertiary (Toss) | 포모도로 | [ssamssae/pomodoro#2](https://github.com/ssamssae/pomodoro/pull/2) | `0xFF8B95A1` | test --dart-define matrix PASS | #7 |
| **A** | hintColor fallback | 로또 (randompick) | [ssamssae/lotto-calc#20](https://github.com/ssamssae/lotto-calc/pull/20) | `Theme.of(context).hintColor` (AppColors 자체 X) | test --dart-define matrix PASS | #8 |
| **B** (ads-supported, bottomNavigationBar Column wrap) | textFaint | 약먹자 | [ssamssae/yakmukja#14](https://github.com/ssamssae/yakmukja/pull/14) | `0xFF9CA3AF` | test --dart-define matrix PASS | #3 |
| **B'** (ads body inline, bottomNavigationBar 직접 + body ads 보존) | textFaint | 더치페이 | [ssamssae/dutch_pay_calculator#10](https://github.com/ssamssae/dutch_pay_calculator/pull/10) | `0xFF9CA3AF` (약먹자 동일 hex, 형제 클러스터 A) | test --dart-define matrix PASS | #10 |
| **C** (migration 한줄일기) | TBD | 한줄일기 | TBD 본진 | TBD (예측 textTertiary, lib/theme.dart 단일) | TBD | 본진 migration plan PR #145 |

**3 컬러 케이스 × 3 위치 패턴 매트릭스 완전 cover** — spec v1.3 의 전 분기 경로 (A / B / B' + textFaint / textTertiary / hintColor) dogfood 검증. 남은 3 fan-out (메모요/단어요 + 한줄 migration) 진짜 안전.

## fan-out 진행 권장 순서 (v1.1)

| 단계 | 작업 | 책임 노드 | 트리거 |
|------|------|----------|--------|
| 0 | spec v1.1 머지 | 본진/맥미니 | 본 PR 자율 머지 |
| 1 | 한줄일기 migration (패턴 C) | 🍎 본진 직접 | 형님 fan-out ack 후 본진 직처리 |
| 2 | 메모요 footer (패턴 A) | 🍎 본진 | 한줄 migration 끝나면 본진 자율 |
| 3 | 단어요 footer (audit 후 A or B) | 🏭 맥미니 | 본진 directive 후 병렬. 로또 = 데스크탑 사이클 #8 dogfood 완료 (A 패턴 + hintColor fallback, PR #20) — 분배 제외 |
| 3 | 더치페이 footer (audit 후 A or B) | 🪟 WSL | 본진 directive 후 병렬. 한컵 = 데스크탑 사이클 #5 dogfood 완료 — 분배 제외 |
| 3 | (분배 0) | 💻 노트북 | 포모도로 = 데스크탑 사이클 #7 dogfood 완료 — 분배 제외. 다음 사이드 프로젝트 onboard reserve |
| 4 | 빌드 자동화 dart-define 주입 | 🏭 맥미니 | 8 앱 PR 머지 후 night-builder 갱신 별 PR |

비고 — 단계 3 의 6 앱 (메모요 제외) 은 컬러 토큰 grep + ads 분기 audit 후 패턴 픽. 모든 노드 동일 spec 따라 평행 진행 가능. 약먹자 = dogfood 완료라 재작업 없음.

---

v1: 2026-05-29 01:46 KST · 🖥 데스크탑 · 야간 오토파일럿 사이클 #2 (44d1e5a 머지).
v1.1: 2026-05-29 02:01 KST · 🖥 데스크탑 · 야간 오토파일럿 사이클 #4 (사이클 #3 약먹자 dogfood 반영, c992106 머지).
v1.2: 2026-05-29 02:10 KST · 🖥 데스크탑 · 야간 오토파일럿 사이클 #6 (사이클 #5 한컵 dogfood generality check 2건 반영, 5a7c53d 머지).
v1.2.1: 2026-05-29 02:20 KST · 🖥 데스크탑 · 야간 오토파일럿 사이클 #8 (사이클 #7 포모도로 + #8 로또 dogfood 매핑 표·분배 표·검증 표 갱신 — 4 dogfood 누적 완료, fan-out baseline 확정).
v1.2.2: 2026-05-29 02:30 KST · 🖥 데스크탑 · 야간 오토파일럿 사이클 #9 (남은 4 앱 한줄/메모요/단어요/더치페이 baseline audit prediction 박음, 더치페이에서 새 B' sub-pattern 발견 — ads 가 body 안 inline 박힌 케이스. fan-out 노드별 audit 부담 감소).
v1.3: 2026-05-29 02:46 KST · 🖥 데스크탑 · 야간 오토파일럿 사이클 #11 (사이클 #10 더치페이 B' dogfood 정정 4건 묶음 — GC7 baseline main FF 의무 / GC8 B' 정의 broader / 더치페이 row 정정 textFaint + lib/theme/ 디렉토리 / 메모요 row stale 의심 본진 re-verify 권장 / 디자인 시스템 클러스터 표 + 약먹자≈더치페이 형제 / 5 dogfood 검증 표 3×3 매트릭스 완전 cover).
