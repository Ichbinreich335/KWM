# Bericht: Astro-Umbau Phase A (1:1)

Stand: 04.10.2026. Plan: [PLAN-ASTRO-UMBAU.md](PLAN-ASTRO-UMBAU.md), Abschnitt 7. Branch `astro-umbau` (von `design-v3`), Worktree `../KWM-astro`.

**Kurz:** Alle 13 Seiten laufen als statische Astro-Seiten und sehen aus wie der Prototyp V3. 26 von 26 Ganzseiten-Screens stimmen mit dem Prototyp überein, und der gerenderte Text ist auf jeder Seite identisch. Die Leistung ist gleich oder minimal besser. Offen beim Admin: die Vorschau abnehmen (Build-Befehl ist gesetzt, siehe 1.). Der alte Prototyp ist archiviert (`archiv/`).

**Vorschau:** https://astro-umbau-kwm-redesign.entwicklung-7f3.workers.dev (öffentlich, `noindex`)

## 1. Was der Admin tun muss

| # | Was | Warum | Wie |
|---|---|---|---|
| 1 | **Build-Befehl: Rest bei der Vorschau `astro-umbau`** (Produktion und Vorgabe für neue Vorschauen sind seit 04.10.2026 gesetzt) | Die bestehende Vorschau `astro-umbau` hat ihre Einstellungen beim Anlegen kopiert, ihr Build-Befehl ist noch leer. Automatische Builds dieses Branches scheitern deshalb weiter mit „dist does not exist“. Die Vorschau-URL zeigt trotzdem den aktuellen Stand, weil ich sie nach jedem Stand per `npx wrangler preview` hochlade. | Dashboard → `kwm-redesign` → Previews → `astro-umbau` → Settings: Build command `npm run build`. Oder die Vorschau löschen, dann entsteht sie beim nächsten Push neu aus der Vorgabe. |
| 2 | **Vorschau ansehen und Phase A abnehmen** | Nach der Abnahme wird der Ausgangsstand der Tests auf `main` umgestellt; der Prototyp bleibt im Archiv. | Vorschau-URL oben. Danach Bescheid geben: Ich setze den Tag `prototyp-v3` und stelle den Ausgangsstand für die Tests auf `main` um. Der Prototyp liegt im Archiv (`archiv/prototyp/`). |
| 3 | optional: andere Branches | Vorschau-Builds von `design-v3`, `claude/softr-lager-app` usw. scheitern seit heute, weil `wrangler preview` einen `previews`-Block in `wrangler.jsonc` verlangt. In `astro-umbau` ist er ergänzt; nach dem Merge erben neue Branches ihn. | Nichts tun, falls diese Vorschauen nicht mehr gebraucht werden. |
| 4 | optional (E6) | Vorschau-URLs sind öffentlich. | Cloudflare Access für die Previews einschalten (ein Schalter im Dashboard). |

**Bestätigt per API (nur gelesen):** Deploy-Befehl `npx wrangler deploy`, Vorschau-Befehl `npx wrangler preview`, Preview Builds eingeschaltet, Produktionsbranch `main`, Root `/`. Nur der Build-Befehl fehlt.

**Nicht nötig:** Die im Plan befürchtete einmalige, nicht umkehrbare Umstellung auf Worker Previews. Der Worker nutzt sie schon (`previews_enabled: true`, sieben Vorschauen pro Branch vorhanden).

## 2. Erledigt

| Aufgabe | Commit | Ergebnis |
|---|---|---|
| A0 Worktree, Design-Freeze | `1bf41da` | Freeze in UEBERGABE.md §0 |
| A1 Prototyp nach `prototyp/`, Ausgangsstand | `88121c6` | 26 Referenz-Screens, zweimal hintereinander stabil |
| A2 Astro 7.3.5, TS strictest, Prettier, ESLint, CI, Assets | `48ecb21` | `npm run check` grün, 99 genutzte Bilder übernommen (nicht genutzte nicht) |
| A3 Layout, Header, Footer, 404, Daten | `3c5e7f3` | Kopf, Fuß und Anfrage-Leiste holen Kontakt und Navigation aus `src/data/`; in Seitentexten und im Anfrageformular stehen Telefon und Mail noch fest im Markup (1:1, Auflösung in Phase D) |
| A4 Anfrage-Leiste, Anfrageformular, Rechtsseiten | `ef13e8f` | 10/10 Screens gleich |
| A5 Unterseiten | `52e5f16` | 12/12 Screens gleich, Formular-Vorbelegung per `?stueck=` |
| A6 Startseite | `f40c787` | 2/2 Screens gleich, Datumslogik bleibt im Browser |
| A7 Linkprüfung, Weiterleitungen `/v3/`, `/v2/` | `f305ddb` | alle Links, Bilder, Skripte 200; `/v3/aktuelles.html?praesentation` → `/aktuelles?praesentation` |
| A8 `previews`-Block, Barrierefreiheits-Test, a11y-Korrekturen, README, Bericht, Endprüfung | `b40350e`, `2248735`, `19f1842`, `de1f129`, `73a4874`, dieser Commit | siehe unten |

Jede Aufgabe A4–A7 (und die a11y-Korrekturen A8a) wurde von einem eigenen Subagenten (Sonnet) umgesetzt und danach von einem zweiten geprüft (Spezifikation und Codequalität). Alle fünf Reviews: keine kritischen oder wichtigen Befunde.

**Endprüfung über den ganzen Branch** (Skill `code-review`, zwei getrennte Prüfer auf Opus: Standards und Spezifikation): keine Fehler in der Umsetzung. Behoben in `73a4874`: totes CSS, ungenutzter Typ, fehlende Begründung an `prettier-ignore`, uneinheitliche Ignore-Listen, offene Seiten im Datumstest. Die Nachprüfung bestätigt alle fünf. Die übrigen Hinweise stehen in Abschnitt 3 und 5.

### Prüfungen (Endstand)

| Prüfung | Ergebnis |
|---|---|
| `npm run check` (Format, Lint, `astro check` strictest, Build) | grün |
| Optik: 13 Seiten × Desktop 1440 / Mobil 390 gegen Prototyp | 26/26 |
| Textvergleich `innerText` Prototyp gegen Astro (zusätzlich, siehe 4.2), Text nur für Screenreader (`.visually-hidden`) auf beiden Seiten ausgeblendet | 0 Abweichungen auf allen 13 Seiten |
| Routen (404 auch tief verschachtelt, saubere URLs, `noindex`, Links, Weiterleitungen) | 12/12 lokal, 22/22 Routen + Verhalten gegen die Vorschau |
| Verhalten (Anfrage-Leiste, Sonderzeichen, Formular-Vorbelegung, Leerzeichen, Datumshinweis) | 10/10 |
| Barrierefreiheit axe, WCAG 2.2 AA, 13 Seiten × 2 | 26/26 (nach den Korrekturen in 4.3) |
| Konsolenfehler | keine (außer dem gewollten 404-Status der 404-Seite) |
| Horizontales Scrollen bei 390 px und bei 200 % Zoom (720 px) | keines auf allen Seiten |

### Lighthouse (mobil, Lighthouse 13.5)

Vorher/nachher fair verglichen: beide Stände lokal über denselben Server (`wrangler dev`), Startseite je 8 Läufe, Manufaktur je 3, Median.

| Seite | Prototyp | Astro |
|---|---|---|
| Startseite: Leistung / LCP | 95,5 / 2.750 ms | **96 / 2.673 ms** |
| Manufaktur: Leistung / LCP | 97 / 2.468 ms | 97 / 2.516 ms |

Gleiche Requests (48) und gleiche Datenmenge; das HTML ist bei Astro etwas kleiner. Abweichungen liegen im Messrauschen (einzelne Läufe streuen um ±600 ms). Phase A ist also nicht langsamer.

Auf der Cloudflare-Vorschau (mobil, Median aus 3): Startseite Leistung 95, Barrierefreiheit 94, Best Practices 100, SEO 66; Manufaktur 99 / 96 / 100 / 66. Die übrigen Seiten: Barrierefreiheit 96–100, Best Practices 100. SEO bleibt bis zum Go-live bei 63–66, einziger Grund ist das gewollte `noindex`. Die Barrierefreiheits-Abzüge sind inzwischen behoben (4.3), die Vorschau-Werte stammen von davor. Desktop (Messung des Admins): Leistung 100, LCP 0,4 s.

### Screens

`../KWM-astro/.shots/astro/<seite>-desktop|mobile-fold|full.png`, alle 13 Seiten von der Vorschau, mit `?praesentation`. Selbst angesehen; keine abgeschnittenen Texte, keine Platzhalter, alles deutsch. Hinweis: Das Footer-Logo zeichnet sich beim Scrollen und fehlt deshalb in Ganzseiten-Screens. Das ist im Prototyp genauso gewollt.

## 3. Offen

- ~~Prototyp löschen~~ → **archiviert statt gelöscht** (Admin-Entscheidung 04.10.2026): `prototyp/` liegt jetzt in `archiv/prototyp/`, die alten Entwurfs-Dokumente aus dem Hauptordner in `archiv/entwurf/` (siehe `archiv/README.md`). `figures.json` (Bilderliste der alten WordPress-Seite) ist nach `konzept/figures.json` gezogen, der Verweis in `AUFTRAG-ASTRO.md` ist angepasst. Das Einmal-Werkzeug `zu-astro.mjs` ist entfernt (steht in der Git-Historie). Der Prototyp baut aus dem Archiv unverändert und dient bis zur Abnahme als Ausgangsstand der Optik-Tests. Nach der Abnahme wird der Ausgangsstand auf `main` umgestellt (Plan A8 Schritt 6, ohne das Löschen).
- ~~Alte Hilfsskripte in `.shots/`~~: erledigt (Admin-Entscheidung 04.10.2026). `folds`, `probe`, `states`, `sub-confirm` und `sheet` sind entfernt, weil sie ohne Funktion waren. Geblieben sind `shoot`, `segments`, `mobsheet`, `sub-mob`, `tile` und `inspo`.
- **Vorschau per Workers Builds:** wartet auf den Build-Befehl (Admin-Punkt 1). Die Vorschau oben habe ich bis dahin lokal mit `npx wrangler preview` erzeugt, dem Befehl, den auch Workers Builds ausführt.
- **Nach dem Merge** (A8 Schritt 7): Produktions-Build beobachten, Routen- und Verhaltenstests gegen die Produktions-URL.

## 4. Abweichungen vom Prototyp und vom Plan

### 4.1 Bewusste, unsichtbare Abweichungen im Markup
- Versand und Zahlung: Der leere Absatz `anfrage-band__hint` entfällt (Komponente gibt ihn nur mit Inhalt aus). Screens unverändert.
- Prettier setzt Linktexte auf eigene Zeilen. Das erzeugt Leerzeichen am Rand von Links, die nicht dargestellt werden (Textvergleich 0). An zwei Stellen hätte daraus ein sichtbares „Wort ,“ bzw. „Rhein-Ruhr .“ werden können. Dort steht `{/* prettier-ignore */}` mit dem Absatz in einer Zeile (`besuch.astro`, `index.astro` `.orte__tip`).
- Menü: Zwischen Name und Beschreibung steht jetzt ein Leerzeichen. Unsichtbar (Blockelemente), Screenreader lesen „Meisterstücke Unikate…“ statt „MeisterstückeUnikate…“.
- Kopf-Skript: `catch {}` statt `catch (e) {}` (Lint), gleiches Verhalten.

### 4.2 Abweichungen vom Plan (Rulings)
1. Prettier-, ESLint- und TypeScript-Ausnahmen um Doku- und Agenten-Ordner erweitert (Root-Markdown außer README, `.agents`, `.claude`, `.superpowers`, `.impeccable`, `.wrangler`, Testausgaben). Sonst hätte `npm run format` DESIGN.md und CLAUDE.md umformatiert.
2. Plan-gewollt rote Tests zwischen A3 und A6 galten nicht als Blocker. Seit A6 ist alles grün.
3. Review nach jeder Aufgabe A4–A7 auf Anweisung des Admins für diese Session (der Plan §13a sah nur eine gebündelte Endprüfung vor; die gab es zusätzlich).
4. Prototyp-Testserver auf Port 4392 statt 4391, weil auf 4391 ein Server aus dem Hauptordner lief, den die Tests sonst still mitbenutzt hätten.
5. `expect.timeout` 15 s in `playwright.config.ts`. Der „instabile“ Startseiten-Screen in A1 war kein Zufall in der Seite, sondern eine Zeitüberschreitung beim Erzeugen des 18.884 px hohen Screens unter Last.
6. Test-Server gilt als bereit, sobald `/robots.txt` antwortet (die Startseite gab es erst ab A6).
7. **Zusätzliche Abnahme Textvergleich:** Der Optik-Test hat 0,2 % Pixeltoleranz und übersieht deshalb ein einzelnes verschobenes Leerzeichen. Der Textvergleich hat zweimal genau so einen Fehler gefunden (siehe 4.1).
8. `"previews": {}` in `wrangler.jsonc`, fehlte im Plan, Pflicht laut Cloudflare-Doku.
9. **Entwurf-Panel schon in Phase A entfernt** (Admin, 04.10.2026). Es war ohne `?praesentation` für jeden Besucher sichtbar, und eine einmal angeklickte Variante blieb im Browser gespeichert. `public/js/varianten.js` setzt jetzt fest die Fassung aus E5 (jeweils die erste Option) und liest weder URL noch Speicher; `entwurf.js` und `entwurf.css` sind gelöscht, der Grundton steht fest als `data-grund="galerie"` auf `<html>`. Ein Verhaltenstest sichert das ab, auch mit früher gespeicherter Auswahl. Linkprüfung und Barrierefreiheits-Test prüfen dadurch die normale Ansicht ohne Parameter. Reine Anker (`#…`) überspringt die Linkprüfung weiterhin (der Sprachlink „DE“ zeigt auf `#`).
10. Watch-Pfade in der Schreibweise der Cloudflare-Doku (`src/*` statt `src/**`).
11. Die unsichtbaren Barrierefreiheits-Fehler sind schon in Phase A behoben und der axe-Test ist scharf geschaltet (der Plan sah `test.fixme` bis Phase B vor). Grund: Plan-Regel „Unsichtbare Korrekturen sofort, solange der Optik-Test grün bleibt“.

Weitere Ergänzungen: `@types/node` (für `process` in den Tests), `@axe-core/playwright`, `webServer: []` statt `undefined` (TypeScript strictest).

### 4.3 In Phase A behobene Fehler aus dem Prototyp (unsichtbar)
| Fehler | Seiten | Korrektur |
|---|---|---|
| `aria-label` auf `<p>`/`<span>` der Wort-Einblendung (WCAG 4.1.2, Screenreader dürfen es ignorieren) | Start, Meisterstücke, Manufaktur, Young-Jae Lee | Satz zusätzlich als `.visually-hidden`-Text, Wort-Spans bleiben `aria-hidden` (`public/main.js`) |
| `<dl class="facts">` enthielt ein `<div>` mit Button statt `dt`/`dd` (WCAG 1.3.1) | Start | Hülle `div.facts` mit `dl.facts__list` und Aufruf-Box daneben, CSS-Selektoren angepasst |
| Waagerecht scrollbare Chronik nicht per Tastatur erreichbar (WCAG 2.1.1) | Start, Werkstatt | `tabindex="0"` |
| Formular setzte `aria-invalid=""` (gilt als „nicht ungültig“) | Besuch, Start | `aria-invalid="true"` bzw. entfernen (`public/js/sig-anfrage.js`) |

## 5. Fehlerliste für Phase B (sichtbar, nicht geändert)

Fehler-Audit: axe-core (WCAG 2.2 AA + Best Practices), Lighthouse (alle Kategorien), Tippflächen- und Überlaufmessung, Tastaturtest (Tab-Reihenfolge, Fokus sichtbar, Menü mit Escape, Formularfehler), 200 % Zoom, Skills `design:accessibility-review` und `impeccable audit` (inkl. Detektor). Kontrast: keine Verstöße gefunden.

| Prio | Seite | Fundstelle | Befund | Vorschlag |
|---|---|---|---|---|
| P2 | Meisterstücke | `a.catalog__ask` („Zu diesem Stück anfragen“, 24×) | Tippfläche knapp unter 44 px hoch (43,x px) | `min-height: 44px` bzw. `padding-block` um 1 px |
| P3 | Impressum, AGB, Versand, Zahlung, Datenschutz | Seitenmenü „Rechtliches“, kurze Einträge wie „AGB“ | Tippfläche nur 31 px breit (Höhe 44 px) | `min-width: 44px` |
| P3 | Besuch, Start (Formular), Datenschutz | Links im Fließtext (z. B. „Datenschutz“, Mailadresse) | 23 px hoch; nach WCAG 2.5.8 ausgenommen | nur prüfen, ob größere Zeilenhöhe gewünscht ist |
| P3 | Start | `styles.css:505` (rundes Vorschaubild, `transition: width, height`) | animiert Layout-Eigenschaften | mit `transform: scale()` lösen |
| P3 | Start | `sig-orte.css:117` (`transition: margin-top`) | animiert Layout-Eigenschaft | `translate` statt `margin-top` |
| P3 | alle | `--ease-pop` (Überschwing-Kurve) | Detektor meldet „Bounce-Easing“; laut Kommentar bewusst | Designentscheidung, nur bestätigen |

Aufräumen in Phase B (ohne sichtbare Wirkung): die nicht gewählten Varianten-Abschnitte im Markup und danach `varianten.js`; `sig-buehne.css/js` und weitere Signaturen, die keine Seite mehr nutzt; Kommentar in `index.astro` zu `js/sig-komposition.js`; CSS-Regeln für `data-grund="porzellan"/"creme"`, `data-feuertext="wandernd"`, `data-farbskala="flaeche"`.

Für spätere Phasen notiert: Kontaktdaten im Anfrageformular dreifach fest im Markup statt aus `kontakt.ts` (Phase D); die zwei `prettier-ignore` durch eine robustere Lösung ersetzen (Phase D); Weiterleitungstest auf 302-Status und `/v2/*` schärfen (Phase E); `/v3/:seite` leitet nur einstufige Pfade um, alte Asset-URLs wie `/v3/img/…` nicht (bewusst, geteilt wurden nur Seitenlinks); Anker-Ziele (`#…`) prüft der Linktest nicht.

Hinweis zu `X-Robots-Tag`: Auf Vorschau-URLs setzt Cloudflare selbst `noindex`; in der Produktion kommt das eigene `noindex, nofollow` aus `public/_headers` an.
