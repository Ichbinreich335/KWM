# Baserow-Nachbau „KWM Lager“

Die Lager-App aus Softr, nachgebaut in Baserow mit fertigen Bausteinen. Sie läuft lokal in Docker, ohne Lizenz, also im Funktionsumfang von Free. Ergebnis und Vergleich stehen in `konzept/vergleich/BASEROW-NACHBAU-BERICHT.md`.

## Starten

```bash
brew install colima docker          # einmalig
colima start --cpu 4 --memory 6     # nach jedem Neustart des Macs
docker run -d --name kwm-baserow --restart unless-stopped \
  -e BASEROW_PUBLIC_URL=http://localhost:8090 \
  -v kwm_baserow_data:/baserow/data -p 8090:80 baserow/baserow:latest   # einmalig
```

Danach http://localhost:8090 öffnen. Die Zugangsdaten stehen in `.env` im Worktree, die nie committet wird:
`BASEROW_URL`, `BASEROW_EMAIL`, `BASEROW_PASSWORD` (Baserow-Konto) sowie `BASEROW_APP_ADMIN_*` und `BASEROW_APP_WERKSTATT_*` (Login der App).

App ansehen: Workspace „KWM Lager (Nachbau)“, dann Anwendungen, „KWM Lager“, oben rechts „Vorschau“ und mit dem Werkstatt-Konto anmelden. Die App ist nicht veröffentlicht.

## Aufbau neu ausführen

Die Skripte nutzen nur Node 20+ (eingebautes `fetch`) und die REST-API. Die IDs landen in `ids.local.json` (nicht im Repo).

| Skript | Inhalt |
|---|---|
| `01-datenbank.mjs` | Workspace, 7 Tabellen, CSV-Import aus `konzept/softr/export/`, 5 Beispielfotos |
| `02-regeln.mjs` / `02-regeln-test.mjs` | Automation „Status-Regeln“ und Test an einem bestehenden Stück |
| `03-ansichten.mjs` / `03-ansichten-screens.mjs` | Grids, Galerie, Formulare, Screenshots |
| `04-app.mjs` / `04-app-screens.mjs` / `04-app-test.mjs` | Application Builder, Screenshots 1440/390, Funktionstest |
| `05-website-pruefung.mjs` | Token, Ansicht „Website“, Webhook (deaktiviert), Datei-URLs |
| `06-dashboard.mjs` | Dashboard mit Kennzahl-Kacheln |

`01` läuft nur auf einer leeren Instanz. `02` bis `06` ersetzen beim erneuten Lauf ihre eigenen Objekte. Für die Screenshot-Skripte braucht es Playwright: `ln -sf ../KWM/node_modules node_modules`, danach den Link wieder entfernen.

## Stolpersteine der API (Baserow 2.4.0)

- Menüpunkte, Tabellenspalten und `property_options` werden beim Anlegen eines Elements nicht richtig übernommen. Deshalb: leer anlegen, danach per PATCH setzen (`el()` in `04-app.mjs`).
- Text in einem Verknüpfungsfeld gilt in Automations als Name der Zielzeile. IDs als Zahl übergeben. Leeren geht mit `null()`.
- Dashboard-Kacheln übernehmen die Datenbankverbindung beim Anlegen. Die Verbindung muss also vorher existieren.
- Die Vorschau einer unveröffentlichten App öffnet sich nur über den Knopf „Vorschau“ im Editor.
