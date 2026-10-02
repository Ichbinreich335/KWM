# Softr-Lager-App – Bericht

Stand: 02.10.2026, wird je Runde aktualisiert. Auftrag: `konzept/SOFTR-AUFTRAG.md`. Quelltexte der Blöcke: `konzept/softr/` (siehe README dort).

## Kurzfassung
Die App „KWM Lager“ hat jetzt vier Bereiche: **Erfassen**, **Bestand** (Alltag), **Tabelle** (alles sehen, frei filtern) und **Übersicht** (Dashboard). Alle Inhalte sind per Softr-MCP gebaute Vibe-Coding-Blöcke auf einer neuen, sauberen Datenbank. Die Funktionen sind mit Playwright als Admin getestet (Desktop 1440 px, Mobil 390 px). Offen sind vor allem Klick-Schritte des Admins (alte Blöcke löschen, Menüpunkt „Tabelle“) und ein echter Werkstatt-Login, der erst nach der Veröffentlichung möglich ist.

## Entscheidungen
- **Preis:** für **alle** Mitarbeitenden in der App sichtbar (Vorgabe Admin 02.10.2026), nie auf der Website.
- **Bestehende App weiter genutzt** („KWM Lager“, vorher „Keramik Lagerverwaltung“, `celestina80104.softr.app`): Theme, Seitenleiste, Login und Nutzergruppen bleiben. Eine neue App startet ohne Menü, mit englischer Login-Seite und Platzhalter-Logo. Das lässt sich per MCP nicht ändern.
- **Neue Datenbank** „Keramik-Lager KWM“ statt Umbau der KI-Builder-Datenbank (nichts gelöscht).
- **Trennung Alltag und Recherche** (Wunsch Admin): Bestand = einfache Schnellreiter mit Karten. Tabelle = alle Objekte mit freien Filtern. Leitfrage: „Versteht eine neue Mitarbeiterin das in 10 Minuten, und findet sie die volle Funktion, wenn sie sie sucht?“
- **Rechte:** Die Werkstatt erfasst und ändert alle beschreibenden Felder (Name, Typ, Glasur, Maße, Künstler:in, Jahr, Bildnachweis, Status, Lagerort, Galerie, Notiz, Fotos, Anzahl). **Nur der Admin** ändert Preis, „Auf Website zeigen“ und das Verkaufsdatum (eigener Block, serverseitig auf die Gruppe Admin beschränkt). Löschen ist für niemanden vorgesehen, außer gespeicherten Tabellen-Ansichten.
- **Neue Typen, Glasuren, Künstler:innen** legt die Werkstatt direkt in der Erfassen-Maske an („+ Neu“, Dublettenprüfung ohne Groß-/Kleinschreibung). Lagerorte, Galerien und Modelle pflegt der Admin in Softr Databases.

## Datenbank „Keramik-Lager KWM“
| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| Unikate | Einzelstücke | Name, **Inventarnummer** (Formel `U-JJJJ-NNN`), Typ, Status, Künstler:in →, Jahr, Glasur → (mehrere), Maße, Fotos, Bildnachweis, Lagerort →, Galerie →, Preis intern, Auf Website zeigen, Notiz, Erfasst von/am, Geändert am, Verkauft am |
| Editionsbestand | eine Zeile pro Modell + Glasur + Zustand | Bezeichnung, Modell →, Typ (aus Modell), Glasur →, Zustand, Anzahl, Lagerort →, Foto, Notiz, Erfasst am, Zuletzt geändert |
| Lagerorte | Stammdaten | Name, Bereich (Schauraum, Lager, Extern) |
| Künstler:innen · Glasuren | Stammdaten | Name |
| Galerien | Stammdaten | Name, Ort, Kontakt, Zusammenarbeit, Notiz |
| Modelle | Stammdaten Editionsware | Name, Typ, Maße, Foto |
| Ansichten | gespeicherte Filter der Tabelle | Name, Definition, Erstellt von/am |

Daten: 12 Unikate und 10 Zeilen Editionsbestand aus `konzept/test-import/*.csv`.

## Stand der Kriterien
| Kriterium | Stand |
|---|---|
| Datenbank nach Datenstruktur | erledigt |
| Inventarnummer automatisch | erledigt (U-2026-001 … 014) |
| **Erfassen** | erledigt: Umschalter Unikat/Editionsware, Pflicht nur Foto, Name, Typ, Status. Tipp-Chips, Galerie nur bei „in Kommission“, „+ Neu“ für Typ/Glasur/Künstler:in, Erfolgsmeldung mit Inventarnummer, „Nächstes Stück erfassen“. Vorhandene Editions-Kombination wird hochgezählt statt doppelt angelegt. Screens `softr-01…05-*` |
| **Bestand** (Alltag) | erledigt: Schnellreiter mit Zählern (Alle · Verfügbar · Schalen · Vasen · Teller · In Kommission · Editionsware), Suche, Sortierung, Karten mit Foto, Status-Farbe, Preis, Lagerort. Detail-Panel mit **„Schnell ändern“** (Status und Lagerort, sofort gespeichert) und „Alle Angaben bearbeiten“. Editionsware mit ±1 in der Liste. CSV-Export. Screens `softr-10…18-*` |
| **Tabelle** (alles, frei filtern) | erledigt: Unikate und Editionsware in einer Tabelle. Filterzeilen „Feld · Bedingung · Wert“ auf **jedes** Attribut, verknüpft mit UND oder ODER. Spalten ein-/ausblenden, Sortierung per Spaltenkopf, Suche, Summen (Anzahl, Warenwert), **gespeicherte Ansichten für alle**, CSV-Export, Detail zum Nachschlagen. Screens `softr-40…43-*` |
| **Übersicht** (Dashboard) | erledigt: 6 Kennzahl-Kacheln (antippbar), Unikate nach Typ und Status, Editionsware je Modell, Nachschub (< 5), Kommission je Galerie, zuletzt erfasst/geändert. Farben mit dataviz-Validator geprüft. Zahlen stimmen mit Bestand und Tabelle überein. Screens `softr-20-*` |
| Startseite | leitet auf die Übersicht weiter |
| Prüfung als **Admin** | erledigt (Playwright, Desktop + Mobil, keine Konsolenfehler, kein horizontales Scrollen) |
| Prüfung als **Werkstatt** | **teilweise**: Testnutzer „Werkstatt Test“ (`verwaltung.kwm+werkstatt@proton.me`, Gruppe Werkstatt) ist angelegt. Das Umschalten „Preview as“ greift in der automatisierten Vorschau nicht (die App bleibt beim Admin). Ein echter Login-Test braucht die veröffentlichte App, siehe Blocker. Die Rechte sind serverseitig gesetzt (Admin-Block und Admin-Aktion nur Gruppe Admin). |
| UI-Review (Opus-Agent mit Refero) | erledigt, Ergebnis `SOFTR-UI-REVIEW.md` (10 × P1, 18 × P2, 10 × P3). **P1 abgearbeitet:** Kachel-Links, Fehler anspringen + Zusammenfassung, Schließen-Knopf (deutsch, 44 px) in allen Panels, Rückgängig nach Sofort-Änderungen und ±1, Verkaufsdatum wird beim Zurückstellen gelöscht, Status-Chips in Statusfarbe mit Häkchen, Tablet/Mobil-Layout (Karten, Editionszeilen, Suchtext), „Schnell ändern“ oben im Detail, Preis/Website im Erfassen nur für Admin, Lagerort weiter oben. Getestet mit Playwright (Mobil/Tablet). **P2 teilweise:** Tabelle mit Filtern in Alltagssprache („Wenn … mindestens …“), Preis-Spalte ohne Scrollen sichtbar, Ansichten ohne Dubletten und mit Rückfrage vor dem Entfernen. Erfassen: Fehler verschwinden nach Korrektur, Fotos bleiben beim Umschalten. Übersicht: Bereich „Zu erledigen“ (ohne Foto, ohne Lagerort, verkauft ohne Datum, Rückgabe überfällig). **Noch offen (Feinschliff):** P2-1/2/3/4/7/10/11/12/16/18 und P3, siehe Review. |

## Was der Admin tun muss (per MCP nicht möglich)
1. **Alte Blöcke des KI-Builders löschen** (Studio → Seite → Block anklicken → Löschen). Die neuen Blöcke heißen „Erfassen – Formular“, „Bestand – Reiter, Tabelle, Detail“, „Bestand – Admin-Bearbeitung“, „Tabelle – alle Objekte frei filterbar“, „Übersicht – Dashboard“, „Startseite – Weiterleitung zur Übersicht“. Diese und die Kopfzeile/Navigation bleiben.
   - **Erfassen:** „Conditional Form“
   - **Bestand:** „Tab container“ mit allen Tabs, alle „Horizontal card“-Blöcke, „Table“
   - **Übersicht:** beide „Column container“ mit allen „Chart“-Blöcken, „List“
   - **Home:** „Soft Card“, „Column container“, „Tab container“, alle „Chart“, „List“, „Table“
   - Seiten **„Unikat Details“** und **„Edition Details“** ganz löschen (werden nicht mehr gebraucht)
2. **Menüpunkt „Tabelle“** in die Seitenleiste aufnehmen: Studio → Navigation → Menüpunkt hinzufügen → Seite „Tabelle“ (`/tabelle`), am besten zwischen Bestand und Übersicht. Bis dahin ist die Seite über „Alles als Tabelle“ im Bestand erreichbar.
3. **Mehrere Fotos pro Unikat:** Softr Databases → Unikate → Feld „Fotos“ → mehrere Dateien erlauben. Die Blöcke unterstützen mehrere Fotos bereits.
4. **Farben der Auswahlfelder** in Softr Databases (nur Datenbankansicht, die App zeichnet die Farben selbst): Status grün/gelb/grau/blau.
5. **Echte Werkstatt-Zugänge:** zwei Mitarbeitende anlegen (Studio → Users) und im Users-Feld „Role“ auf „Werkstatt“ setzen. Die englischen Platzhalter-Nutzer des KI-Builders (Isabella White, Jack Clark, William Lopez, Luna Harris, Oliver Jackson, Sophia Brown) entfernen.
6. **Login-Seite** auf Deutsch prüfen (fertiger Softr-Block, per MCP nicht änderbar).

## Blocker (Kosten, Löschen, Live-Schaltung)
- **Veröffentlichen (Live-Schaltung):** Die App ist nicht veröffentlicht. Erst danach sind ein echter Login als Werkstatt-Nutzer und der Test am iPhone (HEIC-Fotos) möglich. Das entscheidest du.
- **Löschen:** alte Datenbank „Keramik Lagerverwaltung“, leere Test-App „Test (leer) – kann gelöscht werden“, alte Blöcke und Seiten (siehe oben), Platzhalter-Nutzer.

## Offene Fragen
- **Außer Haus (Admin 02.10.2026):** Übersicht hat jetzt den Bereich „Außer Haus“ (je Partner: Art, Ort, Stücke, Wert, Rückgabefrist; überfällig rot, ≤ 14 Tage gelb) und die Kachel „Außer Haus“. Datenmodell: Tabelle „Galerien“ heißt jetzt „Partner“ (+ Feld Art: Galerie, Museum, Ausstellung/Messe, Leihnehmer privat), Status „ausgestellt“, Felder „Außer Haus seit“ und „Rückgabe bis“, Lagerort „Galerie“ heißt jetzt „Außer Haus“. Beispiel: „Keramikmuseum am Fluss“ (fiktiv) mit der Großen Schale „Morgenlicht“. Bestand: Reiter „Außer Haus“ (Kommission + ausgestellt), im Detail Partner und „Rückgabe bis“ unter „Schnell ändern“. Beim Wechsel nach außer Haus wird „Außer Haus seit“ gesetzt, beim Zurückholen werden Partner und Daten geleert. Erfassen: Partner-Feld auch bei „ausgestellt“. Tabelle: Spalten „Partner“ und „Rückgabe bis“, filterbar. Getestet (Playwright). **Offen:** Website-Feld „Ausstellung“ (geplant, nicht angelegt).
- **Umschalter „Unikat / Editionsware“** oben in der Erfassen-Maske: sinnvoll oder lieber zwei getrennte Wege? Am Test-Abend mit der Werkstatt klären.
- **HEIC vom iPhone:** Das Foto-Feld nimmt `image/*` an, iOS wandelt beim Hochladen normalerweise in JPEG um. Prüfen nach der Veröffentlichung.
- Aus `UEBERGABE.md` weiterhin offen: Dateispeicher im Basic-Tarif, 2FA für das Admin-Konto, Export inklusive Fotos, Workflow-URL-Aufruf, geteilte Logins laut AGB.

## Testdaten aus Playwright (darf der Admin löschen)
- Unikat „Test-Schale „Playwright““ (U-2026-013)
- Unikat „Test-Krug „Playwright““ (U-2026-014) mit dem neu angelegten Typ „Krug“
- Ansicht „Seladon-Stücke verfügbar ab 2026“ (darf als Beispiel bleiben)

## Erkenntnisse zu Softr (für die Entscheidung Softr oder Baserow)
- **Branding:** Laut Admin lässt sich das Badge „Made with Softr“ auch im ca. 20-€-Tarif nicht vollständig entfernen. Es stört die Bedienung nicht, wirkt aber weniger professionell.
- **Freie, kombinierbare Filter und gespeicherte Ansichten:** Mit fertigen Softr-Blöcken nur begrenzt möglich, mit Vibe-Coding-Blöcken vollständig, auch geräteübergreifend für alle.
- **Rechte:** Softr vergibt Bearbeiten-Rechte pro Block und Tabelle, nicht pro Feld. Unterschiedliche Rechte brauchen getrennte Blöcke. Das ist gelöst und serverseitig erzwungen.
- **Jede Code-Änderung setzt die Aktionsrechte zurück.** Nach jedem Update setze ich sie per MCP neu. Wer später im Studio per KI-Chat ändert, muss das wissen.
- **Fertige Softr-Blöcke** (Formular, Liste, Navigation, Login) sind per MCP weder änder- noch löschbar. Deshalb fallen Klick-Schritte für den Admin an.
- **Vorschau-Links** frieren den Stand ein. Nach Änderungen braucht es einen neuen Link.
- Wermutstropfen: Die App hängt jetzt an eigenem Code in Vibe-Coding-Blöcken. Der Code liegt versioniert in diesem Repo, aber Änderungen brauchen jemanden, der React lesen kann (oder Claude per MCP).
