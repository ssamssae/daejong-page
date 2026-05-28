# 8 앱 footer v2.5 — hidden dev mode spec draft (짧은)

데스크탑(🖥) 사이클 #23 산출. v2 brainstorm draft (PR #150 머지) 의 (f) hidden dev mode 마지막 항목 짧은 deep dive. **v2.x 트랙 마지막 옵션 — 6 spec 완전 closure**.

**docs only / 외부영향 0**. 머지 ≠ v2.5 트리거 — 강대종 본인 디버그 채널 필요 결정 + 형님 ack.

전제: v2.0 (b+d) + v2.1 (e) + v2.2 (c brand) + v2.3 (a monorepo) + v2.4 (g i18n) 완료. v2.5 = 사이드 채널 — 사용자 노출 0, 강대종 본인 디버깅 용.

---

## §1 동기

### 강대종 본인 디버깅 필요

5 dogfood + 8 앱 운영 중 디버깅 필요 케이스:
- **시각 회귀 디버깅**: brand mark Container 컬러가 클러스터 친족 동일하게 박혔는지 폰 실디바이스에서 확인.
- **버전 mismatch 추적**: pubspec version vs Info.plist/AndroidManifest 일치 verify.
- **API key / 환경 변수 검증**: dart-define / firebase_options 값 확인.
- **캐시 / 로컬 데이터 인스펙트**: SharedPreferences / Hive box 내용 직접 확인.

기존 패턴:
- print/debugPrint = console 만, 폰 단독 디버깅 시 보이지 않음.
- DevTools = 개발 머신 + 디바이스 연결 필요.
- 폰 단독 디버깅 = 별 hidden UI 필요.

### v2.5 의 위치

사용자 가치 0 (사용자 노출 0). 강대종 본인 도구. v2.x 트랙 마지막 옵션 = 모든 사용자 가치 트랙 (v2.0~v2.4) 진행 후 후속.

---

## §2 옵션

### 옵션 1: footer N회 연속 탭 (예: 5~7회) → dev mode 진입

```dart
class _VersionFooterState extends State<VersionFooter> {
  int _tapCount = 0;
  DateTime? _lastTap;

  void _onTap() {
    final now = DateTime.now();
    if (_lastTap != null && now.difference(_lastTap!) > const Duration(seconds: 2)) {
      _tapCount = 0;  // 2초 안 연속 탭만 카운트
    }
    _lastTap = now;
    _tapCount++;

    if (_tapCount >= 5) {
      _tapCount = 0;
      Navigator.push(context, MaterialPageRoute(builder: (_) => const DevModeScreen()));
    }
  }
  ...
}
```

장점: 사용자 노출 0 (5회 탭 = 우발 사용 거의 X). 코드 단순 (footer 자체).
단점: 본진/맥미니 simulator QA 시 dev mode 자체 회귀 검증 어려움 (5 탭 자동화 필요).

### 옵션 2: footer 길게 누름 (long press, 3~5초) → dev mode

```dart
GestureDetector(
  onTap: ...,  // v2.0 d about dialog
  onLongPress: () { ... show DevModeScreen ... },
  child: VersionFooter(),
)
```

장점: 사용자 노출 거의 0 (long press = 우발 트리거 작음). 회귀 검증 간단 (1 액션).
단점: about dialog (v2.0 d 옵션 D-1 footer 탭) 와 동시 사용 시 onTap + onLongPress 동시 박힘 — 사용자 UX 혼란 가능.

### 옵션 3: 특별 조합 (예: footer 동시 + appBar 동시 탭, 또는 비밀번호)

```dart
// 비밀번호 입력 화면 (debug build only)
if (kDebugMode) {
  showDialog(context: context, builder: (_) => DevModePasswordDialog());
}
```

장점: 가장 안전 (강대종 본인 만 진입). debug build 만 박혀 release 사용자 영향 0.
단점: 복잡, 진입 비용 큼.

---

## §3 추천

### v2.5 권장 = 옵션 2 (long press) — 단 v2.0 d 옵션 D-1 footer 탭 진입 했을 때만

조건:
- v2.0 d 옵션 D-1 (footer 탭 → about dialog) 채택 시 → 옵션 2 (long press → dev mode) 동시 박기 가능.
- v2.0 d 옵션 D-2 (appBar action → about) 채택 시 → footer 진입 없음 → 옵션 1 (5 탭) 권장.

이유:
- 옵션 2 = GestureDetector 의 onTap + onLongPress 별 핸들러 분리. 코드 단순.
- 옵션 1 = 5 탭 카운터 + 2초 timeout 추가 코드. 약간 복잡.

### v2.5 진입 trigger

- 강대종 본인 디버깅 필요성 누적 (예: brand mark v2.2 시각 회귀 / version mismatch / 캐시 검증) 시.
- 사이드 채널 형식 = 사용자 가치 트랙 (v2.0~v2.4) 완료 후 후속.

---

## §4 진입 효과 (DevModeScreen 내용)

DevModeScreen 의 표시 항목 후보:

| 항목 | 출처 | 비고 |
|------|------|------|
| Package info | `PackageInfo.fromPlatform()` (v2.0 b) | appName / version / buildNumber / packageName |
| dart-define values | `String.fromEnvironment('APP_VERSION', ...)` 등 | 빌드 시 주입된 env |
| 디자인 토큰 | `AppColors.textTertiary` / `textFaint` 등 | 클러스터 친족 확인 |
| Theme.of(context) | `Theme.of(context).colorScheme` 등 | 시각 회귀 |
| SharedPreferences | `getAll()` | 키-값 inspect |
| Hive boxes | `Hive.box<Memo>('memos').values` 등 | 메모요 / 약먹자 / 한컵 등 |
| API key | environment 또는 firebase_options | 빌드 별 다른지 |
| Cache 클리어 | `setState` 또는 navigate-back | 토큰 / SharedPrefs 리셋 |
| Force re-render | `setState` | 디자인 회귀 즉시 확인 |

8 앱 공통: Package info / dart-define / 디자인 토큰 / Theme 표시.
앱별 customize: SharedPreferences / Hive 박힌 항목 (앱별 다름).

### debug build 만 vs release build

- 디폴트 = `kDebugMode` 만 박힘. release build = dev mode 진입 X.
- 단 강대종 본인 release build 폰 디버깅 시 = `kProfileMode` 또는 별 flag (예: dart-define DEV_MODE=true) 추가.

---

## §5 limitations + 후속

### v2.5 에서 안 함

- **8 앱 공통 DevModeScreen widget**: 8 앱 복붙 (옵션 1) 또는 monorepo 추출 (옵션 2 = v2.3 a 후 진입 가능).
- **클라우드 디버그 데이터 전송**: dev mode 정보 클라우드 서버 전송 = 별 sprint (privacy 영향).
- **Crashlytics / Sentry 통합**: 별 트랙.
- **A/B 테스트 toggle**: 별 트랙.

### 1.x.x 후속 트랙

- **v3.x = 사이드 프로젝트 디버깅 인프라 통합** — DevModeScreen 공통화 + 클라우드 디버그 + Crashlytics.
- **v4.x = 사이드 프로젝트 advanced features** — A/B / push notification / analytics 통합.

### v2.5 spec 끝나면

- 본 spec 머지 (본진 자율 — 옵션 spec).
- 강대종 본인 디버깅 필요성 명확화 시 형님 ack + 별 사이클.

---

## §6 v2.x 트랙 closure

본 v2.5 = v2.x 트랙 6 spec (brainstorm + v2.0 + v2.1 + v2.2 + v2.3 + v2.4 + v2.5) 마지막. v2.x 후보 7 (a/b/c/d/e/f/g) 중:
- HIGH: b + d (v2.0)
- MED: c (v2.2), e (v2.1)
- LOW: a (v2.3), g (v2.4), f (v2.5)
- 모두 spec 작성 완료.

**v2.x 트랙 닫힘**. 다음 = 1.x.x 안정화 + v2.0 fan-out 진입 (형님 ack 후).

---

작성: 2026-05-29 03:45 KST · 🖥 데스크탑 · 야간 오토파일럿 사이클 #23. v2 brainstorm (f) hidden dev mode 마지막 짧은 deep dive. v2.x 트랙 6 spec closure.
