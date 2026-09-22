import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('src/data/product-icon-sources.json',root),'utf8'));
const html=readFileSync(new URL('dist/products/index.html',root),'utf8');
const names=new Set();
for(const item of manifest.icons){
 assert(!names.has(item.name),`duplicate product: ${item.name}`);names.add(item.name);
 assert(item.source.startsWith('https://'),`missing official source: ${item.name}`);
 const file=new URL('public'+item.icon,root);
 assert(existsSync(file),`missing asset: ${item.name}`);
 assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),item.sha256,`source bytes changed: ${item.name}`);
 const article=html.match(/<article\b[\s\S]*?<\/article>/g)?.find(x=>x.includes('data-catalog-item') && x.replace(/<h3\b[^>]*>/g, "<h3>").includes(`<h3>${item.name}</h3>`));
 assert(article,`missing product card: ${item.name}`);
 assert(article.includes(`src="${item.icon}"`),`card uses stale icon or fallback: ${item.name}`);
 assert(existsSync(new URL('dist'+item.icon,root)),`icon missing from build: ${item.name}`);
}
assert(manifest.icons.length>0,'empty icon manifest');
console.log(`PASS: ${manifest.icons.length} official icon hashes, built assets and product-card images`);
