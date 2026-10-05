# Startseite „Bauhaus als Prinzip“ (Vergleichsvariante)

Stand: 05.10.2026. Branch `startseite-bauhaus`, Vorschau https://startseite-bauhaus-kwm-redesign.entwicklung-7f3.workers.dev. Nur eine Vergleichsvariante: Gemergt wird erst, wenn der Admin entschieden hat.

**Auftrag des Admins (05.10.2026):** Die Landing ist zu voll, zu viel Text, obwohl Bilder mehr sagen. Minimalismus und Bauhaus kommen zu kurz. Gemeint ist **Bauhaus als Prinzip**: Reduktion, Raster, Grundformen, Form aus dem Gebrauch. Farbwelt und Schriften bleiben, ebenso der eigene Charme der Seite.

## 1. Konzept in fünf Sätzen

1. **Ein Abschnitt, ein Satz, ein Bild.** Jeder Abschnitt hat eine Überschrift und ein Bildelement. Begleittexte haben höchstens zwei Zeilen. Alles, was erklärt, steht auf den Unterseiten.
2. **Bauhaus wird eine eigene Station und rückt nach vorn.** Gleich nach „Aktuell“ steht sie an der Stelle des alten Einleitungssatzes. Statt den Satz „Bauhaus“ zu wiederholen, zeigt sie das Prinzip: drei Grundformen des Geschirrs (Teller, Schale, Krug) streng im Raster, darunter die sechs Glasuren im selben Raster. Form mal Farbe ergibt das Programm.
3. **Das Raster wird sichtbar, ohne es zu zeichnen.** Grundformen (je 4 Spalten) und Farbskala (je 2 Spalten) teilen dieselben Spaltenkanten. Ein Bauhaus-Zitat als Stil (Rot, Gelb, Blau, Kreis, Quadrat, Dreieck, Groteskschrift) gibt es nicht.
4. **Die Reise bleibt.** Einstieg, Aktuell, Werkstatt und Prinzip, Person, Werke, Orte, Wiederholung, Feuer, Herkunft, Besuch. Die starken Elemente bleiben: Porträt, Lebensweg, Orte zum Aufklappen, 99 Schalen, Farbskala, Feuer, Chronik.
5. **Weniger Abschnitte, mehr Luft.** Aus 12 Abschnitten werden 10, der Text schrumpft auf etwa die Hälfte. Dopplungen fallen weg (Einleitungssatz, Zwei Linien, Meditation, zweites Jahn-Zitat).

## 2. Abschnittsfolge alt → neu

| Alt | Typ | Neu | Typ | Was passiert |
|---|---|---|---|---|
| 1 Einstieg: Zitat, Kummerschalen, Einleitung, zwei Links | hell | 1 Einstieg | hell | bleibt; die Einleitung wird ein kurzer Satz |
| 2 Aktuell | Anker | 2 Aktuell | Anker | bleibt unverändert (häufigster Besuchsgrund) |
| 3 Einleitungssatz und „Zwei Linien“ | hell, ohne Bild | 3 **Bauhaus: Grundformen und Farbskala** | hell | ersetzt Einleitung, Zwei Linien und Manufaktur |
| 4 Young-Jae Lee: Name, Porträt mit langem Zitat, Jahn-Zitat, Lebensweg | hell, Bild | 4 Young-Jae Lee: Name, Porträt mit einem Satz, Lebensweg | hell, Bild | Jahn-Zitat und Absatz „Zwei Traditionen“ fallen weg |
| 5 Meisterstücke: Einzelwerk mit Aussage, sechs Werke | hell | 5 Meisterstücke: Einzelwerk groß, sechs Werke | hell | die Aussage fällt weg, das Bild wird größer |
| 6 Ausstellungsorte | Anker | 6 Ausstellungsorte | Anker | bleibt |
| 7 Meditation: Satz, Absatz, Bild | hell, ohne Bezug | 7 99 Schalen: Satz und Ring | Fläche | Meditation fällt weg, der Ring ist das Bild der Haltung |
| 8 99 Schalen: Satz, langes Zitat, Ring | Fläche | (in 7) | | langes Wagner-Zitat wandert auf Young-Jae Lee |
| 9 Manufaktur: Kopf, Farbskala, Regal, Fakten, Krüge | hell | (in 3) | | Farbskala wandert in die Bauhaus-Station |
| 10 Feuer | Bild | 8 Feuer | Bild | ein Satz statt drei |
| 11 Chronik: neun Stationen mit Text | Fläche, ohne Bild | 9 Chronik: Jahr und Titel | Fläche | Texte stehen vollständig auf /werkstatt |
| 12 Besuch und Anfrage | hell | 10 Besuch und Anfrage | hell | Begleittext entfällt, Zeiten und Formular bleiben |

**Hell/Dunkel:** hell → Anker → hell → hell mit dunklem Porträt → hell → Anker → Fläche → Feuer (dunkles Bild) → Fläche → hell → Footer (Anker). Nie zwei Anker hintereinander, etwa alle zwei bis drei Bildschirme ein dunkler Halt.

## 3. Die Bauhaus-Station

- **Überschrift:** „Seit 1927 in der Tradition des Bauhauses.“
  - Beleg: Chronik 1927 (`src/data/chronik.ts`): Johannes Leßmann, Schüler des Bauhaus-Keramikers Otto Lindig, stellt „bei strenger Einhaltung der Formgebungsprinzipien des Bauhauses“ auf Serienkeramik um.
  - Beleg: Young-Jae Lee im Interview („Der Ruf des Bauhaus“, urbanana 2023, `konzept/CONTENT-FUNDE.md` 2.1): Die Werkstatt sei keine Bauhauswerkstatt, „doch in dieser Tradition verwurzelt“. Deshalb „in der Tradition“ statt „Bauhauswerkstatt“.
- **Begleitzeile (eine Zeile):** „Wir gehen immer von geometrischen Grundformen aus.“, Young-Jae Lee (wörtlich aus demselben Interview).
- **Bild: drei Grundformen.** Teller, Schale, Krug, je ein Foto aus dem Manufakturprogramm im Format 3:2 (`teller.webp`, `schalen3.webp`, `kannen.webp`). Gleiches Licht, gleicher Grund, je 4 Spalten, Beschriftung nur mit dem Namen. Beleg für die Auswahl: „zuerst 25 Grundelemente eines Geschirrs – Teller, Schalen, Krüge“ (`src/pages/manufaktur.astro`).
- **Darunter die Farbskala** (vorhandene Signatur `SigFarbskala`, interaktiv) im selben Raster, dazu ein Satz: „Alle Teile eines Geschirrs, gleich welcher Farbe, sollten miteinander kombinierbar sein.“ (bisheriges Zitat der Manufaktur, wörtlich). So zeigt die Station, was das Prinzip bedeutet: wenige Formen, sechs Farben, alles passt zusammen.
- **Link:** „Zum Manufakturprogramm“.

## 4. Entscheidungen im Einzelnen

- **99-Schalen-Ring bleibt in voller Größe.** Er ist das stärkste Bild für Wiederholung und Differenz und ersetzt den Meditationsabsatz. Der Ring ist interaktiv und verweist auf die laufende Ausstellung. Kompakter würde er zum Ornament.
- **Lebensweg bleibt.** Fünf Stationen auf einer Linie, ein Bild der Reise von Seoul nach Essen. Die Texte stammen aus `lebensweg.ts` und sind schon kurz.
- **Porträt-Zitat gekürzt** auf den Schluss: „… eine nach der anderen, ohne je darüber müde zu werden.“ (Catoir, wörtlich mit Auslassung). Das ganze Zitat steht auf /young-jae-lee („Eine nach der anderen.“).
- **Chronik nur mit Jahr und Titel**, sieben statt neun Stationen. Die Jahreszahlen sind das Bild. Wer mehr will, folgt dem Link zur ganzen Chronik.
- **Aktuell und Orte bleiben unverändert.** Sie sind Inhalt (wo jetzt etwas zu sehen ist), kein Begleittext.

## 5. Inspiration (Refero)

Nachgesehen über den MCP `refero` (Stile mit Vorschaubild, 14 angesehen). Übernommen werden Prinzipien und Strukturideen, keine fremde Optik. Farbwelt, Schriften, Porträt, Feuer, Orte und Farbskala bleiben unsere.

| Beispiel | Was es macht | Übernehmen | Bewusst nicht |
|---|---|---|---|
| [B—Line](https://www.b-line.it) | Objekte freigestellt auf gleichem Grau, gleiche Kachelgröße, nur der Name als Beschriftung | Grundformen-Reihe: gleiche Kachel, gleicher Grund, nur der Name | Riesen-Wortmarke, Schreibmaschinenschrift |
| [Palmer Dinnerware](https://www.palmer-dinnerware.com) | Geschirr als Objekte im leeren Feld, Farbe nur aus der Glasur | bestätigt: Farbe kommt nur aus dem Material (DESIGN.md §1); 99-Schalen-Ring als Bild | frei schwebendes Ziehfeld, Pillen-Knöpfe |
| [V–A–C](https://v-a-c.org/en) | strenges Mehrspaltenraster, eine Meta-Zeile über jedem Bild, viel Luft | ein Bild, eine Zeile; Abschnitte ohne Zwischentexte | gedrehte Seitenlabels, Grotesk |
| [19–86](https://19-86.fr) | Index aus Jahr und Titel mit Haarlinien, eine Zahl als Monument | Chronik nur mit Jahr und Titel, die Jahreszahl trägt | Tabellenkopf, Versalien |
| [MANNA](https://www.mannaarchitects.com) | große Fotos, darunter genau ein Satz Bildunterschrift | Bildunterschrift statt Absatz | Beige-Grund, Versalien-Marke |
| [Christopher Ireland](https://christopherireland.net) | wenige große Serifen-Einträge links, ein Bild rechts | große Serife als einzige Hierarchie | Plus-Zeichen als Aufklapper |
| [Waka Waka](https://wakawaka.world) | ein großes und ein kleines Bild, Größenkontrast statt Text | Einzelwerk groß, Werkschau kleiner | Plakat-Grotesk, schmales Blatt |
| [Atlason](https://atlason.com) | Spalten mit einem Wort als Kopf, ein einziger Satz als Haltung | ein Satz als Haltung je Abschnitt | Collage aus beliebig großen Bildern |
| [Katherine Pihl](https://katherinepihl.com) | gleichmäßiges Raster, Name und Art in einer Zeile | gleiche Formate je Reihe (DESIGN.md §4) | Kategorienfilter |
| [Bibliothèque](https://bibliothequedesign.com) | ein Bild in viel Schwarz, sonst nichts | dunkle Abschnitte mit genau einem Bild (Feuer, Porträt) | leere Startseite ohne Orientierung |
| [Index Space](https://index-space.org) | großer Serifensatz mit eingebetteten Links | große Serife als Stimme | Links als Kästen im Satz |
| [Acme Cups](https://acmecups.nz) | Vollbildfoto mit abgedunkeltem Satz | (nichts) | Abdunklung, laute Produktinszenierung |
| [Mono X7](https://mono.frm.fm/en) | sichtbare Rahmenlinien als Raster | (nichts), unser Raster bleibt unsichtbar | Kastenraster, Versalienlabels |
| [Silencio](https://silencio.es) | Objekte schwebend im Weiß | (nichts) | Unschärfe, Schweben |

**Zusammengefasst:** Das Raster ordnet, wird aber nicht gezeichnet. Je Reihe ein Format und eine Beschriftungsart. Ein Satz ersetzt einen Absatz. Prinzipien zeigen sich in Wiederholung (gleiche Kacheln, gleiche Kanten), nicht in Dekor.
