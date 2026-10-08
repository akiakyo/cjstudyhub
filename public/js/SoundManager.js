import { $, icons, dateKey } from "./dom.js";

/** SoundManager owns sound behavior and state. */
export class SoundManager {
  constructor(app) {
    this.app = app;
    this.paintSound = this.paintSound.bind(this);
    this.unlockAudio = this.unlockAudio.bind(this);
    this.playSound = this.playSound.bind(this);
  }
  init() {
    this.audioContext = null;
    this.soundEnabled = true;
    try {
      this.soundEnabled = localStorage.getItem("cj-sound") !== "off";
    } catch {}
    $("#sound-toggle").onclick = () => {
      this.soundEnabled = !this.soundEnabled;
      try {
        localStorage.setItem("cj-sound", this.soundEnabled ? "on" : "off");
      } catch {}
      this.paintSound();
      if (this.soundEnabled) this.playSound();
    };
    document.addEventListener("pointerdown", this.unlockAudio, {
      passive: true,
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") this.unlockAudio();
    });
    document.addEventListener(
      "click",
      (e) => {
        const button = e.target.closest("button,a,input[type=checkbox]");
        if (
          !button ||
          button.id === "sound-toggle" ||
          button.id === "love-no" ||
          button.id === "love-yes"
        )
          return;
        this.playSound(
          ["start", "reset"].includes(button.id) ||
            button.hasAttribute("data-minutes")
            ? "timer"
            : "click",
        );
      },
      true,
    );
    this.paintSound();
  }
  paintSound() {
    const b = $("#sound-toggle");
    b.setAttribute("aria-pressed", String(this.soundEnabled));
    b.setAttribute(
      "aria-label",
      this.soundEnabled ? "Mute sounds" : "Enable sounds",
    );
    b.innerHTML =
      '<i data-lucide="' +
      (this.soundEnabled ? "volume-2" : "volume-x") +
      '" aria-hidden="true"></i>';
    icons();
  }
  unlockAudio() {
    if (!this.soundEnabled) return;
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      this.audioContext ||= new C();
      if (this.audioContext.state === "suspended")
        this.audioContext.resume().catch(() => {});
    } catch {}
  }
  playSound(kind = "click") {
    if (!this.soundEnabled) return;
    this.unlockAudio();
    if (!this.audioContext || this.audioContext.state !== "running") return;
    const patterns = {
      click: [
        [740, 0, 0.075],
        [1040, 0.04, 0.08],
      ],
      dodge: [
        [620, 0, 0.07],
        [920, 0.035, 0.09],
      ],
      tick: [[1200, 0, 0.02]],
      timer: [
        [523, 0, 0.12],
        [784, 0.07, 0.13],
      ],
      complete: [
        [523, 0, 0.18],
        [659, 0.13, 0.18],
        [784, 0.26, 0.2],
        [1047, 0.4, 0.3],
      ],
      yes: [
        [659, 0, 0.16],
        [784, 0.1, 0.16],
        [1047, 0.2, 0.25],
      ],
    };
    for (const [frequency, delay, duration] of patterns[kind] ||
      patterns.click) {
      const t = this.audioContext.currentTime + delay,
        osc = this.audioContext.createOscillator(),
        gain = this.audioContext.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, t);
      osc.frequency.exponentialRampToValueAtTime(
        frequency * (kind === "dodge" ? 1.3 : 1.04),
        t + duration,
      );
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(
        kind === "tick" ? 0.007 : 0.045,
        t + 0.008,
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start(t);
      osc.stop(t + duration + 0.02);
    }
  }
}
