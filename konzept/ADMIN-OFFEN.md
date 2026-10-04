# Offen für den Admin

Laufende Liste: Was du tun, entscheiden oder abnehmen musst, und was mir unterwegs aufgefallen ist. Überblick über alle Schritte: [STAND.md](STAND.md). Neueste Einträge oben in jedem Abschnitt. Erledigtes wandert nach unten.

Stand: 04.10.2026 (abends)

## Abnehmen

| Was | Wo | Hinweis |
|---|---|---|
| **Phase C4: Schriften** (keine sichtbare Änderung) | PR [#10](https://github.com/Ichbinreich335/KWM/pull/10) (Entwurf, baut auf #9 auf) · Bericht `konzept/PHASE-C-BERICHT.md` Abschnitt C4 · Vorschau: `https://phase-c4-schriften-kwm-redesign.entwicklung-7f3.workers.dev` | Schriftbild identisch; Schriften jetzt gehasht und dauerhaft gecacht. Damit ist Phase C komplett. |
| **Phase C3: Bilder responsiv** (kein Layout-Unterschied) | PR [#9](https://github.com/Ichbinreich335/KWM/pull/9) (Entwurf, baut auf #8 auf) · Bericht `konzept/PHASE-C-BERICHT.md` Abschnitt C3 · Vorschau: `https://phase-c3-bilder-kwm-redesign.entwicklung-7f3.workers.dev` | Startseite mobil jetzt Lighthouse 100, größtes Bild 0,7 s früher sichtbar. Bitte am Handy und am großen Bildschirm auf Bildschärfe achten (Bilder werden von Astro neu kodiert). |
| **Phase C2: Skripte als TypeScript** (keine sichtbare Änderung) | PR [#8](https://github.com/Ichbinreich335/KWM/pull/8) (Entwurf, baut auf #7 auf) · Bericht `konzept/PHASE-C-BERICHT.md` Abschnitt C2 · Vorschau: `https://phase-c2-ts-kwm-redesign.entwicklung-7f3.workers.dev` | Alle Skripte typgeprüft (strengster Modus), gebündelt. Beim Durchklicken auf interaktive Teile achten: Menü am Handy, Farbskala, Feuer (Werkstatt), Glasurbühne (Manufaktur), Aufklapper (Aktuelles), Anfrageformular. |
| **Phase C1: CSS gebündelt** (keine sichtbare Änderung) | PR [#7](https://github.com/Ichbinreich335/KWM/pull/7) (Entwurf, baut auf #6 auf) · Bericht `konzept/PHASE-C-BERICHT.md` im Branch `phase-c1-css` · Vorschau: `https://phase-c1-css-kwm-redesign.entwicklung-7f3.workers.dev` | Startseite lädt 3 statt 12 CSS-Dateien, etwas schneller. Eine Konvention ist neu: Jede Seite importiert ihr CSS in fester Reihenfolge (steht in der README, ein Test wacht darüber). |
| **Phase B-2: Fehler aus dem Audit behoben** (kleine sichtbare Korrekturen) | PR [#6](https://github.com/Ichbinreich335/KWM/pull/6) (Entwurf, baut auf #5 auf) · Bericht `konzept/PHASE-B-BERICHT.md` Abschnitt B-2 · Vorschau: `https://phase-b-fehler-kwm-redesign.entwicklung-7f3.workers.dev` | Tippflächen auf 44 px (unsichtbar), dazu ein echter Handy-Fehler behoben: Die Glasurprobe der Farbskala (Startseite) schrumpfte beim zweiten Tippen auf einen kleinen Punkt. Bitte am Handy ausprobieren: Farbskala antippen, nochmal antippen. |
| **Phase B-1: Varianten festgelegt** (keine sichtbare Änderung) | PR [#5](https://github.com/Ichbinreich335/KWM/pull/5) (Entwurf, baut auf #4 auf) · Bericht `konzept/PHASE-B-BERICHT.md` im Branch `phase-b-varianten` · Vorschau: `https://phase-b-varianten-kwm-redesign.entwicklung-7f3.workers.dev` | Sieht aus wie Phase A, lädt weniger (JS 168→72 KB). Nach #4 mergen. |
| Feinplanungen Phase B–E (zum Durchsehen, nicht zwingend) | `konzept/PLAN-PHASE-B.md`, `PLAN-PHASE-C.md`, `PLAN-PHASE-D.md`, `PLAN-PHASE-E.md`; Überblick in `konzept/UEBERGABE.md` §0 | Phase B läuft bereits (Branch `phase-b-varianten`). Einwände gegen eine Planentscheidung bitte vor dem Start der jeweiligen Phase melden. Wichtigste Weichen: Phase D stellt Astros Scoped Styles auf `where` (keine Spezifitätsänderung beim Umzug von CSS in Komponenten); Phase E bereitet Sitemap und Go-live-Schalter nur vor, `noindex` bleibt. |
| **Phase A: Website auf Astro (1:1)** | Vorschau https://astro-umbau-kwm-redesign.entwicklung-7f3.workers.dev · PR [#4](https://github.com/Ichbinreich335/KWM/pull/4) (Entwurf) · Bericht `konzept/ASTRO-BERICHT.md` | Sieht aus wie V3, nur ohne Entwurf-Panel. Auf Handy und Rechner durchklicken. Nach OK: PR auf „bereit“ stellen und mergen (ersetzt die Produktion auf `workers.dev`, nicht `kwm-1924.de`). |

## Tun (nur du kannst das)

| Was | Warum | Wie |
|---|---|---|
| Build-Befehl bei der Vorschau `astro-umbau` setzen | Die Vorschau hat ihre Einstellungen beim Anlegen kopiert (leerer Build-Befehl), automatische Builds dieses Branches scheitern deshalb. Ich lade die Vorschau so lange von Hand hoch, der Link ist aktuell. Neue Branches erben schon `npm run build`. | Dashboard → `kwm-redesign` → Previews → `astro-umbau` → Settings → Build command `npm run build`. Oder die Vorschau löschen, wenn du so weit bist; sie entsteht beim nächsten Push neu. |

## Entscheiden

| Frage | Optionen | Meine Empfehlung |
|---|---|---|
| **Was kommt in Sanity? – teilweise entschieden** | Entschieden: Ausstellungen mit allen Daten, Texten, Bildern und Flyer-Scan; Galerien bzw. Orte pflegbar. Offen, per Vergleich: (1) Flyer-Scan in der Ausstellung: als Bild im Detail, als Vorschau mit Vergrößern oder als PDF-Link · (2) Galerien: nur Orte auf der Startseite oder eigene Unterseite „Galerien“ · (3) Portfolio-Seite aus der Lager-Datenbank (kuratiert, mit Filter „im Lager“) statt bzw. neben der vollen Editionsseite | Ich baue dafür Vergleichs-Entwürfe (eigene Vorschau, wird nicht gemergt). Preise und Lagerorte erscheinen nie auf der Website, nur freigegebene Felder. **Achtung:** Ein Filter „im Lager“ zeigt Verfügbarkeit; die Inhaltsregel sagt bisher „keine Verfügbarkeit, alles auf Anfrage“. Entweder zeigt das Portfolio nur eine kuratierte Auswahl ohne Verfügbarkeitsangabe (gezeigt = anfragbar), oder die Regel wird geändert. |
| **Startseite kürzer: anreißen statt alles erzählen?** | Abschnitte zu Young-Jae Lee, Chronik usw. auf der Startseite verkürzen und auf die Unterseiten verweisen (Inhalt bleibt erhalten, eine Ebene tiefer) | Ja, etwa 25–30 % kürzer. Ich lege einen konkreten Vorschlag mit Screens vor, bevor etwas umgebaut wird. |
| **Hell/Dunkel-Rhythmus** | Vergleichs-Screens: A heute · B Orte hell · C ohne Grau · D beides. Übersicht: `.shots/rhythmus/uebersicht-1440.png` (und `-390`) | **A so lassen.** Am Bild ist der Rhythmus ruhiger, als die Zählung vermuten ließ: fünf dunkle Massen (Aktuell, Porträt, Orte, Feuer, Fuß) in gleichmäßigem Abstand. Orte hell bringt wenig, weil die Kacheln dunkle Fotos bleiben; das Grau ist so zart, dass es kaum als Wechsel wirkt. |
| **Visueller Feinschliff, 10 Fragen** (Frage 1 Porträt am Handy: von dir entschieden, wird umgesetzt) – Details, Messungen und Screens in `konzept/VISUELLES-REVIEW.md` (Abschnitt „Vorschlag Phase B-3“, Teil b) | 1 Porträt am Handy: Bild und Zitat untereinander statt Zitat über dem Gesicht · 2 Tablet zweispaltig · 3 weniger große Zitate (Meisterstücke-Satz streichen, Kosmos-Dopplung) · 4 1986 oder 1987 (Werkstatt fragen) · 5 Bildnachweise einheitlich „Titel · Foto: Name“, fehlende Namen liefern · 6 Bildgründe der Freisteller angleichen, höher aufgelöste Originale · 7 Bildwiederholungen tauschen, später Ortsfotos · 8 Orte am Handy verdichten · 9 Regel für gefüllte Buttons und Überschriften · 10 Datumsformat „2003–2005“, Chronik-Spalten | Meine Empfehlung steht je Frage im Bericht. Nicht übernommen, weil schon entschieden: Meditation und 99 Schalen zusammenlegen (E5), Orte auf hellen Grund (DESIGN.md §5). |
| Leichtes Überschwingen der Punkte in Lebensweg und Chronik (`--ease-pop`) | Laut Kommentar im Code bewusst gewählt („Punkt füllt sich mit leichtem Überziehen“); ein Prüfwerkzeug meldet so etwas pauschal als „veraltet“. (a) so lassen, (b) ruhig auslaufen lassen ohne Überschwingen | (a), wenn es dir gefällt. Ansehen: Startseite, Abschnitt Lebensweg beim Scrollen |
| Vorschauen der alten Branches (`design-v3`, `claude/softr-lager-app`, `claude/baserow-nachbau`, `design-v2` …) | Sie scheitern seit 04.10. an einer neuen Cloudflare-Pflichtangabe (`previews`-Block). (a) Angabe dort ergänzen, (b) ignorieren, (c) Branches später aufräumen | (b), solange sie nicht gebraucht werden; nach dem Merge erben neue Branches die Angabe |
| Google Tag Manager vorziehen (Phase 4)? | Braucht GTM-Container-ID und Wahl des Einwilligungsbanners | Nach Phase B; Conversion „Anfrage gesendet“ ist erst mit dem Formular-Worker (Phase 3) sinnvoll |
| Vorschau-URLs schützen (E6)? | Cloudflare Access an/aus | Für den Prototyp nicht nötig (Seiten sind `noindex`) |

## Aufgefallen (zur Kenntnis)

- Externe Kritik geprüft (Opus, eigene Playwright-Messungen): 14 von 20 Punkten stimmen ganz, 5 teilweise. Größter sichtbarer Befund, den die Kritik übersah: Porträt und Feuerbild werden stark hochskaliert und wirken weich (Handy ~20 % der nötigen Pixel). Die 10 Punkte ohne Entscheidungsbedarf setze ich als Phase B-3(a) um (nach D1, eigener PR). Bericht: `konzept/VISUELLES-REVIEW.md`.
- Sichtbare Kleinigkeiten aus dem Fehler-Audit (Tippflächen „Zu diesem Stück anfragen“ 43 px statt 44 px u. a.) stehen in `konzept/ASTRO-BERICHT.md` Abschnitt 5 und werden in Phase B behoben.
- GitHub meldete Sicherheitshinweise zu `undici` (steckt im Werkzeug Wrangler, nicht in der Website). Behoben durch Wrangler 4.147 im Branch `astro-umbau`; wirkt auf `main` mit dem Merge.

## Erledigt

- 04.10.2026: Build-Befehl für Produktion und für neue Vorschauen gesetzt (Admin).
- 04.10.2026: Hilfsskripte ohne Funktion in `.shots/` entfernt (Admin-Entscheidung).
- 04.10.2026: Prototyp und frühe Entwürfe archiviert statt gelöscht (`archiv/`, Admin-Entscheidung).
- 04.10.2026: Entwurf-Panel entfernt, feste Fassung nach E5 (Admin-Hinweis).
