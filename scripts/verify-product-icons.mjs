import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
export function verifyProductIcons(html,catalog){
  const cards=html.match(/<article\b[\s\S]*?<\/article>/g)?.filter(x=>x.includes('data-catalog-item'))||[];
  assert(cards.length,'No product cards: cannot claim coverage');
  const seen=new Set();
  for(const card of cards){
    const id=card.match(/data-product-id="([^"]+)"/)?.[1];
    assert(id,'Card missing product ID');assert(!seen.has(id),`Duplicate product ${id}`);seen.add(id);
    const p=catalog.products.find(p=>p.id===id);assert(p,`Unknown product ${id}`);
    const src=card.match(/<img\b[^>]*src="([^"]+)"/)?.[1];
    if(p.exception){assert(p.exception.trim()&&!src,`Invalid icon exception ${id}`);continue;}
    assert.equal(src,p.icon,`Missing or stale icon ${id}`);
    assert.equal(p.icon,`https://kangdaejong.com/brand/products/${id}.webp`,`Noncanonical icon ${id}`);
    const srcset=card.match(/srcset="([^"]+)"/)?.[1];
    if(srcset)for(const part of srcset.split(','))assert([p.icon,p.icon2x].includes(part.trim().split(/\s/)[0]),`Stale srcset ${id}`);
  }
  return cards.length;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const catalog=process.env.PRODUCT_CATALOG_FILE?JSON.parse(await fs.readFile(process.env.PRODUCT_CATALOG_FILE,'utf8')):await fetch('https://kangdaejong.com/brand/products/catalog.json').then(r=>{assert(r.ok,'Catalog unavailable');return r.json();});
  const html=await fs.readFile('dist/products/index.html','utf8');
  console.log(`Product coverage: ${verifyProductIcons(html,catalog)} cards verified against the central catalog`);
}
