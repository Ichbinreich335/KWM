# Redesign V3: „Ausstellungshaus“

Stand: 02.10.2026. Unabhängige Art-Direction-Prüfung von kwm-1924.de, V1 und V2. Entwurf der Startseite: `site/v3-entwurf/` (lokal http://localhost:4391/v3-entwurf/).

**Kurz gesagt:** Die Seite soll wirken wie ein kleines Ausstellungshaus, nicht wie ein Magazin. Der Grund ist Porzellanweiß, Tuschschwarz dient als Anker oben und unten. Die laufende Ausstellung steht als Bühne ganz vorn. Alle Abschnitte folgen demselben Raster und haben denselben Kopf. Bewegung gibt es kaum. Farbe kommt nur aus der Keramik selbst.

---

## 1. Diagnose

### 1.1 Die Live-Seite kwm-1924.de
Die Bestandsaufnahme ist vollständig: 141 WordPress-Seiten, 159 Bilder, 25 PDFs. Screenshots liegen in `.shots/redesign/bestand/`.

**Inhalte, die tragen**
- **Fünf Essays mit Autor:** Thomas Wagner („Galaxie 333“, „Die aufgehobene Zeit?“), Gisela Jahn, Barbara Catoir und P. Friedhelm Mennekes, dazu Willibald Veit (nur als PDF). Diese Essays sind der eigentliche Schatz. Heute hängen sie in keinem Menü, und alle Links darauf sind tot (Beta-Domain).
- **Chronik 1924–2025:** Krupp, Kätelhön, Lammert, Leßmann als Lindig-Schüler, Zollverein. Sie ist präzise und gut.
- **Ausstellungsarchiv:** 5 bis 8 Termine pro Jahr, fast alle mit Start- und Enddatum. Das ist eine ideale Grundlage für die Logik „läuft / demnächst / vergangen“.
- **Werkangaben der Meisterstücke:** Maße, Glasur, Ofen, Jahr. Sie sind sachlich und museal.

**Was nicht trägt**
- **Keine Startseite.** „/“ zeigt dieselbe Seite wie Aktuelles.
- **Bildmaterial**
  - Alle Objektfotos liegen nur in 600 × 400 px vor.
  - Es gibt keine Ausstellungsansichten in brauchbarer Größe und kaum Werkstattfotos.
  - Die Banner (900 × 140) werden hochskaliert.
  - Alle Alt-Texte sind leer.
- **Dreifache Pflege der Ausstellungen** (Aktuelles, Jahresarchiv, Ausstellungsliste von YJL), und die drei Stände weichen voneinander ab. Bei 2026 fehlen in der YJL-Liste Wesel, Greve und Jahn und Jahn.
- **Widersprüche, Tippfehler, Veraltetes**
  - 1986 oder 1987 als Beginn der Leitung
  - Die Seite nennt noch Streuer, obwohl sie eingestellt sind.
  - Die Datenschutzerklärung stammt von 2009.
  - Tippfehler auch in den Slugs („auszeichungen“, „veroeffnetlichungen“)
- **Mobil:** Aktuelles scrollt horizontal, 13 von 20 Tippflächen sind kleiner als 44 px, und das Anfrageformular ist eine A4-Tabelle.
- **Sicherheitsfund:** `wp-content/uploads/2023/12/image.png` ist öffentlich abrufbar. Der Screenshot zeigt das WordPress-Dashboard mit Lesezeichen (BANKEN, STEUERN …) und einem Benutzernamen. **Sofort löschen.**

### 1.2 V1 und V2 (Prototyp)
Screenshots liegen in `.shots/redesign/ist/`, Übersichten in `m-v2-1440-*.png`, `m-v2-390-a.png` und `m-v1-1440-*.png`.

**Was gut ist**
- Die Texte sind belegt und jedes Zitat hat einen Namen.
- Die Werkangaben stehen bei den Stücken.
- Der **Kosmos** (99 Schalen) ist das stärkste Element. Er ist die einzige Signatur, die nur KWM haben kann.
- Der **Logo-Aufbau** im Fuß ist gelungen.
- Die Schriften sind selbst gehostet.

**Was nicht funktioniert (harte Lesart)**
1. **Zwölf Abschnitte, zwölf Layouts.** Fast jeder Abschnitt erfindet sein Raster neu: links Zeichnung, rechts Bild; zentriertes Zitat; Ziehleiste; Sticky-Szene; Kohle-Block; Tonfläche. Das wirkt nicht reich, sondern stockend. Dem Auge fehlt ein Takt.
2. **Kein Kontrastanker.** Creme auf Creme mit sehr dünner Display-Serife (Libre Caslon Display) und 13–14 px Jost in Grau. Die Seite wirkt blass. Solange Bilder laden, sieht man vor allem leere helle Fläche.
3. **Braun-Dominanz.** Creme-Grund, Tonfläche `#D9C6AB`, die Ocker-Chronik und warme Fotos ergeben zusammen eine braune Gesamtfarbe. Die Keramik verliert so ihre Farbe, weil der Hintergrund mit ihr konkurriert.
4. **Aktuelles steht zu spät und zu leise.** Die Seite hat viele Termine im Jahr, zeigt sie aber erst nach dem 7. Abschnitt.
5. **Zu viel Signatur.** Profilzeichnung im Hero, Drehen-Szene, Farbskala-Canvas, Wortmasken, Parallax, Kosmos und Logo: Sieben Effekte konkurrieren miteinander. Jeder einzelne ist professionell gemacht. Zusammen wirkt das wie eine Leistungsschau.
6. **Inhalte ohne Nutzen für Besucher:**
   - „Gegen den Uhrzeigersinn“ ohne Erklärung
   - die Atmosphärenliste (Eisenoxid oxidierend …)
   - drei KI-Stimmungsbilder auf der Startseite, in einem Haus, das von echten Gefäßen lebt
7. **Typografie zu zart für den Bildschirm.** Libre Caslon Display mit leichtem Strich in 50–110 px auf Creme wirkt elegant, aber kraftlos. Fließtext und Angaben sind oft unter 15 px.

**Fazit:** V2 ist handwerklich stark, aber kuratorisch unentschieden. Die Arbeit liegt nicht im „mehr“, sondern im Weglassen und Vereinheitlichen.

---

## 2. Referenzen für den Admin (12 Seiten)

Screenshots von jeder Seite liegen in `.shots/redesign/referenzen/<slug>/` (Desktop `d-*.png`, Mobil `m-*.png`, Kontaktbogen `_bogen-d.png`).

| # | Seite | Worauf achten | Was für KWM taugt |
|---|---|---|---|
| 1 | **Bauhaus-Archiv / Museum für Gestaltung** – https://www.bauhaus.de/de/ (`bauhausarchiv`) | Schwarze Servicezeile ganz oben („Morgen geöffnet ab 10 Uhr“). Ausstellungs-Hero mit riesigem Datum „17.4.–4.10.26“. Leiste „Aktuelles & Vorschau“. | Das Datum als Bildelement und der schwarze Streifen als Anker. Dazu die Bauhaus-Herkunft, die KWM teilt. |
| 2 | **Edmund de Waal** – https://www.edmunddewaal.com (`edmunddewaal`, `dewaal-making`) | Ein Keramiker. Die Startseite zeigt ein großes Bild mit einer einzigen Zeile: „*rain diary* at Gana Art, Seoul. Until 4 October 2026.“ Unter „Making“ ein Ausstellungsarchiv nach Jahren als Bildraster. | Der Tonfall: ruhig, eine Zeile statt Werbetext. Das Archiv vergangener Ausstellungen als Bildraster. |
| 3 | **Friedman Benda** – https://www.friedmanbenda.com (`friedmanbenda`) | „What's on“, „Upcoming Exhibitions“ und „Museum Exhibitions“ sind getrennte Blöcke. Jeder Eintrag zeigt Art, Titel, Ort und Datum in fester Reihenfolge. | Die strenge Termin-Anatomie. Die Trennung „im Museum / in der Galerie / in der Werkstatt“. |
| 4 | **Pace Gallery** – https://www.pacegallery.com (`pace`) | Die Rubrik „Museum Exhibitions“: Künstler der Galerie in fremden Häusern, mit Ort und Datum. | Genau die Lage von KWM: „99 Schalen“ läuft im MOK, nicht in der Werkstatt. So zeigt man das selbstbewusst. |
| 5 | **Stedelijk Museum** – https://www.stedelijk.nl/en (`stedelijk`) | „What's on“ als große typografische Zeilen mit kleinem Bild und Pfeil, darunter ein schwarzer Fuß. | Termine als Zeilen, die man in einem Blick überfliegt. Übernehmen nur das Prinzip, nicht die Lautstärke. |
| 6 | **Museum Folkwang, Essen** – https://www.museum-folkwang.de (`folkwang`) | Das Datum steht über dem Titel, Veranstaltungen mit großem Tagesdatum („04. OKT“). Schwarz-weiß mit einem einzigen Farbakzent in der Wortmarke. | Lokale Referenz, die das Publikum kennt (YJL stellte 2019 dort aus). Ein einziger Akzent statt vieler Farben. |
| 7 | **Kaikado** – https://www.kaikado.jp/en/ (`kaikado`) | Teedosen-Manufaktur seit 1875. Produkte stehen in einer Reihe auf neutralem Grund. Die Geschichte ist ein eigener Strang. Sehr leise Typografie. | Der Standard für die Fotoecke: gleiche Höhe, gleiches Licht, gleicher Grund. Tradition ohne Folklore. |
| 8 | **1616 / arita japan** – https://www.1616arita.jp/en/ (`1616arita`) | Porzellan-Manufaktur. Freigestellte Geschirrteile im weißen Raster, Journal-Beiträge mit Designern. | So kann das Manufakturprogramm als Raster aussehen, wenn die Fotos einheitlich sind. |
| 9 | **Lisson Gallery** – https://www.lissongallery.com (`lisson`) | Die Startseite ist eine einzige Ausstellung im Vollbild (Installationsansicht), Titel, Ort und Datum klein darüber. | So sieht die „Bühne“ aus, sobald echte Ausstellungsfotos vorliegen. Das begründet den Bildplan. |
| 10 | **Galerie kreo** – https://www.galeriekreo.com (`galeriekreo`) | Laufende Ausstellung im Hero, darunter ein Raster „Nouvelles pièces“ mit Objekten auf Grau. | Werkliste auf grauer Sockelfläche, die Ausstellung zuerst. |
| 11 | **MK&G Hamburg** – https://www.mkg-hamburg.de (`mkg`) | Ausstellungen und Veranstaltungen getrennt, ein klares Raster, der Fuß schwarz. | YJL stellte dort 2022/23 aus. Gutes Beispiel für ein Haus mit vielen Terminen, das trotzdem ruhig bleibt. |
| 12 | **Hostler Burrows** – https://hostlerburrows.com/exhibitions/ (`hostlerburrows-ex`) | Galerie für nordische Keramik. Ausstellungen gegliedert in Current, Upcoming und Past, mit Jahresfilter. | Die Archivlogik für über 60 Ausstellungen seit 2016. *Hinweis: Die Bilder luden im Test nicht. Die Seite selbst im Browser ansehen.* |

Aus Refero kamen drei Stilprofile als Gegenprobe:
- **V–A–C:** Katalog-Raster, 1-px-Linien, Abstände von 150 px zwischen Abschnitten.
- **Palmer Dinnerware:** Geschirr als Kunstobjekt, schwarze Bedienelemente als Anker.
- **Art In DUMBO:** Terminliste wie ein gedruckter Kunstführer, ein einziger Statusakzent.

**Bewusst nicht übernommen**
- **Bauhaus Dessau:** Verlaufsflächen, zu laut.
- **Kunsthalle Zürich:** neongelbe Großschrift.
- **Mingei:** dekorative Schrift.
- **Vitra Design Museum:** Kachel-Durcheinander.

---

## 3. Richtungen

### Richtung A, konservativ: „Galerie hell“
V2 bleibt im Aufbau und wird nur beruhigt.
- **Grund:** `#F8F7F4`
- **Schriften:** Caslon Display für Überschriften, Jost als Sachschrift
- **Abschnittsfolge** wie V2, aber:
  - ohne Profilzeichnung, ohne Drehen-Szene, ohne Atmosphärenliste
  - Aktuelles direkt nach dem Hero als dunkler Block
- **Kontrast:** schwarze Kopfzeile und schwarzer Fuß
- **Vorteil:** wenig Umbau. Der Koordinator arbeitet gerade in diese Richtung.
- **Grenze:** Die zarte Display-Serife und die unterschiedlichen Abschnittslayouts bleiben. Die Seite bleibt hübsch, gewinnt aber kaum an Kraft.

### Richtung B, empfohlen und gebaut: „Ausstellungshaus“
Die Werkstatt präsentiert sich wie ein kleines Museum: oben die Bühne mit der laufenden Ausstellung, darunter immer derselbe Abschnittsaufbau, Schwarz nur als Rahmen.

**Reference Lock**
- **Primär:** Bauhaus-Archiv. Schwarzer Anker oben, Datum als Bildelement, Grotesk mit Bauhaus-Herkunft.
- **Übernommen werden nur:**
  - von Edmund de Waal der Tonfall einzeiliger Bildunterschriften
  - von V–A–C die Randspalte mit 1-px-Linie als einheitlicher Abschnittskopf
- **Verworfen:**
  - Creme, Ocker und Ton als Flächen
  - dekorative Serifen-Headlines
  - Scroll-Effekte
  - Farbakzente außer Seladon

#### Stilprofil B

**Farbsystem** (Kontrast laut WCAG gemessen)

| Rolle | Wert | Einsatz | Kontrast |
|---|---|---|---|
| Porzellan (Grund) | `#F8F7F4` | ca. 70 % der Fläche | – |
| Sockel | `#ECEBE7` | Bildplatzhalter, die Werkstatt-Fläche (Chronik), ca. 8 % | – |
| Tusche (Anker) | `#111111` | Kopfleiste (sticky), Bühne, Fuß, Knöpfe, ca. 20 % | – |
| Text | `#161616` | Fließtext und Überschriften | 16,9 : 1 auf Porzellan |
| Text 2 | `#55554F` | Angaben, Bildunterschriften | 7,0 : 1 auf Porzellan, 6,3 : 1 auf Sockel |
| Linie | `#D4D3CE` / Tusche | Haarlinien in Listen / Abschnittskopf | – |
| Auf Dunkel | `#F4F3EF` / `#A6A59F` | Text auf Schwarz | 17,0 : 1 / 7,6 : 1 |
| **Seladon** (einziger Akzent) | `#9DBBAC` | nur Status „Jetzt zu sehen / Läuft“, nur auf Schwarz | 9,1 : 1 |

Es gibt kein Braun, keine Körnung und keinen zweiten Akzent. Glasurfarben erscheinen nur als Inhalt: Fotos, Proben, Kosmos.

**Typografie**
- **Jost (Futura-Linie, Paul Renner, 1927)** für Überschriften, Navigation und Angaben. Der Bezug ist kein Zufall: 1927 ist auch das Jahr, in dem die Werkstatt zum Bauhaus kam. Sie ist schon selbst gehostet (300–500).
- **Libre Caslon Text** nur als „Stimme der Texte“: Zitate und Leitsatz, also immer fremde Worte mit Namen. Keine Serifen-Headlines, keine Kursiv-Wortspiele.
- **Libre Caslon Display** entfällt.

| Rolle | Größe | Schnitt |
|---|---|---|
| Bühnentitel | clamp(44 → 108 px), Zeilenhöhe 0,98, −0,025 em | Jost 400 |
| Name (Young-Jae Lee) | clamp(44 → 100 px) | Jost 400 |
| Abschnittstitel | clamp(32 → 56 px), 1,06 | Jost 400 |
| Leitsatz (Zitat) | clamp(28 → 48 px), 1,18 | Caslon Text |
| Groß (Daten, Jahreszahlen) | clamp(24 → 36 px) | Jost 300, Tabellenziffern |
| Zitat | clamp(20 → 24 px) | Caslon Text |
| Lead | 18–20 px | Jost 400 |
| Text | 17 px, 1,55 | Jost 400 |
| Klein (Angaben) | 15 px | Jost 400 |
| Marke (Versalzeile) | 13 px, +0,09 em, Versalien | Jost 500 |

**Raster und Abstände**
- **Raster:** 12 Spalten (Handy 6), Rand clamp(20 → 56 px), Spalt 16–24 px, maximal 1600 px.
- **Ein Abschnittskopf für alles:**
  - 1-px-Linie in Tusche
  - links in Spalte 1–3 die Versalzeile („Meisterstücke“)
  - Mitte in Spalte 4–9 Titel und Lead
  - rechts der eine Link („Alle Meisterstücke →“)
- **Abstände:** zwischen Abschnitten immer `--abschnitt` (88–152 px), innerhalb immer `--block` (40–64 px). Keine Sonderabstände.

**Bildbehandlung**
- **Feste Seitenverhältnisse:** 4:3 Linien, 3:2 Werke (später 4:5), Porträt, Panorama.
- **Ruhiges Laden:** Bilder liegen auf Sockelgrau und blenden erst ein, wenn sie geladen sind. So entstehen keine weißen Löcher und keine Sprünge.
- **Gestaltung:** keine Filter, keine Rahmen, keine Schatten. Bildunterschrift einzeilig, 13 px, mit Fotografin oder Fotograf.
- **KI-Bilder:** Keine KI-Bilder auf der Website.

**Komponenten**
- **Kopfleiste:** schwarz und sticky, mit Logo, sechs Punkten (Aktuelles zuerst), Öffnungszeiten (ab 1280 px) und DE/EN. Mobil: „Menü“ öffnet eine schwarze Vollfläche mit großen Zeilen von 60 px Höhe.
- **Bühne:** schwarz. Links stehen Status, Titel, Datum, Ort, Zitat und zwei Aktionen, rechts das Motiv: Kosmos oder Ausstellungsfoto. Darunter im selben Block „Außerdem“ mit 1–3 Terminen nach festem Schema: Status, Datum, Titel, Ort.
- **Zwei Linien:** Karten mit 1-px-Rahmen. Beim Hover und beim Fokus kippt die Textfläche auf Schwarz, der Pfeil wandert und das Bild zoomt um 3 %. Das ist die deutlichere Hervorhebung, die der Admin wollte.
- **Werkliste:** 4 / 3 / 2 Spalten, Bild auf Sockel, Name und eine Angabezeile. Kein Preis, keine Nummer, keine Verfügbarkeit.
- **Farbskala:** sechs echte Glasurproben als Kacheln im Format 4:5. Keine Animation und kein Canvas.
- **Chronik:** Raster mit Jahreszahl über Text auf der Sockelfläche, ersetzt das Ockerband.
- **Fuß:** schwarz, mit dem Logo als Konstruktionszeichnung (Hilfslinien gestrichelt, Linien zeichnen sich einmal). Drei Spalten, Rechtliches unten.

**Bewegungsregeln**
- **Erlaubt:**
  1. Bild einblenden, wenn es geladen ist (400 ms)
  2. Hover und Fokus (200 ms: Farbe, Pfeil 4–8 px, Bild-Zoom 3 %)
  3. Logo im Fuß einmal zeichnen
  4. Kosmos: Die Schale unter dem Zeiger hebt sich, die anderen treten zurück, und der Name ihrer Glasur erscheint.
- **Nicht erlaubt:**
  - scrollgebundene Szenen
  - Parallax
  - Wortmasken
  - Dauerschleifen
  - Karussells mit Autoplay
- **Kosmos:** Er wird einmal gerendert (99 vorgerenderte Sprites) und nur bei Zeigerbewegung neu kopiert. Er hat keine Animationsschleife, deshalb laggt er nicht.
- **Reduzierte Bewegung:** Bei `prefers-reduced-motion` ist alles sofort da.
- **Budget:** Das JS des Entwurfs hat 9,7 KB, ohne Bibliotheken.

---

## 4. Startseite und Sitemap

### Startseite (so im Entwurf gebaut)
| # | Abschnitt | Fläche | Aufgabe |
|---|---|---|---|
| 0 | Kopfleiste | Schwarz | Orientierung, Öffnungszeiten |
| 1 | **Bühne: Jetzt zu sehen** | Schwarz | Laufende Ausstellung groß (heute: „99 Schalen – ein Kosmos“, MOK, bis 25.10.), darunter „Außerdem“: Wesel (läuft), Greve St. Moritz (ab 3.10.), Pop-up (6.–8.11.) |
| 2 | Die Werkstatt | Porzellan | Wagner-Leitsatz, drei Sätze Herkunft, zwei Linien Meisterstücke / Manufaktur |
| 3 | Meisterstücke | Porzellan | 8 Werke mit Angaben |
| 4 | Young-Jae Lee | Porzellan | Name groß, Porträt, Zitat Gisela Jahn, **„Östlich gedreht, westlich abgedreht“ erklärt** (zwei Arbeitsgänge, zwei Traditionen) |
| 5 | Manufaktur | Porzellan | Haltung, sechs Glasurproben, Regalfoto, Fakten |
| 6 | Werkstatt | Sockelgrau | „Hundert Jahre an der Scheibe.“ Panorama und Chronik in acht Daten |
| 7 | Besuch | Porzellan | Öffnungszeiten, Adresse, Kontakt, Anfrage |
| 8 | Fuß | Schwarz | Logo-Konstruktion, Adresse, Seiten, Rechtliches |

**Rhythmus:** Schwarz, dann fünfmal hell mit identischem Kopf, dann Grau, dann hell, dann Schwarz. Drei Flächen, ein Takt.

**Wenn keine Ausstellung läuft:** Die Bühne zeigt die nächste kommende Ausstellung („Demnächst“). Gibt es auch keine, zeigt sie die Werkstatt: Wagner-Zitat und Objektfoto, Titel „Die Werkstatt ist offen“. Diese Logik läuft beim nächtlichen Neubau, es gibt kein JS im Browser.

### Sitemap-Empfehlung
```
/                         Startseite (s. o.)
├─ aktuelles              Jetzt und demnächst · Archiv nach Jahren · Veröffentlichungen
│  └─ /<ausstellung>      Ausstellungsseite: Bühne, Ansichten, gezeigte Werke, Ort, Plakat, Presse
├─ meisterstuecke         Schalen · Kummen · Vasen · Arbeitsweise kurz
│  └─ /<werk>             Werkseite: 4 Ansichten, Angaben, „Zu diesem Stück anfragen“
├─ manufaktur             Geschirr · Edition · Farben · Anfrage (Formular statt PDF-Tabelle)
├─ young-jae-lee          Biografie · Sammlungen (18 Museen) · Auszeichnungen · Publikationen
│  └─ texte/<essay>       Die fünf bzw. sechs Essays als eigene, gut lesbare Seiten
├─ werkstatt              Arbeitsweise (Drehen/Abdrehen, Glasur, Brand inkl. Holzofen) · Chronik · Team · Zollverein
├─ besuch                 Öffnungszeiten · Anfahrt · Anfrage · Zahlung
├─ impressum · datenschutz (neu, getrennt) · agb
└─ /en/…                  gleicher Baum
```
- **Navigation:** Aktuelles steht jetzt **zuerst**, weil es der häufigste Anlass für einen Besuch ist. Danach die beiden Werklinien, die Person, das Haus und der Ort.
- **„Werke in Sammlungen“:** Die Liste verlässt die Startseite. Dort bleibt ein Satz („Museen von Boston bis Jerusalem“), die Liste steht auf Young-Jae Lee. Eine eigene Seite „In Sammlungen“ lohnt sich erst, wenn es pro Museum ein Foto des Objekts gibt (Bildplan, Quelle E).
- **Feuer und Holzofen:** wandern auf „Werkstatt“, Abschnitt Arbeitsweise. Die Atmosphärenliste entfällt.
- **Essays** bekommen eigene Seiten. Sie sind das stärkste Textmaterial und heute unauffindbar.

---

## 5. Bildplan

**Grundsatz:** Echte Gefäße statt Stimmung. KI-Bilder sind auf der Website verboten. Ein einheitlicher Objektstandard aus der Fotoecke trägt die Werklisten. Galerie- und Ausstellungsfotos tragen die großen Flächen.

| Quelle | Motive | Format, Mindestgröße | Wo auf der Website |
|---|---|---|---|
| **A Fotoecke (Inventarisierung)** | Pro Stück 4 Ansichten: (1) Hauptansicht leicht erhöht, ca. 15°, (2) **Aufsicht / Innenansicht**, (3) Glasurdetail, (4) Fuß mit Signatur | 4:5 hochkant, Aufsicht 1:1. Die Fotobox liefert ca. 2000 px, das reicht bis 1000 px Darstellung | Werklisten, Werkseiten, Manufakturraster |
| **B Ausstellungen** | Pro Ausstellung 3–8 Bilder: Gesamtansicht, Reihe, Detail, Eröffnung, dazu Plakat oder Einladung | 3:2 quer, ab 3000 px | Bühne, Ausstellungsseiten, Archiv als Bildraster |
| **C Werkstatt-Reportage** (einmal im Jahr) | YJL beim Drehen und Abdrehen (ersetzt die KI-Hände), Glasieren, Ofen, Regal, Team mit Namen, Zollverein außen | 3:2 quer und 4:5 | Young-Jae Lee, Werkstatt, Besuch |
| **D Glasurproben** | Die 6 Geschirr- und 4 Editionsglasuren als Testkacheln, gleiches Licht | 1:1, ab 1200 px | Farbskala (heute 100 × 100 px, also zu klein) |
| **E Archiv** | Historische Fotos 1924–1990 (die Einladung 2024 zeigt zehn davon, Originale besorgen), Objekte in Museen (bei den Häusern anfragen) | Originalformat | Chronik, „In Sammlungen“ |

**Regeln für die Fotoecke**
- **Hintergrund:** immer derselbe, neutral hellgrau mit Hohlkehle, ohne Farbstich.
- **Aufbau:** Licht von links, gleiche Kamerahöhe, das Objekt füllt etwa 70 % der Bildhöhe.
- **Weißabgleich** mit Graukarte.
- **Dateiname** = Werk-ID aus der Lager-App. Die Inventarnummer erscheint nie auf der Website.
- **Idee:** Die Aufsichten aller Schalen ergeben mit der Zeit einen **echten Kosmos aus Fotos**. Der generative Kosmos kann dann durch echte Schalen ersetzt werden.

**Sofort verwendbar**
- `schalen-trio` (2000 px)
- `portrait-yjl` (2000 px)
- `werkstatt-panorama` (2560 px)
- `regal` und `kummerschalen` (ca. 950 px, nur halbbreit)
- `teeschale` (1200 px)
- **Neu von der Live-Seite** (im Entwurf unter `site/v3-entwurf/img/` abgelegt):
  - die Geschirr-Aufsicht `1013-1016-Teller-plates` (2560 px)
  - das Kummen-Detail aus der Einladung 2026 (1291 px)

**Anfragen**
- Originale der 61 Objektfotos (600 × 400) beim Fotografen anfragen: George Meister 2007, Haydar Koyupinar 2008, Moon Dukgwan 2015.
- Installationsfotos bei MOK, Willibrordi-Dom/Niederrheinischer Kunstverein, Jahn und Jahn, Karsten Greve, Hetjens (2024) und MKG (2022/23).
- Die Rechte für die Web-Nutzung jeweils schriftlich.

**Raus**
- Alle KI-Bilder: `01-seladon-gefaess`, `03-glasur-detail`, `05-haende-beim-formen`, `06-werkstatt-morgenlicht`, `07-…`, `08-…`.
- Die hochskalierten Banner (900 × 140).

---

## 6. Ausstellungen in Szene setzen

Die 99-Schalen-Inszenierung gilt als das beste Element. Der Gedanke dahinter lässt sich verallgemeinern: **Jede Ausstellung bekommt eine Bühne, und die Bühne hat ein Motiv.**

1. **Ein Datenmodell (Sanity `ausstellung`)**
   - **Felder:**
     - Titel, Art (Museum / Galerie / Werkstatt / Messe)
     - Ort, Stadt, Start, Ende, Eröffnung
     - Öffnungszeiten, externer Link
     - Zitat mit Quelle
     - Bühnenmotiv (Foto | Werk | generativ), optional eine Zahl (99, 101 …)
     - gezeigte Werke als Referenzen
   - **Eine Quelle für alles:** Aktuelles, Archiv, Ausstellungsliste YJL und die Startseiten-Bühne lesen aus demselben Dokument. Das beendet die dreifache Pflege.
2. **Status aus dem Datum** (beim Bauen berechnet):
   - Läuft
   - Demnächst
   - „Nur noch bis …“ in den letzten 14 Tagen
   - Vergangen: rutscht ins Archiv
   
   Der nächtliche Neubau läuft über den Deploy Hook.
3. **Motive nach Regel, nicht nach Laune:**
   - **Foto:** Installationsansicht vollflächig, wie bei Lisson. Das ist der Normalfall, sobald Bilder da sind.
   - **Werk:** ein gezeigtes Stück auf Schwarz, aus der Fotoecke.
   - **Generativ:** nur wenn die Ausstellung selbst eine Anordnung oder Zahl ist. „99 Schalen“ wird der Kosmos, „100 + 1 Übungsstücke“ ein Raster aus 101 Feldern, „1111 Schalen“ (Katalog der Pinakothek 2006) ein dichteres Feld. Sonst kein generatives Motiv, damit es nicht zur Spielerei wird.
4. **Großes Datum als Bildelement** (Bauhaus-Archiv): Auf Ausstellungsseiten steht das Datum in Bühnengröße.
5. **Ausstellungsseite**
   - Aufbau:
     - Bühne
     - Text der Kuratorin oder ein Essay-Auszug
     - Raster der Ansichten
     - „Gezeigte Werke“ mit Link auf die Werkseiten, ohne Preis
     - Ort und Anfahrt, Plakat, Presse
   - Dazu ein **Kalendereintrag (.ics)**, der beim Bauen erzeugt wird.
6. **Archiv**
   - Nach Jahren, oben ein Bildraster (de Waal „Making“), darunter die Liste.
   - Filter: Museum, Galerie, Werkstatt.
   - Kopfzeile: „Von Kyoto bis Boston“ mit der Zahl der Städte.
7. **Werkstatt-Termine** (Pop-up, Weihnachtsausstellung) bekommen die Art „In der Werkstatt“ mit Adresse und Öffnungszeiten. Sie sind der direkteste Grund für einen Besuch.

---

## 7. Was aus V2 übernommen und was verworfen wird

**Übernommen**
- Alle belegten Texte und Zitate mit Namen, die Werkangaben, die Chronik.
- **Kosmos:** jetzt auf Schwarz, wo er als „kleine Milchstraße“ wirkt. Einmal gezeichnet, mit Hover-Anzeige der Glasur.
- **Logo-Konstruktion im Fuß:** vereinfacht als CSS-Strichzeichnung mit gestrichelten Hilfslinien.
- „Zwei Linien“ (mit deutlicherem Hover), die Werkschau (als Raster statt Ziehleiste), der Besuchsblock.
- Selbst gehostete Schriften Jost und Libre Caslon Text.
- Mobil-Menü als Vollfläche. Die Beschreibungszeilen der Menüpunkte aus V2 können zurückkommen.

**Verworfen**
- **Effekte:** generative Profilzeichnung im Hero, scrollgebundene Drehen-Szene, Farbskala-Canvas (laggt), Wortmasken, Parallax, Ziehleisten.
- **Flächen und Farben:** Creme- und Ton-Grund, Papierkörnung, Ocker-Chronik, Grundton-Umschalter.
- **Abschnitte:**
  - Meditation und Feuer auf der Startseite, die Atmosphärenliste
  - „Außerdem zu sehen“ als eigener Abschnitt (jetzt in der Bühne)
  - Sammlungsliste auf der Startseite
- **Libre Caslon Display** als Headline-Schrift.
- **KI-Bilder.**

---

## 8. Der Entwurf

- **Dateien:**
  - `site/v3-entwurf/index.html`
  - `entwurf.css` (alle Werte als Variablen in `:root`)
  - `entwurf.js` (Menü, Bild-Einblenden, Kosmos, Logo)
  - `img/` mit zwei neuen Fotos von der Live-Seite
- **Links** zeigen auf die V2-Unterseiten.
- **Screenshots:** `.shots/redesign/entwurf/`
  - `1440-*.png` und `390-*.png` (Ausschnitte), `*-ganz.png` (ganze Seite)
  - `_uebersicht-1440.png` und `_uebersicht-390.png`
  - Zustände: `zustand-linie-hover-1440.png`, `zustand-kosmos-hover-1440.png`, `zustand-menue-390.png`
- **Geprüft:**
  - keine Konsolenfehler
  - kein horizontales Scrollen bei 390 px
  - alle Tippflächen mindestens 44 px
  - alle Texte deutsch und echt (von kwm-1924.de bzw. aus V2)
  - keine Preise, Nummern oder Verfügbarkeiten

---

## 9. Offene Fragen

1. **Richtung:** B („Ausstellungshaus“) als Grundlage für den Astro-Umbau? Oder erst A, und B danach?
2. **Schrift:** Ist Jost als Überschriftenschrift gewollt? Falls eine eigenere Grotesk gewünscht ist (z. B. eine lizenzierte Futura oder Neue Haas Unica), kostet das Lizenzgebühren.
3. **Bühne:** Soll immer die *eigene* Werkstatt-Ausstellung Vorrang haben, oder die bedeutendste (Museum vor Galerie vor Werkstatt)?
4. **1986 oder 1987** als Beginn der Leitung (Chronik und Biografie widersprechen sich).
5. **Ausstellungsfotos:** Wer fragt bei MOK, Wesel, Greve und Jahn und Jahn an, und wer klärt die Rechte?
6. **Fotoecke:** Hochformat 4:5 als Standard für Unikate bestätigen, für Schalen zusätzlich die Aufsicht 1:1?
7. **Essays:** Liegen die Abdruckrechte für die fünf Essays vor (heute online, aber verwaist)?
8. **„Galerie“-Seite:** Ist damit ein Bildarchiv der Ausstellungen gemeint oder die Objekte in Museumssammlungen? Der Entwurf empfiehlt das Archiv (Aktuelles) und auf Young-Jae Lee eine Liste der Sammlungen.
9. **Sicherheit:** Den Dashboard-Screenshot `wp-content/uploads/2023/12/image.png` auf der Live-Seite löschen. Das kann nur der Admin.
