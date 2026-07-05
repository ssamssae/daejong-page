---
prevention_deferred: 2026-07-08
---

# 맥미니 directive 오배달 + 인바운드 slot 미검사 — codex 슬롯 task를 claude 세션이 실행

- **발생 일자:** 2026-07-05 20:55 KST
- **해결(중단) 일자:** 2026-07-05 21:04 KST
- **심각도:** medium
- **재발 가능성:** medium (구조적 — 다중엔진 노드 전반)
- **영향 범위:** 맥미니(🏭, codex+claude 2세션 공존) / cross-node directive 라우팅

## 증상
본진→"macmini" directive(T-260705-07 Substack 로그인·발행)가 executor slot 홀더인 **코덱스 맥미니** 아닌 **클로드 맥미니** 세션((claude 맥미니 봇))에 배달됨. 클로드 맥미니가 세션시작 guard의 "slot 홀더=codex, SKIP" 경고를 갖고도 착수 → Substack 로그인 코드 발송까지 진행 후 아니키 지적("난 코덱스 시켰는데")으로 중단.

## 원인
2겹.
1) **배달층 오배달**: directive 봉투가 엔진 무지정 "macmini" → 다중엔진 노드에서 클로드 세션으로 붙음. "macmini"를 slot 홀더(codex) 세션으로 해소하지 못함. ('보낸 지시' 카드 오배달 T-260705-65/63 과 인접하나, directive payload의 엔진 해소는 본진 send측 추적 필요 — 별건.)
2) **수신 slot 가드 부재**: 클로드 맥미니가 "T-260705-07 executor slot 홀더=codex"라는 세션시작 신호를 갖고도 인바운드 directive를 실행. slot 비보유 시 실행 차단·본진 반환 가드가 **인바운드 실행 경로에 없음**(세션시작 때 경고만, 실행은 안 막음).

같은 맥미니 2엔진 오배정 클래스 재발 — 07-03([[2026-07-03-macmini-double-dispatch-duplicate-build]])는 self-pickup + build-lease 부재였고, 이번은 inbound directive 오배달 + slot 미검사로 **fix 표면이 다름**(라우팅/수신가드 ≠ build-lease).

## 조치
클로드 맥미니 즉시 STAND DOWN + Playwright 세션 종료. 발송된 Substack 코드는 내 세션 한정이라 무해(아니키에 무시 안내). task는 코덱스 맥미니로 반환. 데이터 유실 0.

## 예방 (Forcing function 우선)
- **막을 코드/훅:** `none` (deferred 2026-07-08, 추적 task **T-260705-66**) —
  - (a) **라우팅**: 다중엔진 노드 directive는 엔진 명시 필수 OR 라우터가 executor slot 홀더 세션으로 해소 (routes.yaml/mesh-send). '보낸 지시' 카드측은 T-260705-65/63.
  - (b) **인바운드 slot 가드**: 인바운드 directive 실행 전 "이 task executor slot 홀더 == 내 엔진/세션?" 검사 → 불일치면 실행 차단+본진 반환(경고만 하지 말 것). PreToolUse/directive-recv 훅+fixture. 원칙10 사고는 코드로.
  - R3(라우팅/훅) 본진 게이트 PR.

## 재발 이력
<처음 생성 시 비워둠>

## 관련 링크
- 원 task: T-260705-07 (Substack 뉴스레터 로그인·발행, codex 맥미니 slot)
- 개선 task: `~/todo/tasks.md` **T-260705-66** (인바운드 slot 가드)
- 동종 선행: [[2026-07-03-macmini-double-dispatch-duplicate-build]] (build-lease T-260703-47)
- 인접 라우팅: T-260705-65 (directive-sent-card 오배달), T-260705-63 (카드 발신주체 라벨)
- 텔레그램: id 16782
