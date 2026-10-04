# Softr-Lager-App „KWM Lager“

Die App läuft in Softr (`celestina80104.softr.app`, Studio: App „KWM Lager“). Hier liegen die **Quelltexte der Vibe-Coding-Blöcke**, damit sie versioniert und prüfbar sind. Maßgeblich ist der Stand in Softr. Jede Änderung wird per Softr-MCP hochgeladen und über die SHA-256-Prüfsumme gegen `blocks/` abgeglichen.

## Aufbau

- `src/shared/`: **gemeinsame Bauteile, nur hier ändern.**
  - `konstanten.ts`: Status-Werte
  - `daten.ts`: Feldwerte umwandeln, Datum, Zahlen, CSV
  - `ui.tsx`: **Grundbausteine** `Knopf`, `Feld`, `Textfeld`, `Auswahl`, `SchalterFeld`, `Ankreuzfeld`, `Etikett` sowie `PANEL_CLASS` (Box), `DIALOG_CLASS` (Fenster), `POPOVER_CLASS` (Menü), Status-Farben. Außerdem Auswahl-Knopf, Knopfreihe, Reiter, Status-Badge, Felder, Auswahlliste, Foto-Vorschau und Foto-Auswahl, „+ Neu“, Kachel, Bereich, Listenzeile, Seitenkopf, Fenster-Kopf, Zustände für Laden, Fehler und „leer“
- `src/blocks/`: Quelltext je Block. Bauteile werden mit `import { … } from "../shared/…"` eingebunden.
- `blocks/`: **erzeugt, nicht von Hand ändern.** Softr kompiliert jeden Block als einzelne Datei und kann keinen Code zwischen Blöcken teilen. `build.mjs` setzt deshalb die benutzten Bauteile in jeden Block ein und lässt ungenutzte weg.

| Quelle | Seite | Block-Titel in Studio |
|---|---|---|
| `src/blocks/erfassen.tsx` | `/erfassen` | Erfassen – Formular |
| `src/blocks/bestand.tsx` | `/bestand` | Bestand – Reiter, Tabelle, Detail |
| `src/blocks/tabelle.tsx` | `/tabelle` | Tabelle – alle Objekte frei filterbar |
| `src/blocks/uebersicht.tsx` | `/` | Übersicht – Dashboard |
| `src/blocks/stammdaten.tsx` | `/stammdaten` | Stammdaten – Künstler, Glasuren, Modelle, Partner, Lagerorte |

## Ablauf bei einer Änderung

1. In `src/` ändern.
2. `node konzept/softr/build.mjs` erzeugt `blocks/`. Mit `--check` prüft das Skript nur, ob `blocks/` aktuell ist.
3. `bash konzept/softr/pruefung/typcheck.sh` prüft die Typen (strict, ohne ungenutzte Variablen). `build.mjs` ruft vorher `pruefung/einheitlich.mjs` auf und bricht ab, wenn ein Block die Grundbausteine umgeht (siehe unten).
4. Hochladen per MCP: kleine Änderung mit `vibe_coding_block_update_code_search_replace`, sonst mit `vibe_coding_block_update_code` und dem vollen Inhalt aus `blocks/`. Danach `sourceSha256` mit `shasum -a 256 blocks/<datei>` vergleichen.
5. **Aktionsrechte neu setzen**, denn jedes Kompilieren setzt sie zurück: alle ADD-Aktionen auf `LOGGED_IN_USERS`.
6. Playwright-Runde (`pruefung/screens-v4.mjs`), dann Commit.

## Einheitliche Bausteine (vom Build erzwungen)

Rahmen, Höhe und Schrift jedes Elements stehen genau einmal in `ui.tsx`. Seiten geben höchstens Größe, Breite und Lage mit. `pruefung/einheitlich.mjs` bricht den Build mit Datei und Zeile ab, wenn:

- ein Block `Button`, `Input`, `Textarea`, `Badge`, `Switch`, `Checkbox` oder shadcn-`Select` direkt importiert oder rohes `<select>`, `<input>`, `<textarea>` nutzt,
- ein Block eine Rahmenfarbe (`border-…`, `divide-…`, `LINE`) oder einen eigenen umrandeten Kasten baut (Ausnahme: Warnfarbe `destructive`),
- Dialog, Popover, Ausklappmenü oder Blatt ohne `DIALOG_CLASS` bzw. `POPOVER_CLASS` geöffnet werden,
- in `ui.tsx` ein Rahmen ohne `LINE` steht (Ausnahmen: Status-Farben, Chips, `destructive`, `primary`, `transparent`) oder ein shadcn-Element außerhalb seines Grundbausteins vorkommt.

## Fallen

- Daten-Hooks (`useRecords`, `useLinkedRecords`, `useRecordUpdate` …) brauchen ein Objekt-Literal als Argument, und `q.select` muss statisch sein. Sonst bricht Softrs statische Analyse ab.
- **Keine `\u…`-Escapes in Zeichenketten.** Beim Hochladen werden sie in das echte Zeichen umgewandelt, und die Prüfsumme passt dann nicht mehr. Stattdessen `String.fromCharCode(…)` verwenden.
- Vorschau-Links (`application_preview`) zeigen den Stand zum Zeitpunkt des Aufrufs. Nach einer Änderung einen neuen Link holen. Der Link ist ein Zugangsschlüssel und gehört nicht ins Repo.
- Am Handy verdeckt Softrs untere Leiste etwa 80 px, daher `pb-28 sm:pb-8`.
- Radix meldet in der Konsole „DialogContent requires a DialogTitle“. Das ist ein Fehlalarm: Softr rendert in einem Shadow DOM, und Radix sucht den Titel im normalen Dokument.

## Regeln in der Datenbank (Softr-Workflows)

Status- und Datumsregeln laufen als Workflows auf der Datenbank, unabhängig vom Block. Die Liste steht in `konzept/softr/UEBERGABE.md`.
