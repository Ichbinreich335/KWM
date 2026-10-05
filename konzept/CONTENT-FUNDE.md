# Content-Funde aus externen Quellen

Stand: 03.10.2026. Recherche zu allen externen Links der V3-Seiten (`src/v3/*.html`) und zu den Quellen, auf die diese Links führen. Es wurde nichts an der Website geändert. Alle Zitate sind wörtlich aus den abgerufenen Seiten bzw. PDFs übernommen. **Alle Textvorschläge sind Vorschläge**, nichts davon steht auf der Seite. Fotos der Quellen wurden nicht heruntergeladen oder übernommen, nur beschrieben.

Methode: Abruf per `curl` (mit Browser-Kennung, Weiterleitungen verfolgt), PDFs mit PDFKit gelesen. Die PDFs und die „Online lesen“-Seiten der Essays sind textgleich.

---

## 1. Quellenliste mit Status

### 1.1 Links, die auf den V3-Seiten stehen

| # | Quelle | Wo in V3 | Status 03.10.2026 | Anmerkung |
|---|---|---|---|---|
| 1 | urbanana.de, „Der Ruf des Bauhaus“, Ilona Marx, 25.01.2023 | aktuelles (Veröffentlichungen) | 200, keine Weiterleitung | Interview mit Young-Jae Lee, siehe 2.1 |
| 2 | kwm-1924.de/gespannte-lebendigkeit/ + catoir.pdf | young-jae-lee (Texte) | 200 / 200 | Barbara Catoir, 2002, siehe 2.2 |
| 3 | kwm-1924.de/gefaesse-drehen-… + jahn.pdf | young-jae-lee (Texte) | 200 / 200 | Gisela Jahn, 2004, siehe 2.3 |
| 4 | kwm-1924.de/wie-erlange-ich-erkenntnis-… + mennekes.pdf | young-jae-lee (Texte) | 200 / 200 | P. Friedhelm Mennekes S. J., 2006, siehe 2.4 |
| 5 | veit.pdf | young-jae-lee (Texte) | 200 | Willibald Veit, 2004. **Es gibt keine Online-Fassung**, die V3 zeigt auch keinen Auszug. Siehe 2.5 |
| 6 | kwm-1924.de/die-aufgehobene-zeit… + wagner_zeit-1.pdf | young-jae-lee (Texte) | 200 / 200 | Thomas Wagner, 2006, siehe 2.6 |
| 7 | kwm-1924.de/galaxie-333-… + wagner_333.pdf | young-jae-lee (Texte) | 200 / 200 | Thomas Wagner, 2009, siehe 2.7 |
| 8 | museum-fuer-ostasiatische-kunst.de/99-Schalen-ein-Kosmos | index, aktuelles | 200 | siehe 2.8. Das Museum ist laut Seite bis 4. Oktober 2026 wegen einer technischen Störung geschlossen |
| 9 | galerie-karsten-greve.com/ | index (Aktuell, Greve) | 200 | Zeigt nur die Startseite der Galerie. Tiefere Links gibt es, siehe 2.9 |
| 10 | jahnundjahn.com/ | aktuelles (Archiv 2026) | 200 | Nur Startseite. Besser: `/artists/young-jae-lee`, siehe 2.10 |
| 11 | kwm-1924.de/neuigkeiten/vergangene/<Jahr>/ (2016 bis 2026, 11 Seiten) | aktuelles, je Jahr „Alle Angaben zu …“ | alle 200 | Alte WordPress-Seiten. Bleiben nur erreichbar, solange die alte Seite läuft (siehe 3.1) |
| 12 | kwm-1924.de/en/news/current/ | Kopfzeile (EN) | 200 | Alte englische Seite, gleiche Einschränkung |
| 13 | Anfrage-PDFs Geschirr (04/2026) und Editionen (02/2023) | besuch, manufaktur | 200 | Bestellformulare, siehe 2.11 |
| 14 | OpenStreetMap, Google Maps, VRR | besuch | 200 | Google leitet 2x weiter, VRR 3x auf die neue Fahrplanauskunft (`vrr.de/fahrplan-mobilitaet/fahrplanauskunft/app/`). Funktioniert, Ziel-URL könnte aktualisiert werden |

### 1.2 Weitere externe Quellen aus den Archivseiten der Live-Seite (nicht in V3 verlinkt, aber relevant)

| Quelle | Status | Nutzen |
|---|---|---|
| mkg-hamburg.de/ausstellungen/young-jae-lee („Contemporary Craft“, 23.11.22 bis 23.4.23) | 200 (leitet von http auf https) | Text, Fotonachweise, siehe 2.12 |
| davidnolangallery.com/exhibitions/…forms-from-the-earth2 | 200 (leitet auf `/12-young-jae-lee-forms-from-the-earth/`) | Langer Essay, 9 Installationsansichten, siehe 2.13 |
| jakobikreuz.de/news/young-jae-lee-schalen/ | 200 | Chemnitz 2024/25, siehe 2.14 |
| nichinichi.com (Kyoto 2022, „Vessels are Sculptures“) | 200 | Text, siehe 2.15 |
| hwk-muenchen.de/artikel/es-gruent-74,0,9953.html | 200 | Galerie Handwerk München 2020, „es grünt“, KWM war Teilnehmerin |
| museum-folkwang.de/…/ausblick/young-jae-lee.html | **404** | Link der alten Seite 2019 ist tot |
| jahnundjahn.com/de/exhibitions/young-jae-lee-keramik- | **404** nach 2 Weiterleitungen | Link der alten Seite 2025 ist tot |
| galerie-karsten-greve.com/de/exhibition/…/spinatschalen-… | **404** nach Weiterleitung | Link der alten Seite 2020 ist tot |
| kwm-1924.de/fileadmin/user_upload/**/*.pdf (u. a. `vom_stolz__eine_toepferin_zu_sein.pdf`, Plakate, Flyer) | 200, leitet aber auf `/neuigkeiten/aktuelles/` um | **Faktisch tot** („Soft-404“). Der Bericht „Vom Stolz, eine Töpferin zu sein“ (Handwerkskammer Düsseldorf, „Werkstatt 2019“, Quelle laut alter Seite: hwk-duesseldorf.de) ist so nicht mehr lesbar. In V3 ist er korrekt nur als Hinweis im Archiv verlinkt |
| kwm-1924.de/wp-content/uploads/2025/09/image.png | 200 | Zeigt eine Grafik „Open House Essen, Future Heritage 2025“ (Fremdgrafik), kein Dashboard-Screenshot. Gehört trotzdem nicht in die Mediathek-Verlinkung, Rechte klären. Das Bild `…/2023/12/image.png` aus `FRAGEN-AN-DIE-WERKSTATT.md` A2 ist weiterhin abrufbar (200) |

### 1.3 Funde zur Link-Hygiene

1. **Alle Essay-Links und alle 8 PDF-Links zeigen auf `kwm-1924.de`**, also auf die Domain, die mit dem Livegang durch die neue Seite ersetzt wird. Laut `SITEMAP-V3.md` sind Essays weder als Seiten noch als Dateien vorgesehen (nur `/fileadmin/*` ist als „nicht übernommen“ vermerkt, `/wp-content/uploads/…` fehlt). Ohne Maßnahme laufen 14 Links ins Leere. Empfehlung: Essays als eigene Seiten oder PDFs unter `/texte/…` bereitstellen (vorher Genehmigung prüfen, siehe 4) und die Weiterleitungen eintragen.
2. Gleiches gilt für die beiden Anfrage-PDFs (besuch, manufaktur). Sie sind das einzige Bestellformular und sollten im neuen Repo liegen.
3. Der Link „Galerie Karsten Greve“ (index) und „jahnundjahn.com“ (aktuelles) führt nur auf Startseiten. Vorschlag: `https://galerie-karsten-greve.com/kuenstler/detail/young-jae-lee` und `https://www.jahnundjahn.com/artists/young-jae-lee` (beide 200).
4. Die Anfrage-PDFs enthalten Konto/BLZ (alt) sowie IBAN und BIC. Das ist öffentlich schon der Fall, aber siehe 3.3.

---

## 2. Zusammenfassungen je Quelle

### 2.1 Urbanana, „Der Ruf des Bauhaus“ (Ilona Marx, 25.01.2023)

Interview mit Young-Jae Lee in der Werkstatt auf Zollverein. Nur Fragen und Antworten, keine Redaktionsmeinung außer dem Einleitungstext.

**Kernaussagen**
- Formen entstehen aus geometrischen Grundformen und aus der handwerklichen Technik. Gearbeitet wird „von innen nach außen und von unten nach oben“, wie in der asiatischen Töpferkunst.
- Die Formensprache wurde 1987 entwickelt und ist unverändert. Erstes Stück: eine Müslischale. Dann Trinkbecher, Krug, Teller. Die sechstonige Farbskala entstand ebenfalls 1987 in monatelangen Versuchen. Heute 50 Modelle.
- Haltung: Beherrschung des vorhandenen Repertoires statt ständiger Neuerfindung, Drehen wird dadurch zur Übung (Exerzitium).
- Team 2023: Michael Schmandt (nach ihren Worten seit 50 Jahren im Haus), Daniela Glattki und Shoko Ishioka als Meister:innen. Lee dreht selbst nur Einzelstücke. Zwei Auszubildende, Estar Halfmann und Leonie Muelbredt. Lee: der einzige Töpferei-Betrieb in NRW, der noch Lehrlinge ausbilden dürfe (**Aussage nur im Interview, vor Übernahme prüfen**).
- Kindheit: Der konfuzianische Großvater bewahrte getrocknete Khakis unter geöltem Reispapier in großen weißen Keramikgefäßen auf. Mit 20 nach Deutschland, Kunstakademie, dann Wiesbaden bei Prof. Erwin Schutzbach („der wichtigste Lehrer“). Vorbilder: Brâncuși, Giacometti, Beuys.
- Reiz der Margaretenhöhe: die Bauhaus-Tradition. „Keine Bauhauswerkstatt, aber in dieser Tradition verwurzelt.“
- Vertretung: Galerie Jahn & Jahn München, seit Anfang 2023 zusätzlich Galerie Karsten Greve Köln. Zu Gast: ein Produktdesign-Student aus Münster.
- Stammkundschaft: Kinder früherer Kund:innen ergänzen das geerbte Service.

**Nicht verwenden:** Im Einleitungstext steht ein Verkaufspreis für Spindelvasen. Preise gehören nicht auf die Seite.

**Zitierfähige Sätze (wörtlich, Lee im Interview; Quelle: Ilona Marx, „Der Ruf des Bauhaus“, urbanana, 25.01.2023)**
1. „Wie in der asiatischen Töpferkunst arbeiten wir in unserer Werkstatt von innen nach außen und von unten nach oben: So entsteht Volumen.“
2. „Wir gehen immer von geometrischen Grundformen aus. Und unsere Gefäßformen entstehen aus der handwerklichen Technik heraus.“
3. „Das gibt uns Freiheit. Die Persönlichkeit der Dreher*innen beginnt einzufließen.“
4. „Denn wenngleich die Keramische Werkstatt Margaretenhöhe keine Bauhauswerkstatt ist, ist sie doch in dieser Tradition verwurzelt.“
5. „Oft kommen die Kinder von früheren Kund*innen, die ein Service von ihren Eltern geerbt haben, um ihre Sammlung zu ergänzen.“
6. „Mein koreanischer Großvater, ein konfuzianischer Gelehrter, besaß große weiße Aufbewahrungsgefäße aus Keramik, in denen er unter geöltem Reispapier getrocknete Khakis aufbewahrte.“
7. „Es ist fast ein bisschen eine Krux, dass es so extrem langlebig ist.“ (über das Gebrauchsgeschirr)

**Fotos dort:** ca. 7 bis 8 Aufnahmen der Werkstatt, benannt „Essen_KWM (c) marx.ilona“ (Ilona Marx, 2023), darunter ein Querformat und ein Hochformat in 2560 px. Motive nur aus den Dateinamen erkennbar (nicht angesehen, nicht geladen). Rechte bei Ilona Marx bzw. urbanana.

### 2.2 Barbara Catoir, „Gespannte Lebendigkeit“ (Kunst-Station St. Peter Köln, Ausstellung 30.3.–20.5.2002)

Beschreibt die Gefäße auf der Empore der spätgotischen Kirche St. Peter. Gefäße stehen auf dem Boden, einige wurden in der Liturgie benutzt. Hauptgedanken: Wiederholung als geistige Übung, nicht Monotonie. Nuancen in Form, Ton, Glasur und Brand. Reduktion auf das Wesentliche. Form entsteht im Kontakt mit dem Material, nicht am Bildschirm. Spindelgefäß: aus einer Umkehrform, zwei übereinandergestülpten Schalen, in Korea Vorratsgefäß mit Pergamentpapier und Schnur verschlossen. Bezug auf Okakura („Das Buch vom Tee“) und Herrigel.

**Zitierfähig (Quelle jeweils: Barbara Catoir, „Gespannte Lebendigkeit“, 2002)**
1. „Young-Jae Lees Gefäße sind die Vollendung des Unvollkommenen.“
2. „Sie sind keine Ausstellungsstücke im eigentlichen Sinn, vielmehr Gefäße für den Gebrauch bestimmt, dem alltäglichen wie dem rituellen.“
3. „Vielleicht muss man aus Ostasien kommen, um die Variationsfülle erkennen zu können, die aus der Begrenzung und der Wiederholung erwächst.“
4. „Die Form kann folglich nicht auf dem Papier oder auf dem Bildschirm des Computers entworfen werden.“
5. „Gefäß steht neben Gefäß, nicht aber nach einem festen Ordnungs- oder Zufallssystem.“

Auf V3 steht bereits das Zitat „Sie erzählte von den Zeremonien in den Tempeln …“.

### 2.3 Gisela Jahn, „Gefäße drehen, Gefäße betrachten, Gefäße benützen“ (Katalog Museum Morsbroich Leverkusen 2004)

Der ausführlichste Text über die Arbeitsweise. Abschnitte: Schalen drehen (Innenform zuerst, Fuß als „Trumpf“), Ansichten einer Schale, Unterschiedlichkeit gleicher Gefäße, Zylindervasen, Tischvasen, Spindelvasen, Benutzen.

**Neue Fakten**
- Bei den großen Zylindervasen überlässt Lee das Zentrieren und Hochziehen der Zylinder Mitarbeitern (Michael Schmandt, Kyonga-Ha Kim), reagiert dann auf deren Vorgabe. Das nimmt ihr, „zu engagierte“ Vorhaben, Distanz zur Perfektion.
- Anregung für die Zylindervasen: Figuren von Michael Croissant. Vasen als abstrakter Körper.
- Spindelvase: Zwei Schalen, die zweite ohne Boden, ihr Fuß wird der Hals. Beide Teile lederhart fertig abgedreht, montiert, Naht versäubert. Anders als bei alten koreanischen Vorbildern, wo die Naht verwischt wird, macht Lee sie zur scharfen Markierung.
- Tischvasen: Glasur endet etwa drei Finger breit über dem Boden, graue Porzellanfläche bleibt frei.
- Zylindervasen: weiße Glasur, ockerfarbene Spuren der Drehrillen, darüber mit dem Pinsel Engobeschlieren.

**Zitierfähig (Quelle: Gisela Jahn, Katalog 2004)**
1. „Kein Gefäß von Young-Jae Lee gleicht dem anderen.“
2. „Schalendrehen hat etwas Intimes, denn es gibt nur zwei Beteiligte: den Ton und die Dreherin, Young-Jae Lee.“
3. „Sie überlässt das Zentrieren und Hochziehen der Zylinder Mitarbeitern der Werkstatt.“
4. „Was in den koreanischen Vasen eher technische Unzulänglichkeit ist und deshalb so gut wie möglich verwischt wird, hebt sie hervor: Die beiden Schalen sind als fertige Formen und Einheiten erkennbar, ihre Nahtstelle eine scharfe Markierung.“
5. „Doch wir erkennen die Schale nicht, wenn wir sie nur von innen sehen. Wir müssen uns entfernen, um sie ganz zu erfassen.“
6. „Diese Vasen ziehen das Licht auf sich.“ (Tischvasen)

Auf V3 verwendet: „Die minimale Veränderung …“, „Vom Volumen bezieht die Schale ihre Kraft …“, Bauhaus-Absatz.

### 2.4 P. Friedhelm Mennekes S. J., „Wie erlange ich Erkenntnis der Liebe?“ (Katalog Pinakothek der Moderne 2006)

Geistlicher, anspruchsvoller Text. Gefäß, Raum, Schale, Hingabe (Devotion). Neue Fakten: Lee liest seit Jahren Teresa von Ávilas Gedanken zum Hohenlied. Grund laut Mennekes: die immer gleiche Tätigkeit beim Drehen und die Gefahr des Misslingens bei schwankender Aufmerksamkeit ließen sie nach geistlichen Übungen suchen. 1111 Schalen als „1111-mal die Suche nach der einen, letzten Schale“.

**Zitierfähig**
1. „Früh trat sie als Keramikerin, als die sie sich bis heute begreift, aus dem engeren Bereich des Angewandten heraus und öffnete sich der Weite des frei Künstlerischen.“
2. „Daher sind diese Gefäße auf eine besondere Weise auch dann gefüllt, wenn sie leer sind.“
3. „Schalen streben nach oben.“

Der V3-Auszug „Devotion, … das heißt die Verehrung …“ ist als Einstieg schwach. Besser wäre Satz 2. Der Text ist religiös gefärbt, sparsam einsetzen.

### 2.5 Willibald Veit, „Young-Jae Lee – Die Töpferin“ (Katalog Museum Morsbroich 2004)

Nur als PDF. Der frühere Direktor des Museums für Ostasiatische Kunst Köln erklärt, warum „Töpferin“ der treffende Begriff ist: ostasiatische Töpfer galten nie als Künstler, sondern als dienende Handwerker, Lee versteht sich in dieser Tradition.

**Zitierfähig (Quelle: Willibald Veit, 2004)**
1. „So ist Young-Jae Lee eine Künstlerin im westlichen und eine Töpferin in bestem ostasiatischen Sinne.“
2. „Jedem, der Young-Jae Lees Werk verstehen will, sei geraten, sich nicht mit dem bloßen Augenschein zu begnügen, denn nur der, der eine Schale oder eine Vase in beiden Händen gehalten, ertastet und erspürt hat, wird ihre wahre Schönheit und Vollkommenheit erfahren.“
3. „Sie versucht nicht, ihre Werke zu erklären, ihre Glasuren und Formen zu rechtfertigen, sie in irgendeinen kunsthistorischen Kontext zu stellen.“

(Die Angabe der Funktion „frühere Direktion“ steht nicht im Text und ist deshalb hier nicht belegt. Nur „Prof. Dr. Willibald Veit“ verwenden.)

### 2.6 Thomas Wagner, „Die aufgehobene Zeit?“ (Katalog „1111 Schalen“, Pinakothek der Moderne, Hatje Cantz 2006)

Elf Bemerkungen: Raumzeit, Wiederholung, Rand der Schale, Valéry über das Feuer („adelnde Ungewissheit“).

**Zitierfähig (Quelle: Thomas Wagner, 2006)**
1. „Ein Garten der Ähnlichkeit und der Differenz.“
2. „Entscheidend für das Gelingen einer Tonschale ist der Rand.“
3. „Alle Schalen stehen auf dem Boden. Sie ruhen auf einem Fuß und brauchen schon deshalb keinen Sockel.“
4. „Eine Schale – sind das nicht zwei aneinandergepresste Hände voll Wasser?“
5. „Ein Universum aus Schalen. Ein Feld aus Raumzeiten.“

Auf V3 verwendet: „Immer sind es Schalen …“, „Schalen über Schalen …“, „Bauchige Becher …“.

### 2.7 Thomas Wagner, „Galaxie 333“ (Katalog „111“, Galerie DKM / Stiftung DKM, Duisburg 2009)

Wagner kennt Lee und ihre Arbeiten seit 1978 und benutzt ihr Geschirr täglich. Kernthese: Vasen und Schalen sind zugleich Gebrauchsgegenstand und Skulptur. Bildhauerischer Hintergrund (Schutzbach, Croissant, Serra). Koreanische Einflüsse (Joseon-Porzellan, Mondtöpfe).

**Zitierfähig (Quelle: Thomas Wagner, 2009)**
1. „Young-Jae Lees Vasen und Schalen sind immer ästhetisches Objekt und Gebrauchsgegenstand, Gefäß und Skulptur.“
2. „Ich weiß, dass Young-Jae Lee, bescheiden wie sie ist, sich niemals selbst als Künstlerin bezeichnen würde.“
3. „Wir haben es mit dezidiert zeitgenössischen Gefäßen zu tun, die ihre Herkunft nicht verleugnen, aber eine eigene Verbindung aus westlichem Minimalismus und elegantem östlichen Verzicht herstellen.“
4. „… jeden Tag benutze ich mit größter Selbstverständlichkeit Teller, Schalen, Schüsseln und Vorratsgefäße des in Form und Farbe aufeinander abgestimmten Geschirrs, das sie entwickelte, als sie 1987 die Keramische Werkstatt Margaretenhöhe in Essen übernommen hat …“ (Auslassung am Anfang, Rest wörtlich. Der Satz belegt zugleich **1987** als Jahr der Übernahme.)

### 2.8 MOK Köln, „99 Schalen – ein Kosmos“ (Foyer-Ausstellung, 23. April bis 25. Oktober 2026)

Offizieller Text: 99 handgefertigte Schalen im Foyer, Dialog mit Architektur, japanischem Garten, See und Park. Rahmenprogramm (Teezeremonie 8.5., Konzert 26.6., Artist Talk mit Lee 4.9.2026) liegt **bereits in der Vergangenheit**. Kuratorische Umsetzung Dr. Shao-Lan Hertel, Förderung Orientstiftung. Lee (*1951) „zog 1972 nach Deutschland und leitet seit 1987“ die Werkstatt. Öffnungszeiten Di bis So 11 bis 17 Uhr, Eintritt 9,50 €/5,50 €. **Das Museum ist laut Seite bis einschließlich 4. Oktober 2026 wegen einer technischen Störung geschlossen** (Stand der Seite 29.9.2026).

**Zitierfähig (Quelle: MOK Köln, Ausstellungstext 2026)**
1. „Serialität und Reproduktion stehen hierbei genauso im Zentrum wie Abweichung und Transformation, schließen sich nicht gegenseitig aus.“
2. „Beim genauen Betrachten offenbart sich jede Struktur des Tons, jeder Farbverlauf der Glasur anders und einzigartig.“

**Fotos dort:** Titelbild „Young-Jae Lee, Schalen © Historisches Archiv mit Rheinischem Bildarchiv, Marion Mennicken“. Auf der Galerieseite Greve: „Installationsansicht, Young-Jae Lee im Museum für Ostasiatische Kunst, Köln 2026. Foto: André Schuster“.

### 2.9 Galerie Karsten Greve (Startseite, Künstlerseite, News)

- Aktuell: **„Kathleen Jacobs / Young-Jae Lee“, Galerie Karsten Greve AG, St. Moritz, 03.10.26 bis 12.12.26** (bestätigt die Angabe in V3).
- Künstlerseite enthält den belastbarsten Kurzlebenslauf (1951 Seoul, 1968–72 Hochschule für Kunsterziehung, 1972 nach Deutschland, 1972/73 Praktikum bei Christine Tappermann in Wallrabenstein, 1973–78 Wiesbaden bei Margot Münster und Erwin Schutzbach, ab 1978 eigene Werkstatt in Sandhausen, 1984–87 Kassel bei Ralf Busz, „Seit 1987 bis heute“ Leiterin) und Auszeichnungen: Goldmedaille des Bayerischen Staatspreises, **Künstlerinnenpreis des Landes Nordrhein-Westfalen**, Keramikpreis der Frechener Kulturstiftung, Richard-Bampi-Preis, 1997/2005 Hessischer Staatspreis, 2001 Bayerischer Staatspreis, 2001 „Les Must de scènes d’Intérieur“ Paris.
- Ausstellungsliste enthält **„51 WERKE“, Galerie Karsten Greve Köln, 19.01.24 bis 17.02.24**. Diese Ausstellung fehlt im Archiv 2024 der V3.
- Fotonachweise: Porträt „Foto: Haydar Koyupinar“, Installationsansichten MOK „Foto: André Schuster“.

### 2.10 Jahn und Jahn, München

Künstlerseite (englisch): Spindelvasen als „amalgam of Korean ceramics, the so-called moon jars, and artificial design typical of the western world“, Spinatschalen als „distant echo of the spirit of the Buncheong ware“, Vorliebe für Keramik der Joseon-Dynastie. Seit 1988 stellt Galerie Fred Jahn regelmäßig aus. Technikangaben bei Spindelvasen: „stone ware, feldspar glaze, 1280°, gas stove“. Werke © VG Bild-Kunst, Bonn, 2026. Ausstellungsliste: **14.7. bis 20.8.2026** (V3 nennt 14. Juli bis 12. September), 13.3.–26.4.2025, Hetjens 16.5.–1.9.2024.

### 2.11 Anfrage-PDFs (Geschirr 04/2026, Editionen 02/2023)

Zweisprachige Bestellformulare mit Artikelnummern. Neue Fakten: Geschäftsführung „Young-Jae Griepentrog, geb. Lee“, HRB 19479, **BIC SPESDE3EXXX ist angegeben** (V3 und `FRAGEN-AN-DIE-WERKSTATT.md` E4 vermissen den BIC), im Fuß zusätzlich noch altes Konto/BLZ. Das Editionsformular stammt von 02/2023, das Geschirrformular ist von 04/2026.

### 2.12 MK&G Hamburg, „Contemporary Craft: Young-Jae Lee“ (23.11.22 bis 23.4.23)

Erste Ausgabe der neuen Reihe „Contemporary Craft“. Lee „gilt seit 40 Jahren als wegweisende Persönlichkeit im Bereich der Keramik“, gezeigt wurden Unikate, die „eine ostasiatische und europäische Formensprache verbinden“, darunter Spindelvasen, Schalen und neue Gefäße. Gefördert von der Karin Stilke Stiftung. Künstlergespräch mit Kuratorin Erika Pinner am 2.2.23. Bildnachweise: Ausstellungsansichten Henning Rogge, Porträt Thomas Dashuber, Objekte und Porträt Haydar Koyupinar. Objektangabe: Spindelvase 2006, „Steinzeug im Gasofen im reduzierende Atmosphäre gebrannt“.

### 2.13 David Nolan Gallery, New York, „Forms from the Earth“ (2024)

Englischer Essay von Tharini Sankarasubramanian. **Viele Fakten, die auf der Website fehlen:**
- Erste gemeinsame Ausstellung der Galerie mit Lee: 2004.
- Spindelvase: Idee „one plus one equals one“. Anregung durch Brâncușis „Colonnes sans fin“ und Goethes Ginkgo-Gedicht. Lee betont, die Spindelvasen seien keine Kopien koreanischer Mondvasen.
- Farbe: anfangs reine, helle Formen, später Kupfer für helle Rosa- bis dunkle Rottöne. Lieblingsbild: Piero della Francescas „Auferstehung Christi“ (hellrosa Gewänder gegen Erdrot). In den letzten Jahren Farbspritzer, die sie mit den Fingern aufträgt.
- Musik im Arbeitsprozess: Anne-Sophie Mutter, Olivier Messiaen.
- Objektangabe: „stoneware, feldspar glaze, fired at 1280°C“.
- Fotos: 9 „Installation Views“ der Ausstellung (Fotograf nicht genannt).

**Zitierfähig (englisch, Quelle: Tharini Sankarasubramanian, David Nolan Gallery, 2024)**
„Lee doesn’t seek to create something “new” but rather succeeds in seeing things in a new manner.“
Nur für die englische Fassung verwendbar. Eine deutsche Übersetzung braucht Genehmigung.

### 2.14 St. Jakobi Chemnitz, „Young-Jae Lee: SCHALEN“ (29.8.2024 bis 2.3.2025, danach Vasen bis 8.5.2025)

Teil der Kulturhauptstadt Chemnitz 2025 (Programmlinie PurplePath, Kurator Alexander Ochs). **49 unterschiedliche farbig glasierte Schalen.** Vermerkt „Foto: Chris Franken“. Die Kirchgemeinde schreibt, die Künstlerin wolle Schalen und Vasen schaffen, **„wie die Welt sie noch nicht gesehen hat“**.

### 2.15 Gallery Nichinichi Kyoto, „Vessels are Sculptures“ (2022)

Englisch. Neue Fakten: Lee fand in Korea keine Werkstatt, die eine Frau als Lehrling aufnahm, ging deshalb nach Deutschland (Tappermann). Eigenes Studium laut Seite am „Soo Do Women’s University“ in Seoul (V3: „Hochschule für Kunsterziehung“ – Benennung abklären). **Brand im selbst entworfenen Holzofen, 1280 °C.** Ausstellung zeigt vier Formen: Spitzschale, Spindelvase, Teeschale, Fußschale. Text zur Fliehkraft („The centrifugal force of the spinning potters wheel pushes the clay outward. The potter’s strong hands counter the force.“).

---

## 3. Abweichungen und Fakten zur Klärung (Abgleich mit V3)

| # | Fund | V3 sagt | Quellen sagen | Empfehlung |
|---|---|---|---|---|
| 1 | **Leitung seit 1987 oder 1986?** (Frage B1 in `FRAGEN-AN-DIE-WERKSTATT.md`) | Startseite „Seit 1986 geprägt“, Meisterstücke „ab 1986“, Chronik 1986 „übernehmen die Leitung“, dazu **1993 „Die Leitung“** | 1987 laut Urbanana, MOK, MK&G, Greve, Jahn und Jahn, Nolan, Nichinichi, St. Jakobi, Wagner (Katalog 2009). Nolan: Lee und Eggemann übernahmen 1987 | Alle externen Quellen sagen 1987. Vorschlag: Chronik „1986 Beginn der Zusammenarbeit mit Hildegard Eggemann“ (Admin bestätigen lassen), **„1987 Leitung der Werkstatt und Umzug in das Baulager“**. Der Eintrag **1993** ist unerklärt und widerspricht („Leitung der Werkstatt durch Young-Jae Lee“), bitte bei der Werkstatt erfragen oder streichen |
| 2 | Brenntemperatur | Startseite „etwa 1300 °C“, Werkstatt/Manufaktur „ca. 1300 °C“, Feuer „bis auf 1300 °C“ | Jahn und Jahn, Nolan, Nichinichi: **1280 °C**. Meisterstücke selbst nennt 1260 (Holz) und 1280 (Gas) | Eine Zahl je Ofen festlegen lassen (Frage B2). Bis dahin „etwa 1280 °C“ oder die Meisterstücke-Angaben verwenden |
| 3 | Alter des Programms | Werkstatt „vor über zwanzig Jahren entwickelt“ | Urbanana: Formensprache und Farbskala **1987** (also über 35 Jahre), 50 Modelle | Formulierung ändern: „1987 entwickelt“. 25 Grundelemente (V3) und 50 Modelle (Urbanana) vereinbaren: „Aus 25 Grundelementen wurden bis heute 50 Modelle“ (Admin bestätigen) |
| 4 | Jahn und Jahn 2026 | 14. Juli bis 12. September | 14.7. bis 20.8.2026 (Galerie), 2025: 13.3.–26.4. (V3: 14. März) | Gegenprüfen |
| 5 | Archiv 2024 | Nolan, Chemnitz, Hetjens | zusätzlich **Greve Köln „51 WERKE“, 19.1.–17.2.2024** | Ergänzen |
| 6 | Auszeichnungen YJL | 1980, 1981, 1989, 2016 | zusätzlich **Künstlerinnenpreis NRW** (ohne Jahr), Goldmedaille Bayerischer Staatspreis, Keramikpreis Frechener Kulturstiftung | Jahr des NRW-Preises erfragen, dann ergänzen |
| 7 | Studium in Seoul | „Hochschule für Kunsterziehung“ | Nichinichi: „Soo Do Women’s University“ | Name bestätigen lassen |
| 8 | MOK-Hinweis | Aktuell führt zum MOK, ohne Hinweis | Museum bis 4.10.2026 geschlossen (technische Störung), Programm vorbei | Siehe Vorschlag V12 |
| 9 | IBAN/BIC | Zahlung fehlt BIC (Frage E4) | Anfrage-PDF nennt **BIC SPESDE3EXXX** | Frage E4 damit beantwortet, Werkstatt bestätigen lassen |
| 10 | Namen im Team | 5 Personen | Urbanana 2023: zusätzlich Auszubildende Estar Halfmann, Leonie Muelbredt. Jahn: Kyonga-Ha Kim (Zylinder). V3-Gruppenfoto zeigt 9 Personen | Team-Liste und Foto-Namen klären (siehe BILDPLAN.md) |

### 3.1 Eine Lücke im Umzugsplan

Die zitierten Essays, PDFs und Archivseiten (`/neuigkeiten/vergangene/*`) liegen auf der heutigen Domain. Siehe Abschnitt 1.3, Punkt 1. Das betrifft auch die V3-Seite `young-jae-lee.html` direkt, die Links sind der Hauptinhalt des Abschnitts „Texte“.

---

## 4. Rechtehinweise (Zitat, Freigabe)

Keine Rechtsberatung. Vor Livegang kurz mit der Werkstatt bzw. einer Kanzlei abstimmen.

1. **Kleinzitate** sind nach § 51 UrhG mit Quellenangabe (§ 63) zulässig, wenn sie der Auseinandersetzung dienen und kurz bleiben. Jeder Vorschlag unten bleibt bei ein bis drei Sätzen, ist wörtlich, mit Autor, Titel und Jahr. Auslassungen mit […] kennzeichnen.
2. **Die vier Essays von Jahn, Mennekes, Veit, Wagner und der von Catoir** tragen den Vermerk „Veröffentlichung mit freundlicher Genehmigung der Autorin bzw. des Autors“. Diese Genehmigung wurde für die Seite kwm-1924.de erteilt. Sie deckt nicht automatisch ein neues Angebot, eine Übersetzung oder das Hosting als PDF auf der neuen Domain. Wagner/„Galaxie 333“ zusätzlich: Galerie DKM / Stiftung DKM. Das ist Frage A4 in `FRAGEN-AN-DIE-WERKSTATT.md`, sie gilt auch für die Ablage der Volltexte.
3. **Urbanana-Interview:** Verlinken ist unproblematisch. Zitate mit Nennung von Ilona Marx und Datum. Für mehr als wenige Sätze und für jede Übernahme der Fotos bei urbanana bzw. Ilona Marx anfragen. Lee hat das Interview selbst gegeben, trotzdem bleibt das Textrecht bei der Redaktion.
4. **Museums- und Galerietexte** (MOK, MK&G, Greve, Jahn und Jahn, Nolan, Nichinichi, Jakobi) sind Werbetexte der Häuser. Wörtliche Kurzzitate sind möglich, Absätze nicht ohne Freigabe. Englische Texte nur für die englische Version, Übersetzungen bitte freigeben lassen.
5. **Fotos aller dieser Seiten nicht übernehmen.** Namentlich bekannte Urheber: Ilona Marx (urbanana), Marion Mennicken/Rheinisches Bildarchiv und André Schuster (MOK), Henning Rogge, Thomas Dashuber, Haydar Koyupinar (MK&G, Greve), Chris Franken (Chemnitz). Anfragen siehe `BILDPLAN.md`.
6. **Preise:** Das Urbanana-Interview nennt einen Marktpreis. Nicht übernehmen (Inhaltsregel).

---

## 5. Textvorschläge mit Einbaustelle

Alle Texte im ruhigen Ton der Seite. **Vorschlag, nicht übernommen.** Komponenten nach `DESIGN.md`, Abschnitt 11.

### V1. Aktuelles, Abschnitt „Veröffentlichungen“, Komponente `Statement` (`.pullquote`) über der Karte
Heute steht dort nur der Titel. Ergänzung eines Zitats aus dem Interview:
> „Wie in der asiatischen Töpferkunst arbeiten wir in unserer Werkstatt von innen nach außen und von unten nach oben: So entsteht Volumen.“
> Young-Jae Lee im Gespräch mit Ilona Marx, urbanana, 25. Januar 2023

Und die Karte „Der Ruf des Bauhaus“ bekommt als Kurztext: „Young-Jae Lee über Formen, Farben und die Freiheit der Wiederholung.“

### V2. Werkstatt, Abschnitt „Arbeitsweise“, Komponente `Statement` unter dem Zitat „Jedes Stück muss gut zu drehen sein …“
> „Das gibt uns Freiheit. Die Persönlichkeit der Dreher*innen beginnt einzufließen.“
> Young-Jae Lee, urbanana, 2023

(Gendersternchen wörtlich, oder mit Auslassung kürzen: der Satz davor lautet „Für mich ist … die vollkommene Beherrschung meines vorhandenen Repertoires.“)

### V3. Startseite, Abschnitt 7 „Haltung: Meditation und 99 Schalen“, Quellenzeile
Der Text „Für Young-Jae Lee ist – in Anlehnung an die koreanische Tradition – nicht die ständige Neuerfindung von Formen entscheidend …“ ist eine enge Paraphrase des Interviews. Vorschlag: als wörtliches Zitat markieren und die Quelle nennen.
> „Für mich ist – und damit folge ich der koreanischen Tradition – nicht die ständige Neuerfindung von Formen entscheidend, sondern die vollkommene Beherrschung meines vorhandenen Repertoires.“
> Young-Jae Lee, urbanana, 25. Januar 2023

### V4. Werkstatt, Abschnitt „Arbeitsweise“, neuer Kurzabsatz (Komponente Fließtext links vom Bild)
> **Wie das Programm entstand.** Das erste Stück war eine Müslischale. Später kamen ein Trinkbecher, ein Krug und ein Teller hinzu. Die sechs Töne der Farbskala entstanden noch 1987 in monatelangen Versuchen und sind seither gleich geblieben. Aus den ersten Formen sind bis heute 50 Modelle geworden.

Quelle: Urbanana-Interview 2023. Zahl und „1987“ von der Werkstatt bestätigen lassen (Abschnitt 3, Zeile 3).

### V5. Werkstatt, Abschnitt „Team“, Komponente `TeamCard`/Fließtext
Entwurf für eine Zeile unter der Überschrift „Team“, wörtlich zitiert:
> Wie die großen Zylindervasen entstehen, beschreibt Gisela Jahn: „Sie überlässt das Zentrieren und Hochziehen der Zylinder Mitarbeitern der Werkstatt.“

Optional ein Satz zur Ausbildung, **nur wenn die Werkstatt den aktuellen Stand bestätigt** (Urbanana 2023 nennt zwei Auszubildende und die Aussage, die Werkstatt sei der einzige Töpferei-Betrieb in NRW, der noch Lehrlinge ausbilden dürfe; diese Aussage nicht ungeprüft übernehmen).

### V6. Young-Jae Lee, Abschnitt „Biografie“, neuer Kurzabschnitt vor der Zeitleiste (Komponente `Statement` mit Fließtext)
> **Das erste Gefäß.** „Mein koreanischer Großvater, ein konfuzianischer Gelehrter, besaß große weiße Aufbewahrungsgefäße aus Keramik, in denen er unter geöltem Reispapier getrocknete Khakis aufbewahrte.“ Mit zwanzig kam Young-Jae Lee nach Deutschland, um Keramik zu lernen.
> Young-Jae Lee, urbanana, 25. Januar 2023

Achtung: „Mit zwanzig“ stammt aus dem Interview („als 20-Jährige“). Greve nennt 1972, also etwa 21 Jahre. Vor der Übernahme „Anfang der Zwanziger“ oder das Jahr 1972 verwenden.

### V7. Young-Jae Lee, Abschnitt „Texte“, fehlende und schwache Auszüge ersetzen (Komponente Liste `.texts`)
- Veit (heute ohne Auszug): „So ist Young-Jae Lee eine Künstlerin im westlichen und eine Töpferin in bestem ostasiatischen Sinne.“
- Mennekes (heute: „Devotion, …“): „Daher sind diese Gefäße auf eine besondere Weise auch dann gefüllt, wenn sie leer sind.“
- Zusätzlich ein Kurztext zu jedem Text mit Entstehung, z. B. „Katalog zur Ausstellung in der Kunst-Station St. Peter Köln, 2002“ (alle sechs Texte haben im PDF eine Quellenzeile).

### V8. Meisterstücke, Zäsuren und Abschnittseinleitungen
- **Vasen, Unterabschnitt „Spindelvasen, 2006/07“**, Kurztext unter der Überschrift (Paraphrase nach Gisela Jahn und Barbara Catoir, als Paraphrase mit Quelle):
  > Die Spindelvase besteht aus zwei Schalen. Wie bei alten koreanischen Vorratsgefäßen wird eine zweite Schale auf die erste gesetzt. Young-Jae Lee verwischt die Naht nicht, sie macht sie zur klaren Linie.
  > nach Gisela Jahn, 2004, und Barbara Catoir, 2002
- **Zäsur vor „Kummen“** (`.pullquote`): „Young-Jae Lees Gefäße sind die Vollendung des Unvollkommenen.“ Barbara Catoir, „Gespannte Lebendigkeit“, 2002. (Die Seite nutzt dort heute Wagner, „Bauchige Becher …“)
- **Schalen, neben dem Detail 1135 px:** „Entscheidend für das Gelingen einer Tonschale ist der Rand.“ Thomas Wagner, 2006.
- **Hinweis:** Lee betont laut Nolan 2024, die Spindelvasen seien „keine Kopien koreanischer Mondvasen“ (Paraphrase der englischen Quelle, Genehmigung vor Übernahme).

### V9. Besuch, Seitenkopf oder Abschnitt „Adresse“, `Statement` (Zäsur)
Passt, weil die Seite zum Kommen einlädt:
> „Jedem, der Young-Jae Lees Werk verstehen will, sei geraten, sich nicht mit dem bloßen Augenschein zu begnügen, denn nur der, der eine Schale oder eine Vase in beiden Händen gehalten, ertastet und erspürt hat, wird ihre wahre Schönheit und Vollkommenheit erfahren.“
> Willibald Veit, „Young-Jae Lee – Die Töpferin“, 2004

### V10. Manufaktur, Statement im Abschnitt „Geschirr“ oder vor der Anfrage-Leiste
- „Jeden Tag benutze ich mit größter Selbstverständlichkeit Teller, Schalen, Schüsseln und Vorratsgefäße des in Form und Farbe aufeinander abgestimmten Geschirrs […]“ Thomas Wagner, „Galaxie 333“, 2009. (Der Satz beginnt im Original „… und jeden Tag benutze ich …“, deshalb mit Auslassung.)
- Alternativ ein Satz aus dem Interview, passt zu „Keiner Mode, keinem Zeitgeist unterworfen“: „Oft kommen die Kinder von früheren Kund*innen, die ein Service von ihren Eltern geerbt haben, um ihre Sammlung zu ergänzen.“ Young-Jae Lee, urbanana, 2023.

### V11. Young-Jae Lee, Abschnitt „Haltung“ oder Zäsur „Eine nach der anderen“
Auf Basis der Kirchgemeinde Chemnitz:
> „… wie die Welt sie noch nicht gesehen hat.“ Zitiert nach der Ankündigung der Ausstellung „Young-Jae Lee: SCHALEN“, Ev.-Luth. St.-Jakobi-Kreuz-Kirchgemeinde Chemnitz, 2024. (Der Satz ist dort eine Wiedergabe der Absicht der Künstlerin, kein wörtlich belegtes Interview. Nur mit Zustimmung von Young-Jae Lee verwenden.)

### V12. Aktuelles und Startseite „Aktuell“, MOK-Eintrag
- Zeitlich heikel: Das MOK ist laut eigener Seite bis 4.10.2026 geschlossen. Vorschlag für die Hinweiszeile unter dem MOK-Eintrag (nach Sichtprüfung wieder löschen): „Das Museum ist bis einschließlich 4. Oktober wegen einer technischen Störung geschlossen. Öffnungszeiten bitte vorab auf der Seite des Museums prüfen.“
- Kurztext (wörtlich, MOK): „Beim genauen Betrachten offenbart sich jede Struktur des Tons, jeder Farbverlauf der Glasur anders und einzigartig.“ (heute: „Schalen von Young-Jae Lee im Museum für Ostasiatische Kunst in Köln.“)
- Ergänzung des Greve-Eintrags: Link auf die Künstlerseite statt auf die Startseite.

### V13. Startseite „Ausstellungsorte“ und Archiv Aktuelles, kleine Ergänzungen
- Hamburg (MK&G 2022/23, erste Ausgabe der Reihe „Contemporary Craft“): Detailzeile beim Ort „Hamburg“, falls die Karte eine bekommt.
- Archiv 2024 ergänzen: „51 WERKE“, Galerie Karsten Greve, Köln, 19. Januar – 17. Februar. Archiv 2026 Jahn und Jahn: Datum prüfen.
- Neue Ausstellungsorte aus den Quellen: St. Moritz, Chemnitz, New York, Kyoto sind vorhanden. Zürich (Raum49, 2023) ist vorhanden.

### V14. Werkstatt, Auszeichnungen / Young-Jae Lee, Auszeichnungen
Ergänzen: „Künstlerinnenpreis des Landes Nordrhein-Westfalen“ (Jahr erfragen). Quelle: Galerie Karsten Greve, Künstlerseite.

### V15. Jahresarchiv und Chronik, Korrektur
Siehe 3 (1987, 1993, 1300 °C, „vor über zwanzig Jahren“).

### V16. Englische Version (`EN-TEXTE.md`), später
Aus Nolan und Jahn und Jahn stammen bereits englische Beschreibungen. Wörtliche Übernahme nur mit Freigabe. Eigene Formulierungen empfehlen (siehe V8).

---

## 6. Offene Fragen an die Werkstatt, neu aus dieser Recherche
1. Leitung 1986 oder 1987, was bedeutet der Eintrag 1993? (Abschnitt 3, Zeile 1)
2. Brenntemperatur je Ofen. (Zeile 2)
3. Stimmt „50 Modelle“, und gilt „1987“ für Formen und Farbskala? (Zeile 3)
4. Lehrlinge: Bildet die Werkstatt aus, wer sind aktuell Mitarbeitende und Auszubildende, und wer steht auf dem Gruppenfoto?
5. Jahr des Künstlerinnenpreises NRW.
6. Jahn und Jahn 2026: richtige Daten. Greve „51 WERKE“ 2024 ergänzen?
7. Dürfen die Essay-Volltexte als Seiten oder PDFs auf der neuen Domain liegen (Genehmigungen)?
8. BIC SPESDE3EXXX bestätigen.
9. Freigabe für das Zitat „wie die Welt sie noch nicht gesehen hat“ (V11) durch Young-Jae Lee.
