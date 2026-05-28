# 8 앱 footer v2.0 — package_info_plus + about dialog spec

데스크탑(🖥) 사이클 #14 산출. v2 brainstorm draft (`specs/8apps-footer-v2-brainstorm.md`, PR #150 머지) 의 권장 v2.0 = **(b) package_info_plus + (d) about dialog 묶음** deep dive.

**docs only / 외부영향 0**. 형님 v2.0 후보 ack 전엔 코드 진입 X — 본 spec 머지 ≠ v2.0 트리거 ack.

전제: v1 (`specs/8apps-version-footer.md` 1.0 → 1.3) 5 dogfood 매트릭스 cover + 클러스터 5 분류 + 잔여 3 fan-out (메모요/단어요/한줄) 본진 ack-pending.

---

## §1 동기 (v1 dart-define 한계 + b+d 묶음 사유)

### v1 dart-define APP_VERSION 의 한계

5 dogfood 시 검증된 v1 빌드 자동화 패턴:

```bash
flutter build apk --dart-define=APP_VERSION=$(grep '^version:' pubspec.yaml | awk '{print $2}' | cut -d+ -f1)
```

**한계**:
1. **빌드 자동화 8 곳 변경 필요** — mac-mini night-builder / submit-app 스킬 / 각 앱 CI / 로컬 fastlane lane / 강대종 수동 `flutter run` 등. v1 fan-out 끝나도 dart-define 빌드 자동화 별 PR 1개 따로 필요 (v1 spec step 4).
2. **누락 시 silent fail** — `--dart-define=APP_VERSION=...` 빠지면 footer 가 `vdev` 로 렌더. 빌드 PASS / 스토어 메타 일치 X / 사용자 혼란.
3. **pubspec → dart-define 수동 sync** — `version: 1.0.7+27` 변경하면 dart-define 도 1.0.7 으로 박아야 함. drift 가능 (강대종 수동 입력 시 오타 위험).
4. **runtime API X** — 앱 내부 (about dialog, error reporter, analytics) 에서 version 알고 싶을 때 `String.fromEnvironment` 만 사용 가능. about dialog 등에서 보통 `package_info_plus` 도 동시 사용해야 (의존성 중복).

### v2.0 = b + d 묶음 사유

**b 단독 진입 시 동기 부족**: package_info_plus 만 도입하면 footer 표시 형식은 v1 그대로. 사용자 가치 즉시성 약함.

**d 단독 진입 시 동기 부족**: about dialog 만 도입하면 dialog 내부에서 또 `String.fromEnvironment` 박아야 — dart-define 누락 시 dialog 도 vdev 표시. b 없이 d 만 진입은 절반 작업.

**b + d 묶음 = 강점**:
- b 로 runtime API 통일 → footer 위젯 + about dialog 둘 다 `PackageInfo.fromPlatform()` 단일 진입점 사용.
- d 가 b 의 runtime API 자연스러운 첫 사용처 (footer + dialog 형제 위젯).
- 8 앱 fan-out 1 회로 두 트랙 동시 진입 — 노드별 work 효율 (v1 fan-out 끝나면 v2.0 fan-out 시작).
- v2.0 PR 본문이 footer + about 의 디자인 결정 한 곳에 모임 (review 비용 감소).

---

## §2 트랙 B — package_info_plus 마이그레이션

### 의존성 추가

`pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  package_info_plus: ^9.1.0  # 또는 진입 시점 최신 stable
```

**주의**:
- google_mobile_ads / firebase_core 등 다른 패키지와 의존성 충돌 가능 — fan-out 시 노드별 `flutter pub get` 으로 확인.
- iOS = Info.plist 의 `CFBundleShortVersionString` (marketing version) + `CFBundleVersion` (build number) 자동 픽업. Android = `versionName` + `versionCode`. pubspec 변경 시 양쪽 동시 동기화 (Flutter 가이드 그대로).

### API 사용

```dart
import 'package:package_info_plus/package_info_plus.dart';

Future<PackageInfo> getInfo() => PackageInfo.fromPlatform();

// 사용:
final info = await PackageInfo.fromPlatform();
info.version       // '1.0.7' (pubspec version 의 마지막 + 앞부분, marketing)
info.buildNumber   // '27' (pubspec version 의 + 뒷부분, build)
info.packageName   // 'com.ssamssae.yakmukja'
info.appName       // 약먹자 (Android: app_name, iOS: CFBundleDisplayName)
```

### version_footer widget 변경

v1 widget (const stateless):

```dart
class VersionFooter extends StatelessWidget {
  const VersionFooter({super.key});

  @override
  Widget build(BuildContext context) {
    const version = String.fromEnvironment('APP_VERSION', defaultValue: 'dev');
    return Text('v$version · 강대종', ...);
  }
}
```

v2.0 widget (FutureBuilder, const 깨짐):

```dart
class VersionFooter extends StatelessWidget {
  const VersionFooter({super.key});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<PackageInfo>(
      future: PackageInfo.fromPlatform(),
      builder: (context, snapshot) {
        // first paint 시 'v · 강대종' 깜빡임 회피 — initial 'v… · 강대종' 또는 SizedBox
        final version = snapshot.data?.version ?? '…';
        return Padding(
          padding: const EdgeInsets.only(top: 4, bottom: 4),
          child: Text(
            'v$version · 강대종',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: _versionColor(context),  // 클러스터 토큰 픽 그대로
              letterSpacing: -0.1,
            ),
          ),
        );
      },
    );
  }

  Color _versionColor(BuildContext context) {
    // v1.3 우선순위 룰 그대로: textTertiary > textFaint > textMuted > textSecondary > hintColor
    // 앱별 AppColors 토큰 픽은 v1 그대로 (클러스터 친족 그대로 박힘)
    return AppColors.textFaint;  // 예시 — 약먹자/더치 클러스터 A
  }
}
```

**디자인 결정**:
- **first paint 깜빡임 회피**: snapshot null 시 `'v… · 강대종'` 표시 (3-dot horizontal ellipsis). `SizedBox.shrink()` 도 옵션이지만 layout 빌드 후 갑자기 박히는 jumpy 효과 — `'v…'` 가 부드러움.
- **FutureBuilder 비용**: PackageInfo.fromPlatform() 은 메소드 채널이라 첫 호출 ~10ms. cached internal — 2번째 호출부터 sync. footer 가 매 화면마다 빌드돼도 첫 화면 외엔 cached.
- **const widget 깨짐**: `VersionFooter` 인스턴스가 `const VersionFooter()` 로 const 가능 (위젯 자체는 const). 내부 Text 의 version 부분만 runtime — Flutter rebuild 비용 거의 0.

### 마이그레이션 단계 (v2.0 fan-out 시)

각 앱 prefix 브랜치 `<node>/v20-footer-2026-05-29` 분기 후:

0. **main FF 의무 (v1.3 GC7)** — `git fetch + git pull --ff-only`.
1. `pubspec.yaml`: `package_info_plus: ^9.x.0` 추가, `flutter pub get`.
2. `lib/widgets/version_footer.dart`: v1 → v2 (FutureBuilder + PackageInfo). 클러스터 토큰 픽은 v1 그대로 (textTertiary / textFaint / hintColor fallback).
3. **dart-define APP_VERSION 호환성**: 빌드 명령어에서 `--dart-define=APP_VERSION=...` 제거 가능 (`String.fromEnvironment` 가 v2 widget 에선 안 쓰임). 단 night-builder 등 자동화 갱신 별 PR.
4. `test/widgets/version_footer_test.dart`: v1 dart-define 매트릭스 test → v2 PackageInfo mock test (별 mock 라이브러리 필요 — package_info_plus_platform_interface 의 setMockMethodCallHandler 또는 가짜 plugin).
5. **회귀**: about dialog (트랙 D) 동시 추가 시 footer 탭 → dialog 진입 검증.
6. analyze + test PASS, merge-gate.sh PASS, PR.

### 옵션: dart-define fallback 유지 vs 완전 전환

**옵션 B-fallback**: v2 widget 안에서 `String.fromEnvironment('APP_VERSION', defaultValue: '')` 도 시도 → 비어있으면 `PackageInfo.fromPlatform()` 호출.
- 장점: night-builder dart-define 제거 안 해도 OK (호환). 마이그레이션 단계적.
- 단점: 두 경로 동시 유지 = drift 가능, 코드 복잡.

**옵션 B-clean (권장)**: v2 widget = PackageInfo only. dart-define 빌드 자동화는 별 PR 로 제거.
- 장점: 단일 진입점, code review 명확.
- 단점: 빌드 자동화 8 곳 변경 별 PR 동시 진행 필요.

→ v2.0 권장 = **B-clean** + dart-define 제거 별 PR (mac-mini night-builder + submit-app 스킬).

---

## §3 트랙 D — about dialog

### 옵션 1: Flutter built-in `showAboutDialog`

```dart
showAboutDialog(
  context: context,
  applicationName: info.appName,
  applicationVersion: 'v${info.version} (build ${info.buildNumber})',
  applicationLegalese: '© 2026 강대종',
  applicationIcon: Image.asset('assets/icon.png', width: 48, height: 48),
  children: [
    const Padding(padding: EdgeInsets.only(top: 12), child: Text('피드백: feedback@kangdaejong.com')),
    TextButton(onPressed: () => launchUrl(...), child: const Text('홈페이지')),
  ],
);
```

- 장점: Flutter 가이드 표준. LicensePage 자동 link (children 외 default 표시).
- 단점: 디자인 Flutter 디폴트 (Material 3 dialog). 앱별 클러스터 디자인 시스템 (Toss vs 인디고 vs minimal) 통일 어려움.

### 옵션 2: 자체 BottomSheet 디자인

```dart
showModalBottomSheet(
  context: context,
  builder: (ctx) => AboutSheet(info: info),
);

// AboutSheet — 앱 별 디자인 토큰 사용
class AboutSheet extends StatelessWidget { ... }
```

- 장점: 앱별 클러스터 디자인 시스템 (textTertiary vs textFaint vs hintColor) 그대로 사용 — 시각 일관성.
- 단점: 8 앱 dialog 8 가지 디자인 (또는 8 앱 복붙 + 토큰 분기). LicensePage link 수동 박아야.

### 옵션 3 (권장): showAboutDialog 의 `applicationIcon` + `children` 만 customize, dialog 자체는 Flutter 표준

- 장점: 표준 dialog 의 layout 그대로 (LicensePage link 자동), customization 은 branding 부분만.
- 단점: 큰 디자인 자유도 X.

### 표시 항목 (옵션 3 기준)

| 항목 | 출처 | 비고 |
|------|------|------|
| 앱 이름 | `info.appName` | iOS CFBundleDisplayName / Android app_name |
| 버전 | `'v${info.version} (build ${info.buildNumber})'` | pubspec → Info.plist/AndroidManifest 자동 |
| 개발자 | "강대종" hard-coded | (g) i18n v2 후속 트랙에서 추출 |
| 라이선스 | `applicationLegalese: '© 2026 강대종'` + LicensePage link (자동) | Flutter 표준 |
| 피드백 | `mailto:` 또는 외부 폼 URL `launchUrl(...)` | url_launcher 의존 (이미 일부 앱에 박혀있음) |
| 홈페이지 | `kangdaejong.com` `launchUrl(...)` | (옵션) |

### 진입 (footer 탭 vs 별 button)

**옵션 D-1 (권장)**: footer 탭 → about dialog. v1 footer 가 단순 Text 였는데 v2 에선 `GestureDetector` + `InkWell` 또는 `TextButton` 으로 감싸 탭 가능.

```dart
return GestureDetector(
  onTap: () => showAboutDialog(...),
  child: Padding(... Text('v$version · 강대종', ...)),
);
```

- 장점: 진입 단순, footer = 단일 책임 (브랜드 + 진입).
- 단점: 사용자가 footer 가 탭 가능한 줄 모를 수도 (UI affordance 약함). v1 사이클 #13 후보 (f) "footer 클릭 액션" 와 같음.

**옵션 D-2**: appBar 의 actions 에 about IconButton 추가.
- 장점: 사용자 affordance 명확.
- 단점: 8 앱 appBar 디자인 다 다름 — 8 가지 박힘 패턴.

**옵션 D-3**: settings 또는 별 screen 의 항목으로.
- 장점: 표준 모바일 UX (Settings → About).
- 단점: 8 앱 중 settings screen 없는 앱 (로또/한컵/포모도로) — settings 추가 자체 별 트랙.

→ v2.0 권장 = **D-1** (footer 탭) — 디자인 단순, 8 앱 통일 가능.

### 1.0.x trade-off — 8 앱 동일 적용 vs 앱별 customize

**동일 적용 (권장)**: showAboutDialog + footer 탭 진입 + 동일 children (라이선스/피드백). 8 앱 fan-out PR 본문 동일.

**앱별 customize**: 앱별 도메인 (yakmukja 약 정보 / dutch 영수증 분할 가이드 등) 다른 children. 시각 일관성 깨짐 + fan-out 노드 work 증가.

→ v2.0 권장 = **8 앱 동일 적용**. 앱별 customize 는 v2.x 후속 트랙.

---

## §4 회귀 안전망

v2.0 fan-out 시 각 앱 widget test 시나리오:

### 트랙 B (package_info_plus) 테스트

```dart
// test/widgets/version_footer_v20_test.dart
import 'package:package_info_plus_platform_interface/package_info_data.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';

class _MockPackageInfoPlatform extends PackageInfoPlatform {
  @override
  Future<PackageInfoData> getAll({BaseDeviceInfo? baseDeviceInfo}) async {
    return PackageInfoData(
      appName: '약먹자',
      version: '1.0.7',
      buildNumber: '27',
      packageName: 'com.ssamssae.yakmukja',
      ...
    );
  }
}

void main() {
  setUp(() {
    PackageInfoPlatform.instance = _MockPackageInfoPlatform();
  });

  testWidgets('VersionFooter v2 renders "v1.0.7 · 강대종" from PackageInfo', (tester) async {
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: VersionFooter())));
    await tester.pumpAndSettle();
    expect(find.text('v1.0.7 · 강대종'), findsOneWidget);
  });

  testWidgets('VersionFooter first paint shows "v… · 강대종" (placeholder)', (tester) async {
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: VersionFooter())));
    // pumpAndSettle X — first frame
    await tester.pump();
    expect(find.text('v… · 강대종'), findsOneWidget);
  });
}
```

### 트랙 D (about dialog) 테스트

```dart
testWidgets('Footer 탭 시 about dialog 진입', (tester) async {
  await tester.pumpWidget(MaterialApp(home: Scaffold(body: const HomeScreen())));
  await tester.pumpAndSettle();

  // footer 탭
  await tester.tap(find.byType(VersionFooter));
  await tester.pumpAndSettle();

  // dialog 안에 앱 이름 + 버전 확인
  expect(find.text('약먹자'), findsWidgets); // appBar 와 dialog title 둘 다
  expect(find.text('v1.0.7 (build 27)'), findsOneWidget);
  expect(find.text('© 2026 강대종'), findsOneWidget);
});
```

### v1 회귀 (8 앱 기존 test 보존)

v1 dogfood 시 박힌 `test/widgets/version_footer_test.dart` 의 dart-define 매트릭스 테스트는 **삭제 또는 v2 mock 로 교체**:
- 삭제 시 회귀 cover 0 — 권장 X.
- 교체 시 dart-define test 가 PackageInfo mock 으로 대체 — 동일 형식 검증.

→ v2.0 fan-out PR 본문에 v1 test 파일 갱신 명시 (delete vs replace).

---

## §5 limitations + 1.x.x 후속 트랙

### v2.0 에서 안 함

- **i18n** (후보 g): "강대종" hard-coded 그대로. 영어/일본어 출시 결정 시 v2.x.
- **LicensePage 컴플라이언스** (후보 e): showAboutDialog 의 children 에 link 만 박음. 세부 LicensePage 디자인 안 customize.
- **brand mark 시각 통일** (후보 c): "v X.Y.Z · 강대종" middle dot 그대로. SVG 로고 / 이모지 통일은 별 trsck.
- **monorepo / 공유 widget package** (후보 a): 8 앱 widget 복붙 그대로. monorepo 진입은 spec 변경 빈도 높을 때.
- **footer 클릭 hidden dev mode** (후보 f): 단일 탭 = about 만. 3회 탭 hidden mode = 별 트랙.

### 1.x.x 후속 트랙 우선순위 (v2.0 머지 후 회고로 갱신)

- v2.1 = e LicensePage 컴플라이언스 강화 (현 자동 link → custom LicensePage 디자인).
- v2.2 = c brand 가이드 sprint 후 통일 brand mark.
- v2.3 = a monorepo (5 dogfood 회고 결과 진입 여부 결정).
- v2.4 = g i18n (해외 출시 결정 시).
- v2.5 = f hidden dev mode (강대종 디버그 채널 강화).

---

## §6 다음 단계

### v2.0 진입 전제 (재확인)

1. **v1 7 노드 fan-out 완료** — 메모요 본진 / 단어요 맥미니 / 한줄 본진 migration. 잔여 3 머지 후 v2.0 시작.
2. **1.0.7 메모요 GA PASS** — 1.0.8 트랙 (있다면) 동시 진행 충돌 회피.
3. **8 앱 v1 시각 verify 완료** — 폰 실디바이스 1회 (M1 본진/맥미니 simulator 또는 실기).
4. **dart-define APP_VERSION 빌드 자동화 별 PR** — v1 spec 마지막 step 4 (8 앱 머지 후 mac-mini night-builder + submit-app 스킬 갱신).

### v2.0 fan-out 권장 순서

- spec v2.0 본 PR 머지 (본진 자율) → 형님 v2.0 트리거 ack 후 본진 시작.
- 데스크탑 dogfood 1 앱 (예: 약먹자 = 클러스터 A, ads-supported + textFaint) → spec v2.0 generality validate.
- 본진/맥미니/WSL 6 앱 fan-out (클러스터 친족 기준 노드별 분배).
- 빌드 자동화 dart-define 제거 별 PR (맥미니).

### 머지 ≠ ack

본 spec PR 머지 = 본진 자율 머지 OK. **머지 != v2.0 진입 트리거 ack**. v2.0 실제 fan-out 은 형님 ack 후 별 directive 시 시작.

---

작성: 2026-05-29 03:02 KST · 🖥 데스크탑 · 야간 오토파일럿 사이클 #14. v2 brainstorm draft (PR #150 머지) 의 권장 v2.0 = b + d 묶음 deep dive.
