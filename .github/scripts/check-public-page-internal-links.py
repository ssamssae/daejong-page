#!/usr/bin/env python3
"""Check internal href targets in a static public-page build output."""

from __future__ import annotations

import argparse
import html.parser
import pathlib
import sys
import urllib.parse


class LinkParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.hrefs: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "a":
            return
        for name, value in attrs:
            if name.lower() == "href" and value:
                self.hrefs.append(value.strip())


def iter_html_files(root: pathlib.Path) -> list[pathlib.Path]:
    return sorted(path for path in root.rglob("*.html") if path.is_file())


def internal_path(href: str) -> str | None:
    if not href or href.startswith("#"):
        return None
    parsed = urllib.parse.urlsplit(href)
    if parsed.scheme:
        return None
    if parsed.netloc:
        return None
    path = urllib.parse.unquote(parsed.path)
    if not path:
        return None
    return path


def target_candidates(root: pathlib.Path, html_file: pathlib.Path, href_path: str) -> list[pathlib.Path]:
    if href_path.startswith("/"):
        target = root / href_path.lstrip("/")
    else:
        target = html_file.parent / href_path

    candidates = [target]
    if href_path.endswith("/"):
        candidates = [target / "index.html"]
    elif target.suffix == "":
        candidates.extend([target.with_suffix(".html"), target / "index.html"])
    return candidates


def exists_within_root(root: pathlib.Path, candidate: pathlib.Path) -> bool:
    resolved_root = root.resolve()
    resolved = candidate.resolve(strict=False)
    try:
        resolved.relative_to(resolved_root)
    except ValueError:
        return False
    if resolved.is_file():
        return True
    if resolved.is_dir() and (resolved / "index.html").is_file():
        return True
    return False


def check(root: pathlib.Path) -> tuple[int, list[tuple[pathlib.Path, str]]]:
    broken: list[tuple[pathlib.Path, str]] = []
    checked = 0
    for html_file in iter_html_files(root):
        parser = LinkParser()
        parser.feed(html_file.read_text(encoding="utf-8", errors="replace"))
        for href in parser.hrefs:
            path = internal_path(href)
            if path is None:
                continue
            checked += 1
            candidates = target_candidates(root, html_file, path)
            if not any(exists_within_root(root, candidate) for candidate in candidates):
                broken.append((html_file.relative_to(root), href))
    return checked, broken


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dist", type=pathlib.Path, help="Static build output directory, usually dist/")
    args = parser.parse_args(argv)

    root = args.dist
    if not root.is_dir():
        print(f"missing_dist={root}", file=sys.stderr)
        return 2

    checked, broken = check(root)
    print(f"internal_links_checked={checked} broken_internal_links={len(broken)}")
    for html_file, href in broken[:50]:
        print(f"broken: {html_file}: {href}")
    if len(broken) > 50:
        print(f"broken_truncated={len(broken) - 50}")
    return 1 if broken else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
