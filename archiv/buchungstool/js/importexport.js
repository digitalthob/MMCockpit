// js/importexport.js — CSV-Import/Export und JSON-Backup/Restore.
// CSV ist semikolongetrennt und Excel-kompatibel. Spalten:
// id,fahrzeug,von,bis,person,organisation,zweck,kontakt,status,notiz
import { state, saveState, vId, bId, vehicleName, normStatus, $ } from "./core.js";
import { populateVehicleSelects } from "./ui.js";

const CSV_COLS = ["id", "fahrzeug", "von", "bis", "person", "organisation", "zweck", "kontakt", "status", "notiz"];

export function initImportExport() {
  $("#export-csv").addEventListener("click", exportCSV);
  $("#export-json").addEventListener("click", exportJSON);
  $("#import-csv").addEventListener("change", onImportCSV);
  $("#import-json").addEventListener("change", onImportJSON);
  $("#export-pdf").addEventListener("click", () => {
    import("./pdf.js").then((m) => m.exportPDF());
  });
}

// ---------- CSV Export ----------
function exportCSV() {
  const rows = [CSV_COLS.join(";")];
  state.bookings.forEach((b) => {
    rows.push([
      b.id, vehicleName(b.vehicleId), b.from, b.to, b.person,
      b.organisation || "", b.purpose || "", b.contact || "", b.status, b.note || "",
    ].map(csvCell).join(";"));
  });
  download("makermobile-buchungen.csv", rows.join("\r\n"), "text/csv");
}

// ---------- JSON Export/Restore ----------
function exportJSON() {
  download("makermobile-backup.json", JSON.stringify(state, null, 2), "application/json");
}

function onImportJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  readText(file, (txt) => {
    try {
      const s = JSON.parse(txt);
      if (!Array.isArray(s.bookings) || !Array.isArray(s.vehicles)) throw new Error("Format");
      // state überschreiben (module hold a reference via core export? Wir aktualisieren Felder).
      state.vehicles = s.vehicles;
      state.bookings = s.bookings;
      state.settings = s.settings || { maintenance: false };
      saveState();
      document.dispatchEvent(new CustomEvent("mm:dataChanged"));
      alert("Backup wiederhergestellt.");
    } catch (err) {
      alert("Ungültige JSON-Datei: " + err.message);
    }
    e.target.value = "";
  });
}

// ---------- CSV Import ----------
function onImportCSV(e) {
  const file = e.target.files[0];
  if (!file) return;
  readText(file, (txt) => {
    const lines = txt.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length < 1) { alert("Leere Datei."); return; }
    const header = splitCSV(lines[0]);
    const idx = {};
    CSV_COLS.forEach((c) => { idx[c] = header.indexOf(c); });
    const needs = ["fahrzeug", "von", "bis", "person"];
    const missing = needs.filter((c) => idx[c] < 0);
    if (missing.length) { alert(`CSV unvollständig. Fehlt: ${missing.join(", ")}`); return; }

    let added = 0, skipped = 0;
    const existingIds = new Set(state.bookings.map((b) => b.id));
    const vehicleByName = {};
    state.vehicles.forEach((v) => { vehicleByName[v.name.toLowerCase()] = v; });

    for (let i = 1; i < lines.length; i++) {
      const cols = splitCSV(lines[i]);
      const get = (c) => idx[c] >= 0 ? (cols[idx[c]] || "").trim() : "";
      const vName = get("fahrzeug");
      let vehicleId;
      if (vehicleByName[vName.toLowerCase()]) {
        vehicleId = vehicleByName[vName.toLowerCase()].id;
      } else {
        const v = { id: vId(), name: vName, type: "", color: pickColor() };
        state.vehicles.push(v);
        vehicleByName[vName.toLowerCase()] = v;
        vehicleId = v.id;
      }
      let id = get("id") || bId();
      if (existingIds.has(id)) { skipped++; continue; }
      existingIds.add(id);
      state.bookings.push({
        id, vehicleId,
        from: get("von"), to: get("bis"), person: get("person"),
        organisation: get("organisation"), purpose: get("zweck"),
        contact: get("kontakt"), status: normStatus(get("status")), note: get("notiz"),
      });
      added++;
    }
    saveState();
    document.dispatchEvent(new CustomEvent("mm:dataChanged"));
    alert(`Import: ${added} Buchung(en) hinzugefügt, ${skipped} übersprungen.`);
    e.target.value = "";
  });
}

// Farben für importierte Fahrzeuge rotierend vergeben.
const PALETTE = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#db2777", "#65a30d"];
let palIdx = 0;
function pickColor() { return PALETTE[palIdx++ % PALETTE.length]; }

// ---------- Helfer ----------
function csvCell(v) {
  v = String(v ?? "");
  if (/[;"\n]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
  return v;
}
function splitCSV(line) {
  const out = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false;
      } else cur += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ";") { out.push(cur); cur = ""; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}
function readText(file, cb) {
  const r = new FileReader();
  r.onload = () => cb(r.result);
  r.readAsText(file, "UTF-8");
}
function download(name, content, type) {
  const blob = new Blob(["\uFEFF" + content], { type: type + ";charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
}
