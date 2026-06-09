---
title: "mac-report.sh 의 ssh 마지막 step glob NOMATCH 가 mirror chain 을 통째로 skip"
tags: [mac-report, ssh, zsh, nomatch, set-e, mirror, glob, defense-in-depth]
date: 2026-05-30
---

# mac-report.sh 의 ssh 마지막 step glob NOMATCH 가 mirror chain 을 통째로 skip

노드 → 본진 보고용 스크립트가 본진 tmux 엔 정상 paste 하는데, 봇 chat 알림과 그룹 mirror 만 조용히 사라지는 사고. `set -e` 스크립트에서 ssh oneliner 의 **마지막 step 이 빈 glob 으로 실패**하면, 그 뒤에 오는 mirror 호출들이 통째로 건너뛰어진다.

## 증상

노드가 mac-report.sh 로 결과를 보내면 본진 tmux 세션엔 바이트 단위로 정상 도착(inbox-paste.log 에 찍힘)한다. 그런데 본진 봇 chat 의 `[💻→🍎][결과]` 짧은 알림 + Agent Mesh Mirror 그룹의 풀바디 mirror 가 둘 다 silent skip. 사용자가 "노드가 본진에 보낸 게 없는데" 하고 지적해야 비로소 드러난다.

## 원인

스크립트가 `set -euo pipefail` 인데, ssh oneliner 의 마지막 step 인 `rm -f $HOME/.local/state/claude-directives/pending-*` 가 Mac 의 zsh 기본 `NOMATCH` 옵션을 trigger 한다. 매치되는 파일이 없으면 zsh 가 에러로 종료 → ssh 가 비-제로 exit → bash 의 `set -e` 가 그 시점에 스크립트를 abort 한다. paste 자체는 ssh chain 의 앞 step(cat / inbox-paste)에서 이미 끝났기 때문에 tmux 엔 도착하지만, 직후의 `agent-msg-notify`(본진 chat 알림)와 `forward-to-group`(그룹 풀바디 mirror)은 실행 0회가 된다. 전수조사하면 한 노드만이 아니라 모든 노드가 같은 함정을 공유한다.

## 해결

빈 매치도 정상 종료하도록 `rm -f pending-*` 를 `find` 로 교체하고, 방어선으로 `; true` 를 덧붙인다:

```bash
find "$HOME/.local/state/claude-directives" -name 'pending-*' -delete 2>/dev/null; true
```

`find -delete` 는 매치가 없어도 exit 0 이고, 끝의 `; true` 는 미래에 어떤 step 이 깨져도 mirror chain 은 반드시 발사되도록 하는 defense-in-depth 다.

## 재발 방지

- mirror chain(알림 + 그룹 forward) 호출을 ssh 결과와 분리한다 — ssh 가 실패해도 mirror 는 시도되게.
- critical script 의 ssh oneliner 마지막 step 에 glob 을 쓸 땐 NOMATCH 안전성을 의무 체크한다.
- "mac-report 호출했는데 폰 알림이 0" 패턴은 사람 의지에 의존하지 않는 forcing function 으로 잡는다 — paste 가 도착한 같은 시각에 `[<이모지>→🍎]` 알림이 0 이면 mirror chain 이 깨졌다는 시그널이므로 본진이 다음 발화 때 자동 surface.
