# 8 앱 footer v2.4 — i18n spec draft (짧은)

데스크탑(🖥) 사이클 #22 산출. v2 brainstorm draft (PR #150 머지) 의 (g) i18n 항목 짧은 deep dive. LOW TBD — 영어/일본어 출시 결정 시 진입.

**docs only / 외부영향 0**. 머지 ≠ v2.4 트리거 — 강대종 본인 해외 출시 결정 + 형님 ack 필수.

전제: v2.0 (b+d) + v2.1 (e) + v2.2 (c brand mark) + v2.3 (a monorepo) 머지 후 + 8 앱 v1 fan-out 완료 + 브랜드 가이드 통일 후 진입.

---

## §1 동기

### v1~v2.2 의 i18n 한계

현재 footer 의 hard-coded 한국어:
- v1.0~v1.3: `'v X.Y.Z · 강대종'`
- v2.0 about dialog: `'v ${info.version} (build ${info.buildNumber})'` + `applicationLegalese: '© 2026 강대종'`
- v2.1 LicensePage: `'오픈소스 라이선스'` (옵션 C 묶음 시)
- v2.2 brand mark: `'강'` 한 자 + `'강대종'` 텍스트

영어/일본어 출시 시 hard-coded → 자연스럽지 않음:
- 영어: `'v 1.0.7 · Kang Daejong'` 또는 brand mark + ""
- 일본어: `'v 1.0.7 · 강대종 (강대종)'` 또는 한자 fallback

### v2.4 의 위치

해외 출시 결정 = 강대종 본인 사이드 프로젝트 운영 회고 영역. 결정 후만 진입 — LOW TBD 우선순위. 단 일부 사이드 앱 (한컵 / 포모도로 = 글로벌 시장 친화) 우선 i18n 진입 케이스 가능.

---

## §2 옵션 3

### 옵션 1: Flutter intl (공식, 가장 표준)

Flutter 공식 intl 패키지 + `.arb` 파일 + `flutter_localizations`.

```yaml
# pubspec.yaml
dependencies:
  flutter_localizations:
    sdk: flutter
  intl: ^0.20.0
```

`lib/l10n/app_en.arb` / `app_ko.arb` / `app_ja.arb`:
```json
{
  "brand_name": "강대종",
  "@brand_name": {"description": "Brand name displayed in footer/about"}
}
```

footer widget:
```dart
Text('v$version · ${AppLocalizations.of(context).brand_name}', ...)
```

장점: Flutter 표준, 자동 코드 생성, 8 앱 공통 패턴.
단점: 8 앱 모두 flutter_localizations + intl 의존성 + l10n 디렉토리 + supportedLocales 설정. 진입 비용 큼.

### 옵션 2: easy_localization (선언적, 더 단순)

```yaml
dependencies:
  easy_localization: ^4.0.0  # 또는 진입 시점 최신
```

`assets/translations/en.json` / `ko.json` / `ja.json` 단순 JSON.

```dart
Text('v$version · ${'brand_name'.tr()}', ...)
```

장점: 인터페이스 단순, JSON 파일 직접 편집 가능, 코드 생성 X.
단점: 외부 패키지 (Flutter 공식 X). 8 앱 모두 의존성 + assets 설정.

### 옵션 3: hard-code 영어 fallback (가장 surgical)

i18n 라이브러리 X. `Localizations.localeOf(context).languageCode` 으로 직접 분기:

```dart
final lang = Localizations.localeOf(context).languageCode;
final brand = lang == 'ko' ? '강대종' : 'Kang Daejong';
Text('v$version · $brand', ...)
```

장점: 의존성 0, 가장 가벼움. 단어 1~2개만 i18n 필요한 경우 효율.
단점: 확장성 약 (l10n 단어 늘면 코드 폭발). 일본어 등 추가 시 분기 분기.

---

## §3 추천

### v2.4 권장 = 옵션 3 (영어 fallback) — 단 사이드 앱 글로벌 출시 결정 후

- 단 footer / about 의 한국어 텍스트 = 4~5 단어 ('강대종' + '오픈소스 라이선스' + 'v X.Y.Z (build N)' 등) 정도.
- 의존성 추가 (옵션 1/2) 비용 vs 영어 1 단어 분기 (옵션 3) 비용 비교 시 옵션 3 가벼움.

→ 단 8 앱 i18n 전반 (앱 본문 UI 까지 영어) 진입 = 옵션 1 (Flutter intl) 권장. footer 만 영어 진입 = 옵션 3 OK.

### v2.4 진입 trigger

- 강대종 본인 해외 출시 결정 (App Store 미국 / 일본 / Play Store 글로벌).
- 사이드 앱 중 글로벌 시장 친화 1~2개 선정 (예: 한컵 = 물 추적 / 포모도로 = 타이머 = 도메인 보편).
- footer i18n = 사이드 앱 본문 i18n 의 시작점 (가장 단순한 첫 case).

---

## §4 진입 전제

1. **v2.0 (b+d) + v2.1 (e) + v2.2 (c brand mark) + v2.3 (a monorepo, 선택) 머지**.
2. **8 앱 v1 fan-out 완료**.
3. **강대종 본인 해외 출시 결정** — 어느 사이드 앱 / 어느 시장.
4. **brand mark 통일 (v2.2)** — '강' 한 자 텍스트 = 한국어 hard-coded. 영어 시장 진입 시 brand mark 도 i18n.
5. **사이드 앱 본문 UI i18n 결정** — footer 만 i18n vs 본문 전체 i18n. 본문 결정 시 옵션 1 (Flutter intl) 진입.

### v2.4 fan-out 권장 순서

- footer 만 i18n (옵션 3): 본 spec 머지 → 해외 출시 결정 후 데스크탑 또는 본진 dogfood 1 앱 (예: 한컵 = 글로벌 친화) → 시각 verify → 1~2 앱 fan-out (글로벌 출시 대상 앱만).
- 본문 전체 i18n (옵션 1): 본 spec → 별 spec `8apps-i18n-full.md` v2.4.x 별 sprint.

---

## §5 limitations + 후속

### v2.4 에서 안 함

- **사이드 앱 본문 UI i18n** — footer 만. 본문 = 별 spec / sprint.
- **자동 번역 도구**: 강대종 본인 수동 번역 (영어 1~2 단어). 자동 도구 = 별 sprint.
- **브랜드 가이드 글로벌 통일**: 한국어/영어/일본어 brand 정체성 통일 = v2.2 brand sprint 확장.

### 1.x.x 후속 트랙

- **v2.5 f hidden dev mode** — 데스크탑 본인 디버그 채널 (v2 brainstorm f, 강대종 본인 사용).
- **v2.x = 사이드 앱 본문 UI 영어 i18n** (한컵 / 포모도로 글로벌 출시 시).
- **v3.x = 글로벌 brand 가이드 통일**.

### v2.4 spec 끝나면

- 본 spec 머지 (본진 자율 — 옵션 spec, 머지 ≠ ack).
- 강대종 본인 해외 출시 결정 시점에 형님 ack + 별 사이클 트리거.

---

작성: 2026-05-29 03:42 KST · 🖥 데스크탑 · 야간 오토파일럿 사이클 #22. v2 brainstorm (g) i18n 짧은 deep dive draft. LOW TBD.
