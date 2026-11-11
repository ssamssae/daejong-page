#!/usr/bin/env python3
"""Extract one GitHub Actions step `run` block using the Python standard library.

The caller executes that block as-is. This file does not reimplement the step.
A literal block scalar (`run: |`, `|-`, `|+`) is required. Any other shape exits 1.
"""

import re
import sys


def extract_step_run(text, step_name):
    lines = text.split("\n")
    step_re = re.compile(
        r'^(\s*)-\s+name:\s+(["\']?)%s\2\s*(?:#.*)?$' % re.escape(step_name)
    )
    run_re = re.compile(r"^(\s*)run:\s+\|([-+]?)([0-9]*)\s*(?:#.*)?$")

    for index, line in enumerate(lines):
        matched = step_re.match(line)
        if not matched:
            continue
        item_indent = len(matched.group(1))
        run_at = None
        chomp = ""
        explicit = ""
        key_indent = 0
        for cursor in range(index + 1, len(lines)):
            nxt = lines[cursor]
            if nxt.strip() == "":
                continue
            if "\t" in nxt[: len(nxt) - len(nxt.lstrip(" \t"))]:
                return None
            indent = len(nxt) - len(nxt.lstrip(" "))
            if indent <= item_indent:
                break
            run_match = run_re.match(nxt)
            if run_match:
                run_at = cursor
                key_indent = len(run_match.group(1))
                chomp = run_match.group(2)
                explicit = run_match.group(3)
                break
        if run_at is None:
            return None

        if explicit == "":
            block_indent = None
        else:
            block_indent = key_indent + int(explicit)

        content = []
        for cursor in range(run_at + 1, len(lines)):
            raw = lines[cursor]
            if raw.strip() == "":
                content.append("")
                continue
            if raw.startswith("\t"):
                return None
            indent = len(raw) - len(raw.lstrip(" "))
            if block_indent is None:
                if indent <= key_indent:
                    break
                block_indent = indent
            if indent < block_indent:
                break
            content.append(raw[block_indent:])

        while content and content[0] == "" and block_indent is None:
            content.pop(0)

        if chomp == "-":
            while content and content[-1] == "":
                content.pop()
            return "\n".join(content)
        while content and content[-1] == "":
            content.pop()
        if not content:
            return ""
        return "\n".join(content) + "\n"
    return None


def main(argv):
    if len(argv) != 3:
        print("usage: extract_gha_step_run.py <workflow.yml> <step name>", file=sys.stderr)
        return 2
    workflow_path, step_name = argv[1], argv[2]
    with open(workflow_path, encoding="utf-8") as handle:
        text = handle.read()
    body = extract_step_run(text, step_name)
    if body is None:
        print("추출 실패 — 스텝 이름이 바뀌었거나 run 블록이 리터럴이 아니다", file=sys.stderr)
        return 1
    sys.stdout.write(body)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
