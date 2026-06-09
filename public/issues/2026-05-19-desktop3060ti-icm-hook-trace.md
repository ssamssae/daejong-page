---
date: 2026-05-19
node: 🖥 데스크탑3060Ti
slug: desktop3060ti-icm-hook-trace
status: 동작 확인 (store 거의 0)
tags: [icm, hook, trace, surface, infinite-context-memory]
---

# 🖥 데스크탑3060Ti — icm hook 정체 trace (2026-05-19)

## 한 줄 결과

icm = **Infinite Context Memory** (Rust ELF binary, 31 MB, v0.10.44). 7 Claude Code hook handler 가진 SQLite-backed persistent memory CLI. 데스크탑에서 hook 실행은 작동하지만 실제 store 는 거의 0 — 5월 6일 초기 셋업 후 데이터 정체.

## 사실 (verify 완료)

**실파일**: `~/.local/bin/icm` (31,401,872 byte, 2026-05-06 빌드, user owned)
**버전**: `icm 0.10.44`
**바이너리 타입**: ELF (Rust 빌드 추정)
**자기 description**: "Infinite Context Memory - persistent memory for LLMs"

**Hook subcommand 7개**:
- `pre` — PreToolUse: auto-allow `icm` CLI commands (no permission prompt)
- `post` — PostToolUse: auto-extract context every N tool calls
- `compact` — PreCompact: extract memories from transcript before context compression
- `prompt` — UserPromptSubmit: inject recalled context at the start of each prompt
- `start` — SessionStart: inject a wake-up pack of critical facts into the session
- `end` — SessionEnd: extract memories from transcript before the session closes

**데이터 저장**: `~/.local/share/icm/memories.db` (SQLite, 3,436,544 byte). 마지막 modify 2026-05-20 02:09 (현재 사이클 중 hook 자체는 실행됨).

**데스크탑 사용 통계**:
- Memories: **3건**
- Topics: 2개 (`context-jarvis-mesh` 2건 / `reference-mail-setup` 1건)
- Avg weight 0.953
- Oldest 2026-05-06 15:15 / Newest 2026-05-06 15:38 — **5월 6일 초기 셋업 직후 store 정지**

**데스크탑 settings.json hook 등록**: 5 group (PreToolUse / PostToolUse / PreCompact / UserPromptSubmit / SessionStart 등) 각 1건 — 정상 등록.

**Hook 실행 결과**: `echo '{"tool_name":"Bash"…}' | icm hook pre` → exit 0, stderr 0 byte. `icm hook post` 도 동일.

## Root cause (확정)

icm hook 자체는 작동 — exit 0 으로 silent OK 응답. 그러나 실제 memory store 는 거의 0:

1. post hook 의 자체 description 이 "auto-extract context **every N tool calls**" — N tool call 마다 추출 조건. 사이 호출은 silent skip 디자인.
2. 5/6 셋업 직후 3건 박힌 뒤 그 후 N 조건 미충족 또는 다른 silent skip 으로 store 정지.
3. embedding model 사용 여부 / `--no-embeddings` flag 동작 / N 카운트 임계값 등 정확한 조건은 binary 안에 있어 외부 trace 어려움 (소스 코드 0).
4. 5노드 mesh 중 icm 가 박힌 노드는 데스크탑이 유일 (5/6 단독 셋업 흔적). 본진 / WSL / 맥미니 / 노트북 의 icm 상태는 미verify (cross-routing 룰로 별 사이클 본진 직접 trace).

## 별 사이클 surface (이번 사이클 X — 본진 결정 사안)

1. **데스크탑 icm 유지 여부** — 5/6 셋업 후 거의 미사용. 5노드 mesh SoT 가 `claude-memory` repo (~/.claude/projects/-Users-user/memory/) 라 icm 와 역할 중복 가능성. 정리 or 활용 결정 필요.
2. **본진 icm 상태 verify** — 본진 (🍎 macOS) 에 같은 icm 가 있는지, settings.json hook 등록 양식 / 데이터 store 활용도 / DB 사이즈 비교.
3. **icm vs claude-memory 역할 분리** — icm 는 노드별 로컬 SQLite, claude-memory 는 cross-node git repo. 어느 쪽이 SoT 인지 / 어떤 데이터를 어디에 박는지 정책 문서화.
4. **post hook 의 N 카운트 임계값** — silent skip 으로 store 정체된 게 디자인 의도인지, 임계값 너무 높은 건지 별 trace.

## 추가 호출 흔적 (메모리에 보존할 만한 명령)

```
icm stats / icm topics / icm hook --help
icm recall "<query>" — 검색
icm store --topic <T> --content <C> — 수동 store
ls -la ~/.local/share/icm/memories.db — DB 위치
```

## 결론

icm hook 동작 안 한다는 본진 directive 인지는 절반 맞음: **hook 실행은 OK, store 동작이 거의 0**. silent skip 디자인 또는 N 임계값 미충족 추정. 별 사이클에 본진 결정 사안 4건 박아둠.

[[../memory/feedback_cross_routing_through_master]]
