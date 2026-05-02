#!/usr/bin/env python3
"""Tests for generate_fallback_image.py — stdlib unittest, no pytest.

Run: `python3 -m unittest test_generate_fallback_image.py`
"""
import os
import struct
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SELF_DIR = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(SELF_DIR, "generate_fallback_image.py")

sys.path.insert(0, SELF_DIR)
from generate_fallback_image import parse_caption, render  # noqa: E402

PNG_MAGIC = b"\x89PNG\r\n\x1a\n"


def png_dimensions(path: Path) -> tuple[int, int]:
    """Read width/height from a PNG IHDR chunk without decoding the image."""
    with open(path, "rb") as f:
        magic = f.read(8)
        assert magic == PNG_MAGIC, "not a PNG"
        f.read(4)  # IHDR length
        f.read(4)  # 'IHDR'
        w, h = struct.unpack(">II", f.read(8))
        return w, h


class ParseCaption(unittest.TestCase):
    def test_full_form(self):
        h, l, b = parse_caption("🖼 IMAGE 1 (Hero) — terminal screenshot")
        self.assertEqual(h, "IMAGE 1")
        self.assertEqual(l, "Hero")
        self.assertEqual(b, "terminal screenshot")

    def test_with_blockquote_marker(self):
        h, l, b = parse_caption("> 🖼 IMAGE 12 (Architecture Diagram) — 6 blocks")
        self.assertEqual(h, "IMAGE 12")
        self.assertEqual(l, "Architecture Diagram")
        self.assertEqual(b, "6 blocks")

    def test_no_label_no_body(self):
        h, l, b = parse_caption("🖼 IMAGE 3")
        self.assertEqual(h, "IMAGE 3")
        self.assertEqual(l, "")
        self.assertEqual(b, "")

    def test_unparseable_falls_back(self):
        h, l, b = parse_caption("just some random text")
        self.assertEqual(h, "IMAGE")
        self.assertEqual(l, "")
        self.assertEqual(b, "just some random text")


class RenderSmoke(unittest.TestCase):
    def test_default_size_1200x630(self):
        with tempfile.TemporaryDirectory() as td:
            out = Path(td) / "card.png"
            render("🖼 IMAGE 1 (Hero) — caption", out)
            self.assertTrue(out.is_file())
            self.assertGreater(out.stat().st_size, 1000, "file too small")
            w, h = png_dimensions(out)
            self.assertEqual((w, h), (1200, 630))

    def test_custom_size(self):
        with tempfile.TemporaryDirectory() as td:
            out = Path(td) / "card.png"
            render("🖼 IMAGE 2 (Wide) — body", out, width=1600, height=900)
            self.assertEqual(png_dimensions(out), (1600, 900))

    def test_long_caption_wraps_without_crash(self):
        with tempfile.TemporaryDirectory() as td:
            out = Path(td) / "card.png"
            long_body = ("매우긴한국어캡션내용을채워넣어서줄바꿈로직이"
                         "정상동작하는지확인합니다 " * 20)
            render(f"🖼 IMAGE 3 (Long) — {long_body}", out)
            self.assertTrue(out.is_file())
            self.assertGreater(out.stat().st_size, 1000)

    def test_unparseable_caption_still_renders(self):
        with tempfile.TemporaryDirectory() as td:
            out = Path(td) / "card.png"
            render("not a placeholder line at all", out)
            self.assertEqual(png_dimensions(out), (1200, 630))


class CliSmoke(unittest.TestCase):
    def test_cli_writes_png_and_reports_size(self):
        with tempfile.TemporaryDirectory() as td:
            out = Path(td) / "out" / "01-hero.png"
            res = subprocess.run(
                [sys.executable, SCRIPT,
                 "--caption", "🖼 IMAGE 1 (Hero) — body",
                 "--output", str(out)],
                capture_output=True, text=True, check=True,
            )
            self.assertTrue(out.is_file())
            self.assertIn("wrote ", res.stdout)
            self.assertIn("1200x630", res.stdout)


if __name__ == "__main__":
    unittest.main()
