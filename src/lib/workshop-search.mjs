/** Match all literal terms, including decomposed Korean and full-width input. */
export function matchesSearch(text, query) {
  const normalize = (value) =>
    value.normalize("NFKC").toLocaleLowerCase("ko").trim();
  const haystack = normalize(text);
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}
