import test from "node:test";
import assert from "node:assert/strict";
import { BrowserStorage } from "../public/js/BrowserStorage.js";
import { StreakController } from "../public/js/StreakController.js";
import { StickyNoteController } from "../public/js/StickyNoteController.js";
import { RollingCounter } from "../public/js/RollingCounter.js";
test("tasks and completion survive storage reload", () => {
  const records = new Map();
  const storage = {
    getItem: (key) => records.get(key) ?? null,
    setItem: (key, value) => records.set(key, value),
  };
  const first = new BrowserStorage(storage);
  const data = { "2026-10-08": [{ title: "Review anatomy", done: true }] };
  assert.equal(first.write("cj-study-hub-v1", data), true);
  assert.deepEqual(new BrowserStorage(storage).read("cj-study-hub-v1"), data);
});
test("storage failure is reported without losing in-memory tasks", () => {
  const storage = new BrowserStorage({
    getItem() {
      throw Error("Blocked");
    },
    setItem() {
      throw Error("Quota");
    },
  });
  assert.deepEqual(storage.read("tasks"), {});
  assert.equal(storage.write("tasks", { today: [] }), false);
});
test("streak handles consecutive days, grace, gaps and future dates", () => {
  const streak = new StreakController({});
  const yes = [{ done: true }];
  assert.deepEqual(streak.calculateStreak({}, new Date(2026, 9, 8)), {
    count: 0,
    todayDone: false,
  });
  assert.equal(
    streak.calculateStreak(
      { "2026-10-08": yes, "2026-10-07": yes },
      new Date(2026, 9, 8),
    ).count,
    2,
  );
  assert.equal(
    streak.calculateStreak({ "2026-10-07": yes }, new Date(2026, 9, 8)).count,
    1,
  );
  assert.equal(
    streak.calculateStreak(
      { "2026-10-06": yes, "2026-10-09": yes },
      new Date(2026, 9, 8),
    ).count,
    0,
  );
});
test("random notes show all four per cycle without adjacent repeats", () => {
  const notes = new StickyNoteController({});
  notes.messages = ["a", "b", "c", "d"];
  notes.messageBag = [];
  let previous;
  for (let cycle = 0; cycle < 20; cycle++) {
    const seen = new Set();
    for (let i = 0; i < 4; i++) {
      const next = notes.nextMessage();
      assert.notEqual(next, previous);
      seen.add(next);
      previous = next;
    }
    assert.equal(seen.size, 4);
  }
});
test("counter formats minute boundaries and break durations", () => {
  const counter = new RollingCounter({});
  for (const [value, text] of [
    [1500, "25:00"],
    [1499, "24:59"],
    [60, "01:00"],
    [59, "00:59"],
    [0, "00:00"],
    [300, "05:00"],
  ])
    assert.equal(counter.timerText(value), text);
});

import { DeadlineCalendar } from "../public/js/DeadlineCalendar.js";
test("deadline date validation rejects impossible calendar dates", () => {
  assert.equal(DeadlineCalendar.validDate("2026-04-30"), true);
  assert.equal(DeadlineCalendar.validDate("2026-04-31"), false);
  assert.equal(DeadlineCalendar.validDate("2026-02-29"), false);
  assert.equal(DeadlineCalendar.validDate("2028-02-29"), true);
});
test("May calendar includes the screenshot deadlines across adjacent months", () => {
  const days = DeadlineCalendar.gridDates(new Date(2026, 4, 1));
  assert.equal(days.length, 42);
  assert.equal(days[0].getDay(), 0);
  const keys = days.map(
    (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
  );
  for (const item of DeadlineCalendar.seeds()) assert(keys.includes(item.date));
});
