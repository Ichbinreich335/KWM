# Startseite „Mittelweg“ (Gesamtstand plus Teile der Bauhaus-Variante)

Stand: 05.10.2026. Branch `startseite-mittelweg` (Basis `gesamtstand` e0330a3), Vorschau https://startseite-mittelweg-kwm-redesign.entwicklung-7f3.workers.dev. Auftrag: Admin-Entscheidungen vom 05.10.2026 in `.superpowers/sdd/MITTELWEG/progress.md`. Die Seite unterscheidet sich vom Gesamtstand nur auf der Startseite und auf /young-jae-lee (ein Satz ergänzt, siehe Abschnitt 6).

## 1. Abschnittsfolge

| # | Abschnitt | Typ | Gegenüber Gesamtstand |
|---|---|---|---|
| 1 | Einstieg: Wagner-Zitat, Kummerschalen | hell | unverändert |
| 2 | Aktuell | Anker | unverändert |
| 3 | **Bauhaus-Station** (drei Entwürfe, `?bauhaus=1|2|3`) | hell | neu; ersetzt Einleitungssatz mit Zwei Linien und den Manufaktur-Block |
| 4 | Young-Jae Lee: Name, haftendes Porträt mit Catoir, Jahn, Lebensweg | hell, Bild | Jahn nur noch einmal (der Satz zum koreanischen Erbe entfällt hier) |
| 5 | Ausstellungsorte | Anker | rückt vor die Meisterstücke |
| 6 | Meisterstücke: Einzelwerk und sechs Werke | hell | Aufbau wie bisher, neues Einzelbild (Teeschale), höchstens zwei Drittel Bildschirmhöhe |
| 7 | 99 Schalen | hell | unverändert |
| 8 | Feuer | Bild | unverändert |
| 9 | Chronik mit Kurztexten | Fläche | unverändert |
| 10 | Besuch und Anfrage | hell | unverändert |

Entfallen: Meditation (steht auf /meisterstuecke), Einleitungssatz und Zwei Linien, Manufaktur-Block mit Farbskala, Regal, Kurzfakten und Krügen.

**Hell und Dunkel, am Bild geprüft** (`startseite-mittelweg/nachher-1440.jpg`): hell, Anker (Aktuell), hell (Bauhaus), hell mit großem dunklem Porträt, Anker (Orte), hell (Meisterstücke, 99 Schalen), dunkles Bild (Feuer), Fläche (Chronik), hell, Anker (Footer). Nie zwei Anker hintereinander. Zwischen Aktuell und Orte liegen rund 3.400 px, aber das haftende Porträt ist am Rechner selbst ein dunkles Vollbild und gibt dort Halt. Nach den Orten folgen gut drei Bildschirme hell; sie tragen sich über die Werkfotos und den farbigen Ring und enden im dunklen Feuer. Ich habe deshalb nichts umgefärbt: Eine Fläche für die Bauhaus-Station oder die 99 Schalen würde zusammen mit der Chronik „Fläche, Bild, Fläche“ ergeben und den Rhythmus unruhiger machen. Die Orte bleiben dunkel (Vorgabe).

**Regel `--werk-max` (66 svh) mit den Tokens abgeglichen:** neu in `global.css` neben `--section` und `--head-gap`, in DESIGN.md §4 als „Bildgröße nach Rolle“. Greift bei allen Werkbildern der Startseite: Einzelwerk Meisterstücke (vorher bis 680 px hoch, jetzt höchstens 594 px bei 900 px Bildschirmhöhe), Bilder der drei Bauhaus-Entwürfe. Die Werkschau (etwa 315 px) und das Spotlight bei Aktuell liegen ohnehin darunter. Ausgenommen sind Stimmungsbilder: Einstieg, Feuer, Orte und das haftende Porträt am Rechner (Admin: Haft-Element bleibt). Am Handy steht das Porträt 1:1 mit Rand und bleibt unter zwei Dritteln.

## 2. Die Bauhaus-Station in drei Entwürfen

Gemeinsam: Raster aus 12 Spalten, Haarlinien als Rasterkanten, Farbwelt und Schriften der Seite, keine Bauhaus-Zitate als Stil (kein Rot-Gelb-Blau, keine Grundformen-Symbole, keine Grotesk), keine Farbstreifen, keine Glasurbühne. Umschaltung: Das Kopf-Skript setzt bei `?bauhaus=2|3` `data-bauhaus` an `<html>`, bevor die Seite zeichnet; CSS zeigt den passenden Entwurf. Ohne Angabe (und ohne JavaScript) erscheint Entwurf 1. Kein Sprung, CSP-konform (Hash in `astro.config.mjs`), Test in `tests/verhalten.spec.ts`. Nach der Entscheidung entfallen Umschalter, die zwei anderen Entwürfe und ggf. das Bild `teller-reihe.webp` bzw. die Rolle `--t-marke`.

### Entwurf 1 „Grundsätze“ (typografisch, Raster)
- **Idee:** Drei nummerierte Grundsätze der Werkstatt stehen im strengen Raster neben einem Ensemble aus dem Programm. Die Nummern sind hier Inhalt (eine Liste von Regeln), keine Dekoration. Form, Gebrauch, System in dieser Reihenfolge.
- **Texte und Quellen:** „Wir gehen immer von geometrischen Grundformen aus.“ (Young-Jae Lee im Interview, Ilona Marx, „Der Ruf des Bauhaus“, urbanana, 25.01.2023, `CONTENT-FUNDE.md` 2.1, in der Stimme der Werkstatt); „Jedes Stück muss gut zu drehen sein und auch zu benutzen.“ und „Alle Teile eines Geschirrs, gleich welcher Farbe, sollten miteinander kombinierbar sein.“ (Vorgaben für das Manufakturprogramm, `/manufaktur`, alte Seite `/werkstatt/arbeitsweise/`).
- **Bild:** Teekanne, Teeschale und Plattenteller (`teekanne.webp`, 1030 × 687, Freisteller auf Fläche), Nachweis fehlt.
- **Screens:** `startseite-mittelweg/entwurf-1-1440.jpg`, `entwurf-1-390.jpg`.

### Entwurf 2 „1927“ (Herkunft, Typofoto)
- **Idee:** Die Jahreszahl wird zur Marke, wie im Typofoto der Bauhaus-Drucksachen: große Zahl und Foto auf einer gemeinsamen Unterkante, darunter zwei Sätze im selben Raster. Das Regal mit ungebrannter Serienware zeigt, was Leßmann 1927 einführte: Serie, Norm, Wiederholung.
- **Texte und Quellen:** Chronik 1927 und 1986 (`src/data/chronik.ts`, Langtexte): Leßmann, Schüler Otto Lindigs, Umstellung auf Serienkeramik „bei strenger Einhaltung der Formgebungsprinzipien des Bauhauses“; 1986 Wiederaufnahme des Manufakturprogramms durch Young-Jae Lee und Hildegard Eggemann; Blindstempel seit 1930.
- **Bild:** `regal.webp` (954 × 905), Foto: Haydar Koyupinar. Ein historisches Werkstattfoto gibt es weder im Repo noch auf der alten Seite (komplette WordPress-Mediathek geprüft, älteste Bilder 2023; `BILDPLAN.md` A12: bei Stadtarchiv, Zollverein oder Ruhr Museum anfragen). Mit einem solchen Foto würde dieser Entwurf am stärksten.
- **Neu:** Textrolle „Marke“ (`--t-marke`, 6 bis 22 rem) für die Jahreszahl, in DESIGN.md eingetragen.
- **Screens:** `entwurf-2-1440.jpg`, `entwurf-2-390.jpg`.

### Entwurf 3 „Tafel“ (Form folgt Gebrauch)
- **Idee:** Eine Tafel wie im Musterkatalog: vier Teller aus dem Programm in einer Reihe von oben, darunter genau unter jedem Stück Programmnummer, Name und Maß. Gleiche Grundform in abgestuften Größen, jede Größe ein Gebrauch (Brotschmier-, Ess-, Brot-, Unterteller). Das Foto ist freigestellt, sein Grund ist auf den Seitengrund `#F8F7F4` ausgeglichen (Vignette korrigiert), die Teller liegen also direkt auf der Seite.
- **Texte und Quellen:** Grundsatz „Jedes Stück muss gut zu drehen sein …“ im Kopf, „Alle Teile eines Geschirrs …“ darunter (wie Entwurf 1); Nummern, Namen, Maße aus `src/data/manufaktur.ts` (Teller Nr. 15, 16, 14, 13), Zuordnung nach der alten Seite `/manufakturprogramm/geschirr-2/`.
- **Bild:** neue Aufnahme der Werkstatt vom Oktober 2026, https://kwm-1924.de/wp-content/uploads/2026/10/1013-1016-Teller-plates-scaled.jpg (2560 × 1709), beschnitten auf 2560 × 1060 als `teller-reihe.webp`. Nachweis fehlt.
- **Screens:** `entwurf-3-1440.jpg`, `entwurf-3-390.jpg`.

### Inspiration (Refero, Stile angesehen)
| Beispiel | Übernommen | Bewusst nicht |
|---|---|---|
| [19–86](https://19-86.fr) | Zahl als Monument, Haarlinien als Ordnung (Entwurf 2) | leichte Grotesk, Tabellenkopf |
| [Gustavo Faria](https://gustavo.work) | schmale Informationsspalte neben großer Jahreszahl | gerissene Bildkanten |
| [MDF Italia Contract](https://contract.mdfitalia.com/en) | „Key values“ als wenige Grundsätze im Raster (Entwurf 1) | Kreisgrafiken |
| [B—Line](https://www.b-line.it), [V–A–C](https://v-a-c.org/en) | Objekte im gleichen Licht, eine Beschriftung je Objekt (Entwurf 3) | Versalien-Labels, Mono-Schrift |

Dazu als Bauhaus-Herkunft der Mittel: Typofoto (Moholy-Nagy), Musterkatalog mit Modellnummern. Beides als Prinzip, nicht als Optik.

### Seitenweite Mittel
- **Umgesetzt:** `--werk-max` für alle Werkbilder (ruhig, ordnet das Größenverhältnis Werk zu Stimmung); Haarlinie unter jedem Abschnittskopf bleibt die eine Rasterkante der Seite, die drei Entwürfe nutzen dieselbe Linie (Kopf, Grundsätze, Tafel-Unterkante, Text unter der Jahreszahl).
- **Geprüft und verworfen:** Abschnittsnummern (01, 02 …) – die Abschnitte sind keine Abfolge, Nummern wären Dekoration; sichtbare Rasterlinien – laut und technisch, unser Raster ordnet unsichtbar; Grotesk für Überschriften – Bauhaus-Klischee, bricht mit Caslon; zusätzliche Kicker oder Marken über Überschriften – DESIGN.md verbietet sie.

## 3. Meisterstück-Einstiegsbild

**Gewählt: Teeschale, ohne Titel, 2023** (`src/assets/img/kwm/teeschale.webp`, 1200 × 1200; Original auf der alten Seite 1500 × 1500: https://kwm-1924.de/wp-content/uploads/2024/09/Young-Jae-Lee-Ohne-Titel-2023-…-teabowl-…-1500x1500-1.webp). Sicher ein Werk von Young-Jae Lee: Titel und Jahr stehen so auf /meisterstuecke („Young-Jae Lee, Teeschale, ohne Titel, 2023“) und /young-jae-lee, der Dateiname der alten Seite bestätigt beides. Freigestellt, ruhiger Grund, passt als Einzelstück in den bisherigen Aufbau (Bild links, Satz und Werkangaben rechts). Maße nicht belegt (der Dateiname nennt „105x145cm“, offensichtlich falsch). **Nachweis fehlt**; laut `BILDPLAN.md` A14 liegen die Rechte vermutlich bei der Galerie Metzger. Daten: `einzelwerk` in `src/data/werke.ts`, Anfrage-Link „Teeschale, ohne Titel (2023)“. Damit das Stück nicht direkt darüber schon als Orte-Kachel steht, zeigt die Kachel Korea jetzt eine Kumme (`kumme_3.webp`).

Alternativen:
1. **Vier Teeschalen** (MOK-Foto), https://kwm-1924.de/wp-content/uploads/2026/02/image.png, 3575 × 1663, im Repo als `schalen-trio.webp` (2000 × 931). Schönstes und schärfstes Foto, passt wörtlich zu „Immer sind es Schalen …“. Dagegen: steht schon im Aktuell-Spotlight und als Kachel Köln, also dreimal auf der Startseite; dass es Schalen von Lee sind, ist nur durch die Platzierung unter der MOK-Ankündigung belegt; Fotograf und Rechte offen; Querformat 2,15:1 passt nicht in den Aufbau mit Einzelstück und Werkangaben.
2. **Schale, spitz, XXL** (`schale_spitz_xxl_1.webp`), H 10,5 cm, D 22,5 cm, Petalit-Eichenasche-Glasur, 2003–2005 (`werke.ts`), freigestellt. Nur 600 × 400, auch auf der alten Seite nicht größer. Für ein großes Einzelbild zu klein.
3. **Kugelvase** (`kugelvase.webp`), H 25 cm, D 32,5 cm, Barium-Feldspat-Glasur, Holzofen, Essen 1996. Ebenfalls nur 600 × 400.

Die Spindelvase (`spindelvase-einzeln-1200.webp`) ist entfernt, sie wurde nur hier verwendet.

## 4. Zahlen vorher und nachher

Gemessen mit Playwright (Chromium, reduzierte Bewegung, fester Tag 04.10.2026): Wörter = sichtbarer Text bei 1440 px, Höhe in px.

| Abschnitt vorher | Wörter | Höhe 1440 | Höhe 390 | Abschnitt nachher | Wörter | Höhe 1440 | Höhe 390 |
|---|---:|---:|---:|---|---:|---:|---:|
| Einstieg | 45 | 900 | 1.032 | Einstieg | 45 | 900 | 1.032 |
| Aktuell | 131 | 1.615 | 1.529 | Aktuell | 131 | 1.615 | 1.529 |
| Einleitungssatz, Zwei Linien | 86 | 882 | 900 | **Bauhaus** Entwurf 1 / 2 / 3 | 45 / 56 / 55 | 976 / 882 / 1.340 | 1.035 / 996 / 786 |
| Young-Jae Lee | 180 | 2.475 | 2.007 | Young-Jae Lee | 141 | 2.434 | 1.762 |
| Meisterstücke | 90 | 2.017 | 1.229 | Ausstellungsorte | 87 | 1.786 | 1.767 |
| Ausstellungsorte | 87 | 1.786 | 1.767 | Meisterstücke | 92 | 2.087 | 1.309 |
| Meditation | 63 | 559 | 719 | (entfällt) | | | |
| 99 Schalen | 59 | 1.379 | 937 | 99 Schalen | 59 | 1.235 | 857 |
| Manufaktur | 132 | 2.337 | 2.088 | (entfällt) | | | |
| Feuer | 44 | 1.440 | 1.266 | Feuer | 44 | 1.440 | 1.266 |
| Chronik | 166 | 1.596 | 748 | Chronik | 166 | 1.596 | 748 |
| Besuch | 96 | 1.341 | 1.580 | Besuch | 96 | 1.341 | 1.580 |
| **12 Abschnitte** | **1.179** | **19.054** | **16.939** | **10 Abschnitte** (Entwurf 1) | **906** | **16.138** | **14.022** |

- Text −23 %, Seite am Rechner −15 %, am Handy −17 % (Entwurf 2: 16.044 / 13.983, Entwurf 3: 16.502 / 13.774).
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
| Regal „Vor dem ersten Brand“, Krüge | /manufaktur (Zäsur, Geschirr); Regal auch in Entwurf 2 |
| Kurzfakten (Masse, Brände, Programm, Gebrauch) | /manufaktur, Arbeitsweise; /werkstatt |

**Technisch entfallen** (nur von der alten Startseite genutzt): Signatur Farbskala (`SigFarbskala`, `sig-farbskala.ts`, Daten `glasuren` und Test), `FactsTable`, `kurzfakten`, Statement-Typ `lede`, Bilder `01-seladon-gefaess.webp` und `spindelvase-einzeln-1200.webp`. Wiederherstellbar aus `e0330a3`.

## 6. Prüfung

- `npm run check` grün. Playwright gegen `wrangler dev` (Port 8784), alle Projekte (Chromium, WebKit, iPhone, Bewegung): grün bis auf die erwarteten Optik-Abweichungen Startseite und /young-jae-lee (ein Satz mehr) in allen vier Optik-Projekten; die Optik-Referenzen stammen vom Ausgangsstand. Ein Formular-Test in WebKit meldete einmal eine Konsolenmeldung des Turnstile-Widgets (Cloudflare, `postMessage`), dreimal wiederholt grün.
- Neue Tests: Bauhaus-Station zeigt je nach `?bauhaus` genau einen Entwurf (ohne Angabe und bei ungültigem Wert Entwurf 1).

## 7. Worauf beim Review achten

Links (jeweils am Rechner und am Handy öffnen):
- Entwurf 1: https://startseite-mittelweg-kwm-redesign.entwicklung-7f3.workers.dev/?bauhaus=1
- Entwurf 2: https://startseite-mittelweg-kwm-redesign.entwicklung-7f3.workers.dev/?bauhaus=2
- Entwurf 3: https://startseite-mittelweg-kwm-redesign.entwicklung-7f3.workers.dev/?bauhaus=3

1. **Am Rechner, alle drei:** Spricht die Station gleich nach Aktuell für Bauhaus, ohne Bauhaus-Kostüm? Welcher Entwurf trägt am besten: Grundsätze (1), Jahreszahl als Marke (2) oder Tafel mit Programmnummern (3)?
2. **Am Handy, Entwurf 3:** Die Legende steht in vier schmalen Spalten unter den Tellern. Noch lesbar genug?
3. **Am Rechner, Entwurf 2:** Wirkt die große 1927 als Marke ruhig oder zu laut? Das Regal steht auch in der Kachel Essen der Orte.
4. **Am Rechner:** Meisterstücke mit der Teeschale. Ist das Bild schön genug, oder lieber die vier Teeschalen (dann dreimal auf der Seite)?
5. **Am Rechner:** Rhythmus Aktuell (dunkel), Bauhaus, Young-Jae Lee, Orte (dunkel), Meisterstücke, 99 Schalen, Feuer. Ist die helle Strecke nach den Orten zu lang?
6. **Am Handy:** Young-Jae Lee mit Catoir (auf Kohle) und darunter Jahn. Ein Zitat zu viel?

## 8. Offen

- **Bildrechte:** Teeschale (Galerie Metzger, A14), Teller-Foto Oktober 2026 (Fotograf nicht belegt), Teekanne (Nachweis fehlt). Vor dem Livegang klären.
- **Farbskala:** Sie stand nur auf der Startseite und ist mit dem Manufaktur-Block entfallen. Soll sie auf /manufaktur (Kapitel Farben neben der Glasurbühne) zurückkommen?
- **Historisches Werkstattfoto** für Entwurf 2: Anfrage bei Archiven (BILDPLAN A12).
- Nach der Wahl: Umschalter und die zwei anderen Entwürfe entfernen, Kopf-Skript und CSP-Hash zurücksetzen, Optik-Referenzen neu.
