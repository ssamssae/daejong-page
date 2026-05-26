# hook archive 표준화 후 5노드 settings.json refs cleanup 누락 (handoff-check.sh 잔재)

- **발생 일자:** 2026-05-25 09:15 KST (archive 시점) → 2026-05-26 23:48 KST 노트북 시각 노이즈로 발견
- **해결 일자:** 2026-05-26 23:55 KST (3노드 cleanup directive PASS)
- **심각도:** low (시각 노이즈, 동작 영향 0)
- **재발 가능성:** medium (다른 hook archive 사이클에 같은 함정 가능)
- **영향 범위:** 5노드 settings.json Stop hook 체인 일관성

## 증상

매 turn `Stop hook error: handoff-check.sh: No such file or directory` 시각 노이즈. 5노드 점검:

- 🍎 본진 / 🖥 데스크탑 — settings.json refs 깨끗 (이미 cleanup)
- 🏭 맥미니 (line 194) / 🪟 WSL (line 180) / 💻 노트북 (line 255) — stale 참조 남음

handoff-check.sh 실파일은 양 자동화 repo 의 `_disabled/` 에 4846 bytes 동일하게 archive 됨 (의도된 비활성화).

## 원인 (추정)

- 2026-05-25 09:15 KST `handoff-check.sh` archive. mesh-vote D 다수결, 사유 = 코드블록+슬래시+기기명 광범위 패턴 false positive 로 자연어 답에 자주 BLOCK. 자연어 디폴트 룰 + 복붙 단독 메시지 룰 박힌 후 forcing function 가치 거의 0. 가역 archive 룰 ([[feedback_reversible_archive_over_delete_no_ack]]) 자체는 준수.
- 그러나 archive 사이클이 `_disabled/` 이동 + `RETIRED.md` 라인 1개 추가까지만 표준화. **settings.json Stop hook 체인의 refs cleanup 단계가 archive 룰에 명시 안 됨** → 본진/데스크탑 2노드만 cleanup 됨 (직접 사이클 또는 우연 처리), 3노드 cleanup propagation 누락.
- settings.json 은 노드별 local 파일 — git tracked X, symlink X, 자동 sync 채널 0. 한 노드 수정해도 다른 노드 자동 동기화 안 됨. archive 사이클이 자기 노드만 처리하면 나머지 노드 stale 잔존하는 메커니즘.

## 조치

본진 자율 3노드 cleanup directive 발사 (handoff-check-cleanup.txt, 1.6KB):

- 🏭 맥미니: line 192-196 5줄 element 제거 (백업 `.bak-handoff-cleanup`).
- 🪟 WSL: line 178-182 4줄 블록 제거.
- 💻 노트북: line 253-257 5줄 element 제거 (`/tmp/settings.json.bak.20260526-235232` 백업).

각 노드 검증: `grep -n handoff-check ~/.claude/settings.json` → 0줄 + `python3 -c "import json; json.load(...)"` → JSON valid. 인접 hook element (telegram-reply-check / mac-report-reverse-reply-check / activity-writer 등) 무손상.

부정확 가정 1건: 본진 디렉티브 본문에 "settings.json 은 git tracked 가역" 박았는데 노트북에선 `~/.claude` 가 git repo 아님. 가역은 백업 + Edit diff 로 가능. 다른 노드도 같은 가정 잘못 적용 가능 — 노트북이 catch.

## 예방 (Forcing function)

- hook archive 룰에 "5노드 settings.json refs cleanup" 단계 명시 — `_disabled/RETIRED.md` 한 줄 추가 시 같은 사이클에 `grep -n <hook>.sh ~/.claude/settings.json` 5노드 점검 후 stale 노드 directive 발사 의무. 본진/맥미니/데스크탑/WSL/노트북 5개 다.
- 또는 노드 시작 시 자동 validator hook — settings.json 의 모든 bash hook path 가 실파일 존재 여부 검증. 부재면 stderr warning + 노드 시작 통과 (블록 X). 매 turn 노이즈가 자체 forcing function 이긴 한데 사일런트 노드는 검출 어려움.
- settings.json 가정 정정: "git tracked" 보편 가정 폐기. 본진(symlink) 외 노드는 `~/.claude` 가 git repo 아닐 수 있음. directive 본문은 백업 (cp .bak) + Edit diff 의 가역 경로로 통일.

## 재발 이력

(없음)

## 관련 링크

- archive RETIRED.md 라인: `~/.claude/hooks/_disabled/RETIRED.md` 2026-05-25 09:15 KST
- 본 사고 직전 todos closure: `~/todo/todos.md` (handoff-check 자체 todo 별 entry 없음, 노트북 stop hook fail 보고로 surface)
- 메모리: [[feedback_reversible_archive_over_delete_no_ack]]
- 유사 패턴 이슈: `2026-05-19-stop-chain-fail-stop-analysis.md`
- 디렉티브 fan-out: 3노드 cleanup PASS — 🏭 맥미니 / 🪟 WSL / 💻 노트북 mac-report 보고 도착 2026-05-26 23:50~23:55 KST
