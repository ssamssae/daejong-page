---
prevention_deferred: null
---

# 2026-05-29 — 본진(🍎 Mac) Claude Code 업데이트 ENOTEMPTY 영구 루프 (실패한 auto-update staging 잔재) → cc 무응답

- **발생 일자:** 2026-05-29 07:01 KST (방치 시작) / 10:34 KST (아니키 인지)
- **해결 일자:** 2026-05-29 19:50 KST
- **심각도:** medium
- **재발 가능성:** medium
- **영향 범위:** macOS 2대 (🍎 본진 Mac + 🏭 맥미니) 동시 발생. Linux/WSL 3대(🪟 WSL·🖥 데스크탑·💻 노트북, 전부 nvm 기반)는 멀쩡 — 사고 후 5노드 전수 스윕으로 확인.

## 증상
아니키가 본진 MacBook 터미널에서 `cc` 눌러도 Claude Code 안 뜸 (빈 화면처럼 보임). 🪟 WSL 이 SSH 진단: 실제 `claude` 프로세스 0개, tmux base `claude` 세션 사라짐, 아니키 Ghostty 는 죽은 grouped 세션(claude-5288)에 붙어있던 상태. claude 직접 실행 시 `Error: claude native binary not installed`. 이어서 아니키가 `npm i -g @anthropic-ai/claude-code` 수동 시도 → `npm error code ENOTEMPTY ... rename '...claude-code' → '....claude-code-0tAFGnf8' ... directory not empty`.

## 원인
오늘 새벽 **07:01 KST 자동 업데이트가 중간에 실패**하면서 npm 의 atomic-swap 임시 staging 디렉토리 `.npm-global/lib/node_modules/@anthropic-ai/.claude-code-0tAFGnf8` 가 **잔재로 남음**. npm 업데이트는 (1) 새 버전을 `.claude-code-XXXX` 임시폴더에 풀고 (2) 기존 `claude-code` 를 다른 임시명으로 rename 한 뒤 (3) 새 걸 제자리로 swap 하는 흐름인데, 07:01 실패가 1단계 staging 폴더를 안 비워진 채 남겨둠.

그 뒤로 모든 업데이트(자동 + 수동 `npm i -g`)가 기존 `claude-code` 를 그 잔존 `.claude-code-0tAFGnf8` 로 rename 하려다 **ENOTEMPTY(errno -66, 대상 폴더 안 비어있음)** 로 매번 막힘 = 영구 루프. 동시에 07:01 의 반쪽 설치가 native 바이너리를 불완전 상태로 남겨 `claude` 가 "native binary not installed" 로 즉사 → `cc` 가 죽은 빈 tmux 세션만 남김.

핵심: **tmux 문제가 아니라 install 손상.** 죽은 세션은 결과(증상)이지 원인 아님.

## 조치
1. SSH 로 본진 진단: `ps aux | grep claude` 0건 + `tmux ls` 에 base `claude` 부재 확인 → install 손상으로 방향 전환.
2. 죽은 orphan tmux 세션 정리 + base `claude` 세션 재생성.
3. 1차 복구: 공식 postinstall `node .../claude-code/install.cjs` 실행 → darwin-arm64 native 바이너리(214MB Mach-O, `bin/claude.exe` 라는 placeholder 이름) 정상 설치. `claude 2.1.154` 기동 확인 + telegram 플러그인 polling("Listening for channel messages") 확인.
4. 근본 원인 제거: 잔존 staging 디렉토리 `rm -rf .../@anthropic-ai/.claude-code-0tAFGnf8` → `npm i -g @anthropic-ai/claude-code` 재실행 성공("changed 2 packages in 6s"). **최신 2.1.156** 으로 클린 재설치, `@anthropic-ai` 폴더 잔재 0 확인.
5. 실행 중 claude 세션(아니키가 보던 것)은 안 끊고 유지 (in-memory 옛 2.1.154). 다음 `cc --new` 재시작 시 2.1.156 픽업.
6. **🏭 맥미니 동일 사고 발견** (아니키가 "맥미니도 안 된다" 보고) — staging 잔재 `.claude-code-2DTsDk1V` + `bin/claude.exe` 가 500B ASCII stub(native 바이너리 미설치). 동일 조치(rm staging + `npm i -g`, /opt/homebrew prefix 라 sudo 불요) → 2.1.156 + native Mach-O 정상, claude 세션 재기동 + telegram polling 확인.
7. **5노드 전수 스윕**: macOS 2대만 깨짐. 🪟 WSL·🖥 데스크탑·💻 노트북은 전부 2.1.156 정상 + `@anthropic-ai/` 에 staging 잔재 0. → nvm 기반 Linux 노드는 이 사고 패턴 비해당, macOS npm-global 경로 한정.

## 예방 (Forcing function 우선)
`claude-code-nightly-update.sh` (Mac launchd / 노드 systemd) 에 **staging 잔재 감지·정리** 단계 추가:
- 업데이트 전후로 `~/.npm-global/lib/node_modules/@anthropic-ai/` (노드별 npm prefix) 에 `.claude-code-*` 점(.) 으로 시작하는 staging 형제 디렉토리가 있으면 = 직전 실패 잔재 → `rm -rf` 후 진행 + 로그/텔레그램 1통.
- 업데이트 직후 `claude --version`(로컬) 이 정상 실행되는지(= "native binary not installed" 안 뜨는지) 1회 검증. 실패면 `node .../install.cjs` postinstall 자동 1회 재시도 + 알림.
- 이 둘은 cron/timer 안에서 도므로 chatbot turn 안 깨움 → Anthropic API 비용 0.

근거: 실패한 atomic-swap 잔재가 "조용히 영구 ENOTEMPTY 루프"를 만든다 — 사람이 `cc` 눌러보기 전엔 안 보임. 잔재 자동 청소가 forcing function.

## 재발 이력
<처음 생성>

## 관련 링크
- 관련 이슈(같은 family, 다른 변종): `issues/2026-05-18-wsl-cc-nightly-update-zombie.md` (WSL, **transient** atomic-swap race — 업데이트 완주 후 self-resolve), `issues/2026-05-20-cc-version-stale-always-on-node.md` (always-on 노드 버전 고착)
- 본 건 차이: 🍎 Mac, **persistent** staging 잔재로 ~12시간 ENOTEMPTY 영구 루프 + native 바이너리 손상 (수동 rm 필요)
- 메모리: `feedback_cc_dies_after_autoupdate` (in-process updater stub-binary 사고)
- 텔레그램: 2026-05-29 10:34~10:52 KST (🪟 WSL ↔ 아니키 진단/복구)
