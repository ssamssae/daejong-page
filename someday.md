# Someday/Maybe

해야 할 일은 아니지만 언젠가 해도 좋을 것들. 진짜 할 일이 되면 [할일](./todos.html) 로 승격, 아니면 그대로 두거나 드롭. todos 와 분리해서 우선순위 노이즈 없이 따로 모아둠.

## 모아둠

- 🤝 🛠️ **핸드오프 가드 강화 (대안 C)** — Mac `~/.zshrc` 와 WSL `~/.bashrc` 의 claude-main tmux 가드를 "빈 세션 만들기" 에서 "빈 세션 만들고 그 안에 cc 자동 실행" 으로 강화. 현재는 동적 세션 탐색(대안 A) 으로 빈 셸 함정이 우회되고 있어 무리해서 안 해도 작동에 지장 없음. 하면 핸드오프가 한 단계 더 자연스러워짐. 단점: 평소 터미널 시작 흐름 바뀜(cc 자동 실행이 거슬릴 수 있음), 양 기기 가드 동시 변경 필요. 진행 시 합의 필수.  *(추가: 2026-04-26)*

- 🤝 ⚙️ **settings.json allow rule generic 화** — 현재 `handoffs/*` 만 cover 중인 specific Bash rule 을 `issues/` + `worklog/` 등 claude-skills repo 의 다른 sub-dir 도 cover 하게 확장. 2026-04-27 handoff commit harness sandbox false positive 사고에서 첫 paste 한 룰 3개가 handoffs 디렉토리만 매칭하는 한계. issue commit 등 다른 sub-dir 작업 시 같은 false positive 또 발생 가능성. handoff commit 첫 통과 검증 후 다음 진화 단계로 자연스러움. WSL 본진은 경로만 `/home/ssamssae/claude-skills`.  *(추가: 2026-04-27)*

- 🤝 🛡 **telegram-reply hook 검사 추가 (fenced 외 평문 paste 인용 detection)** — 현재 `~/.claude/hooks/telegram-reply-no-raw-id.sh` 는 fenced 안 명령 + 외부 한국어 sentence 동시 검출만 차단. fenced 없이 본문 평문에 명령어/JSON 인용한 경우는 못 잡음. 8번째 재발(2026-04-27 21:01 KST) 방지 강화 후보. 강대종님 컨펌 후 진행 예정이었던 것. false positive 트레이드오프 검토 필요.  *(추가: 2026-04-27)*

- 🤝 🛠 **신규 앱 repo 추가 스킬에 "양 기기 settings.json allow 룰 추가" step 박기** — hanjul push 차단 사건(2026-04-27 22:08 KST) 같은 것이 다른 앱 도입 시 재발 가능. 신규 앱 등록 시 Mac/WSL 양쪽 settings.json 에 push allow 룰 자동 박는 step 운영 패턴화. 아래 wildcard 룰 항목과 보완 또는 택일.  *(추가: 2026-04-27)*

- 🤝 🛠 **settings.json wildcard 룰 1개로 ~/apps/ 통합 커버** — `Bash(cd ~/apps/* && git push*)` 같은 패턴 한 줄로 ~/apps/ 하위 모든 앱 push 자동 허용. 위 신규 앱 추가 스킬 자동화의 더 가벼운 대안. 단점: 앱별 세분 통제 X. 양 기기 동시 박기 필요. 진행 시 합의.  *(추가: 2026-04-27)*

- 🤝 📝 **paste-block 재발 사례 7·8번째 텔레그램 outbox 스캔으로 복구** — 메모리 `feedback_paste_blocks_as_separate_message.md` 의 recurrences 4·5·6 까지만 시각/내용 박혔음. 7·8 은 prior session 이 issue 작성 시 미기재 (2026-04-27 21:00 ~ 21:01 KST 즈음 추정). 텔레그램 outbox mtime 기준 검색으로 복구 가능. forcing function 강화 위해 데이터 보존.  *(추가: 2026-04-27)*

- 🤝 🧹 **globals/CLAUDE.md 미커밋 commit** — Karpathy 4룰 변경이 `~/.claude/CLAUDE.md → globals/CLAUDE.md` symlink 통해 claude-skills 미커밋 변경으로 잡혀있음. Mac/WSL 양 기기 동기화 완료된 지금이 commit 적기. 한 줄 `git add + commit + push` 면 끝. 단순 정리.  *(추가: 2026-04-27)*

## 승격됨 (→ 할일)

(없음)

## 드롭

(없음)
