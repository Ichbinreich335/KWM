# DESIGN.md: Designsystem der KWM-Website (V2)

Stand: 03.10.2026. Verbindlich für alle Seiten und Elemente in `src/v2/` und `site/v2/` sowie für den späteren Umbau in Astro-Komponenten. Neue Elemente setzen sich aus den Bausteinen unten zusammen. Wer etwas Neues braucht, ergänzt es zuerst hier.

## 1. Haltung
- **Ausstellungskatalog, kein Shop.** Das Objekt führt, die Oberfläche tritt zurück.
- **Hell und ruhig, dazu klare dunkle Anker.** Kontrast entsteht durch Fläche (hell, Fläche, Anker), nicht durch Farbe.
- **Farbe kommt nur aus dem Material.** Glasuren und Fotos tragen die Farbe, die Oberfläche ist schwarz-weiß mit genau einem Akzent.
- **Wenig Bewegung, dafür gute.** Pro Bildschirm höchstens eine Signatur-Bewegung, alles andere ist leise.
- **Feste Inhaltsregel:** keine Preise, Inventarnummern, Verfügbarkeiten oder Versandangaben. Alles läuft „auf Anfrage“.

## 2. Farben (Tokens in `site/v2/styles.css`, `:root`)

| Token | Wert | Rolle |
|---|---|---|
| `--ground` | `#F8F7F4` | Papier, Grundton „Galerie“ |
| `--ground-2` | `#EDECE8` | Fläche: ruhige Zwischenabschnitte, Bildrahmen |
| `--ground-3` | `#E2E1DC` | Rahmen hinter Freistellern |
| `--ink` | `#161616` | Schrift, Linien, primäre Buttons |
| `--ink-2` | `#5C5B57` | Nebentext, Daten, Bildunterschriften (6,3:1 auf Papier) |
| `--hair` | `rgba(22,22,22,.14)` | Haarlinien zwischen Einträgen |
| `--coal` | `#121212` | Anker: dunkle Abschnitte, Footer |
| `--coal-2` | `#1D1D1C` | Flächen innerhalb eines Ankers (Kacheln) |
| `--on-coal` | `#F2F1EE` | Schrift auf Anker |
| `--on-coal-2` | `#A3A29D` | Nebentext auf Anker (6,4:1) |
| `--hair-on-coal`, `--line-on-coal`, `--veil-on-coal` | `rgba(242,241,238, .22 / .35 / .1)` | Haarlinie, kräftigere Linie und Schleier auf Anker; `.on-anker` setzt die Haarlinie |
| `--shade` | `18 18 18` (Kanäle) | Abdunklung über Bildern: `rgb(var(--shade) / 0.6)` |
| `--accent` | `#4E7D6A` | Seladon, einziger Akzent: aktive Navigation, Auswahl, Markierung |
| `--accent-on-coal` | `#8DB5A3` | Akzent auf Anker |

**Glasurfarben** (`--glaze-*`, `GLAZES` in `js/keramik.js`) sind Inhalt und werden nie als Farbe der Oberfläche verwendet.

**Keine Braun- oder Beigeflächen.** Ton und Rohware erscheinen nur in Fotos und gerenderten Objekten (`CLAY` in `keramik.js`).

## 3. Typografie

**Schriften:** Libre Caslon Display (Überschriften, Namen, Zahlen), Libre Caslon Text (Zitate, Lede, Einleitungen), Jost 300–500 (Text, Navigation, Daten). Alle selbst gehostet in `src/assets/fonts/`, registriert in `astro.config.mjs` (`fonts`).

**Regel: Es gibt nur Textstile.** Jede Schriftgröße im CSS kommt aus einem Token der Rollenskala in `site/v3/styles.css` (`:root`, Block „Textstile“). Ein Textstil besteht aus `--t-<name>` (Größe) und `--t-<name>-lh` (Zeilenhöhe) und wird immer als Paar gesetzt: `font-size: var(--t-small); line-height: var(--t-small-lh);`. Nackte `px`-, `rem`- oder `clamp()`-Werte außerhalb von `:root` sind nicht erlaubt. Wer eine Größe braucht, die es nicht gibt, ordnet das Element einer vorhandenen Rolle zu. Eine neue Rolle braucht einen Eintrag in der Tabelle und einen eigenen Zweck. Die kleinen Rollen (`small`, `meta`) wachsen auf großen Bildschirmen fließend, mobil sind es 16 px und 13,5 px.

### Textstile

| Name | Token | Schrift | Größe (mobil → groß) | Zeilenhöhe | Farbe hell / Anker | Beispiele |
|---|---|---|---|---|---|---|
| Mega | `--t-mega` | Display | 3 rem bis 6 rem (15,5 vw) bis 900 px, danach 12,4 vw bis 13 rem | 0,9 | `--ink` / `--on-coal` | Name „Young-Jae Lee“, Titel der Name-Köpfe (Aktuelles, 404) |
| Wortmarke | `--t-wordmark` | Display | 17,6 vw | 0,74 | `--on-coal` | „Margaretenhöhe“ im Footer, unten beschnitten |
| Seitentitel | `--t-title` | Display | 2,5 rem bis 7 rem (7 vw) | 0,95 | `--ink` / `--on-coal` | `.page-hero__title` (Minimum kleiner als `--t-display`, damit „Zahlungsmöglichkeiten“ bei 360 px passt) |
| Zäsur | `--t-display` | Display | 3 rem bis 7 rem (7 vw) | 0,95 | `--ink` / `--on-coal` | Zitat-Zäsur Young-Jae Lee, Glasurname |
| Abschnitt | `--t-h2` | Display | 2,3 rem bis 4,6 rem (4,6 vw) | 1,02 | `--ink` / `--on-coal` | `.h2`, Einstiegstitel, `.lines__name`, Jahreszahl im Archiv, Öffnungszeiten groß, Orts-Kachel XL |
| Aussage | `--t-statement` | Display | 2 rem bis 3,6 rem (3,6 vw) | 1,06 | `--ink` / `--on-coal` | Eigene Aussage der Werkstatt (`.ms-intro__statement`, `.mf-intro__rule`, `.zaesur__text`), Spotlight-Titel, Mobilmenü-Namen, Jahr im Ausstellungsarchiv, Chronik-Jahr |
| Lede | `--t-lede` | Text | 1,65 rem bis 2,75 rem (2,9 vw) | 1,22 | `--ink` / `--on-coal` | derzeit nicht verwendet (frei für einen Einleitungssatz) |
| Titel | `--t-h3` | Display (auch Text) | 1,5 rem bis 2,2 rem (2,2 vw) | 1,1 | `--ink` / `--on-coal` | Kachel-, Eintrags- und Kartentitel, `.legal__body h2`, Anfrage-Leiste, Zitat mittel (`.artist__quote`) |
| Jahreszahl | `--t-numeral` | Display | 1,3 rem bis 2,4 rem (2,4 vw) | 1 | `--ink` / `--on-coal` | `.datelist__year`, Werkstatt-Daten, Lebensdaten |
| Zitat klein | `--t-quote` | Text | 1,25 rem bis 1,6 rem (1,7 vw) | 1,35 | `--ink` / `--on-coal` | Längere Fremdzitate (Statement-Typ `zitat-lang`) und Einleitungen (`.page-hero__lede`), Werkname (`.piece__name`), Adresse |
| Fließtext | `--t-body` | Jost (Text für lange Absätze) | 17 px bis 19 px | 1,55 | `--ink` / `--on-coal` | Absätze, `<body>`, Formularfelder, Listeneinträge mit Titel (`.year__list .t`, `.facts dd` breit), Lead-Absatz |
| Begleittext | `--t-small` | Jost | 16 px bis 18 px | 1,5 | `--ink-2` / `--on-coal-2` | Abschnitts-Aside, Teaser, Ortslisten, Beschreibungen in Listen, Navigation, Buttons, Link mit Pfeil, Footer-Spalten |
| Meta | `--t-meta` | Jost | 13,5 px bis 15 px | 1,45 | `--ink-2` / `--on-coal-2` | Daten, Orte-Details, Bildunterschriften (`figcaption`), Spaltenlabel (Versalien, Sperrung 0,08 em), Quellenzeilen |

Größen bei 1440 px: Mega 179, Seitentitel 101, Abschnitt 66, Aussage 52, Lede 42, Zahl 35, Titel 32, Zitat klein 24, Fließtext 18, Begleittext 17, Meta 14. Benachbarte Rollen unterscheiden sich um mindestens 10 % in der Größe, Fließtext und Begleittext zusätzlich über Farbe (`--ink` gegen `--ink-2`).

**Zuordnung:** Überschrift eines Abschnitts oder einer Seite = Abschnitt oder Seitentitel; Titel eines Eintrags in einer Reihe oder Kachel = Titel; Satz in der Schrift Text, der als Stimme der Werkstatt oder des Künstlers steht = Lede, Zitat klein; alles Lesbare in ganzen Sätzen = Fließtext; alles Erklärende neben oder unter einem Titel = Begleittext; alles, was ein Datum, ein Maß, ein Ort oder eine Beschriftung ist = Meta.

**Ausnahmen (bewusst, nicht aus der Skala):**
- `--t-wordmark` ist keine Leseschrift, sondern Bildelement mit Breite 17,6 vw.

**Weitere Regeln:**
- **Spaltenlabel nur über Info-Spalten** (Footer, Werkangaben). **Nie als Kicker über einer Überschrift.**
- **Umbruch:** Überschriften `text-wrap: balance`, Absätze `pretty`. Namen mit Bindestrich (Young-Jae) brechen nicht um, dafür das geschützte Zeichen `&#8209;` oder `white-space: nowrap` verwenden.
- **Unterlängen-Maske** bei der Wort-Einblendung: `padding-bottom: 0.25em`, nie knapper.
- **Messlänge:** Fließtext höchstens 68 Zeichen, Begleittext 44 Zeichen.

## 4. Raster und Abstand
- **Raster:** 12 Spalten (`.grid`), Seitenrand `--m` = `clamp(16px, 2.8vw, 44px)`, Spaltenabstand `--g` = `clamp(12px, 1.6vw, 24px)`.
- **Abschnittsabstand:** `--section` = `clamp(80px, 10vw, 168px)` oben und unten. Abschnitte wählen keine eigenen Abstände, Ausnahmen gelten nur für Vollbild-Signaturen.
- **Kopf zu Inhalt:** `--head-gap` = `clamp(32px, 4vw, 56px)`. Gilt für Abschnittsköpfe und für den Seitenkopf zum Bild.
- **Bildformate:** Kachel 4:3, Werk 3:2, Porträt 4:5, Panorama frei. In einer Reihe immer dasselbe Format.
- **Bildgröße nach Rolle:** Werk- und Porträtbilder höchstens zwei Drittel der Bildschirmhöhe (`--werk-max` = 66 svh) und mit Luft drumherum, nie randlos. Stimmungsbilder (Feuer, Einstieg, Orte) dürfen randlos und groß sein.

## 5. Abschnittstypen und Rhythmus

| Typ | Grund | Verwendung |
|---|---|---|
| Hell | `--ground` | Standard |
| Fläche | `--ground-2` (`.on-flaeche`) | ruhige Zwischenstation: Chronik |
| Anker | `--coal` (Schrift `--on-coal`), auf Unterseiten `.on-anker` | Einstieg (Foto), Seitenkopf der Werkstatt, Aktuell, Orte, Feuer, ein Kapitel oder Abschnitt je langer Unterseite (nicht Aktuelles), Footer |

- **Rhythmus:** nie zwei Anker direkt hintereinander. Ungefähr alle zwei bis drei Bildschirme ein Anker, damit die helle Seite Halt hat.
- **Anker setzen lokal** `--ink-2: var(--on-coal-2)`, `--hair: rgba(236,234,227,.22)`, `--cover: var(--coal)` und eigene `::selection`.

**Unterseiten (Reihenfolge):** Seitenkopf (einer der vier Kopf-Typen, siehe Seitenkopf) → Einleitung oder Unternavigation (hell, bei Bedarf Fläche) → Kapitel (hell, mindestens ein Kapitel oder eine Zäsur als Fläche) → Anfrage-Leiste (Fläche, nie Anker, weil der Footer folgt) → Footer (Anker).
- **Anker auf Unterseiten** (`.on-anker`: lokale Tokens `--ink`, `--ink-2`, `--hair`, `--cover`, Grund `--coal`) sind kein Muss. Auf langen Seiten steht genau einer im ersten Drittel als Halt, an einer inhaltlich passenden Stelle. Nie direkt vor der Anfrage-Leiste oder dem Footer („schwarz, hell, schwarz“ wirkt unruhig), nie zwei Anker zu dicht hintereinander. Kurze Seiten (Aktuelles) kommen ohne Anker aus. Wo der Seitenkopf selbst dunkel ist (Werkstatt), genügt dieser.
- **Nicht jede Seite beginnt dunkel.** Höchstens eine Unterseite hat einen dunklen Kopf (Werkstatt), nie zwei in der Navigation direkt nebeneinander.
- **Auf langen Seiten eine Zäsur** alle zwei bis drei Bildschirme: Bildband, Zitat auf Fläche oder Bild mit Satz. Zitat-Zäsur: `.pullquote` (Fläche, Display-Satz, Quelle). Bild-Zäsur: `.zaesur` (Fläche, Bild links, Satz rechts).
- **Einzelwerk mit Meta-Spalte:** ein einzelnes Bild in einem Kapitel steht in Spalte 4–12, Name, Maße und Anfrage in Spalte 1–3 an derselben Oberkante (`.catalog__item--wide`). Nie ein zentriertes Einzelbild.
- **Wechsel der Seite** bei Einträgen mit festem Aufbau (`.feature--mirror`), nie zwei gleiche Köpfe nacheinander in dieselbe Richtung ohne Grund.

| Seite | Kopf-Typ | Rhythmus | Charakter-Element |
|---|---|---|---|
| Meisterstücke | Meta | Kopf hell → Einleitung Fläche → Schalen hell → **Arbeitsweise Anker** → Kummen Fläche → Vasen hell → Anfrage-Leiste → Footer | Einzelwerke mit Werkangaben in der Meta-Spalte |
| Manufaktur | Fläche | Kopf Fläche → **Einleitung mit Zitat Anker** → Unternavigation → Geschirr hell → Zäsur Regal Fläche → Geschirr hell → Edition Fläche → Farben hell, Arbeitsweise hell → Anfrage-Leiste → Footer | Geschirrreihe auf Sockel im Kopf |
| Young-Jae Lee | Name | Kopf hell → Haltung hell → **„Eine nach der anderen.“ Anker** → Biografie, Texte hell → Bildband → Ausstellungen hell → Zitat Fläche → Sammlungen bis Publikationen hell → Anfrage-Leiste → Footer | großer Name, Zitat „Immer sind es Schalen …“ |
| Werkstatt | Anker | Kopf dunkel → Arbeitsweise, Glasurfarben hell → Chronik Fläche → Team hell → Auszeichnungen Fläche → Zollverein hell → Anfrage Fläche → Footer | Panorama randlos |
| Aktuelles | Name (ohne Bild) | Kopf hell → Einträge hell, Wesel gespiegelt → Pop-up Fläche → Vergangene Ausstellungen hell (Jahresarchiv) → Veröffentlichungen hell → Anfrage-Leiste → Footer | gespiegelter Eintrag |
| Besuch | Meta (mit Öffnungszeiten) | Kopf hell → Adresse mit Panorama hell → Anfahrt Fläche → Anfrage, Zahlung hell → Footer | Öffnungszeiten groß im Kopf |
| 404 | Name | Kopf hell → Footer (ohne Anfrage-Leiste) | |

**Startseite: Reihenfolge und Zweck.** Jeder Abschnitt hat genau eine Aufgabe. Ein neuer Abschnitt braucht einen eigenen Zweck, sonst gehört er auf eine Unterseite.

| # | Abschnitt | Typ | Zweck |
|---|---|---|---|
| 1 | Einstieg: Zitat und Kummerschalen-Foto, ein Satz, zwei Links | hell | Haltung in einem Satz und einem Bild |
| 2 | Aktuell: Spotlight mit Details, weitere zum Aufklappen, Hinweiszeile | Anker | Was jetzt zu sehen ist und wo. Häufigster Besuchsgrund |
| 3 | Bauhaus: Grundformen (Teller, Schale, Krug) und Farbskala im selben Raster | hell | Das Prinzip des Hauses als Bild: wenige Formen, sechs Farben, alles kombinierbar |
| 4 | Young-Jae Lee: Name, Porträt (Spalte 1–7) mit Kritikerzitat daneben, Lebensweg | hell | Die Person hinter den Stücken |
| 5 | Meisterstücke: Einzelwerk mit Meta-Spalte (Name links, Bild Spalte 4–9) und Auswahl | hell | Die Unikate selbst. Bilder statt Worte |
| 6 | Ausstellungsorte | Anker | Reichweite und Anerkennung (Museen, Galerien) |
| 7 | 99 Schalen: Wagner-Zitat und der Ring auf hellem Grund | hell | Wiederholung und Differenz. Warum keine wie die andere ist |
| 8 | Feuer | Bild | Der Brand als Moment, ein kurzer Bildwechsel |
| 9 | Chronik, hundert Jahre: nur Jahr und Titel | Fläche | Herkunft des Hauses. Die Überschrift bleibt stehen, die Jahre ziehen vorbei |
| 10 | Besuch und Anfrage | hell | Kommen oder schreiben: Öffnungszeiten und Formular |
| 11 | Footer | Anker | Kontakt, Logo, Wortmarke |

**Regel für die Startseite:** ein Abschnitt, ein Satz, ein Bild. Kritikerzitate (Catoir, Jahn, Wagner) bleiben, weil sie die Kunstrichtung zeigen, aber jedes Zitat nur einmal auf der Website. Sätze der Werkstatt stehen in der Stimme der Werkstatt („wir“), nicht als Zitat der Leiterin. Begleittexte höchstens zwei Zeilen. Was erklärt, steht auf der Unterseite. Konzept und Herleitung: `konzept/STARTSEITE-BAUHAUS.md`.

**Grundformen** (`.principle__forms`, nur Startseite): drei Fotos des Manufakturprogramms im Format 3:2, je 4 Spalten, gleiches Licht und gleicher Grund, Beschriftung nur mit dem Namen (Zitat klein, Display). Darunter die Farbskala mit denselben Spaltenkanten (je 2 Spalten). Mobil untereinander. Daten: `grundformen` in `src/data/manufaktur.ts`.

## 6. Komponenten

### Abschnittskopf (`.sec-head` auf der Startseite, `.chapter__head` auf Unterseiten)
Ein Muster für die ganze Website:
- H2 in Spalte 1–8, Begleittext (Textstil Begleittext, `--ink-2`, max. 44ch) oder Link in Spalte 9–12.
- Unten bündig (`align-items: end`), **Haarlinie darunter** (1 px, `currentColor`, 20 px Abstand), danach `--head-gap` zum Inhalt. Nie eine Linie über der Überschrift.
- Folgt direkt eine Liste mit eigener oberer Linie (`.datelist`, `.texts`, `.pubs`), entfällt deren Linie, die Kopflinie genügt.
- Mobil stehen H2 und Begleittext untereinander.
- Auf Anker: Linie und Schrift erben über `.on-anker`.

### Anfrage-Leiste (`.anfrage-band`, Partial `partials/anfrage-band.html`)
- Ruhiger Abschluss jeder Unterseite außer Besuch (dort ist das Formular) und 404, direkt vor dem Footer. Fläche `--ground-2`, nie Anker.
- Ein kurzer Satz in Text-Schrift (Spalte 1–7), rechts (9–12) Button „Anfrage schreiben“ → `besuch.html#anfrage` und daneben die Telefonnummer +49 201 30 50 80. Darunter optional eine Hinweiszeile (Begleittext, `--ink-2`), z. B. dass man ein Stück nennen kann.
- Einbindung: `<!-- @include anfrage-band {"text": "…", "query": "?stueck=…", "hinweis": "…"} -->`. `query` füllt das Feld „Stück“ im Formular vor, `hinweis` darf Links enthalten (einfache Anführungszeichen in Attributen).
- Das ältere `.cta-band` bleibt nur auf der Werkstatt, bis dort umgestellt ist.

### Seitenkopf (`.page-hero`)
Vier Typen, jede Unterseite wählt einen (Modifier-Klasse). Gemeinsam: Abstand oben `--head` + `clamp(48px, 6vw, 96px)`, Zeilenabstand `--head-gap`, Lede im Textstil Zitat klein, Bildunterschrift an fester Stelle direkt unter dem Bild in `--ink-2`.
- **Name** (`--name`, hell): Titel in Seitennamen-Größe über die ganze Breite, Lede rechts (Spalte 6–12), darunter optional ein randloses Bild in Höhe `--hero-img` = `min(72vh, 760px)`. Young-Jae Lee, Aktuelles (ohne Bild), 404.
- **Meta** (`--meta`, hell): Titel oben, links Meta-Spalte (Spalte 1–4) mit Lede, rechts (Spalte 5–12) ein großes Bild, das an den rechten Rand läuft, oder eine Faktentafel (Besuch: Öffnungszeiten). Meisterstücke, Besuch.
- **Fläche** (`--flaeche`, `--ground-2`): Titel links, Lede rechts, darunter vier Produktfotos 3:2 in einer Reihe, bündig auf einem Sockel (`.plinth`, `--ground-3`) mit Beschriftungen darunter (mobil 2 × 2 ohne Sockel). Manufaktur.
- **Anker** (`--anker`, dunkel): Titel links (Spalte 1–8), Lede rechts (9–12), randloses Panorama am Fuß (`--strip`). Werkstatt. Maximal eine Unterseite.
- Bild und Fläche grenzen ohne Zwischenraum aneinander, nur der Sockel und das Panorama laufen randlos.

### Expander (`.expander`, `src/components/Expander.astro`)
Die eine Aufklapp-Komponente der Seite. Kein `<details>`, keine eigenen Aufklapper pro Seite.
- Aufbau: `.expander > h3.expander__bar > button.expander__btn[aria-expanded][aria-controls]` und `.expander__panel > .expander__inner`. Plus dreht sich zum Minus, Höhe über `grid-template-rows` 0fr nach 1fr in 0,5 s, bei reduzierter Bewegung ohne Animation. Ohne JavaScript bleibt der Inhalt offen sichtbar. Ein Sprung auf einen `#id` im Inhalt öffnet den Expander.
- **Zeile** (`--row`): Jahr groß links, Teaser in der Mitte, Plus rechts, Haarlinie darunter. Jahresarchiv auf Aktuelles (Inhalt `.year__list`).
- **Lang** (`--lang`): großer Knopf über die ganze Breite (Display-Schrift, Linie oben). Offen bleibt die Leiste beim Scrollen unter Kopf und Sprungleiste stehen (`top: var(--head) + var(--subnav)`, bei ausgeblendetem Kopf `var(--subnav)`) und zeigt „Schließen“. Beim Schließen springt die Ansicht ruhig an den Knopf zurück. Young-Jae Lee: „Alle Ausstellungen seit 1980“ (Inhalt `.exh-archive`).
- Neue Aufklapper nutzen diese Komponente, nur der Inhalt ist seitenspezifisch.

### Link mit Pfeil (`.link-arrow`)
- Textstil Begleittext, Unterstrich 1 px, Pfeil als Maske `--arrow`.
- Hover: Linie zieht sich zurück, Pfeil rückt 4 px.
- Tippfläche ≥ 44 px über Padding mit negativem Rand, optisch unverändert.

### Buttons
- **`.button`:** gefüllt in `--ink`, 1 px Rand, 0 Radius. Hover: transparent mit `--ink`-Schrift.
- **Ghost:** transparent mit 1 px Rand.
- **Anfrage-Buttons:** immer die Telefonnummer daneben.

### Zwei Linien (`.lines`)
- Abzweig zu zwei Zielen: großer Display-Name, eine Zeile Beschreibung, Pfeil.
- Hover und Fokus: Fläche `--ink`, Schrift `--ground`.

### Kachel (`.now--dark .now__item`, verallgemeinert: Kachel)
- Bild 4:3, darunter Datum (Daten-Stil), Titel (Kacheltitel), Ort (klein, `--ink-2`).
- Drei Spalten auf Desktop, eine Spalte mobil.
- Ganze Kachel ist ein Link. Hover: Bild 1,035 skaliert über 1,4 s.

### Werkangaben (`.facts`)
Liste mit Spaltenlabel und Haarlinien. Ganz unten der Anfrage-Link „Zu diesem Stück anfragen“ als mailto mit Werkname im Betreff.

### Zitat und Lede
- Display oder Text in der Größe Lede.
- Quelle immer mit Namen, im Daten-Stil darunter.

### Bildunterschrift und Nachweis
- `figcaption`: Textstil Meta, `--ink-2`, 10 px unter dem Bild.
- Nachweis über einem Foto nur auf einer Fläche im Grundton, nie als weiße Schrift direkt auf dem Bild.

### Navigation
- **Desktop:** einzeilig, Link 44 px hoch (Padding 11 px, Linie 8 px über dem Rand). Aktiv: 2 px Linie in `--accent`. Hover: 1 px Linie, die sich aufzieht.
- **Mobil:** Vollbild-Liste in Display-Schrift mit einer Zeile Beschreibung pro Punkt. Darunter der Kontaktblock: Telefon, Zeiten, E-Mail, DE/EN.

### Unternavigation (`.subnav`)
Sticky unter dem Header, mobil seitlich scrollbar mit Randausblendung. Der aktive Eintrag wird markiert.

### Footer
- Anker mit Logo-Konstruktion (`sig-logo`) in Spalte 1–4 und vier Infospalten im Textstil Begleittext.
- Riesige Wortmarke „Margaretenhöhe“, unten an der Seitenkante beschnitten (gewollt).

## 7. Signaturen (generative Elemente)
**Gemeinsame Regeln:**
- **Modul:** `js/sig-<name>.js` exportiert `default init(el)`, Styles in `css/sig-<name>.css`. Gemeinsame Daten und Zufall kommen aus `js/keramik.js`.
- **Rendern:** Canvas mit `devicePixelRatio` (≤ 2) oder SVG, Licht von links oben, weiche Schatten. Der Zufall ist reproduzierbar.
- **Leistung:**
  - Nur zeichnen, wenn sichtbar (IntersectionObserver).
  - Kein Neuzeichnen großer Flächen bei jeder Zeigerbewegung.
  - Teure Teile vorrendern (Sprites), danach nur zusammensetzen.
  - Ziel: 60 fps auf einem MacBook mit Retina-Display.
- **Ohne JS** sinnvoller Inhalt. Bei `prefers-reduced-motion` sofort der ruhige Endzustand.

**Die Signaturen:**

| Name | Abschnitt | Inhalt |
|---|---|---|
| `kosmos` | Ausstellung (`main.js`) | 99 Schalen im Ring um eine leere Mitte, die Schalen weichen dem Zeiger aus |
| `orte` | nach Meisterstücke | Ausstellungsorte als Bildraster, Orts-Name groß über einem gedämpften Foto |
| `feuer` | Feuer | Eine Schale, umschaltbar zwischen oxidierendem und reduzierendem Brand |
| `farbskala` | Bauhaus (Startseite) | Glasur-Testkacheln mit gemessenen Farben |
| `logo` | Footer | Logo als Konstruktionszeichnung, Hilfslinien verschwinden am Ende |

## 8. Bewegung
- **Einblenden:** Text `fade` (18 px, 1,2 s). Überschriften `words` (Maske, 1,3 s, gestaffelt um 45 ms). Bilder `img` (Abdeckung fährt nach oben, Bild von 1,12 auf 1 skaliert). Kurve `--ease`.
- **Dauer-Tokens** (`global.css`, `:root`): `--dur-hover` 0,5 s (Hover, Farben, Pfeile), `--dur-zoom` 1,2 s (Bild-Zoom und Farbskala bei Hover), `--dur-reveal` 1,2 s (Einblenden von Text), `--dur-open` 0,5 s (Aufklappen; bei reduzierter Bewegung 0). Ausnahmen mit Absicht: Punkte füllen 0,45 s (`--ease-pop`), Einblenden von Wörtern 1,3 s und Bildern 1,6/2,4 s (siehe oben).
- **Sicherung ohne Skript:** `main.ts` setzt `js-ready`, sobald die Einblendung scharf ist. Bis dahin macht eine CSS-Animation alle `[data-reveal]`-Elemente nach 3 s sichtbar (Skriptfehler, Blocker, sehr langsames Netz). Das Startbild im Hero hat keine Abdeckung, nur eine kurze Opazitäts-Einblendung; die Hero-Überschrift wird beim Bauen in Wort-Spans zerlegt (`Woerter.astro`).
- **Hover:** 0,5 s (`--dur-hover`). Es werden nur `transform`, `opacity`, Farben und `flex-grow` animiert, nie `width` oder `height`.
- **Kein Scroll-Hijacking.** Sticky mit Scroll-Steuerung ist erlaubt, wenn die Scrollgeschwindigkeit unverändert bleibt.
- **Punkte füllen sich, wenn die Linie sie erreicht.** Gemeinsame Animation für Lebensweg und Chronik: Ring hohl, Füllung (`scale` 0 auf 1, 0,45 s, `--ease-pop` mit leichtem Überziehen) über die Klasse `.is-on`. Rückwärts leert sich der Punkt wieder. Reduzierte Bewegung: sofort gefüllt.
- **Lebensweg** (`.journey`, Startseite): Ohne Sticky. Linie und Punkte füllen sich mit dem Scrollfortschritt von links nach rechts (voll, wenn der Strahl ~35 % von oben erreicht), reversibel. Darunter der Link „Zum ganzen Werdegang“.
- **Feuer** (`.sticky-bild--feuer`): Der Text steht oben im Bild fest (sticky, Abstand `--head` + `--head-gap`), das Bild läuft darunter durch, am Ende zieht der Text mit. Der Textbereich ist nur so hoch wie der Text, er haftet also bis unten ans Bild. 160 svh (mobil 150 svh). Das Porträt der Startseite steht dagegen als Werkbild ruhig im Raster (Bildgröße nach Rolle, Abschnitt 4).
- **Feuer:** Abschnitt 160 svh (mobil 150 svh), Bild füllt ihn. Der weiße Text steht oben links (Rand `--m`, oben `--head` + `--head-gap`) und bleibt stehen, bis das Bild durch ist. Abdunklung oben links für Kontrast ≥ 4,5:1. Zur Chronik folgt der volle Abschnittsabstand.
- **Chronik-Punkte** (`.chronicle`): Die Linie zeichnet sich scrollgebunden, jeder Punkt füllt sich beim Erreichen, die Jahreszahl wechselt von `--ink-2` zu `--ink`. Mobil (Wischleiste) füllen sich die Punkte, sobald ihre Karte in die Leiste ragt, und nur, wenn die Leiste sichtbar ist.

## 9. Barrierefreiheit (Mindeststandard)
- Kontrast ≥ 4,5:1 für Text, ≥ 3:1 für Bedienelemente.
- Tippflächen ≥ 44 px.
- Sichtbarer Fokus mit 2 px Outline: Tokens `--focus-ring` (2 px) und `--focus-offset` (4 px außen). Innen liegende Rahmen in Wischreihen und Kacheln (`-2px`, `-4px`) und der Feldfokus im Formular (Offset 2 px, Akzent) sind begründete Ausnahmen.
- Offenes Mobilmenü: Seiteninhalt, Fußzeile und Sprunglink sind `inert`, der Fokus bleibt im Menü; Escape schließt und gibt den Fokus zurück.
- Keine waagrechte Scrollleiste ab 360 px. Seitentitel nutzen `--t-title` (Minimum 2,5 rem), damit lange Komposita passen.
- Skip-Link, `aria-current` in der Navigation.
- Canvas mit `role="img"` und Beschreibung.
- Dekorative Grafik mit `aria-hidden`.

## 10. Bilder (Plan)
- **Fotoecke (Inventarisierung):**
  - gleicher heller warmgrauer Hintergrund, Licht von links, Format 4:5
  - lange Kante ≥ 2.400 px
  - pro Stück: vorne, innen von oben, Glasur-Detail, Fuß
  - Verwendung: Meisterstücke, Werkseiten, Kacheln
- **Galerie- und Ausstellungsfotos:** Raumansichten, Einzelwerke im Museum. Verwendung: Aktuell, Orte, große Bildstrecken.
- **KI-Bilder** sind nur Platzhalter und werden ersetzt.

## 11. Komponenten-Inventar (Grundlage für den Astro-Umbau)

Jede wiederverwendbare Komponente hat einen künftigen Astro-Namen (`src/components/<Name>.astro`), einen Zweck, ihre Textstile (Abschnitt 3) und feste Varianten. Neue Seiten setzen sich nur aus diesen Komponenten zusammen. Was fehlt, wird zuerst hier ergänzt. Fundstellen verweisen auf V3 (`src/v3/`, CSS in `site/v3/`). „Hell“ = `--ground`, „Fläche“ = `--ground-2` (`.on-flaeche`), „Anker“ = `--coal` (`.on-anker`). Kurzformen der Textstile: Mega, Seitentitel (display), Abschnitt (h2), Aussage (statement), Lede, Titel (h3), Jahreszahl (numeral), Zitat klein (quote), Fließtext (body), Begleittext (small), Meta.

### Gerüst und Navigation

| Komponente | Zweck | Textstile | Varianten | Fundstellen |
|---|---|---|---|---|
| `Header` | Kopfzeile mit Wortmarke, Navigation, Sprachumschalter, Mobilmenü | Begleittext (Links, Sprache), Aussage (Menünamen mobil), Titel (Telefon mobil) | hell, auf Bild/Anker invertiert; Mobil als Vollbildmenü | `partials/header.html`, `styles.css` (`.nav`, `.lang`, `.menu-toggle`) |
| `Footer` | Abschluss jeder Seite: Logo-Konstruktion, vier Infospalten, Wortmarke | Meta (Spaltenlabel), Begleittext (Spalten), Wortmarke | nur Anker | `partials/footer.html`, `styles.css` (`.footer*`), `css/sig-logo.css` |
| `SubNav` | Sprungleiste unter dem Header, sticky, mobil seitlich scrollbar | Begleittext | hell | `css/pages.css` (`.subnav`), auf Meisterstücke, Manufaktur, Young-Jae Lee, Werkstatt, Aktuelles |
| `PageHero` | Seitenkopf, einer der vier Typen | Seitentitel oder Mega (Name), Zitat klein (Lede), Meta (Bildunterschrift) | `name`, `meta`, `flaeche`, `anker` (Abschnitt 6, Seitenkopf) | `css/pages.css` (`.page-hero*`), alle Unterseiten |

### Abschnitte und Köpfe

| Komponente | Zweck | Textstile | Varianten | Fundstellen |
|---|---|---|---|---|
| `SectionHead` | Abschnittskopf: Überschrift links, Begleittext oder Link rechts, Haarlinie darunter | Abschnitt (H2), Begleittext (Aside) | hell, Fläche, Anker | `.sec-head` (`styles.css`, Startseite), `.chapter__head` (`css/pages.css`, Unterseiten): beides wird eine Komponente |
| `ChapterHead` | Kapitel einer Unterseite mit Einleitung (`.chapter__intro`) | Abschnitt, Begleittext | hell, Fläche, Anker | `css/pages.css` (`.chapter`), alle Unterseiten |
| `Statement` | Zitat oder Aussage groß, mit Quelle | Aussage oder Seitentitel (`pullquote`), Meta (Quelle) | hell, Fläche, Anker; `--bild` (`.zaesur`: Bild links, Satz rechts) | `.pullquote`, `.stance__quote`, `.zaesur`, `.catalog__quote`, `.mf-intro__rule`, `.artist__story`, `.rep__quote`, `.statement` |
| `Lede` | Einleitender Absatz einer Seite oder eines Abschnitts | Lede, Begleittext (Spalten) | hell | `.page-hero__lede` (bleibt Teil von `PageHero`); die Startseite kommt seit der Bauhaus-Fassung ohne Einleitungssatz aus |
| `Prose` | Fließtext mit Quelle, begrenzte Zeilenlänge | Fließtext, Meta (Quelle) | hell, Anker | `.legal__body` (Rechtsseiten, `src/components/Prose.astro`); `.stance__text` bleibt Seiten-CSS |

Statement kennt vier Typen nach Rolle, nicht nach Fundstelle: `aussage` (eigene Aussage der Werkstatt, Display, Statement-Größe), `zitat` (kurzes Fremdzitat mit Quelle, Text-Schnitt in Titelgröße), `zitat-lang` (langes Fremdzitat mit Quelle, Text-Schnitt in Zitatgröße, auch auf dunklem Grund oder Foto) und `gross` (Zäsur, höchstens eine je Seite). Die Quelle erbt ihre Farbe über `--ink-2` aus dem Umfeld.

### Einträge und Kacheln

| Komponente | Zweck | Textstile | Varianten | Fundstellen |
|---|---|---|---|---|
| `ExhibitionCard` | Ausstellung mit Bild, Datum, Titel, Ort, Fakten | Meta (Datum, Status), Titel, Begleittext (Ort, Text), Aussage (Spotlight) | `spotlight` (groß, Details offen), `kachel` (Startseite, Details klappen auf), `eintrag` (Seite Aktuelles, `gespiegelt` wechselnd); Daten aus `src/data/ausstellungen.ts` | `.aktuell__item` (Startseite, `css/sig-aktuell.css`), `.feature` (Aktuelles, `css/page-aktuelles.css`), `.now__item` (Vorversion Startseite) |
| `WorkCard` | Einzelwerk mit Bild, Name, Maßen, Anfrage-Link | Titel oder Zitat klein (Name), Meta (Jahr, Maße, Anfrage) | `katalog` (`breite`: standard, halb, breit mit Meta-Spalte links), `stimmung` (Bild ohne Werk); Daten aus `src/data/werke.ts`, Anfrage-Link über `anfrage-link.ts` | `.catalog__item` (Platzierung im Seitenraster: `page-meisterstuecke.css`) |
| `WorkTile` | Kachel der Werkschau auf der Startseite: Bild, Name, Jahr, Maße, ganz ein Link zum Katalog | Zitat (Name), Meta (Jahr, Maße) | ein Look; eigenes Markup (`li`), daher getrennt von `WorkCard`; Daten aus `src/data/werke.ts` | `.piece` (Platzierung: `global.css`, `.works__grid`) |
| `WareCard` | Geschirrserie mit Bild, Titel, Größenliste | Titel, Begleittext (Liste), Meta (Nummern) | Satz (`.set`, auch `breit`, `kontur`, nur Text); `WareGroup` bündelt die Sätze einer Warengruppe (Geschirr, Edition) | `.ware`, `.set` (`css/page-manufaktur.css`) |
| `FactsList` | Werkangaben und Fakten: Label links, Wert rechts, Haarlinien | Meta (Label, Versalien), Fließtext oder Begleittext (Wert) | `ort`, `raster`, `zeile-hell`, `zeile-anker` (je ein bestehender Look, siehe Komponente) | `.method__facts`, `.place__info`, `.aktuell__facts`, `.feature__facts` |
| `DateList` | Liste mit Jahr links, Text rechts | Jahreszahl, Begleittext, Meta | `liste` (nummeriert), `definition` (Stichwort links); hell, Fläche | `.datelist` (`css/pages.css`), Young-Jae Lee, Manufaktur, Werkstatt |
| `PubList` | Veröffentlichungen und Texte mit Autor, Titel, Auszug | Titel, Meta, Begleittext | `artikel` (Aktuelles), `literatur`, `essays` (Young-Jae Lee) | `.pubs`, `.pub`, `.texts` (`css/page-aktuelles.css`, `css/page-young-jae-lee.css`) |
| `PersonCard` | Mensch der Werkstatt mit Rolle und Text | Titel (Name), Meta (Rolle), Begleittext | Reihe in `.people` (Seite) | `.person` (`css/pages.css`, `css/page-werkstatt.css`) |
| `Steps` | Arbeitsschritte, nummeriert | Titel, Begleittext | `arbeitsschritte` (Bild bleibt stehen), `folge` (nummerierte Wegbeschreibung) | `.steps` (`css/page-meisterstuecke.css`), `.route__steps` (Anfahrt) |

### Aufklappen und Archive

| Komponente | Zweck | Textstile | Varianten | Fundstellen |
|---|---|---|---|---|
| `Expander` | Die eine Aufklapp-Komponente (Abschnitt 6) | Aussage oder Titel (Label), Begleittext (Teaser) | `row` (Jahresarchiv), `lang` (ganze Breite, Schließen-Leiste sticky); Custom Element `kwm-expander` | `src/components/Expander.astro`; Aktuelles, Young-Jae Lee |
| `YearArchive` | Jahresblock im Archiv mit Jahr und Einträgen | Aussage (Jahr), Body (Titel), Begleittext (Ort), Meta (Datum) | `auswahl` (ein `Expander` `row` je Jahr, Aktuelles), `gesamt` (ein `Expander` `lang` mit allen Jahren, Young-Jae Lee); Daten aus `src/data/archiv.ts` | `src/components/YearArchive.astro` (`.year__list`, `.exh-year`) |
| `Timeline` | Lebensweg der Künstlerin, Jahr, Ort, Satz; füllt sich beim Scrollen (Abschnitt 8) | Meta (Jahr), Titel (Ort), Begleittext | hell; Daten aus `src/data/lebensweg.ts` | `src/components/Timeline.astro` (`.journey`, Verhalten in `src/scripts/main.ts`) |
| `Chronicle` | Hundert Jahre Werkstatt, Jahre ziehen vorbei, Punkte füllen sich beim Erreichen der Linie | Aussage (Jahr), Titel, Begleittext, Zitat klein (Lede) | Fläche; `kurz` (Startseite: nur Einträge mit `startseite`, nur Jahr und Titel), Daten aus `src/data/chronik.ts` | `src/components/Chronicle.astro` (`.chronicle`, Verhalten in `src/scripts/main.ts`) |
| `PlaceGrid` | Ausstellungsorte als Bildraster mit Detail | Abschnitt (XL), Aussage (M), Titel, Meta, Begleittext | Anker; Custom Element `kwm-places`, Daten aus `src/data/orte.ts` (Zahlen pro Ort berechnet) | `src/components/PlaceGrid.astro` |

### Formulare und Hinweise

| Komponente | Zweck | Textstile | Varianten | Fundstellen |
|---|---|---|---|---|
| `InquiryBand` | Ruhiger Abschluss mit Satz, Button und Telefon | Titel (Satz), Begleittext (Hinweis) | nur Fläche | `partials/anfrage-band.html`, `css/pages.css` (`.anfrage-band`) |
| `InquiryForm` | Anfrageformular mit Fehlern, Bestätigung, Datenschutzhinweis | Fließtext (Felder), Meta (Label), Begleittext (Fehler, Hinweis), Titel (Bestätigung) | hell; mit `?stueck=` vorbelegt | `partials/anfrage-form.html`, `css/sig-anfrage.css`, `besuch.html` |
| `Notice` | Hinweis- oder Platzhalterkasten | Titel, Begleittext | hell, Fläche | `.legal__notice` (`css/page-text.css`), Rechtsseiten |
| `LinkArrow` | Link mit Pfeil und 44-px-Tippfläche | Begleittext | hell, Anker | `.link-arrow`, 73 Stellen |
| `Button` | Primär gefüllt, Ghost | Begleittext | gefüllt, Ghost | `.button` (`styles.css`) |
| `InfoBlock` | Seitenspezifische Linkblöcke (Zahlung, Anfahrt, 404) | Begleittext, Titel | hell | `.pay__list`, `.route`, `.not-found__links` (`css/page-besuch.css`, `css/pages.css`) |

### Bild und Signatur

| Komponente | Zweck | Textstile | Varianten | Fundstellen |
|---|---|---|---|---|
| `Figure` | Bild mit Bildunterschrift und Nachweis | Meta | 4:3, 3:2, 4:5, Panorama randlos | `figcaption` überall |
| `Plinth` | Geschirrreihe auf Sockel mit Beschriftung | Meta | Fläche | `.plinth`, `.shelf` (`css/pages.css`, Manufaktur) |
| `Signature` (je Name) | Generative Grafik (Abschnitt 7): `Orte`, `Feuer`, `Farbskala`, `Logo`, `StickyBild`, `Aktuell`, `Anfrage` | wie die Komponente, in der sie steht | keine | `css/sig-*.css`, `js/sig-*.js` |
| `Hours` | Öffnungszeiten groß im Kopf | Abschnitt (Zeit), Titel (kleine Zeit), Begleittext (Tag, Hinweis), Zitat klein (Adresse) | hell | `.visit-hours` (`css/page-besuch.css`) |

### Regeln für den Umbau
- Eine Komponente trägt ihre Textstile selbst. Seiten setzen keine Schriftgrößen, Schriften oder Zeilenhöhen.
- Varianten laufen über Props (`variant="hell | flaeche | anker"`), nicht über Seiten-CSS. Anker setzen ihre lokalen Tokens (Abschnitt 5).
- Seitenspezifisches CSS (`css/page-*.css`) entfällt, sobald die Komponenten dieselbe Optik tragen. Was bleibt, ist nur Anordnung im 12-Spalten-Raster.
- Inhalte kommen aus Sanity (nur freigegebene Felder), die Komponente kennt keine Preise und keine Lagerorte.
