# KWM – Redesign kwm-1924.de

Entwurf der neuen Website der Keramischen Werkstatt Margaretenhöhe. Konzept: [Designvorschlag-v2.md](Designvorschlag-v2.md).

```bash
npm install        # Playwright für Screenshots
npm run dev        # baut src/ → site/ und startet http://localhost:4391
npm run watch      # baut bei Änderungen in src/ neu
```

- `src/` – Seitenvorlagen, `src/partials/` gemeinsamer Head/Header/Footer
- `site/` – ausgelieferte Website (CSS, JS, Bilder, gebaute HTML-Seiten)
- `.shots/` – Playwright-Skripte für visuelle Prüfung
