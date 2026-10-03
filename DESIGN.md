# DESIGN.md: Designsystem der KWM-Website (V2)

Stand: 02.10.2026. Verbindlich für alle Seiten und Elemente in `src/v2/` und `site/v2/` sowie für den späteren Umbau in Astro-Komponenten. Neue Elemente setzen sich aus den Bausteinen unten zusammen. Wer etwas Neues braucht, ergänzt es zuerst hier.

## 1. Haltung
- **Ausstellungskatalog, kein Shop.** Das Objekt führt, die Oberfläche tritt zurück.
- **Hell und ruhig, dazu klare dunkle Anker.** Kontrast entsteht durch Fläche (hell, Fläche, Anker), nicht durch Farbe.
- **Farbe kommt nur aus dem Material.** Glasuren und Fotos tragen die Farbe, die Oberfläche ist schwarz-weiß mit genau einem Akzent.
- **Wenig Bewegung, dafür gute.** Pro Bildschirm höchstens eine Signatur-Bewegung, alles andere ist leise.
- **Feste Inhaltsregel:** keine Preise, Inventarnummern, Verfügbarkeiten oder Versandangaben. Alles läuft „auf Anfrage“.

## 2. Farben (Tokens in `site/v2/styles.css`, `:root`)

| Token | Wert | Rolle |
|---|---|---|
| `--ground` | `#F8F7F4` | Papier, Standardgrund (Variante „Galerie“) |
| `--ground-2` | `#EDECE8` | Fläche: ruhige Zwischenabschnitte, Bühnenboden, Bildrahmen |
| `--ground-3` | `#E2E1DC` | Rahmen hinter Freistellern |
| `--ink` | `#161616` | Schrift, Linien, primäre Buttons |
| `--ink-2` | `#5C5B57` | Nebentext, Daten, Bildunterschriften (6,3:1 auf Papier) |
| `--hair` | `rgba(22,22,22,.14)` | Haarlinien zwischen Einträgen |
| `--coal` | `#121212` | Anker: dunkle Abschnitte, Footer |
| `--coal-2` | `#1D1D1C` | Flächen innerhalb eines Ankers (Kacheln, Bühne) |
| `--on-coal` | `#F2F1EE` | Schrift auf Anker |
| `--on-coal-2` | `#A3A29D` | Nebentext auf Anker (6,4:1) |
| `--accent` | `#4E7D6A` | Seladon, einziger Akzent: aktive Navigation, Auswahl, Markierung |
| `--accent-on-coal` | `#8DB5A3` | Akzent auf Anker |

**Glasurfarben** (`--glaze-*`, `GLAZES` in `js/keramik.js`) sind Inhalt und werden nie als Farbe der Oberfläche verwendet.

**Keine Braun- oder Beigeflächen.** Ton und Rohware erscheinen nur in Fotos und gerenderten Objekten (`CLAY` in `keramik.js`).

**Varianten zum Vergleich** (Entwurf-Panel): `data-grund="porzellan"` (kühler) und `data-grund="creme"` (alter Ton). Der Standard ist Galerie.

## 3. Typografie
- **Schriften:** Libre Caslon Display (Überschriften), Libre Caslon Text (Zitate, Lede), Jost 300–500 (Text, Navigation, Daten). Alle selbst gehostet in `site/v2/fonts/`.
- **Skala:**

| Rolle | Größe | Schrift |
|---|---|---|
| Seitenname (riesig) | `clamp(3.4rem, 12.4vw, 13rem)`, Zeilenhöhe 0.9 | Display |
| Seitentitel H1 (Einstieg Startseite) | `clamp(2.6rem, 4.7vw, 5.4rem)` | Display |
| Seitentitel Unterseite (`.page-hero__title`) | `clamp(3rem, 7vw, 7rem)`, Zeilenhöhe 0.95 | Display |
| Zitat groß (`--fs-statement`) | `clamp(2rem, 3.6vw, 3.6rem)`, Zeilenhöhe 1.06 | Display |
| Abschnitt H2 (`.h2`) | `clamp(2.3rem, 4.6vw, 4.6rem)`, Zeilenhöhe 1.02 | Display |
| Kachel-/Eintragstitel | `clamp(1.4rem, 2vw, 1.9rem)` | Display |
| Lede | `clamp(1.65rem, 2.9vw, 2.75rem)` | Text |
| Zitat klein | `clamp(1.25rem, 1.7vw, 1.6rem)` | Text |
| Fließtext | 17 px (mobil 16), Zeilenhöhe 1.55, max. 68ch | Jost |
| Klein | 15 px | Jost |
| Daten, Bildunterschrift | 13–13,5 px, `--ink-2`, `tabular-nums` bei Daten | Jost |
| Spaltenlabel | 12,5–13 px, Versalien, Sperrung .08em | Jost |

- **Spaltenlabel nur über Info-Spalten** (Footer, Werkangaben). **Nie als Kicker über einer Überschrift.**
- **Umbruch:** Überschriften `text-wrap: balance`, Absätze `pretty`. Namen mit Bindestrich (Young-Jae) brechen nicht um, dafür das geschützte Zeichen `&#8209;` oder `white-space: nowrap` verwenden.
- **Unterlängen-Maske** bei der Wort-Einblendung: `padding-bottom: 0.25em`, nie knapper.

## 4. Raster und Abstand
- **Raster:** 12 Spalten (`.grid`), Seitenrand `--m` = `clamp(16px, 2.8vw, 44px)`, Spaltenabstand `--g` = `clamp(12px, 1.6vw, 24px)`.
- **Abschnittsabstand:** `--section` = `clamp(80px, 10vw, 168px)` oben und unten. Abschnitte wählen keine eigenen Abstände, Ausnahmen gelten nur für Vollbild-Signaturen.
- **Kopf zu Inhalt:** `--head-gap` = `clamp(32px, 4vw, 56px)`. Gilt für Abschnittsköpfe und für den Seitenkopf zum Bild.
- **Bildformate:** Kachel 4:3, Werk 3:2, Porträt 4:5, Panorama frei. In einer Reihe immer dasselbe Format.

## 5. Abschnittstypen und Rhythmus

| Typ | Grund | Verwendung |
|---|---|---|
| Hell | `--ground` | Standard |
| Fläche | `--ground-2` (`.on-flaeche`) | ruhige Zwischenstation: Chronik, Bühnenboden |
| Anker | `--coal` (Schrift `--on-coal`) | Einstieg (Variante), Seitenkopf der Werkstatt, Aktuell, Orte, Feuer, Footer |

- **Rhythmus:** nie zwei Anker direkt hintereinander. Ungefähr alle zwei bis drei Bildschirme ein Anker, damit die helle Seite Halt hat.
- **Anker setzen lokal** `--ink-2: var(--on-coal-2)`, `--hair: rgba(236,234,227,.22)`, `--cover: var(--coal)` und eigene `::selection`.

**Unterseiten (Reihenfolge):** Seitenkopf (einer der vier Kopf-Typen, siehe Seitenkopf) → Einleitung oder Unternavigation (hell, bei Bedarf Fläche) → Kapitel (hell, mindestens ein Kapitel oder eine Zäsur als Fläche) → Abschlussband mit Anfrage (Fläche, nie Anker, weil der Footer folgt) → Footer (Anker).
- **Nicht jede Seite beginnt dunkel.** Höchstens eine Unterseite hat einen dunklen Kopf (Werkstatt), nie zwei in der Navigation direkt nebeneinander.
- **Auf langen Seiten eine Zäsur** alle zwei bis drei Bildschirme: Bildband, Zitat auf Fläche oder Bild mit Satz. Zitat-Zäsur: `.pullquote` (Fläche, Display-Satz, Quelle). Bild-Zäsur: `.zaesur` (Fläche, Bild links, Satz rechts).
- **Einzelwerk mit Meta-Spalte:** ein einzelnes Bild in einem Kapitel steht in Spalte 4–12, Name, Maße und Anfrage in Spalte 1–3 an derselben Oberkante (`.catalog__item--wide`). Nie ein zentriertes Einzelbild.
- **Wechsel der Seite** bei Einträgen mit festem Aufbau (`.feature--mirror`), nie zwei gleiche Köpfe nacheinander in dieselbe Richtung ohne Grund.

| Seite | Kopf-Typ | Rhythmus | Charakter-Element |
|---|---|---|---|
| Meisterstücke | Meta | Kopf hell → Einleitung Fläche → Schalen hell → Kummen Fläche → Vasen hell → Arbeitsweise hell → Anfrage Fläche → Footer | Einzelwerke mit Werkangaben in der Meta-Spalte |
| Manufaktur | Fläche | Kopf Fläche → Einleitung hell → Geschirr hell → Zäsur Regal Fläche → Geschirr hell → Edition Fläche → Farben hell → Anfrage Fläche → Footer | Geschirrreihe auf Sockel im Kopf |
| Young-Jae Lee | Name | Kopf hell → Haltung hell → Erinnerung Fläche → Biografie, Texte hell → Bildband → Ausstellungen hell → Zitat Fläche → Sammlungen bis Publikationen hell → Anfrage Fläche → Footer | großer Name, Zitat „Immer sind es Schalen …“ |
| Werkstatt | Anker | Kopf dunkel → Arbeitsweise, Glasurfarben hell → Chronik Fläche → Team hell → Auszeichnungen Fläche → Zollverein hell → Anfrage Fläche → Footer | Panorama randlos |
| Aktuelles | Name (ohne Bild) | Kopf hell → Einträge hell, Wesel gespiegelt → Pop-up Fläche → Archiv, Veröffentlichungen hell → Anfrage Fläche → Footer | gespiegelter Eintrag |
| Besuch | Meta (mit Öffnungszeiten) | Kopf hell → Adresse mit Panorama hell → Anfahrt Fläche → Anfrage, Zahlung hell → Footer | Öffnungszeiten groß im Kopf |
| 404 | Name | Kopf hell → Footer | |

**Startseite (Reihenfolge):** Einstieg (Anker) → Lede mit „Zwei Linien“ (hell) → Aktuell (Anker) → Young-Jae Lee (hell) → Werkschau (hell) → Orte (Anker) → Meditation (hell) → Ausstellungs-Bühne (Fläche) → Feuer (Anker) → Manufaktur mit Farbskala (hell) → Chronik (Fläche) → Besuch (hell) → Footer (Anker).

## 6. Komponenten

### Abschnittskopf (`.x__head.grid`)
- H2 in Spalte 1–8, Begleittext oder Link in Spalte 9–12.
- Unten bündig (`align-items: end`), danach der Abstand Kopf zu Inhalt.
- Optional eine Linie in `currentColor` darunter (z. B. `.now__head`).

### Seitenkopf (`.page-hero`)
Vier Typen, jede Unterseite wählt einen (Modifier-Klasse). Gemeinsam: Abstand oben `--head` + `clamp(48px, 6vw, 96px)`, Zeilenabstand `--head-gap`, Lede in Text-Schrift 1,15–1,4 rem, Bildunterschrift an fester Stelle direkt unter dem Bild in `--ink-2`.
- **Name** (`--name`, hell): Titel in Seitennamen-Größe über die ganze Breite, Lede rechts (Spalte 6–12), darunter optional ein randloses Bild in Höhe `--hero-img` = `min(72vh, 760px)`. Young-Jae Lee, Aktuelles (ohne Bild), 404.
- **Meta** (`--meta`, hell): Titel oben, links Meta-Spalte (Spalte 1–4) mit Lede, rechts (Spalte 5–12) ein großes Bild, das an den rechten Rand läuft, oder eine Faktentafel (Besuch: Öffnungszeiten). Meisterstücke, Besuch.
- **Fläche** (`--flaeche`, `--ground-2`): Titel links, Lede rechts, darunter vier Produktfotos 3:2 in einer Reihe, bündig auf einem Sockel (`.plinth`, `--ground-3`) mit Beschriftungen darunter (mobil 2 × 2 ohne Sockel). Manufaktur.
- **Anker** (`--anker`, dunkel): Titel links (Spalte 1–8), Lede rechts (9–12), randloses Panorama am Fuß (`--strip`). Werkstatt. Maximal eine Unterseite.
- Bild und Fläche grenzen ohne Zwischenraum aneinander, nur der Sockel und das Panorama laufen randlos.

### Link mit Pfeil (`.link-arrow`)
- 15 px, Unterstrich 1 px, Pfeil als Maske `--arrow`.
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

### Werkschau (`.rail`)
- Waagerechte Leiste, Bild 3:2, Name im Display-Stil, Werkangaben klein.
- Fortschritt als Haarlinie.
- Hinweis „Ziehen oder scrollen“ bei Maus, „Wischen“ bei Touch.

### Werkangaben (`.facts`)
Liste mit Spaltenlabel und Haarlinien. Ganz unten der Anfrage-Link „Zu diesem Stück anfragen“ als mailto mit Werkname im Betreff.

### Zitat und Lede
- Display oder Text in der Größe Lede.
- Quelle immer mit Namen, im Daten-Stil darunter.

### Bildunterschrift und Nachweis
- `figcaption`: 12,5–13 px, `--ink-2`, 10 px unter dem Bild.
- Nachweis über einem Foto nur auf einer Fläche im Grundton, nie als weiße Schrift direkt auf dem Bild.

### Navigation
- **Desktop:** einzeilig, Link 44 px hoch (Padding 11 px, Linie 8 px über dem Rand). Aktiv: 2 px Linie in `--accent`. Hover: 1 px Linie, die sich aufzieht.
- **Mobil:** Vollbild-Liste in Display-Schrift mit einer Zeile Beschreibung pro Punkt. Darunter der Kontaktblock: Telefon, Zeiten, E-Mail, DE/EN.

### Unternavigation (`.subnav`)
Sticky unter dem Header, mobil seitlich scrollbar mit Randausblendung. Der aktive Eintrag wird markiert.

### Footer
- Anker mit Logo-Konstruktion (`sig-logo`) in Spalte 1–4 und vier Infospalten in 16,5 px.
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
- **Varianten** über `data-variant="schlüssel:wert"`, das Entwurf-Panel blendet sie ein und aus.

**Die Signaturen:**

| Name | Abschnitt | Inhalt |
|---|---|---|
| `kosmos` | Ausstellung (`main.js`) | 99 Schalen im Ring um eine leere Mitte, die Schalen weichen dem Zeiger aus |
| `buehne` | Ausstellung | Dieselben Schalen ordnen sich je laufender Ausstellung neu an |
| `orte` | nach der Werkschau | Ausstellungsorte als Bildraster, Orts-Name groß über einem gedämpften Foto |
| `feuer` | Feuer | Eine Schale, umschaltbar zwischen oxidierendem und reduzierendem Brand |
| `farbskala` | Manufaktur | Glasur-Testkacheln mit gemessenen Farben |
| `logo` | Footer | Logo als Konstruktionszeichnung, Hilfslinien verschwinden am Ende |
| `profil`, `drehen` | Varianten, standardmäßig aus | Profilzeichnung im Einstieg, Szene Drehen und Abdrehen |

## 8. Bewegung
- **Einblenden:** Text `fade` (18 px, 1,2 s). Überschriften `words` (Maske, 1,3 s, gestaffelt um 45 ms). Bilder `img` (Abdeckung fährt nach oben, Bild von 1,12 auf 1 skaliert). Kurve `--ease`.
- **Hover:** 0,45–0,6 s. Es werden nur `transform`, `opacity`, Farben und `flex-grow` animiert, nie `width` oder `height`.
- **Kein Scroll-Hijacking.** Sticky mit Scroll-Steuerung ist erlaubt, wenn die Scrollgeschwindigkeit unverändert bleibt.

## 9. Barrierefreiheit (Mindeststandard)
- Kontrast ≥ 4,5:1 für Text, ≥ 3:1 für Bedienelemente.
- Tippflächen ≥ 44 px.
- Sichtbarer Fokus mit 2 px Outline.
- Skip-Link, `aria-current` in der Navigation.
- Canvas mit `role="img"` und Beschreibung.
- Dekorative Grafik mit `aria-hidden`.

## 10. Bilder (Plan)
- **Fotoecke (Inventarisierung):**
  - gleicher heller warmgrauer Hintergrund, Licht von links, Format 4:5
  - lange Kante ≥ 2.400 px
  - pro Stück: vorne, innen von oben, Glasur-Detail, Fuß
  - Verwendung: Werkschau, Werkseiten, Kacheln
- **Galerie- und Ausstellungsfotos:** Raumansichten, Einzelwerke im Museum. Verwendung: Aktuell, Orte, Bühne, große Bildstrecken.
- **KI-Bilder** sind nur Platzhalter und werden ersetzt.
