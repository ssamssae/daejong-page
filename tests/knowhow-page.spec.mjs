import fs from 'node:fs';
import { expect, test } from '@playwright/test';
const base = process.env.WORKSHOP_PREVIEW_URL || 'http://localhost:8772';
const entries = JSON.parse(fs.readFileSync('public/knowhow/index.json','utf8')).entries;
test('archive preserves all notes and supports query, category, empty and reset states', async ({page}) => {
 await page.goto(base + '/knowhow.html/');
 await expect(page.locator('[data-note]')).toHaveCount(entries.length);
 await page.getByRole('searchbox',{name:'키워드 검색'}).fill('detached HEAD');
 await expect(page.locator('[data-note]:visible')).toHaveCount(1);
 await page.getByRole('button',{name:'초기화',exact:true}).click();
 await expect(page.locator('[data-note]:visible')).toHaveCount(entries.length);
 await page.getByRole('combobox',{name:'카테고리',exact:true}).selectOption('Flutter');
 await expect(page.locator('[data-note]:visible')).toHaveCount(entries.filter(x=>x.category === 'Flutter').length);
 await page.getByRole('searchbox',{name:'키워드 검색'}).fill('no-such-note-987654');
 await expect(page.locator('#note-empty')).toBeVisible();
 await page.getByRole('button',{name:'초기화',exact:true}).click();
 await expect(page.locator('#note-empty')).toBeHidden();
});
