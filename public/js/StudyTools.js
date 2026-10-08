import { $, icons, dateKey } from "./dom.js";
import { BrowserStorage } from "./BrowserStorage.js";
const id = () => crypto.randomUUID();
export const dayNumber = (value) => {
  const [y, m, d] = value.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
};
const el = (tag, text, cls) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (cls) node.className = cls;
  return node;
};
/** Shared device-local collection, with explicit failed-save feedback. */
export class LocalCollection {
  constructor(app, key) {
    this.app = app;
    this.key = key;
    this.storage = new BrowserStorage();
    const saved = this.storage.read(key, []);
    this.items = Array.isArray(saved) ? saved : [];
  }
  save() {
    if (!this.storage.write(this.key, this.items))
      this.app.tasks.toast(
        "Could not save. Browser storage may be full or disabled.",
      );
  }
  action(text, handler) {
    const b = el("button", text, "text-button");
    b.type = "button";
    b.onclick = handler;
    return b;
  }
}
export class ExamPlanner extends LocalCollection {
  constructor(app) {
    super(app, "cj-exams-v1");
  }
  init() {
    this.editId = null;
    $("#exam-form").onsubmit = (e) => {
      e.preventDefault();
      const name = $("#exam-name").value.trim(),
        date = $("#exam-date").value;
      if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
      const exam = { id: this.editId || id(), name, date };
      if (this.editId)
        this.items = this.items.map((x) => (x.id === this.editId ? exam : x));
      else this.items.push(exam);
      this.save();
      this.cancel();
      this.render();
    };
    $("#exam-cancel").onclick = () => this.cancel();
    $("#exam-jump").onclick = () => {
      this.app.experience.showTab("today");
      $("#exam-name").focus();
      $("#exam-form").scrollIntoView({ behavior: "smooth", block: "center" });
    };
    this.render();
  }
  cancel() {
    this.editId = null;
    $("#exam-form").reset();
    $("#exam-save").textContent = "Add exam";
    $("#exam-cancel").hidden = true;
  }
  render() {
    const today = dayNumber(dateKey(new Date()));
    const sorted = [...this.items].sort((a, b) => a.date.localeCompare(b.date));
    const next = sorted.find((x) => dayNumber(x.date) >= today);
    $("#exam-countdown").textContent = next
      ? `${dayNumber(next.date) - today === 0 ? "Today" : `${dayNumber(next.date) - today} days until`} ${next.name}`
      : "Your next chapter awaits.";
    $("#exam-jump").textContent = next
      ? "Manage exam dates"
      : "Set an exam date";
    const list = $("#exam-list");
    list.replaceChildren();
    if (!sorted.length)
      list.append(
        el("p", "Add your first exam date to see a countdown.", "muted"),
      );
    for (const x of sorted) {
      const row = el("div", undefined, "record-row");
      const days = dayNumber(x.date) - today;
      row.append(
        el("strong", x.name),
        el(
          "span",
          `${x.date} · ${days < 0 ? "Past exam" : days === 0 ? "Today" : `${days} days left`}`,
          "muted",
        ),
        this.action("Edit", () => {
          this.editId = x.id;
          $("#exam-name").value = x.name;
          $("#exam-date").value = x.date;
          $("#exam-save").textContent = "Save exam";
          $("#exam-cancel").hidden = false;
          $("#exam-name").focus();
        }),
        this.action("Delete", () => {
          this.items = this.items.filter((a) => a.id !== x.id);
          this.save();
          if (this.editId === x.id) this.cancel();
          this.render();
        }),
      );
      list.append(row);
    }
  }
}
/** Increasing review intervals; difficult cards return in ten minutes. */
export function scheduleCard(card, gotIt, now = Date.now()) {
  const level = gotIt ? Math.min((card.level || 0) + 1, 5) : 0;
  return {
    ...card,
    level,
    dueAt: now + (gotIt ? [1, 3, 7, 14, 30][level - 1] * 86400000 : 600000),
  };
}
export class FlashcardDeck extends LocalCollection {
  constructor(app) {
    super(app, "cj-flashcards-v1");
    this.subject = "";
    this.editId = null;
  }
  init() {
    this.revealed = false;
    $("#card-add").onclick = () => this.open();
    $("#card-cancel").onclick = () => {
      $("#card-form").hidden = true;
      this.editId = null;
    };
    $("#card-filter").onchange = (e) => {
      this.subject = e.target.value;
      this.render();
    };
    $("#card-form").onsubmit = (e) => {
      e.preventDefault();
      const subject = $("#card-subject").value.trim(),
        question = $("#card-question").value.trim(),
        answer = $("#card-answer").value.trim();
      if (!subject || !question || !answer) return;
      const prev = this.items.find((x) => x.id === this.editId);
      const card = {
        ...prev,
        id: this.editId || id(),
        subject,
        question,
        answer,
        dueAt: prev?.dueAt || Date.now(),
        level: prev?.level || 0,
      };
      if (this.editId)
        this.items = this.items.map((x) => (x.id === this.editId ? card : x));
      else this.items.push(card);
      this.save();
      this.editId = null;
      $("#card-form").hidden = true;
      this.render();
    };
    $("#card-reveal").onclick = () => {
      this.revealed = true;
      this.paintCard();
    };
    $("#card-again").onclick = () => this.review(false);
    $("#card-got").onclick = () => this.review(true);
    this.render();
    setInterval(() => {
      if (!this.current && !$("#card-form").hidden) return;
      if (!this.current) this.render();
    }, 30000);
  }
  open(card) {
    this.editId = card?.id || null;
    $("#card-form").reset();
    $("#card-subject").value = card?.subject || this.subject;
    $("#card-question").value = card?.question || "";
    $("#card-answer").value = card?.answer || "";
    $("#card-form").hidden = false;
    $("#card-question").focus();
  }
  render() {
    const select = $("#card-filter");
    const all = el("option", "All subjects");
    all.value = "";
    select.replaceChildren(all);
    for (const s of [...new Set(this.items.map((x) => x.subject))].sort()) {
      const option = el("option", s);
      option.value = s;
      select.append(option);
    }
    if (![...select.options].some((x) => x.value === this.subject))
      this.subject = "";
    select.value = this.subject;
    this.app.subjectDropdown?.render();
    const cards = this.items.filter(
      (x) => !this.subject || x.subject === this.subject,
    );
    const due = cards
      .filter((x) => x.dueAt <= Date.now())
      .sort((a, b) => a.dueAt - b.dueAt);
    this.current = due[0] || null;
    this.revealed = false;
    $("#review-count").textContent =
      `${due.length} due · ${cards.length} cards`;
    this.paintCard();
    const list = $("#card-list");
    list.replaceChildren();
    if (!cards.length)
      list.append(
        el(
          "p",
          "Your saved cards will appear here. Add your first card to get started.",
          "muted",
        ),
      );
    for (const x of cards) {
      const row = el("div", undefined, "record-row");
      row.append(
        el("strong", x.question),
        el(
          "span",
          `${x.subject} · next review ${new Date(x.dueAt).toLocaleString()}`,
          "muted",
        ),
        this.action("Edit", () => this.open(x)),
        this.action("Delete", () => {
          this.items = this.items.filter((c) => c.id !== x.id);
          this.save();
          if (this.editId === x.id) {
            this.editId = null;
            $("#card-form").hidden = true;
          }
          this.render();
        }),
      );
      list.append(row);
    }
  }
  paintCard() {
    const box = $("#review-card");
    box.replaceChildren();
    if (this.current) {
      box.append(
        el("span", this.current.subject, "eyebrow"),
        el("h3", this.current.question),
      );
      if (this.revealed)
        box.append(el("p", this.current.answer, "card-answer"));
    } else {
      box.append(
        el(
          "h3",
          this.items.length
            ? "All caught up for now ♡"
            : "Your deck starts with you.",
        ),
      );
      const future = this.items
        .filter((x) => !this.subject || x.subject === this.subject)
        .sort((a, b) => a.dueAt - b.dueAt)[0];
      box.append(
        el(
          "p",
          future
            ? `Next review: ${new Date(future.dueAt).toLocaleString()}`
            : "Add a card with a question and answer to start studying.",
          "muted",
        ),
      );
    }
    $("#card-reveal").hidden = !this.current || this.revealed;
    $("#card-again").hidden = !this.current || !this.revealed;
    $("#card-got").hidden = !this.current || !this.revealed;
  }
  review(got) {
    if (!this.current || !this.revealed) return;
    const updated = scheduleCard(this.current, got);
    this.items = this.items.map((x) => (x.id === updated.id ? updated : x));
    this.save();
    this.render();
    this.app.tasks.toast(
      got
        ? "Got it! Review scheduled for later."
        : "No rush. This card returns in 10 minutes.",
    );
  }
}
export class DosagePractice {
  init() {
    $("#calc-new").onclick = () => this.generate();
    $("#calc-form").onsubmit = (e) => {
      e.preventDefault();
      const entered = Number($("#calc-answer").value),
        correct =
          Math.round((this.dose / this.available) * this.volume * 100) / 100;
      $("#calc-result").textContent =
        `${Math.abs(entered - correct) < 0.005 ? "Correct! ♡" : "Try the calculation again."} ${this.dose} mg ÷ ${this.available} mg × ${this.volume} mL = ${correct} mL.`;
    };
    this.generate();
  }
  generate() {
    this.available = [100, 125, 200, 250, 500][Math.floor(Math.random() * 5)];
    this.volume = [2, 5, 10][Math.floor(Math.random() * 3)];
    this.dose =
      this.available * [0.25, 0.5, 1, 1.5, 2][Math.floor(Math.random() * 5)];
    $("#calc-question").textContent =
      `Fictional exercise: an order is for ${this.dose} mg. The bottle contains ${this.available} mg per ${this.volume} mL. How many mL? Round to 2 decimal places if needed.`;
    $("#calc-answer").value = "";
    $("#calc-result").textContent = "";
  }
}
