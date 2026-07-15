import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, test } from '@playwright/test';

test('randompick privacy page matches the current offline app', async ({ page }) => {
  const sourcePath = path.resolve('public', 'privacy-randompick.html');
  const source = fs.readFileSync(sourcePath, 'utf8');

  expect(source).toContain('숫자 6개를 한 번에 5세트');
  expect(source).toContain('개인정보를 수집하지 않습니다');
  expect(source).toContain('외부 서버로 전송하지');
  expect(source).toContain('광고, 분석 SDK, 크래시 리포팅 도구');
  expect(source).not.toContain('회차별 통계');
  expect(source).not.toContain('추천 번호');

  const builtPath = path.resolve('dist', 'privacy-randompick.html');
  await page.goto(pathToFileURL(builtPath).href);
  await expect(page.getByRole('heading', { name: '행운번호 생성기 개인정보 처리방침' })).toBeVisible();
  await expect(page.getByText('숫자 6개를 한 번에 5세트', { exact: false })).toBeVisible();

  const screenshotDir = path.resolve('test-results', 'privacy-randompick');
  fs.mkdirSync(screenshotDir, { recursive: true });
  await page.screenshot({
    path: path.join(screenshotDir, 'privacy-randompick.png'),
    fullPage: true,
  });
  console.log(`screenshot:path=${screenshotDir}`);
});
