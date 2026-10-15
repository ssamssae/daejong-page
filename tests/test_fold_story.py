"""T-261015-017: 접은 일·다시 편 일(fold-story.json)과 AI 활용 사례(ai-uses.json) 계약.
공개 페이지에 생활 이야기(보험·돈·법·계정)를 싣기 때문에 아이디·비밀번호·연락처·번호가 섞이면 빨간불을 낸다.
Run after npm run build: python3 -m unittest discover -s tests -p test_fold_story.py
"""
import datetime
import json
import re
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
FOLD = json.loads((ROOT / 'src/data/fold-story.json').read_text(encoding='utf-8'))
USES = json.loads((ROOT / 'src/data/ai-uses.json').read_text(encoding='utf-8'))
FIRST_DAY = datetime.date(2026, 4, 1)
KINDS = {'시작', '진행', '접음', '전환', '보류', '다시 폄', '마침'}
LISTED = {'접음', '전환', '보류', '다시 폄', '마침'}  # 연표 줄로 올라가는 갈림길
STATUSES = {'접음', '전환', '보류', '다시 폄', '진행 중', '마침'}
SLUG = re.compile(r'^[a-z0-9]+(-[a-z0-9]+)*$')

# 공개 금지 모양: 이메일, 전화번호, 7자리 넘는 숫자열(계좌·증권·카드), IP, 값이 붙은 비밀 항목, 외부 주소
PRIVATE = [
    ('email', re.compile(r'[\w.+-]+@[\w-]+\.[\w.-]+')),
    ('phone', re.compile(r'(?<!\d)0\d{1,2}[ .-]?\d{3,4}[ .-]?\d{4}(?!\d)')),
    ('long-number', re.compile(r'\d[\d -]{6,}\d')),
    ('ip', re.compile(r'(?<!\d)\d{1,3}(\.\d{1,3}){3}(?!\d)')),
    ('secret-value', re.compile(r'(비밀번호|패스워드|암호|password|passcode|PIN|OTP|인증번호|토큰|token|API ?키)\s*[:=]\s*\S', re.I)),
    ('url', re.compile(r'https?://', re.I)),
]
DATE = re.compile(r'(?<!\d)\d{4}[-.]\d{1,2}[-.]\d{1,2}(?!\d)')  # 날짜는 번호가 아니다


def strings(node, path='$'):
    if isinstance(node, str):
        yield path, node
    elif isinstance(node, dict):
        for key, value in node.items():
            yield from strings(value, f'{path}.{key}')
    elif isinstance(node, list):
        for i, value in enumerate(node):
            yield from strings(value, f'{path}[{i}]')


def day(value):
    return datetime.date.fromisoformat(value)


class FoldStoryData(unittest.TestCase):
    def test_arcs_are_complete_and_dated(self):
        today = datetime.date.today()
        ids = [arc['id'] for arc in FOLD['arcs']]
        self.assertTrue(ids, 'fold-story.json has no arcs')
        self.assertEqual(len(ids), len(set(ids)), 'duplicate arc id')
        for arc in FOLD['arcs']:
            with self.subTest(arc=arc['id']):
                self.assertRegex(arc['id'], SLUG)
                self.assertIn(arc['status'], STATUSES)
                for key in ('title', 'area', 'summary', 'ai', 'now'):
                    self.assertTrue(arc.get(key, '').strip(), key)
                self.assertTrue(arc['steps'])
                kinds = [step['kind'] for step in arc['steps']]
                self.assertTrue(set(kinds) & {'접음', '전환', '보류'}, 'an arc needs a fold, switch or hold step')
                for step in arc['steps']:
                    self.assertIn(step['kind'], KINDS)
                    self.assertTrue(FIRST_DAY <= day(step['date']) <= today, step['date'])
                    self.assertTrue(step['text'].strip())
                if 'link' in arc:
                    self.assertTrue(arc['link']['href'].startswith('/'), 'links stay inside the site')

    def test_ai_uses_are_complete(self):
        area_ids = [area['id'] for area in USES['areas']]
        self.assertEqual(len(area_ids), len(set(area_ids)))
        ids = [use['id'] for use in USES['uses']]
        self.assertTrue(ids)
        self.assertEqual(len(ids), len(set(ids)), 'duplicate use id')
        for use in USES['uses']:
            with self.subTest(use=use['id']):
                self.assertRegex(use['id'], SLUG)
                self.assertIn(use['area'], area_ids)
                self.assertTrue(FIRST_DAY <= day(use['date']) <= datetime.date.today())
                for key in ('title', 'situation', 'ai', 'result', 'different'):
                    self.assertTrue(use.get(key, '').strip(), key)
                if 'link' in use:
                    self.assertTrue(use['link']['href'].startswith('/'))

    def test_no_private_details_in_public_story(self):
        leaks = []
        for name, data in (('fold-story', FOLD), ('ai-uses', USES)):
            for path, text in strings(data):
                if path.endswith(('.date', '.updated', '.href')):
                    continue
                for kind, pattern in PRIVATE:
                    found = pattern.search(DATE.sub(' ', text))
                    if found:
                        leaks.append(f'{name}{path[1:]}: {kind} {found.group(0)!r}')
        self.assertEqual(leaks, [], 'public story must not carry ids, passwords, contacts or numbers')


class FoldStoryBuilt(unittest.TestCase):
    def test_every_arc_and_use_reaches_the_built_pages(self):
        timeline = (ROOT / 'dist/timeline.html/index.html').read_text(encoding='utf-8')
        page = (ROOT / 'dist/how-i-use-ai/index.html').read_text(encoding='utf-8')
        for arc in FOLD['arcs']:
            self.assertIn(f'id="fold-{arc["id"]}"', timeline)
        for use in USES['uses']:
            self.assertIn(f'id="use-{use["id"]}"', page)
        marker = 'const foldEvents = '
        start = timeline.index(marker) + len(marker)
        events, _ = json.JSONDecoder().raw_decode(timeline, start)
        expected = sum(1 for arc in FOLD['arcs'] for step in arc['steps']
                       if step['kind'] in LISTED and step.get('list', True))
        self.assertEqual(len(events), expected)
        self.assertTrue(all(e['href'].startswith('#fold-') for e in events))


if __name__ == '__main__':
    unittest.main()
