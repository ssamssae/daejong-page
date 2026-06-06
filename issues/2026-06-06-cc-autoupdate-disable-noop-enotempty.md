---
prevention_deferred: null
---

# 2026-06-06 — claude 자동업뎃 착각: DISABLE_AUTOUPDATER가 launchd claude엔 무효, 본진만 멈춘 진짜 범인은 모듈폴더 수동 npm 잔재(ENOTEMPTY)

- **발생 일자:** 2026-06-05 23:17 KST (아니키 인지 — 매일 아침 구버전 경고는 그 전부터)
- **해결 일자:** 2026-06-06 09:25 KST (잔재 제거 + 2.1.165 업뎃) / 예방 A+B 09:5x KST
- **심각도:** medium
- **재발 가능성:** medium → low (A+B 예방 후)
- **영향 범위:** macOS 2대 (🍎 본진 + 🏭 맥미니), launchd로 뜬 claude 의 in-process 자동업뎃

## 증상
본진 claude 가 2.1.163 에 고착, 매일 07:15 nightly-update 가 "구버전" 경고 텔레그램만 발사. 맥미니는 2.1.165 로 자동 최신. 아니키 "맥미니도 자동업뎃 껐다며 뭘 업뎃했냐 / 누가 맥미니 업뎃해주냐 본진도 걔가 해주면 되잖아"(msg33506/33531) 혼란.

## 원인
1. **핵심 착각**: 2026-05-20 이슈에서 "본진 `~/.zshenv` 의 `DISABLE_AUTOUPDATER=1` 이 먹어서 in-process 자동업뎃 OFF → nightly 에 의존 → always-on skip 으로 고착"이라 진단. 오늘 proc env 실측(본진 claude pid 9871, 맥미니 pid 2005/2007) 결과 **DISABLE_AUTOUPDATER 가 proc env 에 없음** — claude 가 launchd(`com.user.tmux-claude`)→tmux 서버→비대화형으로 떠서 `.zshenv` 를 안 읽음. 즉 우리가 "껐다"고 믿은 in-process 자동업뎃이 본진·맥미니 **둘 다 계속 켜져 있었음**.
2. nightly 의 "session active skip"(05-20 진단)은 24/7 노드에서 영원 skip 이 맞지만 그건 **부차** — 진짜 업뎃 주체는 in-process 자동업뎃이었다.
3. **본진만 멈춘 진짜 범인**: 6/2 npm 정리 때 `/opt/homebrew/lib/node_modules/@anthropic-ai/` 에 `claude-code.disabled-2026-06-02` + `RETIRED-claude-code.md` 수동 잔재를 남김 → in-process 자동업뎃의 atomic swap 이 폴더 안 claude-code 외 항목 때문에 **ENOTEMPTY 로 깨져** 2.1.163 멈춤. 맥미니는 모듈폴더가 깨끗해서 08:18 자동 성공(2.1.165). → 2026-05-29 ENOTEMPTY 이슈의 **변종**: 그땐 staging(`.claude-code-*`) 잔재, 이번엔 **수동 보관본** — 05-29 예방이 staging 만 잡아 수동잔재가 누수됐다.
4. **부차 착각**: 진단 중 본진 proc env 첫 측정이 "DISABLE 있음"으로 잘못 떠(ps eww 불완전 출력) 재측정으로 정정.

## 조치
1. 잔재 2개를 `~/.claude/_disabled/cc-npm-residue-2026-06-06/` 로 가역 보관 → 모듈폴더 `claude-code` 단일 (맥미니와 동일 구조).
2. `npm i -g @anthropic-ai/claude-code@latest` → 본진 2.1.165 (깨끗해진 폴더라 atomic swap 성공).
3. `cc-self-update.sh` 의 `~/.npm-global` → `/opt/homebrew` 경로버그 수정 (commit 38f750f) — 6/5 prefix 통일 후 버전체크가 엉뚱 경로 짚던 버그.
4. **codex-mesh-vote(SESSION 1780706368, 6/7)** 로 진단 검증(전원 "맞음") + 예방안 A+B 확정. C(plist 로 자동업뎃 OFF) 는 "정상 자동업뎃 죽여 버전정체·보안누락"이라 기각.

## 예방 (Forcing function 우선)
- **막을 코드/훅:** `claude-automations` commit `c0fe859` — `scripts/claude-code-nightly-update.sh` 의 `health_check_and_clean()`(always-run, 24/7 노드도 매일 탐)에 `@anthropic-ai/` 모듈폴더 **claude-code 단일 invariant** 강제:
  - **A**: 알려진 수동잔재(`claude-code.disabled-*`/`RETIRED-*.md`/`.bak`/`.old`)를 `~/.claude/_disabled/cc-npm-residue-<date>/` 로 격리(가역).
  - **B**: `claude-code` 외 unknown 항목은 자동삭제 X, 텔레그램 경고만(파괴적 오삭제 방지).
- DISABLE_AUTOUPDATER 는 launchd claude 엔 무효라 자동업뎃은 사실상 항상 ON — **모듈폴더 청결이 진짜 forcing function**. 자동업뎃을 죽이는 방향(C)은 codex-mesh-vote 기각.
- 메모리 정정 필요: `feedback_mac_disable_autoupdater_must_stay_off` 와 `reference_claude_install_standard` 가 "DISABLE 로 자동업뎃 OFF" 전제 → "launchd claude 엔 무효, 잔재가 진짜 범인"으로 갱신.

## 재발 이력
<처음 생성 시 비워둠>

## 관련 링크
- 커밋: 38f750f (cc-self-update 경로버그), c0fe859 (A+B 예방)
- 관련 이슈: `issues/2026-05-20-cc-version-stale-always-on-node.md` (DISABLE 진단 정정 대상), `issues/2026-05-29-mac-claude-update-stale-staging-enotempty-loop.md` (ENOTEMPTY family 원조), `issues/2026-06-01-cc-nightly-falsealarm-bare-claude-path.md`
- 메모리: `feedback_mac_disable_autoupdater_must_stay_off.md`, `reference_claude_install_standard.md`, `feedback_cc_dies_after_autoupdate.md`
- codex-mesh-vote: SESSION 1780706368 (5 codex + Gemini A+B / DeepSeek C+A → 6/7 A+B)
- 텔레그램: msg33506, 33531, 33555
