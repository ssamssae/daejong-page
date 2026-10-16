import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {workUrl,workScript,mountHtml,mountCss,mountWork,routeFor} from '../scripts/work-mount.mjs';

const roots=new Set(['_astro','insights','newsletter','products','nl-go','pagefind']);
test('URLs retain fragments and query strings without moving company/external destinations',()=>{
  assert.equal(workUrl('/newsletter/ep1/?x=1#part'),'/work/newsletter/ep1/?x=1#part');
  assert.equal(workUrl('https://work.kangdaejong.com/products/'),'https://kangdaejong.com/work/products/');
  for(const url of ['https://kangdaejong.com/','https://example.com/x','//cdn.example.com/x','#part','/work/products/'])assert.equal(workUrl(url),url);
});
test('client paths move, while slash operations and collector API paths retain their meaning',()=>{
  const js=`import('/pagefind/pagefind.js'); link.href='/insights/'+slug; path.split('/'); fetch('/v1/events'); path.startsWith('/nl-go/');`;
  const result=workScript(js,roots);
  assert.match(result,/import\('\/work\/pagefind\/pagefind.js'\)/);
  assert.match(result,/href='\/work\/insights\/'\+slug/);
  assert.match(result,/split\('\/'\)/);assert.match(result,/fetch\('\/v1\/events'\)/);
  assert.match(result,/startsWith\('\/work\/nl-go\/'\)/);
  assert.equal(workScript(result,roots),result);
});
test('HTML retains article examples and external links, adds one canonical and relocates actual URLs',()=>{
  const before=`<!doctype html><html><head><meta property="og:url" content="https://work.kangdaejong.com/insights/a/"><script type="application/ld+json">{"url":"https://work.kangdaejong.com/insights/a/"}</script></head><body><h1>A</h1><a href="/products/?p=1#x">P</a><img src="/_astro/a.svg"><pre>https://work.kangdaejong.com/example</pre><a href="https://kangdaejong.com/">Company</a></body></html>`;
  const result=mountHtml(before,'/insights/a/',roots);
  assert.equal(result.canonical,'https://kangdaejong.com/work/insights/a/');assert.equal(result.indexable,true);
  assert.equal((result.html.match(/rel="canonical"/g)||[]).length,1);
  assert.match(result.html,/href="\/work\/products\/\?p=1#x"/);
  assert.match(result.html,/src="\/work\/_astro\/a.svg"/);
  assert.match(result.html,/<pre>https:\/\/work.kangdaejong.com\/example<\/pre>/);
  assert.match(result.html,/href="https:\/\/kangdaejong.com\/"/);
});
test('redirect stubs, click hops and existing noindex pages stay out of the sitemap',()=>{
  for(const [route,head] of [['/apps/','<meta name="robots" content="noindex">'],['/automation.html/','<meta http-equiv="refresh" content="0; url=/products/">'],['/nl-go/products/','']]){
    const result=mountHtml(`<html><head>${head}</head><body></body></html>`,route,roots);
    assert.equal(result.indexable,false);assert.match(result.html,/noindex/);
    if(head.includes('refresh'))assert.match(result.html,/url=\/work\/products\//);
  }
});
test('directory-style HTML canonicals match the emitted route',()=>{
  assert.equal(routeFor('stack.html/index.html'),'/stack.html/');
  const result=mountHtml('<head><link rel="canonical" href="https://work.kangdaejong.com/stack.html"></head>','/stack.html/',roots);
  assert.equal(result.canonical,'https://kangdaejong.com/work/stack.html/');
  assert.equal(mountCss('a{background:url(/a.png)}'),'a{background:url(/work/a.png)}');
});
test('mount preserves legacy files, excludes noindex, copies assets, and is repeatable',async()=>{
  const dist=await fs.mkdtemp(path.join(os.tmpdir(),'work-mount-'));
  try{
    const home='<html><head><title>Home</title></head><body><a href="/article/">Article</a></body></html>';
    await fs.writeFile(path.join(dist,'index.html'),home);
    await fs.mkdir(path.join(dist,'article'));
    await fs.writeFile(path.join(dist,'article/index.html'),'<head><meta name="robots" content="noindex"></head>');
    await fs.writeFile(path.join(dist,'sitemap.xml'),'<urlset><url><loc>https://work.kangdaejong.com/</loc></url><url><loc>https://work.kangdaejong.com/article/</loc></url></urlset>');
    await fs.writeFile(path.join(dist,'image.png'),new Uint8Array([1,2,3]));
    await fs.writeFile(path.join(dist,'CNAME'),'work.kangdaejong.com');
    const a=await mountWork(dist),b=await mountWork(dist);
    assert.deepEqual(a,b);assert.equal(await fs.readFile(path.join(dist,'index.html'),'utf8'),home);
    assert.deepEqual(a.urls,['https://kangdaejong.com/work/']);
    assert.deepEqual(await fs.readFile(path.join(dist,'work/image.png')),Buffer.from([1,2,3]));
    await assert.rejects(fs.stat(path.join(dist,'work/CNAME')));
  }finally{await fs.rm(dist,{recursive:true,force:true});}
});
