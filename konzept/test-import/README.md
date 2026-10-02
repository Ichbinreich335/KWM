# Test-Import für Baserow Cloud und Softr

Zwei CSV-Dateien, die du in beide Tools importieren kannst. Dann vergleichst du mit denselben Daten.

- `unikate.csv`: 12 Einzelstücke mit Typ, Status, Lagerort und internem Preis
- `editionsbestand.csv`: Editionsware als Zeilen nach Modell, Glasur und Zustand (Rohling oder glasiert) mit Anzahl. Ohne Buchungsjournal, weil das vorerst nicht nötig ist.

## Baserow Cloud (baserow.io, kostenloses Konto)
1. Datenbank anlegen, dann **„Tabelle erstellen → Datei importieren“** und `unikate.csv` wählen. Für `editionsbestand.csv` genauso.
2. Spalten „Typ“, „Status“, „Zustand“ und „Lagerort“ in den Typ **Einfachauswahl** umwandeln: Spaltenkopf, dann „Feld bearbeiten“. Danach sind sie farbig.
3. Spalte „Fotos“ (Typ Datei) hinzufügen und für 3–5 Stücke echte Fotobox-Bilder hochladen.
4. Ansicht **Galerie** anlegen (Titelbild = Fotos) und Ansicht **Formular** („Neues Stück erfassen“).
5. Auf Handy oder Tablet öffnen und ein Stück mit Kamera-Foto über das Formular erfassen.

## Softr (softr.io, kostenloses Konto)
1. **Softr Databases**: neue Datenbank anlegen, dann beide CSVs importieren. Auswahlfelder wie bei Baserow umstellen.
2. **Neue App** aus der Datenbank erzeugen, z. B. mit einer Vorlage für Inventar oder Katalog: Liste oder Kacheln der Unikate, Detailseite, Formular „Neues Stück“.
3. Fotos für 3–5 Stücke hochladen, App auf dem Handy öffnen und ein Stück erfassen.

## Worauf achten
- **Bedienung:** Finden die Mitarbeitenden sich ohne Erklärung zurecht?
- **Fotos vom Handy:** Funktioniert das Hochladen mit dem iPhone (Format HEIC)?
- **Optik:** Wirkt es so „schön“ wie erwartet, also Galerie, Kacheln, Formular?
- **Filter:** Wie schnell lässt sich „Schalen, verfügbar“ zeigen?
- **Login:** Wie einfach ist der Login? Wie werden 2 Werkstatt-Zugänge angelegt? Erlauben die AGB geteilte Zugänge?
