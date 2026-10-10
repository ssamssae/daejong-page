import test from "node:test";
import assert from "node:assert/strict";
import {
  counterUrl,
  loadVisitorCount,
  shouldCount,
} from "../src/lib/visitor-counter.mjs";

function fakeEl(site = "daejong-page") {
  const b = [{ textContent: "-" }, { textContent: "-" }];
  return { dataset: { visitors: site }, querySelectorAll: () => b, b };
}

function recorder(response) {
  const calls = [];
  const fetchImpl = async (url, opts) => {
    calls.push({ url, opts });
    if (response instanceof Error) throw response;
    return response;
  };
  return { calls, fetchImpl };
}

const okResponse = (data) => ({ ok: true, json: async () => data });

test("only the production host counts", () => {
  assert.equal(shouldCount("work.kangdaejong.com"), true);
  for (const host of ["localhost", "127.0.0.1", "", "kangdaejong.com", "work.kangdaejong.com.evil.test"]) {
    assert.equal(shouldCount(host), false, host);
  }
});

test("non-production hosts make zero network requests", async () => {
  for (const hostname of ["localhost", "127.0.0.1", "ssamssae.github.io"]) {
    const { calls, fetchImpl } = recorder(okResponse({ today: 1, total: 2 }));
    const el = fakeEl();
    assert.equal(await loadVisitorCount(el, { hostname, fetchImpl }), false);
    assert.equal(calls.length, 0);
    assert.deepEqual(el.b.map((x) => x.textContent), ["-", "-"]);
  }
});

test("production host fetches once and fills today and total", async () => {
  const { calls, fetchImpl } = recorder(okResponse({ site: "daejong-page", date: "2026-10-10", total: 1234, today: 5 }));
  const el = fakeEl();
  assert.equal(await loadVisitorCount(el, { hostname: "work.kangdaejong.com", fetchImpl }), true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, counterUrl("daejong-page"));
  assert.equal(calls[0].url, "https://visitor-counter.ssamssae.workers.dev/count?site=daejong-page");
  assert.deepEqual(el.b.map((x) => x.textContent), ["5", "1,234"]);
});

test("failures keep the dash placeholders", async () => {
  const cases = [
    new Error("offline"),
    { ok: false, json: async () => ({ today: 1, total: 1 }) },
    okResponse({ today: "1", total: 2 }),
    okResponse({ error: "bad" }),
    { ok: true, json: async () => { throw new SyntaxError("bad json"); } },
  ];
  for (const response of cases) {
    const { fetchImpl } = recorder(response);
    const el = fakeEl();
    assert.equal(await loadVisitorCount(el, { hostname: "work.kangdaejong.com", fetchImpl }), false);
    assert.deepEqual(el.b.map((x) => x.textContent), ["-", "-"]);
  }
});
