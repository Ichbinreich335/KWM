# Phase 2: Inhalte aus Sanity – Feinplanung

> **Für ausführende Agenten:** Diese Datei ist der Auftrag. Vorher `CLAUDE.md`, `konzept/SANITY-MODELL-WEBSITE.md` und diesen Plan lesen. Vor jeder Sanity-Entscheidung den MCP `sanity` befragen: `list_sanity_rules`, dann `get_sanity_rules` mit `schema`, `studio-structure`, `image`, `typegen` (Teil 1) bzw. `astro`, `groq` (Teil 2) bzw. `visual-editing` (Teil 3). Skills `sanity-best-practices` und `content-modeling-best-practices`. Ausführung durch Sonnet, Prüfung durch Tests; gebündeltes `/code-review` am Ende über den Sammel-PR (Admin, 05.10.2026).

Stand: 05.10.2026 (Opus).

## Rahmen (geprüft am 05.10.2026)

- **Projekt:** Sanity-Projekt „KWM“, ID `135lyh9t`, Organisation `ob7rh6bmo`, Konto der Werkstatt (`verwaltung.kwm@proton.me`). Dataset `production`, öffentlich. Kein Studio deployt.
- **Free-Tarif (Preisseite und Doku „Plans and payments“):** 20 Plätze, nur die Rollen Administrator und Viewer, 2 öffentliche Datasets, 10.000 Dokumente, 100 GB Assets, 100 GB Bandbreite, 250.000 API- und 1 Mio. CDN-Anfragen pro Monat, 2 Webhooks, Visual Editing und Presentation Tool enthalten, Content Agent mit 1.000 KI-Credits, Verlauf 3 Tage. **Harte Grenzen ohne Überziehung:** Bei 100 % blockiert Sanity (HTTP 402) und berechnet nichts. Nicht enthalten: Content Releases, geplantes Veröffentlichen, Kommentare, Media Library.
- **Öffentliches Dataset:** Jeder mit der Projekt-ID kann lesen. Deshalb nur Website-Inhalte, nie Preise, Bestand, Lagerorte, Verfügbarkeit oder Inventarnummern (Regel aus CLAUDE.md).
- **Website bleibt statisch:** Inhalte werden beim Bauen geholt; der Neubau läuft über einen Sanity-Webhook auf den Cloudflare Deploy Hook. Visual Editing braucht laut Doku serverseitiges Rendern und ist deshalb ein getrennter, optionaler Teil 3 (Entscheidung des Admins).

## Umfang (Admin 04.10. und 05.10.2026)

In Sanity: Ausstellungen samt Bildern und Flyer, Orte und Galerien, Hinweise, die Seitenköpfe (H1 und Einleitung) der Seiten sowie Kontakt und Öffnungszeiten. Chronik, Lebensweg, Glasuren, Manufaktur und Werke bleiben im Code. Konzept-Empfehlung (noch nicht entschieden): Flyer als Vorschau mit Vergrößern, Galerien als eigener Eintrag, angezeigt in den Orten.

## Teil 1: Studio, Schema, Inhalte (startet sofort)

**Ort:** Ordner `studio/` im Repo mit eigenem `package.json` (Muster der Sanity-Doku „Studio getrennt vom Frontend“). Prettier/ESLint/`astro check` der Website ignorieren `studio/`; das Studio bekommt `sanity build` als eigenen Prüfschritt in `npm run check` (oder einen eigenen CI-Schritt). Hosting kostenlos unter `https://<name>.sanity.studio` per `sanity deploy` (Name `kwm`, sonst `kwm-werkstatt`).

**Dokumenttypen** (deutsche Feldnamen wie in `SANITY-MODELL-WEBSITE.md` und den Daten-Dateien aus Phase D; `defineType`/`defineField`/`defineArrayMember`, Icons, Vorschau, Validierung, deutsche Titel und Beschreibungen für die Werkstatt):

| Typ | Felder | Hinweise |
|---|---|---|
| `ausstellung` | `titel`, `ort` (Referenz), `galerie` (Referenz, optional), `haus` (Name), `adresse`, `start`, `ende` (Datum), `eroeffnung`, `oeffnungszeiten` (Text), `beschreibung` (Portable Text, schlank: Absatz, fett, kursiv, Link), `hauptbild` (Bild mit Hotspot, `alt` Pflicht, `nachweis` Pflicht), `bilder` (optional), `flyer` (Bild, `alt` Pflicht mit Titel, Datum, Ort), `link`, `spotlight` (Ja/Nein), `art` (Liste: Museum, Galerie, Werkstatt, Messe) | Validierung: `ende` ≥ `start`; höchstens eine laufende Ausstellung mit `spotlight` (Warnung, kein Fehler) |
| `ort` | `stadt`, `land`, `bild` (mit `alt`), `kurztext`, `reihenfolge` | Zahlen der Ausstellungen pro Ort berechnet die Website |
| `galerie` | `name`, `stadt`, `adresse`, `link`, `vertretung` (Ja/Nein), `vertretungSeit` (Jahr, optional) | Vertretungen zeigt die Website im Orte-Kopf |
| `hinweis` | `text`, `gueltigVon`, `gueltigBis`, `wichtig` (Ja/Nein) | erscheint nur im Zeitraum (täglicher Neubau, Teil 2) |
| `seite` | `titel` (H1), `einleitung`, `beschreibung` (Meta-Description, max. 160 Zeichen) | Singletons mit festen IDs je Seite: `startseite`, `aktuelles`, `meisterstuecke`, `manufaktur`, `young-jae-lee`, `werkstatt`, `besuch` |
| `werkstatt` | `firma`, `strasse`, `plz`, `ort`, `telefon`, `email`, `oeffnungszeiten` (Liste `{ wochentage, von, bis }`), `hinweisZeiten` (Text) | Singleton; ersetzt später `src/data/kontakt.ts` als Quelle |

**Studio-Aufbau (Structure Builder):** Startbereich mit „Ausstellungen“ (laufend und kommend, archiviert), „Orte und Galerien“, „Hinweise“, „Seiten“ (je Seite ein Eintrag, kein Anlegen/Löschen), „Werkstatt (Kontakt und Zeiten)“. Singletons ohne „Neu“ und „Löschen“. Studio-Sprache Deutsch (`@sanity/locale-de-de`, falls laut Doku verfügbar).

**Inhalte importieren:** Die heutigen Inhalte aus `src/data/*.ts` (Phase D2/D3) bzw. den Seiten als Dokumente anlegen (MCP `create_documents` oder ein Import-Skript mit NDJSON), Bilder per `dataset_assets_upload_from_file` hochladen, als Entwurf anlegen und erst nach Prüfung veröffentlichen. Keine erfundenen Inhalte; fehlende Bildnachweise als „Nachweis fehlt“ markieren und in `ADMIN-OFFEN.md` listen.

**TypeGen:** `sanity typegen generate` erzeugt Typen für die Website (`sanity.types.ts`), Schema-Extrakt im Repo.

**Prüfen:** `sanity build` grün, `sanity schema validate` ohne Fehler, Studio deployt und per Playwright angesehen (Screens Desktop 1440 und Handy 390 der Startansicht, einer Ausstellung, einer Seite, der Werkstatt-Einstellungen) nach `.shots/sanity-studio/`.

## Teil 2: Website liest aus Sanity (nach Phase D2/D3)

- `@sanity/astro` (Version laut Doku) in der Website, `useCdn: false`, `apiVersion` fest. Abfragen mit `defineQuery` in `src/sanity/queries.ts`, **nur freigegebene Felder** (Projektion, kein `...`).
- Die Daten-Dateien aus Phase D werden zu dünnen Ladefunktionen, die Komponenten bleiben unverändert (gleiche Typen dank TypeGen).
- Bilder: Sanity-Bild-URLs beim Build über `astro:assets`/`getImage` mit `remotePatterns` für `cdn.sanity.io` verarbeiten (Doku prüfen), damit Größen und Formate wie heute entstehen; Hotspot beachten.
- Build-Sicherheit: Fehlt ein Pflichtfeld oder schlägt die Abfrage fehl, bricht der Build ab, und die letzte gute Version bleibt online (Schema-Prüfung mit Typen und einer kleinen Laufzeitprüfung).
- Neubau: Sanity-Webhook (GROQ-Filter auf die Typen aus Teil 1, nur bei Veröffentlichen) ruft den Cloudflare Deploy Hook. Die Hook-URL ist geheim und kommt nicht ins Repo. Täglicher Neubau für Hinweise und Status per Cron (Cloudflare Cron Trigger auf den Deploy Hook oder Sanity-Funktion, Doku prüfen, beides kostenlos).
- CSP: `img-src` um `cdn.sanity.io` erweitern, nur falls Bilder nicht beim Build lokal verarbeitet werden.
- Optik-Tests müssen nach dem Umstieg pixelgleich bleiben (gleiche Inhalte).

## Teil 3 (optional, Entscheidung Admin): Klicken und Bearbeiten im Studio

Stand nach `konzept/RECHERCHE-VORSCHAU.md` (05.10.2026): Es braucht **keinen** eigenen Server für die Grundfunktion. Stufen:

1. **(b+) Klick-Rahmen auf der statischen Seite (empfohlen, ca. 1 Tag):** Presentation Tool mit `previewUrl` als reiner Adresse (ohne `previewMode`), `resolve`/locations je Dokumenttyp. Beim Bauen schreibt die Website `data-sanity`-Attribute (Dokument-ID, Typ, Feldpfad) an die Elemente mit Sanity-Inhalt; im iframe startet `enableVisualEditing()` (`@sanity/visual-editing`, reines Browser-JS, nur wenn die Seite im Studio-iframe läuft, sonst nicht geladen). Klick auf eine Überschrift springt zum Feld; das Ergebnis erscheint nach Veröffentlichen und Neubau. Header: `frame-ancestors 'self' https://kwm.sanity.studio`, `X-Frame-Options` entfernen (Phase E anpassen), CSP für das Overlay-Skript prüfen.
2. **(c) Spike, halber Tag:** Entwurfs-Texte live im iframe über den Live Mode des Presentation Tools (`@sanity/core-loader`, Comlink/postMessage, kein Token im Browser). Nur Textfelder, gezielt ausgetauscht; Struktur, Rich Text und Bilder nach Veröffentlichen. Erfolgskriterium: Titel im Studio tippen, H1 im iframe ändert sich, ohne Token und Server.
3. **(d) Rückfall:** eigene SSR-Vorschau (Worker mit `@astrojs/cloudflare`), nur wenn (c) scheitert und der Admin Live-Entwürfe will.

Teil 1 und 2 werden so gebaut, dass (b+) ohne Umbau möglich ist: Abfragen liefern `_id`/`_type` mit, Komponenten nehmen ein optionales Attribut für die Sanity-Markierung entgegen.

## Konto-Umzug Cloudflare und GitHub

Website, Formular-Worker und Lager-Code sollen auf Konten der Werkstatt liegen. Damit der Umzug klein bleibt: Alles steht im Code (`wrangler.jsonc`), Geheimnisse nur in Umgebungsvariablen. Beim Umzug ändern sich Deploy-Hook-URL (Sanity-Webhook neu eintragen), Vorschau-URLs und Secrets. Am besten vor Teil 2 (Webhook) und vor dem Formular-Worker umziehen.
