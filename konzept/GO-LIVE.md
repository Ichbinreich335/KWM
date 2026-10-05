# Go-live: Schalter für Phase 5

Dieses Dokument beschreibt nur. Nichts davon ist umgestellt. Die Website bleibt bis zur Freigabe durch den Admin unsichtbar für Suchmaschinen (`noindex`, `Disallow: /`).

Reihenfolge: erst Vorbereitung (Abschnitt 1 bis 4) auf einem Vorschau-Deploy prüfen, dann Domain umlegen (5), dann Sicherheit schärfen (6) und nachprüfen (7).

## 1. Indexierung öffnen

- [ ] In `public/_headers` die Zeile `X-Robots-Tag: noindex, nofollow` unter `/*` entfernen. Die anderen Header bleiben.
- [ ] `public/robots.txt` ersetzen durch:

  ```txt
  User-agent: *
  Allow: /

  Sitemap: https://kwm-1924.de/sitemap-index.xml
  ```

- [ ] Im Build prüfen: `dist/robots.txt` und `dist/_headers` enthalten die neuen Inhalte. `dist/sitemap-index.xml` und `dist/sitemap-0.xml` sind vorhanden.
- [ ] Die Tests in `tests/` prüfen heute noch `noindex`. Vor dem Umstellen den Test in `tests/routen.spec.ts` (Zeile mit `x-robots-tag`) anpassen, sonst schlägt er fehl.
- [ ] Die Seiten 404 und Datenschutz stehen nicht in der Sitemap. Das bleibt so. Datenschutz hat bewusst Canonical neben `noindex`, die 404-Seite hat keinen Canonical.

## 2. Weiterleitungen alte Website

Vorlage: `konzept/redirects-vorschlag.txt` (rund 210 Regeln, davon 7 mit Splat oder Platzhalter).

- [ ] Die Datei nach `public/_redirects` kopieren (ohne Dateiendung, im Ordner `public/`).
- [ ] Grenzen laut Cloudflare: höchstens 2.000 statische und 100 dynamische Regeln, zusammen 2.100. Je Regel höchstens 1.000 Zeichen. Statische Regeln stehen vor dynamischen. Bei mehreren Regeln für dieselbe Quelle gilt die oberste. Die Vorlage liegt weit darunter.
- [ ] Wichtig: `_redirects` wirkt nur auf ausgelieferte Dateien (Static Assets), nicht auf Antworten von Worker-Code. Sobald ein Formular-Worker (`/api/anfrage`) davor liegt, gilt das für dessen Pfade nicht.
- [ ] Reicht der Platz einmal nicht, nimmt man Bulk Redirects (Cloudflare-Dashboard). Diese laufen vor dem Worker.
- [ ] Die in der Vorlage genannten Annahmen (Kopfzeilen 1 bis 6) auf einem Vorschau-Deploy prüfen, vor allem Anker im Ziel und die Reihenfolge der Regeln.
- [ ] Mit `curl -I https://<vorschau>/alter-pfad/` stichprobenartig prüfen: Status 301, `location` zeigt auf die neue Seite ohne `.html`.
- [ ] Englische Seiten stehen vorerst auf 302. Sobald es einen englischen Bereich gibt, auf 301 und neue Ziele umstellen. `hreflang` ist noch nicht gesetzt und kommt dann in `src/layouts/BaseLayout.astro` neben den Canonical.

Quelle: Cloudflare-Doku „Redirects“ (https://developers.cloudflare.com/workers/static-assets/redirects/) und „Limits“, Abschnitt Static Assets (https://developers.cloudflare.com/workers/platform/limits/), über den MCP `cloudflare-docs` abgefragt am 05.10.2026.

## 3. Alte Bildpfade (WordPress)

`konzept/figures.json` listet 32 Archivseiten der alten Website mit zusammen 85 Bildern (Feld `file`, Beschriftung meist leer).

- [ ] Die Liste auswerten: Welche Bilder gehören zu Seiten, die in der neuen Website weiterleiten? Nur dafür Bildpfade klären.
- [ ] Alte Pfade wie `/wp-content/uploads/...` und `/fileadmin/...` bekommen keine eigene Weiterleitung, solange das Bild nicht in der neuen Website liegt. Dort greift die 404-Seite.
- [ ] Nur Bilder übernehmen, deren Rechte geklärt sind (siehe `konzept/CONTENT-FUNDE.md`, Abschnitt zu Fremdgrafiken). Übernommene Bilder nach `src/assets` legen, nicht nach `public/`.
- [ ] Das öffentlich abrufbare Bild mit dem Dashboard-Screenshot (`FRAGEN-AN-DIE-WERKSTATT.md`, A2) muss die Werkstatt vor dem Go-live in der alten Mediathek löschen.

## 4. Vorschau-Prüfung vor dem Umlegen

- [ ] `npm run check` grün, CI grün.
- [ ] Vorschau-Deploy des Branches öffnen und alle 13 Seiten ansehen (Desktop 1440 px, Handy 390 px). Konsole ohne Fehler und ohne CSP-Meldung.
- [ ] Die Header der Vorschau prüfen: `curl -I https://<vorschau>/` zeigt `x-content-type-options`, `referrer-policy`, `permissions-policy`, `x-frame-options`, `content-security-policy`.
- [ ] Admin gibt den Go-live frei (Live-Schaltung braucht seine Freigabe).

## 5. Domain `kwm-1924.de` auf den Worker legen

Voraussetzung: Die Domain liegt als Zone im Cloudflare-Konto, oder der Admin stellt die Nameserver darauf um. Zugang zum bisherigen Domain- und DNS-Anbieter wird gebraucht.

- [ ] Alte Website sichern (Export der Texte und Bilder), bevor sie abgeschaltet wird.
- [ ] TTL der bestehenden DNS-Einträge einige Stunden vorher auf 5 Minuten senken.
- [ ] In Cloudflare: Workers & Pages, Worker `kwm-redesign`, Settings, Domains & Routes, „Add Custom Domain“, `kwm-1924.de` eintragen. Optional auch `www.kwm-1924.de` und dort auf die Hauptdomain umleiten.
- [ ] Alte DNS-Einträge für Web (A, AAAA, CNAME) entfernen, die mit der Custom Domain kollidieren. Mail-Einträge (MX, SPF, DKIM) bleiben unverändert.
- [ ] Warten, bis das Zertifikat aktiv ist (Status im Dashboard), dann `https://kwm-1924.de/` aufrufen.
- [ ] Die Weiterleitungen aus Abschnitt 2 auf der echten Domain stichprobenartig prüfen.

## 5a. Formular scharf schalten (vor oder mit dem Umlegen)

Bis dahin läuft das Formular in Vorschauen im Vorschau-Modus (kein Turnstile, kein Versand, Hinweis „Vorschau“). Produktion ist streng: `ANFRAGE_MODUS` steht in `wrangler.jsonc` oben auf `produktion`, nur der `previews`-Block auf `vorschau`. Ein Test (`src/data/umgebung.test.ts`) sichert das.

- [ ] Produktions-Branch festlegen: Der Build erkennt einen Vorschau-Build daran, dass `WORKERS_CI_BRANCH` vom Produktions-Branch abweicht. Standard ist `main`. Heißt der Branch anders, in Workers Builds unter Settings, Build, Build variables die Variable `PRODUKTIONS_BRANCH` auf den Namen setzen. Sonst zeigt die Live-Seite kein Turnstile-Widget, der Worker lehnt aber ohne Token ab, und jede Anfrage scheitert.
- [ ] Turnstile-Widget in Cloudflare anlegen (Hostnamen `kwm-1924.de` und `www.kwm-1924.de`). Den Site-Key in `src/data/turnstile.ts` eintragen (ersetzt den öffentlichen Testschlüssel).
- [ ] Secret setzen: `npx wrangler secret put TURNSTILE_SECRET` (nie ins Repo).
- [ ] Zieladresse der Werkstatt freigeben lassen und in `wrangler.jsonc` als `ANFRAGE_ZIEL` eintragen (ersetzt `ziel@example.invalid`).
- [ ] Email Routing im Dashboard aktivieren und die Zieladresse als verifizierte Adresse eintragen. Der Versand geht nur an verifizierte Adressen; der Absender `anfrage@kwm-1924.de` muss zur Domain gehören.
- [ ] `ERLAUBTE_ORIGINS` und `TURNSTILE_HOSTNAMES` enthalten die echte Domain (Standard bereits so).
- [ ] Nach dem Deploy: Testanfrage von `https://kwm-1924.de/kontakt/` senden, Mail kommt an, Antwort „Danke“.

## 6. Sicherheit auf der eigenen Domain schärfen

Erst nach Abschnitt 5, wenn HTTPS auf `kwm-1924.de` fehlerfrei läuft.

### HSTS

Empfehlung: Einstellung im Cloudflare-Dashboard statt Header in `_headers`. So gibt es genau eine Quelle, und Cloudflare sendet den Header nur für HTTPS-Anfragen der eigenen Domain. Ein zusätzlicher Header in `_headers` würde auch auf `workers.dev` gesendet. Das soll nicht sein.

- [ ] Prüfen, ob alle Subdomains von `kwm-1924.de` HTTPS können (DNS-Liste im Dashboard durchgehen, auch alte Einträge wie `mail.` oder `shop.`).
- [ ] Dashboard: SSL/TLS, Edge Certificates, „HTTP Strict Transport Security (HSTS)“, „Enable HSTS“. Max Age zuerst 6 Monate.
- [ ] „Apply HSTS policy to subdomains“ nur einschalten, wenn die Prüfung oben bestanden ist. Sonst aus lassen. Subdomains ohne HTTPS wären sonst nicht mehr erreichbar.
- [ ] „Preload“ nur bewusst, später, wenn alles stabil ist: erst ab 12 Monaten Max Age möglich, danach Eintrag bei hstspreload.org. Das lässt sich kaum zurücknehmen. Standard: aus.
- [ ] Alternative, falls das Dashboard nicht genutzt werden soll: in `public/_headers` unter `/*` die Zeile `Strict-Transport-Security: max-age=31536000; includeSubDomains` ergänzen (ohne `includeSubDomains`, wenn nicht alle Subdomains HTTPS können). Dann die Dashboard-Einstellung aus lassen, damit nicht zwei Header entstehen.
- [ ] Vorsicht: Nach dem Einschalten HTTPS nicht abschalten und DNS-Einträge nicht auf „nur DNS“ stellen. Sonst ist die Seite für die Dauer von Max Age nicht erreichbar.

Quelle: Cloudflare-Doku „HTTP Strict Transport Security (HSTS)“ (https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/) und „Encrypt all, keep site secure“ (https://developers.cloudflare.com/use-cases/solutions/encrypt-all-keep-site-secure/), über den MCP `cloudflare-docs` abgefragt am 05.10.2026. Die Doku nennt für Max Age 6 Monate als Start und 12 Monate vor Preload.

### Cross-Origin-Opener-Policy (optional)

- [ ] In `public/_headers` unter `/*` die Zeile `Cross-Origin-Opener-Policy: same-origin` ergänzen. Die Seite öffnet keine Fenster fremder Dienste. Vorher die Vorschau durchklicken. Brechen später Pop-ups (z. B. Anmeldung oder Zahlung eines Dienstes), die Zeile wieder prüfen.

### CSP und Header für spätere Dienste

- [ ] Turnstile und der Formular-Worker `/api/anfrage` sind in `astro.config.mjs` (CSP) und im Worker bereits eingerichtet. Ändert sich die Domain des Workers, `form-action` und `connect-src` prüfen. Liegt er auf derselben Domain, reicht `'self'`.
- [ ] Wichtig: `_headers` gilt nur für statische Dateien. Antworten des Workers (z. B. `/api/anfrage`) bekommen diese Header nicht. Der Worker-Code setzt `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` und `Cache-Control: no-store` selbst.
- [ ] `frame-ancestors` ist nur per Header wirksam, nicht per `<meta>`. Das steht in `public/_headers`.
- [ ] Der Kopf-Skript-Hash steht in `astro.config.mjs`. Ändert sich das Inline-Skript in `BaseLayout.astro`, schlägt `tests/sicherheit.spec.ts` an. Dann den Hash neu eintragen.

## 7. Nach dem Umlegen prüfen

- [ ] `curl -I https://kwm-1924.de/` zeigt kein `x-robots-tag`, dafür die Sicherheits-Header und HSTS.
- [ ] `https://kwm-1924.de/robots.txt` und `/sitemap-index.xml` antworten mit 200.
- [ ] Stichprobe der alten Adressen leitet mit 301 weiter (Abschnitt 2).
- [ ] Google Search Console: Domain-Property anlegen (DNS-Bestätigung), Sitemap `https://kwm-1924.de/sitemap-index.xml` einreichen, Adressänderung nicht nötig, da dieselbe Domain.
- [ ] Nach einigen Tagen: Abdeckung und Fehler in der Search Console ansehen, Crawl-Fehler der alten Pfade nachbessern.
- [ ] Startseite im Test für strukturierte Daten von Google (Rich-Results-Test) und die Link-Vorschau (Open Graph) mit einem Teilen-Link prüfen.

## 8. Rückweg

- [ ] Bei einem Fehler zuerst `X-Robots-Tag: noindex, nofollow` und `Disallow: /` wieder setzen und neu deployen.
- [ ] Die Custom Domain im Dashboard vom Worker entfernen und die alten DNS-Einträge zurücksetzen (TTL war niedrig gesetzt, siehe Abschnitt 5).
- [ ] HSTS lässt sich nicht sofort zurücknehmen: Max Age auf 0 stellen, Browser merken sich die Regel aber bis zum Ablauf. Deshalb HTTPS nicht abschalten.
