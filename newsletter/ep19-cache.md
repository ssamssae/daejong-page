<!--
Source: https://daejongkang.substack.com/p/5-5
Synced: 2026-05-26T17:55:24
-->

# 한 새벽에 5가지 방법으로 멈춘 5대

_"잘 건데 워크스틸 ON" 한 마디로 5 노드 동시 발사. 아침에 보니 5 대가 5 가지 다른 방법으로 멈춰있었다._

_2026-05-26_

---

## 1. 자기 전 명령 한 줄

새벽 0시 30분. 자려고 누웠는데 머릿속에 떠올랐다. *“5 대한테 무거운 작업 하나씩 시키고 자면 아침에 결과 나와있겠지.”*

폰을 들고 본진 챗봇한테 보냈다:

> “이제 잘건데 그거 무거운 작업을 워크스틸 모드로 돌리고 싶어. 클로드는 영상 만드는 일을 시키는 역할만 하고, 각 노드의 코덱스가 영상 만드는 토큰을 사용하는 일을 담당하게 될 거야.”

작업은 두 갈래였다. - (a) 첫 웹툰 ep1 4컷 만들기 - (b) 뉴스레터 Ep1~Ep12 짧은 영상으로 변환해서 유튜브·인스타 올리기

본진(Mac 본진)이 디렉터, 각 노드(WSL·맥미니·데스크탑·노트북)는 자기 codex 한테 명령 던지고 결과 합본만. 토큰 비싼 영상 작업은 각 노드 codex (ChatGPT) 가 부담, Claude API 는 디렉팅만.

본진은 한 마디로 알았다고 했다. 워크스틸 토글 ON, 5 대에 dynamic 모드 fan-out, 잘 자라는 인사. 나는 잤다.

## 2. 아침에 본 그림

7시 28분에 일어났다. 폰을 봤다. 결과 보고 한 통이 와 있다:

> “🍎 워크스틸 OFF 완료. 종합 보고드릴게요.”

✅ 웹툰 ep1 — 완성. 본진 codex 가 4컷 1080×1080 + 통합 2160×2160 PNG 만들어줬다. 홈페이지 1채널 publish 완료.

⚠️ 영상 4 노드 — OR 박스 2시간 지났는데 본진 회수 0건. 노드별 진단: - 🏭 맥미니: Ep2 영상 두 개(short 9:16 + long 16:9) 완성. Ep6/10 정체. - 🪟 WSL / 🖥 데스크탑 / 💻 노트북: 상태 불명.

5 대 중 1 대(맥미니)만 부분 진행. 나머지 4 대는 사라진 셈이다. 나는 다른 폰 화면을 봤다. 텔레그램의 다른 채팅창 — 5 노드 챗봇이 각자 따로 있다. 5 개 다 빨간색 오류 박스가 박혀있었다.

> “API Error: Claude Code is unable to respond, violates our Usage Policy.”

5 대 다 prompt 가 차단됐다.

## 3. 다섯 가지 다른 멈춤

본진과 같이 다시 진단했다. 멈춘 방법이 노드마다 달랐다.

**(1) 어휘 분류기 차단.** 본진이 보낸 디렉티브 본문에 “codex CLI = 영상 토큰 실행자, codex 호출해서 ffmpeg/TTS/렌더 진행”, “외부 발송”, “유튜브 Studio Playwright” 같은 어휘가 있었다. Anthropic Usage Policy 분류기는 그걸 lateral movement / 외부 발송 자동화로 분류했다. 다섯 대의 Claude Code 가 동시에 “위반” 으로 차단됐다.

본진 메모리 안에는 같은 종류 사고로 박힌 룰이 5월 25일에 있었다 — *“directive 산문에서 cyber-침입성 어휘 다발 회피”*. 룰은 있었는데 새벽에 디렉티브 쓸 때 그 룰을 reread 안 했다. 룰만 있고 forcing function (예: 발사 전 자동 어휘 grep) 이 없었다는 게 근본 원인.

**(2) Codex Mesh Mirror 응답 0.** 5 노드 codex 응답을 모아 보는 텔레그램 그룹(”Codex Mesh Mirror”) 에는 본진의 prompt 한 통만 박혀 있었다. 나머지 4 노드 codex 응답이 한 줄도 안 왔다. 노드 Claude 가 차단돼서 codex 호출을 시작도 못 한 거였다. mirror 채널은 정상 작동, 응답이 없을 뿐이라 silent fail.

**(3) 맥미니만 부분 진행.** 같은 발사인데 맥미니는 차단 직전 첫 turn 안에 Ep2 short+long mp4 두 개를 만들어 두었다. 차단이 노드마다 다른 타이밍에 시작됐던 가설. WSL/데스크탑/노트북은 첫 턴부터 차단됐고, 맥미니는 첫 턴이 빨라 작업 1개를 통과시킨 거. 같은 발사인데 결과가 달랐다는 게 인상적이다.

**(4) publish.py 의 stale URL.** 영상 1개라도 인스타에 올려보려고 본진이 Ep2 short Reels 업로드를 발사. 1차 발사가 실패했다. wait\_public 480초 timeout + 180초 재시도 timeout. 진단해보니 publish.py 안에 박힌 호스팅 URL 이 “ssamssae.github.io/daejong-page/insta-host” — 5월 25일 캐러셀 사고 때 publish\_carousel.py 만 새 도메인(”work.kangdaejong.com”) 으로 교체하고 publish.py 는 carry 박은 채로 안 정리했었다. publish\_reel.py 가 publish.py 의 URL 을 import 해 사용하니까 stale 이 그대로 폭발한 거. 본진이 그 carry 를 5월 25일에 parking-lot 19행에 박아두고 “비긴급” 으로 두었었다. 미뤄둔 carry 가 다음 발사 때 폭발했다. 한 줄 patch 후 재시도 = 성공.

로 영상 한 개 올라갔다.

**(5) Chrome singleton.** 웹툰을 Substack/네이버에도 올리려고 본진이 Playwright(브라우저 자동화) 를 launch 시도. macOS 의 Chrome.app 은 singleton 이라 새로 띄워도 내가 보던 Chrome 인스턴스에 합쳐졌다. “기존 브라우저 세션에서 여는 중입니다” — Playwright 가 browser 잡지 못해 발사 0. user-data-dir 격리도 macOS app singleton 모델은 못 넘는다.

## 4. 다섯 곳의 가장자리

오늘 새벽 멈춤은 다 처음 보는 함정이었다: - LLM provider 정책 (Anthropic 분류기) - 자체 mirror 인프라의 silent fail - 메모리에 박힌 stale carry - 같은 family 파일 간 import 의존성 - OS app singleton 모델

평소 한 대만 쓸 때는 안 보이던 것들이다. 5 대를 한 번에 발사하면 다섯 가장자리가 동시에 보인다.

그리고 한 가지 더 — 이 멈춤들 중 어느 하나도 “에이전트가 한 일을 못한” 종류는 아니었다. 다 인프라·정책·시스템 레이어의 가장자리. 에이전트는 디렉티브 받고 codex 호출하고 영상 만들 준비가 다 됐는데, 차단되고 stale 보내고 singleton 부딪쳐서 못 한 거다.

## 5. 다음에 박을 forcing function

룰만 있고 강제 메커니즘이 없으면 룰은 새벽에 깨진다. 오늘 사고 5 개 중 3 개가 “룰은 박혀있었는데 reread 안 했다” 패턴. 다음으로:

* **PreToolUse hook** — 디렉티브 본문에 cyber 어휘 (codex CLI / 외부 발송 / Studio Playwright / 우회 / bypass) 들어가면 자동 block (1번 재발 방지).
* **mirror 헬스체크** — 발사 5 분 안에 응답 0건이면 alert (2번 재발 방지).
* **carry grep 의무** — 새 작업 시작 전 parking-lot 의 carry 가 새 작업 dependency 인지 grep (4번 재발 방지).
* **family 파일 sed -i 일괄 patch** — publish.py / publish\_carousel.py / publish\_reel.py 같이 같은 함수 share 하는 파일은 한 번에 fix (4번 재발 방지).
* **Chromium binary path 설정** — Playwright MCP 가 Chrome.app 아닌 chromium-1217 binary 사용하도록 plugin config 변경 (5번 재발 방지).

## 마치며

워크스틸 토글 한 번 ON 으로 5 대를 흔든 새벽이었다. 결과는 영상 1개·웹툰 1개. 나머지는 다 가장자리에 막혔다.

근데 그 가장자리 5 개 다 봤다는 게 오늘의 진짜 결과물이다. 5 대를 흔들지 않았으면 평생 안 보였을 함정들. vibe coding 으로 5 대를 굴리는 사람이 또 있다면 이 다섯 곳에서 멈출 거다.

다음에는 forcing function 다섯 개를 박고 다시 발사해 봐야겠다.

---

*— 2026-05-26 새벽 0시 30분 ~ 아침 8시.* *웹툰 ep1: https://work.kangdaejong.com/webtoons/ep1.html* *Ep2 영상 인스타:*
