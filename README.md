# CJ's Study Hub

A responsive, claymorphism daily study planner made with HTML, CSS, and object-oriented vanilla JavaScript. Built with heart by **@akiakyo**.

## Deploy to Vercel

1. Extract this ZIP and upload the **contents of this folder** to a GitHub repository. `public`, `package.json`, and `vercel.json` must be at the repository root.
2. In Vercel, choose **Add New → Project** and import that GitHub repository.
3. Use **Framework Preset: Other**, **Root Directory: repository root**, **Output Directory: public**, and leave the build and install commands empty.
4. Deploy. The included `vercel.json` already configures these static-site settings.

No environment variables, API keys, database, or npm dependencies are needed. Do not upload the ZIP itself as the website.

Vercel references: https://vercel.com/docs/builds and https://vercel.com/docs/project-configuration/vercel-json

## Preview locally

From this folder, run:

```bash
python -m http.server 8080 --directory public
```

Then open http://localhost:8080. Use an HTTP server rather than double-clicking `index.html`, because ES modules require it.

## Run tests

With Node.js 20 or later:

```bash
npm test
```

No install step is required. Tests cover saved task completion, storage failure, streak rules, random note rotation, and timer formatting. A DOM smoke check also verified controls during packaging; visual browser QA was unavailable.

## Project structure

- `public/index.html`: page markup and accessibility labels.
- `public/styles.css`: responsive claymorphism theme and animation styles.
- `public/js/app.js`: `StudyHubApp`, which creates and coordinates controllers.
- `public/js/BrowserStorage.js`: injectable JSON storage adapter with failure handling.
- `public/js/TaskPlanner.js`: task creation, completion, removal, filtering, and date navigation.
- `public/js/StreakController.js`: daily streak calculation and tooltip.
- `public/js/FocusTimer.js`: countdown state and focus/break controls.
- `public/js/RollingCounter.js`: rolling timer digits.
- `public/js/StickyNoteController.js`: random notes, dialog lifecycle, and lazy paper effect loading.
- `public/js/PriorityDropdown.js`: keyboard-accessible custom dropdown.
- `public/js/SoundManager.js`: synthesized Web Audio sounds and saved mute preference.
- `public/js/LoveQuestion.js`: bounded dodging NO button and YES response.
- `public/js/dom.js`: small DOM, icon, and date helpers.
- `public/assets`: local GIFs, logo/favicon, and third-party animation dependencies.
- `tests/domain.test.js`: automated domain tests.

Controllers own their state and methods. `StudyHubApp` composes them; there are no application-state globals. The low-level React Bits paper renderer remains a vendor adapter instead of being rewritten into the application classes.

## Data and streaks

Tasks and completion flags use `localStorage` under `cj-study-hub-v1`. Sound preference uses `cj-sound`. A streak counts consecutive local calendar days with at least one completed task. Yesterday's streak stays available until today ends; a missed day resets it. Future-dated tasks do not extend today's streak. Deleting or unchecking completed tasks can change the streak.

Data stays on the same browser profile and origin. A new Vercel address or custom domain has separate storage, so records on the current hosted site do not transfer automatically. Clearing site data or ending a private browsing session can remove records. Timer progress is not persisted on reload. No account or cross-device synchronization is included.

## Customize

- Edit the four motivational messages in `StickyNoteController.js`.
- Edit the NO-button phrases in `LoveQuestion.js`.
- Update text in `index.html`, colors in `styles.css`, and images in `assets`.
- Keep image filenames and imports consistent. The paper effect loads local Three.js modules on demand.

## Third-party credits

- Lucide icons: https://lucide.dev — ISC license.
- Three.js: https://threejs.org — MIT license.
- Paper Crumple adapted from React Bits by David Haz: https://www.reactbits.dev/micro/paper-crumple — supplied MIT + Commons Clause conditions; see `public/assets/react-bits-LICENSE.txt`.
- Dodge interaction and rolling digits are inspired by React Bits and implemented in vanilla JavaScript.
- GIF stickers supplied by the user, credited to tilund; their original rights remain with their creator. Google Fonts are loaded via the stylesheet.

Keep the supplied third-party license notices. The React Bits terms allow use in a website but restrict selling or redistributing the components as standalone products or component bundles. This project is a complete website, not a reusable component package.
