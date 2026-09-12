import { matchesSearch } from "../lib/workshop-search.mjs";

export function initCatalog(root: HTMLElement) {
  const controls = root.querySelector<HTMLElement>("[data-catalog-controls]");
  if (controls) controls.hidden = false;
  const input = root.querySelector<HTMLInputElement>("[data-catalog-search]");
  const buttons = [
    ...root.querySelectorAll<HTMLButtonElement>("[data-filter]"),
  ];
  const items = [...root.querySelectorAll<HTMLElement>("[data-catalog-item]")];
  const count = root.querySelector<HTMLElement>("[data-catalog-count]");
  const empty = root.querySelector<HTMLElement>("[data-catalog-empty]");
  let category = "all";
  const update = () => {
    let visible = 0;
    items.forEach((item) => {
      const match =
        (category === "all" || item.dataset.kind === category) &&
        matchesSearch(item.dataset.search ?? "", input?.value ?? "");
      item.hidden = !match;
      if (match) visible++;
    });
    buttons.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.filter === category),
      ),
    );
    if (count) count.textContent = `${visible}개의 제품`;
    if (empty) empty.hidden = visible !== 0;
  };
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      category = button.dataset.filter ?? "all";
      update();
    }),
  );
  input?.addEventListener("input", update);
  root.querySelector("[data-catalog-reset]")?.addEventListener("click", () => {
    category = "all";
    if (input) input.value = "";
    update();
    input?.focus();
  });
  update();
}
