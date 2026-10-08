import { $, dateKey } from "./dom.js";
import { LocalCollection } from "./StudyTools.js";
import { BrowserStorage } from "./BrowserStorage.js";
/** Append-only completed sessions. Rewards persist separately from today's streak. */
export class ProgressJournal extends LocalCollection {
  constructor(app) {
    super(app, "cj-focus-history-v1");
    this.rewardStorage = new BrowserStorage();
    this.unlocked = this.rewardStorage.read("cj-unlocks-v1", []);
    if (!Array.isArray(this.unlocked)) this.unlocked = [];
    this.ready = false;
  }
  init() {
    this.ready = true;
    this.render();
  }
  complete(subject) {
    this.items.push({
      id: crypto.randomUUID(),
      at: Date.now(),
      day: dateKey(new Date()),
      minutes: 25,
      subject: subject.trim() || "General study",
    });
    this.save();
    this.render();
  }
  render() {
    if (!this.ready) return;
    const now = new Date(),
      today = dateKey(now),
      monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const week = [];
    for (let n = 0; n < 7; n++) {
      let d = new Date(monday);
      d.setDate(d.getDate() + n);
      week.push({
        day: dateKey(d),
        label: d.toLocaleDateString("en", { weekday: "short" }),
        sessions: this.items.filter((x) => x.day === dateKey(d)),
      });
    }
    const count = week.reduce((a, d) => a + d.sessions.length, 0);
    $("#focus-total").textContent = `${count} sessions · ${count * 25} min`;
    const chart = $("#focus-chart");
    chart.replaceChildren();
    const max = Math.max(1, ...week.map((x) => x.sessions.length));
    chart.setAttribute(
      "aria-label",
      week.map((x) => `${x.label}: ${x.sessions.length} sessions`).join(", "),
    );
    for (const day of week) {
      const col = document.createElement("div");
      col.className = "chart-column" + (day.day === today ? " is-today" : "");
      const value = document.createElement("strong");
      value.textContent = day.sessions.length;
      const rail = document.createElement("div");
      rail.className = "chart-rail";
      const bar = document.createElement("div");
      bar.className = "chart-bar";
      bar.style.height = `${(day.sessions.length / max) * 100}%`;
      rail.append(bar);
      const label = document.createElement("span");
      label.textContent = day.label;
      col.append(value, rail, label);
      chart.append(col);
    }
    const subjects = new Map();
    week.forEach((d) =>
      d.sessions.forEach((s) =>
        subjects.set(s.subject, (subjects.get(s.subject) || 0) + s.minutes),
      ),
    );
    $("#subject-time").replaceChildren();
    for (const [name, mins] of subjects) {
      const chip = document.createElement("span");
      chip.className = "subject";
      chip.textContent = `${name}: ${mins} min`;
      $("#subject-time").append(chip);
    }
    const { count: streak } = this.app.streak.calculateStreak(
      this.app.tasks.db,
      new Date(),
    );
    const sessions = this.items.filter((x) => x.day === today).length;
    const rewards = [
      {
        key: "streak3",
        title: "3-day streak",
        need: streak >= 3,
        message: "Three days of showing up. Proud of you, ganda <3",
      },
      {
        key: "streak7",
        title: "7-day streak",
        need: streak >= 7,
        message: "A whole week! Your future nurse era is looking good ♡",
      },
      {
        key: "streak14",
        title: "14-day streak",
        need: streak >= 14,
        message: "Two weeks of little wins. You deserve a happy hamster dance!",
      },
      {
        key: "focus4",
        title: "4 focus sessions in a day",
        need: sessions >= 4,
        message:
          "Four focus sessions! Rest your eyes, drink water, and celebrate.",
      },
    ];
    let changed = false;
    for (const r of rewards) {
      if (r.need && !this.unlocked.includes(r.key)) {
        this.unlocked.push(r.key);
        changed = true;
        this.app.tasks.toast(`Unlocked: ${r.title} ♡`);
      }
    }
    if (changed && !this.rewardStorage.write("cj-unlocks-v1", this.unlocked))
      this.app.tasks.toast(
        "Reward could not be saved. Browser storage may be full.",
      );
    const box = $("#unlocks");
    box.replaceChildren();
    for (const r of rewards) {
      const b = document.createElement("button");
      const open = this.unlocked.includes(r.key);
      b.className = "unlock-card" + (open ? " earned" : "");
      b.disabled = !open;
      b.textContent = `${open ? "♡" : "🔒"} ${r.title}`;
      if (open) b.onclick = () => this.app.notes.openMessage(r.message);
      box.append(b);
    }
    const tasks = this.app.tasks.db[today] || [],
      all = tasks.length && tasks.every((x) => x.done);
    $("#cheer-image").src =
      all || streak >= 7
        ? "assets/party.gif"
        : sessions >= 4
          ? "assets/smirk.gif"
          : "assets/tongue.gif";
    $("#cheer-title").textContent = all
      ? "All done, ganda!"
      : streak >= 7
        ? "Seven days of showing up!"
        : sessions >= 4
          ? "Four sessions. Look at you!"
          : "One small step is enough.";
    $("#cheer-copy").textContent = all
      ? "Your hamster is doing a happy dance."
      : sessions >= 4
        ? "Time for water and a well-earned break."
        : "u got this, ganda <3";
  }
}
