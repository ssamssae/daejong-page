# 8 앱 footer 통일 트랙 — INDEX SoT

2026-05-29 데스크탑(🖥) 야간 오토파일럿 17 사이클 누적 산출 INDEX. 사이클 #19 closure SoT. 형님 / 본진 / 노드들이 8 앱 footer 트랙 진입 시 첫 entry point.

**상태**: spec 본문 + brainstorm + v2.0~v2.3 deep dive 4 + dogfood 5 = **닫힘 (1.x.x 안정화 대기)**. 형님 v1 fan-out 잔여 + v2.x 트리거 ack 큐.

---

## 17 사이클 회고 표 (2026-05-29 01:12 → 03:25 KST, 2h13m)

| 사이클 | 산출 | PR | lines | 키 발견 |
|--------|------|-----|-------|---------|
| #1 | yakmukja v1 dogfood | ssamssae/yakmukja#14 ✅ | widget 22 + test 15 | 첫 dogfood F1~F4 4 마찰점 surface |
| #2 | spec v1 본문 | daejong-page#143 ✅ | 108 | spec 초안 |
| #3 | (yakmukja 사이클 #1 = #3 = 같음 - 사이클 번호 보정) | ↑ | | |
| #4 | spec v1.1 (F1~F4 반영) | daejong-page#144 ✅ | +52 | broader pattern + 3 패턴 분기 + 노드별 빌드 게이트 |
| #5 | hankeup v1.1 dogfood | ssamssae/hankeup#1 ✅ | widget 22 + test 15 | A 패턴 검증 + GC1~GC4 generality |
| #6 | spec v1.2 (GC1+GC2) | daejong-page#146 ✅ | +40 -14 | fan-out 가정 제거 + audit grep robust |
| #7 | pomodoro v1.2 dogfood | ssamssae/pomodoro#2 ✅ | widget 22 + test 15 | A 재현성 입증 (한컵 동일 디자인 시스템) |
| #8 | lotto v1.2 dogfood + v1.2.1 매핑 | ssamssae/lotto-calc#20 ✅, daejong-page#147 ✅ | widget 25 + test 15 + spec +20 -17 | hintColor fallback 첫 검증 + 3 컬러 × 2 위치 매트릭스 cover |
| #9 | baseline audit 4 앱 (v1.2.2) | daejong-page#148 ✅ | +35 -8 | B' sub-pattern 신규 발견 |
| #10 | dutchpay v1.2.2 B' dogfood | ssamssae/dutch_pay_calculator#10 ✅ | widget 22 + test 15 | B'-1 채택 + baseline #148 정정 4건 surface |
| #11 | spec v1.3 (정정 묶음 + 클러스터 표) | daejong-page#149 ✅ | +54 -19 | GC7 main FF / GC8 B' broader / 디자인 클러스터 5 분류 |
| #12 | 5 clone cleanup | (no PR, local) | — | 5 작업 브랜치 -D + remote prune + 549MB 보존 + /tmp 33MB 해방 |
| #13 | v2 brainstorm 7 후보 | daejong-page#150 ✅ | +160 | HIGH b+d 권장 + MED c+e + LOW a+f+g |
| #14 | v2.0 b+d spec deep dive | daejong-page#151 ✅ | +357 | package_info_plus + about dialog, B-clean + D-1 권장 |
| #15 | 본인 메모 정리 2 PR | claude-memory#2 🔴, claude-skills#87 🔴 | +49 +57 | feedback_baseline_audit_main_ff + dogfood_iterative_spec_refinement + 사고 카탈로그 |
| #16 | v2.1 e LicensePage spec | daejong-page#152 ✅ | +247 | A 단독 / C 묶음 옵션 |
| #17 | v2.2 c brand mark sprint spec | daejong-page#153 ✅ | +245 | 옵션 5 (텍스트 강 + brand 컬러) 권장, 강대종 본인 디자인 결정 의존 |
| #18 | v2.3 a monorepo spec | daejong-page#154 ✅ | +199 | LOW 시기 미정, 1.x.x 안정화 후 |
| **#19** | **본 closure INDEX SoT** | **daejong-page#TBD** | **이 파일** | **8 앱 footer 트랙 닫힘** |

**총: 11 daejong-page PR (1 머지 대기) + 5 dogfood PR + 2 claude 메모리 PR (머지 대기) = 18 PR**.

---

## 9 spec 파일 INDEX

### v1 본문 + 보조 spec

| 파일 | 우선순위 | 상태 | 사이클 |
|------|----------|------|--------|
| [`8apps-version-footer.md`](./8apps-version-footer.md) | HIGH | ✅ v1.3 머지 (319 lines) | #2/#4/#6/#8/#9/#11 |
| [`hanjul-footer-migration-plan.md`](./hanjul-footer-migration-plan.md) | HIGH | ✅ 본진 산출 #145 머지 | (본진) |

### v2.x deep dive

| 파일 | 우선순위 | 상태 | 사이클 |
|------|----------|------|--------|
| [`8apps-footer-v2-brainstorm.md`](./8apps-footer-v2-brainstorm.md) | MED | ✅ 머지 (160 lines) | #13 |
| [`8apps-footer-v20-package-info-about.md`](./8apps-footer-v20-package-info-about.md) | **HIGH** | ✅ 머지 (357 lines) — 형님 픽 대기 | #14 |
| [`8apps-footer-v21-license.md`](./8apps-footer-v21-license.md) | MED | ✅ 머지 (247 lines) — 형님 픽 대기 | #16 |
| [`8apps-footer-v22-brand-mark.md`](./8apps-footer-v22-brand-mark.md) | MED | ✅ 머지 (245 lines) — 형님 픽 + 강대종 디자인 대기 | #17 |
| [`8apps-footer-v23-monorepo.md`](./8apps-footer-v23-monorepo.md) | LOW | ✅ 머지 (199 lines) — 1.x.x 안정화 후 | #18 |

### v2.4 / v2.5 (TBD LOW)

- **v2.4 g i18n** — 영어/일본어 출시 결정 시 별 spec draft.
- **v2.5 f hidden dev mode** — 강대종 본인 디버그 채널 강화 시 별 spec draft.

---

## 5 dogfood 매트릭스 (3 컬러 × 3 위치 완전 cover)

| # | 사이클 | 앱 | 위치 패턴 | 컬러 케이스 | hex / fallback | PR |
|---|--------|-----|----------|-------------|---------------|-----|
| 1 | #3 | 약먹자 (yakmukja) | **B** (bottomNavBar Column wrap) | textFaint | `0xFF9CA3AF` | ssamssae/yakmukja#14 ✅ |
| 2 | #5 | 한컵 (hankeup) | **A** (bottomNavBar 직접) | textTertiary (Toss) | `0xFF8B95A1` | ssamssae/hankeup#1 ✅ |
| 3 | #7 | 포모도로 (pomodoro) | A | textTertiary (Toss) | `0xFF8B95A1` | ssamssae/pomodoro#2 ✅ |
| 4 | #8 | 로또 (lotto-calc / randompick) | A | hintColor fallback | `Theme.of(context).hintColor` | ssamssae/lotto-calc#20 ✅ |
| 5 | #10 | 더치페이 (dutch_pay_calculator) | **B'** (bottomNavBar 직접 + body inline ads 보존) | textFaint | `0xFF9CA3AF` (약먹자 동일) | ssamssae/dutch_pay_calculator#10 ✅ |

**디자인 시스템 클러스터 5 분류** (v1.3 신설):
- **A**: app_theme.dart 디렉토리 + textFaint → 약먹자, 더치페이 (인디고 친족, 형제 디자인 시스템 app_theme.dart 주석 명시)
- **B**: theme.dart 단일 + textTertiary (Toss) → 한컵, 포모도로
- **C**: theme.dart 단일 + textTertiary + brand/brandDeep → 한줄일기 (A + C migration 듀얼)
- **D**: AppColors X (minimal Material 3) → 로또
- **E**: re-verify 필요 (사이클 #9 baseline stale 위험) → 메모요

---

## 형님 ack 큐 통합 (우선순위 ordered)

### v1 fan-out 잔여 3 (즉시 진입 가능)

1. **🍎 본진 한줄일기 migration** — patternC, plan PR #145 head. textTertiary 픽 추정. 클러스터 C.
2. **🍎 본진 메모요** — **main FF + audit re-run 필수** (사이클 #9 stale row 위험, v1.3 명시). 클러스터 E (re-verify).
3. **🏭 맥미니 단어요** — textTertiary 추정. 클러스터 B 친족 (한컵/포모 동일 Toss).

### v2.x 형님 픽 결정 큐

4. **v2.0 b+d 트리거 ack** — `specs/8apps-footer-v20-package-info-about.md` 검토 후 진입 결정.
5. **v2.1 옵션 픽** — A 단독 (v2.0 후 별 사이클) vs C 묶음 (v2.0 PR 본문 1줄 추가).
6. **v2.2 brand mark 옵션 픽** — 권장 옵션 5 (텍스트 강 + brand 컬러). **+ 강대종 본인 디자인 결정** (Container 모양 / 폰트 / 컬러).
7. **v2.3 monorepo 진입 결정** — 1.x.x 안정화 6개월~1년 후 별 사이클.

### 빌드 자동화 별 PR (HIGH, 맥미니 영역)

8. **dart-define APP_VERSION 빌드 자동화** — mac-mini night-builder + submit-app 스킬 갱신. v1 spec 마지막 step 4 / v2.0 옵션 B-clean 동시.

### 메모리 / 카탈로그 PR 머지 큐

9. **PR ssamssae/claude-memory#2** — feedback 2 entry (baseline_audit_main_ff + dogfood_iterative_spec_refinement).
10. **PR ssamssae/claude-skills#87** — issue 카탈로그 1 (cycle9 stale main prediction).

### 본 PR (사이클 #19 closure)

11. **PR ssamssae/daejong-page#TBD** (본 PR) — closure INDEX SoT.

---

## 다음 fan-out 진입 SoT entry point

새 노드가 8 앱 footer 트랙 진입 시:

1. **본 INDEX** 읽고 사이클 회고 + 형님 ack 큐 확인.
2. **v1 fan-out**: [`8apps-version-footer.md`](./8apps-version-footer.md) v1.3 본문 spec 따라. fan-out 절차 step 0 = main FF 의무 (GC7) + 클러스터 매핑 표 verify.
3. **v2.0 fan-out**: [`8apps-footer-v20-package-info-about.md`](./8apps-footer-v20-package-info-about.md) §2 트랙 B + §3 트랙 D 따라. **형님 트리거 ack 후만**.
4. **v2.1/v2.2/v2.3**: 본 INDEX 표의 우선순위 + 의존 따라 순차 진입.

### v1 fan-out 핵심 룰

- **클러스터 친족 재현성** — 같은 클러스터 앱 fan-out 시 토큰/패턴 픽 결과 동일 (한컵 ≈ 포모도로 / 약먹자 ≈ 더치페이).
- **B' sub-pattern** (v1.3 GC8) — ads 가 bottomNavigationBar 슬롯이 아닌 body 안 inline 박힌 케이스. B'-1 (bottomNavigationBar 직접 + body inline ads 보존) 권장.
- **F3 노드별 빌드 게이트** — Android SDK 있는 노드 (mac/맥미니) = APK + test, SDK 없는 노드 (wsl/desktop/notebook) = `flutter test --dart-define` 만으로 OK.

---

## 17 사이클 누적 통계 (참고)

- **spec 본문 lines (8 apps footer 만)**: 1527 (v1 319 + brainstorm 160 + v2.0 357 + v2.1 247 + v2.2 245 + v2.3 199).
- **claude-memory + claude-skills 추가** (사이클 #15): +49 + 57 = 106.
- **총 lines**: 1633.
- **agent-inbox 보고**: 18 JSON (사이클 #1~#18).
- **mac-report**: 18 통 (자동 본진 paste + mirror chain).
- **외부영향**: 0 (모두 docs / 코드 + test, 스토어 업로드 X / 외부 API 호출 X / 비가역 X).
- **머지 PR**: 11 daejong-page + 5 dogfood = 16 머지. 잔여 3 PR (#TBD closure / claude-memory#2 / claude-skills#87) + 머지 큐 대기.

---

## 후속 트랙 reservation (사이클 #20+ 후보)

8 앱 footer 트랙 닫힘 후 데스크탑 자율 픽 후보:

- **candidate_C**: 다른 사이드 앱 1.0.9 후보 spec brainstorm (메모요 외 다른 앱 후속).
- **candidate_D**: 데스크탑 본인 .claude/ 자율 정리 추가 라운드 (사이클 #15 와 비슷).
- **candidate_E**: 사이클 #15-#18 작업 브랜치 cleanup (5 작업 브랜치 -D + remote prune).
- **candidate_F**: idle 진입 — §8 룰 위반, 자율 후보 1~2개 픽 후 진입 권장.
- **candidate_G**: v2.4 i18n 또는 v2.5 hidden dev mode 짧은 draft (필요 시).

→ 디폴트 = candidate_E (cleanup, 가역 + 외부영향 0) → candidate_C (브레인스토밍) → idle 진입.

---

작성: 2026-05-29 03:28 KST · 🖥 데스크탑 · 야간 오토파일럿 사이클 #19. 8 앱 footer 트랙 closure SoT.
