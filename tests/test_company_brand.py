"""Prevent workshop pages from using copied company branding."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://kangdaejong.com/brand/current/'

class CompanyBrand(unittest.TestCase):
    def test_built_pages_use_central_company_assets(self):
        pages = [p for p in (ROOT/'dist').rglob('*.html') if p.is_file()]
        self.assertGreater(len(pages),100)
        old = re.compile(r'''(?:src|href)=["']/((?:homepage_icon|minusbeta-badge)\.svg|favicon\.ico|apple-touch-icon\.png)''')
        for path in pages:
            html = path.read_text()
            self.assertIsNone(old.search(html),str(path))
            self.assertNotIn('https://work.kangdaejong.com/og-default.png',html,str(path))
        home = (ROOT/'dist/index.html').read_text()
        for name in ('logo.svg','favicon.ico','apple-touch-icon.png','social.png'):
            self.assertIn(BASE+name,home)
        self.assertIn('https://kangdaejong.com/mb-components.js',home)

if __name__ == '__main__':
    unittest.main()
