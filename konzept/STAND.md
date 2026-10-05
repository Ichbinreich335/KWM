# Stand Website-Umbau

Kurzüberblick: was fertig ist, was läuft, was als Nächstes kommt. Wird bei jedem Schritt aktualisiert. Was du tun oder entscheiden musst, steht in [ADMIN-OFFEN.md](ADMIN-OFFEN.md).

Stand: 05.10.2026, mittags

## Jetzt gerade

| Strang | Stand | Wo |
|---|---|---|
| **Bausteine, Teil 2** (unsichtbar) | läuft: Karten, Listen, Ausstellungsdaten in Sanity-Form | Branch `phase-d2-eintraege`, Ordner `../KWM-phase-d` |
| **Zitate angleichen** (sichtbar, Vergleich) | läuft: 5 Rollen statt 8 Darstellungen | Branch `zitate-angleichen`, Ordner `../KWM-zitate` |
| **Sanity, Teil 1** | fertig: Studio https://kwm.sanity.studio (deutsch), Schema, Seitenköpfe und Kontakt als Entwürfe | Branch `phase-2-sanity`, Ordner `../KWM-sanity`, Plan `PLAN-PHASE-2-SANITY.md` |
| **Handy kürzer** (Vergleich) | fertig, wartet auf deine Entscheidung (−17 %) | Branch `phase-b3-mobil-kurz`, Ordner `../KWM-mobil` |
| **Konzept Flyer/Galerien** (Vergleich) | fertig, wartet auf deine Entscheidung | Branch `konzept-flyer-galerien` |

## Fertig (wartet auf deine Abnahme)

Alle PRs sind Entwürfe und bauen aufeinander auf. Gemergt wird in dieser Reihenfolge.

| ✓ | Schritt | Was er technisch macht | Sichtbar? | PR |
|---|---|---|---|---|
| ✓ | Umzug auf Astro | Der HTML-Prototyp läuft jetzt als Astro-Seite auf Cloudflare. Jeder Branch bekommt automatisch eine Vorschau. | nein | #4 |
| ✓ | Varianten festgelegt | Entwurf-Panel, nicht gewählte Fassungen und ungenutzte Effekte sind gelöscht. | nein | #5 |
| ✓ | Fehler aus dem Audit | Tippflächen sind mindestens 44 px groß, der Fehler in der Farbskala am Handy ist behoben. | kaum | #6 |
| ✓ | CSS gebündelt | Statt 12 CSS-Dateien lädt die Seite 3, gehasht und dauerhaft gecacht. | nein | #7 |
| ✓ | Skripte in TypeScript | Die Skripte sind typgeprüft und gebündelt. Effekte werden erst geladen, wenn sie ins Bild kommen. | nein | #8 |
| ✓ | Bilder responsiv | Astro erzeugt für jedes Bild passende Größen. Das größte Bild ist 0,7 s früher da. | nein | #9 |
| ✓ | Schriften | Die Schriften laufen über Astros Fonts API, mit Vorladen und angepassten Ersatzschriften. | nein | #10 |
| ✓ | Feinschliff | Porträt rückt im schmalen Fenster, Feuer haftet, Aktuell-Karten auf einer Linie, Korrekturen nach DESIGN.md. | ja | #13 |
| ✓ | SEO und Sicherheit | Sitemap, Vorschaubilder für Links, strukturierte Daten, Sicherheits-Header, CSP; Go-live-Anleitung. | nein | #12 |
| ✓ | Bausteine Teil 1 | Wiederkehrende Abschnitte gibt es nur noch einmal als Baustein; jeder große Satz läuft über den Zitat-Baustein. | nein | #11 |
| ✓ | Vergleich Hell/Dunkel | Vier Fassungen der Startseite als Screens. Empfehlung: so lassen (siehe ADMIN-OFFEN). | – | `.shots/rhythmus/` |
| ✓ | Visuelles Review | Die externe Kritik ist geprüft: 14 von 20 Punkten stimmen. Der Bericht liegt in `VISUELLES-REVIEW.md`. | – | – |

## Als Nächstes

1. **Bausteine Teil 2–5** fertigstellen (Aufklapper, Orte, Formular, Kontaktdaten aus einer Quelle, Bilder).
2. **Sanity Teil 2:** Website liest Ausstellungen, Orte, Galerien, Hinweise, Seitenköpfe und Kontakt beim Bauen aus Sanity; Inhalte importieren; Neubau per Webhook. Webhook erst nach dem Konto-Umzug.
3. **Deine Entscheidungen einarbeiten:** Handy kürzer, Flyer/Galerien, Zitate (danach ggf. reduzieren).
4. **Anfrageformular** als Cloudflare Worker mit Turnstile (nach Konto-Umzug; braucht Ziel-Mailadresse und die Domain bei Cloudflare).
5. **Einwilligung + Google Tag Manager** (braucht GTM-ID und Banner-Wahl).
6. **Merge-Kette nach `main`**, dann ein gebündeltes `/code-review` über den Sammel-Stand und alle Funde beheben.
7. **Go-live** (`GO-LIVE.md`), nach deiner Freigabe.

## Warum in Schritten und nicht alles beim Umzug

Der Umzug musste pixelgleich bleiben. Nur so beweist der automatische Bildvergleich, dass beim Umzug nichts kaputtgegangen ist. Jeder spätere Schritt ändert genau eine Sache, und der Vergleich zeigt sofort, wenn sich dabei ungewollt etwas verschiebt.
