# 초소 LIVE 섹션 stale node_task TTL 부재 + hangeul_label bare 단어 junk 노출

- **발생 일자:** 2026-05-23 (1차 발견, msg23018), 2026-05-26 23:11 KST 재현
- **해결 일자:** 2026-05-26 23:30 KST
- **심각도:** low (시각 표시 버그, 데이터/외부영향 0)
- **재발 가능성:** low (코드 forcing function + 테스트 박힘)
- **영향 범위:** queue.kangdaejong.com 5노드 시각 동기화 채널

## 증상

폰 23:11 KST queue.kangdaejong.com 캡처에서 세 가지 동시 관측:

- 본진(🍎) 이 어제 23:13 KST 끝낸 "newsletter(ep20): substack 발행 후 cache + index.json 갱신" 작업이 24시간+ "지금 작업중 LIVE" 섹션에 잔존.
- 상단 5타일 (🏭=🟢 ACTIVE, 나머지 zZ IDLE) 과 하단 "지금 작업중 LIVE" 섹션 mismatch — 🏭 맥미니는 상단 ACTIVE 인데 하단 "대기", 🍎 본진은 상단 IDLE 인데 하단 LIVE 표시.
- 🪟 WSL / 🖥 데스크탑 LIVE 카드에 task 자리에 `ssamssae` / `user` bare username artifact 가 노출됨 (의미있는 task title 없음).

## 원인

- `node_tasks.json` POST entry 에 TTL 부재 — POST 한 task 가 status='done' 처리 안 되거나 ts 신선도 검사 없이 영구 잔류.
- `hangeul_label` (codex-mesh-vote D 안 도입, 영문 → 한글 듀얼 표기) 의 unknown 라벨 fallback 이 원문 그대로 통과 → $USER hook label artifact (`ssamssae`, `user`) 가 LIVE 카드에 그대로 노출됨.
- 상단 타일은 `ping_status` 기반 (heartbeat/event 가까운 활동 검사), 하단 LIVE 섹션은 `live_tasks` 빌더 (node_tasks 우선 + hook fallback) 라 두 데이터 소스가 별 경로. 동기화 보장 0.

## 조치

PR #33 (`desktop/choso-live-mismatch-fix-2026-05-26`, squash commit `d381250`, +153/-2):

- `NODE_TASK_TTL_SEC = 30 * 60` + `NODE_TASK_TERMINAL = {done, blocked, cancelled}` 신설.
- `build_view()` live_tasks 빌더가 `t_ts + t_status` 검사해 만료(30분+) 또는 terminal status 면 hook fallback 으로 전환.
- `hangeul_label`: 공백·슬래시 없는 bare 단일 단어 → `''` 반환 (junk-safe). 기존 known tool 매핑(Edit/Read/Write/Bash/Grep/Glob/WebFetch/WebSearch) 과 branch prefix regex (`macmini|mac|wsl|desktop|notebook`) 는 유지.
- `tests/test_hangeul.py` 에 junk bare word 차단 + slash command 통과 회귀 케이스 추가.
- `tests/test_live_tasks.py` 신규 — fresh / expired (TTL 초과) / terminal status / junk username fallback 4 시나리오 회귀.
- 본진 squash 머지 → 🏭 맥미니 `launchctl kickstart -k gui/$(id -u)/com.daejong.choso-uvicorn` (PID 81926 → 22181) → 127.0.0.1:7777 LIVE 섹션 정합 검증 PASS.

## 예방 (Forcing function 우선)

- 새 LIVE 데이터 소스 추가 시 TTL + terminal status 만료 정책을 코드 레벨에서 동시 명시 — `build_view()` live_tasks 빌더 통과해야 surface 되도록 단일 검사 경로 유지.
- `hangeul_label` 매핑 안 된 unknown bare 단어 fallback 은 디폴트 `''` (junk-safe). 의미있는 새 label 추가 시 known tool dict 에 명시 등록하거나 공백/슬래시 포함 패턴으로 박을 것.
- `tests/test_live_tasks.py` 4 시나리오가 회귀 가드 — 새 라벨 변환 / TTL 정책 변경 시 동일 패턴으로 테스트 케이스 추가.

## 재발 이력

(없음)

## 관련 링크

- PR: https://github.com/ssamssae/choso/pull/33
- 커밋: `d381250`
- todos closure: `~/todo/todos.md` 라인 56 (2026-05-23 1차 발견 entry)
- 1차 분석 시점 (코드 레벨 재현 X): 2026-05-23 22:33 KST 맥미니
