# Bericht: Phase C – Asset-Pipeline

Plan: [PLAN-PHASE-C.md](PLAN-PHASE-C.md) (eingecheckt im Branch `astro-umbau`). Worktree `../KWM-phase-c`. Jede Aufgabe ein eigener Branch und Draft-PR, gestapelt auf Phase B-2 (`phase-b-fehler`).

## C1 – CSS gebündelt (Branch `phase-c1-css`)

**Ergebnis:** Das gesamte CSS (außer den Schriften, die in C4 folgen) läuft durch Vite: zusammengefasst, minifiziert, mit Hash im Dateinamen und dauerhaft cachebar (`/_astro/*` → `Cache-Control: immutable`). Sichtbar ändert sich nichts.

| Messgröße (Startseite, mobil) | Phase B | C1 |
|---|---|---|
| CSS-Anfragen | 12 | 3 |
| CSS gesamt | 125 KB Quelle | 99 KB minifiziert |
| Lighthouse-Median aus 5: FCP / LCP | 1.248 / 2.374 ms | **1.170 / 2.211 ms** |
| Anfragen gesamt / übertragen | 40 / 345 KB | **31 / 333 KB** |
| `npm test` | 76/76 | 78/78 (neuer Reihenfolge-Test) |
| Textvergleich 13 Seiten | 0 | 0 |

**Abweichung vom Plan (begründet):** Der Plan sah vor, dass das Layout die Grundstile importiert und jede Seite ihr Seiten-CSS. Im Bundle hält Astro/Vite diese Reihenfolge aber nicht ein: Gemeinsames CSS landete hinter dem Seiten-CSS, kleine Seiten-Dateien wurden vor allen Links eingebettet. Kaskaden-Ebenen (`@layer`) scheiden aus, weil bei ihnen die Ebene vor der Spezifität entscheidet, und das veränderte drei Seiten sichtbar. Umgesetzt ist:
- Jede Seite importiert `../styles/basis.css` (bündelt global, pages, expander), dann ihr Seiten-CSS, dann `../styles/signaturen/signaturen.css`. Das Layout importiert kein CSS.
- Zwei feste Bündel (`basis`, `signaturen`) über `vite.build.rolldownOptions.output.codeSplitting.groups` (die aktuelle API in Vite 8/Rolldown; `manualChunks` ist veraltet).
- `build.inlineStylesheets: 'never'`, damit kein Seiten-CSS vor den Links eingebettet wird. Kostet auf Unterseiten eine Anfrage von 3–5 KB (gecacht), spart auf der Startseite 9 Anfragen.
- **Absicherung:** Ein Test in `tests/routen.spec.ts` prüft auf allen 13 Seiten die Reihenfolge der Stylesheets (Schriften, Basis, höchstens ein Seiten-Bündel, Signaturen, kein `<style>` im Kopf). Er schlägt an, wenn eine Seite `basis.css` vergisst oder die Reihenfolge vertauscht, und auch, wenn ein Werkzeug-Update die Aufteilung still ändert. Die Konvention steht in der README.

**Prüfung:** Review der Aufgabe (Opus, Architektur) mit einer Korrekturrunde, Nachprüfung aller Punkte. Der Formatier-Commit ist per minifiziertem Vergleich aller 18 CSS-Dateien als reine Formatierung belegt (einzige Änderung: Hex-Farben in Kleinbuchstaben).

## C2 – Skripte als TypeScript strict (Branch `phase-c2-ts`)

**Ergebnis:** Alle Browser-Skripte liegen in `src/scripts/` als TypeScript im strengsten Modus (`astro/tsconfigs/strictest`): kein `any`, kein `@ts-ignore`, keine ungeprüften `!`, kein einziger Typ-Cast. Das Layout bindet sie als ein von Astro verarbeitetes Skript ein (Reihenfolge main → signaturen → expander, wie vorher am Ende des Body, verzögert). Die sieben Signaturen werden weiterhin erst geladen, wenn ihr Platz auf der Seite vorkommt, jede als eigene Datei (4–12 KB). Die Glasurbühne der Manufaktur ist ebenfalls ein verarbeitetes TypeScript-Skript. `public/` enthält kein JavaScript mehr.

| | vorher (C1) | C2 |
|---|---|---|
| JavaScript gesamt (Build) | 72 KB Quelle, ungebündelt | 60 KB minifiziert, 8 Dateien |
| Typprüfung | keine | `astro check` strictest über alle Skripte |
| `npm test` | 78/78 | 78/78, Textvergleich 13/13 = 0, Konsole fehlerfrei |

**Verhalten:** gleich. Zwei unabhängige Reviews (Opus) haben jeden Ausführungspfad auf versteckte Änderungen geprüft (`||` gegen `??`, Standardwerte, frühe Rücksprünge, Zeitpunkt). Bewusst robuster geworden sind nur Wege, die vorher mit einem TypeError abbrachen und mit gültigem Markup nie erreicht werden: Fehlt etwa ein Canvas-Kontext, bricht jetzt nur die betroffene Grafik ab statt aller Skripte der Seite.

**Korrekturrunden:** C2a: README und Pfadkommentare, ein Cast durch ein typisiertes Tupel ersetzt, Schließen-Knopf der Orte auch im Randfall verdrahtet, fehlerhafte Datumsangaben wie bisher ungültig. C2b: zwei Casts durch eine `as const`-Schlüsselliste ersetzt.

**Testinfrastruktur:** Das Zeitlimit für ganzseitige Screens steht jetzt bei 30 s (vorher 15 s), weil die 18.884 px hohe Startseite unter voller Last einmal knapp darüber lag. Der Prüfmaßstab ist unverändert.

## C3 – Bilder über `astro:assets` (Branch `phase-c3-bilder`)

**Ergebnis:** Alle 85 Bilder liegen in `src/assets/img/` und laufen durch Astros Bildverarbeitung. Eine kleine Komponente `Bild.astro` (Pfad wie bisher `/img/…`, Auflösung über `import.meta.glob`, unbekannter Pfad bricht den Build ab) erzeugt für jedes Bild ein passendes `srcset` mit Breite und Höhe; Handys laden kleinere Dateien. In `public/img/` bleibt nur das Favicon.

| Startseite, mobil, Median aus 5 | C2 | C3 |
|---|---|---|
| Lighthouse Leistung | 97 | **100** |
| LCP | 2.498 ms | **1.763 ms** |
| FCP | 1.309 ms | 1.083 ms |
| übertragen | 326 KB | 289 KB |
| CLS | 0 | 0 |

Manufaktur: Leistung 99/99, LCP 2.088 → 2.012 ms, 183 → 176 KB.

**Keine Layout-Änderung, nachgewiesen:** 250 Bildflächen und 26 Seitenhöhen (13 Seiten × Desktop/Mobil) vorher/nachher vermessen, keine Abweichung über 0,5 px. Optik 26/26 bei Standardtoleranz, Text 13/13 identisch.

**Bildqualität nicht schlechter:** Jedes Bild, das vorher ein handgemachtes `srcset` hatte, bietet weiter seine größte frühere Variante an (bis 2000 px). Bei drei Bildern der Startseite war zunächst die kleinste Datei Quelle geworden; das fiel in der Prüfung auf und ist behoben (`widths`-Angabe). Der PayPal-QR-Code bietet wieder die volle Auflösung.

**Weitere Verbesserungen aus den Reviews:**
- Die sechs Einstiegsbilder nutzen die von Astro empfohlene `priority`-Einstellung (sofort laden, hohe Priorität).
- 16 Vorschaubilder weit unten (Farbskala, Glasurknöpfe) laden jetzt erst bei Bedarf (`lazy`).
- Die Glasurbühne nutzt beim Umschalten dieselbe Datei wie das Vorschaubild (Cache statt zweiter Download).
- Das Favicon ist nicht mehr für ein Jahr als unveränderlich markiert (es hat keinen Hash im Namen).

**Prüfhilfe:** `OPTIK_TOLERANZ` (Standard 0,002) erlaubt bei künftigen Bildänderungen einen gezielten Lauf mit höherer Toleranz; in C3 war er nicht nötig.

**Hinweis:** Astro kodiert WebP neu (Qualität 80). Sollte bei Detailbildern eine Weichheit auffallen, lässt sich die Qualität zentral anheben (`image.service.config`).

## C4 – Schriften über die Fonts API (Branch `phase-c4-schriften`)

**Ergebnis:** Die drei Schriftfamilien (Jost, Libre Caslon Display, Libre Caslon Text) sind in `astro.config.mjs` über Astros Fonts API registriert; die Dateien liegen in `src/assets/fonts/` und werden gehasht aus `/_astro/fonts/` ausgeliefert (dauerhaft gecacht). Astro erzeugt zusätzlich angepasste Ersatzschriften, die das Springen beim Laden verringern. `public/fonts/` und `fonts.css` sind weg. Sichtbar ändert sich nichts: Optik 26/26, Text 13/13, Layout 250 Bildflächen ohne Abweichung.

**Gleich geblieben, nachgeprüft:** dieselben 8 `@font-face`-Regeln (Gewichte, Stile, Unicode-Bereiche Zeichen für Zeichen, `font-display: swap`); genau zwei vorgeladene Dateien wie vorher (Libre Caslon Display und Jost, jeweils der Latin-Teil).

**Abweichung vom Plan (begründet):** Astros lokaler Font-Anbieter kennt keine Subset-Angabe; die eingebaute Vorlade-Funktion hätte auch die Latin-Extended-Dateien vorgeladen (4 statt 2). Die zwei Preloads stehen deshalb von Hand im Layout, mit den gehashten URLs aus `fontData` (offizielle Astro-Schnittstelle). Die Latin-Variante muss in `astro.config.mjs` als erste je Familie stehen; fehlt sie, bricht der Build mit klarer Meldung ab. Ein Test prüft auf allen Seiten, dass genau Display und Jost vorgeladen werden und jeweils die Latin-Datei.

**Ersatzkette:** Die frühere Kette „Display → Caslon Text → Georgia“ ist entfallen, weil die Fonts-API-Variablen ihre Ersatzschriften selbst mitbringen. Gemessen: Libre Caslon Display enthält jedes Zeichen, das in Display-Texten vorkommt, außer dem geschützten Bindestrich (U+2011, „Young‑Jae“), den auch Caslon Text nicht hat; Chromium zeichnet ihn wie vorher aus der Display-Schrift. Ein dekorativer Pfeil (Chronik-Hinweis, mobil) steht ausdrücklich auf der Systemschrift, damit er wie vorher aussieht.
