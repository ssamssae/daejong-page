import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse, parseFragment, serialize} from 'parse5';

export const BASE = '/work';
export const PUBLIC = 'https://kangdaejong.com/work';
const OLD = 'https://work.kangdaejong.com';

export function workUrl(value) {
  if (value === OLD || value === OLD + '/') return PUBLIC + '/';
  if (value.startsWith(OLD + '/')) return PUBLIC + value.slice(OLD.length);
  if (value.startsWith(OLD + '?') || value.startsWith(OLD + '#')) return PUBLIC + '/' + value.slice(OLD.length);
  if (/^\/(?!\/)/.test(value) && value !== BASE && !value.startsWith(BASE + '/')) return BASE + value;
  return value;
}

// Only URL roots which actually exist in this build are rewritten in client code.
// In particular, split('/'), external API '/v1/events', and CSS selectors stay intact.
export function workScript(text, roots) {
  return text.replaceAll(OLD, PUBLIC).replaceAll("'work.kangdaejong.com'", "'kangdaejong.com'")
    .replaceAll('"work.kangdaejong.com"', '"kangdaejong.com"')
    .replace(/(["'`])(\/(?!\/)[^"'`\s<>]*)\1/g, (whole, quote, value) => {
      const root = value.slice(1).split(/[/?#]/)[0];
      return roots.has(root) ? quote + workUrl(value) + quote : whole;
    })
    .replace(/(location\.replace\(["'`])\/(["'`]\))?/g, (whole, start, end) => end ? start + BASE + '/' + end : whole);
}

const get = (node, name) => node.attrs?.find(a => a.name === name)?.value;
function set(node, name, value) {
  const attr = node.attrs.find(a => a.name === name);
  if (attr) attr.value = value;
  else node.attrs.push({name, value});
}
function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes || []) walk(child, visit);
  if (node.content) walk(node.content, visit);
}
export function routeFor(file) {
  return '/' + (file === 'index.html' ? '' : file.endsWith('/index.html') ? file.slice(0, -10) : file);
}
const escapeXml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

export function mountHtml(html, route, roots) {
  const tree = parse(html, {scriptingEnabled: false});
  let head, canonical, noindex = false, redirect = false;
  walk(tree, node => {
    if (node.tagName === 'head') head = node;
    if (node.tagName === 'meta') {
      if (get(node, 'name')?.toLowerCase() === 'robots' && /\bnoindex\b/i.test(get(node, 'content') || '')) noindex = true;
      if (get(node, 'http-equiv')?.toLowerCase() === 'refresh') {
        redirect = true;
        set(node, 'content', (get(node, 'content') || '').replace(/(url\s*=\s*)(.*)$/i, (_, prefix, target) => prefix + workUrl(target)));
      }
    }
    if (node.tagName === 'link' && get(node, 'rel') === 'canonical') canonical ||= get(node, 'href');
    for (const attr of node.attrs || []) {
      if (['href','src','poster','action','data-src','data-nl-original'].includes(attr.name)) attr.value = workUrl(attr.value);
      if (attr.name === 'srcset') attr.value = attr.value.split(',').map(item => item.replace(/^(\s*)(\S+)/, (_, ws, url) => ws + workUrl(url))).join(',');
      if (attr.name === 'content' && /^(https:\/\/work\.kangdaejong\.com)(?:[/?#]|$)/.test(attr.value)) attr.value = workUrl(attr.value);
    }
    if (node.tagName === 'script') for (const child of node.childNodes || []) if (child.nodeName === '#text') child.value = workScript(child.value, roots);
    if (node.tagName === 'style') for (const child of node.childNodes || []) if (child.nodeName === '#text') child.value = mountCss(child.value);
  });
  if (!head) throw Error(`Missing head: ${route}`);
  const self = PUBLIC + route;
  const target = canonical ? workUrl(canonical) : self;
  // Directory-index pages have a trailing slash, including Astro's *.html routes.
  const samePage = target.replace(/\/$/, '') === self.replace(/\/$/, '');
  const chosen = !canonical || samePage ? self : target;
  noindex ||= redirect || route.startsWith('/nl-go/') || /^\/404(?:[/.]|$)/.test(route);
  head.childNodes = head.childNodes.filter(node => !(node.tagName === 'link' && get(node, 'rel') === 'canonical'));
  const extra = parseFragment(`<link rel="canonical" href="${escapeXml(chosen)}"><meta name="workshop-base" content="/work/">${noindex ? '<meta name="robots" content="noindex,follow">' : ''}`);
  for (const node of extra.childNodes) {node.parentNode = head; head.childNodes.push(node);}
  walk(head, node => {if (node.tagName === 'meta' && get(node, 'property') === 'og:url') set(node, 'content', chosen);});
  return {html: serialize(tree), canonical: chosen, indexable: !noindex && chosen === self};
}

export function mountCss(text) {
  return text.replace(/url\(\s*(["']?)(\/(?!\/)[^)'"\s]+)\1\s*\)/g, (_, quote, url) => `url(${quote}${workUrl(url)}${quote})`);
}

async function filesIn(dir, prefix = '') {
  const files=[];
  for (const entry of await fs.readdir(dir, {withFileTypes:true})) {
    if (!prefix && entry.name === 'work') continue;
    const rel = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(path.join(dir,entry.name), rel));
    else if (entry.isFile()) files.push(rel);
  }
  return files;
}

export async function mountWork(dist) {
  const files = await filesIn(dist);
  if (!files.includes('index.html')) throw Error('Build the workshop before mounting it');
  const roots = new Set(files.map(file => file.split('/')[0]));
  roots.add('pagefind');
  const allowed = new Set();
  for (const file of files.filter(file => /^sitemap.*\.xml$/.test(file))) {
    const xml = await fs.readFile(path.join(dist,file),'utf8');
    for (const [,loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const url = new URL(loc.replaceAll('&amp;','&'));
      if (!url.pathname.endsWith('.xml')) allowed.add(url.pathname);
    }
  }
  if (!allowed.has('/')) throw Error('Original sitemap must contain the homepage');
  const destination = path.join(dist, 'work');
  // Only this generated mount is replaced; source and legacy dist files are untouched.
  await fs.rm(destination, {recursive:true,force:true});
  const sitemap=[], pages=[];
  for (const file of files) {
    if (file === 'CNAME' || file.startsWith('pagefind/')) continue;
    const from=path.join(dist,file), to=path.join(destination,file);
    await fs.mkdir(path.dirname(to),{recursive:true});
    if (file.endsWith('.html')) {
      const route=routeFor(file), result=mountHtml(await fs.readFile(from,'utf8'),route,roots);
      await fs.writeFile(to,result.html);
      pages.push({route,canonical:result.canonical,indexable:result.indexable});
      if (result.indexable && allowed.has(route)) sitemap.push(result.canonical);
    } else if (/\.(?:m?js|css|json|xml)$/.test(file)) {
      const text=await fs.readFile(from,'utf8');
      await fs.writeFile(to,file.endsWith('.css') ? mountCss(text) : workScript(text,roots));
    } else await fs.copyFile(from,to);
  }
  const urls=[...new Set(sitemap)].sort();
  const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(url=>`<url><loc>${escapeXml(url)}</loc></url>`).join('\n')+'\n</urlset>\n';
  await fs.writeFile(path.join(destination,'sitemap.xml'),xml);
  await fs.writeFile(path.join(destination,'sitemap-index.xml'),'<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://kangdaejong.com/sitemap.xml</loc></sitemap></sitemapindex>\n');
  await fs.writeFile(path.join(destination,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: https://kangdaejong.com/sitemap.xml\n');
  const release={schema:1,base:BASE+'/',canonicalOrigin:PUBLIC+'/',htmlPages:pages.length,sitemapUrls:urls.length};
  await fs.writeFile(path.join(destination,'workshop-mount.json'),JSON.stringify(release,null,2)+'\n');
  console.log(`Mounted workshop: ${pages.length} HTML pages; ${urls.length} canonical sitemap URLs`);
  return {release,pages,urls};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await mountWork(path.resolve(process.argv[2] || 'dist'));
