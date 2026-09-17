// js/calendar.js — Wochen-Kalender (Raster pro Fahrzeug, Buchungen farbig).
import { state, DAYS, vehicleColor, vehicleName, statusLabel,
  parseDT, fmtDate, sameDay, startOfWeek, $ } from "./core.js";
import { openModal } from "./booking.js";

let weekStart = startOfWeek(new Date());

// Initialisiert die Wochen-Navigation.
export function initCalendar() {
  $("#prev-week").addEventListener("click", () => { weekStart.setDate(weekStart.getDate() - 7); renderCalendar(); });
  $("#next-week").addEventListener("click", () => { weekStart.setDate(weekStart.getDate() + 7); renderCalendar(); });
  $("#today-week").addEventListener("click", () => { weekStart = startOfWeek(new Date()); renderCalendar(); });
  renderCalendar();
}

export function renderCalendar() {
  const grid = $("#calendar-grid");
  const vehicles = state.vehicles;
  grid.style.gridTemplateColumns = `120px repeat(${DAYS.length}, 1fr)`;

  const wkEnd = new Date(weekStart);
  wkEnd.setDate(wkEnd.getDate() + 6);
  $("#week-label").textContent =
    `${weekStart.toLocaleDateString("de-DE", { day: "2-digit", month: "short" })} – ${wkEnd.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}`;

  grid.innerHTML = "";
  // Kopfzeile.
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
    cell.innerHTML = `${DAYS[i]} <span class="cal-day-num ${sameDay(d, today) ? "today" : ""}">${d.getDate()}</span>`;
    grid.appendChild(cell);
  }

  if (vehicles.length === 0) {
    const empty = document.createElement("div");
    empty.className = "cal-cell";
    empty.style.gridColumn = "1 / 9";
    empty.style.textAlign = "center";
    empty.style.color = "var(--muted)";
    empty.textContent = "Bitte erst unter „Fahrzeuge" ein Makermobil anlegen.";
    grid.appendChild(empty);
    return;
  }

  vehicles.forEach((v) => {
    const head = document.createElement("div");
    head.className = "cal-cell vehicle-head";
    head.innerHTML = `<span class="v-dot" style="background:${v.color}"></span>${v.name}`;
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
        b.vehicleId === v.id && parseDT(b.from) < next && parseDT(b.to) > d && b.status !== "abgelehnt");
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
