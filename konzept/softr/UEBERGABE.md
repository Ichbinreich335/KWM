# Übergabe Softr-Lager-App (Stand 03.10.2026)

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
| `/bestand` | `131c6c30-67d8-4939-87b8-b79f9bbe9bf6` | `bestand.tsx` | `cab355a2-0a7f-47a2-863a-41d2bbf7cae5` | unikate, edition, kuenstler, glasuren, lagerorte, partner, modelle | ADD edition und glasuren → LOGGED_IN_USERS; UPDATE/DELETE Standard |
| `/tabelle` | `1c5c5fed-5ec8-40df-8b13-4ae96ced2fdd` | `tabelle.tsx` | `ad8e12f4-0372-492b-a713-87334990aa90` | unikate, edition, ansichten | ADD ansichten → LOGGED_IN_USERS |
| `/uebersicht` | `16450fdc-1469-49fb-8785-acac62a5c953` | `uebersicht.tsx` | `c62602bd-dd73-44d6-9625-b59aec539939` | unikate, edition, partner | keine |
| `/stammdaten` | `c8a4fadb-196f-4712-b649-816e0f1ebd5e` | `stammdaten.tsx` | `451b0d69-677c-4f15-9f15-87cae9021028` | kuenstler, glasuren, modelle, partner, lagerorte, unikate, edition | alle ADD → LOGGED_IN_USERS |

## Stand 05.10.2026 (Runde 14, Feedback Admin, gilt vor allem darunter)
Runde 13 und 14 sind hochgeladen, aber **nicht veröffentlicht** (Freigabe Admin offen).

**Umgesetzt (Runde 14):**
- Neue Felder Editionsbestand (nur ergänzt): Maße `eVHco`, Gedreht von `7FQQm`, Glasiert von `dkREk` (beide → Künstler:innen), Status `v9V6W` (ausgestellt, in Kommission; leer = im Haus), Partner `hs3iV` (→ Galerien). Gegenfelder legte Softr selbst an (Künstler:innen `X2GBc`, `TyjT9`; Galerien `Y7hi5`).
- Posten-Schlüssel jetzt Modell + Zustand + Glasur + Brand + Reservierung + Status + Partner + gedreht + glasiert. Maße gehören nicht zum Schlüssel.
- Bestand hat zusätzlich die Aktion ADD auf `glasuren` (neue Glasur beim Glasieren). Nach jedem Hochladen ADD `edition` und ADD `glasuren` auf LOGGED_IN_USERS setzen.
- Unikat-Feld „Künstler:in“ `oDNBh` bleibt in der Datenbank, wird aber nirgends mehr angezeigt oder geschrieben. Löschen nur mit OK.
- Stammdaten-Reiter heißt „Personen“. Programm „Manufakturprogramm“ wird als „Geschirr“ angezeigt und beim Speichern zurückübersetzt.

**Entscheidungen aus dem Feedback:**
- **Wort „Manufakturprogramm“ nie anzeigen**, überall „Geschirr“ (Erfassen, Stammdaten, Tabelle). Der DB-Wert darf vorerst bleiben, die Anzeige läuft über `serieVon`.
- **Erfassen, erster Schritt:** drei große Knöpfe Geschirr | Edition | Unikat. Danach nur die Modelle dieser Serie (keine lange gruppierte Liste mehr).
- **Geschirr und Edition bekommen mehr Felder**, aufklappbar („Weitere Angaben“): gedreht von, glasiert von (Freitext mit Vorschlägen), Maße, Notiz. Für Edition wichtig, für Geschirr optional.
- **Maße:** vorbelegt aus dem Modell, änderbar, beim Erfassen am Posten gespeichert (neues Feld im Editionsbestand, nur ergänzen).
- **Status für Edition:** Ein Editionsstück kann z. B. „ausgestellt“ sein. Status-Feld am Posten (im Haus / ausgestellt), im Bestand sichtbar und änderbar. Teil des Posten-Schlüssels.
- **Glasuren frei erweiterbar:** In der Glasurauswahl (Erfassen und Schritt „Glasieren“) gibt es „Neue Glasur“ direkt im Feld (z. B. „Grün dunkel“, „Freestyle“). Edition ist nicht auf die Glasuren des Modells beschränkt.
- **Unikat:** Feld „Künstler:in“ entfällt (Unikate sind nur Meisterstücke der Werkstattleitung). Weitere Unikat-Felder nur bei klarem Nutzen.
- **Brand sichtbar machen (statt Brandbuch-Seite):** Stücke aus verschiedenen Bränden sehen anders aus und sind nicht zusammen verkaufbar (z. B. 16 Essteller aus 3 Bränden). Im Modellfenster glasierte Posten je Glasur nach Brand gruppieren und „zusammen verkaufbar: N (größter Brand)“ zeigen.
- **Kernfragen**, die die App ohne Zählen beantworten muss: Was habe ich? Wie viel roh, geschrüht, glasiert? Wie viele je Glasur? Wie viele davon aus einem Brand, also zusammen verkaufbar?
- **Übersicht** neu und einfacher, entlang dieser Kernfragen. **Bestand** bleibt wie er ist („simpel, sieht gut aus“).
- **Website:** Ein Prüfagent sieht sich an, ob die Website Geschirr, Edition und Unikat sauber trennt (Begriffe, Felder, Glasuren, Maße).
- **Workflow-Fragen:** Liste möglicher Alltagsfragen an den Admin, der bewertet, welche realistisch sind.

## Stand 05.10.2026 (Runde 13, gilt vor allem darunter): Mengenlager nach Kundengespräch
- **Drei Serien:** Geschirr (in der DB „Manufakturprogramm“, Nr. 1 ff., sechs Glasuren), Edition (Nr. 2001 ff., Farbe je nach Brand) und Unikate (= Meisterstücke von Young-Jae Lee, seltener). Geschirr und Edition sind der Hauptfluss und stehen überall zuerst.
- **Zustände:** roh → geschrüht → glasiert (Feld `WUkN3`, „Rohling“ entfernt, die 5 Demo-Zeilen auf „geschrüht“ umgestellt).
- **Neue Felder:** Editionsbestand „Brand vom“ `jqmqn` (Datum) und „Reserviert für“ `L1bO5` (Freitext); Unikate „Verkauft an“ `4qhRx` (Freitext). Nur ergänzt.
- **Ein Posten** = Modell + Zustand + Glasur + Brand + Reservierung. Gleiche Posten werden zusammengezählt, ein Posten mit 0 Stück wird beim Umbuchen gelöscht.
- **Bestand:** Reiter Geschirr | Edition | Unikate. Eine Zeile je Modell („geschrüht 25 · glasiert 14“). Modell antippen → Posten antippen → Glasieren bzw. Schrühen (mit Ausschuss, Glasur, Brand, Reservierung, Lagerort), Reservieren/Freigeben, Ausbuchen, Korrigieren. Kein Plus/Minus mehr in der Liste.
- **Kunden:** keine eigene Tabelle. Freitext mit Vorschlägen aus früheren Einträgen (`TextMitVorschlag`).
- **Kein Brandbuch und kein Verlauf** (Abschnitt 0: „Buchungsjournal vorerst raus“). „Brand vom“ macht Brände in der Tabelle filterbar.
- **Bestand-Block** hat jetzt die Datenquelle `modelle` (Glasuren je Modell) und die Aktionen ADD und DELETE auf `edition`.

## Stand 04.10.2026 (gilt vor allem darunter)
- **UI-Sweep** mit Skill `impeccable`: Bericht `konzept/vergleich/SOFTR-UI-SWEEP-0410.md`. Einziger Umschalter sind die unterstrichenen `Tabs`; Status und Zustand im Bestand sind Auswahllisten in der Filterzeile. Gewählter Status trägt seine Farbe im Knopf (`STATUS_ACTIVE`). `SearchPick` behält die Reihenfolge.
- **Aufgeräumt 04.10. (OK Admin):** Testdatensätze U-2026-013/014 und Block „Bestand – Admin-Bearbeitung“ gelöscht. Offen für Studio (per MCP nicht löschbar): Seiten `/old-home`, `/stueck`, `/alle-stuecke` und die drei Standard-Diagramme unter der Übersicht.
- **Archiv in Stammdaten:** Feld „Archiviert“ in Künstler:innen `TOhYe`, Glasuren `jxxXN`, Modelle `3tlrw`, Partner `24Tn9`, Lagerorte `kMBsy`. Löschen nur ohne Verwendung.
- **Neue Datenquellen:** Erfassen hat zusätzlich `lagerorte`, `partner`, `modelle`; Bestand zusätzlich `kuenstler`, `glasuren`, `lagerorte`, `partner`.
- **Aktionsrechte:** Erfassen alle ADD, Tabelle ADD ansichten, Stammdaten alle ADD → LOGGED_IN_USERS. Nach jedem Hochladen neu setzen.
- **Übersicht liegt jetzt auf `/`**, die alte Startseite auf `/old-home`.
- **Runde 3 (04.10. nachmittags):**
  - Entscheidung: eigene Blöcke bleiben (Bestand, Erfassen, Übersicht, Stammdaten, Tabelle). Softr-Standard-Tabelle getestet (Testblock auf `/alle-stuecke`, vom Admin angelegt), sie kann keine „ist leer“-, Datums- und Zahlenbedingungen und zeigt Unikate und Edition nicht gemeinsam.
  - Tabelle: Reiter Alle | Unikate | Editionsware, Schnellfilter je Feld (mehrere Werte je Feld = oder, Felder = und), „Weitere Filter“ für Bedingungen, Seiten zu 50, shadcn `Table` und `Badge`. Gespeicherte Ansichten Version 3 (mit Reiter und Schnellfiltern), Version 2 wird weiter gelesen.
  - Erfassen: lädt alle Editionszeilen (vorher max. 100). Speichern bei Editionsware wartet, bis alles geladen ist, sonst entstünde eine doppelte Zeile.
  - Modelle: neue Felder „Artikelnr.“ `BNpSN` und „VK-Preis“ `772dM` (€, 2 Stellen), in Stammdaten pflegbar. Editionsbestand: Nachschlagefelder „Artikelnr.“ `Zzp1S` und „VK-Preis“ `kAyrB`.
  - Typ „Obertopf“ → „Übertopf“ (Unikate `7g9jI`, Modelle `gCX7K`). **Achtung:** `database_update_field` vergibt beim Umbenennen einer Auswahl eine neue ID und leert die Datensätze mit dem alten Wert. Die zwei betroffenen Datensätze wurden sofort neu gesetzt. Künftig vorher die betroffenen Datensätze notieren.
  - Offen fürs Kundengespräch: Zustände „Rohling/glasiert“ → „geschrüht/fertig“? Glasur bei Editionsware fest je Artikel? Preisliste (Foto 31.07.26) als Startbestand importieren (Handschrift unsicher, Freigabe nötig).
- **Runde 4 (04.10. abends): Katalog und Robustheit**
  - Katalog aus den Anfrageformularen der Werkstatt (Stand 04/2026) in „Modelle“ importiert: 27 Editionen (2001–2039, Glasur fest bzw. frei) und 54 Artikel Manufakturprogramm (1–56, je 6 Glasuren: Weiß, Hellgrün matt/glänzend, Dunkelgrün matt/glänzend, Rostbraun). VK der Editionen aus der gedruckten Preisliste 01/2024, Geschirr ohne Preis. Skript: `konzept/softr/import/katalog.py`. Keine Bestandsmengen importiert.
  - Neue Felder Modelle: Programm `Mrgtb`, Name englisch `CyPYU`, Glasuren `EazCZ` (→ Glasuren, Gegenfeld `PQup2`). Editionsbestand: Lookup Programm `IIAdh`. Typen ergänzt: Tasse, Krug, Kanne, Flasche, Dose, Topf, Sieb, Blatt (bestehende IDs unverändert geprüft). 5 Demo-Modelle archiviert.
  - Erfassen: Modell-Auswahl gruppiert (Editionen | Manufakturprogramm) mit Nummer. Glasur kommt aus dem Modell (eine = fest, mehrere = Pflichtauswahl, keine = freiwillig). Vor dem Speichern wird der Editionsbestand frisch geladen und dort weitergezählt.
  - Bestand: Status wieder als Knöpfe mit Zahl (Im Haus · Außer Haus · Verkauft · Alle), Editionsware mit Zustand-Knöpfen und Programm-Auswahl, sortiert nach Artikelnr. Plus/Minus und Rückgängig rechnen auf dem frischen Server-Wert. Das Bearbeiten-Fenster überschreibt keine inzwischen geänderte Anzahl.
  - Stammdaten: Artikelnr. eindeutig. Glasuren zählen auch die Verwendung durch Modelle. Löschen zählt direkt vorher frisch nach.
  - Build: `build.mjs` erkennt jetzt auch `async function` in `src/shared`.

## Stand 03.10.2026 (gilt vor den Abschnitten darunter)
- **Rechte:** Die Werkstatt darf **alle** Daten ändern, auch Preis, „Auf Website zeigen“ und Verkaufsdatum (Vorgabe Admin 03.10.). Eigene Nutzergruppen werden damit nicht mehr gebraucht. Alle Aktionen stehen auf „angemeldete Nutzer“.
- **Logins:** genau zwei, „KWM“ (Admin) und eines für die Werkstatt. Die Liste der Künstler:innen bleibt davon unabhängig (Stammdaten).
- **Vibe-Code bleibt, aber einheitlich:** Alle Blöcke bauen auf `src/shared/` auf (siehe `README.md`). Die Probeseiten mit fertigen Softr-Blöcken (`/stueck`, `/alle-stuecke`) werden nicht weiterverfolgt und können gelöscht werden, sobald der Admin zustimmt.
- **Neue Seite Stammdaten** (`/stammdaten`): Künstler:innen, Glasuren, Modelle, Partner, Lagerorte anlegen und korrigieren, mit Angabe, wo sie verwendet werden. Löschen ist dort nicht vorgesehen. Der Lagerort „Außer Haus“ ist gegen Umbenennen geschützt, weil die Workflows ihn per Namen finden.
- **Kosten:** `konzept/vergleich/KOSTEN-SOFTR-BASEROW.md`. Ohne eigene Nutzergruppen reicht wahrscheinlich Softr Free. Offen sind Dateispeicher und MCP im Free-Tarif.
- **Für den Baserow-Nachbau:** Schema und Daten in `konzept/softr/export/`, Screenshots in `konzept/vergleich/softr-v4/`.

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
