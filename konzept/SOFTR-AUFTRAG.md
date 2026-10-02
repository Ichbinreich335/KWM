# Auftrag für eine lokale Claude-Code-Session: Lager-App in Softr per MCP bauen

**Prototyp-Phase: bauen und testen statt erst lange recherchieren.** Der Agent setzt so viel wie möglich selbst um. Er nutzt dafür:
1. den **Softr-MCP** (`softr` in `.mcp.json`) als Hauptwerkzeug,
2. die **Softr-API**, falls dem MCP etwas fehlt. Der API-Key gehört nur in `.env` als `SOFTR_API_KEY`, nie ins Repo,
3. eine **Softr-CLI**, aber nur, falls Softr offiziell eine anbietet. Das prüft der Agent kurz in der Softr-Doku per MCP.

Was weder MCP noch API können, schreibt der Agent auf und gibt es dem Admin als kurze Klick-Anleitung.

**Prüfung:** Loop aus `CLAUDE.md` (Abschnitt „Selbstprüfung im Loop“). Playwright öffnet die veröffentlichte App-URL und meldet sich als Werkstatt-Nutzer an. Den Testnutzer legt die Session selbst an, der Zugang steht nur in `.env` als `SOFTR_TEST_EMAIL` / `SOFTR_TEST_PASSWORD`. Geprüft wird auch mit einem Admin-Login, ob der Preis nur dort erscheint. Screens nach `konzept/vergleich/softr-*.png`, Bericht nach `konzept/vergleich/SOFTR-BERICHT.md`.

## Voraussetzungen (macht der Admin)
1. Ein kostenloses Konto bei softr.io anlegen.
2. Im Repo-Ordner `claude` starten. Der Softr-MCP ist in `.mcp.json` eingetragen (`https://mcp.softr.io/mcp`). Danach `/mcp` aufrufen, `softr` wählen und sich per OAuth anmelden.
   Alternativ manuell: `claude mcp add --transport http softr https://mcp.softr.io/mcp`
3. **Preis laut externer Prüfung [V]:** Basic kostet 19 $/Monat bei Jahreszahlung, 25 $ monatlich (1 Builder, „5 + 5“ App-Nutzer, 50.000 Datensätze, Backups). **Beim Test klären:** Dateispeicher im Basic-Tarif, 2FA für das Admin-Konto, ob der Export auch die Fotos enthält, ob Workflows eine URL aufrufen können (Website-Neubau), ob geteilte Logins laut AGB erlaubt sind und ob HEIC-Fotos vom iPhone funktionieren.

## Was die Session vom Admin braucht
- **Ein Softr-Konto (Free)**, das du per `/mcp` → `softr` angemeldet hast (OAuth). **Passwörter oder Tokens nie in den Chat schreiben.** Der MCP-Login reicht.
- **Wo die Session läuft:** lokal auf deinem Rechner. In der Cloud blockiert die Netzwerkfreigabe `mcp.softr.io`, sie lässt sich aber in den Umgebungseinstellungen unter „Network access“ freigeben.
- **Namen:** Workspace und App (Vorschlag „KWM“ / „KWM Lager“).
- **Werkstatt-Zugänge:** 2 E-Mail-Adressen dafür (oder vorerst Platzhalter) und deine Admin-Adresse.
- **5–10 echte Fotos** (Fotobox, Handy) für den Test, als Datei. Profi- und Galerie-Fotos ggf. mit Angabe der Fotografin oder des Fotografen.
- **Feldwünsche, falls abweichend** von `test-import/*.csv`, z. B. zusätzliche Typen, Glasuren oder Lagerorte.
- **Testgerät:** welches Gerät die Werkstatt nutzt (iPhone, Android oder Tablet).

## Auftrag an Claude (so einfügen)
> Lies `konzept/UEBERGABE.md` (Abschnitt 0) und `konzept/test-import/*.csv`. Baue mit dem Softr-MCP:
> 1. **Softr-Datenbank** „Keramik-Lager KWM“ mit den Tabellen *Unikate* und *Editionsbestand*, nach dem Aufbau der CSVs. Typ, Status, Zustand und Lagerort als Auswahlfelder mit Farben, dazu ein Datei-Feld *Fotos*. Die CSV-Daten importieren.
> 2. **App** „KWM Lager“ mit den Nutzergruppen **Admin** und **Werkstatt** und genau drei Menüpunkten:
>    - **Erfassen:** schlichtes, robustes Formular („wie ein normales Webformular“). Kamera bzw. Foto-Upload vom Handy, Pflichtfelder, große Eingabefelder.
>    - **Bestand:** saubere Tabelle oder Liste mit Vorschaubild, Reiter bzw. Filter „Alle · Verfügbar · Schalen · Vasen · In Kommission · Edition“, Suche, Detailansicht mit Bearbeiten (Status, Lagerort, Anzahl), CSV-Export.
>    - **Übersicht:** Kennzahlen (verfügbar, reserviert, in Kommission, Rohlinge, glasierte Editionsware) und die zuletzt erfassten Stücke.
> 3. Die Werkstatt sieht nur diese App. Der **interne Preis** ist nur für die Gruppe Admin sichtbar. Login per E-Mail und Passwort bzw. Magic Link, 2 Werkstatt-Zugänge.
> 4. Optik: hell, ruhig, ohne Schnickschnack, deutsche Bezeichnungen.
> Arbeite ohne Rückfragen bis zu einer nutzbaren ersten Version. Liste am Ende auf, was du nicht per MCP konfigurieren konntest.

## Test (Admin, ca. 30 Min.)
- Am Handy und Tablet ein Stück mit Foto erfassen, auch mit dem iPhone-Format HEIC.
- Im Bestand filtern, ein Stück auf „reserviert“ setzen, einen CSV-Export ziehen.
- Mit einem Werkstatt-Zugang prüfen: Ist der Preis unsichtbar? Ist das Login einfach?

## Prompt für den Softr AI Co-Builder (zum Ausprobieren, direkt in Softr einfügen)

> **Kontext:** Baue eine interne Lager-App für eine kleine Keramik-Manufaktur in Deutschland. Die Werkstatt fertigt **Unikate** (Einzelstücke, teils bis 5.000 €) und **Editionsware**. Editionsware wird zuerst als unglasierter **Rohling** getöpfert und auf Lager gelegt. Erst bei einer Kundenbestellung (z. B. „12 Schalen in Grün“) wird sie glasiert und ein zweites Mal gebrannt. Manche Stücke stehen **in Kommission bei Galerien**. Bisher fehlt jeder Überblick über den Bestand. Ziel ist eine schlichte, robuste App, die 4 Mitarbeitende ohne IT-Kenntnisse am Handy, Tablet und Laptop bedienen.
>
> **Sprache und Optik:** Komplett auf Deutsch. Hell, ruhig, viel Weißraum, klare Typografie, keine Spielereien. Große Touch-Flächen und gut lesbare Schrift, mobil zuerst gedacht. Einheitliche Farben für Status-Badges: verfügbar = grün, reserviert = gelb, verkauft = grau, in Kommission = blau.
>
> **Datenbank (Softr Databases):**
> 1. **Unikate:**
>    - Inventarnummer (Text, eindeutig, Format U-JJJJ-NNN, z. B. U-2026-013)
>    - Name (Text, Pflicht)
>    - Typ (Einfachauswahl: Teller, Schale, Becher, Vase, Karaffe, Obertopf)
>    - Künstler:in (Einfachauswahl, erweiterbar)
>    - Jahr (Zahl)
>    - Glasur (Text)
>    - Maße (Text, z. B. „Ø 24 × H 8 cm“)
>    - Fotos (Anhang, mehrere Bilder)
>    - Bildnachweis (Text, z. B. Name der Fotografin oder Galerie)
>    - Status (Einfachauswahl: verfügbar, reserviert, verkauft, in Kommission)
>    - Lagerort (Einfachauswahl: Vitrine Eingang, Regal A – Schauraum, Regal B – Lager, Regal C – Rohware, Lager 2, Galerie)
>    - Galerie (Text, nur relevant bei „in Kommission“)
>    - Preis intern (Währung €)
>    - Auf Website zeigen (Ja/Nein)
>    - Notiz (langer Text)
>    - erfasst am (automatisch), erfasst von (automatisch)
> 2. **Editionsbestand**, eine Zeile pro Modell + Glasur + Zustand:
>    - Modell (Text, z. B. Becher „Salbei“ 300 ml)
>    - Typ (gleiche Auswahl wie oben)
>    - Glasur (Text oder „–“ bei Rohlingen)
>    - Zustand (Einfachauswahl: Rohling, glasiert)
>    - Anzahl (Zahl, ≥ 0)
>    - Lagerort (gleiche Auswahl wie oben)
>    - Foto (Anhang)
>    - Notiz
>    - zuletzt geändert (automatisch)
>
> **Nutzergruppen und Rechte:**
> - **Admin:** sieht und bearbeitet alles, inklusive Preis intern, und verwaltet Nutzer.
> - **Werkstatt:**
>   - erfasst neue Stücke und bearbeitet Status, Lagerort, Galerie, Anzahl, Fotos und Notiz
>   - sieht den **Preis intern nicht**
>   - darf nichts löschen. Statt zu löschen, setzt sie den Status „verkauft“.
>
> Die App ist **nur nach Login** erreichbar (E-Mail und Passwort oder Magic Link). Kein öffentlicher Bereich.
>
> **Genau drei Menüpunkte:**
> 1. **Erfassen**
>    - Oben ein Umschalter: „Unikat“ oder „Editionsware“.
>    - Das Formular soll wie ein ganz normales, einfaches Webformular wirken: ein Feld unter dem anderen, kurze Hilfetexte.
>    - Ganz oben ein großes Foto-Feld. Am Handy öffnet es Kamera oder Galerie, mehrere Bilder sind möglich.
>    - Pflichtfelder für Unikate: Name, Typ, Status, mindestens ein Foto. Für Editionsware: Modell, Zustand, Anzahl.
>    - Nach dem Speichern eine klare Erfolgsmeldung und ein Button „Nächstes Stück erfassen“.
> 2. **Bestand**
>    - Saubere Liste bzw. Tabelle mit kleinem Vorschaubild, Name, Typ, Status-Badge und Lagerort. Am Handy als Karten.
>    - Oben Reiter: **Alle · Verfügbar · Schalen · Vasen · Teller · In Kommission · Editionsware**.
>    - Dazu eine Suche (Name, Inventarnummer) und Filter nach Typ, Status, Lagerort und Künstler:in.
>    - Ein Klick öffnet die **Detailseite**: große Fotos, alle Felder, Button „Bearbeiten“.
>    - Bei Editionsware gibt es auf der Detailseite schnelle **+1 / −1**-Buttons für die Anzahl.
>    - **CSV-Export** der aktuell gefilterten Liste.
> 3. **Übersicht**
>    - Kennzahlen-Kacheln: Unikate verfügbar, reserviert, in Kommission, verkauft (dieses Jahr), Rohlinge gesamt, glasierte Editionsware gesamt.
>    - Darunter: die 10 zuletzt erfassten oder geänderten Stücke mit Foto, außerdem eine Liste „Editionsware mit Anzahl unter 5“.
>
> **Bewusst nicht enthalten:** kein Shop, kein Warenkorb, keine Preise nach außen, keine Buchungshistorie und keine Aufträge (eventuell später). Die Website ist ein separates System. Das Feld „Auf Website zeigen“ ist nur für eine spätere Anbindung gedacht.
>
> **Beispieldaten:** Lege 12 Beispiel-Unikate und 10 Zeilen Editionsbestand mit realistischen Keramik-Namen an (z. B. Mondvase „Seladon“, Schale „Tide“ flach, Becher „Salbei“ 300 ml), damit man die App sofort testen kann.

## Stand nach dem ersten Test des Softr AI Co-Builders (02.10.2026) – Nachbesserungen für die MCP-Session
Der KI-Builder hat ein Grundgerüst angelegt: 3 Menüpunkte, Kacheln mit Foto, Kennzahlen, Formular. Das reicht noch nicht. Am bestehenden Projekt **per MCP weiterarbeiten** oder es neu aufsetzen.

**Fehler bzw. Abweichungen, die beheben werden müssen**
- **Bestand:** Die Seite zeigt eine Kopie der Übersicht (Begrüßung, Kennzahlen). Gebraucht wird eine echte Bestandsliste (siehe unten).
- **Kennzahlen widersprüchlich:** Auf „Bestand“ stehen Rohlinge und Glasiert beide auf 158, auf „Übersicht“ auf 75 bzw. 83. Die Formeln müssen nach Zustand filtern.
- **Inventarnummer** steht als 5, 6, 7 … da. Benötigt wird das Format `U-JJJJ-NNN`, automatisch vergeben (Autonummer plus Formel).
- **Formular:**
  - Zu viele Pflichtfelder. Pflicht sind nur Foto, Name, Typ und Status.
  - Die Checkbox „Please check this box“ braucht die Beschriftung „Auf Website zeigen“ und darf keine Pflicht sein.
  - Maße als einzeiliges Feld.
  - Preis intern ist für die Werkstatt ausgeblendet.
- **Englische Texte** auf Deutsch umstellen (Search, Ask AI, Upload). „Ask AI“ für die Werkstatt ausblenden.
- **Status-Farben** wie vorgegeben: verfügbar = grün, reserviert = gelb, verkauft = grau, in Kommission = blau.
- **Lagerorte und Beispieldaten** an unsere Liste angleichen, mit deutschen Keramik-Namen statt „Modern Line T1“.

**Datenstruktur (Admin pflegt die Stammdaten, damit Filterwerte einheitlich bleiben)**
- `Unikate`, die Haupttabelle, mit Verknüpfungen auf:
  - `Lagerorte` (Name, Bereich)
  - `Künstler:innen` (Name)
  - `Galerien` (Name, Ort, Kontakt)
  - Glasur bleibt Text oder wird optional als eigene Tabelle `Glasuren` angelegt.
- **Typ und Status** bleiben Einfachauswahl.
- `Editionsbestand`: eine Zeile pro Modell + Glasur + Zustand.
  - Optional eine Tabelle `Modelle` (Name, Typ, Maße, Foto), auf die der Bestand verweist.
- **Grundsatz:** Alles, wonach gefiltert werden soll, ist ein **Auswahl- oder Verknüpfungsfeld**, kein freier Text.

**Bestand = flexible Tabelle (neue Kernanforderung)**
- **Vorgefertigte Ansichten** als Reiter: Alle · Verfügbar · Schalen · Vasen · Teller · In Kommission · Editionsware.
- **Freie Filterung** durch die Mitarbeitenden in einer Ansicht „Alle Stücke (Tabelle)“:
  - Filter auf **jedes** Attribut: Typ, Status, Lagerort, Künstler:in, Glasur, Jahr (Bereich), Galerie, Auf Website.
  - **Mehrere Filter kombinierbar**, dazu Suche und Sortierung nach Spalten.
- **Detailseite** zum Bearbeiten und **CSV-Export** der gefilterten Liste.
- **Direkt bauen und dann testen:** Den Bestand mit allen Attributen als Filter umsetzen. Danach als Nutzer der Gruppe Werkstatt (Vorschau-Modus) ausprobieren:
  - Lassen sich mehrere Filter kombinieren?
  - Lassen sich Ansichten speichern?
- **Ergebnis als Kurzbericht festhalten** (funktioniert / funktioniert nicht).
- **Was nicht geht,** über vorgegebene Reiter abfangen.
