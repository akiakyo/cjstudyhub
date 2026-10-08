import { $, icons, dateKey } from "./dom.js";

/** FocusTimer owns timer behavior and state. */
export class FocusTimer {
  constructor(app) {
    this.app = app;
    this.paintTimer = this.paintTimer.bind(this);
    this.stop = this.stop.bind(this);
    this.tick = this.tick.bind(this);
  }
  init() {
    this.seconds = 1500;
    this.total = 1500;
    this.running = false;
    this.endAt = 0;
    $("#start").onclick = () => {
      if (this.running) {
        this.tick();
        this.stop();
        $("#session-note").textContent = "Paused. Take your time.";
      } else {
        if (this.seconds === 0) this.seconds = this.total;
        this.running = true;
        this.endAt = Date.now() + this.seconds * 1000;
        this.interval = setInterval(this.tick, 250);
        $("#session-note").textContent =
          this.total === 1500
            ? "Just you and your next small step."
            : "Rest your eyes. Stretch a little.";
        this.paintTimer();
      }
    };
    $("#reset").onclick = () => {
      this.stop();
      this.seconds = this.total;
      this.paintTimer();
      $("#session-note").textContent = "Ready when you are.";
    };
    document.querySelectorAll("[data-minutes]").forEach(
      (b) =>
        (b.onclick = () => {
          this.stop();
          this.total = Number(b.dataset.minutes) * 60;
          this.seconds = this.total;
          document
            .querySelectorAll("[data-minutes]")
            .forEach((x) => x.classList.toggle("active", x === b));
          $("#timer-label").textContent =
            this.total === 1500
              ? "a little focus goes a long way"
              : "breathe. stretch. recharge.";
          $("#session-note").textContent = "Ready when you are.";
          this.paintTimer();
        }),
    );
    document.addEventListener("visibilitychange", () => {
      if (this.running) this.tick();
    });
    this.paintTimer();
  }
  paintTimer() {
    this.app.counter.renderRollingTimer(this.seconds);
    $("#start").innerHTML =
      '<i data-lucide="' +
      (this.running ? "pause" : "play") +
      '" aria-hidden="true"></i> ' +
      (this.running
        ? "Pause"
        : this.seconds === this.total
          ? "Start " + (this.total === 1500 ? "focus" : "break")
          : "Resume");
    icons();
  }
  stop() {
    this.running = false;
    clearInterval(this.interval);
    this.paintTimer();
  }
  tick() {
    const previous = this.seconds;
    this.seconds = Math.max(0, Math.ceil((this.endAt - Date.now()) / 1000));
    if (this.seconds !== previous && this.seconds > 0)
      this.app.sound.playSound("tick");
    this.paintTimer();
    if (this.seconds === 0) {
      this.app.sound.playSound("complete");
      this.stop();
      $("#session-note").textContent = "Session complete. Nicely done!";
      this.app.tasks.toast("Session complete! Time for a little celebration ♡");
      $("#cheer-image").src = "assets/party.gif";
    }
  }
}
