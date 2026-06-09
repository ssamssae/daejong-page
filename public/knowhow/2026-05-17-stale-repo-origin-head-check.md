# 자주 안 만지는 repo 작업 시작 전 origin/HEAD + commit 뒤처짐 fetch 비교 reflex

오랜만에 작업하는 repo 는 (1) default branch 가 main 인지 master 인지, (2) local branch 가 origin 보다 몇 commit 뒤처졌는지 둘 다 stale 일 수 있다. 작업 시작 전 5초 reflex 로 둘 다 확인.

## 핵심

`git checkout main` 만 하고 작업 시작했다가 실제 default 가 master 였거나, local 이 7+ commit 뒤처진 상태에서 새 브랜치 따면 PR 베이스가 stale 되어 conflict 폭증 또는 잘못된 머지 베이스.

## reflex 시퀀스

```bash
cd <repo>

# 1. fetch — origin 상태 최신화
git fetch --all

# 2. origin/HEAD default branch 확인
git symbolic-ref refs/remotes/origin/HEAD --short
# 예: origin/main  또는  origin/master

# 3. 현재 local branch vs origin/<default>
git rev-list --left-right --count HEAD...origin/$(git symbolic-ref refs/remotes/origin/HEAD --short | sed 's|origin/||')
# 출력: A B  (A=local 만 있는 commit, B=origin 만 있는 commit = 뒤처짐)

# 4. 뒤처졌으면 pull 또는 rebase
git pull --ff-only
# 또는
git pull --rebase
```

## 자동 헬퍼 (한 줄)

```bash
# repo 작업 직전 0차 reflex 한 줄
git fetch && git status -sb && git rev-list --left-right --count HEAD...@{u} 2>/dev/null
```

출력 예:
```
## main...origin/main [behind 7]
0 7
```
→ 7 commits 뒤처짐. pull 후 작업.

## 함정

- 새 repo init 직후엔 `origin/HEAD` 가 비어있을 수 있음 — `git remote set-head origin --auto` 로 셋업
- default 가 master 인 repo 에서 `git checkout main` 하면 detached 또는 새 빈 브랜치 생성. 항상 `origin/HEAD` 먼저 확인.
- 자주 안 만지는 사이드 repo 에서 master vs main + 7+ commit 뒤처짐 함정 둘 다 맞은 PR 사고 사례 있음

## 다시 꺼내쓰는 법

- 자주 안 만지는 repo (7일+ idle) 작업 시작 전 reflex
- 새 브랜치 따기 직전 / PR 만들기 직전 다시 한 번
- CI/test 깨졌다고 디버깅 들어가기 전에 stale 가능성 먼저 의심
