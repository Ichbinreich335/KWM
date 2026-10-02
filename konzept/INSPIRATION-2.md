# Inspiration 2: Arkitektkontoret Vest, Jonite, Provider Studio

Stand: 02.10.2026. Ergänzt `INSPIRATION-RHYTHMUS.md` (Raster, Rhythmus, Tabellen), wiederholt es nicht. Hier geht es um **Bewegung und Details**, die die drei Lieblingsseiten des Admins tragen, und darum, was davon zu KWM passt (ruhiger Ausstellungskatalog, heller Grund, schwarze Anker, höchstens eine Signatur-Bewegung pro Bildschirm, siehe DESIGN.md Abschnitt 1).

Material: `.shots/inspo2/<slug>/` mit `slug` = `akv`, `jonite`, `provider`. Je Seite `full-1440.png` (Vollseite), `fold-1440.png`, `fold-390.png`, `seq-NNN.png` (Viewport-Folge im Abstand 450 px), `anim-*-NN.png` (Bildfolgen), `video/*.webm` (Seitendurchlauf per Mausrad). Die Techniken stammen aus dem ausgelieferten Quelltext (Scripts heruntergeladen und gelesen), nicht geraten. Keine Seite war blockiert; Mobil-Menü: AKV und Provider erfasst, bei Jonite verdeckte das Cookie-Banner den Menü-Klick (`jonite/menu-390.png` zeigt nur den Fold mit Banner).

Gemeinsamer Nenner aller drei: **Lenis oder nativer Scroll, GSAP (+ ScrollTrigger), Seitenwechsel per Barba bzw. Eigenbau, Einblenden nur mit Opazität und wenigen Pixeln Weg, nie mit großen Gesten.** Das passt zu KWM.

---

## 1. Arkitektkontoret Vest (arkitektkontoretvest.no)

Screenshots: `akv/full-1440.png` (Achtung: Startseite hängt Projekte endlos an, die Vollseite zeigt Duplikate), `akv/fold-1440.png`, `akv/fold-390.png`, `akv/menu-390.png`, `akv/projects-list-1440.png`, `akv/project-detail.png`, `akv/anim-sticky-detail-00..09.png`, `akv/anim-pagetransition-0..3.png`, `akv/hover-project.png`, Video `akv/video/`.

### Rhythmus und Raster
- Startseite = **eine endlose Folge von Projekten, sonst nichts.** Kein Hero, kein Text. Jede Zeile ist ein 12-Spalten-Grid (`grid-cols-12`, Gutter 16 px): Bild in 5 (oder 7) Spalten, daneben der Name klein, grau, mit Jahr. Das Bild wechselt zufällig Seite (links/rechts) und Größe, der Name sitzt immer **neben** dem Bild, vertikal zentriert. Dadurch ein ruhiger Zickzack mit sehr viel Weißraum.
- Kopfzeile fest: Wortmarke links (Versalien), „VEST“ auf Spalte 7, Navigation rechts. Unten links ein kleines Zeichen (gezeichneter Baum), Mitte „+ Alle prosjekter“. Sonst nichts.
- Typo: eine Grotesk (Bastardo), Namen 20 px, Daten und Navigation 16 px, **alles nur mit Deckkraft gestuft** (Name 50 % Schwarz, Hover 100 %). Keine zweite Schrift, keine Fettung.
- Farbe: Papier `#F4F1EC` (Start), Projektseite **wechselt den Seitenhintergrund** auf ein warmes Sand (ca. `#E3DCD1`). `html` hat `transition-colors duration-500`, die Farbe kommt je Projekt aus dem CMS. Bilder ohne Rahmen, ohne Schatten, nur Kante auf Papier.
- Projektseite: Bild links (ca. 58 % Breite), Titel **vertikal mittig** rechts, Metadaten (Typologi, Lokasjon, Status) als zwei Spalten **unten rechts** in Versalien-Label und Wert. Beim Scrollen gleiten weitere Bilder in voller Breite unter die feste Kopfzeile.
- Projektliste (Overlay „Alle“): Filter oben als Textzeile (Alle, Boligprosjekt, Interiør, …), Umschalter „Grid / Liste“ als Textlinks, 3 Spalten, je Bild darunter drei Zeilen (Jahr | Name, Ort · Typ, Foto-Nachweis) und ein Pfeil rechts. Das ist ein Katalogverzeichnis.

### Animationen: wie gebaut, passt für KWM?

| # | Detail | Wie gebaut | Passt für KWM |
|---|---|---|---|
| A1 | **Staffel-Einblenden je Zeile** (Bild, dann Name) | `IntersectionObserver` (threshold 0, einmalig, Klasse `is-played`), `gsap.fromTo(kinder, {x:-20, opacity:0}, {x:0, opacity:1, stagger:0.05})`, danach `clearProps`. Dauer GSAP-Standard 0,5 s, Kurve `power1.out`. | Ja, direkt. Für Werkreihen auf Meisterstücke und Aktuell: Bild und Bildunterschrift je 20 px von links, 0,05 s versetzt. Kosten: minimal (Opazität/Transform, einmalig). Mit `prefers-reduced-motion` aus. |
| A2 | **Seiteneinblenden beim Laden** | Body startet `opacity:0`, nach 1 s `gsap.to(body,{opacity:1,duration:1,ease:'power2.out'})`. Wortmarke `x:-20→0`, 1 s `power4.out`, Marke 2 mit `x:-100`, 1,2 s. | Teilweise. Nur die Wortmarke leise einschieben (20 px, 0,8 s), Seite selbst nicht ausblenden (Core Web Vitals, LCP). |
| A3 | **Seitenwechsel ohne Neuladen** | Barba.js 2.9.7 (Fade/Slide, `js-pt-slide` `left:-20→0`, 0,5 s `power2.out`). | Nein. KWM bleibt statisch ohne SSR; Barba bringt Zustandsfehler. Stattdessen **CSS View Transitions** (`@view-transition { navigation: auto; }`, Fade 200 ms), kostet 3 Zeilen und ist erreichbar, wenn der Browser es kann. |
| A4 | **Hintergrund wechselt je Seite** (Papier → Sand) | `transition-colors duration-500` auf `html`, Farbwert je Projekt. | Ja, gut: Auf der Werkseite einer Glasur eine sehr helle Tönung der Glasur als Seitengrund (z. B. Seladon `#E7EEEA`) statt Weiß. Nur Tints, nie Sättigung (DESIGN.md: keine Beigeflächen, Glasurtöne sind Inhalt). Mit der Regel „Farbe aus Material“ vereinbar, wenn es **nur** auf Werk-Detailseiten und nur 3–6 % Sättigung ist. Zurückhaltend einsetzen. |
| A5 | **Sticky Titel, Meta, Beschreibung** (Projektseite) | `ScrollTrigger.create({trigger, pin, start:'top 48px', endTrigger:'.js-pd-sticky-end', end:'bottom '+Höhe, pinSpacing:false, scrub:true})` für drei Blöcke gestapelt, nur ab 768 px. Die Textspalte bleibt stehen, die Bilder links laufen vorbei. | **Ja, einfacher mit CSS:** `position:sticky; top: Header+16px` in der Textspalte (`align-self:start`). Gleiche Wirkung, null JS. Ideal für eine Werkseite (Titel, Maße, Glasur stehen, Fotos laufen) und für Young-Jae Lee (Zitat bleibt, Bilder laufen). |
| A6 | **Namen 50 % → 100 % bei Hover** | `opacity-50 hover:opacity-100 transition-opacity duration-150` (Kurve `cubic-bezier(.4,0,.2,1)`). Kein Zoom, kein Overlay auf Bildern. | Ja, ohne Änderung. Entspricht ruhigem Katalog. Zusätzlich Fokus sichtbar halten. |
| A7 | **Endlos nachladen** (Klone der Liste am Seitenende) | `homeInfiniteScroll`: bei `innerHeight+pageYOffset >= body.offsetHeight-500` werden die Projekte geklont und angehängt. | Nein. Ein Katalog hat ein Ende, der Footer mit Anfrage ist dort wichtig. |
| A8 | **Kopfzeile verschwindet im Footer** | `IntersectionObserver` threshold .93 auf den Footer, Klasse `in-viewport`, GSAP `top:-48px`, 0,3 s `power1.out`. | Optional: Navigation blendet sich nur ab, wenn der Footer sichtbar ist. Gering. |
| A9 | **Mobilmenü** | Zwei Textlinks (Kontoret, Folkene) bleiben **immer sichtbar** in der Kopfzeile, rechts nur ein Strich als Menü-Zeichen. Bei zwei Hauptpunkten kein Burger nötig. | Prüfen: KWM hat mehr Punkte. Aber „die zwei wichtigsten sichtbar lassen (Besuch, Aktuell), Rest im Menü“ spart Taps. |

### Was AKV für KWM stärkt
- Das **Zickzack aus Bild und Beschriftung nebenan** statt Kachelraster, für die Startseite-Reihe „Meisterstücke“ (3 bis 5 Einträge). Format wechselt, Beschriftung folgt dem Bild.
- Das **Verzeichnis (Liste + Grid, Filter als Textzeile)** für Meisterstücke. Passt zu Regel 5 in INSPIRATION-RHYTHMUS.
- **Eine Schrift, Stufung allein über Deckkraft.** Ergänzt DESIGN.md Abschnitt 3: Nebentext mit `--ink-2` plus Hover auf `--ink`.

---

## 2. Jonite (jonite.com), Schwerpunkt „Made to matter“

Screenshots: `jonite/full-1440.png`, `jonite/fold-1440.png`, `jonite/fold-390.png`, `jonite/anim-madetomatter-00..29.png` (Folge mit 100 px Mausrad, 160 ms), `jonite/seq-000..033.png`, Video `jonite/video/page@….webm`. Wichtigste Einzelbilder: `anim-madetomatter-10.png` (Anfangszustand: Wörter und Bilder gestaffelt), `anim-madetomatter-15.png` (Endzustand: Bilderreihe oben, Überschrift darunter), `anim-madetomatter-20.png` (danach Textblock und dunkle Kachel).

### Rhythmus und Raster
- Abschnittsfolge Startseite: Hero (Tagline klein oben, Uhrzeit/Telefon in Mono, drei Bildkacheln: zwei schmal, eine breite, Pillen-Buttons im Bild) → Logo-Lauf (Kunden) → **Made to matter** → dunkle Kachel „Shop“ → Auszeichnung → Icon-Reihe → große Aussage (2 Zeilen, 48 px) → Produktkarten 4 Spalten → Material mit Farbmustern → Visualiser → Muster-Box → **olivgrauer Block** mit Projekten und Journal → Footer in demselben Olivgrau mit riesiger Wortmarke.
- Grid: `site-grid container` 12 Spalten, Seitenrand 24 px, Abstand zwischen Abschnitten 48 px (mobil) / 93 px (Desktop). **Jeder Abschnitt beginnt mit einer Haarlinie (`border-t border-black/20`) und einem Mini-Label** „● CLIENTS“: 8 bis 9 px **voller Punkt** plus Versalien in Mono (Silka Mono, 12 px, Sperrung). Das ist der wiederkehrende Kapitelkopf.
- Typo: PP Neue Montreal (Grotesk) für alles Große (Headline 150 px / Zeilenhöhe 100 %, Fließtext 20 bis 24 px), **Silka Mono in Versalien für Daten, Labels, Navigation, Fußzeile**. Genau zwei Schriften mit klarer Rollenteilung.
- Farbe: kühles Hellgrau `#E5E6E8` als Grund, Schwarz und ein dunkles Anthrazit für Kacheln, Olivgrau `#6B6762` für Schlussblock und Footer. Keine Akzentfarbe, Farbe kommt aus den Bildern.
- Bildbehandlung: gleiche Kantenradien 0, Bilder bündig im Raster, in den Bildern **weiße Pillen-Buttons** („Our projects ↗“) unten links. Sehr viel Parallax in den Bildern (siehe J2).
- Fixierte Leiste unten: links „REQUEST SAMPLES ↗  CONTACT US ↗“ in Mono, rechts schwarze Fläche „NEED HELP? CHAT ON WHATSAPP ↗“. Immer sichtbar.

### Made to matter: Aufbau und Ablauf (belegt aus `homepageMadeToMatter.js`)
**Was man sieht:** Beim Erreichen des Abschnitts stehen drei Wörter (Made | to | matter) und vier Bilder in unterschiedlichen Höhen verstreut. Sie fahren in 1,4 s in die Endordnung: oben eine Reihe aus vier Bildern in vier Breiten (27,8 %, 13 %, 32 %, 18 %), unten die Überschrift mit zwei Wörtern Abstand und rechts ein kleiner Text. Die Scroll-Bewegung wird dabei **kurz angehalten**.

**Wie gebaut:**
1. Der Endzustand ist das normale Layout (CSS). Beim Laden setzt Skript per GSAP-Timeline (pausiert, `duration 1,4`, `ease:'none'`) den **Anfangszustand** als Versatz je Element: Bild 1 y −265 px, Bild 2 +71 px, Bild 3 +485 px, Bild 4 −67 px; Wort 1 −327 px, Wort 2 0, Wort 3 −575 px; Bildzeile `paddingTop` 9 rem, Textblock `paddingBottom` 4 rem, Fließtext +3,75 rem. Die Timeline wird auf ihr Ende gespult (`time = duration`, Abschnitt ist per `opacity-0` bis `mtmReady` unsichtbar, Übergang 300 ms).
2. `ScrollTrigger.create({trigger: Abschnitt, start:'-20px top', end:'center center', once:true})`. Beim Auslösen: `gsap.to(timeline, {time:0, duration:1.4, ease:'figma-spring', onStart: lenis.stop(), onComplete: lenis.start()})`. Die Timeline läuft also **rückwärts auf den Nullzustand** mit einer **eigenen Feder-Kurve (`figma-spring`, CustomEase)**, und das Smooth-Scrolling (Lenis) ist währenddessen gesperrt, damit der Nutzer die Bewegung nicht verschiebt.
3. Mobil: eigene Timeline mit anderen Werten (Bild 1 −207 px, Wort 2 x +29 px/y −5 rem, …), gleiche Mechanik. Mit `prefers-reduced-motion` wird alles übersprungen und der Endzustand direkt gezeigt.
4. Zusätzlich liegt in **jedem** der vier Bilder ein Parallax (siehe J2), die Bilder bewegen sich also während des Einfahrens und danach beim Scrollen leicht gegen den Rahmen.

**Passt für KWM? Ja, in abgespeckter Form, aber nur einmal pro Seite.** Konkret:
- **Wo:** Startseite, Abschnitt „Manufaktur“ oder „Seit 1924“ als **Signatur-Bewegung** (zählt als die eine pro Bildschirm). Vier Fotos in vier Breiten (Hände beim Drehen, Glasurprobe, Ofen, fertige Schale), darunter H2 in Libre Caslon („Handwerk, das bleibt“ o. ä., Text offen).
- **Wie:** nur **Versatz in y** (kein Rotieren, kein Skalieren), Wege 40 bis 120 px statt 265 bis 575 px, Dauer 1,0 s, Kurve `cubic-bezier(.22,1,.36,1)` (Ease-out ohne Überschwingen) statt Feder. **Kein Anhalten des Scrollens**, das ist ein Risiko für Barrierefreiheit und Mobilgefühl. Der Ablauf wird per `IntersectionObserver` einmal ausgelöst und mit Web Animations oder CSS-Transition umgesetzt (`transform: translateY(var(--y))` → `0`, gestaffelt 0,06 s). Kein GSAP nötig.
- **Kosten:** vier Bilder, Transform-only, `will-change: transform` nur während der Animation. Vernachlässigbar. Pflicht: `prefers-reduced-motion: reduce` zeigt direkt den Endzustand, ohne JS ist der Endzustand das CSS-Layout (so ist es bei Jonite gebaut, gute Praxis).
- **Nicht übernehmen:** `lenis.stop()` (Scroll-Sperre), 150-px-Mammutschrift (für KWM Skala `Seitenname` aus DESIGN.md nutzen), Feder-Kurve mit Überschwingen (wirkt verspielt, nicht Ausstellung).

### Weitere Animationen und Details

| # | Detail | Wie gebaut | Passt für KWM |
|---|---|---|---|
| J1 | **Bild-Parallax in jedem Bildrahmen** (`parallax.js`) | Container `overflow:hidden`, Bild `scale(1,2)` (`(100+2*10)/100` = 1,2), `transform-origin: bottom`, `gsap.to(img,{yPercent:10, ease:'none', scrollTrigger:{trigger:Rahmen, start:'top bottom', end:'bottom top', scrub:true}})`. Bild erscheint per `opacity-0 → 1`, 300 ms. | Ja, dosiert: 6 % statt 10 %, nur auf **großen Bändern** (Hero der Unterseiten, Bildband Werkstatt), nicht auf Freistellern (Glasurfarben dürfen sich nicht verschieben). Technik reicht rein CSS: `animation-timeline: view()` (Chrome, Safari 26) mit `@supports`-Rückfall ohne Bewegung. Kosten gering; 1,2-Skalierung braucht Bildauflösung. |
| J2 | **Mini-Kapitelkopf**: Haarlinie + „● LABEL“ in Mono, rechts Kurztext in Mono, rechts außen Button | Reines CSS. `border-t border-black/20`, Punkt 8 px `bg-current rounded-full`, Mono 12 px Versalien. | **Ja, hoch.** Ersetzt KWM-Spaltenlabel und deckt „Kapitelnummer in Meta-Spalte“ (INSPIRATION-RHYTHMUS Regel 10) ab. Aber DESIGN.md verbietet Labels als Kicker über Überschriften. Daher nur als **Linie mit Label und Aktion in einer Zeile**, Überschrift folgt separat, oder Punkt + Zählung („01  Aktuell“) in der Linie. Vorher mit Admin klären. |
| J3 | **Uhrzeit Essen / Singapur live** in Mono | `Intl.DateTimeFormat` mit Zeitzone, `setInterval` 1 s. | Nur als Idee: „Werkstatt geöffnet / geschlossen“ als Zeile im Footer (aus Öffnungszeiten, ohne Live-Uhr). Ja, klein. |
| J4 | **Hero-Elemente fahren nacheinander ein** | GSAP-Timeline `figma-spring`: Boxen `height → 198`, 0,7 s, dann `flexGrow` 1,2 s versetzt, Überschrift `translateY → 0`; Seite wird in dieser Zeit angehalten. | Nein als Feder. Prinzip „Fläche wächst, dann Text folgt“ als sanftes `grid-template-rows`-Wachsen (0,6 s) nur wenn nötig. Nicht Priorität. |
| J5 | **Logo-Lauf** (Marquee) und Mono-Lauftext der Zertifizierungen | Endlosschleife per CSS/Swiper. | Nein für Logos. Als ruhiger Mono-Lauf von „Seit 1924 / Bauhaus-Linie / Essen“ im Footer ungeeignet: bewegt ständig, widerspricht „wenig Bewegung“. |
| J6 | **Auszeichnungsleiste oben, wegklickbar** | Fest, schwarz, mit Siegeln. | Nein. Nur der Gedanke einer **schmalen schwarzen Hinweiszeile** („Neu: Ausstellung bis 30.11.“) ist gut, das gibt es bereits als Anker. |
| J7 | **Feste Leiste unten** („Request samples“ / „Contact us“) | `position:fixed; bottom:0`, Mono, Haarlinie. | **Mobil ja:** feste Fußleiste „Besuch planen | Anfrage“ (Tippfläche 48 px). Desktop nein. |
| J8 | **Pillen-Buttons im Bild** („Our projects ↗“) | Weißer Hintergrund, Radius 999, 16 px Text, Pfeil. | Nein, wirkt wie Webshop. KWM-Buttons bleiben eckig oder Textlink mit Pfeil (DESIGN.md prüfen). |
| J9 | **Footer in der Farbe des letzten Blocks, Wortmarke in Hellton, riesig, mit Logo-Zeichen** | Olivgrau `#6B6762`, Wortmarke 75 % Breite. | KWM macht die beschnittene Wortmarke bereits (INSPIRATION-RHYTHMUS). Ergänzend: **Footer-Spalten mit Mono-Labeln** (PRODUCTS, INFORMATION …) wie in `seq-033.png`. |
| J10 | **Swiper-Kurve** `cubic-bezier(0.97, 0, 0.29, 1)` (Karussell) | Inline-Stil. | Für KWM nur dann, wenn es ein Karussell gibt (derzeit nicht). Kurve ist sehr „schnell hinein, weich aus“, merken. |

---

## 3. Provider Studio (provider.studio)

Screenshots: `provider/full-1440.png`, `provider/fold-1440.png`, `provider/seq-000..014.png`, `provider/anim-sticky-who-00..13.png`, `provider/anim-sticky-house-00..13.png`, `provider/anim-sticky-collab-00..12.png`, `provider/nav-floating-closed.png` / `nav-floating-open.png`, `provider/menu-390.png`, `provider/mobile-scrolled-390.png`, Video `provider/video/page@….webm`. (Eine Fold-390-Aufnahme liegt als `fold-390.png` vor.)

### Rhythmus und Raster
- Reihenfolge: Riesige Wortmarke über volle Breite (Grotesk Fett, ca. 140 px) → zweizeiliger Serif-Satz mit Kursiv-Akzent („…and *stay with them* long after they leave.“) und kleines Hauszeichen → zwei große Bilder nebeneinander mit je einer Info-Spalte → **Vollbild-Foto mit Text darin (sticky)** → Satz in 50 % rechts (Serif groß, Kursiv-Akzent) → vier Schritte als Bildreihe mit römischen Zahlen → Vollbild 2 (Provider House, sticky) → Profil mit Porträts → Journal als Karten (3 + 3, unterschiedliche Höhen) → Vollbild 3 (Kooperationen, Parallax) → Newsletter → Postkarte als Abschluss-Bild → Footer.
- **Wechsel hell / Foto / hell / Foto.** Zwischen den Vollbildern stehen 1 bis 2 Textabschnitte auf Papier, dadurch bleibt es nie zu laut. Genau der Rhythmus „Anker, hell, hell, Fläche, Anker“ aus INSPIRATION-RHYTHMUS, aber mit Fotos statt dunkler Fläche.
- Typo: **Isola** (Grotesk, fett 14 px) nur für Navigation, Labels und Links, **Italian Garamond** (Serif) für alle Sätze (Fließ-Aussagen 18 bis 40 px), **Kursiv als einziges Betonungsmittel** innerhalb des Satzes. Römische Zahlen (I., II.) in Serif vor den Schritten. Grund `#EBE6E0`, Schrift `#1F1F1F`, im Foto `#FFFFFF`.
- Links: gestrichelte Unterlinie (`border-bottom: 1px dotted`) bzw. Hintergrund-Verlauf `linear-gradient(90deg, #1f1f1f 50%, transparent 50%)` mit `background-size`-Übergang 0,3 s `ease-in` als Hover (Linie läuft von links nach rechts). Das ist `link-hover`.
- Karten: Bild oben, darunter Titel (Grotesk fett), Ort/Datum (Serif), 3 Zeilen Text; gleiche Bildformate je Reihe, versetzte Höhen zwischen Reihen.

### Der „Text im Bild, sticky“-Effekt (Hauptpunkt des Admins)
Belege: `provider/anim-sticky-who-04.png` (Text mittig im Bild, links Label, mittig Satz, rechts Link), `anim-sticky-who-08.png` (der Text hängt noch fest, während das Bild unten verschwindet und der nächste helle Abschnitt hereinkommt), `anim-sticky-house-05.png` (zweites Bild, Text bleibt in der Mitte).

**Aufbau (aus DOM/CSS gemessen):**
- `section.who-we-work-with`: `position:relative; overflow:clip; height:1200 px` (bei 900 px Viewport, also 1,33 Viewport-Höhen).
- Darin `.image-wrap` (`position:absolute; inset:0; height:100%`), `<img>` **höher als der Abschnitt** (1560 px, `object-fit:cover`, `position:absolute`) und `.overlay` (`rgba(0,0,0,.2)`).
- `.who-we-work-with__text`: **`position:sticky; top:0; height:100vh (900 px); z-index:2`**, Flex mit Label links (Grotesk fett, weiß), Satz mittig (Garamond 18 px, Kursiv-Akzent, `letter-spacing -0.36px`), Link rechts. **Der Text ist nur 300 px lang festgehalten** (1200 − 900), danach scrollt er mit dem Abschnitt weg.
- Das Bild wird gegenläufig verschoben (Parallax): `ScrollTrigger.create({trigger: Abschnitt, start:'top bottom', end:'bottom top', scrub:true, onUpdate: p => gsap.set(img,{y: mapRange(0,1,-offset,+offset, p.progress), force3D:true})})` mit `offset=(Bildhöhe − Abschnittshöhe)/2 × 0,85` (Hero-Variante ohne Faktor 0,85). Das Bild startet unsichtbar (`opacity 0`) und blendet bei `top 85%` einmal in 0,75 s ein (`power2.inOut`).
- Das Foto ist **Schwarzweiß/entsättigt (im Asset selbst)** bzw. durch die 20-%-Schwarzfläche abgedunkelt, damit weißer Text liest (Kontrast).
- Mobil: Text oben links in der Fläche statt mittig, Label und Satz übereinander, Link darunter.

**Passt für KWM? Ja, sehr.** Konkret:
1. **Wo:** (a) Startseite „Manufaktur“/Werkstatt-Einstieg: Foto der Werkstatt, mittig ein Satz in Libre Caslon, daneben „Werkstatt ansehen →“; (b) Young-Jae Lee: Porträt/Arbeitsfoto mit **Zitat**, das beim Scrollen hängen bleibt, während das Bild darunter weiterwandert; (c) Besuch: Foto vom Haus mit Adresse und Öffnungszeiten.
2. **Technik für KWM (ohne GSAP):** Abschnitt `height: 130svh`; `.sticky-text { position:sticky; top:0; height:100svh; display:grid; place-items:center }`; Bild `position:absolute; inset:0; object-fit:cover; height:100%`. Parallax optional per `animation-timeline: view()` auf dem Bild (`translateY(-6%) → 6%`, `@supports`-Rückfall statisch). Abdunkeln mit `::after { background: rgb(0 0 0 / .28) }` oder besser **Verlauf nur hinter dem Text** (siehe Kontrast unten).
3. **Kontrast / Barrierefreiheit:** weißer Serif-Text 18 px auf Foto kann bei hellem Ton (Porzellan, Glasur) durchfallen. Mindest 4,5:1 prüfen; Text mit Overlay mindestens .35 oder dunkle Fotos nutzen. Text **nicht zu klein** (KWM-Skala `--fs-statement`, nicht 18 px). Bei `prefers-reduced-motion` kein Parallax, das Sticky bleibt (es ist keine Bewegung, sondern Position).
4. **Mobil:** `sticky` über `100svh` ist auf 390 px unruhig. Besser Höhe `110svh`, Text oben links, 24 px Rand; Link-Tippfläche 44 px.
5. **Zählt als Signatur-Bewegung** des Bildschirms, daher keine zusätzliche Staffel-Animation im selben Abschnitt.
6. **Leistung:** ein Parallax-Bild je Abschnitt, `will-change: transform`, Bilder `loading=lazy`, `decoding=async`. Gering. Bildhöhe 1,3× Abschnitt einplanen (Bild 1,3× größer exportieren).

### Weitere Animationen und Details

| # | Detail | Wie gebaut | Passt für KWM |
|---|---|---|---|
| P1 | **Seiteneintritt als Wasserfall** | `PageTransition`: beim Klick Fade und `y:24` raus (0,45 s `power2.in`), Seite per `fetch` nachladen, `pushState`, dann alle Kinder **gestaffelt einblenden** (`opacity 0→1`, `y 24→0`, 1 s, `power2.out`, Staffel 0,2 s je Gruppe und 0,1 s je Element, Bilder warten auf `decode()`). Erster Besuch: Wortmarke 3 s `sine.in`. | Prinzip ja, Technik nein. KWM: CSS View Transitions für Fade, plus Einblenden mit Opazität und 12 bis 16 px y beim Laden. Wasserfall-Staffel nur auf Karten (max. 6, Staffel 0,08 s). Erste Besuchsanimation 3 s ist zu lang. |
| P2 | **Schwebende Navigation** (Pille unten rechts mit Haus-Zeichen) | `#floating-nav` ist `position:fixed` und erscheint, sobald die Hauptnavigation oben aus dem Bild ist (`IntersectionObserver`), verschwindet nahe dem Footer. **Bei Hover (Zeiger fein) wächst sie von 80 px auf 600 px Breite** (`maxWidth:80→600`, `paddingLeft:16→32`, 0,8 s, `power4.inOut`), die Links blenden in 0,8 s ein, Schließen 0,4 s. Auf Touch: Tippen öffnet, Tippen außerhalb schließt. | **Ja, hoch:** Auf dem Handy eine **schwebende Pille unten** statt Burger oben (`menu-390.png`): Zeichen (KWM-Stempel/„K“) plus Textlinks; Tippfläche ≥ 44 px, `inert` wenn geschlossen. Desktop optional. Beachten: Fokusreihenfolge, `aria-expanded`, Escape schließt. |
| P3 | **Links mit Gleitlinie** (`link-hover`) | `background-image:linear-gradient(90deg, currentColor 50%, transparent 50%)`, `background-size:200% 1px`, `background-position:left→right`, 0,3 s `ease-in`. Ruhezustand gepunktet. | **Ja.** Passt zu Haarlinien-Sprache. Dezenter als Unterstreichung. In KWM: Ruhe `--hair`, Hover `--ink`. 0 Kosten. |
| P4 | **Kursiv als Betonung im Satz** (`<em>`) | Serif Kursiv in demselben Satz, kein Farbwechsel. | **Ja, direkt.** Libre Caslon Text Italic im Lede-Satz („Seit 1924 *von Hand*“). Ersetzt Akzentfarbe. |
| P5 | **Riesige Wortmarke als Seitenanfang** (Fett, volle Breite, 1 Zeile) | `font-size` ≈ 9,7 vw, Zeilenhöhe .9. | KWM macht das bereits (DESIGN.md Seitenname). Bestätigt. |
| P6 | **Zahlenreihe I. II. III. IV. in Serif** über vier gleich große Bilder mit Titel + Text | Römische Ziffer, 4 Spalten, gleiche Bildhöhe. | **Ja** für Ablauf „Vom Ton zur Schale“ (Drehen, Trocknen, Glasieren, Brennen). Ziffer als Meta, Überschrift Eintragstitel, 2 Zeilen Text. Gut für die Werkstattseite. |
| P7 | **Journal-Karten mit versetzter Höhe** | Gleiche Breite, Bildformate Hoch/Quer wechseln, Titel + Datum + 3 Zeilen Teaser. Einblenden y 24 → 0, 1 s, Staffel 0,1 s. | Für Aktuell. Aber gleiche Formate je Reihe (Regel 7 in INSPIRATION-RHYTHMUS): hier nur Höhenversatz der Reihe, nicht der Formate. |
| P8 | **Parallax-Bild im Footer** (`footer-image`) | Wie bei Sticky-Bild, Faktor 0,85. | Optional, schließender Bildabschluss (Postkarten-Foto) vor dem dunklen Footer. Gering. |
| P9 | **Bilder laden mit `is-loaded`** (lazy Bilder blenden nach `decode()`) | `requestAnimationFrame` → Klasse `is-loaded` → CSS-Fade. | Ja: verhindert harte Bildsprünge bei Lazy-Loading, null JS-Kosten wenn nur `onload`-Klasse. |

---

## 4. Priorisierte Übernahmen für KWM

Priorität = Wirkung auf den Eindruck × Passung zur Haltung ÷ Aufwand und Risiko. Alle ohne GSAP umsetzbar (CSS, `IntersectionObserver`), alle mit `prefers-reduced-motion`.

1. **Sticky Text im Vollbild-Foto** (Provider). Abschnitt 130 svh, Text `position:sticky; top:0; height:100svh`, Bild abgedunkelt, optional Parallax. Einsatz: Startseite (Werkstatt-Einstieg), Young-Jae-Lee-Zitat, Besuch. Belege: `provider/anim-sticky-who-04.png`, `-who-08.png`, `anim-sticky-house-05.png`, Video `provider/video/`. Max. 1 bis 2 pro Seite.
2. **Sticky Textspalte neben laufenden Bildern** (AKV Projektseite). Reines CSS `position:sticky`. Einsatz: Meisterstück-Detail (Titel, Maße, Glasur stehen, Fotos laufen) und Kapitel in Young-Jae Lee. Belege: `akv/project-detail.png`, `akv/anim-sticky-detail-00..09.png`.
3. **„Made to matter“ als Einmal-Einfahrt** (Jonite), abgespeckt: vier Fotos in vier Breiten + Satz, Versatz 40 bis 120 px, 1,0 s Ease-out, nur Opazität/Transform, keine Scroll-Sperre. Einsatz: Startseite Manufaktur (Signatur-Bewegung der Seite). Belege: `jonite/anim-madetomatter-10.png` (vorher), `-15.png` (nachher), `jonite/video/`.
4. **Staffel-Einblenden je Bild-Beschriftungs-Paar** (AKV): `opacity 0→1`, `x −20 → 0` (bei uns `y 16 → 0`), Staffel 0,05 s, einmalig. Einsatz: Meisterstücke, Aktuell. Belege: `akv/seq-*.png`, `akv/video/`.
5. **Schwebende Navigationspille am Handy** (Provider): statt Burger oben, `fixed` unten, 56 px hoch. Belege: `provider/menu-390.png`, `provider/nav-floating-open.png`, `provider/nav-floating-closed.png`.
6. **Kapitelkopf aus Haarlinie + Punkt/Zählung + Mono-/Kleinlabel + Aktion** (Jonite): ersetzt Spaltenlabel; wiederkehrend. Belege: `jonite/anim-madetomatter-05.png` („● CLIENTS“ mit Haarlinie), `jonite/seq-033.png` (Footer-Labels). Vorher mit Admin klären wegen „Label nie als Kicker“.
7. **Kursiv als einzige Betonung im Satz + gestrichelte/gleitende Linkunterlinie** (Provider): Libre Caslon Italic im Lede, Link-Hover als Linie, die von links nach rechts läuft (0,3 s). Beleg: `provider/fold-1440.png`.
8. **Nebentext nur über Deckkraft** (AKV): Name 50 %, Hover 100 %, 150 ms, eine Schrift. Beleg: `akv/fold-1440.png`.
9. **Seitengrund pro Werk getönt** (AKV, Papier → Sand in 500 ms): bei KWM nur sehr leichte Glasur-Tönung (3 bis 6 % Sättigung) auf Werk-Detailseiten. Beleg: `akv/fold-1440.png` vs `akv/project-detail.png`. Prüfen mit Regel „keine Beigeflächen“.
10. **Ablauf in vier Schritten mit römischen Ziffern** (Provider): für „Vom Ton zur Schale“. Beleg: `provider/full-1440.png` (Mitte).
11. **Verzeichnisansicht Grid/Liste mit Filterzeile** (AKV): für Meisterstücke. Beleg: `akv/projects-list-1440.png`.
12. **Sanfte Seitenübergänge** per `@view-transition { navigation: auto; }` (Ersatz für Barba/Wasserfall) plus Bild-Fade nach `onload` (`is-loaded`). Belege: `akv/anim-pagetransition-0..3.png`.

## 5. Ausdrücklich nicht übernehmen

- **Scroll-Sperre während einer Animation** (`lenis.stop()` bei Jonite) und **Lenis/Smooth-Scroll überhaupt**: Eigenscroll mit Verzögerung stört Tastatur, Zoom und Lesehilfen, bringt für KWM keinen Gewinn.
- **Barba.js-Seitenwechsel** und Fetch-Eigenbau (AKV, Provider): Website bleibt statisch, CSS View Transitions genügen.
- **Endlos-Scroll mit geklonten Projekten** (AKV): ein Katalog hat ein Ende.
- **Feder-Kurve mit Überschwingen** (`figma-spring`) und 150-px-Mammut-Überschrift mit Wortversatz in großen Wegen: zu verspielt.
- **Pillen-Buttons im Bild, Logo-Lauf, Live-Uhren, WhatsApp-Leiste, Preis-/Shop-Elemente** (Jonite): Shop-Anmutung, Inhaltsregel „keine Preise, Verfügbarkeiten“.
- **Dauerlauf-Marquees**: bewegen sich ständig, Gegensatz zu „wenig Bewegung“.
- **Zufälliges Seitenwechseln und Zufallsgrößen** der AKV-Startseite als Zufall: bei uns festes Muster nach INSPIRATION-RHYTHMUS Regel 8, sonst wirkt es beliebig.
- **Mehr als eine Signatur-Bewegung pro Bildschirm**: Sticky-Foto, „Made to matter“-Einfahrt und Parallax nie im selben Bildschirm kombinieren.
- **Zu kleiner weißer Text auf hellem Foto** (Provider 18 px): in KWM nur größere Skala und geprüfter Kontrast.

## 6. Offene Fragen an den Admin

- Sticky-Text im Foto: welche Bilder und welche Sätze (Startseite, Young-Jae Lee, Besuch)? Echte Fotos der Werkstatt in guter Qualität werden benötigt, sonst wirkt der Effekt leer.
- Kapitelkopf mit Punkt und Mono-Label: Ausnahme von der Regel „Spaltenlabel nie als Kicker“ zulassen oder nur als Linien-Zeile?
- Getönter Seitengrund je Werk: gewünscht oder zu nah an „keine Beigeflächen“?
