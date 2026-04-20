#!/usr/bin/env python3
"""Regenerate the /skills page card grid from ~/claude-skills/*/SKILL.md.

Reads YAML frontmatter (name, description, optional daejong_tag,
daejong_hidden, daejong_order) from each skill's SKILL.md and rewrites
the AUTO-GEN block inside daejong-page/skills.html.

Usage:
  python3 scripts/regen_skills.py        # regenerate
  python3 scripts/regen_skills.py --dry  # print without writing

Skills with `daejong_hidden: true` in frontmatter are omitted from the
public page (useful for internal/WIP skills).
"""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

SKILLS_DIR = Path.home() / "claude-skills"
SKILLS_HTML = Path.home() / "daejong-page" / "skills.html"

START_MARK = "<!-- AUTO-GEN:SKILLS-START -->"
END_MARK = "<!-- AUTO-GEN:SKILLS-END -->"

# Legacy tag map for skills whose SKILL.md frontmatter doesn't yet carry
# daejong_tag. New skills should add `daejong_tag:` to frontmatter instead
# of extending this map.
FALLBACK_TAGS = {
    "ctx": "세션 요약",
    "done": "체크리스트",
    "issue": "포스트모템",
    "irun": "Flutter",
    "land": "Mac 종단",
    "to-iphone": "WSL 전위",
    "morning-briefing": "아침 7:15",
    "todo-reminder": "밤 22:00",
    "review-status-check": "매시 09~23",
    "merge-janitor": "PR 관리",
    "morning-reporter": "수동 전용",
    "weather-dust": "수동 전용",
    "side-project-briefing": "수동 전용",
    "todo": "할일 관리",
    "sync": "수동 동기화",
    "usage": "토큰",
    "worklog": "작업일지",
    "toss-tone": "디자인",
    "submit-app": "스토어 제출",
    "arun": "Android",
    "night-runner": "야간 자동",
    "trend": "트렌드",
}

# Skills with complex descriptions get a shorter card description here.
# Falls through to frontmatter description if not listed. Values may
# contain inline HTML (e.g. <b>...</b>) and are NOT escaped at render
# time — trust the source since we control it.
CARD_DESC_OVERRIDE = {
    "ctx": "현재 세션에서 한 일 + 진행중/블로커/다음액션/할일을 한 화면에 요약. \"어디까지 했지?\" 때 호출.",
    "done": "오늘 한 일을 자동 수집해 체크박스 리스트로 저장. worklog 가 산문체 상세 기록이면 done 은 한 눈에 파악하는 담백한 리스트.",
    "issue": "이슈·사건·혼선을 <b>증상·원인·조치·예방</b> 네 칸으로 구조화해 ~/.claude/skills/issues/ 에 쌓고 claude-skills repo 로 기기 간 공유. 예방 섹션 비어있으면 저장 거부, 재발 감지 시 기존 파일에 자동 merge. daejong-page /issues 페이지로 공개 동기화.",
    "irun": "Flutter 앱을 연결된 iPhone 에 clean + release 로 재빌드·실행. 이전 flutter run 자동 종료.",
    "land": "WSL /to-iphone 이 GitHub 에 푸시한 앱을 맥이 받아 clone/pull → iOS 플랫폼 자동 세팅 → Bundle ID + signing team 자동 주입 → pub get + pod install → /irun 으로 아이폰 설치까지 연쇄. 세 번째 앱부터 한 줄 무인 배달.",
    "to-iphone": "Flutter 앱을 한 줄로 GitHub push → 텔레그램 트리거로 맥에 알림까지. 맥 /land 와 페어, 세 번째 앱부터 WSL → 아이폰 무인 배달 완성.",
    "morning-briefing": "매일 아침 통합 브리핑. 날씨·미세먼지 + 어제 커밋·오늘 할일·블로커 + 뉴스·주식 + 사이드 프로젝트 픽을 <b>단일 세션·단일 메시지</b>로 전달. 기존 3개 스킬 통합 버전.",
    "todo-reminder": "매일 저녁 리마인더. 오늘 뭐 했고 뭐 못 했나 + 내일 우선순위 TOP 3 제안. 텔레그램 전송.",
    "review-status-check": "Google Play + App Store Connect 심사 상태 이메일을 Gmail MCP 로 감시 → 변경 감지 시 텔레그램 알림. 로그인 세션 관리 불필요, Google/Apple 공식 메일 기반.",
    "merge-janitor": "WSL night-runner 가 janitor/YYYY-MM-DD 브랜치로 만든 PR 을 맥 본진에서 머지·닫기. morning-briefing 의 PR 목록에 \"PR #N 머지/닫아\" 자연어 답장으로 호출. 대형 변경·의존성·민감파일 자동 경고, main 직접 푸시·force push 금지 하드 가드.",
    "morning-reporter": "어제 커밋 요약 + 오늘 할일 + 블로커만 따로 보고 싶을 때 수동 호출. 자동 실행은 /morning-briefing 으로 이전됨.",
    "weather-dust": "서울 날씨 + 미세먼지만 따로 확인하고 싶을 때 수동 호출. 자동 실행은 /morning-briefing 으로 이전됨.",
    "side-project-briefing": "사이드 프로젝트 아이디어 상세 브리핑(파일 저장 포함)만 따로 받고 싶을 때 수동 호출. 자동 실행은 /morning-briefing 으로 이전됨.",
    "todo": "할일·사이드 프로젝트를 ~/todo/todos.md + 미리알림 앱 \"Claude\" 목록과 양방향 연동.",
    "sync": "맥·WSL 의 자동화/이슈 히스토리를 즉시 최신 상태로 끌어오는 수동 스킬. 06:45 KST 자동 동기화(daily-sync-and-learn) 재사용. 데스크탑에서 방금 push 한 내용을 맥에서 바로 받고 싶을 때.",
    "usage": "ccusage 기반 토큰 사용량 ASCII 바 그래프. 현재 5시간 블록, 히스토리, 모델별 분포, 주/일별 합계.",
    "worklog": "하루 작업 내용(맥+데스크탑 세션 로그 + 모든 git 커밋)을 수집·요약 → docs/worklog/YYYY-MM-DD_vX.Y.Z.md 저장 + git 푸시. 실행 시 Tailscale rsync 로 데스크탑 세션도 자동 당겨 옴.",
    "submit-app": "앱 스토어 제출 루틴. lessons/ 에 쌓인 과거 실수·리젝 사례를 Step 0 에서 읽어 재발 방지 체크리스트로 만든 뒤 빌드·업로드·심사 제출. 제출 후 새 교훈이 있으면 lessons 에 누적.",
    "toss-tone": "Flutter 앱 디자인을 Toss 톤으로 고도화. 레퍼런스 theme.dart 의 Pretendard + 색상·반경·스페이싱 토큰을 타겟 앱에 비파괴적으로 머지하고, 화면 코드의 매직 넘버·fontFamily 누락을 스캔 리포트.",
    "arun": "/irun 의 Android 버전. WSL→Windows 브릿지로 연결된 갤럭시에 clean + release 로 재빌드·실행. 이전 Gradle 데몬만 정리(광범위 java kill 금지).",
    "night-runner": "야간 사이드 프로젝트 러너. projects.yaml 기반 라운드로빈으로 매일 밤 1개 repo 선정 → repo-janitor 에이전트가 TODO 1~2개 처리 → janitor/YYYY-MM-DD 브랜치 push → 텔레그램 보고. 아침 /merge-janitor 로 머지.",
    "trend": "Dev Trend Curator. Hacker News + GitHub 일일 트렌드에서 Flutter/indie/Claude 키워드 매칭 → ~/trend-curator/daily/YYYY-MM-DD.md 누적 + 텔레그램 요약 전송.",
}


def parse_frontmatter(text: str) -> dict[str, str]:
    """Minimal YAML frontmatter parser — only extracts flat scalar keys."""
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end < 0:
        return {}
    body = text[3:end].strip("\n")
    out: dict[str, str] = {}
    for line in body.splitlines():
        m = re.match(r"^([A-Za-z0-9_-]+):\s*(.*)$", line)
        if not m:
            continue
        key, val = m.group(1), m.group(2).strip()
        # strip surrounding quotes
        if len(val) >= 2 and val[0] == val[-1] and val[0] in "\"'":
            val = val[1:-1]
        out[key] = val
    return out


def collect_skills() -> list[dict]:
    skills: list[dict] = []
    for child in sorted(SKILLS_DIR.iterdir()):
        if not child.is_dir():
            continue
        if child.name.startswith(".") or child.name in {"issues", "agents", "globals"}:
            # issues/ is its own page, agents/globals are scaffolding
            continue
        skill_md = child / "SKILL.md"
        if not skill_md.exists():
            continue
        fm = parse_frontmatter(skill_md.read_text(encoding="utf-8"))
        if not fm.get("name"):
            continue
        if fm.get("daejong_hidden", "").lower() == "true":
            continue
        name = fm["name"]
        tag = fm.get("daejong_tag") or FALLBACK_TAGS.get(name, "")
        description = CARD_DESC_OVERRIDE.get(name) or fm.get("description", "")
        order_raw = fm.get("daejong_order", "")
        try:
            order = int(order_raw)
        except (ValueError, TypeError):
            order = 500
        skills.append({
            "name": name,
            "tag": tag,
            "description": description,
            "order": order,
        })
    # Primary sort: explicit daejong_order, then name
    skills.sort(key=lambda s: (s["order"], s["name"]))
    return skills


def escape_html(s: str) -> str:
    return (s.replace("&", "&amp;")
             .replace("<", "&lt;")
             .replace(">", "&gt;")
             .replace("\"", "&quot;"))


def render_cards(skills: list[dict]) -> str:
    lines: list[str] = []
    for s in skills:
        name = escape_html(s["name"])
        tag = escape_html(s["tag"])
        # description passes through as-is — inline HTML (<b>) is allowed
        # since source files are ours and not user-generated.
        desc = s["description"]
        tag_span = f'<span class="card-tag">{tag}</span>' if tag else ""
        lines.append(f"""      <div class="card">
        <div class="card-header"><span class="card-name">/{name}</span>{tag_span}</div>
        <div class="card-desc">{desc}</div>
        <div class="card-links">
          <a href="https://github.com/ssamssae/claude-skills/blob/main/{name}/SKILL.md" target="_blank" rel="noopener">GitHub →</a>
        </div>
      </div>""")
    return "\n\n".join(lines)


def rewrite_html(html: str, cards: str) -> str:
    pattern = re.compile(
        re.escape(START_MARK) + r".*?" + re.escape(END_MARK),
        re.DOTALL,
    )
    block = f"{START_MARK}\n{cards}\n      {END_MARK}"
    if not pattern.search(html):
        raise SystemExit(
            f"markers not found in {SKILLS_HTML}. "
            f"Wrap the card grid with {START_MARK} / {END_MARK} first."
        )
    return pattern.sub(block, html)


def main() -> None:
    dry = "--dry" in sys.argv
    skills = collect_skills()
    print(f"discovered {len(skills)} skills:")
    for s in skills:
        print(f"  /{s['name']:30s}  [{s['tag']}]")

    cards = render_cards(skills)
    if dry:
        print("\n--- rendered cards ---\n")
        print(cards)
        return

    html = SKILLS_HTML.read_text(encoding="utf-8")
    new_html = rewrite_html(html, cards)
    if new_html == html:
        print("\nno change.")
        return
    SKILLS_HTML.write_text(new_html, encoding="utf-8")
    print(f"\nupdated {SKILLS_HTML}")


if __name__ == "__main__":
    main()
