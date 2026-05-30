---
title: "TOML config 에 root 키 추가 — file 끝 append 는 직전 [section] subkey 로 잡힌다"
tags: [toml, config, codex, sed, edit-tool, section-trap, ini, yaml]
date: 2026-05-30
---

# TOML config 에 root 키 추가 — file 끝 append 는 직전 [section] subkey 로 잡힌다

`config.toml` 에 root-level 키(예: `sandbox_mode = "danger-full-access"`)를 추가할 때 단순히 파일 끝에 `>>` append 하거나 Edit 툴로 file 마지막에 붙이면, 그 라인이 **직전 `[section]` 헤더의 하위 키로 잡힌다**. TOML 문법상 `[section]` 다음에 오는 모든 라인은 다음 `[section]` 이 나오기 전까지 전부 그 섹션 영향권 안이기 때문이다.

## 증상

codex 가 root 의 `sandbox_mode` 를 못 읽어 YOLO(danger-full-access) 가 미적용된다. 파일을 열어보면 키는 분명히 들어가 있는데, 바로 위에 `[hooks.state.*]` 같은 table 헤더가 있어서 실제로는 `[hooks.state].sandbox_mode` 라는 엉뚱한 nested 키가 되어 있다. `[features]` 같은 섹션을 끝에 또 추가하면 같은 섹션이 두 번 선언되는 중복 사고로도 번진다.

## 원인

section 기반 설정 파일에서 "파일 끝"은 "root scope"가 아니라 "마지막 섹션의 scope"다. append 는 위치상 항상 마지막 섹션 안으로 들어간다. 2026-05-25 codex 5노드 config.toml YOLO 마이그레이션에서 같은 함정이 **한 사이클에 3번** 반복됐다 — 본진 `[features]` 중복, WSL `[features]` 중복, 데스크탑 `sandbox_mode` 가 직전 `[hooks.state]` subkey 로 흡수.

## 해결

- root 키는 **파일 맨 위에 prepend** 하거나, 다른 root 키 바로 옆(아직 어떤 `[section]` 도 안 나온 영역)에 박는다.
- Edit 툴의 "파일 끝 append" 를 root 키에 쓰지 않는다. 추가하려는 라인의 바로 위가 어느 `[section]` 영향권인지 먼저 확인한다.
- 새 섹션 키라면 명시적으로 `[새섹션]` 헤더를 직접 써준다.

## 재발 방지

추가 직후 1회 검증:

```bash
python3 -c "import tomllib; tomllib.loads(open('config.toml').read())"
```

또는 codex 를 실제로 재시작해 키가 root 로 읽히는지 동작 확인. INI · YAML · nested TOML 등 **형식 무관하게 section 기반 설정 파일은 전부 같은 위험**을 가지므로 일반화해서 기억해 둔다. 같은 함정이 한 사이클에 3번 반복된 메타 함정 카테고리라, "설정 파일 끝에 append" 라는 reflex 자체를 의심하는 게 핵심이다.
