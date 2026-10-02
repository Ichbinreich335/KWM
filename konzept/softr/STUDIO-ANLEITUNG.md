# Studio-Anleitung: fertige Softr-Blöcke zur Probe

Stand 02.10.2026. Entscheidung des Admins: „Fertige Blöcke zuerst“. Vibe-Code bleibt nur dort, wo Softr etwas nicht kann. Regeln laufen als Softr-Workflows auf der Datenbank (siehe unten).

Die beiden Seiten sind schon angelegt und leer. Sie stehen neben den bisherigen Seiten, damit wir vergleichen können. Nichts Bestehendes wird verändert.

- Seite **Stück** (`/stueck`): https://studio.softr.io/applications/ec7c4118-0ec4-4e68-bb07-e711f8758c7f/pages/57958266-8b78-4ea5-83c4-6d9f94e20d7a
- Seite **Alle Stücke (Softr-Tabelle)** (`/alle-stuecke`): https://studio.softr.io/applications/ec7c4118-0ec4-4e68-bb07-e711f8758c7f/pages/69071c68-7879-40b4-a69a-4f01cc20e228

Falls Studio schon offen ist: einmal neu laden, sonst erscheinen die Seiten nicht.

## 1. Objektseite „Stück“ (ca. 15 Minuten)

1. Seite **Stück** öffnen, **+ Block hinzufügen** → **Item Details** (Detailansicht).
2. **Source:** Softr Databases → Datenbank „Keramik-Lager KWM“ → Tabelle **Unikate**.
3. **Content → Item Fields**, in dieser Reihenfolge:
   - Fotos (Typ: Image gallery)
   - Name (Überschrift), Inventarnummer
   - Status, Lagerort, Partner, Außer Haus seit, Rückgabe bis
   - Typ, Künstler:in, Jahr, Glasur, Maße
   - Preis intern, Verkauft am, Auf Website zeigen
   - Notiz, Bildnachweis
4. **Actions → Item buttons → Edit record**, Beschriftung „Bearbeiten“:
   - Felder: Name, Typ, Status, Künstler:in, Jahr, Glasur, Maße, Fotos, Bildnachweis, Lagerort, Partner, Rückgabe bis, Notiz
   - Sichtbarkeit: **Logged-in users**
5. Zweiter Knopf **Edit record**, Beschriftung „Preis und Website“:
   - Felder: Preis intern, Auf Website zeigen, Verkauft am
   - Sichtbarkeit: nur Nutzergruppe **Admin**
6. Kein „Delete record“ anlegen. Löschen bleibt in der Datenbank beim Admin.

Aufruf: `/stueck?recordId=<ID>`. Die Tabelle unten verlinkt automatisch dorthin.

## 2. Tabelle „Alle Stücke“ (ca. 15 Minuten)

1. Seite **Alle Stücke (Softr-Tabelle)** öffnen, **+ Block hinzufügen** → **Table**.
2. **Source:** dieselbe Datenbank, Tabelle **Unikate**.
3. **Content → Item Fields** (Spalten): Fotos (klein), Inventarnummer, Name, Typ, Status, Lagerort, Partner, Künstler:in, Jahr, Glasur, Preis intern, Rückgabe bis, Verkauft am.
4. **Search Bar → Search by input:** Name, Inventarnummer, Notiz.
5. **Filter** für Nutzer hinzufügen: Status, Typ, Lagerort, Partner, Künstler:in.
6. **Sortierung:** Inventarnummer absteigend (Neueste oben).
7. **Actions → Item buttons → Open details page** → Seite **Stück**. Dadurch wird jede Zeile zur eigenen Objektseite.
8. **Actions → Topbar → Export** (nur für Admin sichtbar).
9. Optional: Bei Status und Lagerort **Allow editing** einschalten, dann ändert man sie direkt in der Zelle.

## 3. Navigation

Im Kopf-/Fußmenü (Header-Block) einen Eintrag **Tabelle** auf `/alle-stuecke` anlegen. Den Eintrag für `/tabelle` vorerst stehen lassen, bis wir verglichen haben.

## Danach

Kurz Bescheid geben. Ich prüfe beide Seiten mit Playwright als Werkstatt- und als Admin-Nutzer (Desktop und Handy) und vergleiche sie mit der bisherigen Tabelle. Danach entscheiden wir, was bleibt.

## Regeln, die jetzt als Workflow laufen (schon aktiv)

| Workflow | Wenn | Dann |
|---|---|---|
| Außer Haus setzt Lagerort | Status „in Kommission“ oder „ausgestellt“ und Lagerort nicht „Außer Haus“ | Lagerort = Außer Haus |
| Außer Haus setzt Datum | Status „in Kommission“ oder „ausgestellt“ und „Außer Haus seit“ leer | Außer Haus seit = heute |
| Zurück im Haus leert Außer-Haus-Felder | Status „verfügbar“ oder „reserviert“ und Lagerort „Außer Haus“ | Lagerort, Partner, Außer Haus seit und Rückgabe bis leeren |
| Verkauft setzt Verkaufsdatum | Status „verkauft“ und „Verkauft am“ leer | Verkauft am = heute |

Die Regeln greifen überall: in jedem Block, im Formular und bei Änderungen direkt in der Datenbank. Sie laufen nach 2 bis 3 Sekunden. Grenze: Die Workflows rechnen „heute“ in UTC. Zwischen 0 und 2 Uhr nachts würde also der Vortag eingetragen.

Offen (Admin entscheidet): Soll „verkauft“ den Lagerort leeren? Soll der Partner beim Verkauf über die Galerie erhalten bleiben? Derzeit bleiben beide unverändert.
