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
npm run check                     # Prettier, ESLint, astro check, Build – muss vor jedem Merge grün sein (CI prüft dasselbe)
npm run test:ausgangsstand        # Referenz-Screens aus dem Prototyp erzeugen (tests/__screens__/, nicht im Repo)
npm test                          # alle Playwright-Tests gegen dist/ unter wrangler dev
BASIS_URL=https://… npm test      # dieselben Tests gegen eine Vorschau- oder Produktions-URL
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
src/components/       Header, Footer, InquiryBand (Anfrage-Leiste), InquiryForm (Anfrageformular)
src/data/             kontakt.ts (Telefon, Mail, Zeiten, Adresse), navigation.ts (Menü, Fußlinks)
src/pages/            eine .astro-Datei pro Seite
src/styles/           basis.css (bindet global.css, pages.css, expander.css ein), seiten/ (Seiten-CSS), signaturen/ (signaturen.css und sig-*.css)
public/               JS, Schriften (fonts.css), Bilder, _headers, _redirects, robots.txt (kein CSS mehr; Rest wird in Phase C gebündelt)
tests/                Playwright-Tests (siehe oben)
konzept/              Konzepte, Pläne, Berichte; figures.json = Bilderliste der alten WordPress-Seite
.shots/               Skripte für Screenshots zur Sichtprüfung (Bilder werden nicht eingecheckt)
archiv/               abgeschlossene Stände: HTML-Prototyp (V1–V3), frühe Entwurfs-Dokumente
```

## CSS-Reihenfolge

Jede Seite importiert in dieser Reihenfolge: `../styles/basis.css`, ihr Seiten-CSS aus `../styles/seiten/` (falls vorhanden), `../styles/signaturen/signaturen.css`. Das Layout importiert kein CSS. Nur `fonts.css` bleibt ein `<link>` im Layout.

Warum: Die Kaskade lebt von der Reihenfolge (Grundstile, dann Seite, dann Signaturen). Vite legt gemeinsam genutzte Stile sonst in einen Chunk, der im HTML hinter dem Seiten-CSS steht. Deshalb trennt `codeSplitting.groups` in `astro.config.mjs` die Chunks `basis` und `signaturen`, und `build.inlineStylesheets: 'never'` verhindert, dass kleines Seiten-CSS als `<style>` vor alle Links rutscht. Kaskaden-Ebenen (`@layer`) taugen hier nicht, weil sie die Spezifität umkehren.

Gesichert durch den Test „Stylesheet-Reihenfolge“ in `tests/routen.spec.ts`: Er prüft auf allen Seiten, dass `fonts.css`, `basis`, höchstens ein Seiten-Chunk und `signaturen` in dieser Reihenfolge geladen werden und kein `<style>` im Head steht.
