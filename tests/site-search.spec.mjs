import { expect, test } from '@playwright/test';

// T-261011-022: result rows are created by the inline script, so Astro-scoped CSS
// (data-astro-cid-*) never matched them and rows ran together unstyled.
const base = process.env.WORKSHOP_PREVIEW_URL || 'http://localhost:8772';

test('site search result rows get their styles and show symbols once', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/worklog/2026-05-17_v101/`);
  await page.locator('#site-search-input').pressSequentially('PR');
  const first = page.locator('[data-site-search-results] li').first();
  await expect(first).toBeVisible();

  const style = await first.evaluate((li) => {
    const css = (sel) => getComputedStyle(li.querySelector(sel));
    return {
      link: css('a').textDecorationLine,
      title: [css('.site-search-title').display, Number(css('.site-search-title').fontWeight)],
      excerpt: css('.site-search-excerpt').display,
    };
  });
  expect(style.link).toBe('none');
  expect(style.title[0]).toBe('block');
  expect(style.title[1]).toBeGreaterThanOrEqual(600);
  expect(style.excerpt).toBe('block');

  const excerpts = await page.locator('.site-search-excerpt').allTextContents();
  expect(excerpts.join(' ')).toContain('mac/<task>-YYYY-MM-DD');
  expect(excerpts.join(' ')).not.toMatch(/&lt;|&gt;|&amp;/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
