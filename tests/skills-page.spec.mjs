import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, test } from '@playwright/test';

test('AI skills page renders and filters the full public catalog', async ({ page }) => {
  const htmlPath = path.resolve('dist', 'skills.html', 'index.html');
  expect(fs.existsSync(htmlPath), htmlPath + ' should exist after npm run build').toBe(true);

  const html = fs.readFileSync(htmlPath, 'utf8');
  const renderedSkills = html.match(/<article[^>]*data-skill-entry/g) ?? [];

  // 카탈로그 등재 수 = 50 (PR#337 로 40→50 등재, T-260722-019 에서 상수 동반 갱신)
  expect(renderedSkills).toHaveLength(50);
  expect(html).toContain('REUSABLE AI WORKFLOWS');
  expect(html).toContain('WORKFLOW MAP');
  expect(html).toContain('data-search-input');
  expect(html).toContain('data-surface-select');
  expect(html).toContain('data-lane-select');
  expect(html).toContain('"@type":"CollectionPage"');
  expect(html).toContain('/app-icon');
  expect(html).toContain('/workflow-audit');

  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pathToFileURL(htmlPath).href);
  await expect(page.locator('[data-skill-entry]')).toHaveCount(50);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true);

  await page.locator('[data-search-input]').fill('app-icon');
  await expect(page.locator('[data-filter-status]')).toHaveText('“app-icon” 1개');
  await expect(page.locator('[data-lane-section]')).toBeHidden();

  await page.locator('.reset-button').click();
  await expect(page.locator('[data-filter-status]')).toHaveText('전체 50개');
  await expect(page.locator('[data-lane-section]')).toBeVisible();

  await page.locator('[data-surface-select]').selectOption('codex');
  await expect(page.locator('[data-filter-status]')).toHaveText('Codex 11개');
  await expect(page.locator('[data-skill-entry]:visible')).toHaveCount(11);

  await page.locator('.reset-button').click();
  await page.locator('[data-lane-chip="think"]').click();
  await expect(page.locator('[data-filter-status]')).toHaveText('구상과 검증 3개');
  await expect(page.locator('[data-skill-entry]:visible')).toHaveCount(3);

  await page.locator('#skill-changelog summary').click();
  await expect(page.locator('#skill-changelog')).toHaveAttribute('open', '');
  expect(pageErrors).toEqual([]);

  console.log('skills_static_catalog_check:ok entries=50 codex=11 think=3');
});
