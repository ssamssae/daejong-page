import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const base = process.env.WORKSHOP_PREVIEW_URL || 'http://localhost:8772';

const fixtures = [
  {
    date: '2026-07-12',
    latestSource: '2026-07-12_v1.0.1.md',
    latestSlug: '2026-07-12_v101',
    staleSource: '2026-07-12_v1.0.0.md',
    staleSlug: '2026-07-12_v100',
  },
  {
    date: '2026-07-13',
    latestSource: '2026-07-13_v1.0.1.md',
    latestSlug: '2026-07-13_v101',
    staleSource: '2026-07-13_v1.0.0.md',
    staleSlug: '2026-07-13_v100',
  },
];

test('home deduplicates dates while the archive preserves every version', async ({ page }) => {
  const contentDir = path.resolve('src', 'content', 'worklog');
  const distWorklog = path.resolve('dist', 'worklog');
  const evidenceDir = path.resolve('test-results', 'worklog-date-dedupe');
  fs.mkdirSync(evidenceDir, { recursive: true });

  for (const fixture of fixtures) {
    expect(fs.existsSync(path.join(contentDir, fixture.latestSource))).toBe(true);
    expect(fs.existsSync(path.join(contentDir, fixture.staleSource))).toBe(true);
    expect(fs.existsSync(path.join(distWorklog, fixture.latestSlug, 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(distWorklog, fixture.staleSlug, 'index.html'))).toBe(true);
  }

  await page.goto(base + '/');
  const recentWorklog = page.locator('.recent-panel').first().locator('.post-list');
  const recentDates = await recentWorklog.locator('.date').allTextContents();
  expect(new Set(recentDates).size).toBe(recentDates.length);
  await page.screenshot({ path: path.join(evidenceDir, 'home.png'), fullPage: true });

  await page.goto(base + '/worklog/');
  const archive = page.locator('[data-archive]');

  for (const fixture of fixtures) {
    await expect(archive.locator(`a[href="/worklog/${fixture.latestSlug}/"]`)).toHaveCount(1);
    await expect(archive.locator(`a[href="/worklog/${fixture.staleSlug}/"]`)).toHaveCount(1);
  }
  await page.screenshot({ path: path.join(evidenceDir, 'archive.png'), fullPage: true });

  console.log(`screenshot:path=${evidenceDir}`);
  console.log(`worklog_date_dedupe:ok fixtures=${fixtures.length}`);
});
