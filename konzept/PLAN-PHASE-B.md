# Phase B: Varianten festschreiben und Fehler beheben – Feinplanung

> **Für ausführende Agenten:** Pflicht-Skill `superpowers:subagent-driven-development` (Controller) bzw. diese Datei als Auftrag (Implementer). Vorher `CLAUDE.md`, `konzept/UEBERGABE.md` Abschnitt 0 und `konzept/PLAN-ASTRO-UMBAU.md` §4 (Globale Vorgaben) lesen. Ausführung durch Sonnet-Subagents, Planung und Endprüfung durch Opus (Admin, 04.10.2026).

**Ziel:** Nur noch die gewählte Fassung steht im Code. Danach werden die sichtbaren Fehler aus dem Fehler-Audit von Phase A behoben.

**Ausgangslage (nach Phase A):** Das Entwurf-Panel ist schon entfernt (vorgezogen auf Wunsch des Admins). `public/js/varianten.js` setzt fest die Fassung aus E5 und blendet nicht gewählte Abschnitte per `hidden` aus. Die nicht gewählten Abschnitte, ihre Signaturen und CSS-Regeln stehen aber noch im Code. Der Kopf des Layouts setzt `data-grund="galerie"` fest und enthält nur noch `js`-Klasse und Logo-Zeichnung (B3 aus dem Rahmenplan ist damit erledigt).

**Zwei PRs:**
1. **B-1 „Varianten festgelegt“** (Aufgaben B1–B4): keine sichtbare Änderung. Prüfmaßstab sind die bestehenden Optik-Screens (Prototyp mit `?praesentation` = gewählte Fassung).
2. **B-2 „Fehler aus dem Audit behoben“** (Aufgabe B5): bewusste, sichtbare Korrekturen. Screens vorher und nachher, betroffene Optik-Screens gezielt neu.

**Branches:** `phase-b-varianten` von `astro-umbau` (gestapelt, Basis des PRs ist `astro-umbau`, nach dessen Merge `main`), danach `phase-b-fehler` von `phase-b-varianten`. Worktree `../KWM-phase-b`.

## Prüf-Werkzeuge (gelten für jede Aufgabe)

- `npm run check` (Prettier, ESLint, `astro check`, Build): Exit-Code 0, direkt prüfen, nicht durch `grep` pipen.
- `npm test`: Optik 26, Barrierefreiheit 26, Routen 12, Verhalten 12. Läuft schon ein `wrangler dev` auf 8787, vorher `npm run build`.
- Optik-Screens: `tests/__screens__/` (nicht im Repo) aus `../KWM-astro/tests/__screens__/` kopieren. **Nie `--update-snapshots`** in B-1.
- Textvergleich: `.superpowers/sdd/PLAN-ASTRO-UMBAU/textvergleich-endstand.mjs` aus `../KWM-astro` (Prototyp-Server: `npm run prototyp`, Astro: `wrangler dev`). Erwartung: 0 Abweichungen auf allen 13 Seiten.
- Doku vor Code: Astro-Fragen über den MCP `astro-docs`.

## Aufgabe B1: Nicht gewählte Abschnitte aus dem Markup

**Dateien:** `src/pages/index.astro`, CSS-Dateien in `public/` (nur Regeln für entfernte Abschnitte)

Heute gibt es `data-variant` nur noch in `src/pages/index.astro`:

| Abschnitt | Variante | Aktion |
|---|---|---|
| `<section class="hero grid" id="top" data-variant="einstieg:foto">` (~Z. 13) | gewählt | Attribut `data-variant` entfernen |
| `<section class="komposition" id="einstieg" data-sig="komposition" data-variant="einstieg:wortbild" hidden>` (~Z. 48–116) | nicht gewählt | ganzen Abschnitt löschen |
| `<figure class="works__single" … data-variant="einzelwerk:spindelvase">` (~Z. 502) und `<div class="works__single-meta" data-variant="einzelwerk:spindelvase">` (~Z. 526) | gewählt | Attribut entfernen |
| `<figure … data-variant="einzelwerk:teeschale" hidden>` (~Z. 512) und `<div class="works__single-meta" data-variant="einzelwerk:teeschale" hidden>` (~Z. 538) | nicht gewählt | löschen |
| `<section class="med" id="haltung-meditation" data-variant="haltung:getrennt">` (~Z. 1068), `<section class="rep" id="kosmos" data-variant="haltung:getrennt">` (~Z. 1098) | gewählt | Attribut entfernen |
| `<section class="rep" id="kosmos-zusammen" data-variant="haltung:zusammen" hidden>` (~Z. 1140–1203) | nicht gewählt | ganzen Abschnitt löschen |

Schritte:
- [ ] Vorher die IDs der zu löschenden Abschnitte (`einstieg`, `komposition-title`, `kosmos-zusammen`, `rep-title` und alle IDs darin) im ganzen Projekt suchen (`grep -rn` in `src public`). Verweist etwas darauf (Anker, `aria-labelledby`, Skript), melden statt raten.
- [ ] Löschen bzw. Attribute entfernen wie in der Tabelle. Prüfen: `grep -rn "data-variant" src` → keine Treffer.
- [ ] CSS: Für jede Klasse aus den gelöschten Abschnitten prüfen, ob sie noch irgendwo in `src/` vorkommt. Regeln, deren Selektoren nur noch gelöschte Klassen treffen, aus `public/styles.css` und `public/css/*.css` entfernen. Die Klassen `komposition__*` liegen in `public/css/sig-komposition.css`, die ganze Datei fällt in B3. Klassen, die auch der gewählte Abschnitt nutzt (z. B. `rep__*`, `works__single*`), bleiben.
- [ ] Prüfen: Optik 26/26, Textvergleich 0, `npm run check` 0.
- [ ] Commit: „Phase B: nicht gewählte Varianten aus dem Markup entfernt (Einstieg Wort und Bild, Teeschale, Meditation zusammen)“

## Aufgabe B2: Varianten-Logik aus Skripten und CSS

**Dateien:** `public/js/varianten.js` (löschen), `src/layouts/BaseLayout.astro`, `public/main.js`, `public/js/signaturen.js`, `public/js/sig-farbskala.js`, `public/js/sig-sticky.js`, `public/styles.css`, `public/css/sig-farbskala.css`, `public/css/sig-sticky.css`, `tests/verhalten.spec.ts`

Jede Stelle behält genau das Verhalten der gewählten Variante:

| Stelle | Heute | Soll |
|---|---|---|
| `public/js/varianten.js`, Script-Tag im Layout | setzt Attribute, blendet aus, feuert `kwm:varianten` | Datei und Tag löschen |
| `<html … data-grund="galerie">` im Layout | Grundton fest | Attribut entfernen, sobald die Regeln für Porzellan/Creme weg sind (`:root` ist schon Galerie) |
| `public/styles.css` ~Z. 61–62 | `:root[data-grund="porzellan"]`, `:root[data-grund="creme"]` | löschen |
| `public/main.js` ~Z. 197–208 (Lebensweg) | `select()` wählt zwischen `modes.zeichnen` und `modes.scrollen`, hört auf `kwm:varianten` | nur noch `modes.scrollen()` starten; `modes.zeichnen` samt zugehörigem CSS (falls vorhanden, z. B. Klassen nur für „zeichnet sich einmal“) löschen; Listener weg |
| `public/main.js` ~Z. 455 (99 Schalen) | Listener `kwm:varianten` mit Kommentar zum Entwurf-Panel | Zeile und Kommentar löschen |
| `public/js/signaturen.js` | Kommentar Zeile 2 zum Entwurf-Panel, Listener `kwm:varianten` | Kommentar anpassen, Listener löschen (`run()` einmal reicht) |
| `public/js/sig-farbskala.js` (`flat()`, Z. 17, 193, 391, 421–…) | Zweig für Variante „Fläche“ und Listener | nur Testkachel-Verhalten behalten, `flat`-Zweige und Listener löschen |
| `public/css/sig-farbskala.css` ~Z. 71–73 | `:root[data-farbskala="flaeche"] …` | löschen |
| `public/js/sig-sticky.js` (`travel()`, Z. 21–57) | Zweig für Feuer-Text „wandert“ und Listener | nur „haftet“ behalten, `travel`-Zweige, Klasse `is-travel`, `--feuer-y` und Listener löschen |
| `public/css/sig-sticky.css` ~Z. 89–114 | `[data-feuertext="wandernd"] …` | löschen |
| `tests/verhalten.spec.ts`, Test „Kein Entwurf-Panel …“ | prüft `data-grund`, `data-lebensweg`, `data-variant` | umschreiben auf das, was danach gilt: kein Panel-Knopf, Einstiegsfoto (`.hero`) sichtbar, kein `.komposition`; die Attribut-Prüfungen entfallen |

Schritte:
- [ ] Vor jeder JS-Änderung die betroffene Funktion vollständig lesen; nur die Zweige der nicht gewählten Variante entfernen, die Logik der gewählten unverändert lassen.
- [ ] Prüfen: `grep -rn "kwm:varianten\|kwm-entwurf\|data-grund\|dataset.lebensweg\|dataset.feuertext\|dataset.farbskala\|praesentation" src public` → keine Treffer.
- [ ] Prüfen: Optik 26/26 (die Startseite mit Lebensweg, Farbskala, Feuer auf der Werkstatt-Seite sind die kritischen Stellen), keine Konsolenfehler, Verhalten grün, `npm run check` 0.
- [ ] Commit: „Phase B: Varianten-Logik entfernt, feste Fassung ohne Umschalter“

## Aufgabe B3: Ungenutzte Signaturen löschen

**Dateien:** `public/js/sig-*.js`, `public/css/sig-*.css`, `public/js/signaturen.js`, `public/css/signaturen.css`, ggf. `public/js/keramik.js`

- [ ] Liste der genutzten Signaturen ermitteln: `grep -rho 'data-sig="[a-z]*"' src | sort -u`. Stand vor B1: aktuell, anfrage, farbskala, feuer, komposition, logo, orte, sticky. Nach B1 fällt `komposition` weg.
- [ ] Löschen, was keine Seite nutzt: voraussichtlich `sig-profil`, `sig-drehen`, `sig-buehne`, `sig-komposition` (je `.js` und `.css`), dazu ihre Einträge in `signaturen.js` (`modules`) und die `@import`-Zeilen in `signaturen.css`. Vor dem Löschen jeder Datei `grep -rn "<name>" src public` (auch dynamische Importe, andere Module).
- [ ] `public/js/keramik.js`: Exporte suchen, die nur gelöschte Module benutzt haben (`grep` je Export). Ungenutzte Exporte entfernen; sind sie Teil gemeinsamer Daten (z. B. Glasurliste), bleiben sie.
- [ ] `public/main.js`: Blöcke suchen, die nur Elemente gelöschter Abschnitte ansprechen (z. B. Selektoren mit `komposition`, `kosmos-zusammen`); entfernen.
- [ ] Prüfen: Linkprüfung grün (keine 404 auf gelöschte Dateien), Optik 26/26, Konsole fehlerfrei, `npm run check` 0.
- [ ] Commit: „Phase B: ungenutzte Signaturen entfernt (Profil, Drehen, Bühne, Komposition)“

## Aufgabe B4: Prüfung und PR B-1 (Controller)

- [ ] `npm test` vollständig grün, Textvergleich 0 auf 13 Seiten, `npm run check` 0.
- [ ] `grep -rn "data-variant\|kwm-entwurf\|praesentation\|varianten" src public` → keine Treffer.
- [ ] Größenvergleich `du -sh public/js public/css` vorher/nachher in den Bericht.
- [ ] Lighthouse mobil Startseite (3 Läufe, Median) gegen Phase A: nicht schlechter.
- [ ] Endprüfung mit Skill `code-review` (Opus) gegen `astro-umbau`; Befunde in einem Durchgang beheben.
- [ ] `konzept/ADMIN-OFFEN.md` und Bericht `konzept/PHASE-B-BERICHT.md` ergänzen. Draft-PR „Varianten festgelegt, Entwurf-Panel entfernt“ mit Basis `astro-umbau`.

## Aufgabe B5: Fehler aus dem Audit (PR B-2, Branch `phase-b-fehler`)

Quelle: `konzept/ASTRO-BERICHT.md` Abschnitt 5. Jede Korrektur ist eine bewusste, sichtbare Änderung.

| Prio | Fundstelle | Korrektur |
|---|---|---|
| P2 | `a.catalog__ask` (Meisterstücke, 24×), 43,x px hoch | Tippfläche auf mindestens 44 px (z. B. `min-height: 44px` mit `display: inline-flex; align-items: center`), Optik sonst gleich |
| P3 | Seitenmenü „Rechtliches“ (Impressum, AGB, Versand, Zahlung, Datenschutz), kurze Einträge 31 px breit | `min-width: 44px` für die Links |
| P3 | `public/styles.css` ~Z. 505: `transition: width, height` am runden Vorschaubild | gleiche Bewegung mit `transform: scale()`; Endzustand pixelgleich |
| P3 | `public/css/sig-orte.css` ~Z. 117: `transition: margin-top` | mit `translate` lösen, falls die Bewegung gleich bleibt; sonst unverändert lassen und notieren |

Nicht in B5 (Entscheidung des Admins nötig): `--ease-pop` (leichtes Überschwingen der Punkte in Lebensweg und Chronik, laut Kommentar bewusst) → in `ADMIN-OFFEN.md` als Frage. Fließtext-Links unter 44 px sind nach WCAG 2.5.8 ausgenommen und bleiben.

Schritte:
- [ ] Screens vorher: `node .shots/shoot.mjs <url> astro-fehler/vorher-<seite>` für Meisterstücke, Impressum, Startseite.
- [ ] Korrekturen einzeln umsetzen, nach jeder: Optik-Test der betroffenen Seiten. Erwartete Abweichungen nur an der korrigierten Stelle (Differenzbild ansehen). Dann gezielt `npx playwright test tests/optik.spec.ts -g "<seite>" --update-snapshots` und im Commit begründen. Andere Seiten müssen unverändert grün bleiben.
- [ ] Tippflächen erneut messen (Skript aus dem Audit, siehe Bericht A8): keine interaktiven Elemente unter 44 px außer Fließtext-Links.
- [ ] Screens nachher, axe 26/26, `npm run check` 0, Endprüfung `code-review`, Draft-PR „Fehler aus dem Audit behoben“ mit Basis `phase-b-varianten`.
