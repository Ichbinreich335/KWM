# Phase B-3: Visueller Feinschliff – Feinplanung

> **Für ausführende Agenten:** Diese Datei ist der Auftrag. Vorher `CLAUDE.md`, `DESIGN.md` §3–§8 und `konzept/VISUELLES-REVIEW.md` lesen (Befunde, Messungen, Screens unter `../KWM-astro/.shots/visual-review/`). Ausführung durch Sonnet-Subagents, Review je Aufgabe auf Sonnet, Endprüfung Opus.

**Ziel:** Die sichtbaren Schwächen aus dem visuellen Review beheben, die DESIGN.md schon regelt oder die der Admin entschieden hat. **Sichtbare Änderungen sind gewollt**, aber nur an den genannten Stellen.

**Branch:** `phase-b3-feinschliff` von `phase-c4-schriften`, Worktree `../KWM-phase-b3`, Testport 8798. Läuft parallel zu Phase D1 (eigener Worktree); wer zuerst gemergt wird, der andere rebased.

**Admin-Entscheidungen (04.10.2026, abends):**
- Porträt am Handy: Das Zitat darf das Gesicht nicht verdecken. → Bild und Zitat untereinander (B-3(b) Frage 1 = ja).
- Feuer: Der haftende Text soll weiter nach unten mitlaufen, nicht in der oberen Bildhälfte stehen bleiben.

**Schlank bleiben (Admin):** Jede Korrektur mit der kleinsten CSS-Änderung an der bestehenden Regel lösen, nah an Astro-Doku und Best Practices. Keine neuen Skripte, Hilfsklassen oder Abstraktionen, wenn eine Medienabfrage oder ein Token reicht. Astro-Fragen (z. B. `sizes` an `<Image>`) zuerst im MCP `astro-docs`.

## Prüf-Werkzeuge (jede Aufgabe)

- `npm run check` Exit 0 (direkt prüfen).
- Tests über Port 8798 (siehe `context.md` im SDD-Ordner). Optik: Abweichungen sind nur an den bearbeiteten Stellen erlaubt. Vorgehen je Änderung: Test laufen lassen, **Differenzbilder ansehen** (`test-results/**/…-diff.png`), nur wenn ausschließlich die gewollte Stelle abweicht, gezielt `--update-snapshots -g "<seite>"` und im Commit begründen. Andere Seiten müssen ohne Update grün bleiben.
- Barrierefreiheit 26/26, Verhalten, Routen grün.
- Screens vorher/nachher je Punkt unter `.shots/b3/` (1440 und 390, bei Porträt/Feuer zusätzlich 768), selbst ansehen.
- Text darf sich nur dort ändern, wo der Punkt es verlangt (Pop-up-Link). Kein Textvergleich gegen den Prototyp mehr nötig.

## Aufgabe B3-1: Porträt und Feuer (Admin-Feedback, zuerst)

Dateien: `src/styles/signaturen/sig-sticky.css`, `src/pages/index.astro` (Porträt ~Z. 338–365, Feuer ~Z. 1266–1293), ggf. `src/scripts/sig-sticky.ts`, `DESIGN.md` §8.

1. **Porträt mobil (≤ 900 px), Bild und Zitat untereinander:**
   - Kein Sticky, keine Abdunklung: Das Bild steht im festen Seitenverhältnis 4:5, `object-position` so, dass das Gesicht mittig im Ausschnitt liegt (am 390er-Screen prüfen; heute `22% 50%`).
   - Das Zitat folgt direkt darunter auf Kohle (der dunkle Block setzt das Bild fort), Innenabstand `var(--m)` seitlich, oben/unten `var(--head-gap)` bzw. ein bestehender Abstands-Token, Lede-Größe wie heute.
   - Die Bildunterschrift bleibt darunter auf dem Papier.
   - Der Parallax aus `sig-sticky.ts` darf mobil für das Porträt nicht mehr verschieben (prüfen, ob er über `--sticky-shift` greift; wenn ja, mobil neutralisieren, ohne Feuer und Desktop zu ändern).
   - Desktop und Tablet über 900 px bleiben unverändert (Optik 1440 ohne Update grün für alles außer, falls nötig, durch Punkt 3).
2. **Feuer: Text läuft bis unten mit.** Heute ist die Textebene 100 svh hoch, klebt also nur 60 svh (mobil 50 svh) lang und steht am Ende in der oberen Bildhälfte. Wie beim Porträt: Die Textebene ist nur so hoch wie der Text (`height: auto`, unten `padding-bottom: var(--head-gap)`), damit der Text haftet, bis er unten am Bild ankommt. Desktop und mobil. Prüfen mit einer Scroll-Serie (5 Positionen durch den Abschnitt, 1440 und 390): Der Text muss am Ende unten im Bild stehen, nie über den Abschnitt hinausragen, nie den Header überdecken.
3. **Schärfe (`sizes`) für `cover`:** Porträt und Feuer füllen hohe Kästen per `object-fit: cover`, `sizes="100vw"` unterschätzt den Bedarf. `sizes` so setzen, dass die Breite aus der Höhe folgt (Porträt Desktop: Höhe 140vh × Seitenverhältnis 2000/1313 ≈ 213vh, Feuer: 160vh × 1,5 = 240vh), z. B. `sizes="(max-width: 900px) 100vw, max(100vw, 213vh)"` – für das Porträt mobil passt nach Punkt 1 wieder `100vw`. Prüfen mit `currentSrc` im Browser bei 1440×900 @2x und 390 @3x: es wird die größte vorhandene Variante geladen. Keine Layoutänderung.
4. `DESIGN.md` §8 auf das neue Verhalten anpassen (Porträt mobil untereinander, Feuer haftet bis unten).

Ein Commit je Punkt.

## Aufgabe B3-2: Abweichungen von DESIGN.md (kleine Korrekturen)

Je Punkt ein Commit, Fundstellen und Messwerte stehen in `VISUELLES-REVIEW.md`.
1. Mobil: Unterzeile der 99 Schalen bekommt Seitenrand (`.cosmos__caption` im Medienblock ≈ `global.css:2111`: `padding-inline: var(--m)`).
2. Besuch (Startseite): doppelte Haarlinie unter dem Abschnittskopf entfernen (erste Zeile der Öffnungszeiten ohne `border-top`, DESIGN.md §6).
3. Orte: H2 „Ausstellungsorte“ auf `--t-h2` (Überschreibung in `sig-orte.css` ≈ Z. 23–27 löschen), große Kacheln auf `--t-statement`, damit H2 > Kachel; Abschnittsabstand `padding-block: var(--section)` statt eigenem `clamp` (≈ Z. 5).
4. Meisterstücke-Satz `.works__statement` in `--f-display` (Aussage = Display, DESIGN.md §3).
5. Farbrollen: Chronik-Beschreibungen `--ink-2` (Kontrast ≥ 4,5:1 nachmessen), Farbskala-Unterzeile auf Begleittext-Rolle, Hinweis „Wischen“ auf Meta-Rolle.
6. „1300 °C“ mit schmalem geschütztem Leerzeichen (`&#8239;`), überall wo es vorkommt (Startseite Feuer, Manufaktur-Tafel, Werkstatt – `grep -rn "1300" src`).
7. Pop-up-Karte (Aktuell, Startseite ≈ `index.astro:252`): Linktext „Mehr erfahren“.

## Aufgabe B3-3: Raster beruhigen

1. Lebensweg (Startseite): die 5 Stationen über die volle Breite (Spalte 1–12) verteilen, damit rechts kein totes Feld bleibt.
2. Aktuell-Karten: die Links unten auf einer Linie (Link `margin-top: auto` in einer Flex-/Grid-Spalte, oder `subgrid`).
3. Abschnittsköpfe: Link-Ausrichtung einheitlich wie bei Meisterstücke und Orte (links ab Spalte 9); Aktuell angleichen.
4. Fußzeile Desktop: Spalten oben bündig, „Kontakt“ direkt unter „Werkstatt“ ohne ~190 px Lücke.

## Aufgabe B3-4: Dichte am Handy (Analyse, Controller mit Messung durch Sonnet)

Der Admin empfindet die Startseite am Handy als voll, dicht und lang. Ein Sonnet-Subagent misst bei 390 px: Abschnittsabstände, Abstände Überschrift–Text–Bild, Schriftgrößen je Rolle, Höhe je Abschnitt (vor und nach B3-1/B3-2) und legt Screens je Abschnitt ab. Der Controller leitet daraus einen konkreten Vorschlag ab (Tokens `--section`, `--head-gap`, Größe großer Serifensätze mobil, Orte mobil verdichten) und legt ihn dem Admin mit Vorher/Nachher-Screens vor. Umsetzung erst nach Freigabe.

## Nicht in B-3

- Laufweiten-Tokens je Rolle und „Young-Jae“ zentral vor Umbruch schützen → Phase D (Komponenten tragen die Textstile).
- Alles aus `VISUELLES-REVIEW.md` Teil (b) außer Frage 1 → wartet auf den Admin (`ADMIN-OFFEN.md`).

## Abschluss

Endprüfung `code-review` (Opus) gegen `phase-c4-schriften`, Bericht `konzept/PHASE-B3-BERICHT.md` mit Vorher/Nachher-Screens, Draft-PR „Visueller Feinschliff“ (Basis `phase-c4-schriften`), `ADMIN-OFFEN.md` ergänzen.

## Aufgabe B3-5: Handy kürzer – als Vergleich (Admin, 04.10.2026)

Admin: Am Desktop ist die Startseite „wie eine Reise“, die Länge bleibt. Am Handy ist sie zu lang und zu dicht → kürzen, **ohne die Reise kaputt zu machen**. Visuell starke und interaktive Elemente bleiben: Einstieg, Aktuell (dunkel), Porträt, Orte, Ring der 99 Schalen, Farbskala, Feuer, Chronik. Grau seltener ist in Ordnung.

**Vorgehen:** eigener Branch `phase-b3-mobil-kurz` von `phase-b3-feinschliff` nach B3-3 (sauberer Stand). Eigene Vorschau. Der Admin vergleicht beide Vorschauen und entscheidet; erst dann wird gemergt.

**Messung vorher (390 px, Startseite 20.208 px):** Einstieg 1.032 · Aktuell 2.572 · Lede 955 · Young-Jae Lee 2.723 · Meisterstücke 1.849 · Orte 2.161 · Meditation 762 · 99 Schalen 937 · Manufaktur 2.623 · Feuer 1.266 · Chronik 751 · Besuch 1.440 · Fuß 1.138. Ziel: rund 15.000 px (−25 %). Kein Abschnitt fällt weg.

**Grundsatz:** kürzen durch Verdichten und seitliches Wischen (Muster der Chronik), nicht durch engere Abstände – die Seite soll ruhiger werden, nicht gedrängter. Nur unter 900 px, Desktop bleibt pixelgleich (Optik 1440 ohne Update). Kein Text wird gelöscht; was am Handy entfällt, steht auf der verlinkten Unterseite. Schlank: CSS im bestehenden Medienblock, `display: none` nur für doppelte oder rein ergänzende Teile, keine neuen Skripte (Wischen per `overflow-x: auto` + `scroll-snap` wie die Chronik, deren Muster wiederverwenden).

| Abschnitt | Am Handy | Ersparnis ca. |
|---|---|---|
| Aktuell | Spotlight bleibt wie heute; die drei weiteren Karten als Wischreihe (Karte ~80 % Breite, Bild 4:3, Hinweis „Wischen“ wie Chronik) | 1.200 |
| Young-Jae Lee | Porträt-Zitat eine Stufe kleiner (`--t-quote` statt `--t-lede`); Lebensweg als Wischreihe statt fünf Stationen untereinander | 600 |
| Meisterstücke | Satz „Alle Meisterstücke …“ am Handy ausblenden (steht auf der Unterseite); Raster zeigt 4 statt 6 Werke, Werkangaben nur Titel und Jahr | 700 |
| Orte | Behutsam (Admin: Aufklappen gefällt, nicht zu stark reduzieren): alle Städte bleiben als Bildkacheln, Köln und München groß, die übrigen zweispaltig mit etwa zwei Dritteln der heutigen Höhe; Aufklappen unverändert | 500 |
| 99 Schalen | Bühne ohne graue Fläche (auch Desktop, Admin: „Grau seltener“ – als einzige Desktop-Änderung, Optik 1440 gezielt aktualisieren); Wagner-Zitat am Handy ausblenden (die H2 wiederholt es) | 300 |
| Manufaktur | Farbskala bleibt; zweites Foto (Krüge) am Handy ausblenden; Faktenliste auf Masse, Glasurbrand, Gebrauch | 700 |
| übrige | große Zitate und Aussagen am Handy eine Stufe kleiner, falls nach den obigen Punkten noch zu wuchtig (am Screen entscheiden, Tokens nur im Medienblock) | 300 |

**Prüfen (immer visuell, Admin):** Ganzseiten-Screens 390 und 768 vorher/nachher, Höhe je Abschnitt vorher/nachher (Skript `.superpowers/hoehen.mjs <url>`), Tastatur und Screenreader-Reihenfolge der Wischreihen (Fokus sichtbar, kein Inhalt nur per Wischen erreichbar ohne Hinweis), axe grün, Konsole sauber.

**Vergleichsseite:** Der Controller baut eine Vergleichsseite (Artifact) mit beiden Vorschau-Links, Ganzseiten-Screens nebeneinander und den Höhen je Abschnitt.
