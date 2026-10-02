# Übergabe Softr-Lager-App (Stand 02.10.2026, Session-Ende)

Für die nächste Session. Zuerst `CLAUDE.md`, `konzept/SOFTR-AUFTRAG.md` und `konzept/vergleich/SOFTR-BERICHT.md` lesen. Der Bericht enthält Stand, Admin-Schritte und Blocker.

## Arbeitsort
- **Branch `claude/softr-lager-app`, nur im Worktree `../KWM-softr` arbeiten.** Im Hauptordner `KWM` arbeitet parallel eine Design-Session auf `design-v2`. Deren ungespeicherte Änderungen dort nie anfassen. Vor jedem Commit `git branch --show-current` prüfen.
- Drei Softr-Commits liegen zusätzlich auf `design-v2` (94c2041, 1b41b55, aab6d8e). Inhaltlich sind es dieselben wie auf dem Softr-Branch. Beim Mergen von `design-v2` kann es dadurch Doppelungen geben, sonst sind sie harmlos.

## IDs
- Workspace `e8a9e57b-3039-4f76-90fd-f2c8e083fe54`, Integration „Softr databases“ `98c893c0-bd2f-4d53-a956-ba482b81b331`
- App **KWM Lager** `ec7c4118-0ec4-4e68-bb07-e711f8758c7f` (`celestina80104.softr.app`, nicht veröffentlicht)
- Datenbank **Keramik-Lager KWM** `4a2f1f1d-3c1b-409a-8bf0-247d4ea8a943`
  - Unikate `xwEM6w8Bh50qvZ`, Editionsbestand `YiXoQdoAOdAMKi`, Lagerorte `OkZyfUBDFSX9Q5`, Künstler:innen `jT3tn7aJ7XSPSD`, Glasuren `AnjVdW3LNfkOci`, Galerien `OvbAJbLAREp8w2`, Modelle `AP1Orb2GOIv5yr`, Ansichten `mAIslsfXtiURlR`
  - Feld-IDs stehen in den `q.select`-Aufrufen der Blöcke
- Nutzertabelle (alte DB „Keramik Lagerverwaltung“ `75f5aea7-…`, Tabelle Users `tEFkHenBq0S7Sw`, Feld Role `z0b2k`). Gruppen: Admin `cd647c55-6e21-402f-a7c6-1db87f5410f0`, Werkstatt `723ec91e-a533-4022-adc5-12182968b0af`. Testnutzer „Werkstatt Test“ `verwaltung.kwm+werkstatt@proton.me`.

| Seite | Page-ID | Block (Datei) | Block-ID | Datenquellen | Aktionsrechte |
|---|---|---|---|---|---|
| `/erfassen` | `8cba05b9-7689-4bdf-a275-d6988ecdb8eb` | `erfassen.tsx` | `c2222c6c-2726-4590-9804-eef9c6d44ddb` | unikate, edition, glasuren, kuenstler | alle ADD → LOGGED_IN_USERS |
| `/bestand` | `131c6c30-67d8-4939-87b8-b79f9bbe9bf6` | `bestand.tsx` | `cab355a2-0a7f-47a2-863a-41d2bbf7cae5` | unikate, edition | UPDATE → LOGGED_IN_USERS (Standard) |
| `/bestand` | dito | `bestand-admin.tsx` | `ebff8c25-217d-417f-98cb-bc2f660e3b78` | unikate | Block-Sichtbarkeit und UPDATE → nur Gruppe Admin |
| `/tabelle` | `1c5c5fed-5ec8-40df-8b13-4ae96ced2fdd` | `tabelle.tsx` | `ad8e12f4-0372-492b-a713-87334990aa90` | unikate, edition, ansichten | ADD ansichten → LOGGED_IN_USERS |
| `/uebersicht` | `16450fdc-1469-49fb-8785-acac62a5c953` | `uebersicht.tsx` | `c62602bd-dd73-44d6-9625-b59aec539939` | unikate, edition | keine |
| `/` (Home) | `089c7891-ebdd-44cf-b346-8d14a1a9a983` | `start-weiterleitung.tsx` | `9753e657-6e52-489f-9279-d9695beb5b1a` | keine | keine |

## Arbeitsweise (zwingend)
1. Vor Code-Änderungen `vibe_coding_block_get_docs` aufrufen.
2. Erst die Datei hier ändern, dann per MCP hochladen: klein per `vibe_coding_block_update_code_search_replace`, groß per `update_code`. Danach die zurückgegebene `sourceSha256` mit `shasum -a 256 <datei>` vergleichen.
3. **Nach jedem Hochladen die Aktionsrechte neu setzen** (Tabelle oben), denn Softr setzt sie beim Kompilieren zurück. Für den Admin-Block: UPDATE mit `customGroups: [Admin-ID]`.
4. Daten-Hooks nur mit Objekt-Literal aufrufen (keine Hilfsfunktion, kein `as never` am Argument).
5. Grids immer mit `grid-cols-1`, Blöcke mit `pb-28 sm:pb-8` (Softr-Leiste unten am Handy).
6. Vorschau: `application_preview` liefert einen Link, der den Stand zur Zeit des Aufrufs zeigt. Nach Änderungen einen neuen holen. Der Link ist ein Zugangsschlüssel, nicht ins Repo.
7. Playwright: Die App läuft in der Vorschau in einem iframe. Die innere URL (`…/seite?autoUser=true&t=…`) direkt öffnen. Blöcke rendern im Shadow DOM (Playwright-Locators gehen durch, `document.querySelector` nicht). Prüfskripte: `konzept/softr/pruefung/` (Aufruf siehe README dort, `PREVIEW_URL` als Umgebungsvariable).

## Offen (in dieser Reihenfolge)
1. **UI-Review einarbeiten:** Ein Opus-Agent mit Refero-MCP hat die vier Seiten bewertet. Leitfrage: „In 10 Minuten verständlich, volle Funktion bei Bedarf.“ Ergebnis: `konzept/vergleich/SOFTR-UI-REVIEW.md`, falls der Agent vor Session-Ende fertig wurde. Sonst den Review neu ausführen (Opus, Refero, Playwright Desktop/Mobil/Tablet, nichts speichern, nur bewerten).
2. **Übersicht:** Kacheln „Reserviert“ und „Verkauft“ auf `/tabelle?status=…` umstellen (zeigen noch auf `/bestand?tab=tabelle…`, das es nicht mehr gibt). Pro Bereich einen kurzen Satz „Was sehe ich hier?“ ergänzen (Wunsch Admin).
3. **Tabelle am Handy:** scrollt seitlich (vertretbar, aber prüfen: weniger Standardspalten auf Mobil).
4. **Werkstatt-Test:** „Preview as“ wirkt in der automatisierten Vorschau nicht. Nach der Veröffentlichung echter Login als Werkstatt. Bis dahin hat der Admin das manuell in Studio geprüft (noch offen).
5. Offene Frage für den Test-Abend: Umschalter „Unikat / Editionsware“ oben in der Erfassen-Maske beibehalten?
6. Admin-Schritte und Blocker: siehe `konzept/vergleich/SOFTR-BERICHT.md`.
7. Vor dem Merge: Skill `code-review` auf den Branch.
