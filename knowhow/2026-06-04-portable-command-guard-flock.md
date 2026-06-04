# Linux 전용 명령(flock 등)은 command -v 가드로 감싸라 — macOS 에서 silent fail 방지

여러 OS(macOS + Linux)에서 같이 도는 hook·스크립트에 `flock` 같은 util-linux 전용 명령을 쓸 땐, 그 명령이 없는 OS 에서 조용히 다른 동작을 한다. 특히 `|| exit 0` 과 합쳐지면 "명령 부재" 가 "정상 종료" 로 둔갑한다.

## 핵심

```bash
exec 9>/tmp/x.lock
flock -n 9 || exit 0     # ← macOS 엔 flock 없음 → "command not found"(127) → || exit 0 발동
```

의도는 "이미 다른 인스턴스가 잠금을 쥐고 있으면 조용히 빠져라" 였는데, `|| exit 0` 은 **잠금 실패만이 아니라 flock 명령 자체의 부재(127)까지 삼킨다**. 그래서 macOS 에서는 hook 이 잠금을 걸어보기도 전에 두 번째 줄에서 매번 즉시 종료. 로그 한 줄 안 남는 무동작 = silent fail.

실제 사고: 본진(macOS)의 자동 sync hook 4개가 만들어진 날부터 줄곧 안 돌고 있었는데, Linux 노드들은 flock 이 있어 정상이라 "본진만 새는" 비대칭으로 나타나 오래 안 잡혔다.

## 가드 패턴

```bash
# flock 있을 때만 잠금, 없으면 그냥 진행
if command -v flock >/dev/null 2>&1; then
  exec 9>/tmp/x.lock
  flock -n 9 || exit 0
fi
```

Linux 에서는 동작 불변, macOS 에서는 hook 이 끝까지 흐른다.

## 함정

- `|| exit 0` / `|| true` 는 "실패해도 괜찮다" 가 아니라 "실패를 숨긴다" 일 수 있다. **무엇을 삼키는지**(잠금 실패만? 명령 부재까지?) 정확히 알고 써라.
- `flock` 외에도 macOS 부재 흔한 것: `timeout`(→ `gtimeout`/coreutils), `sha1sum`(→ `shasum`), GNU `sed -i` 문법, `readlink -f`, `nproc`.
- "한 기기에선 되는데 저 기기만 안 된다" 는 안심 신호가 아니라 **환경차를 가장 먼저 의심할 신호**.

## 검증 reflex

자동화는 "짜놨으니 돌겠지" 가정 금지. 무동작도 표면적으론 정상처럼 보인다.

```bash
# hook 이 실제 끝까지 도는지 — 빈 로그면 중간에 죽은 것
: > /tmp/sync.log
bash ~/.claude/hooks/<hook>.sh
cat /tmp/sync.log          # 로그 흔적 0 = 중도 종료 의심
# 결과로 검증 (예: 멀티노드 sha 일치)
```

## 다시 꺼내쓰는 법

- 멀티 OS(맥+리눅스)에서 도는 hook/스크립트 작성·리뷰할 때
- `flock`/`timeout`/coreutils 류 명령을 스크립트에 넣기 직전
- "이 자동화 잘 돌고 있나?" 의심 들 때 — 로그·결과 sha 로 실측
