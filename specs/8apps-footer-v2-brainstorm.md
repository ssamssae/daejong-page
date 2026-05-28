# 8 앱 footer v2 brainstorm draft

데스크탑(🖥) 사이클 #13 산출. v1 (specs/8apps-version-footer.md 1.0 → 1.3) 5 dogfood 사후 회고 + v2 후보 정리.

**docs only / 외부영향 0 / 형님 ack 전엔 후속 spec 진입 X**.

---

## §1 v1 회고 (5 dogfood 후 인사이트)

### v1 의 결실

- **5 dogfood 매트릭스 완전 cover** (사이클 #3/#5/#7/#8/#10): A × 3 (한컵/포모도로/로또) + B × 1 (약먹자) + B' × 1 (더치페이) + C TBD (한줄일기 본진 plan PR #145).
- **3 컬러 케이스 검증** — `textTertiary` × 2 (Toss 스타일) + `textFaint` × 2 (인디고 스타일) + `hintColor fallback` × 1 (minimal Material 3).
- **B' sub-pattern 신규 도입** (사이클 #9 baseline audit 발견, 사이클 #10 더치페이 dogfood 검증) — ads 가 body 안 inline 박힌 케이스.
- **디자인 시스템 클러스터 5 분류** (사이클 #11 v1.3) — A app_theme.dart+textFaint / B theme.dart+textTertiary Toss / C theme.dart+textTertiary+brand A+C migration / D AppColors X minimal Material 3 / E re-verify.
- **사후 정정 GC 누적** — GC1 fan-out 가정 / GC2 audit grep robust / GC3 import path OK / GC4 패턴 A 직접 OK / GC5 minimal Material 3 hintColor fallback / GC6 ads 위치 audit / GC7 baseline main FF 의무 / GC8 B' 정의 broader.
- **노드별 work 단축** — baseline audit 도입 후 평균 3분 → 1.5분 (audit 데스크탑이 미리).
- **친족 fan-out 재현성** — 약먹자 ≈ 더치페이 (textFaint, ads, app_theme.dart) / 한컵 ≈ 포모도로 (textTertiary, lib/theme.dart 단일) 클러스터로 토큰/패턴 픽 결정 가능.

### v1 의 한계 (v2 후보 동기)

- **brand mark = "강대종" 한 줄 텍스트** — 시각적 brand 통일 부족, 시리즈 인식 효과 약함.
- **about / 라이선스 / 피드백 진입점 0** — footer 클릭 X, 사용자가 "이 앱 누가 만들었지" 알아보기 어려움.
- **dart-define APP_VERSION 수동 주입** — 빌드 자동화 (mac-mini night-builder, submit-app 스킬) 가 명령어에 박아넣어야. 누락 시 `vdev` 표시.
- **package_info_plus 미사용** — 스토어 정책 변화 시 (스토어 메타 vs runtime version 일치 요구) 대응 어려움.
- **공유 widget 8 앱 복붙** — spec 변경 시 8 PR (실제론 7 — 본진/노드 분배) 필요. monorepo / 별 package 미지원.
- **i18n 미지원** — "강대종" 한국어 박힘, 영어/일본어 출시 시 hard-coded 문제.
- **footer 시각 검증 0건** — 5 dogfood 모두 widget test 만, 실 디바이스 시각 verify 본진/맥미니 follow-up 대기.

---

## §2 v2 후보 (7개)

### (a) monorepo / 공유 widget package 추출

**의도**: 8 앱 의 `lib/widgets/version_footer.dart` 를 별 repo (예: `ssamssae/shared_widgets` 또는 `ssamssae/brand_kit`) 에 박고 8 앱 pubspec 에 git dependency 로 끌어다 씀. spec 변경 1 곳 → 8 앱 자동 sync (pub get + dart-define 재주입).

**구조 옵션**:
- **A-1 single repo monorepo (melos)** — 8 앱 + shared_widgets 한 repo 안. melos 또는 melon 으로 multi-package. 진입 비용 큼.
- **A-2 별 git repo + pub git dep** — `dependencies: shared_widgets: git: url: ..., ref: v0.1.0` 형식. 8 앱 pubspec 만 변경. 진입 비용 작음 (권장).

**trade-off**:
- 장점: spec 변경 1 곳, 클러스터 친족 (textFaint vs textTertiary vs hintColor) constructor parameter 로 분기 가능. 신규 앱 onboard 비용 거의 0.
- 단점: 8 앱 pubspec 변경 = 8 PR. git ref pinning 관리 (semver 인접 release). offline 빌드 시 pub get 캐시 의존. 컬러 토큰 분기 = constructor parameter 가 5 클러스터 다 cover 해야.

### (b) package_info_plus 마이그레이션

**의도**: `String.fromEnvironment('APP_VERSION')` → `PackageInfo.fromPlatform().version`. 빌드 시 dart-define 주입 X, runtime 에 pubspec/Info.plist/AndroidManifest 자동 픽업.

**trade-off**:
- 장점: 빌드 명령어 단순화. 스토어 정책 (메타 vs runtime version 일치) 대응. drift 0.
- 단점: 의존 추가 (package_info_plus). FutureBuilder 또는 async StatefulWidget 필요 (현 const widget 깨짐). first paint 시 'vdev' 깜빡임 가능.

### (c) brand mark 시각 통일

**의도**: middle dot + "강대종" 한 줄을 brand mark 로 업그레이드.

**서브 옵션**:
- **c-1 작은 SVG/PNG 로고** — 강대종 이니셜 (예: `kdj` 또는 `K·`) 모노그램 아이콘.
- **c-2 통일 이모지** — `🐝` (꿀벌) / `⭐` (별) / `🌱` (씨앗) 등 사이드 프로젝트 brand. 한 글자 텍스트 그대로.
- **c-3 통일 brand 컬러** — 토큰 강제 (현 클러스터 5 분류 vs v2 통일).

**trade-off**:
- 장점: 시리즈 인식 강화. 사용자가 한눈에 "강대종 시리즈" 알 수 있음.
- 단점: 클러스터 5 디자인 시스템과 충돌 (예: 약먹자 인디고 vs 한컵 토스 블루 — 공통 brand 컬러가 둘 다 박힐 수 없음). brand 가이드 자체 별 sprint 필요.

### (d) about dialog

**의도**: footer 탭 → 앱 이름 / version / 개발자 (강대종) / 피드백 링크 / 회사 사이트 / 라이선스.

**구조**:
- Flutter 의 `showAboutDialog` 활용 (LicensePage 자동 연동).
- 또는 자체 BottomSheet 디자인.

**trade-off**:
- 장점: 사용자 가치 즉시 (피드백 채널 / 강대종 시리즈 사이트 노출). 표준 Flutter 위젯 사용 시 spec 단순.
- 단점: 8 앱 통일 디자인 vs 앱별 디자인 시스템 충돌. 회사 사이트/피드백 URL 관리.

### (e) license 표시 (LicensePage)

**의도**: pubspec dependencies 라이선스 자동 generate (Flutter 기본 `LicensePage` 사용).

**trade-off**:
- 장점: 컴플라이언스 (open source 라이센스 표시 의무 일부). about dialog 와 자연 통합.
- 단점: 8 앱 모두 자동 generate 되지만, 앱별로 dependencies 다름 (yakmukja 만 google_mobile_ads, 한컵 만 shared_preferences 등). 사용자 가치는 낮음.

### (f) footer 클릭 액션 (탭 → about / dev mode toggle)

**의도**:
- 단일 탭 = about dialog open.
- 3회 또는 5회 연속 탭 = hidden dev mode (예: log level toggle, debug overlay).

**trade-off**:
- 장점: hidden 자기 디버그 채널. 사용자 노출 0 (about 만 노출).
- 단점: 사용자가 탭 동작 발견하면 의도와 다른 사용. hidden dev mode = 공식 사용자 가치 0 (강대종 본인 디버그 용).

### (g) i18n (다국어 footer)

**의도**: "강대종" hard-coded → `AppLocalizations.of(context).brandName` 로 추출. 영어/일본어 출시 시 'Daejong Kang' / '강대종 (강대종)' 등 자연 번역.

**trade-off**:
- 장점: 8 앱 i18n 진입점 통일. brand 이름이 i18n 첫 string 케이스.
- 단점: 8 앱 중 i18n 적용된 곳 = 한컵/한줄 등 일부, 나머지는 i18n 미지원. v2 trigger 가 i18n 적용 fan-out 강제.

---

## §3 우선순위 ranking + 사유

### HIGH (즉시 사용자 가치 + 스토어 정책 대응)

| 후보 | 사유 |
|------|------|
| **(b) package_info_plus** | 스토어 정책 변화 시 즉시 대응 필요. 빌드 명령어 단순화 자체 가치도 큼. 의존 추가 1개 trade-off 작음 |
| **(d) about dialog** | 사용자 가치 즉시 (피드백 채널, 개발자 인식). 사이드 프로젝트 시리즈 인식 강화 |

### MED (시리즈 정체성 + 컴플라이언스)

| 후보 | 사유 |
|------|------|
| **(c) brand mark 시각 통일** | 시리즈 인식 강화. 단 5 클러스터 디자인 시스템과 충돌 — brand 가이드 별 sprint 후 진행 |
| **(e) license LicensePage** | 컴플라이언스 일부 (오픈소스 라이센스 표시). about dialog (d) 와 자연 통합 |

### LOW (인프라 비용 vs 직접 가치, 또는 v1.x 범위 초과)

| 후보 | 사유 |
|------|------|
| **(a) monorepo / 공유 widget** | 인프라 비용 큼 (8 앱 pubspec PR, git ref pinning, offline 캐시). 5 dogfood 결과 — 각 앱 widget 복붙 cost 분당 1-2분 X 8 = 8-16분, 1 회만. monorepo 진입은 spec 변경 빈도 높을 때만 가치. 현 사이클 빈도 낮음 → LOW |
| **(f) footer 클릭 액션** | 사용자 가치 낮음 (hidden dev mode = 강대종 본인 디버그). about dialog (d) 단일 탭 = HIGH 와 함께 처리하면 OK |
| **(g) i18n** | 1.0.x 범위 초과. 영어/일본어 출시 결정 시 별 sprint. v2 footer 만 i18n 진입 = i18n 라이브러리 전 앱 통합 필요라 비용 큼 |

### 최종 권장 순서

1. **v2.0 = b + d 묶음 PR** (package_info_plus + about dialog 동시 진입, 약 8 앱 fan-out 2회).
2. **v2.1 = e (LicensePage)** — about dialog 안에 link.
3. **v2.2 = c brand 가이드 별 sprint** 후 통일 brand mark.
4. **v2.3+** = a / f / g — v2.0~v2.2 끝나고 결정.

---

## §4 v2 진입 전제

1. **v1 7 노드 fan-out 완료** — 메모요/단어요/한줄 (잔여 3) 본진/맥미니 머지 + dogfood baseline 검증.
2. **1.0.7 메모요 GA PASS** — 1.0.8 트랙과 v2 동시 진행 충돌 회피.
3. **8 앱 footer 시각 verify 완료** — 폰 실디바이스 1회 (M1 본진/맥미니 simulator 또는 실기) 후 v2 진입.
4. **brand 가이드 별 sprint** (c 후보 진입 전제) — 5 클러스터 디자인 시스템 충돌 해결 룰.
5. **dart-define APP_VERSION 빌드 자동화 별 PR** (v1 spec 마지막 step 4) — 8 앱 머지 후 mac-mini night-builder / submit-app 스킬 갱신.

---

## §5 다음 단계

- 형님 ack 후 후보 선정 + 별 spec deep dive.
- 우선 권장 = **v2.0 = b + d 묶음** 별 spec (예: `specs/8apps-footer-v2-package-info-about.md`).
- v2 진입 전엔 본 brainstorm 머지 / 본진 또는 데스크탑 별 사이클 v2.0 spec draft.
- candidate 별 dogfood 노드 분배 = v1 클러스터 표 그대로 (한컵/포모도로 = Toss / 약먹자/더치 = 인디고 클러스터 친족 동일 fan-out).

---

작성: 2026-05-29 02:55 KST · 🖥 데스크탑 · 야간 오토파일럿 사이클 #13. v1 (5 dogfood + spec v1.3) 사후 회고 + v2 7 후보 정리.
