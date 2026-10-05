# Bericht: Phase B-1 – Varianten festgelegt

Stand: 04.10.2026. Plan: [PLAN-PHASE-B.md](PLAN-PHASE-B.md), Aufgaben B1–B4. Branch `phase-b-varianten` (von `astro-umbau`), Worktree `../KWM-phase-b`.

**Kurz:** Im Code steht nur noch die gewählte Fassung aus E5. Alle nicht gewählten Abschnitte, ihre Umschalt-Logik und vier ungenutzte Signaturen sind entfernt. Sichtbar ändert sich nichts: 26 von 26 Screens sind pixelgleich mit dem Prototyp, der Text ist auf allen 13 Seiten identisch. Die Seite lädt weniger und ist dadurch etwas schneller.

## Ergebnis

| Messgröße | Phase A | Phase B-1 |
|---|---|---|
| `public/js` | 168 KB | 72 KB |
| `public/css` | 148 KB | 116 KB |
| Lighthouse mobil, Startseite, Median aus 5: Leistung | 95 | **97** |
| … LCP | 2.809 ms | **2.447 ms** |
| … übertragene Daten | 373 KB | 345 KB |
| `npm test` (Optik, Barrierefreiheit, Routen, Verhalten) | 76/76 | 76/76 |
| Textvergleich Prototyp gegen Astro (13 Seiten) | 0 Abweichungen | 0 Abweichungen |

Gemessen lokal über denselben Server (`wrangler dev`), beide Stände abwechselnd.

## Was entfernt wurde

| Aufgabe | Commit | Inhalt |
|---|---|---|
| B1 Markup | `adcedb4` | Startseite: Einstieg „Wort und Bild“, Einzelwerk „Teeschale“, Kapitel „Meditation und 99 Schalen zusammen“; `data-variant` an den gewählten Abschnitten; CSS, das nur diese Abschnitte betraf (`rep__*`) |
| B2 Logik | `5f99620` | `varianten.js` und `data-grund` auf `<html>`; Grundtöne Porzellan/Creme; Lebensweg „zeichnet sich einmal“; Feuer-Text „wandert“; Farbskala „Fläche“; alle Listener auf `kwm:varianten` |
| B3 Signaturen | `a7877bd` | `sig-profil`, `sig-drehen`, `sig-buehne`, `sig-komposition` (je JS und CSS), Registereinträge und `@import`; toter Block für ziehbare Leisten (`[data-drag]`) in `main.js`, der schon vor Phase B kein Ziel mehr hatte |
| Endprüfung | `70541b7` | `DESIGN.md` auf den heutigen Stand, verwaiste Reste und nicht mehr genutzte Bilder |

Das Entwurf-Panel selbst war schon in Phase A entfernt (Hinweis des Admins).

## Bewusste Korrektur ohne sichtbare Wirkung

Die gelöschte Datei `sig-profil.css` enthielt eine Regel, die versehentlich auch die Startseite am Handy beeinflusste (`.hero .hero__text { padding-top: 20px }`, unter 900 px). Ohne sie wäre der Einstieg am Handy 16 px höher geworden; der Optik-Test hat das gefunden. Der Wert steht jetzt dort, wo er hingehört: `public/styles.css`, Regel `.hero__text` unter 900 px, `padding: 20px 0 16px` (vorher `36px 0 16px`, das von der gelöschten Regel überschrieben wurde). Ergebnis pixelgleich.

## Entscheidungen unterwegs (Rulings)

1. Der Verhaltenstest „Kein Entwurf-Panel“ wurde schon in B1 statt B2 umgebaut, weil B1 die `data-variant`-Attribute entfernt hat, auf die er sich stützte. Er prüft jetzt: kein Panel-Knopf, Einstiegsfoto sichtbar, kein Abschnitt „Wort und Bild“.
2. Die `rep__*`-Klassen wurden entfernt, obwohl der Plan sie als bleibend nannte. Der Plan irrte: Nur der gelöschte Abschnitt nutzte sie (`grep` ohne Treffer, Optik grün).
3. Nach B3 fehlten die acht Löschungen im Commit (Dateien nur lokal gelöscht). Behoben per Korrekturrunde; seitdem prüft jeder Auftrag nach dem Commit `git status` und `git show --stat`.

## Offen und für später notiert

- Phase B-2 (Fehler aus dem Audit, sichtbar) folgt auf eigenem Branch `phase-b-fehler`.
- `public/main.js`: Die 99-Schalen-Bühne wird über `$$('[data-cosmos]').forEach` gestartet, obwohl es nur noch eine gibt; harmlos, wird in Phase D zur Komponente.
- `keramik.js` exportiert `GLAZES`, das nur intern genutzt wird; Phase C/D (Glasuren als Daten).

## Was der Admin tun muss

Nichts zusätzlich. PR B-1 baut auf PR #4 auf und wird nach dessen Merge auf `main` umgestellt. Abnahme gemeinsam mit Phase A möglich: Die Vorschau dieses Branches sieht identisch aus.

---

# Phase B-2 – Fehler aus dem Audit behoben

Branch `phase-b-fehler` (von `phase-b-varianten`). Quelle: Fehlerliste in `ASTRO-BERICHT.md` Abschnitt 5. Bewusste, sichtbare Korrekturen, jede auf die Fundstelle begrenzt.

| Prio | Fundstelle | Korrektur | Commit |
|---|---|---|---|
| P2 | Meisterstücke: „Zu diesem Stück anfragen“ (24×), 43,56 px hoch | Tippfläche 44 px (`min-height`, `inline-flex`); optisch gleich, Seite am Handy insgesamt ~10 px länger | `c1e6ce4` |
| P3 | Seitenmenü „Rechtliches“ (5 Seiten): kurze Einträge wie „AGB“ 31 px breit | `min-width: 44px`; optisch gleich | `8c48bc9` |
| P3 | Startseite, Farbskala: `transition: width, height` am Vorschaubild | War schon wirkungslos (Farbskala animiert per `transform`), entfernt | `8472095` |
| – | Startseite, Farbskala: Hover-Größen 132 px / mobil 44 px (gefunden in der Endprüfung) | **Echter Fehler:** Am Handy schrumpfte die Glasurprobe beim zweiten Tippen (Lösen) ohne Übergang auf etwa 18 px statt auf ihre Ausgangsgröße. Die Regeln gehörten zu keiner gewählten Fassung und sind entfernt; die Probe kehrt jetzt in die Ausgangsgröße zurück | `ec69d1b` |
| – | Meisterstücke: Klasse `tap` an den Anfrage-Links | trug nichts mehr bei (komplett überschrieben), entfernt | `764da02` |

**Bewusst nicht geändert:**
- Orte (`sig-orte.css`, Übergang über `margin-top`): `translate` würde nur optisch verschieben; im geschlossenen Zustand blieben die Folgeinhalte 2 px tiefer. Start- und Endzustand wären nicht mehr identisch, also bleibt es.
- Leichtes Überschwingen der Punkte (`--ease-pop`): Gestaltungsfrage an den Admin (`ADMIN-OFFEN.md`).
- Links im Fließtext unter 44 px Höhe: nach WCAG 2.5.8 ausgenommen.

**Prüfung:** `npm test` 76/76; einziger aktualisierter Optik-Screen: Meisterstücke mobil (nur die 24 Knöpfe, Differenzbild geprüft, Ausschnitt vorher/nachher optisch gleich). Tippflächen-Messung danach: nur noch Fließtext-Links und der bekannte Fehlalarm der Orte-Kacheln (ganze Kachel ist Klickfläche). Barrierefreiheit 26/26, `npm run check` grün. Endprüfung Standards/Spezifikation (Opus) mit einer Korrekturrunde.

Hinweis zu den Referenz-Screens: Sie liegen nicht im Repo (`tests/__screens__/` ist ausgeschlossen). Nach dem Merge von Phase A wird der Ausgangsstand ohnehin aus `main` neu erzeugt; ab dann ist B-2 Teil davon.
