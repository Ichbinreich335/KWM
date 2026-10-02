# Auftrag: Lager-App parallel in Baserow Cloud bauen (Vergleich zu Softr)

**Zuerst lesen:** `CLAUDE.md`, `konzept/UEBERGABE.md` (Abschnitt 0) und `konzept/SOFTR-AUFTRAG.md` (Anforderungen, Datenstruktur, Nachbesserungen). Für Baserow gelten dieselben Anforderungen.
**Modell:** Für diesen Prototyp reicht ein mittleres Modell.
**Referenz:** Der lokal gebaute Baserow-Prototyp v2, siehe `konzept/vergleich/baserow-v2-*.png` und `BASEROW-V2-BERICHT.md`. Die Aufbau-Skripte liegen in `konzept/baserow-demo/skripte/`.

## Kernfrage
Kann die Werkstatt in einer **eigenen Oberfläche (Application Builder)** arbeiten, getrennt von der **reinen Datenbank-Tabelle**? Diese Oberfläche braucht:
- Erfassen mit Foto
- Bestand mit freien, kombinierbaren Filtern
- eine Übersicht

## Werkzeuge
- **Baserow REST API.** Damit lassen sich Tabellen, Felder, Ansichten und der App Builder **vollständig anlegen**. Die lokale Demo wurde komplett so gebaut.
- **Anmeldung:** `POST /api/user/token-auth/` mit dem Konto des Admins. E-Mail und Passwort stehen in `.env` als `BASEROW_EMAIL` und `BASEROW_PASSWORD`, nie im Repo und nie im Chat.
- **Basis-URL:** `https://api.baserow.io`. Zu prüfen ist, ob die Cloud-API dieselben Endpunkte wie Self-hosted anbietet.
- **Baserow-MCP:** pro Workspace unter *Einstellungen → MCP Server*. Er kann nur Zeilen lesen und schreiben, eignet sich also für Testdaten, nicht für den Aufbau. Die URL ist geheim und kommt nur lokal per `claude mcp add`.

## Vorgehen
1. **Export importieren oder neu bauen:**
   - Entweder den Demo-Export `konzept/baserow-demo/kwm-baserow-workspace-export.zip` importieren
   - oder neu bauen nach der Datenstruktur in `SOFTR-AUFTRAG.md`. Neu bauen ist bevorzugt, weil die Struktur dort aktueller ist.
2. **App „KWM Lager“** im Application Builder anlegen:
   - Login über eine eigene App-Nutzer-Tabelle
   - drei Seiten: Erfassen, Bestand, Übersicht
   - Theme in Petrol (#2F5D62)
3. **Testen und festhalten** (als App-Nutzer der Werkstatt):
   - Lassen sich Filter kombinieren?
   - Funktioniert der Foto-Upload in der App? Das Datei-Element ist evtl. erst ab Advanced verfügbar.
   - Ist der Preis für die Werkstatt ausgeblendet?
   - Funktioniert der CSV-Export?
   - Wie verhält sich die App am Handy?
4. **Kosten notieren:**
   - Welche Funktion verlangt welchen Tarif (Free / Premium / Advanced)?
   - Zählen App-Nutzer als zahlende Nutzer?
5. **Ergebnis:** Screenshots nach `konzept/vergleich/baserow-cloud-*.png` und ein kurzer Bericht nach `konzept/vergleich/BASEROW-CLOUD-BERICHT.md`. Der Bericht verwendet dieselbe Tabelle wie der v2-Bericht.
