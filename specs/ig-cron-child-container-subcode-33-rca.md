# RCA — Instagram 캐러셀 cron: child container GET 차단 (error_subcode 33)

- 작업 ID: T-260525-29
- 작성: 2026-05-29 / 🖥 데스크탑 (autopilot 사이클 #1, spec-only)
- 범위: **분석·스펙 only.** 외부 IG API 호출 / 토큰 갱신 / Meta 비즈니스 콘솔 변경 일절 없음.
- 상태: 가설 + 검증 길 제시. 실제 fix 는 형님 ack 후 macOS 발행 호스트(본진/맥미니)에서.

---

## 0. 한 줄 요약

캐러셀 발행 흐름 중 **child container 상태 폴링 GET (`GET /{child-container-id}?fields=status_code`)** 이 `code 100 / error_subcode 33` 으로 막힘. subcode 33 의 Meta 공식 의미는 "객체가 존재하지 않거나, 토큰 권한 부족으로 로드 불가, 또는 이 작업을 지원하지 않음" 으로 — **거의 항상 Meta 의 정책 변경이 아니라 (a) 토큰/자산 권한 stale 또는 (b) 생성 단계 실패로 GET 대상 id 가 유효하지 않음** 이 진짜 원인이다. 정책 변경 가설은 가장 약한 분기로, Meta 개발자 changelog 근거가 나오기 전엔 채택하지 않는다.

---

## 1. 현재 에러 재현 흐름

### 1.1 아키텍처 (문서 기준)

캐러셀 발행 라인 (`insta-post-general`):

1. `parse_worklog.py` → `render.py` 로 `card-1.png … card-N.png` 생성
2. `~/insta-autopost/publish_carousel.py` (urllib 직접 Graph API 호출) 가 3-step 발행:
   - **(step A) child container 생성** — `POST /{ig-user-id}/media` (`is_carousel_item=true`, `image_url=<GitHub Pages URL>`) → 각 카드마다 `creation_id` 반환
   - **(step B) child container 상태 폴링** — `GET /{child-container-id}?fields=status_code` 로 `FINISHED` 대기 ← **여기서 subcode 33 발생**
   - **(step C) carousel container 생성** — `POST /{ig-user-id}/media` (`media_type=CAROUSEL`, `children=[ids]`)
   - **(step D) 발행** — `POST /{ig-user-id}/media_publish` (`creation_id=<carousel-id>`)
3. 토큰: `~/.claude/secrets/instagram.json` (`access_token` = 60일 장기 토큰, `ig_user_id` = 17자리 IG biz id). git 동기화 제외, macOS 호스트에만 사본.

### 1.2 차단 지점

- **endpoint**: `GET /{child-container-id}?fields=status_code` (step B)
- **token**: `~/.claude/secrets/instagram.json` 의 `access_token` (step A~D 동일 토큰 사용)
- **에러**: `code 100`, `error_subcode 33`

### 1.3 ⚠️ 로그 grep 갭 (한계 명시)

`~/insta-autopost/` 발행 코드와 cron 실행 로그는 **macOS 발행 호스트(본진/맥미니)에만 존재** — 본 RCA 를 작성한 🖥 데스크탑 노드에는 없다. 따라서:

- "언제부터 차단됐는지" 정확한 첫 실패 timestamp 는 본 노드에서 확정 불가.
- `publish_carousel.py` 가 어느 Graph API 버전을 핀했는지(`v18.0` 등), step A 응답을 어떻게 파싱하는지 실제 코드 확인 필요.

**본진/맥미니에서 회수할 1차 사실** (fix 진입 전 필수):
```bash
# 1) 발행 코드의 Graph API 버전 + GET 구성 확인
grep -n "graph.facebook.com\|v[0-9][0-9]\.0\|status_code\|is_carousel_item\|creation_id" ~/insta-autopost/publish_carousel.py
# 2) cron/launchd 실패 로그에서 33 첫 등장 시점
grep -rn "subcode.*33\|\"error_subcode\": *33\|Unsupported get request" ~/insta-autopost/ ~/Library/Logs/ 2>/dev/null | head
# 3) 토큰 발급일 vs 60일 TTL (오프라인, API 호출 0)
stat -f '%Sm' ~/.claude/secrets/instagram.json   # 마지막 수정 = 마지막 갱신 추정
cat ~/insta-autopost/GET_TOKEN.md | grep -i "발급\|issued\|date\|만료\|expire"
```

---

## 2. error_subcode 33 의 Meta 공식 의미

Graph API 에서 `error_subcode 33` 은 `code 100` 과 짝을 이루며, 표준 메시지는:

> "Unsupported get request. Object with ID '{id}' does not exist, cannot be loaded due to missing permissions, or does not support this operation. Please read the Graph API documentation at https://developers.facebook.com/docs/graph-api"

핵심: 이 subcode 는 세 상태를 **구분 없이** 한 코드로 묶는다 —
1. 객체가 실제로 존재하지 않음 (잘못된/None id)
2. 토큰 권한 부족으로 객체를 볼 수 없음 (scope 누락, 자산 미할당, 토큰 만료)
3. 그 객체가 이 GET 작업을 지원하지 않음

→ subcode 33 자체로는 원인 단정 불가. **분기 분석 + 검증 probe 로 셋 중 어느 것인지 좁혀야 한다.**

---

## 3. 정책 변경 추정 — 분기 분석

각 분기를 **가능성(높음/중/낮음)** + **subcode 33 과의 정합성** + **판별 신호** 로 정리.

### 분기 A — 토큰/자산 권한 stale (가능성: **높음**)

60일 장기 토큰 만료, scope 누락(`instagram_content_publish` / `instagram_basic` / `pages_show_list` / `business_management`), 또는 IG biz 계정 ↔ FB Page 연결·시스템유저 자산 할당이 끊김.

- **정합성**: 토큰이 객체를 못 보면 subcode 33 의 "missing permissions" 경로로 떨어짐. (순수 만료는 보통 subcode 463/467 이지만, scope 상실·자산 미할당은 객체 GET 에서 100/33 을 낸다.)
- **판별 신호**: `debug_token` 의 `is_valid=false` / `expires_at` 경과 / `scopes[]` 에 `instagram_content_publish` 없음. 또는 `GET /{ig_user_id}?fields=username` 자체가 33.
- **근거 보강**: insta-post SKILL 자체가 "토큰 만료(60일) — 재발급 후 secrets 갱신" 을 기지(known) 실패로 명시. 마지막 갱신이 60일 전이면 1순위.

### 분기 B — Graph API 버전 sunset (가능성: **중**)

`publish_carousel.py` 가 sunset 된 구버전(`vX.0`)을 핀.

- **정합성**: 버전 sunset 은 보통 "version deprecated" 류 별도 에러 → subcode 33 과 직접 매칭 약함. 다만 일부 케이스에서 구버전 경로가 객체를 못 찾아 33 으로 떨어질 수 있음.
- **판별 신호**: 코드의 URL 버전 문자열 + Meta Graph API changelog 의 해당 버전 sunset 일자 대조.
- **메모**: 저비용 위생 차원에서 버전은 최신으로 올려두는 게 무관하게 이득.

### 분기 C — Meta 가 child container GET 권한을 회수 (가능성: **낮음**)

Meta 가 child container(`is_carousel_item=true`) 의 `status_code` GET 정책을 바꿨다는 가설.

- **정합성**: subcode 33 의 "does not support this operation" 경로엔 형식상 부합.
- **그러나**: IG Content Publishing API 의 container-status GET 은 장기간 안정적이었고, 이런 변경은 Meta 개발자 changelog 에 공지된다. **changelog 근거 없이 채택 금지** — 더 단순한 설명(분기 A/D)이 우선(절약 원칙). 형님 발화·보드 프레이밍이 "Meta 가 막았다" 여도 무비판 수용 X, changelog 1건 인용 전까진 가설로만.
- **판별 신호**: developers.facebook.com/docs/graph-api/changelog 에서 해당 일자 IG Content Publishing 항목. 없으면 분기 C 기각.

### 분기 D — step A 생성 실패 → GET 대상 id 가 유효하지 않음 (가능성: **높음**)

step A(child container 생성)가 실제로 실패했는데 코드가 응답 에러를 무시하고 None/garbage id 로 step B GET 을 때림.

- **정합성**: 존재하지 않는 id GET = subcode 33 "object does not exist" 정통 경로. **가장 단순한 설명.**
- **근거 보강**: insta-post-general SKILL 이 "IG container ERROR: 보통 image_url GitHub Pages 빌드 지연 — `wait_public` 재시도가 처리" 라고 명시. 즉 image_url 이 아직 공개 전이면 step A 가 정상 id 를 못 받을 수 있고, 폴링 GET 이 그 빈 id 로 33 을 냄.
- **판별 신호**: 로그에서 step A 응답 body 확인 — `creation_id` 가 실제로 돌아왔는가, 아니면 step A 도 에러였는가. step A 가 200 + 정상 id 인데 step B 만 33 이면 분기 D 기각(→ A 로 회귀).

---

## 4. 우회 / 대안 path option

| 옵션 | 내용 | 비용 | 유효성(어느 분기를 고치나) |
|---|---|---|---|
| **(a) 토큰 scope 재발급** | 장기 토큰 재발급(`instagram_basic` + `instagram_content_publish` + `pages_show_list` + `business_management`) → `instagram.json` 갱신 | Meta 콘솔 수동, ~10분, **형님 ack 필수 (🔴 RED)** | 분기 A 직격. 토큰이 원인이면 최고 적중 |
| **(b) child GET 폴링 생략** | step B 의 child별 GET 폴링 제거 → carousel container(step C) 레벨에서만 상태 폴링 하거나, `media_publish` 전 고정 backoff(sleep+재시도) | 코드 소폭 수정 (🟢 자율 가능, spec 후) | 분기 D 일부 완화. **분기 A 면 carousel GET·publish 도 같이 33 → 효과 없음** |
| **(c) Graph API 버전 업그레이드** | 코드 URL 버전 → 최신(v2x.0)으로 1줄 변경 후 재테스트 | 저비용 (🟢) | 분기 B 직격. 무관하게 위생상 이득 |
| **(d) 단일 이미지 fallback** | 캐러셀 포기, `insta-post` 의 `publish.py` 단일 `/media`+`/media_publish` 경로로 1장 발행 | 캐러셀(5장) → 1장 포맷 손실 | child container 우회 → 분기 C/D 회피. **분기 A(토큰)면 단일 경로도 동일 토큰이라 같이 실패** |

권장 순서: **검증(§5)로 분기 먼저 확정 → 분기 A 면 (a), 분기 B 면 (c), 분기 D 면 (b)+`wait_public` 강화, 그래도 막히고 즉시 발행 필요하면 (d) 임시.**

---

## 5. 검증 길 (dry-run probe)

### 5.1 완전 오프라인 (API 호출 0 — 지금/ack 전 가능)

토큰 나이부터 본다. 60일 장기 토큰이므로 마지막 갱신이 60일 초과면 분기 A(만료)가 1순위 — API 호출 없이 확정 가능.
```bash
stat -f '%Sm' ~/.claude/secrets/instagram.json
# + GET_TOKEN.md 의 발급일 메모 대조. (60일 경과 → 분기 A 유력)
```

### 5.2 토큰 메타데이터 probe (read-only, **발행/컨테이너 생성 아님** — 형님 ack 후 macOS 호스트에서)

> 주의: 아래는 엄밀히는 Graph API 호출이나 **읽기 전용 메타데이터** 로, 컨테이너 생성·발행 같은 외부영향 0. 본 spec-only 사이클에서는 **실행하지 않고 길만 제시**. 실제 실행은 형님 ack 후.

```bash
# (1) 토큰 자체 진단 — 가장 강력한 판별자
GET /debug_token?input_token=<TOKEN>&access_token=<TOKEN>
#   → is_valid / expires_at / data_access_expires_at / scopes[]
#   is_valid=false 또는 scopes 에 instagram_content_publish 없음 → 분기 A 확정

# (2) IG 계정 가시성 — 자산/연결 확인
GET /<ig_user_id>?fields=id,username&access_token=<TOKEN>
#   여기서 33 → 토큰이 IG 계정 자체를 못 봄 = 분기 A(자산 변형) 확정

# (3) 콘텐츠 읽기 권한
GET /<ig_user_id>/media?limit=1&access_token=<TOKEN>
#   200 정상 → 읽기 권한 살아있음, 분기 A 약화 → 분기 D 로 이동
```

### 5.3 분기 판정 결정 트리

```
debug_token is_valid=false / scope 누락?
 ├─ 예 → 분기 A 확정 → 옵션 (a) 토큰 재발급 [🔴 ack]
 └─ 아니오 →
     GET /<ig_user_id> 또는 /media 가 33?
      ├─ 예 → 분기 A(자산/연결) → (a)
      └─ 아니오(읽기 OK) →
          로그상 step A 가 정상 creation_id 반환했나?
           ├─ 아니오(step A 도 실패/빈 id) → 분기 D → 옵션 (b) + wait_public 강화 [🟢]
           └─ 예(step A OK, step B 만 33) →
               코드 Graph 버전이 sunset 됐나? (changelog 대조)
                ├─ 예 → 분기 B → 옵션 (c) 버전 업 [🟢]
                └─ 아니오 → 분기 C 후보 (Meta changelog 근거 必, 없으면 재조사)
```

---

## 6. 결론 / 다음 액션

- subcode 33 은 **토큰/자산 권한(분기 A)** 또는 **생성 단계 실패로 인한 무효 id(분기 D)** 가 압도적으로 유력. 정책 변경(분기 C)은 changelog 근거 전까진 기각 디폴트.
- **막힌 비용 없이 지금 할 수 있는 것**: macOS 호스트에서 §1.3 1차 사실 회수 + §5.1 오프라인 토큰 나이 확인. 이것만으로 분기 A vs D 상당 부분 갈림.
- **형님 ack 필요(🔴 큐)**: 토큰 재발급(옵션 a) — Meta 콘솔 외부 작업.
- **자율 가능(🟢, 본 spec 머지 후 별 사이클)**: 옵션 (b)/(c) 코드 수정, `wait_public` 강화.

> 다음 사이클 후보: macOS 호스트에서 §1.3 + §5.1 회수 → 분기 확정 → 확정된 분기의 옵션 실행 directive.
