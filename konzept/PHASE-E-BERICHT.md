# Bericht Phase E: Technisches SEO und Härtung

Stand: 05.10.2026. Branch `phase-e-seo`, gestartet von Phase C4. Plan: `konzept/PLAN-PHASE-E.md`. Sichtbar ändert sich nichts. `noindex` und `robots.txt` (Disallow) bleiben bis zum Go-live.

## Ergebnis

| Aufgabe | Was | Commit |
|---|---|---|
| E1 Sitemap | `@astrojs/sitemap`, 11 Seiten ohne 404 und Datenschutz, URLs ohne `.html`; `<link rel="sitemap">` im Kopf | a9e8bac |
| E2 Canonical, Open Graph | Canonical und `og:*` auf jeder Seite (404 ohne Canonical), Vorschaubild mit Größe und Alt-Text, `twitter:card` | 86d56da, 0e50290 |
| E3 Strukturierte Daten | JSON-LD `LocalBusiness`/`Store` nur auf der Startseite: Name, Adresse, Telefon, E-Mail, Öffnungszeiten. Keine Preise, kein Bestand, kein `sameAs` (keine Profile belegt). `kontakt.ts` ist die einzige Quelle für Adresse und Zeiten | 5981d95, 0e50290 |
| E4 Sicherheits-Header, CSP | `_headers`: nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options, `frame-ancestors 'none'`. CSP als `<meta>` über Astro: Skripte nur `'self'` plus Hashes; `'unsafe-inline'` nur für `style`-Attribute (Farbwerte der Farbskala und Glasuren) | a5cfa69 |
| E5 Go-live-Schalter | `konzept/GO-LIVE.md`: Indexierung öffnen, Weiterleitungen, Domain, HSTS über das Dashboard, Rückweg | 029cdd8 |

## Prüfung

- Playwright 114/114 grün, Optik pixelgleich zum Ausgangsstand, `npm run check` grün.
- Keine CSP-Verletzung auf allen 13 Seiten (Desktop und Handy). Interaktiv geprüft: Aufklapper, Glasurbühne, Menü am Handy, Anfrageformular.
- Ein Test rechnet den Hash des Kopf-Skripts nach; wer es ändert, muss die CSP mitziehen.
- Reviews: E1–E3 von Sonnet geprüft (freigegeben, drei Kleinigkeiten nachgezogen). Sicherheitsprüfung von E4 und Endprüfung durch Opus.

## Abweichungen und Hinweise

- `og:image` ist 937 px breit statt 1200 px, weil das Standardbild nicht größer vorliegt. Ein größeres Vorschaubild kommt mit den neuen Fotos (`BILDPLAN.md`).
- `hreflang` fehlt noch, die englischen Seiten liegen extern. Der Platz dafür ist neben dem Canonical in `BaseLayout.astro`.
- Für spätere Dienste (Formular-Worker, Turnstile) müssen `connect-src` und `script-src` erweitert werden (steht in `GO-LIVE.md`).
- Bei den Bausteinen vormerken: Telefon, E-Mail und Adresse stehen noch in `InquiryForm.astro`, `zahlung.astro`, `datenschutz.astro` und `sig-anfrage.ts` doppelt; sie sollen aus `kontakt.ts` kommen.
- Merge nach den Bausteinen (Teil 1). Vorher rebasen; Konflikte sind in `BaseLayout.astro` und `kontakt.ts` möglich.
