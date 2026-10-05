# Phase E: Technisches SEO und Härtung – Feinplanung

> **Für ausführende Agenten:** Diese Datei ist der Auftrag. Vorher `CLAUDE.md`, `konzept/PLAN-ASTRO-UMBAU.md` §4 und §11 lesen; Skills `seo-aeo-best-practices` und `web-perf`. Ausführung durch Sonnet-Subagents, Review je Aufgabe, Endprüfung Opus.

**Ziel:** Saubere Metadaten (Canonical, Open Graph, strukturierte Daten), Sitemap und Sicherheits-Header. Alles unsichtbar. `noindex` und `robots.txt` mit `Disallow: /` bleiben bis zum Go-live (Phase 5); die Vorbereitung ist so gebaut, dass beim Go-live nur zwei Stellen umgestellt werden.

**Voraussetzung:** Phase C ist gemergt (CSS und Skripte gebündelt, damit die CSP-Hashes stimmen), idealerweise auch D (Daten in `src/data/`). E1–E3 hängen nicht an C und dürfen vorgezogen werden; E4 (CSP) erst nach C2.

**Branch:** `phase-e-seo` von `main` (bzw. vom letzten offenen Phasen-Branch). Ein PR.

**Doku-Grundlage (astro-docs-MCP, 04.10.2026):**
- `@astrojs/sitemap` (v3.7): `site` muss gesetzt sein (ist es: `https://kwm-1924.de`), `filter(page)` erhält die volle URL; `<link rel="sitemap" href="/sitemap-index.xml">` im `<head>`; Sitemap-Zeile in `robots.txt`.
- Konfiguration `build.format: 'file'`: `Astro.url.pathname` enthält `.html` (z. B. `/aktuelles.html`) → für Canonical und `og:url` entfernen.
- `security.csp` (seit Astro 6): `<meta http-equiv="content-security-policy">` mit Hashes der **verarbeiteten** Skripte und Styles; eigene Hashes über `scriptDirective.hashes`; Quellen für Inline-Attribute über `styleDirective.resources` mit `{ resource: "'unsafe-inline'", kind: "attribute" }` (seit 7.1); weitere Direktiven über `directives`. Im Dev-Server nicht testbar, nur `build` + `wrangler dev`.
- Cloudflare „Static Assets → Headers“: `public/_headers`, Regeln pro Pfad; gilt nicht für Worker-Antworten (Phase 3).

## Prüf-Werkzeuge
`npm run check` 0; `npm test` grün; Lighthouse alle vier Kategorien Startseite und Manufaktur (SEO bleibt wegen `noindex` < 100, sonst kein Rückgang); Google Rich-Results-Test für das JSON-LD nur offline als Validierung des JSON gegen schema.org (kein Upload).

## Aufgabe E1: Sitemap

- `npx astro add sitemap` (bzw. manuell laut Doku), `filter: (page) => !page.endsWith('/404')` und Seiten ohne Indexwunsch (Datenschutz hat heute `noindex`) ausschließen.
- Prüfen, wie die URLs in `sitemap-0.xml` aussehen (mit `build.format: 'file'` und `trailingSlash: 'never'` müssen sie `https://kwm-1924.de/aktuelles` lauten, ohne `.html`). Falls nicht: per `serialize()` korrigieren und im Report begründen.
- `<link rel="sitemap" href="/sitemap-index.xml" />` im Layout.
- `robots.txt` **nicht** ändern (Sitemap-Zeile erst beim Go-live, siehe E5).
- Test in `tests/routen.spec.ts`: `/sitemap-index.xml` antwortet 200, `sitemap-0.xml` enthält alle Seiten aus `tests/seiten.ts` außer 404/Datenschutz und keine URL mit `.html`.

## Aufgabe E2: Canonical, Open Graph, Sprache

- `BaseLayout.astro`: `const pfad = Astro.url.pathname.replace(/\.html$/, '').replace(/\/index$/, '/')`; `canonical = new URL(pfad, Astro.site)`.
- `<link rel="canonical" href={canonical} />`, `<meta property="og:type" content="website" />`, `og:site_name` „Keramische Werkstatt Margaretenhöhe“, `og:title` = `title`, `og:description` = `description`, `og:url` = `canonical`, `og:locale` `de_DE`, `og:image` (neue optionale Prop `bild`; Standard: das Einstiegsbild der Startseite über `getImage()` auf 1200 px Breite, nach C3 aus `src/assets`), `twitter:card` `summary_large_image`.
- Props-Erweiterung typisiert und optional (`bild?: ImageMetadata`); keine Seite muss angefasst werden.
- `hreflang`: noch nicht ausgeben (die englischen Seiten liegen extern auf der alten Website). Im Report vermerken, wo es später hinkommt.
- Test: Jede Seite hat genau ein `<link rel="canonical">` ohne `.html`, `og:title` = `<title>`, `og:image` antwortet 200.

## Aufgabe E3: Strukturierte Daten (JSON-LD)

- Komponente `src/components/StrukturierteDaten.astro`, im Layout nur auf der Startseite (Prop `strukturiert?: boolean` oder Prüfung auf `/`): `@type` `["LocalBusiness", "Store"]` bzw. passend laut Skill `seo-aeo-best-practices` (Kunsthandwerk-Manufaktur mit Ladenverkauf), Felder aus `src/data/kontakt.ts`: `name` (`kontakt.firma`), `telephone`, `email`, `address` (`PostalAddress`: Straße, PLZ, Ort, `addressCountry` `DE`), `openingHoursSpecification` (Mo–Fr 9–17, Sa 11–15), `url` (`Astro.site`), `image`, `sameAs` nur, wenn Profile im Repo belegt sind (sonst weglassen, nicht erfinden).
- Dafür `kontakt.ts` um strukturierte Felder ergänzen (z. B. `adresseStrasse`, `plz`, `ort`, `oeffnungszeiten` als Liste `{ tage, von, bis }`) und die vorhandenen Textfelder daraus ableiten, damit es keine doppelte Quelle gibt. Optik darf sich nicht ändern.
- **Keine Preise, kein Bestand, keine Verfügbarkeit** (keine `Offer`/`Product`).
- Ausgabe als `<script type="application/ld+json" set:html={JSON.stringify(daten)} />` (Astro-Doku `set:html` prüfen).
- Test: Startseite enthält genau ein JSON-LD, es parst, `@type` und `address.postalCode` stimmen.

## Aufgabe E4: Sicherheits-Header und CSP

- `public/_headers` für `/*` ergänzen: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `X-Frame-Options: DENY`, dazu `Content-Security-Policy: frame-ancestors 'none'` (lässt sich nicht per `<meta>` setzen). `X-Robots-Tag` bleibt.
- `astro.config.mjs`: `security.csp` mit
  - `directives`: `default-src 'self'`, `img-src 'self' data:`, `font-src 'self'`, `connect-src 'self'`, `base-uri 'self'`, `form-action 'self' mailto:`, `object-src 'none'`.
  - `scriptDirective.hashes`: Hash des `is:inline`-Kopf-Skripts (SHA-256 über den exakten Inhalt im Build; kleines Node-Skript in `scripts/` oder Test, der den Hash aus `dist/index.html` nachrechnet und mit der Konfiguration vergleicht, damit eine Änderung am Kopf-Skript auffällt).
  - `styleDirective.resources`: `"'self'"` und `{ resource: "'unsafe-inline'", kind: "attribute" }` für die verbliebenen `style="--c:…"`-Attribute (sofern D sie nicht schon in Klassen überführt hat; dann weglassen).
- Prüfen im Browser (`wrangler dev`): keine CSP-Verletzungen in der Konsole auf allen 13 Seiten (der Optik-Test meldet Konsolenfehler), Signaturen (Canvas), Formular (`mailto:`) und Glasurbühne funktionieren.
- Test: Antwort-Header von `/` enthalten die vier Sicherheits-Header; jede Seite hat genau ein CSP-`<meta>`.

## Aufgabe E5: Go-live-Schalter vorbereiten (nur dokumentieren)

Nicht umstellen. In `konzept/GO-LIVE.md` die genauen Änderungen für Phase 5 aufschreiben: `X-Robots-Tag` aus `_headers` entfernen, `robots.txt` öffnen und Sitemap-Zeile ergänzen, `konzept/redirects-vorschlag.txt` nach `public/_redirects` übernehmen (Grenzen laut Cloudflare-Doku: 2.000 statische, 100 dynamische Regeln), `konzept/figures.json` für WordPress-Bildpfade auswerten, Domain `kwm-1924.de` auf den Worker legen.

## Abschluss
Endprüfung `code-review` (Opus), zusätzlich Skill `security-review` für Header und CSP; Bericht `konzept/PHASE-E-BERICHT.md`; `ADMIN-OFFEN.md` ergänzen.
