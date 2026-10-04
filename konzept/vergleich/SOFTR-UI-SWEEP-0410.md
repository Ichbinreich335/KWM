# Bericht UI-Sweep Softr-Lager (04.10.2026)

Grundlage: Feedback des Admins zu den Screens vom 04.10. und der Skill `impeccable` (Modus „Operate“: bekannte Muster, Einheitlichkeit vor Effekt). Code in `konzept/softr/src/`, hochgeladen per Softr-MCP, alle fünf Blöcke per SHA-256 gegen `konzept/softr/blocks/` geprüft.

## Erledigt

**Gestaltungssystem (`src/shared/`)**
- Radien: Bedienelemente (Feld, Knopf, Auswahl, Badge, Suchfeld) `rounded-md`, Flächen (Liste, Bereich, Fenster) `rounded-lg`. Keine Pillen mehr.
- Drei klar getrennte Bauteile statt einer Pille für alles: `Segmented` (Ansicht wechseln), `Tabs` (Bereiche, unterstrichen), `Chip` (Auswahl im Formular, gewählt immer Hauptfarbe mit Haken).
- Farben: eine Quelle in `konstanten.ts`. Status mit Farbpunkt, Zustand der Editionsware (Rohling, glasiert) neutral. Die Hex-Farben der alten Balkendiagramme sind weg.
- Schriftgröße in Feldern: `FIELD_CLASS` hebt das `md:text-sm` der shadcn-Felder auf. Eingaben und Auswahllisten schreiben gleich groß.
- Leere Zustände ohne gestrichelten Rahmen. „+ Neu“ als Textknopf.

**Seiten**
- Übersicht: Kacheln bleiben (5 in einer Reihe ab Tablet, am Handy 2 + 2 + 1 breit). Balkendiagramme durch Zähltabellen ersetzt („Unikate nach Typ“, „Editionsware je Modell“ mit Knapp-Hinweis). Zeilen verlinken in den Bestand. „Verkauft“ zeigt fehlende Preise und Verkaufsdaten als Hinweis statt „0 €“.
- Bestand: oben Unikate | Editionsware, darunter Status (Im Haus, Außer Haus, Verkauft, Alle). Neuer Filter Künstler:in. Links aus der Übersicht mit `?typ=`, `?q=`, `?tab=edition`.
- Erfassen: linksbündig wie die anderen Seiten, breiter (max-w-3xl). Abschnitt „Weitere Angaben“ trennt Pflicht und Optionales. Glasur als durchsuchbare Auswahl, fehlende Glasur direkt aus dem Suchfeld anlegen.
- Stammdaten: Archivieren und Wiederherstellen für alle fünf Listen. Löschen nur, wenn nichts darauf verweist, mit Bestätigung. Archivierte stehen eingeklappt unter der Liste und fehlen in den Auswahllisten von Erfassen und Bestand. Lagerort „Außer Haus“ bleibt geschützt.
- Tabelle: mehr Abstand nach Zahlenspalten, Bildspalte nur, wenn Fotos da sind, Preissumme ohne verkaufte Stücke (außer bei reinem Verkauft-Filter).

**Datenbank (additiv)**
- Neues Feld „Archiviert“ (Checkbox) in Künstler:innen `TOhYe`, Glasuren `jxxXN`, Modelle `3tlrw`, Partner `24Tn9`, Lagerorte `kMBsy`.
- Erfassen und Bestand lesen die Stammdaten-Tabellen jetzt direkt (neue Datenquellen am Block), damit Archivierte wegfallen.
- Aktionsrechte nach jedem Hochladen neu gesetzt: alle ADD auf „angemeldete Nutzer“. DELETE in Stammdaten steht auf „angemeldete Nutzer“ (Standard).

## Offen und Blocker

1. **Playwright-Prüfung nicht gelaufen.** Die Netzwerk-Regel dieser Cloud-Session sperrt `*.softr.app` (403 am Proxy), auch nach der Freigabe in der Umgebung. Vermutlich greift sie erst in einer neuen Session. Prüfskript liegt bereit: `PW_CHROMIUM=/opt/pw-browsers/chromium PREVIEW_URL='…' node konzept/softr/pruefung/screens-v5.mjs`.
2. **Alte Diagramm-Blöcke auf der Übersicht** (`chart2`, `column-container2` mit `chart4`, `chart5`): fertige Softr-Charts mit Zahlen, die den Kacheln widersprechen (Reserviert 2 statt 1, Rohlinge 75 statt 122). Löschen braucht das OK des Admins.
3. **Testdaten:** „Test-Schale“ und „Test-Krug „Playwright““ (U-2026-013/014). Der Test-Krug steht verkauft mit Lagerort „Außer Haus“. Die Korrektur per MCP wurde von der Rechteprüfung der Session abgelehnt. Vorschlag: beide Testdatensätze löschen (OK nötig).
4. Aufräumen nach OK: Block `bestand-admin` (außer Betrieb), Seiten `/old-home`, `/stueck`, `/alle-stuecke`.

## Was der Admin tun muss

- Vorschau öffnen und Übersicht, Bestand, Erfassen, Stammdaten am Handy und am Rechner ansehen. Oder eine neue Session starten, dann läuft die Playwright-Runde.
- OK für Punkt 2 bis 4 oben.

## Runde 2 nach Feedback des Admins (04.10.)

- **Ein Umschalter:** Erfassen und Bestand nutzen dieselben unterstrichenen Reiter wie Stammdaten. Die grauen Segment-Knöpfe sind entfernt.
- **Bestand:** eine Filterzeile statt zwei Knopfreihen. Status (Im Haus, Außer Haus, Verkauft, Alle Stücke) und bei Editionsware der Zustand sind Auswahllisten neben Suche, Typ, Künstler:in und Sortierung.
- **Statusfarben im Knopf:** Der gewählte Status trägt wieder seine Farbe. Die Farbpunkte in Knöpfen und Badges sind entfernt.
- **Glasur-Auswahl:** Antippen ändert die Reihenfolge nicht mehr. Die Suche blendet nur aus.
- **Erfassen:** volle Seitenbreite wie die anderen Seiten. Am Desktop zwei Spalten (Pflichtangaben | Weitere Angaben), am Handy untereinander.
- **Aufgeräumt (OK des Admins):** Testdatensätze U-2026-013 und U-2026-014 sowie der Block „Bestand – Admin-Bearbeitung“ gelöscht. Seiten `/old-home`, `/stueck`, `/alle-stuecke` und die Standard-Diagramme unter der Übersicht lassen sich per MCP nicht löschen, das geht nur in Studio.
- **Offen für das Kundengespräch:** Wie Preise gepflegt werden. Ob Rohlinge erfasst werden und ob die Übersicht „in Arbeit“ bzw. „diese Woche neu“ zeigen soll.

## Runde 3 nach Feedback des Admins (04.10.)

- **Softr-Tabelle gegen eigene Tabelle:** Bei 200 bis 500 Unikaten und kombinierten Filtern bleibt die eigene Tabelle. Softrs Tabelle kann nur „Feld ist Wert“ filtern, keine leeren Felder, Datums- oder Zahlenbereiche, und keine gemeinsame Liste.
- **Tabelle überarbeitet nach Vorbild der Softr-Tabelle:** Kopf mit Suche rechts, Reiter Alle | Unikate | Editionsware, Schnellfilter-Knöpfe je Feld, „Weitere Filter“ für Bedingungen, fertige shadcn-Bausteine `Table` und `Badge`, Seiten zu je 50 Einträgen. Spalten der anderen Art fallen im jeweiligen Reiter weg.
- **Erfassen:** Fehler behoben, durch den ab 101 Editionszeilen doppelte Zeilen entstanden wären.
- **Modelle:** Artikelnr. und VK-Preis (aus der Preisliste der Werkstatt) als Felder, in Stammdaten pflegbar, in der Tabelle sichtbar. Summe der Editionsware = Anzahl × VK-Preis.
- **Typ „Übertopf“** statt „Obertopf“.
- **Prüfung:** Typprüfung grün. Lokaler Render-Test mit Testdaten (153 Einträge, Seiten, Reiter, Filter, Zurücksetzen, Stammdaten-Dialog, Erfassen) ohne Fehler. Die Prüfung in der echten Vorschau steht weiter aus (Netzsperre `*.softr.app`).

## Runde 4: Katalog der Werkstatt und Robustheit (04.10.)

- **Katalog:** 81 Artikel aus den Anfrageformularen (Editionen 2001 ff., Manufakturprogramm 1 ff.) mit Nummer, deutschem und englischem Namen, Typ, Programm und Glasuren. VK-Preise der Editionen aus der gedruckten Preisliste.
- **Erfassen:** Modell nach Nummer und Programm gruppiert. Glasur aus dem Modell, bei Geschirr Wahl aus den 6 Glasuren.
- **Bestand:** Status-Knöpfe mit Zahl wie früher, auf Wunsch des Admins. Editionsware mit Zustand-Knöpfen und Programm.
- **Datenstand sicher:** Alle Mengenänderungen rechnen auf dem frisch geladenen Server-Wert (zwei Geräte gleichzeitig). Keine doppelten Editionszeilen. Löschen in Stammdaten prüft frisch, ob etwas darauf verweist. Artikelnummern sind eindeutig.
- **Prüfung:** Typprüfung grün. Lokaler Render-Test mit Katalogdaten: Gruppen und Sortierung, feste Glasur, Pflichtglasur, Weiterzählen bei geändertem Server-Wert (12 + 1 = 13), Rückgängig, Löschschutz in beiden Richtungen. Prüfung in der echten Vorschau weiter offen (Netzsperre).

## Runde 5: Export, Kacheln, Inventur, Sicherung (04.10.)

- **Exportieren** statt „CSV“ in Tabelle und Bestand: Menü mit „Excel (CSV-Datei)“ und „PDF / Drucken“. Die Druckansicht übernimmt sichtbare Spalten, Filter (als Untertitel) und Summen. Ist genau ein Partner gefiltert, heißt sie „Liste ‹Partner›“ (Kommissionsliste). Softr selbst kann keinen PDF-Export, nur über die Fremd-Integration DocsAutomator im Workflow (kostet Aktionen).
- **Kacheln oder Liste** im Bestand (Unikate): Umschalter rechts neben den Status-Knöpfen. Am Handy Standard Kacheln, am Rechner Liste, die Wahl merkt sich das Gerät. Kachel mit Hauptbild, Status, Fotoanzahl bei mehreren Fotos.
- **Hauptbild:** Das erste Foto ist das Hauptbild. In der Detailansicht „Als Hauptbild verwenden“. Neue Fotos werden hinten angehängt, das Hauptbild bleibt.
- **Inventur** (Editionsware): Knopf neben dem Programm-Filter, nur für Bearbeitungsberechtigte. Gezählte Menge je Posten, gruppiert nach Lagerort, Abweichungen sofort sichtbar. Zahlen bleiben bis zur Übernahme auf dem Gerät. Übernommen wird gesammelt nach Bestätigung, und nur, wo sich der Bestand seit dem Zählen nicht geändert hat.
- **Datenpflege** (Übersicht, eingeklappt unten): Unikate ohne Foto oder Preis, Außer Haus ohne Partner, Editionsposten mit 0 Stück, Modelle ohne VK-Preis. Jeder Eintrag verlinkt.
- **Speicherstand** (Stammdaten, unten): „Datenbank: X von 1.000 Einträgen (Free-Plan)“, ab 80 % gelb. Die 1.000 sind eine vorsichtige Annahme, Softr nennt die Free-Grenze nicht eindeutig.
- **Zähler „Verwendungen“ in der Datenbank: nicht umgesetzt.** Die Verknüpfungen von Unikaten und Editionsware zu Künstler:innen, Glasuren, Lagerorten und Partnern haben keinen Rückverweis, und Softr kann ihn nachträglich nicht anlegen. Der Löschschutz in Stammdaten zählt deshalb weiter frisch beim Löschen.
- **Nächtliche Sicherung** nach Cloudflare R2: `konzept/softr/sicherung/` und `.github/workflows/softr-sicherung.yml`, Wiederherstellung per Knopf in GitHub Actions (`softr-wiederherstellung.yml`, ohne Haken nur Anzeige). Gegen eine Test-API und lokalen S3-Speicher geprüft: Sicherung, Foto-Entdopplung, Vergleich und Zurückschreiben nur der Unterschiede.
- **Handy-App (PWA):** In Softr eingeschaltet. App-Icon liegt in `konzept/softr/app-icon/icon-512.png`.
- **Prüfung:** Typprüfung grün. Lokaler Render-Test: Kacheln am Handy und Liste am Rechner, Druckansicht mit Titel, Untertitel und Summen, Inventur-Übernahme mit Konfliktfall, Datenpflege, Speicherstand. Hochgeladene Blöcke per SHA-256 mit dem Repo abgeglichen. Prüfung in der echten Vorschau weiter offen (Netzsperre `*.softr.app`).

### Was der Admin tun muss (Runde 5)

1. **R2 und Secrets einrichten:** Schritte in `konzept/softr/sicherung/README.md`. Danach einmal *Softr-Sicherung → Run workflow*. Nächtlich läuft es erst, wenn der Branch im Hauptbranch ist.
2. **App-Icon hochladen:** Softr Studio → Settings → Mobile app (PWA) → Icon → `icon-512.png`.
3. **Vorschau ansehen:** Bestand am Handy (Kacheln), Inventur, Exportieren → PDF, Übersicht → Datenpflege.

## Runde 6: Handy-Ansicht entschlackt (04.10.)

- **Grundsatz:** Am Handy wird erfasst und im Bestand nachgesehen. Tabelle, Export und Spalten sind Rechner-Werkzeuge. Am Handy sieht man deshalb weniger Bedienelemente und mehr Inhalt. Am Rechner bleibt alles wie bisher.
- **Bestand am Handy:** Die Status- bzw. Zustand-Knöpfe stehen in einer Zeile zum seitlichen Wischen statt in 2–3 Reihen. Darunter Suche und ein Filter-Knopf mit Zahl der aktiven Filter. Der Knopf öffnet ein Blatt von unten mit Typ, Künstler:in und Sortierung (bei Editionsware: Programm), als native Auswahllisten des Telefons. Tabelle-Link und Export sind am Handy ausgeblendet, Inventur steht oben im Kopf. Statt 7 Reihen Bedienelemente sind es 4.
- **Auswahllisten:** Einfachauswahl aus Listen bleibt die native Auswahl des Telefons (iOS-Rad). Sie ist bekannt, groß und barrierefrei. Eigene Aufklapp-Menüs gibt es nur, wo mehrere Werte gewählt werden (Schnellfilter der Tabelle).
- **Erfassen am Handy:** Speichern klebt unten über der Navigationsleiste und ist nach den Pflichtangaben ohne Scrollen erreichbar. Die Knöpfe für Typ und Status bleiben sichtbar (ein Tipp statt zwei).
- **Tabelle am Handy:** Die Schnellfilter stehen in einer Wischzeile. Gespeicherte Ansichten und Speichern teilen sich eine Zeile, Export ist nur ein Symbol neben der Suche.
- **Inventur-Leiste:** Sie klebt jetzt über Softrs Navigationsleiste und wird nicht mehr von ihr verdeckt.
- **Prüfung:** Typprüfung grün. Lokaler Render-Test am Handy (Filter-Knopf, Blatt mit drei Auswahllisten, Zahl am Knopf, Zurücksetzen, Inventur im Kopf) und am Rechner (Auswahllisten in der Zeile, kein Filter-Knopf). Prüfsummen der hochgeladenen Blöcke stimmen. Die echte Vorschau ist von hier aus weiter gesperrt.

## Runde 7: Politur und neue Übersicht (04.10.)

- **Auswahlknöpfe** (Typ, Status, Zustand): Raster mit gleich breiten Knöpfen statt unterschiedlich langer Reihen. Am Handy 3 Spalten, bei langen Beschriftungen 2. Gewählt heißt gefüllt. Der Haken ist weg, deshalb springt beim Antippen nichts mehr.
- **Linien** eine Stufe kräftiger (`border-neutral-300`, Konstante `LINE`) für Felder, Auswahllisten, Knöpfe und Chips. Flächen bleiben hell.
- **Kein Kasten im Kasten:** Gruppen innerhalb eines Fensters sind getönt statt umrandet (`INSET_CLASS`), z. B. „Schnell ändern“ im Stück-Fenster und „Weitere Filter“ in der Tabelle.
- **Erfassen am Handy:** „Weitere Angaben“ ist eingeklappt („Optional: Künstler:in, Glasur, Maße, Preis …“). Pflichtangaben und Speichern passen auf einen Bildschirm. Speichern sitzt rund 12 px über der Navigationsleiste.
- **Übersicht neu:**
  - Kennzahlen in einem Band statt fünf Kästen: Im Haus (davon reserviert, Wert), Außer Haus, Verkauft im Jahr (Umsatz), Editionsware (davon Rohlinge, Wert glasiert aus VK-Preis). Jede Zahl führt in den passenden Bestand.
  - **Zu erledigen**, dringendstes zuerst: überfällige Rückgaben (rot, mit Partner), Rückgaben in 14 Tagen, Editionsposten unter 5 Stück, Verkäufe ohne Datum oder Preis. Die Datenpflege ist die letzte Zeile und klappt auf. Ist nichts offen, steht dort eine ruhige Bestätigung.
  - **Zuletzt bearbeitet** als Bildleiste, am Handy zum Wischen.
  - Außer Haus kompakter (Frist ohne Jahr). „Als Tabelle“ gibt es nur am Rechner.
  - Editionsware je Modell zeigt 8 Modelle und lässt sich aufklappen. Bei 81 Katalogartikeln wäre die Liste sonst sehr lang.
- **Sichtprüfung:** Nachbildung mit echtem Tailwind und shadcn-Stilen in Chromium, 390 px und 1440 px, mit Testfotos aus `keramik/`. Kein horizontales Scrollen, keine Konsolenfehler. Screens unter `konzept/vergleich/runde7/`. Die echte Softr-Vorschau ist von hier aus gesperrt. Schriften und Theme-Farben können dort leicht abweichen.
