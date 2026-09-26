// app.js — Einstiegspunkt. Initialisiert alle Module und verbindet sie.
// Modularer Aufbau, damit das Tool später als WordPress-Plugin oder mit
// Backend (MySQL) erweitert werden kann. Jede Funktionalität liegt in js/*.js.
import { state, $ } from "./js/core.js";
import { initTabs, populateVehicleSelects, initMaintenance } from "./js/ui.js";
import { initVehicles, renderVehicles } from "./js/vehicles.js";
import { initBookingDialog } from "./js/booking.js";
import { initCalendar, renderCalendar } from "./js/calendar.js";
import { initList, renderList } from "./js/list.js";
import { initTimeline, renderTimeline } from "./js/timeline.js";
import { initImportExport } from "./js/importexport.js";
import { initFeedback } from "./js/feedback.js";

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
