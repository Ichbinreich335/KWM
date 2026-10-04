# Sicherung der Softr-Datenbank

Softr hat weder Versionsverlauf noch Backups. Diese Skripte sichern jede Nacht die ganze Lager-Datenbank nach Cloudflare R2 und können einzelne Tabellen oder Datensätze zurückschreiben.

## Was gesichert wird

| Ablage in R2 | Inhalt |
|---|---|
| `stand/JJJJ-MM-TT.json` | Schema und alle Datensätze aller Tabellen, ein Stand pro Tag |
| `stand/aktuell.json` | Kopie des neuesten Stands |
| `fotos/<hash>.<endung>` | Jedes Foto genau einmal, auch wenn es in Softr später gelöscht wird |

Im JSON trägt jedes Foto das Feld `sicherung` mit seinem Pfad unter `fotos/`.

## Einrichtung (einmalig)

1. **R2 aktivieren:** Cloudflare-Dashboard des Website-Kontos → R2 Object Storage → aktivieren. Der kostenlose Umfang (10 GB) reicht für Jahre.
2. **Bucket anlegen:** Name `kwm-lager-sicherung`, Standort *Jurisdiction: European Union*.
3. **Aufbewahrung (empfohlen):** Bucket → Settings → Object lifecycle rules → Regel mit Präfix `stand/2`, Objekte nach 180 Tagen löschen. `stand/aktuell.json` und `fotos/` bleiben unberührt.
4. **R2-Schlüssel:** R2 → Manage API tokens → *Object Read & Write*, nur für diesen Bucket. Access Key ID und Secret notieren.
5. **Softr-Schlüssel:** Softr → Profil → Settings → API tokens → neuen Token anlegen.
6. **GitHub-Secrets:** Repository → Settings → Secrets and variables → Actions → *New repository secret*:

| Secret | Wert |
|---|---|
| `SOFTR_API_KEY` | Softr-Token aus Schritt 5 |
| `R2_ACCOUNT_ID` | Cloudflare Account-ID (rechts im R2-Überblick) |
| `R2_ACCESS_KEY_ID` | aus Schritt 4 |
| `R2_SECRET_ACCESS_KEY` | aus Schritt 4 |
| `R2_BUCKET` | `kwm-lager-sicherung` |
| `R2_JURISDICTION` | `eu` |

7. **Testlauf:** GitHub → Actions → *Softr-Sicherung* → *Run workflow*. Im Log steht am Ende „Gesichert: … Tabellen, … Datensätze“.

Der nächtliche Lauf (01:17 UTC) startet erst, wenn `.github/workflows/softr-sicherung.yml` auf dem Hauptbranch liegt. Schlägt ein Lauf fehl, schickt GitHub eine E-Mail.

Wechselt die Website auf ein anderes Cloudflare-Konto, dort Schritte 1 bis 4 wiederholen und die vier `R2_*`-Secrets ersetzen. Alte Stände bei Bedarf mit `rclone` oder dem Dashboard umziehen.

## Wiederherstellen

GitHub → Actions → *Softr-Wiederherstellung* → *Run workflow*:

- **Datum** und **Tabelle** wählen, optional eine **Datensatz-ID**.
- Ohne Haken bei *Wirklich zurückschreiben* zeigt das Log nur, was sich ändern würde (`ÄNDERN …: Feld: jetzt → Sicherung`, `NEU ANLEGEN …`). Erst prüfen, dann mit Haken erneut starten.

Regeln:

- Zurückgeschrieben werden nur bearbeitbare Felder, und davon nur die, die sich unterscheiden.
- Formeln, Nachschlagefelder, Zeitstempel und Nummern setzt Softr selbst.
- Gelöschte Datensätze werden neu angelegt und bekommen eine **neue ID**. Verknüpfungen, die auf die alte ID zeigten, danach prüfen.
- Fotos werden nicht automatisch zurückgeschrieben. Sie liegen in R2 unter `fotos/` und lassen sich von dort herunterladen und in Softr neu hochladen.

## Lokal ausführen

```bash
cd konzept/softr/sicherung
npm ci
export SOFTR_API_KEY=… R2_ACCOUNT_ID=… R2_ACCESS_KEY_ID=… R2_SECRET_ACCESS_KEY=… R2_BUCKET=kwm-lager-sicherung R2_JURISDICTION=eu
npm run sichern
node restore.mjs --datum 2026-10-04 --tabelle Unikate            # nur anzeigen
node restore.mjs --datum 2026-10-04 --tabelle Unikate --anwenden # zurückschreiben
```

Schlüssel gehören nie ins Repo, auch nicht in eine `.env` im Ordner (die ist ignoriert, aber trotzdem riskant).
