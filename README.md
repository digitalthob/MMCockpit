# Makermobil Cockpit

Das **Makermobil Cockpit** zeigt die Bilanz der **Innovationsphase 2023–2026** des Innovationsprojekts Makermobil im Rahmen von „Digitale Schule“ des Kultusministeriums Baden-Württemberg – vom Prototyp-Fahrzeug mit fünf Modulen und Studio bis zur Flotte von acht Makermobilen bei 24 Medienzentren – und gibt einen **Ausblick auf die Produktivphase ab 2027**.

Läuft rein im Browser – zunächst auf **GitHub Pages**, später eingebettet in die **WordPress-Seite makermobil.de**.

## Ansichten

| Tab | Inhalt |
|---|---|
| **Gesamtbilanz** (Start) | Kennzahlen der Innovationsphase, Entwicklung „1 Prototyp → 8 Makermobile → Regelbetrieb“, Meilensteine, Plan vs. Ist, Belegungsplan als Zeitstrahl, Nutzung je Medienzentrum |
| **2023/24** – Prototyp & Aufbau | Ausgangslage, die sechs Module mit Illustrationen, Meilensteine der Aufbauphase |
| **2025** – Testphase | Kennzahlen, Karte + Zeitstrahl, Veranstaltungen je Makermobil, Workshop-Typen |
| **2026** – Pilotjahr | Kennzahlen, Zielerreichung, Karte + Zeitstrahl, Anfragen, Formate, Qualifizierung (Badges), Nutzung je Medienzentrum |
| **2027** – Ausblick | Übergang Innovations- → Produktivphase, drei Lernformate (Warm Ups, Making trifft Schule, Hackerdays), Stationierungen bis 2027, Netzwerk der Medienzentren, Planwerte 2027 |

Jede Ansicht hat eine eigene Adresse (`#bilanz`, `#aufbau`, `#2025`, `#2026`) und lässt sich direkt verlinken.

## Struktur

```
index.html                 Seite (lädt nur Container + Skripte)
data/cockpit-data.js       ALLE Zahlen und der Belegungsplan  ← hier pflegen
assets/js/cockpit.js       Darstellung (Ansichten, Zeitstrahl, Karte, Diagramme)
assets/css/cockpit.css     Gestaltung im Design von makermobil.de, unter .mmc gekapselt
assets/img/                Logos, Modul-Illustrationen, Badges, Förderer-Logos (von makermobil.de)
assets/fonts/              Sora + Source Code Pro (lokal, SIL Open Font License)
assets/vendor/             Chart.js 4.4.1 und Leaflet 1.9.4 (lokal, MIT/BSD)
archiv/buchungstool/       früheres Buchungstool (nicht mehr eingebunden)
```

## Design

Das Cockpit übernimmt das Erscheinungsbild von [makermobil.de](https://makermobil.de):
Überschriften in **Source Code Pro**, Fließtext in **Sora**, Markenfarben (Gelb `#FFE566`, Grün `#809F33`, Blau `#4BA1D3`, Pink `#CB549B`, Orange `#EDA554`, Rot `#B52726`), Buttons mit schwarzem Rand und hartem Schatten, Hexagon-Motive, schräge Abschnittskanten sowie die Modul-Illustrationen und Qualifizierungs-Badges der Website.

## Daten pflegen

Alle Werte stehen in **`data/cockpit-data.js`** – der übrige Code muss dafür nicht angefasst werden.

- `meta.datenstand` – Datum der letzten Datenerhebung (wird im Kopf angezeigt).
- `meta.vorlaeufig` – `true` zeigt das Banner „Vorläufige Zahlen“; nach Einpflegen der Endzahlen auf `false` setzen.
- `phasen` – Kennzahlen je Projektphase (Workshops/Personen jeweils `ist` und `plan`); die Phase mit `typ: "ausblick"` erzeugt den Tab „2027“.
- `ausblick` – Lernformate, Netzwerk der Medienzentren, Planungen und **Planwerte 2027** (`ziele`).
- `meta.laufzeit` = Innovationsphase, `meta.produktivAb` = Start der Produktivphase (wird im Zeitstrahl schraffiert).
- `belegungen` – ein Eintrag je Stationierung: Makermobil, Ort, `von`/`bis` als `"JJJJ-MM"`, optional Workshops und Personen. Daraus entstehen Zeitstrahl, Karte und die Tabelle „Nutzung je Medienzentrum“.
- `orte` – Standorte mit Koordinaten für die Karte.
- Unbekannte Werte als `null` eintragen → Anzeige „—“.
- `pruefen: true` an einem Wert markiert ihn im Cockpit mit `*` als „noch zu prüfen“.

## Auf GitHub Pages veröffentlichen

1. **Settings → Pages → Branch `main`, Ordner `/ (root)`**.
2. Cockpit unter `https://<benutzer>.github.io/MMCockpit/` aufrufen.

## Später: Einbindung in WordPress (makermobil.de)

Das Cockpit ist so gebaut, dass es ohne Anpassungen in eine WordPress-Seite passt:

- **Variante A – iFrame (am einfachsten):** Ordner auf den Webspace hochladen und per Block „Benutzerdefiniertes HTML“ einbinden:
  `<iframe src="/cockpit/index.html" style="width:100%;height:2400px;border:0"></iframe>`
- **Variante B – direkt in die Seite:** `<div id="mm-cockpit" class="mmc"></div>` in die Seite setzen und `cockpit.css`, Chart.js, Leaflet, `cockpit-data.js` und `cockpit.js` einbinden (z. B. per kleinem Plugin oder Child-Theme). Alle Styles sind unter `.mmc` gekapselt und kollidieren nicht mit dem Theme. Bilder werden relativ zur Adresse von `cockpit.js` geladen; bei abweichender Ablage `data-base="/pfad/zum/cockpit/"` am Container setzen.

## Externe Abhängigkeiten / Datenschutz

Schriften, Chart.js und Leaflet liegen lokal im Projekt – es werden **keine Google Fonts und kein CDN** geladen. Einzige externe Quelle sind die **Kartenkacheln von CARTO/OpenStreetMap** (`basemaps.cartocdn.com`); das sollte in der Datenschutzerklärung von makermobil.de erwähnt werden. Ohne Internetverbindung fehlt nur der Kartenhintergrund, alles andere funktioniert.
