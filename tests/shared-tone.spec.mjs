import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {brandTokens} from '../src/lib/brand-tokens.mjs';
// T-261013-004: 기대 색은 회사홈 공용 원본(tokens.json)에서 계산한다 — 테스트에 색 값을 다시 적지 않는다.
const rgb=(mode,name)=>{const h=brandTokens[mode][name];return `rgb(${[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(', ')})`;};
// Local verification can serve the pending canonical header; production uses its live URL.
test.beforeEach(async({page})=>{
 if(process.env.SHARED_HEADER_FILE) await page.route('https://kangdaejong.com/mb-components.js',route=>route.fulfill({contentType:'application/javascript',body:readFileSync(process.env.SHARED_HEADER_FILE,'utf8')}));
});
for(const width of [390,1440]) test(`shared homepage tone across workshop routes at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const path of ['/','/products/','/worklog/','/newsletter/','/system/','/timeline.html/','/stack.html/']){
  const response=await page.goto(path);expect(response.status(),path).toBe(200);
  await expect(page.locator('mb-header .brand')).toContainText('강대종');
  await expect(page.locator('mb-header .links a')).toHaveText(['프로젝트','앱','연락'],{useInnerText:true});
  await expect(page.locator('body')).toHaveCSS('background-color',rgb('light','--bg'));
  expect(await page.locator('body').evaluate(e=>getComputedStyle(e).getPropertyValue('--accent').trim())).toBe(brandTokens.light['--accent']);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path).toBe(true);
  const main=await page.locator('main').boundingBox();const header=await page.locator('mb-header .inner').boundingBox();
  expect(Math.abs(main.width-header.width),path).toBeLessThanOrEqual(1);
  if(path==='/'||path==='/products/')await page.screenshot({path:test.info().outputPath(`${path==='/'?'home':'products'}-${width}.png`),fullPage:true});
 }
 expect(errors).toEqual([]);
});
// T-261012-024: 기기 설정이 다크면 회사홈(kangdaejong.com)과 같은 다크 팔레트를 쓰고, PC 폭은 헤더·본문 모두 1440px.
test('dark scheme follows the company home palette and wide layout', async ({ page }) => {
 await page.emulateMedia({ colorScheme: 'dark' });
 await page.setViewportSize({ width: 1920, height: 900 });
 for (const path of ['/', '/products/', '/worklog/', '/system/', '/timeline.html/', '/lab/']) {
  const response = await page.goto(path); expect(response.status(), path).toBe(200);
  await expect(page.locator('html'), path).toHaveAttribute('data-theme', 'auto');
  await expect(page.locator('body'), path).toHaveCSS('background-color', rgb('dark','--bg'));
  expect(await page.locator('body').evaluate(e => getComputedStyle(e).getPropertyValue('--accent').trim()), path).toBe(brandTokens.dark['--accent']);
  const main = await page.locator('main').boundingBox(); const header = await page.locator('mb-header .inner').boundingBox();
  expect(Math.round(header.width), path).toBe(1440);
  expect(Math.abs(main.width - header.width), path).toBeLessThanOrEqual(1);
 }
});
// T-261012-040: 레이아웃 밖 정적 페이지(public/privacy*.html·dead-ends/detail.html, page-dark.css)도 다크에서
// 회사홈 팔레트를 쓰고, 공용 헤더는 PC 폭 1440px. T-261012-024 는 Astro 레이아웃만 바꿔 이 15곳을 놓쳤다.
test('static documents follow the company dark palette and wide layout', async ({ page }) => {
 await page.emulateMedia({ colorScheme: 'dark' });
 await page.setViewportSize({ width: 1920, height: 900 });
 for (const path of ['/privacy.html', '/privacy-hanjul.html', '/privacy-stillhere.html']) {
  const response = await page.goto(path); expect(response.status(), path).toBe(200);
  await expect(page.locator('body'), path).toHaveCSS('background-color', rgb('dark','--bg'));
  expect(await page.locator('body').evaluate(e => getComputedStyle(e).getPropertyValue('--accent').trim()), path).toBe(brandTokens.dark['--accent']);
  await expect(page.locator('mb-header .inner'), path).toBeVisible();
  expect(Math.round((await page.locator('mb-header .inner').boundingBox()).width), path).toBe(1440);
 }
 const response = await page.goto('/dead-ends/detail.html'); expect(response.status()).toBe(200);
 await expect(page.locator('body')).toHaveCSS('background-color', rgb('dark','--bg'));
});
