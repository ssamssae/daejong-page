# 8 앱 footer v2.3 — monorepo / 공유 widget package spec draft

데스크탑(🖥) 사이클 #18 산출. v2 brainstorm draft (PR #150 머지) 의 (a) monorepo / 공유 widget package 항목 deep dive. **LOW 우선순위 — 1.0.x 범위 초과 가능성**. 데스크탑 자율 짧은 draft.

**docs only / 외부영향 0**. 머지 ≠ v2.3 트리거 — 1.x.x 안정화 후 진입 결정. 8 앱 footer 트랙 마지막 후보.

전제: v2.0 (b+d) + v2.1 (e) + v2.2 (c brand sprint) 모두 머지 + 안정화 + 5 dogfood 매트릭스 cover (이미 v1.3 완료) + 8 앱 v1/v2 fan-out 완료 후 진입.

---

## §1 동기

### 8 앱 공유 widget 복붙 한계

v1 부터 v2.2 까지 8 앱 widget = `lib/widgets/version_footer.dart` 복붙 + 앱별 컬러 토큰 / 디자인 분기. spec 변경 = 8 앱 fan-out 8 PR.

**누적 사례** (v1.0 → v2.2):
- v1.0 → v1.1 footer 디자인 변경 = 약먹자 1 PR (dogfood).
- v1.1 → v1.2 컬러 우선순위 변경 = 한컵 + 포모도로 + 로또 3 PR.
- v1.2 → v1.3 정정 = 더치페이 1 PR + spec 정정.
- v2.0 → v2.1 → v2.2 = 8 앱 × 3 = 24 PR (각 spec 모두 fan-out 시).

총: 30+ PR (실 dogfood 5 PR + spec PR 11 + fan-out 예상 20+).

→ **spec 변경 빈도 높은 트랙은 복붙 비용 큼**. 단 8 앱 footer 가 자주 변경되는 트랙인가? 사이드 프로젝트 운영 패턴 보면 footer 자체 = 시즌 1~2회 spec 변경 정도. 매주 변경 X.

### monorepo 도입 시 trade-off

monorepo = `ssamssae/brand_kit` 또는 `ssamssae/shared_widgets` 별 repo 도입 후 8 앱 의존성으로 끌어다 씀.

장점:
- spec 변경 1 곳 (별 repo 1 PR) → 8 앱 `flutter pub upgrade` 한 번.
- 신규 앱 onboard 비용 거의 0 (pubspec 추가 1 줄).
- 디자인 시스템 클러스터 5 분류 → constructor parameter 로 통일 (예: `BrandKitTheme.fromCluster(BrandCluster.tossBlue)`).

단점:
- **8 앱 pubspec 변경 = 8 PR** (초기 진입 비용 큼).
- **git ref pinning 관리** — `ref: v0.1.0` semver tag, breaking change 시 8 앱 동시 upgrade.
- **offline 빌드 시 pub get 캐시** 의존 (인터넷 없으면 빌드 X — 1.x.x 단계 영향 작지만 v2.x 빈도 높아짐).
- **CI / fastlane 갱신** — night-builder + submit-app 스킬이 git dep 처리해야.
- **5 dogfood 호환 verify** — 기존 widget 코드 = 별 package 로 추출 시 constructor / parameter 형식 호환성 (현 widget = const, monorepo = factory constructor).

### v2.3 의 위치

**1.0.x 범위 초과 가능성 큼**. 8 앱 footer 가 미래 변경 빈도 높으면 monorepo 진입 가치. 빈도 낮으면 v1.x 그대로 복붙 유지 OK.

→ v2.3 = **시기 미정 long-term 후보** + 1.x.x 트랙. v2.0 ~ v2.2 머지 + 1.x.x 안정화 후 형님 판단.

---

## §2 옵션 3

### 옵션 1: 별 GitHub repo + pub git dependency (가장 가벼움, 권장 1)

```yaml
# 8 앱 pubspec.yaml
dependencies:
  brand_kit:
    git:
      url: git@github.com:ssamssae/brand_kit.git
      ref: v0.1.0  # semver tag
```

별 repo `ssamssae/brand_kit` 구조:
```
brand_kit/
├── lib/
│   ├── brand_kit.dart           # public API
│   ├── version_footer.dart      # VersionFooter widget
│   └── brand_mark.dart          # BrandMark widget (v2.2)
├── pubspec.yaml                 # Flutter package
└── test/
```

장점:
- Flutter 표준 패턴, fan-out 진입 비용 작음 (8 앱 pubspec 1 줄).
- semver tag = 각 앱 독립적 upgrade 시기 결정 가능.
- 별 repo CI = 1 곳 test.

단점:
- 8 앱 pubspec 변경 8 PR (초기).
- ref pinning 관리 = 강대종 본인 semver 관리 룰 필요.

### 옵션 2: melos 기반 monorepo (8 앱 모두 한 repo)

`ssamssae/strap_apps` 라는 단일 monorepo 안에 8 앱 + shared package 동시 관리. melos / melon 같은 dart monorepo 툴 사용.

장점:
- spec 변경 + 8 앱 갱신 1 atomic PR.
- 8 앱 이름 + clone 위치 통합 (5 dogfood clone 도 한 곳).

단점:
- **8 repo → 1 repo 마이그레이션 비용 매우 큼** (PR 히스토리 / 이슈 / dependabot 설정 / CI 설정 + 본진 통합 wiki).
- 1 repo 안 8 앱 = main 충돌 / merge queue 복잡.
- melos 학습 비용.

→ v2.3 진입 시 비추천 (인프라 비용 큼, 가치 못 따라감). 사이드 프로젝트 8 앱 = 독립 운영 디폴트.

### 옵션 3: git subtree (8 앱 안 별 repo subtree)

각 앱 안에 `vendor/brand_kit/` 디렉토리 = subtree pull. spec 변경 시 8 앱 subtree pull 8 번.

장점:
- pubspec 의존성 0 (Flutter 가 직접 디렉토리 import).
- offline 빌드 OK.

단점:
- subtree 명령어 학습 비용.
- 8 앱 subtree 갱신 = 8 PR 또는 8 cherry-pick.
- 효과 = 거의 복붙 그대로.

→ v2.3 비추천. pub git dep (옵션 1) 가 더 가벼움.

---

## §3 추천

### v2.3 권장 = 옵션 1 (별 repo + pub git dep) — 단 시기 미정

- 옵션 1 = 인프라 비용 작음 + Flutter 표준.
- 옵션 2 melos = 비추천 (8 repo 통합 마이그레이션 비용 큼).
- 옵션 3 subtree = 비추천 (학습 비용 vs 복붙 효과 거의 동일).

### 진입 trigger

monorepo 진입 = 8 앱 footer 트랙 변경 빈도 누적해서 결정.

**trigger 후보**:
- 8 앱 footer 가 매월 1+ spec 변경 → 복붙 비용 = monorepo 진입 비용 회수 가능 → 진입.
- 8 앱 footer 가 시즌 1~2회 변경 → 복붙 유지 OK → 진입 보류.

**현 상태 (2026-05-29)**: spec v1.0 → v2.2 까지 1 일 안에 17 사이클 누적 진화. 단 = 사이드 프로젝트 footer 첫 통합 sprint 라 빈도 비정상 높음. 안정화 후 빈도 낮아질 예상.

### 강대종 본인 판단 영역

- 사이드 프로젝트 운영 패턴 = 신규 앱 onboard 빈도 / footer 변경 빈도 = 강대종 본인 통계.
- 1.x.x 안정화 (6개월~1년) 후 monorepo 도입 가치 판단.

---

## §4 진입 전제

1. **v2.0 (b+d) + v2.1 (e) + v2.2 (c brand) fan-out 완료** — 통합 trigger 후보 base.
2. **1.x.x 안정화 6개월~1년** — 빈도 안정 측정.
3. **8 앱 footer 변경 빈도 통계** — 강대종 본인 운영 회고 결과.
4. **새 사이드 앱 onboard 빈도** — 신규 앱 1~2개 추가 후 복붙 비용 vs monorepo 진입 비용 비교.
5. **형님 monorepo 도입 ack** — 비가역 결정 (마이그레이션 후 되돌리기 비용 큼).

### 진입 시 fan-out 권장 순서

monorepo 진입 ack 후:

1. **별 repo `ssamssae/brand_kit` 생성** + 데스크탑 또는 본진 첫 commit (version_footer + brand_mark + 5 클러스터 theme).
2. **v0.1.0 semver tag** + GitHub release.
3. **8 앱 pubspec migration PR** (병렬 fan-out 가능) — git dep 추가 + 기존 `lib/widgets/version_footer.dart` 삭제 + `import 'package:brand_kit/...'` 로 교체.
4. **각 앱 dogfood verify** (analyze / test / merge-gate PASS).
5. **night-builder + submit-app 스킬 갱신** = git dep cache 처리.

---

## §5 limitations + 후속 트랙

### v2.3 에서 안 함

- **8 앱 통합 (옵션 2 melos)**: 8 repo 그대로, brand_kit 만 별 repo.
- **brand_kit 안 i18n** (v2 brainstorm g): brand_kit 자체 i18n 미지원, 8 앱 i18n 라이브러리 따라.
- **brand_kit 안 about dialog**: about dialog 는 8 앱 자체 (v2.0 d), brand_kit 은 widget 만.

### 1.x.x 후속 트랙

- **v2.4 = g i18n** (brand_kit 도입 후 라이브러리 분기 가능).
- **v2.5 = f hidden dev mode** (brand_kit 안 또는 8 앱 자체).
- **v3.x = 사이드 프로젝트 brand 가이드 본문** (color palette + typography + spacing 통일 monorepo 안).

### v2.3 spec 끝나면

- 본 spec 머지 (본진 자율 — 옵션 spec, 머지 ≠ ack).
- **1.x.x 안정화 6개월~1년** 후 형님 진입 ack 결정.
- 진입 결정 시 별 사이클 시작 (예: `specs/brand-kit-v01.md` 별 spec).

---

## §6 비교 표 (v1.0 → v2.3 트랙 정리)

| Spec | 파일 | lines | 우선순위 | trigger 시점 | 의존 |
|------|------|-------|---------|-------------|------|
| v1.0 | 8apps-version-footer.md 본문 v1.0 | 108 → 319 (v1.3) | 즉시 | 머지 끝 | dart-define |
| v1.x | dart-define 빌드 자동화 별 PR | TBD | HIGH | v1 fan-out 후 | mac-mini |
| v2 brainstorm | 8apps-footer-v2-brainstorm.md | 160 | MED | v1 끝 | 형님 후보 픽 |
| v2.0 | 8apps-footer-v20-package-info-about.md | 357 | HIGH | v1 fan-out + 1.0.7 GA | 형님 b+d ack |
| v2.1 | 8apps-footer-v21-license.md | 247 | MED | v2.0 머지 | 형님 A/C 픽 |
| v2.2 | 8apps-footer-v22-brand-mark.md | 245 | MED | v2.1 머지 | 형님 옵션 5 + 강대종 디자인 |
| **v2.3** | **8apps-footer-v23-monorepo.md** | **이 spec** | **LOW** | **1.x.x 안정화 후** | **형님 monorepo 진입 ack** |
| v2.4 | (TBD) i18n | TBD | LOW | v2.3 후 | 영어/일본어 출시 결정 |
| v2.5 | (TBD) hidden dev mode | TBD | LOW | v2.4 후 | 강대종 본인 디버그 채널 |

---

작성: 2026-05-29 03:23 KST · 🖥 데스크탑 · 야간 오토파일럿 사이클 #18. v2 brainstorm 의 (a) monorepo 항목 deep dive draft. LOW 우선순위, 1.x.x 안정화 후 진입 결정.
