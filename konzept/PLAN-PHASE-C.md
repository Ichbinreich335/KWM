# Phase C: Asset-Pipeline – Feinplanung

> **Für ausführende Agenten:** Diese Datei ist der Auftrag. Vorher `CLAUDE.md`, `konzept/PLAN-ASTRO-UMBAU.md` §4 (Globale Vorgaben) und §9 (Rahmen) lesen. Ausführung durch Sonnet-Subagents, je Aufgabe ein Review, Endprüfung durch Opus.

**Ziel:** CSS, JavaScript, Bilder und Schriften laufen durch Astro/Vite statt unverändert aus `public/`: gebündelt, mit Hash im Dateinamen (dauerhaft cachebar), JavaScript als TypeScript strict, Bilder responsiv mit Breite und Höhe, Schriften mit angepassten Ersatzschriften. **Keine sichtbare Änderung**, Ladezeit gleich oder besser.

**Voraussetzung:** Phase B-1 ist gemergt (keine Varianten-Logik, ungenutzte Signaturen gelöscht). Sonst würde toter Code nach TypeScript übertragen.

**Reihenfolge und PRs (fest):** C1 → C2 → C3 → C4, je ein Branch und Draft-PR, gestapelt (`phase-c1-css` von `phase-b-varianten` bzw. `main`, dann jeweils vom vorherigen).

**Doku-Grundlage (astro-docs-MCP, 04.10.2026):**
- „Styles and CSS → Cascading Order“: `<link>`-Tags < importierte Styles < scoped Styles; bei gleicher Spezifität gewinnt der zuletzt importierte. Layout zuerst importieren.
- „Styles and CSS → Bundle control“: Stylesheets unter 4 KB werden standardmäßig inline eingebettet (`build.inlineStylesheets: 'auto'`).
- „Images“: `<Image>`/`<Picture>` aus `astro:assets`, `layout` (`constrained`, `full-width`, `fixed`, `none`), `image.responsiveStyles: true`, `getImage()` nur im Frontmatter; Bilder in `public/` werden nie optimiert.
- „Using custom fonts“ / „Font Provider API → Local“: `fontProviders.local()` mit `options.variants` (je Variante `weight`, `style`, `src`, optional `unicodeRange`, `display`); Schriftdateien **nicht** in `public/` (sonst doppelt im Build); `<Font cssVariable preload />` im `<head>`.

## Prüf-Werkzeuge (jede Aufgabe)

- `npm run check` Exit 0; `npm test` alles grün (Optik 26, Barrierefreiheit 26, Routen 12, Verhalten 12).
- Optik-Screens sind der Maßstab. In C1, C2, C4 kein `--update-snapshots`. In C3 nur, wenn die Abweichung nachweislich nur aus der Neuberechnung der Bilder stammt (Differenzbild ansehen, Begründung im Report), und nur für die betroffenen Seiten.
- Lighthouse mobil Startseite und Manufaktur (je 3 Läufe, Median, Skill `web-perf`) vor und nach jeder Aufgabe; nachher nicht schlechter.
- Nach jeder Aufgabe: `grep` der jeweils verbotenen Pfade (siehe Abnahme) und `ls dist/_astro`.

## Aufgabe C1: CSS bündeln

**Heute:** `BaseLayout.astro` lädt per `<link>` in dieser Reihenfolge: `/fonts/fonts.css`, `/styles.css`, `/css/pages.css`, `/css/expander.css`, dann über den Slot `head` das Seiten-CSS (`/css/page-*.css`, 7 Dateien, `page-text.css` für 5 Rechts-/Serviceseiten; Startseite und 404 ohne), zuletzt `/css/signaturen.css` (bündelt `sig-*.css` per `@import url(...)`).

**Soll:**
- `public/styles.css` → `src/styles/global.css`, `public/css/pages.css` → `src/styles/pages.css`, `public/css/expander.css` → `src/styles/expander.css`, `public/css/page-*.css` → `src/styles/seiten/page-*.css`, `public/css/signaturen.css` und `sig-*.css` → `src/styles/signaturen/`. `fonts.css` bleibt bis C4 in `public/fonts/` und weiter per `<link>`.
- Layout: im Frontmatter `import '../styles/global.css'; import '../styles/pages.css'; import '../styles/expander.css';` (diese Reihenfolge). Die `<link>`-Tags dafür und den Slot `head` für CSS entfernen (der Slot bleibt für `<meta>`, z. B. `noindex` bei Datenschutz).
- Jede Seite: nach dem Layout-Import ihr Seiten-CSS importieren, **danach** `import '../styles/signaturen/signaturen.css';`. Seiten ohne Seiten-CSS importieren nur `signaturen.css`. Damit bleibt die heutige Reihenfolge (Signaturen zuletzt) erhalten.
- `@import url("sig-x.css")` in `signaturen.css` auf relative Importe umstellen, die Vite auflöst (`@import "./sig-x.css";`).
- Relative `url()` in den verschobenen Dateien prüfen (Datei-URLs auf `/img/…` bleiben absolut und zeigen weiter auf `public/img/` bis C3; Daten-URLs unverändert).
- `public/_headers`: `/_astro/*` mit `Cache-Control: public, max-age=31536000, immutable` ergänzen.
- **Falls die Optik abweicht**, weil Vite gemeinsame CSS-Teile in andere Chunks verschiebt und sich die Reihenfolge ändert: Reihenfolge mit Kaskaden-Ebenen absichern (`@layer basis, seiten, signaturen;` in `global.css`, Dateien jeweils in ihre Ebene). Vorher mit dem astro-docs-MCP prüfen und im Report begründen.

**Abnahme:** Optik 26/26 ohne Update; `ls public/css` existiert nicht mehr; `grep -rn '\.css"' src/layouts src/pages` zeigt nur noch `/fonts/fonts.css`; `dist/_astro/*.css` vorhanden; Lighthouse nicht schlechter. Commit-Reihe: „Phase C1: …“.

## Aufgabe C2: Skripte als TypeScript strict

**Heute:** `public/main.js`, `public/js/expander.js`, `public/js/signaturen.js` (lädt `sig-*.js` dynamisch, sobald `[data-sig]` sichtbar wird), `public/js/keramik.js` (gemeinsame Funktionen und Daten), `public/js/sig-*.js` (nach Phase B: aktuell, anfrage, farbskala, feuer, logo, orte, sticky). Eingebunden per `<script is:inline type="module" src>` im Layout, `public/js/varianten.js` gibt es nach Phase B nicht mehr. Inline-Skript der Glasurbühne in `manufaktur.astro` (`is:inline`).

**Soll:**
- Dateien nach `src/scripts/` als `.ts`: Reihenfolge der Commits `keramik.ts` (Typen `Glasur`, `Rng` usw. exportieren), `expander.ts`, `signaturen.ts`, `main.ts`, danach je ein Commit pro `sig-*.ts`.
- Layout: ein verarbeitetes Skript statt der `is:inline`-Tags:
  ```astro
  <script>
    import '../scripts/main';
    import '../scripts/signaturen';
    import '../scripts/expander';
  </script>
  ```
  Reihenfolge wie heute. Das Kopf-Skript (`js`-Klasse, Logo-Zeichnung) bleibt `is:inline`.
- Dynamische Importe in `signaturen.ts` als `import('./sig-x')`; Vite teilt sie in eigene Chunks (prüfen: `dist/_astro/sig-*.js` einzeln).
- Glasurbühne in `manufaktur.astro`: als verarbeitetes `<script>` mit TypeScript, sofern es kein Rendern vor dem ersten Paint braucht; sonst `is:inline` lassen und begründen.
- TypeScript: keine `any`, keine `@ts-ignore`; DOM-Abfragen mit Typ-Argument und Null-Prüfung (`document.querySelector<HTMLCanvasElement>(…)`); keine Verhaltensänderung.

**Abnahme:** `astro check` ohne Fehler (strictest); Optik 26/26, Konsole fehlerfrei, Verhalten grün; `ls public/js public/main.js` existiert nicht mehr; `grep -rn "is:inline" src` nur Kopf-Skript (und ggf. begründet Glasurbühne).

## Aufgabe C3: Bilder über `astro:assets`

**Heute:** 98 WebP + 1 SVG in `public/img/`; 130 `<img>` in 8 Seiten (Manufaktur 48, Startseite 41, Meisterstücke 28, …), 11 davon mit handgemachtem `srcset` (`-800`-Varianten); `fetchpriority="high"` auf den Einstiegsbildern (Startseite, Meisterstücke, Werkstatt, Manufaktur 2×, Young-Jae Lee); `data-img="/img/kwm/…"` an den Glasur-Knöpfen der Manufaktur (Skript tauscht damit das Bild); Favicon `/img/kwm/logo.svg`.

**Soll:**
- Bilder nach `src/assets/img/` (Struktur beibehalten), Favicon bleibt in `public/img/kwm/logo.svg`.
- Komponente `src/components/Bild.astro`: löst einen Pfad wie `/img/kwm/x.webp` über `import.meta.glob('/src/assets/img/**/*.{webp,jpg,png}', { eager: true })` auf und rendert `<Image>` mit `layout="constrained"` (Standard) bzw. `full-width` für randlose Bilder. Props: `src`, `alt` (Pflicht), `class`, `sizes`, `loading`, `fetchpriority`, `layout`, alle übrigen Attribute durchreichen. Unbekannter Pfad → Build-Fehler mit Pfad im Text (kein stilles Fallback).
- In `astro.config.mjs`: `image: { responsiveStyles: true }` (Doku); prüfen, ob die globalen `:where([data-astro-image])`-Stile das Layout verändern (Optik).
- Seiten mechanisch umstellen: `<img src="/img/…" …>` → `<Bild src="/img/…" …>`; handgemachte `srcset`/`-800`-Varianten entfallen. LCP-Bilder behalten `loading="eager"` und `fetchpriority="high"`.
- `data-img` der Glasurbühne: URLs per `getImage()` im Frontmatter erzeugen und als `data-img` ausgeben (Doku-Muster „pass the src to the client“).
- Danach nicht mehr referenzierte Dateien (`*-800.webp`) löschen; `public/img/` enthält nur noch das Favicon.

**Abnahme:** Linkprüfung grün; Optik grün (Update nur mit Begründung, siehe oben); Lighthouse LCP gleich oder besser; `find public/img -type f` → nur `kwm/logo.svg`; jedes `<img>` im Build hat `width` und `height`.

## Aufgabe C4: Schriften über die Fonts API

**Heute:** `public/fonts/fonts.css` mit 8 `@font-face` (Jost normal 300–500, Libre Caslon Display normal, Libre Caslon Text normal und italic, je Subset latin und latin-ext mit `unicode-range`), zwei `<link rel="preload">` im Layout (Libre Caslon Display latin, Jost latin). Tokens in `global.css`: `--f-display: "Libre Caslon Display", "Libre Caslon Text", Georgia, serif;`, `--f-text: "Libre Caslon Text", Georgia, serif;`, `--f-sans: "Jost", "Futura", system-ui, sans-serif;`.

**Soll:**
- Dateien nach `src/assets/fonts/`.
- `astro.config.mjs`: `fonts: [...]` mit `fontProviders.local()` für drei Familien; je Variante `weight`, `style`, `src`, `unicodeRange` (aus `fonts.css` übernehmen), `display: 'swap'`. `cssVariable`: `--font-jost`, `--font-caslon-display`, `--font-caslon-text`.
- Layout: `<Font cssVariable="…" />` für alle drei, `preload` nur für die zwei heute vorgeladenen Schnitte (Filter auf Gewicht/Stil/Subset laut Doku).
- Tokens: `--f-display: var(--font-caslon-display), var(--font-caslon-text), Georgia, serif;` usw. (die Fonts API liefert eigene Familiennamen samt angepasster Ersatzschrift).
- `public/fonts/` und `fonts.css` löschen.

**Abnahme:** Optik 26/26 ohne Update (Schriftbild identisch); im Netzwerk keine Anfragen auf `/fonts/`; genau zwei Preloads; Lighthouse CLS 0 und nicht schlechter.

## Abschluss Phase C (Controller)

Endprüfung mit Skill `code-review` (Opus) je PR, Bericht `konzept/PHASE-C-BERICHT.md` (Größen `dist/` vorher/nachher, Lighthouse-Tabelle), `konzept/ADMIN-OFFEN.md` ergänzen.
