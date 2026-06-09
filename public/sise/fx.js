// 내 시세판 — 환율 패널 (프로토타입)
// 데이터: Frankfurter (api.frankfurter.dev) — 유럽중앙은행(ECB) 기준, 키 불필요.
// EUR 기준 교차환율로 KRW 환산(정밀도 ↑). 최근 영업일 2개로 등락 계산. $/fmt/dir/sign 은 app.js 공유.

const FX = "https://api.frankfurter.dev/v1";
const FX_CCY = [
  { code: "USD", label: "미국 달러", unit: 1,   flag: "🇺🇸" },
  { code: "JPY", label: "일본 엔",   unit: 100, flag: "🇯🇵" },
  { code: "EUR", label: "유로",      unit: 1,   flag: "🇪🇺" },
  { code: "CNY", label: "중국 위안", unit: 1,   flag: "🇨🇳" },
];

// EUR 기준 환율표(r)에서 1단위(JPY는 100)당 KRW 가격
function krwPer(r, ccy) {
  return ccy.code === "EUR" ? ccy.unit * r.KRW : (ccy.unit * r.KRW) / r[ccy.code];
}

async function renderFx() {
  const loading = $("fxLoading");
  try {
    const symbols = ["KRW", ...FX_CCY.filter(c => c.code !== "EUR").map(c => c.code)].join(",");
    const start = new Date(Date.now() - 10 * 864e5).toISOString().slice(0, 10);
    const res = await fetch(`${FX}/${start}..?base=EUR&symbols=${symbols}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const dates = Object.keys(data.rates).sort();
    const last = data.rates[dates[dates.length - 1]];
    const prev = data.rates[dates[dates.length - 2]] || last;
    $("fxMeta").textContent = `기준일 ${dates[dates.length - 1]} · ECB`;
    $("fxCards").innerHTML = FX_CCY.map(c => {
      const cur = krwPer(last, c);
      const pv = krwPer(prev, c);
      const fr = (pv ? ((cur - pv) / pv) * 100 : 0).toFixed(2);
      const d = dir(fr);
      return `
        <div class="card">
          <div class="nm">${c.flag} ${c.label}</div>
          <div class="cd">${c.unit > 1 ? c.unit + " " : ""}${c.code} → KRW</div>
          <div class="price">${fmt(Math.round(cur))}<span style="font-size:12px;color:var(--gray2);font-weight:400"> 원</span></div>
          <div class="chg ${d}">${sign(fr)} ${Math.abs(fr)}%</div>
        </div>`;
    }).join("");
    loading.style.display = "none";
  } catch (e) {
    console.error(e);
    loading.textContent = "환율을 불러오지 못했어요 (네트워크). 잠시 후 새로고침하세요.";
    loading.style.display = "block";
  }
}

renderFx();
