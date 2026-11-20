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
    untertitel: "Bilanz der Innovationsphase 2023–2026 · Ausblick Produktivphase 2027",
    // Rahmen: Makermobil ist ein Innovationsprojekt im Rahmen von „Digitale Schule“ des Kultusministeriums BW
    programm: "„Digitale Schule“ des Kultusministeriums Baden-Württemberg",
    traeger: "LMZ Baden-Württemberg",
    datenstand: "2026-10-02",      // Datum der letzten Datenerhebung (JJJJ-MM-TT)
    vorlaeufig: true,              // true = Banner „vorläufige Zahlen“ anzeigen
    laufzeit: { von: "2023-01", bis: "2026-12" },   // Innovationsphase (Entwicklungsphase)
    produktivAb: "2027-01",                          // Start der Produktivphase
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
    "Freiburg":        { name: "Freiburg",               typ: "mz", coords: [47.999, 7.842] },
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
     STAND: vorläufig. Bis Aug. 2026 aus Planstand Oktober 2026, ab Sep. 2026
     abgeglichen mit der Standortliste auf makermobil.de (20.11.2026).
     pruefen: true = Eintrag widerspricht einer anderen Quelle → mit Excel klären. */
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
    { mm: 1, ort: "Team MM",         von: "2026-09", bis: "2027-12", workshops: null, personen: null, notiz: "dauerhaft beim Team Makermobil" },
    { mm: 2, ort: "Emmendingen",     von: "2026-03", bis: "2026-08", workshops: null, personen: null, notiz: "August: Ferienprogramm" },
    { mm: 2, ort: "Rems-Murr-Kreis", von: "2026-09", bis: "2026-09", workshops: null, personen: null, notiz: "Planstand Okt. 2026; laut makermobil.de ab Okt. in Ravensburg", pruefen: true },
    { mm: 2, ort: "Ravensburg",      von: "2026-10", bis: "2027-01", workshops: null, personen: null, notiz: "laut makermobil.de" },
    { mm: 3, ort: "Tuttlingen",      von: "2026-02", bis: "2026-02", workshops: null, personen: null, notiz: "" },
    { mm: 3, ort: "Konstanz",        von: "2026-03", bis: "2026-05", workshops: null, personen: null, notiz: "" },
    { mm: 3, ort: "Tuttlingen",      von: "2026-06", bis: "2026-07", workshops: null, personen: null, notiz: "" },
    { mm: 3, ort: "Inspektion",      von: "2026-08", bis: "2026-08", workshops: null, personen: null, notiz: "" },
    { mm: 3, ort: "Tuttlingen",      von: "2026-09", bis: "2027-07", workshops: null, personen: null, notiz: "Kooperation KMZ Konstanz + Tuttlingen" },
    { mm: 4, ort: "SMZ Karlsruhe",   von: "2026-03", bis: "2026-05", workshops: null, personen: null, notiz: "" },
    { mm: 4, ort: "Team MM",         von: "2026-06", bis: "2026-07", workshops: null, personen: null, notiz: "" },
    { mm: 4, ort: "Inspektion",      von: "2026-08", bis: "2026-08", workshops: null, personen: null, notiz: "" },
    { mm: 4, ort: "SMZ Karlsruhe",   von: "2026-09", bis: "2027-02", workshops: null, personen: null, notiz: "Kooperation SMZ Karlsruhe + KA-Land, Calw, Mittelbaden, Pforzheim" },
    { mm: 5, ort: "Rhein-Neckar",    von: "2026-02", bis: "2026-05", workshops: null, personen: null, notiz: "" },
    { mm: 5, ort: "Zollernalb",      von: "2026-06", bis: "2026-06", workshops: null, personen: null, notiz: "" },
    { mm: 5, ort: "Rhein-Neckar",    von: "2026-07", bis: "2026-07", workshops: null, personen: null, notiz: "" },
    { mm: 5, ort: "Inspektion",      von: "2026-08", bis: "2026-08", workshops: null, personen: null, notiz: "" },
    { mm: 6, ort: "Lörrach",         von: "2026-02", bis: "2026-04", workshops: null, personen: null, notiz: "" },
    { mm: 6, ort: "Ulm",             von: "2026-05", bis: "2026-07", workshops: null, personen: null, notiz: "" },
    { mm: 6, ort: "Inspektion",      von: "2026-08", bis: "2026-08", workshops: null, personen: null, notiz: "" },
    { mm: 6, ort: "Ravensburg",      von: "2026-09", bis: "2026-10", workshops: null, personen: null, notiz: "Planstand Okt. 2026; laut makermobil.de ab Nov. in Freiburg", pruefen: true },
    { mm: 6, ort: "Freiburg",        von: "2026-11", bis: "2027-01", workshops: null, personen: null, notiz: "laut makermobil.de" },
    { mm: 7, ort: "Friedrichshafen", von: "2026-02", bis: "2026-07", workshops: null, personen: null, notiz: "" },
    { mm: 7, ort: "Inspektion",      von: "2026-08", bis: "2026-08", workshops: null, personen: null, notiz: "" },
    { mm: 7, ort: "Heidenheim",      von: "2026-09", bis: "2027-01", workshops: null, personen: null, notiz: "" },
    { mm: 8, ort: "Neckar-Odenwald", von: "2026-03", bis: "2026-07", workshops: null, personen: null, notiz: "" },
    { mm: 8, ort: "Inspektion",      von: "2026-08", bis: "2026-08", workshops: null, personen: null, notiz: "" },
    { mm: 8, ort: "Freudenstadt",    von: "2026-09", bis: "2027-01", workshops: null, personen: null, notiz: "" },
  ],

  /* ── Meilensteine (Projektgeschichte) ───────────────────────────── */
  meilensteine: [
    { datum: "2023",    titel: "Start der Innovationsphase",
      text: "Makermobil startet als Innovationsprojekt im Rahmen von „Digitale Schule“ des Kultusministeriums Baden-Württemberg. Entwicklung eines Prototyp-Fahrzeugs mit fünf Modulen und Studio." },
    { datum: "2024-09", titel: "Das Team Makermobil startet",
      text: "Übernahme von 1 Prototyp-Fahrzeug, 5 Prototyp-Modulen (3D-Druck, Grafik, Lasercutter, Mechatronik, Sticken) und Studio." },
    { datum: "2024/25", titel: "Weiterentwickeln, verbessern, testen",
      text: "Fahrzeug und Module werden im Praxiseinsatz weiterentwickelt und erprobt." },
    { datum: "2025-01", titel: "Start der digitalen Makermobil-Plattform",
      text: "Ein Login für Cloud, Support, digitale Verträge, Podcast und Badges – seitdem monatlich weiterentwickelt und an die Anforderungen angepasst." },
    { datum: "2025",    titel: "Testphase & erste Workshops",
      text: "3 Makermobile im Einsatz, erste Workshops mit Schulen und Medienzentren." },
    { datum: "2026",    titel: "Pilotjahr: 8 Makermobile",
      text: "Die Flotte ist komplett. 24 Medienzentren nutzen die Makermobile für jeweils 2–6 Monate." },
    { datum: "2026-12", titel: "Abschluss der Innovationsphase",
      text: "Die Entwicklungsphase ist abgeschlossen: Flotte, Module, Lernformate und Medienzentren-Netzwerk stehen." },
    { datum: "2027",    titel: "Start der Produktivphase",
      text: "Die Makermobile gehen in den Regelbetrieb. Neu ab Schuljahr 2027: das Lernformat Hackerdays." },
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
    {
      key: "2027",
      typ: "ausblick",
      tab: "2027",
      label: "Ausblick",
      titel: "Produktivphase ab 2027",
      color: "#CB549B",
      makermobile: 8,
      medienzentren: null,
      workshops:  { ist: null, plan: null },
      personen:   { ist: null, plan: null },
    },
  ],

  /* ── Digitale Makermobil-Plattform ─────────────────────────────────
     Bewusst nicht technisch beschrieben (für den Abschlussbericht).
     zahl: feste Zahl · zahlAus: "badges" = Summe der Qualifizierungen aus `badgeFuer` */
  plattform: {
    titel: "Mehr als Fahrzeuge: die digitale Makermobil-Plattform",
    text: "Ein Login für alles, was Maker Teacher für ihre Arbeit brauchen – erreichbar über makermobil.de. Seit Anfang 2025 in Betrieb und seitdem jeden Monat weiterentwickelt und an die Anforderungen angepasst.",
    seit: "2025-01",
    badgeFuer: ["Maker Assistant", "Maker Teacher"],
    dienste: [
      { verb: "Entdecken & buchen", tool: "makermobil.de", icon: "compass", color: "#F7DB67",
        text: "Lernformate, Anleitungen und Buchung der Makermobile an einem Ort.",
        zahl: 17, einheit: "Warm Ups online" },
      { verb: "Material teilen", tool: "Cloud", icon: "cloud", color: "#4BA1D3",
        text: "Anleitungen, Vorlagen und Projektdateien zum Austausch unter Maker Teachern.",
        zahlAus: "badges", einheit: "Maker Teacher & Assistants angemeldet" },
      { verb: "Hilfe bekommen", tool: "Ticketsystem", icon: "lifebuoy", color: "#EDA554",
        text: "Fragen und Probleme digital melden – nichts geht verloren, alles ist nachvollziehbar.",
        status: "digitalisiert" },
      { verb: "Papierlos vereinbaren", tool: "DocuSeal", icon: "pen", color: "#809F33",
        text: "Verträge und Vereinbarungen digital unterschreiben – DSGVO-konform.",
        status: "DSGVO-konform" },
      { verb: "Hören & produzieren", tool: "Podcast", icon: "mic", color: "#CB549B",
        text: "Podcasts aus dem Studio im Makermobil.",
        zahl: 2, einheit: "Staffeln", detail: "„Changelog Makerspace“ · „FSJ digital – Jugendmedienschutz“" },
      { verb: "Wirkung sichtbar machen", tool: "Open Badges", icon: "award", color: "#B52726",
        text: "Qualifizierungen als digitale Badges – nachweisbar und messbar.",
        zahlAus: "badges", einheit: "Badges vergeben" },
    ],
    // So arbeitet ein Maker Teacher mit der Plattform
    weg: [
      { schritt: "Qualifizieren", tool: "Badge", icon: "award" },
      { schritt: "Material holen", tool: "Cloud", icon: "cloud" },
      { schritt: "Makermobil buchen", tool: "makermobil.de", icon: "compass" },
      { schritt: "Workshop durchführen", tool: "Makermobil", icon: "truck" },
      { schritt: "Fragen klären", tool: "Support", icon: "lifebuoy" },
      { schritt: "Erfahrungen teilen", tool: "Podcast", icon: "mic" },
    ],
  },

  /* ── Ausblick & Verstetigung (Produktivphase ab 2027) ──────────────
     Quelle: makermobil.de (Stand 20.11.2026). Planwerte ergänzen, sobald bekannt. */
  ausblick: {
    text: "Mit dem Ende der Innovationsphase gehen die Makermobile 2027 in die Produktivphase. Was in der Entwicklungsphase entstanden ist – Flotte, Module, Lernformate, Materialien, die digitale Plattform und das Netzwerk der Medienzentren – wird zum Regelangebot für Schulen in Baden-Württemberg.",

    // Planwerte Produktivphase 2027 (null = noch offen → „Daten folgen“)
    ziele: {
      workshops: null,
      personen: null,
      medienzentren: null,
    },

    // Lernformate laut makermobil.de
    lernformate: [
      { name: "Warm Ups", icon: "flame", color: "#EDA554",
        text: "Einstieg ins Making: Module kennenlernen, Techniken ausprobieren.",
        status: "verfügbar", anzahl: 17, einheit: "Warm Ups online", detail: "davon 10 mit PDF-Anleitung" },
      { name: "Making trifft Schule", icon: "book", color: "#809F33",
        text: "Bildungsplaninhalte praktisch erfahrbar machen – Projekte für bis zu drei Unterrichtsstunden, Klasse 3 bis 13.",
        status: "verfügbar", anzahl: 7, einheit: "Projekte", detail: "2 verfügbar, 5 in Vorbereitung" },
      { name: "Hackerdays", icon: "laptop", color: "#4BA1D3",
        text: "Eigene Projekte umsetzen. Das neue Format wird gerade entwickelt.",
        status: "neu ab 2027", anzahl: null, einheit: "", detail: "Start ab Schuljahr 2027" },
    ],

    // Anfragen / Planungen ohne festen Zeitraum
    planung: [
      { mm: 5, text: "Interesse Medienzentrum Mannheim / Heidelberg", zeitraum: null },
    ],

    // Medienzentren auf der Standortkarte von makermobil.de
    netzwerk: [
      { name: "KMZ Bodenseekreis",          ort: "Friedrichshafen",      coords: [47.654, 9.479] },
      { name: "KMZ Emmendingen",            ort: "Emmendingen",          coords: [48.121, 7.849] },
      { name: "KMZ Esslingen",              ort: "Plochingen",           coords: [48.712, 9.419] },
      { name: "KMZ Freiburg",               ort: "Freiburg",             coords: [47.999, 7.842] },
      { name: "KMZ Freudenstadt",           ort: "Freudenstadt",         coords: [48.463, 8.411] },
      { name: "KMZ Göppingen",              ort: "Göppingen",            coords: [48.703, 9.652] },
      { name: "KMZ Hohenlohekreis",         ort: "Künzelsau",            coords: [49.281, 9.690] },
      { name: "KMZ Landkreis Karlsruhe",    ort: "Bruchsal",             coords: [49.124, 8.598] },
      { name: "KMZ Main-Tauber-Kreis",      ort: "Tauberbischofsheim",   coords: [49.623, 9.662] },
      { name: "KMZ Neckar-Odenwald-Kreis",  ort: "Mosbach",              coords: [49.353, 9.151] },
      { name: "KMZ Ortenaukreis",           ort: "Offenburg",            coords: [48.473, 7.944] },
      { name: "KMZ Ostalbkreis",            ort: "Schwäbisch Gmünd",     coords: [48.799, 9.798] },
      { name: "KMZ Ravensburg",             ort: "Ravensburg",           coords: [47.782, 9.612] },
      { name: "KMZ Rems-Murr-Kreis",        ort: "Waiblingen",           coords: [48.830, 9.317] },
      { name: "KMZ Reutlingen",             ort: "Reutlingen",           coords: [48.491, 9.204] },
      { name: "KMZ Schwarzwald-Baar",       ort: "Donaueschingen",       coords: [47.953, 8.503] },
      { name: "KMZ Schwäbisch Hall",        ort: "Crailsheim",           coords: [49.135, 10.071] },
      { name: "KMZ Sigmaringen",            ort: "Sigmaringen",          coords: [48.087, 9.216] },
      { name: "KMZ Tuttlingen",             ort: "Tuttlingen",           coords: [47.985, 8.818] },
      { name: "KMZ Ulm",                    ort: "Ulm",                  coords: [48.398, 9.991] },
      { name: "KMZ Zollernalbkreis",        ort: "Albstadt",             coords: [48.257, 9.023] },
      { name: "Medienzentrum Heidelberg",   ort: "Heidelberg",           coords: [49.398, 8.672] },
      { name: "Medienzentrum Heidenheim",   ort: "Heidenheim",           coords: [48.676, 10.152] },
      { name: "SMZ Karlsruhe",              ort: "Karlsruhe",            coords: [49.009, 8.404] },
      { name: "SMZ Mannheim",               ort: "Mannheim",             coords: [49.488, 8.466] },
      { name: "SMZ Stuttgart",              ort: "Stuttgart",            coords: [48.783, 9.205] },
    ],
  },
};
