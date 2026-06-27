# graphify install A안 정의 모호 → 공유 globals/CLAUDE.md 오염 사고

- 날짜: 2026-06-09 (KST)
- 노드: 🖥 데스크탑(사고 발생) / 🏭 맥미니(오케스트레이터·수습) / 💻 노트북(차단 조치)
- 분류: 멀티노드 롤아웃 / 공유 글로벌룰 오염 / 프롬프트 정합성
- 심각도: 중 (전파 직전 차단, 실피해 0)

## 증상

graphify(코드→knowledge graph AST tier, 무료) 5노드 롤아웃 중, 데스크탑이 `graphify install --platform claude`를 실행해 **전 노드 공유** `claude-skills/globals/CLAUDE.md`에 `/graphify` 트리거 3줄을 추가하고 repo 루트에 `graphify/` 스킬 디렉토리를 생성. 같은 롤아웃에서 라이덴은 install을 안 하고 바이너리만 깔아(안1) **노드별 해석이 정반대로 갈림**.

**라이덴(오늘 2026-06-09) 동일 재발**: 어제 데스크탑 사고 후 codex-mesh-vote 로 안1(install 금지) 을 결정·5노드 통일했는데도, 오늘 라이덴에서 graphify 설치 서브커맨드를 또 실행해 같은 공유 globals 가 또 오염됨. **정책 결정만으론 재발한다**는 걸 실증 — 사람이 지키는 결정이 아니라 기술적 강제장치가 있어야 막힌다.

## 근본 원인 (2중)

1. **프롬프트 정합성 결손**: graphify 롤아웃 작업을 노드에 돌릴 때 A안의 핵심 제약("install 미실행 = 하니스/공유 config 무변경, 바이너리만 + 수동 `graphify update`")을 프롬프트에 명시하지 않음. "graphify AST tier 도입" 수준의 모호한 지시 → 데스크탑은 "install 하되 자동 훅만 빼면 A안"으로, 라이덴은 "install 자체를 안 함"으로 해석. tasks.md 마킹(T-260608-67)도 "4노드 A안 per-node 적용"만 적고 install 금지를 명시 안 함.
2. **심링크로 install이 공유 repo를 오염**: `~/.claude/skills → ~/claude-skills`(repo 전체) 심링크 구조라, `graphify install --platform claude`가 만든 산출물이 (a) `~/claude-skills/globals/CLAUDE.md`(전 노드 symlink + 매 turn 로딩 핵심 글로벌룰)에 트리거를 박고 (b) skills/graphify가 아니라 **repo 루트** `~/claude-skills/graphify/`에 박힘. install 도구가 개인 하니스가 아니라 공유 SoT를 건드리는 구조를 사전에 인지 못 함.

## 영향 / 위험

- `globals/CLAUDE.md`는 5노드 symlink 공유 + 매 turn 로딩. 본진·맥미니는 claude-skills main 직접 push 권한이 있어, 오염된 채 무심코 push되면 **전 노드로 graphify 트리거가 전파 + 매 turn 토큰 증가**(영구 비용)가 됐을 것.
- 데스크탑은 prefix 브랜치라 변경이 미커밋(working tree M) 상태 → 실제 전파는 0이었음(운+격리).

## 차단·수습 경위

1. 노트북이 본진·맥미니 수동워커 토글 OFF → graphify install 큐가 push 권한 노드로 발사되는 고위험 경로 차단.
2. 맥미니가 데스크탑 working tree 실측(`M globals/CLAUDE.md`, origin 미반영) → 전파 0 확인.
3. codex-mesh-vote(본진 노드매핑)로 A안 표준 결정: **안1 만장일치**(codex 4/4). Gemini(안2)·DeepSeek(하이브리드) 이질표는 "globals 건드리는 한 같은 전파 리스크"로 기각.
4. 데스크탑 원복: `git checkout -- globals/CLAUDE.md`(트리거 제거, M 해소) + `rm -rf ~/claude-skills/graphify`(루트 산출물) + 바이너리 유지. git status clean 검증.
5. 노트북·라이덴·본진·맥미니는 이미 안1(바이너리만/미install) 실측 확인 → 5노드 안1 통일.

## 결정 (5노드 표준)

**안1**: 바이너리(`uv tool graphifyy`)만 설치, `graphify install`은 안 함, 공유 globals/CLAUDE.md 무변경, AST tier는 수동 `graphify update <repo>`(무료). 근거: 공유 글로벌룰 오염·전파·매-turn 토큰 영구비용 회피, /graphify 트리거 편의는 그 비용 대비 작음.

## 재발 방지

1. **멀티노드 install/설치성 작업 게이트**: 노드에 "install / 설치 / 도입" 류 작업을 위임할 때, 프롬프트에 **"공유 config·하니스(globals/CLAUDE.md, .claude, git훅) 변경 여부"를 명시적으로 박는다**(변경 0 / 변경 허용 중 택1). 모호하면 노드별 해석이 갈린다.
2. **install 도구의 공유 repo 오염 사전 점검**: `~/.claude/skills → ~/claude-skills` 심링크 탓에, `.claude` 대상 install 류가 공유 repo(globals + 루트)를 건드릴 수 있다. install 류 도입 전 "이 도구가 공유 SoT를 건드리나?" 1회 점검.
3. **push 권한 노드 우선 차단**: 공유 글로벌룰을 건드릴 수 있는 작업은 main 직접 push 권한 노드(본진·맥미니)부터 토글/수신 차단(전파 반경이 가장 큼).
4. **PreToolUse 훅 `graphify-install-guard.sh`** (claude-automations 28487ff, 5노드 settings.json Bash matcher 등록): graphify 설치 서브커맨드 실행을 차단(forcing function). 정책(안1)만으론 라이덴에서 재발했으므로 기술적 강제장치로 박음. 단위테스트 8/8 PASS(`uv tool install graphifyy`·`graphify update`·`graphify explain` 은 미차단, 설치 서브커맨드만 차단). 탈출구 `GRAPHIFY_INSTALL_OVERRIDE=1`(의도된 설치만 통과).
5. **auto-use wrinkle**: mesh-vote 승자는 B(repo-local `.claude/skills` auto-use)였으나, 노드 세션이 home cwd 에서 돌아 repo-local 설정이 자동 발동 불가 → auto-use 미채택, **수동 운용으로 확정**(T-260609-06 P2). '좋은 설계' 도 실행 환경(세션 cwd)과 안 맞으면 미채택.
6. **차단 훅 over-match(false positive) 주의**: 훅이 Bash command 문자열의 `graphify <서브커맨드>install` 패턴을 매치하므로, 명령을 실행이 아니라 **텍스트로 전달**하는 경우(디렉티브 설명문/echo/doc 에 명령어 문자열이 섞인 경우)까지 매치될 수 있음 → 전달 텍스트 sanitize 필요(보안 분류기의 cyber 어휘 회피와 동형). 향후 훅 정교화 여지 = 실제 invocation 과 인용을 구분.

## 관련

- 결정: codex-mesh-vote (본진 노드매핑, 안1 만장일치)
- tasks: T-260607-03(graphify 도입 decision) / T-260608-67(노드 롤아웃)
- 글로벌룰: Anthropic 비용 사전경고 / 작업 지시 전 스테일·정합 확인
