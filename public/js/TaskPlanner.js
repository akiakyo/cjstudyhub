import { $, icons, dateKey } from "./dom.js";
import { BrowserStorage } from "./BrowserStorage.js";

/** TaskPlanner owns tasks behavior and state. */
export class TaskPlanner {
  constructor(app) {
    this.app = app;
    this.storage = new BrowserStorage();
    this.save = this.save.bind(this);
    this.toast = this.toast.bind(this);
    this.render = this.render.bind(this);
    this.changeDay = this.changeDay.bind(this);
  }
  init() {
    this.key = "cj-study-hub-v1";
    this.db = {};
    this.storageWorks = true;
    this.db = this.storage.read(this.key, {});
    if (!this.db || Array.isArray(this.db) || typeof this.db !== "object")
      this.db = {};
    this.storageWorks = this.storage.available;
    this.selected = new Date();
    this.selected.setHours(0, 0, 0, 0);
    this.filter = "all";
    this.currentTasks = () => {
      let k = dateKey(this.selected);
      if (!Array.isArray(this.db[k])) this.db[k] = [];
      return this.db[k];
    };
    $("#add-open").onclick = () => {
      $("#task-form").hidden = false;
      $("#task-title").focus();
    };
    $("#cancel").onclick = () => {
      $("#task-form").hidden = true;
      $("#task-form").reset();
    };
    $("#task-form").onsubmit = (e) => {
      e.preventDefault();
      let title = $("#task-title").value.trim();
      if (!title) {
        $("#task-title").focus();
        return;
      }
      this.app.tasks.currentTasks().push({
        id:
          globalThis.crypto?.randomUUID?.() ||
          String(Date.now() + Math.random()),
        title,
        subject: $("#task-subject").value.trim(),
        priority: $("#task-priority").value,
        done: false,
      });
      this.save();
      this.filter = "all";
      document
        .querySelectorAll("[data-filter]")
        .forEach((b) =>
          b.classList.toggle("active", b.dataset.filter === this.filter),
        );
      $("#task-form").reset();
      $("#task-form").hidden = true;
      this.render();
      this.toast("Added to your game plan ✿");
    };
    document.querySelectorAll("[data-filter]").forEach(
      (b) =>
        (b.onclick = () => {
          this.filter = b.dataset.filter;
          document
            .querySelectorAll("[data-filter]")
            .forEach((x) => x.classList.toggle("active", x === b));
          this.render();
        }),
    );
    $("#prev-day").onclick = () => this.changeDay(-1);
    $("#next-day").onclick = () => this.changeDay(1);
    $("#today").onclick = () => {
      this.selected = new Date();
      this.selected.setHours(0, 0, 0, 0);
      this.render();
    };
    this.render();
    if (!this.storageWorks)
      this.toast("Browser storage is unavailable. Keep this tab open.");
  }
  save() {
    this.storageWorks = this.storage.write(this.key, this.db);
    if (!this.storageWorks)
      this.toast("Browser storage is unavailable. Keep this tab open.");
  }
  toast(message) {
    $("#toast").textContent = message;
    $("#toast").classList.add("show");
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(
      () => $("#toast").classList.remove("show"),
      3500,
    );
  }
  render() {
    this.app.streak.renderStreak();
    let tasks = this.currentTasks(),
      done = tasks.filter((t) => t.done).length;
    $("#day-title").textContent =
      dateKey(this.selected) === dateKey(new Date())
        ? "Today"
        : this.selected.toLocaleDateString("en", { weekday: "long" });
    $("#date-label").textContent = this.selected.toLocaleDateString("en", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    $("#today").style.display =
      dateKey(this.selected) === dateKey(new Date()) ? "none" : "block";
    $("#task-count").textContent = tasks.length;
    $("#progress-text").textContent = `${done} of ${tasks.length} done`;
    $("#progress-fill").style.width =
      (tasks.length ? (done / tasks.length) * 100 : 0) + "%";
    $("#tasks").replaceChildren();
    const shown = tasks.filter(
      (t) =>
        this.filter === "all" || (this.filter === "done" ? t.done : !t.done),
    );
    if (!shown.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      const img = document.createElement("img");
      img.src = "assets/smirk.gif";
      img.alt = "Your hamster study buddy";
      const h = document.createElement("h3");
      h.textContent = tasks.length
        ? "Nothing here for now."
        : "A fresh page, a fresh start.";
      const p = document.createElement("p");
      p.textContent = tasks.length
        ? "Try another filter to see your tasks."
        : "Add your first study task. Your hamster is rooting for you.";
      empty.append(img, h, p);
      $("#tasks").append(empty);
    }
    for (const task of shown) {
      const row = document.createElement("div");
      row.className = "task" + (task.done ? " done" : "");
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = task.done;
      check.setAttribute(
        "aria-label",
        `Mark ${task.title} ${task.done ? "incomplete" : "complete"}`,
      );
      check.onchange = () => {
        task.done = check.checked;
        this.save();
        this.render();
        if (task.done) this.toast("One little win! Proud of you ♡");
      };
      const info = document.createElement("div");
      info.className = "task-info";
      const title = document.createElement("div");
      title.className = "task-title";
      title.textContent = task.title;
      const meta = document.createElement("div");
      meta.className = "task-meta";
      if (task.subject) {
        const subject = document.createElement("span");
        subject.className = "subject";
        subject.textContent = task.subject;
        meta.append(subject);
      }
      const priority = document.createElement("span");
      priority.className = "priority-" + task.priority;
      priority.textContent =
        task.priority === "high"
          ? "♡ High priority"
          : task.priority === "low"
            ? "Low priority"
            : "Normal priority";
      if (task.priority === "high")
        priority.innerHTML =
          '<i data-lucide="flag" aria-hidden="true"></i> High priority';
      meta.append(priority);
      info.append(title, meta);
      const del = document.createElement("button");
      del.className = "delete";
      del.innerHTML = '<i data-lucide="trash-2" aria-hidden="true"></i>';
      del.setAttribute("aria-label", `Delete ${task.title}`);
      del.onclick = () => {
        this.db[dateKey(this.selected)] = tasks.filter((t) => t.id !== task.id);
        this.save();
        this.render();
        this.toast("Task removed");
      };
      row.append(check, info, del);
      $("#tasks").append(row);
    }
    const allDone = tasks.length > 0 && done === tasks.length;
    $("#cheer-image").src = "assets/party.gif";
    $("#cheer-title").textContent = allDone
      ? "Look at you go, CJ!"
      : "You can do hard things.";
    $("#cheer-copy").textContent = allDone
      ? "All tasks done. You earned a happy dance."
      : "And yes, taking a break counts too.";
    this.app.progress?.render();
    icons();
  }
  changeDay(n) {
    this.selected.setDate(this.selected.getDate() + n);
    $("#task-form").hidden = true;
    this.render();
  }
}
