// js/timeline.js — Selbstgebaute Zeitstrahl-Ansicht (Gantt-ähnlich, ohne externe Lib).
// Pro Fahrzeug eine Zeile; Buchungen als Balken entlang der Zeitachse.
// Bedienung: +/- Bereich, Klick auf Balken öffnet die Buchung.
import { state, vehicleColor, vehicleName, statusLabel,
  parseDT, fmtDate, fmtDateShort, startOfWeek, addDays, $, esc } from "./core.js";
import { openModal } from "./booking.js";

// Standard-Zeitfenster: ab heute 14 Tage. Per +-Button anpassbar.
let rangeStart = startOfWeek(new Date());
let rangeDays = 14;

export function initTimeline() {
  $("#tl-prev").addEventListener("click", () => { rangeStart = addDays(rangeStart, -7); renderTimeline(); });
  $("#tl-next").addEventListener("click", () => { rangeStart = addDays(rangeStart, 7); renderTimeline(); });
  $("#tl-zoom-in").addEventListener("click", () => { rangeDays = Math.max(7, rangeDays - 7); renderTimeline(); });
  $("#tl-zoom-out").addEventListener("click", () => { rangeDays = Math.min(60, rangeDays + 7); renderTimeline(); });
  renderTimeline();
}

export function renderTimeline() {
  const wrap = $("#timeline");
  const rangeEnd = addDays(rangeStart, rangeDays);
  $("#tl-label").textContent =
    `${rangeStart.toLocaleDateString("de-DE", { day: "2-digit", month: "short" })} – ${rangeEnd.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}`;

  if (state.vehicles.length === 0) {
    wrap.innerHTML = '<p class="empty">Bitte erst unter „Fahrzeuge" ein Makermobil anlegen.</p>';
    return;
  }

  // Tages-Spaltenkopf.
  const totalMs = rangeEnd - rangeStart;
  let html = `<div class="tl-scroll"><table class="tl-table"><thead><tr>
      <th class="tl-vehicle-col">Fahrzeug</th>`;
  for (let i = 0; i < rangeDays; i++) {
    const d = addDays(rangeStart, i);
    const wd = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"][(d.getDay() + 6) % 7];
    const isWeekend = (d.getDay() === 0 || d.getDay() === 6);
    html += `<th class="${isWeekend ? "we" : ""}"><span class="tl-wd">${wd}</span><span class="tl-day">${d.getDate()}</span></th>`;
  }
  html += `</tr></thead><tbody>`;

  state.vehicles.forEach((v) => {
    html += `<tr><th class="tl-vehicle-col"><span class="v-dot" style="background:${v.color}"></span>${esc(v.name)}</th>`;
    for (let i = 0; i < rangeDays; i++) {
      const d = addDays(rangeStart, i);
      const isWeekend = (d.getDay() === 0 || d.getDay() === 6);
      html += `<td class="tl-cell ${isWeekend ? "we" : ""}" data-vid="${v.id}" data-day="${i}"></td>`;
    }
    html += `</tr>`;
  });
  html += `</tbody></table></div>`;
  wrap.innerHTML = html;

  // Buchungen als Balken absolut positionieren.
  const cells = wrap.querySelectorAll(".tl-cell");
  if (!cells.length) return;
  const sample = cells[0];
  const cellW = sample.getBoundingClientRect().width || 40;
  const cellH = sample.getBoundingClientRect().height || 40;

  state.vehicles.forEach((v, vIdx) => {
    const dayCells = wrap.querySelectorAll(`.tl-cell[data-vid="${v.id}"]`);
    const rowEl = dayCells[0]?.parentElement;
    if (!rowEl) return;
    const rowTop = rowEl.offsetTop;

    state.bookings
      .filter((b) => b.vehicleId === v.id && b.status !== "abgelehnt")
      .forEach((b) => {
        const from = parseDT(b.from);
        const to = parseDT(b.to);
        if (to <= rangeStart || from >= rangeEnd) return;
        const start = from < rangeStart ? rangeStart : from;
        const end = to > rangeEnd ? rangeEnd : to;
        const offsetDays = (start - rangeStart) / (24 * 3600 * 1000);
        const lenDays = (end - start) / (24 * 3600 * 1000);
        const left = (vehicleColW() || 120) + offsetDays * cellW;
        const width = Math.max(cellW * 0.15, lenDays * cellW - 2);
        const bar = document.createElement("div");
        bar.className = "tl-bar " + b.status;
        bar.style.left = `${left}px`;
        bar.style.width = `${width}px`;
        bar.style.top = `${rowTop + 4}px`;
        bar.style.height = `${cellH - 8}px`;
        bar.title = `${v.name}: ${b.person}\n${fmtDate(from)} – ${fmtDate(to)}\nStatus: ${statusLabel(b.status)}`;
        bar.innerHTML = `<span>${esc(b.person)}${b.organisation ? " · " + esc(b.organisation) : ""}</span>`;
        bar.addEventListener("click", () => openModal(b));
        wrap.querySelector(".tl-scroll").appendChild(bar);
      });
  });
}

// Breite der Fahrzeug-Spalte ermitteln.
function vehicleColW() {
  const th = document.querySelector(".tl-vehicle-col");
  return th ? th.getBoundingClientRect().width : 120;
}

// Neu rendern bei Größenänderung (z.B. Fenster-Resize).
window.addEventListener("resize", () => {
  if (!document.getElementById("tab-timeline")?.classList.contains("active")) return;
  renderTimeline();
});
