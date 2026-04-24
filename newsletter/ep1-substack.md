<!--
Substack 발행용 Ep.1 편집본 (2026-04-24 WSL 세션 생성)
원본: ep1-2026-04-20.md (본문 그대로, Substack 형식·구독 CTA·이미지 플레이스홀더만 추가)

Substack 에디터 복붙 순서:
1. 아래 "📋 TITLE" 값을 제목 필드에
2. "📋 SUBTITLE" 값을 부제 필드에
3. "📋 BODY" 아래 --- 경계선 다음부터 끝까지 에디터 본문에 복붙
4. 🖼 IMAGE: 주석이 있는 자리에 실제 이미지 업로드 (4곳)
5. 💌 SUBSCRIBE CTA 자리에 Substack 에디터 "Subscribe now" 버튼 블록 삽입 (2곳)
6. 태그: vibe-coding, claude-code, local-llm, indie-dev, 바이브코딩
-->

📋 **TITLE**
3시간 만에 나만의 로컬 AI 어시스턴트 만들기

📋 **SUBTITLE**
바이브코딩 뉴스레터 Ep.1 — Claude Code + WSL 2070S 로 로컬 RAG 봇 '기억이' 시드하기까지 21:30~00:00

---

📋 **BODY** (아래부터 끝까지 Substack 본문 복붙)

---

> 🖼 IMAGE 1 (Hero) — "터미널 창 + 폰 텔레그램 창이 나란히, 폰 쪽에 한국어로 답이 찍혀있는 장면" 스크린샷 또는 합성. 없으면 AI 생성(DALL·E/Imagen) 으로 대체 가능. 1200×630px 권장.

> 2026-04-19 밤 21:30, 질문 하나로 시작했다.
> "내 작업 기억을 통째로 먹여 두고 언제든 자연어로 물어볼 수 있는 봇 하나 있으면 좋지 않을까?"
> 2026-04-20 00:00, 그 봇은 systemd 서비스로 떠서 텔레그램에서 답을 하고 있었다.

이 뉴스레터는 Claude Code 한 개와 사이드킥 두 대(맥·WSL)만 쥔 1인 바이브코더가 주말 저녁부터 자정 사이에 **로컬 AI 어시스턴트**를 만들어 낸 과정의 기록이다. 아주 매끄럽게 흐른 이야기는 아니다. 중간에 `apt install` 이 멈추고, systemd 유닛이 거부당하고, 텔레그램 봇이 자기 자신과 싸우는 구간이 있다. 그 장면들이 이 에피소드의 주인공이다.

---

## 1. 기억이는 뭐 하는 봇인가

`@gieogu_ssamssae_bot`. 한국어로 읽으면 "기억이". 내가 지난 40일 동안 쌓아 온 `daejong-page` 레포의 기록들 — 산문체 `worklog`, 체크리스트형 `done`, 일자별 스냅샷 `todos`, 그리고 포스트모템 폴더 `issues` — 를 전부 먹고, 텔레그램에서 자연어로 물어보면 그 속에서 답을 꺼내 주는 봇이다.

- "지난 주 더치페이 앱에 뭐 했지?"
- "약먹자 프로젝트는 왜 중단됐어?"
- "4월 18일에 해결한 OAuth 이슈 다시 정리해 줘"

지금까지 내가 Claude Code 에 매번 다시 제공해야 했던 맥락 — "이거 어제 고친 거거든", "이 프로젝트는 이미 드롭했고" — 를 봇이 기억해 주는 것이다. 내 작업 기록 전용 ChatGPT 라고 보면 된다. 대신 내 노트북 방 구석에 있는 WSL + RTX 2070 Super 에서 돌아간다. OpenAI 도, Claude API 도, 구독도 없다.

## 2. 스택 고르기 (15분)

> 고민보다 결정. 바이브코딩 원칙 1번.

> 🖼 IMAGE 2 (Architecture) — 6칸 블록 다이어그램. LLM(ollama qwen2.5:7b) / 임베딩(nomic-embed-text) / Vector DB(ChromaDB) / 런타임(WSL GPU) / 인터페이스(Telegram Bot) / 배포(systemd). 토스 톤 그레이/블루 팔레트로. Excalidraw 또는 tldraw 로 1분컷.

| 층위            | 선택                    | 왜                                                                 |
|-----------------|-------------------------|--------------------------------------------------------------------|
| LLM             | `qwen2.5:7b`            | 한국어 비교적 무난, 7B 라서 2070 Super 8GB 에 무리 안 감           |
| 임베딩          | `nomic-embed-text`      | 가벼움, Ollama 에 번들로 있음                                      |
| Vector DB       | `ChromaDB`              | SQLite 백엔드, 한 파일로 끝, Python 에서 3줄이면 붙음              |
| 런타임          | `Ollama` (WSL GPU)      | `docker`, `vllm` 다 따져 봤지만 "저녁 안에 뜨는 것" 이 제일 중요    |
| 인터페이스      | Telegram Bot API        | 폰에서 바로 쓸 수 있고 UI 만들 필요 없음                           |
| 배포            | `systemd` 유저 서비스   | 재부팅에도 뜨고, 크래시하면 알아서 재시작                          |

15분 안에 다 정했다. "나중에 바꿀 수 있는 것" 과 "오늘 밤 안에 돌아야 하는 것" 을 구분하면 결정이 빨라진다.

## 3. Phase 0 — 환경 (21:45) : *apt 가 멈췄다*

Ollama 는 이미 깔려 있었다. 필요한 건 `qwen2.5:7b` 와 `nomic-embed-text` 풀, Python 의존성(`chromadb`, `python-telegram-bot`, `ollama` 클라이언트) 그리고 시스템 라이브러리 몇 개.

`sudo apt install <뭐시기>` 를 치고 Enter. 그리고 **여기서 처음 삽질이 터졌다**.

```bash
sudo apt install python3-venv
# ...progress bar...
# 설치가 멈춘 것 같아서 Ctrl-Z
[1]+  Stopped                 sudo apt install python3-venv
```

내가 친 건 `Ctrl-C` 가 아니라 **`Ctrl-Z`**. 프로세스는 죽지 않고 **정지(suspended)** 만 됐다. 게다가 `apt` 는 `/var/lib/dpkg/lock-frontend` 를 쥔 채로 얼어 있었다. 뒤에 아무리 `sudo apt install` 을 쳐도 "다른 프로세스가 dpkg 잠금을 쥐고 있다" 만 돌아왔다.

Claude Code 한테 "apt 가 안 먹힌다" 고 하자 즉시 되물어 왔다: "혹시 방금 Ctrl-Z 누르셨어요?" ... `jobs` 찍어 보니 `[1]+ Stopped` 로 얌전히 서 있다. `fg %1` 로 끌어내서 설치를 마치고, 그 다음부터 나는 `Ctrl-Z` 라는 단축키를 당분간 봉인하기로 했다.

> **배운 것** — 터미널의 Ctrl-Z 는 창을 닫지 않고 프로세스를 stop 시킨다. VS Code 의 되돌리기와 완전히 다른 동작이다. GUI 습관이 터미널에 들어오면 이런 사고가 일어난다.

**21:58** — 의존성 설치 완료. Phase 0 끝.

## 4. Phase 1 — 인덱싱 (22:00~22:45)

기억이의 "기억" 은 `daejong-page` 레포의 `worklog/*.md`, `todos/*.md`, `done/*.md` 를 ChromaDB 컬렉션에 임베딩한 것이다. 흐름은 단순하다:

1. 파일 읽기
2. 마크다운을 의미 단위(섹션/문단)로 쪼개기
3. `nomic-embed-text` 로 임베딩
4. ChromaDB 에 `{id, text, metadata: {date, source_file}}` 로 저장

여기서 시간이 꽤 들었다. 청킹 전략 때문이다. 내 worklog 는 한 파일에 5000~8000자 정도의 **산문**이라, 통째로 임베딩하면 검색 매칭이 흐려지고, 줄 단위로 쪼개면 문맥이 사라진다. 최종적으로 "줄바꿈 2개 이상으로 문단 단위 분리 + 500자 이상이면 재분할" 규칙으로 내려앉았다. 77 개 worklog 청크, 41 개 todos 청크 — 이 정도면 2070S 로 1분 안에 다 인덱싱된다.

**22:42** — `chroma.query("지난 주 메모요 관련 작업")` 로 첫 retrieval 성공. 상위 5건 전부 실제 메모요 작업 기록이 올라왔다. 이 순간이 가장 짜릿했다. 내 기록이 내 노트북 안에서 **의미로** 묶이고 있었다.

> 💌 SUBSCRIBE CTA 1 — 여기에 Substack 에디터 "Subscribe now" 버튼 블록 삽입.
> 권장 문구: "이 시리즈는 Claude Code + 1인 앱개발 여정을 주간으로 기록합니다. 무료 구독하면 매주 금요일 밤에 도착합니다."

## 5. Phase 2 — 봇 (22:50~23:55) : *[Service] 헤더가 사라졌다*

텔레그램 쪽은 기술적으로 제일 단순하다. `python-telegram-bot` 로 `/start`, 메시지 핸들러, 그리고 핵심 함수 하나:

```python
async def answer(update, ctx):
    q = update.message.text
    docs = chroma.query(q, n_results=8)
    prompt = build_prompt(q, docs)  # 컨텍스트 주입
    resp = ollama.chat(model="qwen2.5:7b", messages=[...])
    await update.message.reply_text(resp, parse_mode="Markdown")
```

**23:20** 에 수동 실행으로 돌려서 첫 질의 성공. 봇이 한국어로 답을 하고 있었다 (섞여 있는 중국어는 다음날 새벽에 해결했지만 그건 Ep.2 이야기).

이제 남은 건 `systemd` 유저 서비스로 올려서 재부팅에도 살아있게 만드는 것. 이걸 10분이면 끝낼 줄 알았다. **그런데**.

```ini
# ~/.config/systemd/user/gieogi-bot.service
Description=기억이 Telegram bot
ExecStart=/home/user/기억이/.venv/bin/python /home/user/기억이/src/bot.py
Restart=on-failure
```

`systemctl --user daemon-reload` 까지는 조용했다. `systemctl --user start gieogi-bot` 을 치는 순간:

```
Failed to start gieogi-bot.service: Unit gieogi-bot.service is not loaded properly:
Assertion failed on command line 'ExecStart'.
```

**무슨 말이지?** ExecStart 가 이상하다는 건데 경로는 맞다. 권한도 맞다. `python` 으로 직접 돌리면 봇이 뜬다. 10분 동안 경로 퍼뮬레이션, venv 재생성, 심지어 bash 래퍼로 감싸는 것까지 시도했다.

답은 멍청할 정도로 단순했다. **`[Service]` 섹션 헤더를 안 썼다.**

```ini
# 이게 내가 처음 쓴 것
Description=기억이 Telegram bot
ExecStart=...

# 이게 올바른 것
[Unit]
Description=기억이 Telegram bot

[Service]
ExecStart=...
Restart=on-failure

[Install]
WantedBy=default.target
```

systemd 유닛 파일은 ini 형식이라 **섹션 헤더가 없으면 모든 지시어가 orphan 된다**. 에러 메시지는 "ExecStart 가 이상하다" 고 말했지만 진짜 원인은 "[Service] 섹션이 없어서 ExecStart 가 어디 소속인지 모르겠다" 였다. systemd 는 이런 종류의 에러 메시지를 **몹시 냉담하게** 준다.

> **배운 것** — ini 파일은 섹션 헤더가 문법의 일부다. YAML 이나 JSON 같은 들여쓰기 감각으로 접근하면 매번 이 함정에 빠진다.

**23:48** — 헤더 세 줄 추가. `daemon-reload` → `start`. 서비스 ACTIVE. 두 번째 고비 통과.

## 6. 마지막 함정 — 봇이 자기 자신과 싸우고 있었다

> 🖼 IMAGE 3 (Log capture) — `journalctl --user -u gieogi-bot -f` 실제 출력의 `telegram.error.Conflict: terminated by other getUpdates request` 에러가 반복해서 찍히는 장면. 터미널 스크린샷 그대로 또는 다크 테마 코드블록 스타일 이미지로 대체 가능.

systemd 에 올려 두고 폰으로 메시지를 보냈다. 답이 안 온다. 다시 보낸다. 또 안 온다. `journalctl --user -u gieogi-bot -f` 를 찍으니 로그가 미친 듯이 올라오고 있었다.

```
telegram.error.Conflict: Conflict: terminated by other getUpdates request;
make sure that only one bot instance is running
```

텔레그램 Bot API 는 `getUpdates` 를 **딱 하나의 인스턴스만** 폴링할 수 있다. 같은 토큰으로 두 프로세스가 동시에 폴링하면 두 쪽 다 계속 밀려나면서 메시지가 **아무한테도** 안 간다.

원인은 뻔했다. 22시 경에 Phase 2 수동 테스트를 한다고 터미널에서 `python bot.py` 를 직접 돌렸던 프로세스가 **아직 살아 있었다**. 아까 봇이 잘 받던 그 프로세스다. 거기다 systemd 가 **새 인스턴스**를 또 올렸다. 둘이 같은 토큰으로 싸우고 있었다.

```bash
pkill -f bot.py           # 수동 프로세스 제거
systemctl --user restart gieogi-bot   # 깨끗하게 재시작
```

**23:59** — 폰에서 "오늘 뭐 했어?" 한 줄 보냈다. 30초 뒤, 내가 자정까지 한 일이 한국어로 요약되어 돌아왔다.

2026-04-20 **00:00**.

## 7. 그래서 뭐가 남았나

> 🖼 IMAGE 4 (Result) — 실제 텔레그램 대화 스크린샷. "오늘 뭐 했어?" 질문 + 한국어 요약 답변. 민감 정보는 블러. 없으면 스킵해도 무방(본문만으로도 장면 전달됨).

3시간에 만든 것:
- 로컬 GPU 에서 도는 LLM + 임베딩
- 내 작업 기록 118 청크가 들어간 벡터 DB
- 텔레그램 봇 프론트엔드
- 재부팅에도 살아남는 systemd 서비스

들어간 돈:
- 0 원 (전기세 제외)

구독도, API 키도, 월 요금도 없다. 내 방 구석 노트북이 내 기억을 보관하고 내 질문에 답한다. 처음 만든 것이 내 것이라는 감각이 이렇게 직접적으로 돌아오는 경험은 바이브코딩 아니면 맛보기 어렵다.

## 8. 남은 일 (당시 Ep.2 예고였지만…)

> *✍️ 2026-04-24 추가 각주 — 이 아래 Phase 3 계획은 **실제로는 드롭됐다**. 다음 날 아침에 기억이의 답 품질이 쓸 만한 수준이 아니라고 판단해서 프로젝트 자체를 닫았다. 그 이야기는 Ep.2 "[기억이를 드롭했다]" 에서 본격적으로 다룬다. Ep.1 원고는 당시 흐름을 **그대로 보존**해서 "만들고 → 버리는" 의 첫 장면으로 남겨 둔다.*

이건 **Phase 0-2** 다. 오늘 새벽에 Phase 2.1 로 Markdown fallback + 한국어 강화 + 답변 길이 조정까지는 끝냈고, 남은 **Phase 3** 는 세 가지다:

1. 맥의 `~/docs` 를 rsync 로 WSL 에 붙여서 인덱싱 범위 확장 (개인 문서라 친구 공유 시 제외 필터 필수)
2. 증분 ingest — 현재는 매번 전체 재인덱싱. 파일 mtime 기준으로 delta 만 넣기
3. git 커밋 히스토리 인덱싱 — 문서뿐 아니라 코드 변경 이력까지 기억하게

다음 에피소드는 Phase 3 하면서 부딪힌 구조적 결정들 — 특히 "내 것은 기억하고 친구 것은 안 보는" 필터 설계 — 를 다루려 했다. (실제 Ep.2 는 다른 이야기로 풀린다 — 위 각주 참고.)

## 9. 이 이야기가 주는 3가지

1. **막히는 지점은 언제나 단순하다.** 이번 3시간에 막힌 세 지점 전부 한 줄 고치면 됐다. Ctrl-Z 대신 Ctrl-C, 섹션 헤더 추가, 기존 프로세스 죽이기. 시간을 먹은 건 "왜 이게 안 되는지" 를 좁혀 가는 과정이었다.
2. **에러 메시지는 친구가 아니다.** systemd 의 "Assertion failed on ExecStart" 는 진짜 원인이 아니었다. 텔레그램의 "terminated by other getUpdates" 도 원인은 말해 주지 않았다. 메시지를 글자 그대로 믿지 말고, 그 직전에 내가 **뭘 건드렸는지** 를 돌아보는 게 더 빠를 때가 많다.
3. **Claude Code 는 증상을 보면 원인을 찾는다.** "apt 가 안 먹혀요" 한 줄에 "Ctrl-Z 누르셨어요?" 가 돌아오는 식. 내가 기억 못 하는 2분 전의 키 입력을 질문 한 줄로 재현해 준다. 이게 있어야 3시간 안에 로컬 AI 를 띄울 수 있다.

---

> 💌 SUBSCRIBE CTA 2 — 마무리 직전 "Subscribe now" 블록 두 번째. 권장 문구: "Ep.2 '기억이를 드롭했다' 는 이미 공개돼있고, 다음 에피소드는 심사레이더 개발기로 이어집니다. 놓치지 않으려면 구독하세요."

*다음 에피소드: **Ep.2 — 기억이를 드롭했다**. 3시간에 만든 봇을 왜 다음날 아침에 닫았는지, 만든 것의 품질을 어떻게 스스로 평가했는지에 관한 이야기.*

— 강대종 (1인 바이브코더, Claude Code 동반자)
