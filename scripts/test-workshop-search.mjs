import test from "node:test";
import assert from "node:assert/strict";
import { matchesSearch } from "../src/lib/workshop-search.mjs";

test("empty queries keep products visible without choosing a category", () => {
  assert.equal(matchesSearch("한줄일기 iOS Android", "  "), true);
});
test("Korean input also matches when the keyboard emits decomposed characters", () => {
  assert.equal(
    matchesSearch("한줄일기 하루 한 줄", "한줄일기".normalize("NFD")),
    true,
  );
});
test("English and full-width input are case insensitive", () => {
  assert.equal(matchesSearch("Codex Telegram Bridge", "ＣＯＤＥＸ"), true);
});
test("all search terms must occur, in any order", () => {
  assert.equal(
    matchesSearch("Codex Telegram Bridge 오픈소스", "bridge  codex"),
    true,
  );
  assert.equal(
    matchesSearch("한줄일기 iOS Android", "한줄일기 Windows"),
    false,
  );
});
test("HTML-like and regex-like input stays literal", () => {
  assert.equal(matchesSearch("한줄일기", "<script>"), false);
  assert.equal(matchesSearch("Codex", ".*"), false);
});
