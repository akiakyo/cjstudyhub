import { $, icons, dateKey } from "./dom.js";

/** StickyNoteController owns notes behavior and state. */
export class StickyNoteController {
  constructor(app) {
    this.app = app;
    this.nextMessage = this.nextMessage.bind(this);
    this.closeNote = this.closeNote.bind(this);
    this.preparePaper = this.preparePaper.bind(this);
  }
  init() {
    this.messages = [
      "kaya mo yan baby",
      "wag masyadong mag energy drinks 😡",
      "kumain ka na ba? 😡",
      "don't forget to take your meds ganda :))",
    ];
    this.messageBag = [];
    this.noteModal = $("#aky-modal");
    $("#aky-open").onclick = () => {
      if (this.noteModal.open) return;
      this.noteModal.classList.remove("closing");
      $("#aky-message").textContent = this.nextMessage();
      this.noteModal.showModal();
      icons();
      this.preparePaper();
    };
    $("#aky-close").onclick = this.closeNote;
    this.noteModal.addEventListener("cancel", (e) => {
      e.preventDefault();
      this.closeNote();
    });
    this.noteModal.addEventListener("click", (e) => {
      if (e.target === this.noteModal) {
        const r = this.noteModal.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          this.closeNote();
      }
    });
    setInterval(() => {
      if (this.app.streak.lastDay !== dateKey(new Date())) {
        this.app.streak.lastDay = dateKey(new Date());
        this.app.streak.renderStreak();
      }
    }, 30000);
    this.disposePaper = null;
    this.paperGeneration = 0;
    this.noteModal.addEventListener("close", () => {
      this.paperGeneration++;
      const cleanup = this.disposePaper;
      this.disposePaper = null;
      cleanup?.();
      this.noteModal.classList.remove("paper-ready");
    });
  }
  nextMessage() {
    if (!this.messageBag.length) {
      this.messageBag = [...this.messages];
      for (let i = this.messageBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.messageBag[i], this.messageBag[j]] = [
          this.messageBag[j],
          this.messageBag[i],
        ];
      }
      if (this.messageBag.at(-1) === this.previousMessage)
        [this.messageBag[0], this.messageBag[this.messageBag.length - 1]] = [
          this.messageBag.at(-1),
          this.messageBag[0],
        ];
    }
    return (this.previousMessage = this.messageBag.pop());
  }
  closeNote() {
    if (this.noteModal.classList.contains("closing")) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.noteModal.close();
      return;
    }
    this.noteModal.classList.add("closing");
    setTimeout(() => {
      this.noteModal.close();
      this.noteModal.classList.remove("closing");
    }, 200);
  }
  async preparePaper() {
    const generation = ++this.paperGeneration;
    const oldDispose = this.disposePaper;
    this.disposePaper = null;
    oldDispose?.();
    this.noteModal.classList.remove("paper-ready");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      const { createPaperCrumple } = await import("../assets/paper-crumple.js");
      if (
        generation !== this.paperGeneration ||
        !this.noteModal.open ||
        this.noteModal.classList.contains("closing")
      )
        return;
      const canvas = document.createElement("canvas");
      canvas.width = 840;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff2bb";
      ctx.fillRect(0, 0, 840, 720);
      ctx.strokeStyle = "#dbc67e30";
      ctx.lineWidth = 2;
      for (let y = 55; y < 720; y += 52) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(840, y);
        ctx.stroke();
      }
      ctx.fillStyle = "#e5b4c890";
      ctx.fillRect(322, 0, 196, 38);
      ctx.fillStyle = "#805932";
      ctx.font = "bold 52px Georgia";
      ctx.fillText("from aky :)", 62, 135);
      ctx.font = "38px Georgia";
      ctx.fillStyle = "#674b37";
      let words = $("#aky-message").textContent.split(" "),
        line = "",
        y = 275;
      for (const word of words) {
        let test = line + word + " ";
        if (ctx.measureText(test).width > 710 && line) {
          ctx.fillText(line, 62, y);
          line = word + " ";
          y += 63;
        } else line = test;
      }
      ctx.fillText(line, 62, y);
      ctx.strokeStyle = "#c9b373";
      ctx.setLineDash([8, 7]);
      ctx.beginPath();
      ctx.moveTo(62, 565);
      ctx.lineTo(778, 565);
      ctx.stroke();
      ctx.font = "25px sans-serif";
      ctx.fillStyle = "#8d7152";
      ctx.fillText("always rooting for you,", 62, 612);
      ctx.font = "italic 36px Georgia";
      ctx.fillText("aky <3", 62, 668);
      this.disposePaper = createPaperCrumple($("#paper-stage"), {
        src: canvas.toDataURL(),
        width: 420,
        height: 360,
        sceneHeight: 460,
        rotation: -2,
        detail: 48,
        crumpleAmount: 0.85,
        creaseStrength: 0,
        releaseBehavior: "restore",
        paperColor: "#fff3c2",
        shadow: false,
        dragRadius: 100,
        onError: () => this.noteModal.classList.remove("paper-ready"),
      });
    } catch {
      this.noteModal.classList.remove("paper-ready");
    }
  }
}
