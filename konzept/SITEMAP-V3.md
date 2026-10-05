# Sitemap, Weiterleitungen und Textseiten – Design V3

Stand: 03.10.2026, Branch `design-v3`. Ergänzt `konzept/SITEMAP-V2.md` (Bereiche und Startseite, gelten unverändert). Dieses Dokument regelt, was zusätzlich dazukommt: Pflicht- und Serviceseiten, Werk- und Produktseiten, EN-Bereich und die Umleitung der alten URLs von kwm-1924.de.

## 1. Bestand der Live-Seite (kwm-1924.de, deutsch)

Erhoben am 03.10.2026: alle URLs aus der Firecrawl-Liste des Admins, dazu die Haupt- und Unternavigation der Live-Seite (rekursiv abgerufen). Es gibt weder `sitemap.xml` noch `robots.txt` (beides liefert die Aktuelles-Seite aus). Die Startseite `/` ist identisch mit `/neuigkeiten/aktuelles/`. Die Firecrawl-Liste war unvollständig: Es fehlten die Jahresarchive 2017/2018/2020 bis 2022/2024 bis 2026, Kummen, Biografie, Auszeichnungen, Texte, Museen, Zahlung sowie die meisten Werk- und Produktseiten. Englisch gibt es ein spiegelbildliches Menü mit etwa 60 Seiten (Abschnitt 6).

| Alte URL (DE) | Titel | Inhaltstyp | im V3 |
|---|---|---|---|
| `/` | Aktuelles (Startseite der Live-Seite) | Terminliste | index.html (Startseite), aktuelles.html |
| `/neuigkeiten/aktuelles/` | Aktuelles | Terminliste, aktuelle Ausstellungen | aktuelles.html #ausstellungen |
| `/neuigkeiten/veroeffnetlichungen/` | Veröffentlichungen | Liste | aktuelles.html #veroeffentlichungen |
| `/neuigkeiten/vergangene/ und /<jahr>/ (2016–2026, 11 Seiten)` | 2026 … 2016 | Jahreslisten vergangener Ausstellungen, PDFs/Plakate | aktuelles.html #vergangene (Auswahl seit 2016, je Jahr aufklappbar); Plakate und PDFs nicht übernommen |
| `/meisterstuecke/` | Meisterstücke | Einstieg, Katalog | meisterstuecke.html |
| `/meisterstuecke/arbeitsweise/` | Arbeitsweise | Text | meisterstuecke.html #arbeitsweise, ausführlich werkstatt.html #arbeitsweise |
| `/meisterstuecke/schalen/ und 6 Werkseiten (grosse-schale, schale-spitz-klein/mittel/gross/xl/xxl)` | Schalen | Werkseiten mit Foto und Maßen | meisterstuecke.html #schalen (als Werkauswahl, keine eigenen Seiten) |
| `/meisterstuecke/kummen/` | Kummen | Katalog | meisterstuecke.html #kummen |
| `/meisterstuecke/vasen/ und 6 Werkseiten (spindelvase, kugelvase-gross, zylindervase-klein/mittel/gross(en)/xl)` | Vasen | Werkseiten mit Foto und Maßen | meisterstuecke.html #vasen |
| `/manufakturprogramm/` | Manufakturprogramm | Einstieg | manufaktur.html |
| `/manufakturprogramm/geschirr/ und /geschirr-2/` | Geschirr (Teller) | Übersicht (doppelt vorhanden) | manufaktur.html #geschirr |
| `/manufakturprogramm/geschirr/<teller, viereckteller, schalen-und-schuesseln, becher-und-tassen, toepfe-und-dosen, flaschen-kruege-kannen, weitere-produkte>/ (7)` | Produktgruppen | Produktseiten mit Fotos | manufaktur.html #geschirr (alle sieben Gruppen) |
| `/manufakturprogramm/editionen/ und 5 Unterseiten (vasen-2, pflanzgefaesse-2, schalen, plattenteller, dose)` | Editionen | Produktseiten | manufaktur.html #edition |
| `/manufakturprogramm/farben/` | Farben | Farbskala | manufaktur.html #farben |
| `/young-jae-lee/` | Young-Jae Lee | Einstieg | young-jae-lee.html |
| `/young-jae-lee/biografie/` | Biografie | Text | young-jae-lee.html #biografie |
| `/young-jae-lee/auszeichungen/` | Auszeichnungen (Tippfehler in der URL) | Liste | young-jae-lee.html #auszeichnungen |
| `/young-jae-lee/ausstellungen/` | Ausstellungen | Liste | young-jae-lee.html #ausstellungen |
| `/young-jae-lee/objekte-in-museen/` | Objekte in Museen | Liste | young-jae-lee.html #sammlungen |
| `/young-jae-lee/publikationen/` | Publikationen | Liste | young-jae-lee.html #publikationen |
| `/young-jae-lee/texte-ueber-young-jae-lee/` | Texte über Young-Jae Lee | Texte | young-jae-lee.html #texte |
| `/werkstatt/` | Werkstatt | Einstieg | werkstatt.html |
| `/werkstatt/arbeitsweise/` | Arbeitsweise | Text | werkstatt.html #arbeitsweise |
| `/werkstatt/chronik-2/` | Chronik | Zeitleiste | werkstatt.html #chronik |
| `/werkstatt/team-2/` | Team | Personen | werkstatt.html #team |
| `/werkstatt/auszeichungen/` | Auszeichnungen (Tippfehler in der URL) | Liste | werkstatt.html #auszeichnungen |
| `/anfrage-2/` | Anfrage | Formular | besuch.html #anfrage (anfrage-form.html) |
| `/anfrage/Edition, /anfrage/Manufakturprogramm` | Anfrage / inquiry | alte TYPO3-Formularlinks | besuch.html #anfrage |
| `/firma/kontakt/` | Kontakt | Adresse, Zeiten, Anfahrt (3 Routen, ÖPNV) | besuch.html (Adresse, Zeiten, Anfahrt) |
| `/firma/zahlung/` | Zahlungsmöglichkeiten | Überweisung (IBAN), PayPal mit QR-Code | neu: zahlung.html (Kurzfassung auch in besuch.html) |
| `/firma/impressum/` | Impressum | Pflichtangaben, rechtlicher Hinweis, Datenschutzhinweise (Stand 2008) | neu: impressum.html |
| `/firma/agb/ und /firma/agb/bedingungen/` | Allgemeine Geschäftsbedingungen | Rechtstext, 12 Paragrafen, Stand 01.10.2026 | neu: agb.html |
| `/firma/agb/verpackung-und-transport/` | Verpackung und Transportkosten | Kurztext | neu: versand.html |
| `(fehlt auf der Live-Seite)` | Datenschutzerklärung |  | neu: datenschutz.html (Platzhalter) |
| `/fileadmin/user_upload/*.pdf, /index.php?id=14 (Altlasten TYPO3)` | Plakate, Einladungen, Flyer | PDFs, auf der Live-Seite nicht mehr abrufbar (leiten auf Aktuelles um) | nicht übernommen |

Wichtig: Jede Werk- und Produktseite der Live-Seite besteht aus Foto, Maßen und einem Anfrage-Link, nicht aus eigenem Text. Der Inhalt steckt im V3 bereits in den Katalogabschnitten.

## 2. Neue Sitemap

```
/                          Startseite
├─ meisterstuecke          Schalen · Kummen · Vasen · Arbeitsweise (Kurzfassung)
│  └─ /<werk>              später: Werkseite aus Sanity (Abschnitt 4)
├─ manufaktur              Geschirr · Edition · Farben
│  └─ /<gruppe>            später: Produktgruppe aus Sanity (Abschnitt 4)
├─ young-jae-lee           Haltung · Biografie · Texte · Ausstellungen · Sammlungen · Auszeichnungen · Publikationen
├─ werkstatt               Arbeitsweise · Chronik · Team · Auszeichnungen · Zollverein
├─ aktuelles               Ausstellungen · Vergangene (Jahresarchiv) · Veröffentlichungen
├─ besuch                  Adresse, Öffnungszeiten · Anfahrt · Anfrage (= Kontakt)
├─ Rechtliches und Service (Footer, nicht in der Hauptnavigation)
│  ├─ zahlung              Überweisung, PayPal
│  ├─ versand              Verpackung und Transportkosten
│  ├─ agb                  Allgemeine Verkaufs- und Lieferbedingungen
│  ├─ impressum
│  └─ datenschutz          Platzhalter, Text folgt
├─ en/                     später, eigener Schritt (Abschnitt 6)
└─ 404
```

### Rolle jeder Seite

| Seite | Rolle | Status |
|---|---|---|
| `/` | Erzählt, führt zu jeder Hauptseite | V3 vorhanden |
| `/meisterstuecke` | Unikate von Young-Jae Lee | V3 vorhanden |
| `/manufaktur` | Geschirr und Edition zum Bestellen | V3 vorhanden |
| `/young-jae-lee` | Die Person | V3 vorhanden |
| `/werkstatt` | Das Haus seit 1924 | V3 vorhanden |
| `/aktuelles` | Termine, Archiv, Veröffentlichungen | V3 vorhanden |
| `/besuch` | Besuch, Anfahrt, Kontakt, Anfrage. Löst `/firma/kontakt` und `/anfrage-2` ab | V3 vorhanden |
| `/zahlung` | Zahlungswege, Ziel der Zahlungsfrage nach Anfrage | neu, portiert |
| `/versand` | Verpackungs- und Transportkosten (verlinkt aus AGB und Zahlung) | neu, portiert |
| `/agb` | Rechtstext, unverändert | neu, portiert |
| `/impressum` | Pflichtangaben (§ 5 DDG), rechtlicher Hinweis, bisherige Datenschutzhinweise | neu, portiert |
| `/datenschutz` | Pflichtseite, von der Anfrage-Formular-Notiz verlinkt | neu, Platzhalter, `noindex` bis der Text da ist |
| `/404` | Auffangseite | V3 vorhanden |

Begründung der Entscheidungen:
- **Kontakt wird Besuch.** Die Live-Seite trennt Kontakt, Anfrage und Anfahrt in drei Seiten. V3 hat dafür eine Seite mit Formular. Eine Seite weniger, ein Ziel für alle Anfragewege.
- **Zahlung bleibt als eigene Seite**, auch wenn `besuch` die Kurzfassung zeigt. Der Admin hat die Seite gewünscht, sie wird im Footer und aus der Anfrage verlinkt und liefert den QR-Code. Die Angaben sind auf `besuch` und `zahlung` doppelt gepflegt. Bei Änderung der IBAN beide Stellen anpassen (später ein Sanity-Feld).
- **Rechtliches nur im Footer**, nie in der Hauptnavigation. Zielgruppe sind Kunden mit Bestellung und Behörden, nicht Besucher.
- **Eine Textseiten-Vorlage** für alle fünf Seiten: `src/v3/<seite>.html` mit `css/page-text.css`. Heller Seitenkopf (Typ Name, ohne Bild), links Rechtliches-Navigation und bei langen Seiten ein Inhaltsverzeichnis (sticky, mobil nur die Seitenlinks), rechts der Text in 68 Zeichen Zeilenlänge mit Zwischenüberschriften als H2. Kein dunkler Anker (Textseiten sind die Ausnahme von der Regel „ein Anker je Unterseite“, weil der Footer schon dunkel ist und Lesbarkeit vorgeht). Anfrage-Leiste bei AGB, Versand und Zahlung, nicht bei Impressum und Datenschutz.
- **Texte wörtlich übernommen**, nur typografisch gesäubert: bedingte Trennstriche (aus der PDF-Vorlage der AGB) entfernt, geschützte Leerzeichen und HTML-Reste bereinigt, ein kaputtes Anführungszeichen (`.neu“` → `„neu“`). Keine inhaltliche Änderung. Auffällige Fehler im Rechtstext stehen unten in den offenen Punkten, sie werden nicht stillschweigend korrigiert.

## 3. Weiterleitungen

Regeln:
- **Deutsche URLs: 301.** Jede alte URL hat ein Ziel, nichts läuft in die 404.
- **Werk- und Produktseiten → Abschnitt im Katalog** (`/meisterstuecke#vasen`, `/manufaktur#geschirr`). Solange es keine Werkseiten gibt, ist das die ehrlichste Entsprechung. Sobald die Sanity-Werkseiten stehen, werden diese Zeilen auf die Einzelseite umgestellt (Abschnitt 4).
- **Jahresarchiv → `/aktuelles#vergangene`.** Die Jahre sind im V3 aufklappbare `<details>` ohne eigene Anker. Folgeschritt (an der Aktuelles-Seite, nicht Teil dieses Auftrags): `id="jahr-2024"` je Jahr und die Zeilen auf `#jahr-2024` umstellen.
- **EN-URLs: 302** auf die deutsche Entsprechung, solange es keinen englischen Bereich gibt. Ein 301 würde Suchmaschinen und Browser dauerhaft auf Deutsch festlegen, bevor die Entscheidung zu `/en/` gefallen ist.
- **Altlasten** (`/fileadmin/*`, `/index.php`): auf Aktuelles beziehungsweise Startseite. Die PDFs sind auf der Live-Seite ohnehin nicht mehr abrufbar.
- Alte URLs enden auf `/`. Die `_redirects` enthält darum beide Schreibweisen.
- Die fertige Datei liegt in `konzept/redirects-vorschlag.txt` (nicht im aktiven `site/`). Zum Einsatz als `_redirects` ins Asset-Verzeichnis kopieren. Format laut Cloudflare-Doku (Workers Static Assets, geprüft über den cloudflare-docs-MCP): `Quelle Ziel Code`, ohne Code gilt 302, Splat `*` nur einmal je Regel, Grenzen 2000 statische und 100 dynamische Regeln (Vorschlag: 204 statische, 7 Splat-Regeln). Als **Annahmen** gekennzeichnet und vor dem Live-Gang auf einem Vorschau-Deploy zu prüfen: Anker `#…` im Ziel, Reihenfolge „erste passende Regel gewinnt“, Verhalten bei Schluss-Schrägstrich.
- Die Redirects greifen nur für Anfragen, die das Asset-Verzeichnis bedienen, nicht für Worker-Code (z. B. den Formular-Worker).

| Gruppe | Alte URL | Neue URL | Code |
|---|---|---|---|
| Aktuelles | `/neuigkeiten/aktuelles` | `/aktuelles` | 301 |
| Aktuelles | `/neuigkeiten/veroeffnetlichungen` | `/aktuelles#veroeffentlichungen` | 301 |
| Aktuelles | `/neuigkeiten/vergangene` | `/aktuelles#vergangene` | 301 |
| Jahresarchiv | `/neuigkeiten/vergangene/2026-2` | `/aktuelles#vergangene` | 301 |
| Jahresarchiv | `/neuigkeiten/vergangene/2025-2` | `/aktuelles#vergangene` | 301 |
| Jahresarchiv | `/neuigkeiten/vergangene/2024-2` | `/aktuelles#vergangene` | 301 |
| Jahresarchiv | `/neuigkeiten/vergangene/jahr_2023` | `/aktuelles#vergangene` | 301 |
| Jahresarchiv | `/neuigkeiten/vergangene/jahr_2022` | `/aktuelles#vergangene` | 301 |
| Jahresarchiv | `/neuigkeiten/vergangene/jahr_2021` | `/aktuelles#vergangene` | 301 |
| Jahresarchiv | `/neuigkeiten/vergangene/jahr_2020` | `/aktuelles#vergangene` | 301 |
| Jahresarchiv | `/neuigkeiten/vergangene/jahr_2019` | `/aktuelles#vergangene` | 301 |
| Jahresarchiv | `/neuigkeiten/vergangene/jahr_2018` | `/aktuelles#vergangene` | 301 |
| Jahresarchiv | `/neuigkeiten/vergangene/jahr_2017` | `/aktuelles#vergangene` | 301 |
| Jahresarchiv | `/neuigkeiten/vergangene/2016-2` | `/aktuelles#vergangene` | 301 |
| Young-Jae Lee | `/young-jae-lee/biografie` | `/young-jae-lee#biografie` | 301 |
| Young-Jae Lee | `/young-jae-lee/auszeichungen` | `/young-jae-lee#auszeichnungen` | 301 |
| Young-Jae Lee | `/young-jae-lee/ausstellungen` | `/young-jae-lee#ausstellungen` | 301 |
| Young-Jae Lee | `/young-jae-lee/objekte-in-museen` | `/young-jae-lee#sammlungen` | 301 |
| Young-Jae Lee | `/young-jae-lee/publikationen` | `/young-jae-lee#publikationen` | 301 |
| Young-Jae Lee | `/young-jae-lee/texte-ueber-young-jae-lee` | `/young-jae-lee#texte` | 301 |
| Werkstatt | `/werkstatt/arbeitsweise` | `/werkstatt#arbeitsweise` | 301 |
| Werkstatt | `/werkstatt/team-2` | `/werkstatt#team` | 301 |
| Werkstatt | `/werkstatt/chronik-2` | `/werkstatt#chronik` | 301 |
| Werkstatt | `/werkstatt/auszeichungen` | `/werkstatt#auszeichnungen` | 301 |
| Meisterstücke | `/meisterstuecke/arbeitsweise` | `/meisterstuecke#arbeitsweise` | 301 |
| Meisterstücke | `/meisterstuecke/vasen` | `/meisterstuecke#vasen` | 301 |
| Meisterstücke | `/meisterstuecke/schalen` | `/meisterstuecke#schalen` | 301 |
| Meisterstücke | `/meisterstuecke/kummen` | `/meisterstuecke#kummen` | 301 |
| Werk (Schale) | `/meisterstuecke/schalen/grosse-schale` | `/meisterstuecke#schalen` | 301 |
| Werk (Schale) | `/meisterstuecke/schalen/schale-spitz-klein` | `/meisterstuecke#schalen` | 301 |
| Werk (Schale) | `/meisterstuecke/schalen/schale-spitz-mittel` | `/meisterstuecke#schalen` | 301 |
| Werk (Schale) | `/meisterstuecke/schalen/schale-spitz-gross` | `/meisterstuecke#schalen` | 301 |
| Werk (Schale) | `/meisterstuecke/schalen/schale-spitz-xl` | `/meisterstuecke#schalen` | 301 |
| Werk (Schale) | `/meisterstuecke/schalen/schale-spitz-xxl` | `/meisterstuecke#schalen` | 301 |
| Werk (Vase) | `/meisterstuecke/vasen/spindelvase` | `/meisterstuecke#vasen` | 301 |
| Werk (Vase) | `/meisterstuecke/vasen/kugelvase-gross` | `/meisterstuecke#vasen` | 301 |
| Werk (Vase) | `/meisterstuecke/vasen/zylindervase-klein` | `/meisterstuecke#vasen` | 301 |
| Werk (Vase) | `/meisterstuecke/vasen/zylindervase-mittel` | `/meisterstuecke#vasen` | 301 |
| Werk (Vase) | `/meisterstuecke/vasen/zylindervase-gross` | `/meisterstuecke#vasen` | 301 |
| Werk (Vase) | `/meisterstuecke/vasen/zylindervasen-gross` | `/meisterstuecke#vasen` | 301 |
| Werk (Vase) | `/meisterstuecke/vasen/zylindervase-xl` | `/meisterstuecke#vasen` | 301 |
| Manufaktur | `/manufakturprogramm` | `/manufaktur` | 301 |
| Manufaktur | `/manufakturprogramm/geschirr` | `/manufaktur#geschirr` | 301 |
| Manufaktur | `/manufakturprogramm/geschirr-2` | `/manufaktur#geschirr` | 301 |
| Produkt (Geschirr) | `/manufakturprogramm/geschirr/teller` | `/manufaktur#geschirr` | 301 |
| Produkt (Geschirr) | `/manufakturprogramm/geschirr/viereckteller` | `/manufaktur#geschirr` | 301 |
| Produkt (Geschirr) | `/manufakturprogramm/geschirr/schalen-und-schuesseln` | `/manufaktur#geschirr` | 301 |
| Produkt (Geschirr) | `/manufakturprogramm/geschirr/becher-und-tassen` | `/manufaktur#geschirr` | 301 |
| Produkt (Geschirr) | `/manufakturprogramm/geschirr/toepfe-und-dosen` | `/manufaktur#geschirr` | 301 |
| Produkt (Geschirr) | `/manufakturprogramm/geschirr/flaschen-kruege-kannen` | `/manufaktur#geschirr` | 301 |
| Produkt (Geschirr) | `/manufakturprogramm/geschirr/weitere-produkte` | `/manufaktur#geschirr` | 301 |
| Manufaktur | `/manufakturprogramm/editionen` | `/manufaktur#edition` | 301 |
| Manufaktur | `/manufakturprogramm/edition` | `/manufaktur#edition` | 301 |
| Produkt (Edition) | `/manufakturprogramm/editionen/vasen-2` | `/manufaktur#edition` | 301 |
| Produkt (Edition) | `/manufakturprogramm/editionen/pflanzgefaesse-2` | `/manufaktur#edition` | 301 |
| Produkt (Edition) | `/manufakturprogramm/editionen/schalen` | `/manufaktur#edition` | 301 |
| Produkt (Edition) | `/manufakturprogramm/editionen/plattenteller` | `/manufaktur#edition` | 301 |
| Produkt (Edition) | `/manufakturprogramm/editionen/dose` | `/manufaktur#edition` | 301 |
| Manufaktur | `/manufakturprogramm/farben` | `/manufaktur#farben` | 301 |
| Anfrage | `/anfrage-2` | `/besuch#anfrage` | 301 |
| Anfrage | `/anfrage/Edition` | `/besuch#anfrage` | 301 |
| Anfrage | `/anfrage/Manufakturprogramm` | `/besuch#anfrage` | 301 |
| Service | `/firma` | `/besuch` | 301 |
| Service | `/firma/kontakt` | `/besuch` | 301 |
| Service | `/firma/zahlung` | `/zahlung` | 301 |
| Service | `/firma/impressum` | `/impressum` | 301 |
| Service | `/firma/agb` | `/agb` | 301 |
| Service | `/firma/agb/bedingungen` | `/agb` | 301 |
| Service | `/firma/agb/verpackung-und-transport` | `/versand` | 301 |
| Altlasten | `/fileadmin/*` | `/aktuelles#vergangene` | 301 |
| Altlasten | `/index.php` | `/` | 301 |
| EN | `/en` | `/` | 302 |
| EN | `/en/news` | `/aktuelles` | 302 |
| EN | `/en/news/current` | `/aktuelles` | 302 |
| EN | `/en/news/publications` | `/aktuelles#veroeffentlichungen` | 302 |
| EN | `/en/news/past` | `/aktuelles#vergangene` | 302 |
| EN | `/en/news/past/*` | `/aktuelles#vergangene` | 302 |
| EN | `/en/youngjae-lee` | `/young-jae-lee` | 302 |
| EN | `/en/youngjae-lee/biography` | `/young-jae-lee#biografie` | 302 |
| EN | `/en/youngjae-lee/awards` | `/young-jae-lee#auszeichnungen` | 302 |
| EN | `/en/youngjae-lee/exhibitions` | `/young-jae-lee#ausstellungen` | 302 |
| EN | `/en/youngjae-lee/publications` | `/young-jae-lee#publikationen` | 302 |
| EN | `/en/youngjae-lee/texts` | `/young-jae-lee#texte` | 302 |
| EN | `/en/workshop` | `/werkstatt` | 302 |
| EN | `/en/workshop/history` | `/werkstatt#chronik` | 302 |
| EN | `/en/workshop/method` | `/werkstatt#arbeitsweise` | 302 |
| EN | `/en/workshop/team` | `/werkstatt#team` | 302 |
| EN | `/en/workshop/awards` | `/werkstatt#auszeichnungen` | 302 |
| EN | `/en/masterworks` | `/meisterstuecke` | 302 |
| EN | `/en/masterworks/method` | `/meisterstuecke#arbeitsweise` | 302 |
| EN | `/en/masterworks/vessels` | `/meisterstuecke#kummen` | 302 |
| EN | `/en/masterworks/bowls` | `/meisterstuecke#schalen` | 302 |
| EN | `/en/masterworks/bowls/*` | `/meisterstuecke#schalen` | 302 |
| EN | `/en/masterworks/vases` | `/meisterstuecke#vasen` | 302 |
| EN | `/en/masterworks/vases/*` | `/meisterstuecke#vasen` | 302 |
| EN | `/en/collection` | `/manufaktur` | 302 |
| EN | `/en/collection/colors` | `/manufaktur#farben` | 302 |
| EN | `/en/collection/tableware` | `/manufaktur#geschirr` | 302 |
| EN | `/en/collection/tableware/*` | `/manufaktur#geschirr` | 302 |
| EN | `/en/collection/editions` | `/manufaktur#edition` | 302 |
| EN | `/en/collection/editions/*` | `/manufaktur#edition` | 302 |
| EN | `/en/inquiries-orders` | `/besuch#anfrage` | 302 |
| EN | `/en/business/contact` | `/besuch` | 302 |
| EN | `/en/business/about-this-site` | `/impressum` | 302 |
| EN | `/en/business/payment` | `/zahlung` | 302 |
| EN | `/en/business/tac` | `/agb` | 302 |
| EN | `/en/business/tac/general-terms-and-conditions` | `/agb` | 302 |
| EN | `/en/business/tac/packing-and-transport` | `/versand` | 302 |
| EN | `/en/*` | `/` | 302 |

## 4. Werk- und Produktseiten (später, Astro mit Sanity)

Nicht jetzt gebaut. Vorschlag für den Umzug nach Astro:

- **Route `/meisterstuecke/[werk]`**: ein Sanity-Dokument je Werk (Schale, Kumme, Vase). Slug, Titel, Werkgruppe, Entstehungsjahr, Maße, Material und Glasur, Fotos (Freisteller, Detail, Situation), kurzer Text optional. Dazu die Live-Slugs als Feld `legacySlug`, damit die Weiterleitungen automatisch aus Sanity entstehen (`/meisterstuecke/vasen/spindelvase → /meisterstuecke/spindelvase`).
- **Route `/manufaktur/[gruppe]`**: ein Dokument je Produktgruppe (Teller, Viereckteller, Schalen und Schüsseln, Becher und Tassen, Töpfe und Dosen, Flaschen, Krüge, Kannen, Weitere Stücke, Editionen). Mit Größenvarianten und der Glasurauswahl als Referenz auf die Farbskala.
- **Aufbau der Seite**: Seitenkopf Typ Meta (Name und Maße links, großes Foto rechts), Foto-Galerie, Abschnitt „Aus derselben Werkgruppe“, Anfrage-Leiste mit `?stueck=<Werkname>` (das Formular füllt das Feld vor). Keine Preise, keine Inventarnummern, kein Lagerort, keine Verfügbarkeit im Build.
- **Build**: statisch über `getStaticPaths`, Neubau über den Cloudflare Deploy Hook. Die Sitemap-XML entsteht aus denselben Daten (Integration `@astrojs/sitemap`, vor dem Einbau mit dem Astro-Docs-MCP prüfen).
- **Reihenfolge**: erst die Meisterstücke (hier wollen Besucher das einzelne Stück sehen), dann die Manufaktur.
- **Umstellung der Weiterleitungen**: Zeilen mit `Werk (Schale)`, `Werk (Vase)` und `Produkt (…)` zeigen dann auf die neue Einzelseite statt auf den Anker.

## 5. Technische Hinweise zu den URLs

- Im Prototyp heißen die Dateien `*.html` und die Links `besuch.html`. In Astro bekommen die Seiten saubere URLs ohne Endung und ohne Schluss-Schrägstrich-Zwang (Cloudflare-Standard `auto-trailing-slash`). Die Redirect-Ziele sind bereits ohne `.html` geschrieben.
- `sitemap.xml` und `robots.txt` fehlen heute komplett. Bei Live-Gang: Sitemap mit allen indexierbaren Seiten, `datenschutz` ausgenommen, solange sie ein Platzhalter ist (hat bereits `noindex`). Seitenweise `canonical`, später `hreflang` für DE und EN.
- Die 404-Seite zeigt Wege zu den Hauptseiten. Nach dem Umzug in der Search Console die Fehlerliste der alten URLs beobachten.

## 6. Englischer Bereich: Empfehlung

- **Später und als eigener Schritt.** Die Live-Seite hat ein spiegelbildliches Menü (`/en/news`, `/en/workshop`, `/en/masterworks`, `/en/collection`, `/en/youngjae-lee`, `/en/business`), also etwa 60 Seiten, die inhaltlich den deutschen entsprechen.
- Der Auslöser sollte die Übersetzung sein, nicht die Technik. Offene Frage an die Werkstatt: Wer pflegt die englischen Texte? Die Impressum-Zeile nennt eine Übersetzerin (Alison Gallup) und eine Lektorin (Alix Sharma) für die Altseite.
- **Technik**: Astro i18n mit Präfix `/en/` (nur englisch, deutsch ohne Präfix), Sanity-Felder je Sprache (feldweise Lokalisierung, nicht doppelte Dokumente), Sprachumschalter in Kopf und Mobilmenü (derzeit verlinkt er auf die alte Live-Seite) und `hreflang`.
- **Bis dahin**: die EN-URLs leiten mit 302 auf die deutsche Entsprechung. Der EN-Schalter im V3 führt noch auf kwm-1924.de, das muss zum Live-Gang entfallen oder auf `/en/` zeigen.
- **Rechtliches auf Englisch**: AGB und Impressum haben auf der Live-Seite englische Fassungen (`/en/business/tac`, `/en/business/about-this-site`). Verbindlich ist laut AGB § 12 die deutsche Fassung. Mit der Werkstatt klären, ob die englischen Texte weitergeführt werden.

## 7. Offene Punkte für die Werkstatt

1. **Datenschutzerklärung (Pflicht vor Live-Gang).** Auf der Live-Seite fehlt eine eigene Seite. Im Impressum steht ein Datenschutztext von 2008 (Bundesdatenschutzgesetz alt, „§ 4e BDSG“, Verfahrensverzeichnis), der die DSGVO nicht abbildet. Ich habe ihn unverändert im Impressum belassen und die Platzhalterseite darauf verwiesen. Nötig: eine aktuelle Erklärung (Verantwortliche, Zwecke, Rechtsgrundlagen, Empfänger, Speicherdauer, Rechte, Formular-Dienstleister und Turnstile, Hosting bei Cloudflare, Schriften lokal) vom Datenschutzbeauftragten oder einer Kanzlei. Danach `datenschutz.html` füllen und `noindex` entfernen.
2. **Impressum prüfen.** Stand „Oktober 2009“, Verweis auf „Handelsregister B 19479“, USt-ID, Geschäftsführung und Bildnachweise (2007, 2008, 2015) sind aktuell zu bestätigen. Das Gesetz heißt seit 2024 „Digitale-Dienste-Gesetz (DDG)“, der alte Text nennt es nicht. Neue Fotos aus dem V3 brauchen Bildnachweise (siehe `konzept/UEBERGABE.md`).
3. **AGB prüfen lassen.** Der Text ist wörtlich übernommen, Stand 01.10.2026. Beim Lesen aufgefallen (nicht korrigiert, weil Rechtstext): „zu befrachten“ (wohl „betrachten“, § 5 (1)), „olle erkennbaren“ (§ 9 (1) a), „hoben“ (§ 9 (1) b), „Rückgängigmachung des Vertrages oder die Herabsetzung der Vergütung Minderung“ (§ 9 (1) c), „noch dem Produkthaftungsgesetz“ (§ 9 (1) g), „Nacherlullung“ (§ 9 (2) f), „Weilerveräußerung“ (§ 7 (5)), „K10geerhebung“ (§ 12 (1), wohl „Klageerhebung“). Außerdem verweist § 10 auf eine Website `www.kwm1924.de` und auf Einwilligungen, die nicht mehr zur DSGVO passen, und § 6 enthält eine Widerrufsfrist von zwei Wochen (gesetzlich 14 Tage nach Erhalt und andere Anforderungen an die Belehrung, Muster-Widerrufsformular fehlt). Das gehört in eine juristische Prüfung. Die einzige Änderung am Text ist das Anführungszeichen „neu“ in § 6 (3).
4. **Zahlungsdaten bestätigen.** IBAN, Bank und PayPal-Adresse stehen auf `zahlung` und `besuch`. Bitte bestätigen, ob die QR-Grafik (Stand 2023) noch gültig ist.
5. **Doppelte Pflege.** Telefon, Fax, Zeiten und IBAN stehen mehrfach (Footer, Besuch, Zahlung, Impressum). Später aus einem einzigen Sanity-Dokument speisen.
6. **Fax.** Die Live-Seite nennt ein Fax (0049 201 30 30 31). Bestätigen, ob es weiter betrieben wird.
7. **Datenschutzbeauftragte.** Der alte Text nennt „Frau Claudia Prien“. Bestätigen, ob sie es noch ist (sie steht auch im Team).
8. **Jahresarchiv.** Entscheidung, ob die älteren Plakate und Einladungen (PDFs unter `/fileadmin/…`, heute nicht mehr erreichbar) neu bereitgestellt werden sollen. Wenn ja: liefern.
9. **EN-Bereich**: Entscheidung und Übersetzungsverantwortung (Abschnitt 6).
10. **Werkseiten**: Sollen einzelne Stücke eigene Seiten bekommen oder reicht der Katalog? Wenn ja, brauchen wir je Stück Fotos und Maße (Fotoecke) – siehe Abschnitt 4.

## 8. Offene technische Punkte (nicht Teil dieses Auftrags)

- `src/v3/besuch.html`, Abschnitt Zahlung: die drei Links „Verpackung und Transport“, „AGB“, „Impressum“ zeigen noch auf kwm-1924.de. Umstellen auf `versand.html`, `agb.html`, `impressum.html` (und „Datenschutz“ ergänzen). Das Hauptseiten-Layout blieb auftragsgemäß unberührt.
- `src/v3/aktuelles.html`: Anker `id="jahr-YYYY"` an den Jahres-`<details>` und die Archiv-Links „Alle Angaben zu 2026“ auf die neue Seite statt auf kwm-1924.de umstellen. Danach in `redirects-vorschlag.txt` die Jahreszeilen auf `#jahr-YYYY` setzen.
- Mobil blendet die Textseiten-Navigation das Inhaltsverzeichnis aus (nur die fünf Seitenlinks). Für die AGB (12 Paragrafen) bei Bedarf ein aufklappbares Verzeichnis ergänzen.
- Beim Umzug nach Astro: Textseiten als eine Layout-Komponente `TextPage.astro` mit Slot, Inhalte als Sanity-Portable-Text (Rechtstexte als Dokumenttyp „Rechtstext“ mit Versionsdatum).
