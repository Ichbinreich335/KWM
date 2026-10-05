# KWM – Designvorschlag v2: „Keine ist wie die andere“

Stand: 24. September 2026 · erste gebaute Version in `site/` (statisches HTML/CSS/JS, keine Build-Tools).
Start: `npm run dev` → http://localhost:4391

## Haltung

Die Grundlage aus v1 bleibt: ein digitaler Ausstellungskatalog im Rhythmus eines Kunstmagazins, große Bilder, asymmetrische Spalten, Farbe nur aus Material. v2 schärft das in drei Punkten:

1. **Die Texte der Werkstatt tragen die Seite.** Statt erfundener Slogans („Form. Glasur. Eigenart.“) stehen belegte Sätze aus den Essays auf kwm-1924.de im Zentrum. Der Einstieg zitiert Thomas Wagner: *„Immer sind es Schalen, und doch ist keine wie die andere.“* Alle Zitate sind namentlich zugeordnet.
2. **Eine Signatur, die nur KWM haben kann.** „Ein Garten der Ähnlichkeit und der Differenz“: 99 generativ gezeichnete Schalenprofile, keines gleich, nach der Konvention keramischer Profilzeichnungen (links Ansicht, rechts Schnitt, der Fuß bleibt unglasiert). Die Zeichnungen entstehen beim Scrollen wie mit Tusche gezogen; beim Hover füllt sich die Außenseite mit einer Glasur aus der echten Farbskala. Der Bezug: die aktuelle Ausstellung „99 Schalen – ein Kosmos“ im MOK Köln und Young-Jae Lees Prinzip der minimalen Veränderung.
3. **Bauhaus statt Asien-Folklore.** Die ostasiatische Anmutung entsteht über Zurückhaltung, Material und Young-Jae Lees Arbeitsweise (östlich drehen, westlich abdrehen). Die Struktur kommt aus der Bauhaus-Linie der Werkstatt seit 1927: striktes 12-Spalten-Raster, 1-px-Linien, Jost (Futura-Linie, Paul Renner, 1927) für die Sachschrift.

## Referenzen (Refero + Nutzervorgaben)

| Quelle | Übernommen | Nicht übernommen |
|---|---|---|
| Kinfolk (Refero-Style) | Weißer Grund, schwarze Serifen-Headlines, 0-px-Radien, Ghost- und gefüllte Buttons mit 1-px-Rahmen, keine Schatten | Zentrierte Stapel, Burger-Menü auf dem Desktop |
| Art + Commerce (Refero) | Randlose, museale Großfotografie, kleine sachliche Bildunterschriften | Schwarz-auf-Schwarz-Angaben aus der Extraktion |
| Exhibition Magazine (Refero) | Riesige Typografie als Bildelement: Name „Young-Jae Lee“, Wortmarke „Margaretenhöhe“ im Footer | Condensed-Grotesk |
| 14islands | Big-Picture-Scale, ruhiges Reveal der Bilder | Tech-Glas-Objekte, verspielte 3D-Motion |
| Wonderfull (Dribbble) | Asymmetrisches Raster mit viel Weißraum, Bild–Text-Versatz, Wortmarke im Footer | Kennzahlen-Leiste („4k+ / 12+ / 98 %“) |

## Aufbau (Stand v2.1)

Eine lange Startseite erzählt die Geschichte; die Unterseiten sind Katalog und Nachschlagewerk mit den echten Bildern der bisherigen Website.

**Startseite** – Einstieg mit den Kummerschalen am Boden (Foto: Christopher Clem Franken) und Wagner-Zitat → **Aktuell** direkt darunter (MOK Köln groß, drei weitere Termine) → Werkstatt-Satz mit Gründung 1924 und Bauhaus → **Young-Jae Lee**: Porträt in der Werkstatt, Catoirs Passage über die Großmutter, Gisela Jahn, Lebensweg Seoul → Essen, Sammlungen → **Meisterstücke**: Teeschale groß, ziehbare Werkschau mit echten Stücken und Werkangaben → „Gegen den Uhrzeigersinn“ (Drehscheiben drehen beim Scrollen gegenläufig) → Meditation → **Kosmos**: 99 Schalen von oben im Ring um eine leere Mitte, reagieren auf den Zeiger → Feuer auf Kohle-Schwarz → Manufaktur mit Farbskala (Bänder weiten sich, echte Glasurproben) und Regalfoto (Foto: Haydar Koyupinar) → Chronik auf Tonfläche → Besuch → Footer mit Logo und Wortmarke.

**Unterseiten** – `meisterstuecke.html`, `manufaktur.html`, `young-jae-lee.html`, `werkstatt.html`, `aktuelles.html`, `besuch.html`. Alle Texte, Werkangaben und Termine wörtlich von kwm-1924.de, jedes Zitat mit Namen.

**Technik** – statisches HTML/CSS/JS. Seiten-Vorlagen liegen in `src/`, Header/Footer/Head in `src/partials/`, `npm run build` setzt sie nach `site/` zusammen (`npm run dev` baut und startet den Server auf Port 4391). Werk- und Produktdaten aus der alten Website: `src/data/figures.json`.

## System

- **Farben:** Porzellan `#F3F1EC`, Tusche `#1B1815`, Kohle `#121210`, roher Ton `#D9C6AB`; dazu eine leichte Ton-/Papierkörnung über der Seite; Farbskala weiß `#E9E7DF`, hellgrün matt `#BCC7B3`, hellgrün glänzend `#98B6A2`, dunkelgrün glänzend `#2F5444`, dunkelgrün matt `#4D5F52`, rostbraun `#7B452D` (Farbwerte angenähert, am echten Geschirr abgleichen).
- **Schrift:** Libre Caslon Display (Headlines), Libre Caslon Text (Zitate, Lede), Jost (Text, Navigation, Angaben). Alle über Google Fonts, später selbst hosten.
- **Motion:** eine Sprache für die ganze Seite, langsam, ohne Sprungeffekte. Bilder steigen von unten auf wie Glasur beim Tauchen, Wörter heben sich aus einer Maske, Profile werden gezeichnet. Kein Scroll-Hijacking. Bei `prefers-reduced-motion` ist alles sofort sichtbar.

## Bilder

- **Echte Bilder** der bisherigen Website und aus Einladungen/Plakaten (zugeschnitten): Porträt Young-Jae Lee (Jahn-und-Jahn-Plakat), Kummerschalen und Schalen (Christopher Clem Franken), Regal (Haydar Koyupinar), Teeschale und Teekanne (Galerie Metzger), alle Werk- und Produktfotos, Glasurproben, Werkstatt-Panorama. Bildrechte für die Web-Nutzung vor Livegang bestätigen.
- **KI-Bilder** bleiben als Stimmungsbilder an drei Stellen (Hände an der Scheibe, Seladon-Gefäß, Glasurdetail) und sollten später durch eigene Fotografie ersetzt werden.

## Offen vor dem Livegang

- Nutzungsrechte für Fotos (Franken, Koyupinar, Galerie Metzger, Plakatfoto) und die Essay-Zitate klären.
- Produktfotos liegen nur in 600 × 400 px vor; für große Darstellungen neu fotografieren.
- EN-Version, Anfrageformular (bisher `mailto:` und die PDF-Bestellformulare), Impressum/AGB in das neue Design übernehmen.
