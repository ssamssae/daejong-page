import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
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
  await expect(page.locator('body')).toHaveCSS('background-color','rgb(255, 255, 255)');
  expect(await page.locator('body').evaluate(e=>getComputedStyle(e).getPropertyValue('--accent').trim())).toBe('#2458cc');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path).toBe(true);
  const main=await page.locator('main').boundingBox();const header=await page.locator('mb-header .inner').boundingBox();
  expect(Math.abs(main.width-header.width),path).toBeLessThanOrEqual(1);
  if(path==='/'||path==='/products/')await page.screenshot({path:test.info().outputPath(`${path==='/'?'home':'products'}-${width}.png`),fullPage:true});
 }
 expect(errors).toEqual([]);
});
