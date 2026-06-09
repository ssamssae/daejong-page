---
prevention_deferred: null
---

# 노트북3060 claude-skills repo 4 commit stale (issues/INDEX.md UU conflict 사일런트) — "가전" 트리거 룰 누락으로 "에어컨 켜" 발화 무반응

- **발생 일자:** 2026-05-17 ~ 2026-05-18 사이 KST (본진이 b685645 이후 4 commit push, 노트북 sync 실패)
- **발견 일자:** 2026-05-18 14:35 KST
- **1차 조치:** 2026-05-18 14:54 KST (🖥 가 notebook3060-directive.sh 2134 bytes 발사)
- **해결 일자:** 2026-05-19 00:25 KST (🖥 ssh polling 으로 노트북 HEAD b81b0f3 + 가전 라인 reload + 환경 OK 3 항목 검증)
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** notebook3060 챗봇 / claude-skills repo 5노드 sync 흐름 / 가전 트리거 룰 + 2026-05-18 hard rule 다수

## 증상

형님이 노트북 봇 채팅방에서 "에어컨 켜" 발화 → 노트북 챗봇이 트리거 룰을 인식 못 하고 평범 잡담으로 응답. 데스크탑3060Ti / 본진은 같은 발화로 tuya-control.py 정상 트리거. "그럼 노트북 봇은 가전 못 켜냐?" 라는 형님 질문 (텔레그램 id 1365) 으로 발견.

## 원인

노트북3060 의 ~/claude-skills repo 가 issues/INDEX.md UU conflict 한가운데 멈춰있어 자동 git pull 막힘. 본진 최신 HEAD b81b0f3 보다 4 commit 뒤처진 b685645 에 고정. 그 사이 본진이 globals/CLAUDE.md 에 추가한 "가전" 트리거 한 줄 (물 한 잔 / 정수기 / 선풍기 꺼·켜 / 에어컨 꺼·켜 / 조명 꺼·켜 → tuya-control.py 즉시 호출) 이 노트북에 미반영. ~/.claude/CLAUDE.md 가 globals/CLAUDE.md symlink 라 노트북 챗봇이 매 turn 로딩하는 본체 자체가 stale.

근본 원인: issues/INDEX.md 가 매 issue 저장 시 regen_index.py 가 전체 덮어쓰기로 재생성하는 파일. 5노드 환경에서 여러 노드가 거의 동시에 issue 작성 → entry 순서/추가분 차이로 자동 conflict 빈번. 그리고 conflict 발생 시 노드 챗봇이 self-surface 못 하고 사일런트 stale 유지하면서 다른 핵심 룰까지 같이 누락. 관련: 2026-05-17-tuya-memory-concurrent-write-conflict.md (두 노드 동시 쓰기 충돌은 유사, 단 그건 즉시 surface, 이번 건 사일런트).

부가 누락: 2026-05-18 hard rule "Anthropic API 토큰/비용 영향 작업 사전 ack" + "사용자 셸 RC 파일 변경 ack" + "claude-memory/claude-coord PR 정책 예외" 모두 노트북 미반영. globals/CLAUDE.md 하나에 박혀있어 partial sync 불가 — 가전 라인 reload 됐다면 부수 룰도 동시 반영.

## 조치

1. 🖥 데스크탑3060Ti 가 ssh 로 notebook3060 진단 (14:54 KST 직후).
2. 🖥 가 형님께 옵션 풀어 묻기 → 형님 (가) 정석 선택 (텔레그램 id 1369).
3. 🖥 가 notebook3060-directive.sh 로 노트북 챗봇에 self-fix directive 2134 bytes 발사 (14:54 KST).
4. mac-report.sh 로 본진에 진단/조치/forcing function 안 4253 bytes 보고 (1차).
5. 본진 + 🖥 2차/3차 보고 통한 forcing function 결정 트랙 진행.
6. 노트북 챗봇 self-fix: 31분 소요 (14:54 → 15:25 KST), INDEX.md UU conflict resolve + git pull --rebase + verify 자율 처리.
7. 🖥 4차 보고로 검증 완료: HEAD b81b0f3 + 가전 라인 line 203 reload + tuya 환경 OK.

## 예방 (Forcing function 우선)

본질 원인 = "노드 챗봇이 자기 repo stale/conflict 를 자기가 surface 못 한다". 본진 + 🖥 동의안 (1') SessionStart sync-health hook (zoom-in, 세션 첫 turn) + (3) OS cron sync-health dashboard (zoom-out, 5/10분마다 5노드 HEAD 수집 → 본진 텔레그램 alert) 조합 mesh-vote 부쳐 5노드 영구 박기 결정 (형님 (다) 결정 id 1382 + 통째 위임 id 1385 + 최종 박기 ack id 19700).

(2) issues/INDEX.md regen 흐름 안전화 (append-only) 는 별 사이클 분리.

(1) PreToolUse 매 turn hook 은 Anthropic API 비용 hard rule 위반 위험으로 후보 제외.

mesh-vote 결과 도출 + 5노드 영구 박기 진행 후 본 이슈에 재발 이력으로 후속 박제 예정.

부수 인사이트 (🖥 4차 보고 인용): "self-fix directive 자체는 통하나, 사일런트 stale 단계가 사용자 (형님) 발견 = 외부 트리거에 의존" — 즉 self-fix 메커니즘은 노드 단에서 동작 검증됨, 그러나 트리거 자체가 자동화되어있지 않음. 위 mesh-vote 결정 안이 바로 이 트리거 자동화 forcing function.

## 재발 이력

(처음 생성 시 비워둠)

## 관련 링크

- 관련 이슈: 2026-05-17-tuya-memory-concurrent-write-conflict.md (두 노드 동시 쓰기 충돌, surface 된 케이스)
- 관련 이슈: 2026-05-16-stale-recover-loss.md (sync 흐름 stale 패턴)
- 텔레그램 (chat 538806975): id 1365 → 1366 → 1368 → 1369 → 1370+1371 → 1375 → 1378 → 1380 → 1381 → 1382 → 1383 → 1384 → 1385 → 19696 → 19700
- 노트북 directive: notebook3060-directive.sh 2134 bytes (2026-05-18 14:54 KST)
- 본진 보고: mac-report.sh 4253 bytes (1차) + 3548 bytes (2차) + 4차 검증 보고
