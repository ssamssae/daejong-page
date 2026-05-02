#!/usr/bin/env python3
"""Generate a Pretendard-styled fallback PNG for a missing newsletter image.

Used when a `🖼 IMAGE N (Caption) — description` placeholder has no real
asset under `newsletter/assets/ep<N>/`. The placeholder card is uploaded
in place so the published post never shows raw "🖼 IMAGE N" text again
(Ep.3 lost 4 images that way before manual patch on 2026-04-30).

Usage:
    generate_fallback_image.py \\
        --caption "🖼 IMAGE 1 (Hero) — terminal + phone, 1200x630" \\
        --output assets/ep1/01-hero.png
    generate_fallback_image.py --caption "..." --output ... \\
        --width 1600 --height 900

Defaults: 1200x630 (Substack hero ratio). Pretendard SemiBold/Bold from
the mini_expense app fonts. Falls back to PIL default font if Pretendard
not found.
"""
from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

PRETENDARD_DIRS = [
    Path.home() / "apps" / "mini_expense" / "assets" / "fonts",
    Path.home() / "apps" / "pomodoro" / "assets" / "fonts",
]

CAPTION_RE = re.compile(
    r"^>?\s*🖼\s*IMAGE\s+(?P<index>\d+)\s*"
    r"(?:\((?P<label>[^)]+)\))?\s*"
    r"(?:[—\-]+\s*(?P<body>.+))?$"
)


def find_pretendard(weight: str) -> str | None:
    for d in PRETENDARD_DIRS:
        path = d / f"Pretendard-{weight}.otf"
        if path.is_file():
            return str(path)
    return None


def load_font(weight: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    path = find_pretendard(weight)
    if path:
        return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def parse_caption(caption: str) -> tuple[str, str, str]:
    """Return (header, label, body) from a `🖼 IMAGE N (Label) — body` line.

    Falls back to ('IMAGE', '', caption.strip()) if the line doesn't match
    the convention — caller still gets a renderable card.
    """
    m = CAPTION_RE.match(caption.strip())
    if not m:
        return ("IMAGE", "", caption.strip())
    header = f"IMAGE {m.group('index')}"
    label = (m.group("label") or "").strip()
    body = (m.group("body") or "").strip()
    return (header, label, body)


def wrap_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    max_width: int,
) -> list[str]:
    """Greedy word-wrap. Splits on spaces; for CJK runs of >max_width chars,
    falls back to per-character chunking on the offending word."""
    out: list[str] = []
    for paragraph in text.split("\n"):
        words = paragraph.split(" ")
        line = ""
        for w in words:
            cand = w if not line else f"{line} {w}"
            if draw.textlength(cand, font=font) <= max_width:
                line = cand
                continue
            if line:
                out.append(line)
            if draw.textlength(w, font=font) <= max_width:
                line = w
                continue
            chunk = ""
            for ch in w:
                ext = chunk + ch
                if draw.textlength(ext, font=font) <= max_width:
                    chunk = ext
                else:
                    if chunk:
                        out.append(chunk)
                    chunk = ch
            line = chunk
        if line:
            out.append(line)
    return out


def render(
    caption: str,
    output: Path,
    width: int = 1200,
    height: int = 630,
) -> Path:
    bg = (242, 244, 246)        # AppColors.surfaceAlt
    fg_strong = (25, 31, 40)    # AppColors.textPrimary
    fg_soft = (78, 89, 104)     # AppColors.textSecondary
    accent = (49, 130, 246)     # AppColors.brand

    img = Image.new("RGB", (width, height), bg)
    draw = ImageDraw.Draw(img)

    pad = max(48, width // 20)
    inner_w = width - pad * 2

    header, label, body = parse_caption(caption)

    f_header = load_font("Bold", max(40, width // 24))
    f_label = load_font("SemiBold", max(28, width // 36))
    f_body = load_font("Regular", max(22, width // 48))

    bar_h = max(8, height // 80)
    draw.rectangle((pad, pad, pad + inner_w // 4, pad + bar_h), fill=accent)

    y = pad + bar_h + max(24, height // 24)
    draw.text((pad, y), header, font=f_header, fill=fg_strong)
    bbox = draw.textbbox((pad, y), header, font=f_header)
    y = bbox[3] + max(16, height // 40)

    if label:
        draw.text((pad, y), label, font=f_label, fill=accent)
        bbox = draw.textbbox((pad, y), label, font=f_label)
        y = bbox[3] + max(16, height // 30)

    if body:
        lines = wrap_text(draw, body, f_body, inner_w)
        for line in lines:
            draw.text((pad, y), line, font=f_body, fill=fg_soft)
            bbox = draw.textbbox((pad, y), line, font=f_body)
            y = bbox[3] + 6
            if y > height - pad - 40:
                break

    foot = "fallback placeholder · newsletter-publish"
    f_foot = load_font("Regular", max(16, width // 70))
    fb = draw.textbbox((0, 0), foot, font=f_foot)
    draw.text(
        (width - pad - (fb[2] - fb[0]), height - pad - (fb[3] - fb[1])),
        foot,
        font=f_foot,
        fill=(139, 149, 161),  # textTertiary
    )

    output.parent.mkdir(parents=True, exist_ok=True)
    img.save(output, format="PNG")
    return output


def main(argv: list[str]) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--caption", required=True,
                   help="placeholder line, e.g. `🖼 IMAGE 1 (Hero) — desc`")
    p.add_argument("--output", required=True, help="output PNG path")
    p.add_argument("--width", type=int, default=1200)
    p.add_argument("--height", type=int, default=630)
    args = p.parse_args(argv[1:])

    out = Path(args.output)
    render(args.caption, out, width=args.width, height=args.height)
    size = os.path.getsize(out)
    print(f"wrote {out} ({size} bytes, {args.width}x{args.height})")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
