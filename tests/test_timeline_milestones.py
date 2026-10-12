"""T-261012-042 regression: the timeline's 주요 마일스톤 read worklog frontmatter `milestone`.
Run after npm run build: python3 -m unittest discover -s tests -p test_timeline_milestones.py
"""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
LOGS = ROOT / 'src/content/worklog'
LAST_HAND_WRITTEN = '2026-09-12'  # 손으로 적은 마지막 마일스톤(#32). 그 뒤는 작업일지가 정본이다.


def frontmatter(path):
    head = path.read_text(encoding='utf-8').split('\n---\n', 1)[0]
    data = {}
    for line in head.splitlines()[1:]:
        key, sep, value = line.partition(': ')
        if sep:
            data[key] = json.loads(value) if value.startswith('"') else value
    return data


def expected_milestones():
    by_date = {}
    for path in sorted(LOGS.glob('*.md')):
        data = frontmatter(path)
        title = data.get('milestone', '').strip()
        if title:
            by_date[data['date']] = title  # 같은 날 여러 판이면 마지막 판
    return sorted(by_date.items())


def built_milestones():
    html = (ROOT / 'dist/timeline.html/index.html').read_text(encoding='utf-8')
    marker = 'const milestoneLogs = '
    start = html.index(marker) + len(marker)
    items, _ = json.JSONDecoder().raw_decode(html, start)
    return [(item['date'], item['title']) for item in items]


class TimelineMilestones(unittest.TestCase):
    def test_worklog_milestones_reach_the_built_timeline(self):
        expected = expected_milestones()
        self.assertTrue(expected, 'no worklog carries a milestone')
        self.assertEqual(built_milestones(), expected)

    def test_gap_after_last_hand_written_milestone_is_filled(self):
        dates = [date for date, _ in expected_milestones()]
        self.assertGreater(max(dates), LAST_HAND_WRITTEN)
        self.assertTrue(all(date > LAST_HAND_WRITTEN for date in dates),
                        'worklog milestones must come after the hand-written list')


if __name__ == '__main__':
    unittest.main()
