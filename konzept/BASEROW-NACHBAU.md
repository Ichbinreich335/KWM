# Auftrag: Lager-App „KWM Lager“ in Baserow nachbauen

Für einen Agenten (Sonnet). Stand 03.10.2026. Ersetzt `konzept/BASEROW-AUFTRAG.md`. Arbeite die Schritte **der Reihe nach** ab und hake jedes Abnahmekriterium ab, bevor du weitergehst. Bei Unklarheit gilt: aufschreiben und zum nächsten Schritt, nicht raten.

## 0. Arbeitsort (zuerst)

- Die Vorlagen liegen auf dem Branch `claude/softr-lager-app`. Im Hauptordner `KWM` arbeitet oft eine andere Session auf `design-v2`. Dort nichts ändern und nicht den Branch wechseln.
- Eigenen Worktree anlegen:
  `git -C /Users/marc/Documents/GitHub/KWM worktree add ../KWM-baserow -b claude/baserow-nachbau origin/claude/softr-lager-app`
- Nur in `../KWM-baserow` arbeiten. Commits und Pushes nur auf `claude/baserow-nachbau`. Nicht mergen.
- Lies vorher: `CLAUDE.md`, dann diese Datei, dann `konzept/softr/export/SCHEMA.md`.

## 1. Ziel

Dieselbe App wie in Softr, aber in **Baserow Cloud (Free)**, möglichst nur mit **fertigen Baserow-Elementen**: Datenbank-Ansichten, Formular-Ansicht, Application Builder, Automations. **Kein eigener Code** in der Oberfläche. Was ohne Code nicht geht, wird **nicht** nachgebaut, sondern im Bericht festgehalten (Abschnitt 9).

Ergebnis ist ein ehrlicher Vergleich für den Admin: Was kann Baserow Free, was braucht einen bezahlten Tarif, was geht gar nicht?

## 2. Vorlagen (alles im Repo)

| Was | Wo |
|---|---|
| So sieht es in Softr aus (Desktop `-d`, Handy `-m`) | `konzept/vergleich/softr-v4/*.png` |
| Datenbank: Tabellen, Felder, Auswahlwerte, Formeln, Verknüpfungen | `konzept/softr/export/SCHEMA.md` |
| Daten als CSV (Semikolon, UTF-8) | `konzept/softr/export/*.csv` |
| Datenbank als Bild | `konzept/softr/export/db-*.png` |
| Verhalten im Detail (nur lesen, nicht kopieren) | `konzept/softr/src/blocks/*.tsx` |
| Regeln bei Statuswechsel | `konzept/softr/UEBERGABE.md` (Workflows) und Abschnitt 5 unten |
| Kosten Softr/Baserow | `konzept/vergleich/KOSTEN-SOFTR-BASEROW.md` |
| Frühere Baserow-Skripte (REST-API) | `konzept/baserow-demo/skripte/` |

Die Screenshots, die du nachbauen sollst:
- `01/02-erfassen-*`: Erfassen mit Umschalter Unikat/Editionsware
- `10–14-bestand-*`: Bestand mit Reitern „Im Haus“, „Außer Haus“, „Verkauft“, „Alle“, „Editionsware“, Stück-Fenster und Bearbeiten
- `20/21-tabelle-*`: Tabelle mit freien Filtern, Spaltenwahl und CSV
- `30-uebersicht-*`: Übersicht mit Kacheln, „Außer Haus nach Partner“, Diagrammen, „Zuletzt“ und „Nachschub“
- `40–44-stammdaten-*`: Stammdaten mit Künstler:innen, Glasuren, Modellen, Partnern, Lagerorten

## 3. Werkzeuge und Zugang

- **Baserow REST API** (`https://api.baserow.io`). Anmeldung per `POST /api/user/token-auth/` mit `BASEROW_EMAIL` und `BASEROW_PASSWORD` aus `.env`. Fehlt `.env`: Blocker notieren und den Admin bitten, sie anzulegen. **Nie** Zugangsdaten ins Repo, in Commits oder in den Chat.
- **Baserow-MCP** (falls eingerichtet) nur für Zeilen lesen und schreiben, nicht für den Aufbau.
- Doku vor jedem Schritt prüfen: https://baserow.io/user-docs und https://api.baserow.io/api/redoc/. Nicht aus dem Gedächtnis arbeiten.
- Playwright für Screenshots: `ln -sf ../KWM/node_modules node_modules` im Worktree, vor dem Commit wieder entfernen.

## 4. Leitplanken (nicht verhandelbar)

- Nur **Baserow Cloud Free**. Kein Upgrade, keine Testversion eines bezahlten Tarifs, nichts Kostenpflichtiges.
- Nichts Bestehendes in Baserow löschen. Eigenen Workspace „KWM Lager (Nachbau)“ anlegen.
- Nichts öffentlich teilen (keine öffentlichen Ansichten, kein Veröffentlichen der App ohne Admin). Die einzige Ausnahme steht in Abschnitt 8 und wird nur geprüft, nicht eingeschaltet.
- Die Softr-App und die Softr-Datenbank nicht anfassen.
- Alle Texte in der Oberfläche auf Deutsch, keine Platzhalter, keine englischen Reste.
- Preis ist intern. Er darf in der App für alle sichtbar sein, aber nie in einer öffentlichen Ansicht.
- Beide Logins (Admin und Werkstatt) dürfen **alle** Daten ändern. Keine Feldrechte nötig.
- Blocker (Kosten, Login, fehlende Funktion) notieren und mit dem nächsten Schritt weitermachen.

## 5. Schritt 1: Datenbank

Lege die Tabellen aus `SCHEMA.md` an: Unikate, Editionsbestand, Modelle, Glasuren, Künstler:innen, Partner, Lagerorte. „Ansichten“ entfällt, Baserow hat eigene gespeicherte Ansichten.

Typen übersetzen:

| Softr | Baserow |
|---|---|
| SINGLE_LINE_TEXT / LONG_TEXT | Single line text / Long text |
| SELECT (alle Auswahlwerte aus SCHEMA.md, gleiche Reihenfolge) | Single select |
| LINKED_RECORD | Link to table (Glasur bei Unikaten: mehrfach, sonst einfach) |
| CURRENCY | Number mit 0 Nachkommastellen, Präfix € |
| DATETIME (nur Datum) | Date, deutsches Format |
| CHECKBOX | Boolean |
| ATTACHMENT | File |
| AUTONUMBER | Autonumber |
| CREATED_AT / UPDATED_AT | Created on / Last modified |
| FORMULA Inventarnummer | Formula, Ergebnis wie `U-2026-003` (Syntax in der Baserow-Doku prüfen) |
| LOOKUP Editionsbestand.Typ | Lookup über Modell → Typ |

Daten aus den CSVs importieren. Verknüpfungen über den Namen herstellen. Die Testzeilen „Test-Schale/Test-Krug Playwright“ **nicht** übernehmen. Fotos sind nicht exportiert. Lade für 3 bis 5 Unikate je ein Beispielfoto aus `keramik/` hoch (falls vorhanden), damit Galerie und Formulare prüfbar sind.

**Abnahme:** Alle Tabellen, Felder und Auswahlwerte wie in SCHEMA.md. Die Zeilenzahlen stimmen (ohne Testzeilen). Die Inventarnummer erscheint automatisch. Screenshot `konzept/vergleich/baserow-nachbau-01-datenbank.png`.

## 6. Schritt 2: Regeln (Automations)

Mit Baserow **Automations** (Free: 2.000 Credits im Monat) nachbauen. Geht etwas nicht, im Bericht festhalten.

| Wenn | Dann |
|---|---|
| Status wird „in Kommission“ oder „ausgestellt“ und Lagerort ist nicht „Außer Haus“ | Lagerort = „Außer Haus“ |
| Status „in Kommission“ oder „ausgestellt“ und „Außer Haus seit“ leer | Außer Haus seit = heute |
| Status wird „verfügbar“ oder „reserviert“ und Lagerort ist „Außer Haus“ | Lagerort, Partner, Außer Haus seit, Rückgabe bis leeren |
| Status wird „verkauft“ und „Verkauft am“ leer | Verkauft am = heute |

**Abnahme:** Jede Regel mit einer Testzeile ausprobiert und danach zurückgesetzt. Ergebnis im Bericht.

## 7. Schritt 3: Oberfläche

### 7a. Datenbank-Ansichten (immer möglich, Free)
Lege in der Tabelle Unikate an:
- Grid „Alle Unikate“
- Grid „Außer Haus“ (Filter: Status ist „in Kommission“ oder „ausgestellt“, Spalten Partner und Rückgabe bis sichtbar, Sortierung nach Rückgabe bis)
- Grid „Verkauft dieses Jahr“
- Galerie „Bestand“ (Foto, Name, Status, Lagerort)
- Formular „Neues Unikat“ mit Foto-Upload

In Editionsbestand: Grid nach Modell gruppiert und Formular „Neue Editionsware“. In den Stammdaten-Tabellen je ein Grid.

### 7b. Application Builder „KWM Lager“
- Login über eine Nutzer-Tabelle „App-Nutzer“ mit genau zwei Konten: Admin und Werkstatt. Passwörter nur in `.env` (`BASEROW_APP_ADMIN_*`, `BASEROW_APP_WERKSTATT_*`). Fehlen sie, legst du sie an und meldest dem Admin, dass er sie eintragen muss. Nicht in Klartext ins Repo.
- Seiten wie in Softr, gleiche Namen und Reihenfolge: **Erfassen, Bestand, Tabelle, Übersicht, Stammdaten**. Navigation als Menü.
- Je Seite die passenden fertigen Elemente: Tabelle, Formular, Überschrift, Text, Bild, Link, Button, Auswahl. Halte für jede Funktion aus den Screenshots fest, ob sie geht, nur mit Einschränkung geht oder nicht geht.
- **Foto-Upload in der App:** Das Datei-Element gibt es laut Preisseite erst ab Advanced. Prüfe es in Free. Fehlt es, verlinkt die Erfassen-Seite auf das Formular „Neues Unikat“ aus 7a. Das im Bericht festhalten.
- **Übersicht:** Kennzahlen nur, wenn sie mit fertigen Elementen gehen. Dashboards sind laut Preisseite erst ab Premium verfügbar, dann notieren.
- **Stammdaten:** Seite mit je einer Tabelle und einem Formular für Künstler:innen, Glasuren, Modelle, Partner und Lagerorte.
- Theme: Petrol `#2F5D62`, sonst ruhig. Am Handy keine seitlich scrollenden Seiten, Tippflächen mindestens 44 px.

**Abnahme je Seite:** Screenshot Desktop (1440) und Handy (390) als `konzept/vergleich/baserow-nachbau-<nn>-<seite>-d.png` bzw. `-m.png`. Dazu die Optik-Checkliste aus `CLAUDE.md` abhaken.

## 8. Schritt 4: Website-Schnittstelle prüfen (nur prüfen)

Plan aus `konzept/UEBERGABE.md`, Abschnitt 8: Die Astro-Website liest beim Build die Stücke mit „Auf Website zeigen = ja“, und zwar **nur freigegebene Felder**, niemals Preis oder Lagerort. Prüfe in Baserow und schreibe auf:
1. Kann ein **Datenbank-Token nur lesen** und auf eine Tabelle beschränkt werden?
2. Gibt eine Ansicht mit **ausgeblendeten Feldern** über die API nur die sichtbaren Felder zurück, sodass der Preis gar nicht erst ausgeliefert wird? Nur mit einem lokalen Test-Token prüfen, keine öffentliche Ansicht dauerhaft einschalten.
3. Kann ein **Webhook** bei Änderung von „Auf Website zeigen“ oder des Status eine URL aufrufen (später der Cloudflare Deploy Hook)?
4. Laufen Datei-URLs ab? Dann müsste der Build die Bilder herunterladen und selbst ausliefern.

## 9. Bericht

`konzept/vergleich/BASEROW-NACHBAU-BERICHT.md`, auf Deutsch, kurze Sätze:
1. Tabelle „Funktion · Softr (heute) · Baserow Free · Baserow bezahlt (welcher Tarif)“ für **jede** Funktion aus den Screenshots. Werte: geht / eingeschränkt (wie) / geht nicht.
2. Die 4 Regeln: geht oder geht nicht.
3. Website-Schnittstelle: Antworten auf die Fragen 1 bis 4.
4. Kosten für 2 Logins im Monat: Free, Premium, Advanced. Dazu: Zählen App-Builder-Nutzer als zahlende Nutzer?
5. Was Free fehlt, um die Werkstatt mit Foto vom Handy arbeiten zu lassen.
6. Blocker und was der Admin tun muss.

Kein Urteil „Softr oder Baserow“. Das entscheidet der Admin.

## 10. Commits

Nach jedem abgeschlossenen Schritt ein Commit auf `claude/baserow-nachbau` (deutsche Nachricht) und ein Push. Keine Zugangsdaten, keine Tokens, keine `.env`.
