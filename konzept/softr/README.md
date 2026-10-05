# Softr-Lager-App „KWM Lager“

Die App läuft in Softr (`kwm-lager.softr.app`, später `lager.<KWM-Domain>.de`, Studio: App „KWM Lager“). Hier liegen die **Quelltexte der Vibe-Coding-Blöcke**, damit sie versioniert und prüfbar sind. Maßgeblich ist der Stand in Softr. Jede Änderung wird per Softr-MCP hochgeladen und über die SHA-256-Prüfsumme gegen `blocks/` abgeglichen.

## Aufbau

- `src/shared/`: **gemeinsame Bauteile, nur hier ändern.**
  - `konstanten.ts`: Status-Werte
  - `daten.ts`: Feldwerte umwandeln, Datum, Zahlen, CSV
  - `mengen.ts`: **Mengenlager** für Geschirr und Edition. Ein Posten ist eindeutig durch Modell, Zustand (roh, geschrüht, glasiert), Glasur, Brand, Reservierung, Status mit Partner (ausgestellt, in Kommission) sowie gedreht und glasiert von. `nachModell` fasst je Modell zusammen (wie die Lagerliste der Werkstatt), `brandGruppen` zählt je Glasur die freie Ware nach Brand („zusammen verkaufbar“), `glasurZeile` zeigt je Modell die Glasuren mit Stückzahl und größtem Brand (z. B. „Rostbraun 16 (9 aus einem Brand)“), `planeUmbuchung` plant Glasieren, Reservieren, Ausstellen und Ausbuchen auf dem frisch geladenen Stand. Ausgestellte Posten tragen zusätzlich „Rückgabe bis“
  - `ui.tsx`: **Grundbausteine** `Knopf`, `Feld`, `Textfeld`, `Stueckzahl`, `TextMitVorschlag`, `AktionKnopf`, `Schnellfilter` und `EinzelWahl` (Filter-Knöpfe wie in Softrs Tabellen), `GlasurWahl` (Glasuren des Modells, andere wählen oder neu anlegen), `SuchAuswahl` (Suchfeld mit Trefferliste, z. B. Modellwahl beim Erfassen), `Auswahl`, `SchalterFeld`, `Ankreuzfeld`, `Etikett` sowie `PANEL_CLASS` (Box), `DIALOG_CLASS` (Fenster), `POPOVER_CLASS` (Menü), Status-Farben. Außerdem Auswahl-Knopf, Knopfreihe, Reiter, Status-Badge, Felder, Auswahlliste, Foto-Vorschau und Foto-Auswahl, „+ Neu“, Kachel, Bereich, Listenzeile, Seitenkopf, Fenster-Kopf, Zustände für Laden, Fehler und „leer“
- `src/blocks/`: Quelltext je Block. Bauteile werden mit `import { … } from "../shared/…"` eingebunden.
- `blocks/`: **erzeugt, nicht von Hand ändern.** Softr kompiliert jeden Block als einzelne Datei und kann keinen Code zwischen Blöcken teilen. `build.mjs` setzt deshalb die benutzten Bauteile in jeden Block ein und lässt ungenutzte weg.

| Quelle | Seite | Block-Titel in Studio |
|---|---|---|
| `src/blocks/erfassen.tsx` | `/erfassen` | Erfassen – Formular |
| `src/blocks/bestand.tsx` | `/bestand` | Bestand – Reiter, Tabelle, Detail |
| `src/blocks/tabelle.tsx` | `/tabelle` | Tabelle – alle Objekte frei filterbar |
| `src/blocks/uebersicht.tsx` | `/` | Übersicht – Dashboard |
| `src/blocks/stammdaten.tsx` | `/stammdaten` | Stammdaten – Personen, Glasuren, Modelle, Partner, Lagerorte |

In der Oberfläche heißen Unikate **Meisterstücke**. Tabelle und Feldnamen in der Datenbank bleiben „Unikate“.

**Testseiten (Runde 15):** Bis zum Umschalten laufen die neuen Stände parallel auf versteckten Seiten `/v2-erfassen`, `/v2-bestand`, `/v2-uebersicht`, `/v2-tabelle` mit eigenen Blöcken auf derselben Datenbank. IDs, Umschalten und Rücksprung: `UEBERGABE.md` und `RUECKSPRUNG.md`.

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
- eine Seite ihre Wurzel selbst baut statt `SEITE_CLASS`/`SEITE_BREIT_CLASS` (verhindert seitliches Verschieben am Handy),
- ein Block selbst `overflow-auto` oder `overflow-x-auto` setzt. Wischzeilen laufen nur über `SCROLL_ROW` bzw. `WISCHEN` (sperrt die senkrechte Achse), Tabellen über `TABLE_PANEL_CLASS`,
- ein Bedienelement nur am Rechner erscheint (`hidden sm:inline-flex` u. Ä.). Handy und Rechner zeigen dieselben Angaben. Filter sind auf beiden Knöpfe mit aufklappender Auswahl (`Schnellfilter`, `EinzelWahl`), am Handy als Wischzeile, nie als Blatt von unten. Ausnahmen: Tabelle am Rechner statt Karten am Handy (`hidden sm:block`/`sm:hidden`) und Werkzeuge der Tabelle über `NUR_TABELLE`,
- Dialog, Popover, Ausklappmenü oder Blatt ohne `DIALOG_CLASS` bzw. `POPOVER_CLASS` geöffnet werden,
- in `ui.tsx` ein Rahmen ohne `LINE` steht (Ausnahmen: Status-Farben, Chips, `destructive`, `primary`, `transparent`) oder ein shadcn-Element außerhalb seines Grundbausteins vorkommt.

## Betrieb nach dem Veröffentlichen

- **Code-Änderungen gehen nicht sofort live.** Upload per MCP ändert nur den Stand im Builder. Testen über einen Vorschau-Link (`application_preview`), live erst mit `application_publish` (nur auf Anweisung des Admins). Rückweg: `vibe_coding_block_restore_version` und erneut veröffentlichen.
- **Datenbank-Änderungen wirken sofort**, auch auf die Live-App, denn Builder und Live-App teilen dieselbe Datenbank. Deshalb nur additiv ändern: neue Felder anlegen, nichts umbenennen oder löschen, solange die Live-App das Feld noch liest. Erst nach dem Veröffentlichen des neuen Codes alte Felder aufräumen.
- **Softr-Workflows** werden einzeln veröffentlicht und wirken dann sofort.

## Fallen

- Daten-Hooks (`useRecords`, `useLinkedRecords`, `useRecordUpdate` …) brauchen ein Objekt-Literal als Argument, und `q.select` muss statisch sein. Sonst bricht Softrs statische Analyse ab.
- **Keine `\u…`-Escapes in Zeichenketten.** Beim Hochladen werden sie in das echte Zeichen umgewandelt, und die Prüfsumme passt dann nicht mehr. Stattdessen `String.fromCharCode(…)` verwenden.
- Vorschau-Links (`application_preview`) zeigen den Stand zum Zeitpunkt des Aufrufs. Nach einer Änderung einen neuen Link holen. Der Link ist ein Zugangsschlüssel und gehört nicht ins Repo.
- Am Handy verdeckt Softrs untere Leiste etwa 80 px, daher `pb-28 sm:pb-8`.
- Radix meldet in der Konsole „DialogContent requires a DialogTitle“. Das ist ein Fehlalarm: Softr rendert in einem Shadow DOM, und Radix sucht den Titel im normalen Dokument.

## Regeln in der Datenbank (Softr-Workflows)

Status- und Datumsregeln laufen als Workflows auf der Datenbank, unabhängig vom Block. Die Liste steht in `konzept/softr/UEBERGABE.md`.
