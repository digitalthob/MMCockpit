/* Makermobil Cockpit – Anwendungslogik
   Liest alle Zahlen aus window.MM_COCKPIT_DATA (data/cockpit-data.js).
   Abhängigkeiten (optional, per CDN): Chart.js, Leaflet.
   Fehlen sie (z. B. offline), zeigt das Cockpit Hinweise statt Diagrammen/Karte. */
(function () {
  "use strict";

  const D = window.MM_COCKPIT_DATA;
  const root = document.getElementById("mm-cockpit");
  if (!D || !root) return;

  const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const MON = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HAS_CHART = typeof window.Chart !== "undefined";
  const HAS_MAP = typeof window.L !== "undefined";

  // ── Helfer ──────────────────────────────────────────────────────────
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (n) => (n === null || n === undefined ? "—" : Number(n).toLocaleString("de-DE"));
  const pct = (a, b) => (a == null || !b ? null : (a / b) * 100);
  const fmtPct = (p) => (p == null ? "—" : p.toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " %");
  const sum = (arr) => arr.reduce((s, x) => s + (x || 0), 0);

  // "2026-03" → fortlaufender Monatsindex
  const ymIdx = (ym) => { const [y, m] = ym.split("-").map(Number); return y * 12 + (m - 1); };
  const idxYear = (i) => Math.floor(i / 12);
  const idxMonth = (i) => i % 12;
  const idxLabel = (i, long) => (long ? MONTHS : MON)[idxMonth(i)] + " " + idxYear(i);
  function fmtRange(vonIdx, bisIdx) {
    if (vonIdx === bisIdx) return idxLabel(vonIdx);
    if (idxYear(vonIdx) === idxYear(bisIdx)) return MON[idxMonth(vonIdx)] + "–" + MON[idxMonth(bisIdx)] + " " + idxYear(bisIdx);
    return idxLabel(vonIdx) + " – " + idxLabel(bisIdx);
  }
  function fmtDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }
  function fmtMsDate(s) {
    if (/^\d{4}-\d{2}$/.test(s)) return MONTHS[Number(s.slice(5)) - 1] + " " + s.slice(0, 4);
    return s;
  }
  function textOn(hex) {
    const c = hex.replace("#", "");
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.substr(i, 2), 16) / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55 ? "#1e2333" : "#ffffff";
  }

  const mmById = (id) => D.makermobile.find((m) => m.id === id) || { id, name: "MM " + id, farbe: "", color: "#9ca3af" };
  const mmLabel = (m) => m.name + (m.farbe ? " · " + m.farbe : "");
  const ort = (key) => D.orte[key] || { name: key, typ: "mz", coords: null };

  // Belegungen mit vorberechneten Indizes
  const BEL = D.belegungen.map((b, i) => ({ ...b, i, a: ymIdx(b.von), z: ymIdx(b.bis), typ: ort(b.ort).typ }));
  const months = (b, from, to) => Math.max(0, Math.min(b.z, to) - Math.max(b.a, from) + 1);
  const inRange = (b, from, to) => b.z >= from && b.a <= to;

  const PHASES = D.phasen;
  const phaseYear = (p) => (/^\d{4}$/.test(p.key) ? Number(p.key) : null);
  const flag = (obj, hint) => (obj && obj.pruefen ? `<span class="mmc-flag" title="${esc(hint || "Wert wird noch geprüft")}">*</span>` : "");

  // ── Laufzeit-Zustand (Charts/Karte werden beim Ansichtswechsel abgebaut) ──
  let charts = [];
  let map = null;
  function teardown() {
    charts.forEach((c) => c.destroy());
    charts = [];
    if (map) { map.remove(); map = null; }
  }

  if (HAS_CHART) {
    Chart.defaults.font.family = "Inter, 'Segoe UI', sans-serif";
    Chart.defaults.color = "#5f6675";
    Chart.defaults.plugins.tooltip.backgroundColor = "#1a1a2e";
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    if (REDUCED) Chart.defaults.animation = false;
  }

  // ── Grundgerüst ────────────────────────────────────────────────────
  const TABS = [{ key: "bilanz", tab: "Gesamtbilanz", label: "2023–2026", color: "#80a22b" }]
    .concat(PHASES.map((p) => ({ key: p.key, tab: p.tab, label: p.label, color: p.color })));

  root.innerHTML = `
    <header class="mmc-header">
      <div class="mmc-logo"><img src="assets/img/logo.png" alt="makermobil – Lernen durch Machen"></div>
      <div>
        <h1>${esc(D.meta.titel)}</h1>
        <p>${esc(D.meta.untertitel)}</p>
      </div>
      <div class="mmc-stand">
        <div class="mmc-stand-label">Datenstand</div>
        <div class="mmc-stand-date">${fmtDate(D.meta.datenstand)}</div>
      </div>
    </header>
    ${D.meta.vorlaeufig ? `<div class="mmc-banner"><strong>Vorläufige Zahlen.</strong> Die finalen Projektzahlen werden nach Abschluss ergänzt. Mit <span class="mmc-flag">*</span> markierte Werte werden noch geprüft.</div>` : ""}
    <nav class="mmc-tabs" role="tablist" aria-label="Projektphasen">
      ${TABS.map((t) => `<button class="mmc-tab" role="tab" data-key="${t.key}" style="--tab-color:${t.color}" aria-selected="false">
        <span class="mmc-tab-dot" style="background:${t.color}"></span>${esc(t.tab)}<span class="mmc-tab-sub">${esc(t.label)}</span></button>`).join("")}
    </nav>
    <main class="mmc-container"><div class="mmc-view" id="mmc-view" role="tabpanel"></div></main>
    <footer class="mmc-footer">${esc(D.meta.titel)} · ${esc(D.meta.traeger)} · Projektlaufzeit ${idxYear(ymIdx(D.meta.laufzeit.von))}–${idxYear(ymIdx(D.meta.laufzeit.bis))} · Datenstand ${fmtDate(D.meta.datenstand)}</footer>
  `;
  const view = root.querySelector("#mmc-view");

  root.querySelectorAll(".mmc-tab").forEach((b) =>
    b.addEventListener("click", () => { location.hash = b.dataset.key; }));
  root.querySelector(".mmc-tabs").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const btns = [...root.querySelectorAll(".mmc-tab")];
    const i = btns.indexOf(document.activeElement);
    if (i < 0) return;
    const n = btns[(i + (e.key === "ArrowRight" ? 1 : btns.length - 1)) % btns.length];
    n.focus(); n.click();
  });

  function route() {
    const key = decodeURIComponent(location.hash.replace("#", "")) || "bilanz";
    const tab = TABS.find((t) => t.key === key) || TABS[0];
    root.querySelectorAll(".mmc-tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.key === tab.key)));
    teardown();
    if (tab.key === "bilanz") renderBilanz();
    else {
      const p = PHASES.find((x) => x.key === tab.key);
      if (phaseYear(p)) renderYear(p); else renderAufbau(p);
    }
    animate(view);
  }
  window.addEventListener("hashchange", route);

  // ── Bausteine ──────────────────────────────────────────────────────
  function kpi({ icon, value, label, sub, accent, flagHtml, raw }) {
    const shown = typeof value === "number" ? `<span data-count="${value}">0</span>` : esc(value);
    return `<div class="mmc-kpi" style="--accent:${accent}">
      <span class="mmc-kpi-icon" aria-hidden="true">${icon}</span>
      <div class="mmc-kpi-value">${raw || shown}${flagHtml || ""}</div>
      <div class="mmc-kpi-label">${esc(label)}</div>
      ${sub ? `<div class="mmc-kpi-sub">${sub}</div>` : ""}
    </div>`;
  }
  function card(title, icon, accent, body, badge) {
    return `<section class="mmc-card">
      <div class="mmc-card-head">
        <div class="mmc-card-icon" style="--accent:${accent}" aria-hidden="true">${icon}</div>
        <h3>${title}</h3>${badge || ""}
      </div>${body}</section>`;
  }
  const empty = (txt) => `<div class="mmc-empty">${esc(txt || "Daten folgen")}</div>`;
  const chartBox = (id, tall) => (HAS_CHART ? `<div class="${tall ? "mmc-chart-tall" : "mmc-chart"}"><canvas id="${id}"></canvas></div>`
    : empty("Diagramm nicht verfügbar (Chart.js konnte nicht geladen werden)."));

  function progress(label, ist, plan, color) {
    const p = pct(ist, plan);
    return `<div class="mmc-progress">
      <div class="mmc-progress-row"><span>${esc(label)}</span>
        <span><strong style="color:#5b7a12">${num(ist)}</strong> <span class="mmc-muted">von ${num(plan)} geplant (${fmtPct(p)})</span></span></div>
      <div class="mmc-bar"><div class="mmc-bar-fill" data-w="${Math.min(100, p || 0)}%" ${color ? `style="background:${color}"` : ""}></div></div>
    </div>`;
  }

  function animate(scope) {
    // Fortschrittsbalken
    requestAnimationFrame(() => scope.querySelectorAll(".mmc-bar-fill[data-w]").forEach((el) => { el.style.width = el.dataset.w; }));
    // Zähler
    scope.querySelectorAll("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      if (REDUCED) { el.textContent = target.toLocaleString("de-DE"); return; }
      const from = target > 1000 ? Math.round(target * 0.9) : 0;
      const start = performance.now(), dur = 1200;
      (function tick(now) {
        const t = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(from + (target - from) * e).toLocaleString("de-DE");
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    });
  }

  // ── Zeitstrahl (Gantt) ─────────────────────────────────────────────
  function ganttBlock(id, from, to, opts) {
    return `<div class="mmc-filters" id="${id}-ctl">
        <div class="mmc-filter"><label>Ansicht</label>
          <div class="mmc-seg" role="group" aria-label="Zeitstrahl gruppieren nach">
            <button type="button" data-mode="ort" aria-pressed="${opts.mode === "ort"}">je Medienzentrum</button>
            <button type="button" data-mode="mm" aria-pressed="${opts.mode === "mm"}">je Makermobil</button>
          </div></div>
      </div>
      <div class="mmc-gantt-wrap"><div class="mmc-gantt" id="${id}"></div></div>
      <div class="mmc-legend">
        <span><i style="background:#44a1d7"></i>Einsatz bei Medienzentrum (Farbe = Makermobil)</span>
        <span><i style="background:#cfe4f3;border:1.5px dashed #44a1d7"></i>beim Team Makermobil</span>
        <span><i style="background:repeating-linear-gradient(135deg,#fde68a,#fde68a 3px,#fef3c7 3px,#fef3c7 6px)"></i>Inspektion</span>
        <span><i style="background:#a92626;width:2px"></i>heute</span>
      </div>
      <div class="mmc-detail" id="${id}-detail" hidden></div>`;
  }

  function wireGantt(id, from, to, getFilter, initialMode) {
    let mode = initialMode;
    const ctl = root.querySelector("#" + id + "-ctl");
    ctl.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
      mode = b.dataset.mode;
      ctl.querySelectorAll("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      draw();
    }));
    function draw() { drawGantt(id, from, to, mode, getFilter ? getFilter() : null); }
    draw();
    return draw;
  }

  function drawGantt(id, from, to, mode, mmFilter) {
    const el = root.querySelector("#" + id);
    const detail = root.querySelector("#" + id + "-detail");
    const total = to - from + 1;
    const L = (i) => ((i - from) / total) * 100;
    let items = BEL.filter((b) => inRange(b, from, to) && (!mmFilter || b.mm === mmFilter));

    // Kopfzeile
    let head = "";
    for (let i = from; i <= to; i++) {
      head += `<div class="mmc-g-month" style="left:${L(i)}%;width:${100 / total}%">${total > 18 ? MON[idxMonth(i)][0] : MON[idxMonth(i)]}</div>`;
      if (idxMonth(i) === 0 || i === from) head += `<div class="mmc-g-year" style="left:${L(i)}%">${idxYear(i)}</div>`;
    }
    let grid = "";
    for (let i = from; i <= to; i++) grid += `<div class="mmc-g-grid${idxMonth(i) === 0 ? " mmc-g-ystart" : ""}" style="left:${L(i)}%"></div>`;
    const now = new Date();
    const nowIdx = now.getFullYear() * 12 + now.getMonth() + (now.getDate() - 1) / 31;
    const today = nowIdx >= from && nowIdx < to + 1 ? `<div class="mmc-g-today" style="left:${L(nowIdx)}%" title="heute"></div>` : "";

    // Zeilen bilden
    let rows;
    if (mode === "mm") {
      const ids = mmFilter ? [mmFilter] : D.makermobile.map((m) => m.id);
      rows = ids.map((mid) => {
        const m = mmById(mid);
        return { label: `<span class="mmc-dot" style="background:${m.color}"></span>${esc(m.name)} <small>${esc(m.farbe)}</small>`,
          items: items.filter((b) => b.mm === mid) };
      });
    } else {
      const keys = [...new Set(items.filter((b) => b.typ !== "service").map((b) => b.ort))];
      keys.sort((a, b) => {
        const ta = ort(a).typ === "team", tb = ort(b).typ === "team";
        if (ta !== tb) return ta ? 1 : -1;
        return Math.min(...items.filter((x) => x.ort === a).map((x) => x.a)) - Math.min(...items.filter((x) => x.ort === b).map((x) => x.a));
      });
      // Inspektionen sind kein Standort – sie erscheinen nur in der Ansicht „je Makermobil“.
      rows = keys.map((k) => ({ label: esc(ort(k).name), items: items.filter((b) => b.ort === k) }));
    }

    const html = rows.map((r) => {
      // Überlappungen in Spuren verteilen
      const lanes = [];
      r.items.slice().sort((a, b) => a.a - b.a).forEach((b) => {
        let l = lanes.findIndex((end) => end < b.a);
        if (l < 0) { l = lanes.length; lanes.push(b.z); } else lanes[l] = b.z;
        b._lane = l;
      });
      const h = Math.max(1, lanes.length) * 30 + 4;
      const bars = r.items.map((b) => {
        const a = Math.max(b.a, from), z = Math.min(b.z, to);
        const m = mmById(b.mm);
        const n = months(b, from, to);
        const cls = b.typ === "team" ? " is-team" : b.typ === "service" ? " is-service" : "";
        const txt = mode === "mm" ? (b.typ === "team" ? "Team MM" : ort(b.ort).name) : m.name;
        const label = `${txt}${n > 1 ? " · " + n + " Mon." : ""}`;
        const aria = `${mmLabel(m)} – ${ort(b.ort).name}, ${fmtRange(b.a, b.z)} (${months(b, -Infinity, Infinity)} Monate)`;
        return `<button type="button" class="mmc-g-bar${cls}" data-i="${b.i}" style="left:calc(${L(a)}% + 1px);width:calc(${((z - a + 1) / total) * 100}% - 2px);top:${5 + b._lane * 30}px;--bar:${m.color};--bar-text:${textOn(m.color)}" title="${esc(aria)}" aria-label="${esc(aria)}">${esc(label)}</button>`;
      }).join("");
      return `<div class="mmc-g-row"><div class="mmc-g-label">${r.label}</div><div class="mmc-g-track" style="height:${h}px">${grid}${today}${bars}</div></div>`;
    }).join("");

    el.innerHTML = `<div class="mmc-g-row mmc-g-head"><div class="mmc-g-label"></div><div class="mmc-g-track">${head}</div></div>` +
      (html || `<div style="padding:16px">${empty("Keine Belegungen im gewählten Zeitraum.")}</div>`);

    detail.hidden = true;
    el.querySelectorAll(".mmc-g-bar").forEach((btn) => btn.addEventListener("click", () => {
      const b = BEL[Number(btn.dataset.i)];
      const m = mmById(b.mm);
      detail.style.setProperty("--bar", m.color);
      detail.innerHTML = `<strong>${esc(mmLabel(m))}</strong> bei <strong>${esc(ort(b.ort).name)}</strong>
        <div class="mmc-detail-grid">
          <div><span>Zeitraum</span><strong>${fmtRange(b.a, b.z)}</strong></div>
          <div><span>Dauer</span><strong>${months(b, -Infinity, Infinity)} Monat(e)</strong></div>
          <div><span>Workshops</span><strong>${num(b.workshops)}</strong></div>
          <div><span>Personen erreicht</span><strong>${num(b.personen)}</strong></div>
        </div>${b.notiz ? `<div style="margin-top:8px;color:#5f6675">${esc(b.notiz)}</div>` : ""}`;
      detail.hidden = false;
    }));
  }

  // ── Tabelle: Nutzung je Medienzentrum ──────────────────────────────
  function mzTable(from, to) {
    const items = BEL.filter((b) => b.typ === "mz" && inRange(b, from, to));
    const keys = [...new Set(items.map((b) => b.ort))]
      .sort((a, b) => Math.min(...items.filter((x) => x.ort === a).map((x) => x.a)) - Math.min(...items.filter((x) => x.ort === b).map((x) => x.a)));
    if (!keys.length) return empty("Für diesen Zeitraum sind keine Einsätze bei Medienzentren erfasst.");
    const rows = keys.map((k) => {
      const its = items.filter((b) => b.ort === k).sort((a, b) => a.a - b.a);
      const mms = [...new Set(its.map((b) => b.mm))].map(mmById);
      const mon = sum(its.map((b) => months(b, from, to)));
      const ws = its.some((b) => b.workshops != null) ? sum(its.map((b) => b.workshops)) : null;
      const ps = its.some((b) => b.personen != null) ? sum(its.map((b) => b.personen)) : null;
      return { k, its, mms, mon, ws, ps };
    });
    const tWs = rows.some((r) => r.ws != null) ? sum(rows.map((r) => r.ws)) : null;
    const tPs = rows.some((r) => r.ps != null) ? sum(rows.map((r) => r.ps)) : null;
    return `<div class="mmc-table-wrap"><table class="mmc-table">
      <thead><tr><th>Medienzentrum</th><th>Makermobil</th><th>Zeitraum</th><th class="num">Monate</th><th class="num">Workshops</th><th class="num">Personen</th></tr></thead>
      <tbody>${rows.map((r) => `<tr>
        <td><strong>${esc(ort(r.k).name)}</strong></td>
        <td>${r.mms.map((m) => `<span class="mmc-pill" style="--pill:${m.color}"><span class="mmc-dot" style="background:${m.color}"></span>${esc(m.name)}</span>`).join("")}</td>
        <td>${r.its.map((b) => fmtRange(b.a, b.z) + (b.notiz ? ` <span style="color:#8a93a6">(${esc(b.notiz)})</span>` : "")).join("<br>")}</td>
        <td class="num">${r.mon}</td><td class="num">${num(r.ws)}</td><td class="num">${num(r.ps)}</td></tr>`).join("")}
      </tbody>
      <tfoot><tr><td>${rows.length} Standorte</td><td></td><td></td><td class="num">${sum(rows.map((r) => r.mon))}</td><td class="num">${num(tWs)}</td><td class="num">${num(tPs)}</td></tr></tfoot>
    </table></div>`;
  }

  // ── Karte ──────────────────────────────────────────────────────────
  const BW = [[49.79, 8.26], [49.63, 8.19], [49.5, 8.45], [49.48, 8.63], [49.62, 9.25], [49.72, 9.38], [49.79, 9.73], [49.56, 9.82], [49.5, 10.1], [49.25, 10.24],
    [48.93, 10.18], [48.82, 10.07], [48.63, 10.18], [48.27, 10.17], [47.99, 10.2], [47.84, 10.17], [47.58, 9.81], [47.54, 9.52], [47.62, 9.27], [47.67, 9.17],
    [47.53, 8.79], [47.55, 8.57], [47.58, 8.19], [47.55, 8.01], [47.7, 7.54], [47.82, 7.56], [47.98, 7.58], [48.17, 7.62], [48.36, 7.71], [48.58, 7.78],
    [48.98, 8.15], [49.21, 8.11], [49.33, 8.17], [49.55, 8.08], [49.62, 7.98], [49.79, 8.26]];

  function pin(color, label) {
    return L.divIcon({ className: "", iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -34],
      html: `<div class="mmc-pin" style="background:${color}"><span style="color:${textOn(color)}">${esc(label)}</span></div>` });
  }

  function drawMap(elId, from, to, monthIdx, mmFilter) {
    if (!HAS_MAP) { root.querySelector("#" + elId).outerHTML = empty("Karte nicht verfügbar (Leaflet konnte nicht geladen werden)."); return; }
    if (!map) {
      map = L.map(elId, { center: [48.55, 9.0], zoom: 7, scrollWheelZoom: false });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap-Mitwirkende &copy; CARTO", maxZoom: 18 }).addTo(map);
      L.polygon(BW, { color: "#1a1a2e", weight: 2, fillColor: "#44a1d7", fillOpacity: 0.04, dashArray: "6,3", interactive: false }).addTo(map);
      map._mmc = L.layerGroup().addTo(map);
    }
    const layer = map._mmc;
    layer.clearLayers();
    const a = monthIdx == null ? from : monthIdx, z = monthIdx == null ? to : monthIdx;
    const items = BEL.filter((b) => b.typ !== "service" && inRange(b, a, z) && (!mmFilter || b.mm === mmFilter) && ort(b.ort).coords);
    const byOrt = {};
    items.forEach((b) => { (byOrt[b.ort] = byOrt[b.ort] || []).push(b); });
    Object.entries(byOrt).forEach(([k, its]) => {
      const o = ort(k);
      const mms = [...new Set(its.map((b) => b.mm))];
      mms.forEach((mid, i) => {
        const m = mmById(mid);
        let [lat, lng] = o.coords;
        if (mms.length > 1) {
          const ang = (2 * Math.PI * i) / mms.length - Math.PI / 2;
          lat += 0.07 * Math.cos(ang); lng += 0.1 * Math.sin(ang);
        }
        const mine = its.filter((b) => b.mm === mid);
        const popup = `<div class="mmc-popup-title">${esc(o.name)}</div>` +
          its.map((b) => { const mm = mmById(b.mm); return `<div class="mmc-popup-row"><span class="mmc-dot" style="background:${mm.color}"></span>${esc(mm.name)}: ${fmtRange(b.a, b.z)} (${months(b, -Infinity, Infinity)} Mon.)</div>`; }).join("");
        L.marker([lat, lng], { icon: pin(m.color, String(mid)), title: `${m.name} – ${o.name}` })
          .bindPopup(popup)
          .bindTooltip(`${esc(o.name)} · ${esc(m.name)} (${mine.map((b) => fmtRange(b.a, b.z)).join(", ")})`, { direction: "top", offset: [0, -32] })
          .addTo(layer);
      });
    });
    setTimeout(() => map && map.invalidateSize(), 50);
    return items;
  }

  // ── Diagramme ──────────────────────────────────────────────────────
  const gridColor = "#eef1f8";
  function barChart(id, labels, data, colors, opts = {}) {
    if (!HAS_CHART) return;
    const el = root.querySelector("#" + id);
    if (!el) return;
    charts.push(new Chart(el, {
      type: "bar",
      data: { labels, datasets: [{ label: opts.label || "", data, backgroundColor: colors, borderRadius: 8, borderSkipped: false, maxBarThickness: 56 }] },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: opts.horizontal ? "y" : "x",
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${num(c.parsed[opts.horizontal ? "x" : "y"])} ${opts.unit || ""}` } } },
        scales: {
          x: { grid: { display: !!opts.horizontal, color: gridColor }, beginAtZero: true, ticks: { precision: 0 } },
          y: { grid: { display: !opts.horizontal, color: gridColor }, beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    }));
  }

  // ════════════════════════════════════════════════════════════════════
  //  ANSICHT: GESAMTBILANZ
  // ════════════════════════════════════════════════════════════════════
  function renderBilanz() {
    const withNums = PHASES.filter((p) => p.workshops && p.workshops.ist != null);
    const wsTotal = sum(withNums.map((p) => p.workshops.ist));
    const psTotal = sum(PHASES.map((p) => p.personen && p.personen.ist));
    const anyFlag = PHASES.some((p) => (p.workshops && p.workshops.pruefen) || (p.personen && p.personen.pruefen));
    const flagHtml = anyFlag ? `<span class="mmc-flag" title="Enthält Werte, die noch geprüft werden">*</span>` : "";
    const first = PHASES[0], last = PHASES[PHASES.length - 1];
    const maxMZ = Math.max(...PHASES.map((p) => p.medienzentren || 0));
    const mzBel = new Set(BEL.filter((b) => b.typ === "mz").map((b) => b.ort)).size;
    const mzMonths = sum(BEL.filter((b) => b.typ === "mz").map((b) => months(b, -Infinity, Infinity)));
    const qualiPhase = [...PHASES].reverse().find((p) => p.qualifizierung);
    const quali = qualiPhase ? sum(qualiPhase.qualifizierung.map((q) => q.wert)) : null;
    const from = Math.min(...BEL.map((b) => b.a)), to = Math.max(...BEL.map((b) => b.z));

    const lead = `<p class="mmc-lead">Von <strong>einem Prototyp-Fahrzeug mit fünf Modulen und Studio</strong> zu einer Flotte von
      <strong>${last.makermobile} Makermobilen</strong>, die ${maxMZ ? `<strong>${maxMZ} Medienzentren</strong>` : "Medienzentren"} in ganz Baden-Württemberg
      jeweils für mehrere Monate nutzen: die Bilanz der Projektlaufzeit ${idxYear(ymIdx(D.meta.laufzeit.von))}–${idxYear(ymIdx(D.meta.laufzeit.bis))}.</p>`;

    const kpis = `<div class="mmc-kpis">
      ${kpi({ icon: "🚐", raw: `${first.makermobile}&thinsp;→&thinsp;<span data-count="${last.makermobile}">0</span>`, label: "Makermobile", sub: "vom Prototyp zur Flotte", accent: "#a92626" })}
      ${kpi({ icon: "🏢", value: maxMZ || "—", label: "Beteiligte Medienzentren", sub: `${mzBel} Standorte im Belegungsplan erfasst`, accent: "#a82a78" })}
      ${kpi({ icon: "🎯", value: wsTotal, label: "Workshops durchgeführt", sub: withNums.map((p) => `${esc(p.tab)}: ${num(p.workshops.ist)}`).join(" · "), accent: "#80a22b", flagHtml })}
      ${kpi({ icon: "👥", value: psTotal, label: "Personen direkt erreicht", sub: "Lehrkräfte, Schüler:innen, Öffentlichkeit", accent: "#edab35", flagHtml })}
      ${kpi({ icon: "🎓", value: quali ?? "—", label: "Personen qualifiziert", sub: qualiPhase ? "Ausbilder, Maker Teacher u. a." : "Daten folgen", accent: "#44a1d7" })}
      ${kpi({ icon: "📅", value: mzMonths, label: "Einsatzmonate bei Medienzentren", sub: "Summe aller Stationierungen", accent: "#1a1a2e" })}
    </div>`;

    const journey = `<div class="mmc-journey">${PHASES.map((p) => {
      const vans = p.key === "aufbau"
        ? `<span class="mmc-van mmc-van-proto" title="Prototyp"></span>`
        : D.makermobile.slice(0, p.makermobile || 0).map((m) => `<span class="mmc-van" style="--van:${m.color}" title="${esc(mmLabel(m))}"></span>`).join("");
      const mods = p.module ? `<div class="mmc-mods">${D.module.map((m) => `<span class="mmc-mod" style="--mod:${m.color}">${esc(m.name)}</span>`).join("")}</div>` : "";
      const facts = p.key === "aufbau"
        ? `<strong>1 Prototyp</strong> · ${p.module} Module + Studio`
        : `<strong>${p.makermobile} Makermobile</strong> · ${p.medienzentren ? `${p.medienzentren} Medienzentren` : "Medienzentren: —"}<br>
           <strong>${num(p.workshops.ist)}</strong> Workshops${flag(p.workshops, p.pruefHinweis)} · <strong>${num(p.personen.ist)}</strong> Personen${flag(p.personen, p.pruefHinweis)}`;
      return `<div class="mmc-step" style="--step-color:${p.color}">
        <div class="mmc-step-year">${esc(p.tab)}</div>
        <div class="mmc-step-title">${esc(p.label)}</div>
        <div class="mmc-fleet">${vans}</div>${mods}
        <div class="mmc-step-facts">${facts}</div></div>`;
    }).join("")}</div>`;

    const ms = `<ol class="mmc-milestones">${D.meilensteine.map((m, i) => `<li style="--ms-color:${["#9ca3af", "#a92626", "#a82a78", "#44a1d7", "#edab35", "#80a22b"][i % 6]}">
      <div class="mmc-ms-date">${esc(fmtMsDate(m.datum))}</div><div class="mmc-ms-title">${esc(m.titel)}</div><div class="mmc-ms-text">${esc(m.text)}</div></li>`).join("")}</ol>`;

    const planPhases = PHASES.filter((p) => p.workshops && p.workshops.plan);
    const zielBody = planPhases.length ? planPhases.map((p) => `
        <h4 style="font-size:.86rem;margin:4px 0 12px">${esc(p.titel)}</h4>
        ${progress("Workshops / Veranstaltungen", p.workshops.ist, p.workshops.plan)}
        ${progress("Personen erreicht", p.personen.ist, p.personen.plan, "linear-gradient(90deg,#edab35,#f5c842)")}
        ${p.planDetail ? `<div class="mmc-note">Plan: ${esc(p.planDetail)}</div>` : ""}`).join("") : empty("Keine Planwerte hinterlegt.");

    view.innerHTML = lead + kpis +
      card("Von 1 Prototyp zu 8 Makermobilen", "🚐", "linear-gradient(135deg,#a92626,#d44)", journey) +
      `<div class="mmc-grid-2">
        ${card("Meilensteine", "🏁", "linear-gradient(135deg,#a82a78,#c43a90)", ms)}
        ${card("Entwicklung je Jahr", "📈", "linear-gradient(135deg,#80a22b,#a3cc38)", chartBox("ch-dev", true) + (anyFlag ? `<div class="mmc-note">* ${esc(PHASES.find((p) => p.pruefHinweis)?.pruefHinweis || "")}</div>` : ""))}
      </div>` +
      card("Zielerreichung (Plan vs. Ist)", "🎯", "linear-gradient(135deg,#edab35,#d4941a)", zielBody, `<span class="mmc-badge">Stand ${fmtDate(D.meta.datenstand)}</span>`) +
      card(`Belegungsplan ${idxYear(from)}–${idxYear(to)}`, "🗓️", "linear-gradient(135deg,#44a1d7,#2e7db5)", ganttBlock("g-all", from, to, { mode: "ort" }),
        `<span class="mmc-badge">${BEL.filter((b) => b.typ === "mz").length} Stationierungen</span>`) +
      card("Nutzung je Medienzentrum", "🏢", "linear-gradient(135deg,#a82a78,#c43a90)", mzTable(from, to));

    wireGantt("g-all", from, to, null, "ort");

    if (HAS_CHART) {
      const ph = PHASES.filter((p) => p.workshops && (p.workshops.ist != null || p.personen.ist != null));
      charts.push(new Chart(root.querySelector("#ch-dev"), {
        data: {
          labels: ph.map((p) => p.tab),
          datasets: [
            { type: "bar", label: "Workshops", data: ph.map((p) => p.workshops.ist), backgroundColor: ph.map((p) => p.color), borderRadius: 8, maxBarThickness: 70, yAxisID: "y" },
            { type: "line", label: "Personen erreicht", data: ph.map((p) => p.personen.ist), borderColor: "#1a1a2e", backgroundColor: "#1a1a2e", tension: 0.3, pointRadius: 5, yAxisID: "y1" },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${num(c.parsed.y)}` } } },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, grid: { color: gridColor }, title: { display: true, text: "Workshops" } },
            y1: { beginAtZero: true, position: "right", grid: { display: false }, title: { display: true, text: "Personen" }, ticks: { callback: (v) => num(v) } },
          },
        },
      }));
    }
  }

  // ════════════════════════════════════════════════════════════════════
  //  ANSICHT: PROTOTYP & AUFBAU
  // ════════════════════════════════════════════════════════════════════
  function renderAufbau(p) {
    const mods = `<div class="mmc-kpis" style="margin-bottom:0">${D.module.map((m) => `
      <div class="mmc-kpi" style="--accent:${m.color}"><div class="mmc-kpi-value" style="font-size:1.4rem">${esc(m.name)}</div>
      <div class="mmc-kpi-label">${m.name === "Studio" ? "Studio" : "Prototyp-Modul"}</div></div>`).join("")}</div>`;
    const ms = D.meilensteine.filter((m) => /^202[34]/.test(m.datum));
    view.innerHTML = `<p class="mmc-lead">${esc(p.text)}</p>
      <div class="mmc-kpis">
        ${kpi({ icon: "🚐", value: p.makermobile, label: "Prototyp-Fahrzeug", sub: "Ausgangsbasis", accent: "#9ca3af" })}
        ${kpi({ icon: "🧩", raw: `${p.module}&thinsp;+&thinsp;1`, label: "Module + Studio", sub: D.module.map((m) => esc(m.name)).join(" · "), accent: "#a82a78" })}
        ${kpi({ icon: "👩‍🔧", value: "09/2024", label: "Start Team Makermobil", sub: "Übernahme & Weiterentwicklung", accent: "#a92626" })}
        ${kpi({ icon: "🎯", value: num(p.workshops.ist), label: "Workshops", sub: p.workshops.ist == null ? "Daten folgen" : "", accent: "#80a22b" })}
      </div>` +
      card("Die Prototyp-Module", "🧩", "linear-gradient(135deg,#edab35,#d4941a)", mods) +
      card("Meilensteine der Aufbauphase", "🏁", "linear-gradient(135deg,#a82a78,#c43a90)",
        `<ol class="mmc-milestones">${ms.map((m) => `<li><div class="mmc-ms-date">${esc(fmtMsDate(m.datum))}</div><div class="mmc-ms-title">${esc(m.titel)}</div><div class="mmc-ms-text">${esc(m.text)}</div></li>`).join("")}</ol>`);
  }

  // ════════════════════════════════════════════════════════════════════
  //  ANSICHT: JAHR (2025, 2026)
  // ════════════════════════════════════════════════════════════════════
  function renderYear(p) {
    const y = phaseYear(p);
    const from = y * 12, to = y * 12 + 11;
    const yBel = BEL.filter((b) => inRange(b, from, to));
    const hint = p.pruefHinweis;

    const kpis = `<div class="mmc-kpis">
      ${kpi({ icon: "🚐", value: p.makermobile ?? "—", label: "Makermobile im Einsatz", accent: "#a92626" })}
      ${kpi({ icon: "🏢", value: p.medienzentren ?? "—", label: "Beteiligte Medienzentren", sub: `${new Set(yBel.filter((b) => b.typ === "mz").map((b) => b.ort)).size} im Belegungsplan`, accent: "#a82a78" })}
      ${kpi({ icon: "🎯", value: p.workshops.ist ?? "—", label: "Workshops durchgeführt", sub: p.workshops.plan ? `Plan: ${num(p.workshops.plan)}` : "", accent: "#80a22b", flagHtml: flag(p.workshops, hint) })}
      ${kpi({ icon: "👥", value: p.personen.ist ?? "—", label: "Personen direkt erreicht", sub: p.personen.plan ? `Plan: ${num(p.personen.plan)}` : "", accent: "#edab35", flagHtml: flag(p.personen, hint) })}
    </div>`;

    const ziel = p.workshops.plan
      ? card("Zielerreichung (Plan vs. Ist)", "🎯", "linear-gradient(135deg,#80a22b,#a3cc38)",
        progress("Workshops / Veranstaltungen", p.workshops.ist, p.workshops.plan) +
        progress("Personen erreicht", p.personen.ist, p.personen.plan, "linear-gradient(90deg,#edab35,#f5c842)") +
        (p.planDetail ? `<div class="mmc-note">Plan: ${esc(p.planDetail)}</div>` : ""), `<span class="mmc-badge">Stand ${fmtDate(D.meta.datenstand)}</span>`)
      : (hint ? `<div class="mmc-note" style="margin:-6px 0 20px">* ${esc(hint)}</div>` : "");

    const monthOpts = `<option value="">Ganzes Jahr</option>` + MONTHS.map((m, i) => `<option value="${from + i}">${m}</option>`).join("");
    const mmOpts = `<option value="">Alle Makermobile</option>` + D.makermobile.map((m) => `<option value="${m.id}">${esc(mmLabel(m))}</option>`).join("");
    const station = `<div class="mmc-filters">
        <div class="mmc-filter"><label for="f-month">Zeitraum</label><select id="f-month">${monthOpts}</select></div>
        <div class="mmc-filter"><label for="f-mm">Makermobil</label><select id="f-mm">${mmOpts}</select></div>
        <div id="f-summary" style="font-size:.82rem;color:#5f6675;padding-bottom:9px"></div>
      </div>
      <div id="mmc-map" class="mmc-map"></div>
      <h4 style="font-size:.86rem;margin:22px 0 10px">Zeitstrahl ${y}</h4>
      ${ganttBlock("g-year", from, to, { mode: "mm" })}`;

    const typen = p.workshopTypen ? (() => {
      const total = sum(p.workshopTypen.map((t) => t.wert));
      const cols = ["#44a1d7", "#a82a78", "#80a22b", "#edab35", "#a92626", "#e6c200"];
      return p.workshopTypen.map((t, i) => `<div class="mmc-progress">
        <div class="mmc-progress-row"><span>${esc(t.name)}</span><strong>${num(t.wert)}</strong></div>
        <div class="mmc-bar mmc-bar-sm"><div class="mmc-bar-fill" data-w="${(t.wert / Math.max(...p.workshopTypen.map((x) => x.wert))) * 100}%" style="background:${cols[i % cols.length]}"></div></div></div>`).join("") +
        `<div class="mmc-note"><strong>${num(total)} gesamt.</strong> ${esc(p.workshopTypenHinweis || "")}</div>`;
    })() : empty();

    const hasEvents = p.veranstaltungenProMM && p.veranstaltungenProMM.some((x) => x);
    view.innerHTML = kpis + ziel +
      card(`Stationierung ${y}`, "🗺️", "linear-gradient(135deg,#44a1d7,#2e7db5)", station) +
      `<div class="mmc-grid-2">
        ${card(`Veranstaltungen nach Makermobil ${y}`, "📝", "linear-gradient(135deg,#a92626,#d44)", hasEvents ? chartBox("ch-mm") : empty(),
          hasEvents ? `<span class="mmc-badge">${num(sum(p.veranstaltungenProMM))} gesamt</span>` : "")}
        ${card(`Workshops nach Typ ${y}`, "🎯", "linear-gradient(135deg,#44a1d7,#2e7db5)", typen)}
      </div>` +
      (p.anfragenProMonat || p.formate ? `<div class="mmc-grid-2">
        ${card("Anfragen nach Startmonat", "📅", "linear-gradient(135deg,#edab35,#d4941a)", p.anfragenProMonat ? chartBox("ch-anf") + (p.anfragenHinweis ? `<div class="mmc-note">${esc(p.anfragenHinweis)}</div>` : "") : empty(),
          p.anfragenProMonat ? `<span class="mmc-badge">${num(sum(p.anfragenProMonat))} gesamt</span>` : "")}
        ${card("Angefragte Workshop-Formate", "📊", "linear-gradient(135deg,#a82a78,#c43a90)", p.formate ? chartBox("ch-fmt") : empty())}
      </div>` : "") +
      (p.qualifizierung ? card("Qualifiziertes Personal", "🎓", "linear-gradient(135deg,#80a22b,#a3cc38)", chartBox("ch-qual"),
        `<span class="mmc-badge">${num(sum(p.qualifizierung.map((q) => q.wert)))} Personen</span>`) : "") +
      card(`Nutzung je Medienzentrum ${y}`, "🏢", "linear-gradient(135deg,#a82a78,#c43a90)", mzTable(from, to));

    // Stationierung: Karte + Zeitstrahl teilen sich die Filter
    const fMonth = root.querySelector("#f-month"), fMM = root.querySelector("#f-mm"), fSum = root.querySelector("#f-summary");
    const getMM = () => (fMM.value ? Number(fMM.value) : null);
    // Standard: aktueller Monat, falls im Jahr – sonst ganzes Jahr
    const now = new Date();
    if (now.getFullYear() === y) fMonth.value = String(from + now.getMonth());
    const redrawGantt = wireGantt("g-year", from, to, getMM, "mm");
    function update() {
      const mi = fMonth.value ? Number(fMonth.value) : null;
      drawMap("mmc-map", from, to, mi, getMM());
      const a = mi ?? from, z = mi ?? to;
      const act = BEL.filter((b) => inRange(b, a, z) && (!getMM() || b.mm === getMM()));
      const mz = new Set(act.filter((b) => b.typ === "mz").map((b) => b.ort)).size;
      const mmN = new Set(act.filter((b) => b.typ !== "service").map((b) => b.mm)).size;
      const insp = new Set(act.filter((b) => b.typ === "service").map((b) => b.mm)).size;
      fSum.innerHTML = `${mi != null ? `<strong>${MONTHS[idxMonth(mi)]} ${y}:</strong> ` : `<strong>${y}:</strong> `}${mmN} Makermobil(e) im Einsatz · ${mz} Medienzentren${insp ? ` · ${insp} in Inspektion` : ""}`;
      redrawGantt();
    }
    fMonth.addEventListener("change", update);
    fMM.addEventListener("change", update);
    update();

    // Diagramme
    if (hasEvents) barChart("ch-mm", D.makermobile.map((m) => `${m.name} ${m.farbe}`), p.veranstaltungenProMM, D.makermobile.map((m) => m.color), { unit: "Veranstaltungen" });
    if (p.anfragenProMonat) {
      const max = Math.max(...p.anfragenProMonat);
      barChart("ch-anf", MON, p.anfragenProMonat, p.anfragenProMonat.map((v) => (v === max ? "#44a1d7" : v >= max / 2 ? "#edab35" : "#c9d3e6")), { unit: "Anfragen" });
    }
    if (p.formate && HAS_CHART) {
      charts.push(new Chart(root.querySelector("#ch-fmt"), {
        type: "doughnut",
        data: { labels: p.formate.map((f) => f.name), datasets: [{ data: p.formate.map((f) => f.wert), backgroundColor: ["#44a1d7", "#80a22b", "#c9d3e6", "#edab35", "#a82a78"], borderWidth: 3, borderColor: "#fff", hoverOffset: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: "60%", plugins: { legend: { position: "right" } } },
      }));
    }
    if (p.qualifizierung) barChart("ch-qual", p.qualifizierung.map((q) => q.name), p.qualifizierung.map((q) => q.wert), ["#44a1d7", "#80a22b", "#edab35", "#a82a78", "#a92626"], { unit: "Personen" });
  }

  route();
})();
