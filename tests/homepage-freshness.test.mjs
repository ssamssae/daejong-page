import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildPublicActivity} from '../src/lib/public-activity.mjs';
import {createMarkdownProcessor} from '@astrojs/markdown-remark';
const entry=(id,date,version='v1')=>({id,data:{date,version,title:id},body:'private body must never appear'});
test('activity counts use KST dates, latest daily worklog, and exclude future posts',()=>{
 const a=buildPublicActivity({worklog:[entry('old','2026-09-22','v1'),entry('latest','2026-09-22','v2'),entry('week','2026-09-16'),entry('earlier','2026-09-15'),entry('future','2026-09-24')],newsletter:[entry('ep','2026-09-22')],insights:[]},new Date('2026-09-22T15:01:00Z'));
 assert.equal(a.as_of,'2026-09-23');assert.equal(a.totals.worklog,3);assert.equal(a.totals.last_7_days,2);assert.equal(a.totals.last_30_days,4);assert(!a.recent.some(x=>['old','future'].includes(x.title)));assert(!JSON.stringify(a).includes('private body'));
});
test('adding a published entry updates totals and most recent item without a JSON refresh',()=>{
 const now=new Date('2026-09-23T10:00:00Z');const collections={worklog:[],newsletter:[],insights:[]};const before=buildPublicActivity(collections,now);collections.newsletter.push(entry('new','2026-09-23'));const after=buildPublicActivity(collections,now);assert.equal(after.totals.last_7_days,before.totals.last_7_days+1);assert.equal(after.recent[0].href,'/newsletter/new/');
});
test('numeric ranges remain readable while explicit double-tilde deletions still work',async()=>{
 const p=await createMarkdownProcessor({remarkPlugins:[['remark-gfm',{singleTilde:false}]]});
 const out=await p.render('전체 6.268~7.016초, 생성 4.190~4.191초. ~~삭제한 문장~~');
 assert(out.code.includes('6.268~7.016'));assert(out.code.includes('4.190~4.191'));assert(out.code.includes('<del>삭제한 문장</del>'));assert.equal((out.code.match(/<del>/g)||[]).length,1);
 const article=await p.render(readFileSync(new URL('../src/content/newsletter/ep124.md',import.meta.url),'utf8').replace(/^---[\s\S]*?---\s*/,''));assert(!article.code.includes('<del>'));
});

test('month-only archive dates count in the archive without inventing a publication day',()=>{
 const a=buildPublicActivity({insights:[entry('monthly','2026-09'),entry('future','2026-10')]},new Date('2026-09-22T10:00:00Z'));
 assert.equal(a.totals.insights,1);assert.equal(a.totals.last_7_days,0);assert.equal(a.totals.last_30_days,0);assert.equal(a.recent[0].date,'2026-09');
});
