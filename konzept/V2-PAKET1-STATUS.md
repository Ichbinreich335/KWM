# V2 Paket 1: Stand

Alle Änderungen in `src/v2/`, `site/v2/` (styles.css, main.js, css/pages.css, css/page-*.css) und neuen Bildvarianten in `site/img/kwm/`. Gebaut mit `node tools/build.mjs`. Nicht committet.

## Erledigt
1. Unterlängen: `.w` mit padding/margin 0.12em oben, 0.25em unten, Startversatz 140 %. Geprüft an „Young-Jae Lee“, „Manufaktur-programm“ (Screenshots).
2. Tippflächen 44 px mobil: `.link-arrow` (Padding plus negativer Rand), `.tap`, Marke, Menü-Button, DE/EN, Unternavigation, Footer, Kontaktlinks. Mobile-Messung nach Umbau: Startseite und 404 je 0 Ziele unter 44 px; auf den übrigen Seiten blieben nur schmale Breiten (Unternavigation „Texte“/„Team“/„Vasen“ 29–41 px breit, Höhe 44) und der inline Link jahnundjahn.com. Beides danach nachgebessert (Padding-Inline, `.tap`), nicht erneut gemessen. Vorher mobil: 11–30 Ziele pro Seite.
3. Mobiles Menü: Beschreibungen, Kontaktblock (nur mobil), Schließen-Kreuz aus zwei Linien, Escape setzt Fokus zurück, Button vor der Navigation im DOM.
4. Aktive Seite: `aria-current="page"`, 2 px Jade-Unterstreichung; Hover bleibt 1 px.
5. Logo zeichnet nur beim ersten Aufruf der Sitzung (Klasse `logo-draw`, sessionStorage in `head.html`). Geprüft.
6. Unternavigation: seitlich scrollbar mit Randausblendung, aktiver Eintrag zentriert, `scroll-padding-top`, Kopplung an `.masthead.is-hidden` gemessen (kein Überlappen). Doppelte Inline-Skripte in meisterstuecke/manufaktur entfernt.
7. Hero-Bildnachweis als Tafel in Grundfarbe (Kontrast 6,55:1).
8. Hinweise „Ziehen oder scrollen“ / „Wischen“ per `pointer: coarse`; Chronik-Hinweis in die Fußzeile verlegt. Spindelvase: neues Einzelbild `spindelvase1-einzeln.webp` (leichte Naht am linken Bildrand sichtbar).
9. „Zu diesem Stück anfragen“ (mailto mit Betreff) an 24 Werken; Telefon neben Anfrage-Buttons (Start, Meisterstücke, Manufaktur, Werkstatt).
10. `.lines` auf Spalte 3 ausgerichtet, `.now--after` mit zwei Spalten und Abstand unten; Jahn-und-Jahn von der Startseite entfernt, auf aktuelles.html als Eintrag in 2026 der vergangenen Ausstellungen; Kosmos mobil mit Ausstellungsname unter dem Ring.
11. Aktuelles: Lücke durch Entfernen des Features behoben (ca. 170 px), doppelte Linie am Jahresarchiv entfernt.
12. Young-Jae Lee: Leerzeichen vor `<small>`, Zeilenlänge max. 68ch, `text-wrap` balance/pretty.
13. Bilder: Varianten `portrait-yjl-1400`, `schalen-trio-800/-1400`, Kacheln 240 px; srcset/sizes gesetzt.
14. Breite/Höhe-Animation: nur `.scale__sample` (Farbskala, tabu, nicht angefasst). Fortschrittsbalken auf `translateX/scaleX` umgestellt.
15. Strich- und Zeitformate vereinheitlicht (9–17 Uhr, 6.–8. November, Telefon +49 201 …). Kein Geviertstrich im Bestand gefunden.
16. 404: Links zu Start, Meisterstücke, Manufaktur, Besuch, Link in Fließtextgröße.
17. Werkstatt: Teamstreifen im Raster (links 40 px, max. 1000 px), kein Überlauf in den Rand mehr.
18. Besuch: Routen-Überschriften per Subgrid ausgerichtet, OpenStreetMap-Link ergänzt.

## Offen / Hinweise
- 19. Abschlussrunde nur teilweise: Playwright-Runde (8 Seiten, 1440/390) lief vor den letzten Feinkorrekturen, keine Konsolenfehler, kein Überlauf. Nicht erneut gemessen: schmale Unternavigationsziele, `.catalog__ask` (jetzt 44 px Höhe).
- Folgemessung empfohlen: `node` Audit mit Tippflächen, danach Sicht auf Manufaktur mobil und Werkstatt mobil.
- „Young-/Jae Lee“ bricht in Listen am Bindestrich (nicht behoben, bräuchte geschütztes Leerzeichen im Quelltext).
- Footer-Wortmarke „Margaretenhöhe“ ist unten beschnitten (bewusst?, nicht angefasst).
- Schreibweise „benützen“/„benutzen“ in Titel von Gisela Jahn uneinheitlich (Inhalt, nicht geändert).
- Desktop-Navigation hat 33 px Höhe (nur mobil auf 44 px getrimmt).

## Screenshots
`.shots/v2/paket1/`: `vorher-*` und `nachher-<seite>-d|m.png` (Vollseite), `n-menu-*`, `f-cosmos-m.png`, `f-404-d.png`.
