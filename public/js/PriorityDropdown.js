import { $, icons, dateKey } from "./dom.js";

/** PriorityDropdown owns priority behavior and state. */
export class PriorityDropdown {
  constructor(app) {
    this.app = app;
    this.closePriority = this.closePriority.bind(this);
    this.choosePriority = this.choosePriority.bind(this);
    this.openPriority = this.openPriority.bind(this);
  }
  init() {
    this.priorityToggle = $("#priority-toggle");
    this.priorityOptions = $("#priority-options");
    this.options = [...document.querySelectorAll("[data-priority]")];
    this.priorityToggle.onclick = () =>
      this.priorityOptions.hidden ? this.openPriority() : this.closePriority();
    this.priorityToggle.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        this.openPriority();
      }
    });
    this.options.forEach((o, i) => {
      o.onclick = () => this.choosePriority(o.dataset.priority);
      o.addEventListener("keydown", (e) => {
        let next;
        if (e.key === "ArrowDown") next = (i + 1) % this.options.length;
        if (e.key === "ArrowUp")
          next = (i + this.options.length - 1) % this.options.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = this.options.length - 1;
        if (next !== undefined) {
          e.preventDefault();
          this.options[next].focus();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          this.closePriority(true);
        }
        if (e.key === "Tab") this.closePriority();
      });
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".custom-select")) this.closePriority();
    });
    $("#task-form").addEventListener("reset", () => {
      setTimeout(() => {
        $("#task-priority").value = "normal";
        $("#priority-value").textContent = "Normal";
        this.options.forEach((o) =>
          o.setAttribute(
            "aria-selected",
            String(o.dataset.priority === "normal"),
          ),
        );
        this.closePriority();
      }, 0);
    });
  }
  closePriority(returnFocus = false) {
    this.priorityOptions.hidden = true;
    this.priorityToggle.setAttribute("aria-expanded", "false");
    if (returnFocus) this.priorityToggle.focus();
  }
  choosePriority(value) {
    $("#task-priority").value = value;
    $("#priority-value").textContent =
      value.charAt(0).toUpperCase() + value.slice(1);
    this.options.forEach((o) =>
      o.setAttribute("aria-selected", String(o.dataset.priority === value)),
    );
    this.closePriority(true);
  }
  openPriority() {
    this.priorityOptions.hidden = false;
    this.priorityToggle.setAttribute("aria-expanded", "true");
    this.options
      .find((o) => o.dataset.priority === $("#task-priority").value)
      .focus();
  }
}
