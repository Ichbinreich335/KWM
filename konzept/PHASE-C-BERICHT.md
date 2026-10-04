# Bericht: Phase C – Asset-Pipeline

Plan: [PLAN-PHASE-C.md](PLAN-PHASE-C.md) (eingecheckt im Branch `astro-umbau`). Worktree `../KWM-phase-c`. Jede Aufgabe ein eigener Branch und Draft-PR, gestapelt auf Phase B-2 (`phase-b-fehler`).

## C1 – CSS gebündelt (Branch `phase-c1-css`)

**Ergebnis:** Das gesamte CSS (außer den Schriften, die in C4 folgen) läuft durch Vite: zusammengefasst, minifiziert, mit Hash im Dateinamen und dauerhaft cachebar (`/_astro/*` → `Cache-Control: immutable`). Sichtbar ändert sich nichts.

| Messgröße (Startseite, mobil) | Phase B | C1 |
|---|---|---|
| CSS-Anfragen | 12 | 3 |
| CSS gesamt | 125 KB Quelle | 99 KB minifiziert |
| Lighthouse-Median aus 5: FCP / LCP | 1.248 / 2.374 ms | **1.170 / 2.211 ms** |
| Anfragen gesamt / übertragen | 40 / 345 KB | **31 / 333 KB** |
| `npm test` | 76/76 | 78/78 (neuer Reihenfolge-Test) |
| Textvergleich 13 Seiten | 0 | 0 |

**Abweichung vom Plan (begründet):** Der Plan sah vor, dass das Layout die Grundstile importiert und jede Seite ihr Seiten-CSS. Im Bundle hält Astro/Vite diese Reihenfolge aber nicht ein: Gemeinsames CSS landete hinter dem Seiten-CSS, kleine Seiten-Dateien wurden vor allen Links eingebettet. Kaskaden-Ebenen (`@layer`) scheiden aus, weil bei ihnen die Ebene vor der Spezifität entscheidet, und das veränderte drei Seiten sichtbar. Umgesetzt ist:
- Jede Seite importiert `../styles/basis.css` (bündelt global, pages, expander), dann ihr Seiten-CSS, dann `../styles/signaturen/signaturen.css`. Das Layout importiert kein CSS.
- Zwei feste Bündel (`basis`, `signaturen`) über `vite.build.rolldownOptions.output.codeSplitting.groups` (die aktuelle API in Vite 8/Rolldown; `manualChunks` ist veraltet).
- `build.inlineStylesheets: 'never'`, damit kein Seiten-CSS vor den Links eingebettet wird. Kostet auf Unterseiten eine Anfrage von 3–5 KB (gecacht), spart auf der Startseite 9 Anfragen.
- **Absicherung:** Ein Test in `tests/routen.spec.ts` prüft auf allen 13 Seiten die Reihenfolge der Stylesheets (Schriften, Basis, höchstens ein Seiten-Bündel, Signaturen, kein `<style>` im Kopf). Er schlägt an, wenn eine Seite `basis.css` vergisst oder die Reihenfolge vertauscht, und auch, wenn ein Werkzeug-Update die Aufteilung still ändert. Die Konvention steht in der README.

**Prüfung:** Review der Aufgabe (Opus, Architektur) mit einer Korrekturrunde, Nachprüfung aller Punkte. Der Formatier-Commit ist per minifiziertem Vergleich aller 18 CSS-Dateien als reine Formatierung belegt (einzige Änderung: Hex-Farben in Kleinbuchstaben).
