// 내 시세판 — 코인 패널 (프로토타입)
// 데이터: CoinGecko 공개 API (키 불필요). "Powered by CoinGecko" 표기 의무.
// 인기 top 10 + 검색해서 관심 코인 추가(localStorage). $/fmt/dir/sign 은 app.js 공유.

const CG = "https://api.coingecko.com/api/v3";
const COIN_LS = "watchlist_coins";
const COIN_MAX = 20;

const getCoins = () => JSON.parse(localStorage.getItem(COIN_LS) || "[]");
const setCoins = (w) => localStorage.setItem(COIN_LS, JSON.stringify(w));
function addCoin(c) {
  const w = getCoins();
  if (w.find(x => x.id === c.id)) return false;
  if (w.length >= COIN_MAX) { alert(`관심 코인은 최대 ${COIN_MAX}개까지예요.`); return false; }
  w.push({ id: c.id, name: c.name, symbol: c.symbol });
  setCoins(w);
  return true;
}
function removeCoin(id) { setCoins(getCoins().filter(c => c.id !== id)); }

// --- CoinGecko fetch ---
async function fetchTopCoins(n = 10) {
  const u = `${CG}/coins/markets?vs_currency=krw&order=market_cap_desc&per_page=${n}&page=1&price_change_percentage=24h`;
  const res = await fetch(u);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
async function fetchCoinsByIds(ids) {
  if (!ids.length) return [];
  const u = `${CG}/coins/markets?vs_currency=krw&ids=${ids.join(",")}&price_change_percentage=24h`;
  const res = await fetch(u);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
async function searchCoins(q) {
  const res = await fetch(`${CG}/search?query=${encodeURIComponent(q.trim())}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.coins || []).slice(0, 10);
}

// 코인 가격은 BTC(억대)~알트(원 미만)로 폭이 커서 자릿수별로 포맷
function fmtKrw(n) {
  const x = Number(n);
  if (!isFinite(x)) return "-";
  if (x >= 100) return x.toLocaleString("ko-KR", { maximumFractionDigits: 0 });
  if (x >= 1)   return x.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
  return x.toLocaleString("ko-KR", { maximumFractionDigits: 6 });
}

function coinCard(c, pinned) {
  const fr = (c.price_change_percentage_24h ?? 0).toFixed(2);
  const d = dir(fr);
  return `
    <div class="card">
      ${pinned ? `<button class="rm" title="삭제" data-id="${c.id}">×</button>` : ""}
      <div class="nm">${c.name}</div>
      <div class="cd">${(c.symbol || "").toUpperCase()}</div>
      <div class="price">${fmtKrw(c.current_price)}<span style="font-size:12px;color:var(--gray2);font-weight:400"> 원</span></div>
      <div class="chg ${d}">${sign(fr)} ${Math.abs(fr)}%</div>
    </div>`;
}

// --- 검색 결과 ---
function renderCoinResults(list) {
  const box = $("coinResults");
  if (!list.length) { box.classList.remove("show"); box.innerHTML = ""; return; }
  box.innerHTML = list.map(c => `
    <div class="result-row" data-id="${c.id}" data-nm="${c.name}" data-sym="${c.symbol || ""}">
      <span><span class="nm">${c.name}</span><span class="cd">${(c.symbol || "").toUpperCase()}</span></span>
      <span class="add">+ 추가</span>
    </div>`).join("");
  box.classList.add("show");
  box.querySelectorAll(".result-row").forEach(row => {
    row.onclick = () => {
      if (addCoin({ id: row.dataset.id, name: row.dataset.nm, symbol: row.dataset.sym })) {
        box.classList.remove("show"); $("coinSearch").value = ""; renderCoins();
      }
    };
  });
}

// --- 렌더 (관심 코인 먼저, 그 뒤 top10 중복 제외) ---
async function renderCoins() {
  const loading = $("coinLoading");
  try {
    const pinnedIds = getCoins().map(c => c.id);
    const [top, pinned] = await Promise.all([fetchTopCoins(10), fetchCoinsByIds(pinnedIds)]);
    const topRest = top.filter(c => !pinnedIds.includes(c.id));
    $("coinCards").innerHTML =
      pinned.map(c => coinCard(c, true)).join("") +
      topRest.map(c => coinCard(c, false)).join("");
    $("coinCards").querySelectorAll(".rm").forEach(b => {
      b.onclick = () => { removeCoin(b.dataset.id); renderCoins(); };
    });
    loading.style.display = "none";
  } catch (e) {
    console.error(e);
    loading.textContent = "코인 시세를 불러오지 못했어요 (네트워크/요청제한). 잠시 후 새로고침하세요.";
    loading.style.display = "block";
  }
}

// --- 이벤트 ---
async function doCoinSearch() {
  const q = $("coinSearch").value.trim();
  if (!q) return;
  try { renderCoinResults(await searchCoins(q)); }
  catch (e) { console.error(e); alert("코인 검색 실패 — 네트워크 또는 요청 제한일 수 있어요."); }
}
$("coinSearchBtn").onclick = doCoinSearch;
$("coinSearch").addEventListener("keydown", e => { if (e.key === "Enter") doCoinSearch(); });

renderCoins();
