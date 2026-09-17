// app.js — Einstiegspunkt. Initialisiert alle Module und verbindet sie.
// Modularer Aufbau, damit das Tool später als WordPress-Plugin oder mit
// Backend (MySQL) erweitert werden kann. Jede Funktionalität liegt in js/*.js.
import { state, $ } from "./core.js";
import { initTabs, populateVehicleSelects, initMaintenance } from "./ui.js";
import { initVehicles, renderVehicles } from "./vehicles.js";
import { initBookingDialog } from "./booking.js";
import { initCalendar, renderCalendar } from "./calendar.js";
import { initList, renderList } from "./list.js";
import { initTimeline, renderTimeline } from "./timeline.js";
import { initImportExport } from "./importexport.js";
import { initFeedback } from "./feedback.js";

// ---------- Init ----------
populateVehicleSelects();
initTabs();
initBookingDialog();
initVehicles();
initCalendar();
initList();
initTimeline();
initImportExport();
initFeedback();
initMaintenance();

// Zentrale Re-Render-Logik: Wenn sich Daten ändern, betroffene Ansichten neu zeichnen.
document.addEventListener("mm:dataChanged", () => {
  const active = document.querySelector('nav#tabs button.active')?.dataset.tab;
  if (active === "calendar") renderCalendar();
  if (active === "list") renderList();
  if (active === "timeline") renderTimeline();
  if (active === "vehicles") renderVehicles();
  populateVehicleSelects();
});
