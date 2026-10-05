# Offen für den Admin

Laufende Liste: Was du tun, entscheiden oder abnehmen musst, und was mir unterwegs aufgefallen ist. Neueste Einträge oben in jedem Abschnitt. Erledigtes wandert nach unten.

Stand: 04.10.2026

## Abnehmen

| Was | Wo | Hinweis |
|---|---|---|
| **Phase D: Komponenten-Bibliothek (D1 bis D5)** | Branches `phase-d1-geruest` bis `phase-d5-bilder` · Bericht `konzept/PHASE-D-BERICHT.md` | Optik unverändert bis auf Ruling 27: „Mo–Fr“, „Sonst“ und Telefon „+49 201 30 50 80“ jetzt überall gleich (Besuch, Impressum, AGB, Datenschutz). Bitte ansehen; offen: zwei Farbsätze für dieselben Glasurtöne (Farbskala und Glasurbühne) angleichen? |
| **Phase A: Website auf Astro (1:1)** | Vorschau https://astro-umbau-kwm-redesign.entwicklung-7f3.workers.dev · PR [#4](https://github.com/Ichbinreich335/KWM/pull/4) (Entwurf) · Bericht `konzept/ASTRO-BERICHT.md` | Sieht aus wie V3, nur ohne Entwurf-Panel. Auf Handy und Rechner durchklicken. Nach OK: PR auf „bereit“ stellen und mergen (ersetzt die Produktion auf `workers.dev`, nicht `kwm-1924.de`). |

## Tun (nur du kannst das)

| Was | Warum | Wie |
|---|---|---|
| Build-Befehl bei der Vorschau `astro-umbau` setzen | Die Vorschau hat ihre Einstellungen beim Anlegen kopiert (leerer Build-Befehl), automatische Builds dieses Branches scheitern deshalb. Ich lade die Vorschau so lange von Hand hoch, der Link ist aktuell. Neue Branches erben schon `npm run build`. | Dashboard → `kwm-redesign` → Previews → `astro-umbau` → Settings → Build command `npm run build`. Oder die Vorschau löschen, wenn du so weit bist; sie entsteht beim nächsten Push neu. |

## Anfrageformular (Phase 3, Branch `phase-3-formular`): was für den echten Betrieb fehlt

| Was | Warum | Wie |
|---|---|---|
| Domain `kwm-1924.de` und Email Routing im Cloudflare-Konto der Werkstatt | Ohne sie kann der Worker nicht senden (Absender `anfrage@kwm-1924.de` muss eine Routing-Domain sein) | Siehe `konzept/GO-LIVE.md` |
| Ziel-Adresse der Werkstatt nennen und in Cloudflare verifizieren | Ist als Platzhalter `ziel@example.invalid` in `wrangler.jsonc` (Variable `ANFRAGE_ZIEL`); Versand geht nur an verifizierte Adressen | Adresse bei Email Routing → Zieladressen eintragen und bestätigen, dann Variable setzen |
| Turnstile-Widget im Werkstatt-Konto anlegen | Site-Key (öffentlich) und Secret. Kann ich mit einem Token anlegen | Hostnamen `kwm-1924.de`, `www.kwm-1924.de`, Modus „Managed“. Site-Key als `PUBLIC_TURNSTILE_SITEKEY` in den Build-Variablen, Secret per `wrangler secret put TURNSTILE_SECRET` |
| Vorschauen: Secret `TURNSTILE_SECRET` mit dem Testschlüssel `1x0000000000000000000000000000000AA` setzen | Vorschauen erben keine Produktionseinstellungen. Ohne Secret antwortet das Formular dort mit „nicht zugestellt“ (Seite sonst unverändert) | Dashboard → `kwm-redesign` → Settings → Variablen und Secrets → „Previews Base“, oder `npx wrangler preview secret put TURNSTILE_SECRET` |
| Rechtliche Prüfung: Absatz zu Turnstile und Versand für die Datenschutzerklärung | Auf der Seite steht nur ein Hinweis am Formular, die Erklärung selbst ist noch leer | Entwurf unten, bitte prüfen lassen |

**Entwurf Datenschutz (nicht final, rechtlich prüfen lassen):**
„Anfrageformular. Wenn Sie uns über das Formular schreiben, verarbeiten wir Name, E-Mail-Adresse, Telefonnummer (freiwillig) und Ihre Nachricht, um Ihre Anfrage zu beantworten (Art. 6 Abs. 1 lit. b DSGVO). Die Angaben werden per E-Mail an uns übermittelt und auf dieser Website nicht gespeichert. Für den Versand und zum Schutz vor automatisiertem Missbrauch nutzen wir Dienste der Cloudflare, Inc. (Cloudflare Workers, Cloudflare Email Service, Cloudflare Turnstile). Turnstile wird erst geladen, wenn Sie ein Formularfeld anwählen, und prüft über technische Merkmale Ihres Browsers, ob eine Person die Anfrage sendet (berechtigtes Interesse, Art. 6 Abs. 1 lit. f DSGVO). Dabei kann Ihre IP-Adresse an Cloudflare übermittelt werden. Zum Schutz vor zu vielen Anfragen wird Ihre IP-Adresse kurzzeitig in einem Zähler verarbeitet. Cloudflare ist unter dem EU-US Data Privacy Framework zertifiziert; weitere Hinweise: Turnstile Privacy Addendum von Cloudflare.“
Offen für die Prüfung: Auftragsverarbeitungsvertrag mit Cloudflare, Speicherdauer der E-Mails im Postfach der Werkstatt, ob eine Einwilligung statt berechtigtem Interesse nötig ist.

## Entscheiden

| Frage | Optionen | Meine Empfehlung |
|---|---|---|
| Vorschauen der alten Branches (`design-v3`, `claude/softr-lager-app`, `claude/baserow-nachbau`, `design-v2` …) | Sie scheitern seit 04.10. an einer neuen Cloudflare-Pflichtangabe (`previews`-Block). (a) Angabe dort ergänzen, (b) ignorieren, (c) Branches später aufräumen | (b), solange sie nicht gebraucht werden; nach dem Merge erben neue Branches die Angabe |
| Google Tag Manager vorziehen (Phase 4)? | Braucht GTM-Container-ID und Wahl des Einwilligungsbanners | Nach Phase B; Conversion „Anfrage gesendet“ ist erst mit dem Formular-Worker (Phase 3) sinnvoll |
| Vorschau-URLs schützen (E6)? | Cloudflare Access an/aus | Für den Prototyp nicht nötig (Seiten sind `noindex`) |

## Aufgefallen (zur Kenntnis)

- Sichtbare Kleinigkeiten aus dem Fehler-Audit (Tippflächen „Zu diesem Stück anfragen“ 43 px statt 44 px u. a.) stehen in `konzept/ASTRO-BERICHT.md` Abschnitt 5 und werden in Phase B behoben.
- GitHub meldete Sicherheitshinweise zu `undici` (steckt im Werkzeug Wrangler, nicht in der Website). Behoben durch Wrangler 4.147 im Branch `astro-umbau`; wirkt auf `main` mit dem Merge.

## Erledigt

- 04.10.2026: Build-Befehl für Produktion und für neue Vorschauen gesetzt (Admin).
- 04.10.2026: Hilfsskripte ohne Funktion in `.shots/` entfernt (Admin-Entscheidung).
- 04.10.2026: Prototyp und frühe Entwürfe archiviert statt gelöscht (`archiv/`, Admin-Entscheidung).
- 04.10.2026: Entwurf-Panel entfernt, feste Fassung nach E5 (Admin-Hinweis).
