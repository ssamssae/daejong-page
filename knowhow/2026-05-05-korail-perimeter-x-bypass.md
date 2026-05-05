---
category: 크롤링
tags: [korail, playwright, PerimeterX, 봇탐지, 자동화, 예약봇]
---

# 코레일 PerimeterX 봇 탐지 우회 — 실패 사례 & 극복 패턴

- **출처:** 코레일 자동예약 봇 개발 (2026-05-05)
- **재사용 영역:** PerimeterX/HUMAN Security가 적용된 사이트 자동화

## 한 줄 요약

코레일(korail.com)은 PerimeterX를 적용해 CDP 기반 자동화를 차단한다. 핵심 우회법은 **headed 모드 + FormData.prototype.append 가로채기 + 쿨다운 대기**.

---

## 실패 사례 5가지

### ❌ 1. 구 letskorail.com API URL 직접 호출

```python
page.goto("https://www.letskorail.com/ebiz/com/nms/search/nmsTrainSearch.do?...")
```

→ **404** — 사이트가 korail.com으로 완전 이전됨 (2024년 이후)

---

### ❌ 2. 새 URL headless Playwright

```python
browser = p.chromium.launch(headless=True)
page.goto("https://www.korail.com/web_s/.../search")
```

→ **macro_err1 / CODE: -8002** (PerimeterX 탐지)

headless 모드에서 `navigator.webdriver = true`, `plugins = []` 등 fingerprint가 노출됨.

---

### ❌ 3. playwright-stealth

```python
from playwright_stealth import stealth_sync
stealth_sync(page)
```

→ **여전히 -8002** — stealth 라이브러리가 navigator.webdriver는 가리지만, PerimeterX의 `z7_` 토큰 생성 과정에서 CDP 연결 자체를 감지함.

---

### ❌ 4. 외부 Chrome + CDP 연결

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 --disable-blink-features=AutomationControlled
```
```python
browser = p.chromium.connect_over_cdp("http://localhost:9222")
```

→ **여전히 -8002** — 실제 Chrome이라도 CDP 포트가 열려있으면 PerimeterX가 감지.

---

### ❌ 5. real Chrome channel

```python
browser = p.chromium.launch(channel="chrome", headless=False)
```

→ **여전히 -8002** — `channel="chrome"`도 Playwright가 내부적으로 CDP를 사용하므로 동일.

---

## ✅ 극복 패턴

### 핵심 원인 분석

코레일이 막는 것은 두 가지:
1. **`Device=BH` 파라미터** — 코레일 JS가 headless 감지 시 Form 데이터에 `Device=BH` 삽입 → 서버가 거절
2. **IP/계정 임시 차단** — 단기간 반복 요청 시 -8002 응답, 보통 수~10분 후 해제

---

### 패턴 1. FormData.prototype.append 가로채기

```python
INIT_JS = """
const origFDAppend = FormData.prototype.append;
FormData.prototype.append = function(name, value, ...rest) {
    if (name === 'Device' && value === 'BH') value = 'WB';
    return origFDAppend.apply(this, [name, value, ...rest]);
};
const origFetch = window.fetch;
window.fetch = function(url, opts) {
    if (typeof url === 'string') url = url.replace(/Device=BH/g, 'Device=WB');
    if (opts && typeof opts.body === 'string')
        opts = {...opts, body: opts.body.replace(/Device=BH/g, 'Device=WB')};
    return origFetch.apply(this, [url, opts]);
};
"""
ctx.add_init_script(INIT_JS)
```

FormData (multipart), fetch (JSON body), XHR 세 경로 모두 치환해야 함.

---

### 패턴 2. headed 모드 필수

```python
browser = p.chromium.launch(
    headless=False,
    args=['--disable-blink-features=AutomationControlled', '--start-maximized']
)
```

headless=True 는 무조건 탐지됨. headed + FormData 치환 조합으로 통과.

---

### 패턴 3. -8002 감지 시 쿨다운 대기

```python
if 'macro_err1' in content or '-8002' in content:
    time.sleep(600)  # 10분 대기
    continue
```

반복 요청으로 IP/계정이 임시 차단되면 10분 정도 쉬면 해제됨.  
봇을 3분 간격으로 돌리면 일반적으로 차단 없이 유지됨.

---

### 패턴 4. 새 korail.com React SPA UI 자동화 흐름

구 letskorail.com의 URL 파라미터 방식이 사라졌으므로, 폼 UI를 직접 조작해야 함.

```python
# 1. 메인 페이지 이동 + 모달 닫기
page.goto("https://www.korail.com/ticket/main")
page.evaluate("() => { const b = document.querySelector('button.btn_pop-close'); if(b) b.click(); }")

# 2. 출발역 (모달 열기 → 검색 → 클릭)
page.evaluate("() => document.querySelector('a.btn_pop.btn_start').click()")
page.fill('input[name="searchTxt"]', '서울')
page.click('button.btn_sch')
# .sch_wrap li a 에서 '서울' 포함 항목 클릭

# 3. 도착역 동일 패턴 (btn_end)

# 4. 날짜 달력 (btn_brth → td 클릭 → 적용)

# 5. 검색 버튼
page.evaluate("() => document.querySelector('button.btn_lookup').click()")
```

---

### 패턴 5. React SPA 결과 파싱 — TreeWalker

React로 렌더링된 결과는 `<tr>` 구조가 없을 수 있음. JavaScript TreeWalker로 탐색:

```python
result = page.evaluate("""
() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while (node = walker.nextNode()) {
        if (node.nodeValue && node.nodeValue.includes('09:04')) {
            let el = node.parentElement;
            for (let i = 0; i < 8; i++) {
                if (!el) break;
                const txt = el.innerText || '';
                if (txt.includes('09:04') && txt.includes('KTX')) {
                    const btns = el.querySelectorAll('a, button, [role="button"]');
                    for (const btn of btns) {
                        const btxt = (btn.innerText || '').trim();
                        if (btxt.includes('일반실') || btxt.includes('예약')) {
                            const disabled = btn.disabled || btn.getAttribute('disabled') !== null;
                            if (btxt.includes('매진') || disabled) return {status: 'sold_out'};
                            return {status: 'available'};
                        }
                    }
                }
                el = el.parentElement;
            }
        }
    }
    return {status: 'not_found'};
}
""")
```

---

## 정리

| 방법 | 결과 | 이유 |
|------|------|------|
| headless + 구 URL | ❌ | 404 + headless 탐지 |
| headless + 신 URL | ❌ | CDP + Device=BH |
| headed + 신 URL | ❌ | Device=BH |
| headed + FormData 치환 | ✅ | Device=WB 전달 |
| CDP 외부 Chrome | ❌ | CDP 자체 탐지 |

**핵심 공식: headed + FormData.prototype.append 치환 + 느린 폴링(3분)**
