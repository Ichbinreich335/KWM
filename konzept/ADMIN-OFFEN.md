# Offen für den Admin

Laufende Liste: Was du tun, entscheiden oder abnehmen musst, und was mir unterwegs aufgefallen ist. Neueste Einträge oben in jedem Abschnitt. Erledigtes wandert nach unten.

Stand: 04.10.2026 (abends)

## Abnehmen

| Was | Wo | Hinweis |
|---|---|---|
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
| Leichtes Überschwingen der Punkte in Lebensweg und Chronik (`--ease-pop`) | Laut Kommentar im Code bewusst gewählt („Punkt füllt sich mit leichtem Überziehen“); ein Prüfwerkzeug meldet so etwas pauschal als „veraltet“. (a) so lassen, (b) ruhig auslaufen lassen ohne Überschwingen | (a), wenn es dir gefällt. Ansehen: Startseite, Abschnitt Lebensweg beim Scrollen |
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
