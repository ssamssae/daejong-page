# 8 앱 footer v2.1 — LicensePage spec

데스크탑(🖥) 사이클 #16 산출. v2 brainstorm draft (PR #150 머지) 의 (e) LicensePage 컴플라이언스 항목 deep dive. MED 우선순위 — v2.0 (b+d 묶음) 머지 후 진입 권장.

**docs only / 외부영향 0**. 머지 ≠ v2.1 트리거 ack — v2.0 fan-out 완료 + 형님 ack 후 진입.

전제: v2.0 (`specs/8apps-footer-v20-package-info-about.md`, PR #151 머지) 의 about dialog 가 진입점. v2.1 = about dialog 안 라이선스 entry 또는 별 진입.

---

## §1 동기

### 라이선스 컴플라이언스 의무

8 앱 모두 Flutter + Dart 의 BSD-3-Clause 코드 + pubspec dependencies 사용 (yakmukja = google_mobile_ads / 한컵 = shared_preferences / 더치페이 = google_mobile_ads / 등). 각 패키지는 자체 라이선스 (MIT / Apache 2.0 / BSD-3 / LGPL 일부) 를 가지고 있으며, 앱 배포 시 **사용자에게 노출 의무** 가 있음.

- **App Store / Play Store 정책**: 직접적 노출 의무 명문 X 이지만, 분쟁 시 라이선스 위반 패치 / 앱 제거 위험 (예: Apple GPL-incompatible 라이선스 거부 사례).
- **MIT / Apache 2.0**: 저작권 표시 + 라이선스 본문 사본 의무.
- **LGPL** (드물게 의존성): 동적 링크 + 라이선스 본문 + LGPL 의존 명시.

### 현 상태 (v2.0 까지)

- v1 footer = `'v X.Y.Z · 강대종'` 만 표시. 라이선스 0.
- v2.0 about dialog = `applicationLegalese: '© 2026 강대종'` + Flutter 의 `showAboutDialog` 자동 LicensePage link (default children). 라이선스 노출 가능하나 **기본 디자인** 그대로.

### v2.1 의 위치

v2.0 의 `showAboutDialog` 기본 LicensePage link 가 자동 박혀있어 컴플라이언스 최소 의무는 v2.0 단계에서 cover 됨. v2.1 = **라이선스 노출 강화 + 커스텀 디자인** 트랙. v2.0 머지 후 dogfood 회고로 진입.

---

## §2 옵션

### 옵션 A: Flutter 내장 `showLicensePage` 그대로 (가장 surgical)

v2.0 의 `showAboutDialog` 가 자동 박는 LicensePage link 활용. 별 코드 변경 0.

```dart
// v2.0 의 about dialog 그대로
showAboutDialog(
  context: context,
  applicationName: info.appName,
  applicationVersion: 'v${info.version}',
  applicationLegalese: '© 2026 강대종',
  // children: [] X — Flutter 기본 LicensePage link 자동 박힘
);
```

사용자 흐름: footer 탭 → about dialog → "VIEW LICENSES" Material 3 버튼 → `LicensePage` (Flutter 기본).

- 장점: 코드 변경 0, 컴플라이언스 의무 자동 cover. 8 앱 동일.
- 단점: LicensePage 디자인 = Flutter 기본 (앱별 클러스터 디자인 시스템 무시). "VIEW LICENSES" 라벨 = 영어 hard-coded (한국어 i18n 없음).

### 옵션 B: 커스텀 `LicensePage` (앱 디자인 일치)

```dart
class CustomLicensePage extends StatelessWidget {
  const CustomLicensePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('오픈소스 라이선스')),
      body: FutureBuilder<List<LicenseEntry>>(
        future: LicenseRegistry.licenses.toList(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final entries = snapshot.data!;
          return ListView.builder(
            itemCount: entries.length,
            itemBuilder: (context, i) {
              final entry = entries[i];
              return ExpansionTile(
                title: Text(entry.packages.join(', ')),
                children: entry.paragraphs.map((p) => Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(p.text, style: TextStyle(fontSize: 12, color: AppColors.textFaint)),
                )).toList(),
              );
            },
          );
        },
      ),
    );
  }
}
```

- 장점: 앱별 디자인 토큰 (textTertiary / textFaint / hintColor) 그대로 사용. "오픈소스 라이선스" 한국어 title.
- 단점: 8 앱 별 customize = 8 가지 페이지 (또는 monorepo 추출 — 사이클 #15 v2 brainstorm 의 a 후보 의존). 8 앱 fan-out 시 customize work 증가.

### 옵션 C: about dialog 안 라이선스 entry (v2.0 d 와 묶음)

v2.0 `showAboutDialog` 의 `children` 에 라이선스 ListTile 박기:

```dart
showAboutDialog(
  context: context,
  applicationName: info.appName,
  ...
  children: [
    const Padding(padding: EdgeInsets.only(top: 12), child: Text('피드백: feedback@kangdaejong.com')),
    ListTile(
      title: const Text('오픈소스 라이선스'),
      trailing: const Icon(Icons.chevron_right),
      onTap: () {
        Navigator.pop(context); // dialog 닫고
        showLicensePage(context: context);
      },
    ),
  ],
);
```

- 장점: 옵션 A 의 자동 LicensePage link + 옵션 B 의 한국어 라벨 + about dialog 안 통합 (사용자가 footer 탭 → about → 라이선스 흐름 자연).
- 단점: dialog → page 전환 시 dialog pop 처리 안 하면 dialog 중복 (Flutter Material 3 dialog stack 처리). 사용자가 about 으로 돌아가려면 한 번 더 탭 (UX 약점).

---

## §3 추천 = A (또는 C 묶음)

### v2.1 권장 = 옵션 A

**이유**:
- 코드 변경 0, 컴플라이언스 의무 cover.
- 8 앱 fan-out 0 (v2.0 머지로 자동).
- v2.1 진입 자체가 사실상 v2.0 머지 후 추가 작업 0 — spec 본문도 짧음.

→ v2.1 = "v2.0 LicensePage link 자동 박힘 verify + dogfood 노드 1 곳에서 라이선스 페이지 진입 + 검증" 의 짧은 사이클.

### 옵션 C 묶음 (v2.0 fan-out 시작 전 픽 시)

v2.0 fan-out 시작 전에 옵션 C 픽 하면 fan-out PR 본문 에 about dialog 의 children 1 ListTile 추가만. v2.0 + v2.1 (e) 동시 머지 가능 — 별 spec 발사 0.

→ 옵션 C 는 v2.0 spec 본문에 footnote 로 박는 게 효율적. 형님이 v2.0 트리거 ack 시 옵션 C 채택 여부 결정.

### 옵션 B (커스텀 LicensePage) = v2.x 후속

v2.1 머지 후 dogfood 결과 "기본 LicensePage 디자인 마음에 안 듦" 트리거 시 진입. brand 가이드 sprint (v2 brainstorm 의 c) 와 묶어서 진행.

---

## §4 진입 위치

### v2.0 의 진입 흐름 (이미 박힌 것)

```
footer 탭 (VersionFooter 의 GestureDetector onTap)
  ↓
showAboutDialog (v2.0 트랙 D)
  ↓
"VIEW LICENSES" 버튼 (자동 박힘, Flutter Material 3 default)
  ↓
LicensePage (Flutter 기본)
```

### v2.1 추가 진입 (옵션 C 묶음 시)

```
footer 탭
  ↓
showAboutDialog
  ↓
about dialog 안 ListTile "오픈소스 라이선스"
  ↓
LicensePage (Flutter 기본)
```

옵션 A 단순 진입 (3 단계) vs 옵션 C 묶음 (4 단계, 한국어 ListTile). 둘 다 진입점 = footer 탭.

### 진입점 변경 X

v2.1 은 footer 탭 진입 그대로. about dialog 의 children 만 변경 (옵션 C 픽 시).

---

## §5 회귀 안전망 + GA QA

### 옵션 A 검증

- v2.0 fan-out 끝나면 자동 박힘 — v2.1 별 widget test 0.
- 수동 QA: 폰 실디바이스 (M1 본진/맥미니 simulator) 에서 footer 탭 → about dialog → "VIEW LICENSES" 탭 → LicensePage 렌더 verify. 8 앱 각각 1회씩.

### 옵션 C 검증 (묶음 시)

widget test:

```dart
testWidgets('About dialog 안 라이선스 ListTile 진입', (tester) async {
  await tester.pumpWidget(...);
  await tester.tap(find.byType(VersionFooter));
  await tester.pumpAndSettle();

  expect(find.text('오픈소스 라이선스'), findsOneWidget);
  await tester.tap(find.text('오픈소스 라이선스'));
  await tester.pumpAndSettle();

  // LicensePage 진입 verify — appBar title 또는 첫 라이선스 entry 확인
  expect(find.text('Licenses'), findsOneWidget); // Flutter 기본 title
});
```

### GA QA 시나리오 (모든 옵션)

- 8 앱 각각: footer 탭 → about → 라이선스 진입 → 한 entry 펼쳐서 본문 표시 verify.
- 라이선스 본문 = pubspec dependencies 자동 generate. yakmukja 만 google_mobile_ads / 한컵 만 shared_preferences 등 앱별로 다름.
- 라이선스 갱신 = pubspec 의존성 변경 시 자동 (LicenseRegistry 가 빌드 타임 generate).

---

## §6 limitations + 후속 트랙

### v2.1 에서 안 함

- **커스텀 LicensePage 디자인** (옵션 B): brand 가이드 sprint (v2 brainstorm c) 와 묶어서 v2.2.
- **i18n LicensePage** (Flutter 기본 라벨 영어): v2 brainstorm g 트랙. v2.4 또는 별 sprint.
- **라이선스 갱신 alarm**: pubspec dependency 변경 시 자동 generate 이지만, 라이선스 자체 변경 (예: Apache → AGPL) 감지 X. 외부 audit 별 트랙.
- **컴플라이언스 audit**: 8 앱 모두 의존성 라이선스 분석 (예: GPL-incompatible 의존 detect) — 별 sprint.

### 1.x.x 후속 트랙 우선순위 (v2 brainstorm 표 그대로)

- v2.2 = c brand 가이드 sprint 후 통일 brand mark + 커스텀 LicensePage (옵션 B) 묶음.
- v2.3 = a monorepo (8 앱 footer + about + LicensePage 공유 widget package 추출).
- v2.4 = g i18n (LicensePage 라벨 한국어 / 영어 / 일본어 등).

### v2.1 spec 끝나면

- 본 spec 본 PR 머지 (본진 자율 — 옵션 spec).
- v2.0 fan-out 시 옵션 C 묶음 여부 형님 ack.
- v2.1 단독 사이클 = 옵션 A 만 진입 → fan-out 0, dogfood QA 1 노드.

---

## §6 진입 전제

1. **v2.0 (b + d 묶음, `specs/8apps-footer-v20-package-info-about.md`) fan-out 완료**.
2. **8 앱 모두 about dialog 박힘** (v2.0 결과).
3. **8 앱 LicensePage 자동 link verify** (옵션 A 픽 시).

### v2.1 fan-out 권장 순서

- 옵션 A 픽 시: v2.0 fan-out 끝나면 v2.1 = 8 앱 simulator QA 1회씩 = 본진/맥미니 1 사이클로 끝. 추가 PR 0.
- 옵션 C 픽 시: v2.0 fan-out 시 8 앱 PR 본문 에 children ListTile 1 줄 추가. v2.0 PR 머지 = v2.1 자동 머지.

---

작성: 2026-05-29 03:14 KST · 🖥 데스크탑 · 야간 오토파일럿 사이클 #16. v2 brainstorm 의 (e) LicensePage 컴플라이언스 항목 deep dive. v2.0 (b+d) 머지 후 진입.
