import { $, dateKey } from "./dom.js";
import { BrowserStorage } from "./BrowserStorage.js";
import { dayNumber } from "./StudyTools.js";
/** Date-based daily and open-when letters. */
export class PersonalLetters {
  constructor(app) {
    this.app = app;
    this.storage = new BrowserStorage();
    this.defaults = {
      daily: [
        "kaya mo yan baby",
        "kumain ka na ba? 😡",
        "don't forget to take your meds ganda :))",
        "Your best looks different every day. Still proud of you.",
        "Rest a little. Your dreams will still be here when you come back.",
      ],
      tired:
        "Pahinga ka muna, ganda. You do not have to do everything at once. kaya mo yan baby <3",
      failed:
        "One quiz does not decide your future. Take a breath, then we can try again. I am rooting for you.",
      passed:
        "Look at you, my future nurse! Celebrate this little win. Proud of you, ganda <3",
    };
    const saved = this.storage.read("cj-letters-v1", null);
    this.letters =
      saved &&
      Array.isArray(saved.daily) &&
      saved.daily.length &&
      ["tired", "failed", "passed"].every((k) => typeof saved[k] === "string")
        ? saved
        : this.defaults;
  }
  init() {
    this.render();
    $("#daily-open").onclick = () => this.app.notes.openMessage(this.today());
    document
      .querySelectorAll("[data-open-when]")
      .forEach(
        (b) =>
          (b.onclick = () =>
            this.app.notes.openMessage(this.letters[b.dataset.openWhen])),
      );
  }

  today() {
    return this.letters.daily[
      dayNumber(dateKey(new Date())) % this.letters.daily.length
    ];
  }
  render() {
    $("#daily-note").textContent = this.today();
  }
}
