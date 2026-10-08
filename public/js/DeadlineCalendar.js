import { $, icons, dateKey } from "./dom.js";
import { BrowserStorage } from "./BrowserStorage.js";

/** Editable deadline calendar; data stays in the current browser. */
export class DeadlineCalendar {
  constructor(app) {
    this.app = app;
    this.storage = new BrowserStorage();
    this.key = "cj-deadlines-v1";
    const now = new Date();
    this.month = new Date(now.getFullYear(), now.getMonth(), 1);
    this.currentDay = dateKey(now);
    this.selected = null;
    this.editing = null;
  }
  static seeds() {
    return [
      {
        id: "calc-2026",
        title: "CALC 2 - QUIZ 2 & 3",
        date: "2026-04-28",
        color: "red",
        done: false,
      },
      {
        id: "pathfit-2026",
        title: "PATHFIT 2 - GROUPINGS DL",
        date: "2026-04-30",
        color: "blue",
        done: false,
      },
      {
        id: "vgd-2026",
        title: "VGD - UI DL",
        date: "2026-04-30",
        color: "blue",
        done: false,
      },
      {
        id: "physics-2026",
        title: "PHYSICS FTF",
        date: "2026-06-04",
        color: "blue",
        done: false,
      },
    ];
  }
  init() {
    const saved = this.storage.read(this.key, null);
    this.items = Array.isArray(saved)
      ? saved.filter(
          (x) =>
            x &&
            typeof x.title === "string" &&
            DeadlineCalendar.validDate(x.date),
        )
      : DeadlineCalendar.seeds();
    $("#deadline-prev").onclick = () => this.moveMonth(-1);
    $("#deadline-next").onclick = () => this.moveMonth(1);
    $("#deadline-today").onclick = () => {
      const now = new Date();
      this.month = new Date(now.getFullYear(), now.getMonth(), 1);
      this.selected = dateKey(now);
      this.render();
    };
    $("#deadline-all").onclick = () => {
      this.selected = null;
      this.render();
    };
    $("#deadline-add").onclick = () => this.openEditor();
    $("#deadline-close").onclick = () => $("#deadline-dialog").close();
    $("#deadline-cancel").onclick = () => $("#deadline-dialog").close();
    $("#deadline-dialog").addEventListener("click", (e) => {
      if (e.target === $("#deadline-dialog")) {
        const r = e.target.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          e.target.close();
      }
    });
    $("#deadline-form").onsubmit = (e) => {
      e.preventDefault();
      this.submit();
    };
    $("#day-deadlines-close").onclick = () => $("#day-deadlines-dialog").close();
    $("#day-deadlines-add").onclick = () => this.openEditor();
    $("#day-deadlines-dialog").addEventListener("click", e => {
      if (e.target === e.currentTarget) {
        const r = e.currentTarget.getBoundingClientRect();
        if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.currentTarget.close();
      }
    });
    this.render();
    const syncDate = () => {
      const now = new Date(), today = dateKey(now);
      if (today === this.currentDay) return;
      const followingCurrentMonth = this.month.getFullYear() === Number(this.currentDay.slice(0, 4)) && this.month.getMonth() === Number(this.currentDay.slice(5, 7)) - 1;
      this.currentDay = today;
      if (followingCurrentMonth) this.month = new Date(now.getFullYear(), now.getMonth(), 1);
      this.render();
    };
    setInterval(syncDate, 30000);
    document.addEventListener("visibilitychange", syncDate);
  }
  static validDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
      return false;
    const [y, m, d] = value.split("-").map(Number),
      parsed = new Date(y, m - 1, d);
    return dateKey(parsed) === value;
  }
  static gridDates(month) {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }
  moveMonth(delta) {
    this.month = new Date(
      this.month.getFullYear(),
      this.month.getMonth() + delta,
      1,
    );
    this.selected = null;
    this.render();
  }
  save() {
    if (!this.storage.write(this.key, this.items))
      this.app.tasks.toast("Deadlines could not be saved. Keep this tab open.");
  }
  openEditor(item = null) {
    this.editing = item?.id || null;
    $("#deadline-form").reset();
    $("#deadline-editor-title").textContent = item
      ? "Edit deadline"
      : "Add a deadline";
    $("#deadline-title").value = item?.title || "";
    $("#deadline-date").value =
      item?.date || this.selected || dateKey(new Date());
    const color = ["pink", "red", "blue", "purple"].includes(item?.color)
      ? item.color
      : "pink";
    document.querySelector(`[name=deadline-color][value=${color}]`).checked =
      true;
    $("#deadline-dialog").showModal();
    $("#deadline-title").focus();
  }
  submit() {
    const title = $("#deadline-title").value.trim(),
      date = $("#deadline-date").value;
    if (!title || !DeadlineCalendar.validDate(date)) return;
    const color = document.querySelector("[name=deadline-color]:checked").value;
    const item = this.items.find((x) => x.id === this.editing);
    if (item) Object.assign(item, { title, date, color });
    else
      this.items.push({
        id:
          globalThis.crypto?.randomUUID?.() ||
          String(Date.now() + Math.random()),
        title,
        date,
        color,
        done: false,
      });
    this.save();
    this.month = new Date(
      Number(date.slice(0, 4)),
      Number(date.slice(5, 7)) - 1,
      1,
    );
    this.selected = date;
    $("#deadline-dialog").close();
    this.render();
    this.app.tasks.toast(item ? "Deadline updated" : "Deadline added");
  }
  render() {
    $("#deadline-month").textContent = this.month.toLocaleDateString("en", {
      month: "long",
      year: "numeric",
    });
    const grid = $("#deadline-grid");
    grid.replaceChildren();
    for (const date of DeadlineCalendar.gridDates(this.month)) {
      const key = dateKey(date),
        dayItems = this.items.filter((x) => x.date === key);
      const button = document.createElement("button");
      button.className = "calendar-day";
      button.classList.toggle(
        "outside",
        date.getMonth() !== this.month.getMonth(),
      );
      button.classList.toggle("selected", key === this.selected);
      button.classList.toggle("is-today", key === dateKey(new Date()));
      button.setAttribute("aria-pressed", String(key === this.selected));
      button.setAttribute(
        "aria-label",
        date.toLocaleDateString("en", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }) +
          ", " +
          dayItems.length +
          " deadline" +
          (dayItems.length === 1 ? "" : "s"),
      );
      const number = document.createElement("span");
      number.className = "calendar-number";
      number.textContent = date.getDate();
      button.append(number);
      for (const item of dayItems.slice(0, 2)) {
        const chip = document.createElement("span");
        chip.className =
          "calendar-chip " + this.color(item) + (item.done ? " completed" : "");
        chip.textContent = item.title;
        button.append(chip);
      }
      if (dayItems.length > 2) {
        const more = document.createElement("small");
        more.textContent = "+" + (dayItems.length - 2) + " more";
        button.append(more);
      }
      button.onclick = () => {
        this.selected = key;
        this.render();
        $("#day-deadlines-dialog").showModal();
        this.renderDay();
      };
      grid.append(button);
    }
    const list = $("#deadline-list");
    list.replaceChildren();
    $("#deadline-list-title").textContent = this.selected
      ? new Date(this.selected + "T12:00:00").toLocaleDateString("en", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "All deadlines";
    const items = this.items
      .filter((x) => !this.selected || x.date === this.selected)
      .sort((a, b) => a.date.localeCompare(b.date));
    this.renderList(list, items);
    if ($("#day-deadlines-dialog").open) this.renderDay();
    icons();
  }
  renderDay() {
    $("#day-deadlines-title").textContent = new Date(this.selected + "T12:00:00").toLocaleDateString("en", {weekday:"long", month:"long", day:"numeric", year:"numeric"});
    const items = this.items.filter(x => x.date === this.selected);
    $("#day-deadlines-count").textContent = `${items.length} deadline${items.length === 1 ? "" : "s"} · ${items.filter(x=>x.done).length} complete`;
    this.renderList($("#day-deadlines-list"), items);
    icons();
  }
  renderList(list, items) {
    list.replaceChildren();
    if (!items.length) {
      const p = document.createElement("p");
      p.className = "deadline-empty";
      p.textContent = "No deadlines here. Add one when you need it.";
      list.append(p);
    }
    for (const item of items) {
      const row = document.createElement("div");
      row.className = "deadline-row" + (item.done ? " done" : "");
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = item.done;
      check.setAttribute(
        "aria-label",
        "Mark " + item.title + (item.done ? " incomplete" : " complete"),
      );
      check.onchange = () => {
        item.done = check.checked;
        this.save();
        this.render();
      };
      const info = document.createElement("div");
      info.className = "deadline-info";
      const title = document.createElement("strong");
      title.textContent = item.title;
      const meta = document.createElement("span");
      const overdue = item.date < dateKey(new Date()) && !item.done;
      meta.textContent =
        new Date(item.date + "T12:00:00").toLocaleDateString("en", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }) +
        " · " +
        (item.done
          ? "Completed"
          : overdue
            ? "Past due"
            : item.date === dateKey(new Date())
              ? "Due today"
              : "Upcoming");
      meta.className = overdue ? "past-due" : "";
      info.append(title, meta);
      const edit = document.createElement("button");
      edit.className = "deadline-action";
      edit.innerHTML = '<i data-lucide="pencil" aria-hidden="true"></i>';
      edit.setAttribute("aria-label", "Edit " + item.title);
      edit.onclick = () => this.openEditor(item);
      const remove = document.createElement("button");
      remove.className = "deadline-action";
      remove.innerHTML = '<i data-lucide="trash-2" aria-hidden="true"></i>';
      remove.setAttribute("aria-label", "Delete " + item.title);
      remove.onclick = () => {
        this.items = this.items.filter((x) => x.id !== item.id);
        this.save();
        this.render();
      };
      row.append(check, info, edit, remove);
      list.append(row);
    }
    icons();
  }
  color(item) {
    return ["pink", "red", "blue", "purple"].includes(item.color)
      ? item.color
      : "pink";
  }
}
