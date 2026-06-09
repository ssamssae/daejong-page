# P4 URL 보존 감사 (codex-mesh-vote 승자 C → 감사 → A/B 픽)

**날짜:** 2026-06-09 / **결정:** codex-mesh-vote 승자 C(플립 보류) → 본 감사 → 아키 A/B 픽 후 flip.
**전제:** 루트 *.html 34 / sitemap 인덱스 30 / privacy-* 10 / 루트 데이터 디렉토리 21 / src/content 미러 3(worklog·newsletter·insights).

## 보존 필수 (A·B 공통)
- privacy-*.html 10 (앱스토어 listing URL): autooutstarpost, dutchpay, hanjul, hankeup, memoyo, miniexpense, pomodoro, randompick, wordyo, yakmukja. ⚠️autooutstarpost·miniexpense 2개는 sitemap 미포함이나 스토어 URL이라 보존.
- CNAME + 루트 공유 에셋 15 (favicon.ico, apple-touch-icon.png, og-default.png, badge_appstore_kr.svg, badge_googleplay_kr.svg, *_icon.png/svg 11).

## KEEP-STANDALONE (sitemap 인덱스 + system/lab 링크, Astro 미대체) — 17
automations, stack, skills, smart-home, knowhow / ai-glossary, dead-ends, habits, sise, stock, timeline, vibecoding, vrl-benchmark / info, issue, issues, privacy.html
- CONSUMED-BY-KEEP 데이터: knowhow/74, issues/153, sise/3, dead-ends/3, beta-signup/1103.

## REPLACED (Astro 대체 → 레거시 드롭, 301 권장)
index→/ , worklog→/worklog , newsletter→/newsletter , insights+insight→/insights , portfolio→/apps

## DROP 후보 (grep 참조 0 입증)
- ORPHAN 디렉토리: insta-host/255, webtoons/49, worklog-source/96, specs/34, brand/8, docs/4, v1.0.0~v1.2.0/18
- REPLACED 전용 데이터: worklog/135, newsletter/85, store/3 (Astro가 src/content로 미러)
- sorry.html + sorry/1

## A vs B
- **B 권장**: privacy10+CNAME+에셋 + KEEP 17 + CONSUMED 데이터(knowhow·issues·sise·dead-ends·beta-signup)만 public/ 이관, REPLACED·orphan 드롭. 리스크=insight*.html 2 URL SEO → /insights 301 or 2파일 잔류로 0.
- A: 전부 public/ 복사 — orphan/구버전/insta-host(255)/beta-signup(1103) 죽은 대용량까지 끌고 가 빌드·혼란만 증가(참조 0 입증).
