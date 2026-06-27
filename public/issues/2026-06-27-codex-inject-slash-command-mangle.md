---
prevention_deferred: null
---

# codex 세션에 directive inject 시 슬래시 깨짐 — 입력란 잔여물 + `/` 슬래시커맨드 오인

- **발생 일자:** 2026-06-27 ~08:50 KST (첫이름 작업을 맥미니 codex에 위임 inject 중)
- **해결 일자:** 2026-06-27 09:00 KST
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** 본진/맥미니 Claude가 codex tmux 세션에 directive 를 주입하는 모든 경로

## 증상
맥미니 Claude 가 `tmux -L codex send-keys -t codex -l "<directive>"` 로 첫이름 작업 지시를 주입했더니, codex 입력란에 남아있던 직전 `/status` 잔여물 뒤에 directive 가 그대로 붙어 `/statuscheotireum(첫이름)...` 이 되었다. codex 는 이를 슬래시커맨드로 해석해 `Unrecognized command '/statuscheotireum(첫이름)'` 에러를 냈고, 본문 안의 경로 슬래시(`/api/preview`, `scripts/deploy-cheotireum.sh`)가 전부 누락돼 `apipreview`, `scriptsdeploy-cheotireum.sh` 처럼 깨졌다. Enter 도 submit 되지 않았다.

## 원인
두 겹이다. (1) codex TUI 입력란에 이전 명령(`/status`) 잔여물이 남아 있었고 `C-u` 로는 클리어되지 않았다(codex TUI 가 C-u 를 라인 클리어로 안 받음). (2) `send-keys -l` 로 직접 타이핑한 텍스트는 codex TUI 가 `/` 를 슬래시커맨드 트리거로 해석해 첫 `/` 가 명령 모드를 열고 뒤따르는 `/` 들을 먹어버렸다.

## 조치
입력란을 `C-c` 로 클리어한 뒤(이건 먹힘), `printf '%s' "$DIR" | tmux -L codex load-buffer -` + `tmux -L codex paste-buffer -t codex -p`(bracketed paste)로 재전송했다. bracketed paste 는 TUI 가 전체를 한 덩어리 텍스트로 받아 슬래시커맨드 트리거를 회피하고 경로 슬래시도 보존된다. paste 후 `capture-pane` 으로 입력 내용을 검증하고 나서 Enter 로 submit 했다.

## 예방 (Forcing function 우선)
codex 세션 inject 표준 절차: (1) `C-c` 로 입력란 클리어 후 `capture-pane` 으로 비었는지 확인 → (2) `load-buffer` + `paste-buffer -p`(bracketed paste)로 전송(`send-keys -l` 직접 입력 금지) → (3) `capture-pane` 으로 입력 검증 후 별도 Enter. send-keys 직접 입력은 잔여물·슬래시 오인 두 함정이 있으므로 paste-buffer 를 기본 경로로 박는다.

- **막을 코드/훅:** codex inject 헬퍼에 위 3단계 박기 (운영 know-how, 헬퍼 표준화 대상)

## 재발 이력
<처음 생성 — 비움>

## 관련 링크
- know-how: `codex-tmux-main-cx-routing` (codex main/cx tmux 라우팅 정석)
- 사건 발단 작업: 첫이름(cheotireum) web/모바일 작업 맥미니 codex 위임
