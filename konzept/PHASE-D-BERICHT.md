# Bericht: Phase D – Komponenten-Bibliothek

Plan: [PLAN-PHASE-D.md](PLAN-PHASE-D.md). Gestapelte Branches `phase-d1-geruest` bis `phase-d5-bilder` (Worktree `../KWM-phase-d`). Prinzip: keine sichtbare Änderung, Optik-Screens nie erneuert; einzige bewusste Ausnahme ist Ruling 27 (eigener letzter Commit, unten).

## Ergebnis in Zahlen

| | vor D1 | nach D3 | nach D4 | nach D5 |
|---|---|---|---|---|
| Zeilen mit `class="` in `src/pages/*.astro` | 1819 | 309 | 261 | **183** |

Der Ausgangswert im Auftrag (1778) war der Stand nach D1a; die Zählung am Elternteil von D1 liefert 1819 (`git show 1a38e14^`). Zählung: `grep -c 'class="'` je Datei, Summe.

Je Seite (vor D1, nach D3, nach D4, nach D5):

| Seite | vor D1 | nach D3 | nach D4 | nach D5 |
|---|---|---|---|---|
| index | 480 | 120 | 108 | 66 |
| young-jae-lee | 355 | 28 | 26 | 26 |
| aktuelles | 350 | 2 | 1 | 1 |
| manufaktur | 218 | 41 | 39 | 11 |
| meisterstuecke | 177 | 14 | 13 | 13 |
| werkstatt | 123 | 24 | 21 | 13 |
| besuch | 62 | 48 | 27 | 27 |
| 404 | 8 | 6 | 2 | 2 |
| agb | 10 | 6 | 6 | 6 |
| impressum | 9 | 5 | 5 | 5 |
| datenschutz | 9 | 5 | 3 | 3 |
| zahlung | 11 | 7 | 7 | 7 |
| versand | 7 | 3 | 3 | 3 |

Weitere Messwerte:
- `src/styles/`: `global.css` 2269 → 1666 Zeilen, `pages.css` 584 → 156, `seiten/page-*.css` 1842 → 820. Das Verzeichnis `src/styles/signaturen/` und `expander.css` entfallen, ihre Regeln stehen in den Komponenten.
- Komponenten: 40 Dateien in `src/components/`, rund 3 800 Zeilen davon Stile (scoped, außer den Hüllen der Signaturen).
- `style`-Attribute im ausgelieferten HTML: 23 (13 × Footer-Filter, je Seite eines; 6 Farbkacheln der Startseite; 4 Ofenfarben der Werkstatt) → **0**.
- Tests: 116 Playwright (Optik 26 ohne Update, Barrierefreiheit 26, Routen, Verhalten, Wächter `tests/stile.spec.ts` 26), 44 Vitest, `npm run check` grün.

## Komponenten und Props

Gerüst und Köpfe
- `Header` (`current?`), `Footer` (keine Props), `SubNav` (`beschriftung`, `eintraege`).
- `PageHero` (`typ: 'name' | 'meta' | 'flaeche' | 'anker'`, Titel-ID, `streifen`, `bildunterschrift`, `einblenden`, `ledeAls`; Slots `titel`, `lede`, `bild`).
- `SectionHead` (`typ?: 'start' | 'kapitel'`, `titelId`, `rechtsKlasse?`), `ChapterHead` (`id?`, `titelId?`, `beschriftung?`, `ton?: 'hell' | 'flaeche' | 'anker'`).
- `Statement` (`typ: 'gross' | 'aussage' | 'regel' | 'zitat' | 'lede' | 'zitat-klein' | 'zitat-bild'`, `als?: 'blockquote' | 'p'`, `einblendung?: 'words' | 'fade' | 'keine'`, `quelle?`, `textId?`), `Prose`.

Einträge und Kacheln
- `ExhibitionCard` (`ausstellung`, `typ: 'spotlight' | 'kachel' | 'eintrag'`, `gespiegelt?`), `WorkCard` (`typ: 'katalog' | 'stimmung'`, `werk` bzw. `stimmung`, `breite?`), `WorkTile` (`werk`), `WareCard` (`satz`), `WareGroup` (`gruppe`).
- `FactsList` (`fakten`, `typ: 'ort' | 'raster' | 'zeile-hell' | 'zeile-anker'`, `einblenden?`), `FactsTable` (`fakten`; Slot für die Schaltfläche), `DateList` (`eintraege`, `art?: 'liste' | 'definition'`, `einblenden?`), `PubList` (`typ`, Einträge), `PersonCard` (`person`), `Steps` (`typ: 'arbeitsschritte' | 'folge'`, Schritte).

Aufklappen und Archive
- `Expander` (`id`, `art: 'row' | 'lang'`, `titel`, `teaser?`; Custom Element `kwm-expander`), `YearArchive` (`typ: 'auswahl' | 'gesamt'`), `Timeline` (`stationen`, `weiter`), `Chronicle` (`eintraege`, `titel`, `lede`, `titelId`, `id?`, `kurz?`, `link?`), `PlaceGrid` (`orte`, `titel`, `einleitung`, `link`, `fussnote`; Custom Element `kwm-places`).

Formulare und Kleinteile
- `InquiryForm` (keine Props; Hülle der Signatur `anfrage`), `InquiryBand` (`text`, `stueck?`), `Notice` (`titel`), `LinkArrow` (`als?: 'a' | 'span'`, sonst Link-Attribute), `Button` (Link oder Schaltfläche), `InfoBlock` (`titel`, `hinweis?`), `Hours` (`typ: 'liste' | 'tabelle'`, `zeiten?`, `hinweisZeiten?`).

Bild und Signatur (D5)
- `Bild` (`src`, `alt`, `width`, `height`, `layout?`, `priority?`, `widths`/`sizes`), `Figure` (`class` der Bildfläche, `einblendung?`, `unterschrift?`, `unterschriftKlasse?`): Das Seitenverhältnis (4:3, 3:2, 4:5, Panorama) legt die übergebene Klasse fest; eine Format-Prop gibt es nicht, weil sie pixelgleich nichts änderte.
- `Plinth` (`faecher: Regalfach[]`: Foto, Beschriftung, Ladeverhalten), `GlazeStage` (`proben: Glasurprobe[]`; Custom Element `kwm-glaze`).
- `SigLogo` (`class?`), `SigFarbskala` (`glasuren: Glasur[]`), `SigFeuer` (`titel`, `einleitung`, `farben: Ofenfarbe[]`), `SigSticky` (`variante: 'portrait' | 'feuer'`, `als?`, `id?`, `aria-labelledby?`; Slot `bild` und Standard-Slot), `SigAktuell` (`ausstellungen`, `hinweise`). Die Hüllen setzen `data-sig`, geben ohne JavaScript Text, Liste oder Bilder aus und tragen ihr CSS als `<style is:global>` (Chunk `signaturen`, hinter basis und Seiten-CSS). Die Signaturen `Orte` und `Anfrage` stecken in `PlaceGrid` und `InquiryForm`.

## Daten (`src/data/`)

`ausstellungen`, `archiv`, `hinweise`, `werke`, `manufaktur` (inkl. `regal`), `team`, `texte`, `vita`, `werkstatt`, `anfahrt`, `arbeitsweise`, `chronik`, `lebensweg`, `orte`, `kontakt` (einzige Quelle für Telefon, Mail, Adresse, Zeiten; Form des Sanity-Dokuments `werkstatt`), `glasuren` (D5: `Glasur` für die Farbskala, `Glasurprobe` für die Glasurbühne, `Schalenglasur` für die 99 Schalen, `Ofenfarbe`), `brenntemperatur`, `navigation`, `bilder` (löst Pfade auf), `typen`, `zeichen`. Keine Preise, kein Bestand, keine Lagerorte, keine Verfügbarkeit.

## Vorschläge für das Sanity-Modell (aus D2 bis D5)

- `person` (Name, Rolle, Kurztext, Lebenslauf als Jahr-Text-Paare, Link) für die Seite Werkstatt; `text` um `art` (Essay, Literatur, Bericht), `untertitel`, `auszug` erweitern.
- `ausstellung`: `eroeffnung` als Liste, `kooperation`, `oeffnungszeiten` mit Label, getrennte Felder für Bildunterschrift und `nachweis`; `ort` und `galerie` als Referenz; Archiv-Ausstellungen als eigene Dokumente (Zahlen pro Ort werden dann berechnet).
- `werk`: Angaben als Zeilen (Maße, Glasur, Brand, Ort, Jahr); Werkschau als Auswahl per Referenz statt Kopie. `manufakturteil` mit Satz (Foto) und Teilen (Name, Maße, Katalognummer des Programms).
- `werkstatt` (Singleton): zusätzlich `fax`, `webseite`; Öffnungszeiten als `tagVon`, `tagBis?` (Auswahl montag bis sonntag), `von`, `bis`.
- `glasur` (D5): Der Typ aus dem Modell reicht für die Farbskala (`schluessel`, `name`, `zusatz`, `oberflaeche`: matt, satin oder glanz, `farbe` mit Grund, dunkel, hell, `schriftfarbe`, `sprenkel?`, `schichten?`, `seed`, `probenbild`). Die Glasurbühne braucht zusätzlich `gruppe` (Geschirr oder Edition), `meta`, `glanz`, `dunkel` und eine Bühnenfarbe; entweder als Felder derselben Dokumente oder als Referenz der Teile aus `manufakturteil.glasuren`. `seed` ist Zeichnungsdetail und könnte im Code bleiben.
- `ofenfarbe` (Metalloxid, Atmosphäre, Wirkung, Farbton) als kleine Liste im Dokument der Seite Werkstatt.
- `regalfach` (Foto, Beschriftung) am Dokument der Seite Manufaktur, solange das Kopfregal bleibt.
- Die Palette der 99 Schalen (`Schalenglasur`) ist Zeichnung, kein Redaktionsinhalt; sie bleibt im Code.
- Bilder überall mit Pflichtfeld `nachweis` (steht in den Daten als Teil der Unterschrift; getrennt führen).

## Scoping-Befund und Wächter-Test

Astro hängt `:where(.astro-xxxx)` an jeden Teil eines Selektors einer Komponente. Regeln mit Vorfahren außerhalb der Komponente (`html.js …`, `.masthead …`) oder mit Elementen aus Slots, aus `Bild` oder aus Skripten treffen danach nichts mehr. Die Optik-Tests laufen mit reduzierter Bewegung und ohne sichtbare Skriptzustände und sehen das nicht. Gegenmittel:
- `:global(…)` für Vorfahren und Skript-Inhalte (siehe README, Abschnitt CSS-Reihenfolge); in D5 für `GlazeStage` (`.glaze__layer`), `Plinth` (`img` aus `Bild`) und für alle Signatur-Hüllen `<style is:global>`.
- `tests/stile.spec.ts` (Wächter) prüft auf 8 Seiten mit voller Bewegung und Skript, dass keine Regel mit Komponentenmarkierung mehr Treffer verliert als ohne sie, und liest berechnete Stile für Chronik, Lebensweg, Ausstellungskarten und weitere Stichproben. In D5 gehärtet: Übergangswerte (visibility, transform) werden abgewartet statt sofort gelesen; unter Last schlug der Test sonst vereinzelt fehl.

Weitere Befunde aus D5:
- Chunk-Reihenfolge: Ein Stil in einer Komponente, die das Layout einbindet (Footer mit `SigLogo`), landet sonst vor dem Seiten-CSS. Deshalb importiert jede Seite ihr Seiten-CSS direkt nach `basis.css`; der Test „Stylesheet-Reihenfolge“ sichert das.
- Der SVG-Filter `#ink` im Footer wurde nirgends benutzt und ist entfernt (er war das letzte `style`-Attribut).

## `style`-Attribute und CSP (für Phase E)

- Im Markup: **0** (vorher 23: Footer-Filter auf allen 13 Seiten, sechs Farbkacheln `--c`/`--t` der Startseite, vier Proben der Ofenfarben der Werkstatt). Farben stehen als Klassen in `SigFarbskala` und `SigFeuer`.
- Zur Laufzeit gesetzt (`element.style.setProperty` und `.style.x =`, CSSOM, braucht kein `style-src-attr 'unsafe-inline'`): `GlazeStage` (2), `main.ts` (6), `sig-farbskala.ts` (2), `sig-logo.ts` (6), `sig-sticky.ts` (1). Der Wert in `data-*` oder im Skript bleibt, nichts davon steht im HTML.
- `innerHTML`-Vorlagen: `PlaceGrid` (Detailbereich), ohne `style`-Attribut.
- Folge: `style-src-attr 'unsafe-inline'` kann in der CSP entfallen. Offen bleibt `style-src-elem`: Astro schreibt alle Stile in Dateien (`inlineStylesheets: 'never'`), nur die drei Schrift-Stile der Fonts API stehen inline im Head (Hash oder Nonce nötig).

## Ruling 27: Schreibweisen vereinheitlicht (eigener letzter Commit)

Geändert (Textvergleich eigener Build vor/nach, sonst 0 Abweichungen):

| Seite | vorher | nachher |
|---|---|---|
| Besuch, Fakten | „Mo bis Fr 9–17 Uhr, Sa 11–15 Uhr“ | „Mo–Fr 9–17 Uhr, Sa 11–15 Uhr“ |
| Besuch, Zeiten im Kopf | „Ansonsten“ | „Sonst“ (wie in der Tabelle der Startseite) |
| Impressum | „Telefon 0049 (0)201 – 30 50 80“ | „Telefon +49 201 30 50 80“ |
| Datenschutz | „Telefon 0049 (0)201 – 30 50 80“ | „Telefon +49 201 30 50 80“ |
| AGB | „Tel.: 0201 /30 50 80“ | „Tel.: +49 201 30 50 80“ |

Die ausgeschriebene Form „Montag bis Freitag“ bleibt, wo sie schon stand (Besuch, Werkstatt). In `kontakt.ts` entfallen `TelefonStil`, `telefonText` und der Tagestil `kurzWort` samt Tests. Die Optik-Referenzen von Besuch, Impressum, AGB und Datenschutz (Desktop und Mobil) wurden gezielt erneuert (`tests/__screens__/` ist nicht eingecheckt, die Dateien liegen lokal); alle 26 Optik-Tests grün.

## Offene Fehlerliste

- Zwei Farbsätze für dieselben sechs Töne: Farbskala (Startseite, gemessene Grundfarben, z. B. weiß `#e2ddcd`) und Glasurbühne (Manufaktur, z. B. weiß `#e1dccc`) weichen um wenige Stufen ab. Vereinheitlichen ist sichtbar (Admin).
- Statement-Typen benennen teils den Schnitt statt der Rolle (`regel`, `aussage`, `gross`); Abstände 28, 22, 18 px in `Statement` ohne Token. Angleichen (z. B. `.stance__quote` gegen `.artist__quote`, derselbe Satz in zwei Typen) ist sichtbar, Tabelle in `.superpowers/sdd/PLAN-PHASE-D/task-D1c-report.md`.
- Tote Klassen und Regeln: `mf-hero` (kein CSS), `.mf-cta`, `.swatches`, `.swatch-card`, `.swatch--split` (kein Markup). Entfernen bei Gelegenheit, unsichtbar.
- Seiten-CSS enthält noch Raster-Platzierung und einzelne Sonderregeln (`page-besuch.css` 212 Zeilen, `page-werkstatt.css` 147, `page-young-jae-lee.css` 149); Ziel „nur Anordnung im Raster“ ist für Besuch und Werkstatt nicht ganz erreicht.
- Einmalige Sonderabschnitte bleiben Seiten-Markup (Ruling 3): Neunundneunzig-Schalen-Bühne, Zahlung (`.pay__list`), 404-Linkliste, Ausstellungsort der Pop-up-Ausstellung mit eigener Adresse.
- `LinkArrow` ohne Prop `ton` und `Button` ohne Ghost-Variante: keine Verwendung, nicht gebaut.
- `Figure` wird nicht von `ExhibitionCard`, `PageHero`, `Steps`, `WorkCard` und `WareCard` genutzt; deren `figure` ist Teil des eigenen Markups und scoped Stils.
- Daten: geschütztes und schmales Leerzeichen (U+202F) steht teils unsichtbar im Quelltext; Konstante und Test existieren (Ruling 20).
- Vergleich mit dem Prototyp (Textvergleich-Skript) zeigt weiter bekannte Abweichungen aus Phase B (z. B. „Mehr erfahren“, schmale Leerzeichen vor „°C“); gegenüber dem Stand vor D5 ist der Text unverändert.
- Test-Flackern unter Last (zwei Wächter-Tests, Übergänge): behoben durch Abwarten; sollte es wiederkehren, Parallelität senken.

## Was der Admin tun muss

- Ruling 27 ansehen (Besuch, Impressum, AGB, Datenschutz) und bestätigen.
- Entscheiden, ob die zwei Farbsätze (Farbskala und Glasurbühne) angeglichen werden.
- Pro PR Endprüfung `code-review`; Merge der gestapelten Branches in der Reihenfolge D1 bis D5 nach dem Feinschliff-PR.
