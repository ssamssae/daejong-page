---
prevention_deferred: null
---

# 본진 챗봇이 SSH alias 대신 hostname 그대로 사용 → 두 시간 timeout 추적

- **발생 일자:** 2026-05-15 14:28 KST
- **해결 일자:** 2026-05-16 00:58 KST
- **심각도:** medium (작업 두 시간 헛다리, 동시 진행 task 지연)
- **재발 가능성:** medium (CLAUDE.md hostname 컬럼과 ssh alias 가 매번 헷갈리는 패턴)
- **영향 범위:** 본진(🍎) → 다른 노드 직접 ssh 명령 / cross-device probe / 진단 사이클

## 증상

WSL 노드 점검 중 `ssh -o ConnectTimeout=5 DESKTOP-I4TR99I hostname` 등 명령이 매번 `Operation timed out` 으로 실패. 두 시간 가까이 "WSL 노드 죽었다" 로 잘못 진단하고 텔레그램 복붙 fallback 경로로 전환. 그 사이 같은 노드를 대상으로 `wsl-directive.sh -f ...` 호출은 모두 정상 작동 (`✅ directive sent to WSL tmux session 'claude'`). 강대종이 "WSL 살아있다는데" 알려서 비대칭 surface, 본진 ssh config 분석해서 원인 발견.

## 원인

`~/.ssh/config` 에서 WSL 노드 alias 는 `Host wsl desktop` 로 등록돼있고 실제 HostName 은 `desktop-i4tr99i-1` (Tailnet 경유). CLAUDE.md L179 의 "현재 기기 빠른 식별" 표에 hostname 컬럼이 `DESKTOP-I4TR99I` 로 표기돼있는데, 이건 노드 자체 hostname (`hostname` 명령 결과) 정보를 표시한 것이지 ssh alias 가 아님.

본 챗봇이 두 컬럼 의미를 혼동해서 `ssh DESKTOP-I4TR99I` 명령을 그대로 발사. ssh 가 그 hostname 을 alias 로 못 찾으니 DNS resolution 시도 → 외부 DNS 에 이름 없으니 resolution 실패 → ConnectTimeout 만큼 기다리다 timeout. 같은 시간 `wsl-directive.sh` 는 내부에서 `ssh wsl` alias 사용해서 Tailnet 경유로 정상 작동.

## 조치

- `~/.ssh/config` 확인하고 alias 가 hostname 과 다름 인지
- 이후 모든 ssh 명령은 alias 사용 (`ssh wsl`, `ssh desktop3060ti`, `ssh notebook3060`, `ssh mac-mini`)
- 본 이슈 박제

## 예방 (Forcing function 우선)

- 메모리 박제 `feedback_ssh_alias_not_hostname.md` 신규 — ssh 명령 시 CLAUDE.md hostname 컬럼이 아니라 `~/.ssh/config` 의 `Host` alias 사용. hostname 그대로 명령 발사 시 timeout 함정.
- CLAUDE.md "현재 기기 빠른 식별" 표에 SSH alias 컬럼 추가 — hostname 정보와 alias 를 한 표에서 한눈에 구분 (별 작업 후속).
- 본진 챗봇 self-check: ssh 명령 작성 전 한 번 `grep ^Host ~/.ssh/config` 또는 alias 컨벤션 확인. ssh 호스트 이름이 대문자 + 하이픈 (`DESKTOP-...`) 패턴이면 의심.

## 재발 이력

<처음 생성 — 비어있음>

## 관련 링크

- 유사 케이스: `2026-05-15-macmini-reverse-asym.md` (SSH alias 인프라 부재 — 본 사고는 행동 미스, 카테고리 다름)
- 본진 SSH config: `~/.ssh/config` Host wsl/desktop alias
