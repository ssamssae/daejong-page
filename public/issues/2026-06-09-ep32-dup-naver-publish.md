---
prevention_deferred: null
---

# ep32 네이버 뉴스레터 중복 발행 — 두 오케스트레이터(본진+맥미니) 단일소유 lock 부재

- **발생 일자:** 2026-06-09 21:54~22:04 KST
- **해결 일자:** 2026-06-09 22:18 KST
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** newsletter-publish / naver-blog-publish 스킬, 본진(🍎)+맥미니(🏭) dual-orchestrator 외부발행

## 증상
ep32 뉴스레터 네이버 발행이 맥미니에서 21:54 KST 완료+마킹(commit e1162c7, blog.naver.com/ssamssae/224311032829)됐는데, 본진(🍎)이 같은 ep32를 다시 발행 → 아니키가 "왜 본진이 또 발행하냐" 감지(22:04). 공개 네이버 글이 중복으로 생길 뻔(/생긴) 사고.

**(2차 facet — 제목 컨벤션 누락, 아니키 지적 22:11):** 두 중복글의 제목이 달랐다. 맥미니것(224311032829)은 "끝난 일을 또 시킬 뻔한 날 — …"(frontmatter 원제목, **"바이브코딩 뉴스레터 Ep.N —" prefix 없음**), 본진것(224311043568)은 "바이브코딩 뉴스레터 Ep.32 — …"(컨벤션 prefix 있음). ep1~31 은 prefix 를 지켜왔는데 맥미니 ep32 만 누락 → 아니키 "왜 맥미니는 제목 양식을 안 지키냐".

## 원인
본진+맥미니 두 오케스트레이터("대가리 두명", 2026-05-28)가 같은 외부발행 작업(ep32 네이버)을 각자 보유. 본진이 네이버 2FA 블로커로 ⏸ 중일 때, 맥미니의 Playwright 네이버 세션은 본인 로그인이 정상이라 발행에 성공+tasks.md 마킹+push 했음. 그러나:
1. 외부발행 작업당 **단일소유 claim/lease 부재** — 두 오케가 동시에 같은 작업을 잡을 수 있었음.
2. 발행 직전 **idempotency 체크 부재** — "이 ep/채널 이미 발행됐나?"를 확인하지 않고 무조건 발행. 본진이 맥미니의 마킹(이미 push됨)을 pull/확인하지 않고 재발행.
3. 마킹이 **free-text** (그래서 기계적 dedup 불가) + 크로스머신 동기 SoT 미정의.

**(2차 facet 원인 — 제목 컨벤션):** "바이브코딩 뉴스레터 Ep.N — <제목>" prefix 규칙이 **오케스트레이터(newsletter-publish §4)에만 인라인 문자열**로 존재. 채널 스킬(naver-blog-publish)의 `--title` 디폴트는 "md 첫 h1 / frontmatter 원제목"이라 prefix 를 모름. 맥미니가 채널 스킬을 직접 호출(오케스트레이터 우회, "네이버부터 그거하고") → prefix 단계 통째로 스킵. ep1~31 이 컨벤션 지킨 건 전부 오케스트레이터 경유였기 때문. = 중복 사고와 동일 근본원인(오케스트레이터 우회 = dedup 게이트 + 제목 prefix 둘 다 스킵).

## 조치
1. (즉시) 맥미니 실측으로 ep32 3채널 완결(홈페이지 b2d38c5 + Substack /p/84e + 네이버 /224311032829) 확인 + 아니키 통보. 본진 발행 중단·중복 네이버글 삭제는 아니키가 본진 세션 보며 처리(외부·비가역이라 맥미니 미개입).
2. (재발방지) **발행 전 idempotency 게이트 구현** — `scripts/publish_guard.sh check/mark`. 크로스머신 dedup SoT = git-sync `~/todo/newsletter-published.tsv`(본진·맥미니 양쪽 pull). newsletter-publish §0 에서 채널별 `check`(이미 발행이면 자동 skip, 3채널 다면 전체 abort), §2·3·4 채널 성공 직후 `mark`. 게이트가 발행 직전 자동 `git pull` 하므로 다른 기기가 방금 발행했어도 즉시 인지. ep32 3채널은 레지스트리에 backfill 완료.

## 예방 (Forcing function 우선)
발행 스킬이 외부발행 직전 크로스머신 SoT 로 "이미 발행됨?"을 자동 확인 → 이미 발행이면 그 채널 skip, 전 채널 발행이면 전체 abort. 마킹이 기계 판독 가능한 구조(tsv)라 두 오케가 같은 SoT 를 보고 중복을 차단. 사람 의지 아닌 스킬 step 레벨 강제.

- **막을 코드/훅(중복):** `~/claude-skills/scripts/publish_guard.sh` + `newsletter-publish/SKILL.md` §0 게이트·§2/3/4 마킹 (commit 988b7e1). 마커 `⚠️ 제거 금지 (DO NOT REMOVE)` 박음 → guard-comment-protect hook 보호.
- **막을 코드/훅(제목 컨벤션):** `~/claude-skills/newsletter-publish/scripts/canonical_title.py`(commit 3efc41a) — version+title frontmatter 에서 "바이브코딩 뉴스레터 Ep.N — <title>" 결정론 생성, 이중 prefix 방지. 어느 노드/경로든 동일 제목. newsletter-publish §4 가 이걸 사용(8736b39), naver-blog-publish §4 가드가 "뉴스레터 ep 제목은 canonical_title.py 출력만, raw 제목 직접 금지" 강제(390cd84).
- **후속(narrower):** naver-blog-publish 를 newsletter 우회로 standalone 직접 호출하는 경로는 dedup 게이트를 안 거침 — newsletter 컨텍스트에서 standalone naver 호출 시에도 ep-aware check 거치도록 보강은 별 task. 현재는 정규 경로(newsletter-publish §4 위임)가 dedup+제목 게이트로 보호됨. 코디네이션: 같은 외부발행을 두 노드에 동시 라우팅 금지(라우팅돼도 publish_guard 2차 방어).

## 재발 이력
<처음 생성 — 비움>

## 관련 링크
- 커밋(게이트): 988b7e1 (claude-skills)
- 커밋(맥미니 ep32 네이버 발행+마킹): e1162c7 (todo)
- 메모리: (해당 없음 — dual-orchestrator race 일반화는 추후 feedback_* 승격 검토)
- 텔레그램: 2026-06-09 22:04 KST 아니키 "왜 본진이 또 발행하냐 + 이슈 등록·재발방지" 지시
