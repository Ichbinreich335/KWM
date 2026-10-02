# Softr-Lager-App – Bericht

Stand: 02.10.2026, wird je Runde aktualisiert. Auftrag: `konzept/SOFTR-AUFTRAG.md`.

## Entscheidungen in dieser Session
- **Preis:** Der interne Preis ist in der Lager-App für **alle** Mitarbeitenden sichtbar (Vorgabe des Admins vom 02.10.2026). Er darf nur nie auf der Website erscheinen.
- **Bestehende App weiter genutzt** („KWM Lager“, vorher „Keramik Lagerverwaltung“, `celestina80104.softr.app`). Theme, Seitenleiste mit genau drei Menüpunkten, Login und Nutzergruppen bleiben erhalten. Eine neue App startet ohne Menü, mit englischer Login-Seite und Platzhalter-Logo, und das lässt sich per MCP nicht ändern.
- **Neue, saubere Datenbank** „Keramik-Lager KWM“ statt Umbau der KI-Builder-Datenbank (nichts gelöscht).
- **Alle Seiteninhalte als Vibe-Coding-Blöcke.** Fertige Softr-Blöcke (Liste, Formular, Diagramm) kann der MCP weder ändern noch ausblenden oder löschen. Vibe-Coding-Blöcke lassen sich komplett per MCP schreiben, mit Daten verbinden und mit Rechten versehen.

## Datenbank „Keramik-Lager KWM“
| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| Unikate | Einzelstücke | Name, **Inventarnummer** (Formel `U-JJJJ-NNN` aus Autonummer + Erfassungsjahr), Typ, Status, Künstler:in →, Jahr, Glasur → (mehrere), Maße, Fotos, Bildnachweis, Lagerort →, Galerie →, Preis intern, Auf Website zeigen, Notiz, Erfasst von/am, Geändert am, Verkauft am |
| Editionsbestand | eine Zeile pro Modell + Glasur + Zustand | Bezeichnung, Modell →, Typ (aus Modell), Glasur →, Zustand, Anzahl, Lagerort →, Foto, Notiz, Erfasst am, Zuletzt geändert |
| Lagerorte | Stammdaten | Name, Bereich (Schauraum, Lager, Extern) |
| Künstler:innen | Stammdaten | Name |
| Galerien | Stammdaten | Name, Ort, Kontakt, Zusammenarbeit, Notiz |
| Glasuren | Stammdaten | Name |
| Modelle | Stammdaten Editionsware | Name, Typ, Maße, Foto |

Daten: 12 Unikate und 10 Zeilen Editionsbestand aus `konzept/test-import/*.csv`. 8 Unikate haben Beispielfotos aus der KI-Builder-Datenbank, 4 sind bewusst ohne Foto (Prüfung des leeren Zustands).

## Stand der Kriterien
| Kriterium | Stand |
|---|---|
| Datenbank nach Datenstruktur (Stammdaten, Verknüpfungen, Auswahlfelder) | erledigt |
| Inventarnummer `U-JJJJ-NNN` automatisch | erledigt |
| Erfassen (Maske) | erledigt: Umschalter Unikat/Editionsware, Pflicht nur Foto/Name/Typ/Status, Tipp-Chips, Galerie nur bei „in Kommission“, Erfolgsmeldung mit Inventarnummer, „Nächstes Stück erfassen“. Vorhandene Editions-Kombination wird erkannt und hochgezählt. Getestet: Erfassung mit Foto (U-2026-013), Fehlermeldungen. Screens `softr-01…04-*` |
| Bestand: Reiter + freie Tabelle + Detail + CSV | offen |
| Übersicht als echtes Dashboard | offen |
| Prüfung als Werkstatt und Admin (Playwright) | offen |

## Nicht per MCP möglich (Klick-Anleitung für den Admin)
1. **Farben der Auswahlfelder** in der Datenbank (Status grün/gelb/grau/blau): Softr vergibt Farben beim Anlegen selbst. In der App zeichnen die Blöcke die Status-Farben selbst, deshalb betrifft das nur die Tabellenansicht in Softr Databases.
2. **Mehrere Fotos pro Unikat:** Feld „Fotos“ in Unikate → Feld bearbeiten → mehrere Dateien erlauben. Per MCP nicht einstellbar.
3. **Alte Blöcke des KI-Builders löschen** (Seiten Erfassen, Bestand, Übersicht, Home): Studio → Seite → Block → Löschen. Liste folgt.

## Testdaten aus Playwright (darf der Admin löschen)
- Unikat „Test-Schale „Playwright““ (U-2026-013)

## Blocker (Kosten, Löschen, Live-Schaltung)
- **Aufräumen (Löschen):** alte Datenbank „Keramik Lagerverwaltung“ (KI-Builder) und die leere Test-App „Test (leer) – kann gelöscht werden“. Lösche ich nicht selbst.
