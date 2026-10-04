# Umbau der Website vom HTML-Prototyp (V3) auf Astro – Umsetzungsplan

> **Für ausführende Agenten:** Pflicht-Skill `superpowers:executing-plans` (eine Session arbeitet alles ab) oder `superpowers:subagent-driven-development` (ein frischer Subagent pro Aufgabe). Schritte sind als Checkboxen (`- [ ]`) angelegt. Vorher `CLAUDE.md` und `konzept/UEBERGABE.md` Abschnitt 0 lesen. Der Auftrag `konzept/AUFTRAG-ASTRO.md` bleibt gültig; dieser Plan ist seine ausführliche Fassung für Phase 1 und ordnet die Folgephasen ein.

**Ziel:** Die V3-Website (heute `src/v3/*.html` → `site/v3/`) läuft als statische Astro-Seite auf Cloudflare Workers, sieht pixelgleich aus und ist danach Schritt für Schritt in saubere Astro-Komponenten, TypeScript und optimierte Bilder und Schriften überführt.

**Architektur:** Astro 7 im Modus `static` ohne Adapter. Seiten in `src/pages/*.astro`, Gerüst in `src/layouts/BaseLayout.astro`, wiederkehrende Teile in `src/components/`. Interaktivität bleibt Vanilla-TypeScript in Astros `<script>`-Verarbeitung, ohne UI-Framework. Ausgeliefert wird `dist/` als Static Assets des bestehenden Workers `kwm-redesign`, gebaut von Workers Builds, mit Vorschau-URL pro Branch (Worker Previews).

**Technik:** Astro ^7.3 (aktuell 7.3.5), TypeScript (`astro/tsconfigs/strictest`), reines CSS mit den bestehenden Tokens, Playwright Test (Optik- und Verhaltensprüfung), Prettier + `prettier-plugin-astro`, ESLint + `eslint-plugin-astro`, Wrangler 4.138, Node 24.

**Spezifikation:** `konzept/AUFTRAG-ASTRO.md` (Phasen 1–5), `DESIGN.md` Abschnitt 11 (Komponenten-Inventar), `konzept/SITEMAP-V3.md` (URLs), `konzept/redirects-vorschlag.txt`.

Stand der Doku-Prüfung: 04.10.2026 über `astro-docs`-MCP, `cloudflare-docs`-MCP, `cloudflare-builds`-MCP und `sanity`-MCP. Quellen am Ende.

---

## 1. Die Sprachfrage: Womit baut man die Seite?

**Empfehlung: Astro-Komponenten (`.astro`) + TypeScript + reines CSS + Vanilla-Skripte. Kein React und kein anderes UI-Framework.**

Astro selbst ist schon die „Sprache“ für die Seiten. Eine `.astro`-Datei ist HTML mit einem TypeScript-Kopf (Frontmatter), der beim Bauen läuft. Danach bleibt reines HTML übrig. UI-Frameworks wie React sind in Astro optional und nur für „Inseln“ gedacht, also einzelne Bereiche, die im Browser einen eigenen Zustand verwalten.

| Kandidat | Was er brächte | Was er kostet | Urteil |
|---|---|---|---|
| **Astro-Komponenten + TS + Vanilla-`<script>`** | Statisches HTML, Props mit Typen, Skripte werden von Astro gebündelt, mit TypeScript versehen und pro Seite nur einmal eingebunden (Doku „Scripts and event handling“). Bestehende 5.700 Zeilen JS laufen weiter. | Nichts zusätzlich | **Gewählt** |
| React (`@astrojs/react`) | Komponentenmodell, großes Ökosystem | Eigene Laufzeitbibliothek im Browser plus Hydration für jede interaktive Insel. Canvas-Signaturen, Scroll-Beobachter und Menü müssten umgeschrieben werden, ohne dass Besucher etwas davon haben. Ohne `client:*` rendert React in Astro ohnehin nur statisches HTML, wie eine Astro-Komponente. | Nein |
| Preact | Wie React, kleiner | Gleiche Argumente, nur kleiner | Nein |
| Svelte / Vue / Solid | Gut für komplexe Bedienoberflächen | Zweite Komponentensprache neben `.astro`, kein Bedarf | Nein |
| Alpine.js | Interaktivität über HTML-Attribute | Das bestehende JS erledigt das schon | Nein |
| Web Components (Custom Elements) | Verhalten pro Komponenteninstanz (`this.querySelector`), von der Astro-Doku für komponentengebundenes Verhalten empfohlen | Keine Bibliothek nötig | **Ja, gezielt** (Phase D: Expander, Menü, Glasurbühne) |

Ergänzend:
- **CSS:** reines CSS mit den Tokens aus `DESIGN.md`. Kein Tailwind, denn sonst wären 3.000 Zeilen fertiges CSS neu zu schreiben. Ab Phase D trägt jede Komponente ihr CSS als scoped `<style>`.
- **Sanity Studio** (Phase 2) ist intern eine React-App. Es liegt aber getrennt in `studio/` und wird nie an Besucher ausgeliefert. Für die Website reicht beim Bauen eine GROQ-Abfrage, und Portable Text lässt sich mit Astro-Komponenten rendern (Skill `portable-text-serialization`).
- **Spätere Insel (Schaufenster):** Ein Schaufenster mit Filtern (z. B. nach Glasur und Form) ist für später angedacht, aber nicht Teil dieses Plans (Entscheidung Admin, 04.10.2026). Wenn es kommt, wird nur dieser eine Bereich interaktiv: zuerst als Custom Element, und falls das nicht reicht, als einzelne Framework-Insel (React, Preact oder Svelte über `client:visible`). Der Rest der Seite bleibt statisch, nichts muss neu gebaut werden. Vorbereitet wird es in Phase D, weil die Werkdaten dort schon typisiert und in Sanity-Form vorliegen. Auch im Schaufenster gelten „Preis auf Anfrage“ und keine Bestands- oder Lagerangaben.

---

## 2. Zielbild

### Ablauf

```
Git-Push (Branch)      ──► Workers Builds: npm ci → npm run build (astro build → dist/)
                             ├─ Produktionsbranch main → npx wrangler deploy  → kwm-redesign (Produktion)
                             └─ jeder andere Branch    → npx wrangler preview → Vorschau-URL im PR
Später (Phase 2): Sanity „Veröffentlicht“ ─► Webhook ─► Deploy Hook (POST) ─► gleicher Build auf main
```

### Ordnerstruktur nach Phase A

```
astro.config.mjs        Astro-Konfiguration (static, URL-Format, Whitespace)
tsconfig.json           strictest, schließt prototyp/ und public/ aus
wrangler.jsonc          Worker kwm-redesign, Assets aus ./dist
playwright.config.ts    Optik- und Verhaltensprüfung
eslint.config.js, .prettierrc, .prettierignore, .nvmrc
.github/workflows/check.yml
public/                 bis Phase C unverändert übernommene Prototyp-Assets
  _headers _redirects robots.txt styles.css main.js css/ js/ fonts/ img/
src/
  layouts/BaseLayout.astro
  components/Header.astro Footer.astro InquiryBand.astro InquiryForm.astro
  data/navigation.ts kontakt.ts
  pages/index.astro meisterstuecke.astro manufaktur.astro young-jae-lee.astro
        werkstatt.astro aktuelles.astro besuch.astro impressum.astro agb.astro
        versand.astro zahlung.astro datenschutz.astro 404.astro
tests/                  seiten.ts hilfen.ts optik.spec.ts routen.spec.ts verhalten.spec.ts
prototyp/               alter Prototyp (src, site, tools), wird am Ende von Phase A gelöscht
```

### URL-Schema

| Datei | Gebaut als (`build.format: 'file'`) | Aufruf (Cloudflare `auto-trailing-slash`) |
|---|---|---|
| `src/pages/index.astro` | `dist/index.html` | `/` |
| `src/pages/aktuelles.astro` | `dist/aktuelles.html` | `/aktuelles` (`/aktuelles.html` leitet dorthin um) |
| `src/pages/404.astro` | `dist/404.html` | jede unbekannte URL, Status 404 |

Das passt zu `konzept/redirects-vorschlag.txt`, der schon auf `/aktuelles` usw. zielt. Laut Astro-Doku gehört zu `build.format: 'file'` die Einstellung `trailingSlash: 'never'`.

---

## 3. Entscheidungen vor dem Start

**Stand 04.10.2026: E1 bis E5 vom Admin bestätigt.** Kleine Textänderungen kommen nach dem Umbau direkt in Astro. E6 bleibt optional.

| Nr. | Frage | Empfehlung | Blockiert |
|---|---|---|---|
| E1 | Framework/Sprache | Abschnitt 1: Astro + TS + Vanilla, kein React | – |
| E2 | Design-Freeze im Prototyp | Ab Start von Phase A keine Änderungen mehr an `src/v3/`. Neue Designwünsche erst nach dem Merge, dann direkt in Astro. Sonst muss jede Änderung doppelt nachgezogen werden. | Phase A |
| E3 | Basis-Branch | Neuer Branch `astro-umbau` von `design-v3` (64 Commits vor `main`), im Worktree `../KWM-astro`. Der PR nach `main` bringt V3 mit. | Phase A |
| E4 | V1 und V2 nach dem Merge | Nicht mehr ausliefern, sie bleiben in der Git-Historie (Tag `prototyp-v3`). Geteilte Links auf `/v3/...` leiten mit 302 auf die neuen URLs um. | Phase A, Aufgabe A7 |
| E5 | Varianten aus dem Entwurf-Panel | Final wird, was `?praesentation` heute zeigt (jeweils die erste Option, siehe Phase B). Das Entwurf-Panel entfällt. | nur Phase B |
| E6 | Vorschau-URLs schützen | Vorschauen auf `workers.dev` bekommen automatisch `X-Robots-Tag: noindex` und sind öffentlich erreichbar. Cloudflare Access ist möglich (ein Klick im Dashboard), aber für den Prototyp nicht nötig. | nein |

---

## 4. Globale Vorgaben (gelten für jede Aufgabe)

- Astro `^7.3` (Doku: „The latest release of Astro is v7.3.5“), Ausgabe `static`, **kein Adapter, kein SSR** (Astro-Doku: „If you're using Astro as a static site builder, you don't need an adapter.“).
- Keine UI-Framework-Integration (`@astrojs/react`, `preact`, `svelte`, `vue`, `solid-js`, `alpinejs`).
- `compressHTML: true`. Seit Astro 7 ist `'jsx'` der Standard und entfernt Leerzeichen zwischen Inline-Elementen.
- Alle Links und Asset-Pfade sind absolut (`/img/…`, `/aktuelles`), nie relativ (`../img`, `aktuelles.html`).
- Wrangler ≥ 4.135.0 (nötig für Worker Previews). Installiert ist 4.138.0, kein stilles Upgrade.
- Node 24 über `.nvmrc` (Workers Builds nutzt standardmäßig 24.18.0).
- Worker-Name `kwm-redesign`. `compatibility_date` bleibt `2026-09-24`, weil es keinen Worker-Code gibt und der Wrangler-Skill rät, das Datum nicht nebenbei zu ändern.
- Texte und Commits auf Deutsch. Keine Preise, kein Bestand, keine Lagerorte und keine Verfügbarkeit auf der Website.
- `X-Robots-Tag: noindex, nofollow` und `robots.txt` mit `Disallow: /` bleiben bis zum Go-live (Phase 5).
- Geheimnisse (API-Token, Deploy-Hook-URL) nie ins Repo.
- Vor jedem Merge: `npm run check` grün, Skill `code-review`, Screens 1440/390 px unter `.shots/astro/`.
- Arbeit nur im Worktree `../KWM-astro`. Vor jedem Commit `git branch --show-current` prüfen.
- **Doku vor Code:** Alles, was nicht wörtlich im Plan steht, wird vor dem Schreiben im `astro-docs`- bzw. `cloudflare-docs`-MCP nachgeschlagen und nach den dortigen Best Practices umgesetzt. Ist das MCP nicht erreichbar, melden statt raten.
- **Fehler-Regel:** Fehler aus Prototyp und alter Seite werden behoben, aber geordnet. Unsichtbare Korrekturen (gültiges HTML, absolute Links, fehlende `alt`/`aria`-Angaben, doppelte Daten) gehören sofort in Phase A, solange der Optik-Test grün bleibt. Alles, was man sieht (Abstände, Kontrast, Tippflächen, Texte, Umbrüche), wird in Phase A nur in `konzept/ASTRO-BERICHT.md` unter „Fehlerliste“ notiert (Seite, Fundstelle, Vorschlag) und in Phase B behoben. So bleibt der 1:1-Vergleich aussagekräftig, und kein Fund geht verloren.

## 5. Prüffokus (fällt in keinem Einzelschritt von selbst auf)

1. **Relative Pfade aus dem Prototyp.** `../img/…` und `besuch.html` funktionieren nur unter `/v3/`. Spätestens die 404-Seite unter `/a/b/gibt-es-nicht` hätte kaputte Links und Bilder. Erwartung: Jeder interne Link, jedes Bild und jede Datei antwortet mit 200, auch von der 404-Seite aus. → Aufgaben A3, A7
2. **Leerzeichen zwischen Inline-Elementen.** Ohne Gegenmaßnahme stünde z. B. „Meisterstücke ansehenManufakturprogramm“ auf der Seite. → Aufgabe A6
3. **Sonderzeichen in Props.** `&#8209;` (geschützter Bindestrich in „Young‑Jae“) und Umlaute in `?stueck=` würden als Rohtext bzw. falsch kodiert ausgegeben. → Aufgabe A4
4. **Datumsabhängige Inhalte.** Hinweiszeile und Ausstellungsstatus entscheiden im Browser anhand des heutigen Datums. Der statische Build darf das Datum nicht „einfrieren“. → Aufgabe A6
5. **Vorbelegtes Anfrageformular.** `/besuch?stueck=…#anfrage` muss das Feld „Stück“ füllen und zum Formular springen. → Aufgabe A5

---

## 6. Phasen und PRs im Überblick

| PR | Inhalt | Sichtbare Änderung | Voraussetzung |
|---|---|---|---|
| **A** | Astro-Gerüst 1:1: Seiten, Layout, 4 Komponenten, Assets unverändert in `public/`, Tests, Werkzeuge, Workers Builds + Previews | keine | E2–E4 |
| **B** | Varianten festlegen, Entwurf-Panel und ungenutzte Signaturen entfernen; danach die Fehlerliste aus Phase A abarbeiten | ja, gezielt (nur die Fehlerkorrekturen) | E5, Fehlerliste |
| **C** | Asset-Pipeline: CSS und JS nach `src/` (gebündelt, gehasht), Skripte in TypeScript strict, Bilder über `astro:assets`, Schriften über die Fonts API | keine, schnellere Ladezeiten | B |
| **D** | Komponenten-Bibliothek nach `DESIGN.md` §11, Inhalte als typisierte Daten in der Form des Sanity-Modells, Seiten-CSS aufgelöst | keine | C |
| **E** | Technisches SEO und Härtung: Sitemap, Canonical/OG, JSON-LD, Sicherheits-Header, CSP | keine | D |
| später | Phase 2 Sanity, Phase 3 Formular-Worker, Phase 4 Einwilligung/GTM, Phase 5 Go-live | – | je eigener Plan |

Phase A ist unten vollständig ausgeplant. B–E sind auf Aufgabenebene beschrieben und bekommen vor dem Start eine Feinplanung im selben Format.

---

## 7. Phase A: Astro-Gerüst 1:1

### Aufgabe A0: Arbeitsumgebung

**Dateien:** keine

- [ ] **Schritt 1: Worktree anlegen**

```bash
cd /Users/marc/Documents/GitHub/KWM
git fetch origin
git worktree add ../KWM-astro -b astro-umbau design-v3
cd ../KWM-astro && git branch --show-current   # erwartet: astro-umbau
```

- [ ] **Schritt 2: Design-Freeze festhalten.** In `konzept/UEBERGABE.md` Abschnitt 0 unter „Sonstiges“ ergänzen: „Ab 04.10.2026 Design-Freeze für `src/v3/`. Änderungen erst nach dem Astro-Merge.“ Commit:

```bash
git add konzept/UEBERGABE.md
git commit -m "Übergabe: Design-Freeze für den Astro-Umbau"
```

### Aufgabe A1: Prototyp verschieben und Optik-Ausgangsstand festhalten

**Dateien:**
- Verschieben: `src/` → `prototyp/src/`, `site/` → `prototyp/site/`, `tools/` → `prototyp/tools/`
- Ändern: `package.json`
- Anlegen: `playwright.config.ts`, `tests/seiten.ts`, `tests/hilfen.ts`, `tests/optik.spec.ts`
- Ändern: `.gitignore`

**Schnittstellen:**
- Liefert: `seiten` (Liste `{ name, prototyp, astro }`), `ziel` (`'prototyp' | 'astro'`), `seiteVorbereiten(page, pfad, optionen?) → Promise<string[]>` (gesammelte Konsolenfehler). Spätere Tests nutzen genau diese Namen.

Astro reserviert `src/` für sich. Der Prototyp zieht deshalb um und bleibt bis zur Abnahme baubar: `prototyp/tools/build.mjs` rechnet Pfade relativ zur eigenen Lage und funktioniert ohne Änderung.

- [ ] **Schritt 1: Verschieben und Prototyp-Build prüfen**

```bash
mkdir prototyp && git mv src prototyp/src && git mv site prototyp/site && git mv tools prototyp/tools
node prototyp/tools/build.mjs   # erwartet: "gebaut prototyp/site/…" dreimal
git status --short | grep -v '^R' # erwartet: keine geänderten Dateien außer Umbenennungen
```

- [ ] **Schritt 2: Playwright Test installieren**

```bash
npm install --save-dev --save-exact @playwright/test
npx playwright install chromium
```

- [ ] **Schritt 3: `tests/seiten.ts` anlegen**

```ts
export type Ziel = 'prototyp' | 'astro';

export const ziel: Ziel = process.env.ZIEL === 'prototyp' ? 'prototyp' : 'astro';

/** BASIS_URL zeigt die Tests auf eine Vorschau- oder Produktions-URL statt auf wrangler dev. */
export const externeBasis = process.env.BASIS_URL;

export const basisUrl: Record<Ziel, string> = {
  prototyp: 'http://localhost:4391',
  astro: externeBasis ?? 'http://localhost:8787',
};

export const seiten = [
  { name: 'start', prototyp: '/v3/index.html', astro: '/' },
  { name: 'meisterstuecke', prototyp: '/v3/meisterstuecke.html', astro: '/meisterstuecke' },
  { name: 'manufaktur', prototyp: '/v3/manufaktur.html', astro: '/manufaktur' },
  { name: 'young-jae-lee', prototyp: '/v3/young-jae-lee.html', astro: '/young-jae-lee' },
  { name: 'werkstatt', prototyp: '/v3/werkstatt.html', astro: '/werkstatt' },
  { name: 'aktuelles', prototyp: '/v3/aktuelles.html', astro: '/aktuelles' },
  { name: 'besuch', prototyp: '/v3/besuch.html', astro: '/besuch' },
  { name: 'impressum', prototyp: '/v3/impressum.html', astro: '/impressum' },
  { name: 'agb', prototyp: '/v3/agb.html', astro: '/agb' },
  { name: 'versand', prototyp: '/v3/versand.html', astro: '/versand' },
  { name: 'zahlung', prototyp: '/v3/zahlung.html', astro: '/zahlung' },
  { name: 'datenschutz', prototyp: '/v3/datenschutz.html', astro: '/datenschutz' },
  { name: '404', prototyp: '/v3/404.html', astro: '/gibt-es-nicht' },
] as const;

export type Seite = (typeof seiten)[number];
```

- [ ] **Schritt 4: `tests/hilfen.ts` anlegen**

```ts
import type { Page } from '@playwright/test';

/** Fester Tag für alle Optik-Vergleiche, damit Hinweise und Status gleich ausfallen. */
export const FESTER_TAG = new Date('2026-10-04T10:00:00+02:00');

interface Optionen {
  tag?: Date;
  /** Die 404-Seite meldet ihren eigenen Status als Konsolenfehler. */
  erwarte404?: boolean;
}

/**
 * Lädt eine Seite mit festem Datum, scrollt einmal durch (löst Einblendungen und
 * nachgeladene Signaturen aus) und gibt alle Konsolen- und Skriptfehler zurück.
 */
export async function seiteVorbereiten(page: Page, pfad: string, optionen: Optionen = {}): Promise<string[]> {
  const fehler: string[] = [];
  page.on('pageerror', (e) => fehler.push(e.message));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    if (optionen.erwarte404 && m.text().includes('404')) return;
    fehler.push(m.text());
  });
  await page.clock.setFixedTime(optionen.tag ?? FESTER_TAG);
  await page.goto(pfad);
  await page.waitForLoadState('networkidle');
  const hoehe = await page.evaluate(() => document.documentElement.scrollHeight);
  const schritt = (page.viewportSize()?.height ?? 800) * 0.6;
  for (let y = 0; y < hoehe; y += schritt) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForLoadState('networkidle');
  return fehler;
}
```

- [ ] **Schritt 5: `playwright.config.ts` anlegen**

```ts
import { defineConfig } from '@playwright/test';
import { basisUrl, externeBasis, ziel } from './tests/seiten';

export default defineConfig({
  testDir: 'tests',
  snapshotPathTemplate: '{testDir}/__screens__/{projectName}/{arg}{ext}',
  fullyParallel: true,
  use: {
    baseURL: basisUrl[ziel],
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled', caret: 'hide' },
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobil', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: externeBasis
    ? undefined
    : ziel === 'prototyp'
      ? { command: 'npm run prototyp', url: `${basisUrl.prototyp}/v3/index.html`, reuseExistingServer: true }
      : {
          command: 'npm run build && npx wrangler dev --port 8787',
          url: `${basisUrl.astro}/`,
          reuseExistingServer: true,
          timeout: 180_000,
        },
});
```

`reducedMotion: 'reduce'` nutzt die eingebaute Ruhe-Variante jeder Signatur (DESIGN.md §7: „Bei `prefers-reduced-motion` sofort der ruhige Endzustand“). So sind die Screens stabil. `wrangler dev` statt `astro preview`, weil nur Wrangler `html_handling`, `404-page`, `_headers` und `_redirects` wie in Produktion abbildet.

- [ ] **Schritt 6: `tests/optik.spec.ts` anlegen**

```ts
import { expect, test } from '@playwright/test';
import { seiteVorbereiten } from './hilfen';
import { seiten, ziel } from './seiten';

for (const seite of seiten) {
  test(`Optik: ${seite.name}`, async ({ page }) => {
    const fehler = await seiteVorbereiten(page, `${seite[ziel]}?praesentation`, {
      erwarte404: seite.name === '404',
    });
    await expect(page).toHaveScreenshot(`${seite.name}.png`, { fullPage: true });
    expect(fehler, 'Konsolenfehler').toEqual([]);
  });
}
```

- [ ] **Schritt 7: Skripte in `package.json` und `.gitignore`**

In `package.json` unter `scripts` ergänzen (die übrigen ersetzt Aufgabe A2):

```json
"prototyp": "node prototyp/tools/build.mjs && python3 -m http.server 4391 -d prototyp/site",
"test:ausgangsstand": "ZIEL=prototyp playwright test tests/optik.spec.ts --update-snapshots",
"test:optik": "playwright test tests/optik.spec.ts",
"test": "playwright test"
```

In `.gitignore` ergänzen (die Screens sind groß und lassen sich jederzeit aus dem Prototyp neu erzeugen):

```
tests/__screens__/
test-results/
playwright-report/
```

- [ ] **Schritt 8: Ausgangsstand erzeugen und Stabilität prüfen**

```bash
npm run test:ausgangsstand                       # erzeugt 26 Screens
ZIEL=prototyp npx playwright test tests/optik.spec.ts   # erwartet: 26 passed
```

Läuft der zweite Befehl nicht durch, ist die Seite nicht deterministisch (Zufall, Zeit, Nachladen). Dann zuerst die Ursache beheben (Skill `diagnosing-bugs`). Erst danach geht es weiter, denn sonst ist jeder spätere Vergleich wertlos.

- [ ] **Schritt 9: Commit**

```bash
git add -A prototyp package.json package-lock.json playwright.config.ts tests .gitignore
git commit -m "Astro-Umbau: Prototyp nach prototyp/ verschoben, Optik-Ausgangsstand mit Playwright"
```

### Aufgabe A2: Astro, Werkzeuge und Assets

**Dateien:**
- Anlegen: `astro.config.mjs`, `tsconfig.json`, `.nvmrc`, `.prettierrc`, `.prettierignore`, `eslint.config.js`, `.github/workflows/check.yml`, `public/` (Assets)
- Ändern: `package.json`, `wrangler.jsonc`, `.gitignore`

- [ ] **Schritt 1: Pakete installieren**

```bash
npm install astro@^7.3
npm install --save-dev --save-exact @astrojs/check typescript prettier prettier-plugin-astro eslint eslint-plugin-astro typescript-eslint
npm view astro engines   # Node-Vorgabe ablesen und mit .nvmrc abgleichen
```

- [ ] **Schritt 2: `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';

// Statische Website, kein Adapter: Cloudflare liefert dist/ als Static Assets aus.
export default defineConfig({
  site: 'https://kwm-1924.de',
  output: 'static',
  // aktuelles.astro → dist/aktuelles.html, von Cloudflare als /aktuelles ausgeliefert
  build: { format: 'file' },
  trailingSlash: 'never',
  // Astro 7 entfernt sonst Leerzeichen zwischen Inline-Elementen (Standard 'jsx')
  compressHTML: true,
});
```

- [ ] **Schritt 3: `tsconfig.json` und `.nvmrc`**

```json
{
  "extends": "astro/tsconfigs/strictest",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "public", "prototyp", ".shots", "konzept", "keramik"]
}
```

`.nvmrc`:

```
24
```

- [ ] **Schritt 4: `package.json` vollständig**

`"type": "module"` setzen, `description` auf „Website kwm-1924.de (Astro, statisch)“ ändern und die Skripte so setzen:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro build && wrangler dev",
  "deploy": "astro build && wrangler deploy",
  "format": "prettier --write .",
  "lint": "eslint .",
  "check": "prettier --check . && eslint . && astro check && astro build",
  "prototyp": "node prototyp/tools/build.mjs && python3 -m http.server 4391 -d prototyp/site",
  "test:ausgangsstand": "ZIEL=prototyp playwright test tests/optik.spec.ts --update-snapshots",
  "test:optik": "playwright test tests/optik.spec.ts",
  "test": "playwright test"
}
```

Die alten Skripte `watch` und `shots` entfallen: `watch` erledigt jetzt `astro dev`, und `.shots/shoot.mjs` bleibt direkt per `node` aufrufbar.

- [ ] **Schritt 5: Format und Lint**

`.prettierrc` (laut Astro-Doku „Editor setup“):

```json
{
  "singleQuote": true,
  "printWidth": 120,
  "plugins": ["prettier-plugin-astro"],
  "overrides": [{ "files": "*.astro", "options": { "parser": "astro" } }]
}
```

`.prettierignore`:

```
dist
.astro
public
prototyp
konzept
keramik
.shots
tests/__screens__
package-lock.json
```

`eslint.config.js` (Aufbau nach dem User Guide von `eslint-plugin-astro`; vor dem Schreiben den aktuellen Guide gegenlesen):

```js
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist/', '.astro/', 'public/', 'prototyp/', 'konzept/', 'keramik/', '.shots/', 'tests/__screens__/'] },
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
];
```

`.gitignore` ergänzen: `dist/` und `.astro/`.

- [ ] **Schritt 6: Assets übernehmen, nur was V3 tatsächlich nutzt**

```bash
S=prototyp/site
mkdir -p public/css public/js public/fonts
cp $S/v3/styles.css $S/v3/main.js public/
cp $S/v3/css/*.css public/css/
cp $S/v3/js/*.js public/js/
cp $S/v3/fonts/* public/fonts/
cp $S/_headers $S/robots.txt public/
# Bilder: nur die in V3-HTML, -CSS oder -JS referenzierten
grep -rhoE "img/[A-Za-z0-9_./-]+\.(webp|svg|png|jpg)" prototyp/src/v3 $S/v3 | sort -u > "$TMPDIR/bilder.txt"
while read -r p; do mkdir -p "public/$(dirname "$p")"; cp "$S/$p" "public/$p"; done < "$TMPDIR/bilder.txt"
wc -l < "$TMPDIR/bilder.txt"; find public/img -type f | wc -l   # beide Zahlen gleich
grep -rn "\.html" public/js public/main.js   # Treffer = Links im JS, auf /seite umstellen
```

Ein fehlendes Bild fällt spätestens in A7 im Linktest auf. `prototyp/site/img 2/` und `v3-entwurf/` werden bewusst nicht übernommen.

- [ ] **Schritt 7: `wrangler.jsonc`**

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  // Statische Astro-Website (dist/) als Cloudflare Worker mit Static Assets, kein eigener Worker-Code.
  "name": "kwm-redesign",
  "compatibility_date": "2026-09-24",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page",
    "html_handling": "auto-trailing-slash",
  },
  // Vorschau-URL pro Branch (Worker Previews); laut Doku explizit setzen
  "preview_urls": true,
}
```

- [ ] **Schritt 8: CI-Workflow `.github/workflows/check.yml`**

```yaml
name: Prüfung
on:
  pull_request:
  push:
    branches: [main]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run check
```

Die Optik-Tests laufen bewusst nicht in CI, denn die Schriftdarstellung unter Linux weicht von macOS ab. Sie laufen lokal vor jedem PR.

- [ ] **Schritt 9: Leerer Build als Rauchtest**

`src/pages/404.astro` vorläufig mit `<p>Platzhalter</p>` anlegen (wird in A3 ersetzt), dann:

```bash
npm run build && ls dist   # erwartet: 404.html, _headers, robots.txt, css/, js/, fonts/, img/, main.js, styles.css
npx wrangler deploy --dry-run   # erwartet: Assets aus ./dist werden gepackt, kein Fehler
```

- [ ] **Schritt 10: Commit**

```bash
npm run format
git add -A && git commit -m "Astro-Umbau: Astro 7, TypeScript strictest, Prettier, ESLint, CI und Prototyp-Assets in public/"
```

### Aufgabe A3: Layout, Kopf, Fuß und 404-Seite

**Dateien:**
- Anlegen: `src/data/navigation.ts`, `src/data/kontakt.ts`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/layouts/BaseLayout.astro`, `tests/routen.spec.ts`
- Ersetzen: `src/pages/404.astro`

**Schnittstellen:**
- Liefert: `navigation` (Array `{ key, href, name, desc }`), Typ `NavKey`, `kontakt` (Objekt, Felder unten), `BaseLayout` mit Props `{ title: string; description: string; bodyClass: string; nav?: NavKey }` und Slot `head` für seitenspezifische `<link>`/`<meta>`.

- [ ] **Schritt 1: Fehlschlagenden Test schreiben, `tests/routen.spec.ts`**

```ts
import { expect, test } from '@playwright/test';
import { seiten, ziel } from './seiten';

test.skip(ziel !== 'astro', 'prüft den Astro-Build unter wrangler dev');

test('Unbekannte Seite: Status 404 mit eigener Seite, auch tief verschachtelt', async ({ page, request }) => {
  const antwort = await page.goto('/a/b/gibt-es-nicht');
  expect(antwort?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Diese Schale ist leer.');
  for (const href of await page.locator('.not-found__links a').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''))) {
    expect(href.startsWith('/'), `${href} ist relativ`).toBe(true);
    expect((await request.get(href)).status(), href).toBe(200);
  }
});

test('noindex bleibt bis zum Go-live', async ({ request }) => {
  const antwort = await request.get('/');
  expect(antwort.headers()['x-robots-tag']).toContain('noindex');
});

test('Seiten antworten ohne .html mit 200', async ({ request }) => {
  for (const seite of seiten.filter((s) => s.name !== '404')) {
    expect((await request.get(seite.astro, { maxRedirects: 0 })).status(), seite.astro).toBe(200);
  }
});

test('.html leitet auf die saubere URL um', async ({ request }) => {
  const antwort = await request.get('/aktuelles.html', { maxRedirects: 0 });
  expect(antwort.status()).toBeGreaterThanOrEqual(300);
  expect(antwort.status()).toBeLessThan(400);
  expect(antwort.headers()['location']).toBe('/aktuelles');
});
```

- [ ] **Schritt 2: Test laufen lassen**

Run: `npx playwright test tests/routen.spec.ts --project=desktop`
Erwartet: FAIL. Die 404-Überschrift fehlt, und die Seiten außer 404 gibt es noch nicht. Die Seitentests werden erst mit A6 grün; bis dahin genügt, dass die beiden 404- und noindex-Tests grün werden.

- [ ] **Schritt 3: `src/data/kontakt.ts`**

Eine Quelle für Telefon, Mail, Zeiten und Adresse. Heute stehen sie an fünf Stellen im Markup.

```ts
export const kontakt = {
  telefon: '+49 201 30 50 80',
  telefonHref: 'tel:+49201305080',
  mail: 'kontakt@kwm1924.de',
  mailHref: 'mailto:kontakt@kwm1924.de',
  zeitenKurz: 'Mo–Fr 9–17 Uhr, Sa 11–15 Uhr',
  zeiten: ['Mo–Fr 9–17 Uhr', 'Sa 11–15 Uhr', 'sonst nach Vereinbarung'],
  firma: 'Keramische Werkstatt Margaretenhöhe GmbH',
  adresse: ['Bullmannaue 19, 45327 Essen', 'auf dem Gelände der Zeche Zollverein'],
  englischUrl: 'https://kwm-1924.de/en/news/current/',
} as const;
```

- [ ] **Schritt 4: `src/data/navigation.ts`**

```ts
export const navigation = [
  { key: 'meisterstuecke', href: '/meisterstuecke', name: 'Meisterstücke', desc: 'Unikate aus der Hand von Young-Jae Lee' },
  { key: 'manufaktur', href: '/manufaktur', name: 'Manufaktur', desc: 'Geschirr, in der Werkstatt gedreht und glasiert' },
  { key: 'young-jae-lee', href: '/young-jae-lee', name: 'Young-Jae Lee', desc: 'Keramikerin, leitet die Werkstatt seit 1987' },
  { key: 'werkstatt', href: '/werkstatt', name: 'Werkstatt', desc: 'Seit 1924, Bauhaus-Linie, Team' },
  { key: 'aktuelles', href: '/aktuelles', name: 'Aktuelles', desc: 'Ausstellungen und Termine' },
  { key: 'besuch', href: '/besuch', name: 'Besuch', desc: 'Öffnungszeiten, Anfahrt, Kontakt' },
] as const;

export type NavKey = (typeof navigation)[number]['key'];

export const fussLinks = [
  { href: '/aktuelles', name: 'Aktuelles' },
  { href: '/besuch', name: 'Besuch & Anfahrt' },
  { href: '/zahlung', name: 'Zahlung' },
  { href: '/versand', name: 'Verpackung & Transport' },
  { href: '/agb', name: 'AGB' },
  { href: '/impressum', name: 'Impressum' },
  { href: '/datenschutz', name: 'Datenschutz' },
] as const;
```

- [ ] **Schritt 5: `src/components/Header.astro`**

Markup 1:1 aus `prototyp/src/v3/partials/header.html`. Neu sind nur die absoluten Links, die Daten aus `navigation`/`kontakt` und `aria-current` per Prop. Der Prototyp setzt `aria-current` per Build-Skript, Astro lässt das Attribut bei `undefined` weg.

```astro
---
import { kontakt } from '../data/kontakt';
import { navigation, type NavKey } from '../data/navigation';

interface Props {
  current?: NavKey | undefined;
}
const { current } = Astro.props;
---

<a class="skip" href="#inhalt">Zum Inhalt springen</a>
<header class="masthead" data-masthead>
  <a class="brand" href="/" aria-label="Keramische Werkstatt Margaretenhöhe, zur Startseite">
    <svg class="logo" viewBox="0 0 236.88 128" aria-hidden="true" focusable="false">
      <line x1="2.13" y1="110.25" x2="234.76" y2="110.25" pathLength="1"></line>
      <line x1="2.13" y1="126.47" x2="234.76" y2="126.47" pathLength="1"></line>
      <path d="M40.77,110.25c0-42.89,34.77-77.66,77.66-77.66s77.66,34.77,77.66,77.66" pathLength="1"></path>
      <line x1="118.44" y1="1.53" x2="118.44" y2="110.25" pathLength="1"></line>
      <line x1="80.47" y1="1.53" x2="157.1" y2="1.53" pathLength="1"></line>
      <polyline points="72.88,110.25 80.47,42.59 118.44,101.46 157.1,42.59 164.35,110.25" pathLength="1"></polyline>
    </svg>
    <span class="brand__name">Keramische Werkstatt<br />Margaretenhöhe</span>
  </a>
  <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav" data-menu-toggle>
    <span class="menu-toggle__label">Menü</span><span class="menu-toggle__bars" aria-hidden="true"></span>
  </button>
  <nav class="nav" id="nav" aria-label="Hauptnavigation">
    <ul class="nav__list" id="nav-list">
      {
        navigation.map((item) => (
          <li>
            <a href={item.href} data-nav={item.key} aria-current={item.key === current ? 'page' : undefined}>
              <span class="nav__name">{item.name}</span>
              <span class="nav__desc">{item.desc}</span>
            </a>
          </li>
        ))
      }
    </ul>
    <div class="nav__contact">
      <a class="nav__phone" href={kontakt.telefonHref}>{kontakt.telefon}</a>
      <p class="nav__hours">{kontakt.zeitenKurz}</p>
      <a class="nav__mail" href={kontakt.mailHref}>Anfrage per E-Mail <span class="nav__mail-addr">{kontakt.mail}</span></a>
      <div class="lang lang--menu" role="group" aria-label="Sprache">
        <a href="#" aria-current="true">DE</a><span aria-hidden="true">/</span><a href={kontakt.englischUrl} lang="en">EN</a>
      </div>
    </div>
  </nav>
  <div class="lang" role="group" aria-label="Sprache">
    <a href="#" aria-current="true">DE</a><span aria-hidden="true">/</span><a href={kontakt.englischUrl} lang="en">EN</a>
  </div>
</header>
```

Achtung: Der Prototyp hat zwischen `nav__name` und `nav__desc` keinen Zeilenumbruch. Steht in der `.map()`-Ausgabe einer, gilt die Whitespace-Regel aus der Konfiguration (`compressHTML: true` behält ein Leerzeichen). Der Optik-Test in Schritt 9 zeigt, ob das stört. Falls ja, beide `<span>` in eine Zeile schreiben.

- [ ] **Schritt 6: `src/components/Footer.astro`**

Markup 1:1 aus `prototyp/src/v3/partials/footer.html` (Logo-SVG mit `data-a`/`data-b`, vier Spalten, Wortmarke, SVG-Filter `#ink`), mit diesen Ersetzungen:
- Spalte „Werkstatt“: `{kontakt.firma}<br />{kontakt.adresse[0]}<br />{kontakt.adresse[1]}`
- Spalte „Geöffnet“: `kontakt.zeiten` mit `<br />` verbunden
- Spalte „Kontakt“: `kontakt.telefonHref`/`telefon`, `kontakt.mailHref`/`mail`
- Spalte „Seiten“: `fussLinks.map((l) => <a href={l.href}>{l.name}</a>)` in `<p class="footer__links">`

Die vier `<script type="module" src="…">` am Ende des Partials gehören **nicht** in den Footer, sondern ins Layout (Schritt 7).

- [ ] **Schritt 7: `src/layouts/BaseLayout.astro`**

Phase A lädt CSS und JS bewusst unverändert aus `public/` per `<link>` und `<script is:inline>`. So bleiben Reihenfolge und Ausführungszeitpunkt exakt wie im Prototyp. Laut Astro-Doku werden `<link>`-Stylesheets in Dokumentreihenfolge ausgewertet, und `is:inline` lässt Skripte unverändert. Gebündelt wird erst in Phase C.

```astro
---
import Footer from '../components/Footer.astro';
import Header from '../components/Header.astro';
import type { NavKey } from '../data/navigation';

interface Props {
  title: string;
  description: string;
  bodyClass: string;
  nav?: NavKey;
}
const { title, description, bodyClass, nav } = Astro.props;
---

<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="icon" href="/img/kwm/logo.svg" type="image/svg+xml" />
    <link rel="preload" href="/fonts/libre-caslon-display-normal-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/jost-normal-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="/fonts/fonts.css" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="stylesheet" href="/css/pages.css" />
    <link rel="stylesheet" href="/css/expander.css" />
    <slot name="head" />
    <link rel="stylesheet" href="/css/signaturen.css" />
    <!-- Muss vor dem ersten Rendern laufen (Logo-Zeichnung einmal pro Sitzung, Grundton), daher inline -->
    <script is:inline>
      document.documentElement.classList.add('js');
      try {
        if (!sessionStorage.getItem('kwm-logo')) {
          sessionStorage.setItem('kwm-logo', '1');
          document.documentElement.classList.add('logo-draw');
        }
      } catch (e) {
        document.documentElement.classList.add('logo-draw');
      }
      try {
        const q = new URLSearchParams(location.search),
          s = JSON.parse(localStorage.getItem('kwm-entwurf') || '{}'),
          d = document.documentElement.dataset;
        d.grund = q.get('grund') || s.grund || 'galerie';
      } catch (e) {}
    </script>
  </head>
  <body class={bodyClass}>
    <Header current={nav} />
    <slot />
    <Footer />
    <script is:inline type="module" src="/main.js"></script>
    <script is:inline type="module" src="/js/signaturen.js"></script>
    <script is:inline type="module" src="/js/expander.js"></script>
    <script is:inline type="module" src="/js/entwurf.js"></script>
  </body>
</html>
```

Den HTML-Kommentar im `<head>` beim Formatieren in `{/* … */}` umwandeln, damit er nicht ausgeliefert wird. Der Inhalt des Kopf-Skripts ist der formatierte Einzeiler aus `partials/head.html` und wird in Phase B vereinfacht.

- [ ] **Schritt 8: `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Nicht gefunden · Keramische Werkstatt Margaretenhöhe" description="Diese Seite gibt es nicht." bodyClass="page-404">
  <main id="inhalt">
    <section class="page-hero page-hero--name not-found grid" aria-labelledby="page-title">
      <h1 class="page-hero__title" id="page-title">Diese Schale ist leer.</h1>
      <div class="page-hero__lede">
        <p>Die Seite gibt es nicht oder nicht mehr. Vielleicht führt einer dieser Wege weiter.</p>
        <ul class="not-found__links">
          <li><a class="link-arrow" href="/">Zur Startseite</a></li>
          <li><a class="link-arrow" href="/meisterstuecke">Meisterstücke</a></li>
          <li><a class="link-arrow" href="/manufaktur">Manufaktur</a></li>
          <li><a class="link-arrow" href="/besuch">Besuch und Anfahrt</a></li>
        </ul>
      </div>
    </section>
  </main>
</BaseLayout>
```

Die Links auf `/meisterstuecke` usw. antworten erst nach A5 mit 200. Bis dahin ist der Linkteil des 404-Tests rot; das ist erwartet.

- [ ] **Schritt 9: Optik der 404-Seite vergleichen**

```bash
npx playwright test tests/optik.spec.ts -g "404"
npx playwright test tests/routen.spec.ts -g "noindex"
```

Erwartet: beide Optik-Tests (desktop, mobil) PASS, noindex PASS. Bei Abweichung zeigt `npx playwright show-report` das Differenzbild. Typische Ursachen sind Whitespace in Header/Footer, ein vergessener absoluter Pfad oder eine falsche `<link>`-Reihenfolge.

- [ ] **Schritt 10: Commit**

```bash
npm run check && git add -A && git commit -m "Astro-Umbau: Layout, Kopf, Fuß und 404-Seite; Kontakt und Navigation als Daten"
```

### Aufgabe A4: Anfrage-Komponenten, Umwandlungsskript und Textseiten

**Dateien:**
- Anlegen: `src/components/InquiryBand.astro`, `src/components/InquiryForm.astro`, `prototyp/tools/zu-astro.mjs`, `tests/verhalten.spec.ts`
- Anlegen (vom Skript, dann von Hand geprüft): `src/pages/impressum.astro`, `agb.astro`, `versand.astro`, `zahlung.astro`, `datenschutz.astro`

**Schnittstellen:**
- Liefert: `InquiryBand` mit Props `{ text: string; stueck?: string }` und Default-Slot für den Hinweis (darf HTML enthalten), `InquiryForm` ohne Props.
- Das Umwandlungsskript wird in A5 und A6 wiederverwendet und verschwindet mit `prototyp/`.

- [ ] **Schritt 1: Fehlschlagende Tests, `tests/verhalten.spec.ts`**

```ts
import { expect, test } from '@playwright/test';
import { ziel } from './seiten';

test.skip(ziel !== 'astro', 'prüft den Astro-Build unter wrangler dev');

test('Anfrage-Leiste kodiert das Stück für die Formular-URL', async ({ page }) => {
  await page.goto('/meisterstuecke');
  await expect(page.locator('.anfrage-band .button')).toHaveAttribute(
    'href',
    '/besuch?stueck=Anfrage%20Meisterst%C3%BCcke#anfrage',
  );
});

test('Geschützter Bindestrich in „Young‑Jae“ kommt als Zeichen an, nicht als Entity', async ({ page }) => {
  await page.goto('/young-jae-lee');
  const text = (await page.locator('.anfrage-band__text').textContent()) ?? '';
  expect(text).toContain('Young‑Jae');
  expect(text).not.toContain('&#8209;');
});
```

Beide Seiten entstehen erst in A5. Die Tests bleiben bis dahin rot. In A4 werden sie gegen die Textseiten vorbereitet, und der Lauf in A5 Schritt 4 muss sie grün sehen.

- [ ] **Schritt 2: `src/components/InquiryBand.astro`**

```astro
---
import { kontakt } from '../data/kontakt';

interface Props {
  text: string;
  /** Vorbelegung für das Feld „Stück“ im Anfrageformular */
  stueck?: string;
}
const { text, stueck } = Astro.props;
const href = stueck ? `/besuch?stueck=${encodeURIComponent(stueck)}#anfrage` : '/besuch#anfrage';
const hatHinweis = Astro.slots.has('default');
---

<section class="anfrage-band on-flaeche grid" aria-label="Anfrage">
  <p class="anfrage-band__text" data-reveal="fade">{text}</p>
  <div class="anfrage-band__actions" data-reveal="fade">
    <a class="button" href={href}>Anfrage schreiben</a>
    <a class="link-arrow" href={kontakt.telefonHref}>{kontakt.telefon}</a>
  </div>
  {hatHinweis && <p class="anfrage-band__hint" data-reveal="fade"><slot /></p>}
</section>
```

Der Prototyp gibt bei leerem Hinweis (Versand, Zahlung) ein leeres `<p>` aus. Die Komponente lässt es weg. Zeigt der Optik-Test dort eine Abweichung, ist das die einzige akzeptierte Änderung von Phase A: im Bericht notieren und den Screen bewusst aktualisieren mit `npx playwright test -g "versand|zahlung" --update-snapshots`.

- [ ] **Schritt 3: `src/components/InquiryForm.astro`**

Inhalt 1:1 aus `prototyp/src/v3/partials/anfrage-form.html` (43 Zeilen). Einzige Änderungen: relative Links absolut machen und HTML-Kommentare in `{/* */}` umwandeln. Keine Props.

- [ ] **Schritt 4: Umwandlungsskript `prototyp/tools/zu-astro.mjs`**

Einmalwerkzeug für die mechanische Arbeit (Includes → Komponenten, Pfade, Kommentare). Das Ergebnis wird danach von Hand geprüft.

```js
// Einmalig: wandelt prototyp/src/v3/<seite>.html in src/pages/<seite>.astro (Rohfassung, danach von Hand prüfen).
// Aufruf: node prototyp/tools/zu-astro.mjs impressum agb …
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const quelle = (name) => readFileSync(join(root, 'prototyp/src/v3', `${name}.html`), 'utf8');

const seitenPfad = (datei) => (datei === 'index' ? '/' : `/${datei}`);
const entities = (s) => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
const attr = (s) => s.replaceAll('"', '&quot;');

const pfade = (html) =>
  html
    .replaceAll('../img/', '/img/')
    .replace(/(href=")([a-z0-9-]+)\.html([?#][^"]*)?"/g, (_, a, seite, rest = '') => `${a}${seitenPfad(seite)}${rest}"`);

const kommentare = (html) => html.replace(/<!--(?!\s*@include)([\s\S]*?)-->/g, (_, t) => `{/*${t}*/}`);

function umwandeln(name) {
  let html = quelle(name);
  const kopf = JSON.parse(html.match(/<!-- @include head (\{.*?\}) -->/)[1]);
  const nav = html.match(/<!-- @include header \{"nav": "([\w-]+)"\} -->/)?.[1];
  const komponenten = new Set();

  html = html
    .replace(/<!-- @include (head|header|footer)[^>]*-->\n?/g, '')
    .replace(/<!-- @include anfrage-form -->/g, () => (komponenten.add('InquiryForm'), '<InquiryForm />'))
    .replace(/<!-- @include anfrage-band (\{.*?\}) -->/g, (_, json) => {
      komponenten.add('InquiryBand');
      const p = JSON.parse(json);
      const stueck = p.query ? decodeURIComponent(p.query.replace('?stueck=', '')) : '';
      const hinweis = pfade((p.hinweis ?? '').replaceAll("'", '"'));
      const props = `text="${attr(entities(p.text))}"${stueck ? ` stueck="${attr(stueck)}"` : ''}`;
      return hinweis ? `<InquiryBand ${props}>${hinweis}</InquiryBand>` : `<InquiryBand ${props} />`;
    });
  html = kommentare(pfade(html)).trim();

  const importe = [`import BaseLayout from '../layouts/BaseLayout.astro';`, ...[...komponenten].map((k) => `import ${k} from '../components/${k}.astro';`)];
  const layoutProps = [
    `title="${attr(kopf.title)}"`,
    `description="${attr(kopf.description)}"`,
    `bodyClass="${kopf.bodyClass}"`,
    nav ? `nav="${nav}"` : '',
  ].filter(Boolean).join(' ');
  const extra = kopf.extra ? `  <Fragment slot="head">${pfade(kopf.extra).replaceAll('href="css/', 'href="/css/')}</Fragment>\n` : '';

  const astro = `---\n${importe.join('\n')}\n---\n\n<BaseLayout ${layoutProps}>\n${extra}${html}\n</BaseLayout>\n`;
  writeFileSync(join(root, 'src/pages', `${name}.astro`), astro);
  console.log(`geschrieben src/pages/${name}.astro`);
}

process.argv.slice(2).forEach(umwandeln);
```

- [ ] **Schritt 5: Textseiten umwandeln und von Hand prüfen**

```bash
node prototyp/tools/zu-astro.mjs impressum agb versand zahlung datenschutz
npm run format && npm run build
```

Prüfliste pro Datei:
1. Kein `../`, kein `.html"` mehr: `grep -nE '\.\./|\.html"' src/pages/*.astro` ohne Treffer.
2. Geschweifte Klammern im Fließtext würden als Ausdruck gelesen. Prüfen mit `grep -n '{' src/pages/<seite>.astro`; Treffer außerhalb von `{/* */}` als `{'{'}` maskieren.
3. Meldet der Rust-Compiler ungeschlossene Tags oder ungültige Verschachtelung (z. B. `<div>` in `<p>`), das Markup korrigieren. Laut Upgrade-Guide v7 korrigiert der Compiler das nicht mehr selbst.
4. `datenschutz.astro` behält das `<meta name="robots" content="noindex">` im Slot `head`.

- [ ] **Schritt 6: Optik prüfen**

```bash
npx playwright test tests/optik.spec.ts -g "impressum|agb|versand|zahlung|datenschutz"
```

Erwartet: 10 Tests PASS (bis auf die in Schritt 2 erlaubte Abweichung bei Versand/Zahlung).

- [ ] **Schritt 7: Commit**

```bash
npm run check && git add -A && git commit -m "Astro-Umbau: Anfrage-Leiste und Anfrageformular als Komponenten, Rechts- und Serviceseiten"
```

### Aufgabe A5: Unterseiten

**Dateien:** Anlegen (Skript, dann Handprüfung): `src/pages/meisterstuecke.astro`, `manufaktur.astro`, `young-jae-lee.astro`, `werkstatt.astro`, `aktuelles.astro`, `besuch.astro`. Ändern: `tests/verhalten.spec.ts`

- [ ] **Schritt 1: Fehlschlagenden Test zur Formular-Vorbelegung ergänzen** (Prüffokus 5)

```ts
test('Anfrageformular übernimmt ?stueck= und springt zum Formular', async ({ page }) => {
  await page.goto('/besuch?stueck=Teeschale%20%C3%A0%20la%20Lee#anfrage');
  await expect(page.locator('#anfrage-stueck')).toHaveValue('Teeschale à la Lee');
  await expect(page.locator('#anfrage')).toBeInViewport();
});
```

- [ ] **Schritt 2: Umwandeln**

```bash
node prototyp/tools/zu-astro.mjs meisterstuecke manufaktur young-jae-lee werkstatt aktuelles besuch
npm run format
```

- [ ] **Schritt 3: Handprüfung wie in A4 Schritt 5, dazu:**
1. **Manufaktur:** Das Inline-Skript der Glasurbühne als `<script is:inline>` kennzeichnen, damit es wie im Prototyp sofort läuft. In Phase D wird es eine Komponente. Die `data-img`-Werte zeigen nach der Umwandlung auf `/img/…`.
2. **Hinweise mit HTML** in `InquiryBand` (Manufaktur: PDF-Links, Young-Jae Lee, Werkstatt) als Kind-Markup prüfen.
3. **`style="--c:…"`-Attribute** bleiben unverändert, sie sind gültiges Astro.

- [ ] **Schritt 4: Tests**

```bash
npx playwright test tests/optik.spec.ts -g "meisterstuecke|manufaktur|young-jae-lee|werkstatt|aktuelles|besuch"
npx playwright test tests/verhalten.spec.ts
```

Erwartet: 12 Optik-Tests PASS, 3 Verhaltenstests PASS.

- [ ] **Schritt 5: Commit**

```bash
npm run check && git add -A && git commit -m "Astro-Umbau: Unterseiten Meisterstücke, Manufaktur, Young-Jae Lee, Werkstatt, Aktuelles, Besuch"
```

### Aufgabe A6: Startseite

**Dateien:** Anlegen: `src/pages/index.astro`. Ändern: `tests/verhalten.spec.ts`

- [ ] **Schritt 1: Fehlschlagende Tests ergänzen** (Prüffokus 2 und 4)

```ts
test('Leerzeichen zwischen Inline-Links bleiben erhalten', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero__actions')).toHaveText(/Meisterstücke ansehen\s+Manufakturprogramm/);
});

test('Hinweiszeile erscheint nur in ihrem Zeitraum (Entscheidung im Browser, nicht beim Bauen)', async ({ browser }) => {
  const erkunden = await browser.newPage();
  await erkunden.goto('/');
  const notiz = erkunden.locator('.aktuell__note').first();
  const { start, ende } = await notiz.evaluate((el: HTMLElement) => ({ start: el.dataset.start ?? '', ende: el.dataset.end ?? '' }));
  await erkunden.close();

  const imZeitraum = await browser.newPage();
  await imZeitraum.clock.setFixedTime(new Date(`${start}T12:00:00`));
  await imZeitraum.goto('/');
  await expect(imZeitraum.locator('.aktuell__note').first()).toBeVisible();

  const danach = await browser.newPage();
  const tagDanach = new Date(`${ende}T12:00:00`);
  tagDanach.setDate(tagDanach.getDate() + 1);
  await danach.clock.setFixedTime(tagDanach);
  await danach.goto('/');
  await expect(danach.locator('.aktuell__note').first()).toBeHidden();
});
```

- [ ] **Schritt 2: Umwandeln und prüfen**

```bash
node prototyp/tools/zu-astro.mjs index && npm run format && npm run build
```

Handprüfung wie in A4 Schritt 5. Dazu: Alle `data-variant`-Abschnitte (auch die mit `hidden`) bleiben in Phase A erhalten, weil das Entwurf-Panel erst in Phase B entfällt.

- [ ] **Schritt 3: Tests**

```bash
npx playwright test tests/optik.spec.ts -g "start"
npx playwright test tests/verhalten.spec.ts
```

Erwartet: alles PASS.

- [ ] **Schritt 4: Commit**

```bash
npm run check && git add -A && git commit -m "Astro-Umbau: Startseite"
```

### Aufgabe A7: Linkprüfung und Weiterleitungen alter Prototyp-Links

**Dateien:** Anlegen: `public/_redirects`. Ändern: `tests/routen.spec.ts`

- [ ] **Schritt 1: Fehlschlagende Tests ergänzen** (Prüffokus 1)

```ts
test('Alle internen Links, Bilder, Skripte und Stylesheets antworten mit 200', async ({ page, request }) => {
  const geprueft = new Set<string>();
  for (const seite of seiten) {
    await page.goto(seite.astro);
    const ziele = await page
      .locator('a[href], img[src], link[href], script[src], [data-img]')
      .evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? e.getAttribute('src') ?? e.getAttribute('data-img') ?? ''));
    for (const ziel of ziele) {
      const url = new URL(ziel, page.url());
      if (url.origin !== new URL(page.url()).origin || geprueft.has(url.pathname)) continue;
      geprueft.add(url.pathname);
      expect((await request.get(url.pathname)).status(), `${seite.astro} → ${url.pathname}`).toBe(200);
    }
  }
});

test('Geteilte Prototyp-Links unter /v3/ führen auf die neue Seite, mit Parametern', async ({ page }) => {
  await page.goto('/v3/aktuelles.html?praesentation');
  expect(new URL(page.url()).pathname).toBe('/aktuelles');
  expect(new URL(page.url()).search).toBe('?praesentation');
  await page.goto('/v3/index.html');
  expect(new URL(page.url()).pathname).toBe('/');
});
```

- [ ] **Schritt 2: Laufen lassen.** Erwartet: Linkprüfung PASS (sonst fehlende Datei aus `prototyp/site` nachziehen), `/v3/`-Test FAIL.

- [ ] **Schritt 3: `public/_redirects`**

Format laut Cloudflare-Doku „Static Assets → Redirects“: Quelle, Ziel, Status. Platzhalter `:name` greifen bis zum nächsten `/`. 302, weil es Prototyp-Links sind und keine dauerhaften Adressen.

```
# Prototyp-Links (V3 lag unter /v3/, V2 unter /v2/). Ziel /<seite>.html leitet Cloudflare selbst auf /<seite> weiter.
/v3 / 302
/v3/ / 302
/v3/:seite /:seite 302
/v2/* / 302
```

- [ ] **Schritt 4: Tests erneut.** Erwartet: PASS. Gehen die Query-Parameter verloren (in der Doku nicht ausdrücklich beschrieben), den Befund im Bericht festhalten und den Test auf den Pfad beschränken. `?praesentation` ist nach Phase B ohnehin überflüssig.

- [ ] **Schritt 5: Commit**

```bash
npm run check && git add -A && git commit -m "Astro-Umbau: Linkprüfung und Weiterleitung alter /v3/-Links"
```

### Aufgabe A8: Cloudflare Workers Builds, Vorschau, Abnahme und PR

**Dateien:** Ändern: `README.md`. Anlegen: `konzept/ASTRO-BERICHT.md`

- [ ] **Schritt 1: Build-Einstellungen prüfen** (Skills `wrangler` und `workers-best-practices`, Doku „Workers Builds → Configuration“ und „Build branches“). Ist-Zustand per `cloudflare-builds`-MCP (`workers_builds_get_build` des letzten Builds) und im Dashboard unter *kwm-redesign → Settings → Build* ablesen. Soll:

| Einstellung | Wert |
|---|---|
| Build command | `npm run build` (funktioniert auch auf dem heutigen `main`, dort baut es den Prototyp) |
| Deploy command | `npx wrangler deploy` |
| Preview command | `npx wrangler preview` |
| Preview Builds | aktiviert |
| Root directory | `/` |
| Build watch paths | einschließen: `src/**`, `public/**`, `astro.config.mjs`, `package.json`, `package-lock.json`, `wrangler.jsonc`, `tsconfig.json`, `.nvmrc`; ausschließen: `konzept/**`, `.shots/**` (sonst baut jeder Lager- oder Doku-Commit die Website neu) |

Ändern per Builds-API (Felder `build_command`, `deploy_command`, laut „Workers Builds → API reference“) oder im Dashboard. **Blocker-Prüfung:** Wurde der Worker vor Einführung der Worker Previews mit Builds verbunden, verlangt Cloudflare eine einmalige, **nicht umkehrbare** Umstellung („The switch cannot be reversed“). Diese nur nach Zustimmung des Admins auslösen. Bis dahin entsteht pro Branch weiter eine Version-URL.

- [ ] **Schritt 2: Push und Vorschau**

```bash
git push -u origin astro-umbau
```

Vorschau-URL aus dem Dashboard (*Previews*) oder dem PR-Kommentar nehmen und die Tests mit `BASIS_URL` (aus A1) gegen die Vorschau laufen lassen. Ein lokaler Server startet dann nicht.

```bash
BASIS_URL=https://<preview>-kwm-redesign.<subdomain>.workers.dev npx playwright test tests/routen.spec.ts tests/verhalten.spec.ts
```

- [ ] **Schritt 3: Abnahme nach `konzept/AUFTRAG-ASTRO.md` Phase 1 Punkt 4**
1. `npm run test:optik` lokal: alle 26 PASS.
2. Keine Konsolenfehler (Teil der Optik-Tests).
3. Lighthouse vorher (Prototyp) und nachher (Vorschau) mit dem Skill `web-perf`, mobil, je Startseite und Manufaktur. Nachher darf nicht schlechter sein.
4. Screens zur Sichtprüfung: `node .shots/shoot.mjs <vorschau-url> astro-a` → `.shots/astro/`. Ansehen und gegen die Optik-Checkliste aus `CLAUDE.md` prüfen.
5. **Fehler-Audit für Phase B:** alle 13 Seiten prüfen mit
   - Barrierefreiheit: `@axe-core/playwright` (als Test `tests/barrierefreiheit.spec.ts`, Regeln WCAG 2.2 AA). Verstöße kommen in die Fehlerliste, der Test bleibt bis Phase B als `test.fixme` markiert.
   - Lighthouse: alle vier Kategorien (Skill `web-perf`).
   - Optik-Checkliste aus `CLAUDE.md`: Tippflächen ≥ 44 px, kein horizontales Scrollen bei 390 px, Kontrast, abgeschnittene Texte.
   - Sichtprüfung mit den Skills `impeccable` (Modus Audit/Critique) und `design:accessibility-review`.
   Ergebnis: priorisierte Fehlerliste im Bericht.

- [ ] **Schritt 4: README und Bericht.** `README.md` neu: Start (`npm install`, `npm run dev`), Prüfen (`npm run check`, `npm run test:ausgangsstand` + `npm test`), Deploy (Workers Builds, Vorschau pro Branch), Ordnerstruktur. `konzept/ASTRO-BERICHT.md`: erledigt, offen, Screens, Lighthouse-Werte, akzeptierte Abweichungen, was der Admin tun muss.

- [ ] **Schritt 5: Review und PR.** Skill `code-review` gegen `design-v3`. Dann PR nach `main` mit Skill `pr`: Titel „Website auf Astro umgestellt (1:1, ohne sichtbare Änderung)“, Vorschau-URL und Bericht verlinken.

- [ ] **Schritt 6: Prototyp entfernen** (erst nach Abnahme durch den Admin, letzter Commit im PR)

```bash
git tag prototyp-v3 HEAD && git push origin prototyp-v3
git rm -r prototyp && npm uninstall playwright   # @playwright/test bleibt
```

`tests/seiten.ts` behält die Spalte `prototyp` nicht mehr. Neuer Ausgangsstand für Folgephasen ist der jeweilige `main`-Build: `git worktree add ../KWM-basis main`, dort `npm ci && npm run test:optik -- --update-snapshots`, die Screens nach `tests/__screens__/` kopieren. Das Skript `test:ausgangsstand` entsprechend auf „main bauen und Screens erzeugen“ umstellen. Commit „Astro-Umbau: Prototyp entfernt (Stand im Tag prototyp-v3)“.

- [ ] **Schritt 7: Nach dem Merge.** Produktions-Build auf `main` per `cloudflare-builds`-MCP beobachten (`workers_builds_list_builds`, dann `workers_builds_get_build_logs`). Danach Routen- und Verhaltenstests gegen die Produktions-URL laufen lassen.

---

## 8. Phase B: Varianten festlegen und Fehler beheben (zwei PRs)

Voraussetzung: E5, vom Admin am 04.10.2026 per Screenshot des Entwurf-Panels bestätigt. Ausgangsstand: Screens von `main` mit `?praesentation`, denn diese Ansicht entspricht genau der Auswahl.

Final ist die **neue Startseite** (`index.html`, nicht `start-vorher.html`) mit dieser Auswahl:

| Gruppe (`entwurf.js`) | Final | Entfällt |
|---|---|---|
| Grundton | Galerie | Porzellan, Creme |
| Einzelwerk Meisterstücke | Spindelvase | Teeschale |
| Einstieg | Foto | Wort und Bild (`sig-komposition`) |
| Lebensweg | Beim Scrollen | Zeichnet sich einmal |
| Feuer (Text) | Text haftet | Text wandert |
| Farbskala | Testkachel | Fläche |
| Meditation und 99 Schalen | Getrennt | Zusammen |
| Nach der Werkschau | **Orte** (fester Abschnitt auf der neuen Startseite) | – |

**Hinweis zum Panel:** Im Screenshot des Admins ist bei „Nach der Werkschau“ die Option „Drehen“ markiert. Auf der neuen Startseite hat dieser Schalter aber keine Wirkung. Die Gruppe erscheint dort nur wegen eines Fehlers im Panel: `[data-variant*="werk:"]` trifft auch `einzelwerk:`. Varianten mit `werk:` gibt es nur auf `start-vorher.html`, die neue Startseite zeigt die Orte immer. Final ist also, was der Admin gesehen hat: Orte. Die Gruppen Ausstellung (Kosmos/Bühne), Feuer (Zwei Farben/Liste) und Schale im Einstieg kommen ebenfalls nur auf `start-vorher.html` vor und entfallen mit ihr. Wird die Szene „Drehen“ später doch gewünscht, ist das eine eigene Designaufgabe.

Aufgaben:
1. **B1 Markup:** Pro Seite alle Elemente mit `data-variant`, die nicht der finalen Wahl entsprechen, löschen. Bei den übrigen das Attribut `data-variant` und ein eventuelles `hidden` entfernen. Prüfen mit `grep -rn "data-variant" src` → keine Treffer.
2. **B2 Skripte und CSS:** `public/js/entwurf.js` und `public/css/entwurf.css` löschen, den `<script>` im Layout entfernen. Alle Signatur-Module löschen, die nach B1 kein `[data-sig]` mehr im Markup haben, samt Eintrag in `signaturen.js`. Prüfen mit `grep -rho 'data-sig="[a-z]*"' src | sort -u`. Voraussichtlich betrifft das `sig-komposition`, `sig-drehen` und `sig-profil`; ob `sig-buehne` und der Kosmos-Code in `main.js` noch genutzt werden, entscheidet derselbe Grep. CSS-Regeln für `[data-grund="porzellan"|"creme"]`, `[data-lebensweg="zeichnen"]` usw. entfernen.
3. **B3 Kopf-Skript:** Den Grundton statisch setzen (`<html lang="de" data-grund="galerie">`). Das Inline-Skript behält nur `js`-Klasse und Logo-Zeichnung.
4. **B4 Prüfung:** Optik-Tests gegen den `main`-Ausgangsstand (`?praesentation`), alle PASS. `grep -rn "kwm-entwurf\|praesentation" src public` ohne Treffer. Konsolenfehler: keine. Danach Code-Review und PR „Varianten festgelegt, Entwurf-Panel entfernt“.
5. **B5 Fehlerbehebung (zweiter PR):** Die Fehlerliste aus Phase A in Prioritätsreihenfolge abarbeiten. Jede Korrektur ist eine bewusste, sichtbare Änderung: Screens vorher und nachher unter `.shots/astro-fehler/`, danach die betroffenen Optik-Screens gezielt aktualisieren. Der Barrierefreiheits-Test (`test.fixme` entfernen) muss am Ende grün sein. Gestalterische Fragen, die die Liste aufwirft (z. B. Kontrast eines Tons ändern), vorher dem Admin vorlegen.

---

## 9. Phase C: Asset-Pipeline (je Punkt ein PR, Reihenfolge fest)

**C1 CSS bündeln.** `public/styles.css`, `public/css/*.css` und `public/fonts/fonts.css` nach `src/styles/` verschieben. Globale Dateien im Layout per `import '../styles/…'` in der heutigen Reihenfolge einbinden, die Seiten-CSS per Import in der Seite. Achtung Kaskade: Laut Astro-Doku gilt die Reihenfolge Link-Tags < importierte Styles < scoped Styles, bei gleicher Spezifität gewinnt der letzte Import. Weil `signaturen.css` heute *nach* dem Seiten-CSS kommt, wird sie in jeder Seite nach dem Seiten-CSS importiert oder per `@layer` geordnet. Das `@import url("sig-*.css")` in `signaturen.css` bündelt Vite selbst. In `public/_headers` ergänzen:

```
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

Prüfung: Optik PASS, keine `.css` mehr in `public/` außer Fonts bis C4.

**C2 Skripte als TypeScript strict.** `public/main.js` und `public/js/*.js` nach `src/scripts/*.ts`. Reihenfolge: `keramik.ts` (gemeinsame Typen: `Glasur`, `Rng`), `expander.ts`, `signaturen.ts`, `main.ts`, dann je ein `sig-*.ts` pro Commit. Im Layout ein verarbeitetes Skript statt der `is:inline`-Tags:

```astro
<script>
  import '../scripts/main';
  import '../scripts/signaturen';
  import '../scripts/expander';
</script>
```

Die dynamischen `import('./sig-*.js')` in `signaturen.ts` teilt Vite in eigene Dateien, geladen wird also weiterhin nur, was sichtbar wird. Ausnahme: Das Kopf-Skript bleibt `is:inline`, weil es vor dem ersten Rendern laufen muss. Prüfung: `astro check` ohne Fehler (strictest), Optik PASS, keine Konsolenfehler, `public/` enthält kein JS mehr.

**C3 Bilder über `astro:assets`.** Bilder nach `src/assets/img/` verschieben und `<img>` durch `<Image>`/`<Picture>` aus `astro:assets` mit `layout="constrained"` ersetzen (Doku: erzeugt `srcset`/`sizes` und setzt Breite und Höhe gegen Layoutverschiebung). In der Konfiguration `image: { responsiveStyles: true }` setzen. Die Hand-Varianten `-800`/`-1400` entfallen. Für `data-img` (Glasurbühne) die URL per `getImage()` im Frontmatter erzeugen. Das LCP-Bild (Kummerschalen) behält `fetchpriority="high"` und `loading="eager"`. Die Bildverarbeitung läuft beim Bauen mit Sharp; meldet der Build, dass Sharp fehlt, `npm install sharp`. Prüfung: Optik mit etwas höherer Toleranz (Neuberechnung der Bilder), Lighthouse LCP besser oder gleich, Linkprüfung PASS. `public/img/` enthält danach nur noch, was nicht über Komponenten läuft (Favicon).

**C4 Schriften über die Fonts API** (stabil seit Astro 6). Schriftdateien nach `src/assets/fonts/` verschieben. Laut Doku nicht in `public/`, sonst liegen sie doppelt im Build. In `astro.config.mjs` `fonts: [...]` mit `fontProviders.local()` für Jost, Libre Caslon Display und Libre Caslon Text (normal und italic, Subsets latin/latin-ext), `cssVariable` passend zu den bestehenden Tokens. Im Layout `<Font cssVariable="…" preload={[{ subset: 'latin' }]} />` für die beiden heute vorgeladenen Schnitte. `fonts.css` entfällt. Astro erzeugt angepasste Ersatzschriften, das verringert Layoutverschiebung beim Laden. Prüfung: Optik PASS, keine Font-Requests auf `/fonts/`.

---

## 10. Phase D: Komponenten-Bibliothek (mehrere kleine PRs)

Grundlage ist `DESIGN.md` §11 mit Namen, Zweck, Textstilen und Varianten pro Komponente. Regeln aus §11 „Regeln für den Umbau“:
- Jede Komponente in `src/components/<Name>.astro` mit typisierten `Props`. Gemeinsame Varianten als Prop `variant?: 'hell' | 'flaeche' | 'anker'`, umgesetzt mit `class:list`.
- Die Komponente trägt ihre Textstile und ihr CSS als scoped `<style>`. Seiten setzen keine Schriftgrößen. `css/page-*.css` schrumpft auf die reine Anordnung im Raster und verschwindet, wo möglich.
- Verhalten pro Instanz als Custom Element in der Komponente (Muster aus der Astro-Doku: `class X extends HTMLElement { connectedCallback() {…} }`). Kandidaten: `Expander`, Menü im `Header`, Glasurbühne, `PlaceGrid`.
- Inhalte, die später aus Sanity kommen (Ausstellungen, Hinweise, Orte, Werke, Glasuren, Manufakturteile, Chronik, Lebensweg, Texte), als typisierte Arrays in `src/data/*.ts`, **in der Form von `konzept/SANITY-MODELL-WEBSITE.md`**. Phase 2 tauscht dann nur die Quelle aus. Die Datumslogik (Status „Läuft“/„Ab …“/„Nur noch bis …“) bleibt im Browser, als Funktion `statusText(start, ende, heute)` in `src/scripts/` mit Unit-Test (Vitest laut Astro-Doku „Testing“, dafür erst hier einführen).

Schnitt der PRs (je mit Optik-Tests aller betroffenen Seiten):
1. **D1 Gerüst:** `SubNav`, `PageHero` (4 Typen), `SectionHead` (vereint `.sec-head` und `.chapter__head`), `ChapterHead`, `Statement`, `Lede`, `Prose`
2. **D2 Einträge:** `ExhibitionCard`, `WorkCard`, `WareCard`, `FactsList`, `DateList`, `PubList`, `PersonCard`, `Steps` + Daten `ausstellungen.ts`, `werke.ts`, `manufaktur.ts`, `team.ts`
3. **D3 Aufklappen und Archive:** `Expander`, `YearArchive`, `Timeline`, `Chronicle`, `PlaceGrid` + Daten `chronik.ts`, `lebensweg.ts`, `orte.ts`
4. **D4 Formular und Kleinteile:** `Notice`, `LinkArrow`, `Button`, `InfoBlock`, `Hours`
5. **D5 Bild und Signatur:** `Figure`, `Plinth`, je Signatur eine Hülle (`Signature`-Komponenten, die `data-sig` und Ersatzinhalt ohne JS setzen)

Nach D muss jede Seite nur noch aus Komponenten bestehen. Prüfen: `grep -c 'class="' src/pages/*.astro` sinkt deutlich, und neue Seiten brauchen kein eigenes CSS.

---

## 11. Phase E: Technisches SEO und Härtung (eigener PR)

Skills `seo-aeo-best-practices` und `web-perf`, Astro-Doku `@astrojs/sitemap` und `security.csp`, Cloudflare-Doku „Static Assets → Headers“.
1. `npx astro add sitemap`, mit `filter`, das `/404` ausschließt. `<link rel="sitemap" href="/sitemap-index.xml">` im Layout. `robots.txt` bekommt die Sitemap-Zeile erst beim Go-live.
2. Im `BaseLayout`: `<link rel="canonical">` aus `Astro.site` + Pfad, Open Graph (`og:title`, `og:description`, `og:image` über `getImage`), `lang`/`hreflang` vorbereiten für den späteren EN-Bereich.
3. JSON-LD `LocalBusiness`/`Organization` aus `kontakt.ts`.
4. Sicherheits-Header in `public/_headers` für `/*`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `X-Frame-Options: DENY`.
5. CSP über `security.csp` in `astro.config.mjs` (seit Astro 6). Astro schreibt sie als `<meta>` mit Hashes der verarbeiteten Skripte und Styles. Zu prüfen sind drei Punkte: das `is:inline`-Kopf-Skript per `scriptDirective.hashes`, verbleibende `style="--c:…"`-Attribute per `styleDirective.resources` mit `kind: "attribute"` (seit Astro 7.1) oder besser in Phase D in Klassen überführen, und GTM/Consent aus Phase 4. Testen nur mit `build` + `wrangler dev`, denn laut Doku funktioniert CSP nicht im Dev-Server.

---

## 12. Folgephasen (eigene Pläne, hier nur die Weichen aus der Doku)

- **Phase 2 Sanity:** Daten beim Bauen holen. Laut Sanity-Doku „Static and server rendering in Astro“ geht das statisch. Umsetzung als Astro-Content-Loader (Content Layer, `src/content.config.ts`), der die Daten aus D in derselben Form liefert. Der Lese-Token liegt als **Build-Secret** in Workers Builds (*Settings → Build → Build variables and secrets*; laut Doku nur beim Bauen sichtbar, nicht zur Laufzeit). GROQ-Projektionen geben nur freigegebene Felder aus. Webhook „Veröffentlicht“ ruft den **Deploy Hook** per `POST` auf (seit 01.04.2026; Duplikate werden zusammengefasst, Grenze 10 Builds pro Minute pro Worker). Visual Editing braucht laut Sanity-Doku ein serverseitig gerendertes Frontend und kommt deshalb, wie im Auftrag vorgesehen, nur in einer getrennten Vorschau-Instanz. Ein täglicher Neubau (kleiner Worker mit Cron Trigger, der den Hook aufruft) ist nur nötig, wenn Datumslogik in den Build wandert. In diesem Plan bleibt sie im Browser.
- **Phase 3 Anfrageformular:** eigener Worker oder `run_worker_first` nur für `/api/anfrage`, Turnstile (Skill `turnstile-spin`), Mailversand laut Cloudflare-Doku, Skill `security-review`. `_headers` gilt dort nicht, die Antwort-Header setzt der Worker selbst.
- **Phase 4 Einwilligung + GTM** und **Phase 5 Go-live** wie in `konzept/AUFTRAG-ASTRO.md`. Beim Go-live `noindex` entfernen, `robots.txt` öffnen, `konzept/redirects-vorschlag.txt` nach `public/_redirects` übernehmen (Grenzen laut Doku: 2.000 statische, 100 dynamische Regeln).

---

## 13. Was der Admin tun oder entscheiden muss

| Wann | Was |
|---|---|
| erledigt 04.10.2026 | E1–E5 bestätigt |
| Aufgabe A8 | Falls Cloudflare danach fragt: der einmaligen, nicht umkehrbaren Umstellung auf Worker Previews zustimmen |
| Aufgabe A8 | Vorschau ansehen und Phase A abnehmen, erst danach wird `prototyp/` gelöscht |
| optional | E6: Vorschau-URLs mit Cloudflare Access schützen |

## 13a. Ausführung: wer macht was

Festlegung des Admins (04.10.2026): Planung und Feinplanung jeder Phase (B–E und die Folgepläne) macht **immer Opus**. Mechanisches Umsetzen darf Sonnet übernehmen. Geprüft wird gebündelt am Ende, nicht nach jeder Aufgabe.

| Aufgabe | Wer | Warum |
|---|---|---|
| A0–A3 (Worktree, Ausgangsstand, Gerüst, Layout) | Hauptsession auf Opus | Fundament, auf dem alles aufbaut; Stabilität der Screens und die CSS-Reihenfolge brauchen Urteil |
| A4–A7 (Komponenten, Seiten, Links) | Subagent auf Sonnet, je Aufgabe ein frischer | Mechanisches Portieren nach festem Muster |
| Prüfung pro Aufgabe | automatisch, kein Review | Eine Aufgabe gilt erst als fertig, wenn ihre Optik- und Verhaltenstests und `npm run check` grün sind. Der Subagent meldet die Testausgabe mit. |
| Ein Stichproben-Blick nach A4 | Hauptsession, kurz | Die erste Sonnet-Aufgabe legt das Muster für die übrigen 7 Seiten fest. Ein Fehler im Muster wäre sonst siebenfach zu korrigieren. Nur Diff ansehen, kein volles Review. |
| A8 (Cloudflare, Fehler-Audit, Abnahme, PR) | Hauptsession auf Opus | Eingriffe ins Konto, Blocker-Abwägung, Bericht |
| Gebündelte Endprüfung | Opus mit Skill `code-review` über den ganzen Branch | Pflicht vor dem Merge (CLAUDE.md) |

Die Qualität sichern vor allem die Prüfungen: pixelgleiche Screens gegen den Prototyp, `npm run check` (Format, Lint, `astro check`, Build), Barrierefreiheits- und Lighthouse-Audit und die Endprüfung. Kein Subagent darf eine Aufgabe als fertig melden, solange ein Test rot ist.

---

## 14. Quellen (geprüft am 04.10.2026)

Astro (über `astro-docs`-MCP):
- Upgrade-Übersicht, aktuelle Version 7.3.5: https://docs.astro.build/en/upgrade-astro/
- Upgrade auf v7 (Rust-Compiler, `compressHTML: 'jsx'`, Vite 8): https://docs.astro.build/en/guides/upgrade-to/v7/
- Deploy auf Cloudflare (statisch, kein Adapter, `wrangler.jsonc` mit `./dist`): https://docs.astro.build/en/guides/deploy/cloudflare/
- Framework-Komponenten und Inseln: https://docs.astro.build/en/guides/framework-components/ · https://docs.astro.build/en/concepts/islands/
- Skripte, `is:inline`, Custom Elements: https://docs.astro.build/en/guides/client-side-scripts/
- Konfiguration `build.format`, `trailingSlash`, `inlineStylesheets`: https://docs.astro.build/en/reference/configuration-reference/
- CSS-Kaskade und Bündelung: https://docs.astro.build/en/guides/styling/
- Bilder, `layout`, `responsiveStyles`: https://docs.astro.build/en/guides/images/
- Fonts API, lokaler Anbieter: https://docs.astro.build/en/guides/fonts/ · https://docs.astro.build/en/reference/font-provider-reference/
- CSP: https://docs.astro.build/en/reference/configuration-reference/#securitycsp
- TypeScript und `astro check`: https://docs.astro.build/en/guides/typescript/
- Editor-Werkzeuge (Prettier, ESLint): https://docs.astro.build/en/editor-setup/
- Sitemap: https://docs.astro.build/en/guides/integrations-guide/sitemap/
- Content Loader API: https://docs.astro.build/en/reference/content-loader-reference/

Cloudflare (über `cloudflare-docs`- und `cloudflare-builds`-MCP):
- Astro auf Workers: https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/
- Static Site Generation, `html_handling`, `404-page`: https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/
- `_headers`: https://developers.cloudflare.com/workers/static-assets/headers/
- `_redirects`: https://developers.cloudflare.com/workers/static-assets/redirects/
- Workers Builds Konfiguration und Preview command: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- Build branches und einmalige Umstellung: https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/
- Build-Image, Node 24.18.0 Standard: https://developers.cloudflare.com/workers/ci-cd/builds/build-image/
- Worker Previews: https://developers.cloudflare.com/workers/previews/ · https://developers.cloudflare.com/workers/previews/custom-domains/
- Deploy Hooks: https://developers.cloudflare.com/changelog/post/2026-04-01-deploy-hooks/
- Ist-Zustand: Worker `kwm-redesign` besteht, Workers Builds ist mit `main` verbunden (letzter Build 02.10.2026 erfolgreich).

Sanity (über `sanity`-MCP): „Static and server rendering in Astro“, „Visual Editing with Astro“ (https://www.sanity.io/docs/astro/static-and-server-rendering).
