// js/ics.js — ICS-Export (Kalender-Standardformat, importierbar in Google/Outlook/Apple).
// Bewusst ohne externe Bibliothek: das Format ist einfacher Text.
import { state, vehicleName, statusLabel, parseDT, $ } from "./core.js";

// Initialisiert den Export-Button.
export function initICS() {
  $("#export-ics").addEventListener("click", exportICS);
}

// Exportiert alle sichtbaren Buchungen (ohne "abgelehnt") als .ics-Datei.
export function exportICS() {
  const bookings = state.bookings.filter((b) => b.status !== "abgelehnt");
  if (bookings.length === 0) { alert("Keine Buchungen zum Exportieren."); return; }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MMCockpit//Makermobile Buchungstool//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Makermobile",
  ];

  bookings.forEach((b) => {
    const from = parseDT(b.from);
    const to = parseDT(b.to);
    if (!from || !to) return;
    const status = b.status === "bestaetigt" ? "CONFIRMED" : "TENTATIVE";
    lines.push(
      "BEGIN:VEVENT",
      "UID:" + b.id + "@mmcockpit",
      "DTSTAMP:" + icsNow(),
      "DTSTART:" + icsDT(from),
      "DTEND:" + icsDT(to),
      "SUMMARY:" + icsText(`${vehicleName(b.vehicleId)} – ${b.person}`),
      "DESCRIPTION:" + icsText([
        `Status: ${statusLabel(b.status)}`,
        b.organisation ? `Organisation: ${b.organisation}` : "",
        b.purpose ? `Zweck: ${b.purpose}` : "",
        b.contact ? `Kontakt: ${b.contact}` : "",
        b.note ? `Notiz: ${b.note}` : "",
      ].filter(Boolean).join("\\n")),
      "LOCATION:" + icsText(vehicleName(b.vehicleId)),
      "STATUS:" + status,
      "END:VEVENT",
    );
  });

  lines.push("END:VCALENDAR");
  download("makermobile-buchungen.ics", lines.join("\r\n"));
}

// ---------- Helfer ----------
function pad(n) { return String(n).padStart(2, "0"); }

// ICS verlangt UTC im Format YYYYMMDDTHHMMSSZ.
function icsDT(d) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

function icsNow() {
  return icsDT(new Date());
}

// Maskiert Sonderzeichen gemäß RFC 5545 (Komma, Semikolon, Backslash).
function icsText(v) {
  return String(v ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

function download(name, content) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
