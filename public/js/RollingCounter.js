import { $, icons, dateKey } from "./dom.js";

/** RollingCounter owns counter behavior and state. */
export class RollingCounter {
  constructor(app) {
    this.app = app;
    this.timerText = this.timerText.bind(this);
    this.renderRollingTimer = this.renderRollingTimer.bind(this);
  }
  init() {}
  timerText(value) {
    return (
      String(Math.floor(value / 60)).padStart(2, "0") +
      ":" +
      String(value % 60).padStart(2, "0")
    );
  }
  renderRollingTimer(value) {
    const root = $("#timer"),
      text = this.timerText(value);
    root.setAttribute("role", "timer");
    root.setAttribute(
      "aria-label",
      Math.floor(value / 60) + " minutes " + (value % 60) + " seconds",
    );
    if (!this.columns) {
      root.replaceChildren();
      root.classList.add("rolling-counter");
      this.columns = [];
      for (const ch of text) {
        const column = document.createElement("span");
        column.setAttribute("aria-hidden", "true");
        if (ch === ":") {
          column.className = "counter-colon";
          column.textContent = ch;
        } else {
          column.className = "counter-digit";
          const number = document.createElement("span");
          number.className = "counter-number";
          number.textContent = ch;
          column.append(number);
          column.dataset.value = ch;
          this.columns.push(column);
        }
        root.append(column);
      }
      this.previous = value;
      return;
    }
    const digits = text.replace(":", "");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const direction = value < this.previous ? 1 : -1;
    this.columns.forEach((column, i) => {
      if (column.dataset.value === digits[i]) return;
      const previous = column.dataset.value;
      column.dataset.value = digits[i];
      column.getAnimations({ subtree: true }).forEach((a) => a.cancel());
      column.replaceChildren();
      const incoming = document.createElement("span");
      incoming.className = "counter-number";
      incoming.textContent = digits[i];
      column.append(incoming);
      if (reduced || !column.animate) return;
      const outgoing = document.createElement("span");
      outgoing.className = "counter-number";
      outgoing.textContent = previous;
      column.append(outgoing);
      const timing = {
        duration: 460,
        easing: "cubic-bezier(.16,1,.3,1)",
        fill: "none",
      };
      outgoing.animate(
        [
          { transform: "translateY(0)", opacity: 1 },
          { transform: "translateY(" + direction * 100 + "%)", opacity: 0 },
        ],
        timing,
      ).onfinish = () => outgoing.remove();
      incoming.animate(
        [
          { transform: "translateY(" + -direction * 100 + "%)", opacity: 0 },
          { transform: "translateY(0)", opacity: 1 },
        ],
        timing,
      );
    });
    this.previous = value;
  }
}
