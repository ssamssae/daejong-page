import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// T-260728-093 축2: sitemap 을 수기 정적 파일(31 URL)에서 자동생성으로 전환.
//   수기본은 worklog·newsletter·insights 개별 글을 담지 못해 색인이 링크 크롤링에만
//   의존했다. 구 파일은 삭제하지 않고 _retired/ 로 보관했다(원칙7).
//
// ⚠️ noindex 판정 페이지는 sitemap 에 넣지 않는다 — 색인하지 말라고 말한 페이지를
//   색인해달라고 제출하는 모순을 막는다. 현행 대상은 /apps 1건이고
//   T-260728-063 에서 "의도적 noindex" 로 판정됐다(해제 금지).
//   페이지를 추가로 noindex 하면 이 목록에도 같이 넣어야 한다.
const NOINDEX_PATHNAMES = ['/apps', '/apps/'];

export default defineConfig({
  site: 'https://work.kangdaejong.com',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !NOINDEX_PATHNAMES.includes(new URL(page).pathname),
    }),
  ],
  // P4 (T-260609-05): REPLACED 레거시 URL → Astro 새 라우트 301 보존 (SEO)
  redirects: {
    '/worklog.html': '/worklog',
    '/newsletter.html': '/newsletter',
    '/insights.html': '/insights',
    '/insight.html': '/insights',
    '/portfolio.html': '/products/',
  },
});
