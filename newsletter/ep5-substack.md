<!--
Substack 발행용 Ep.5 편집본 (2026-04-30 WSL 세션 생성)
원본 골격: ep5-outline-2026-04-30.md (5막 구조 + 동사 후보 1순위 "돌리기" 픽 확정)
참고 메모리: project_hanjul_wsl_build_artifact.md (전체 타임라인 + ASC API 호출 로그) / project_yakmukja_dutchpay_ios_review_submitted.md (1막 비교 데이터)

Substack 에디터 복붙 순서:
1. 아래 "📋 TITLE" 값을 제목 필드에
2. "📋 SUBTITLE" 값을 부제 필드에
3. "📋 BODY" 아래 --- 경계선 다음부터 끝까지 에디터 본문에 복붙
4. 🖼 IMAGE: 주석이 있는 자리에 실제 이미지 업로드 (4곳)
5. 💌 SUBSCRIBE CTA 자리에 Substack 에디터 "Subscribe now" 버튼 블록 삽입 (2곳)
6. 태그: vibe-coding, claude-code, indie-dev, 앱스토어, 한줄일기, 바이브코딩, app-store-review, asc-api
-->

📋 **TITLE**
거절을 큐에서 다시 돌리는 법

📋 **SUBTITLE**
바이브코딩 뉴스레터 Ep.5 — 한줄일기 1.0 출시기, 거절과 승인 사이 30시간

---

📋 **BODY** (아래부터 끝까지 Substack 본문 복붙)

---

> 🖼 IMAGE 1 (Hero) — 위쪽: Apple 메일 두 통의 제목줄 합성. "There's an issue with your 한줄일기 (iOS) submission" 과 "Review of your 한줄일기 - AI 한줄응원 (iOS) submission is complete." 두 줄. 가운데에 "30시간" 굵은 글씨. 아래쪽: App Store 한줄일기 페이지 ₩1,900 표시 캡처. 1200×630px.

> Apple 이 우리에게 말한 건 두 번이다. 한 번은 4월 29일 새벽 6시 43분 "문제가 있다", 한 번은 4월 30일 오후 1시 29분 "심사를 끝냈다".
>
> 사이가 약 30시간이다. 그중 **27시간은 답글 한 통을 기다린 시간** 이고, 나머지 **2시간 23분은 그 답글을 포기하고 큐를 다시 돌린 결과** 다.

이 뉴스레터는 1인 인디 개발자가 Claude Code 두 대(Mac·WSL)와 함께 의사결정을 내리는 흐름의 기록이다. Ep.1 은 **만들기**(3시간에 봇 만들기), Ep.2 는 **죽이기**(24시간 만에 그 봇 드롭), Ep.3 는 **빼기**(70만원 인프라를 0원으로), Ep.4 는 **잇기**(11일치 자동발행 파이프라인) 였다. 이번 Ep.5 는 **돌리기** — 한번 보낸 심사가 거절로 돌아왔을 때, 답글이 무시당했을 때, 큐를 우리 손으로 다시 돌리는 이야기다.

마찰을 어떻게 다룰 것인가, 가 시리즈 동사들의 공통 주제다. 이번 마찰은 **앱 스토어 심사 거절** 이고, 풀어낸 도구는 **ASC API 4단계 우회** 다.

---

## 1막 — 합격 점수표가 있었다

이번 사이클이 시작된 건 4월 28일 23시 4분 KST. 한줄일기 1.0 iOS 빌드(1.1.0+4)를 App Store Connect 에 제출했다. 그 시점 머릿속에 있던 건 **이미 검증된 점수표** 였다.

바로 직전 사이클이 약먹자·더치페이 1.0 이었다. 4월 24일 제출 → 4월 25일 거절 → 4월 27일 답글 → 4월 28일 새벽 승인. **96시간짜리 한 사이클** 이 깔끔하게 닫힌 직후. 거절 사유는 Guideline 2.1 — Information Needed 였고, 데모 영상과 6항목 영문 답변을 ASC Resolution Center 에 올렸더니 ~36시간 만에 Apple 이 매뉴얼로 큐를 다시 돌리고 통과시켰다.

그 점수표를 그대로 한줄일기에 적용했다. 24~48시간 안에 결과 메일이 올 것이고, 거절이 와도 답글 한 번이면 풀린다는 가정. **같은 동물이 아니었다.**

## 2막 — China Deep Synthesis

4월 29일 06시 43분 KST. Apple 메일이 도착했다. 제목은 "There's an issue with your 한줄일기 (iOS) submission". reviewSubmission state 는 **UNRESOLVED_ISSUES**. 사유는 Guideline 5 — Legal.

본문을 풀어 읽으면: AI 한줄응원 기능이 중국 본토의 "Administrative Provisions on Deep Synthesis of Internet-based Information Services" 적용 대상이라는 판정이었다. 즉 **법령 거절** 이지 정보 요청이 아니었다. Apple 이 두 갈래 해결안을 제시했다.

1. 중국 본토 관련 전문 조언을 받아 응답할 것
2. **출시 국가에서 중국 본토를 빼는 것**

1번은 시간·비용이 큼. 한줄일기는 ₩1,900 짜리 1인 인디 앱이고, 중국 시장이 한국어 한줄일기 앱의 핵심 시장도 아니다. 결정은 즉시 (2). 175개 territory 중 1개 (CHN) 만 unavailable 처리하고 174개는 그대로 가져가기.

4월 29일 08시 5분 KST, ASC Resolution Center 답글을 보냈다.

> "We have removed China mainland from this app's availability per Guideline 5 - Legal feedback. Please re-review."

여기까지가 약먹자 사이클의 학습("답글 보내면 큐가 다시 돌아간다") 을 그대로 따른 흐름이다. 점수표대로 라면 ~36시간 안에 결과가 와야 했다.

## 3막 — Apple 이 답을 안 했다

26시간이 지났다. 메일이 안 왔다.

ASC API 로 직접 들여다봤다. `GET /v1/reviewSubmissions/7469efbf...` 의 결과는 그대로 **UNRESOLVED_ISSUES**. Apple 이 매뉴얼 액션을 안 한 것이다. 옛 reviewSubmission 이 appStoreVersion 을 점유한 채 잠겨있었고, 새 reviewSubmission `e58db9c9` 한 개가 자동 생성돼있었지만 **items=0 빈 껍데기** 였다.

정공법으로 풀어보려 했더니 모두 막혀있었다.

- POST 새 sub 에 appStoreVersion attach → **409 ITEM_PART_OF_ANOTHER_SUBMISSION** (옛 sub 가 점유 중이라 못 붙임)
- DELETE 옛 sub 의 reviewSubmissionItem → **409 Item was already submitted** (제출된 item 은 잠김)

같은 잠금을 두 각도에서 본 신호였는데, **같은 잠금이라는 인식이 늦었다.** 첫 시도에서 두 번째 시도로 넘어가는 동안 "다른 endpoint 면 풀릴 거" 라는 막연한 기대로 시간이 갔다.

여기서 알아낸 게 핵심이다. **Resolution Center 답글이 자동으로 큐를 회전시키는 거절 클래스 (Guideline 2.1) 와, 안 회전시키는 클래스 (Guideline 5 Legal) 가 다르다.** 약먹자 사이클의 점수표는 후자에 적용되지 않는다. 매뉴얼 액션을 기다려도 안 오는 카테고리가 있고, 한줄일기의 거절이 그쪽이었다.

기다리는 걸 그만두기로 했다.

## 4막 — PATCH canceled=true

> 🖼 IMAGE 2 (4단계 다이어그램) — 위에서 아래로 화살표. ① "옛 sub 7469efbf — UNRESOLVED_ISSUES (잠김)" → ② "PATCH canceled=true → CANCELING → COMPLETE (~30s)" → ③ "POST 새 sub e58db9c9 에 appStoreVersion attach → 201 OK" → ④ "PATCH submitted=true → 200 OK, WAITING_FOR_REVIEW". 단계 3·4가 빨간 강조. 1080×1350px.

우회 경로 4단계, 모두 ASC API 호출이다.

```http
# 1. 옛 sub 를 우리 손으로 취소
PATCH /v1/reviewSubmissions/7469efbf
  { "canceled": true }
# state: WAITING_FOR_REVIEW → CANCELING → COMPLETE  (~30s 폴링)

# 2. 새 sub 에 appStoreVersion 붙이기
POST /v1/reviewSubmissionItems
  { "submission": "e58db9c9", "appStoreVersion": <id> }
# 201 OK  (옛 sub 가 풀렸으니 점유 해제됨)

# 3. 새 sub 제출
PATCH /v1/reviewSubmissions/e58db9c9
  { "submitted": true }
# 200 OK, state = WAITING_FOR_REVIEW
# submittedDate = 2026-04-30T02:06:57Z (KST 11:06)
```

핵심 발견은 한 줄로 줄여진다 — **잠긴 reviewSubmission 은 PATCH `canceled: true` 로 우리가 직접 풀 수 있다.** Apple 매뉴얼 액션을 기다릴 필요가 없다.

이 한 줄짜리 결론이 어제(4월 29일) 세션에서 안 나왔던 이유는 잠금의 존재 자체를 발견 못 했기 때문이다. POST attach 가 409 로 막히고 DELETE item 이 또 409 로 막혔을 때, 두 신호가 **같은 잠금** 을 가리키고 있다는 인식이 늦었다. "endpoint 마다 다른 에러 처리" 라는 막연한 모델이 잠금 모델로 바뀌는 데 하룻밤이 걸렸다.

11시 6분 KST, 새 sub 가 WAITING_FOR_REVIEW 로 큐에 다시 들어갔다. **답글을 기다리지 않은 결정의 시각.**

> 💌 SUBSCRIBE CTA 1 — 4막 직후 첫 번째 "Subscribe now" 블록. 권장 문구: "이 시리즈는 1인 바이브코더가 만들고, 부수고, 거절당하고, 다시 보내는 과정을 주간으로 기록합니다. 무료 구독하면 새 에피소드가 도착할 때마다 메일로 옵니다."

## 5막 — 2시간 23분

13시 29분 KST, Apple 메일이 도착했다.

> "Review of your 한줄일기 - AI 한줄응원 (iOS) submission is complete."

재제출에서 승인까지 **2시간 23분**. 보통 24~48시간 큐 기준으로 이례적으로 빠르다. 같은 빌드를 같은 메타데이터로 다시 보냈고 차이는 출시 국가 1개 (CHN) 뿐이었으니, reviewer 입장에선 "전 거절 사유 해결 확인 → pass" 한 번으로 끝났을 가능성이 크다.

ASC 검증:

- appStoreState: `READY_FOR_SALE`
- appVersionState: `READY_FOR_DISTRIBUTION`
- releaseType: `AFTER_APPROVAL` (승인 즉시 자동 출시)
- 가격 (KOR): customerPrice = 1900 (proceeds 1468)

App Store URL: https://apps.apple.com/kr/app/id6764308678

이번 사이클을 시간으로 펼치면 이런 모양이다.

| 구간 | 시각 | 소요 |
|---|---|---|
| 첫 제출 | 4/28 23:04 KST | — |
| 거절 메일 | 4/29 06:43 KST | ~7시간 |
| 답글 송신 | 4/29 08:05 KST | +1시간 |
| 답글 무응답 | 4/29 08:05 ~ 4/30 11:06 | **27시간** |
| 재제출 (PATCH canceled=true) | 4/30 11:06 KST | — |
| **승인 메일** | **4/30 13:29 KST** | **2시간 23분** |

약먹자/더치페이 사이클(96시간)과 비교하면 한줄일기는 약 38시간으로 더 짧다. **이유는 자동화가 두 번째 시도에서 작동했기 때문이다.** 27시간을 잃고 2시간 23분에 따냈다.

> 거절은 한 번이지만, 다시 돌리는 건 매번이다.

---

## 메타 — 시리즈 5부작 동사

> 🖼 IMAGE 3 (시리즈 동사 표) — 5행 표를 카드 형태로. Ep.1 만들기 / Ep.2 죽이기 / Ep.3 빼기 / Ep.4 잇기 / Ep.5 **돌리기**. 마지막 행만 굵은 강조. 한 줄 부제는 outline 의 시리즈 흐름 표 그대로. 1080×1080px 정사각.

- **Ep.1 만들기 (build)** — 3시간에 봇을 만들었다
- **Ep.2 죽이기 (kill)** — 24시간 만에 그 봇을 드롭했다
- **Ep.3 빼기 (subtract)** — 라파5 25만원이 본가 맥미니로 0원이 됐다
- **Ep.4 잇기 (connect)** — 수작업 발행이 자동발행이 됐다
- **Ep.5 돌리기 (return)** — 거절을 다시 큐에 돌렸더니 두 시간 만에 통과했다

다섯 동사의 공통 주제는 그대로 **마찰을 어떻게 다룰 것인가**. 만들기·죽이기·빼기·잇기 다음에 "돌리기" 가 붙는다 — 자동화로 한 번 보낸 흐름을, 거절 신호 받고 다시 돌리는 사이클이다.

Ep.5 의 핵심 메시지는 한 줄로 줄여진다.

> **자동화의 진짜 가치는 첫 제출 성공률이 아니라, 거절 받고 두 번째 시도까지의 손 거리다.**

약먹자 사이클(Guideline 2.1)은 답글 한 통으로 자동 회전됐지만, 한줄일기 사이클(Guideline 5 Legal)은 답글이 무시되고 큐가 잠겼다. **같은 답글 패턴을 두 번째에도 자동으로 보낼 수 있어야**, 거절 클래스가 다르다는 사실을 빠르게 알아차리고 (정공법 두 번 막힘 → 우회) 4단계 ASC API 호출로 풀 수 있다.

Ep.4 가 "이미 한 결정이 무너지지 않게 하는 어려움" 이었다면 Ep.5 는 **"이미 보낸 결정이 거절당했을 때 다시 보내는 어려움"** 이다.

## 다시 쓸 체크리스트

> 🖼 IMAGE 4 (체크리스트 카드) — 4문항 큰 폰트. 모바일 가독성 우선. 1080×1350px.

다음 출시 사이클에서 거절이 또 오면 쓸 것.

1. **거절 클래스 먼저 본다.** Guideline 2.1 (Information Needed) 인지, Guideline 5 (Legal) 인지, 다른 카테고리인지. 답글 한 통으로 풀리는 클래스가 따로 있다.
2. **Resolution Center 답글 보내고 ~36시간 안에 큐 회전 안 되면, 답글 기다리는 걸 그만둔다.** 매뉴얼 액션을 기다려도 안 오는 카테고리가 있다.
3. **잠금 신호 두 개가 같은 잠금을 가리키는지 본다.** 다른 endpoint 의 409 가 같은 잠금일 가능성 먼저 의심. "endpoint 마다 다른 에러 처리" 라는 막연한 모델은 잠금 모델로 빠르게 바꾼다.
4. **PATCH canceled=true 로 우리 손으로 푼다.** 옛 sub 취소 → 새 sub attach → 새 sub submit, 4단계.

다음 사이클부터 `/submit-app` 자동화에 4단계 우회 경로를 통합할 예정. 다음에 Guideline 5 Legal 거절 만나도 답글 송신 후 36시간 타이머가 만료되면 자동으로 큐를 다시 돌리도록.

---

> 💌 SUBSCRIBE CTA 2 — 마무리 직전 두 번째 "Subscribe now" 블록. 권장 문구: "다음 회 Ep.6 — 한줄일기 Android Play Production 출시기 (Mac mini 전담 빌드 노드 + ₩1,900 유료 트랙). 같은 앱이 같은 시간에 다른 스토어로 가면 어떤 마찰이 다른 모양으로 나오는지. 놓치지 않으려면 구독."

## 다음 이야기

Ep.6 — **한줄일기 Android Play Production 출시기.** iOS 가 LIVE 된 같은 날, Android 측은 com.daejongkang.hanjul Play 패키지가 SHA-256 인증까지 끝나고 "앱 만들기" 폼만 남은 상태다. Mac mini 가 24/7 빌드·배포 전담 노드로 가동 중이고, 빌드는 거기서 ₩1,900 유료 트랙으로 나간다. 같은 앱이 같은 시간에 두 스토어를 통과할 때 마찰이 어떤 모양으로 다르게 나오는지가 다음 회 이야기.

돌리기는 끝났다. 이제 같은 빌드를 두 번째 스토어에 보낼 차례다.

---

— 강대종 (1인 바이브코더, Claude Code 동반자) / [@ssamssae](https://github.com/ssamssae)
