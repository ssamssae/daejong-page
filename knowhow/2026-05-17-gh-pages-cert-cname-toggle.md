# GH Pages custom domain cert 발급 멈췄을 때 CNAME 토글 재트리거 트릭

GitHub Pages 가 custom domain 에 Let's Encrypt cert 를 자동 발급하는데, 가끔 provisioning 이 큐에서 멈춰서 5시간이 지나도 `*.github.io` wildcard cert 만 서빙되는 경우가 있다. 이때 CNAME 을 잠시 비웠다가 다시 박는 토글로 강제 재트리거 가능.

## 핵심

custom domain CNAME 추가 후 30분이 지나도 cert 가 안 떨어지면 멈춤 의심. `https_certificate.state` 확인 후 멈춤이면 토글 트릭으로 강제 재시도.

## 진단

```bash
gh api repos/<owner>/<repo>/pages | python3 -m json.tool
# 정상: https_certificate.state == "approved"
# 멈춤: https_certificate 키 자체 없거나 state == "authorization_pending" 장기 정체

gh api repos/<owner>/<repo>/pages/health
# is_https_eligible: true 이면 발급 자격 있음
# https_error: "peer_failed_verification" 이 떠도 cname/DNS 자체는 OK
```

## 재트리거 트릭

```bash
# 1. CNAME 일시 비우기 (사이트 잠시 default URL 로 fallback, 짧은 flicker)
gh api -X PUT repos/<owner>/<repo>/pages -F 'cname='
sleep 8

# 2. CNAME 재설정 → cert provisioning 자동 재트리거
gh api -X PUT repos/<owner>/<repo>/pages -F 'cname=<domain>'

# 3. (옵션) 빌드 재트리거
gh api -X POST repos/<owner>/<repo>/pages/builds

# 4. 30초 후 state 확인 — 보통 authorization_pending → approved 전환
gh api repos/<owner>/<repo>/pages
```

cert 발급 완료 후 HTTPS 강제 활성화:

```bash
gh api -X PUT repos/<owner>/<repo>/pages -F https_enforced=true
```

## 검증

```bash
# 서버 cert subject 확인
echo | openssl s_client -servername <domain> -connect <domain>:443 2>/dev/null \
  | openssl x509 -noout -subject -issuer
# 정상: subject=CN=<domain> / issuer Let's Encrypt
# 비정상: subject=CN=*.github.io

# HTTP → HTTPS 리다이렉트 확인
curl -sk --http1.1 -I "http://<domain>/" | grep -i "^location"
# 정상: Location: https://<domain>/
```

## 다시 꺼내쓰는 법

- GH Pages 에 새 custom domain 박은 직후 → 30분 timer 셋
- 30분 후 cert state "approved" 안 떨어졌으면 → 토글 트릭 즉시
- 사용자에게는 캐시 새로고침 (Cmd+Shift+R) 안내 — 브라우저가 cert 발급 전 HTTP 응답을 캐시하고 있을 수 있음
