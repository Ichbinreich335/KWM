# KWM – Website kwm-1924.de

Website der Keramischen Werkstatt Margaretenhöhe. Statisch gebaut mit [Astro](https://docs.astro.build) 7, ausgeliefert als Cloudflare Worker mit Static Assets (`kwm-redesign`). Designsystem: [DESIGN.md](DESIGN.md). Aktuelle Entscheidungen: [konzept/UEBERGABE.md](konzept/UEBERGABE.md), Abschnitt 0. Umbauplan: [konzept/PLAN-ASTRO-UMBAU.md](konzept/PLAN-ASTRO-UMBAU.md).

## Start

Node 24 (siehe `.nvmrc`).

```bash
npm install
npx playwright install chromium   # einmalig, für die Tests
npm run dev                       # Entwicklungsserver http://localhost:4321
npm run preview                   # baut dist/ und startet wrangler dev (wie in Produktion: Weiterleitungen, Header, 404)
```

## Prüfen

```bash
npm run check                     # Prettier, ESLint, astro check, Unit-Tests (Vitest), Build – muss vor jedem Merge grün sein (CI prüft dasselbe)
npm run test:ausgangsstand        # Referenz-Screens aus dem Prototyp erzeugen (tests/__screens__/, nicht im Repo)
npm test                          # alle Playwright-Tests gegen dist/ unter wrangler dev
BASIS_URL=https://… npm test      # dieselben Tests gegen eine Vorschau- oder Produktions-URL
OPTIK_TOLERANZ=0.02 npm run test:optik   # höhere Toleranz (Standard 0.002), z. B. wenn Bilder neu berechnet wurden
```

| Test                             | Prüft                                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `tests/optik.spec.ts`            | Ganzseitige Screens aller 13 Seiten, Desktop 1440 px und Mobil 390 px, gegen den Ausgangsstand; keine Konsolenfehler |
| `tests/routen.spec.ts`           | 404-Seite, saubere URLs ohne `.html`, `noindex`, Linkprüfung aller Seiten, Weiterleitung alter `/v3/`-Links          |
| `tests/verhalten.spec.ts`        | Anfrage-Leiste und -Formular, Sonderzeichen, Leerzeichen, datumsabhängige Hinweise                                   |
| `tests/barrierefreiheit.spec.ts` | axe-core, WCAG 2.2 AA, alle Seiten                                                                                   |

Die Optik-Tests laufen nur lokal (die Schriftdarstellung unter Linux weicht ab), nicht in CI. Läuft schon ein `wrangler dev` auf Port 8787, verwenden die Tests ihn weiter und bauen nicht neu; dann vorher `npm run build`.

## Deploy

Workers Builds baut bei jedem Push mit `npm run build` (Build-Befehl muss im Cloudflare-Dashboard gesetzt sein, siehe `konzept/ASTRO-BERICHT.md`):

- Branch `main` → `npx wrangler deploy` → Produktion
- jeder andere Branch → `npx wrangler preview` → eigene Vorschau-URL `https://<branch>-kwm-redesign.<subdomain>.workers.dev`

Bis zum Go-live liefert die Seite `X-Robots-Tag: noindex, nofollow` aus (`public/_headers`), und `public/robots.txt` sperrt alles. Vorschau-URLs sind öffentlich erreichbar.

## Wo liegt was

```
astro.config.mjs      statisch, build.format 'file' (aktuelles.astro → /aktuelles), compressHTML
wrangler.jsonc        Worker kwm-redesign, Assets aus dist/, 404-Seite, Previews
src/layouts/          BaseLayout.astro: Kopf, Skripte, Header und Footer (kein CSS-Import)
src/components/       Komponenten nach DESIGN.md §11 (Gerüst, Köpfe, Statement, Einträge wie ExhibitionCard, WorkCard, WareCard, FactsList, DateList, PubList, PersonCard, Steps, Aufklappen und Archive: Expander, YearArchive, Timeline, Chronicle, PlaceGrid), Bild (jedes Bild, rendert `<Image>` aus `astro:assets`)
src/data/             Inhalte in der Form des Sanity-Modells: ausstellungen.ts, hinweise.ts, werke.ts, manufaktur.ts, team.ts, texte.ts, vita.ts, werkstatt.ts, anfahrt.ts, arbeitsweise.ts, chronik.ts, lebensweg.ts, orte.ts (Orte und Galerien), archiv.ts (vergangene Ausstellungen); dazu kontakt.ts, navigation.ts, bilder.ts (löst Bildpfade auf), typen.ts (gemeinsame Typen)
src/pages/            eine .astro-Datei pro Seite
src/styles/           basis.css (bindet global.css und pages.css ein), seiten/ (Seiten-CSS), signaturen/ (signaturen.css und sig-*.css)
src/scripts/          Browser-Skripte (TypeScript, Unit-Tests `*.test.ts` mit Vitest: `npm run test:unit`): status (Ausstellungsstatus aus dem Datum), zeitraum, anfrage-link, main, signaturen (lädt die sig-* als eigene Chunks), keramik (gemeinsame Typen und Daten); das Layout bindet sie als ein verarbeitetes Skript ein
src/assets/fonts/     Selbst gehostete Schriften (woff2, je Teilmenge latin und latin-ext); registriert in `astro.config.mjs` (`fonts`), eingebunden über `<Font>` im Layout
src/assets/img/       Bilder, nur über `<Bild src="/img/…">` einbinden (Pfad ohne `src/assets`)
public/               Favicon (`img/kwm/logo.svg`), _headers, _redirects, robots.txt (kein CSS mehr; Rest wird in Phase C gebündelt)
tests/                Playwright-Tests (siehe oben)
konzept/              Konzepte, Pläne, Berichte; figures.json = Bilderliste der alten WordPress-Seite
.shots/               Skripte für Screenshots zur Sichtprüfung (Bilder werden nicht eingecheckt)
archiv/               abgeschlossene Stände: HTML-Prototyp (V1–V3), frühe Entwurfs-Dokumente
```

## CSS-Reihenfolge

Jede Seite importiert in dieser Reihenfolge: `../styles/basis.css` (als allererstes, vor Layout und Komponenten), ihr Seiten-CSS aus `../styles/seiten/` (falls vorhanden), `../styles/signaturen/signaturen.css`. Das Layout importiert kein CSS. Die Schrift-Stile (`@font-face`, `--font-*`) erzeugt die Fonts API als drei `<style>`-Blöcke im Head.

Warum: Die Kaskade lebt von der Reihenfolge (Grundstile, dann Seite, dann Signaturen). Vite legt gemeinsam genutzte Stile sonst in einen Chunk, der im HTML hinter dem Seiten-CSS steht. Deshalb trennt `codeSplitting.groups` in `astro.config.mjs` die Chunks `basis` und `signaturen`, und `build.inlineStylesheets: 'never'` verhindert, dass kleines Seiten-CSS als `<style>` vor alle Links rutscht. Kaskaden-Ebenen (`@layer`) taugen hier nicht, weil sie die Spezifität umkehren. Die Bildstile von Astro (`image.responsiveStyles`) sind in den Chunk `basis` eingemischt und liegen in `@layer astro.images`; diese Ebene steht unter allem CSS des Projekts ohne Ebene und kann es deshalb nie überschreiben (darum ist `@layer` dort unbedenklich, im Projekt-CSS aber nicht).

Komponenten-Stile (`<style>` in `src/components/*.astro`) sind pro Komponente gescoped (`scopedStyleStrategy: 'where'`, keine zusätzliche Spezifität) und liegen im Chunk `basis`, dort hinter global und pages. Sie stehen damit vor dem Seiten-CSS und den Signaturen und werden von deren gleich spezifischen Regeln überschrieben, genau wie vorher die Regeln in `pages.css`. Damit das unabhängig von der Importreihenfolge der Komponenten gilt, ist `../styles/basis.css` der erste Import jeder Seite. Die Regex in `codeSplitting.groups` erfasst nur `<style>` direkt in `src/components/*.astro`; ein `<style>` in `src/layouts/` oder in Unterordnern von `src/components/` landete in einem eigenen Chunk vor `basis` und bräuchte einen erweiterten Eintrag. Regeln mit Vorfahren außerhalb der Komponente (`html.js`, `.masthead`) stehen als `:global(.js)` usw.; sonst hängt Astro auch an diese Teile die Komponentenklasse, und die Regel greift nie. Inhalte, die per Skript entstehen (Detailbereich der Orte), brauchen `<style is:global>`. Inhalte, die eine Seite per Slot einsetzt (auch `Bild`), gehören zum Gültigkeitsbereich der Seite, nicht der Komponente: Sie erreicht die Komponente nur mit `:global()`.

Gesichert durch den Test „Stylesheet-Reihenfolge“ in `tests/routen.spec.ts`: Er prüft auf allen Seiten, dass `basis`, höchstens ein Seiten-Chunk und `signaturen` in dieser Reihenfolge geladen werden und im Head nur die drei Schrift-Stile der Fonts API stehen. Der Test „Chunk basis“ prüft, dass in `basis` alle Komponenten-Stile hinter global und pages stehen. Der Test „Schriften“ stellt sicher, dass genau zwei Dateien vorgeladen werden und beide die latin-Teilmenge sind.

## Schriften

`astro.config.mjs` registriert Jost, Libre Caslon Display und Libre Caslon Text mit dem lokalen Provider (je Teilmenge eine Variante mit `unicodeRange`). Das Layout bindet sie mit `<Font>` ein und lädt zwei Dateien vor. Die Fonts API kann lokale Schriften nicht nach Teilmenge vorladen, deshalb wählt das Layout die Dateien über `fontData`: Die latin-Variante muss in `varianten()` vor latin-ext stehen. Die Tokens `--f-*` in `global.css` verweisen auf `--font-*` (enthalten die Ersatzschriften).
