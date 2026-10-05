# KWM – Website kwm-1924.de

Website der Keramischen Werkstatt Margaretenhöhe. Statisch gebaut mit [Astro](https://docs.astro.build) 7, ausgeliefert als Cloudflare Worker mit Static Assets (`kwm-redesign`). Nur `/api/anfrage` (Anfrageformular) läuft durch Worker-Code. Designsystem: [DESIGN.md](DESIGN.md). Aktuelle Entscheidungen: [konzept/UEBERGABE.md](konzept/UEBERGABE.md), Abschnitt 0. Umbauplan: [konzept/PLAN-ASTRO-UMBAU.md](konzept/PLAN-ASTRO-UMBAU.md).

## Start

Node 24 (siehe `.nvmrc`).

```bash
npm install
npx playwright install chromium webkit   # einmalig, für die Tests (WebKit = Safari)
npm run dev                       # Entwicklungsserver http://localhost:4321
npm run preview                   # baut dist/ und startet wrangler dev (wie in Produktion: Header, 404)
```

## Prüfen

```bash
npm run check                     # Prettier, ESLint, astro check, Worker-Typen, Unit-Tests und Worker-Tests (Vitest), Build – muss vor jedem Merge grün sein (CI prüft dasselbe)
npm run test:unit                 # Unit-Tests der Skripte und Daten (Vitest, src/**/*.test.ts)
npm run test:worker               # nur die Worker-Tests (Vitest in workerd, vitest.worker.config.ts)
npm run types                     # worker-configuration.d.ts neu erzeugen, nach jeder Änderung an wrangler.jsonc
npm test                          # alle Playwright-Tests gegen dist/ unter wrangler dev
BASIS_URL=https://… npm test      # dieselben Tests gegen eine Vorschau- oder Produktions-URL
npm run test:vorschau             # Vorschau-Modus: eigener Build (dist-vorschau/, WORKERS_CI_BRANCH gesetzt) und Worker mit ANFRAGE_MODUS=vorschau auf Port 8788
OPTIK_TOLERANZ=0.02 npm run test:optik   # höhere Toleranz (Standard 0.002), z. B. wenn Bilder neu berechnet wurden
```

| Test                             | Prüft                                                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/optik.spec.ts`            | Ganzseitige Screens aller 13 Seiten, Desktop 1440 px und Mobil 390 px in Chromium und WebKit (eigene Referenzen je Projekt); keine Konsolenfehler |
| `tests/bewegung.spec.ts`         | Mit voller Bewegung (Chromium, WebKit, iPhone): kein Bild hängt am Scrollen, keine Sprünge, Inhalte sichtbar ohne Hauptskript                     |
| `tests/routen.spec.ts`           | 404-Seite, saubere URLs ohne `.html`, `noindex`, Linkprüfung aller Seiten                                                                         |
| `tests/verhalten.spec.ts`        | Anfrage-Leiste und -Formular, Sonderzeichen, Leerzeichen, datumsabhängige Hinweise                                                                |
| `tests/barrierefreiheit.spec.ts` | axe-core, WCAG 2.2 AA, alle Seiten                                                                                                                |
| `tests/formular.spec.ts`         | Anfrageformular gegen `wrangler dev` mit Turnstile-Testschlüsseln: Danke-Zustand, Versandfehler, Feldfehler (braucht Netz)                        |
| `tests/verhalten.spec.ts`        | u. a. Flyer-Dialog (Aktuelles und Startseite): Öffnen, Esc, Fokus, keine Vergrößerung über die Originalgröße                                      |
| `tests/stile.spec.ts`            | Astro-Scoping greift auf allen Seiten, Skript-Stile der Komponenten (Chronik, Lebensweg, Karten, Archiv)                                          |
| `tests/sicherheit.spec.ts`       | Sicherheits-Header, CSP-Meta mit dem Hash des Kopf-Skripts                                                                                        |
| `src/**/*.test.ts`               | Unit-Tests (Vitest): Logik in `src/lib`, Daten in `src/data`                                                                                      |
| `worker/*.test.ts`               | Vitest in der Workers-Laufzeit: gemeinsame Regeln, Endpunkt `/api/anfrage` (Versand und Turnstile gemockt)                                        |

Die Optik-Tests laufen nur lokal (die Schriftdarstellung unter Linux weicht ab), nicht in CI. Läuft schon ein `wrangler dev` auf Port 8787, verwenden die Tests ihn weiter und bauen nicht neu; dann vorher `npm run build`.

## Anfrageformular (Worker)

`POST /api/anfrage` prüft Methode, Ursprung, Rate Limit (5 je Minute und IP), Größe, Felder, Honigtopf und Turnstile und schickt die Anfrage per `send_email`-Binding als Text-Mail. Es wird nichts gespeichert. Die Regeln liegen einmal in `src/lib/anfrage.ts` (Browser und Worker). Lokal: `.dev.vars.example` nach `.dev.vars` kopieren (Turnstile-Testschlüssel), optional `.env.example` nach `.env`; dann `npm run preview`. `wrangler dev` simuliert den Versand und protokolliert die Mail in der Konsole. Vorschau-Modus: Ein Build in Workers Builds auf einem anderen Branch als `main` (`WORKERS_CI_BRANCH` gegen `PRODUKTIONS_BRANCH`, Standard `main`; die Build-Variablen beschreibt `env.schema` in `astro.config.mjs`, gelesen über `astro:env` in `src/lib/umgebung.ts`) zeigt kein Turnstile-Widget, sondern den Hinweis „Vorschau – Anfragen werden noch nicht versendet.“; der Worker antwortet in Vorschauen (`ANFRAGE_MODUS=vorschau` im `previews`-Block von `wrangler.jsonc`) nach der Feldprüfung mit Erfolg, ohne Turnstile-Prüfung und Versand. Produktion (`main`) bleibt streng; fehlt dort ein echter Site-Key (`PUBLIC_TURNSTILE_SITEKEY`), läuft das Formular mit dem Testschlüssel, und der Build schreibt eine Warnung ins Log. Lokal und in Tests gilt immer der strenge Modus. Echter Betrieb: Schritte in `konzept/GO-LIVE.md` und `konzept/ADMIN-OFFEN.md`.

## Deploy

Workers Builds baut bei jedem Push mit `npm run build` (Build-Befehl muss im Cloudflare-Dashboard gesetzt sein, siehe `konzept/ASTRO-BERICHT.md`):

- Branch `main` → `npx wrangler deploy` → Produktion
- jeder andere Branch → `npx wrangler preview` → eigene Vorschau-URL `https://<branch>-kwm-redesign.<subdomain>.workers.dev`

Bis zum Go-live liefert die Seite `X-Robots-Tag: noindex, nofollow` aus (`public/_headers`), und `public/robots.txt` sperrt alles. Vorschau-URLs sind öffentlich erreichbar.

## Wo liegt was

```
astro.config.mjs      statisch, build.format 'file' (aktuelles.astro → /aktuelles), compressHTML
wrangler.jsonc        Worker kwm-redesign, Assets aus dist/, 404-Seite, Variablen, send_email, Rate Limit, Previews
worker/               Worker-Code für /api/anfrage (index, anfrage, turnstile, mail) samt Vitest-Tests, eigene tsconfig
worker-configuration.d.ts   von `npm run types` erzeugt (Env, Laufzeittypen), nicht von Hand ändern
src/layouts/          BaseLayout.astro: Kopf, Skripte, Header und Footer (kein CSS-Import)
src/components/       Komponenten nach DESIGN.md §11 (Gerüst, Köpfe, Statement, Einträge wie ExhibitionCard, WorkCard, WorkTile, WareCard, FactsList, DateList, PubList, PersonCard, Steps, Aufklappen und Archive: Expander, YearArchive, Timeline, Chronicle, PlaceGrid, Kleinteile: LinkArrow, Button, Notice, InfoBlock, Hours, Bild und Signatur: Figure, Plinth, GlazeStage und die Signatur-Hüllen SigLogo, SigFarbskala, SigFeuer, SigSticky, SigAktuell sowie InquiryForm mit dem Anfrage-Formular), BauhausStation mit TellerTafel (Startseite), InquiryBand (Anfrage-Leiste), StrukturierteDaten (JSON-LD), Bild (jedes Bild, rendert `<Image>` aus `astro:assets`)
src/lib/              Reine Logik ohne DOM, läuft beim Build (Frontmatter) und teils im Browser oder Worker, Unit-Tests `*.test.ts` (Vitest, `npm run test:unit`): anfrage (Regeln des Anfrageformulars, Browser und Worker), umgebung (Build-Variablen über `astro:env`: Vorschau-Build, Turnstile-Site-Key), status (Ausstellungsstatus aus dem Datum, `heuteTag`), zeitraum, lesetitel, anfrage-link, bilder (löst Bildpfade auf), zeichen (Sonderzeichen)
src/data/             Inhalte in der Form des Sanity-Modells: ausstellungen.ts, hinweise.ts, werke.ts, manufaktur.ts, team.ts, texte.ts, vita.ts, werkstatt.ts, anfahrt.ts, arbeitsweise.ts, chronik.ts, lebensweg.ts, orte.ts (Orte und Galerien), glasuren.ts (Farbskala, Glasurbühne, Schalenfarben, Ofenfarben), archiv.ts (vergangene Ausstellungen); dazu kontakt.ts (einzige Quelle für Telefon, E-Mail, Adresse und Öffnungszeiten, Form des Sanity-Dokuments `werkstatt`; Seiten und Formular lesen nur von dort), navigation.ts, brenntemperatur.ts, typen.ts (gemeinsame Typen der Inhalte)
src/pages/            eine .astro-Datei pro Seite
src/styles/           basis.css (bindet global.css und pages.css ein), seiten/ (Seiten-CSS); die Stile der Signaturen stehen in den Hüllen `Sig*.astro` und in `InquiryForm.astro`
src/scripts/          Nur Browser-Code: main (seitenweit), signaturen (lädt die sig-* als eigene Chunks), sig-* (Signaturen), keramik (gemeinsame Zeichen-Helfer und Daten der Signaturen); das Layout bindet main und signaturen als ein verarbeitetes Skript ein
src/assets/fonts/     Selbst gehostete Schriften (woff2, je Teilmenge latin und latin-ext); registriert in `astro.config.mjs` (`fonts`), eingebunden über `<Font>` im Layout
src/assets/img/       Bilder, nur über `<Bild src="/img/…">` einbinden (Pfad ohne `src/assets`)
public/               Favicon (`img/kwm/logo.svg`), _headers, robots.txt
tests/                Playwright-Tests (siehe oben)
konzept/              Konzepte, Pläne, Berichte; figures.json = Bilderliste der alten WordPress-Seite
.shots/               Skripte für Screenshots zur Sichtprüfung (Bilder werden nicht eingecheckt)
archiv/               abgeschlossene Stände: HTML-Prototyp (V1–V3), frühe Entwurfs-Dokumente
```

## CSS-Reihenfolge

Jede Seite importiert in dieser Reihenfolge: `../styles/basis.css` (als allererstes, vor Layout und Komponenten), ihr Seiten-CSS aus `../styles/seiten/` (falls vorhanden, gleich danach, damit der Chunk `signaturen` hinter dem Seiten-CSS steht). Das Layout importiert kein CSS. Die Schrift-Stile (`@font-face`, `--font-*`) erzeugt die Fonts API als drei `<style>`-Blöcke im Head.

Warum: Die Kaskade lebt von der Reihenfolge (Grundstile, dann Seite, dann Signaturen). Vite legt gemeinsam genutzte Stile sonst in einen Chunk, der im HTML hinter dem Seiten-CSS steht. Deshalb trennt `codeSplitting.groups` in `astro.config.mjs` die Chunks `basis` und `signaturen` (Stile der Hüllen `Sig*.astro` und von `InquiryForm.astro`; sie stehen als `<style is:global>`, weil Skripte Elemente in sie einfügen und ihre Klassen auch außerhalb der Hülle greifen), und `build.inlineStylesheets: 'never'` verhindert, dass kleines Seiten-CSS als `<style>` vor alle Links rutscht. Kaskaden-Ebenen (`@layer`) taugen hier nicht, weil sie die Spezifität umkehren. Die Bildstile von Astro (`image.responsiveStyles`) sind in den Chunk `basis` eingemischt und liegen in `@layer astro.images`; diese Ebene steht unter allem CSS des Projekts ohne Ebene und kann es deshalb nie überschreiben (darum ist `@layer` dort unbedenklich, im Projekt-CSS aber nicht).

Komponenten-Stile (`<style>` in `src/components/*.astro`) sind pro Komponente gescoped (`scopedStyleStrategy: 'where'`, keine zusätzliche Spezifität) und liegen im Chunk `basis`, dort hinter global und pages. Sie stehen damit vor dem Seiten-CSS und den Signaturen und werden von deren gleich spezifischen Regeln überschrieben, genau wie vorher die Regeln in `pages.css`. Damit das unabhängig von der Importreihenfolge der Komponenten gilt, ist `../styles/basis.css` der erste Import jeder Seite. Die Regex in `codeSplitting.groups` erfasst nur `<style>` direkt in `src/components/*.astro`; ein `<style>` in `src/layouts/` oder in Unterordnern von `src/components/` landete in einem eigenen Chunk vor `basis` und bräuchte einen erweiterten Eintrag. Regeln mit Vorfahren außerhalb der Komponente (`html.js`, `.masthead`) stehen als `:global(.js)` usw.; sonst hängt Astro auch an diese Teile die Komponentenklasse, und die Regel greift nie. Inhalte, die per Skript entstehen (Detailbereich der Orte), brauchen `<style is:global>`. Inhalte, die eine Seite per Slot einsetzt (auch `Bild`), gehören zum Gültigkeitsbereich der Seite, nicht der Komponente: Sie erreicht die Komponente nur mit `:global()`.

Gesichert durch den Test „Stylesheet-Reihenfolge“ in `tests/routen.spec.ts`: Er prüft auf allen Seiten, dass `basis`, höchstens ein Seiten-Chunk und `signaturen` in dieser Reihenfolge geladen werden und im Head nur die drei Schrift-Stile der Fonts API stehen. Der Test „Chunk basis“ prüft, dass in `basis` alle Komponenten-Stile hinter global und pages stehen. Der Test „Schriften“ stellt sicher, dass genau zwei Dateien vorgeladen werden und beide die latin-Teilmenge sind.

## Signaturen und Inline-Stile

Jede generative Grafik hat eine Hülle (`SigLogo`, `SigFarbskala`, `SigFeuer`, `SigSticky`, `SigAktuell`, `InquiryForm`). Die Hülle setzt `data-sig`, gibt ohne JavaScript sinnvollen Inhalt aus (Text, Liste, Bilder) und trägt das CSS; `src/scripts/signaturen.ts` lädt je `data-sig` das passende Modul `sig-*.ts`. Das Markup enthält keine `style`-Attribute: Farben der Farbskala und der Ofenfarben stehen als Klassen im Stil der Hülle (der Test `src/data/glasuren.test.ts` gleicht die Farbskala-Klassen mit `glasuren.ts` ab). Was Skripte zur Laufzeit setzen (`element.style.setProperty` in Glasurbühne, Farbskala, Logo, Sticky und `main.ts`), läuft über das CSSOM und braucht keine CSP-Ausnahme für Inline-Stile.

## Schriften

`astro.config.mjs` registriert Jost, Libre Caslon Display und Libre Caslon Text mit dem lokalen Provider (je Teilmenge eine Variante mit `unicodeRange`). Das Layout bindet sie mit `<Font>` ein und lädt zwei Dateien vor. Die Fonts API kann lokale Schriften nicht nach Teilmenge vorladen, deshalb wählt das Layout die Dateien über `fontData`: Die latin-Variante muss in `varianten()` vor latin-ext stehen. Die Tokens `--f-*` in `global.css` verweisen auf `--font-*` (enthalten die Ersatzschriften).
