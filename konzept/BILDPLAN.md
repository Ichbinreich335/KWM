# Bildplan V3: Bestand, Bedarf, Shotliste, Anfragen

Stand: 03.10.2026. Grundlage: alle V3-Seiten in `src/v3/*.html`, gebaut unter `/v3/`, geprüft bei 1440 px und 390 px (Screenshots, Dateigrößen mit `sips`, Alt-Texte und Quellcode). Es wurde nichts an der Website geändert.

Bezug: `DESIGN.md` Abschnitte 4, 6, 10, 11, `FRAGEN-AN-DIE-WERKSTATT.md` Abschnitt C, `REDESIGN-V3.md` Abschnitt 5 (Bildplan), `SITEMAP-V3.md`. Externe Quellen und Rechte: `CONTENT-FUNDE.md`.

---

## 0. Vereinheitlichte Vorgaben (gilt ab jetzt, ersetzt abweichende Angaben)

In den Vorlagen gab es Abweichungen. Diese Festlegung löst sie auf.

| Thema | Bisher uneinheitlich | Festlegung |
|---|---|---|
| Hintergrund Fotoecke | `DESIGN.md`: „hell warmgrau“, `REDESIGN-V3.md`: „neutral hellgrau, ohne Farbstich“ | **Neutral hellgrau (etwa #E6E6E4), Hohlkehle, ohne Farbstich**, Weißabgleich mit Graukarte. Die Seite hat keine Beige- oder Braunflächen, der Hintergrund soll das Foto in die Fläche `--ground-2` einpassen |
| Mindestgröße Objektfoto | `DESIGN.md`/`FRAGEN`: ≥ 2.400 px lange Kante, `REDESIGN`/`UEBERGABE`: Fotobox liefert ca. 2.000 px | **Ziel 2.400 px lange Kante. 2.000 px aus der Fotobox sind für Listen und Raster ausreichend** (Darstellung bis ca. 1.000 px bei 2×). Einzelwerke im Seitenkopf brauchen 2.400 px |
| Seitenverhältnis | `DESIGN.md` §4: Werk 3:2, Kachel 4:3, Porträt 4:5. Fotoecke: 4:5 hochkant | **Aufnahme mit Luft rundherum im vollen Sensorformat (3:2), Objekt etwa 70 % der Bildhöhe, mittig.** Lieferung als 4:5 (Hauptformat) **und** 3:2 aus demselben Bild. Aufsichten 1:1 |
| Aufnahmen je Stück | vorne, innen von oben, Detail, Fuß | **Vier Ansichten:** (1) Hauptansicht leicht erhöht, ca. 15°, (2) Aufsicht/Innenansicht, (3) Glasurdetail, (4) Fuß mit Signatur/Stempel |
| KI-Bilder | `DESIGN.md`: „nur Platzhalter“, `REDESIGN`: „verboten“ | **Verboten ab Livegang.** Heute noch 2 aktive Stellen (siehe Tabelle, B09 und B13), plus ein Ortsbild (B08, Zürich) |
| Dateiname | Werk-ID aus der Lager-App | **Dateiname = Werk-ID, im Web-Build durch Slug oder Hash ersetzen.** Keine Inventarnummer im Dateinamen oder in den Metadaten (EXIF/IPTC vor Veröffentlichung entfernen) |
| Format | WebP | Original als JPEG/TIFF archivieren, Web-Fassungen als WebP in 800/1400/2000 px |

**Inhaltsregel (gilt für Bild und Text):** Keine Preise, Bestände, Inventarnummern und Lagerorte auf der Seite. Konkret für die Aufnahme:
- Keine Preisschilder, Inventaraufkleber oder Lagerzettel im Bild, auch nicht unscharf am Fuß (Aufkleber vorher ablösen oder verdecken).
- Im Hintergrund keine Regale mit Etiketten und keine Bildschirme mit Lager-App.
- Gruppenfotos aus der Werkstatt: Beschriftungen und Auftragszettel vorher entfernen.
- Hinweis: Die Manufaktur-Seite zeigt Katalognummern („Nr. 15“) aus dem öffentlichen Bestellformular. Das sind Artikelnummern, keine Inventarnummern. Bitte bestätigen, dass sie bleiben sollen.

**Rechte:** Jede Veröffentlichung braucht Urheber, Nutzungsrecht (Web, zeitlich unbegrenzt) und einen Bildnachweis-Text. Das Impressum nennt Fotos von George Meister (2007), Haydar Koyupinar (2008) und Moon Dukgwan (2015). Welche Datei von wem stammt, ist nicht dokumentiert. Für jede ausgetauschte Datei bitte ablegen: Urheber, Jahr, Lizenz.

---

## 1. Bestand: alle Bildstellen

**Legende Herkunft:**
- **Alt** = Bild von der alten Live-Seite (WordPress), Fotograf laut Impressum 2007/2008/2015, Zuordnung offen
- **Galerie** = Foto aus einer Ausstellung, Nachweis auf der Seite genannt
- **KI** = KI-Platzhalter
- **hochgerechnet** = größer dargestellt als die Datei hergibt

**Legende Bewertung:** **gut** = bleiben. **reicht** = bleiben bis zum nächsten Foto-Termin. **ersetzen** = vor oder bald nach Livegang austauschen.
**Priorität:** **P1** vor Livegang, **P2** bald, **P3** später.

### 1.1 Startseite (`index.html`)

| ID | Abschnitt / Komponente | Aktuelles Bild | Aufl. / Darstellung (1440) | Herkunft | Bewertung | Benötigtes Format | Ideales Motiv | Quelle | Prio |
|---|---|---|---|---|---|---|---|---|---|
| B01 | 1 Einstieg, Bild halbbreit rechts (`kummerschalen`) | `kwm/kummerschalen.webp` | 937×1040 → 824×869, mobil vollbreit gedehnt | Galerie (Christopher Clem Franken, © Kunst-Station St. Peter Köln) | reicht | 4:5, ≥ 1800×2250 | Dieselbe Szene in Originalauflösung: viele Schalen von oben im Streiflicht, ohne Beschriftung | Archiv/Fotograf Franken, Kunst-Station St. Peter | P2 |
| B02 | 1 Einstieg, Wechselbilder (Variante) | `schale_spitz_gross`, `schale_spitz_xl_1` | 600×400 | Alt | ersetzen (nur falls die Variante bleibt) | wie B01 | Schalen von oben im Streiflicht | Fotoecke | P3 |
| B03 | 2 Aktuell, Spotlight MOK | `kwm/aktuell/mok-1400.webp` (aus `schalen-trio`) | 1400×652, Darstellung 899×418 | Alt/Galerie (Fotograf offen), **zeigt nicht die MOK-Ausstellung** | reicht (Platzhalter) | 21:9 Panorama, ≥ 2000×930 | Installationsansicht „99 Schalen“ im Foyer, wie ein Bühnenbild (Referenz Lisson Gallery) | MOK anfragen (siehe Abschnitt 4, A1). Ausstellung endet 25.10.2026, daher **zeitkritisch** | P1 |
| B04 | 2 Aktuell, Kachel „Kummerschalen“ (Wesel) | `kwm/aktuell/wesel-seladon-640.webp` | 640×480 → 438×328 | Ausschnitt aus Alt | ersetzen | 4:3, ≥ 1200×900 | Raumansicht Willibrordi-Dom mit Schalen am Boden, oder 3 Schalen von oben | Niederrheinischer Kunstverein/Admin vor Ort (Ausstellung bis 31.10.) | P1 |
| B05 | 2 Aktuell, Kachel Greve | `kwm/aktuell/greve-533.webp` | 533×400 → 438×328 | Alt (Kumme, Fotoecke-Stil) | ersetzen | 4:3, ≥ 1200×900 | Installationsansicht Galerie Karsten Greve St. Moritz (Ausstellung ab 3.10.) | Galerie anfragen (A2) | P2 |
| B06 | 2 Aktuell, Kachel Pop-up | `kwm/aktuell/popup-640.webp` (aus `regal`, Foto: Haydar Koyupinar) | 640×480 → 438×328 | Alt | reicht | 4:3, ≥ 1200×900 | Der Werkstattraum mit aufgebauten Ständen und Ware am 6.–8.11. | Admin vor Ort (E1) | P2 |
| B07 | 4 Young-Jae Lee, Porträt mit Zitat (Vollbreit) | `kwm/portrait-yjl.webp` | 2000×1313 → 1440×1310 (mobil stark beschnitten) | Alt/Plakatfoto, weich, wirkt wie Videoausschnitt | **ersetzen** | **Hochformat 4:5 und Quer 3:2**, ≥ 3000 px | Young-Jae Lee bei der Arbeit, ruhig, Hände sichtbar, Werkstattregal im Hintergrund, Zitat-Fläche rechts frei | Werkstatt-Reportage (S1) | **P1** |
| B08 | 6 Ausstellungsorte, 13 Kacheln (Foto gedämpft) | `schalen-trio-1400`, `regal`, `seladon-schalen`, `kummerschalen`, `teeschale`, `kugelvase`, `schalen`, `schale_gross`, `schalen2`, `spindelvase1`, `kannen`, `schale2`, `schalen3`, **`01-seladon-gefaess` (KI) für Zürich** | 240 bis 600 px Quellen, Darstellung 338–679 px breit, Mehrfachverwendung, Zuordnung unpassend (z. B. „New York“ zeigt Krüge) | Mischung | ersetzen (Zürich sofort) | 3:2 oder 4:3, ≥ 1200 px, gedämpft darstellbar | Je Stadt ein ruhiges Foto des Hauses oder Raums, nicht des Werks (Außenfassade oder Saal) | Häuser anfragen (A1–A9) | Zürich **P1**, übrige **P3** |
| B09 | 7 Haltung (Meditation), Bild rechts | `01-seladon-gefaess.webp` | 1600×1067 → 619×465 | **KI** | **ersetzen** | 4:3, ≥ 1600×1200 | Ein einzelnes Seladon-Gefäß, Aufsicht oder Dreiviertelansicht, Streiflicht (Foto, nicht Illustration) | Fotoecke (S1, Hauptansicht) | **P1** |
| B10 | 7 Haltung, Signatur „Kosmos“ (Canvas) | generative Grafik, Fallback `01-seladon-gefaess` | Canvas 864×864 | generativ/KI | reicht | später 1:1 echte Aufsichten | Echter Kosmos aus Fotos der Schalen von oben (Idee aus `REDESIGN-V3.md`) | Fotoecke, Aufsichten (S1) | P3 |
| B11 | 8 Manufaktur, Farbskala (6 Kacheln) | `weiss`, `hellgruen_matt`, `hellgruen_glaenzend`, `dunkelgruen_glaenzend`, `dunkelgruen_matt`, `rostbraun` | **100×100**, Darstellung 56 px (verwaschen) | Alt (Glasurproben, hochgerechnet in den großen Flächen) | **ersetzen** | 1:1, ≥ 1200×1200 | Flache Aufsicht auf Testkacheln, gleiches Licht, Graukarte im Bild | Glasurproben (S3) | **P1** |
| B12 | 8 Manufaktur, Regal und Krüge | `regal.webp` (Foto: Haydar Koyupinar), `kannen.webp` | 954×905 → ca. 410 px; 600×400 | Alt | reicht | 4:5 / 3:2, ≥ 1600 px | Regal mit Ware in der Werkstatt, scharf, Raum sichtbar; Krüge im Fotoecke-Stil | Reportage (S1), Fotoecke (S2) | P2 |
| B13 | 9 Feuer, Vollbild (1440×827) | `03-glasur-detail.webp` | 1600×1067 → 1440×827 | **KI** | **ersetzen** | 16:9, ≥ 2560×1440, dunkel, ruhig | Der Brand als Moment: Blick durch die Ofenöffnung, Glut oder Schalenrand mit Glasur im Gegenlicht. Zwei Varianten (Gasofen, Holzofen) | Reportage Brand (S1) | **P1** |
| B14 | 10 Chronik | keine Bilder | — | — | Textlich stark | optional 3:2 | Historische Aufnahmen 1924 bis 1990 (Hermann Kätelhön, Zollverein 1933, Baulager 1987) | Archiv (A12) | P2 |
| B15 | 11 Besuch/Anfrage | keine Bilder | — | — | — | — | siehe B28 | — | — |

### 1.2 Meisterstücke (`meisterstuecke.html`)

| ID | Abschnitt | Aktuelles Bild | Aufl. / Darstellung | Herkunft | Bewertung | Format | Motiv | Quelle | Prio |
|---|---|---|---|---|---|---|---|---|---|
| B16 | Seitenkopf (Typ Meta), großes Bild rechts | `kwm/schalen-trio.webp` | 2000×931 → 939×437 | Alt (Fotograf offen), 4 Teeschalen | gut | 21:9, ≥ 2000 px | Vier Schalen im Fotoecke-Stil, Reihe | vorhanden, später Fotoecke | — |
| B17 | Schalen (12 Werkbilder, Spitzschalen XXL/XL/groß/mittel/klein, große Schale) | `schale_spitz_*`, `schale-spitz_xxl_2`, `schale_gross` | 600×400 → 490–748 px breit (**hochgerechnet bis 1,25×**) | Alt (2007/2008/2015). Hintergründe wechseln: weiß, grau, hell-dunkel, Granit | reicht | 3:2 und 4:5, ≥ 2400 px | Einheitlicher Standard (vorne + Aufsicht + Detail + Fuß) | Fotoecke (S2) oder Originale vom Fotografen (A11) | P2 |
| B18 | Schalen, Einzelbild (Streiflicht) | `seladon-schalen.webp` | 900×600 → 1135×757 (**hochgerechnet 1,3×**) | Galerie (Franken?) | reicht | 3:2, ≥ 2400 px | Schalen von oben im Streiflicht | Franken/Kunst-Station (A7) | P2 |
| B19 | Arbeitsweise, Einzelwerk mit Meta-Spalte | `teeschale.webp`, `werke/teeschale-original-1400` | 1200² bzw. 1400², Darstellung 619 | Galerie Metzger (Foto) | gut | 1:1 / 4:5 | Teeschale, Fotoecke-Stil | vorhanden, Rechte klären (FRAGEN A3) | — |
| B20 | Kummen (3 Bilder) | `kumme_1`, `kumme_2`, `kumme_3` | 600×400 → 748×499 (hochgerechnet 1,25×) | Alt | reicht | 3:2, ≥ 2400 | siehe B17 | Fotoecke | P2 |
| B21 | Vasen, Breitbild | `vasen-detail.webp` | 1132×637 → 1523×666 (**hochgerechnet 1,35×**), Nachweis „Chemnitz 2025“, Fotograf offen | Galerie | ersetzen (Auflösung und Rechte) | 21:9, ≥ 2400×1030 | Vasen in der Ausstellung, Detail, Fotograf nennen | St. Jakobi Chemnitz / Chris Franken (A8) | P2 |
| B22 | Vasen, Zylinder und Kugel (6 Bilder) | `zylindervasen`, `zylindervasen_gross`, `zylindervase_mittel`, `zylindervase_klein`, `kugelvase` | 600×400 → 748×499 | Alt | reicht | 3:2 | siehe B17 | Fotoecke | P2 |
| B23 | Spindelvasen 2006/07 (6 Doppelbilder) | `spindelvase1`…`spindelvase6` | 600×400 (als Doppelbild montiert), Darstellung 490×327 | Alt/Montage | reicht. Je Vase nur die Einzelbilder in Original lösen | je 4:5 | Je Vase: Hauptansicht + Aufsicht | Fotoecke / Originale des Fotografen | P2 |
| B24 | Einzelwerk Spindelvase (Startseite, Meisterstücke) | `werke/spindelvase-einzeln-1200` | 1200×1200 | Alt (Freisteller) | gut | 1:1 | — | vorhanden | — |

### 1.3 Manufaktur (`manufaktur.html`)

| ID | Abschnitt | Aktuelles Bild | Aufl. / Darstellung | Herkunft | Bewertung | Format | Motiv | Quelle | Prio |
|---|---|---|---|---|---|---|---|---|---|
| B25 | Seitenkopf (Fläche), 4 Produktfotos auf Sockel | `teller`, `kannen`, `tassen2`, `toepfe` | 600×400 → 323×215 | Alt | gut für diese Größe | 3:2, ≥ 1200 px | Je Gruppe ein Gruppenfoto auf neutralem Grund | vorhanden | — |
| B26 | Einleitung (Anker), Teekanne und Teeschale | `teekanne.webp` | 1030×687 → 560×373 | Alt | gut | 3:2 | — | vorhanden | — |
| B27 | Geschirr, 7 Produktgruppen, ca. 30 Bilder | u. a. `neue_serie-1`, `viereckteller-2`, `schalen`…`schalen4`, `tassen`, `toepfe2/3`, `kannen2/3`, `suppenschale`, `sieb`, `milch`, `streuer` | 600×400 → 555×370 (≈ 1:1, wirkt bei 2× unscharf). Hintergründe wechseln (hell, dunkelgrau) | Alt | reicht | 3:2, ≥ 1600 px | Gruppenfoto je Produktgruppe auf hellgrau, plus Aufsicht (die „Geschirr-Aufsicht 1013–1016“ 2560 px liegt im Entwurfsordner) | Fotoecke (S2). Zuerst Teller, Tassen, Töpfe, Kannen | P2 |
| B28 | Zäsur (`zaesur`), Regal Foto: Haydar Koyupinar | `regal.webp` | 954×905 → 619×619 | Alt | reicht (nicht größer als halbbreit) | 1:1/4:5 | Regal mit Ware, Werkstattraum scharf | Reportage (S1) | P2 |
| B29 | Edition, 13 Bilder (Vasen, Plattenteller, Pflanzgefäße, Schalen) | `vasen`…`vasen5`, `plattenteller*`, `pflanzgefaesse*`, `schale`, `schale2` | 600×400, **`vasen3` 296×400, `vasen4` 300×198, `vasen5` 300×452, `pflanzgefaesse2` 300×199** | Alt | ersetzen die vier kleinen Dateien, Rest reicht | 3:2 / 4:5, ≥ 1600 | Edition im Fotoecke-Standard | Fotoecke (S2) | P2 |
| B30 | Farben, 10 Kacheln und große Vorschau (Geschirr 6, Edition 4) | `weiss`, … `rostbraun`, `hellblau`, `craquele_*` | **100×100** auf 84 px, große Vorschau 392×320 aufgezogen (**stark hochgerechnet, weich**) | Alt | **ersetzen** | 1:1, ≥ 1200×1200, je Glasur zusätzlich 3:2 Detail ≥ 1600 | Alle 10 Glasuren als Testkachel von oben, Detail mit Craquelé | Glasurproben (S3) | **P1** |

### 1.4 Young-Jae Lee (`young-jae-lee.html`)

| ID | Abschnitt | Aktuelles Bild | Aufl. / Darstellung | Herkunft | Bewertung | Format | Motiv | Quelle | Prio |
|---|---|---|---|---|---|---|---|---|---|
| B31 | Seitenkopf (Typ Name), randloses Bild 1440×648 | `portrait-yjl.webp` | 2000×1313 (siehe B07) | Alt | ersetzen | 21:9 Ausschnitt aus Querformat ≥ 3000 px | Porträt in Werkstatt, Platz für Bildunterschrift | Reportage (S1) | **P1** |
| B32 | Haltung, Teeschale als Einzelwerk | `teeschale.webp` | 1200² → 619 | Galerie Metzger | gut | 4:5 | — | Rechte klären | — |
| B33 | „Eine nach der anderen“ (Anker), Schalen | `kummerschalen.webp` | 937×1040 → 664×738 | Galerie (Franken) | reicht | 4:5 ≥ 1800×2250 | siehe B01 | Archiv Franken | P2 |
| B34 | Bildband zwischen Texte und Ausstellungen | `schalen-trio.webp` | 2000×931 → 1613×806 | Alt | gut | 2:1 | — | vorhanden | — |
| B35 | Texte über Young-Jae Lee, 6 Zeilen | keine Bilder | — | — | Nicht nötig | — | Optional: Titelseiten der Kataloge (Hatje Cantz 2006, Morsbroich 2004) als Buchfoto | Admin scannt Bücher, **Rechte beim Verlag** | P3 |
| B36 | Ausstellungen, Sammlungen | keine Bilder | — | — | — | — | Je Haus ein Objektfoto im Museum (laut `REDESIGN-V3.md` Quelle E) | Museen anfragen | P3 |

### 1.5 Werkstatt (`werkstatt.html`)

| ID | Abschnitt | Aktuelles Bild | Aufl. / Darstellung | Herkunft | Bewertung | Format | Motiv | Quelle | Prio |
|---|---|---|---|---|---|---|---|---|---|
| B37 | Seitenkopf (Typ Anker), Panorama randlos | `werkstatt-panorama.webp` | 2560×398 → 1441×224 | aus dem Porträtfoto zugeschnitten, weich | reicht | 3:1 bis 4:1, ≥ 3200×1000 | Der Werkstattraum quer, scharf, ohne Person im Mittelpunkt, Regale und Scheiben | Reportage (S1) | **P1** |
| B38 | Arbeitsweise, Bild links | `regal.webp` (Koyupinar, „Geschirr vor dem Brand“) | 954×905 → 738×700 | Alt | reicht | 4:5, ≥ 1600 | Handwerk: Geschirr vor dem Brand | Reportage (S1) | P2 |
| B39 | Glasurfarben, Foto links neben Oxid-Grafik | `seladon-schalen.webp` | 900×600 → 748×499 | Galerie | reicht | 3:2, ≥ 1600 | Glasur aus Oxid: Detailaufnahmen mehrerer Glasuren, Brennprozess | S1/S3 | P2 |
| B40 | Team, Gruppenbild | `leiste-team.webp` | **900×140**, Banner | Alt, hochgerechnet | **ersetzen** | 3:2 ≥ 3000×2000, plus 4:5 je Person | Das Team vor Regalen, jede Person erkennbar, Namen bekannt. Heute zeigt das Foto 9 Personen, die Texte nennen 5 | Reportage (S1) | **P1** |
| B41 | Feuer-Farben (Canvas) | generative Grafik | — | — | gut | — | — | — | — |
| B42 | Chronik, Zeitleiste | keine Bilder | — | — | — | — | Historische Fotos (siehe B14) | Archiv | P2 |
| B43 | Auf Zollverein (hell), Besuch & Anfahrt | keine Bilder | — | — | Lücke | 3:2, ≥ 2400 | Zollverein außen: Zechengelände, Schacht XII, Baulager mit Werkstatt-Eingang | Reportage (S1) | P2 |

### 1.6 Aktuelles, Besuch, Rechtliches

| ID | Seite, Abschnitt | Aktuelles Bild | Aufl. / Darstellung | Herkunft | Bewertung | Format | Motiv | Quelle | Prio |
|---|---|---|---|---|---|---|---|---|---|
| B44 | Aktuelles, MOK-Eintrag | `schalen-trio.webp` | 1440×670 → 825×619 (**auf 4:3 beschnitten**, die Schalen am Rand knapp) | Alt | ersetzen | 3:2, ≥ 2000×1333 | Installationsansicht MOK, siehe B03 | MOK (A1) | **P1** |
| B45 | Aktuelles, Wesel (gespiegelt) | `kummerschalen.webp` | 937×1040 → 923×692 (**hochgerechnet 1,0×, beschnitten**) | Galerie (Franken, © Kunst-Station St. Peter Köln) | ersetzen | 3:2, ≥ 1800×1200 | Raumansicht Willibrordi-Dom, Aufbau mit Schalen | Niederrheinischer Kunstverein (A6) | P1 |
| B46 | Aktuelles, Pop-up | `regal.webp` | 954×905 → 923×692 (**hochgerechnet 1,0×**) | Alt (Koyupinar) | ersetzen | 3:2, ≥ 1800×1200 | Raum mit Ständen am 6.–8.11. | Admin (E1) | P2 |
| B47 | Aktuelles, Jahresarchiv (11 Jahre) | keine Bilder (Liste) | — | — | Lücke, wie vorgesehen | 4:3 je Ausstellung | Optional 1 Foto je Ausstellung ab 2022 (Plakat oder Raumansicht) | Häuser (A1–A10), Plakate aus Archiv | P3 |
| B48 | Besuch, Panorama unter dem Seitenkopf | `werkstatt-panorama.webp` | 2560×398 → 1445×225 | siehe B37 | reicht | 3:1 | Eingang/Außenansicht Werkstatt (Besucher suchen den Weg auf dem Gelände) | Reportage (S1) | **P1** |
| B49 | Besuch, Anfahrt | keine Bilder | — | — | Lücke | 3:2 | Einfahrt Haldenstraße/Bullmannaue, Schild „Keramische Werkstatt“, Haltestelle Katernberg Süd | Admin (S1) | P2 |
| B50 | Besuch/Formular, Ansprechperson | keine Bilder | — | — | Lücke (Frage B10) | 4:5, ≥ 1200 | Foto der Ansprechperson | Reportage | P3 |
| B51 | Zahlung | `paypal-qr.webp` | 423×423 → 177 | Funktional | gut | 1:1 | — | — | — |
| B52 | Versand, Impressum, AGB, Datenschutz | keine | — | — | Nicht nötig | — | Optional Versand: Foto der Verpackung (P3) | Admin | P3 |

### 1.7 Übergreifend

| ID | Bildstelle | Bestand | Benötigt | Quelle | Prio |
|---|---|---|---|---|---|
| B53 | Social-Vorschau (Open Graph) und Suchmaschinen-Bild | nicht vorhanden | 1200×630, ein gutes Bild mit Text-Freiraum (z. B. Portrait oder Schalen von oben) | Reportage | P2 |
| B54 | Logo, Wortmarke | `logo.svg` | vorhanden | — | — |
| B55 | Ungenutzte KI-Dateien im Ordner | `02`, `05`, `06`, `07`, `08` (je 1600 px, KI) liegen in `site/img/`, werden in V3 nicht mehr verwendet | **Entfernen vor Livegang** (REDESIGN: „Raus“) | — | P1 (Aufräumen) |

---

## 2. Auswertung des Bestands

- **Gut, kann bleiben:** Schalen-Trio (B16/B34), Teeschale (B19/B32), Spindelvase einzeln (B24), Manufaktur-Sockelfotos (B25/B26).
- **Reicht vorerst (600 px-Archivbilder):** die rund 70 Werkbilder aus 2007/2008/2015 in Meisterstücke und Manufaktur. Sie sind sauber und einheitlich genug, werden aber bei 2× (Retina) weich und sind bis zu 1,25× hochgerechnet. Hintergrund und Licht wechseln, was die Reihen unruhig macht.
- **Ersetzen vor Livegang (P1):** B07/B31 Porträt, B09 KI-Seladon, B13 KI-Feuer, B08 Zürich (KI), B11/B30 Glasurproben (100×100), B40 Team, B03/B44 MOK, B04/B45 Wesel (aktuelle Ausstellungen).
- **KI-Bild-Befund:** `01-seladon-gefaess.webp` (Haltung, Zürich, Kosmos-Fallback) und `03-glasur-detail.webp` (Feuer) sind auf der V3 aktiv. Die Dateien `02`, `05`, `06`, `07`, `08` liegen noch im Ordner, aber nicht in der Seite.
- **Hochgerechnet:** `vasen-detail` (1,35×), `seladon-schalen` (1,3×), Meisterstücke-Reihen (1,25×), Glasurkacheln (100 px auf bis zu 392 px), Team-Banner (900 px auf volle Breite).
- **Nachweis unvollständig:** Mehrere Bilder haben keinen Fotografen (Teeschale, Meisterstücke-Reihen, `vasen-detail`). Das Impressum nennt drei Namen ohne Zuordnung.
- **Mobil:** Das Porträt wird auf 390 px stark beschnitten (der Kopf bleibt sichtbar, der Raum geht verloren). Ein Hochformat löst das. Das Einstiegsbild `kummerschalen` läuft mobil vollbreit und ist dort unscharf.

---

## 3. Shotliste für den Admin (vor Ort)

Ausrüstung: Kamera mit Wechselobjektiv oder aktuelles Smartphone im RAW-Modus, Stativ, Graukarte, zwei Hintergrundbögen (hellgrau, matt), Fensterlicht von links oder ein weicher Lichtkasten. Fotobox der Werkstatt nutzen, wo sie passt.

Gemeinsame Regeln: Hintergrund neutral hellgrau, Weißabgleich mit Graukarte, Licht von links, gleiche Kamerahöhe, Objekt füllt etwa 70 % der Bildhöhe, sauber geputzt, keine Etiketten im Bild, volle Sensorfläche aufnehmen (zuschneiden später). JPEG-Export 2400 px lange Kante, Original behalten.

### S1. Werkstatt-Reportage (ein halber bis ganzer Tag, einmal im Jahr, Vorrang P1)

Licht: Tageslicht aus dem Werkstattfenster, kein Blitz. Alle Personen vorher fragen und eine Einwilligung zur Veröffentlichung unterschreiben lassen (Bildrecht, auch für Name und Funktion).

| Nr | Motiv | Format | Anzahl (Auswahl) | Ersetzt | Hinweis |
|---|---|---|---|---|---|
| S1.1 | **Porträt Young-Jae Lee, Hochformat**, an der Scheibe, Hände sichtbar | 4:5, ≥ 3000×3750 | 5 | B07, B31 | Hintergrund Regal ruhig, links und oben Freiraum für Schrift |
| S1.2 | Young-Jae Lee beim Drehen, Hände und Ton von der Seite | 3:2, ≥ 3600 px | 6 | KI-Hände (alt) | Wasser und Ton zeigen, Bewegung leicht unscharf erlaubt, Hände scharf |
| S1.3 | Abdrehen, Anbringen der Naht (Spindelvase), Engobe-Malen | 3:2 | 6 | Arbeitsweise | zeigt das, was Jahn/Catoir beschreiben |
| S1.4 | Glasieren: Eintauchen, Glasur-Eimer | 3:2 | 4 | B39 | Hände und Glasurfluss |
| S1.5 | **Brand: Ofen**. Gasofen offen und geschlossen, Holzofen beim Anheizen, Glut, Blick in den heißen Ofen, Schalenrand im Gegenlicht | 16:9 und 3:2, ≥ 4000 px | 10 | **B13** | Sicherheit, Brennbetrieb abstimmen. Dunkelheit, Stativ, 1/30 s bis 1 s |
| S1.6 | Regal mit gedrehter Ware vor dem Brand, scharf | 4:5 und 3:2 | 4 | B12, B28, B38 | Etiketten und Auftragszettel vorher entfernen |
| S1.7 | **Werkstatt-Raum quer**, scharf, ohne Fokus auf Person | 4:1 bzw. 3:1 und 3:2, ≥ 4096 px breit | 4 | **B37**, B48 | Aufnahme aus dem Eingang, Regale und Scheiben |
| S1.8 | **Team-Gruppenfoto**, alle Mitarbeitenden, Namen aufschreiben | 3:2, ≥ 3000 px | 3 | **B40** | Alle in einer Reihe, Gesichter erkennbar, Kleidung ruhig |
| S1.9 | Einzelporträts Team (jede Person an ihrem Arbeitsplatz) | 4:5, ≥ 1800 px | je 2 | Team | später für Teamkarten (Frage B10) |
| S1.10 | **Zollverein außen**: Einfahrt Haldenstraße, Schacht XII, Baulager mit Werkstatt-Eingang, Schild, Briefkasten | 3:2, ≥ 3000 px | 8 | B43, B49 | Bei klarem Licht am Vormittag |
| S1.11 | Pop-up 6.–8.11.: Raum mit Ständen | 3:2 | 6 | B06, B46 | Vor der Eröffnung, leer und danach mit Besuch |
| S1.12 | Ausstellungsbesuch Wesel (bis 31.10.) und St. Moritz (ab 3.10.), falls erreichbar | 3:2, ≥ 3000 px | je 6 | B04, B05, B45 | Vorher Fotoerlaubnis bei den Häusern |

### S2. Fotoecke (Inventarisierung) – Objektfotos

Pro Stück **vier Ansichten:** (1) Hauptansicht leicht erhöht, ca. 15°, (2) Aufsicht/Innenansicht, 1:1, (3) Glasurdetail, (4) Fuß mit Stempel/Signatur.

| Umfang | Stücke | Bilder |
|---|---|---|
| **Stufe 1 (P1/P2)** Die zwölf Meisterstücke für Meisterstücke-Hero, Startseite und Aktuelles: Teeschale, Spindelvase (2), Schale spitz XXL, XL, groß, Große Schale, Kumme (3), Kugelvase, Zylindervasen groß | 12 | 48 |
| **Stufe 2 (P2)** Rest der Meisterstücke-Seite (Spindelvasen, Zylinder, weitere Schalen) | ca. 20 | ca. 80 |
| **Stufe 3 (P2)** Manufaktur: je Produktgruppe ein **Gruppenfoto** (7 Gruppen, dazu Edition 4 Gruppen) plus je eine **Aufsicht** | 11 Gruppen | 22 |

Nur Stücke fotografieren, die auf der Website erscheinen. Vor der Aufnahme Preis-/Inventaretiketten entfernen. Dateiname = Werk-ID.

### S3. Glasurproben (Farbskala, P1)

- **10 Testkacheln:** 6 Geschirrglasuren (weiß, hellgrün matt und glänzend, dunkelgrün matt und glänzend, rostbraun), 4 Editionsglasuren (hellblau, weiß, hellgrün craquelé, dunkelgrün craquelé). Pro Glasur eine plane Kachel (ca. 8×8 cm, mit Rand, der die Glasur am Rand zeigt).
- Aufnahme **flach von oben**, 1:1, ≥ 1200×1200, gleichmäßiges Licht, Graukarte im Bild. Pro Glasur zusätzlich ein Detail 3:2 (≥ 1600 px, mit Craquelé und Läufern).
- Anzahl: 10 + 10 = 20 Bilder. Die 100×100-Dateien in Farbskala (B11/B30) und die Aufziehvorschau entfallen.

### Zeitplan-Vorschlag

1. **Diese und nächste Woche (P1):** S1.1, S1.5, S1.7, S1.8, S3, S2 Stufe 1 Seladon-Gefäß (für B09). Dazu MOK und Wesel (Anfragen A1, A6 oder S1.12).
2. **Vor Livegang (P1):** B55 aufräumen, Rechteklärung der Bestandsfotos (siehe Abschnitt 4).
3. **Nach Livegang (P2):** S2 Stufe 1 bis 3, S1.2–S1.4, S1.10.
4. **Später (P3):** Orte, Archiv, Kataloge.

---

## 4. Anfrageliste an Dritte

### 4.1 Ansprechpartner und Zweck

| ID | Haus / Person | Ansprechpartner-Typ | Was anfragen | Bekannter Bildnachweis | Prio |
|---|---|---|---|---|---|
| A1 | **Museum für Ostasiatische Kunst Köln** | Presse/Öffentlichkeitsarbeit oder Kuratorin (Ausstellung kuratorisch umgesetzt von Dr. Shao-Lan Hertel) | 5 bis 8 Installationsansichten „99 Schalen – ein Kosmos“, Querformat, Webnutzung | Titelbild © Historisches Archiv mit Rheinischem Bildarchiv, Marion Mennicken. Installationsansicht: André Schuster (laut Galerie Greve) | **P1** |
| A2 | **Galerie Karsten Greve** (Köln, St. Moritz) | Galerieassistenz/Projektleitung für Young-Jae Lee | Installationsansichten St. Moritz (ab 3.10.2026), Köln 2024 „51 WERKE“, Spinatschalen 2020, Gefäße 2021, Porträt | Haydar Koyupinar (Porträt), André Schuster (MOK) | P2 |
| A3 | **Jahn und Jahn, München** | Galerieleitung/Projekt | Installationsansichten 2025 und 2026. Werke sind © VG Bild-Kunst, das gilt für die Werke, nicht für das Foto | nicht angegeben, abfragen | P2 |
| A4 | **MK&G Hamburg** | Presse/Bildarchiv (service@mkg-hamburg.de laut Ausstellungsseite) | Ausstellungsansichten „Contemporary Craft“ 2022/23 | Henning Rogge (Ausstellungsansichten), Thomas Dashuber (Porträt), Haydar Koyupinar | P2 |
| A5 | **Hetjens, Düsseldorf** | Presse | Ausstellungsansichten „100 Jahre KWM – Young-Jae Lee im Hetjens“ (2024) | offen | P2 |
| A6 | **Niederrheinischer Kunstverein / Ev. Kirchengemeinde Wesel** | Vorstand/Kustos oder Gemeindebüro | Raumfoto Willibrordi-Dom mit der Ausstellung „Kummerschalen“, Ausstellung bis 31.10.2026 | offen | **P1** |
| A7 | **Kunst-Station Sankt Peter Köln / Christopher Clem Franken** | Kunst-Station-Büro und Fotograf direkt | Originaldateien der Schalen-Fotos (Kummerschalen, Schalen) in Voller Auflösung, Rechte schriftlich | © Kunst-Station Sankt Peter, Köln, Fotografie Christopher Clem Franken | P2 (Rechteklärung P1) |
| A8 | **St. Jakobi Chemnitz / Chris Franken** | Kirchgemeinde-Büro, Fotograf | Vasen- und Schalenfotos der Ausstellung 2024/25 (für `vasen-detail`) | Foto: Chris Franken | P2 |
| A9 | **David Nolan Gallery New York** | Gallery Director | 9 Installationsansichten 2024 | nicht angegeben | P3 |
| A10 | **Pucker Gallery Boston, Gallery Nichinichi Kyoto, Gallery Tohkyo Tokyo, Ha Jung-woong Museum Gwangju, Raum49 Zürich** | Galerie | je 1 Raumfoto für die Ortskachel | offen | P3 |
| A11 | **Fotografen der Objektfotos:** Haydar Koyupinar (2008), George Meister (2007), Moon Dukgwan (2015) | direkt | **Originale der ca. 61 Objektfotos** (heute 600×400), Webnutzung schriftlich, Zuordnung Foto → Fotograf, Honorar | Impressum | **P1 für Rechte, P2 für Originale** |
| A12 | **Archiv:** historische Fotos 1924–1990 | Stadtarchiv Essen, RAG-Stiftung/Archiv der Zeche Zollverein, Ruhr Museum, Krupp-Archiv; Werkstatt-Mitarbeitende mit Privatbeständen | Fotos der Siedlungswerkstatt 1924, Zollverein 1933, Baulager 1987 und die zehn Fotos der Einladung 2024 im Original | offen | P2 |
| A13 | **Ilona Marx / urbanana** | Fotografin und Redaktion | Optional: 1 bis 2 Fotos aus dem Besuch 2023 (Werkstatt auf Zollverein), nur mit Namensnennung und Verlinkung | Ilona Marx | P3 |
| A14 | **Galerie Metzger, Plakatfoto** | Galerie | Rechte für Teeschale/Teekanne und das Porträt auf dem Plakat (FRAGEN A3) | Galerie Metzger | **P1 (Rechte)** |
| A15 | **Verlage Hatje Cantz, Museum Morsbroich** | Verlagsrechte | Buchtitel als Foto (P3). Rechte bei Verlag | – | P3 |

### 4.2 Formulierungsvorschlag für die Anfrage (zum Anpassen, per E-Mail)

> **Betreff:** Bildanfrage Ausstellung „[Titel]“, Webnutzung Keramische Werkstatt Margaretenhöhe
>
> Sehr geehrte [Name / Damen und Herren],
>
> wir bauen derzeit die neue Website der Keramischen Werkstatt Margaretenhöhe (Essen) auf, die Werkstatt von Young-Jae Lee. Die Ausstellung „[Titel]“ ([Zeitraum]) bei Ihnen möchten wir dort mit Bild zeigen.
>
> Dürfen wir Sie um [fünf bis acht] Installationsansichten dieser Ausstellung bitten?
> - Querformat, möglichst 3000 Pixel an der langen Kante (JPEG oder TIFF)
> - Nutzung: nur auf der Website der Werkstatt, zeitlich unbegrenzt, mit Bildnachweis
> - Bitte nennen Sie uns Urheber, Jahr und den gewünschten Wortlaut des Nachweises (zum Beispiel „Foto: [Name], [Haus]“)
> - Falls Kosten anfallen, nennen Sie uns bitte den Betrag vorab. Falls das Haus die Bildrechte nicht besitzt, bitten wir um den Kontakt zur Fotografin bzw. zum Fotografen.
>
> Wir bestätigen die Nutzungsbedingungen gern schriftlich, bevor wir die Bilder veröffentlichen. Die Fotos werden nicht an Dritte weitergegeben und nicht bearbeitet, außer für Zuschnitt und Verkleinerung.
>
> Vielen Dank und freundliche Grüße
> [Name, Funktion, Telefon]
> Keramische Werkstatt Margaretenhöhe GmbH, Bullmannaue 19, 45327 Essen

**Für Fotografen (A7, A8, A11) ergänzen:** „Wir möchten gern die Originaldatei in voller Auflösung erwerben bzw. lizenzieren: Web, unbefristet, mit Namensnennung. Können Sie uns zugleich bestätigen, welche der Aufnahmen auf unserer bisherigen Website von Ihnen stammen? Wir ordnen sie dann korrekt im Impressum zu.“

**Für Archive (A12) ergänzen:** Frage nach Signatur, Entstehungsjahr und Veröffentlichungsrecht (Archivgut, oft Entgelt).

---

## 5. Prioritäten

### P1 – vor Livegang
1. **Porträt und Raumfoto der Werkstatt** (S1.1, S1.7): B07, B31, B37, B48
2. **Feuer** (S1.5): B13 (KI raus)
3. **Seladon-Gefäß** (S2, Hauptansicht): B09 (KI raus)
4. **Glasurproben** (S3): B11, B30
5. **Team-Gruppenfoto mit Namen** (S1.8): B40
6. **Aktuelle Ausstellungen** MOK und Wesel (A1, A6): B03/B44, B04/B45. **MOK endet am 25.10.2026**
7. **Zürich-Kachel** ohne KI: B08
8. **Rechteklärung** der Bestandsfotos: A11, A14, FRAGEN A3. Dazu B55 (alte KI-Dateien entfernen)

### P2 – bald
S2 Stufe 1 bis 3 (Meisterstücke und Manufaktur im Standard), Originale der Fotografen (A11), Franken-Originale (A7, A8, B01, B18, B21, B33), Reportage S1.2–S1.4, S1.6, S1.10, S1.11, Greve und Hetjens (A2, A5, B05), Archivfotos Chronik (A12), Social-Bild (B53), Anfahrt (B49).

### P3 – später
Ortskacheln für alle 13 Orte, Foto-Kosmos aus Aufsichten (B10), Ausstellungsarchiv mit Bild, Kataloge, Ansprechperson-Foto, Versand-Foto, englische Quellen (A9, A10, A13, A15).

---

## 6. Zusammenfassung: Wer macht was

| Wer | Was |
|---|---|
| **Admin selbst vor Ort** | Alle Werkstatt-Motive (S1), Fotoecke (S2), Glasurproben (S3), Pop-up und Zollverein außen, falls möglich Wesel und St. Moritz |
| **Bei Museen/Galerien anfragen** | Installationsansichten MOK, Greve, Jahn und Jahn, MK&G, Hetjens, Wesel, Chemnitz, später Boston/Kyoto/Tokyo/Gwangju/Zürich (A1–A10) |
| **Bei Fotografen** | Originale und Rechte der Altbestände (A11), Franken (A7, A8), Galerie Metzger (A14) |
| **Bei Archiven** | Historische Fotos (A12) |
| **Bleiben können** | Schalen-Trio, Teeschale, Spindelvase einzeln, Manufaktur-Sockelfotos und Teekanne, Werkbilder 600×400 (vorerst, P2), Regal-Foto (halbbreit), PayPal-QR |
| **Raus** | `01-seladon-gefaess` und `03-glasur-detail` (KI) aus der Seite, KI-Dateien 02, 05, 06, 07, 08 aus dem Ordner, hochgerechnete Banner `leiste-*` (900×140), 100×100-Glasurkacheln |
