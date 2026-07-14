import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, test } from '@playwright/test';

test('knowhow archive is statically rendered with working discovery controls', async ({ page }) => {
  const htmlPath = path.resolve('dist', 'knowhow.html', 'index.html');
  const indexPath = path.resolve('public', 'knowhow', 'index.json');
  const entries = JSON.parse(fs.readFileSync(indexPath, 'utf8')).entries;

  expect(fs.existsSync(htmlPath), htmlPath + ' should exist after npm run build').toBe(true);

  const html = fs.readFileSync(htmlPath, 'utf8');
  const renderedEntries = html.match(/<article[^>]*data-knowhow-entry/g) ?? [];

  expect(renderedEntries).toHaveLength(entries.length);
  expect(html).toContain('REUSABLE FIELD NOTES');
  expect(html).toContain('data-search-input');
  expect(html).toContain('data-category-select');
  expect(html).toContain('data-filter-status');
  expect(html).toContain('"@type":"CollectionPage"');
  expect(html).not.toContain("fetch('/knowhow/index.json");
  expect(html).not.toContain('/knowhow/undefined');

  for (const entry of entries.slice(0, 3)) {
    expect(html).toContain(entry.title.replaceAll('"', '&quot;'));
  }

  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pathToFileURL(htmlPath).href);
  await expect(page.locator('[data-knowhow-entry]')).toHaveCount(entries.length);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true);

  await page.locator('[data-search-input]').fill('detached HEAD');
  await expect(page.locator('[data-filter-status]')).toHaveText('“detached HEAD” 1건');
  await expect(page.locator('[data-featured-section]')).toBeHidden();

  await page.locator('.reset-button').click();
  await expect(page.locator('[data-filter-status]')).toHaveText('전체 ' + entries.length + '건');
  await expect(page.locator('[data-featured-section]')).toBeVisible();

  await page.locator('[data-category-select]').selectOption('Flutter');
  await expect(page.locator('[data-filter-status]')).toHaveText('Flutter 1건');
  await expect(page.locator('[data-knowhow-entry]:visible')).toHaveCount(1);
  expect(pageErrors).toEqual([]);

  console.log('knowhow_static_archive_check:ok entries=' + entries.length);
});
