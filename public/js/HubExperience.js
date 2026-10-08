import { $, icons, dateKey } from "./dom.js";
import { BrowserStorage } from "./BrowserStorage.js";
/** Responsive navigation, focused presentation, preferences and PWA install. */
export class HubExperience {
  constructor(app) {
    this.app = app;
    this.storage = new BrowserStorage();
    this.tab = "today";
  }
  init() {
    const header = document.querySelector("header");
    const shrinkHeader = () => {
      if (window.scrollY > 80) header.classList.add("is-scrolled");
      else if (window.scrollY < 24) header.classList.remove("is-scrolled");
    };
    window.addEventListener("scroll", shrinkHeader, { passive: true });
    shrinkHeader();
    document
      .querySelectorAll("[data-tab]")
      .forEach((b) => (b.onclick = () => this.showTab(b.dataset.tab)));
    const visit = this.storage.read("cj-visited-v1", false);
    $("#first-hero").hidden = !!visit;
    $(".intro").classList.toggle("return-visit", !!visit);
    this.storage.write("cj-visited-v1", true);
    this.greet();
    $("#theme-toggle").onclick = () => {
      const dark = document.documentElement.dataset.theme !== "dark";
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      try {
        localStorage.setItem("cj-theme", dark ? "dark" : "light");
      } catch {
        this.app.tasks.toast("Theme applies here but could not be saved.");
      }
      this.themeIcon();
    };
    this.themeIcon();
    $("#mini-start").onclick = () => {
      this.showTab("focus");
      this.app.timer.toggle();
    };
    $("#exit-focus").onclick = () => this.focusMode(false);
    $("#focus-subject").value = this.storage.read("cj-focus-subject-v1", "");
    $("#focus-subject").onchange = (e) =>
      this.storage.write("cj-focus-subject-v1", e.target.value);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("focus-mode"))
        this.focusMode(false);
    });
    this.initPwa();
    this.initScrollReveals();
    setInterval(() => {
      this.greet();
      this.app.exams.render();
      $("#daily-note").textContent = this.app.letters.today();
      this.app.progress.render();
    }, 60000);
  }
  initScrollReveals() {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || !("IntersectionObserver" in window)) return;
    this.revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.target.closest("[hidden]")) continue;
        entry.target.classList.remove("reveal-pending");
        entry.target.classList.add("reveal-entering");
        this.revealObserver.unobserve(entry.target);
        entry.target.addEventListener("animationend", () => entry.target.classList.remove("reveal-entering"), {once:true});
      }
    }, {threshold:0, rootMargin:"0px 0px -24px 0px"});
    this.observeFeatures();
    reduced.addEventListener?.("change", e => {
      if (!e.matches) return;
      this.revealObserver.disconnect();
      document.querySelectorAll(".reveal-pending, .reveal-entering").forEach(el => el.classList.remove("reveal-pending", "reveal-entering"));
    });
  }
  observeFeatures() {
    if (!this.revealObserver || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const panel = document.querySelector(`[data-panel="${this.tab}"]`);
    for (const feature of panel.querySelectorAll(":scope > section, :scope > .dashboard-cards > section")) {
      if (feature.dataset.revealObserved) continue;
      feature.dataset.revealObserved = "true";
      // Keep the first screen immediate; reveal only features below the viewport.
      if (feature.getBoundingClientRect().top < window.innerHeight - 24) continue;
      feature.classList.add("reveal-pending");
      this.revealObserver.observe(feature);
    }
  }
  showTab(tab) {
    if (!["today", "focus", "review", "us"].includes(tab)) return;
    this.tab = tab;
    document
      .querySelectorAll("[data-panel]")
      .forEach((p) => (p.hidden = p.dataset.panel !== tab));
    document.querySelectorAll("[data-tab]").forEach((b) => {
      const active = b.dataset.tab === tab;
      if (active) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
    if (tab === "review") this.app.flashcards.render();
    if (tab === "focus") this.app.progress.render();
    window.scrollTo({ top: 0, behavior: "smooth" });
    this.observeFeatures();
  }
  greet() {
    const hour = new Date().getHours();
    $("#greeting").textContent =
      `Good ${hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"}, ganda ♡`;
  }
  themeIcon() {
    const dark = document.documentElement.dataset.theme === "dark";
    $("#theme-toggle").innerHTML =
      `<i data-lucide="${dark ? "sun" : "moon"}"></i>`;
    $("#theme-toggle").setAttribute(
      "aria-label",
      `Switch to ${dark ? "light" : "dark"} mode`,
    );
    icons();
  }
  focusMode(on) {
    document.body.classList.toggle("focus-mode", on);
    for (const element of document.querySelectorAll(
      "header, .hub-nav, footer, #focus-panel > .cheer-card, #focus-panel > .clay",
    ))
      element.inert = on;
    $("#exit-focus").hidden = !on;
    if (on) {
      this.showTab("focus");
      $("#exit-focus").focus();
    } else if (this.tab === "focus") $("#start").focus();
  }
  syncTimer(timer) {
    const m = String(Math.floor(timer.seconds / 60)).padStart(2, "0"),
      s = String(timer.seconds % 60).padStart(2, "0");
    $("#mini-time").textContent = `${m}:${s}`;
    $("#mini-start").textContent = timer.running
      ? "Pause timer"
      : timer.seconds === timer.total
        ? "Start " + (timer.total === 1500 ? "focus" : "break")
        : "Resume timer";
    $("#focus-subject").disabled = timer.running;
  }
  initPwa() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.installPrompt = e;
    });
    window.addEventListener("appinstalled", () => {
      this.installPrompt = null;
      $("#install-help").hidden = false;
      $("#install-help").textContent = "Study Hub is installed ♡";
    });
    $("#install-app").onclick = async () => {
      if (this.installPrompt) {
        await this.installPrompt.prompt();
        await this.installPrompt.userChoice;
        this.installPrompt = null;
      } else {
        $("#install-help").hidden = false;
        $("#install-help").textContent = matchMedia(
          "(display-mode: standalone)",
        ).matches
          ? "You are already using the installed app ♡"
          : "On iPhone: Safari → Share → Add to Home Screen. On Android or desktop: use your browser’s Install app option. Open the site over HTTPS first.";
      }
    };
    if ("serviceWorker" in navigator && location.protocol !== "file:")
      navigator.serviceWorker.register("./sw.js").catch(() => {
        /* Site remains fully usable without offline support. */
      });
  }
}
