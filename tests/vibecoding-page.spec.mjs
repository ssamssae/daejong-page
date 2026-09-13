import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const base = process.env.WORKSHOP_PREVIEW_URL || 'http://127.0.0.1:8772';
const evidenceDir = path.resolve('test-results', 'vibecoding-renewal');

test('vibecoding page presents the current method without stale fleet claims', async ({ page }) => {
  fs.mkdirSync(evidenceDir, { recursive: true });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + '/vibecoding.html/');

  await expect(page).toHaveTitle('바이브코딩 작업 방식 — 마이너스베타스튜디오');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('제대로 끝내는 방식');
  await expect(page.locator('[data-principle]')).toHaveCount(4);
  await expect(page.locator('[data-loop-step]')).toHaveCount(5);
  await expect(page.locator('[data-era]')).toHaveCount(4);
  await expect(page.getByText('Mac 작업 공간', { exact: true })).toBeVisible();
  await expect(page.getByText('공개 브릿지 저장소', { exact: true })).toBeVisible();
  await expect(page.getByText('작업별 책임 리드', { exact: true })).toBeVisible();

  const body = await page.locator('body').innerText();
  expect(body).not.toContain('과거 스킬 목록');
  expect(body).not.toContain('물리 5대');
  expect(body).not.toContain('Grok 함대');
  expect(body).not.toContain('Codex 총괄');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: path.join(evidenceDir, 'desktop.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator('[data-loop-step]')).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: path.join(evidenceDir, 'mobile.png'), fullPage: true });

  expect(pageErrors).toEqual([]);
  console.log(`screenshot:path=${evidenceDir}`);
  console.log('vibecoding_current_method:ok principles=4 loop=5 eras=4 console_errors=0');
});
