---
date: 2026-05-25
title: codex-mirror-forward.sh v1→v4 진화 — background race + over-capture 2 사고
status: postmortem
tags: [codex, mirror, helper, bash, awk]
---

# 사고 요약

2026-05-25 KST 20:21~21:40 codex 5노드 셋업 후 Codex Mesh Mirror 그룹 (chat_id -5069144185) 으로 codex 응답을 자동 forward 하는 `codex-mirror-forward.sh` 작성. v1~v4 까지 진화하면서 2 카테고리 사고 발생.

## 사고 1: background fork race (v1 → v2)

**v1 패턴**: capture-pane tail -40 통째로 background subshell + disown 으로 forward.
**현상**: 본진 응답이 그룹 chat 에 안 도착. silent fail.
**Root cause**: 본진 turn 종료 시점에 background subshell 이 SIGHUP 받아 silent 죽음. disown 만으론 부족.
**Fix (v2)**: foreground 로 prompt + 본문은 background nohup, /tmp/codex-mirror-*.log 로 debug. 본진 turn 끝나도 background 가 살아남아 forward 성공.

## 사고 2: codex 응답 over-capture (v2 → v3 → v4)

**v2 결과**: 응답 도착 PASS. 하지만 CLI 박스 (`╭───╮`), placeholder (`› `), status line (`gpt-5.5 thinking ...`) 다 묶여서 forward.
**형님 지적**: "본문만 가져와야 함"
**v3 패턴**: awk 로 마지막 `•` 마커부터 다음 `› ` 직전까지 추출.
**v3 결과**: 본진/WSL/데스크탑/노트북 13~16 bytes 깔끔. 맥미니만 339 bytes (Explored hook 동작 + 가로줄 ── 다 묶여서 사고).
**Root cause**: 맥미니는 codex Explored hook 동작 후 가로줄 (`──`, `━━`) 이 응답 본문 뒤에 붙음. awk 가 `› ` 만 종료 트리거로 잡아서 가로줄/Explored 출력 다 흡수.
**Fix (v4)**: `•` 새로 만나면 buf 리셋 + 종료 트리거 다중화 — `› ` placeholder / `──`·`━━` 가로줄 / `gpt-` status line 중 어느 거든 만나면 종료. 맥미니 339→14 bytes (24배 감소) PASS.

## 검증 결과

마지막 PROBE 5통 — 🍎 PASS / 🪟 PASS / 🏭 PASS (fix 후 14 bytes) / 🖥 PASS / 💻 PASS.

## 박은 곳

- 메모리: `reference_codex_mirror_helper_pattern.md` (helper 패턴 박제)
- 메모리: `project_codex_mesh_mirror_group.md` (그룹 정체 박제)

## 교훈

1. **background fork race**: subshell + disown 만으론 silent 죽을 수 있음. foreground 발사 + background 만 nohup + /tmp log debug = 정답 패턴.
2. **응답 본문 추출**: 단순 tail -N 으론 부족. awk 마커 + 종료 트리거 **다중화** 의무 (한 트리거만 박으면 hook 동작/가로줄/status line 등 over-capture).
3. **노드별 차이**: 같은 codex CLI 도 노드별 hook 설정 따라 출력 패턴 다름. 5노드 다 동일 패턴 가정 X — 1 노드씩 검증 의무.
