# Startseite „Mittelweg“ (Gesamtstand plus Teile der Bauhaus-Variante)

**Endstand (05.10.2026, vom Admin abgenommen):** Bauhaus-Station als Entwurf 4 („Seit 1927 in der Tradition des Bauhauses.“ mit 1927 als Marke über der Teller-Tafel), Farbskala als eigener Abschnitt vor dem Feuer, zwei Schalen als Meisterstück-Bild. Der Vorschau-Umschalter (`?bauhaus=`) und die verworfenen Entwürfe 1 bis 3 sind entfernt; sie stehen in der Git-Historie (Entwurf 1 bis `25f14f0`, Entwürfe 2 und 3 bis zum Commit vor der Abnahme). Das Kopf-Skript in `BaseLayout.astro` ist wieder wie im Gesamtstand.

Stand: 05.10.2026. Branch `startseite-mittelweg` (Basis `gesamtstand`, seit Runde 2 a81c9d2), Vorschau https://startseite-mittelweg-kwm-redesign.entwicklung-7f3.workers.dev. Auftrag: Admin-Entscheidungen vom 05.10.2026 in `.superpowers/sdd/MITTELWEG/progress.md`. Die Seite unterscheidet sich vom Gesamtstand nur auf der Startseite und auf /young-jae-lee (ein Satz ergänzt, siehe Abschnitt 6).

## 0. Runde 2 (Admin-Feedback 05.10.2026): Empfehlung (umgesetzt und abgenommen)

**Feedback:** Entwurf 1 (Grundsätze) verworfen. Entwurf 2 (1927) trägt durch die Zahl, Entwurf 3 (Teller-Tafel) ist schön, weil er die Funktion zeigt. Frage nach einem Mittelweg aus 2 und 3. Die Farbskala fehlt. Die Teeschale als Meisterstück gefällt nicht.

**Empfehlung, gebaut als Entwurf 4 und abgenommen:**
1. **Bauhaus-Station = 1927 über der Tafel.** Oben die Jahreszahl als Marke, rechts auf ihrer Grundlinie „In der Tradition des Bauhauses.“ und ein Satz zu Leßmann. Darunter die vier Teller mit Programmnummer, Name und Maß, darunter der Grundsatz „Jedes Stück muss gut zu drehen sein und auch zu benutzen.“. Herkunft und Gebrauch stehen in einem Abschnitt: woher die Formen kommen und wofür sie da sind. Das Regal aus Entwurf 2 entfällt hier, die Tafel ist das stärkere Bild, und zwei Fotos würden die Zahl schwächen.
2. **Farbskala als eigener ruhiger Abschnitt gegen Ende, nicht in der Bauhaus-Station.** „Sechs Glasuren, ein Geschirr.“ steht zwischen 99 Schalen und Feuer, dort, wo der Manufaktur-Block im Gesamtstand stand.
   - Die Farbskala ist eine interaktive Signatur und füllt zwei Drittel der Bildschirmhöhe. Zusammen mit Zahl und Tafel würde die Station rund zweieinhalb Bildschirme lang, gleich nach Aktuell. Die Person (Young-Jae Lee) rückte weit nach unten, und auf einem Bildschirm stünden zwei starke Elemente (DESIGN.md §1: eine Signatur je Bildschirm).
   - Die Geschichte wird klarer: oben das Warum (Bauhaus, Gebrauch), gegen Ende das Womit (sechs Glasuren, „alle Teile kombinierbar“). Danach folgt das Feuer mit dem Link „Wie die Glasur ihre Farbe bekommt“. Farbe und Brand stehen damit nebeneinander.
   - Rhythmus: Die lange helle Strecke nach den Orten (Meisterstücke, 99 Schalen) bekommt einen farbigen Halt, bevor das dunkle Feuer kommt.
   - Der Admin erinnert die Farbskala „gegen Ende“; dort wirkt sie als ruhiger Ausklang des Geschirrs.
3. **Kein dritter Weg „oben etwas anderes, Manufaktur und Meisterstücke lassen“:** Ein eigener Manufaktur-Block mit Regal, Kurzfakten und Krügen war genau der Text- und Bildballast, den der Admin aus der Startseite haben wollte. Tafel (oben) und Farben (unten) erzählen die Manufaktur mit zwei Bildern und drei Sätzen.

Nach der Abnahme: „Seit“ klein vor der 1927, damit die Überschrift ein Satz ist; Umschalter und Entwürfe 1 bis 3 entfernt.

## 1. Abschnittsfolge

| # | Abschnitt | Typ | Gegenüber Gesamtstand |
|---|---|---|---|
| 1 | Einstieg: Wagner-Zitat, Kummerschalen | hell | unverändert |
| 2 | Aktuell | Anker | unverändert |
| 3 | **Bauhaus-Station** („Seit 1927 …“ über der Teller-Tafel) | hell | neu; ersetzt Einleitungssatz und Zwei Linien |
| 4 | Young-Jae Lee: Name, haftendes Porträt mit Catoir, Jahn, Lebensweg | hell, Bild | Jahn nur noch einmal (der Satz zum koreanischen Erbe entfällt hier) |
| 5 | Ausstellungsorte | Anker | rückt vor die Meisterstücke |
| 6 | Meisterstücke: Einzelwerk und sechs Werke | hell | Aufbau wie bisher, neues Einzelbild (zwei Schalen aus dem MOK-Foto), höchstens zwei Drittel Bildschirmhöhe |
| 7 | 99 Schalen | hell | unverändert |
| 8 | **Farben**: „Sechs Glasuren, ein Geschirr.“, Farbskala | hell | statt des Manufaktur-Blocks; nur Farbskala, ein Satz, ein Link |
| 9 | Feuer | Bild | unverändert |
| 10 | Chronik mit Kurztexten | Fläche | unverändert |
| 11 | Besuch und Anfrage | hell | unverändert |

Entfallen: Meditation (steht auf /meisterstuecke), Einleitungssatz und Zwei Linien, aus dem Manufaktur-Block Regal, Kurzfakten und Krüge (die Farbskala ist zurück, siehe Abschnitt 0).

**Hell und Dunkel, am Bild geprüft** (`startseite-mittelweg/nachher-1440.jpg`): hell, Anker (Aktuell), hell (Bauhaus), hell mit großem dunklem Porträt, Anker (Orte), hell (Meisterstücke, 99 Schalen, Farben mit den sechs Glasurbändern), dunkles Bild (Feuer), Fläche (Chronik), hell, Anker (Footer). Nie zwei Anker hintereinander. Zwischen Aktuell und Orte liegen rund 3.400 px, aber das haftende Porträt ist am Rechner selbst ein dunkles Vollbild und gibt dort Halt. Nach den Orten folgen gut drei Bildschirme hell; sie tragen sich über die Werkfotos und den farbigen Ring und enden im dunklen Feuer. Ich habe deshalb nichts umgefärbt: Eine Fläche für die Bauhaus-Station oder die 99 Schalen würde zusammen mit der Chronik „Fläche, Bild, Fläche“ ergeben und den Rhythmus unruhiger machen. Die Orte bleiben dunkel (Vorgabe).

**Regel `--werk-max` (66 svh) mit den Tokens abgeglichen:** neu in `global.css` neben `--section` und `--head-gap`, in DESIGN.md §4 als „Bildgröße nach Rolle“. Greift bei allen Werkbildern der Startseite: Einzelwerk Meisterstücke (vorher bis 680 px hoch, jetzt höchstens 594 px bei 900 px Bildschirmhöhe), Teller-Tafel der Bauhaus-Station. Die Werkschau (etwa 315 px) und das Spotlight bei Aktuell liegen ohnehin darunter. Ausgenommen sind Stimmungsbilder: Einstieg, Feuer, Orte und das haftende Porträt am Rechner (Admin: Haft-Element bleibt). Am Handy steht das Porträt 1:1 mit Rand und bleibt unter zwei Dritteln.

## 2. Die Bauhaus-Station

Gemeinsamer Rahmen aller Entwürfe: Raster aus 12 Spalten, Haarlinien als Rasterkanten, Farbwelt und Schriften der Seite, keine Bauhaus-Zitate als Stil (kein Rot-Gelb-Blau, keine Grundformen-Symbole, keine Grotesk), keine Farbstreifen, keine Glasurbühne.

### Endstand: „Seit 1927“ und Tafel (Entwurf 4)
- **Idee:** Herkunft und Gebrauch in einem Abschnitt. Die Überschrift ist ein Satz: „Seit“ klein auf der Grundlinie der großen 1927 (Spalte 1–7), „in der Tradition des Bauhauses.“ schließt rechts an (Spalte 8–12), darunter ein Satz zu Leßmann. Eine `h2`, Screenreader lesen „Seit 1927 in der Tradition des Bauhauses.“ (Test in `tests/verhalten.spec.ts`). Haarlinie, dann die Tafel mit vier Tellern und ihrer Legende, darunter der Grundsatz des Programms und der Link zum Manufakturprogramm.
- **Texte und Quellen:** Chronik 1927 (Leßmann, Lindig, „bei strenger Einhaltung der Formgebungsprinzipien des Bauhauses“), Vorgabe „Jedes Stück muss gut zu drehen sein und auch zu benutzen.“ (`/manufaktur`), Teller Nr. 15, 16, 14, 13 aus `manufaktur.ts`, Zuordnung nach der alten Seite `/manufakturprogramm/geschirr-2/`.
- **Bild:** neue Aufnahme der Werkstatt vom Oktober 2026, https://kwm-1924.de/wp-content/uploads/2026/10/1013-1016-Teller-plates-scaled.jpg (2560 × 1709), beschnitten auf 2560 × 1060 als `teller-reihe.webp`, Grund auf den Seitengrund `#F8F7F4` ausgeglichen. Nachweis fehlt. Komponente `TellerTafel`: am Rechner steht die Legende genau unter den Tellern, am Handy 2 × 2.
- **Rolle „Marke“** (`--t-marke`, 6 bis 22 rem) für die Jahreszahl, in DESIGN.md eingetragen.
- **Screens:** `startseite-mittelweg/bauhaus-1440.jpg`, `bauhaus-1024.jpg`, `bauhaus-390.jpg`.

### Verworfene Entwürfe (Kurzfassung)
- **1 „Grundsätze“:** drei nummerierte Grundsätze neben der Teekanne. Verworfen („sieht schlecht aus“).
- **2 „1927“:** Jahreszahl als Marke neben dem Regal mit Serienware, darunter Chronik 1927 und 1986. Die Zahl trug, sie ist in den Endstand eingegangen. Ein historisches Werkstattfoto gibt es weder im Repo noch auf der alten Seite (`BILDPLAN.md` A12).
- **3 „Tafel“:** Teller-Tafel mit Programmnummern. Die Funktion ist in den Endstand eingegangen.

### Inspiration (Refero, Stile angesehen)
| Beispiel | Übernommen | Bewusst nicht |
|---|---|---|
| [19–86](https://19-86.fr) | Zahl als Monument, Haarlinien als Ordnung (1927) | leichte Grotesk, Tabellenkopf |
| [Gustavo Faria](https://gustavo.work) | schmale Informationsspalte neben großer Jahreszahl | gerissene Bildkanten |
| [MDF Italia Contract](https://contract.mdfitalia.com/en) | „Key values“ als wenige Grundsätze im Raster (Entwurf 1, verworfen) | Kreisgrafiken |
| [B—Line](https://www.b-line.it), [V–A–C](https://v-a-c.org/en) | Objekte im gleichen Licht, eine Beschriftung je Objekt (Tafel) | Versalien-Labels, Mono-Schrift |

Dazu als Bauhaus-Herkunft der Mittel: Typofoto (Moholy-Nagy), Musterkatalog mit Modellnummern. Beides als Prinzip, nicht als Optik.

### Seitenweite Mittel
- **Umgesetzt:** `--werk-max` für alle Werkbilder (ruhig, ordnet das Größenverhältnis Werk zu Stimmung); Haarlinie unter jedem Abschnittskopf bleibt die eine Rasterkante der Seite, die Bauhaus-Station nutzt dieselbe Linie (unter dem Kopf und unter der Tafel-Legende).
- **Geprüft und verworfen:** Abschnittsnummern (01, 02 …) – die Abschnitte sind keine Abfolge, Nummern wären Dekoration; sichtbare Rasterlinien – laut und technisch, unser Raster ordnet unsichtbar; Grotesk für Überschriften – Bauhaus-Klischee, bricht mit Caslon; zusätzliche Kicker oder Marken über Überschriften – DESIGN.md verbietet sie.

## 3. Meisterstück-Einstiegsbild

**Gewählt (Runde 2): zwei Schalen aus dem MOK-Foto** (`src/assets/img/kwm/werke/zwei-schalen-mok.webp`, 1630 × 1304, Ausschnitt). Vorn die ochsenblutrote, dahinter die weiße mit blauem Tupfen. Quelle: https://kwm-1924.de/wp-content/uploads/2026/02/image.png (3575 × 1663), auf der alten Seite unter der Ankündigung „99 Schalen – ein Kosmos“ (MOK Köln). Das schönste und schärfste Werkfoto, das die alte Seite hat: ruhiger grauer Grund, Glasur und Fuß gut zu sehen. Der Ausschnitt zeigt zwei Schalen groß statt vier klein. Ehrlich gesagt bleibt es dasselbe Foto: Aktuell zeigt es als Ganzes noch bis zum Ende der Ausstellung (25.10.2026), die Orte-Kachel Köln gedämpft in Schwarz-Weiß. Durch den engen Ausschnitt und die andere Größe liest es sich aber als eigenes Werkbild; nach dem 25.10. bleibt nur noch die gedämpfte Kachel. Bildunterschrift: „Schalen von Young-Jae Lee aus der Ausstellung „99 Schalen – ein Kosmos“, Köln 2026“. Titel, Jahr und Maße sind nicht belegt, deshalb steht in der Werkzeile nur „Zwei Schalen“. **Nachweis fehlt** (Fotograf, Rechte; wohl Museumsfoto, bei MOK oder Werkstatt klären). Daten: `einzelwerk` in `src/data/werke.ts`.

Alle Kandidaten selbst angesehen (WordPress-Mediathek der alten Seite vollständig, alles ab 800 px):
1. **Vier Schalen, ganzes MOK-Foto** (wie oben, 3575 × 1663). Das schönste Gesamtbild, aber zurzeit doppelt mit Aktuell und im Breitformat 2,15:1, das nicht in den Aufbau mit Werkangaben passt.
2. **Teeschale, ohne Titel, 2023** (`teeschale.webp`, Original 1500 × 1500). Laut Ankündigung der alten Seite (2024/09/image.png) „o. T., 2023, 10,5 × Ø 14,5 cm, Foto: Edi Baumann“, also vollständig belegt. Vom Admin als nicht schön verworfen.
3. **Kumme, ohne Titel, 2025–2026** (Detail), Rückseite der Greve-Einladung 2026 (https://kwm-1924.de/wp-content/uploads/2026/09/2026_Einladung_Seite-4.jpg, 1291 × 1321), H 12 cm, Ø 19,7 cm, Foto: André Schuster. Belegt, aber ein Scan der Drucksache und nur ein Ausschnitt der Kumme.
4. Nicht geeignet: Schalen im Streiflicht (Foto: Christopher Clem Franken, 900 × 600, Stimmungsbild auf dunklem Holz) und die Werkbilder der Meisterstücke-Seiten (nur 600 × 400).

## 4. Zahlen vorher und nachher

Gemessen mit Playwright (Chromium, reduzierte Bewegung, fester Tag 04.10.2026): Wörter = sichtbarer Text bei 1440 px, Höhe in px.

| Abschnitt vorher | Wörter | Höhe 1440 | Höhe 390 | Abschnitt nachher | Wörter | Höhe 1440 | Höhe 390 |
|---|---:|---:|---:|---|---:|---:|---:|
| Einstieg | 45 | 900 | 1.032 | Einstieg | 45 | 900 | 1.032 |
| Aktuell | 131 | 1.615 | 1.529 | Aktuell | 131 | 1.615 | 1.529 |
| Einleitungssatz, Zwei Linien | 86 | 882 | 900 | **Bauhaus** | 64 | 1.568 | 924 |
| Young-Jae Lee | 180 | 2.475 | 2.007 | Young-Jae Lee | 141 | 2.434 | 1.762 |
| Meisterstücke | 90 | 2.017 | 1.229 | Ausstellungsorte | 87 | 1.786 | 1.767 |
| Ausstellungsorte | 87 | 1.786 | 1.767 | Meisterstücke | 103 | 2.058 | 1.286 |
| Meditation | 63 | 559 | 719 | (entfällt) | | | |
| 99 Schalen | 59 | 1.379 | 937 | 99 Schalen | 59 | 1.296 | 888 |
| Manufaktur | 132 | 2.337 | 2.088 | **Farben** | 44 | 1.167 | 1.118 |
| Feuer | 44 | 1.440 | 1.266 | Feuer | 44 | 1.440 | 1.266 |
| Chronik | 166 | 1.596 | 748 | Chronik | 166 | 1.596 | 748 |
| Besuch | 96 | 1.341 | 1.580 | Besuch | 96 | 1.341 | 1.580 |
| **12 Abschnitte** | **1.179** | **19.054** | **16.939** | **11 Abschnitte** | **979** | **17.929** | **15.037** |

- Endstand: Text −17 %, Seite am Rechner −6 %, am Handy −11 %. Der Abschnitt Farben kostet rund 1.170 px. Runde 1 (Entwurf 1, ohne Farben) lag bei −23 % / −15 % / −17 %.
- Gesamthöhe = ganze Seite mit Footer. Die Unterschiede zur Messung der Bauhaus-Variante kommen von der reduzierten Bewegung.
- Bilder: `startseite-mittelweg/vorher-1440.jpg`, `nachher-1440.jpg`, `vorher-390.jpg`, `nachher-390.jpg` (Ganzseiten-Screens in Spalten), `meisterstuecke-1440.jpg`.
- Konsole ohne Fehler, kein waagrechtes Scrollen bei 390 px (Chromium und WebKit, alle drei Entwürfe).

## 5. Wohin die entfernten Texte gewandert sind

Nichts geht verloren (Volltextsuche in `src/`):

| Text auf der alten Startseite | Steht jetzt |
|---|---|
| „Aus der ständigen Wiederholung einer handwerklichen Technik …“ | /werkstatt, Seitenkopf |
| „1924 auf Initiative von Margarete Krupp … Seit 1927 … über Otto Lindigs Schüler Johannes Leßmann.“ | Chronik der Startseite (1924, 1927), /werkstatt; Kern in der Bauhaus-Station |
| „Seit 1986 geprägt von Young-Jae Lee … nahezu unverändert …“ | /meisterstuecke, Einleitung; Chronik 1986 |
| Zwei Linien (Meisterstücke, Manufaktur) | Navigation (Beschreibungen), Einstieg (zwei Links) |
| Jahn „Zwei Traditionen treffen sich … das heitere, schwerelose Empfinden …“ | /young-jae-lee, „Bauhaus und koreanisches Erbe.“ (vollständig) |
| Jahn „Die minimale Veränderung … Individualität des Gefäßes.“ | bleibt auf der Startseite; auf /young-jae-lee fehlte der zweite Satz, er ist dort ergänzt |
| Catoir „Sie erzählte von den Zeremonien …“ | bleibt im haftenden Porträt; vollständig auf /young-jae-lee |
| Meditation „Die Herstellung jedes neuen Gefäßes gleicht einer Meditation.“ samt Absatz | /meisterstuecke |
| Manufaktur „Keiner Mode …“, „Unter Rückbesinnung … 25 Grundelemente …“, „Jedes Stück muss gut zu drehen sein …“, Farbskala-Satz | /manufaktur, /werkstatt; die beiden Vorgaben auch in der Bauhaus-Station |
| Regal „Vor dem ersten Brand“, Krüge | /manufaktur (Zäsur, Geschirr), /werkstatt |
| Kurzfakten (Masse, Brände, Programm, Gebrauch) | /manufaktur, Arbeitsweise; /werkstatt |

**Technisch entfallen** (nur von der alten Startseite genutzt): Signatur Farbskala (`SigFarbskala`, `sig-farbskala.ts`, Daten `glasuren` und Test), `FactsTable`, `kurzfakten`, Statement-Typ `lede`, Bilder `01-seladon-gefaess.webp` und `spindelvase-einzeln-1200.webp`. Wiederherstellbar aus `e0330a3`.

## 6. Abschlusspolitur und Prüfung (Endstand)

Alle 13 Seiten durchgesehen bei 1440, 1024, 768 und 390 px in Chromium und WebKit, Bilder vorher durch Scrollen geladen. Dazu automatisch geprüft: Konsole, waagrechtes Scrollen, nicht geladene Bilder, Werkbilder höher als zwei Drittel des Bildschirms.

Geändert je Seite (nur kleine, ruhige Korrekturen):
- **Startseite:** „Seit“ klein auf der Grundlinie der 1927, die Überschrift ist ein Satz. Umschalter und verworfene Entwürfe entfernt. Hinweis bei den Orten ohne Leerzeichen vor dem Komma („Auf eine Stadt klicken, um …“; vorher „klicken , um“).
- **Meisterstücke:** Einzelwerke mit Meta-Spalte (z. B. „Große Schale“, „Schale, spitz, XXL“) folgen jetzt der Regel `--werk-max`: höchstens zwei Drittel der Bildschirmhöhe statt 676 px bei 900 px Höhe. Die 600-px-Archivbilder werden dadurch auch weniger stark vergrößert. Stimmungsbilder bleiben breit.
- **Manufaktur:** lange Namen in den Teilelisten („Pflanzenübertopf, zylindrisch“) liefen bei 1440 px in die Maß-Spalte. Sie werden jetzt getrennt.
- **Young-Jae Lee:** das Jahn-Zitat ist vollständig (zweiter Satz aus Runde 1). Sonst nichts geändert.
- **Werkstatt, Aktuelles, Besuch, Impressum, AGB, Versand, Zahlung, 404:** ohne Befund, nichts geändert.
- **Datenschutz:** ohne optischen Befund; der Kasten „Text folgt“ ist Absicht (die Erklärung liefert die Werkstatt, siehe `ADMIN-OFFEN.md`). **Vor dem Livegang ersetzen.**
- Bewusst nicht geändert: Stimmungs- und Ausstellungsbilder, die höher als zwei Drittel sind (Einstieg, Kummerschalen auf /young-jae-lee, Regal auf /werkstatt, Ausstellungsbilder auf /aktuelles). Die Regel gilt nur für Werkbilder.
- Zitate: Unterseiten und Startseite nutzen dieselben Statement-Typen (`zitat`, `zitat-lang`, `gross`).

Tests:
- `npm run check` grün.
- Optik-Referenzen neu erzeugt, alle Projekte.
- Playwright gegen `wrangler dev` (Port 8784), Chromium, WebKit und iPhone inklusive Bewegung, Stile, Formular und axe: 401 bestanden, 0 fehlgeschlagen.
- `npm run test:vorschau` grün.
- Konsole ohne Fehler; die WebKit-Meldung „Refused to apply a stylesheet“ kommt vom Screenshot-Werkzeug, nicht von der Seite.

## 7. Worauf beim Review achten

Vorschau: https://startseite-mittelweg-kwm-redesign.entwicklung-7f3.workers.dev (am Rechner und am Handy).

1. Bauhaus-Station: „Seit 1927 in der Tradition des Bauhauses.“ als ein Satz. Ist das „Seit“ groß genug?
2. Meisterstücke-Seite: die kleineren Einzelwerke (Große Schale, Schale spitz XXL) mit Weißraum rechts.
3. Manufaktur, Edition: die getrennten Namen in den schmalen Listen.

## 8. Offen

- **Datenschutzerklärung** fehlt (Kasten „Text folgt“).
- **Bildrechte:** MOK-Foto (zwei Schalen, Aktuell, Meisterstücke-Kopf), Teller-Foto Oktober 2026. Fotografen nicht belegt.
- **Historisches Werkstattfoto** (z. B. für die Bauhaus-Station oder die Chronik): Anfrage bei Archiven (BILDPLAN A12).
