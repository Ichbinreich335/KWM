# Softr-Lager-App „KWM Lager“

Die App läuft in Softr (`celestina80104.softr.app`, Studio: App „KWM Lager“). Diese Dateien sind die **Quelltexte der Vibe-Coding-Blöcke**, damit sie versioniert und prüfbar sind. Maßgeblich ist der Stand in Softr. Jede Änderung wird per Softr-MCP hochgeladen und über die SHA-256-Prüfsumme gegen diese Dateien abgeglichen.

| Datei | Seite | Block |
|---|---|---|
| `blocks/erfassen.tsx` | Erfassen (`/erfassen`) | Erfassen – Formular |
| `blocks/bestand.tsx` | Bestand (`/bestand`) | Bestand – Reiter, Tabelle, Detail |
| `blocks/bestand-admin.tsx` | Bestand (`/bestand`) | Bestand – Admin-Bearbeitung (nur Gruppe Admin) |
| `blocks/uebersicht.tsx` | Übersicht (`/uebersicht`) | Übersicht – Dashboard |
| `blocks/start-weiterleitung.tsx` | Startseite (`/`) | Weiterleitung zur Übersicht |

Daten: Softr-Datenbank „Keramik-Lager KWM“. Feld-IDs stehen in den `q.select`-Aufrufen der Blöcke.

## Beim Ändern beachten
- Daten-Hooks (`useRecords`, `useLinkedRecords`, `useRecord` …) brauchen ein Objekt-Literal als erstes Argument, sonst bricht Softrs statische Analyse ab.
- **Jedes Neukompilieren setzt die Aktionsrechte zurück.** Danach per MCP wieder setzen: Anlegen nur für angemeldete Nutzer, Admin-Bearbeitung nur für Gruppe Admin.
- Vorschau-Links (`application_preview`) frieren den Stand ein. Nach einer Änderung einen neuen Link holen.
- Am Handy verdeckt Softrs untere Leiste etwa 80 px, daher `pb-28` in den Blöcken.
