const CACHE = "cj-study-hub-nursing-v10";
const ASSETS = [
  "./",
  "./styles.css",
  "./manifest.webmanifest",
  "./hub.css",
  "./index.html",
  "./assets/three.core.js",
  "./assets/lucide.min.js",
  "./assets/smirk.gif",
  "./assets/paper-crumple.js",
  "./assets/tongue.gif",
  "./assets/icon-512.png",
  "./assets/party.gif",
  "./assets/paper-crumple.css",
  "./assets/three-LICENSE.txt",
  "./assets/icon-192.png",
  "./assets/react-bits-LICENSE.txt",
  "./assets/three.module.js",
  "./assets/lucide-LICENSE.txt",
  "./assets/cry.gif",
  "./assets/logo.png",
  "./js/BrowserStorage.js",
  "./js/app.js",
  "./js/LoveQuestion.js",
  "./js/SoundManager.js",
  "./js/PersonalLetters.js",
  "./js/StudyTools.js",
  "./js/SubjectDropdown.js",
  "./js/RollingCounter.js",
  "./js/dom.js",
  "./js/StreakController.js",
  "./js/ProgressJournal.js",
  "./js/DeadlineCalendar.js",
  "./js/TaskPlanner.js",
  "./js/PriorityDropdown.js",
  "./js/HubExperience.js",
  "./js/StickyNoteController.js",
  "./js/FocusTimer.js",
];
self.addEventListener("install", (event) =>
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  ),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("cj-study-hub-") && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== self.location.origin
  )
    return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("./index.html")),
    );
    return;
  }
  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => cached || fetch(event.request)),
  );
});
