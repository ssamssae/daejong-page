# 5노드 Flutter SDK 정책 v1 — 옵션 1(fvm) vs 옵션 2(게이트) 결정 매트릭스

**Status**: 🟡 draft · 형님 ack + trio-vote 펜딩 (결정 아닌 비교)
**Author**: 🪟 WSL / 2026-05-29 KST (낮 오토 cycle #4)
**Parent**: `simple_memo_app/docs/specs/5node-flutter-sdk-policy-brainstorm.md` (PR #35, v2) — 옵션 3(B그룹 cron) 포함 풀 옵션·근거. 본 문서는 그 위에서 **옵션 1 vs 옵션 2** 만 결정 매트릭스로 압축.
**Cycle entry**: 1.0.7 cascade (PR #23→#28→#34→#39→#41, 4회 회귀) + cycle #2 WSL SDK skew 사고 후속.

---

## 0. 의도

본진 directive 가 옵션 1(fvm 통일) vs 옵션 2(merge-gate SDK cross-check) 두 안의 **비용/회귀가능성/롤백/유지보수/5노드영향** 5축 비교를 요청. 옵션 3(B그룹 cron audit, brainstorm v2 의 디폴트 픽)은 parent brainstorm 소관으로 두고, 본 문서는 "게이트 전 false negative 0" 을 보장하는 두 안만 다룬다.

---

## 1. ⚠️ audit 정정 — 5노드는 3개 SDK 버전 (brainstorm v2 표 stale)

brainstorm v2 §1 표는 WSL=3.44.0(A그룹)으로 기록했으나 **사실 충돌**. cycle #2 실측 + 본진 cycle #2 ack 로 확정:

| 노드 | Flutter | 그룹 | 근거 |
|------|---------|------|------|
| 🍎 본진 | **3.44.0** | A (new, onReorderItem 有) | 본진 cycle #2 ack verify |
| 🏭 맥미니 | 3.41.9 | B (strict) | 본진 audit ssh |
| 💻 노트북 | 3.41.9 (fvm) | B (strict) | 본진 audit ssh |
| 🪟 WSL | **3.41.7** | B' (B보다 구버전) | cycle #2 `flutter.version.json` 실측 (onReorderItem count 0) |
| 🖥 데스크탑 | 없음 | C (no flutter) | 본진 audit ssh |

**핵심 정정**: A 그룹은 **본진 단독** (brainstorm 의 "본진+WSL=A" 는 틀림). 실제로는 **3개 버전(3.44.0 / 3.41.9 / 3.41.7) + flutter 없음 1대**. WSL 이 3.41.7 로 B(3.41.9)보다도 구버전이라 skew 표면이 brainstorm 가정보다 넓다 → SDK 통일/게이트 필요성이 오히려 강화됨. (brainstorm v2 가 self-cross-check 정보 0 이라 본 WSL 오기를 못 잡은 것 = 좁은 가정의 대표 사고.)

---

## 2. 두 안 요약

- **옵션 1 — fvm 통일**: 5노드(또는 flutter 사용 4노드)에 fvm 도입 + repo `.fvmrc` 로 SDK pin. 게이트는 fvm 활성 SDK 로 실행. → 단일 SDK = analyzer 결과 deterministic.
- **옵션 2 — merge-gate cross-check**: `~/claude-skills/autopilot/merge-gate.sh` 가 PASS 전 2번째(strict) SDK 도 호출. sub: (2a) B그룹 노드 ssh 1회, (2b) 게이트 머신 로컬 fvm 으로 strict SDK 추가 설치.

---

## 3. 결정 매트릭스 (요청 5축)

| 축 | 옵션 1 (fvm 통일) | 옵션 2 (게이트 cross-check) |
|----|------------------|----------------------------|
| **비용 (첫 도입)** | 높음 — 4노드 fvm install + per-repo bootstrap + 데스크탑 onboard, 디스크 ~2GB×버전, ~3h | 중 — merge-gate.sh 1파일 패치. 2a=ssh 설정 / 2b=게이트 머신 strict SDK 1회 install(~30분) |
| **비용 (매 머지)** | 0 (게이트 그대로) | +10~30s (2a ssh round-trip ~30s / 2b 로컬 analyze +10s) |
| **회귀가능성 (머지 전 catch)** | ✅ 0 (단일 SDK, skew 원천 제거) | ✅ 0 (cross-SDK 게이트가 A↔B 차이 항상 catch) |
| **롤백** | 중 — `.fvmrc` revert + 노드별 fvm 상태 복구 필요(노드별 손). 통일 버전 잘못 고르면 재pin 비용 | 쉬움 — merge-gate.sh 단일 파일 revert 1커밋. 노드 환경 무변경이라 즉시 |
| **유지보수** | 낮음(정상시) — SDK 업그레이드 = `.fvmrc` 한 줄 커밋. 단 fvm·flutter clone(WSL `~/flutter` git 기반) 통합 검증 필요 | 중 — 2a=ssh/네트워크 의존(노드 다운/차단 시 게이트 fail=silent fail 위험). 2b=게이트 머신에 strict SDK 상시 유지. "2번째 SDK 무엇" 정책 결정 상존 |
| **5노드 영향** | 큼 — 4노드 환경 변경 + 데스크탑(flutter 0) onboard 또는 통일에서 제외 결정 필요. 다중 SDK 호환 검출 자원 상실 | 작음 — 게이트 머신(본진/맥미니)만 영향. 나머지 노드 SDK 자유 유지, 다중 SDK 호환 가치 보존 |

---

## 4. trade-off 한 줄 정리

- **옵션 1** = skew 를 *원천 제거* (가장 견고하나 가장 무거움, 비가역성 큼, 다양성 검출자원 상실).
- **옵션 2** = skew 를 *허용하되 게이트가 catch* (가볍고 가역적, 단 ssh 의존 silent-fail 위험(2a) 또는 게이트 머신 SDK 상시유지(2b)).
- parent brainstorm 의 **옵션 3**(B그룹 cron, 머지 *후* catch) 은 두 안보다 더 가볍지만 회귀 사이클 비용을 수용 — "머지 전 0 보장"이 목표면 옵션 1/2, 사이클 비용이 mesh 시너지의 일부로 OK 면 옵션 3.

---

## 5. WSL 관점 디폴트 픽 제안 (형님/trio-vote 결정 대상)

본 작성자(🪟 WSL)는 **옵션 2b (게이트 머신 로컬 fvm strict SDK)** 를 v1 디폴트로 제안:
- 옵션 1 의 "머지 전 0" 견고함을 *게이트 단일 머신*에서 확보 (전 노드 onboard 불요)
- 2a 의 ssh/네트워크 silent-fail 위험 회피 (self-contained)
- 가역성 최상 (merge-gate.sh 1커밋 revert)
- 다중 SDK 호환 검출 자원 보존 (노드 SDK 자유)
- 비용 = 게이트 머신 디스크 ~2GB + 매 머지 +10s (자율 머지 흐름 거의 무영향)

**단 형님이 SDK 통일 자체에 가치**(외부 contributor onboard / store 빌드 reproducibility / 인지부담 0)를 두면 옵션 1 우선. 데스크탑은 flutter 미사용 노드일 수 있어(brainstorm §7 verify 대기) "flutter 4노드 통일 + 데스크탑 ML 전용 분리" 안이 옵션 1 의 자연스러운 형태.

---

## 6. 다음 단계
1. 형님 ack — 옵션 1 vs 2(2a/2b) + "머지 전 0 보장 비용 vs 회귀 사이클 비용" trade-off 결정
2. trio-vote/mesh-vote (PM/엔지니어/비판론자) — 옵션 확정
3. 확정 후 인프라 PR (옵션 1=노드별 fvm bootstrap directive / 옵션 2=merge-gate.sh 패치 PR)
4. WSL 3.41.7 → 통일버전 업그레이드는 RED 큐(형님 ack 대기) — 본 정책 확정에 종속

## 7. 한계
- 인프라 비용 정성적 — 옵션 확정 후 실측(fvm 설치 시간/게이트 latency).
- 데스크탑 flutter 부재의 정확한 사유(미사용 vs 캐시) 미verify — brainstorm §7 PROBE 대기.
- WSL `~/flutter` git-clone 기반 ↔ fvm 통합 호환성 미검증(옵션 1 채택 시 선결).
