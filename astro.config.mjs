import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://work.kangdaejong.com',
  output: 'static',
  // P4 (T-260609-05): REPLACED 레거시 URL → Astro 새 라우트 301 보존 (SEO)
  redirects: {
    '/worklog.html': '/worklog',
    '/newsletter.html': '/newsletter',
    '/insights.html': '/insights',
    '/insight.html': '/insights',
    '/portfolio.html': '/products/',
  },
});
