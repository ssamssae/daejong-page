import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const slug = '2026-07-08-claude-fable-5-unknowns-heyjames';

test('new insight page is present in the static build', async () => {
  const htmlPath = path.resolve('dist', 'insights', slug, 'index.html');
  expect(fs.existsSync(htmlPath), `${htmlPath} should exist after npm run build`).toBe(true);

  const html = fs.readFileSync(htmlPath, 'utf8');
  expect(html).toContain('Anthropic 개발자가 직접 공개한 Claude Fable 5 사용법');
  expect(html).toContain('<h2 id="픽업">픽업</h2>');
  expect(html).toContain('<h2 id="용어">용어</h2>');
  expect(html).toContain('블라인드 스팟 패스');
  console.log('playwright_static_page_check:ok');
});
