---
date: 2026-05-25
title: TOML config sed/Edit 시 file 끝 append = 직전 [table] subkey 로 잡힘 (3회 반복)
status: postmortem
tags: [codex, toml, config, sed, edit]
---

# 사고 요약

2026-05-25 KST 20:21~21:40 codex 5노드 셋업 중 config.toml 수정 시 root 키를 file 끝에 append 했더니 직전 `[table]` 의 subkey 로 잡혀 codex 가 무시한 사고가 **3회 반복**됨.

## 발생 노드 / 사고 3회

1. **본진** — `codex_hooks` → `features.hooks` 마이그레이션 도중 `[features]` 섹션 중복 작성. file 끝 append 한 새 `[features]` 가 기존 `[features]` 와 충돌해 codex 가 둘 다 무시. 정정 후 OK.
2. **데스크탑3060ti** — `sandbox_mode = "danger-full-access"` 를 file 끝에 append. 그런데 line 70 직전이 `[hooks.state.*]` table 이라 sandbox_mode 가 그 table 의 subkey 로 잡힘. 형님 지적 "WSL/노트북은 어떻게 안 뜨냐" 후 root 영역 prepend 로 정정 + `approval_policy = "never"` 동반.
3. **WSL config 마이그레이션 중간** — `[features]` 중복 작성 사고 1회 (본진 사고와 같은 패턴, 정정 1번에 해결).

## Root cause

TOML 파일에 root-level 키를 추가할 때 단순 `>> config.toml` append 또는 Edit 의 file 끝 추가는 **직전 `[section]` 헤더의 영향권 안에 들어감**. TOML 문법상 `[section]` 헤더 다음 줄들은 모두 그 section 의 subkey 로 해석. root 키를 원하면 명시적으로 새 `[other-section]` 헤더로 분리하거나 file 맨 위 (prepend) 에 박아야 함.

## Fix pattern

- root 키 추가 = **file 맨 위 prepend** 또는 명확히 root section 영역 (다른 root 키 옆) 에 박기
- Edit tool 사용 시 file 끝 append 자제 — 직전 라인이 어느 `[section]` 영향권인지 확인 의무
- 추가 후 `python3 -c "import tomllib; tomllib.loads(open('config.toml').read())"` 으로 1회 검증

## Memory 박은 곳

`feedback_toml_config_root_vs_subkey.md` (5노드 SoT 후보).

## 다음 사이클 forcing function

TOML / INI / YAML 등 section-based 설정 파일 수정 시 PreToolUse hook 으로 "file 끝 append 시 직전 section 헤더 경고" 검토 — 우선순위 낮음, 메모리만으로 충분히 forcing.
