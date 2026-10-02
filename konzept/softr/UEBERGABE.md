# Übergabe Softr-Lager-App (Stand 02.10.2026, Session-Ende)

Für die nächste Session. Zuerst `CLAUDE.md`, `konzept/SOFTR-AUFTRAG.md` und `konzept/vergleich/SOFTR-BERICHT.md` lesen. Der Bericht enthält Stand, Admin-Schritte und Blocker.

## Arbeitsort
- **Branch `claude/softr-lager-app`, nur im Worktree `../KWM-softr` arbeiten.** Im Hauptordner `KWM` arbeitet parallel eine Design-Session auf `design-v2`. Deren ungespeicherte Änderungen dort nie anfassen. Vor jedem Commit `git branch --show-current` prüfen.
- Drei Softr-Commits liegen zusätzlich auf `design-v2` (94c2041, 1b41b55, aab6d8e). Inhaltlich sind es dieselben wie auf dem Softr-Branch. Beim Mergen von `design-v2` kann es dadurch Doppelungen geben, sonst sind sie harmlos.

## IDs
- Workspace `e8a9e57b-3039-4f76-90fd-f2c8e083fe54`, Integration „Softr databases“ `98c893c0-bd2f-4d53-a956-ba482b81b331`
- App **KWM Lager** `ec7c4118-0ec4-4e68-bb07-e711f8758c7f` (`celestina80104.softr.app`, nicht veröffentlicht)
- Datenbank **Keramik-Lager KWM** `4a2f1f1d-3c1b-409a-8bf0-247d4ea8a943`
  - Unikate `xwEM6w8Bh50qvZ`, Editionsbestand `YiXoQdoAOdAMKi`, Lagerorte `OkZyfUBDFSX9Q5`, Künstler:innen `jT3tn7aJ7XSPSD`, Glasuren `AnjVdW3LNfkOci`, Galerien `OvbAJbLAREp8w2`, Modelle `AP1Orb2GOIv5yr`, Ansichten `mAIslsfXtiURlR`
  - Feld-IDs stehen in den `q.select`-Aufrufen der Blöcke
- Nutzertabelle (alte DB „Keramik Lagerverwaltung“ `75f5aea7-…`, Tabelle Users `tEFkHenBq0S7Sw`, Feld Role `z0b2k`). Gruppen: Admin `cd647c55-6e21-402f-a7c6-1db87f5410f0`, Werkstatt `723ec91e-a533-4022-adc5-12182968b0af`. Testnutzer „Werkstatt Test“ `verwaltung.kwm+werkstatt@proton.me`.

| Seite | Page-ID | Block (Datei) | Block-ID | Datenquellen | Aktionsrechte |
|---|---|---|---|---|---|
| `/erfassen` | `8cba05b9-7689-4bdf-a275-d6988ecdb8eb` | `erfassen.tsx` | `c2222c6c-2726-4590-9804-eef9c6d44ddb` | unikate, edition, glasuren, kuenstler | alle ADD → LOGGED_IN_USERS |
| `/bestand` | `131c6c30-67d8-4939-87b8-b79f9bbe9bf6` | `bestand.tsx` | `cab355a2-0a7f-47a2-863a-41d2bbf7cae5` | unikate, edition | UPDATE → LOGGED_IN_USERS (Standard) |
| `/bestand` | dito | `bestand-admin.tsx` | `ebff8c25-217d-417f-98cb-bc2f660e3b78` | unikate | Block-Sichtbarkeit und UPDATE → nur Gruppe Admin |
| `/tabelle` | `1c5c5fed-5ec8-40df-8b13-4ae96ced2fdd` | `tabelle.tsx` | `ad8e12f4-0372-492b-a713-87334990aa90` | unikate, edition, ansichten | ADD ansichten → LOGGED_IN_USERS |
| `/uebersicht` | `16450fdc-1469-49fb-8785-acac62a5c953` | `uebersicht.tsx` | `c62602bd-dd73-44d6-9625-b59aec539939` | unikate, edition | keine |
| `/` (Home) | `089c7891-ebdd-44cf-b346-8d14a1a9a983` | `start-weiterleitung.tsx` | `9753e657-6e52-489f-9279-d9695beb5b1a` | keine | keine |

## Richtungswechsel 02.10.2026: fertige Softr-Blöcke zuerst
Entscheidung des Admins: Wir nutzen möglichst Softrs fertige Blöcke (Table, Item Details, Form, Chart). Grund: einheitliche Optik und weniger eigene Logik. Vibe-Code nur, wo Softr etwas nicht kann. Fertige Blöcke lassen sich per MCP nicht anlegen, der Admin klickt sie mit `STUDIO-ANLEITUNG.md` zusammen. Danach prüfe ich mit Playwright.
- Probeseiten (leer, per MCP angelegt): **Stück** `/stueck` `57958266-8b78-4ea5-83c4-6d9f94e20d7a`, **Alle Stücke (Softr-Tabelle)** `/alle-stuecke` `69071c68-7879-40b4-a69a-4f01cc20e228`
- **Regeln laufen als Softr-Workflows** (aktiv, live getestet). Sie greifen bei jeder Änderung, egal aus welchem Block:
  - „Außer Haus setzt Lagerort“ `20a289ce-90f7-4016-a0c4-c20eeb88c51d`
  - „Außer Haus setzt Datum“ `8270e5f1-ea35-4505-b801-99986a5586c1` (Zeitzone UTC)
  - „Zurück im Haus leert Außer-Haus-Felder“ `f4f069d9-b121-4108-9aa3-ffbe083664b9`
  - „Verkauft setzt Verkaufsdatum“ `3f241140-002f-4ebf-a1e9-7cd636c7fcb9` (Zeitzone UTC)
- Workflow-Wissen: Filter im Trigger als `{"operator":"AND","conditions":[{"leftSide":"<Feld-ID>","operator":"IS_ONE_OF","rightSide":[…]}]}`, Datum heute als `{dateTime:::TODAY}`. Die Zeitzone des Workflows muss **UTC** sein (bei Europe/Berlin wird der Vortag gespeichert). Nach einer Änderung der Konfiguration den Workflow erneut veröffentlichen, sonst gilt die alte Einstellung. Das Testen eines Triggers liest einen echten Datensatz, das Testen eines Update-Schritts mit `workflow_test_node` schreibt echt, mit `workflow_test` nur als Probe.
- Die Status-/Lagerort-Kopplung im Vibe-Code (`bestand.tsx`, `erfassen.tsx`) ist damit doppelt vorhanden, aber widerspruchsfrei. Sie fällt weg, sobald die Blöcke ersetzt sind.
- Prüfbericht mit 27 Ungereimtheiten: `konzept/vergleich/SOFTR-KONSISTENZ.md`. Erledigt: Befund 1 (Status/Lagerort), 2 (Partner überschrieben), 3 (Folgefelder beim Erfassen, jetzt per Workflow), 12 teilweise (Datum per Workflow).

## Arbeitsweise (zwingend)
1. Vor Code-Änderungen `vibe_coding_block_get_docs` aufrufen.
2. Erst die Datei hier ändern, dann per MCP hochladen: klein per `vibe_coding_block_update_code_search_replace`, groß per `update_code`. Danach die zurückgegebene `sourceSha256` mit `shasum -a 256 <datei>` vergleichen.
3. **Nach jedem Hochladen die Aktionsrechte neu setzen** (Tabelle oben), denn Softr setzt sie beim Kompilieren zurück. Für den Admin-Block: UPDATE mit `customGroups: [Admin-ID]`.
4. Daten-Hooks nur mit Objekt-Literal aufrufen (keine Hilfsfunktion, kein `as never` am Argument).
5. Grids immer mit `grid-cols-1`, Blöcke mit `pb-28 sm:pb-8` (Softr-Leiste unten am Handy).
6. Vorschau: `application_preview` liefert einen Link, der den Stand zur Zeit des Aufrufs zeigt. Nach Änderungen einen neuen holen. Der Link ist ein Zugangsschlüssel, nicht ins Repo.
7. Playwright: Die App läuft in der Vorschau in einem iframe. Die innere URL (`…/seite?autoUser=true&t=…`) direkt öffnen. Blöcke rendern im Shadow DOM (Playwright-Locators gehen durch, `document.querySelector` nicht). Prüfskripte: `konzept/softr/pruefung/` (Aufruf siehe README dort, `PREVIEW_URL` als Umgebungsvariable).


## Neue Anforderung „Außer Haus“ (Admin, 02.10.2026) – Entscheidung und Plan
**Ziel:** Jederzeit sehen, welche Ware wo außer Haus ist (Galerie, Museum, Ausstellung, Leihgabe). Später eventuell auf der Website „Aktuell zu sehen in …“.

**Entscheidung:** keine fünfte Seite. „Außer Haus“ wird der **erste große Bereich der Übersicht**, direkt unter den Kennzahlen. Das gibt der Übersicht einen echten Zweck und hält das Menü bei vier Punkten (Erfassen · Bestand · Tabelle · Übersicht). Die Detailsuche läuft weiter über die Tabelle.

**Datenmodell (umkehrbar, ohne Löschen):**
1. Tabelle **„Galerien“ zu „Partner“ umbenennen** und erweitern: Feld `Art` (Auswahl: Galerie, Museum, Ausstellung/Messe, Privat/Leihnehmer), `Ort`, `Kontakt` bleiben.
2. Status-Auswahl in Unikate um **„ausgestellt“** ergänzen (Leihgabe oder Ausstellung ohne Verkaufsabsicht). „in Kommission“ bleibt für Verkauf über Galerien. Status-Farbe für „ausgestellt“ festlegen (Vorschlag: violett), mit dem dataviz-Validator prüfen.
3. In Unikate neue Felder **„Außer Haus seit“** und **„Rückgabe bis“** (Datum). Das Feld „Galerie“ heißt dann „Partner“ und wird bei „in Kommission“ **und** „ausgestellt“ angezeigt.
4. Optional später für die Website: Feld **„Ausstellung“** (Text, z. B. „Keramik heute, Museum X, bis 30.11.“). Freigabe wie bisher über „Auf Website zeigen“. Die Website liest nur freigegebene Felder, nie Preis oder Lagerort intern.

**UI:**
- Übersicht → Bereich „Außer Haus“: je Partner eine Karte mit Art, Ort, Anzahl Stücke, Warenwert, frühestem Rückgabedatum. Überfällige Rückgaben rot markiert, „in den nächsten 14 Tagen“ gelb. Antippen öffnet `/tabelle?partner=…`.
- Bestand: Schnell-Status um „ausgestellt“ erweitern. Bei „in Kommission“ und „ausgestellt“ erscheint Partner + Rückgabe bis.
- Erfassen: dasselbe Feldverhalten. Tabelle: neue Spalten und Filter.
- Danach: Übersicht-Kacheln „Reserviert/Verkauft“ auf `/tabelle?status=…` umstellen (siehe Offen, Punkt 2) und alle Blöcke testen. Rechte neu setzen!

## Beobachtung Admin zum Vergleich Softr/Baserow (nur festhalten, nicht bewerten)
- Das Badge „Made with Softr“ lässt sich laut Admin auch im ca. 20-€-Tarif nicht vollständig entfernen. Es stört die Bedienung nicht, wirkt aber weniger professionell. Für die Entscheidung Softr oder Baserow notiert. Die Bewertung macht eine andere Session.

## Offen (in dieser Reihenfolge)
0. **UI-Review abarbeiten:** `konzept/vergleich/SOFTR-UI-REVIEW.md` (10 × P1, 18 × P2, 10 × P3; Noten Erfassen 2, Bestand 3, Tabelle 3, Übersicht 3). P1 erledigt, P2-5/6/8/9/13/14/15/17 erledigt (02.10.). Offen als Feinschliff: P2-1 (Reiter Status vs. Typ ordnen), P2-2 (Standard „Im Haus“ statt „Alle“), P2-3/4 (Kopfbereich und Reiter-Scroll am Handy), P2-7 (Speichern-Knopf fest unten), P2-10 (Anzahl: Stepper vs. Detail), P2-11 (Schwelle „knapp“ erklären), P2-12 (Tabelle am Handy), P2-16 (Start im Bestand statt Übersicht?), P2-18 (Editionsware im Dashboard entschlacken), P3-1 bis P3-10. Erledigte P1: unsichtbare Fehler im Erfassen am Handy, Rückgängig nach Sofort-Änderungen, englisches „Close“ im Panel, Status-Farben der aktiven Chips.
1. ~~„Außer Haus“~~ umgesetzt am 02.10. (Übersicht, Bestand, Erfassen, Tabelle). Offen nur das Website-Feld „Ausstellung“.
1. **UI-Review einarbeiten:** Ein Opus-Agent mit Refero-MCP hat die vier Seiten bewertet. Leitfrage: „In 10 Minuten verständlich, volle Funktion bei Bedarf.“ Ergebnis: `konzept/vergleich/SOFTR-UI-REVIEW.md`, falls der Agent vor Session-Ende fertig wurde. Sonst den Review neu ausführen (Opus, Refero, Playwright Desktop/Mobil/Tablet, nichts speichern, nur bewerten).
2. **Übersicht:** (Kachel-Links auf `/tabelle?status=…` am 02.10. behoben.) Pro Bereich einen kurzen Satz „Was sehe ich hier?“ ergänzen (Wunsch Admin).
3. **Tabelle am Handy:** scrollt seitlich (vertretbar, aber prüfen: weniger Standardspalten auf Mobil).
4. **Werkstatt-Test:** „Preview as“ wirkt in der automatisierten Vorschau nicht. Nach der Veröffentlichung echter Login als Werkstatt. Bis dahin hat der Admin das manuell in Studio geprüft (noch offen).
5. Offene Frage für den Test-Abend: Umschalter „Unikat / Editionsware“ oben in der Erfassen-Maske beibehalten?
6. Admin-Schritte und Blocker: siehe `konzept/vergleich/SOFTR-BERICHT.md`.
7. Vor dem Merge: Skill `code-review` auf den Branch.
