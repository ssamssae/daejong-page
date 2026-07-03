---
prevention_deferred: 2026-07-10
---

# 노드 이중배정 — codex+claude 두 세션이 같은 task 병렬 → ASC 중복 빌드

- **발생 일자:** 2026-07-03 21:30~21:41 KST
- **해결 일자:** 2026-07-03 21:58 KST (정리·surface 완료)
- **심각도:** medium
- **재발 가능성:** medium
- **영향 범위:** 한 노드 노드, 스토어 배포(hanjul T-260703-20), ASC 빌드 파이프라인

## 증상
한줄일기 T-260703-20 재빌드 중 App Store Connect 에 같은 마케팅버전(1.3.1) 빌드가 2개 올라감 — build 15(21:30 업로드)와 build 16(21:41 업로드). 한 세션은 build 15 만 만들었는데 11분 뒤 다른 세션이 build 16 을 올림. "누가 두 번 올렸냐" 로 발견.

## 원인
같은 노드 노드의 **codex 세션 + claude 세션 두 개가 동일 task(T-260703-20 hanjul 재빌드)를 이중으로 배정받아 build-claim 락 없이 병렬 착수**했다. 각 세션이 독립적으로 빌드·업로드해 중복 빌드(15/16)가 생성됨.
- 원칙5(중앙지휘·워커 자체픽업 금지) 위반: 한 task 가 두 워커에 감.
- 원칙4(작업 시작 전 T-엔트리 등재/클레임) 미이행: 두 세션 모두 "이미 누가 이 배포를 잡았는지" 확인하는 클레임 게이트 없이 시작.
- 직렬화 지점 부재: sot-add(T-id 채번 race)는 있으나, 스토어 빌드/업로드 착수에 대한 lease/클레임은 없음.

## 조치
- 즉시 surface(본진 mac-report) + tasks.md 이중배정 기록.
- 정리 결정(SoT): codex 세션 = owner 확정, claude 세션 STAND DOWN, 제출빌드 = build 15, build 16 = orphan 가역 보관(삭제 안 함 — 가역 우선).
- 중복 빌드 미터치(어느 것도 파괴/제출 안 함). 실제 심사제출·go-live 는 여전히 HOLD(아니키 웹/2FA 게이트).
- 재발방지 task 등재: **T-260703-47** (스토어 빌드/업로드 build-lease).

## 예방 (Forcing function 우선)
스토어 빌드/업로드(flutter build ipa/aab · altool · fastlane supply) **착수 전 build-lease 클레임**을 강제한다 — node+session+task 스코프, git remote 를 직렬화 지점으로 사용(merge-lease 동형). 이미 진행 중인 세션이 있으면 착수 거부 + 보고. 사람 의지 아닌 gate/wrapper 로 강제(원칙10 — 사고는 코드로).

- **막을 코드/훅:** `none` (deferred — 작성 마감 2026-07-10, 추적 task **T-260703-47** 본진 triage). PreToolUse 훅 or 빌드 wrapper 게이트로 구현 예정. 구현 시 이 라인을 훅/PR 경로로 갱신.

## 재발 이력
<처음 생성 — 재발 시 "- YYYY-MM-DD: 상황 한 줄" 추가>

## 관련 링크
- 재발방지 task: `~/todo/tasks.md` T-260703-47
- 원 task: T-260703-20 (한줄일기 구독 freemium)
- 메모리: [[feedback_stale_redo_loop_step_ledger]] (멀티스텝 stale 재실행 방지 — 인접 패턴)
- 정리 근거: tasks.md T-260703-20 details "⚠️노드 이중배정 사고+정리 2026-07-03 21:4x"
