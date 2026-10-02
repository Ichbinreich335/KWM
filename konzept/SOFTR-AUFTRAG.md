# Auftrag für eine lokale Claude-Code-Session: Lager-App in Softr per MCP bauen

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
