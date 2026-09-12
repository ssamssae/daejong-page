import fs from 'node:fs';
import { expect, test } from '@playwright/test';
const base = process.env.WORKSHOP_PREVIEW_URL || 'http://localhost:8772';
const archive = JSON.parse(fs.readFileSync('src/data/skills-archive.json','utf8'));
test('skills guide distinguishes current use from searchable historical catalog', async ({page}) => {
 await page.goto(base + '/skills.html/');
 await expect(page.locator('h1')).toContainText('잘한 작업을,');
 await expect(page.locator('[data-skill]')).toHaveCount(archive.skills.length);
 await page.locator('#skill-archive summary').click();
 await page.getByRole('searchbox',{name:'이름·설명 검색'}).fill('app-icon');
 await expect(page.locator('[data-skill]:visible')).toHaveCount(1);
 await page.getByRole('searchbox',{name:'이름·설명 검색'}).fill('');
 await expect(page.locator('[data-skill]:visible')).toHaveCount(archive.skills.length);
});
