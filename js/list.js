// js/list.js — Listenansicht mit Suche, Filter und Schnell-Statuswechsel.
import { state, vehicleName, statusLabel, parseDT, fmtDate, esc, $ } from "./core.js";
import { openModal, setStatus } from "./booking.js";

// Initialisiert Such-/Filter-Listener.
export function initList() {
  $("#search").addEventListener("input", renderList);
  $("#filter-vehicle").addEventListener("change", renderList);
  $("#filter-status").addEventListener("change", renderList);
}

export function renderList() {
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
    tbody.innerHTML = `<tr><td colspan="10" class="empty-row">Keine Buchungen</td></tr>`;
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
      <td>
        <select class="inline-status" data-id="${b.id}">
          <option value="angefragt"${b.status === "angefragt" ? " selected" : ""}>angefragt</option>
          <option value="bestaetigt"${b.status === "bestaetigt" ? " selected" : ""}>bestätigt</option>
          <option value="abgelehnt"${b.status === "abgelehnt" ? " selected" : ""}>abgelehnt</option>
          <option value="abgeschlossen"${b.status === "abgeschlossen" ? " selected" : ""}>abgeschlossen</option>
        </select>
      </td>
      <td class="note-cell">${esc(b.note || "")}</td>
      <td class="row-actions"><button data-edit="${b.id}">Bearbeiten</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll("[data-edit]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const b = state.bookings.find((x) => x.id === btn.dataset.edit);
      if (b) openModal(b);
    }));
  tbody.querySelectorAll(".inline-status").forEach((sel) =>
    sel.addEventListener("change", () => setStatus(sel.dataset.id, sel.value)));
}
