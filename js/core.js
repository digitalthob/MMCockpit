// js/core.js — Datenmodell, Persistenz (localStorage) und gemeinsame Helfer.
// Wird von allen Modulen importiert. Bewusst framework-frei gehalten, damit es
// später als WordPress-Plugin oder mit Backend (MySQL) wiederverwendet werden kann.

export const STORAGE_KEY = "makermobile.cockpit.v2";
export const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

// Mögliche Stati (intern ohne Umlaute, damit CSV/Backend einfach bleiben).
export const STATUSES = ["angefragt", "bestaetigt", "abgelehnt", "abgeschlossen"];
const STATUS_LABELS = {
  angefragt: "angefragt",
  bestaetigt: "bestätigt",
  abgelehnt: "abgelehnt",
  abgeschlossen: "abgeschlossen",
};

// Farbpalette für Fahrzeuge. Wird rotierend vergeben.
const PALETTE = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#db2777", "#65a30d"];
let paletteIndex = 0;
export function nextColor() {
  const c = PALETTE[paletteIndex % PALETTE.length];
  paletteIndex++;
  return c;
}

// ---------- IDs ----------
export function vId() { return "v_" + Math.random().toString(36).slice(2, 9); }
export function bId() { return "b_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

// ---------- Storage ----------
// Migration von v1 (alte Beta) auf v2: übernimmt Fahrzeuge + Buchungen,
// ergänzt Farbe und settings, falls noch nicht vorhanden.
function migrateV1(old) {
  const vehicles = (old.vehicles || []).map((v) => ({ id: v.id, name: v.name, type: v.type || "", color: nextColor() }));
  return {
    vehicles,
    bookings: (old.bookings || []).map((b) => ({ ...b, status: normStatus(b.status) })),
    settings: { maintenance: false },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && Array.isArray(s.bookings) && Array.isArray(s.vehicles)) {
        if (!s.settings) s.settings = { maintenance: false };
        return s;
      }
    }
  } catch (e) {
    console.warn("Speicher konnte nicht gelesen werden:", e);
  }
  // Versuch, aus alter v1-Version zu migrieren.
  try {
    const oldRaw = localStorage.getItem("makermobile.cockpit.v1");
    if (oldRaw) {
      const migrated = migrateV1(JSON.parse(oldRaw));
      return migrated;
    }
  } catch (e) { /* ignorieren */ }
  return {
    vehicles: [
      { id: vId(), name: "Makermobil 1", type: "", color: nextColor() },
      { id: vId(), name: "Makermobil 2", type: "", color: nextColor() },
    ],
    bookings: [],
    settings: { maintenance: false },
  };
}

export function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Einziges zentrales State-Objekt. Module arbeiten direkt darauf und rufen saveState().
export let state = loadState();

// ---------- Status-Helfer ----------
export function statusLabel(s) { return STATUS_LABELS[s] || s; }
export function normStatus(s) {
  const map = { angefragt: "angefragt", bestaetigt: "bestaetigt", "bestätigt": "bestaetigt", abgelehnt: "abgelehnt", abgeschlossen: "abgeschlossen" };
  return map[s] || "angefragt";
}

// ---------- Fahrzeug-Helfer ----------
export function vehicleById(id) { return state.vehicles.find((v) => v.id === id); }
export function vehicleName(id) { const v = vehicleById(id); return v ? v.name : "—"; }
export function vehicleColor(id) { const v = vehicleById(id); return v ? v.color : "#9ca3af"; }

// ---------- Datum-Helfer ----------
export function parseDT(s) {
  if (!s) return null;
  let iso = String(s).trim().replace(" ", "T");
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) iso += "T00:00";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}
export function toLocalInput(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function fmtDate(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function fmtDateShort(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.`;
}
export function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
export function startOfWeek(d) {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const wd = (r.getDay() + 6) % 7; // Mo = 0
  r.setDate(r.getDate() - wd);
  r.setHours(0, 0, 0, 0);
  return r;
}
export function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

// ---------- DOM-Helfer ----------
export const $ = (sel) => document.querySelector(sel);
export const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// ---------- XSS-Schutz ----------
export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
