---
prevention_deferred: 2026-06-19
---

# 맥미니 봇 토큰 git history 노출 → 정석 rotate

- **발생 일자:** 2026-05-24 (최초 발견)
- **해결 일자:** 2026-06-12 19:43 KST
- **심각도:** medium
- **재발 가능성:** medium
- **영향 범위:** 맥미니 텔레그램 봇, 스킬 repo

## 증상
스킬 repo git history(특정 commit)에 맥미니 봇 활성 토큰이 평문 노출. 현재 파일은 redaction 됐으나 git history 엔 그대로 잔존(getMe ok 로 활성 확인).

## 원인
봇토큰을 코드/문서에 하드코딩한 과거 커밋. redaction 은 *현재 파일만* 수정하고 git history 는 force-push 로 지우지 않음 → 런타임 설정(.env)과 git history(과거)에 토큰이 **이중 존재**. private repo라 노출면은 제한적이나 활성 토큰이라 정석 = 폐기·재발급.

## 조치
1. BotFather `/revoke` → 새 토큰 발급(옛 토큰 즉시 무효화 + 봇/세션 일시 죽음).
2. 전용 헬퍼 스크립트(숨김입력, **메신저 채널 비경유** — 토큰이 채널 안 거치게)로 설정의 봇토큰 필드 갱신 + 백업.
3. 본진 인수 = 노드 세션 **클린 재시작**: 기존 plugin/세션 proc 먼저 정리(pgrep 0 확인) 후 launchd job 단일 fresh 재생성. ⚠️ kickstart 단독은 stale 세션 존재 시 duplicate 실패 → 옛 세션 정리 선행 필수(과거 좀비 lock 사고 회피).
4. 검증: 새 토큰 `getMe` ok + `getUpdates` 409(단일폴러 정상 = 봇 부활) / 옛 토큰 `getMe` 401 Unauthorized(완전 사망).

## 예방 (Forcing function 우선)

- **막을 코드/훅:** `none` (deferred — 작성 마감 2026-06-19)
  - 진짜 forcing = 스킬 repo pre-commit 훅으로 봇 토큰 패턴 커밋 차단(git-secrets 류). 다중 노드 훅 배포는 별 작업이라 다음 정비 사이클로 deferred.
- 봇토큰은 런타임 설정(.env, gitignore)에만. 코드/문서/커밋 하드코딩 금지.
- redaction(현재 파일 마스킹)만으로는 git history 에 토큰이 남음 — 노출 발견 시 **즉시 rotate** 가 정석(history rewrite 보다 우선). history rewrite(force-push)는 토큰 죽으면 노출가치 0이라 optional.

## 재발 이력
<처음 생성>

## 관련 링크
- 선행 issue: `2026-05-24-mac-mini-group-mirror-token-mismatch.md`
