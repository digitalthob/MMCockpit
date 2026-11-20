# Makermobil Cockpit

Das **Makermobil Cockpit** zeigt die Bilanz des Projekts *mobile Makerspaces* (Innovationsprogramm, Laufzeit 2023–2026): vom Prototyp-Fahrzeug mit fünf Modulen und Studio bis zur Flotte von acht Makermobilen bei 24 Medienzentren in Baden-Württemberg.

Läuft rein im Browser – zunächst auf **GitHub Pages**, später eingebettet in die **WordPress-Seite makermobil.de**.

## Ansichten

| Tab | Inhalt |
|---|---|
| **Gesamtbilanz** (Start) | Kumulierte Kennzahlen, Entwicklung „1 Prototyp → 8 Makermobile“, Meilensteine, Plan vs. Ist, Belegungsplan als Zeitstrahl, Nutzung je Medienzentrum |
| **2023/24** – Prototyp & Aufbau | Ausgangslage, Prototyp-Module, Meilensteine der Aufbauphase |
| **2025** – Testphase | Kennzahlen, Karte + Zeitstrahl, Veranstaltungen je Makermobil, Workshop-Typen |
| **2026** – Pilotjahr | Kennzahlen, Zielerreichung, Karte + Zeitstrahl, Anfragen, Formate, Qualifizierung, Nutzung je Medienzentrum |

Jede Ansicht hat eine eigene Adresse (`#bilanz`, `#aufbau`, `#2025`, `#2026`) und lässt sich direkt verlinken.

## Struktur

```
index.html                 Seite (lädt nur Container + Skripte)
data/cockpit-data.js       ALLE Zahlen und der Belegungsplan  ← hier pflegen
assets/js/cockpit.js       Darstellung (Ansichten, Zeitstrahl, Karte, Diagramme)
assets/css/cockpit.css     Gestaltung, komplett unter .mmc gekapselt
assets/img/                Logo und Header-Hintergrund
archiv/buchungstool/       früheres Buchungstool (nicht mehr eingebunden)
```

## Daten pflegen

Alle Werte stehen in **`data/cockpit-data.js`** – der übrige Code muss dafür nicht angefasst werden.

- `meta.datenstand` – Datum der letzten Datenerhebung (wird im Kopf angezeigt).
- `meta.vorlaeufig` – `true` zeigt das Banner „Vorläufige Zahlen“; nach Einpflegen der Endzahlen auf `false` setzen.
- `phasen` – Kennzahlen je Projektphase (Workshops/Personen jeweils `ist` und `plan`).
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
- **Variante B – direkt in die Seite:** `<div id="mm-cockpit" class="mmc"></div>` in die Seite setzen und `cockpit.css`, Chart.js, Leaflet, `cockpit-data.js` und `cockpit.js` einbinden (z. B. per kleinem Plugin oder Child-Theme). Alle Styles sind unter `.mmc` gekapselt und kollidieren nicht mit dem Theme. Die Bildpfade in `cockpit.js`/`cockpit.css` sind relativ und ggf. anzupassen.

## Externe Abhängigkeiten

Chart.js 4.4.1 und Leaflet 1.9.4 (cdnjs), Schrift Inter (Google Fonts), Kartenkacheln von CARTO/OpenStreetMap. Ohne Internetverbindung zeigt das Cockpit statt Diagrammen und Karte einen Hinweis; Kennzahlen, Zeitstrahl und Tabellen funktionieren weiterhin.
