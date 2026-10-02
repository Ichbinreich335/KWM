# Design V2: Stand und Übergabe

Stand: 02.10.2026, Branch `design-v2`. V1 bleibt unverändert unter `/`, V2 liegt unter `/v2/`.
Start: `npm run dev`, dann öffnen: V1 http://localhost:4391/ und V2 http://localhost:4391/v2/

## Aufbau
- Templates in `src/v2/` (eigene Partials), CSS und JS handgeschrieben in `site/v2/`. Bilder werden geteilt (`site/img/`, aus V2 über `../img/`).
- `tools/build.mjs` baut V1 und V2.
- **Generative Elemente:** Platz `data-sig="…"` → `site/v2/js/signaturen.js` lädt `js/sig-<name>.js` und `css/sig-<name>.css`. Gemeinsame Glasuren und Zufall liegen in `js/keramik.js`, der Kosmos nutzt sie ebenfalls.
- **Schriften:** selbst gehostet in `site/v2/fonts/`, keine Google-Fonts-Anfrage mehr (DSGVO).

## Erledigt und committet
1. **Kritik:** Der Bericht steht im Chat, Archiv unter `.impeccable/critique/`. Die Referenz-Screens liegen in `.shots/kritik/` (KWM sowie 7 Referenzseiten: Kreo, Myerscough, Officine Saffi, CaiYawen, Palet, Heath, Kevala).
2. **V2-Kopie und Build** für beide Versionen.
3. **Startseite neu geordnet:** Einstieg → Lede mit Abzweig „Zwei Linien“ (Meisterstücke / Manufaktur) → Young-Jae Lee → Werkschau → Drehen → Meditation → Kosmos → „Außerdem zu sehen“ → Feuer → Manufaktur mit Farbskala → Chronik → Besuch. Die MOK-Ausstellung steht nicht mehr doppelt.
4. **Sitemap-Entwurf:** `konzept/SITEMAP-V2.md`, mit offenen Fragen an die Werkstatt.
5. **Signaturen auf Kosmos-Niveau:**
   - **Hero, `profil`:** Bei jedem Besuch eine andere der 99 Schalen als technische Profilzeichnung. Bei Hover oder Tap wird sie glasiert, ein Button zeichnet „Eine andere Schale“.
   - **Drehen, `drehen`:** Ersetzt die Drehscheiben-Icons. Eine scrollgebundene Werkzeichnung mit Aufriss, Schnitt und Draufsicht: Drehen gegen den Uhrzeigersinn, Wenden, Abdrehen im Uhrzeigersinn mit Dreheisen und Spänen, fertige Schale. Die Scheibe lässt sich von Hand drehen.
   - **Footer, `logo`:** Das Logo baut sich beim Scrollen als Bauhaus-Konstruktionszeichnung auf, der Bogen gegen den Uhrzeigersinn. Das Logo ist dadurch deutlich größer und präsenter.
   - **Farbskala, `farbskala`:** Glasur-Testkacheln mit Farben, die aus den Probenfotos gemessen sind. Glänzend, matt und gesprenkelt sind im Canvas gerendert, bei Hover, Fokus oder Tap „taucht“ die Kachel.
6. **Grundton-Test (Paket 3):** Knopf unten links mit Creme, Porzellan und Galerie, auch per `?grund=porzellan`. Rein im Browser gespeichert.

## In Arbeit oder nicht committet
- **Paket 1, Fehler und Mobil:** Die Aufgaben 1–18 sind umgesetzt, Details in `konzept/V2-PAKET1-STATUS.md`. Es fehlt eine Abschlussrunde nach den letzten Korrekturen: Tippflächen-Audit (vor allem Meisterstücke: Anfrage-Links und Unternavigation), dazu die Sichtprüfung von Manufaktur und Werkstatt mobil. Noch offen: `Young-Jae Lee` mit geschütztem Bindestrich, Desktop-Navigation 33 px hoch, eine leichte Naht in `spindelvase1-einzeln.webp`. Die Änderungen liegen auf der Platte in `src/v2/*.html`, `src/v2/partials/header.html`, `src/v2/partials/head.html`, `site/v2/styles.css`, `site/v2/css/*.css`, `site/v2/main.js` und eventuell neuen Bildvarianten in `site/img/kwm/`. Mit dem Sicherungs-Commit „WIP Paket 1“ sind sie gesichert, aber noch nicht geprüft.
- Die 19 Aufgaben von Paket 1, zum Nachsehen: Unterlängen-Maske (`.w` padding 0.25em), Tippflächen ≥ 44 px, Mobil-Menü mit Beschreibungen und Kontaktblock, Navigation „aktiv“ ungleich „Hover“, Header-Logo nur beim ersten Aufruf zeichnen, Unternavigation (Randhinweis, sticky-Versatz), Hero-Bildnachweis lesbar, Hinweis „Ziehen/Wischen“, Bildnaht Spindelvase, Anfrage-Link pro Stück, Gestaltung von `.lines` und `.now--after`, beendeten Termin Jahn und Jahn entfernen, Kosmos mobil mit Ausstellungsname, Lücke auf Aktuelles, Überschriften und Zeilenlänge auf Young-Jae Lee, srcset/Bildgrößen, width/height-Animation, Strich- und Zeitformate, 404-Links, Teamfoto, Besuchsseite mit Spalten und OSM-Link.

## Nächste Schritte
1. Den Stand von Paket 1 lesen und offene Punkte fertigstellen.
2. **Gesamtprüfung mit Playwright**, alle 8 Seiten unter `/v2/` in 1440 und 390 px, Ablage `.shots/v2/final/`. Vorher prüfen:
   - Kontaktblock des Mobil-Menüs darf auf dem Desktop nicht sichtbar sein. Er ragte zwischenzeitlich oben in die Seite.
   - Fliegende Späne im Drehen-Element wirken noch etwas gekritzelt.
   - Bei reduzierter Bewegung meldete die Startseite einmal einen SVG-Pfadfehler (`<path d="">`), vermutlich aus `sig-profil.js`. Prüfen.
3. **Grundton entscheiden:** Screenshots aller drei Töne vergleichen und den Standard setzen.
4. Danach `impeccable detect` über `site/v2/*.html`, den Skill `code-review` ausführen und einen Vorschau-Deploy erstellen (`wrangler versions upload`, nicht live).
5. README um V2 ergänzen.

## Offene Fragen an die Werkstatt (Details in SITEMAP-V2.md)
- Sollen Stücke anderer Werkstatt-Mitglieder gezeigt werden?
- Ist die Edition ein eigener Bereich?
- Wer ist Ansprechperson für Anfragen, mit Name und Foto?
- 1986 oder 1987: Die Lede und die Biografie nennen unterschiedliche Jahre.

## Für den Admin
- Fotos aus der Fotoecke bitte einheitlich: gleicher Hintergrund, Licht von links, Format 4:5, mindestens 2.400 px lange Kante, Ansichten vorne, innen, Glasur-Detail und Fuß. Galeriefotos bleiben für Geschichten und große Bilder.
- Termine brauchen später Start- und Enddatum in Sanity, damit beendete Termine automatisch aus der Startseite verschwinden.

## Stand 02.10.2026 abends: neue Startseite (maximale Version)
- **Startseite neu** (`src/v2/index.html`):
  - Reihenfolge: Einstieg „Wort und Bild“ (hell) → „Jetzt zu sehen“ (Bühne mit großem Datum und Termin-Tabelle, Anker) → Lede mit „Zwei Linien“ → Young-Jae Lee (Zitat bleibt auf dem Porträt stehen) → Meisterstücke (4-Spalten-Raster aus Bild, Name, Jahr) → Ausstellungsorte (Anker) → Manufaktur mit Farbskala → Feuer (Text bleibt auf dem Foto stehen) → Chronik (Fläche) → Besuch → Footer.
  - Die alte Startseite liegt als `start-vorher.html` daneben.
- **Entwurf-Panel** (unten links):
  - Startseite neu/vorher
  - Grundton
  - Überschriften Caslon/Jost
  - Bauhaus-Raster
  - Einstieg Wort und Bild / Foto
  - Jetzt zu sehen als Bühne oder Kacheln
  - Orte an/aus
- **Werkstatt-Seite:** neues Kapitel „Wie die Glasur ihre Farbe bekommt“ mit „Ein Feuer, zwei Farben“.
- **Konzepte:** `DESIGN.md` (verbindlich), `konzept/REDESIGN-V3.md` (Opus: Diagnose, 12 Referenzen, Stilprofil, Bildplan), `konzept/INSPIRATION-RHYTHMUS.md`, `konzept/INSPIRATION-2.md`. Der V3-Entwurf liegt unter `site/v3-entwurf/`.
- **Offen:**
  - **Inhalt:** Holzofen oder Gasofen (Start- und Werkstattseite widersprechen sich). 1986 oder 1987. Anker `#f-greve` auf `aktuelles.html` ergänzen.
  - **Bilder:** Fotos der Orte, Fotos aus der Fotoecke.
  - **Panel:** Varianten aufräumen, sobald entschieden ist.
  - **Datenschutz:** Hinweis für den Admin zu `wp-content/uploads/2023/12/image.png` auf der Live-Seite.
