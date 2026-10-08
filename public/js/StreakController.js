import { $, icons, dateKey } from "./dom.js";

/** StreakController owns streak behavior and state. */
export class StreakController {
  constructor(app) {
    this.app = app;
    this.calculateStreak = this.calculateStreak.bind(this);
    this.renderStreak = this.renderStreak.bind(this);
  }
  init() {
    this.lastDay = dateKey(new Date());
    this.streakButton = $("#streak");
    this.streakButton.onclick = () => {
      const expanded =
        this.streakButton.getAttribute("aria-expanded") !== "true";
      this.streakButton.setAttribute("aria-expanded", String(expanded));
      $(".streak-wrap").classList.toggle("expanded", expanded);
    };
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".streak-wrap")) {
        this.streakButton.setAttribute("aria-expanded", "false");
        $(".streak-wrap").classList.remove("expanded");
      }
    });
    this.streakButton.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.streakButton.setAttribute("aria-expanded", "false");
        $(".streak-wrap").classList.remove("expanded");
        this.streakButton.blur();
      }
    });
  }
  calculateStreak(data, now = new Date()) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    const complete = (d) =>
      Array.isArray(data[dateKey(d)]) && data[dateKey(d)].some((t) => t.done);
    const todayDone = complete(day);
    if (!todayDone) day.setDate(day.getDate() - 1);
    let count = 0;
    while (complete(day)) {
      count++;
      day.setDate(day.getDate() - 1);
    }
    return { count, todayDone };
  }
  renderStreak() {
    const { count, todayDone } = this.calculateStreak(this.app.tasks.db);
    $("#streak-count").textContent = count;
    $("#streak-detail").textContent =
      count + " day" + (count === 1 ? "" : "s") + " streak";
    $("#streak").setAttribute(
      "aria-label",
      count + " day" + (count === 1 ? "" : "s") + " streak",
    );
    $("#streak").classList.toggle("lit", count > 0);
    $("#streak-hint").textContent = todayDone
      ? "You showed up today ♡"
      : count
        ? "Complete a task today to keep it going."
        : "Complete a task today to start.";
  }
}
