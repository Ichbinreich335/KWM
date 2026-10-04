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
