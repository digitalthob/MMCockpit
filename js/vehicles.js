// js/vehicles.js — Fahrzeugverwaltung (anlegen, umbenennen, löschen, Farbe).
import { state, saveState, vId, vehicleById, nextColor, $, esc } from "./core.js";
import { populateVehicleSelects } from "./ui.js";

// Initialisiert den Tab "Fahrzeuge": Formular und Liste.
export function initVehicles() {
  $("#vehicle-form").addEventListener("submit", onAdd);
  renderVehicles();
}

function onAdd(e) {
  e.preventDefault();
  const name = $("#vehicle-name").value.trim();
  const type = $("#vehicle-type").value.trim();
  if (!name) return;
  state.vehicles.push({ id: vId(), name, type, color: nextColor() });
  saveState();
  $("#vehicle-name").value = "";
  $("#vehicle-type").value = "";
  renderVehicles();
  populateVehicleSelects();
  document.dispatchEvent(new CustomEvent("mm:dataChanged"));
}

export function renderVehicles() {
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
        <span class="v-dot" style="background:${v.color}"></span>
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
    b.addEventListener("click", () => deleteVehicle(b.dataset.delV)));
  ul.querySelectorAll("[data-rename]").forEach((b) =>
    b.addEventListener("click", () => renameVehicle(b.dataset.rename)));
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
  document.dispatchEvent(new CustomEvent("mm:dataChanged"));
}

function renameVehicle(id) {
  const v = vehicleById(id);
  if (!v) return;
  const name = prompt("Neuer Name:", v.name);
  if (name && name.trim()) {
    v.name = name.trim();
    saveState();
    renderVehicles();
    populateVehicleSelects();
    document.dispatchEvent(new CustomEvent("mm:dataChanged"));
  }
}
