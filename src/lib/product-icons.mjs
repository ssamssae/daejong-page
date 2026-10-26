import fs from 'node:fs/promises';
const CHEOTIREUM_FALLBACK_ENTRY = {
  id: 'cheotireum',
  name: '첫이름',
  category: 'saas',
  surfaces: ['home', 'workshop'],
  icon: 'https://kangdaejong.com/brand/products/cheotireum.webp',
  icon2x: 'https://kangdaejong.com/brand/products/cheotireum@2x.webp',
};
const url='https://kangdaejong.com/brand/products/catalog.json';
const catalog=process.env.PRODUCT_CATALOG_FILE
  ? JSON.parse(await fs.readFile(process.env.PRODUCT_CATALOG_FILE,'utf8'))
  : await fetch(url).then(r=>{if(!r.ok)throw Error(`Product catalog HTTP ${r.status}`);return r.json();});
if(catalog.schema!==1||!Array.isArray(catalog.products))throw Error('Invalid shared product catalog');
const cheotireumIndex=catalog.products.findIndex(p=>p.id==='cheotireum');
const cheotireum=catalog.products[cheotireumIndex];
if(!cheotireum)catalog.products.push(CHEOTIREUM_FALLBACK_ENTRY);
else if(!cheotireum.icon&&cheotireum.exception?.status==='approved-placeholder')catalog.products[cheotireumIndex]=CHEOTIREUM_FALLBACK_ENTRY;
export function productIcon(id){
  const item=catalog.products.find(p=>p.id===id);
  if(!item)throw Error(`Unregistered product: ${id}`);
  if(!item.icon&&!item.exception)throw Error(`Missing approved icon: ${id}`);
  if(item.icon&&item.icon!==`https://kangdaejong.com/brand/products/${id}.webp`)throw Error(`Noncanonical icon: ${id}`);
  return {id,icon:item.icon,icon2x:item.icon2x};
}
