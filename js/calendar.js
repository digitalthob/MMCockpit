// js/calendar.js — Kalender: Wochen-Raster pro Fahrzeug + Monatsübersicht.
import { state, DAYS, vehicleColor, vehicleName, statusLabel,
  parseDT, fmtDate, sameDay, startOfWeek, $ } from "./core.js";
import { openModal } from "./booking.js";

let weekStart = startOfWeek(new Date());
let monthCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let view = "week";

// Initialisiert Navigation (Woche/Monat) und Ansichts-Umschalter.
export function initCalendar() {
  $("#prev-week").addEventListener("click", () => { step(-1); renderCalendar(); });
  $("#next-week").addEventListener("click", () => { step(1); renderCalendar(); });
  $("#today-week").addEventListener("click", () => {
    weekStart = startOfWeek(new Date());
    monthCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    renderCalendar();
  });
  $("#view-week").addEventListener("click", () => setView("week"));
  $("#view-month").addEventListener("click", () => setView("month"));
  renderCalendar();
}

function step(dir) {
  if (view === "month") {
    monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + dir, 1);
  } else {
    weekStart.setDate(weekStart.getDate() + dir * 7);
  }
}

function setView(v) {
  view = v;
  renderCalendar();
}

export function renderCalendar() {
  const isMonth = view === "month";
  $("#view-week").classList.toggle("active", !isMonth);
  $("#view-month").classList.toggle("active", isMonth);
  if (isMonth) {
    $("#week-wrap").hidden = true;
    $("#month-wrap").hidden = false;
    renderMonth();
  } else {
    $("#week-wrap").hidden = false;
    $("#month-wrap").hidden = true;
    renderWeek();
  }
}

// ---------- Monatsansicht ----------
function renderMonth() {
  const grid = $("#month-grid");
  const y = monthCursor.getFullYear();
  const m = monthCursor.getMonth();
  $("#week-label").textContent =
    monthCursor.toLocaleDateString("de-DE", { month: "long", year: "numeric" });

  grid.innerHTML = "";
  DAYS.forEach((d) => {
    const h = document.createElement("div");
    h.className = "month-cell head";
    h.textContent = d;
    grid.appendChild(h);
  });

  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const weeks = Math.ceil((offset + daysInMonth) / 7);
  let cur = startOfWeek(new Date(y, m, 1));
  const today = new Date();

  for (let w = 0; w < weeks; w++) {
    for (let i = 0; i < 7; i++) {
      const d = new Date(cur);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const inMonth = d.getMonth() === m;
      const cell = document.createElement("div");
      cell.className = "month-cell" + (inMonth ? "" : " off") + (i >= 5 ? " we" : "");

      const num = document.createElement("span");
      num.className = "month-day-num" + (sameDay(d, today) ? " today" : "");
      num.textContent = d.getDate();
      cell.appendChild(num);

      if (inMonth) {
        const dayBookings = state.bookings.filter((b) =>
          b.status !== "abgelehnt" && parseDT(b.from) < next && parseDT(b.to) > d);
        dayBookings.sort((a, b) => parseDT(a.from) - parseDT(b.from));
        const shown = dayBookings.slice(0, 3);
        shown.forEach((b) => {
          const ev = document.createElement("span");
          ev.className = "event " + b.status;
          ev.innerHTML = `<span class="v-dot" style="background:${vehicleColor(b.vehicleId)}"></span>${b.person}`;
          ev.title = `${vehicleName(b.vehicleId)}: ${b.person}\n${fmtDate(parseDT(b.from))} – ${fmtDate(parseDT(b.to))}\nStatus: ${statusLabel(b.status)}${b.purpose ? "\n" + b.purpose : ""}`;
          ev.addEventListener("click", (e) => { e.stopPropagation(); openModal(b); });
          cell.appendChild(ev);
        });
        if (dayBookings.length > shown.length) {
          const more = document.createElement("span");
          more.className = "event more";
          more.textContent = `+${dayBookings.length - shown.length} weitere`;
          more.addEventListener("click", (e) => { e.stopPropagation(); openModal(null, d); });
          cell.appendChild(more);
        }
        cell.addEventListener("click", (e) => {
          if (e.target === cell || e.target === num) openModal(null, d);
        });
      }
      grid.appendChild(cell);
      cur.setDate(cur.getDate() + 1);
    }
  }
}

// ---------- Wochenansicht ----------
function renderWeek() {
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
    empty.textContent = "Bitte erst unter „Fahrzeuge“ ein Makermobil anlegen.";
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
