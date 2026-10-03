import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.env.VERIFY_BASE||'http://localhost:4391';
const out=process.env.VERIFY_OUT||'/Users/user/reports/T-261004-001';
const retired=JSON.parse(fs.readFileSync('src/data/retired-products.json','utf8'));
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 for(const width of [390,1440]) {
  await page.setViewportSize({width,height:900});
  const res=await page.goto(base+'/products/',{waitUntil:'domcontentloaded'});assert.equal(res.status(),200);
  await page.locator('[data-catalog-controls]:not([hidden])').waitFor();
  assert.equal(await page.locator('[data-catalog-item]').count(),13);
  assert.equal(await page.locator('#retired-products li').count(),12);
  for(const item of retired){assert((await page.locator('#retired-products').innerText()).includes(item.name));assert(!(await page.locator('#catalog').innerText()).includes(item.name));}
  await page.locator('[data-filter=app]').click();assert.equal(await page.locator('[data-catalog-item]:visible').count(),6);
  await page.locator('[data-filter=tool]').click();assert.equal(await page.locator('[data-catalog-item]:visible').count(),7);
  await page.locator('[data-catalog-search]').fill('Jarvis');assert.equal(await page.locator('[data-catalog-item]:visible').count(),1);
  await page.locator('[data-catalog-search]').fill('');await page.locator('[data-filter=all]').click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.equal(await page.locator('meta[property="og:image"]').count(),1);
  assert((await page.locator('meta[property="og:image"]').getAttribute('content')).includes('59a349c1f82627cd'));
  await page.screenshot({path:`${out}/products-${width}.png`,fullPage:true});
  await page.goto(base+'/timeline.html/',{waitUntil:'domcontentloaded'});
  await page.locator('#events .event-row').first().waitFor();
  const history=await page.locator('#events').innerText();
  for(const item of retired)assert(history.includes(`${item.name} — ${item.status}`));
  assert(history.includes('첫 번째 코드'));assert.equal(await page.locator('meta[property="og:image"]').count(),1);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({base,active:13,retired:12,widths:[390,1440],filter_search:'pass',timeline:'pass',metadata:'pass',errors},null,2));
}finally{await browser.close()}
