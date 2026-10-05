# Sanity-Inhaltsmodell für die Website (Entwurf)

Stand: 03.10.2026. Grundlage ist der Prototyp V2 (`src/v2/`). Ziel: Alles, was sich ändert, pflegt die Werkstatt in Sanity. Ein Neubau über den Cloudflare Deploy Hook setzt es auf die statische Astro-Seite.

Vor der Umsetzung mit dem Sanity-MCP und den Skills `sanity-best-practices` und `content-modeling-best-practices` prüfen (CLAUDE.md).

Feste Regel: Kein Feld für Preis, Bestand, Lagerort, Inventarnummer oder Verfügbarkeit kommt in den Website-Build. Abgefragt werden nur freigegebene Felder.

## Dokumenttypen

| Typ | Felder (Auswahl) | Wo auf der Website |
|---|---|---|
| `ausstellung` | Titel, Haus (Referenz `ort`), Adresse, Start, Ende, Eröffnung (Text), Öffnungszeiten, Kurzbeschreibung (Portable Text), Bilder (Hauptbild und weitere, mit Nachweis), Link zum Haus, `spotlight` (Ja/Nein), Art (Museum, Galerie, Werkstatt, Messe) | Startseite „Aktuell“ (laufend und kommend, Spotlight groß und mit Details offen), Seite Aktuelles, Archiv nach Jahr, Ortsliste |
| `hinweis` | Text, gültig von, gültig bis, Wichtigkeit (normal oder hervorgehoben) | Hinweiszeile unter „Aktuell“, etwa „Am 3. Oktober geschlossen“. Erscheint und verschwindet automatisch beim Neubau. |
| `ort` | Stadt, Land, Titelbild (Raum- oder Ortsfoto, gedämpft dargestellt), Kurztext, Reihenfolge oder Gewicht | Startseite „Ausstellungsorte“. Ausstellungen pro Ort kommen über die Referenz aus `ausstellung`, die Zahlen werden berechnet. |
| `werk` | Titel, Jahr, Kategorie (Schale, Kumme, Vase), Maße, Glasur, Brand, Fotos (Fotoecke 4:5 und Detail), Text, `startseite` (Ja/Nein), Reihenfolge | Meisterstücke (Katalog), Werkschau und Einzelwerk auf der Startseite, „Zu diesem Stück anfragen“ (Formular vorbelegt) |
| `glasur` | Name, matt oder glänzend, Farbwerte (Grund, dunkel, hell, gemessen), Probenfoto | Farbskala (Startseite und Manufaktur) |
| `manufakturteil` | Name, Gruppe (Teller, Krüge, Becher, Töpfe), Foto, Maße, Glasuren (Referenzen) | Seite Manufaktur |
| `chronikEintrag` | Jahr, Titel, Text, Bild (optional) | Zeitstrahl „Hundert Jahre an der Scheibe“ (Startseite) und Werkstatt-Chronik |
| `lebenswegStation` | Jahr, Ort, Station | Zeitstrahl Young-Jae Lee |
| `text` (Essay, Publikation) | Titel, Autor, Quelle, Jahr, PDF oder Link | Seite Young-Jae Lee |
| `seite` und Singletons (`startseite`, `besuch`, `werkstatt` …) | Einstiegszitat, Lede, Einstiegsbild, Abschnittstexte, Öffnungszeiten, Kontakt | feste Texte der Seiten |

## Regeln für den Neubau (Astro, statisch)
- **Status** („Läuft“, „Ab …“, „Nur noch bis …“, „Beendet“) wird beim Bauen aus Start und Ende berechnet. Beendete Ausstellungen verschwinden von der Startseite und erscheinen im Archiv.
- **Spotlight:** Genau eine laufende Ausstellung mit `spotlight` steht groß und mit offenen Details. Ohne Spotlight nimmt der Build die laufende mit dem spätesten Ende.
- **Hinweise** werden nur im Zeitraum von bis gebaut. Damit die Datumsgrenzen ohne Bearbeitung greifen, braucht es einen täglichen Neubau (Cron auf den Deploy Hook).
- **Bilder** kommen über die Sanity-Bild-Pipeline mit festen Formaten pro Verwendung (Kachel 4:3, Werk 4:5 oder 1:1, Ort 4:3) und Bildnachweis als Pflichtfeld.

## Anfrageformular
- Heute im Prototyp: Das Formular validiert und öffnet eine vorbereitete E-Mail.
- Für den echten Versand fehlen:
  - ein Cloudflare-Worker unter `/api/anfrage`
  - ein Mail-Dienst (Kosten und Zugang klärt der Admin)
  - Turnstile gegen Spam
  - ein Security-Review (CLAUDE.md)
- Anfragen werden nicht in Sanity gespeichert.
