# Stand Website-Umbau

Kurzüberblick: was fertig ist, was läuft, was als Nächstes kommt. Wird bei jedem Schritt aktualisiert. Was du tun oder entscheiden musst, steht in [ADMIN-OFFEN.md](ADMIN-OFFEN.md).

Stand: 04.10.2026, abends

## Jetzt gerade

| Läuft | Was passiert | Wo |
|---|---|---|
| **Porträt und Feuer** (Feinschliff, Teil 1) | Am Handy stehen Porträt und Zitat untereinander, das Gesicht ist frei. Der Feuer-Text läuft bis unten mit. Porträt und Feuer werden schärfer. | Branch `phase-b3-feinschliff`, Ordner `../KWM-phase-b3` |
| **Bausteine, Teil 1b** (Abschnittskopf, Kapitelkopf, Einleitung, Fließtext) | Seitenkopf und Sprungleiste sind fertig und geprüft. Jetzt folgen die nächsten vier Bausteine. | Branch `phase-d1-geruest`, Ordner `../KWM-phase-d` |
| **Vergleich Hell/Dunkel** | Screens der Startseite in vier Fassungen (heute, Orte hell, ohne Grau, beides), nur zum Ansehen | `.shots/rhythmus/` |

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
| ✓ | Visuelles Review | Die externe Kritik ist geprüft: 14 von 20 Punkten stimmen. Der Bericht liegt in `VISUELLES-REVIEW.md`. | – | – |

## Als Nächstes

1. **Feinschliff, Teil 2 bis 4**: kleine Korrekturen nach DESIGN.md:
   - Rand der Unterzeile bei den 99 Schalen
   - doppelte Linie bei Besuch
   - Überschrift und Abstand der Orte
   - Schriftschnitt beim Meisterstücke-Satz
   - Farben der Nebentexte, „1300 °C“, „Mehr erfahren“
   - Raster: Lebensweg, Links der Aktuell-Karten, Fußzeile

   Danach misst ein Agent die Dichte am Handy, und du bekommst einen Vorschlag mit Vorher- und Nachher-Screens.
2. **Bausteine, Teil 1 fertig**: danach der Zitat-Baustein, dann der PR.
3. **Vorschlag kürzere Startseite** mit Screens, zur Entscheidung.
4. **Bausteine, Teil 2 bis 5**: Karten, Listen, Aufklapper, Formular, Bilder; Daten-Dateien nur für das, was später in Sanity kommt (Vorschlag: Ausstellungen, Orte, Werke).
5. **SEO und Sicherheit**: Sitemap, Vorschaubilder für Links, strukturierte Daten, Sicherheits-Header. `noindex` bleibt bis zum Go-live.

## Warum in Schritten und nicht alles beim Umzug

Der Umzug musste pixelgleich bleiben. Nur so beweist der automatische Bildvergleich, dass beim Umzug nichts kaputtgegangen ist. Jeder spätere Schritt ändert genau eine Sache, und der Vergleich zeigt sofort, wenn sich dabei ungewollt etwas verschiebt.
