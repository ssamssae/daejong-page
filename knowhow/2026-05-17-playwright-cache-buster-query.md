# Playwright/브라우저 stale cache 우회 — `?v=N` 쿼리 cache buster 패턴

Playwright MCP 로 페이지 변경 라이브 검증 시, 브라우저가 직전 응답을 캐시해서 새 콘텐츠를 안 보여주는 경우가 자주 있다. URL 끝에 `?v=N` 같은 쿼리 파라미터 붙이면 캐시 키가 달라져서 강제 새로고침 효과.

## 핵심

라이브 deploy 후 즉시 Playwright 로 검증할 때 cache hit 으로 stale 콘텐츠 보일 수 있음. `?v=<버전번호>` 또는 `?_=<timestamp>` 붙여 cache busting.

## 증상

```text
# 시나리오:
# 1. 파일 수정 + commit + push
# 2. GH Pages 빌드 완료 확인 (curl 로 라이브 HTML grep → 새 콘텐츠 보임)
# 3. Playwright 로 navigate → 옛 콘텐츠 그대로 표시

# 원인: Playwright 의 chromium 이 이전 응답 캐시. curl 은 캐시 없이 직접 받음.
```

## 해결

```javascript
// Playwright MCP 호출 시 cache buster 쿼리 추가
browser_navigate({ url: 'https://example.com/page.html?v=2' })

// 두 번째 검증이면 ?v=3, ?v=4 ... 식으로 증가
// 또는 timestamp 기반
browser_navigate({ url: `https://example.com/page.html?_=${Date.now()}` })
```

서버가 query string 을 무시하고 같은 정적 파일을 서빙하므로 콘텐츠는 동일, 다만 브라우저 입장에서는 다른 URL → 새로 fetch.

## 검증 패턴

라이브 검증 표준 시퀀스:

```bash
# 1. 빌드 status 확인 (백그라운드 polling)
until gh api repos/<o>/<r>/pages/builds/latest | jq -e '.status == "built"' >/dev/null; do sleep 5; done

# 2. curl 로 콘텐츠 grep — cache 없이 직접 검증
curl -sk --http1.1 "https://<domain>/<page>" | grep -E "<new-content>|<removed-content>"

# 3. Playwright 로 시각 검증 — 반드시 ?v=N 붙임
browser_navigate({ url: 'https://<domain>/<page>?v=N' })
browser_take_screenshot()
```

curl 검증 (cache 무시) + Playwright 검증 (cache buster 포함) 둘 다 했을 때만 "라이브 반영 확인" 으로 인정.

## 함정

- Playwright 의 `--disable-cache` 같은 플래그가 있어도 GH Pages CDN 자체 캐시는 우회 못 함. 클라이언트 cache 버스팅이 가장 확실.
- 같은 url 두 번째 navigate 도 cache hit. `?v` 값을 매번 다르게 해야 함.

## 다시 꺼내쓰는 법

- 라이브 검증 default: curl grep 먼저 → Playwright `?v=N` 두 번째
- Playwright 만 했는데 옛 콘텐츠 나오면 즉시 cache buster 의심
- 사용자에게 "라이브 반영 확인" 보고 전에 둘 다 통과 확인
