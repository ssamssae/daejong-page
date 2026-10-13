import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyProductIcons} from '../scripts/verify-product-icons.mjs';
const icon='https://kangdaejong.com/brand/products/memo.webp';
const catalog={products:[{id:'memo',icon},{id:'local',exception:'No approved image'}]};
const card=(id,img)=>`<article data-catalog-item data-product-id="${id}">${img?`<img src="${img}">`:''}</article>`;
test('all cards require current canonical image or named exception',()=>{
  assert.equal(verifyProductIcons(card('memo',icon)+card('local'),catalog),2);
  assert.throws(()=>verifyProductIcons(card('memo','/product-icons/old.webp'),catalog),/stale icon/);
  assert.throws(()=>verifyProductIcons(card('memo'),catalog),/stale icon/);
  assert.throws(()=>verifyProductIcons(card('unknown'),catalog),/Unknown product/);
  assert.throws(()=>verifyProductIcons('<article data-catalog-item></article>',catalog),/ID/);
  assert.throws(()=>verifyProductIcons('',catalog),/coverage/);
});
