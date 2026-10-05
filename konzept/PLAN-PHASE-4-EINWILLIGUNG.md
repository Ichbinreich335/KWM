# Phase 4: Statistik und Einwilligung – Feinplanung

> **Für ausführende Agenten:** Erst umsetzen, wenn der Admin die Weiche unten entschieden hat. Vorher `CLAUDE.md` lesen und die Doku über MCP (`cloudflare-docs`, `astro-docs`) bzw. die offizielle Doku des gewählten Werkzeugs befragen.

Stand: 05.10.2026 (Opus).

## Weiche (Admin entscheidet)

| | A: nur Besucherzahlen | B: Google Tag Manager mit Einwilligung |
|---|---|---|
| Wozu | Wie viele Besucher, welche Seiten, woher, wie schnell lädt die Seite | Zusätzlich Google Analytics/Ads, Conversion „Anfrage gesendet“, Remarketing |
| Werkzeug | Cloudflare Web Analytics (kostenlos; laut Doku „privacy-first“, erhebt keine personenbezogenen Daten) | GTM-Container + Consent Mode v2 + Einwilligungsbanner |
| Banner | voraussichtlich keiner nötig (rechtlich bestätigen lassen) | Pflicht (TTDSG/DSGVO): Einwilligung vor dem Laden von Google-Diensten |
| Aufwand | klein: ein Skript (oder automatisch über Cloudflare), CSP-Eintrag | mittel: Banner, Consent Mode, GTM, CSP für Google-Domains, Datenschutztext, Test der Sperre vor Einwilligung |
| Datenschutz | sehr gut | Drittland-Übermittlung, AVV mit Google, ausführliche Erklärung |

**Empfehlung:** A, solange keine Werbung geschaltet wird. B nur, wenn Google Ads oder Conversion-Messung gebraucht werden.

## Umsetzung A

- Web Analytics im Cloudflare-Konto der Werkstatt für `kwm-1924.de` anlegen (nach dem Konto-Umzug). Bei einer Domain über Cloudflare kann das Beacon automatisch eingefügt werden; sonst das Snippet im `BaseLayout.astro` (nur in Produktion, nicht in Vorschauen).
- CSP aus Phase E: `script-src` und `connect-src` um die Beacon-Domains laut Doku erweitern; Test, dass keine CSP-Verletzung entsteht.
- Datenschutzerklärung: Absatz zu Web Analytics als Entwurf für die rechtliche Prüfung (`ADMIN-OFFEN.md`).

## Umsetzung B

- Einwilligungsbanner selbst gehostet, ohne Drittanbieter (z. B. Open-Source-Bibliothek mit Consent Mode v2 – Lizenz, Barrierefreiheit und Größe prüfen), deutsche Texte, „Ablehnen“ gleichwertig zu „Akzeptieren“, Einstellungen jederzeit wieder erreichbar (Link im Fuß).
- GTM erst nach Einwilligung laden; Consent-Mode-Standard „denied“. Conversion „Anfrage gesendet“ aus dem Formular (Phase 3) als `dataLayer`-Ereignis.
- CSP für die Google-Domains laut Google-Doku; Playwright-Test: vor Einwilligung keine Anfrage an Google-Domains, nach Ablehnen ebenso.
- Braucht vom Admin: GTM-Container-ID, Entscheidung über Dienste im Container, Datenschutztext rechtlich prüfen lassen.

## Branch

`phase-4-statistik` nach dem Formular (wegen CSP und Conversion), Rebase auf den Merge-Stand.
