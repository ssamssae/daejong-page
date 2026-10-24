import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
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
test('approved letter-mark exceptions are validated without changing the catalog',()=>{
  const exception=Object.freeze({status:'approved-placeholder',reason:'Web service uses approved letter-mark fallback.',fallback:'letter-mark',approvedAt:'2026-10-24'});
  const product=Object.freeze({id:'cheotireum',icon:null,icon2x:null,exception});
  const input=Object.freeze({products:Object.freeze([product])});
  assert.equal(verifyProductIcons(card('cheotireum'),input),1);
  assert.throws(()=>verifyProductIcons(card('cheotireum',icon),input),/Invalid icon exception/);
  for(const invalid of [{...exception,reason:' '},{...exception,status:'pending'},{...exception,fallback:'unknown'}]){
    assert.throws(()=>verifyProductIcons(card('cheotireum'),{products:[{...product,exception:invalid}]}),/Invalid icon exception/);
  }
});
test('the verifier never supplies a missing cheotireum catalog entry',()=>{
  const input=Object.freeze({products:Object.freeze([])});
  assert.throws(()=>verifyProductIcons(card('cheotireum'),input),/Unknown product cheotireum/);
  assert.deepEqual(input,{products:[]});
});
for(const registered of [false,true])test(`loader and CLI ${registered?'preserve the central icon':'supply the missing letter-mark'}`,()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'product-icons-'));
  const centralIcon='https://kangdaejong.com/brand/products/cheotireum.webp';
  const product={id:'cheotireum',icon:centralIcon,icon2x:null};
  const input=JSON.stringify({schema:1,products:registered?[product]:[]});
  const fixture=path.join(temp,'catalog.json');
  try{
    fs.writeFileSync(fixture,input);
    fs.mkdirSync(path.join(temp,'dist/products'),{recursive:true});
    fs.writeFileSync(path.join(temp,'dist/products/index.html'),card('cheotireum',registered?centralIcon:null));
    const env={...process.env,PRODUCT_CATALOG_FILE:fixture};
    const moduleUrl=new URL('../src/lib/product-icons.mjs',import.meta.url).href;
    const result=execFileSync(process.execPath,['--input-type=module','-e',`import {productIcon} from ${JSON.stringify(moduleUrl)}; console.log(JSON.stringify(productIcon('cheotireum')));`],{env,encoding:'utf8'});
    assert.deepEqual(JSON.parse(result),{id:'cheotireum',icon:registered?centralIcon:null,icon2x:null});
    const verifier=fileURLToPath(new URL('../scripts/verify-product-icons.mjs',import.meta.url));
    assert.match(execFileSync(process.execPath,[verifier],{env,cwd:temp,encoding:'utf8'}),/1 cards verified/);
    assert.equal(fs.readFileSync(fixture,'utf8'),input);
  }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
