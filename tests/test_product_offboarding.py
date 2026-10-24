"""Regression checks for the built public catalog and share metadata.
Run after npm run build: python3 -m unittest discover -s tests -p test_product_offboarding.py
"""
import json
import re
from html.parser import HTMLParser
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.tags = []
        self.source = path.read_text()
        self.feed(self.source)
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

class ProductOffboarding(unittest.TestCase):
    def test_only_current_products_have_purchase_links(self):
        page = Page(ROOT / 'dist/products/index.html')
        cards = [a for _, a in page.tags if 'data-catalog-item' in a]
        self.assertEqual(len(cards), 14)
        retired = json.loads((ROOT / 'src/data/retired-products.json').read_text())
        self.assertEqual(len(retired), 11)
        self.assertNotIn('첫이름 — AI 사주 작명', [item['name'] for item in retired])
        cheotireum = [card for card in cards if card.get('data-product-id') == 'cheotireum']
        self.assertEqual(len(cheotireum), 1)
        self.assertEqual(cheotireum[0]['data-kind'], 'saas')
        self.assertIn('첫이름', cheotireum[0]['data-search'])
        active_html = re.search(r'<article\b[^>]*data-product-id="cheotireum"[\s\S]*?</article>', page.source).group()
        for url in ['https://cheotireum.kangdaejong.com/',
                    'https://cheotireum.kangdaejong.com/sample-report',
                    'https://cheotireum.kangdaejong.com/hanja-check']:
            self.assertIn(f'href="{url}"', active_html)
        for item in retired:
            self.assertIn(item['name'], page.source)
            self.assertFalse(any(item['name'] in card['data-search'] for card in cards))
        urls = [a.get('href', '') for tag, a in page.tags if tag == 'a']
        for obsolete in ['com.ssamssae.hankeup', 'id6765536777', 'id6766556759',
                         'id6766077265',
                         'hanjang.kangdaejong.com', 'taekil.kangdaejong.com', 'kmong.com']:
            self.assertFalse(any(obsolete in url for url in urls), obsolete)

    def test_work_summary_counts_the_restored_web_service(self):
        page = Page(ROOT / 'dist/work/index.html')
        self.assertRegex(page.source, r'웹 서비스\s*<b\b[^>]*>1</b>')
        products = Page(ROOT / 'dist/work/products/index.html')
        self.assertTrue(any(a.get('data-product-id') == 'cheotireum' and a.get('data-kind') == 'saas'
                            for _, a in products.tags))

    def test_share_image_is_unique_and_versioned(self):
        for route in ['products', 'timeline.html', 'ai-glossary.html', 'habits.html', 'jarvis']:
            with self.subTest(route=route):
                page = Page(ROOT / 'dist' / route / 'index.html')
                for key in ['og:image', 'twitter:image']:
                    images = [a['content'] for tag, a in page.tags if tag == 'meta'
                              and (a.get('property') == key or a.get('name') == key)]
                    self.assertEqual(images, ['https://kangdaejong.com/brand/current/social.png'])

if __name__ == '__main__':
    unittest.main()
