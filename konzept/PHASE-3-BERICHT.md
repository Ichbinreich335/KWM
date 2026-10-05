# Bericht Phase 3: Anfrageformular über einen Cloudflare Worker

Stand: 05.10.2026. Branch `phase-3-formular` (von `phase-e-seo`). Plan: `konzept/PLAN-PHASE-3-FORMULAR.md`.

## Ergebnis

- `POST /api/anfrage` im selben Worker wie die Website. Nur `/api/*` läuft durch Code (`run_worker_first`), alles andere bleibt statisch.
- Prüfreihenfolge: Methode → Ursprung (`Origin`) → Rate Limit (5 pro Minute und IP) → JSON und Größe (16 KB) → Honigtopf → gemeinsame Feldregeln (`src/lib/anfrage.ts`, auch im Browser) → Turnstile-Siteverify mit Hostname → Versand als reiner Text an die verifizierte Adresse der Werkstatt, `Reply-To` = Besucher.
- Im Browser ersetzt `fetch` den bisherigen `mailto:`-Schritt. Feldfehler stehen am Feld, bei Versandfehlern gibt es eine Meldung mit Telefon und E-Mail als Ausweg. Turnstile wird erst beim ersten Fokus ins Formular geladen.
- Gespeichert wird nichts. Die Logs enthalten keine Besucherdaten.

## Prüfung

- 50 Worker-Tests (Vitest in workerd): Regeln, alle Statuscodes, Honigtopf, Kopfzeilen-Injection, Ursprünge, Routing. 10 Playwright-Tests des Formulars gegen `wrangler dev` mit dem Turnstile-Testschlüssel. Optik, Barrierefreiheit und Sicherheit grün. `npm run check` grün. Die Vorschau-Builds mit den neuen Bindings laufen erfolgreich.
- Sicherheitsprüfung (Opus): Die Reihenfolge der Prüfungen stimmt, Injection ist abgefangen, Fehlermeldungen geben keine internen Details preis. Gehärtet wurden das E-Mail-Muster (ohne `< > " , ;`), der Vorschau-Ursprung (nur Konto-Subdomain) und ein eigener Rate-Limit-Zähler für Vorschauen.

## Für den echten Betrieb (Admin, nach dem Konto-Umzug)

1. Domain `kwm-1924.de` im Cloudflare-Konto der Werkstatt, Email Routing aktivieren.
2. Zieladresse der Werkstatt als Destination Address verifizieren, `ANFRAGE_ZIEL` setzen.
3. Turnstile-Widget anlegen (Hostnames `kwm-1924.de`, `www.kwm-1924.de`): Site-Key als Build-Variable `PUBLIC_TURNSTILE_SITEKEY`, Secret per `wrangler secret put TURNSTILE_SECRET`. Für Vorschauen das Testsecret aus der Turnstile-Doku setzen.
4. `ERLAUBTE_ORIGINS` der Vorschauen auf die neue Konto-Subdomain anpassen.
5. CSP mit dem echten Site-Key im Browser prüfen (keine Verletzungen).
6. Datenschutzerklärung: Entwurf zu Turnstile und Versand über Cloudflare rechtlich prüfen lassen (`ADMIN-OFFEN.md`).
