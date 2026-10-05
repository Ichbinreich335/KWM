# Stand Website-Umbau

Kurzüberblick: was fertig ist, was läuft, was als Nächstes kommt. Wird bei jedem Schritt aktualisiert. Was du tun oder entscheiden musst, steht in [ADMIN-OFFEN.md](ADMIN-OFFEN.md).

Stand: 05.10.2026, nachmittags

## Aktueller Gesamtstand (für die Werkstatt)

**https://gesamtstand-kwm-redesign.entwicklung-7f3.workers.dev** – ein Stand mit allem Abgenommenen: Bausteine 1–5, Zitate einheitlich, Handy kürzer, ruhige Bilder (kein Parallax), echte Flyer, Formular über Worker (in der Vorschau ohne Versand), SEO/Sicherheit, alle Befunde der Qualitätsprüfung behoben. 365 Tests in Chrome und Safari-Engine (Desktop und iPhone). Branch `gesamtstand`, Ordner `../KWM-gesamt`. Sammel-PR [#19](https://github.com/Ichbinreich335/KWM/pull/19) gegen `main` (ersetzt #4–#18). **Gebündeltes Code-Review** (zwei Achsen, Opus) gelaufen: alle Befunde erledigt oder als begründete Ausnahme in DESIGN.md eingetragen; dabei das Go-live-Risiko „Vorschau-Modus an zwei Schaltern“ behoben (eine Quelle, Tests). Stand: 396 Tests grün, eigener Testlauf für den Vorschau-Modus. Mittelweg-Startseite mit drei Bauhaus-Entwürfen: https://startseite-mittelweg-kwm-redesign.entwicklung-7f3.workers.dev/?bauhaus=1 (=2, =3). Vergleich: Startseite „Bauhaus“ https://startseite-bauhaus-kwm-redesign.entwicklung-7f3.workers.dev (nur Startseite anders; Teile übernehmbar).

## Jetzt gerade

| Strang | Stand | Wo |
|---|---|---|
| **Bausteine** (unsichtbar) | Teil 1 (#11), Teil 2 (#14) und Teil 3 fertig: `class`-Zeilen in den Seiten 1778 → 303. Läuft: Korrekturrunde (Raster ins Seiten-CSS, schmalere Bausteine, Scoping-Fehler `.js …` in Komponenten, Tests). Danach PR Teil 3, dann Teil 4–5. | `phase-d3-aufklappen`, `../KWM-phase-d` |
| **Sanity** | Studio https://kwm.sanity.studio mit Schema passend zur Seite. Läuft: Öffnungstage strukturiert, Inhalte (Ausstellungen, Orte, Galerien, Hinweise, Bilder) als Entwürfe importieren. Danach Teil 2: Website liest beim Bauen aus Sanity. | `phase-2-sanity`, `../KWM-sanity` |
| **Anfrageformular** | fertig als Entwurf (#15), echter Versand nach Konto-Umzug | `phase-3-formular`, `../KWM-formular` |
| **Vergleiche** (warten auf dich) | Handy kürzer, Flyer/Galerien, Zitate angleichen | siehe `ADMIN-OFFEN.md` |

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
| ✓ | Bausteine Teil 2 | Karten, Listen, Daten in Sanity-Form, Status-Funktion mit Unit-Tests. | nein | #14 |
| ✓ | Anfrageformular | Worker unter `/api/anfrage`, Turnstile, Versand an verifizierte Adresse; Sicherheitsprüfung erledigt. | ja (Formular) | #15 |
| ✓ | Vergleich Hell/Dunkel | Vier Fassungen der Startseite als Screens. Empfehlung: so lassen (siehe ADMIN-OFFEN). | – | `.shots/rhythmus/` |
| ✓ | Visuelles Review | Die externe Kritik ist geprüft: 14 von 20 Punkten stimmen. Der Bericht liegt in `VISUELLES-REVIEW.md`. | – | – |

## Als Nächstes

1. **Bausteine:** Korrekturrunde abschließen, PR Teil 3, dann Teil 4 (Formular-Kleinteile, Kontaktdaten aus einer Quelle) und Teil 5 (Bilder, Signaturen, Glasuren).
2. **Sanity Teil 2:** Website liest beim Bauen aus Sanity (Plan `PLAN-PHASE-2-SANITY.md`); danach (b+) Klick-Rahmen im Studio, wenn du zustimmst.
3. **Deine Entscheidungen einarbeiten** (Vergleiche), danach die Vergleichs-Branches mergen bzw. verwerfen.
4. **Konto-Umzug** (du), dann Webhook, echter Formularversand, Statistik (Phase 4, Weiche in `ADMIN-OFFEN.md`).
5. **Merge-Kette nach `main`** (Rebases: SEO und Formular auf die Bausteine), dann gebündeltes `/code-review` und Funde beheben.
6. **Go-live** nach deiner Freigabe (`GO-LIVE.md`).

## Warum in Schritten und nicht alles beim Umzug

Der Umzug musste pixelgleich bleiben. Nur so beweist der automatische Bildvergleich, dass beim Umzug nichts kaputtgegangen ist. Jeder spätere Schritt ändert genau eine Sache, und der Vergleich zeigt sofort, wenn sich dabei ungewollt etwas verschiebt.
