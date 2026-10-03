# Kosten: Softr oder Baserow für das KWM-Lager

Stand 03.10.2026. Fall: 2 Logins (Admin und Werkstatt), beide dürfen alle Daten ändern. Etwa 200 Unikate plus Editionsware, unter 2.000 Datensätze, einige hundert Fotos zu je etwa 1 MB, 4 Workflows mit wenigen hundert Ausführungen im Monat.

**Quellenlage:** Die Preisseite von Softr lädt per Skript und ließ sich nicht automatisch lesen. Die Softr-Angaben stammen aus Sekundärquellen nach der Tarifumstellung vom 05.08.2026. Mit [?] markierte Punkte bitte in Studio unter *Settings → Billing* gegenprüfen. Die Baserow-Angaben stammen direkt von baserow.io/pricing.

## Ergebnis

| | Softr Free | Softr Basic | Baserow Free | Baserow Advanced |
|---|---|---|---|---|
| Preis für 2 Logins | **0 €** | 19 $/Monat (jährlich), 25 $ monatlich | **0 €** | 2 × 18 $ = 36 $/Monat (jährlich) |
| App-Nutzer | 5 bis 10 [?] | 5 intern + 5 extern | App-Builder-Nutzer: auf der Preisseite nicht geregelt | wie Free |
| Datensätze | 5.000 | 50.000 | 3.000 Zeilen pro Workspace | 250.000 |
| Dateispeicher | nicht angegeben [?] | nicht angegeben [?] | 2 GB | 100 GB |
| Workflows | 500 Aktionen/Monat | 2.500 Aktionen/Monat | 2.000 Automations-Credits/Monat | 500.000 |
| Eigene Nutzergruppen | nein, nur Standardgruppen (alle / angemeldet) | nein | – | Rollen und Feldrechte |
| Foto-Upload in der App | ja (Vibe-Block mit `useUpload`) | ja | **nein**, Datei-Element erst ab Advanced | ja |
| Eigene Domain | nein (Adresse `….softr.app`) | 1 | – | – |
| „Made with Softr“ entfernen | nein | nein (erst Pro, 99 $) | – | – |

## Reicht Softr Free?

Wahrscheinlich ja, seit die Werkstatt alle Daten ändern darf. Damit braucht die App keine eigenen Nutzergruppen mehr. Die Standardgruppe „angemeldet“ genügt, und eigene Gruppen gibt es erst ab Pro.

- 2 Logins liegen unter der Grenze von 5 bzw. 10 App-Nutzern.
- Unter 2.000 Datensätze liegen unter 5.000.
- Die 4 Workflows laufen nur bei Statuswechseln, also deutlich unter 500 Aktionen im Monat.
- Vibe-Coding-Blöcke gibt es in allen Tarifen. AI-Credits verbraucht nur der KI-Chat in Studio. Der Umbau per MCP verbraucht keine (laut Softr-Angabe zum MCP, siehe `konzept/UEBERGABE.md`).

Offen vor dem Umstieg:
1. Dateispeicher im Free-Tarif [?]. Fotos sind der größte Posten.
2. Ob ein Free-Workspace eine veröffentlichte App behalten darf [?]. Die Quellen nennen „1 published app“ bzw. „unbegrenzt“.
3. Ob der MCP-Zugang im Free-Tarif bleibt [?]. Eine Quelle nennt „API und MCP ab Basic“, Softr selbst „on every plan, including Free“.
4. 2FA gibt es laut Tarifliste erst im Business-Tarif. Das ist für den Admin ein bekanntes Risiko.

## Baserow im Vergleich

- **Baserow Free (0 €)** kann im App Builder keine Fotos hochladen. Das Datei-Element gibt es erst ab Advanced. Auch Rollen und Feldrechte gibt es erst ab Advanced. Fürs reine Erfassen bliebe nur die Formular-Ansicht.
- **Baserow Advanced** kostet für 2 Logins etwa 36 $ im Monat, also mehr als Softr Basic.
- **Selbst gehostet (MIT-Lizenz):** Die Software kostet nichts. Dafür braucht es einen eigenen Server mit Updates und Backups. Das schließt `konzept/UEBERGABE.md` aus („kein Selbst-Hosting“).

## Was Softr für uns leistet

- Login und Rechte, auf dem Server geprüft
- Datenbank, Fotospeicher und Backups in der EU
- Workflows, also die Regeln zu Status, Lagerort und Datumsfeldern
- Fotos vom Handy hochladen
- Hosting mit Adresse, SSL und Handy-App (PWA)
- MCP, damit Claude App, Datenbank und Workflows pflegen kann

Die Oberfläche (Vibe-Blöcke) kommt von uns. Sie liegt versioniert im Repo (`konzept/softr/src/`) und baut auf einer gemeinsamen Bauteil-Bibliothek auf.

## Quellen (abgerufen 03.10.2026)
- Baserow-Preise: https://baserow.io/pricing
- Softr-Tarife nach der Umstellung, Artikel vom 24.08.2026: https://www.totalum.app/blog/softr-pricing-2026
- Softr-Tarife, Übersicht: https://toolradar.com/tools/softr/pricing
- Softr-Preisseite (per Skript, nicht automatisch lesbar): https://www.softr.io/pricing
