/* Makermobile Buchungstool – Beta
 * Reine Browser-App: Daten liegen im localStorage.
 * Status-Werte (intern, ohne Umlaute): angefragt, bestaetigt, abgelehnt, abgeschlossen
 */
(function () {
  "use strict";

  const STORAGE_KEY = "makermobile.cockpit.v1";
  const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  // ---------- Storage ----------
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && Array.isArray(s.bookings) && Array.isArray(s.vehicles)) return s;
      }
    } catch (e) {
      console.warn("Speicher konnte nicht gelesen werden:", e);
    }
    return {
      vehicles: [
        { id: vId(), name: "Makermobil 1", type: "" },
        { id: vId(), name: "Makermobil 2", type: "" },
      ],
      bookings: [],
    };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function vId() {
    return "v_" + Math.random().toString(36).slice(2, 9);
  }
  function bId() {
    return "b_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  let state = loadState();

  // ---------- Datum-Helfer ----------
  function parseDT(s) {
    if (!s) return null;
    const t = String(s).trim();
    // YYYY-MM-DDTHH:MM (datetime-local) oder YYYY-MM-DD HH:MM oder YYYY-MM-DD
    let iso = t.replace(" ", "T");
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) iso += "T00:00";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }
  function toLocalInput(d) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function fmtDate(d) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function startOfWeek(d) {
    const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const wd = (r.getDay() + 6) % 7; // Mo=0
    r.setDate(r.getDate() - wd);
    r.setHours(0, 0, 0, 0);
    return r;
  }

  // ---------- UI-Helfer ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function vehicleName(id) {
    const v = state.vehicles.find((x) => x.id === id);
    return v ? v.name : "—";
  }

  function statusLabel(s) {
    return { angefragt: "angefragt", bestaetigt: "bestätigt", abgelehnt: "abgelehnt", abgeschlossen: "abgeschlossen" }[s] || s;
  }

  // ---------- Tabs ----------
  $$('nav#tabs button').forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
  function switchTab(name) {
    $$('nav#tabs button').forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    $$(".tab").forEach((t) => t.classList.toggle("active", t.id === "tab-" + name));
    if (name === "calendar") renderCalendar();
    if (name === "list") renderList();
    if (name === "vehicles") renderVehicles();
  }

  // ---------- Fahrzeugverwaltung ----------
  $("#vehicle-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#vehicle-name").value.trim();
    const type = $("#vehicle-type").value.trim();
    if (!name) return;
    state.vehicles.push({ id: vId(), name, type });
    saveState();
    $("#vehicle-name").value = "";
    $("#vehicle-type").value = "";
    renderVehicles();
    populateVehicleSelects();
  });

  function renderVehicles() {
    const ul = $("#vehicle-list");
    ul.innerHTML = "";
    if (state.vehicles.length === 0) {
      ul.innerHTML = '<li style="justify-content:center;color:var(--muted)">Noch keine Fahrzeuge angelegt.</li>';
      return;
    }
    state.vehicles.forEach((v) => {
      const li = document.createElement("li");
      const count = state.bookings.filter((b) => b.vehicleId === v.id).length;
      li.innerHTML = `
        <div>
          <span class="v-name">${esc(v.name)}</span>
          ${v.type ? `<span class="v-type">(${esc(v.type)})</span>` : ""}
          <span class="v-type">${count} Buchung(en)</span>
        </div>
        <div>
          <button data-rename="${v.id}">Umbenennen</button>
          <button data-del-v="${v.id}" class="danger">Löschen</button>
        </div>`;
      ul.appendChild(li);
    });
    ul.querySelectorAll("[data-del-v]").forEach((b) =>
      b.addEventListener("click", () => deleteVehicle(b.dataset.delV))
    );
    ul.querySelectorAll("[data-rename]").forEach((b) =>
      b.addEventListener("click", () => renameVehicle(b.dataset.rename))
    );
  }

  function deleteVehicle(id) {
    const inUse = state.bookings.some((b) => b.vehicleId === id);
    if (inUse && !confirm("Diesem Fahrzeug sind Buchungen zugeordnet. Trotzdem löschen?")) return;
    if (!inUse && !confirm("Fahrzeug löschen?")) return;
    state.vehicles = state.vehicles.filter((v) => v.id !== id);
    if (inUse) state.bookings = state.bookings.filter((b) => b.vehicleId !== id);
    saveState();
    renderVehicles();
    populateVehicleSelects();
  }

  function renameVehicle(id) {
    const v = state.vehicles.find((x) => x.id === id);
    if (!v) return;
    const name = prompt("Neuer Name:", v.name);
    if (name && name.trim()) {
      v.name = name.trim();
      saveState();
      renderVehicles();
      populateVehicleSelects();
    }
  }

  function populateVehicleSelects() {
    const opts = state.vehicles.map((v) => `<option value="${v.id}">${esc(v.name)}</option>`).join("");
    $("#b-vehicle").innerHTML = opts || `<option value="">(kein Fahrzeug)</option>`;
    const fv = $("#filter-vehicle");
    const prev = fv.value;
    fv.innerHTML = `<option value="">Alle Fahrzeuge</option>` + opts;
    fv.value = prev;
  }

  // ---------- Buchungs-Dialog ----------
  const modal = $("#modal");
  $("#new-booking").addEventListener("click", () => openModal());
  $("#new-booking-2").addEventListener("click", () => openModal());

  $("#modal-close").addEventListener("click", closeModal);
  $("#cancel-booking").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal(); });

  function openModal(booking) {
    $("#booking-id").value = booking ? booking.id : "";
    $("#b-vehicle").value = booking ? booking.vehicleId : (state.vehicles[0] && state.vehicles[0].id) || "";
    $("#b-status").value = booking ? booking.status : "angefragt";
    $("#b-from").value = booking ? toLocalInput(parseDT(booking.from)) : "";
    $("#b-to").value = booking ? toLocalInput(parseDT(booking.to)) : "";
    $("#b-person").value = booking ? booking.person : "";
    $("#b-org").value = booking ? booking.organisation || "" : "";
    $("#b-contact").value = booking ? booking.contact || "" : "";
    $("#b-purpose").value = booking ? booking.purpose || "" : "";
    $("#b-note").value = booking ? booking.note || "" : "";
    $("#modal-title").textContent = booking ? "Buchung bearbeiten" : "Neue Buchung";
    $("#delete-booking").hidden = !booking;
    $("#form-error").hidden = true;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    if (!booking) {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0);
      $("#b-from").value = toLocalInput(next);
      $("#b-to").value = toLocalInput(new Date(next.getTime() + 4 * 3600 * 1000));
    }
    $("#b-vehicle").focus();
  }
  function closeModal() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }

  $("#booking-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const err = $("#form-error");
    const from = parseDT($("#b-from").value);
    const to = parseDT($("#b-to").value);
    const vehicleId = $("#b-vehicle").value;
    if (!vehicleId) { showErr("Bitte ein Fahrzeug wählen."); return; }
    if (!from || !to) { showErr("Bitte Von- und Bis-Datum angeben."); return; }
    if (to <= from) { showErr("Bis muss nach Von liegen."); return; }

    const id = $("#booking-id").value;
    const conflict = state.bookings.find((b) =>
      b.id !== id && b.vehicleId === vehicleId && b.status !== "abgelehnt" &&
      from < parseDT(b.to) && to > parseDT(b.from)
    );
    if (conflict && !confirm(`Zeitraum überschneidet sich mit "${conflict.person}" (${statusLabel(conflict.status)}). Trotzdem speichern?`)) return;

    const data = {
      vehicleId,
      from: $("#b-from").value,
      to: $("#b-to").value,
      person: $("#b-person").value.trim(),
      organisation: $("#b-org").value.trim(),
      contact: $("#b-contact").value.trim(),
      purpose: $("#b-purpose").value.trim(),
      note: $("#b-note").value.trim(),
      status: $("#b-status").value,
    };
    if (id) {
      const idx = state.bookings.findIndex((b) => b.id === id);
      state.bookings[idx] = { ...state.bookings[idx], ...data };
    } else {
      state.bookings.push({ id: bId(), ...data });
    }
    saveState();
    closeModal();
    rerender();
  });

  function showErr(msg) {
    const err = $("#form-error");
    err.textContent = msg;
    err.hidden = false;
  }

  $("#delete-booking").addEventListener("click", () => {
    const id = $("#booking-id").value;
    if (id && confirm("Buchung löschen?")) {
      state.bookings = state.bookings.filter((b) => b.id !== id);
      saveState();
      closeModal();
      rerender();
    }
  });

  // ---------- Listenansicht ----------
  function renderList() {
    const tbody = $("#booking-body");
    const q = $("#search").value.trim().toLowerCase();
    const fv = $("#filter-vehicle").value;
    const fs = $("#filter-status").value;
    const rows = state.bookings
      .filter((b) => {
        if (fv && b.vehicleId !== fv) return false;
        if (fs && b.status !== fs) return false;
        if (q) {
          const hay = [vehicleName(b.vehicleId), b.person, b.organisation, b.purpose, b.contact, b.note, statusLabel(b.status)].join(" ").toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => parseDT(a.from) - parseDT(b.from));

    tbody.innerHTML = "";
    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:var(--muted);padding:20px">Keine Buchungen</td></tr>`;
      return;
    }
    rows.forEach((b) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${esc(vehicleName(b.vehicleId))}</td>
        <td>${esc(fmtDate(parseDT(b.from)))}</td>
        <td>${esc(fmtDate(parseDT(b.to)))}</td>
        <td>${esc(b.person)}</td>
        <td>${esc(b.organisation || "")}</td>
        <td>${esc(b.purpose || "")}</td>
        <td>${esc(b.contact || "")}</td>
        <td><span class="status-pill ${b.status}">${statusLabel(b.status)}</span></td>
        <td>${esc(b.note || "")}</td>
        <td class="row-actions"><button data-edit="${b.id}">Bearbeiten</button></td>`;
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll("[data-edit]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const b = state.bookings.find((x) => x.id === btn.dataset.edit);
        if (b) openModal(b);
      })
    );
  }
  $("#search").addEventListener("input", renderList);
  $("#filter-vehicle").addEventListener("change", renderList);
  $("#filter-status").addEventListener("change", renderList);

  // ---------- Kalenderansicht ----------
  let weekStart = startOfWeek(new Date());
  $("#prev-week").addEventListener("click", () => { weekStart.setDate(weekStart.getDate() - 7); renderCalendar(); });
  $("#next-week").addEventListener("click", () => { weekStart.setDate(weekStart.getDate() + 7); renderCalendar(); });

  function renderCalendar() {
    const grid = $("#calendar-grid");
    const vehicles = state.vehicles;
    grid.style.gridTemplateColumns = `120px repeat(${DAYS.length}, 1fr)`;

    const wkEnd = new Date(weekStart);
    wkEnd.setDate(wkEnd.getDate() + 6);
    $("#week-label").textContent =
      `${weekStart.toLocaleDateString("de-DE", { day: "2-digit", month: "short" })} – ${wkEnd.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}`;

    grid.innerHTML = "";
    // Kopfzeile
    const corner = document.createElement("div");
    corner.className = "cal-cell head vehicle-head";
    corner.textContent = "Fahrzeug";
    grid.appendChild(corner);
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const cell = document.createElement("div");
      cell.className = "cal-cell head";
      const isToday = sameDay(d, today);
      cell.innerHTML = `${DAYS[i]} <span class="cal-day-num ${isToday ? "today" : ""}">${d.getDate()}</span>`;
      grid.appendChild(cell);
    }

    if (vehicles.length === 0) {
      const empty = document.createElement("div");
      empty.className = "cal-cell";
      empty.style.gridColumn = `1 / ${8 + 1}`;
      empty.style.textAlign = "center";
      empty.style.color = "var(--muted)";
      empty.textContent = "Bitte erst unter „Fahrzeuge“ mindestens ein Makermobil anlegen.";
      grid.appendChild(empty);
      return;
    }

    vehicles.forEach((v) => {
      const head = document.createElement("div");
      head.className = "cal-cell vehicle-head";
      head.textContent = v.name;
      grid.appendChild(head);

      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        d.setHours(0, 0, 0, 0);
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        const cell = document.createElement("div");
        cell.className = "cal-cell";

        const dayBookings = state.bookings.filter((b) =>
          b.vehicleId === v.id &&
          parseDT(b.from) < next &&
          parseDT(b.to) > d &&
          b.status !== "abgelehnt"
        );
        dayBookings.sort((a, b) => parseDT(a.from) - parseDT(b.from));
        dayBookings.forEach((b) => {
          const ev = document.createElement("div");
          ev.className = "event " + b.status;
          const start = parseDT(b.from) < d ? "↪" : fmtDate(parseDT(b.from)).slice(11);
          const end = parseDT(b.to) > next ? "→" : fmtDate(parseDT(b.to)).slice(11);
          ev.textContent = `${start}–${end} ${b.person}`;
          ev.title = `${v.name}: ${b.person}\n${fmtDate(parseDT(b.from))} – ${fmtDate(parseDT(b.to))}\nStatus: ${statusLabel(b.status)}${b.purpose ? "\n" + b.purpose : ""}`;
          ev.addEventListener("click", () => openModal(b));
          cell.appendChild(ev);
        });
        grid.appendChild(cell);
      }
    });
  }

  // ---------- CSV Import/Export ----------
  const CSV_COLS = ["id", "fahrzeug", "von", "bis", "person", "organisation", "zweck", "kontakt", "status", "notiz"];

  $("#export-csv").addEventListener("click", () => {
    const rows = [CSV_COLS.join(";")];
    state.bookings.forEach((b) => {
      rows.push([
        b.id,
        vehicleName(b.vehicleId),
        b.from,
        b.to,
        b.person,
        b.organisation || "",
        b.purpose || "",
        b.contact || "",
        b.status,
        b.note || "",
      ].map(csvCell).join(";"));
    });
    download("makermobile-buchungen.csv", rows.join("\r\n"), "text/csv");
  });

  $("#export-json").addEventListener("click", () => {
    download("makermobile-backup.json", JSON.stringify(state, null, 2), "application/json");
  });

  $("#import-json").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    readText(file, (txt) => {
      try {
        const s = JSON.parse(txt);
        if (!Array.isArray(s.bookings) || !Array.isArray(s.vehicles)) throw new Error("Format");
        state = s;
        saveState();
        populateVehicleSelects();
        rerender();
        alert("Backup wiederhergestellt.");
      } catch (err) {
        alert("Ungültige JSON-Datei: " + err.message);
      }
      e.target.value = "";
    });
  });

  $("#import-csv").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    readText(file, (txt) => {
      const lines = txt.split(/\r?\n/).filter((l) => l.trim() !== "");
      if (lines.length < 1) { alert("Leere Datei."); return; }
      const header = splitCSV(lines[0]);
      const idx = {};
      CSV_COLS.forEach((c, i) => { idx[c] = header.indexOf(c); });
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
        let vehicleId;
        const vName = get("fahrzeug");
        if (vehicleByName[vName.toLowerCase()]) {
          vehicleId = vehicleByName[vName.toLowerCase()].id;
        } else {
          const v = { id: vId(), name: vName, type: "" };
          state.vehicles.push(v);
          vehicleByName[vName.toLowerCase()] = v;
          vehicleId = v.id;
        }
        let id = get("id") || bId();
        if (existingIds.has(id)) { skipped++; continue; }
        existingIds.add(id);
        let status = get("status") || "angefragt";
        status = normalizeStatus(status);
        state.bookings.push({
          id,
          vehicleId,
          from: get("von"),
          to: get("bis"),
          person: get("person"),
          organisation: get("organisation"),
          purpose: get("zweck"),
          contact: get("kontakt"),
          status,
          note: get("notiz"),
        });
        added++;
      }
      saveState();
      populateVehicleSelects();
      rerender();
      alert(`Import: ${added} Buchung(en) hinzugefügt, ${skipped} übersprungen.`);
      e.target.value = "";
    });
  });

  function normalizeStatus(s) {
    const map = { angefragt: "angefragt", "angefragt": "angefragt", bestaetigt: "bestaetigt", "bestätigt": "bestaetigt", abgelehnt: "abgelehnt", abgeschlossen: "abgeschlossen" };
    return map[s] || "angefragt";
  }
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
          if (line[i + 1] === '"') { cur += '"'; i++; }
          else inQ = false;
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

  // ---------- XSS-Helfer ----------
  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // ---------- Init ----------
  function rerender() {
    const active = document.querySelector('nav#tabs button.active')?.dataset.tab;
    if (active === "calendar") renderCalendar();
    if (active === "list") renderList();
    if (active === "vehicles") renderVehicles();
  }

  populateVehicleSelects();
  renderCalendar();
  renderVehicles();
})();
