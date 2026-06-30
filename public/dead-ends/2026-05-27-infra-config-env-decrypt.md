---
category: 인프라
tags: [infra-config, sops, env, decrypt]
date: 2026-05-27
type: 전략접음
---

# infra-config 잔여 .env decrypt-run 전환 — 핸드오프 후 미완 취소

- **드롭 시점:** 2026-05-27
- **분류:** 판단으로 접음
- **목표:** 잔여 평문 .env들을 sops decrypt-run 경유로 일괄 전환

## 뭘 하려 했나

- direct-only .env 후보 재스캔 → hot-path/dispatcher/tool/debt로 분류 시도

## 왜 드롭했나

- hot-path 예외를 어디까지 둘지 경계가 애매
- 핵심 토큰은 이미 sops로 보호돼 잔여분의 한계효용이 낮음

## 결론

잔여 전환은 보류. 핵심 시크릿은 이미 sops 적용 완료.
