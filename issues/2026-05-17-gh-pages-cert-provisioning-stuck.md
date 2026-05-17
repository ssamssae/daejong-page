---
prevention_deferred: null
---

# GH Pages custom domain cert provisioning 멈춤 → 브라우저 빨간 경고

- **발생 일자:** 2026-05-17 17:32 KST (CNAME 추가 시점)
- **해결 일자:** 2026-05-17 21:47 KST (cert approved + https_enforced)
- **심각도:** medium
- **재발 가능성:** medium
- **영향 범위:** GH Pages custom domain, daejong-page repo, work.kangdaejong.com

## 증상
work.kangdaejong.com 접속 시 Chrome 이 URL 바에 빨간 "주의 요망" 배지 + 팝업에 "이 사이트는 보안 연결(HTTPS)이 사용되지 않았습니다" 노출. 회사 홈(kangdaejong.com) 의 작업 일지 카드 클릭해도 동일. cert subject 확인하면 `CN=*.github.io` 만 잡힘 — 즉 custom domain 용 cert 자체가 발급 안 된 상태.

## 원인
CNAME 추가(commit 221d7a9, 2026-05-17 17:32 KST) 후 5시간이 지나도 GH Pages 가 Let's Encrypt cert provisioning 을 자동 트리거하지 않음. 서버는 `*.github.io` wildcard cert 만 서빙 → SNI 불일치로 Chrome 거부. `gh api repos/<owner>/<repo>/pages/health` 진단으로는 `is_https_eligible: true` + `https_error: peer_failed_verification` 로 멈춰있고, `https_enforced: false` 라 enforce HTTPS 옵션을 켤 수도 없는 상태. GH Pages 가 cert request 를 어떤 이유로든 큐에서 누락한 것으로 추정.

## 조치
GH API 로 CNAME 을 잠깐 비웠다 다시 박는 토글 트릭으로 provisioning 강제 재트리거:

```bash
# 1. CNAME 일시 비우기 (~10초 짧은 flicker, 사이트 다운 X)
gh api -X PUT repos/ssamssae/daejong-page/pages -F 'cname='
sleep 8

# 2. CNAME 다시 박기 → provisioning 재트리거
gh api -X PUT repos/ssamssae/daejong-page/pages -F 'cname=work.kangdaejong.com'

# 3. 빌드 재트리거 (선택)
gh api -X POST repos/ssamssae/daejong-page/pages/builds

# 4. 30초 후 cert state 확인 → 'approved' 떨어지면
gh api repos/ssamssae/daejong-page/pages  # https_certificate.state: "approved"

# 5. HTTPS enforce 활성화
gh api -X PUT repos/ssamssae/daejong-page/pages -F https_enforced=true
```

30초 후 cert state `authorization_pending` → `approved` (expires_at 2026-08-15, GH 자동 갱신). `https_enforced=true` 활성화 후 Playwright 로 `http://` → `https://` 301 redirect + cert subject `CN=work.kangdaejong.com` 검증 완료.

추가로 사용자가 cert 미발급 시기에 캐시된 HTTP 응답을 Chrome 이 계속 띄우는 부작용 → 하드 새로고침(Cmd+Shift+R) 안내.

## 예방 (Forcing function 우선)
GH Pages 에 새 custom domain 박을 때 매번 사람 손으로 cert 발급 여부 점검은 누락 위험. 자동화 헬퍼 스크립트 `~/.claude/automations/scripts/gh-pages-cert-bootstrap.sh` 를 작성해 1) CNAME 박은 직후 30분 대기 → 2) `gh api repos/<owner>/<repo>/pages` 의 `https_certificate.state == "approved"` 자동 점검 → 3) 미발급이면 CNAME 토글 트릭 자동 실행 → 4) 발급 확인되면 `https_enforced=true` 까지 자동 활성화. 또한 daejong-page-sync 스킬에 GH Pages cert state 점검 항목 추가 → cert 가 "approved" 아니면 텔레그램 경고로 surface.

## 재발 이력

## 관련 링크
- CNAME commit (daejong-page): 221d7a9
- 회사 타일 추가 commit (daejong-page): 0be5fd6
- 회사 홈페이지 인프라 메모: `memory/project_kangdaejong_domain_cf_infra_2026_05_17.md`
- 텔레그램 message_id: 18876 (형님 스샷)
