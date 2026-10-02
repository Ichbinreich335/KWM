# Baserow-Demo: Keramik-Lager KWM

Export des Demo-Workspace aus Baserow 2.4.0, lokal erstellt. Er enthält die Tabellen Unikate, Modelle, Glasuren, Lagerorte, Buchungen und Aufträge mit Testdaten und Fotos, außerdem die Ansichten (Galerie „Werkschau“, Formulare) und die Anwendung „Werkstatt“ aus dem Application Builder.

- `kwm-baserow-workspace-export.zip`: Workspace-Export, enthält Daten und Fotos
- `skripte/`: Python-Skripte, mit denen die Demo per REST-API aufgebaut wurde, als Referenz. Das Passwort `KwmDemo2026!` ist nur ein lokales Demo-Passwort.

## Lokal ansehen (Docker)

```bash
docker run -d --name baserow -e BASEROW_PUBLIC_URL=http://localhost:8090 \
  -v baserow_data:/baserow/data -p 8090:80 baserow/baserow:latest
# 2–5 Minuten warten, dann http://localhost:8090 öffnen und ein Konto anlegen
```

Danach links auf den Workspace klicken, dann **„Importieren“** und die ZIP-Datei auswählen. Die Anleitung von Baserow: <https://baserow.io/user-docs/import-workspaces>.

## In Baserow Cloud importieren

Der Weg ist derselbe: Workspace, dann Importieren, dann die ZIP-Datei. Die Exporte sind signiert. Ob Baserow Cloud einen Export aus einer selbst gehosteten Instanz ohne Warnung annimmt, ist ungeprüft. Die Fotos belegen etwa 14 MB.

## Hinweise zur Optik

- Den Grid will die Werkstatt eher nicht sehen. Für sie sind **Galerie** und **Formular** gedacht.
- **Formular „Neues Stück“:** Titelbild, Logo und Text des Buttons lassen sich anpassen, ebenso bedingte Felder und ein Passwortschutz für den öffentlichen Link. Der **Survey-Modus**, also eine Frage pro Seite, setzt Premium voraus.
- **Application Builder:** Theme mit Farben, Schriften und Buttons, eigene Seiten, Login über User Sources. Hier ist am meisten Gestaltung möglich. Die Seite „Lagerübersicht“ in der Demo ist bisher nur ein Grundgerüst.
