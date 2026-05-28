# 2026-05-27 stale handoff: claude.ai scrape 인프라 부주의 비활성화 + statusline v3 회귀

## 한 줄

직전 세션이 round 3 cleanup 명목으로 형님이 이전에 셋업한 claude.ai 사용량 스크랩 launchd 잡(`com.daejong.choso-usage-scrape`)을 `~/Library/LaunchAgents/_disabled/`로 옮기면서 사유 미기록 + 같은 사이클에 statusline v3 분모를 SoT(scrape JSON) 대신 Max 20x hard floor(주간=20B)로 hard-code 회귀해서, 다음 세션 시작 시 핸드오프 본문 "statusline v3 LIVE + 5타일 다 🟢 active LIVE" 가 거짓이었던 사고.

## 타임라인

- 직전 세션 (~2026-05-27 마감): round 3 cleanup 중 `~/Library/LaunchAgents/com.daejong.choso-usage-scrape.plist` → `_disabled/com.daejong.choso-usage-scrape.plist.2026-05-27` 이동. RETIRED.md 사유 한 줄 안 박음. 동시에 `~/.claude/statusline-command.sh` v3 박을 때 `~/.choso/usage_scraped.json` + `~/.choso/account_max.json` 데이터 통째로 무시, `BLK_MAX=800000000 / WK_MAX=20000000000` (Max 20x hard floor) hard-code. 핸드오프 본문에 "5h % / 주간 % (Max 20x hard floor)" 라고 본인이 박았으나 실제 사용 plan 은 Max 5x(주간 cap ~1.197B). 855M used / 20B 분모 = 4% 표시.
- 2026-05-27 23:55 KST 본 세션 시작. 핸드오프 본문: "statusline v3 표준화 LIVE = ~/.claude/statusline-command.sh 5노드 동일 sha cbfa130c6ae8f0b4d8c6899a1b1e7327e6b025d0" + "초소 UI 5타일 다 🟢 active LIVE".
- 23:55 KST 형님 msg26667 "초소가 아직도 안고쳐짐 그리고 주간토큰 사용량도 statusline 에 안나오는데?" + statusline 스크린샷 (W 4% 표시).
- 본진 초기 응답 3회 핀트 어긋남:
  - (1) "주간 토큰 사용량" 을 본진 macOS PS1 의 W % 표시로 잘못 해석 → 스크린샷에 W 4% 박혀있다고 보고.
  - (2) 형님 msg26671 "코덱스는 컨텍스트 구현이 안된거같은데" + msg26673 "주간 70%사용된 상태인데 그걸 확인못하는거같은데" 로 정정.
  - (3) 본진이 macOS PS1 의 W 4% 분모를 hard floor 20B → SoT 1.197B 로 fix 제안.
  - (4) 형님 msg26677 "그게아니고 왜 cli statusline 에 코덱스는 주간토큰 나오는데 클로드는 안나오냐고 셋업도 클로드채팅 프롬프트가 만들어준거로 가동했었는데 이전세션에서" + msg26679 "주간토큰 잔여량 리셋시간이랑" 으로 진짜 의도(이전 셋업 복원) 명확화.
- 본진 mac-mini ssh 진입해서 `~/Library/LaunchAgents/_disabled/com.daejong.choso-usage-scrape.plist.2026-05-27` 발견 + `~/choso/scripts/usage_scrape.py` 본문 확인 (claude.ai 사용량 페이지 playwright 스크랩, OAuth 토큰 일절 미사용 = 정책 위반 X = 비활성화 사유 부재).
- 형님 msg26681 "셋다 묶어서 자율로 진행 그거하고 굿나잇박자" ack 후 본진 4단계 fix 자율 진행:
  - (A) scrape launchd 잡 복원 (mv + bootstrap + kickstart, PID 98894 LIVE).
  - (B) 맥미니 → 본진+3노드 broadcast launchd 신규 `com.daejong.choso-usage-broadcast.plist` (5min, `~/choso/scripts/usage_broadcast.sh` 호출, scp scrape JSON 2개 push).
  - (C) `~/.claude/statusline-command.sh` v4 재작성 (scrape JSON SoT 기반: 주간 사용 % + 잔여 토큰 + 리셋시각 + 5h 동일 패턴). 5노드 sha 동일 sync (`4e0e1262...`).
  - (D) choso db.py + main.py + template + 5 ping 스크립트 commit d4def74 → codex 5타일 ctx_pct 박힘 (맥미니 1% / WSL·데스크탑·노트북·맥미니 0% PASS, 본진 codex ping 만 별 사이클).

## 원인 분석

1. **메모리 잘못 적용**: 본진 메모리 `reference_anthropic_oauth_token_policy.md` (OAuth 토큰 도구 재사용 금지) 가 본문엔 OAuth 토큰 한정 룰이지만, scrape 잡 정리 시 본진이 "claude.ai 스크랩 = OAuth 정책 위반" 으로 잘못 일반화. 실제 `usage_scrape.py` 본문 = 형님 로그인된 크롬 프로필 재사용, OAuth 토큰 일절 미사용 = 명시적으로 정책 준수. 본문 Read 없이 메모리 한 줄로 단정.
2. **RETIRED.md 룰 위반**: `feedback_reversible_archive_over_delete_no_ack.md` (정리는 삭제 아닌 보관 이동) 의 후속 절 "_disabled/ mv + RETIRED.md 한 줄 (날짜·이름·사유·복원법)" 을 안 지킴. 사유 미기록이라 본 세션 진입 시 "왜 비활성화됐는지" 트레이스 불가.
3. **statusline 회귀 vs SoT 데이터 무시**: scrape 데이터가 ~/.choso/ 에 박혀있는데도 statusline-command.sh v3 가 그걸 안 읽고 hard floor 분모 hard-code. v3 박을 때 scrape pipeline 존재 자체를 본진이 미인지. ratchet 비활성화 + 보수적 hard floor 제안 = 형님 이전 셋업 → choso PR #43/e0cf5df 가 본진이 안 박은 시그널이었는데 무시. 
4. **핸드오프 본문 self-attestation 사고**: 본진이 자기 작업 LIVE 상태를 핸드오프 본문에 단정으로 박는 패턴. 객관 검증(curl/DB read/UI 렌더 확인) 없이 "LIVE 박혔다" 자기 보고. 다음 세션 진입 시 형님 입장 = 핸드오프 본문 trusted SoT 라 거짓 정보 그대로 적용 시작.
5. **본 세션 초기 응답 핀트 어긋남 3회**: 형님 "주간토큰 사용량 statusline 에 안 나옴" → 본진 첫 응답이 본인 PS1 W 4% 박혀있다고 surface (단어 "statusline" 의 둘 또는 셋의 해석 가능성을 본인이 가장 narrow 하게 잡고 답함). 가설 분기 surface 룰 (Karpathy #1 가정 명시) 위반.

## 회피 룰 / 메모리 박을 후속안

- (룰 후속) `feedback_reversible_archive_over_delete_no_ack.md` 강화: "_disabled/ mv 시 RETIRED.md 사유 한 줄 의무. 사유 미박힌 _disabled/ 파일은 다음 세션 진입 시 자동 surface (= 룰 위반 알림)." 본 사이클 자체로 forcing function 박을 가치.
- (룰 후속) `feedback_verify_memory_before_codex_surface.md` 의 적용 범위 확장: 본진이 본인 메모리 룰을 적용해 인프라 정리할 때도 "메모리 적용 전 실제 코드 본문 Read 1회 + 정확한 정책 매핑" 필수. OAuth 정책처럼 narrow 룰을 broad 영역에 잘못 일반화 방지.
- (룰 후속) 핸드오프 본문 "LIVE" 단정 시 객관 verify 명시 (예: "LIVE / curl X PASS / DB row 박힘 sha N"). self-attestation 단독 금지.
- (인프라) statusline-command.sh 5노드 sha sync = scp 통일 (claude-skills mirror 별 cycle carry — 핸드오프 carry #2 그대로).
- (인프라 신설 LIVE 본 사이클) `com.daejong.choso-usage-broadcast.plist` = 맥미니 → 4 노드 scp push (5min). 5노드 ~/.choso/ 동기화. `~/choso/scripts/usage_broadcast.sh` 본문 HOSTS=(mac wsl desktop3060ti user@desktop-4mnj1c0-1) — notebook3060 default ssh shell 이 Windows cmd 라 user@WSL-hostname 명시.

## 관련

- 메모리: `reference_anthropic_oauth_token_policy.md`, `feedback_reversible_archive_over_delete_no_ack.md`, `feedback_verify_memory_before_codex_surface.md`
- commit: choso d4def74 (5 ping ctx_pct + db/main/template + usage_broadcast.sh)
- 운영 SoT: `~/.choso/usage_scraped.json` (15min), `~/.choso/account_max.json` (cap), broadcast 5min
- statusline v4: `~/.claude/statusline-command.sh` sha `4e0e1262942eef4a90e1e2faafd687c64937905987c85043324ad717f97a8cf0` (5노드 동일)
