# CJ's Study Hub

A responsive, pink claymorphism nursing study companion built with HTML, CSS and object-oriented vanilla JavaScript. No framework, build step, account, or API key needed.

## Run locally

Serve the `public` folder over HTTP. Do not double-click index.html: ES modules and offline app support need a server.

```bash
cd public
python -m http.server 8000
```

Open http://localhost:8000. Run `npm test` from the project root for scheduling, streak, persistence, date and counter checks.

## Deploy on Vercel

Upload this project's files to your GitHub repository. Import that repository into Vercel with **Other** as the framework, no install or build command, and `public` as the output directory. The included `vercel.json` sets these options. HTTPS enables the PWA service worker.

For an existing clone, copy these files into it, then:

```bash
git add .
git commit -m "Add nursing study tools, mobile tabs and offline app support"
git push origin main
```

Vercel redeploys connected repositories after a push. If your branch has a different name, substitute it for `main`.

## Features

- Today, Focus, Review and Us tabs; fixed mobile bottom navigation. The brand header shrinks on scroll; desktop tabs scroll normally. Features below the first screen reveal once with a short blur/fade, respecting reduced motion.
- Tasks with nursing subject tags and priorities; interactive deadline calendar.
- Editable exam and board exam dates, with a calendar-day countdown to the nearest upcoming exam.
- Personal flashcards: an empty initial deck, question/answer editor, subject filter, and spaced reviews. Got it schedules 1, 3, 7, 14, then 30 days; Again returns a card in 10 minutes. Manage cards without waiting for them to become due.
- Focus and break timers with animated digits, full-screen focus view, optional sounds, and break suggestions. Completed 25-minute focus sessions log once; pauses, resets and breaks do not log sessions. The current countdown resets if the page closes or reloads.
- Weekly focus chart and subject time totals. Task streaks use consecutive local calendar days containing a completed task, allowing yesterday's streak to remain visible until today is complete. Future tasks don't count. Unlocks at 3, 7 and 14 days and 4 focus sessions in one day stay earned.
- Hamster reactions, random crumple notes, daily and open-when letters, and the playful love question.
- Dark mode, installable PWA and cached offline assets after a successful first online load. Browser support and installation prompts vary. External font loading falls back to system fonts offline.

## Storage and privacy

All study data stays in this browser. Tasks continue using `cj-study-hub-v1`; deadlines continue using `cj-deadlines-v1`, preserving existing data on the same site address. Exams, cards, letters, completed focus sessions, rewards and preferences have their own keys. 

Refreshing or reopening the same address retains data in a regular browser window. Clearing website data, private browsing cleanup or browser eviction can remove it. Data does not sync across devices, browser profiles or domains: moving from the preview URL to Vercel starts a separate local collection. 

## Architecture

`public/js/app.js` is the composition root. Each class owns one area of behavior:

- `TaskPlanner`, `StreakController`, `DeadlineCalendar`: daily planning.
- `FocusTimer`, `RollingCounter`, `ProgressJournal`: countdown, animation and completed-session history.
- `StudyTools`: exam planner, flashcard collection and dosage practice; pure date/scheduling helpers are independently testable.
- `StickyNoteController`, `PersonalLetters`, `LoveQuestion`: personal interactions and locally persisted letters.
- `HubExperience`: tabs, theme, focus view and PWA installation.
- `BrowserStorage`: injectable JSON persistence adapter with failed-save handling.
- `SoundManager`, `PriorityDropdown`: sound and keyboard-accessible task priority controls.

`hub.css` extends the original clay styling in `styles.css`. `sw.js` precaches local assets; change its CACHE version when editing assets in a later release, and update its ASSETS list when adding files.

## Study references

Lab values link to ABIM's January 2026 adult reference ranges. Dosage methods link to OpenStax Clinical Nursing Skills, section 11.2. Ranges vary by laboratory and clinical context; these are study aids, not patient-specific decisions. Practice problems use fictional medicine and matching mg/mL units.

## Credits

Built with heart by @akiakyo. Goodluck my future nurse!

Lucide icons are vendored locally under their ISC license. Paper crumple is adapted from React Bits, with the supplied local Three.js dependencies and license notices retained in `public/assets`.
