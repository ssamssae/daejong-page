# Someday/Maybe

해야 할 일은 아니지만 언젠가 해도 좋을 것들. 진짜 할 일이 되면 [할일](./todos.html) 로 승격, 아니면 그대로 두거나 드롭. todos 와 분리해서 우선순위 노이즈 없이 따로 모아둠.

## 모아둠

- 🤝 🛠️ **핸드오프 가드 강화 (대안 C)** — Mac `~/.zshrc` 와 WSL `~/.bashrc` 의 claude-main tmux 가드를 "빈 세션 만들기" 에서 "빈 세션 만들고 그 안에 cc 자동 실행" 으로 강화. 현재는 동적 세션 탐색(대안 A) 으로 빈 셸 함정이 우회되고 있어 무리해서 안 해도 작동에 지장 없음. 하면 핸드오프가 한 단계 더 자연스러워짐. 단점: 평소 터미널 시작 흐름 바뀜(cc 자동 실행이 거슬릴 수 있음), 양 기기 가드 동시 변경 필요. 진행 시 합의 필수.  *(추가: 2026-04-26)*

- 🤝 ⚙️ **settings.json allow rule generic 화** — 현재 `handoffs/*` 만 cover 중인 specific Bash rule 을 `issues/` + `worklog/` 등 claude-skills repo 의 다른 sub-dir 도 cover 하게 확장. 2026-04-27 handoff commit harness sandbox false positive 사고에서 첫 paste 한 룰 3개가 handoffs 디렉토리만 매칭하는 한계. issue commit 등 다른 sub-dir 작업 시 같은 false positive 또 발생 가능성. handoff commit 첫 통과 검증 후 다음 진화 단계로 자연스러움. WSL 본진은 경로만 `/home/ssamssae/claude-skills`.  *(추가: 2026-04-27)*

## 승격됨 (→ 할일)

(없음)

## 드롭

(없음)
