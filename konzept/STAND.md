# Stand Website-Umbau

Kurzüberblick: was fertig ist, was läuft, was als Nächstes kommt. Wird bei jedem Schritt aktualisiert. Was du tun oder entscheiden musst, steht in [ADMIN-OFFEN.md](ADMIN-OFFEN.md).

Stand: 04.10.2026, abends

## Jetzt gerade (Pause ab 04.10.2026, nachts)

Alle Agenten sind fertig, nichts läuft mehr. Weiter geht es in der nächsten Sitzung mit „Als Nächstes“.

| Strang | Stand | Wo |
|---|---|---|
| **Feinschliff** (sichtbar) | Teil 1 (Porträt, Feuer, Schärfe) und Teil 2 (Korrekturen nach DESIGN.md) fertig und geprüft. Teil 3 (Raster, °C) fertig, Prüfung steht aus; offene Frage: beim Aufklappen einer Aktuell-Karte wachsen die Nachbarkarten mit. Vorschau: https://phase-b3-feinschliff-kwm-redesign.entwicklung-7f3.workers.dev | Branch `phase-b3-feinschliff`, Ordner `../KWM-phase-b3`, Plan `konzept/PLAN-PHASE-B3.md` (im Branch) |
| **Bausteine, Teil 1** (unsichtbar) | Seitenkopf, Sprungleiste, Abschnittskopf, Kapitelrahmen, Fließtext fertig und geprüft. Zitat-Baustein (alle großen Sätze, 7 Varianten) fertig, Prüfung steht aus. Danach PR. Branch gepusht. | Branch `phase-d1-geruest`, Ordner `../KWM-phase-d` |

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
| ✓ | Vergleich Hell/Dunkel | Vier Fassungen der Startseite als Screens. Empfehlung: so lassen (siehe ADMIN-OFFEN). | – | `.shots/rhythmus/` |
| ✓ | Visuelles Review | Die externe Kritik ist geprüft: 14 von 20 Punkten stimmen. Der Bericht liegt in `VISUELLES-REVIEW.md`. | – | – |

## Als Nächstes

1. **Prüfungen nachholen**: Feinschliff Teil 3 und Zitat-Baustein (je Sonnet). Danach Entwurfs-PR „Feinschliff“ (Teil 1–3) und Entwurfs-PR „Bausteine Teil 1“.
2. **Handy kürzer, als Vergleich**: eigener Branch vom sauberen Feinschliff-Stand mit eigener Vorschau. Ziel etwa −25 % am Handy, der Desktop bleibt. Die Reise und alle starken Elemente bleiben, Orte nur behutsam. Dazu eine Vergleichsseite mit beiden Links und Screens. Plan: `PLAN-PHASE-B3.md`, Aufgabe B3-5.
3. **Zitate angleichen** (sichtbar, mit Vergleich): Der Zitat-Baustein zeigt, wo dieselbe Rolle in verschiedenen Varianten steht. Angeglichen wird je Stelle mit einer Zeile.
4. **Konzept-Vergleiche für Inhalte**: Ausstellung mit Flyer-Scan (drei Darstellungen), Galerien (Startseite oder eigene Unterseite).
5. **Bausteine, Teil 2 bis 5**: Karten, Listen, Aufklapper, Formular, Bilder. Daten-Dateien nur für das, was später in Sanity kommt: Ausstellungen samt Flyer und Bildern, Orte bzw. Galerien; Werke später.
6. **SEO und Sicherheit**: Sitemap, Vorschaubilder für Links, strukturierte Daten, Sicherheits-Header. `noindex` bleibt bis zum Go-live.

## Warum in Schritten und nicht alles beim Umzug

Der Umzug musste pixelgleich bleiben. Nur so beweist der automatische Bildvergleich, dass beim Umzug nichts kaputtgegangen ist. Jeder spätere Schritt ändert genau eine Sache, und der Vergleich zeigt sofort, wenn sich dabei ungewollt etwas verschiebt.
