# Stand Website-Umbau

Kurzüberblick: was fertig ist, was läuft, was als Nächstes kommt. Wird bei jedem Schritt aktualisiert. Was du tun oder entscheiden musst, steht in [ADMIN-OFFEN.md](ADMIN-OFFEN.md).

Stand: 05.10.2026, vormittags

## Jetzt gerade

| Strang | Stand | Wo |
|---|---|---|
| **Feinschliff** (sichtbar) | Teil 1–3 fertig. **Porträt im schmalen Fenster erledigt:** Der Ausschnitt rückt, bis der Kopf ganz im Bild ist; das Zitat kommt unten rechts davon zum Liegen. In hochformatigen Fenstern stehen Bild und Zitat untereinander. Prüfung Teil 3: ein Befund (Aktuell-Karten wachsen beim Aufklappen mit) – Korrektur läuft (Subgrid). Danach Entwurfs-PR. Vorschau: https://phase-b3-feinschliff-kwm-redesign.entwicklung-7f3.workers.dev | Branch `phase-b3-feinschliff`, Ordner `../KWM-phase-b3` |
| **Bausteine, Teil 1** (unsichtbar) | Fertig und geprüft. Das Porträt-Zitat läuft jetzt auch über den Zitat-Baustein (Typ `zitat-bild`). Entwurfs-PR #11. | Branch `phase-d1-geruest`, Ordner `../KWM-phase-d` |
| **SEO und Sicherheit** (unsichtbar) | Gestartet: Sitemap, Canonical/Vorschaubilder für Links, strukturierte Daten. `noindex` bleibt. | Branch `phase-e-seo`, Ordner `../KWM-phase-e`, Testport 8799 |

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
| ✓ | Bausteine Teil 1 | Wiederkehrende Abschnitte gibt es nur noch einmal als Baustein; jeder große Satz läuft über den Zitat-Baustein. | nein | #11 |
| ✓ | Vergleich Hell/Dunkel | Vier Fassungen der Startseite als Screens. Empfehlung: so lassen (siehe ADMIN-OFFEN). | – | `.shots/rhythmus/` |
| ✓ | Visuelles Review | Die externe Kritik ist geprüft: 14 von 20 Punkten stimmen. Der Bericht liegt in `VISUELLES-REVIEW.md`. | – | – |

## Als Nächstes

1. **Feinschliff abschließen**: Aktuell-Karten korrigieren, dann Entwurfs-PR „Feinschliff“. Danach Bausteine Teil 1 auf den Feinschliff rebasen (zwei bekannte Konflikte).
2. **Handy kürzer, als Vergleich** (an einem anderen Tag, Admin): eigener Branch vom sauberen Feinschliff-Stand mit eigener Vorschau. Ziel etwa −25 % am Handy, der Desktop bleibt. Die Reise und alle starken Elemente bleiben, Orte nur behutsam. Dazu eine Vergleichsseite mit beiden Links und Screens. Plan: `PLAN-PHASE-B3.md`, Aufgabe B3-5.
3. **Zitate angleichen** (sichtbar, mit Vergleich): Der Zitat-Baustein zeigt, wo dieselbe Rolle in verschiedenen Varianten steht. Angeglichen wird je Stelle mit einer Zeile.
4. **Konzept-Vergleiche für Inhalte**: Ausstellung mit Flyer-Scan (drei Darstellungen), Galerien (Startseite oder eigene Unterseite).
5. **Bausteine, Teil 2 bis 5**: Karten, Listen, Aufklapper, Formular, Bilder. Daten-Dateien nur für das, was später in Sanity kommt: Ausstellungen samt Flyer und Bildern, Orte bzw. Galerien; Werke später.
6. **SEO und Sicherheit**: läuft (siehe oben); danach Sicherheits-Header und CSP.

## Warum in Schritten und nicht alles beim Umzug

Der Umzug musste pixelgleich bleiben. Nur so beweist der automatische Bildvergleich, dass beim Umzug nichts kaputtgegangen ist. Jeder spätere Schritt ändert genau eine Sache, und der Vergleich zeigt sofort, wenn sich dabei ungewollt etwas verschiebt.
