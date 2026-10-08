import test from "node:test";
import assert from "node:assert/strict";

import { dayNumber, scheduleCard } from "../public/js/StudyTools.js";
test("exam countdown counts calendar days across month and year boundaries", () => {
  assert.equal(dayNumber("2027-01-01") - dayNumber("2026-12-31"), 1);
  assert.equal(dayNumber("2028-03-01") - dayNumber("2028-02-28"), 2);
});
test("spaced review intervals cap at 30 days and again resets learning", () => {
  const now = 1000000;
  let c = { id: "a", level: 0 };
  for (const days of [1, 3, 7, 14, 30, 30]) {
    c = scheduleCard(c, true, now);
    assert.equal(c.dueAt, now + days * 86400000);
  }
  c = scheduleCard(c, false, now);
  assert.equal(c.level, 0);
  assert.equal(c.dueAt, now + 600000);
  c = scheduleCard(c, true, now);
  assert.equal(c.dueAt, now + 86400000);
});
