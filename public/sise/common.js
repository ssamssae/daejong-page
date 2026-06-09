// 내 시세판 — 공유 헬퍼 (coin.js / fx.js 가 의존)
// 주식 패널(app.js)은 serviceKey 필요라 이번 선배포 제외 — 헬퍼만 분리해 둠.
const $ = (id) => document.getElementById(id);
const fmt = (n) => { const x = Number(n); return isNaN(x) ? n : x.toLocaleString("ko-KR"); };
function dir(fltRt) { const r = parseFloat(fltRt); return r > 0 ? "up" : r < 0 ? "down" : "flat"; }
function sign(fltRt) { const r = parseFloat(fltRt); return r > 0 ? "▲" : r < 0 ? "▼" : "–"; }
