# Zitate angleichen: Vergleich vorher und nachher

Branch `zitate-angleichen`. Gleiche Rolle, gleiches Aussehen: aus acht Statement-Typen werden fünf (`lede`, `aussage`, `zitat`, `zitat-lang`, `gross`). Inhalte, Reihenfolge und Anzahl der Sätze sind unverändert.

## Die fünf Typen

| Typ | Rolle | Schrift und Größe |
|---|---|---|
| `lede` | Einleitungssatz der Startseite | Text, `--t-lede` |
| `aussage` | eigene Aussage der Werkstatt, ohne fremde Quelle | Display, `--t-statement`, Laufweite −0,02 em |
| `zitat` | kurzes Fremdzitat mit Quelle | Text, `--t-h3` |
| `zitat-lang` | langes Fremdzitat mit Quelle, hell wie dunkel | Text, `--t-quote` |
| `gross` | Zäsur, höchstens eine je Seite | Display, `--t-display` |

Größe von `zitat-lang`: `--t-quote`. Das Porträt-Zitat hat mit `--t-lede` auf dem Foto zwölf Zeilen gefüllt und das Bild fast verdeckt; auf der Seite Young-Jae Lee wäre `--t-lede` in der halben Spalte ebenfalls zu schwer. Mit `--t-quote` bleibt das Zitat an beiden Stellen gut lesbar (Foto: neun Zeilen, mobil zehn). Die Quelle erbt `--ink-2` aus dem Umfeld; auf dem Foto setzt `.sticky-bild__quote` dafür `--on-coal`, damit sie lesbar bleibt.

## Stellen

Bilder: Ausschnitt um den Satz, 1440 px und 390 px Breite, verkleinert.

| Seite | Satz | Typ vorher → nachher | Vorher | Nachher |
|---|---|---|---|---|
| Start | „Aus der ständigen Wiederholung einer handwerklichen Technik …“ | `lede` (unverändert) | [1440](zitate-vergleich/vorher-index-lede__text-1440.jpg), [390](zitate-vergleich/vorher-index-lede__text-390.jpg) | [1440](zitate-vergleich/nachher-index-lede__text-1440.jpg), [390](zitate-vergleich/nachher-index-lede__text-390.jpg) |
| Start | „Alle Meisterstücke stammen aus der Hand Young-Jae Lees …“ | `aussage` (unverändert) | [1440](zitate-vergleich/vorher-index-works__statement-1440.jpg), [390](zitate-vergleich/vorher-index-works__statement-390.jpg) | [1440](zitate-vergleich/nachher-index-works__statement-1440.jpg), [390](zitate-vergleich/nachher-index-works__statement-390.jpg) |
| Start | „Die Herstellung jedes neuen Gefäßes gleicht einer Meditation.“ | `aussage` (unverändert) | [1440](zitate-vergleich/vorher-index-med__quote-1440.jpg), [390](zitate-vergleich/vorher-index-med__quote-390.jpg) | [1440](zitate-vergleich/nachher-index-med__quote-1440.jpg), [390](zitate-vergleich/nachher-index-med__quote-390.jpg) |
| Start | „Die minimale Veränderung …“ (Gisela Jahn) | `zitat` (unverändert) | [1440](zitate-vergleich/vorher-index-artist__quote-1440.jpg), [390](zitate-vergleich/vorher-index-artist__quote-390.jpg) | [1440](zitate-vergleich/nachher-index-artist__quote-1440.jpg), [390](zitate-vergleich/nachher-index-artist__quote-390.jpg) |
| Start | Porträt: „Sie erzählte von den Zeremonien …“ (Catoir) | `zitat-bild` → `zitat-lang` | [1440](zitate-vergleich/vorher-index-sticky-bild__quote-1440.jpg), [390](zitate-vergleich/vorher-index-sticky-bild__quote-390.jpg) | [1440](zitate-vergleich/nachher-index-sticky-bild__quote-1440.jpg), [390](zitate-vergleich/nachher-index-sticky-bild__quote-390.jpg) |
| Meisterstücke | „In Anlehnung an die koreanische Tradition …“ | `regel` → `aussage` | [1440](zitate-vergleich/vorher-meisterstuecke-ms-intro__statement-1440.jpg), [390](zitate-vergleich/vorher-meisterstuecke-ms-intro__statement-390.jpg) | [1440](zitate-vergleich/nachher-meisterstuecke-ms-intro__statement-1440.jpg), [390](zitate-vergleich/nachher-meisterstuecke-ms-intro__statement-390.jpg) |
| Meisterstücke | „Vom Volumen bezieht die Schale …“ (Jahn) | `regel` → `zitat` | [1440](zitate-vergleich/vorher-meisterstuecke-catalog__quote-1440.jpg), [390](zitate-vergleich/vorher-meisterstuecke-catalog__quote-390.jpg) | [1440](zitate-vergleich/nachher-meisterstuecke-catalog__quote-1440.jpg), [390](zitate-vergleich/nachher-meisterstuecke-catalog__quote-390.jpg) |
| Meisterstücke | „Bauchige Becher, die ihr Inneres verbergen …“ (Wagner) | `regel` → `zitat` | [1440](zitate-vergleich/vorher-meisterstuecke-catalog__quote-1-1440.jpg), [390](zitate-vergleich/vorher-meisterstuecke-catalog__quote-1-390.jpg) | [1440](zitate-vergleich/nachher-meisterstuecke-catalog__quote-1-1440.jpg), [390](zitate-vergleich/nachher-meisterstuecke-catalog__quote-1-390.jpg) |
| Meisterstücke | „Das sinnliche Gespür […] reifte in der frühen Essener Zeit …“ (Jahn) | `regel` → `zitat` | [1440](zitate-vergleich/vorher-meisterstuecke-catalog__quote-2-1440.jpg), [390](zitate-vergleich/vorher-meisterstuecke-catalog__quote-2-390.jpg) | [1440](zitate-vergleich/nachher-meisterstuecke-catalog__quote-2-1440.jpg), [390](zitate-vergleich/nachher-meisterstuecke-catalog__quote-2-390.jpg) |
| Manufaktur | „Jedes Stück muss gut zu drehen sein …“ | `regel` → `aussage` | [1440](zitate-vergleich/vorher-manufaktur-mf-intro__rule-1440.jpg), [390](zitate-vergleich/vorher-manufaktur-mf-intro__rule-390.jpg) | [1440](zitate-vergleich/nachher-manufaktur-mf-intro__rule-1440.jpg), [390](zitate-vergleich/nachher-manufaktur-mf-intro__rule-390.jpg) |
| Manufaktur | „Alle Stücke werden in unserer Werkstatt in Handarbeit gefertigt …“ | `regel` → `aussage` | [1440](zitate-vergleich/vorher-manufaktur-zaesur__text-1440.jpg), [390](zitate-vergleich/vorher-manufaktur-zaesur__text-390.jpg) | [1440](zitate-vergleich/nachher-manufaktur-zaesur__text-1440.jpg), [390](zitate-vergleich/nachher-manufaktur-zaesur__text-390.jpg) |
| Young-Jae Lee | „Die minimale Veränderung …“ (Jahn) | `aussage` → `zitat` | [1440](zitate-vergleich/vorher-young-jae-lee-stance__quote-1440.jpg), [390](zitate-vergleich/vorher-young-jae-lee-stance__quote-390.jpg) | [1440](zitate-vergleich/nachher-young-jae-lee-stance__quote-1440.jpg), [390](zitate-vergleich/nachher-young-jae-lee-stance__quote-390.jpg) |
| Young-Jae Lee | Erinnerung: „Sie erzählte von den Zeremonien …“ (Catoir) | `zitat-klein` → `zitat-lang` | [1440](zitate-vergleich/vorher-young-jae-lee-catoir-1440.jpg), [390](zitate-vergleich/vorher-young-jae-lee-catoir-390.jpg) | [1440](zitate-vergleich/nachher-young-jae-lee-catoir-1440.jpg), [390](zitate-vergleich/nachher-young-jae-lee-catoir-390.jpg) |
| Young-Jae Lee | „Immer sind es Schalen, und doch ist keine wie die andere.“ (Wagner) | `gross` (unverändert) | [1440](zitate-vergleich/vorher-young-jae-lee-pullquote__quote-1440.jpg), [390](zitate-vergleich/vorher-young-jae-lee-pullquote__quote-390.jpg) | [1440](zitate-vergleich/nachher-young-jae-lee-pullquote__quote-1440.jpg), [390](zitate-vergleich/nachher-young-jae-lee-pullquote__quote-390.jpg) |

## Sichtbare Änderungen

- Meisterstücke, Manufaktur: Aussagen bekommen die Laufweite von `aussage` (−0,02 statt −0,015 em) und 22 statt 18 px Abstand zur Quelle.
- Meisterstücke: die drei Katalog-Zitate (Jahn, Wagner, Jahn) sind nun `zitat`, also Text-Schnitt in Titelgröße statt Display in Statement-Größe.
- Young-Jae Lee: das Jahn-Zitat steht wie auf der Startseite im Text-Schnitt in Titelgröße und in den Spalten 1 bis 8 (vorher Display, Spalten 1 bis 10).
- Start (Porträt): Catoir-Zitat in Zitatgröße statt Lede-Größe, Quelle in Meta-Größe statt Begleittext-Größe, Abstand zur Quelle 1 em.
- Young-Jae Lee (Erinnerung) und Start (Porträt) haben nun gleiche Größe und gleichen Quellenabstand.

## Vorschlag zum Reduzieren (nichts entfernt)

- Start: `works__statement` („Alle Meisterstücke stammen aus der Hand Young-Jae Lees …“) und der Einleitungssatz auf Meisterstücke („In Anlehnung an die koreanische Tradition …“) tragen ähnliche Aussagen wie Lede und Katalog; der Satz im Abschnitt Meisterstücke der Startseite ist der erste Kandidat.
- Start: `med__quote` („… gleicht einer Meditation“) und die Lede-Aussage über die Wiederholung der Technik sagen fast dasselbe.
- Dopplung: die H1 der Startseite und die Zäsur auf Young-Jae Lee (`gross`) tragen denselben Gedanken; eine der beiden Stellen genügt.
- Das Jahn-Zitat „Die minimale Veränderung …“ steht auf Start und Young-Jae Lee; auf einer Seite kürzen oder durch ein anderes Zitat ersetzen.
- Das Catoir-Zitat steht ebenfalls zweimal (Start-Porträt, Young-Jae Lee); auf der Startseite genügt der Anfang, auf Young-Jae Lee der volle Wortlaut.
- Meisterstücke: das Jahn-Zitat „Vom Volumen …“ und das zweite Jahn-Zitat stammen aus derselben Quelle; eines davon reicht.
