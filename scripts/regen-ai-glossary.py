#!/usr/bin/env python3
"""
ai-glossary.html 자동 누적 generator.

모드:
  forward (default): insights/*.md 의 `## 용어` 섹션 grep → dedup → 카테고리별 그룹 →
                     ai-glossary.html 의 `<!-- BEGIN_GLOSSARY_DATA --> ... <!-- END_GLOSSARY_DATA -->`
                     block replace.
  backward (--backward): ai-glossary.html 의 기존 데이터를 parse → insights/*.md 별 group →
                         각 insight 에 `## 용어` 섹션이 없으면 append (one-shot backfill).

insight `## 용어` format:
  - **용어** [카테고리]: 한 줄 설명

카테고리 8 + 기타:
  모델 · 구독 / 하니스 · 패턴 / 컨텍스트 · 캐시 / 도구 통신 (MCP · CLI · API) /
  지식 · 컨텍스트 자산 / 워크플로우 · 문화 / 커리어 · 조직 / 빌링 · 운영 / 기타
"""

import re
import sys
from pathlib import Path
from collections import OrderedDict

ROOT = Path(__file__).resolve().parent.parent
# P4 Astro 전환: insight 신규 발행은 src/content/insights/ 로만 들어옴 (옛 insights/ 는 frozen).
# 매처(hooks/post-commit)와 짝 — 신경로를 SoT 로 읽어야 새 인사이트의 ## 용어 가 용어집에 반영됨.
INSIGHTS_DIR = ROOT / "src" / "content" / "insights"
# P4 Astro 전환(commit 288766b): ai-glossary.html 은 root → public/ 로 이전(여전히 /ai-glossary.html 로 서빙).
# T-260616-02 B안: lab 페이지 단일소스 Astro 전환으로 public/ai-glossary.html → src/pages/ai-glossary.html.astro
#   로 이전(directory 빌드로 /ai-glossary.html URL 유지). 마커(BEGIN/END_GLOSSARY_DATA, AUTO-HERO-*)는
#   .astro 안에서도 HTML 주석이라 문자열 치환 동일 작동. root index.html 드롭은 그대로(sync_index_stats self-skip).
GLOSSARY_HTML = ROOT / "src" / "pages" / "ai-glossary.html.astro"
INDEX_HTML = ROOT / "index.html"

CATEGORIES_ORDER = [
    "모델 · 구독",
    "하니스 · 패턴",
    "컨텍스트 · 캐시",
    "도구 통신 (MCP · CLI · API)",
    "지식 · 컨텍스트 자산",
    "워크플로우 · 문화",
    "커리어 · 조직",
    "빌링 · 운영",
    "기타",
]

BEGIN_MARK = "<!-- BEGIN_GLOSSARY_DATA -->"
END_MARK = "<!-- END_GLOSSARY_DATA -->"
HERO_TERMS_MARK_RE = re.compile(r"<!--AUTO-HERO-TERMS-START-->\d+<!--AUTO-HERO-TERMS-END-->")
HERO_CATEGORIES_MARK_RE = re.compile(r"<!--AUTO-HERO-CATEGORIES-START-->\d+<!--AUTO-HERO-CATEGORIES-END-->")

# `- **용어** [카테고리]: 설명`
TERM_LINE_RE = re.compile(r"^\s*-\s*\*\*(?P<name>[^*]+)\*\*\s*\[(?P<cat>[^\]]+)\]\s*:\s*(?P<desc>.+)\s*$")


def parse_insight_md(md_path):
    """insight markdown 에서 `## 용어` 섹션 parse. (name, cat, desc) tuples 반환."""
    text = md_path.read_text(encoding="utf-8")
    lines = text.splitlines()
    in_terms = False
    out = []
    for ln in lines:
        if ln.strip().startswith("## 용어"):
            in_terms = True
            continue
        if in_terms:
            if ln.startswith("## "):  # next section
                break
            m = TERM_LINE_RE.match(ln)
            if m:
                out.append((m.group("name").strip(), m.group("cat").strip(), m.group("desc").strip()))
    return out


def html_escape(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def html_to_plain(s):
    """HTML inner → plain markdown-friendly text (backward parse 용)."""
    # <code>X</code> → `X`
    s = re.sub(r"<code>([^<]*)</code>", r"`\1`", s)
    # 다른 inline tag strip
    s = re.sub(r"<[^>]+>", "", s)
    # entity unescape
    return s.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&")


def plain_to_html(s):
    """markdown-ish plain → HTML inline (forward render 용)."""
    # 먼저 entity escape
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    # `X` → <code>X</code> (백틱 안의 < > 는 이미 escape 됨)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    return s


def render_data_block(grouped):
    """grouped: OrderedDict[cat -> list of (name, desc, [src filenames])]"""
    out = []
    for cat in CATEGORIES_ORDER:
        if cat not in grouped or not grouped[cat]:
            continue
        out.append(f"    <h2>{html_escape(cat)}</h2>")
        out.append("")
        for name, desc, srcs in grouped[cat]:
            src_str = ", ".join(srcs)
            out.append('    <div class="term">')
            out.append(f"      <h3>{html_escape(name)}</h3>")
            out.append(f"      <p>{plain_to_html(desc)}</p>")
            out.append(f'      <span class="src">영상: {html_escape(src_str)}</span>')
            out.append("    </div>")
            out.append("")
    return "\n".join(out)


def forward():
    """insights/*.md → ai-glossary.html marker block replace."""
    # name → (cat, desc 첫 등장, [src list dedup])
    terms = OrderedDict()
    for md in sorted(INSIGHTS_DIR.glob("*.md")):
        entries = parse_insight_md(md)
        for name, cat, desc in entries:
            if name not in terms:
                terms[name] = {"cat": cat, "desc": desc, "srcs": []}
            if md.name not in terms[name]["srcs"]:
                terms[name]["srcs"].append(md.name)

    # 카테고리별 group
    grouped = OrderedDict((c, []) for c in CATEGORIES_ORDER)
    for name, t in terms.items():
        cat = t["cat"] if t["cat"] in grouped else "기타"
        grouped[cat].append((name, t["desc"], t["srcs"]))

    data_block = render_data_block(grouped)
    category_count = sum(1 for v in grouped.values() if v)

    html = GLOSSARY_HTML.read_text(encoding="utf-8")
    pattern = re.compile(
        re.escape(BEGIN_MARK) + r".*?" + re.escape(END_MARK),
        re.DOTALL,
    )
    new_block = BEGIN_MARK + "\n" + data_block + "\n    " + END_MARK
    new_html = pattern.sub(lambda _: new_block, html)
    new_html = sync_glossary_hero_stats(new_html, term_count=len(terms), category_count=category_count)
    if new_html != html:
        GLOSSARY_HTML.write_text(new_html, encoding="utf-8")
        print(f"forward: {GLOSSARY_HTML.name} updated ({len(terms)} terms, {category_count} categories)")
    else:
        print("forward: ai-glossary.html no changes")

    sync_index_stats(insight_count=len(list(INSIGHTS_DIR.glob("*.md"))), term_count=len(terms))
    return 0


def sync_glossary_hero_stats(html, term_count, category_count):
    """Keep ai-glossary hero-stat cards in sync with generated glossary data."""
    new_html = HERO_TERMS_MARK_RE.sub(
        f"<!--AUTO-HERO-TERMS-START-->{term_count}<!--AUTO-HERO-TERMS-END-->",
        html,
    )
    new_html = HERO_CATEGORIES_MARK_RE.sub(
        f"<!--AUTO-HERO-CATEGORIES-START-->{category_count}<!--AUTO-HERO-CATEGORIES-END-->",
        new_html,
    )
    return new_html


def sync_index_stats(insight_count, term_count):
    if not INDEX_HTML.exists():
        return
    html = INDEX_HTML.read_text(encoding="utf-8")
    new_html = re.sub(
        r"<!--AUTO-INSIGHTS-START-->\d+<!--AUTO-INSIGHTS-END-->",
        f"<!--AUTO-INSIGHTS-START-->{insight_count}<!--AUTO-INSIGHTS-END-->",
        html,
    )
    new_html = re.sub(
        r"<!--AUTO-TERMS-START-->\d+<!--AUTO-TERMS-END-->",
        f"<!--AUTO-TERMS-START-->{term_count}<!--AUTO-TERMS-END-->",
        new_html,
    )
    if new_html != html:
        INDEX_HTML.write_text(new_html, encoding="utf-8")
        print(f"forward: {INDEX_HTML.name} stats updated ({insight_count} insights, {term_count} terms)")


def parse_glossary_html():
    """ai-glossary.html 의 기존 데이터 parse → {insight_filename: [(name, cat, desc)]}."""
    html = GLOSSARY_HTML.read_text(encoding="utf-8")
    m = re.search(re.escape(BEGIN_MARK) + r"(.*?)" + re.escape(END_MARK), html, re.DOTALL)
    if not m:
        print("ERROR: marker not found in ai-glossary.html", file=sys.stderr)
        sys.exit(2)
    body = m.group(1)

    # 카테고리 split
    cat_chunks = re.split(r"<h2>([^<]+)</h2>", body)
    # cat_chunks: ['', cat1, body1, cat2, body2, ...]
    per_insight = {}
    for i in range(1, len(cat_chunks), 2):
        cat = cat_chunks[i].strip()
        chunk = cat_chunks[i + 1]
        # term div parse
        for tm in re.finditer(
            r'<div class="term">\s*<h3>([^<]+)</h3>\s*<p>(.+?)</p>\s*<span class="src">영상:\s*([^<]+)</span>\s*</div>',
            chunk,
            re.DOTALL,
        ):
            name = tm.group(1).strip()
            desc = html_to_plain(tm.group(2)).strip()
            srcs = [s.strip() for s in tm.group(3).split(",")]
            for src in srcs:
                per_insight.setdefault(src, []).append((name, cat, desc))
    return per_insight


def backward():
    """ai-glossary.html → 각 insight md 에 `## 용어` 섹션 append (없으면)."""
    per_insight = parse_glossary_html()
    appended = 0
    for fname, terms in per_insight.items():
        md_path = INSIGHTS_DIR / fname
        if not md_path.exists():
            print(f"  skip: {fname} not found in insights/", file=sys.stderr)
            continue
        text = md_path.read_text(encoding="utf-8")
        if re.search(r"^##\s+용어\s*$", text, re.MULTILINE):
            print(f"  skip: {fname} already has ## 용어")
            continue
        section = "\n## 용어\n"
        for name, cat, desc in terms:
            section += f"- **{name}** [{cat}]: {desc}\n"
        new_text = text.rstrip() + "\n" + section
        md_path.write_text(new_text, encoding="utf-8")
        appended += 1
        print(f"  appended: {fname} ({len(terms)} terms)")
    print(f"backward: {appended} files updated")
    return 0


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--backward":
        return backward()
    return forward()


if __name__ == "__main__":
    sys.exit(main())
