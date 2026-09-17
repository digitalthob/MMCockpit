# MMCockpit

Das **Makermobile Buchungstool** („Cockpit Plug-In“) macht die Vergabe der Makermobile sichtbar und ersetzt die bisherige Excel-Pflege durch eine kleine Web-App.

> Status: **Beta** – läuft rein im Browser, zunächst auf GitHub Pages, später auf eurem Webspace.

## Funktionen

- **Kalenderansicht**: Wochenraster pro Makermobil, Buchungen farbig nach Status.
- **Listenansicht**: alle Buchungen mit Suche und Filter (Fahrzeug / Status), direkt bearbeitbar.
- **Fahrzeugverwaltung**: Makermobile anlegen, umbenennen, löschen.
- **Buchungen**: Von/Bis-Zeitraum, verantwortliche Person, Organisation/Schule, Kontakt, Zweck, Notiz und Status (`angefragt`, `bestätigt`, `abgelehnt`, `abgeschlossen`).
- **Konfliktprüfung**: Überschneidungen desselben Fahrzeugs werden beim Speichern erkannt.
- **Import / Export**: CSV (semikolongetrennt, Excel-kompatibel) für den Umstieg von der bisherigen Excel-Liste; zusätzlich JSON-Backup/Restore.
- **Lokale Speicherung**: alle Daten liegen im `localStorage` des Browsers – kein Server, kein Login.

## Als Beta auf GitHub Pages nutzen

1. Repo forken oder direkt hier nutzen.
2. In den Repo-Settings unter **Settings → Pages** als Source **Deploy from a branch** wählen, Branch `main` und Ordner `/ (root)` auswählen.
3. Die App ist danach unter `https://<org>.github.io/MMCockpit/` erreichbar.

Da die Daten im Browser gespeichert werden, sieht jede:r Benutzer:in nur die eigenen Buchungen. Für eine zentrale, geteilte Datenbasis ist später eine Backend-Anbindung auf dem Webspace geplant.

## CSV-Format (Import aus Excel)

In Excel als „CSV (semikolongetrennt)“ speichern. Kopfzeile:

```
id;fahrzeug;von;bis;person;organisation;zweck;kontakt;status;notiz
```

- `von` / `bis` als `YYYY-MM-DD HH:MM` (oder nur `YYYY-MM-DD`).
- `status` mit einem der Werte `angefragt`, `bestaetigt`, `abgelehnt`, `abgeschlossen` („bestätigt“ wird ebenfalls erkannt).
- `fahrzeug` muss namentlich passen; unbekannte Fahrzeuge werden beim Import automatisch angelegt.

## Lokal starten

Einfach `index.html` im Browser öffnen – kein Build, keine Abhängigkeiten.

## Dateien

- `index.html` – Struktur
- `styles.css` – Layout
- `app.js` – Logik & Persistenz
