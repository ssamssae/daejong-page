# 8앱 version footer 통일 spec

T-260529-03 (side-project) 사이클 #2 산출. 데스크탑(🖥) 노드 작성.

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

- 위치: 앱 메인 화면의 하단 안전영역 위쪽 (한줄일기처럼 bottom nav row 아래 또는 단일 화면 앱은 Scaffold bottomNavigationBar 위 SafeArea 안쪽).
- 형식: `v1.0.7 · 강대종` 한 줄. middle dot `·` (U+00B7) 로 버전과 brand mark 구분.
- 톤: 한줄일기 footer 가 reference precedent — `fontSize: 10, fontWeight: FontWeight.w500, color: AppColors.textTertiary, letterSpacing: -0.1`. fontFamily 는 앱별 기본 폰트 (Pretendard 가 있으면 Pretendard, 없으면 system default).
- 클릭 X (회사 사이트 링크 / about 다이얼로그 모두 v1 에 안 박음 — 후속 v1.x 결정).

### 데이터 소스

- 디폴트: `package_info_plus` 의 `PackageInfo.fromPlatform()` 으로 런타임에 pubspec version 자동 픽업. 수동 상수 drift 0 화.
- v1 단순 안: build-time `String.fromEnvironment('APP_VERSION', defaultValue: 'dev')` + `flutter build --dart-define=APP_VERSION=1.0.7`. 패키지 추가 없이 빌드 흐름만 잡으면 충분 — 빌드 자동화 (mac-mini night-builder, submit-app 스킬) 가 pubspec → dart-define 주입.
- 결정: **v1 = dart-define 안** (가벼움, 추가 의존 0, 빌드 자동화에 한 줄 추가). v1.x = package_info_plus 마이그레이션 (스토어 정책 변화 시).

### 공유 위젯

`packages/strap_brand/` (별 패키지) 로 빼지 않고 v1 은 **각 앱에 동일 widget 파일 복붙** — 8 앱 모두 별 repo + Karpathy 룰3 (국소 변경, 추상화 보류). v1.x 가 통일 brand 가이드 확정 후 monorepo 또는 별 package 로 추출 검토.

복붙 widget 파일: `lib/widgets/version_footer.dart`

```dart
import 'package:flutter/material.dart';

class VersionFooter extends StatelessWidget {
  const VersionFooter({super.key});

  @override
  Widget build(BuildContext context) {
    const version = String.fromEnvironment('APP_VERSION', defaultValue: 'dev');
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text(
        'v$version · 강대종',
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: Theme.of(context).hintColor,
          letterSpacing: -0.1,
        ),
      ),
    );
  }
}
```

앱별 AppColors.textTertiary 가 있으면 그걸 우선, 없으면 `Theme.of(context).hintColor` fallback. 한줄일기는 이미 있는 `kAppVersion` 상수 떼어내고 `VersionFooter` 로 교체.

## 앱별 노드 분배 (위임 우선 디폴트)

분배 원칙: 같은 노드에서 이미 만지고 있는 앱 우선 + LLM-only 작업이라 노드 GPU/언어 분기 무관.

| 노드 | 담당 앱 | 근거 |
|------|---------|------|
| 🍎 본진 (mac) | 메모요, 한줄일기 | 본진 자율 — 마침 메모요 1.0.7 사이클 중 + 한줄일기 footer reference 정리 본진이 정합 좋음 |
| 🏭 맥미니 | 단어요, 로또번호 계산기 | 빌드/배포 엔진. 둘 다 정적 LUT 앱이라 위험도 낮음 |
| 🪟 WSL | 더치페이, 한컵 | wsl 즉응 코드 수정 |
| 🖥 데스크탑 (이 노드) | 약먹자 | 사이클 #2 spec 짠 노드라 dogfood 1 앱 |
| 💻 노트북 | 포모도로 | 노트북 노드 onboard |

위임 escape: 노드 세션 없거나 5분 안 끝낼 일이면 본진 fallback. 8 앱 각각 footer 추가 = `lib/widgets/version_footer.dart` 1 파일 + 메인 화면 1 줄 import + 1 자리 widget tree 추가 = 평균 3 분 X 8 = 24 분, 5 노드 병렬 시 5 분 안 끝남.

## 빌드 흐름 (앱별 PR 1개씩)

각 노드가 자기 앱에 prefix 브랜치 `<node>/version-footer-2026-05-29` 분기 후:

1. `lib/widgets/version_footer.dart` 새 파일 (위 코드 그대로 + AppColors 가 있으면 hintColor 대신 그걸로).
2. 메인 화면 (Scaffold body 또는 bottomNavigationBar 영역) 에 `const VersionFooter()` 1 줄 추가. 한줄일기는 기존 `kAppVersion` 상수 + Text 위젯 떼어내고 VersionFooter 로 교체 (`Karpathy 룰3 surgical` — 인접 코드 손대지 말 것).
3. `pubspec.yaml` 변경 X (v1 dart-define 안).
4. 빌드 스크립트 (CI/scripts/submit-app 스킬/night-builder) 에 `--dart-define=APP_VERSION=$(grep '^version:' pubspec.yaml | awk '{print $2}' | cut -d+ -f1)` 추가 — 별 PR 또는 spec 후속.
5. `flutter analyze --no-fatal-infos` PASS.
6. `flutter test` PASS (회귀 0).
7. `~/claude-skills/autopilot/merge-gate.sh <repo>` PASS.
8. PR 생성 (`<node>/version-footer-2026-05-29` → `main`). 본진/맥미니 자율 머지.
9. 머지 후 다음 빌드 사이클에서 dart-define 박혀 실제 footer 가 "v X.Y.Z · 강대종" 으로 렌더됨. 빌드 dart-define 누락 시 `vdev · 강대종` 으로 보임 — 그것도 dev 빌드라는 시그널이라 OK.

## 비 goal (v1 에서 안 한다)

- 통일 brand 가이드 (색·로고·typography) 정립 — v1.x 디자인 사이클.
- about 다이얼로그 / 회사 사이트 링크 / 오픈소스 라이센스 페이지 — 별 사이클.
- monorepo / 공유 widget 패키지 추출 — 8 앱 다 PR 후 dogfood 한 다음.
- package_info_plus 마이그레이션 — 스토어 정책 변화 시.
- iOS/Android 네이티브 footer (스토어 메타에 한정).

## 검증 끝나면

`~/todo/tasks.md` 의 T-260529-03 [~] working → [x] 완료 마킹 (PR 8 개 다 머지 후) + 본진이 v1 footer 통일 첫 dogfood 산출 1 줄 worklog.

---

작성: 2026-05-29 01:46 KST · 🖥 데스크탑 · 야간 오토파일럿 사이클 #2.
