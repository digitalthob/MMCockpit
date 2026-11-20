/* Makermobil Cockpit – Anwendungslogik
   Liest alle Zahlen aus window.MM_COCKPIT_DATA (data/cockpit-data.js).
   Abhängigkeiten (lokal in assets/vendor): Chart.js, Leaflet.
   Fehlen sie, zeigt das Cockpit Hinweise statt Diagrammen/Karte. */
(function () {
  "use strict";

  const D = window.MM_COCKPIT_DATA;
  const root = document.getElementById("mm-cockpit");
  if (!D || !root) return;

  // Basis-Pfad aus der Skript-Adresse ableiten (…/assets/js/cockpit.js → …/),
  // damit Bilder auch funktionieren, wenn das Cockpit in WordPress eingebunden ist.
  const SCRIPT = document.currentScript && document.currentScript.src;
  const BASE = root.dataset.base || (SCRIPT ? SCRIPT.replace(/assets\/js\/cockpit\.js.*$/, "") : "");
  const IMG = (p) => BASE + "assets/img/" + p;

  const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const MON = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HAS_CHART = typeof window.Chart !== "undefined";
  const HAS_MAP = typeof window.L !== "undefined";
  const C = { yellow: "#FFE566", yellow2: "#F7DB67", green: "#809F33", blue: "#4BA1D3", pink: "#CB549B", orange: "#EDA554", red: "#B52726", ink: "#161616", grey: "#A8A8A8" };

  // ── Linien-Icons (in Hexagonen, wie auf makermobil.de) ───────────────
  const ICONS = {
    truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
    trend: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    bars: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    pie: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    laptop: '<rect x="3" y="4" width="18" height="12" rx="2"/><line x1="1" y1="20" x2="23" y2="20"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    network: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
    cloud: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
    lifebuoy: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    mic: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="M11.4 11.6L21 2M16 7l3 3M19 4l2 2"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  };
  const hexIcon = (name, color, iconColor) =>
    `<span class="mmc-hexicon" style="--c:${color};--ic:${iconColor || textOn(color)}" aria-hidden="true"><svg viewBox="0 0 24 24">${ICONS[name] || ""}</svg></span>`;

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
  const idxLabel = (i) => MON[idxMonth(i)] + " " + idxYear(i);
  function fmtRange(vonIdx, bisIdx) {
    if (vonIdx === bisIdx) return idxLabel(vonIdx);
    if (idxYear(vonIdx) === idxYear(bisIdx)) return MON[idxMonth(vonIdx)] + "–" + MON[idxMonth(bisIdx)] + " " + idxYear(bisIdx);
    return idxLabel(vonIdx) + " – " + idxLabel(bisIdx);
  }
  function fmtDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }
  const fmtMsDate = (s) => (/^\d{4}-\d{2}$/.test(s) ? MONTHS[Number(s.slice(5)) - 1] + " " + s.slice(0, 4) : s);
  function textOn(hex) {
    const c = String(hex).replace("#", "");
    if (c.length !== 6) return "#ffffff";
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.substr(i, 2), 16) / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55 ? "#161616" : "#ffffff";
  }

  const mmById = (id) => D.makermobile.find((m) => m.id === id) || { id, name: "MM " + id, farbe: "", color: C.grey };
  const mmLabel = (m) => m.name + (m.farbe ? " – " + m.farbe : "");
  const ort = (key) => D.orte[key] || { name: key, typ: "mz", coords: null };
  const mmTag = (m) => `<span class="mmc-tag"><span class="mmc-dot" style="background:${m.color}"></span>${esc(m.name)}</span>`;

  // Belegungen mit vorberechneten Indizes
  const BEL = D.belegungen.map((b, i) => ({ ...b, i, a: ymIdx(b.von), z: ymIdx(b.bis), typ: ort(b.ort).typ }));
  const months = (b, from, to) => Math.max(0, Math.min(b.z, to) - Math.max(b.a, from) + 1);
  const inRange = (b, from, to) => b.z >= from && b.a <= to;
  const firstStart = (items, key) => Math.min(...items.filter((x) => x.ort === key).map((x) => x.a));

  const PHASES = D.phasen;
  const PAST = PHASES.filter((p) => p.typ !== "ausblick");          // Innovationsphase
  const LAST = PAST[PAST.length - 1];
  const phaseYear = (p) => (/^\d{4}$/.test(p.key) ? Number(p.key) : null);
  const PROD = D.meta.produktivAb ? ymIdx(D.meta.produktivAb) : null;  // Start Produktivphase
  const pruef = (b) => (b.pruefen ? `<span class="mmc-flag" title="${esc(b.notiz || "Angabe wird noch geprüft")}">*</span>` : "");
  const flag = (obj, hint) => (obj && obj.pruefen ? `<span class="mmc-flag" title="${esc(hint || "Wert wird noch geprüft")}">*</span>` : "");
  const LZ_VON = idxYear(ymIdx(D.meta.laufzeit.von)), LZ_BIS = idxYear(ymIdx(D.meta.laufzeit.bis));

  // ── Laufzeit-Zustand (Charts/Karte werden beim Ansichtswechsel abgebaut) ──
  let charts = [];
  let map = null;
  function teardown() {
    charts.forEach((c) => c.destroy());
    charts = [];
    if (map) { map.remove(); map = null; }
  }

  if (HAS_CHART) {
    Chart.defaults.font.family = "Sora, system-ui, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = "#262626";
    Chart.defaults.borderColor = "#ececec";
    Object.assign(Chart.defaults.plugins.tooltip, {
      backgroundColor: "#fff", titleColor: "#161616", bodyColor: "#262626",
      borderColor: "#161616", borderWidth: 1.5, padding: 10, cornerRadius: 8,
      titleFont: { family: "'Source Code Pro', monospace", weight: "700" },
    });
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    if (REDUCED) Chart.defaults.animation = false;
  }

  // ── Grundgerüst ────────────────────────────────────────────────────
  const TABS = [{ key: "bilanz", tab: "Gesamtbilanz", label: `${LZ_VON}–${LZ_BIS}`, color: C.green }]
    .concat(PHASES.map((p) => ({ key: p.key, tab: p.tab, label: p.label, color: p.color })));

  const deco = [
    { w: 140, top: "8%", right: "4%", c: C.orange },
    { w: 380, top: "-18%", right: "18%", c: "#FFF0A0" },
    { w: 260, bottom: "-10%", left: "-4%", c: "#FFF0A0" },
  ].map((h) => `<span class="mmc-hexdeco" style="width:${h.w}px;height:${Math.round(h.w * 1.15)}px;background:${h.c};${["top", "right", "bottom", "left"].filter((k) => h[k]).map((k) => `${k}:${h[k]}`).join(";")}"></span>`).join("");

  root.innerHTML = `
    <header class="mmc-top">
      <a href="https://makermobil.de" title="makermobil.de"><img class="mmc-top-logo" src="${IMG("makermobil-logo.png")}" alt="makermobil – Lernen durch Machen"></a>
      <div class="mmc-top-right">
        <a class="mmc-top-link" href="https://makermobil.de">makermobil.de</a>
        <span class="mmc-tag">Datenstand ${fmtDate(D.meta.datenstand)}</span>
      </div>
    </header>
    <section class="mmc-hero">
      ${deco}
      <div class="mmc-hero-inner">
        <div>
          <div class="mmc-eyebrow">Innovationsphase ${LZ_VON}–${LZ_BIS} · Produktivphase ab ${PROD ? idxYear(PROD) : LZ_BIS + 1}</div>
          <h1 class="mmc-h">${esc(D.meta.titel)}</h1>
          <p class="mmc-hero-lead">Bilanz der Entwicklungsphase des Innovationsprojekts Makermobil im Rahmen von ${esc(D.meta.programm || "")}:
            vom <strong>Prototyp mit fünf Modulen und Studio</strong> zur Flotte von
            <strong>${LAST.makermobile} Makermobilen</strong> – ab ${PROD ? idxYear(PROD) : LZ_BIS + 1} im Produktivbetrieb.</p>
          ${D.meta.vorlaeufig ? `<div class="mmc-pill"><span class="mmc-tag mmc-tag-warn">Vorläufig</span>
            <span>Finale Projektzahlen folgen. Mit <strong style="color:${C.red}">*</strong> markierte Werte werden noch geprüft.</span></div>` : ""}
        </div>
        <img class="mmc-hero-img" src="${IMG("bw-karte-makermobile.webp")}" alt="Karte Baden-Württemberg mit Makermobilen">
      </div>
    </section>
    <nav class="mmc-tabs" role="tablist" aria-label="Projektphasen">
      ${TABS.map((t) => `<button class="mmc-tab" role="tab" data-key="${t.key}" aria-selected="false">
        <span class="mmc-tab-hex" style="--c:${t.color}"></span>${esc(t.tab)}<span class="mmc-tab-sub">${esc(t.label)}</span></button>`).join("")}
    </nav>
    <main class="mmc-main"><div class="mmc-container"><div class="mmc-view" id="mmc-view" role="tabpanel"></div></div></main>
    <footer class="mmc-footer">
      <div class="mmc-footer-inner">
        <div class="mmc-footer-row">
          <p class="mmc-footer-text">Makermobil ist ein Bildungsangebot des Landesmedienzentrums Baden-Württemberg (LMZ) und wird finanziert und gefördert von:</p>
          <div class="mmc-partners">
            <img src="${IMG("partner/lmz-weiss.svg")}" alt="Landesmedienzentrum Baden-Württemberg">
            <img class="is-tall" src="${IMG("partner/3d-erleben.svg")}" alt="3D erleben">
            <img src="${IMG("partner/km-bw-weiss.svg")}" alt="Baden-Württemberg, Ministerium für Kultus, Jugend und Sport">
          </div>
          <img class="mmc-footer-hex" src="${IMG("mm-hex.svg")}" alt="">
        </div>
        <div class="mmc-footer-meta">
          <span>${esc(D.meta.titel)} · Innovationsphase ${LZ_VON}–${LZ_BIS} · Produktivphase ab ${PROD ? idxYear(PROD) : LZ_BIS + 1} · Datenstand ${fmtDate(D.meta.datenstand)}</span>
          <a href="https://makermobil.de">makermobil.de</a>
        </div>
      </div>
    </footer>`;
  const view = root.querySelector("#mmc-view");
  const tabsEl = root.querySelector(".mmc-tabs");

  root.querySelectorAll(".mmc-tab").forEach((b) =>
    b.addEventListener("click", () => { location.hash = b.dataset.key; }));
  tabsEl.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const btns = [...root.querySelectorAll(".mmc-tab")];
    const i = btns.indexOf(document.activeElement);
    if (i < 0) return;
    const n = btns[(i + (e.key === "ArrowRight" ? 1 : btns.length - 1)) % btns.length];
    n.focus(); n.click();
  });
  // Hintergrund für die Tab-Leiste, sobald sie oben „klebt“
  window.addEventListener("scroll", () => tabsEl.classList.toggle("is-stuck", tabsEl.getBoundingClientRect().top <= 0), { passive: true });

  function route() {
    const key = decodeURIComponent(location.hash.replace("#", "")) || "bilanz";
    const tab = TABS.find((t) => t.key === key) || TABS[0];
    root.querySelectorAll(".mmc-tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.key === tab.key)));
    teardown();
    if (tab.key === "bilanz") renderBilanz();
    else {
      const p = PHASES.find((x) => x.key === tab.key);
      if (p.typ === "ausblick") renderAusblick(p);
      else if (phaseYear(p)) renderYear(p); else renderAufbau(p);
    }
    animate(view);
  }
  window.addEventListener("hashchange", () => {
    route();
    // Nach Tab-Wechsel an den Anfang des Inhalts springen (falls weiter unten gescrollt)
    const top = root.querySelector(".mmc-main").getBoundingClientRect().top + window.scrollY - tabsEl.offsetHeight;
    if (window.scrollY > top) window.scrollTo({ top, behavior: REDUCED ? "auto" : "smooth" });
  });

  // ── Bausteine ──────────────────────────────────────────────────────
  function kpi({ icon, value, label, sub, accent, flagHtml, raw }) {
    const shown = typeof value === "number" ? `<span data-count="${value}">0</span>` : esc(value);
    return `<div class="mmc-kpi" style="--accent:${accent}">
      ${hexIcon(icon, accent)}
      <div class="mmc-kpi-value">${raw || shown}${flagHtml || ""}</div>
      <div class="mmc-kpi-label mmc-eyebrow">${esc(label)}</div>
      ${sub ? `<div class="mmc-kpi-sub">${sub}</div>` : ""}
    </div>`;
  }
  function card({ title, eyebrow, icon, color, body, badge }) {
    return `<section class="mmc-card">
      <div class="mmc-card-head">
        ${icon ? hexIcon(icon, color || "#525252") : ""}
        <div class="mmc-card-titles">${eyebrow ? `<div class="mmc-eyebrow">${esc(eyebrow)}</div>` : ""}<h3 class="mmc-h">${title}</h3></div>
        ${badge || ""}
      </div>${body}</section>`;
  }
  const tag = (txt, warn) => `<span class="mmc-tag${warn ? " mmc-tag-warn" : ""}">${txt}</span>`;
  const empty = (txt) => `<div class="mmc-empty">${esc(txt || "Daten folgen")}</div>`;
  const chartBox = (id, tall) => (HAS_CHART ? `<div class="${tall ? "mmc-chart-tall" : "mmc-chart"}"><canvas id="${id}"></canvas></div>`
    : empty("Diagramm nicht verfügbar (Chart.js konnte nicht geladen werden)."));

  function progress(label, ist, plan, color) {
    const p = pct(ist, plan);
    return `<div class="mmc-progress">
      <div class="mmc-progress-row"><span>${esc(label)}</span>
        <span><strong>${num(ist)}</strong> <span class="mmc-muted">von ${num(plan)} geplant · ${fmtPct(p)}</span></span></div>
      <div class="mmc-bar"><div class="mmc-bar-fill" data-w="${Math.min(100, p || 0)}%" style="background:${color || C.green}"></div></div>
    </div>`;
  }

  function animate(scope) {
    requestAnimationFrame(() => scope.querySelectorAll(".mmc-bar-fill[data-w]").forEach((el) => { el.style.width = el.dataset.w; }));
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

  const milestoneList = (list) => `<ol class="mmc-milestones">${list.map((m, i) => `<li style="--ms-color:${[C.grey, C.red, C.pink, C.blue, C.yellow2, C.green][i % 6]}">
      <div class="mmc-ms-date">${esc(fmtMsDate(m.datum))}</div><div class="mmc-ms-title">${esc(m.titel)}</div><div class="mmc-ms-text">${esc(m.text)}</div></li>`).join("")}</ol>`;

  // ── Zeitstrahl (Gantt) ─────────────────────────────────────────────
  function ganttBlock(id, mode) {
    return `<div class="mmc-filters" id="${id}-ctl">
        <div class="mmc-filter"><label>Ansicht</label>
          <div class="mmc-seg" role="group" aria-label="Zeitstrahl gruppieren nach">
            <button type="button" data-mode="ort" aria-pressed="${mode === "ort"}">je Medienzentrum</button>
            <button type="button" data-mode="mm" aria-pressed="${mode === "mm"}">je Makermobil</button>
          </div></div>
      </div>
      <div class="mmc-gantt-wrap"><div class="mmc-gantt" id="${id}"></div></div>
      <div class="mmc-legend">
        <span><i style="background:${C.blue}"></i>Einsatz bei Medienzentrum (Farbe = Makermobil)</span>
        <span><i style="background:#fff;border:2px dashed ${C.blue}"></i>beim Team Makermobil</span>
        <span><i style="background:repeating-linear-gradient(135deg,#e6e6e6,#e6e6e6 3px,#fafafa 3px,#fafafa 6px);border-color:${C.grey}"></i>Inspektion</span>
        <span><i style="background:${C.red};width:2px;border:0"></i>heute</span>
        <span>Balken anklicken für Details</span>
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
    const items = BEL.filter((b) => inRange(b, from, to) && (!mmFilter || b.mm === mmFilter));

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
    // Produktivphase im Zeitstrahl hinterlegen
    const fut = PROD != null && PROD <= to ? `<div class="mmc-g-future" style="left:${L(Math.max(PROD, from))}%"></div>` : "";
    if (fut && PROD >= from) head += `<div class="mmc-g-futlabel" style="left:${L(PROD)}%">Produktivphase →</div>`;

    let rows;
    if (mode === "mm") {
      const ids = mmFilter ? [mmFilter] : D.makermobile.map((m) => m.id);
      rows = ids.map((mid) => {
        const m = mmById(mid);
        return { label: `<span class="mmc-dot" style="background:${m.color}"></span>${esc(m.name)} <small>${esc(m.farbe)}</small>`, items: items.filter((b) => b.mm === mid) };
      });
    } else {
      // Inspektionen sind kein Standort – sie erscheinen nur in der Ansicht „je Makermobil“.
      const loc = items.filter((b) => b.typ !== "service");
      const keys = [...new Set(loc.map((b) => b.ort))];
      keys.sort((a, b) => {
        const ta = ort(a).typ === "team", tb = ort(b).typ === "team";
        if (ta !== tb) return ta ? 1 : -1;
        return firstStart(loc, a) - firstStart(loc, b);
      });
      rows = keys.map((k) => ({ label: esc(ort(k).name), items: loc.filter((b) => b.ort === k) }));
    }

    const html = rows.map((r) => {
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
        const cls = (b.typ === "team" ? " is-team" : b.typ === "service" ? " is-service" : "") +
          (b.z > to ? " cont-r" : "") + (b.a < from ? " cont-l" : "");
        const txt = mode === "mm" ? (b.typ === "team" ? "Team MM" : ort(b.ort).name) : m.name;
        const label = `${b.a < from ? "← " : ""}${txt}${b.pruefen ? " *" : ""}${n > 1 ? " · " + n + " Mon." : ""}${b.z > to ? " →" : ""}`;
        const aria = `${mmLabel(m)} – ${ort(b.ort).name}, ${fmtRange(b.a, b.z)} (${months(b, -Infinity, Infinity)} Monate)`;
        return `<button type="button" class="mmc-g-bar${cls}" data-i="${b.i}" style="left:calc(${L(a)}% + 1px);width:calc(${((z - a + 1) / total) * 100}% - 2px);top:${5 + b._lane * 30}px;--bar:${m.color};--bar-text:${textOn(m.color)}" title="${esc(aria)}" aria-label="${esc(aria)}">${esc(label)}</button>`;
      }).join("");
      return `<div class="mmc-g-row"><div class="mmc-g-label">${r.label}</div><div class="mmc-g-track" style="height:${h}px">${fut}${grid}${today}${bars}</div></div>`;
    }).join("");

    el.innerHTML = `<div class="mmc-g-row mmc-g-head"><div class="mmc-g-label"></div><div class="mmc-g-track">${fut}${head}</div></div>` +
      (html || `<div style="padding:16px">${empty("Keine Belegungen im gewählten Zeitraum.")}</div>`);

    detail.hidden = true;
    el.querySelectorAll(".mmc-g-bar").forEach((btn) => btn.addEventListener("click", () => {
      const b = BEL[Number(btn.dataset.i)];
      const m = mmById(b.mm);
      detail.style.setProperty("--bar", m.color);
      detail.innerHTML = `${mmTag(m)} <strong class="mmc-h" style="margin-left:6px">${esc(ort(b.ort).name)}</strong>
        <div class="mmc-detail-grid">
          <div><span>Zeitraum</span><strong>${fmtRange(b.a, b.z)}</strong></div>
          <div><span>Dauer</span><strong>${months(b, -Infinity, Infinity)} Monat(e)</strong></div>
          <div><span>Workshops</span><strong>${num(b.workshops)}</strong></div>
          <div><span>Personen erreicht</span><strong>${num(b.personen)}</strong></div>
        </div>${b.notiz ? `<div style="margin-top:10px;color:#5c5c5c">${pruef(b)} ${esc(b.notiz)}</div>` : ""}`;
      detail.hidden = false;
    }));
  }

  // ── Tabelle: Nutzung je Medienzentrum ──────────────────────────────
  function mzTable(from, to) {
    const items = BEL.filter((b) => b.typ === "mz" && inRange(b, from, to));
    const keys = [...new Set(items.map((b) => b.ort))].sort((a, b) => firstStart(items, a) - firstStart(items, b));
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
        <td>${esc(ort(r.k).name)}</td>
        <td>${r.mms.map(mmTag).join(" ")}</td>
        <td>${r.its.map((b) => fmtRange(Math.max(b.a, from), Math.min(b.z, to)) + pruef(b) + (b.z > to ? ` <span class="mmc-muted">(weiter bis ${idxLabel(b.z)})</span>` : "") + (b.notiz ? ` <span class="mmc-muted">(${esc(b.notiz)})</span>` : "")).join("<br>")}</td>
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

  const pinIcon = (color, label) => L.divIcon({ className: "", iconSize: [30, 34], iconAnchor: [15, 17], popupAnchor: [0, -16],
    html: `<div class="mmc-pin"><span style="background:${color};color:${textOn(color)}">${esc(label)}</span></div>` });

  function drawMap(elId, from, to, monthIdx, mmFilter) {
    const el = root.querySelector("#" + elId);
    if (!HAS_MAP) { if (el) el.outerHTML = empty("Karte nicht verfügbar (Leaflet konnte nicht geladen werden)."); return; }
    if (!map) {
      map = L.map(elId, { center: [48.6, 9.0], zoom: 7, scrollWheelZoom: false });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap-Mitwirkende &copy; CARTO", maxZoom: 18 }).addTo(map);
      L.polygon(BW, { color: C.ink, weight: 2, fillColor: C.yellow, fillOpacity: 0.12, dashArray: "6,4", interactive: false }).addTo(map);
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
        L.marker([lat, lng], { icon: pinIcon(m.color, String(mid)), title: `${m.name} – ${o.name}` })
          .bindPopup(popup)
          .bindTooltip(`${esc(o.name)} · ${esc(m.name)} (${mine.map((b) => fmtRange(b.a, b.z)).join(", ")})`, { direction: "top", offset: [0, -16] })
          .addTo(layer);
      });
    });
    setTimeout(() => map && map.invalidateSize(), 50);
  }

  // ── Diagramme ──────────────────────────────────────────────────────
  function barChart(id, labels, data, colors, opts = {}) {
    if (!HAS_CHART) return;
    const el = root.querySelector("#" + id);
    if (!el) return;
    charts.push(new Chart(el, {
      type: "bar",
      data: { labels, datasets: [{ label: opts.label || "", data, backgroundColor: colors, borderColor: C.ink, borderWidth: 1.5, borderRadius: 6, borderSkipped: false, maxBarThickness: 54 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${num(c.parsed.y)} ${opts.unit || ""}` } } },
        scales: {
          x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: false, font: { size: 11 } } },
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    }));
  }

  // ── Digitale Plattform (Wabe + Erklärungen + Arbeitsweg) ──────────
  function plattformBlock() {
    const P = D.plattform;
    if (!P) return "";
    const svg = (name, color) => `<svg viewBox="0 0 24 24" style="stroke:${color}">${ICONS[name] || ""}</svg>`;
    const qPhase = [...PHASES].reverse().find((p) => p.qualifizierung);
    const badges = qPhase ? sum(qPhase.qualifizierung.filter((q) => (P.badgeFuer || []).includes(q.name)).map((q) => q.wert)) : null;
    const zahl = (d) => (d.zahlAus === "badges" ? badges : d.zahl ?? null);
    const pos = [[16.67, 0], [50, 0], [66.67, 30], [50, 60], [16.67, 60], [0, 30]]; // ab oben links im Uhrzeigersinn
    const wabe = `<div class="mmc-comb" role="img" aria-label="Ein Login für ${P.dienste.length} Dienste: ${P.dienste.map((d) => esc(d.verb)).join(", ")}">
        <div class="mmc-comb-hex is-center" style="left:33.33%;top:30%"><div>${svg("key", "#fff")}<strong>Ein Login</strong><span>makermobil.de</span></div></div>
        ${P.dienste.slice(0, 6).map((d, i) => { const z = zahl(d); const fg = textOn(d.color); return `<div class="mmc-comb-hex" style="left:${pos[i][0]}%;top:${pos[i][1]}%;background:${d.color};color:${fg}">
          <div>${svg(d.icon, fg)}<strong>${esc(d.verb)}</strong>${z != null ? `<em>${num(z)}</em>` : ""}</div></div>`; }).join("")}
      </div>`;
    const liste = `<div class="mmc-svc">${P.dienste.map((d) => { const z = zahl(d); return `<div class="mmc-svc-item">
        ${hexIcon(d.icon, d.color)}
        <div class="mmc-svc-body">
          <div class="mmc-svc-head"><strong class="mmc-h">${esc(d.verb)}</strong><span class="mmc-tag">${esc(d.tool)}</span></div>
          <p>${esc(d.text)}</p>
          ${z != null ? `<div class="mmc-svc-num"><b>${num(z)}</b> ${esc(d.einheit || "")}</div>` : d.status ? `<div class="mmc-svc-num"><span class="mmc-tag mmc-tag-warn">✓ ${esc(d.status)}</span></div>` : ""}
          ${d.detail ? `<div class="mmc-svc-detail">${esc(d.detail)}</div>` : ""}
        </div></div>`; }).join("")}</div>`;
    const weg = (P.weg || []).length ? `<h4 class="mmc-h mmc-sub-h">So arbeitet ein Maker Teacher mit der Plattform</h4>
      <ol class="mmc-flow" style="--n:${P.weg.length}">${P.weg.map((w, i) => `<li>
        <span class="mmc-flow-hex">${svg(w.icon, "#161616")}<i>${i + 1}</i></span>
        <strong>${esc(w.schritt)}</strong><span class="mmc-tag">${esc(w.tool)}</span></li>`).join("")}</ol>` : "";
    return card({ eyebrow: `Digitale Infrastruktur · seit ${P.seit ? fmtMsDate(P.seit) : ""}`, title: esc(P.titel), icon: "network", color: C.blue,
      badge: tag(`${P.dienste.length} Dienste · 1 Login`),
      body: `<p class="mmc-svc-lead">${esc(P.text)}</p><div class="mmc-platform">${wabe}${liste}</div>${weg}` });
  }

  // ════════════════════════════════════════════════════════════════════
  //  ANSICHT: GESAMTBILANZ
  // ════════════════════════════════════════════════════════════════════
  function renderBilanz() {
    const withNums = PHASES.filter((p) => p.workshops && p.workshops.ist != null);
    const wsTotal = sum(withNums.map((p) => p.workshops.ist));
    const psTotal = sum(PHASES.map((p) => p.personen && p.personen.ist));
    const flagged = PHASES.find((p) => (p.workshops && p.workshops.pruefen) || (p.personen && p.personen.pruefen));
    const flagHtml = flagged ? `<span class="mmc-flag" title="${esc(flagged.pruefHinweis || "Enthält Werte, die noch geprüft werden")}">*</span>` : "";
    const first = PHASES[0], last = LAST;
    // Bilanz = Innovationsphase: alles nach deren Ende wird abgeschnitten
    const from = Math.min(...BEL.map((b) => b.a)), to = Math.min(Math.max(...BEL.map((b) => b.z)), ymIdx(D.meta.laufzeit.bis));
    const mzIn = BEL.filter((b) => b.typ === "mz" && inRange(b, from, to));
    const maxMZ = Math.max(...PHASES.map((p) => p.medienzentren || 0));
    const mzBel = new Set(mzIn.map((b) => b.ort)).size;
    const mzMonths = sum(mzIn.map((b) => months(b, from, to)));
    const qualiPhase = [...PHASES].reverse().find((p) => p.qualifizierung);
    const quali = qualiPhase ? sum(qualiPhase.qualifizierung.map((q) => q.wert)) : null;

    const kpis = `<div class="mmc-kpis">
      ${kpi({ icon: "truck", raw: `${first.makermobile}&thinsp;→&thinsp;<span data-count="${last.makermobile}">0</span>`, label: "Makermobile", sub: "vom Prototyp zur Flotte", accent: C.red })}
      ${kpi({ icon: "building", value: maxMZ || "—", label: "Medienzentren", sub: `${mzBel} Standorte im Belegungsplan`, accent: C.pink })}
      ${kpi({ icon: "target", value: wsTotal, label: "Workshops", sub: withNums.map((p) => `${esc(p.tab)}: ${num(p.workshops.ist)}`).join(" · "), accent: C.green, flagHtml })}
      ${kpi({ icon: "users", value: psTotal, label: "Personen erreicht", sub: "Lehrkräfte, Schüler:innen, Öffentlichkeit", accent: C.yellow2, flagHtml })}
      ${kpi({ icon: "award", value: quali ?? "—", label: "Qualifiziert", sub: qualiPhase ? "Maker Teacher, Assistant u. a." : "Daten folgen", accent: C.blue })}
      ${kpi({ icon: "calendar", value: mzMonths, label: "Einsatzmonate", sub: "bei Medienzentren (Summe)", accent: C.orange })}
    </div>`;

    const journey = `<div class="mmc-journey">${PHASES.map((p) => {
      const vans = p.key === "aufbau"
        ? `<span class="mmc-van mmc-van-proto" title="Prototyp"></span>`
        : D.makermobile.slice(0, p.makermobile || 0).map((m) => `<span class="mmc-van" style="--van:${m.color}" title="${esc(mmLabel(m))}"></span>`).join("");
      const mods = p.module ? `<div class="mmc-mods">${D.module.map((m) => `<img src="${IMG(m.bild)}" alt="${esc(m.name)}" title="${esc(m.name)}" loading="lazy">`).join("")}</div>` : "";
      const facts = p.key === "aufbau"
        ? `<strong>1 Prototyp</strong> · ${p.module} Module + Studio`
        : p.typ === "ausblick"
        ? `<strong>Regelbetrieb</strong> ab ${PROD ? MONTHS[idxMonth(PROD)] + " " + idxYear(PROD) : ""}<br>
           ${D.ausblick ? `${D.ausblick.lernformate.length} Lernformate · ${D.ausblick.netzwerk.length} Medienzentren im Netzwerk` : ""}`
        : `<strong>${p.makermobile} Makermobile</strong> · ${p.medienzentren ? `${p.medienzentren} Medienzentren` : "Medienzentren: —"}<br>
           <strong>${num(p.workshops.ist)}</strong> Workshops${flag(p.workshops, p.pruefHinweis)} · <strong>${num(p.personen.ist)}</strong> Personen${flag(p.personen, p.pruefHinweis)}`;
      return `<div class="mmc-step${p.typ === "ausblick" ? " is-future" : ""}">
        <div class="mmc-eyebrow" style="color:#5c5c5c">${esc(p.tab)}${p.typ === "ausblick" ? " · Ausblick" : ""}</div>
        <div class="mmc-step-title mmc-h">${esc(p.label)}</div>
        <div class="mmc-fleet">${vans}</div>${mods}
        <div class="mmc-step-facts">${facts}</div></div>`;
    }).join("")}</div>`;

    const planPhases = PHASES.filter((p) => p.workshops && p.workshops.plan);
    const zielBody = planPhases.length ? planPhases.map((p) => `
        <div class="mmc-eyebrow" style="margin-bottom:14px">${esc(p.titel)}</div>
        ${progress("Workshops / Veranstaltungen", p.workshops.ist, p.workshops.plan, C.green)}
        ${progress("Personen erreicht", p.personen.ist, p.personen.plan, C.yellow)}
        ${p.planDetail ? `<div class="mmc-note">Plan: ${esc(p.planDetail)}</div>` : ""}`).join("") : empty("Keine Planwerte hinterlegt.");

    view.innerHTML = kpis +
      card({ eyebrow: "Entwicklung", title: `Von 1 Prototyp zu ${last.makermobile} Makermobilen`, icon: "truck", color: C.red, body: journey }) +
      plattformBlock() +
      `<div class="mmc-grid-2">
        ${card({ eyebrow: "Projektgeschichte", title: "Meilensteine", icon: "flag", color: C.pink, body: milestoneList(D.meilensteine) })}
        ${card({ eyebrow: "Wirkung", title: "Entwicklung je Jahr", icon: "trend", color: C.green, body: chartBox("ch-dev", true) + (flagged ? `<div class="mmc-note"><strong style="color:${C.red}">*</strong> ${esc(flagged.pruefHinweis || "")}</div>` : "") })}
      </div>` +
      card({ eyebrow: "Plan vs. Ist", title: "Zielerreichung", icon: "target", color: C.yellow2, body: zielBody, badge: tag(`Stand ${fmtDate(D.meta.datenstand)}`) }) +
      card({ eyebrow: "Standorte", title: `Belegungsplan ${idxYear(from)}–${idxYear(to)}`, icon: "calendar", color: C.blue, body: ganttBlock("g-all", "ort"),
        badge: tag(`${mzIn.length} Stationierungen`) }) +
      card({ eyebrow: "Standorte", title: "Nutzung je Medienzentrum", icon: "building", color: C.pink, body: mzTable(from, to) });

    wireGantt("g-all", from, to, null, "ort");

    if (HAS_CHART) {
      const ph = PHASES.filter((p) => p.workshops && (p.workshops.ist != null || p.personen.ist != null));
      charts.push(new Chart(root.querySelector("#ch-dev"), {
        data: {
          labels: ph.map((p) => p.tab),
          datasets: [
            { type: "bar", label: "Workshops", data: ph.map((p) => p.workshops.ist), backgroundColor: ph.map((p) => p.color), borderColor: C.ink, borderWidth: 1.5, borderRadius: 6, borderSkipped: false, maxBarThickness: 80, yAxisID: "y", order: 2 },
            { type: "line", label: "Personen erreicht", data: ph.map((p) => p.personen.ist), borderColor: C.ink, backgroundColor: C.ink, borderWidth: 2.5, tension: 0.3, pointRadius: 6, pointStyle: "rectRot", yAxisID: "y1", order: 1 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${num(c.parsed.y)}` } } },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, title: { display: true, text: "Workshops" } },
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
    const mods = `<div class="mmc-modules">${D.module.map((m) => `
      <div class="mmc-module"><img src="${IMG(m.bild)}" alt="" loading="lazy">
        <div class="mmc-h">${esc(m.name)}</div><span>${esc(m.info || "Making-Modul")}</span></div>`).join("")}</div>`;
    const ms = D.meilensteine.filter((m) => /^202[34]/.test(m.datum));
    view.innerHTML = `<div class="mmc-kpis">
        ${kpi({ icon: "truck", value: p.makermobile, label: "Prototyp-Fahrzeug", sub: "Ausgangsbasis", accent: C.grey })}
        ${kpi({ icon: "layers", raw: `${p.module}&thinsp;+&thinsp;1`, label: "Module + Studio", sub: D.module.map((m) => esc(m.name)).join(" · "), accent: C.pink })}
        ${kpi({ icon: "tool", value: "09/2024", label: "Start Team", sub: "Übernahme & Weiterentwicklung", accent: C.red })}
        ${kpi({ icon: "target", value: num(p.workshops.ist), label: "Workshops", sub: p.workshops.ist == null ? "Daten folgen" : "", accent: C.green })}
      </div>` +
      card({ eyebrow: "Ausgangslage", title: esc(p.titel), icon: "tool", color: C.grey, body: `<p style="max-width:820px;font-size:1.02rem">${esc(p.text)}</p>` }) +
      card({ eyebrow: "Making-Module", title: "Fünf Module und ein Studio", icon: "layers", color: C.orange, body: mods }) +
      card({ eyebrow: "Projektgeschichte", title: "Meilensteine der Aufbauphase", icon: "flag", color: C.pink, body: milestoneList(ms) });
  }

  // ── Stationierung: Filter + Karte + Zeitstrahl (Jahres-Tabs und Ausblick) ──
  function stationBlock(from, to, allText, ganttTitle) {
    const oneYear = idxYear(from) === idxYear(to);
    let monthOpts = `<option value="">${esc(allText)}</option>`;
    for (let i = from; i <= to; i++) monthOpts += `<option value="${i}">${MONTHS[idxMonth(i)]}${oneYear ? "" : " " + idxYear(i)}</option>`;
    const mmOpts = `<option value="">Alle Makermobile</option>` + D.makermobile.map((m) => `<option value="${m.id}">${esc(mmLabel(m))}</option>`).join("");
    return `<div class="mmc-filters">
        <div class="mmc-filter"><label for="f-month">Zeitraum</label><select id="f-month">${monthOpts}</select></div>
        <div class="mmc-filter"><label for="f-mm">Makermobil</label><select id="f-mm">${mmOpts}</select></div>
        <div id="f-summary" class="mmc-filter-sum"></div>
      </div>
      <div id="mmc-map" class="mmc-map"></div>
      <h4 class="mmc-h mmc-sub-h">${esc(ganttTitle)}</h4>
      ${ganttBlock("g-year", "mm")}`;
  }

  function wireStation(from, to, { defaultNow, allLabel, network } = {}) {
    const fMonth = root.querySelector("#f-month"), fMM = root.querySelector("#f-mm"), fSum = root.querySelector("#f-summary");
    const getMM = () => (fMM.value ? Number(fMM.value) : null);
    const now = new Date(), nowIdx = now.getFullYear() * 12 + now.getMonth();
    if (defaultNow && nowIdx >= from && nowIdx <= to) fMonth.value = String(nowIdx);
    const redrawGantt = wireGantt("g-year", from, to, getMM, "mm");
    function update() {
      const mi = fMonth.value ? Number(fMonth.value) : null;
      drawMap("mmc-map", from, to, mi, getMM());
      if (network) drawNetwork();
      const a = mi ?? from, z = mi ?? to;
      const act = BEL.filter((b) => inRange(b, a, z) && (!getMM() || b.mm === getMM()));
      const mz = new Set(act.filter((b) => b.typ === "mz").map((b) => b.ort)).size;
      const mmN = new Set(act.filter((b) => b.typ !== "service").map((b) => b.mm)).size;
      const insp = new Set(act.filter((b) => b.typ === "service").map((b) => b.mm)).size;
      fSum.innerHTML = `<strong>${mi != null ? `${MONTHS[idxMonth(mi)]} ${idxYear(mi)}` : esc(allLabel)}:</strong> ${mmN} Makermobil(e) im Einsatz · ${mz} Medienzentren${insp ? ` · ${insp} in Inspektion` : ""}`;
      redrawGantt();
    }
    fMonth.addEventListener("change", update);
    fMM.addEventListener("change", update);
    update();
  }

  // Medienzentren-Netzwerk als kleine Punkte auf der Karte (Ausblick)
  function drawNetwork() {
    if (!map || !D.ausblick || !D.ausblick.netzwerk) return;
    D.ausblick.netzwerk.forEach((n) => {
      L.circleMarker(n.coords, { radius: 5, color: C.ink, weight: 1.5, fillColor: "#fff", fillOpacity: 1 })
        .bindTooltip(`${esc(n.name)} (${esc(n.ort)})`, { direction: "top" })
        .addTo(map._mmc);
    });
  }

  // ════════════════════════════════════════════════════════════════════
  //  ANSICHT: AUSBLICK & VERSTETIGUNG (Produktivphase)
  // ════════════════════════════════════════════════════════════════════
  function renderAusblick(p) {
    const A = D.ausblick || { lernformate: [], netzwerk: [], planung: [], ziele: {} };
    const prodY = PROD ? idxYear(PROD) : LZ_BIS + 1;
    // Zeitraum: ab Beginn der laufenden Stationierungen bis Ende des ersten Produktivjahres
    const tail = BEL.filter((b) => b.z >= PROD);
    const from = tail.length ? Math.min(...tail.filter((b) => b.typ !== "team").map((b) => b.a)) : PROD - 4;
    const to = Math.max(PROD + 11, ...tail.map((b) => b.z));
    const into = tail.filter((b) => b.typ === "mz");
    const lastMz = into.length ? Math.max(...into.map((b) => b.z)) : null;
    const active = new Set(BEL.filter((b) => b.typ !== "service" && b.z >= PROD).map((b) => b.mm)).size;

    // Phasen-Leiste 2023 … 2027
    const years = [];
    for (let y = LZ_VON; y <= prodY; y++) years.push(y);
    const strip = `<div class="mmc-phases" style="--n:${years.length}">
        ${years.map((y) => `<div class="mmc-phase-year${y >= prodY ? " is-prod" : ""}">${y}</div>`).join("")}
        <div class="mmc-phase-bar is-innov" style="grid-column:1 / span ${years.length - 1}">
          <span class="mmc-eyebrow">Innovationsphase ${LZ_VON}–${LZ_BIS}</span><span>Entwicklung · Erprobung · Pilotbetrieb</span></div>
        <div class="mmc-phase-bar is-prod"><span class="mmc-eyebrow">Produktivphase</span><span>Regelbetrieb ab ${prodY}</span></div>
      </div>
      <p style="max-width:860px;margin-top:22px;font-size:1.02rem">${esc(A.text || "")}</p>`;

    const kpis = `<div class="mmc-kpis">
      ${kpi({ icon: "truck", value: LAST.makermobile, label: "Makermobile", sub: `${active} mit Einsätzen bis ${prodY} geplant`, accent: C.red })}
      ${kpi({ icon: "network", value: A.netzwerk.length || "—", label: "Medienzentren", sub: "im Netzwerk (makermobil.de)", accent: C.pink })}
      ${kpi({ icon: "book", value: A.lernformate.length || "—", label: "Lernformate", sub: A.lernformate.map((l) => esc(l.name)).join(" · "), accent: C.green })}
      ${kpi({ icon: "calendar", value: into.length, label: `Einsätze bis ${prodY}`, sub: lastMz ? `längste Planung bis ${MONTHS[idxMonth(lastMz)]} ${idxYear(lastMz)}` : "", accent: C.blue })}
    </div>`;

    const formate = `<div class="mmc-formats">${A.lernformate.map((l) => `<div class="mmc-format">
        <div class="mmc-format-head">${hexIcon(l.icon, l.color)}${tag(esc(l.status), /neu/i.test(l.status))}</div>
        <h4 class="mmc-h">${esc(l.name)}</h4>
        <p>${esc(l.text)}</p>
        <div class="mmc-format-num">${l.anzahl != null ? `<strong>${num(l.anzahl)}</strong> ${esc(l.einheit)}` : `<strong>${prodY}</strong>`}</div>
        <div class="mmc-format-detail">${esc(l.detail || "")}</div>
      </div>`).join("")}</div>`;

    const planung = (A.planung || []).length ? `<div class="mmc-note"><strong>In Planung:</strong> ${A.planung.map((x) => `${mmTag(mmById(x.mm))} ${esc(x.text)}${x.zeitraum ? ` (${esc(x.zeitraum)})` : " – Zeitraum noch offen"}`).join("<br>")}</div>` : "";

    const activeOrte = new Set(BEL.filter((b) => b.typ === "mz" && b.z >= PROD).map((b) => ort(b.ort).name));
    const netz = `<div class="mmc-netz">${A.netzwerk.map((n) => {
        const hit = [...activeOrte].find((o) => n.name.includes(o) || n.ort === o);
        const mmHit = hit ? [...new Set(BEL.filter((b) => b.typ === "mz" && b.z >= PROD && ort(b.ort).name === hit).map((b) => b.mm))].map(mmById) : [];
        return `<div class="mmc-netz-item${mmHit.length ? " is-active" : ""}"><span class="mmc-dot" style="background:${mmHit.length ? mmHit[0].color : "#fff"}"></span>
          <div><strong>${esc(n.name)}</strong><span>${esc(n.ort)}</span></div>${mmHit.map(mmTag).join("")}</div>`;
      }).join("")}</div>`;

    const Z = A.ziele || {};
    const ziele = `<div class="mmc-kpis" style="margin-bottom:0">
      ${kpi({ icon: "target", value: Z.workshops ?? "—", label: "Workshops (Plan)", sub: Z.workshops == null ? "Planwert folgt" : "", accent: C.green })}
      ${kpi({ icon: "users", value: Z.personen ?? "—", label: "Personen (Plan)", sub: Z.personen == null ? "Planwert folgt" : "", accent: C.yellow2 })}
      ${kpi({ icon: "building", value: Z.medienzentren ?? "—", label: "Medienzentren (Plan)", sub: Z.medienzentren == null ? "Planwert folgt" : "", accent: C.pink })}
    </div>`;

    view.innerHTML =
      card({ eyebrow: "Verstetigung", title: `Von der Innovation in den Regelbetrieb`, icon: "rocket", color: C.pink, body: strip }) +
      kpis +
      card({ eyebrow: "Angebot", title: "Drei Lernformate", icon: "book", color: C.green, body: formate,
        badge: `<a class="mmc-tag" href="https://makermobil.de" style="text-decoration:none">makermobil.de ↗</a>` }) +
      card({ eyebrow: "Übergang in die Produktivphase", title: `Stationierung ${idxLabel(from)} – ${idxLabel(to)}`, icon: "pin", color: C.blue,
        body: stationBlock(from, to, "Gesamter Zeitraum", "Zeitstrahl") + planung }) +
      card({ eyebrow: "Netzwerk", title: "Medienzentren im Netzwerk", icon: "network", color: C.pink, body: netz,
        badge: tag(`${A.netzwerk.length} Medienzentren`) }) +
      card({ eyebrow: "Ziele", title: `Planwerte ${prodY}`, icon: "target", color: C.green, body: ziele +
        `<div class="mmc-note">Die Planwerte für die Produktivphase werden ergänzt, sobald sie feststehen.</div>` });

    wireStation(from, to, { defaultNow: false, allLabel: `${idxLabel(from)} – ${idxLabel(to)}`, network: true });
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
      ${kpi({ icon: "truck", value: p.makermobile ?? "—", label: "Makermobile", sub: "im Einsatz", accent: C.red })}
      ${kpi({ icon: "building", value: p.medienzentren ?? "—", label: "Medienzentren", sub: `${new Set(yBel.filter((b) => b.typ === "mz").map((b) => b.ort)).size} im Belegungsplan`, accent: C.pink })}
      ${kpi({ icon: "target", value: p.workshops.ist ?? "—", label: "Workshops", sub: p.workshops.plan ? `Plan: ${num(p.workshops.plan)}` : "durchgeführt", accent: C.green, flagHtml: flag(p.workshops, hint) })}
      ${kpi({ icon: "users", value: p.personen.ist ?? "—", label: "Personen erreicht", sub: p.personen.plan ? `Plan: ${num(p.personen.plan)}` : "direkt", accent: C.yellow2, flagHtml: flag(p.personen, hint) })}
    </div>`;

    const ziel = p.workshops.plan
      ? card({ eyebrow: "Plan vs. Ist", title: "Zielerreichung", icon: "target", color: C.green, badge: tag(`Stand ${fmtDate(D.meta.datenstand)}`),
        body: progress("Workshops / Veranstaltungen", p.workshops.ist, p.workshops.plan, C.green) +
          progress("Personen erreicht", p.personen.ist, p.personen.plan, C.yellow) +
          (p.planDetail ? `<div class="mmc-note">Plan: ${esc(p.planDetail)}</div>` : "") })
      : (hint ? `<div class="mmc-note" style="margin:-8px 0 24px"><strong style="color:${C.red}">*</strong> ${esc(hint)}</div>` : "");

    const station = stationBlock(from, to, "Ganzes Jahr", `Zeitstrahl ${y}`);

    const typen = p.workshopTypen ? (() => {
      const total = sum(p.workshopTypen.map((t) => t.wert));
      const max = Math.max(...p.workshopTypen.map((x) => x.wert));
      const cols = [C.blue, C.pink, C.green, C.orange, C.red, C.yellow2];
      return p.workshopTypen.map((t, i) => `<div class="mmc-progress">
        <div class="mmc-progress-row"><span>${esc(t.name)}</span><strong>${num(t.wert)}</strong></div>
        <div class="mmc-bar mmc-bar-sm"><div class="mmc-bar-fill" data-w="${(t.wert / max) * 100}%" style="background:${cols[i % cols.length]}"></div></div></div>`).join("") +
        `<div class="mmc-note"><strong>${num(total)} gesamt.</strong> ${esc(p.workshopTypenHinweis || "")}</div>`;
    })() : empty();

    const quali = p.qualifizierung ? `<div class="mmc-quali">${p.qualifizierung.map((q, i) => `<div class="mmc-quali-item">
        ${q.badge ? `<img src="${IMG(q.badge)}" alt="Badge ${esc(q.name)}" loading="lazy">` : hexIcon("award", [C.blue, C.green, C.orange, C.pink, C.red][i % 5])}
        <div class="mmc-quali-num">${num(q.wert)}</div><div class="mmc-quali-name">${esc(q.name)}</div></div>`).join("")}</div>` : "";

    const hasEvents = p.veranstaltungenProMM && p.veranstaltungenProMM.some((x) => x);
    view.innerHTML = kpis + ziel +
      card({ eyebrow: "Wo war das Makermobil im Einsatz?", title: `Stationierung ${y}`, icon: "pin", color: C.blue, body: station }) +
      `<div class="mmc-grid-2">
        ${card({ eyebrow: "Einsätze", title: "Veranstaltungen je Makermobil", icon: "bars", color: C.red, body: hasEvents ? chartBox("ch-mm") : empty(),
          badge: hasEvents ? tag(`${num(sum(p.veranstaltungenProMM))} gesamt`) : "" })}
        ${card({ eyebrow: "Lernformate", title: `Workshops nach Typ`, icon: "list", color: C.blue, body: typen })}
      </div>` +
      (p.anfragenProMonat || p.formate ? `<div class="mmc-grid-2">
        ${card({ eyebrow: "Nachfrage", title: "Anfragen nach Startmonat", icon: "mail", color: C.orange,
          body: p.anfragenProMonat ? chartBox("ch-anf") + (p.anfragenHinweis ? `<div class="mmc-note">${esc(p.anfragenHinweis)}</div>` : "") : empty(),
          badge: p.anfragenProMonat ? tag(`${num(sum(p.anfragenProMonat))} gesamt`) : "" })}
        ${card({ eyebrow: "Nachfrage", title: "Angefragte Formate", icon: "pie", color: C.pink, body: p.formate ? chartBox("ch-fmt") : empty() })}
      </div>` : "") +
      (p.qualifizierung ? card({ eyebrow: "Qualifizierung", title: "Qualifiziertes Personal", icon: "award", color: C.green, body: quali,
        badge: tag(`${num(sum(p.qualifizierung.map((q) => q.wert)))} Personen`) }) : "") +
      card({ eyebrow: "Standorte", title: `Nutzung je Medienzentrum ${y}`, icon: "building", color: C.pink, body: mzTable(from, to) });

    wireStation(from, to, { defaultNow: true, allLabel: String(y) });

    if (hasEvents) barChart("ch-mm", D.makermobile.map((m) => [m.name, m.farbe]), p.veranstaltungenProMM, D.makermobile.map((m) => m.color), { unit: "Veranstaltungen" });
    if (p.anfragenProMonat) {
      const max = Math.max(...p.anfragenProMonat);
      barChart("ch-anf", MON, p.anfragenProMonat, p.anfragenProMonat.map((v) => (v === max ? C.blue : v >= max / 3 ? C.yellow2 : "#E6E6E6")), { unit: "Anfragen" });
    }
    if (p.formate && HAS_CHART) {
      charts.push(new Chart(root.querySelector("#ch-fmt"), {
        type: "doughnut",
        data: { labels: p.formate.map((f) => f.name), datasets: [{ data: p.formate.map((f) => f.wert), backgroundColor: [C.blue, C.green, "#E6E6E6", C.orange, C.pink], borderColor: C.ink, borderWidth: 1.5, hoverOffset: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: "58%", plugins: { legend: { position: "right" } } },
      }));
    }
  }

  route();
})();
