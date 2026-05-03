#!/usr/bin/env python3
"""
sync_from_substack.py — Pull a published Substack article into the local
daejong-page newsletter cache and update index.json.

2026-04-30 directive (A2/B1/C1/D + 23:42 KST 보충):
- Substack 이 SoT
- 캐시 파일 = ~/daejong-page/newsletter/ep<N>-cache.md (덮어쓰기)
  (2026-05-01 변경: 이전 ep<N>-substack.md 는 Ep4/5 의 원본 prose 와 같은 파일명이라
   sync 가 원본을 덮어쓰는 사고가 있었음. issue 2026-05-01-ep5-backfill-overwrite.md)
- 강대종 원본 ep<N>-<YYYY-MM-DD>.md 는 안 건드림 (originFile 로 index.json 에 보존)
- index.json entry: number, cacheFile, originFile (옵션), date, publishedAt, title, subtitle, readingTime, substackUrl
- view.html / newsletter.html 은 cacheFile 을 fetch 해서 렌더

Dependencies (Mac/WSL 양쪽 둘 다):
    pip install --user --break-system-packages markdownify beautifulsoup4 lxml

Usage:
    python3 sync_from_substack.py --url https://daejongkang.substack.com/p/<slug> --ep 5
    python3 sync_from_substack.py --url <url> --ep 4 --reading-time 9
"""

import argparse
import json
import re
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

from bs4 import BeautifulSoup
from markdownify import markdownify as md_convert

REPO = Path(__file__).resolve().parent.parent
NEWS_DIR = REPO / 'newsletter'
INDEX_PATH = NEWS_DIR / 'index.json'


def fetch(url):
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (daejong-page newsletter sync)'},
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode('utf-8')


def parse_article(html):
    soup = BeautifulSoup(html, 'lxml')
    title = soup.select_one('h1.post-title')
    subtitle = soup.select_one('h3.subtitle')
    body = soup.select_one('div.body.markup') or soup.select_one('div.available-content')

    m = re.search(r'"datePublished":"([^"]+)"', html)
    published_at = m.group(1) if m else ''
    pub_date = published_at[:10] if published_at else datetime.now().strftime('%Y-%m-%d')

    if not (title and body):
        sys.exit('parse failed: missing title or body. Substack DOM may have changed.')

    return {
        'title': title.get_text().strip(),
        'subtitle': subtitle.get_text().strip() if subtitle else '',
        'body_html': str(body),
        'pub_date': pub_date,
        'published_at': published_at,
    }


def html_to_markdown(html):
    return md_convert(html, heading_style='ATX', strip=['script', 'style']).strip()


def estimate_reading_minutes(md_text):
    chars = len(md_text)
    return max(1, round(chars / 500))


def find_origin_file(ep_num):
    """ep<N>-<YYYY-MM-DD>.md 강대종 원본이 있으면 파일명 리턴, 없으면 None."""
    for p in NEWS_DIR.glob(f'ep{ep_num}-2*.md'):
        if 'substack' in p.name or 'outline' in p.name or '.bak-' in p.name:
            continue
        return p.name
    return None


def update_index(ep_num, art, reading_min, substack_url):
    if INDEX_PATH.exists():
        idx = json.loads(INDEX_PATH.read_text())
    else:
        idx = {'title': '바이브코딩 뉴스레터', 'description': '', 'episodes': []}

    cache_file = f'ep{ep_num}-cache.md'
    entry = {
        'number': ep_num,
        'cacheFile': cache_file,
        'date': art['pub_date'],
        'publishedAt': art['published_at'],
        'title': art['title'],
        'subtitle': art['subtitle'],
        'readingTime': f'{reading_min}분',
        'substackUrl': substack_url,
    }
    origin = find_origin_file(ep_num)
    if origin:
        entry['originFile'] = origin

    eps = [e for e in idx.get('episodes', []) if e.get('number') != ep_num]
    eps.append(entry)
    eps.sort(key=lambda e: -e.get('number', 0))
    idx['episodes'] = eps

    INDEX_PATH.write_text(json.dumps(idx, ensure_ascii=False, indent=2) + '\n')
    return entry


def main():
    p = argparse.ArgumentParser(description='Sync a published Substack article to the local newsletter cache.')
    p.add_argument('--url', required=True, help='Public Substack article URL (e.g. https://daejongkang.substack.com/p/abc)')
    p.add_argument('--ep', type=int, required=True, help='Episode number')
    p.add_argument('--reading-time', type=int, default=0, help='Reading minutes; 0 = auto-estimate from body length')
    args = p.parse_args()

    print(f'fetching {args.url}', file=sys.stderr)
    html = fetch(args.url)
    art = parse_article(html)
    md_body = html_to_markdown(art['body_html'])
    reading_min = args.reading_time or estimate_reading_minutes(md_body)

    cache_path = NEWS_DIR / f'ep{args.ep}-cache.md'

    # Forcing function: never let cache write clobber a canonical original.
    # If a same-stem non-cache file exists (e.g. ep5-2026-04-30.md), refuse.
    canonical = find_origin_file(args.ep)
    if canonical and (NEWS_DIR / canonical) == cache_path:
        sys.exit(f'refuse: cache_path {cache_path.name} collides with canonical {canonical}')

    header = (
        f'<!--\n'
        f'Source: {args.url}\n'
        f'Synced: {datetime.now().isoformat(timespec="seconds")}\n'
        f'-->\n\n'
        f'# {art["title"]}\n\n'
    )
    if art['subtitle']:
        header += f'_{art["subtitle"]}_\n\n'
    header += f'_{art["pub_date"]}_\n\n'

    cache_path.write_text(header + md_body + '\n')
    print(f'wrote {cache_path.name}', file=sys.stderr)

    entry = update_index(args.ep, art, reading_min, args.url)
    print(f'index.json updated: ep{entry["number"]} "{entry["title"]}" ({entry["readingTime"]})', file=sys.stderr)
    print(json.dumps(entry, ensure_ascii=False))


if __name__ == '__main__':
    main()
