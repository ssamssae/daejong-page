import fs from 'node:fs';
import path from 'node:path';
import {parse} from 'parse5';
import {PUBLIC, routeFor} from './work-mount.mjs';

const root=path.resolve('dist/work');
const errors=[], pages=new Map(), missing=new Map();
const files=fs.readdirSync(root,{recursive:true}).filter(file=>fs.statSync(path.join(root,file)).isFile());
const available=new Set(files);
const get=(node,name)=>node.attrs?.find(a=>a.name===name)?.value;
function walk(node,fn){fn(node);for(const child of node.childNodes||[])walk(child,fn);if(node.content)walk(node.content,fn);}
function exists(url){
  const file=decodeURIComponent(url.pathname.slice('/work/'.length));
  return available.has(file)||available.has(file+'index.html')||available.has(file+'/index.html');
}
for(const file of files.filter(f=>f.endsWith('.html'))){
  const self=PUBLIC+routeFor(file), canonicals=[];
  let noindex=false;
  walk(parse(fs.readFileSync(path.join(root,file),'utf8'),{scriptingEnabled:false}),node=>{
    if(node.tagName==='link'&&get(node,'rel')==='canonical')canonicals.push(get(node,'href'));
    if(node.tagName==='meta'&&get(node,'name')==='robots'&&/noindex/i.test(get(node,'content')))noindex=true;
    for(const attr of node.attrs||[]){
      if(!['href','src','poster','action','data-src','srcset'].includes(attr.name))continue;
      const refs=attr.name==='srcset'?attr.value.split(',').map(v=>v.trim().split(/\s+/)[0]):[attr.value];
      for(const value of refs){
        if(value.startsWith('https://work.kangdaejong.com'))errors.push(`${file}: legacy ${attr.name} ${value}`);
        // Absolute company links point to shared assets or company pages. Relative
        // links must resolve to files in the mounted artifact, just as on Pages.
        if(!value||/^(?:[\w+.-]+:|\/\/|#)/.test(value))continue;
        const url=new URL(value,self);
        if(!url.pathname.startsWith('/work/')){errors.push(`${file}: escaped mount ${value}`);continue;}
        if(!exists(url))missing.set(url.pathname,(missing.get(url.pathname)||0)+1);
      }
    }
  });
  if(canonicals.length!==1)errors.push(`${file}: ${canonicals.length} canonicals`);
  pages.set(self,{canonical:canonicals[0],noindex});
}
const xml=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1].replaceAll('&amp;','&'));
if(urls.length!==new Set(urls).size)errors.push('duplicate sitemap URLs');
for(const url of urls){
  const page=pages.get(url);
  if(!page||page.noindex||page.canonical!==url)errors.push(`noncanonical or nonindexable sitemap URL: ${url}`);
}
for(const route of ['/','/products/','/worklog/','/newsletter/','/insights/'])if(!urls.includes(PUBLIC+route))errors.push(`missing section: ${route}`);
if(!available.has('pagefind/pagefind.js'))errors.push('missing mounted search index');
// Report inherited broken links separately; fail only if the mount introduced one.
const inherited=[];
for(const [url,count] of missing){
  const original=url.slice('/work/'.length);
  if(fs.existsSync(path.join('dist',original))||fs.existsSync(path.join('dist',original,'index.html')))errors.push(`missing mounted file: ${url}`);
  else inherited.push({url,count});
}
const report={htmlPages:pages.size,sitemapUrls:urls.length,errors,inheritedMissingLinks:inherited};
fs.mkdirSync('site-release-report',{recursive:true});
fs.writeFileSync('site-release-report/work-mount.json',JSON.stringify(report,null,2)+'\n');
console.log(`Mounted artifact: ${pages.size} pages, ${urls.length} sitemap URLs, ${errors.length} migration errors, ${inherited.length} inherited missing link targets`);
if(errors.length){console.error(errors.slice(0,30).join('\n'));process.exitCode=1;}
