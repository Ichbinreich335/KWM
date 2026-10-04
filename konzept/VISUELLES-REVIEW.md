# Visuelles Review: externe Kritik geprüft

Original der externen Kritik: siehe Abschnitt am Ende. Screens liegen lokal in `../KWM-astro/.shots/visual-review/` (nicht im Repo); Pfadangaben `seg/…` beziehen sich darauf.


Stand: 04.10.2026. Geprüft wurde die Vorschau `phase-c3-bilder` (enthält Phase B-1, B-2, C1–C3), headless Chromium, `reducedMotion: 'reduce'` für den ruhigen Endzustand und zusätzlich mit Bewegung für Porträt und 99 Schalen. Viewports: 1440×900, 1024×768, 768×1024, 390×844. Unterseiten (Meisterstücke, Manufaktur, Young-Jae Lee, Werkstatt, Aktuelles, Besuch) bei 1440 und 390. Konsole: auf allen Breiten fehlerfrei, kein horizontales Scrollen.

Screens: `visual-review/` (Faltbilder `c3-start-<breite>-fold.png`, ganze Seiten `c3-start-<breite>-full.png`) und `visual-review/seg/` (Abschnitte `c3-<seite>-<breite>-NN.png`). Messskripte: `measure.cjs`, `imgq.cjs`, `m2.cjs`–`m6.cjs`, Rohwerte in `measure.txt`.

**Zwei Fallen beim Ansehen der Ganzseiten-Screens.** Erstens liegt über der Startseite ein fest positioniertes Korn-Overlay (`.page-home::after`, 7 %, multiply). In Ganzseiten-Screens erscheint es nur im ersten Viewport, deshalb sieht man bei 768 px eine scheinbare Kante unter dem Einstieg. Im Browser gibt es diese Kante nicht. Zweitens zeichnet der Ring der 99 Schalen nur, solange er sichtbar ist (IntersectionObserver). In Ganzseiten-Screens bleibt die Fläche deshalb oft leer (`seg/c3-start-1440-06.png`), im Viewport ist er vorhanden (`ring-reduce-0.5.png`, `ring-no-preference-0.75.png`). Beides sind keine Fehler.

## Kurzfazit

1. Das externe Review ist im Kern treffsicher. 14 der 20 Punkte stimmen ganz, 5 teilweise, einer ist überholt (Rahmen: Phase B ist erledigt). Drei Vorschläge widersprechen allerdings Admin-Entscheidungen: Meditation und 99 Schalen zusammenlegen (E5: „getrennt“), Orte auf hellen Grund setzen und Dunkel umverteilen (DESIGN.md §5).
2. Das größte sichtbare Problem fehlt im Review ganz: Porträt und Feuerbild werden stark hochskaliert. Am Handy haben sie nur 22 % bzw. 20 % der nötigen Pixel, auf dem Retina-Desktop 47 % bzw. 33 %. Am Handy verdeckt das Zitat außerdem dauerhaft das Gesicht (bestätigt Punkt 5).
3. Mehrere Punkte sind Abweichungen vom eigenen DESIGN.md und brauchen keine neue Entscheidung, nur Konsequenz: die H2 der Orte (52 statt 66 px), der eigene Abschnittsabstand der Orte, der Meisterstücke-Satz in Caslon Text statt Display, die doppelte Linie bei Besuch, das fehlende geschützte Trennzeichen in „Young-Jae“.
4. Das Tablet war ungeprüft. Bei 768 px ist die Seite mit 22.532 px am längsten, weil Aktuell und andere Raster einspaltig mit 725 px breiten Bildern laufen.
5. Inhaltlich offen und nur durch Admin oder Werkstatt lösbar: 1986 oder 1987, Bildnachweise, Bildwiederholungen bzw. neue Fotos, Zahl der großen Zitate.

## Die 20 Punkte

Art: **T** = unsichtbar/technisch, **G** = sichtbar-gestalterisch, **I** = Inhalt/Text.

| # | Befund stimmt? (Messung) | Status | Empfehlung | Aufwand | Art |
|---|---|---|---|---|---|
| 1 Hell/Dunkel ohne System | **Teilweise.** Die Abfolge stimmt so wie beschrieben. Es gibt aber ein System: DESIGN.md §5 legt fest, dass nie zwei Anker direkt aufeinander folgen und dass ungefähr alle 2–3 Bildschirme ein Anker kommt. Die Startseiten-Tabelle (§5) setzt Orte ausdrücklich auf „Anker“ und Haltung auf „hell, dann Fläche“. Die gemessene Abfolge hält diese Regeln ein. | **Bewusst entschieden** (DESIGN.md §5, Tabelle „Startseite“) | Beibehalten. Orte auf hellem Grund würde die gedämpften Schwarzweiß-Kacheln (`sig-orte`) zerstören, sie leben vom Kohlegrund. Nur wenn der Admin den Rhythmus neu denken will, gehört das in eine Designrunde, nicht in den Feinschliff. | – | G |
| 2 Länge | **Ja**, Werte bestätigt: 1440 = 18.884 px, 390 = 20.208 px. Noch länger ist 768 = **22.532 px**. Größte Blöcke bei 1440: Young-Jae Lee 2.475, Manufaktur 2.327, Meisterstücke 2.017, Orte 1.728. Bei 768: Aktuell 3.470, Manufaktur 3.085. | Teilweise **bewusst entschieden**: „Meditation und 99 Schalen: getrennt“ (PLAN §8, E5, bestätigt 04.10.2026). Die Variante „zusammen“ gibt es nicht mehr, sie wurde in Phase B-1 gelöscht (`adcedb4`). Der Rest braucht eine **Admin-Entscheidung**. | Nicht zusammenlegen. Stattdessen: (a) Tablet zweispaltig bauen (siehe Ergänzung 4), das spart bei 768 rund 2.500 px. (b) Orte mobil verdichten: 5 große Kacheln, die übrigen 8 als Textliste oder 2er-Raster mit halber Höhe (heute rund 2.000 px am Handy, `seg/c3-start-390-06/07.png`). (c) Porträt mobil ohne 135 svh (siehe Punkt 5). | M | G |
| 3 Hierarchie-Umkehr Orte | **Ja.** H2 „Ausstellungsorte“ = 51,84 px (`--t-statement`, ausdrücklich gesetzt in `sig-orte.css:23–27`), Köln/München = 66,24 px, alle anderen H2 = 66,24 px. | **Offen.** Das ist eine Abweichung von DESIGN.md §6, wonach der Abschnittskopf immer `--t-h2` trägt. | H2 auf `--t-h2` zurücksetzen (die Überschreibung in `sig-orte.css` löschen) und die XL-Kacheln auf `--t-statement` senken. Dann gilt H2 > Kachel. Oder nur die H2 angleichen: Kachel und H2 gleich groß ist vertretbar, kleiner als die Kachel nicht. | S | G |
| 4 Bildgründe Meisterstücke | **Ja**, gemessen an den Bildecken: Kumme `#e5e5e7`, Bettelmönchschale `#e9e8eb`, Zylindervasen `#e5e5e5`, spitze Schalen `#f9f9f9`, Spindelvase warm `#e1dcd7`. Bildrahmen `--ground-2` `#edece8`, Seite `#f8f7f4`. Die weißen Schalen verschwinden fast im Grund, die grauen stehen als Kasten da (`seg/c3-start-1440-04.png`). Auf der Unterseite Meisterstücke kommen dunkle Schiefergründe dazu. | **Offen**, langfristig über den Bildplan geregelt (DESIGN.md §10, Fotoecke mit einheitlichem Grund) | Kurzfristig die 6 Freisteller der Startseite einmalig in der Bildbearbeitung auf einen Grundwert bringen (Gradationskurve, Ziel ≈ `--ground-2`) und neu einchecken. `mix-blend-mode: multiply` auf `--ground-2` mildert den Sprung nur und dunkelt die grauen Bilder ab, deshalb nicht empfohlen. Langfristig: Fotoecke. | M | G |
| 5 Mobil: Porträt verdeckt | **Ja**, bestätigt im ruhigen Zustand und mit Bewegung beim Durchscrollen (`portrait-390-1.png`, `portrait-390-3.png`). Das Gesicht ist an keiner Scrollposition frei. Zusätzlich ist das Bild stark weich: Es braucht 5.831 px Breite, geliefert werden 1.280 px (Faktor 0,22). Bei 768 und 1024 ist das Gesicht frei. | **Admin-Entscheidung nötig.** DESIGN.md §8 beschreibt das Sticky-Verhalten, sagt aber nichts zur Überdeckung am Handy. | Unter 900 px das Bild im Seitenverhältnis (oder 4:5) ohne Sticky zeigen und das Zitat darunter setzen, auf Fond oder Fläche in Lede-Größe. Das behebt Überdeckung, Unschärfe und spart rund 600 px Länge. Desktop bleibt wie heute. Code: `.sticky-bild--portrait` im Medienblock unter 900 px. | S–M | G |
| 6 27 Textstile / Laufweiten | **Teilweise.** In `main` gezählt: 23 Kombinationen aus Schrift, Größe, Laufweite und Versal. Die Abweichung gleicher Größen stimmt: 66 px mit −0,02 em (H1) bzw. −0,015 em (H2); 51,8 px mit −0,01 / −0,015 / −0,02 em / normal. DESIGN.md §3 regelt Größe und Zeilenhöhe als Paar, die Laufweite aber nicht. | **Offen** | Pro Rolle ein Laufweiten-Token `--t-<name>-ls` in `:root` und überall als Dreiergruppe setzen, ergänzt in DESIGN.md §3. Vorschlag: Display-Rollen −0,015 em, Mega −0,035 em, Text-Rollen −0,01 em, Meta-Versal +0,08 em. Sichtbar kaum, aber sauber. Passt zur Komponenten-Phase D. | S–M | T |
| 7 Display und Text gemischt | **Teilweise.** Lede (41,8 px, Caslon Text) entspricht DESIGN.md §3 (Lede = Text). Der Meisterstücke-Satz „Alle Meisterstücke stammen …“ steht aber in Caslon Text in Aussage-Größe 51,8 px (`global.css:638`, `font-family: var(--f-text)`), obwohl DESIGN.md die Aussage als Display definiert. Der Meditationssatz in derselben Größe steht in Display. Optisch wirkt der Text-Schnitt in dieser Größe grob (`seg/c3-start-1440-03.png`). Dazu kommt ein Widerspruch zwischen den Seiten: Das Jahn-Zitat steht auf der Startseite in Text, auf Young-Jae Lee in Display. | **Offen** (Abweichung von DESIGN.md §3) | `.works__statement` auf `--f-display` umstellen. Zitate nach einer Regel setzen: Lede/Zitat = Text, Aussage = Display, auf allen Seiten gleich. | S | G |
| 8 Zwei Fließtextgrößen | **Ja, aber die Ursache liegt anders.** 18,32 gegen 16,92 px sind 8 % Unterschied, unter der 10-%-Regel aus §3. DESIGN.md will die beiden Rollen zusätzlich über die Farbe trennen (`--ink` gegen `--ink-2`). Genau das wird mehrfach nicht eingehalten: Chronik-Beschreibungen stehen in Begleittext-Größe, aber in `--ink`. Die Unterzeile der Farbskala und der Hinweis „Wischen“ stehen in Fließtext-Größe und `--ink`, obwohl sie Begleittext bzw. Meta sind. | **Bewusst entschieden** (§3: zwei Rollen, getrennt über Farbe), aber **inkonsistent umgesetzt** | Rollen nicht zusammenlegen. Die Zuordnung korrigieren: Chronik-Text auf `--ink-2` (Kontrast auf Fläche bleibt über 5:1), Farbskala-Unterzeile auf Begleittext, „Wischen“ auf Meta. Den Satz zur 10-%-Regel in DESIGN.md präzisieren. | S | G |
| 9 Zitat-Inflation | **Ja.** Große Serifensätze in Folge: Hero (Wagner), Lede, Catoir, Jahn, Meisterstücke-Satz, Meditation, Kosmos-Wagner, Manufaktur-Regel, dazu Feuer- und Chronik-Lede. Wagner ist zweimal Quelle. Die H2 „Ein Ring aus Teilchen um eine leere Mitte.“ wiederholt wörtlich einen Satz aus dem Zitat daneben (geprüft). | **Admin-Entscheidung nötig** (Inhalt) | Zwei klare Kandidaten zum Streichen: (1) den Meisterstücke-Satz. DESIGN.md §5 gibt dem Abschnitt den Zweck „Bilder statt Worte“, und der Satz steht fast gleich auf der Unterseite. (2) Die Dopplung im Kosmos: H2 behalten und das Zitat kürzen, oder die H2 neu fassen, z. B. „Neunundneunzig Schalen.“ Hero und Catoir als Höhepunkte behalten. | S | I |
| 10 Zwei Überschriften-Register | **Teilweise.** Es gibt eine erkennbare Logik: Abschnitte mit Gegenstück in der Navigation tragen ein Label (Aktuell, Meisterstücke, Young-Jae Lee), Haltungskapitel einen Satz mit Punkt. Manufaktur („Keiner Mode …“) und Besuch („Die Werkstatt ist offen.“) brechen diese Logik, und Ausstellungsorte ist kein Navigationspunkt. Dokumentiert ist die Logik nirgends. | **Offen** | Regel in DESIGN.md §3 aufschreiben, die heutige Mischung ist als redaktionelle Stimme vertretbar. Ob Manufaktur und Besuch angepasst werden, entscheidet der Admin. Nicht alles auf ein Register zwingen, das würde die Seite flacher machen. | S | I |
| 11 Sektionsabstände | **Ja.** Standard 144 px (`--section` bei 1440), Orte 115,2 px aus eigenem `padding-block: clamp(64px, 8vw, 120px)` (`sig-orte.css:5`). Mobil sind es 64 statt 80 px. | **Offen.** DESIGN.md §4 sagt: „Abschnitte wählen keine eigenen Abstände, Ausnahmen nur für Vollbild-Signaturen“. Orte ist nicht randlos. | `padding-block: var(--section)`. | S | G |
| 12 CTA-Gewichtung | **Ja.** Im Seitenkörper gibt es zwei gefüllte Buttons: „Zum Programm“ und „Anfrage senden“. Daneben stehen 16 Links mit Pfeil. | **Admin-Entscheidung** (leicht). DESIGN.md regelt nicht, wann gefüllt und wann Link. | Regel vorschlagen: gefüllt nur für Aktionen (Formular senden, „Route planen“), Wege zu Seiten immer als Link mit Pfeil. Dann wird „Zum Programm“ zum Link mit Pfeil. In DESIGN.md §6 festhalten. | S | G |
| 13 Leerflächen wirken zufällig | **Teilweise.** Lede: Der Satz läuft über die volle Breite, die zwei Spalten stehen in Spalte 7–12. Das ist ein gewollter redaktioneller Versatz und kein Zufall. Lebensweg: **ja**, die 5 Stationen belegen Spalte 1–10 (x 40–1.169), die Linie läuft bis 1.400. Spalte 11–12 bleibt leer (`seg/c3-start-1440-03.png`). | Lede: vertretbar. Lebensweg: **offen** | Lebensweg mit `grid-template-columns: repeat(5, 1fr)` über die volle Breite verteilen, oder die Linie am letzten Punkt in den Link „Zum ganzen Werdegang“ münden lassen. | S | G |
| 14 Bildwiederholungen | **Ja, sogar häufiger als beschrieben.** Regalfoto 3× (Aktuell Pop-up `popup-954`, Orte München, Manufaktur), MOK-Trio 2× (Aktuell, Orte Köln), Bettelmönchschale 2× (Aktuell Greve, Meisterstücke-Raster), Kannen 2×, Kummerschalen 2× auf der Startseite (Hero, Orte Essen; das Review zählt 3×). Die Orte-Kacheln haben keinen Bezug zur Stadt. | **Admin-Entscheidung nötig.** Dafür braucht es Fotos, siehe `konzept/BILDPLAN.md` und DESIGN.md §10. | Kurzfristig ohne neue Fotos: Bettelmönchschale aus dem Meisterstücke-Raster tauschen (es gibt 24 Werke auf der Unterseite), Pop-up-Karte mit einem anderen Werkstattbild statt des Regals. Langfristig: Ausstellungsfotos je Stadt (Orte) beim Admin oder bei den Galerien anfragen. | S (Tausch) / L (Fotos) | I |
| 15 Auflösung Retina | **Teilweise falsch gemessen, im Ergebnis aber zu mild.** `naturalWidth` ist bei `srcset` dichtekorrigiert, deshalb stimmen die Zahlen im Review nicht. Echte Messung über die gewählte `srcset`-Breite (`imgq.cjs`): MOK ist auf Retina inzwischen ausreichend (Quelle 2.000 px). Werk-Kacheln haben nur Quellen mit 600 px (Faktor 0,61 auf Retina), mehr gibt es nicht. Schwerwiegend sind **Porträt** (Retina-Desktop 0,47, Handy 0,22) und **Feuer/Glasurdetail** (0,33 bzw. 0,20). | **Teilweise bereits behoben** (C3: größte Varianten bleiben, MOK/Wesel/Pop-up korrigiert), Rest **offen** | (a) Technik: Bei `object-fit: cover` in hohen Kästen passt `sizes="100vw"` nicht, dort fehlt der Höhenanteil. Für Porträt und Feuer `sizes` an das Seitenverhältnis anpassen, damit wenigstens die 2.000/1.600-px-Quelle geladen wird. (b) Höhere Originale beim Admin anfragen (Porträt, Glasurdetail, Werkfotos ≥ 1.400 px). (c) Mobil das Porträt nicht auf 135 svh strecken (Punkt 5). | S (a) / Admin (b) | T |
| 16 Datumsformat | **Ja**, und auch zwischen den Seiten: Start „2003–05“ und „2006/07“, Unterseite Meisterstücke „2003–2005“ und „2004/05“. | **Admin-Entscheidung** (leicht): „2006/07“ kann eine Werksaison bezeichnen und damit inhaltlich gemeint sein | Eine Schreibweise wählen, Vorschlag: volle Jahre mit Halbgeviertstrich „2006–2007“ auf allen Seiten. Vorher kurz klären, ob „/“ etwas bedeutet. | S | I |
| 17 Bildnachweise | **Ja.** Vier Muster: „Titel · Foto: Name“, nur Titel, nur „Foto: Name“, gar kein Nachweis (Spindelvase, Meditationsgefäß, Kannen). Auf Aktuelles kommt ein fünftes Muster dazu („Fotografie: …, © …“). | **Admin-Entscheidung nötig** (Rechte, fehlende Namen) | Schema „Titel · Foto: Name“ überall. Fehlende Fotografen beim Admin erfragen, die Rechtefrage ist wichtiger als die Optik. In Phase D als Pflichtfelder im `Figure`-Baustein. | S | I |
| 18 Geschütztes Trennzeichen | **Ja.** `&#8209;` steht 2× (Greve-Titel und -Text), „Young-Jae“ ohne Schutz 38×. DESIGN.md §3 verlangt den Schutz überall. | **Offen** (Abweichung von DESIGN.md §3) | Zentral lösen statt von Hand: den Namen beim Rendern in `<span class="nowrap">` setzen bzw. eine Hilfsfunktion in Phase D. `nowrap` ist sicherer als U+2011, weil das Zeichen nicht in jeder Schrift vorhanden ist. | S | T |
| 19 1986 oder 1987 | **Ja.** Lede „Seit 1986 geprägt“, Chronik 1986. Navigation „seit 1987“, Lebensweg 1987, Biografie „Seit 1987“, Meisterstücke-Unterseite „ab 1986“. | **Admin-Entscheidung nötig.** Bekannte offene Frage: `konzept/FRAGEN-AN-DIE-WERKSTATT.md` Nr. 1, `CONTENT-FUNDE.md` Nr. 1. Externe Quellen nennen meist 1987 für die Leitung. | Nicht raten. Möglich ist auch, dass beides stimmt (1986 Übernahme mit Eggemann, 1987 Leitung oder Umzug), dann die Formulierungen so schärfen, dass kein Widerspruch entsteht. Werkstatt fragen. | S | I |
| 20 Pop-up „Mehr zur Ausstellung“ | **Ja** (`index.astro:252`). | **Offen** | „Mehr erfahren“ oder „Mehr zum Pop-up“. | S | I |
| Rahmen: „Phase B steht noch aus, varianten.js“ | **Nicht mehr.** Phase B-1 ist erledigt (0 × `data-variant` im HTML, `varianten.js` gelöscht in `5f99620`), B-2 hat die Tippflächen behoben. | **Bereits behoben** (Phase B-1/B-2) | – | – | – |
| Rahmen: „Hover/Fokus ungeprüft“ | Geprüft: Fokusring 2 px durchgezogen, `--ink`, Abstand 4 px, sichtbar. „Zwei Linien“ kippt beim Hover sauber auf Kohle (`hover-lines.png`). Orte-Detail öffnet ruhig (`orte-open.png`). | In Ordnung | – | – | – |

## Eigene Ergänzungen (priorisiert)

1. **Unscharfe Großbilder (wichtigster Punkt).** Porträt (`portrait-yjl`) und Feuer (`03-glasur-detail`) füllen 140 bzw. 160 svh mit Querformat-Quellen per `cover`. Benötigt gegen geliefert: Retina-Desktop 4.299 gegen 2.000 px (Porträt) und 4.837 gegen 1.600 px (Feuer), Handy 5.831 gegen 1.280 bzw. 6.379 gegen 1.280 px. Sichtbar in `seg/c3-start-768-11.png` und `seg/c3-start-390-11.png`. Auf der Unterseite Young-Jae Lee ist dasselbe Porträt als Panorama scharf, das Problem liegt also am Format. Auch der Vasen-Streifen auf Meisterstücke ist sichtbar weich (`seg/c3-meisterstuecke-1440-03.png`). Abhilfe: Format mobil ändern, `sizes` korrigieren, bessere Originale beschaffen.
2. **Mobil: Unterzeile der 99 Schalen ohne Seitenrand.** „Zu sehen im Museum … bis 25. Oktober 2026“ läuft von x 2 bis 388 (`seg/c3-start-390-09.png`). Ursache: `.cosmos__caption` unter 900 px ohne `padding-inline` (`global.css` ≈ Zeile 2111). Abhilfe: `padding-inline: var(--m)`. Aufwand S.
3. **Besuch: doppelte Haarlinie.** Unter dem Abschnittskopf liegt eine Linie und 57 px darunter (mobil 33 px) die obere Linie der Öffnungszeiten (`seg/c3-start-390-12.png`, `seg/c3-start-1440-10.png`). Das verstößt gegen DESIGN.md §6: „Folgt direkt eine Liste mit eigener oberer Linie, entfällt deren Linie“. Abhilfe: `border-top` der ersten Zeile entfernen. Aufwand S.
4. **Tablet (768 px) erbt das Handy-Layout.** Aktuell-Karten, Meisterstück-Einzelwerk, Pop-up und Manufaktur laufen einspaltig über 725 px. Die Seite wird dadurch die längste (22.532 px), Bilder werden zu groß und unscharf (Greve: 533-px-Quelle bei 1.450 px Bedarf, Faktor 0,37). Abhilfe: Ab ≈ 700 px die Karten zweispaltig, das Einzelwerk mit Text daneben (`seg/c3-start-768-01.png`, `-05.png`). Bei 1024 px wirkt alles stimmig (`seg/c3-start-1024-*.png`). Aufwand M.
5. **Gleiche Texte auf mehreren Seiten, in unterschiedlicher Schrift.** „Jedes Stück muss gut zu drehen sein …“ steht auf Start (Manufaktur), im Anker der Manufaktur-Seite und auf Werkstatt. Der Lede-Satz „Aus der ständigen Wiederholung …“ steht auf Start und im Kopf der Werkstatt. Das Jahn-Zitat steht auf Start in Caslon Text, auf Young-Jae Lee in Display. Abhilfe: Je Zitat einen Ort festlegen (Inhalt, Admin) und dieselbe Rolle auf allen Seiten verwenden (Technik, Phase D über `Statement`).
6. **Chronik am Desktop: Jahr und Text driften auseinander.** Die Jahreszahl steht in Spalte 5–8, Titel und Text in 9–12. Dazwischen liegen rund 250 px Luft, die Zuordnung leidet (`seg/c3-start-1440-09.png`). Abhilfe: Jahr in Spalte 5–6, Text ab Spalte 7, oder das Jahr rechtsbündig an den Text rücken. Aufwand S, gestalterisch.
7. **Abschnittsköpfe uneinheitlich ausgerichtet.** In Aktuell steht der Link rechtsbündig (`.aktuell__all { justify-self: end }`), bei Meisterstücke und Orte linksbündig ab Spalte 9 (x 962). Abhilfe: eine Ausrichtung für `SectionHead`, in Phase D als Komponente. Aufwand S.
8. **Aktuell-Karten: Links nicht auf einer Linie.** Der zweizeilige Pop-up-Titel schiebt „Mehr zur …“ um 35 px nach unten (`seg/c3-start-1440-01.png`). Abhilfe: Karten als Grid mit `subgrid` oder Link mit `margin-top: auto`. Aufwand S.
9. **Kleinere Text- und Satzdetails.** „1300 °C“ bricht mobil zwischen Zahl und Einheit um (`seg/c3-start-390-11.png`), Abhilfe: schmales geschütztes Leerzeichen (auch in der Manufaktur-Tafel). Orte sagt „Ausstellungen seit 1980“, die Fußnote „Ausstellungsliste 2016 bis 2026“. Das ist kein Widerspruch, liest sich aber so, Formulierung schärfen. Im Orte-Detail steht „SIEBEN MAL SIEBEN“ in Versalien, während alle anderen Titel normal gesetzt sind. Die Farbskala hat bei „weiß“ und „rostbraun“ keine zweite Zeile (matt/glänzend). Prüfen, ob das inhaltlich stimmt. Sonst eine Zeile ergänzen.
10. **Fußzeile Desktop: Lücke zwischen „Werkstatt“ und „Kontakt“.** Kontakt sitzt bündig mit dem Ende von „Seiten“, darüber bleiben rund 190 px leer (`seg/c3-start-1440-11.png`). Abhilfe: Spalten oben bündig, Kontakt direkt unter „Werkstatt“. Aufwand S. Die angeschnittene Wortmarke ist gewollt (DESIGN.md §6).

Positiv und beibehalten: Fokus und Hover sind sauber, Kontraste und Tippflächen in Ordnung (nach B-2). Der Einstieg wirkt auf allen vier Breiten gut, der Ring der 99 Schalen und die Farbskala tragen stark. Die Unterseiten sind im Aufbau untereinander konsistent.

## Vorschlag Phase B-3 (visueller Feinschliff)

### (a) Ohne Admin umsetzbar: Konsistenz zu DESIGN.md, Technik

| Prio | Punkt | Wirkung | Screens |
|---|---|---|---|
| 1 | Porträt- und Feuerbild: `sizes` für `cover` korrigieren, damit die größte vorhandene Quelle geladen wird (Ergänzung 1, Punkt 15a) | schärfer auf Retina, ohne Layoutänderung | `seg/c3-start-768-03.png`, `-11.png` |
| 2 | Mobil: Seitenrand für die Unterzeile der 99 Schalen (Ergänzung 2) | Fehler behoben | `seg/c3-start-390-09.png` |
| 3 | Besuch: doppelte Linie entfernen (Ergänzung 3) | Regel aus §6 eingehalten | `seg/c3-start-390-12.png` |
| 4 | Orte: H2 auf `--t-h2`, Abschnittsabstand `var(--section)` (Punkte 3, 11) | Hierarchie und Rhythmus nach §4/§6 | `seg/c3-start-1440-05.png` |
| 5 | Meisterstücke-Satz in Display, Zitate seitenübergreifend nach einer Rolle (Punkt 7, Ergänzung 5 technisch) | einheitlicher Schriftschnitt | `seg/c3-start-1440-03.png`, `seg/c3-young-jae-lee-1440-00.png` |
| 6 | Farbzuordnung Begleittext/Fließtext korrigieren: Chronik-Text, Farbskala-Unterzeile, „Wischen“ (Punkt 8) | die zwei Rollen wieder unterscheidbar | `seg/c3-start-1440-09.png`, `-07.png` |
| 7 | „Young-Jae“ zentral vor Umbruch schützen (Punkt 18), „1300 °C“ mit geschütztem Leerzeichen (Ergänzung 9) | Satzregel aus §3 | `seg/c3-start-390-11.png` |
| 8 | Laufweiten-Tokens je Rolle (Punkt 6) | weniger Varianten, Grundlage für Phase D | – |
| 9 | Lebensweg über volle Breite (Punkt 13), Aktuell-Kartenlinks auf eine Linie, Link-Ausrichtung im Abschnittskopf, Fußspalten oben bündig (Ergänzungen 7, 8, 10) | ruhigeres Raster | `seg/c3-start-1440-01.png`, `-03.png`, `-11.png` |
| 10 | Pop-up-Link „Mehr erfahren“ (Punkt 20) | korrekte Beschriftung | `seg/c3-start-1440-01.png` |

### (b) Braucht Admin-Entscheidung: gestalterisch oder inhaltlich

| Prio | Frage | Empfehlung | Screens |
|---|---|---|---|
| 1 | Porträt am Handy: Bild und Zitat untereinander, ohne Sticky (Punkt 5) | ja, behebt Überdeckung, Unschärfe und Länge | `portrait-390-1.png`, `portrait-390-3.png` |
| 2 | Tablet zweispaltig (Ergänzung 4) | ja | `seg/c3-start-768-01.png`, `-05.png` |
| 3 | Zitate reduzieren: Meisterstücke-Satz streichen, Kosmos-Dopplung auflösen (Punkt 9), je Zitat ein Ort (Ergänzung 5) | ja, Hero und Catoir als Höhepunkte behalten | `seg/c3-start-1440-03.png`, `-06.png` |
| 4 | 1986 oder 1987 (Punkt 19) | Werkstatt fragen (`FRAGEN-AN-DIE-WERKSTATT.md` Nr. 1) | `seg/c3-start-1440-01.png`, `-03.png` |
| 5 | Bildnachweise nach Schema und fehlende Namen (Punkt 17) | Schema „Titel · Foto: Name“, Namen liefern | – |
| 6 | Bildgründe der Freisteller angleichen (Punkt 4) und höhere Originale (Punkt 15b) | Freigabe für eine einmalige Bildbearbeitung, langfristig Fotoecke | `seg/c3-start-1440-04.png` |
| 7 | Bildwiederholungen: zwei sofortige Tausche, später Ortsfotos (Punkt 14) | Tausch freigeben, Fotos anfragen | `seg/c3-start-1440-01.png`, `-05.png` |
| 8 | Orte mobil verdichten (Punkt 2b) | 5 große Kacheln, Rest als Liste | `seg/c3-start-390-06.png`, `-07.png` |
| 9 | Regel für gefüllte Buttons (Punkt 12) und für Überschriften-Register (Punkt 10) festlegen | Buttons nur für Aktionen; Register dokumentieren statt umbauen | `seg/c3-start-1440-08.png` |
| 10 | Datumsformat (Punkt 16), Chronik-Spalten (Ergänzung 6) | volle Jahre mit Halbgeviertstrich; Jahr näher an den Text | `seg/c3-start-1440-09.png` |
| – | Nicht übernehmen: Meditation und 99 Schalen zusammenlegen (E5), Orte auf hellen Grund (DESIGN.md §5) | Entscheidungen stehen | – |

Weiterhin offen aus `ADMIN-OFFEN.md`, nicht Teil des Reviews: `--ease-pop` (leichtes Überschwingen der Punkte).

---

## Anhang: externe Kritik (unverändert)


## Rahmen
- Geprüft: gerenderter Stand vom 04.10.2026, Desktop 1440×900 und Mobil 390×844 (headless Chromium), mit Messung der berechneten Styles.
- Gesetzt und nicht Teil der Bewertung: Aktuell bleibt prominent direkt nach dem Hero. Keine Preise auf der Seite.
- Nicht geprüft: Hover/Fokus, Animationen in Bewegung, Tablet (768/1024), Unterseiten.

## Gesamturteil
Starke, eigenständige Art Direction (7,5–8/10). Schwächen liegen im Rhythmus, in der Gewichtung und in der Detailkonsistenz, nicht in der Grundrichtung. Nicht „moderner“ machen.

## Beibehalten
- Libre Caslon Display + Jost: Bauhaus-Grotesk trifft Katalog-Serif, schlüssig.
- Palette Fond/Kohle/Grau, Farbe kommt nur aus den Glasuren.
- Signature-Elemente: Ring der 99 Schalen, Glasurkacheln der Farbskala, Chronik-Linie, Footer-Wortmarke.
- Token-System im CSS. Typografische Hygiene: „“ für Zitate, »« für Titel, Halbgeviertstriche durchgängig (29×, kein Bindestrich als Gedankenstrich).
- Kontrast: Alle Textknoten bestehen WCAG AA (gemessen).

## P1 – Rhythmus & Gewichtung
1. **Hell/Dunkel ohne System.** Abfolge: Fond → Kohle (Aktuell) → Fond → Foto dunkel (Porträt) → Fond → Kohle (Orte) → Fond → Grau (Kosmos) → Fond → Foto dunkel (Feuer) → Grau (Chronik) → Fond → Kohle (Footer).
   - Aktuell bleibt dunkel (gesetzt). Dann **Orte auf hellen Grund** setzen.
   - Dunkel nur für Aktuell, Porträt, Feuer und Footer verwenden.
2. **Länge.** Desktop 18.884 px ≈ 21 Viewports, Mobil 20.208 px ≈ 24.
   - Größte Blöcke: Young-Jae Lee 2475 px, Manufaktur 2327, Meisterstücke 2017, Orte 1728.
   - Vorschlag: Orte stark verdichten. Meditation und Kosmos zusammenführen, die Variante „haltung:zusammen“ existiert bereits im Markup.
3. **Hierarchie-Umkehr in Orte.** Die Stadtnamen Köln/München haben 66 px und damit die Größe der Sektions-H2. Die H2 „Ausstellungsorte“ hat nur 52 px. Unterpunkte sind größer als die Überschrift.
4. **Bildhintergründe der Meisterstücke uneinheitlich** (gemessen): kühles Grau ~#E8E7EA (Kumme, Zylindervasen, Bettelmönchschale), Neutralweiß ~#F9F9F9 (spitze Schalen), Fond #F8F7F4. Freisteller einheitlich auf den Fond setzen. Sonst wirkt das 3er-Raster wie ein Shop statt wie eine Galerie.
5. **Mobil: Porträt verdeckt.** Das Catoir-Zitat liegt vollflächig über dem einzigen Foto der Künstlerin. Auf Mobil Bild und Zitat untereinander setzen.

## P2 – Konsistenz
6. **27 verschiedene Textstile.** Gleiche Größen haben unterschiedliche Laufweiten:
   - 66 px: −1,32 / −0,99 / −0,66 px
   - 52 px: −0,52 / −0,78 / −1,04 / normal
   - Fix: Tracking pro Größenstufe als Token festlegen.
7. **Display- und Text-Schnitt in gleicher Größe gemischt.** 52 px Statement („Alle Meisterstücke …“) und 42 px Lede stehen in Caslon Text, die H2 in Caslon Display. Bewusst entscheiden, sonst vereinheitlichen.
8. **Zwei Fließtextgrößen fast identisch.** --t-body 18,3 px vs. --t-small 16,9 px auf Desktop. Entweder zusammenlegen oder den Abstand deutlich vergrößern.
9. **Zitat-Inflation.** 6–8 Zitate bzw. Statements in großer Serif (Hero, Lede, Catoir, Jahn, Meditation, Wagner, Meisterstücke-Statement, Manufaktur-Regel). Auf 2–3 echte Höhepunkte reduzieren.
   - Die H2 „Ein Ring aus Teilchen um eine leere Mitte.“ wiederholt einen Satz aus dem Wagner-Zitat direkt daneben.
10. **Zwei Überschriften-Register wechseln unregelmäßig.**
    - Labels ohne Punkt: Aktuell, Meisterstücke, Ausstellungsorte.
    - Statements mit Punkt: „Neun bis zehn Stunden Feuer.“, „Hundert Jahre an der Scheibe.“, „Die Werkstatt ist offen.“
    - Ein System festlegen.
11. **Sektionsabstände.** Standard 144 px, Orte 115 px. Abweichung angleichen oder bewusst begründen.
12. **CTA-Gewichtung.** Der einzige gefüllte Button im Seitenkörper ist „Zum Programm“ (Manufaktur), Meisterstücke haben keinen. Bewusst entscheiden.
13. **Leerflächen wirken zufällig.** Die zwei Lede-Spalten sitzen weit rechts. Der Lebensweg nutzt etwa 70 % der Breite, rechts bleibt totes Feld.
14. **Bildwiederholungen.** kummerschalen.webp 3×, regal.webp 2×, kannen.webp 2×, schale_spitz_* je 2×. Orte-Kacheln zeigen entsättigte Produktfotos ohne Bezug zur jeweiligen Stadt.
15. **Auflösung (Retina weich).** MOK-Bild 921 px nativ bei 898 px Darstellungsbreite, Werk-Kacheln 600 px bei 437 px. srcset mit mindestens 2× ergänzen.

## P3 – Text-Details
16. **Datumsformat uneinheitlich:** „2003–05“ vs. „2006/07“.
17. **Bildcredits uneinheitlich:** mal „Titel · Foto: Name“, mal nur Titel, mal nichts.
18. **Geschütztes Trennzeichen** in „Young‑Jae“ nur im Greve-Eintrag. Überall setzen oder nirgends.
19. **1986 vs. 1987** als Beginn der Leitung (Chronik/Lede vs. Navigation/Lebensweg/Meta). Vereinheitlichen.
20. **Pop-up-Store** hat den Button „Mehr zur Ausstellung“. Dort lieber „Mehr erfahren“.

## Bereits erledigt im Code (nur zur Info)
Phase B (nicht gewählte Varianten aus dem Markup entfernen) steht laut varianten.js noch aus. Visuell erscheint nichts doppelt.
