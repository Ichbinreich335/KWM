# Phase 3: Anfrageformular über einen Cloudflare Worker – Feinplanung

> **Für ausführende Agenten:** Diese Datei ist der Auftrag. Vorher `CLAUDE.md` lesen, den MCP `cloudflare-docs` befragen und die Skills `workers-best-practices`, `wrangler` und `turnstile-spin` laden. Am Ende Skill `security-review` (Pflicht für Server-Code laut CLAUDE.md). Ausführung durch Sonnet, Prüfung durch Tests.

Stand: 05.10.2026 (Opus). Entscheidung Admin 05.10.: Formular über einen Cloudflare Worker.

## Ausgangslage

- Heute: `src/components/InquiryForm.astro` + `src/scripts/sig-anfrage.ts` prüfen die Felder im Browser und öffnen eine vorbereitete E-Mail (`mailto:`). Felder: `name`, `email`, `telefon` (optional), `stueck` (vorbelegt über `/besuch?stueck=…`), `nachricht`.
- Website: statische Assets im Worker `kwm-redesign` (`wrangler.jsonc`, kein `main`).

## Ziel

`POST /api/anfrage` nimmt die Anfrage an, prüft sie und schickt sie als E-Mail an das Postfach der Werkstatt. Die Seite bleibt statisch: Nur `/api/*` läuft durch Worker-Code (`assets.run_worker_first: ["/api/*"]`, Doku „Static Assets → Worker Script“).

## Bausteine (laut Doku geprüft am 05.10.2026)

- **Versand:** `send_email`-Binding mit `destination_address` = verifizierte Zieladresse der Werkstatt. Laut Doku „Email Service → Pricing/Limits“ auf allen Tarifen kostenlos und ohne Kontingent, solange an verifizierte eigene Adressen gesendet wird. Absender muss eine Routing-Domain sein (z. B. `anfrage@kwm-1924.de`), deshalb braucht es die Domain bei Cloudflare mit Email Routing. `Reply-To` = Adresse des Besuchers, damit „Antworten“ direkt beim Besucher landet.
- **Spam-Schutz:** Cloudflare Turnstile (kostenlos). Widget im Formular, Prüfung serverseitig über Siteverify (Secret als Worker-Secret, nie im Repo; Site-Key öffentlich als `PUBLIC_TURNSTILE_SITEKEY` beim Build). Hostname im Siteverify-Ergebnis prüfen. Zusätzlich ein unsichtbares Honigtopf-Feld.
- **Missbrauch:** Größenlimit des Bodys (z. B. 10 KB), nur `POST` und `Content-Type` JSON oder Formular, `Origin` muss die eigene Seite sein, Rate Limiting über das Workers-Rate-Limiting-Binding, falls laut Doku im Free-Tarif verfügbar (sonst weglassen und im Bericht vermerken).
- **Eine Quelle für die Regeln:** Die Prüfregeln (Pflichtfelder, E-Mail-, Telefon-Muster, Fehlertexte) wandern aus `sig-anfrage.ts` in ein gemeinsames Modul (z. B. `src/lib/anfrage.ts`), das Browser-Skript und Worker beide importieren.

## Aufgaben

### F1: Worker-Gerüst
- `worker/index.ts` (TypeScript strict, Typen über `wrangler types`), `wrangler.jsonc`: `main`, `assets.binding: "ASSETS"`, `run_worker_first: ["/api/*"]`, `send_email`-Binding, Variablen ohne Geheimnisse. Alle anderen Pfade gehen unverändert an die Assets (404-Seite bleibt).
- `_headers` gilt nicht für Worker-Antworten (Doku): Sicherheits-Header in der API-Antwort selbst setzen; `Cache-Control: no-store`.

### F2: Endpunkt `/api/anfrage`
- Ablauf: Methode/Größe/Origin prüfen → Felder parsen → Honigtopf → gemeinsame Regeln → Turnstile-Siteverify → E-Mail bauen (nur Text, Werte nicht als HTML, Betreff „Anfrage: <stueck oder Allgemein>“, Zeilenumbrüche normalisieren, Header-Injection ausschließen) → senden.
- Antworten als JSON mit deutschen Meldungen: 200 `{ ok: true }`, 400 Feldfehler (je Feld), 403 Turnstile/Origin, 413 zu groß, 429 zu viele Anfragen, 502 Versand fehlgeschlagen. Keine internen Details nach außen; Fehler in Workers Logs (ohne Nachrichtentext, Datensparsamkeit).
- Anfragen werden nirgends gespeichert.

### F3: Formular im Browser
- `sig-anfrage.ts`: statt `mailto:` ein `fetch('/api/anfrage', { method: 'POST' })`; bestehender Danke-Zustand bei Erfolg; Feldfehler aus der Antwort an den Feldern anzeigen; bei Versandfehler verständliche Meldung mit Ausweg (Telefon und E-Mail-Adresse aus `kontakt.ts` als Link).
- Turnstile-Widget im Formular (Modus „managed“, Sprache Deutsch), Knopf erst aktiv, wenn das Token da ist, oder Token beim Absenden abwarten (Doku entscheiden). Tastatur und Screenreader prüfen.
- CSP aus Phase E erweitern: `script-src` und `frame-src` um `https://challenges.cloudflare.com` (genau laut Turnstile-Doku), `connect-src 'self'` reicht für den Endpunkt. `form-action` bleibt.
- Datenschutzerklärung: Absatz zu Turnstile und zum Versand über Cloudflare als Entwurf vorbereiten und in `ADMIN-OFFEN.md` zur rechtlichen Prüfung vorlegen (nicht selbst final formulieren).

### F4: Tests
- Unit-Tests (Vitest) für die gemeinsamen Regeln und den Handler; Worker-Tests laut Doku mit `@cloudflare/vitest-pool-workers` (Turnstile-Testschlüssel „immer gültig“ und „immer ungültig“ aus der Turnstile-Doku, `send_email` gemockt).
- Playwright: Formular absenden gegen `wrangler dev` mit Testschlüsseln → Danke-Zustand; Fehlerfall (Route auf 502 umbiegen) → Meldung mit Ausweg. Optik-Tests bleiben grün (Widget nur im Formularbereich; Referenzen gezielt erneuern).
- `npm run check` grün.

### F5: Security-Review und Bericht
- Skill `security-review` über den Branch, Befunde beheben.
- Bericht `konzept/PHASE-3-BERICHT.md`, `GO-LIVE.md` ergänzen (Turnstile-Widget im Werkstatt-Konto anlegen, Secret setzen, Zieladresse verifizieren, Email Routing aktivieren).

## Voraussetzungen vom Admin (bis dahin mit Testschlüsseln bauen)

1. Ziel-Mailadresse der Werkstatt (wird bei Cloudflare verifiziert).
2. Cloudflare-Konto der Werkstatt mit der Domain `kwm-1924.de` (Email Routing). Vorher ist echtes Senden nicht möglich.
3. Turnstile-Widget im Werkstatt-Konto (Site-Key, Secret) – kann ich mit einem Token anlegen.

## Branch

`phase-3-formular` von `phase-e-seo` (wegen CSP). Vor dem Merge auf den Stand der Bausteine rebasen (Konflikte in `InquiryForm.astro`/`kontakt.ts` aus D4 möglich).
