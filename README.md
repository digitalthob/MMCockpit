# MMCockpit

Das **Makermobile Buchungstool** macht die Vergabe der Makermobile sichtbar und ersetzt die bisherige Excel-Pflege durch eine kleine Web-App.

> Läuft rein im Browser (zunächst auf GitHub Pages, später auf dem Webspace).

## Funktionen

- **Kalenderansicht**: Wochenraster pro Makermobil, Buchungen farbig nach Status.
- **Zeitstrahl-Ansicht**: Gantt-ähnliche Übersicht über mehrere Wochen, zoombar, selbstgebaut (keine externe Lib).
- **Listenansicht**: alle Buchungen mit Suche, Filter (Fahrzeug/Status) und Schnell-Statuswechsel.
- **Fahrzeugverwaltung**: Makermobile anlegen, umbenennen, löschen – jedes mit eigener Farbe.
- **Buchungsformular**: Von/Bis, Person, Organisation/Schule, Kontakt, Zweck, Notiz, Status (`angefragt`, `bestätigt`, `abgelehnt`, `abgeschlossen`) inkl. **Kollisionsprüfung** bei Überschneidungen.
- **Wartungsmodus**: Sperrt neue Buchungen und zeigt ein Banner (Schalter oben rechts).
- **Import / Export**: CSV (semikolongetrennt, Excel-kompatibel), **PDF-Export** (jsPDF, lazily via CDN), JSON-Backup/Restore.
- **Feedback-Formular**: Versand über `mailto:` an die Verwaltung.
- **Lokale Speicherung**: alle Daten im `localStorage` – kein Server, kein Login.

## Struktur (modular)

```
index.html          Struktur
styles.css          Layout (Makermobil-Design)
app.js              Einstiegspunkt, verbindet alle Module
js/core.js          Datenmodell, Persistenz, gemeinsame Helfer
js/ui.js            Tabs, Fahrzeug-Selects, Wartungsmodus
js/vehicles.js      Fahrzeugverwaltung
js/booking.js       Buchungs-Dialog + Kollisionsprüfung
js/calendar.js      Wochen-Kalender
js/timeline.js      Zeitstrahl-Ansicht (selbstgebaut)
js/list.js          Listenansicht
js/importexport.js  CSV/JSON Import & Export
js/pdf.js           PDF-Export (jsPDF via CDN)
js/feedback.js      Feedback per mailto:
beispiel-buchungen.csv  Beispiel-CSV zum Testen des Imports
```

Die Module sind bewusst framework-frei gehalten, damit das Tool später als **WordPress-Plugin** oder mit **Backend (MySQL)** erweitert werden kann. `core.js` kapselt den Datenzugriff – ein späteres Backend muss nur die Funktionen aus `core.js` (loadState/saveState) durch API-Aufrufe ersetzen.

## Auf GitHub Pages nutzen

1. Repo forken oder direkt hier nutzen.
2. **Settings → Pages → Branch `main`, Ordner `/`**.
3. App unter `https://<org>.github.io/MMCockpit/` erreichbar.

Da Daten im Browser gespeichert werden, sieht jede:r Nutzer:in nur die eigenen Buchungen. Eine zentrale, geteilte Datenbasis folgt später über ein Backend.

## CSV-Format (Import aus Excel)

In Excel als „CSV (semikolongetrennt)" speichern. Kopfzeile:

```
id;fahrzeug;von;bis;person;organisation;zweck;kontakt;status;notiz
```

- `von` / `bis` als `YYYY-MM-DD HH:MM` (oder nur `YYYY-MM-DD`).
- `status`: `angefragt`, `bestaetigt`, `abgelehnt`, `abgeschlossen` („bestätigt" wird ebenfalls erkannt).
- `fahrzeug` namentlich; unbekannte Fahrzeuge werden beim Import automatisch angelegt.

Die Datei `beispiel-buchungen.csv` kann direkt über den Tab *Import / Export* importiert werden, um die Datenstruktur zu testen.

## Anpassungen

- **Feedback-Empfänger:** in `js/feedback.js` die Konstante `FEEDBACK_TO` setzen.
- **Fahrzeugfarben:** werden automatisch aus einer Palette vergeben (siehe `js/core.js`).
- **PDF-Export** benötigt Internetverbindung (jsPDF wird vom CDN geladen).
