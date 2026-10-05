# Rücksprung auf den Stand „vor dem Aufräumen“ (Runde 14)

Stand vom 05.10.2026, bevor die Runde „Aufräumen und schnellere Abläufe“ begann. Er bleibt jederzeit zurückholbar.

## Wo der Stand liegt
- **Git:** Commit `90bbed1` auf dem Branch `claude/festive-babbage-grtoxg` (nie per Force-Push überschreiben). Code eines Blocks: `git show 90bbed1:konzept/softr/blocks/<datei>.tsx`.
- **Softr:** Jeder Block hat diesen Stand als eigene Version. Die neue Runde läuft auf getrennten Testseiten (`/v2-…`), die Blöcke unten bleiben bis zum Umschalten unverändert.

| Seite | Block-ID | Version Runde 14 (versionId) | sourceSha256 (Anfang) |
|---|---|---|---|
| `/erfassen` | `c2222c6c-2726-4590-9804-eef9c6d44ddb` | `9f59e1b4-e584-4d46-92e7-c989883b4560` | `37b65f69` |
| `/bestand` | `cab355a2-0a7f-47a2-863a-41d2bbf7cae5` | `6a96cdc4-f9e5-4319-b4f9-b6c1b28de12a` | `790dda7d` |
| `/` (Übersicht) | `c62602bd-dd73-44d6-9625-b59aec539939` | `16fc91d3-b4de-4417-bec9-fd6f2fd4d264` | `ce7c29b3` |
| `/tabelle` | `ad8e12f4-0372-492b-a713-87334990aa90` | `aac5fd8a-c36a-4e4e-8e89-0bf4610c2565` | `50c27c3f` |
| `/stammdaten` | `451b0d69-677c-4f15-9f15-87cae9021028` | `24eb3507-0760-4c84-8ce3-89126cd80568` | `1dea9081` |

## Zurückspringen
1. **Studio (ohne Technik):** Seite öffnen, Block wählen, Versionsverlauf, die Version mit „Runde 14“ im Namen wiederherstellen. Danach veröffentlichen.
2. **Per MCP:** `vibe_coding_block_restore_version` mit Block-ID und versionId aus der Tabelle. Eine Wiederherstellung bringt auch die damaligen Aktionsrechte mit.
3. **Aus Git:** `vibe_coding_block_update_code` mit dem Inhalt von `git show 90bbed1:konzept/softr/blocks/<datei>.tsx`, danach die Aktionsrechte laut `UEBERGABE.md` neu setzen.

## Datenbank
Die neue Runde legt Felder nur zusätzlich an (Editionsbestand „Rückgabe bis“ `nBkRl`; Unikate „Ort“ `6YbfO`, „Brennart“ `8D0WI`, „Glasurrezept“ `XhsmV`). Der alte Code liest sie nicht und läuft unverändert weiter.
