import { $, icons } from "./dom.js";
/** Countdown based on wall time, with exactly one history entry per completed focus. */
export class FocusTimer {
  constructor(app) {
    this.app = app;
    this.tick = this.tick.bind(this);
  }
  init() {
    this.seconds = 1500;
    this.total = 1500;
    this.running = false;
    this.endAt = 0;
    this.sessionSubject = "";
    $("#start").onclick = () => this.toggle();
    $("#reset").onclick = () => {
      this.stop();
      this.seconds = this.total;
      this.sessionSubject = "";
      this.app.experience.focusMode(false);
      this.paintTimer();
      $("#session-note").textContent = "Ready when you are.";
    };
    document.querySelectorAll("[data-minutes]").forEach(
      (b) =>
        (b.onclick = () => {
          this.stop();
          this.total = Number(b.dataset.minutes) * 60;
          this.seconds = this.total;
          this.sessionSubject = "";
          this.app.experience.focusMode(false);
          document
            .querySelectorAll("[data-minutes]")
            .forEach((x) => x.classList.toggle("active", x === b));
          $("#timer-label").textContent =
            this.total === 1500
              ? "a little focus goes a long way"
              : "breathe. stretch. recharge.";
          $("#session-note").textContent =
            this.total === 1500
              ? "Ready when you are."
              : this.breakSuggestion();
          this.paintTimer();
        }),
    );
    document.addEventListener("visibilitychange", () => {
      if (this.running) this.tick();
    });
    this.paintTimer();
  }
  toggle() {
    if (this.running) {
      this.tick();
      if (this.running) {
        this.stop();
        $("#session-note").textContent = "Paused. Take your time.";
      }
    } else {
      if (this.seconds === 0) this.seconds = this.total;
      if (this.seconds === this.total)
        this.sessionSubject = $("#focus-subject").value;
      this.running = true;
      this.endAt = Date.now() + this.seconds * 1000;
      this.interval = setInterval(this.tick, 250);
      $("#session-note").textContent =
        this.total === 1500
          ? "Just you and your next small step."
          : this.breakSuggestion();
      if (this.total === 1500) this.app.experience.focusMode(true);
      this.paintTimer();
    }
  }
  breakSuggestion() {
    const choices = [
      "Drink water, ganda ♡",
      "Stretch your neck gently. Relax your shoulders.",
      "Rest your eyes and look away from the screen.",
      "Text aky. A tiny hello counts too.",
    ];
    return choices[Math.floor(Math.random() * choices.length)];
  }
  paintTimer() {
    this.app.counter.renderRollingTimer(this.seconds);
    const markup =
      `<i data-lucide="${this.running ? "pause" : "play"}" aria-hidden="true"></i> ${this.running ? "Pause" : this.seconds === this.total ? "Start " + (this.total === 1500 ? "focus" : "break") : "Resume"}`;
    if (markup !== this.startMarkup) {
      $("#start").innerHTML = markup;
      this.startMarkup = markup;
      icons();
    }
    this.app.experience.syncTimer(this);
  }
  stop() {
    this.running = false;
    clearInterval(this.interval);
    this.paintTimer();
  }
  tick() {
    if (!this.running) return;
    const previous = this.seconds;
    this.seconds = Math.max(0, Math.ceil((this.endAt - Date.now()) / 1000));
    if (this.seconds === previous && this.seconds > 0) return;
    if (this.seconds !== previous && this.seconds > 0)
      this.app.sound.playSound("tick");
    this.paintTimer();
    if (this.seconds === 0) {
      this.stop();
      this.app.sound.playSound("complete");
      if (this.total === 1500) this.app.progress.complete(this.sessionSubject);
      this.app.experience.focusMode(false);
      $("#session-note").textContent =
        "Session complete. " + this.breakSuggestion();
      this.app.tasks.toast("Session complete! Time for a little celebration ♡");
      $("#cheer-image").src = "assets/party.gif";
    }
  }
}
