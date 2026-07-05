---
prevention_deferred: 2026-07-08
---

# coord 미러 detached HEAD 좌초 — action-ledger.sh rebase 후 HEAD==main 검사 누락으로 고아 ledger 커밋

- **발생 일자:** 2026-07-03 21:45 KST
- **해결 일자:** 2026-07-05 16:11 KST
- **심각도:** medium
- **재발 가능성:** medium (동종: 2026-06-27 노트북 coord 좌초, T-260627-11 가드)
- **영향 범위:** 맥미니 claude-coord 미러 / action-ledger.sh 전 노드 공용

## 증상
맥미니 coord 미러(claude-coord)가 07-03 21:45부터 detached HEAD로 좌초 → 자동 sync 44h 멈춤. 그동안 07-03 한줄일기 iOS 앱스토어 메타데이터 ledger 1줄(81a7302)이 origin에 못 올라가고 붕 뜬 HEAD에 갇힘. 07-05 16:07 "coord 미러 좌초 감지" 가드 알림으로 표면화.

## 원인
`action-ledger.sh`의 `_coord_prepare_for_write()`가 쓰기 전 `git rebase origin/main`(87줄)을 도는데, **rebase 직후 HEAD가 main에 돌아왔는지 검사가 없음**. 07-03 그 rebase는 단순 fast-forward(main 73커밋 뒤, 로컬커밋 0)였는데 reflog상 `rebase (start): checkout origin/main`만 찍히고 `rebase (finish): returning to main`이 없음 = **완료 전 중단**(프로세스 종료/슬립 추정). HEAD가 detach된 채 남았고, 코드가 확인 없이 `git commit`(115줄) → 고아 커밋 생성. 부가: 동시실행 flock 없음(경합 2차 벡터).

## 조치
preserve-first 순서로 수동 복구: ①detached HEAD를 salvage 태그로 박제 ②main 체크아웃+origin FF ③갇힌 ledger 커밋 cherry-pick ④non-force push(1발 성공). 최종 origin과 0/0 동기, 갇힌 ledger 줄 origin 반영 실측 확인. 데이터 유실 0. (force 미사용)

## 예방 (Forcing function 우선)
- **이미 live(탐지)**: T-260627-11 escalation 가드 — 비-main/dirty/wedge/ahead임계 시 아니키 알림. **이번 좌초를 붙잡아 표면화한 게 이 가드**. 다만 탐지만 하고 고아 생성 자체는 못 막음.
- **막을 코드/훅:** `none` (deferred 2026-07-08) — 근본예방 패치 미착지. 계획: `_coord_prepare_for_write` rebase 직후 `git symbolic-ref -q HEAD == refs/heads/main` **단언** → detach면 커밋 차단(또는 clean시 `checkout main` 자동복구) + 전체 경로 **flock** + detached-HEAD 시뮬 **fixture 테스트**. R3(가드마커 훅)라 본진 게이트 PR 경유.

## 재발 이력
<처음 생성 시 비워둠>

## 관련 링크
- 좌초 커밋: claude-coord 81a7302 → 복구 후 origin main
- 코드: `~/claude-automations/scripts/action-ledger.sh` (64-88줄 `_coord_prepare_for_write`, 87줄 rebase)
- 선행 가드: T-260627-11 (2026-06-27 노트북 coord 좌초 무통보 사고)
- 텔레그램: id 16723
