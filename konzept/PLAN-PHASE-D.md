# Phase D: Komponenten-Bibliothek – Feinplanung

> **Für ausführende Agenten:** Diese Datei ist der Auftrag. Vorher `CLAUDE.md`, `DESIGN.md` §3 (Textstile), §5 (Abschnittstypen), §11 (Komponenten-Inventar, **verbindlich**), `konzept/SANITY-MODELL-WEBSITE.md` und `konzept/PLAN-ASTRO-UMBAU.md` §10 lesen. Ausführung durch Sonnet-Subagents, eine Komponentengruppe pro Aufgabe, Review je Aufgabe, Endprüfung Opus.

**Ziel:** Jede Seite besteht nur noch aus Komponenten aus `DESIGN.md` §11. Eine Komponente trägt ihre Textstile und ihr CSS selbst (scoped), Varianten laufen über Props. Inhalte, die später aus Sanity kommen, liegen als typisierte Daten in `src/data/` in der Form des Sanity-Modells; Phase 2 tauscht nur die Quelle aus. **Keine sichtbare Änderung.**

**Voraussetzung:** Phase C ist gemergt (CSS unter `src/styles/`, Skripte als TypeScript, Bilder über `Bild.astro`).

**PRs (gestapelt, je ein Branch):** D1 Gerüst → D2 Einträge → D3 Aufklappen und Archive → D4 Formular und Kleinteile → D5 Bild und Signatur.

## D0: Grundsätze für alle Aufgaben (Controller-Entscheidungen)

1. **Spezifität erhalten:** `astro.config.mjs` bekommt `scopedStyleStrategy: 'where'` (Doku „Configuration → scopedStyleStrategy“: `'where'` ohne Spezifitätserhöhung; Standard `'attribute'` erhöht um +1). So behalten Regeln, die aus `src/styles/*.css` in eine Komponente wandern, genau ihre bisherige Spezifität. Scoped Styles stehen in der Reihenfolge zuletzt (Doku „Cascading Order“), deshalb kann eine verschobene Regel nur gegen gleich spezifische Regeln anders ausfallen; das zeigt der Optik-Test. Einführung in D1 als erster Commit, Optik muss unverändert grün bleiben.
2. **Vorgehen pro Komponente** (immer in dieser Reihenfolge, ein Commit pro Komponente):
   1. Alle Fundstellen der Klassen aus §11 suchen (`grep -rn "class=\"[^\"]*\bname\b" src`) und das gemeinsame Markup-Muster ableiten.
   2. `src/components/<Name>.astro` mit typisiertem `interface Props`; Varianten als Prop `variant?: 'hell' | 'flaeche' | 'anker'` (bzw. die in §11 genannten Varianten) über `class:list`. Inhalte über Props oder `<slot />`/benannte Slots, nie über `set:html` mit freiem HTML.
   3. Die CSS-Regeln, die nur diese Komponente betreffen, **wörtlich** aus `src/styles/*.css` in den `<style>`-Block der Komponente verschieben (Medienabfragen mitnehmen), dort löschen. Regeln, die die Komponente im Raster einer bestimmten Seite platzieren (`grid-column` u. Ä.), bleiben im Seiten-CSS.
   4. Alle Fundstellen in den Seiten durch die Komponente ersetzen.
   5. `npm test` (Optik 26 ohne Update), Textvergleich 0, `npm run check` 0.
3. **Namen:** Komponenten englisch wie in §11 (`SectionHead`, `WorkCard` …), Props und Daten deutsch wie im Sanity-Modell (`titel`, `jahr`, `masse`). Klassen im Markup bleiben, wie sie sind (kein Umbenennen in dieser Phase).
4. **Daten in Sanity-Form:** `src/data/<typ>.ts` exportiert ein typisiertes, `as const`-freies Array mit einem exportierten `interface` je Dokumenttyp aus `SANITY-MODELL-WEBSITE.md` (`Ausstellung`, `Hinweis`, `Ort`, `Werk`, `Glasur`, `Manufakturteil`, `ChronikEintrag`, `LebenswegStation`, `Text`). Feldnamen genau wie im Modell. **Kein Feld für Preis, Bestand, Lagerort, Inventarnummer, Verfügbarkeit.** Bilder als Pfad, den `Bild.astro` auflöst, plus Pflichtfeld `nachweis` (Bildnachweis), wo das Markup einen hat.
5. **Verhalten pro Instanz** als Custom Element in der Komponente (Muster aus der Astro-Doku „Scripts → Web components“: `class X extends HTMLElement { connectedCallback() {…} }` und `customElements.define`). Kandidaten: `Expander`, Menü im `Header`, Glasurbühne, `PlaceGrid`. Globale Skripte in `src/scripts/` schrumpfen entsprechend.
6. **Datumslogik bleibt im Browser** (Prüffokus 4 aus Phase A): Funktion `statusText(start, ende, heute)` in `src/scripts/status.ts` mit Unit-Test (Vitest laut Astro-Doku „Testing“, in D2 einführen: `npm i -D vitest`, Skript `test:unit`, in `npm run check` aufnehmen).
7. **Erfolgsmaß:** `grep -c 'class="' src/pages/*.astro` sinkt deutlich (vorher/nachher im Bericht); `src/styles/seiten/page-*.css` enthält nur noch Raster-Anordnung oder entfällt.

## Aufgabe D1: Gerüst

Komponenten: `SubNav`, `PageHero` (Typen `name`, `meta`, `flaeche`, `anker`), `SectionHead` (vereint `.sec-head` und `.chapter__head`), `ChapterHead` (`.chapter`, `.chapter__intro`), `Statement` (`.pullquote`, `.stance__quote`, `.zaesur`, `.catalog__quote`, `.mf-intro__rule`, `.med__quote`, `.statement`; Variante `bild` für `.zaesur`), `Lede`, `Prose` (inkl. `.legal__body`).
- Erster Commit: `scopedStyleStrategy: 'where'` (D0.1).
- `SectionHead` und `.chapter__head` unterscheiden sich heute vermutlich in Abständen: beide Varianten als Prop abbilden (`art?: 'start' | 'kapitel'`), nicht angleichen (sichtbar!). Abweichungen in der Fehlerliste notieren.

## Aufgabe D2: Einträge

Komponenten: `ExhibitionCard` (Spotlight, Eintrag, Kachel), `WorkCard` (breit, Reihe), `WareCard` (Satz, Edition), `FactsList` (hell, anker, breit), `DateList`, `PubList` (`pubs`, `texts`), `PersonCard`, `Steps`.
Daten: `src/data/ausstellungen.ts` (`Ausstellung`, `Ort` als Referenz per Schlüssel), `werke.ts` (`Werk`), `manufaktur.ts` (`Manufakturteil`), `team.ts` (Person: Name, Rolle, Text, Bild; nicht im Sanity-Modell → im Bericht als Ergänzung für das Modell vorschlagen), `texte.ts` (`Text`).
- Status-Funktion und Vitest (D0.6). Die Startseite „Aktuell“ und die Seite Aktuelles rendern aus `ausstellungen.ts`; die Status-Anzeige übernimmt das bestehende Browser-Skript bzw. `status.ts`.
- `WorkCard` erzeugt den Anfrage-Link `/besuch?stueck=<titel>#anfrage` wie `InquiryBand` (gemeinsame kleine Funktion in `src/scripts/anfrage-link.ts`, nicht doppelt).

## Aufgabe D3: Aufklappen und Archive

Komponenten: `Expander` (Custom Element, ersetzt `src/scripts/expander.ts`), `YearArchive`, `Timeline` (Lebensweg), `Chronicle`, `PlaceGrid` (Custom Element, ersetzt den Kern von `sig-orte`).
Daten: `chronik.ts` (`ChronikEintrag`), `lebensweg.ts` (`LebenswegStation`), `orte.ts` (`Ort`, Zahlen pro Ort aus `ausstellungen.ts` berechnet, wie im Modell beschrieben).
- Barrierefreiheit unverändert (axe 26/26), Tastaturbedienung des Expanders und der Orte-Kacheln prüfen (Tab, Enter, Escape).

## Aufgabe D4: Formular und Kleinteile

Komponenten: `Notice`, `LinkArrow` (73 Stellen; Prop `ton?: 'hell' | 'anker'`), `Button` (gefüllt, Ghost), `InfoBlock`, `Hours`.
- `InquiryForm` liest Telefon und Mail aus `kontakt.ts` (Befund aus Phase A); die Seiten Besuch, Impressum, AGB, Datenschutz, Zahlung, Startseite und Werkstatt nutzen für Kontaktangaben ebenfalls `kontakt.ts`. Danach `grep -rn "30 50 80\|kwm1924.de" src/pages src/components` → nur noch Treffer in `kontakt.ts`-Ausgaben, keine festen Texte.
- Die zwei `{/* prettier-ignore */}` aus Phase A (`besuch.astro`, `index.astro`) durch `LinkArrow` bzw. eine Struktur ersetzen, bei der Prettier kein Leerzeichen vor dem Satzzeichen erzeugen kann (Textvergleich beweist es).

## Aufgabe D5: Bild und Signatur

Komponenten: `Figure` (4:3, 3:2, 4:5, Panorama), `Plinth` (`.plinth`, `.shelf`), Signatur-Hüllen je verbliebener Signatur (`Signature`-Komponenten, die `data-sig` setzen, einen sinnvollen Inhalt ohne JavaScript ausgeben und ihr CSS tragen), `Hours` falls nicht in D4.
Daten: `glasuren.ts` (`Glasur`; heute `GLAZES` in `keramik`) – Farbskala und Glasurbühne lesen daraus.
- `style="--c:…"`-Attribute in Klassen oder Props mit `define:vars` überführen, wo möglich (erleichtert die CSP in Phase E; im Bericht zählen, was übrig bleibt).

## Abschluss Phase D (Controller)

Pro PR Endprüfung `code-review` (Opus). Bericht `konzept/PHASE-D-BERICHT.md` mit Klassenzählung vorher/nachher, Liste der Komponenten mit Props, Vorschläge für das Sanity-Modell (z. B. `person`), offene Fehlerliste. `konzept/ADMIN-OFFEN.md` ergänzen.
