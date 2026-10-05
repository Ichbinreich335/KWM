# Task 2.3: Website liest aus Sanity

Branch phase-2-website (gepusht). Commits: 2c7f078 Merge phase-2-sanity; Schema archivEintrag und Import; Sanity-Zugang; Ladefunktionen; Seiten und README.

## Abfragen (src/sanity/queries.ts, alle mit _id/_type, Projektion ohne ...)
SEITEN_QUERY, HINWEISE_QUERY, AUSSTELLUNGEN_QUERY (Ort, Galerie, Hauptbild, weitere Bilder aufgelöst), ORTE_QUERY, ARCHIV_QUERY. Keine eigene Galerien-Abfrage: Galerienamen kommen über die Referenz in Ausstellung und Archiv-Eintrag.

## Bildweg
Build lädt cdn.sanity.io (image.remotePatterns, nur /images/135lyh9t/production/**) und verarbeitet mit astro:assets; im HTML kein cdn.sanity.io. Die CDN kodiert jede Ausgabe neu (ohne Parameter JPEG), deshalb wird das Original als PNG angefordert (?fm=png) und Astro kodiert einmal nach WebP: Desktop-Start pixelgleich. Crop wird über @sanity/image-url (rect) angewandt; Hotspot wirkt nur beim Zuschneiden per URL und ist nicht verwertet (die Seite schneidet per CSS zu). widths/sizes stehen immer fest in der Bildangabe, weil Astro bei entfernten Bildern sonst über das Original hinaus hochrechnet.

## Tests
Playwright komplett 108 grün (BASIS_URL 8789, inkl. axe), npm run check grün (50 Unit-Tests). Optik gegen Ausgangsstand: 23 von 26 pixelgleich; 3 bewusst erneuert (Aktuelles Desktop und Mobil, Start Mobil). Build ohne Token (published, leer) bricht mit Meldung ab, ebenso drafts ohne Token.
