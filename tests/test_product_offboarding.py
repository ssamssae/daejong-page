"""Regression checks for the built public catalog and share metadata.
Run after npm run build: python3 -m unittest discover -s tests -p test_product_offboarding.py
"""
import json
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
        self.assertEqual(len(cards), 13)
        retired = json.loads((ROOT / 'src/data/retired-products.json').read_text())
        for item in retired:
            self.assertIn(item['name'], page.source)
            self.assertFalse(any(item['name'] in card['data-search'] for card in cards))
        urls = [a.get('href', '') for tag, a in page.tags if tag == 'a']
        for obsolete in ['com.ssamssae.hankeup', 'id6765536777', 'id6766556759',
                         'id6766077265', 'cheotireum.kangdaejong.com',
                         'hanjang.kangdaejong.com', 'taekil.kangdaejong.com', 'kmong.com']:
            self.assertFalse(any(obsolete in url for url in urls), obsolete)

    def test_share_image_is_unique_and_versioned(self):
        for route in ['products', 'timeline.html', 'ai-glossary.html', 'habits.html', 'jarvis']:
            with self.subTest(route=route):
                page = Page(ROOT / 'dist' / route / 'index.html')
                for key in ['og:image', 'twitter:image']:
                    images = [a['content'] for tag, a in page.tags if tag == 'meta'
                              and (a.get('property') == key or a.get('name') == key)]
                    self.assertEqual(images, ['https://kangdaejong.com/brand/current/social.png?v=59a349c1f82627cd'])

if __name__ == '__main__':
    unittest.main()
