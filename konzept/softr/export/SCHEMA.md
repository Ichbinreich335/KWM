# Schema Softr-Datenbank „Keramik-Lager KWM“

Datenbank-ID: `4a2f1f1d-3c1b-409a-8bf0-247d4ea8a943`. Export per Softr-MCP, nur lesend, Stand 2026-10-03. Vorlage für den Nachbau in Baserow.

## Partner

- Tabellen-ID: `OvbAJbLAREp8w2`
- Zweck: Wo Stücke außer Haus sind: Galerien (Kommission), Museen, Ausstellungen, Leihnehmer. Primärfeld: Name.
- Felder: 6, Datensätze: 3

| Name | Feld-ID | Typ | Optionen | Pflicht / nur lesen |
|---|---|---|---|---|
| Name | `a4yfc` | SINGLE_LINE_TEXT | Text, einzeilig | weder Pflicht noch schreibgeschützt |
| Kontakt | `lnhez` | LONG_TEXT | Text, mehrzeilig | weder Pflicht noch schreibgeschützt |
| Zusammenarbeit | `uEfkz` | SELECT | Einfachauswahl: aktiv \| beendet | weder Pflicht noch schreibgeschützt |
| Notiz | `8pLh8` | LONG_TEXT | Text, mehrzeilig | weder Pflicht noch schreibgeschützt |
| Ort | `RQRec` | SINGLE_LINE_TEXT | Text, einzeilig | weder Pflicht noch schreibgeschützt |
| Art | `ZS9HU` | SELECT | Einfachauswahl: Galerie \| Museum \| Ausstellung / Messe \| Leihnehmer privat | weder Pflicht noch schreibgeschützt |

## Lagerorte

- Tabellen-ID: `OkZyfUBDFSX9Q5`
- Zweck: Feste Liste der Lagerorte (einheitliche Filterwerte). Primärfeld: Name.
- Felder: 2, Datensätze: 6

| Name | Feld-ID | Typ | Optionen | Pflicht / nur lesen |
|---|---|---|---|---|
| Name | `AoOjs` | SINGLE_LINE_TEXT | Text, einzeilig | weder Pflicht noch schreibgeschützt |
| Bereich | `5h1mS` | SELECT | Einfachauswahl: Schauraum \| Lager \| Extern | weder Pflicht noch schreibgeschützt |

## Künstler:innen

- Tabellen-ID: `jT3tn7aJ7XSPSD`
- Zweck: Wer ein Unikat gefertigt hat. Reine Auswahlliste. Primärfeld: Name.
- Felder: 1, Datensätze: 3

| Name | Feld-ID | Typ | Optionen | Pflicht / nur lesen |
|---|---|---|---|---|
| Name | `vqD0c` | SINGLE_LINE_TEXT | Text, einzeilig | weder Pflicht noch schreibgeschützt |

## Glasuren

- Tabellen-ID: `AnjVdW3LNfkOci`
- Zweck: Einheitliche Glasurnamen für Unikate und Editionsware. Reine Auswahlliste. Primärfeld: Name.
- Felder: 1, Datensätze: 10

| Name | Feld-ID | Typ | Optionen | Pflicht / nur lesen |
|---|---|---|---|---|
| Name | `OuhBi` | SINGLE_LINE_TEXT | Text, einzeilig | weder Pflicht noch schreibgeschützt |

## Modelle

- Tabellen-ID: `AP1Orb2GOIv5yr`
- Zweck: Modelle der Editionsware (Form, Typ, Maße, Foto). Der Editionsbestand verweist darauf. Primärfeld: Name.
- Felder: 10, Datensätze: 86 (81 aus dem Katalog 04/2026, 5 Demo archiviert)

| Name | Feld-ID | Typ | Optionen | Pflicht / nur lesen |
|---|---|---|---|---|
| Name | `eXo5w` | SINGLE_LINE_TEXT | Text, einzeilig | weder Pflicht noch schreibgeschützt |
| Typ | `gCX7K` | SELECT | Einfachauswahl: Teller \| Schale \| Becher \| Vase \| Karaffe \| Übertopf \| Tasse \| Krug \| Kanne \| Flasche \| Dose \| Topf \| Sieb \| Blatt | weder Pflicht noch schreibgeschützt |
| Maße | `h65qx` | SINGLE_LINE_TEXT | Text, einzeilig | weder Pflicht noch schreibgeschützt |
| Foto | `GbUfa` | ATTACHMENT | Anhang, einzeln, Vorschau (Links laufen nach 2 Stunden ab) | weder Pflicht noch schreibgeschützt |
| Archiviert | `3tlrw` | CHECKBOX | Archivierte fehlen in Auswahllisten | weder Pflicht noch schreibgeschützt |
| Artikelnr. | `BNpSN` | SINGLE_LINE_TEXT | Artikelnummer der Preisliste, z. B. 2001, 2018a | weder Pflicht noch schreibgeschützt |
| VK-Preis | `772dM` | CURRENCY | €, 2 Nachkommastellen, Verkaufspreis brutto laut Preisliste | weder Pflicht noch schreibgeschützt |
| Programm | `Mrgtb` | SELECT | Edition \| Manufakturprogramm | weder Pflicht noch schreibgeschützt |
| Name englisch | `CyPYU` | SINGLE_LINE_TEXT | laut Anfrageformular | weder Pflicht noch schreibgeschützt |
| Glasuren | `EazCZ` | LINKED_RECORD | mehrfach → Glasuren (Gegenfeld `PQup2`). Eine Glasur = fest, mehrere = Auswahl beim Erfassen | weder Pflicht noch schreibgeschützt |

## Unikate

- Tabellen-ID: `xwEM6w8Bh50qvZ`
- Zweck: Einzelstücke mit Künstler:in, Glasuren, Status, Lagerort bzw. Partner, internem Preis und Website-Freigabe. Inventarnummer U-JJJJ-NNN wird per Formel erzeugt. Primärfeld: Name.
- Felder: 22, Datensätze: 14

| Name | Feld-ID | Typ | Optionen | Pflicht / nur lesen |
|---|---|---|---|---|
| Name | `7IBVW` | SINGLE_LINE_TEXT | Text, einzeilig | weder Pflicht noch schreibgeschützt |
| Nummer | `T63YN` | AUTONUMBER | Automatische Zählung (Zähler steht bei 14) | nur lesen |
| Typ | `7g9jI` | SELECT | Einfachauswahl: Teller \| Schale \| Becher \| Vase \| Karaffe \| Übertopf \| Krug | weder Pflicht noch schreibgeschützt |
| Status | `SEUyZ` | SELECT | Einfachauswahl: verfügbar \| reserviert \| verkauft \| in Kommission \| ausgestellt | weder Pflicht noch schreibgeschützt |
| Künstler:in | `oDNBh` | LINKED_RECORD | Zieltabelle: Künstler:innen (jT3tn7aJ7XSPSD), einfach, ohne Rückverweis | weder Pflicht noch schreibgeschützt |
| Jahr | `ZIHrT` | NUMBER | 0 Nachkommastellen, Tausendertrennzeichen an | weder Pflicht noch schreibgeschützt |
| Glasur | `ByeH3` | LINKED_RECORD | Zieltabelle: Glasuren (AnjVdW3LNfkOci), mehrfach, ohne Rückverweis | weder Pflicht noch schreibgeschützt |
| Maße | `KDUVZ` | SINGLE_LINE_TEXT | Text, einzeilig | weder Pflicht noch schreibgeschützt |
| Fotos | `rqreT` | ATTACHMENT | Anhang, einzeln, Vorschau, Bilddatei (Links laufen nach 2 Stunden ab) | weder Pflicht noch schreibgeschützt |
| Bildnachweis | `QqQo6` | SINGLE_LINE_TEXT | Text, einzeilig | weder Pflicht noch schreibgeschützt |
| Lagerort | `EkVC3` | LINKED_RECORD | Zieltabelle: Lagerorte (OkZyfUBDFSX9Q5), einfach, ohne Rückverweis | weder Pflicht noch schreibgeschützt |
| Partner | `NfsXv` | LINKED_RECORD | Zieltabelle: Partner (OvbAJbLAREp8w2), einfach, ohne Rückverweis. Beschreibung: Galerie, Museum oder Ausstellung, bei Status „in Kommission“ oder „ausgestellt“ | weder Pflicht noch schreibgeschützt |
| Preis intern | `N9yfT` | CURRENCY | 0 Nachkommastellen, Symbol € vor dem Betrag, Tausendertrennzeichen an | weder Pflicht noch schreibgeschützt |
| Auf Website zeigen | `e5hSY` | CHECKBOX | Ja/Nein | weder Pflicht noch schreibgeschützt |
| Notiz | `Ku4py` | LONG_TEXT | Text, mehrzeilig | weder Pflicht noch schreibgeschützt |
| Erfasst von | `zjHi8` | SINGLE_LINE_TEXT | Text, einzeilig | weder Pflicht noch schreibgeschützt |
| Erfasst am | `p4ha0` | CREATED_AT | Datum + Zeit, automatisch | nur lesen |
| Geändert am | `aGhiL` | UPDATED_AT | Datum + Zeit, bei jeder Änderung eines editierbaren Feldes | nur lesen |
| Inventarnummer | `glG6V` | FORMULA | Formel: "U-" & YEAR({Erfasst am}) & "-" & RIGHT("00" & {Nummer}, 3). Ergebnis Text. Beschreibung: Automatisch: U-Jahr der Erfassung-laufende Nummer, z. B. U-2026-013 | nur lesen |
| Verkauft am | `48BXo` | DATETIME | Nur Datum. Beschreibung: Setzt die App automatisch, wenn der Status auf „verkauft“ wechselt. | weder Pflicht noch schreibgeschützt |
| Außer Haus seit | `Evxm2` | DATETIME | Nur Datum | weder Pflicht noch schreibgeschützt |
| Rückgabe bis | `ENQkk` | DATETIME | Nur Datum | weder Pflicht noch schreibgeschützt |

## Editionsbestand

- Tabellen-ID: `YiXoQdoAOdAMKi`
- Zweck: Editionsware: eine Zeile pro Modell + Glasur + Zustand mit Stückzahl und Lagerort. Bezeichnung setzt die App automatisch (Modell · Glasur/Rohling). Primärfeld: Bezeichnung.
- Felder: 11, Datensätze: 10

| Name | Feld-ID | Typ | Optionen | Pflicht / nur lesen |
|---|---|---|---|---|
| Bezeichnung | `LFUIR` | SINGLE_LINE_TEXT | Text, einzeilig | weder Pflicht noch schreibgeschützt |
| Modell | `jxN6x` | LINKED_RECORD | Zieltabelle: Modelle (AP1Orb2GOIv5yr), einfach, ohne Rückverweis | weder Pflicht noch schreibgeschützt |
| Glasur | `pbGEk` | LINKED_RECORD | Zieltabelle: Glasuren (AnjVdW3LNfkOci), einfach, ohne Rückverweis | weder Pflicht noch schreibgeschützt |
| Zustand | `WUkN3` | SELECT | Einfachauswahl: Rohling \| glasiert | weder Pflicht noch schreibgeschützt |
| Anzahl | `Ciiwp` | NUMBER | 0 Nachkommastellen, Minimum 0 | weder Pflicht noch schreibgeschützt |
| Lagerort | `T5iQe` | LINKED_RECORD | Zieltabelle: Lagerorte (OkZyfUBDFSX9Q5), einfach, ohne Rückverweis | weder Pflicht noch schreibgeschützt |
| Foto | `nibt5` | ATTACHMENT | Anhang, einzeln, Vorschau (Links laufen nach 2 Stunden ab) | weder Pflicht noch schreibgeschützt |
| Notiz | `lyJky` | LONG_TEXT | Text, mehrzeilig | weder Pflicht noch schreibgeschützt |
| Erfasst am | `0x7rU` | CREATED_AT | Datum + Zeit, automatisch | nur lesen |
| Zuletzt geändert | `JZyKO` | UPDATED_AT | Datum + Zeit, bei jeder Änderung eines editierbaren Feldes | nur lesen |
| Typ | `8Vs2H` | LOOKUP | Nachschlagefeld über Feld „Modell“ (jxN6x) auf Modelle.Typ (gCX7K), Ergebnis Einfachauswahl: Teller \| Schale \| Becher \| Vase \| Karaffe \| Übertopf \| Tasse \| Krug \| Kanne \| Flasche \| Dose \| Topf \| Sieb \| Blatt | nur lesen |

## Ansichten

- Tabellen-ID: `mAIslsfXtiURlR`
- Zweck: Gespeicherte Filter der Bestandstabelle (JSON in „Definition“). Legt die App an, für alle Mitarbeitenden sichtbar. Primärfeld: Name.
- Felder: 4, Datensätze: 3

| Name | Feld-ID | Typ | Optionen | Pflicht / nur lesen |
|---|---|---|---|---|
| Name | `8s5KL` | SINGLE_LINE_TEXT | Text, einzeilig | weder Pflicht noch schreibgeschützt |
| Definition | `rWGS9` | LONG_TEXT | Text, mehrzeilig | weder Pflicht noch schreibgeschützt |
| Erstellt von | `uPraE` | SINGLE_LINE_TEXT | Text, einzeilig | weder Pflicht noch schreibgeschützt |
| Erstellt am | `FjeKY` | CREATED_AT | Datum + Zeit, automatisch | nur lesen |

## Beziehungen

- Unikate.Künstler:in verweist auf Künstler:innen (einfach)
- Unikate.Glasur verweist auf Glasuren (mehrfach)
- Unikate.Lagerort verweist auf Lagerorte (einfach)
- Unikate.Partner verweist auf Partner (einfach)
- Modelle verweist auf keine Tabelle
- Editionsbestand.Modell verweist auf Modelle (einfach)
- Editionsbestand.Glasur verweist auf Glasuren (einfach)
- Editionsbestand.Lagerort verweist auf Lagerorte (einfach)
- Editionsbestand.Typ ist ein Nachschlagefeld: über Modell auf Modelle.Typ
- Partner, Lagerorte, Künstler:innen, Glasuren, Ansichten verweisen auf nichts
- Keine Rückverweisfelder (inverseLinkFieldId überall leer)

## Hinweise für den Nachbau

- Es sind keine Felder als Pflicht markiert.
- Unikate.Nummer ist ein Autonummern-Feld (Baserow: Autonummer), Inventarnummer eine Formel darauf.
- Anhänge: Die CSVs enthalten nur Dateinamen. Die Bilddateien selbst müssen separat übertragen werden (signierte Links laufen nach 2 Stunden ab).
- Die Automatisierungen der Softr-App (Bezeichnung setzen, „Verkauft am“ setzen) sind nicht Teil der Tabellen und hier nicht erfasst.
