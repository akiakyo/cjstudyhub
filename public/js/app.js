import { SubjectDropdown } from "./SubjectDropdown.js";
import { ExamPlanner, FlashcardDeck, DosagePractice } from "./StudyTools.js";
import { ProgressJournal } from "./ProgressJournal.js";
import { PersonalLetters } from "./PersonalLetters.js";
import { HubExperience } from "./HubExperience.js";
import { DeadlineCalendar } from "./DeadlineCalendar.js";
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
    this.deadlines = new DeadlineCalendar(this);
    this.streak = new StreakController(this);
    this.timer = new FocusTimer(this);
    this.notes = new StickyNoteController(this);
    this.priority = new PriorityDropdown(this);
    this.sound = new SoundManager(this);
    this.love = new LoveQuestion(this);
    this.counter = new RollingCounter(this);
    this.exams = new ExamPlanner(this);
    this.flashcards = new FlashcardDeck(this);
    this.subjectDropdown = new SubjectDropdown();
    this.practice = new DosagePractice();
    this.progress = new ProgressJournal(this);
    this.letters = new PersonalLetters(this);
    this.experience = new HubExperience(this);
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
    this.deadlines.init();
    this.exams.init();
    this.flashcards.init();
    this.subjectDropdown.init();
    this.practice.init();
    this.letters.init();
    this.progress.init();
    this.experience.init();
  }
}
export const studyHub = new StudyHubApp();
studyHub.init();
