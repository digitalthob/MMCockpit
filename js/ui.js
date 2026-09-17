// js/ui.js — Gemeinsame UI: Tabs, Fahrzeug-Auswahllisten, Wartungsmodus-Banner.
import { state, saveState, $, $$ } from "./core.js";
import { renderCalendar } from "./calendar.js";
import { renderList } from "./list.js";
import { renderVehicles } from "./vehicles.js";
import { renderTimeline } from "./timeline.js";

// Befüllt die Fahrzeug-<select>s (Filter + Buchungsdialog).
export function populateVehicleSelects() {
  const opts = state.vehicles.map((v) => `<option value="${v.id}">${v.name}</option>`).join("");
  $("#b-vehicle").innerHTML = opts || `<option value="">(kein Fahrzeug)</option>`;
  const fv = $("#filter-vehicle");
  const prev = fv.value;
  fv.innerHTML = `<option value="">Alle Fahrzeuge</option>` + opts;
  fv.value = prev;
}

// Tab-Wechsel.
export function initTabs() {
  $$('nav#tabs button').forEach((btn) =>
    btn.addEventListener("click", () => switchTab(btn.dataset.tab)));
}

export function switchTab(name) {
  $$('nav#tabs button').forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
  $$(".tab").forEach((t) => t.classList.toggle("active", t.id === "tab-" + name));
  if (name === "calendar") renderCalendar();
  if (name === "list") renderList();
  if (name === "timeline") renderTimeline();
  if (name === "vehicles") renderVehicles();
}

// Wartungsmodus: blockiert neue Buchungen und zeigt ein Banner.
export function initMaintenance() {
  $("#maintenance-toggle").addEventListener("change", (e) => {
    state.settings.maintenance = e.target.checked;
    saveState();
    applyMaintenance();
  });
  $("#maintenance-toggle").checked = !!state.settings.maintenance;
  applyMaintenance();
}

export function applyMaintenance() {
  const on = !!state.settings.maintenance;
  $("#maintenance-banner").hidden = !on;
  // Neue-Buchung-Buttons deaktivieren.
  ["#new-booking", "#new-booking-2", "#new-booking-tl"].forEach((sel) => {
    const el = $(sel);
    if (el) { el.disabled = on; el.title = on ? "Wartungsmodus aktiv – Buchen gesperrt" : ""; }
  });
}
