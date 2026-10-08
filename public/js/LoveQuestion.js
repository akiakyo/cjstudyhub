import { $, icons, dateKey } from "./dom.js";

/** LoveQuestion owns love behavior and state. */
export class LoveQuestion {
  constructor(app) {
    this.app = app;
    this.dodgeNo = this.dodgeNo.bind(this);
  }
  init() {
    this.dodgeField = $("#dodge-field");
    this.noButton = $("#love-no");
    this.taunts = ["NO", "Why??", ":(( why", "dapat yes"];
    this.dodgeCount = 0;
    this.lastDodge = 0;
    this.loveDone = false;
    this.noButton.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "touch") this.dodgeNo(e);
    });
    this.noButton.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") {
        e.preventDefault();
        this.dodgeNo(e);
      }
    });
    this.noButton.onclick = (e) => {
      e.preventDefault();
      this.dodgeNo(e);
    };
    $("#love-yes").onclick = () => {
      this.loveDone = true;
      this.app.sound.playSound("yes");
      $("#love-answer").textContent = "hehe love you too, ganda <3";
      this.noButton.hidden = true;
      $("#love-yes").textContent = "love you <3";
      $(".love-card").classList.add("love-answered");
    };
    new ResizeObserver(() => {
      if (!this.noButton.style.left) return;
      this.noButton.style.left =
        Math.max(
          8,
          Math.min(
            parseFloat(this.noButton.style.left),
            this.dodgeField.clientWidth - this.noButton.offsetWidth - 8,
          ),
        ) + "px";
      this.noButton.style.top =
        Math.max(
          8,
          Math.min(
            parseFloat(this.noButton.style.top),
            this.dodgeField.clientHeight - this.noButton.offsetHeight - 8,
          ),
        ) + "px";
    }).observe(this.dodgeField);
  }
  dodgeNo(event) {
    if (this.loveDone || performance.now() - this.lastDodge < 280) return;
    this.lastDodge = performance.now();
    this.dodgeCount++;
    this.noButton.textContent =
      this.taunts[Math.min(this.dodgeCount, this.taunts.length - 1)];
    this.app.sound.playSound("dodge");
    const field = this.dodgeField.getBoundingClientRect(),
      bw = this.noButton.offsetWidth,
      bh = this.noButton.offsetHeight;
    const maxX = Math.max(0, field.width - bw - 16),
      maxY = Math.max(0, field.height - bh - 16);
    const pointerX = event?.clientX - field.left,
      pointerY = event?.clientY - field.top;
    const choices = [
      { x: 8, y: 8 },
      { x: maxX, y: 8 },
      { x: 8, y: maxY },
      { x: maxX, y: maxY },
      { x: maxX / 2, y: maxY / 2 },
    ];
    const currentX = parseFloat(this.noButton.style.left) || maxX / 2,
      currentY = parseFloat(this.noButton.style.top) || maxY / 2;
    const distance = (p) =>
      Math.hypot(
        p.x +
          bw / 2 -
          (Number.isFinite(pointerX) ? pointerX : currentX + bw / 2),
        p.y +
          bh / 2 -
          (Number.isFinite(pointerY) ? pointerY : currentY + bh / 2),
      );
    choices.sort((a, b) => distance(b) - distance(a));
    const target = choices[0];
    this.noButton.style.left = target.x + "px";
    this.noButton.style.top = target.y + "px";
    this.noButton.style.transform = "none";
    this.noButton.classList.remove("dodge-wiggle");
    void this.noButton.offsetWidth;
    this.noButton.classList.add("dodge-wiggle");
  }
}
