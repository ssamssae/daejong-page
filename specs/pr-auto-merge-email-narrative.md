# PR 자동 머지 알림 메일 — 자연어 요약 본문 추가 spec

- 작업 ID: T-260524-49
- 작성: 🏭 맥미니, 2026-05-29 (autopilot 사이클 #1)
- 범위: **spec only**. 이 문서는 설계만 정의한다. Actions YAML 수정·메일 발송·hook 코드 변경은 별도 ack 큐 항목이다.
- 대상 워크플로우: `~/daejong-page/.github/workflows/auto-merge.yml` (노드 prefix PR 자동 squash 머지)

---

## 1. 문제 정의

노드(🪟🏭🖥💻🍎) prefix 브랜치 PR 이 GitHub native auto-merge 로 squash 머지되면,
형님은 GitHub 가 main 브랜치 push 에 대해 보내는 **기본 알림 메일**을 받는다.
이 메일은 커밋 제목·diff stat·변경 파일 목록만 담겨 있어, PR 이 *무엇을 왜* 바꿨는지
한눈에 들어오지 않는다. 형님 입장에서 "이 PR 이 뭘 한 거지?" 를 알려면 GitHub 를 직접 열어야 한다.

목표: 머지 알림에 **1~3문장 자연어 요약**을 더해, 메일만 보고도 PR 의도를 파악할 수 있게 한다.

검증 가능한 완료 기준: 임의 PR 번호를 인자로 주면 자연어 요약 문장을 stdout 으로 출력하는
dry-run 스크립트가 외부 발송 0·API 호출 0 으로 동작 (§6).

---

## 2. 현행 양식 인용

현행 `auto-merge.yml` 은 메일을 *직접* 보내지 않는다. `gh pr merge --squash --auto` 로
GitHub native auto-merge 만 켠다. 체크 통과 후 GitHub 가 squash 커밋을 main 에 push 하면,
GitHub 가 watch 설정에 따라 push 알림 메일을 발송한다. 그 메일이 형님이 받는 "머지 알림 메일"이다.

squash 커밋 메시지는 `gh pr merge` 에 `--subject`/`--body` 를 주지 않으므로 GitHub 기본값:
제목 = PR 제목, 본문 = 커밋 메시지 bullet 목록.

현행 알림 메일 예시 (PR #162 머지 가정):

```
Subject: [user/daejong-page] docs(spec): 맥미니 ~/.claude/automations git repo 화 spec (T-260510-08) (#162) (f638fc5)

  docs(spec): 맥미니 ~/.claude/automations git repo 화 spec (T-260510-08) (#162)

  * docs(spec): automations repo 화 초안
  * docs(spec): dry-run path 추가

 M specs/automations-git-repo.md
 A specs/automations-rollback.md

@@ -0,0 +1,210 @@
... (diff 본문) ...
```

즉 메일에는 (a) 제목 한 줄 (b) 커밋 bullet (c) `M`/`A` 파일 목록 (d) raw diff 만 있고,
**"이 PR 이 무엇을 왜 했는지"** 를 풀어쓴 문장은 없다.

---

## 3. 자연어 요약 섹션 추가 양식

squash 커밋 본문 **맨 위**에 아래 한 블록을 prepend 한다 (커밋 본문에 들어가므로 메일 본문 상단에 노출됨):

```
📝 요약: 이번 PR 은 <대상> 을(를) <동작> 하기 위해 <N>개 파일을 변경했습니다.
        <보조 문장 0~2개>

<기존 커밋 bullet 목록 그대로>
```

- 1문장 필수 + 보조 0~2문장. 총 1~3문장 hard cap (장황 방지).
- `<대상>` = conventional commit scope (`docs(spec)` → "spec", `feat(lotto)` → "lotto").
  scope 없으면 변경 파일 최상위 디렉토리로 대체.
- `<동작>` = commit type 매핑: `feat`→"추가", `fix`→"수정", `docs`→"문서화",
  `refactor`→"리팩토링", `chore`→"정리", `test`→"테스트 보강".
- `<N>` = 변경 파일 수.
- 보조 문장 = 커밋이 2개 이상이면 "주요 변경: <두 번째 커밋 subject>" 1줄 추가 (선택).

예시 (PR #162):

```
📝 요약: 이번 PR 은 spec 을 문서화하기 위해 2개 파일을 변경했습니다.
        주요 변경: automations repo 화 초안.
```

---

## 4. 자동 요약 생성 path — 두 option 비교

### (a) LLM 호출 (Claude / codex API)

- 입력: PR diff + 커밋 메시지 → 모델이 요약 1~3문장 생성.
- 품질: 높음. diff 의미를 읽어 "왜" 까지 추론 가능.
- 비용/리스크: **치명적 결함** — 현행 `auto-merge.yml` 헤더 주석(2026-05-24 형님 ack)이
  명시적으로 "Claude API 호출 0" 을 설계 원칙으로 박았다. 이유는 2026-06-15 Anthropic 빌링
  분리에서 "Claude Code GitHub Action" 이 별도 monthly credit pool 을 잡아먹기 때문.
  LLM path 는 이 워크플로우가 의도적으로 회피한 비용 카테고리를 그대로 부활시킨다.
  머지마다 API 호출 → 노드 prefix PR 빈도(하루 수~수십 건) × 토큰 = 무시 못 할 누적 비용.
- 추가 리스크: GitHub Actions runner 안에서 API 키 secret 노출 + 외부 호출 = 비결정적
  (모델 출력이 매번 다름, dry-run 재현성 낮음).

### (b) 정적 템플릿 + commit message 추출

- 입력: PR 제목·커밋 메시지·변경 파일 목록 (전부 `gh pr view --json` 으로 취득).
- 처리: conventional commit prefix 파싱 → §3 템플릿 슬롯 채우기. 순수 문자열 가공.
- 품질: 낮음~중간. "왜" 추론은 못 하고 commit 메시지가 담은 만큼만 풀어씀.
  단, 노드 PR 은 conventional commit 컨벤션을 이미 따르므로 scope/type 추출 신뢰도 높음.
- 비용/리스크: **0**. API 호출 0, secret 0, 결정적 출력 (같은 PR → 항상 같은 요약).
  현행 워크플로우의 "Claude API 호출 0" 설계 원칙 그대로 유지.

---

## 5. 추천안 + 적용 위치

### 추천: **(b) 정적 템플릿** + **GitHub Actions step 적용**

근거: 이 워크플로우의 존재 이유 자체가 "anthropic action 호출 0 으로 빌링 카테고리에서 빠진다"
는 것이다(yml 헤더). LLM path(a)는 그 단 하나의 설계 전제를 깬다. 품질이 다소 낮아도
비용 0·결정적·기존 설계 보존인 (b)가 비용/품질 트레이드오프에서 명확히 우세.
요약 품질이 부족하면 나중에 보조 문장 규칙을 늘려 점진 개선 가능(가역).

### 적용 위치 비교

| 위치 | 동작 | 평가 |
|------|------|------|
| **GitHub Actions step** (추천) | auto-merge step 에서 `gh pr view --json` 로 메타 취득 → 템플릿 생성 → `gh pr merge --auto --squash --subject ... --body "<요약>\n\n<기존 bullet>"` 로 머지 커밋 본문에 prepend | auto-merge 흐름과 같은 곳, 추가 인프라 0. `--auto` 가 체크 통과까지 머지를 deferred 해도 `--body` 는 머지 시점에 반영됨. **권장** |
| merge hook (본진 로컬) | 머지 후 로컬 hook 이 요약 생성 | ❌ auto-merge 는 GitHub 서버에서 일어나므로 본진 로컬 hook 이 안 fire. 부적합 |
| 외부 cron | 머지된 PR 폴링 → 별도 요약 메일 발송 | 가능하나 가장 복잡 — 별도 메일 발송 채널·SMTP·dedup 필요 + 외부발신 룰(형님 폰 사전 알림) 적용. over-engineering. 비추 |

결론: GitHub Actions step 안에서 squash 커밋 `--body` 를 가공하는 게 가장 국소적이고
인프라 추가 0 이다. **별도 메일 발송 채널을 새로 만들지 않는다** — 기존 GitHub 알림 메일에
요약이 자연스럽게 실려 나간다.

---

## 6. 외부영향 0 dry-run path

YAML 변경 전에, 템플릿 생성 로직만 떼어 검증한다.

```bash
# scripts/gen-merge-narrative.sh <PR번호>  (예시 — 구현은 ack 후 별도 작업)
PR=$1
meta=$(gh pr view "$PR" --repo user/daejong-page \
  --json title,commits,files 2>/dev/null)
# title 에서 conventional prefix(type/scope) 파싱 → §3 템플릿 채움 → stdout 출력
echo "📝 요약: 이번 PR 은 ..."
```

- `gh pr view --json` 는 **read-only** — 머지·라벨·코멘트 0.
- 출력은 stdout 에만. 메일 발송 0, API 호출 0, main push 0.
- 검증 기준: `./gen-merge-narrative.sh 162` → §3 예시 형태 문장 출력되면 PASS.
- YAML 반영은 dry-run 으로 여러 과거 PR 에 요약 품질 눈으로 확인한 **뒤**, 형님 ack 받고 진행.

---

## 7. 적용 시 ack 게이트 (이 spec 범위 밖, 후속 작업용)

- 🟢 dry-run 스크립트 작성 + 과거 PR 대상 출력 확인 (read-only, 외부영향 0): 자율
- 🔴 `auto-merge.yml` 의 머지 step 에 `--body` 가공 추가 (Actions YAML 변경): **ack 필요**
- 🛑 외부 cron/SMTP 메일 발송 채널 신설: 비추 + ack 필요
