import { $, icons } from "./dom.js";
/** Custom subject picker: native select holds the value, clay listbox handles interaction. */
export class SubjectDropdown {
  init() {
    this.select = $("#card-filter");
    this.toggle = $("#subject-toggle");
    this.menu = $("#subject-options");
    this.toggle.onclick = () => this.setOpen(this.menu.hidden);
    this.toggle.onkeydown = (e) => {
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
        e.preventDefault();
        this.setOpen(true, e.key === "ArrowUp" || e.key === "End");
      } else if (e.key === "Escape") this.setOpen(false);
    };
    this.menu.onkeydown = (e) => {
      const options = [...this.menu.querySelectorAll("button")],
        index = options.indexOf(document.activeElement);
      if (e.key === "Escape") {
        e.preventDefault();
        this.setOpen(false);
        this.toggle.focus();
      } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
        e.preventDefault();
        const next =
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? options.length - 1
              : (index + (e.key === "ArrowDown" ? 1 : -1) + options.length) %
                options.length;
        options[next]?.focus();
      } else if (e.key === "Tab") this.setOpen(false);
    };
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".subject-picker")) this.setOpen(false);
    });
    document.addEventListener("focusin", (e) => {
      if (!e.target.closest(".subject-picker")) this.setOpen(false);
    });
    this.render();
  }
  setOpen(open, last = false) {
    this.menu.hidden = !open;
    this.toggle.setAttribute("aria-expanded", String(open));
    if (open) {
      const options = [...this.menu.querySelectorAll("button")];
      const selected = this.menu.querySelector("[aria-selected=true]");
      (last ? options.at(-1) : selected || options[0])?.focus();
    }
  }
  render() {
    if (!this.menu) return;
    $("#subject-value").textContent =
      this.select.selectedOptions[0]?.textContent || "All subjects";
    this.menu.replaceChildren();
    for (const option of this.select.options) {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "option");
      b.setAttribute(
        "aria-selected",
        String(option.value === this.select.value),
      );
      const label = document.createElement("span");
      label.textContent = option.textContent;
      b.append(label);
      if (option.value === this.select.value) {
        const check = document.createElement("i");
        check.dataset.lucide = "check";
        check.setAttribute("aria-hidden", "true");
        b.append(check);
      }
      b.onclick = () => {
        this.select.value = option.value;
        this.select.dispatchEvent(new this.select.ownerDocument.defaultView.Event("change", { bubbles: true }));
        this.setOpen(false);
        this.toggle.focus();
      };
      this.menu.append(b);
    }
    icons();
  }
}
