import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const company=process.env.COMPANY_DIST;
if(!company)throw Error('Set COMPANY_DIST to the matching company build');
const out='site-release-report/work-browser';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
try{
  for(const width of [390,1440]){
    const context=await browser.newContext({viewport:{width,height:900}});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await context.route('https://kangdaejong.com/**',async route=>{
      const url=new URL(route.request().url());
      let file=path.join(url.pathname.startsWith('/work/')?'dist':company,decodeURIComponent(url.pathname));
      if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
      if(fs.existsSync(file)&&fs.statSync(file).isFile())await route.fulfill({path:file});
      else await route.fulfill({status:404,body:'Not found'});
    });
    await page.goto('https://kangdaejong.com/work/',{waitUntil:'networkidle'});
    assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://kangdaejong.com/work/');
    await page.getByLabel('기록 검색').fill('자동화');
    const result=page.locator('[data-site-search-results] a').first();
    await result.waitFor({timeout:20000});
    const href=await result.getAttribute('href');
    assert.ok(new URL(href,page.url()).pathname.startsWith('/work/'),href);
    await result.click();await page.waitForLoadState('networkidle');
    assert.ok(page.url().startsWith('https://kangdaejong.com/work/'));
    assert.ok(await page.locator('h1').count());
    await page.screenshot({path:path.join(out,`article-${width}.png`),fullPage:true});
    await page.goto('https://kangdaejong.com/work/products/',{waitUntil:'networkidle'});
    await page.locator('[data-catalog-search]').fill('Jarvis');
    assert.equal(await page.locator('[data-catalog-item]:visible').count(),1);
    await page.locator('[data-catalog-search]').fill('');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    assert.equal(await page.locator('mb-header').locator('a.brand').getAttribute('href'),'https://kangdaejong.com/');
    assert.ok(await page.locator('mb-header').locator('a[href="https://kangdaejong.com/work/"]').count());
    await page.screenshot({path:path.join(out,`products-${width}.png`),fullPage:true});
    assert.deepEqual(errors,[]);
    results.push({width,searchResult:href,articleOpened:true,productSearch:true,overflow:false,errors});
    await context.close();
  }
}finally{await browser.close();}
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(results,null,2)+'\n');
console.log('Mounted browser search, article navigation, product search and company navigation passed at 390/1440px');
