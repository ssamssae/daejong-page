---
prevention_deferred: null
---

# 맥북 본진 codex CLI 무한 업데이트 알림 — npm-global/homebrew 중복설치 + PATH 우선순위 mismatch

- **발생 일자:** 2026-06-07 21:49 KST
- **해결 일자:** 2026-06-07 22:00 KST
- **심각도:** low
- **재발 가능성:** medium
- **영향 범위:** 🍎 본진 Mac codex CLI (codex 세션 사용 흐름)

## 증상
본진 Mac codex 세션에서 "Update available 0.136.0 → 0.137.0" 프롬프트가 업데이트(1번)를 눌러도 매번 다시 떠 무한 반복. 업데이트는 성공한다는데 끝나지 않음.

## 원인
codex 가 두 곳에 중복 설치돼 "실행되는 사본"과 "업데이트되는 사본"이 갈라짐.

- `~/.npm-global/lib/node_modules/@openai/codex` (옛 0.136) — 셸 PATH 우선순위 1순위(`~/.zshrc:24` 의 `export PATH=$HOME/.npm-global/bin:$PATH` + `start-wrapped-session.sh` 의 동일 PATH prepend)라 codex 실행 시 **항상 이 사본**이 뜸.
- `/opt/homebrew/lib/node_modules/@openai/codex` (새 0.137) — `~/.npmrc` 의 `prefix=/opt/homebrew` 때문에 codex 자가업데이트(`npm i -g @openai/codex`)는 **이 사본만** 갱신.
- 결과: 실행본(npm-global 0.136)은 영영 안 바뀌고 → 매 실행 "0.136 → 0.137 업데이트 있음" 재출현.

뿌리는 2026-05-20 "맥을 3노드(nvm)처럼 npm-global prefix 로 통일" 시도의 반쪽 적용 잔재. `~/.zshenv` 주석에 본인이 "Mac npm-global 은 그 패턴 안 통함"이라 기록(claude 쪽 동형 사고 issue 2026-05-29-mac-claude-update-stale-staging-enotempty-loop).

## 조치
옛 npm-global codex 사본(pkg + bin 심링크)을 `~/.npm-global/_disabled/codex-2026-06-07-2200/` 으로 가역 보관 이동(RETIRED.md 복원법 포함, 삭제 아님). homebrew 단일화.
- 검증: interactive `which codex` → `/opt/homebrew/bin/codex`, 버전 `codex-cli 0.137.0`. npm-global 사본 부재 확인.
- 실행 중이던 codex 세션은 이미 로드된 옛 프로세스라 재실행부터 0.137 적용.

## 예방 (Forcing function 우선)
trio-vote(2026-06-07) 예방안 A 만장일치(3-0) 채택 — 감지형 forcing function. mac 일일 헬스체크가 codex 의 npm-global·homebrew 양대 prefix 동시존재를 감지하면 텔레그램 경고. B(`.zshrc` 잔재 정리)는 RC파일 ack 게이트라 후속 별 사이클.

- **막을 코드/훅:** `claude-automations` PR #109 — `scripts/env-token-healthcheck.sh` 에 codex 중복설치 감지 블록 추가(`# ⚠️ 제거 금지` 가드 마커). 둘 다 존재 시 REPORT 에 `[mac-codex] codex 중복설치 감지` 한 줄 → 기존 텔레그램 알림 경로로 발사. mac(Darwin) 로컬 한정, Linux 노드 자연 skip. https://github.com/ssamssae/claude-automations/pull/109

## 재발 이력
<처음 생성 — 비어있음>

## 관련 링크
- 예방 PR: https://github.com/ssamssae/claude-automations/pull/109
- 동형 사고(claude): `issues/2026-05-29-mac-claude-update-stale-staging-enotempty-loop.md`
- 텔레그램: 2026-06-07 22시경 "코덱스 업데이트 자꾸 삑사리" 보고
