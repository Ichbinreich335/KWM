# Website-Prüfung: Begriffe, Angaben, Struktur (Stand 05.10.2026)

## Maßgebliche Fassung
- `origin/astro-umbau` (Commit 1f805be, 05.10.2026): Seiten in `src/pages/*.astro`. Neuer als `origin/main` (02.10., noch statisches `src/*.html` + `site/`).
- Inhalt von Manufaktur und Meisterstücke ist in `main` und `astro-umbau` textgleich (nur Umbruch). Zitate unten: Astro-Fassung (`src/pages/…`).
- Gebaut und geprüft (Astro lokal im Scratchpad, 6 Seiten, 1440 und 390 px): keine Konsolenfehler, kein horizontales Scrollen. Screens in `shots/`.
- Auf der Website gibt es **keine** Preise, Lagerorte oder interne Notizen (Suche nach €, Preis, Lager, verfügbar: nur AGB und Staatspreise). Kein Befund.

## Begriffe (wörtlich)
- Navigation (`src/data/navigation.ts`): **„Meisterstücke“** (Zusatz „Unikate aus der Hand von Young-Jae Lee“), **„Manufaktur“** („Geschirr, in der Werkstatt gedreht und glasiert“), „Young-Jae Lee“, „Werkstatt“, „Aktuelles“, „Besuch“.
- Startseite `index.astro:390-397` („Zwei Linien der Werkstatt“): Meisterstücke und Manufaktur. **Edition ist keine eigene Linie**, nur Unterkapitel.
- Seite `/manufaktur`: Titel und H1 **„Manufakturprogramm“** (`manufaktur.astro:7,18`). Unterkapitel (Subnav): **„Geschirr“, „Edition“, „Farben“, „Arbeitsweise“**. Zusatz: „unsere Geschirr-Serie“ (Z. 21).
- Seite `/meisterstuecke`: H1 „Meisterstücke“, Kapitel Schalen, Arbeitsweise, Kummen, Vasen. Das Wort „Unikat“ kommt dort nicht vor, nur in Navigation, Startseite und AGB.
- „Geschirr“, „Manufaktur“, „Manufakturprogramm“, „Edition“, „Meisterstücke“, „Unikate“ kommen alle vor. „Manufakturprogramm“ meint die Seite und das Gesamtprogramm (Geschirr plus Edition, `manufaktur.astro:1325`, `werkstatt.astro:87`).

## Angaben je Serie
| Angabe | Geschirr | Edition | Meisterstücke (Unikate) |
|---|---|---|---|
| Nummer | Ja, „Nr. 15“ (1–54, mit 6a, 35a, 40a, 43a, 48a). Fehlt bei Kugeldose (Z. 288) | **Nein** (Spalte leer) | Nein |
| Name | Ja („Brotteller“) | Ja („Zylindervase, klein“) | Ja („Schale, spitz, XXL“) |
| Maße | Ja | Ja | Ja, mehrere Stücke je Eintrag |
| Glasur/Farbe | nur über die Farbskala, nicht je Artikel | Farbprobe-Gruppe „Edition“, nicht je Artikel | Ja, je Stück: Glasurrezept, z. B. „Petalit-Eichenasche-Glasur“ |
| Preis | Nein | Nein | Nein (nur „Zu diesem Stück anfragen“) |
| Material | Bei Serie: „Westerwälder Steinzeugmasse“ | wie Geschirr (nicht eigens genannt) | Je Stück nicht, allgemein „Porzellan- und Steinzeugmassen“ |
| Hersteller:in | „in unserer Werkstatt in Handarbeit gefertigt“, keine Namen | wie Geschirr | „von ihr selbst gedreht, bemalt und glasiert“ (Young-Jae Lee) |
| Brennart | allgemein (950 / 1300 °C) | nein | Je Stück: Gasofen, Holzofen, Reduktion, teils °C |
| Entstehung | nein | nein | Ort und Jahr: „Essen 1995“, „2003–2005“ |
| Status | „nicht mehr im Programm“ (9 Artikel), „ohne Abbildung“ (3) | nein | nein; kein „ausgestellt“, kein „verkauft“ |
| Galerie | Foto je Gruppe, nicht je Artikel | wie Geschirr | Foto je Stück |

## Glasuren/Farben
- **Geschirr** (Farbskala, `manufaktur.astro:1139-1250`): weiß, hellgrün matt, hellgrün glänzend, dunkelgrün glänzend, dunkelgrün matt, rostbraun. Überschrift „Sechs Töne für das Geschirr.“ Heller/dunkler auf Wunsch wird **nirgends** erwähnt.
- **Edition**: hellblau; Craquelé: weiß, hellgrün, dunkelgrün (`:1252-1313`). Nur vier Proben, obwohl Fotos mehr zeigen (Türkis, Olivgrün, Schwarzgrau, Weiß mit Pinselmalerei).
- **Meisterstücke**: Keine Farbliste, nur Feldspatglasuren: Petalit-Eichenasche, Spodumen-Feldspat, Strontium-Feldspat, Barium-Feldspat, Wollastonit-Feldspat, Kalkspat, Magnesium-Zinn-Feldspat. Farbe nur in Fotobeschreibungen.
- Die Geschirrfotos zeigen mehr als sechs Töne (Beige, Seladon, Orange, Schwarz, Ocker, Dunkelbraun in den Alt-Texten, z. B. Z. 167 „Neue Serie“ Nr. 49–54). Die Farbskala nennt sie nicht.

## Maße
- Format: „Höhe × Breite/Ø cm“, deutsches Dezimalkomma, Einheit immer cm. Beispiele: „Ø 22,5 cm“, „6,0 × Ø 13,5 cm“, „13 × 34 cm“, „2,8 × 28 cm“.
- Edition: „H 14 cm, Ø 16,0 cm“. Meisterstücke: „H 16 cm, D 29,5 cm“.
- Mehrere Stücke: „H 29,5 cm, D 12,1 cm · H 21,3 cm, D 11,1 cm · …“. Ungefähr: „H ca. 49 cm“. Teekannen/Flaschen nur eine Zahl („12 cm“).

## Brände/Farbschwankungen
- Brände: Schrühbrand 950 °C (Elektroofen), Glasurbrand 1300 °C (Gasofen, reduzierend) (`manufaktur.astro:1339-1347`). Holzbrand: „oft nicht zu steuernde Verfärbungen“ (`meisterstuecke.astro:387`, `index.astro:1417`).
- Edition: „können je nach Brand unterschiedlich ausfallen“ (`manufaktur.astro:1142`). **Das ist die einzige Aussage zu Farbschwankung je Brand.**
- AGB (`agb.astro:128-130`): Abweichungen in Form, Farbe, Gewicht zumutbar, „Unikate“ im juristischen Sinn.

## Abweichungen und Unklarheiten
- **„Unikat“ uneinheitlich:** Nav und Startseite = Meisterstücke. AGB (`agb.astro:128,195,333,377`) nennt **alle** Produkte „handgemachte Einzelteile und somit Unikate“. Das widerspricht der Trennung Geschirr/Edition/Unikat.
- **Nr. 2020:** Die Kugeldose hat im Block „Weitere Stücke“ die Nr. 2020 (`manufaktur.astro:709`), im Block „Schalen und Schüsseln“ keine Nr. (Z. 288), im Edition-Block ebenfalls keine (Z. 1126). 2020 liegt im Edition-Nummernkreis (2001 ff.). Die Zuordnung (Geschirr oder Edition) ist ungeklärt.
- **Edition ohne Nummern** auf der Website, intern 2001 ff. Die Website zeigt die Edition-Nummern nicht.
- **Doppelte Einträge:** Koreanische Suppenschale Nr. 3, Salatschüssel Nr. 1/2, Müslischale Nr. 11, Koreanische Dose Nr. 42 und Spaghettiteller Nr. 10 stehen zweimal (Z. 270-290 und 691-725), dazu Kugeldose dreimal.
- „Manufaktur“ (Nav) und „Manufakturprogramm“ (Titel) und „Geschirr“ (Kapitel) heißen dasselbe. „Programm“ meint teils Geschirr, teils Geschirr plus Edition. Intern „Manufakturprogramm“ meint nur Geschirr.
- „Weitere ergänzende Geschirrstücke in der Edition“ (Z. 812) vs. „Edition unterscheidet sich in der Farbgebung“. Edition umfasst Vasen, Pflanzgefäße, Plattenteller, große Schalen.
- Schreibweise Durchmesser: „Ø“ (Geschirr/Edition) vs „D“ (Meisterstücke, `manufaktur.astro:1071` auch „D 50 cm“).
- Young-Jae Lee: „Seit 1986 geprägt“ (`index.astro:386`) vs „leitet seit 1987“ (`young-jae-lee.astro:21`); Rolle „Geschäftsführerin“ (`meisterstuecke.astro:46`) vs „Werkstatt-Leitung“ (`werkstatt.astro:327`).
- Meisterstücke sind aus den Jahren 1984 bis 2023 (nicht „ca. 10 pro Jahr“). Die Website zeigt eine Auswahl, keinen Jahresbestand.
- „Neue Serie“ (Nr. 49–54) ist Teil des Geschirrs mit eigenen Farben (Schwarz, Ocker), nicht in der Sechser-Skala.

## Empfehlungen für die Lager-App
- Serien exakt benennen: **Geschirr** (Nr. 1–56), **Edition** (Nr. 2001 ff.), **Meisterstück/Unikat** (Anzeige „Meisterstück“ wie Website, intern Unikat). Feld „Serie“ mit diesen drei Werten. „Manufakturprogramm“ nur als Oberbegriff für Geschirr plus Edition, nicht als Serienwert.
- Felder je Modell: Nr. (Text, wegen 6a/40a/43a), Name, Gruppe (Teller, Schalen und Schüsseln, Becher und Tassen, Töpfe und Dosen, Krüge/Kannen/Flaschen, Vasen, Plattenteller, Pflanzgefäße, Weitere), Maße, Status „nicht mehr im Programm“, Bildverweis.
- Maße als Felder Höhe, Breite, Durchmesser in cm (Kommazahl), Anzeige „H × Ø cm“. Mehrere Maße bei Unikaten je Stück.
- Glasur: Auswahl der sechs Geschirrtöne (genau wie Website, einschließlich matt/glänzend), plus Zusatzfeld „Glasur frei“ für Edition (Craquelé, Hellblau, Türkis …) und Hinweis „Ton heller/dunkler gewünscht“ als eigenes Feld. Unikate: Glasur frei (Rezeptname).
- Edition: Feld „Brand“ (Brandnummer oder Datum), weil Farbe je Brand schwankt. Unikat: Brennart (Gas-/Holzofen, Reduktion, °C), Jahr, Ort.
- Unikat: „gedreht, bemalt, glasiert von“ (immer Young-Jae Lee), Titel, Jahr, Ausstellung/Galerie-Foto. Status „ausgestellt“ ist auf der Website nicht vorgesehen. Wenn gewünscht, intern führen, nicht ausgeben.
- Preis und Lagerort bleiben intern, nie auf die Website.
- Klären: Kugeldose Nr. 2020 (Geschirr oder Edition?). Edition-Nummern 2001 ff. erst anlegen und auf der Website ergänzen, wenn gewünscht.
- AGB-Begriff „Unikate“ mit der Werkstatt klären, wenn Unikate eine feste Serie werden.
