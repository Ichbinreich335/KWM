# Auftrag für eine lokale Claude-Code-Session: Lager-App in Softr per MCP bauen

## Voraussetzungen (macht der Admin)
1. Ein kostenloses Konto bei softr.io anlegen.
2. Im Repo-Ordner `claude` starten. Der Softr-MCP ist in `.mcp.json` eingetragen (`https://mcp.softr.io/mcp`). Danach `/mcp` aufrufen, `softr` wählen und sich per OAuth anmelden.
   Alternativ manuell: `claude mcp add --transport http softr https://mcp.softr.io/mcp`
3. **Preis laut externer Prüfung [V]:** Basic kostet 19 $/Monat bei Jahreszahlung, 25 $ monatlich (1 Builder, „5 + 5“ App-Nutzer, 50.000 Datensätze, Backups). **Beim Test klären:** Dateispeicher im Basic-Tarif, 2FA für das Admin-Konto, ob der Export auch die Fotos enthält, ob Workflows eine URL aufrufen können (Website-Neubau), ob geteilte Logins laut AGB erlaubt sind und ob HEIC-Fotos vom iPhone funktionieren.

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
