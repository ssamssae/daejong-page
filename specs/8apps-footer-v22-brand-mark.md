# 8 앱 footer v2.2 — brand mark sprint spec

데스크탑(🖥) 사이클 #17 산출. v2 brainstorm draft (PR #150 머지) 의 (c) brand mark 시각 통일 항목 deep dive. MED 우선순위 — v2.0 (b+d) + v2.1 (e) 머지 후 진입.

**docs only / 외부영향 0**. 머지 ≠ v2.2 트리거 — brand 가이드 sprint 자체 별 사이클 + 형님 ack 필수.

전제: 디자인 시스템 클러스터 5 분류 (v1.3 신설) 그대로 — A 약먹자/더치 textFaint / B 한컵/포모 toss textTertiary / C 한줄 / D 로또 minimal / E 메모요 stale. brand mark 통일 ≠ 5 클러스터 컬러 통일.

---

## §1 동기

### v1 footer 의 brand 표현 한계

v1 footer = `'v X.Y.Z · 강대종'` middle dot (U+00B7) + "강대종" 한국어 텍스트.

한계:
- **시각 인지도 약함**: middle dot 은 typography 구분자, 강한 brand 인식 X.
- **시리즈 통합 약함**: 8 앱 = 같은 만든 사람 시리즈인데, 사용자가 보고 즉시 "강대종 시리즈" 식별 어려움.
- **한국어 hard-coded**: "강대종" = 영어 출시 (v2 brainstorm g i18n) 시 hard-coded 문제. middle dot 자리에 visual brand mark 가 있으면 i18n 영향 0.

### v2.2 의 목표

- **8 앱 공통 visual brand mark** 디폴트 픽 — 한국어 / 영어 / 일본어 무관 식별 가능.
- **5 클러스터 디자인 시스템 충돌 회피** — brand mark 자체 디자인 vs 앱별 컬러 토큰 (textTertiary / textFaint / hintColor) 분리.
- **footer 디자인 단순 보존** — middle dot 자리 대체 또는 별 한 자 추가.

### v2.2 의 위치

v2.0 (b+d) + v2.1 (e) 머지 후 진입. brand 가이드 sprint = brainstorm + dogfood + spec 묶음 (단순 PR 아님). v2.2 본 spec 은 sprint 의 첫 brainstorm draft.

---

## §2 옵션 (brand mark 후보 5 개)

### 옵션 1: 🐝 (꿀벌, emoji)

- footer: `'v 1.0.7 🐝 강대종'` 또는 `'v 1.0.7 🐝'` (강대종 텍스트 제거 i18n 대응).
- 이미지: emoji 자체 (별 asset 0).
- 클러스터 영향: 0 (emoji 는 OS native rendering, 앱 컬러 토큰 무관).

장점: asset 0, i18n 0, 강한 시각 (꿀벌 = 부지런함/일/꿀 → 사이드 프로젝트 정체성). 사이드 프로젝트 시리즈 brand 인식.

단점: OS 별 emoji rendering 차이 (iOS Apple emoji vs Android Noto Color Emoji 다른 모양). 어두운 background 일부 환경 가독성.

### 옵션 2: ⭐ (별, emoji)

- footer: `'v 1.0.7 ⭐ 강대종'`.

장점: 옵션 1과 같은 장점 (asset 0, i18n 0). 별 = 추천/즐겨찾기 의미 익숙.

단점: 시리즈 brand 인식 약함 (별 자체는 일반적 의미). iOS Apple emoji 컬러 (gold) vs Android (yellow) 다름.

### 옵션 3: 강 한자 (강)

- footer: `'v 1.0.7 강 강대종'`.
- 강 한자 (강) = 강대종 본인 성씨 이니셜.

장점: 강대종 본인 brand 강조. 영어 출시 시 "강" 한 자만 보여도 동양 brand 식별. asset 0.

단점: 한자 = 영어/일본어 시장 친화성 약함 (일본어 시장 강 한자 의미 다름). 폰트 fallback 위험 (Pretendard 가 한자 지원하나 일부 한자 안 박힘 가능).

### 옵션 4: 강 이니셜 모노그램 (강 또는 K·)

- 작은 SVG 아이콘 (예: 동그라미 안 "강" 한 글자 / 또는 "K·" 라틴 알파벳).
- assets/brand_mark.svg + flutter_svg 의존성.

장점: 강한 시각 brand. 8 앱 공통 asset. v2 brainstorm a (monorepo) 후속 진입 시 별 package 공통.

단점: asset 추가 (8 앱 fan-out 시 8 곱 또는 monorepo 진입). flutter_svg 의존성 추가. 디자인 sprint 비용 (강대종 본인 디자인 결정).

### 옵션 5: 깃발/이니셜 텍스트 (`강` 한 자 정사각형 background)

- footer: 강 한 자가 동그라미/정사각형 inside 박힘. 텍스트로 그리는 방식 (Container + Text).

```dart
Container(
  width: 12,
  height: 12,
  decoration: BoxDecoration(
    color: AppColors.brand,  // 앱별 brand 컬러 (Toss blue / 인디고 / yellow 등)
    borderRadius: BorderRadius.circular(2),
  ),
  child: const Center(child: Text('강', style: TextStyle(fontSize: 8, color: Colors.white))),
)
```

장점: asset 0, 강한 시각. 앱별 brand 컬러 그대로 사용 — 5 클러스터 디자인 시스템 통합 (vs 충돌). 텍스트 사용 = 폰트 fallback 영향만 (한자 X, 한국어).

단점: footer 자체 코드 복잡도 증가 (Text 한 줄 → Row + Container + Text). 컬러 토큰 픽 + brand mark 컬러 픽 2 분기.

---

## §3 추천

### v2.2 권장 = 옵션 5 (텍스트 brand mark, 앱별 컬러)

이유:
- **asset 0** + 디자인 sprint 비용 작음 (강대종 본인 결정 = 컬러 / 모양 정사각형 vs 동그라미만).
- **5 클러스터 충돌 회피** — 각 앱의 brand 컬러 그대로 사용 (Toss blue 한컵 / 인디고 더치 / yellow 약먹자 / 등) → 디자인 시스템 통합.
- **i18n 영향 0** — "강" 한 자만 박힘 + 한자 X (한국어 폰트만 필요).
- **시각 인지도 강함** — 한 자 + 컬러 background = footer 안에서 brand 영역 명확.

대안 = 옵션 1 (🐝 emoji) — 강대종 본인이 사이드 프로젝트 brand 로 꿀벌 의미 선호 시 (예: kangbee 또는 daejong-bee 브랜드). asset 0 같음.

### 옵션 비교 표

| 옵션 | asset | 디자인 sprint | i18n | 5 클러스터 충돌 | 시각 인지도 | 권장 |
|------|-------|---------------|------|----------------|-------------|------|
| 1 🐝 | 0 | 작음 | 0 | 0 (emoji OS native) | 강 | 대안 |
| 2 ⭐ | 0 | 작음 | 0 | 0 | 중 | X |
| 3 강 한자 | 0 | 작음 | 큼 (영어/일본어 친화 약) | 0 | 중 | X |
| 4 SVG 모노그램 | 큼 (asset + flutter_svg) | 큼 | 0 | 0 | 강 | v2.3 monorepo 후 |
| 5 텍스트 강 + brand 컬러 | 0 | 작음 | 0 (한국어 폰트만) | **통합** | 강 | **권장** |

---

## §4 적용 위치

### footer middle dot 자리 (권장)

v1 footer:
```dart
Text('v$version · 강대종', ...)
```

v2.2 옵션 5 적용:
```dart
Row(
  mainAxisSize: MainAxisSize.min,
  children: [
    Text('v$version', ...),
    const SizedBox(width: 4),
    Container(
      width: 12, height: 12,
      decoration: BoxDecoration(color: AppColors.brand, borderRadius: BorderRadius.circular(2)),
      child: const Center(child: Text('강', style: TextStyle(fontSize: 8, color: Colors.white, fontWeight: FontWeight.w700))),
    ),
    const SizedBox(width: 4),
    Text('강대종', ...),
  ],
)
```

또는 더 단순 (강대종 텍스트 + brand mark 만):
```dart
Row(
  mainAxisSize: MainAxisSize.min,
  children: [
    Text('v$version · ', ...),  // middle dot 보존
    Container(width: 12, height: 12, ...),  // brand mark
    Text(' 강대종', ...),
  ],
)
```

### 옵션 비고 (위치 선택)

- middle dot 자리 대체 — middle dot 제거, brand mark 가 자리 차지. footer 길이 변경 작음.
- middle dot 보존 + brand mark 추가 — footer 길이 약간 증가 (12px + padding). 더 명확한 visual brand 영역.
- 강대종 텍스트 제거 (i18n 전 단계) — `'v 1.0.7 강'` (brand mark) 만. 영어 시장 진입 시 자연. 단 한국 사용자 식별 약화.

→ v2.2 권장 = **middle dot 보존 + brand mark 추가** (옵션 5, 강대종 텍스트 보존). 영어 i18n 진입 시 강대종 → 비어있음 + brand mark 만 보존 (v2.4 i18n 트랙).

---

## §5 회귀 안전망 + 8 앱 visual QA

### widget test

```dart
testWidgets('VersionFooter v2.2 brand mark 박힘', (tester) async {
  await tester.pumpWidget(MaterialApp(home: Scaffold(body: VersionFooter())));
  await tester.pumpAndSettle();

  expect(find.text('강'), findsOneWidget); // brand mark inside Container
  expect(find.text(' 강대종'), findsOneWidget); // 강대종 텍스트 보존
  expect(find.byType(Container), findsAtLeastNWidgets(1)); // brand mark Container
});
```

### 8 앱 visual QA (sprint 핵심)

각 앱 simulator (M1 본진/맥미니) 또는 폰 실디바이스 1 회:

- footer 의 brand mark Container 가 앱별 brand 컬러로 렌더되는지:
  - 약먹자: indigo 또는 brand 컬러
  - 한컵: Toss blue
  - 포모도로: Toss blue
  - 더치페이: 인디고 `0xFF4F6DF5`
  - 메모요: brand 컬러 (TBD v1 fan-out 결과 후)
  - 단어요: textTertiary 계열 (TBD)
  - 한줄일기: textTertiary 계열 (TBD)
  - 로또: hintColor fallback (brand mark 컬러 가 없어 fallback)

- "강" 한 자 가 12px Container 안에서 깨지지 않고 박힘 (Pretendard fontSize 8).
- middle dot 자리 visual 정렬 (Row 의 baseline alignment).

### GA QA 시나리오

- 5 dogfood 검증 매트릭스 그대로 (v1.3 5 dogfood) + brand mark visual verify 추가.
- 폰 실디바이스 시각 검증 = brand 가이드 sprint 의 핵심 산출.

---

## §6 limitations + 후속 트랙

### v2.2 에서 안 함

- **SVG 모노그램 (옵션 4)**: monorepo (v2 brainstorm a) 진입 후 별 package 공통 brand_kit. v2.3 a 트랙.
- **다른 brand 자산 (로고 / 아이콘 / illustration)**: 앱 아이콘 자체 customize 별 사이클.
- **i18n brand 텍스트**: "강대종" / "Kang Daejong" / "강대종 (강대종)" — v2.4 i18n 트랙.
- **brand 가이드 본문 (color palette / typography / spacing 통일)**: v2.2 본 spec = brand mark 1 부분만. 가이드 본문 별 sprint.
- **5 클러스터 컬러 통일**: 통일 컬러 강제 X — 옵션 5 가 클러스터 그대로 보존하므로.

### 1.x.x 후속 트랙 우선순위

- v2.3 = a monorepo (8 앱 brand_kit + version_footer 공유 widget package). v2.2 옵션 4 SVG 모노그램 진입 가능해짐.
- v2.4 = g i18n (강대종 → Kang Daejong / brand mark 텍스트 i18n).
- v2.5 = f hidden dev mode + 기타 사이드.

### v2.2 sprint 끝나면

- 본 spec 머지 (본진 자율 — 옵션 spec, 머지 ≠ ack).
- brand mark 옵션 5 vs 1 vs 4 형님 픽.
- 강대종 본인 디자인 결정 (Container 모양 정사각형 vs 동그라미 / 폰트 사이즈 / 텍스트 컬러 white vs 앱별 대비).
- 픽 끝나면 데스크탑 또는 본진 dogfood 1 노드 (예: 약먹자 = 클러스터 A 친족 fan-out 시작점) → 회고 → 7 앱 fan-out.

---

## §6 진입 전제

1. **v2.0 (b+d) fan-out 완료** — footer widget = FutureBuilder PackageInfo + about dialog 진입점.
2. **v2.1 (e LicensePage) 진입** — 옵션 A 또는 C 픽.
3. **8 앱 v1 fan-out 완료** — 클러스터 친족 분류 + brand 컬러 매핑 결정 (메모요 stale row 정정).
4. **형님 brand mark 옵션 픽** (옵션 5 권장 또는 1 대안).
5. **강대종 본인 디자인 결정** (모양 / 컬러 / 폰트).

### v2.2 fan-out 권장 순서

- 본 spec 머지 + 형님 옵션 픽 → 데스크탑 또는 본진 dogfood 1 노드 (약먹자 권장, 클러스터 A) → 시각 verify → 회고 → 7 앱 fan-out PR 본문 = footer widget 코드 변경 + visual QA.

---

작성: 2026-05-29 03:18 KST · 🖥 데스크탑 · 야간 오토파일럿 사이클 #17. v2 brainstorm 의 (c) brand mark 시각 통일 항목 deep dive. v2.0 (b+d) + v2.1 (e) 머지 후 진입.
