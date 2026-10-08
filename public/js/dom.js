export const $ = (s) => document.querySelector(s);
export const icons = () =>
  globalThis.lucide?.createIcons({ attrs: { "aria-hidden": "true" } });
export const dateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
