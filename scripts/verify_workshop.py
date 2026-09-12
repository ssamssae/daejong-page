"""Verify the rendered workshop boundary without a browser or extra packages."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
ORIGIN = "https://work.kangdaejong.com"


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.ids = set()
        self.source = path.read_text(encoding="utf-8")
        self.feed(self.source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if attrs.get("id"):
            self.ids.add(attrs["id"])


def target_file(path):
    target = DIST / unquote(path).lstrip("/")
    return target / "index.html" if target.is_dir() else target


assert DIST.is_dir(), "Run npm run build first"
pages = {}
for path in DIST.rglob("*.html"):
    if not path.is_file():
        continue
    html = path.read_text(encoding="utf-8")
    if 'id="main-content"' in html:
        page = Page(path)
        pages[path] = page
        if path.relative_to(DIST).parts[0] != "nl-go":
            assert any(tag == "h1" for tag, _ in page.tags), f"Missing title: {path}"
        assert any(tag == "header" and "site-header" in attrs.get("class", "").split()
                   for tag, attrs in page.tags), f"Missing navigation: {path}"
        assert any(tag == "meta" and attrs.get("name") == "theme-color"
                   and attrs.get("content") == "#f7f6f2" for tag, attrs in page.tags), path
        for tag, attrs in page.tags:
            asset = attrs.get("src") if tag in ("img", "script") else (
                attrs.get("href") if tag == "link" and attrs.get("rel") == "stylesheet" else None
            )
            if asset and asset.startswith("/") and not asset.startswith("//"):
                assert target_file(urlsplit(asset).path).exists(), f"Missing asset: {asset}"

assert len(pages) > 100, "Content collections were not rendered"
owned_routes = ["/", "/products/", "/about/", "/system/", "/lab/",
                "/worklog/", "/newsletter/", "/insights/"]
checked_links = 0
for route in owned_routes:
    path = target_file(route)
    assert path in pages, f"Missing renewed route: {route}"
    for tag, attrs in pages[path].tags:
        if tag != "a" or not attrs.get("href"):
            continue
        url = urlsplit(urljoin(ORIGIN + route, attrs["href"]))
        if url.netloc != urlsplit(ORIGIN).netloc or url.scheme not in ("http", "https"):
            continue
        target = target_file(url.path)
        assert target.exists(), f"Broken link in {route}: {attrs['href']}"
        if url.fragment:
            dest = pages.get(target) or Page(target)
            assert unquote(url.fragment) in dest.ids, f"Broken anchor: {attrs['href']}"
        checked_links += 1

products = pages[target_file("/products/")]
for route in ("/worklog/", "/newsletter/", "/insights/"):
    assert sum("data-story-meta" in attrs for _, attrs in pages[target_file(route)].tags) == 3, \
        f"Latest-story dates/episode metadata missing: {route}"
items = [attrs for _, attrs in products.tags if "data-catalog-item" in attrs]
filters = {attrs["data-filter"] for _, attrs in products.tags if "data-filter" in attrs}
assert items and {item["data-kind"] for item in items} == {"app", "saas", "tool", "ebook"}
assert filters == {"all", "app", "saas", "tool", "ebook"}
assert len({item["data-search"] for item in items}) == len(items), "Duplicate catalog items"
assert any("data-catalog-empty" in attrs and "hidden" in attrs for _, attrs in products.tags)
assert any(tag == "input" and attrs.get("type") == "search" for tag, attrs in products.tags)

toc_links = 0
for path, page in pages.items():
    for tag, attrs in page.tags:
        href = attrs.get("href", "")
        if tag == "a" and href.startswith("#") and "article-frame" in page.source:
            assert unquote(href[1:]) in page.ids, f"Invalid article anchor in {path}: {href}"
            toc_links += 1

print(f"PASS: {len(pages)} renewed pages, {len(items)} catalog products, "
      f"{checked_links} index links, {toc_links} article anchors; all local assets present")
