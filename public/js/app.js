import { TaskPlanner } from "./TaskPlanner.js";
import { StreakController } from "./StreakController.js";
import { FocusTimer } from "./FocusTimer.js";
import { StickyNoteController } from "./StickyNoteController.js";
import { PriorityDropdown } from "./PriorityDropdown.js";
import { SoundManager } from "./SoundManager.js";
import { LoveQuestion } from "./LoveQuestion.js";
import { RollingCounter } from "./RollingCounter.js";
/** Composition root: controllers coordinate through this app, with no global state. */
export class StudyHubApp {
  constructor() {
    this.tasks = new TaskPlanner(this);
    this.streak = new StreakController(this);
    this.timer = new FocusTimer(this);
    this.notes = new StickyNoteController(this);
    this.priority = new PriorityDropdown(this);
    this.sound = new SoundManager(this);
    this.love = new LoveQuestion(this);
    this.counter = new RollingCounter(this);
  }
  init() {
    this.counter.init();
    this.sound.init();
    this.tasks.init();
    this.streak.init();
    this.priority.init();
    this.notes.init();
    this.timer.init();
    this.love.init();
  }
}
new StudyHubApp().init();
