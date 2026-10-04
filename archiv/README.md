# Archiv

Abgeschlossene Stände, die nicht mehr zur Website gehören. Nichts hier wird gebaut oder ausgeliefert; Format-, Lint- und Typprüfung ignorieren den Ordner.

| Ordner | Inhalt |
|---|---|
| `prototyp/` | HTML-Prototyp der Website, Stand vor dem Astro-Umbau (Oktober 2026): V1 (`src/*.html`), V2 (`src/v2/`), V3 (`src/v3/`, Vorlage für die Astro-Seiten). `src/` sind die Vorlagen, `site/` die gebaute Fassung, `tools/build.mjs` setzt die Partials zusammen. |
| `entwurf/` | Frühe Entwurfs-Dokumente (Designvorschläge, Mockup- und Bild-Prompts, Startseitenstudie). Gültig ist heute `DESIGN.md` im Hauptordner. |

Den Prototyp ansehen:

```bash
npm run prototyp   # baut archiv/prototyp/site und startet http://localhost:4392/v3/index.html
```

Die Optik-Tests nutzen ihn als Ausgangsstand (`npm run test:ausgangsstand`), solange Phase A des Astro-Umbaus nicht abgenommen ist.
