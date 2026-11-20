/* ════════════════════════════════════════════════════════════════════
   MAKERMOBIL COCKPIT – DATEN
   --------------------------------------------------------------------
   Hier stehen ALLE Zahlen des Cockpits. Der Code in assets/js/ muss
   für Aktualisierungen nicht angefasst werden.

   Regeln:
   • Unbekannte Werte als  null  eintragen → Anzeige „—“ bzw. „Daten folgen“.
   • Monate immer als "JJJJ-MM" (z. B. "2026-03").
   • pruefen: true  → Wert wird im Cockpit als „zu prüfen“ markiert.
   • Nach dem Einpflegen finaler Zahlen: meta.vorlaeufig auf false setzen.
   ════════════════════════════════════════════════════════════════════ */
window.MM_COCKPIT_DATA = {

  meta: {
    titel: "Makermobil Cockpit",
    untertitel: "Projektbilanz mobile Makerspaces 2023–2026",
    traeger: "LMZ Baden-Württemberg",
    datenstand: "2026-10-02",      // Datum der letzten Datenerhebung (JJJJ-MM-TT)
    vorlaeufig: true,              // true = Banner „vorläufige Zahlen“ anzeigen
    laufzeit: { von: "2023-01", bis: "2026-12" },
  },

  /* ── Flotte ─────────────────────────────────────────────────────── */
  makermobile: [
    // Farben = Markenfarben von makermobil.de
    { id: 1, name: "MM 1", farbe: "Weiß",    color: "#A8A8A8" },
    { id: 2, name: "MM 2", farbe: "Blau",    color: "#4BA1D3" },
    { id: 3, name: "MM 3", farbe: "Grün",    color: "#809F33" },
    { id: 4, name: "MM 4", farbe: "Gelb",    color: "#F5D04A" },
    { id: 5, name: "MM 5", farbe: "Orange",  color: "#EDA554" },
    { id: 6, name: "MM 6", farbe: "Rot",     color: "#B52726" },
    { id: 7, name: "MM 7", farbe: "Pink",    color: "#CB549B" },
    { id: 8, name: "MM 8", farbe: "Schwarz", color: "#262626" },
  ],

  // Die fünf Making-Module + Studio (Namen, Farben und Illustrationen wie auf makermobil.de)
  module: [
    { name: "3D-Druck",    color: "#4BA1D3", bild: "module/3d-druck.webp" },
    { name: "Grafik",      color: "#CB549B", bild: "module/grafik.webp" },
    { name: "Lasercutter", color: "#EDA554", bild: "module/lasercutter.webp" },
    { name: "Mechatronik", color: "#B52726", bild: "module/mechatronik.webp" },
    { name: "Sticken",     color: "#809F33", bild: "module/sticken.webp" },
    { name: "Studio",      color: "#F7DB67", bild: "module/studio.webp", info: "Ton- und Filmstudio" },
  ],

  /* ── Standorte (Medienzentren) ──────────────────────────────────────
     typ: "mz" = Medienzentrum, "team" = Team Makermobil, "service" = Inspektion */
  orte: {
    "Team MM":         { name: "Team Makermobil (LMZ)",  typ: "team",    coords: [49.005, 8.404] },
    "Inspektion":      { name: "Inspektion / Wartung",   typ: "service", coords: null },
    "Emmendingen":     { name: "Emmendingen",            typ: "mz", coords: [48.125, 7.852] },
    "Tuttlingen":      { name: "Tuttlingen",             typ: "mz", coords: [47.982, 8.826] },
    "Konstanz":        { name: "Konstanz",               typ: "mz", coords: [47.665, 9.175] },
    "SMZ Karlsruhe":   { name: "SMZ Karlsruhe",          typ: "mz", coords: [49.009, 8.389] },
    "Calw":            { name: "Calw",                   typ: "mz", coords: [48.714, 8.735] },
    "Rhein-Neckar":    { name: "Rhein-Neckar-Kreis",     typ: "mz", coords: [49.485, 8.468] },
    "Zollernalb":      { name: "Zollernalbkreis",        typ: "mz", coords: [48.235, 8.908] },
    "Lörrach":         { name: "Lörrach",                typ: "mz", coords: [47.615, 7.661] },
    "Ulm":             { name: "Ulm",                    typ: "mz", coords: [48.401, 9.999] },
    "Ravensburg":      { name: "Ravensburg",             typ: "mz", coords: [47.782, 9.613] },
    "Friedrichshafen": { name: "Friedrichshafen",        typ: "mz", coords: [47.654, 9.479] },
    "Heidenheim":      { name: "Heidenheim",             typ: "mz", coords: [48.676, 10.155] },
    "Neckar-Odenwald": { name: "Neckar-Odenwald-Kreis",  typ: "mz", coords: [49.35, 9.15] },
    "Freudenstadt":    { name: "Freudenstadt",           typ: "mz", coords: [48.466, 8.41] },
    "Rems-Murr-Kreis": { name: "Rems-Murr-Kreis",        typ: "mz", coords: [48.871, 9.431] },
    // weitere Standorte aus früheren Planständen (für Excel-Import vorgehalten)
    "Heidelberg":      { name: "Heidelberg",             typ: "mz", coords: [49.398, 8.672] },
    "Crailsheim":      { name: "Crailsheim",             typ: "mz", coords: [49.135, 10.071] },
    "Stuttgart":       { name: "Stuttgart",              typ: "mz", coords: [48.775, 9.182] },
    "Karlsruhe-Land":  { name: "Karlsruhe-Land",         typ: "mz", coords: [49.009, 8.389] },
    "Reutlingen":      { name: "Reutlingen",             typ: "mz", coords: [48.492, 9.215] },
  },

  /* ── Belegungsplan ──────────────────────────────────────────────────
     Ein Eintrag = ein Makermobil an einem Ort von Monat „von“ bis „bis“
     (jeweils einschließlich). workshops/personen je Station, sobald
     die Excel-Auswertung vorliegt.
     STAND: vorläufig, übernommen aus Planstand Oktober 2026 – bitte
     mit der Excel-Datei abgleichen. */
  belegungen: [
    // 2025
    { mm: 1, ort: "Team MM",         von: "2025-01", bis: "2025-07", workshops: null, personen: null, notiz: "" },
    { mm: 1, ort: "Team MM",         von: "2025-09", bis: "2025-12", workshops: null, personen: null, notiz: "" },
    { mm: 4, ort: "Team MM",         von: "2025-07", bis: "2025-07", workshops: null, personen: null, notiz: "" },
    { mm: 4, ort: "Team MM",         von: "2025-10", bis: "2025-12", workshops: null, personen: null, notiz: "" },
    // 2026
    { mm: 1, ort: "Team MM",         von: "2026-02", bis: "2026-05", workshops: null, personen: null, notiz: "" },
    { mm: 1, ort: "Calw",            von: "2026-06", bis: "2026-07", workshops: null, personen: null, notiz: "" },
    { mm: 1, ort: "Inspektion",      von: "2026-08", bis: "2026-08", workshops: null, personen: null, notiz: "" },
    { mm: 1, ort: "Team MM",         von: "2026-09", bis: "2026-12", workshops: null, personen: null, notiz: "" },
    { mm: 2, ort: "Emmendingen",     von: "2026-03", bis: "2026-08", workshops: null, personen: null, notiz: "August: Ferienprogramm" },
    { mm: 2, ort: "Rems-Murr-Kreis", von: "2026-09", bis: "2026-12", workshops: null, personen: null, notiz: "" },
    { mm: 3, ort: "Tuttlingen",      von: "2026-02", bis: "2026-02", workshops: null, personen: null, notiz: "" },
    { mm: 3, ort: "Konstanz",        von: "2026-03", bis: "2026-05", workshops: null, personen: null, notiz: "" },
    { mm: 3, ort: "Tuttlingen",      von: "2026-06", bis: "2026-07", workshops: null, personen: null, notiz: "" },
    { mm: 3, ort: "Inspektion",      von: "2026-08", bis: "2026-08", workshops: null, personen: null, notiz: "" },
    { mm: 3, ort: "Tuttlingen",      von: "2026-09", bis: "2026-12", workshops: null, personen: null, notiz: "" },
    { mm: 4, ort: "SMZ Karlsruhe",   von: "2026-03", bis: "2026-05", workshops: null, personen: null, notiz: "" },
    { mm: 4, ort: "Team MM",         von: "2026-06", bis: "2026-07", workshops: null, personen: null, notiz: "" },
    { mm: 4, ort: "Inspektion",      von: "2026-08", bis: "2026-08", workshops: null, personen: null, notiz: "" },
    { mm: 4, ort: "SMZ Karlsruhe",   von: "2026-09", bis: "2026-12", workshops: null, personen: null, notiz: "" },
    { mm: 5, ort: "Rhein-Neckar",    von: "2026-02", bis: "2026-05", workshops: null, personen: null, notiz: "" },
    { mm: 5, ort: "Zollernalb",      von: "2026-06", bis: "2026-06", workshops: null, personen: null, notiz: "" },
    { mm: 5, ort: "Rhein-Neckar",    von: "2026-07", bis: "2026-07", workshops: null, personen: null, notiz: "" },
    { mm: 5, ort: "Inspektion",      von: "2026-08", bis: "2026-08", workshops: null, personen: null, notiz: "" },
    { mm: 6, ort: "Lörrach",         von: "2026-02", bis: "2026-04", workshops: null, personen: null, notiz: "" },
    { mm: 6, ort: "Ulm",             von: "2026-05", bis: "2026-07", workshops: null, personen: null, notiz: "" },
    { mm: 6, ort: "Inspektion",      von: "2026-08", bis: "2026-08", workshops: null, personen: null, notiz: "" },
    { mm: 6, ort: "Ravensburg",      von: "2026-09", bis: "2026-12", workshops: null, personen: null, notiz: "" },
    { mm: 7, ort: "Friedrichshafen", von: "2026-02", bis: "2026-07", workshops: null, personen: null, notiz: "" },
    { mm: 7, ort: "Inspektion",      von: "2026-08", bis: "2026-08", workshops: null, personen: null, notiz: "" },
    { mm: 7, ort: "Heidenheim",      von: "2026-09", bis: "2026-12", workshops: null, personen: null, notiz: "" },
    { mm: 8, ort: "Neckar-Odenwald", von: "2026-03", bis: "2026-07", workshops: null, personen: null, notiz: "" },
    { mm: 8, ort: "Inspektion",      von: "2026-08", bis: "2026-08", workshops: null, personen: null, notiz: "" },
    { mm: 8, ort: "Freudenstadt",    von: "2026-09", bis: "2026-12", workshops: null, personen: null, notiz: "" },
  ],

  /* ── Meilensteine (Projektgeschichte) ───────────────────────────── */
  meilensteine: [
    { datum: "2023",    titel: "Projektstart im Innovationsprogramm",
      text: "Start des Projekts „mobile Makerspaces“. Entwicklung eines Prototyp-Fahrzeugs mit fünf Modulen und Studio." },
    { datum: "2024-09", titel: "Das Team Makermobil startet",
      text: "Übernahme von 1 Prototyp-Fahrzeug, 5 Prototyp-Modulen (3D-Druck, Grafik, Lasercutter, Mechatronik, Sticken) und Studio." },
    { datum: "2024/25", titel: "Weiterentwickeln, verbessern, testen",
      text: "Fahrzeug und Module werden im Praxiseinsatz weiterentwickelt und erprobt." },
    { datum: "2025",    titel: "Testphase & erste Workshops",
      text: "3 Makermobile im Einsatz, erste Workshops mit Schulen und Medienzentren." },
    { datum: "2026",    titel: "Pilotjahr: 8 Makermobile",
      text: "Die Flotte ist komplett. 24 Medienzentren nutzen die Makermobile für jeweils 2–6 Monate." },
    { datum: "2026-12", titel: "Projektabschluss",
      text: "Ende der Projektlaufzeit." },
  ],

  /* ── Kennzahlen je Projektphase ─────────────────────────────────────
     Reihenfolge = Reihenfolge der Tabs. */
  phasen: [
    {
      key: "aufbau",
      tab: "2023/24",
      label: "Prototyp & Aufbau",
      titel: "Prototyp & Aufbau 2023–2024",
      color: "#A8A8A8",
      makermobile: 1,              // Prototyp-Fahrzeug
      module: 5,
      studio: true,
      medienzentren: null,
      workshops:  { ist: null, plan: null },
      personen:   { ist: null, plan: null },
      text: "Ausgangspunkt war ein Prototyp-Fahrzeug mit fünf Prototyp-Modulen und einem Studio. Ab September 2024 hat das Team Makermobil Fahrzeug und Module übernommen, weiterentwickelt, verbessert und getestet.",
    },
    {
      key: "2025",
      tab: "2025",
      label: "Testphase",
      titel: "Testphase 2025",
      color: "#4BA1D3",
      makermobile: 3,
      medienzentren: 2,
      workshops:  { ist: 53,   plan: null, pruefen: true },
      personen:   { ist: 3387, plan: null, pruefen: true },
      pruefHinweis: "An anderer Stelle wurden für 2025 34 Workshops / 3.010 Personen genannt – Abgleich mit Excel ausstehend.",
      veranstaltungenProMM: [46, 1, 0, 6, 0, 0, 0, 0],
      workshopTypen: [
        { name: "Qualifizierung", wert: 9 },
        { name: "Making trifft Schule", wert: 4 },
        { name: "WarmUp", wert: 4 },
        { name: "Öffentliche Veranstaltungen", wert: 17 },
      ],
      workshopTypenHinweis: "Aufteilung bezieht sich auf 34 Workshops (älterer Stand).",
    },
    {
      key: "2026",
      tab: "2026",
      label: "Pilotjahr",
      titel: "Pilotjahr 2026",
      color: "#F7DB67",
      makermobile: 8,
      medienzentren: 24,
      workshops:  { ist: 299,   plan: 628 },
      personen:   { ist: 12022, plan: 17363 },
      planDetail: "Team: 37 · Medienzentrenverbund (MZV): 591",
      veranstaltungenProMM: [72, 16, 25, 34, 13, 22, 39, 78],
      workshopTypen: [
        { name: "Workshops MZV (MtS & WarmUp)", wert: 576 },
        { name: "Lokale Formate & Events (MZV)", wert: 15 },
        { name: "Warm Up Tage (Team)", wert: 8 },
        { name: "Making trifft Schule (Team)", wert: 7 },
        { name: "Hackerdays & Messen (Team)", wert: 6 },
        { name: "Qualifizierungen (Team)", wert: 16 },
      ],
      workshopTypenHinweis: "Geplante Workshops nach Typ (Plan 2026).",
      anfragenProMonat: [3, 3, 7, 6, 3, 4, 16, 0, 0, 1, 0, 1],
      anfragenHinweis: "Nur Anfragen über das Formular des Team Makermobil – die Medienzentren nutzen eigene Anmeldeverfahren.",
      formate: [
        { name: "WarmUp", wert: 18 },
        { name: "Making trifft Schule", wert: 17 },
        { name: "Sonstiges / offen", wert: 7 },
        { name: "Hackerdays", wert: 2 },
      ],
      qualifizierung: [
        { name: "Ausbilderschein 1", wert: 7 },
        { name: "Qualifizierung TA1", wert: 10 },
        { name: "Maker Teacher", wert: 5, badge: "badges/maker-teacher.webp" },
        { name: "Maker Assistant", wert: 12, badge: "badges/maker-assistant.webp" },
        { name: "Making Impuls", wert: 8, badge: "badges/making-impuls.webp" },
      ],
    },
  ],
};
