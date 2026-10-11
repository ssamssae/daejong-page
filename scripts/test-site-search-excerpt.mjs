// T-261011-022: Pagefind excerpt is already HTML-escaped text with <mark> highlights.
// SiteSearch.astro must not escape it again ("<task>" showed as "&lt;task&gt;"),
// and must still neutralise any tag other than <mark>.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/SiteSearch.astro", import.meta.url), "utf8");
const match = source.match(/function excerptHtml\(excerpt\) \{[\s\S]*?\n    \}/);
assert.ok(match, "excerptHtml() not found in SiteSearch.astro");
const excerptHtml = new Function(`${match[0]}; return excerptHtml;`)();

// What a browser shows for element.innerHTML = html (tags dropped, entities decoded once).
const shown = (html) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

test("escaped characters from Pagefind are shown once", () => {
  // real excerpt from work.kangdaejong.com/worklog/2026-05-17_v101/ (query "PR")
  const html = excerptHtml("Mac mini: macmini/&lt;task&gt;-YYYY-MM-DD <mark>(PR</mark> R&amp;D");
  assert.equal(shown(html), "Mac mini: macmini/<task>-YYYY-MM-DD (PR R&D");
});

test("mark highlights survive", () => {
  assert.match(excerptHtml("a <mark>main</mark> b"), /<mark>main<\/mark>/);
});

test("tags other than mark are neutralised", () => {
  const html = excerptHtml('<img src=x onerror=alert(1)><mark>a</mark></script>');
  assert.doesNotMatch(html, /<img|<\/script/);
  assert.match(html, /<mark>a<\/mark>/);
});
