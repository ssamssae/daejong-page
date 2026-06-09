---
category: 배포
tags: [cloudflare, cf-workers, openai, anthropic, llm, region-block, ai-gateway, colo, 502, 403]
related_issues:
  - 2026-04-28-cf-colo-region-block
---

# CF Workers 에서 외부 LLM API 직접 호출 금지 — AI Gateway 경유 필수

- **첫 발견:** 2026-04-28 (한줄일기 hanjul worker, 잠실 KT 라우터 IP에서 OpenAI 403)
- **재사용 영역:** Cloudflare Workers 에서 OpenAI / Anthropic / 기타 LLM API 를 호출하는 모든 앱.

## 한 줄 요약

Cloudflare colo 라우팅이 특정 ISP·지역 IP 를 한국 colo 로 매핑하면 그 colo 의 outbound IP 가 OpenAI region-block 권역에 걸려 `403 unsupported_country_region_territory` 반환. **직접 호출 대신 CF AI Gateway 경유가 근본 fix.**

## 증상

- 특정 Wi-Fi(일부 KT, SKT 라우터)에서만 LLM 호출 502 `upstream_failed`
- worker 로그: OpenAI 403 `unsupported_country_region_territory`
- 본인 LTE / 다른 Wi-Fi 에서는 정상 — 재현 환경이 편향돼 있어 발견 늦음
- CF `cf-colo` 헤더 확인 시 문제 있는 IP 는 ICN(인천) colo 매핑됨

## 패턴 (재사용 가능한 절차)

### 1. CF AI Gateway 경유로 교체 (표준)

```js
// 직접 호출 (금지)
const resp = await fetch('https://api.openai.com/v1/chat/completions', { ... });

// CF AI Gateway 경유 (권장)
// Workers 대시보드 > AI > AI Gateway 에서 gateway 생성
const GATEWAY_URL = 'https://gateway.ai.cloudflare.com/v1/<account_id>/<gateway_name>/openai';
const resp = await fetch(`${GATEWAY_URL}/chat/completions`, { ... });
```

- AI Gateway 는 자체 outbound colo 풀 사용 → 한국 colo 의존 회피
- compat URL (openai provider URL) 사용 시 schema 완전 호환

### 2. 진단 로그 표준화

```js
// worker 진입점에 1줄 — 다음 region 이슈 즉시 잡음
console.log(`cf-colo=${request.cf?.colo} ip=${request.headers.get('CF-Connecting-IP')} ua=${request.headers.get('User-Agent')?.slice(0,40)}`);
```

`wrangler tail` 만 켜면 IP + colo + detail 즉시 확인 가능.

### 3. 출시 전 검증 체크리스트

- [ ] 본인 LTE (1개 ISP) 단독 검증 금지 — 최소 2개 환경
- [ ] 친구 Wi-Fi (다른 ISP) 또는 모바일 핫스팟에서 LLM 호출 1회 확인
- [ ] AI Gateway 대시보드에서 요청 로그 확인 (region 거부 없는지)

## 주의

- AI Gateway URL 형식: `openai` provider 경로 사용 (`/openai/chat/completions`), compat URL 과 다름 — 잘못된 URL 시 400 code:2019
- `wrangler.toml` 에 gateway URL 을 환경변수로 빼서 로컬 테스트와 프로덕션 구분 권장
- Anthropic API 도 동일 패턴 적용 (`/anthropic/messages` 경로 사용)
