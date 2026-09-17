// js/booking.js — Buchungs-Dialog (anlegen, bearbeiten, löschen) mit Kollisionsprüfung.
import { state, saveState, bId, vehicleName, statusLabel, normStatus,
  parseDT, toLocalInput, fmtDate, $ } from "./core.js";

const modal = $("#modal");

// Initialisiert alle Dialog-Buttons (einmalig beim Start).
export function initBookingDialog() {
  $("#new-booking").addEventListener("click", () => openModal());
  $("#new-booking-2").addEventListener("click", () => openModal());
  $("#new-booking-tl").addEventListener("click", () => openModal());
  $("#modal-close").addEventListener("click", closeModal);
  $("#cancel-booking").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
  });
  $("#booking-form").addEventListener("submit", onSave);
  $("#delete-booking").addEventListener("click", onDelete);
}

// Öffnet den Dialog. Ohne Argument = neue Buchung, sonst Bearbeiten.
export function openModal(booking) {
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
    // Vorschlag: morgen 09:00–13:00 Uhr.
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

function showErr(msg) {
  const err = $("#form-error");
  err.textContent = msg;
  err.hidden = false;
}

function onSave(e) {
  e.preventDefault();
  const from = parseDT($("#b-from").value);
  const to = parseDT($("#b-to").value);
  const vehicleId = $("#b-vehicle").value;
  if (!vehicleId) { showErr("Bitte ein Fahrzeug wählen."); return; }
  if (!from || !to) { showErr("Bitte Von- und Bis-Datum angeben."); return; }
  if (to <= from) { showErr("Bis muss nach Von liegen."); return; }

  const id = $("#booking-id").value;
  // Kollisionsprüfung: Überschneidung desselben Fahrzeugs (abgelehnte ignorieren).
  const conflict = state.bookings.find((b) =>
    b.id !== id && b.vehicleId === vehicleId && b.status !== "abgelehnt" &&
    from < parseDT(b.to) && to > parseDT(b.from));
  if (conflict && !confirm(`Zeitraum überschneidet sich mit „${conflict.person}" (${statusLabel(conflict.status)}). Trotzdem speichern?`)) return;

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
  document.dispatchEvent(new CustomEvent("mm:dataChanged"));
}

function onDelete() {
  const id = $("#booking-id").value;
  if (id && confirm("Buchung löschen?")) {
    state.bookings = state.bookings.filter((b) => b.id !== id);
    saveState();
    closeModal();
    document.dispatchEvent(new CustomEvent("mm:dataChanged"));
  }
}

// Schnell-Statuswechsel aus der Liste (z.B. Anfrage bestätigen).
export function setStatus(bookingId, newStatus) {
  const b = state.bookings.find((x) => x.id === bookingId);
  if (!b) return;
  b.status = normStatus(newStatus);
  saveState();
  document.dispatchEvent(new CustomEvent("mm:dataChanged"));
}
