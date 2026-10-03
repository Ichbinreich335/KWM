# Bericht: Lager-App „KWM Lager“ in Baserow nachgebaut

Stand 03.10.2026. Auftrag: `konzept/BASEROW-NACHBAU.md`. Branch `claude/baserow-nachbau`. Kein Urteil „Softr oder Baserow“, das entscheidet der Admin.

## 0. Wichtig vorab: lokal statt Cloud

- **Abweichung vom Auftrag:** Gebaut wurde nicht in Baserow Cloud, sondern in einem **selbst gehosteten Baserow 2.4.0 auf diesem Mac** (Docker über Colima, http://localhost:8090). Gründe: Es gab keine `.env` mit Cloud-Zugang, und der Admin wollte das Ergebnis auf localhost ansehen.
- **Ohne Lizenz entspricht der Funktionsumfang Free.** Bezahlte Funktionen sind im Code an dieselben Lizenzen gebunden wie in der Cloud. Das ist geprüft: Diagramme liefern „402 Funktion nicht verfügbar“.
- **Nicht übertragbar sind Cloud-Grenzen:** 3.000 Zeilen, 2 GB, 2.000 Automations-Credits im Monat. Lokal gibt es diese Grenzen nicht. Den Credit-Verbrauch je Regel-Lauf konnte ich deshalb nicht messen.
- Alles wurde per REST-API gebaut. Die Skripte stehen in `konzept/baserow-nachbau/`, die Anleitung in der README dort. Kein eigener Code in der Oberfläche.

## 1. Funktionen: Softr gegen Baserow

Werte: **geht** / **eingeschränkt** (wie) / **geht nicht**. Die Spalte „bezahlt“ nennt den kleinsten Tarif, der die Lücke schließt (Cloud-Preise siehe Abschnitt 4).

### Erfassen (Screens 01, 02)

| Funktion | Softr (heute) | Baserow Free | Baserow bezahlt |
|---|---|---|---|
| Umschalter Unikat / Editionsware | geht | geht (zwei Knöpfe, Formular per Sichtbarkeitsbedingung) | – |
| Foto aufnehmen in der App | geht | **geht nicht**, Datei-Element fehlt | Advanced |
| Foto über Datenbank-Formular „Neues Unikat“ | – | eingeschränkt: geht am Handy gut, aber nur mit Baserow-Konto oder als öffentlicher Link | – |
| Typ und Status als Knöpfe (Chips) | geht | eingeschränkt: Klappliste. Optionsknöpfe gibt es, haben aber nur 13 px Tippfläche | – |
| „+ Neuer Typ / Neue Glasur / Neue:r Künstler:in“ im Formular | geht | eingeschränkt: Glasur und Künstler:in unter Stammdaten anlegen, neuen Typ nur in der Datenbank | – |
| Pflichtfelder, Prüfung, Platzhalter | geht | geht | – |
| Glasur mehrfach | geht | geht | – |
| Anzahl mit − / + | geht | eingeschränkt: Zahlenfeld | – |
| Jahr vorbelegt, „Erfasst von“ automatisch | geht | geht | – |
| Inventarnummer U-JJJJ-NNN automatisch | geht | geht (Formel auf Autonummer) | – |
| Bezeichnung der Editionsware automatisch | geht (App-Code) | geht, robuster: Formel im Primärfeld | – |
| Rückmeldung nach dem Speichern | geht | geht (Hinweisfenster) | – |

### Bestand (Screens 10–14)

| Funktion | Softr (heute) | Baserow Free | Baserow bezahlt |
|---|---|---|---|
| Reiter Im Haus / Außer Haus / Verkauft / Alle / Editionsware mit Anzahl | geht | geht | – |
| Liste mit Vorschaubild | geht | eingeschränkt: Bilder füllen in App-Tabellen die ganze Spaltenbreite. Deshalb kein Bild in der Liste, nur auf der Detailseite. Die Galerie-Ansicht der Datenbank zeigt Bilder, aber nur für Baserow-Konten | – |
| Suche, Typ-Filter, Sortierung | geht | geht (Knöpfe „Filter“, „Sortieren“, Suche über der Tabelle) | – |
| Statusfarben | geht | geht | – |
| Stück-Fenster (Modal) | geht | eingeschränkt: eigene Seite statt Fenster | – |
| Schnell ändern: Status, Lagerort, Partner, Rückgabe | geht | geht (im Test bestanden) | – |
| Alle Felder bearbeiten | geht | geht | – |
| CSV-Export | geht | **geht nicht in der App.** In der Datenbank-Ansicht geht er selbst gehostet frei. Die Cloud-Preisseite nennt „CSV export“ erst ab Premium (in der Cloud ungeprüft) | Premium (Cloud) |

### Tabelle (Screens 20, 21)

| Funktion | Softr (heute) | Baserow Free | Baserow bezahlt |
|---|---|---|---|
| Unikate und Editionsware in einer Tabelle | geht | **geht nicht**: eine Datenquelle je Tabelle, deshalb nur Unikate | – |
| Freie Filter, Sortierung, Suche | geht | geht | – |
| Spaltenwahl durch Nutzer | geht | geht nicht in der App (in der Datenbank-Ansicht ja) | – |
| Gespeicherte Ansichten | geht | geht nicht in der App (in der Datenbank ja, für Baserow-Konten) | persönliche Ansichten: Advanced |
| Summenzeile | geht | geht nicht in der App (im Datenbank-Grid „Zusammenfassen“ ja) | – |
| Spaltenbreiten | geht | geht nicht, die Inventarnummer bricht um | – |

### Übersicht (Screen 30, dazu 31)

| Funktion | Softr (heute) | Baserow Free | Baserow bezahlt |
|---|---|---|---|
| Kennzahl-Kacheln (Verfügbar und Wert, Reserviert, Außer Haus, Verkauft und Umsatz, Editionsware und Rohlinge) | geht | geht (Datenquellen „Zählen“ und „Summe“) | – |
| Dashboard mit Kennzahl-Kacheln (eigene Baserow-Funktion) | – | **geht** (Widget „summary“ ist frei, entgegen der Preisseite), aber nur für Baserow-Konten | – |
| Außer Haus nach Partner, mit Anzahl je Partner | geht | eingeschränkt: Liste sortiert nach Partner, ohne Summe je Partner | gruppierte Kennzahlen: Advanced |
| Hinweis „überfällig“ | geht | geht | – |
| Diagramme nach Typ und je Modell | geht | **geht nicht** | App: Advanced, Dashboard: Premium |
| Zuletzt erfasst oder geändert | geht | geht | – |
| Nachschub nötig (unter 5 Stück) | geht | geht. Leerer Zustand mit festem Baserow-Text „Es wurden keine Elemente gefunden.“, dazu ein Erklärtext | – |

### Stammdaten (Screens 40–44)

| Funktion | Softr (heute) | Baserow Free | Baserow bezahlt |
|---|---|---|---|
| Reiter je Liste | geht (mit Anzahl) | geht (ohne Anzahl) | – |
| Neu anlegen | geht | geht | – |
| Bearbeiten | geht | geht (eigene Seite je Liste) | – |
| „zurzeit bei X Unikaten“ | geht | eingeschränkt: ginge mit Rückverweis- und Zählfeld in der Datenbank, nicht eingerichtet | – |
| „Außer Haus“ gegen Umbenennen geschützt | geht (App-Code) | geht nicht, nur ein Hinweis. Unkritisch, weil die Regeln die ID nutzen und nicht den Namen | Feldrechte: Advanced |

### Allgemein

| Funktion | Softr (heute) | Baserow Free | Baserow bezahlt |
|---|---|---|---|
| Login mit 2 Konten (Admin, Werkstatt) | geht | geht (Tabelle „App-Nutzer“) | – |
| Beide dürfen alles ändern | geht | geht | – |
| Menü, am Handy als Burger-Menü | geht | geht | – |
| Handy ohne seitliches Scrollen | geht | geht in der App. Die Datenbank-Oberfläche scrollt am Handy seitlich | – |
| Tippflächen ab 44 px | geht | eingeschränkt: Knöpfe und Felder 44 px (Theme), Kontrollkästchen 13 px | – |
| Datum deutsch (TT.MM.JJJJ) | geht | eingeschränkt: Texte per Formel deutsch, Datumsfelder als TT/MM/JJJJ | – |
| Theme Petrol #2F5D62 | geht | geht | – |
| Hinweis „Made with …“ | „Made with Softr“ | „Made with Baserow“ | entfernen: Advanced |
| Veröffentlichen unter eigener Adresse | geht | nicht geprüft (Veröffentlichen war nicht freigegeben) | – |

## 2. Die 4 Regeln (Automation „Status-Regeln“)

Ein Workflow, nur fertige Bausteine: Auslöser „Feld Status geändert“, Schleife über die geänderten Zeilen, „Zeile lesen“, Verteiler mit 4 Zweigen, „Zeile ändern“. Test an Karaffe „Eisenquelle“, danach zurückgesetzt (`02-regeln-test.mjs`). Zusätzlich lief der Weg durch die App: Erfassen, dann im Stück „in Kommission“ wählen, Automation setzt den Lagerort (`04-app-test.mjs`).

| Regel | Ergebnis |
|---|---|
| „in Kommission“ / „ausgestellt“ setzt Lagerort „Außer Haus“ | **geht** |
| „Außer Haus seit“ = heute, wenn leer (ein gesetztes Datum bleibt) | **geht** |
| „verfügbar“ / „reserviert“ leert Lagerort, Partner, Außer Haus seit, Rückgabe bis | **geht** |
| „verkauft“ setzt „Verkauft am“ = heute, wenn leer | **geht** |

Hinweise:
- „heute“ rechnet in der Zeitzone des Servers (UTC). Zwischen 0 und 2 Uhr nachts entsteht deshalb das Datum vom Vortag. Softr hat dieselbe Eigenheit.
- Die Regeln laufen in der Datenbank, also bei jeder Änderung, egal ob aus App, Formular oder Grid. Sie reagieren nur auf das Feld Status und lösen sich dadurch nicht selbst erneut aus.
- Im Editor erscheinen die Bedingungen ohne Klammern (`A || B && C`). Gemeint ist `(A oder B) und C`. Wer sie ändert, sollte das wissen.

## 3. Website-Schnittstelle (nur geprüft, `05-website-pruefung.mjs`)

1. **Datenbank-Token nur lesen und auf eine Tabelle beschränkt?** **Ja.** Getestet: Unikate lesen 200, Partner lesen 401, Unikat ändern 401. Der Test-Token ist wieder gelöscht.
2. **Liefert eine Ansicht mit ausgeblendeten Feldern über die API nur die sichtbaren Felder?** **Nein.** `view_id` wendet nur den Filter an (7 Stücke mit „Auf Website zeigen“), liefert aber alle Felder inklusive „Preis intern“ und „Lagerort“. Erst `include=Name,…` begrenzt die Felder, und das bestimmt der Abrufende selbst. **Wer den Token hat, kann den Preis lesen.** Sauber trennen ließe sich das mit Feldrechten (Advanced), mit einer eigenen Tabelle nur für Website-Felder oder mit einem kleinen Worker, der filtert. Die Ansicht „Website“ ist angelegt, aber nicht öffentlich.
3. **Webhook bei Änderung von „Auf Website zeigen“ oder Status?** **Ja.** Ein Webhook mit Feldfilter (nur diese zwei Felder) und den Ereignissen „erstellt“ und „gelöscht“ ließ sich anlegen. Er ist deaktiviert und zeigt auf einen Platzhalter. Alternativ ginge ein HTTP-Aufruf aus einer Automation.
4. **Laufen Datei-URLs ab?** **Nein.** Lokal sind es feste Links ohne Signatur, ohne Anmeldung abrufbar. Laut Baserow ist das Ablaufen in der Cloud bewusst nicht eingeschaltet ([Secure File Serving](https://baserow.io/docs/installation/secure-file-serve)). Der Build könnte die Bilder also direkt verlinken. Kehrseite: **Wer den Link kennt, sieht das Foto.** Für Website-Fotos ist das unkritisch.

## 4. Kosten (Baserow Cloud, Preisseite am 03.10.2026)

| Tarif | Preis | 2 Logins, beide als Baserow-Konto | Admin als Konto, Werkstatt nur App-Nutzer |
|---|---|---|---|
| Free | 0 $ | 0 $ | 0 $ |
| Premium | 10 $ je Nutzer und Monat (jährlich), 12 $ monatlich | 20 $/Monat | 10 $/Monat |
| Advanced | 18 $ je Nutzer und Monat (jährlich), 22 $ monatlich | 36 $/Monat | 18 $/Monat |

- **Zählen App-Builder-Nutzer als zahlende Nutzer?** Nein. Laut Preisseite sind „500 external app users“ in Free, Premium und Advanced enthalten. Bezahlt werden Workspace-Mitglieder.
- Nicht geprüft: Mindestzahl an Plätzen in bezahlten Tarifen, Preise der Selbst-Hosting-Lizenzen (die Preisseite nennt sie nicht).

## 5. Was Free fehlt, damit die Werkstatt mit Foto vom Handy arbeitet

- **Das Datei-Element im App Builder** (ab Advanced). Ohne es kann die App keine Fotos hochladen.
- Wege in Free:
  - **a) Die Werkstatt bekommt ein eigenes Baserow-Konto** und nutzt am Handy das Formular „Neues Unikat“ (Foto-Upload geht, Screen 03c-m). Nachteil: Die Werkstatt sieht dann auch die ganze Datenbank-Oberfläche, die am Handy unhandlich ist. Rechte für einzelne Felder gibt es erst ab Advanced. Laut Auftrag darf die Werkstatt aber ohnehin alles ändern.
  - **b) Das Formular öffentlich teilen.** Dann kann jede Person mit dem Link Stücke anlegen. Nicht empfohlen. Ob Free einen Passwortschutz erlaubt, ist ungeprüft.
- Die App verlinkt bereits auf das Formular (Knopf „Foto-Formular öffnen“ beim Erfassen).

## 6. Blocker und was der Admin tun muss

- **Ansehen:** http://localhost:8090, Zugang in `/Users/marc/Documents/GitHub/KWM-baserow/.env`. Die App läuft über „Anwendungen“, „KWM Lager“, „Vorschau“ mit dem Werkstatt-Konto. Nach einem Neustart des Macs einmal `colima start` ausführen.
- **Cloud-Gegenprobe (falls Baserow in Frage kommt):** Cloud-Konto anlegen, den Workspace exportieren und dort importieren. Danach prüfen: CSV-Export in Free, Veröffentlichen der App in Free, Credit-Verbrauch der Regeln.
- **Nicht gemacht, weil Freigabe nötig:** App veröffentlichen, Formular öffentlich teilen, Webhook einschalten.
- **Testspuren:** Der App-Funktionstest hat ein Prüfstück angelegt und wieder gelöscht. Die Autonummer steht deshalb bei 13, und das nächste echte Stück bekommt **U-2026-014**. In der Softr-Datenbank waren 13 und 14 ebenfalls Testzeilen.
- **Robustheit für „jahrelang“:** Die Baserow-API hat drei Stellen, an denen Elemente erst leer angelegt und dann nachgetragen werden müssen (README). Die Oberfläche im Editor ist davon nicht betroffen. Selbst gehostet bräuchte die Datenbank eigene Backups (Docker-Volume `kwm_baserow_data`).

## Screens

Alle in `konzept/vergleich/`, jeweils `-d` (1440 px) und `-m` (390 px), Browser-Konsole ohne Fehler, kein seitliches Scrollen in der App:

- `baserow-nachbau-01-datenbank.png`, `-01b-editionsbestand.png`: Datenbank
- `baserow-nachbau-02-regeln.png`: Automation
- `baserow-nachbau-03a` bis `03e`: Datenbank-Ansichten und Formulare. Die Galerie am Handy scrollt seitlich, das ist die Datenbank-Oberfläche
- `baserow-nachbau-00` bis `44`: App, gleiche Nummern wie `softr-v4/`
- `baserow-nachbau-31-dashboard-free-*.png`: Dashboard mit Kennzahl-Kacheln. Am Handy scrollt es leicht seitlich (415 px), auch das ist Datenbank-Oberfläche
