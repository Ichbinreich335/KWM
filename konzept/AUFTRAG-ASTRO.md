# Auftrag für eine Session: Website auf Astro umbauen (Cloudflare)

**Zuerst lesen:** `CLAUDE.md` (Regeln: erst Doku/MCP, dann Code) und `konzept/UEBERGABE.md`, Abschnitt 0.
**Werkzeuge:**
- MCP: `astro-docs`, `cloudflare-docs`, `cloudflare-builds`
- Skills: `wrangler`, `workers-best-practices`, `web-perf`, `seo-aeo-best-practices`

Ist ein MCP nicht erreichbar, z. B. in Cloud-Sessions ohne Netzwerkfreigabe: das melden, die offizielle Doku nennen und nicht raten.

## Werkzeug-Setup (Prototyp-Phase: der Agent macht so viel wie möglich selbst)
- **Cloudflare:** `npx wrangler login` (lokal). Danach erledigt der Agent Deploy, Vorschau, Workers Builds, Deploy Hook und Secrets per Wrangler oder MCP selbst.
- **Sanity:**
  - Anmelden: `npx sanity@latest login`.
  - Projekt anlegen (Studio im Ordner `studio/`): `npm create sanity@latest`.
  - MCP einrichten: `npx sanity@latest mcp configure`.
  - Danach legt der Agent Schema, Dataset, CORS, Webhook und Studio-Deploy per CLI oder MCP selbst an.
- **Tokens nur in `.env` / `.dev.vars` bzw. als Wrangler-Secret** (beide sind in `.gitignore`).
- Freigegebene Befehle stehen in `.claude/settings.json` (npm, npx astro, sanity, wrangler und die MCP-Server).

## Ausgangslage
- Statischer Prototyp: 7 Seiten in `src/*.html`, Partials in `src/partials/` (head, header, footer), zusammengesetzt von `tools/build.mjs` nach `site/`.
- Assets in `site/`: `styles.css`, `main.js` (Animationen), `img/`, `css/`, `_headers`, `robots.txt`, `404.html`.
- Deploy: Cloudflare Workers Static Assets (`wrangler.jsonc`, Name `kwm-redesign`, `html_handling: auto-trailing-slash`, `not_found_handling: 404-page`).
- Screenshot-Skripte für den Vorher-nachher-Vergleich liegen in `.shots/` (Playwright).

## Phase 1: Umbau 1:1, ohne sichtbare Änderung (eigener Branch/PR)
1. Astro (aktuelle Version **laut astro-docs-MCP**), Ausgabe `static`. Kein SSR.
2. Struktur:
   - `src/layouts/Base.astro`: Head, Header und Footer aus den Partials, aktiver Menüpunkt als Prop.
   - Jede Seite als `src/pages/*.astro`, Inhalt 1:1 aus `src/*.html`.
   - Statische Assets nach `public/` (CSS, JS, Bilder, `_headers`, `robots.txt`).
   - Die bisherigen URLs und das Trailing-Slash-Verhalten bleiben exakt gleich.
3. Deploy weiter auf Cloudflare Workers (Static Assets). `wrangler.jsonc` auf `dist/` umstellen und **Workers Builds** mit Vorschau-URLs pro Branch einrichten. Alles laut Cloudflare-Doku bzw. dem Skill `wrangler`.
4. **Abnahme:**
   - Screenshots aller Seiten (Desktop und Mobil) vorher und nachher zeigen keine sichtbaren Unterschiede.
   - Keine JS-Fehler.
   - 404-Seite und Header wie bisher.
   - Lighthouse nicht schlechter als vorher.
5. Altes Build-Skript und `site/` erst entfernen, wenn die Abnahme bestanden ist.

## Phase 2: Inhalte aus Sanity (eigener PR, sobald die Sanity-Projekt-ID da ist)
- Skills `sanity-best-practices`, `content-modeling-best-practices`, `portable-text-serialization` und den MCP `sanity` nutzen.
- **Inhaltstypen:**
  - Aktuelles
  - Ausstellung (Titel, Zeitraum, Ort/Galerie, Text, Bilder)
  - Galerie-Partner
  - Bild mit den Feldern „Fotograf:in / Bildrechte“
  - Später feste Seitentexte als eigene Singleton-Dokumente
- Astro liest beim Build. Webhook „Veröffentlicht“ → **Cloudflare Deploy Hook**. Die Hook-URL ist geheim, nur als Secret ablegen.
- Sanity Studio deployen, die Rolle Redakteur:in für die Tante vorsehen.
- Später: Visual Editing über eine eigene Vorschau-Instanz. Die öffentliche Seite bleibt statisch.

## Phase 3: Anfrageformular (eigener PR)
- Gleiche Felder wie bisher: Name, E-Mail, Nachricht, ggf. Telefon und Stück-Bezug.
- Ein **Cloudflare Worker** nimmt die Anfrage an und schickt sie per Mail ans Firmenpostfach. Es wird nichts gespeichert. Mailversand laut Cloudflare-Doku (Email Service bzw. `send_email` an eine verifizierte Zieladresse) oder über einen EU-Mailanbieter.
- **Bot-Schutz:** Cloudflare Turnstile (Skill `turnstile-spin`), dazu ein Honeypot-Feld und serverseitige Validierung.
- Erfolgs- und Fehlermeldungen auf Deutsch, barrierefrei. Hinweis in der Datenschutzerklärung.

## Phase 4: Cookie-Einwilligung + Google Tag Manager (eigener PR)
- Eine fertige Einwilligungslösung verwenden, **nicht selbst bauen** (siehe Entscheidung in UEBERGABE).
- **GTM erst nach Einwilligung** laden. Google **Consent Mode v2** mit Default „denied“. Conversion „Anfrage gesendet“ in GTM anlegen.
- Banner-Texte und Datenschutzerklärung juristisch prüfen lassen.

## Phase 5: SEO und Go-live
- Sitemap, Meta- und OG-Tags, JSON-LD (Organization/LocalBusiness), Skill `seo-aeo-best-practices`.
- **301-Weiterleitungen von alten WordPress-URLs** auf neue Seiten, z. B. `/neuigkeiten/...` (siehe `src/data/figures.json`), über `_redirects` bzw. die Cloudflare-Doku.
- DNS-Umzug: **MX- und Mail-Einträge unverändert übernehmen.**

## Was diese Session vom Admin braucht
- Phase 1: Zugriff auf das Cloudflare-Konto, also `wrangler login` lokal oder ein API-Token als Secret in der Cloud-Umgebung. Den Token nie in den Chat oder ins Repo schreiben.
- Phase 2: die Sanity-Projekt-ID und den Dataset-Namen. Die Projekt-ID ist nicht geheim, Tokens schon.
- Phase 3: die Ziel-Mailadresse des Firmenpostfachs.
- Phase 4: die GTM-Container-ID (`GTM-XXXX`) und den gewählten Einwilligungsanbieter.
- Phase 5: den DNS- und Domain-Anbieter samt Zugang (vermutlich der bisherige WordPress-Hoster).
