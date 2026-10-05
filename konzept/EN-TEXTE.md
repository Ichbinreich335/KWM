# Englische Texte – Zuordnung Altbestand und Vorschläge (Design V3)

Stand: 03.10.2026, Branch `design-v3`. Grundlage: alle 68 EN-Seiten von `kwm-1924.de/en/` (rekursiv über die EN-Navigation abgerufen) gegen die deutschen V3-Seiten `src/v3/*.html` samt Partials und den Texten in `site/v3/js/`. Der Rohtext des Altbestands steht in `konzept/EN-ALTBESTAND.md`.

## 0. Lesehilfe und Entscheidungen

**Spalte „Quelle“**

| Wert | Bedeutung |
|---|---|
| `alt` | englischer Text steht so auf der alten Seite, kann wörtlich übernommen werden |
| `alt*` | alter Text, mit kleiner Korrektur (Schreibweise, Zahlenformat, Tippfehler) |
| `fehlt – Vorschlag` | es gibt keine englische Entsprechung, der Text ist ein Übersetzungsvorschlag |
| `fehlt – Rechte` | Zitat eines Autors, keine veröffentlichte englische Fassung gefunden: Übersetzung nötig, Rechte klären. Der Text ist nur ein Arbeitsvorschlag und nicht zur Veröffentlichung gedacht |

**Empfehlung Sprachvariante: amerikanisches Englisch.** Der Altbestand ist überwiegend amerikanisch (color, program, Korean Cultural Center, Jewelry fehlt, aber „Colors“, „program“, „center“), die Übersetzerin ist Alison Gallup, wichtige Galerien liegen in den USA (David Nolan, Pucker). Ausnahmen im Altbestand (colour in den AGB, Jewellery in 2016, „6 to 8 November“) werden angeglichen. Einheitliche Regeln:

- Datum: `March 7 – May 24, 2026`; Einzeltag `November 6, 2026`; Spanne im Monat `November 6–8, 2026`. Keine Ordnungszahlen („7th“) und keine deutschen Punkte.
- Uhrzeit: `9 a.m.–5 p.m.`, `11 a.m.–3 p.m.`, `noon`. Der Altbestand mischt „9:00 a.m.“, „2-6 pm“ und „11am“.
- Zahlen: Dezimalpunkt statt Komma (`10.5 cm`, nicht `10,5 cm`), Ø bleibt als „D“ (diameter) in Werkangaben, H für Höhe. Im Altbestand stehen beide Schreibweisen gemischt (`27,0 cm` und `6.5 cm`), das wird beim Import vereinheitlicht.
- Telefon: `+49 201 30 50 80` (Altbestand: `0049 (0)201 – 30 50 80`).
- Eigennamen bleiben deutsch: Keramische Werkstatt Margaretenhöhe, Zeche Zollverein, Museum für Ostasiatische Kunst. Beim ersten Vorkommen ein Zusatz: „Keramische Werkstatt Margaretenhöhe (Margaretenhöhe Ceramic Workshop)“. Ausstellungstitel bleiben in der Originalsprache, englische Titel stehen wie veröffentlicht.
- Anrede: Sie wird zu „you“, Wir zu „we“. Ruhiger, sachlicher Ton, kein Ausrufezeichen, keine Werbesprache.

**Zeichen im Text:** `[…]` = Auslassung wie im deutschen Zitat. Alle Vorschläge sind nicht von der Werkstatt freigegeben.

---

## 1. Globale Elemente (Header, Footer, Navigation, Sprachwahl)

Quelle: `partials/header.html`, `partials/footer.html`, `partials/head.html`.

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| Keramische Werkstatt Margaretenhöhe (Logo, Zeilen „Keramische Werkstatt / Margaretenhöhe“) | Keramische Werkstatt Margaretenhöhe | alt | `/en/` |
| Zum Inhalt springen | Skip to content | fehlt – Vorschlag | – |
| Menü | Menu | fehlt – Vorschlag | – |
| Hauptnavigation (aria-label) | Main navigation | fehlt – Vorschlag | – |
| Nav: Meisterstücke | Masterworks | alt | `/en/masterworks/` |
| Nav: Manufaktur | Collection | alt | `/en/collection/` |
| Nav: Young-Jae Lee | Young-Jae Lee | alt | `/en/youngjae-lee/` |
| Nav: Werkstatt | Workshop | alt | `/en/workshop/` |
| Nav: Aktuelles | News | alt | `/en/news/` |
| Nav: Besuch | Visit | fehlt – Vorschlag (alt: „Inquiries“ und „Contact“ als zwei Punkte) | `/en/inquiries-orders/`, `/en/business/contact/` |
| Unterzeile Meisterstücke: Unikate aus der Hand von Young-Jae Lee | Unique pieces made by Young-Jae Lee | fehlt – Vorschlag | – |
| Unterzeile Manufaktur: Geschirr, in der Werkstatt gedreht und glasiert | Tableware, thrown and glazed in the workshop | fehlt – Vorschlag | – |
| Unterzeile Young-Jae Lee: Keramikerin, leitet die Werkstatt seit 1987 | Ceramic artist, director of the workshop since 1987 | fehlt – Vorschlag | – |
| Unterzeile Werkstatt: Seit 1924, Bauhaus-Linie, Team | Since 1924, the Bauhaus tradition, the team | fehlt – Vorschlag | – |
| Unterzeile Aktuelles: Ausstellungen und Termine | Exhibitions and events | fehlt – Vorschlag | – |
| Unterzeile Besuch: Öffnungszeiten, Anfahrt, Kontakt | Opening hours, directions, contact | fehlt – Vorschlag | – |
| Mo–Fr 9–17 Uhr, Sa 11–15 Uhr | Mon–Fri 9 a.m.–5 p.m., Sat 11 a.m.–3 p.m. | alt* („Monday to Friday from 9:00 a.m. to 5:00 p.m., Saturday from 11:00 a.m. to 03:00 p.m.“) | `/en/business/contact/` |
| Anfrage per E-Mail | Inquiries by e-mail | fehlt – Vorschlag (alt: „Inquiries“) | `/en/inquiries-orders/` |
| Sprache (aria-label) / DE / EN | Language / DE / EN | fehlt – Vorschlag | – |
| Footer: Werkstatt | Workshop | alt | – |
| auf dem Gelände der Zeche Zollverein | on the grounds of the Zollverein coal mine complex | fehlt – Vorschlag | – |
| Footer: Geöffnet | Open | fehlt – Vorschlag | – |
| Mo–Fr 9–17 Uhr / Sa 11–15 Uhr / sonst nach Vereinbarung | Mon–Fri 9 a.m.–5 p.m. / Sat 11 a.m.–3 p.m. / otherwise by appointment | alt* („or by appointment“) | `/en/business/contact/` |
| Footer: Kontakt | Contact | alt | `/en/business/contact/` |
| Footer: Seiten | Pages | fehlt – Vorschlag | – |
| Footer: Aktuelles | News | alt | `/en/news/` |
| Footer: Besuch & Anfahrt | Visit and directions | fehlt – Vorschlag (alt: „How to find us“) | `/en/business/contact/` |
| Footer: Zahlung | Payment | alt | `/en/business/payment/` |
| Footer: Verpackung & Transport | Packing and transport | alt | `/en/business/tac/packing-and-transport/` |
| Footer: AGB | Terms and conditions | alt („T&C“ im Altfooter, Langform „General Terms and Conditions“) | `/en/business/tac/` |
| Footer: Impressum | Legal notice | alt („About this site“ mit Abschnitt „Legal Notice“) | `/en/business/about-this-site/` |
| Footer: Datenschutz | Privacy policy | fehlt – Vorschlag | – |
| Footer: Instagram | Instagram | alt | – |
| Rechtliches (Navigation) | Legal | fehlt – Vorschlag | – |
| Auf dieser Seite / Kapitel dieser Seite (aria-label) | On this page / Chapters on this page | fehlt – Vorschlag | – |
| `<title>`/Meta-Beschreibung Startseite | Keramische Werkstatt Margaretenhöhe · since 1924 / Thrown vessels by Young-Jae Lee and a manufactory program in the formal tradition of the Bauhaus. Keramische Werkstatt Margaretenhöhe, Zeche Zollverein, Essen. | fehlt – Vorschlag | – |

---

## 2. Startseite (`index.html`)

Die Seite enthält Textteile doppelt (Hero und „Einstieg“, „Meditation“ und „Kosmos zusammen“). Die Übersetzung wird nur einmal gepflegt.

### 2.1 Hero und Einstieg

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H1: Immer sind es Schalen, und doch ist keine wie die andere. | It is always bowls, and yet no bowl is like another. | fehlt – Rechte (Thomas Wagner, „Die aufgehobene Zeit“; Katalog „1111 Schalen“, Ostfildern 2006, ob dort eine englische Fassung steht, beim Verlag prüfen) | `/en/youngjae-lee/texts/` (nur deutscher Verweis) |
| Thomas Wagner über die Schalen von Young-Jae Lee | Thomas Wagner on the bowls of Young-Jae Lee | fehlt – Vorschlag | – |
| Lede: Keramische Werkstatt Margaretenhöhe. Gedrehte Gefäße und Gebrauchsgeschirr aus Essen – seit 1924, heute auf dem Gelände der Zeche Zollverein. | Keramische Werkstatt Margaretenhöhe. Thrown vessels and everyday tableware from Essen – since 1924, today on the grounds of the Zollverein coal mine complex. | fehlt – Vorschlag | – |
| Button: Meisterstücke ansehen | See the masterworks | fehlt – Vorschlag | – |
| Button: Manufakturprogramm | The collection | fehlt – Vorschlag | – |
| Bildunterschrift: Kummerschalen · Foto: Christopher Clem Franken | Kummerschalen · Photo: Christopher Clem Franken | fehlt – Vorschlag | – |
| Alt-Text: Viele flache Schalen von Young-Jae Lee auf einem Steinboden, seladonblau, schwarz gesprenkelt und rotbraun glasiert | Many shallow bowls by Young-Jae Lee on a stone floor, glazed celadon blue, black-speckled and russet brown | fehlt – Vorschlag | – |

### 2.2 Aktuell

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H2: Aktuell | Current | alt | `/en/news/current/` |
| Link: Alle Ausstellungen und Termine | All exhibitions and events | fehlt – Vorschlag | – |
| Hinweis: Am Samstag, 3. Oktober 2026 bleibt die Werkstatt geschlossen. Ab Montag, 5. Oktober sind wir wieder wie gewohnt für Sie da. | The workshop will be closed on Saturday, October 3, 2026. From Monday, October 5, we will be open again as usual. | fehlt – Vorschlag | – |
| Status: Läuft · bis 25. Oktober | On view · through October 25 | fehlt – Vorschlag (siehe Abschnitt 11) | – |
| „99 Schalen – ein Kosmos“ | “99 bowls – a cosmos” | alt | `/en/news/current/` |
| Museum für Ostasiatische Kunst (MOK), Köln | Museum für Ostasiatische Kunst (MOK), Cologne | alt* („MOK at Köln“) | `/en/news/current/` |
| Schalen von Young-Jae Lee im Museum für Ostasiatische Kunst in Köln. | Bowls by Young-Jae Lee at the Museum für Ostasiatische Kunst in Cologne. | fehlt – Vorschlag | – |
| Zeitraum: 23. April bis 25. Oktober 2026 | Dates: April 23 – October 25, 2026 | alt* („exhibition from April 23 to October 25, 2026“) | `/en/news/current/` |
| Adresse: Universitätsstraße 100, 50674 Köln | Address: Universitätsstrasse 100, 50674 Cologne | alt | `/en/news/current/` |
| Zur Ausstellung im MOK | To the exhibition at the MOK | fehlt – Vorschlag | – |
| „Kummerschalen“ · Willibrordi-Dom, Wesel | “Kummerschalen” · Willibrordi-Dom, Wesel | alt (Titel dort unübersetzt) | `/en/news/current/` |
| Mehr zur Ausstellung (Button) / Weniger anzeigen | More about the exhibition / Show less | fehlt – Vorschlag | – |
| Der Niederrheinische Kunstverein zeigt in Kooperation mit der Evangelischen Kirchengemeinde Wesel handgefertigte Schalen der international renommierten Keramikerin Young-Jae Lee. | The Niederrheinischer Kunstverein, in cooperation with the Protestant parish of Wesel, presents handmade bowls by the internationally renowned ceramic artist Young-Jae Lee. | fehlt – Vorschlag | – |
| Zeitraum: 16. August bis 31. Oktober 2026 | Dates: August 16 – October 31, 2026 | alt* | `/en/news/current/` |
| Eröffnung: Sonntag, 16. August 2026, 11 Uhr Gottesdienst zur Ausstellung, 12.15 Uhr Eröffnung der Ausstellung. | Opening: Sunday, August 16, 2026, 11 a.m. service for the exhibition, 12:15 p.m. opening of the exhibition. | fehlt – Vorschlag | – |
| Öffnungszeiten: Di–So 14.30–17.00 Uhr, Mi und Sa 10–12 Uhr | Opening hours: Tue–Sun 2:30–5 p.m., Wed and Sat 10 a.m.–noon | fehlt – Vorschlag | – |
| Adresse: Großer Markt, 46483 Wesel | Address: Großer Markt, 46483 Wesel | alt | `/en/news/current/` |
| Ab 3. Oktober · „Kathleen Jacobs / Young‑Jae Lee“ · Galerie Karsten Greve, St. Moritz, Schweiz | From October 3 · “Kathleen Jacobs / Young-Jae Lee” · Galerie Karsten Greve, St. Moritz, Switzerland | fehlt – Vorschlag (Ausstellung fehlt im Altbestand) | – |
| Malerei von Kathleen Jacobs (Öl auf Leinen) und Keramik von Young‑Jae Lee. | Paintings by Kathleen Jacobs (oil on linen) and ceramics by Young-Jae Lee. | fehlt – Vorschlag | – |
| Zeitraum: 3. Oktober bis 12. Dezember 2026 | Dates: October 3 – December 12, 2026 | fehlt – Vorschlag | – |
| Ab 6. November · Mode, Taschen, Keramik & Licht im Dialog | From November 6 · Fashion, Bags, Ceramics & Lighting in Dialogue | alt* („Fashion, Bags, Ceramics & Lighting in Dialogue“) | `/en/news/current/` |
| Pop-up-Store Vol. 2 in der Werkstatt, Zeche Zollverein | Pop-up store, vol. 2, at the workshop, Zeche Zollverein | fehlt – Vorschlag | – |
| Pop-up-Store in den Räumen der Keramischen Werkstatt Margaretenhöhe. | Pop-up store at the Keramische Werkstatt Margaretenhöhe. | alt* („Pop-up store at the Keramische Werkstatt Margaretenhöhe“) | `/en/news/current/` |
| Zeitraum: 6. bis 8. November 2026 | Dates: November 6–8, 2026 | alt* | `/en/news/current/` |
| Geöffnet: Fr und Sa 11–18 Uhr, So 11–16 Uhr | Open: Fri and Sat 11 a.m.–6 p.m., Sun 11 a.m.–4 p.m. | alt* | `/en/news/current/` |
| In Kooperation mit: Burggraf Burggraf (Taschen), Joachim Kern (Mode), Christiane Kuntz (Mode), Dietrich Pampus (Vintage Leuchten) | In collaboration with: Burggraf Burggraf (bags), Joachim Kern (fashion), Christiane Kuntz (fashion), Dietrich Pampus (vintage lamps) | alt* (alt: „Elena Burggraf-Reusch (bags) … (lamps)“) | `/en/news/current/` |
| Adresse: Bullmannaue 19, 45327 Essen, Gelände der Zeche Zollverein | Address: Bullmannaue 19, 45327 Essen, on the grounds of the Zeche Zollverein | alt* | `/en/news/current/` |
| Anfahrt zur Werkstatt | Directions to the workshop | fehlt – Vorschlag | – |
| Dt./Zeitraum, Adresse, Eröffnung, Öffnungszeiten, Geöffnet, In Kooperation mit (Beschriftungen) | Dates, Address, Opening, Opening hours, Open, In collaboration with | fehlt – Vorschlag | – |

Auffälligkeit: Der Altbestand schreibt „Elena Burggraf-Reusch (bags)“, die V3 „Burggraf Burggraf“. Name vor der Übersetzung bei der Werkstatt klären.

### 2.3 Über die Werkstatt und die zwei Linien

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| Aus der ständigen Wiederholung einer handwerklichen Technik, dem Drehen auf der Töpferscheibe, erwächst die vollkommene Schönheit einer Form. | The constant repetition of a craft technique, the turning on the potter’s wheel, gives rise to the perfect beauty of a form. | alt* („From the constant repetition of a craft technique, the turning on the potter’s wheel, grows the perfect beauty of a form.“) | `/en/workshop/` |
| 1924 auf Initiative von Margarete Krupp für die Siedlung Margaretenhöhe gegründet. Seit 1927 den Formprinzipien des Bauhauses verpflichtet – über Otto Lindigs Schüler Johannes Leßmann. | Founded in 1924 on the initiative of Margarete Krupp for the Margaretenhöhe housing estate. Committed to the formal principles of the Bauhaus since 1927, through Johannes Leßmann, a student of Otto Lindig. | fehlt – Vorschlag (Fakten aus `/en/workshop/history/`) | `/en/workshop/history/` |
| Seit 1986 geprägt von Young-Jae Lee: Meisterstücke aus ihrer eigenen Hand und ein Geschirr, das seitdem nahezu unverändert in der Werkstatt gedreht wird. | Shaped by Young-Jae Lee since 1986: masterworks from her own hand and a line of tableware that has been thrown in the workshop almost unchanged ever since. | fehlt – Vorschlag | – |
| Karte: Meisterstücke · Unikate aus der Hand von Young-Jae Lee: Schalen, Kummen, Vasen | Masterworks · Unique pieces made by Young-Jae Lee: bowls, kummen, vases | fehlt – Vorschlag | – |
| Karte: Manufaktur · Geschirr nach Bauhaus-Formprinzipien, in der Werkstatt gedreht und glasiert | Collection · Tableware in the formal tradition of the Bauhaus, thrown and glazed in the workshop | fehlt – Vorschlag | – |
| Zwei Linien der Werkstatt (aria-label) | The two lines of the workshop | fehlt – Vorschlag | – |

### 2.4 Young-Jae Lee

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H2: Young-Jae Lee | Young-Jae Lee | alt | `/en/youngjae-lee/` |
| Zitat Catoir: „Sie erzählte von den Zeremonien in den Tempeln, dem Ritual eines hundertfachen Niederkniens, Niederfallens vor den Buddha-Statuen. Sie erzählte von ihrer Großmutter, die sich diesen geistig-körperlichen Übungen bis ins hohe Alter unterzog. Daran habe sie sich immer wieder erinnert, während sie ihre Schalen drehte, eine nach der anderen, ohne je darüber müde zu werden.“ | “She told of the ceremonies in the temples, the ritual of kneeling and prostrating a hundred times before the statues of the Buddha. She told of her grandmother, who practiced these spiritual and physical exercises into old age. She had recalled this again and again while throwing her bowls, one after another, without ever tiring of it.” | fehlt – Rechte (Barbara Catoir, „Gespannte Lebendigkeit“; nur deutsch online, Katalog Kunst-Station St. Peter 2002) | `/en/youngjae-lee/texts/` |
| Quelle: Barbara Catoir, »Gespannte Lebendigkeit« | Barbara Catoir, “Gespannte Lebendigkeit” (“Tense Vitality”) | fehlt – Vorschlag (Titelübersetzung) | – |
| Zitat Jahn: „Die minimale Veränderung ist Young-Jae Lees unbegrenzter Freiraum – in der Form wie in der Farbigkeit der Glasur und der Bemalung. Ihr geht es nicht um Formerfindung, sondern um die Individualität des Gefäßes.“ | “Young-Jae Lee finds boundless freedom in minimal change—both in form and in the color of the glaze and decoration. She is not concerned with invention of form, in feats of innovation, but with the individuality of the vessel.” | alt (veröffentlichte Übersetzung von Gisela Jahn auf der EN-Seite; Schreibweise „color“ amerikanisch) | `/en/youngjae-lee/` |
| Zwei Traditionen treffen sich in ihren Gefäßen: die Ideen des Bauhauses, denen sie sich verpflichtet fühlt – und ihr koreanisches Erbe, „das heitere, schwerelose Empfinden für die Form und die subtilen Farben“. | Two traditions meet in her vessels: the ideas of the Bauhaus, to which she feels committed – and her Korean heritage, “the cheerful, weightless sense of form and the subtle colors”. | fehlt – Rechte (Zitatteil nach Gisela Jahn, nur deutsch veröffentlicht) | – |
| Quelle: Gisela Jahn, »Gefäße drehen, Gefäße betrachten, Gefäße benutzen« | Gisela Jahn, “Turning vessels, looking at vessels, using vessels” | fehlt – Vorschlag (Titelübersetzung) | – |
| Zeitleiste: 1951 Seoul geboren; Studium an der Hochschule für Kunsterziehung | 1951 Seoul – born; studied at the college of art education | alt* („Born in Seoul“, „Studied art education in Seoul“) | `/en/youngjae-lee/biography/` |
| 1973 Wiesbaden Keramik bei Margot Münster, Formgestaltung bei Erwin Schutzbach | 1973 Wiesbaden – ceramics with Margot Münster, design with Erwin Schutzbach | alt* | `/en/youngjae-lee/biography/` |
| 1978 Sandhausen eigene Werkstatt bei Heidelberg | 1978 Sandhausen – own workshop near Heidelberg | alt* | `/en/youngjae-lee/biography/` |
| 1987 Essen Leitung der Keramischen Werkstatt Margaretenhöhe | 1987 Essen – director of the Keramische Werkstatt Margaretenhöhe | alt* | `/en/youngjae-lee/biography/` |
| 2016 Breslau Ehrendoktorwürde der Eugeniusz-Geppert-Akademie | 2016 Wrocław – honorary doctorate, Eugeniusz Geppert Academy of Art and Design | alt* (alt: „Wroclaw“; Schreibweise Wrocław wie auf den Exhibitions-Seiten) | `/en/youngjae-lee/awards/` |
| Link: Werke in Sammlungen | Works in collections | fehlt – Vorschlag | – |
| Alt-Text: Young-Jae Lee in der Werkstatt, vor ihr ungebrannte Schalen und Vasen, hinter ihr Regale voller Gefäße | Young-Jae Lee in the workshop, unfired bowls and vases in front of her, shelves full of vessels behind her | fehlt – Vorschlag | – |

### 2.5 Meisterstücke (Auswahl)

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H2: Meisterstücke | Masterworks | alt | `/en/masterworks/` |
| Feldspatglasuren, gebrannt im Gas- oder Holzofen bei etwa 1300 °C. | Feldspathic glazes, fired in a gas or wood kiln at about 1300 °C. | fehlt – Vorschlag (Fakten aus `/en/masterworks/method/`) | `/en/masterworks/method/` |
| Link: Alle Meisterstücke | All masterworks | fehlt – Vorschlag | – |
| Alle Meisterstücke stammen aus der Hand Young-Jae Lees – von ihr selbst gedreht, bemalt und glasiert. | All the masterworks come from Young-Jae Lee’s hand – turned, painted and glazed by her herself. | alt* („All the masterpieces shown here come from Young-Jae Lee’s hand and were turned, painted and glazed by her herself.“) | `/en/masterworks/` |
| Teeschale, ohne Titel 2023 | Tea bowl, untitled, 2023 | fehlt – Vorschlag | – |
| Zu diesem Stück anfragen | Inquire about this piece | fehlt – Vorschlag | – |
| Kumme · 1995 · H 18 cm, D 14,6 cm · Petalit-Eichenasche-Glasur · Holzofen | Kumme · 1995 · H 18 cm, D 14.6 cm · petalite oak ash glaze · wood kiln | alt* („Vessels | H 18 cm, D 14.6 cm | petalite oak ash glaze | wood-fired kiln | Essen 1995“) | `/en/masterworks/vessels/` |
| Schale, spitz, XXL · 2003–05 · H 10,5 cm, D 22,5 cm · Petalit-Eichenasche-Glasur | Bowl, V-shaped, XXL · 2003–05 · H 10.5 cm, D 22.5 cm · petalite oak ash glaze | alt | `/en/masterworks/bowls/bowl-v-shaped-xxl/` |
| Zylindervasen, groß · 2003 · H ca. 30 cm, D ca. 11,5 cm · Petalit-Eichenasche-Glasur · Holzofen | Cylinder vases, large · 2003 · H ca. 30 cm, D ca. 11.5 cm · petalite oak ash glaze · wood kiln | alt | `/en/masterworks/vases/cylinder-vase-large/` |
| Schale, spitz, XL · 2003–05 · H 10,5 cm, D 21,5 cm · Strontium-Feldspat-Glasur | Bowl, V-shaped, XL · 2003–05 · H 10.5 cm, D 21.5 cm · strontium feldspathic glaze | alt | `/en/masterworks/bowls/bowl-v-shaped-xl/` |
| Bettelmönchschale · 1988 · H 10,2 cm, D 13,6 cm · Barium-Feldspat-Glasur · Gasofen | Mendicant’s bowl · 1988 · H 10.2 cm, D 13.6 cm · barium feldspathic glaze · gas kiln | alt | `/en/masterworks/vessels/` |
| Schale, spitz, groß · 2003–05 · H 10,3 cm, D 18,8 cm · Barium-Feldspat-Glasur | Bowl, V-shaped, large · 2003–05 · H 10.3 cm, D 18.8 cm · barium feldspathic glaze | alt | `/en/masterworks/bowls/bowl-v-shaped-large/` |
| Alt-Texte (6 Stück in dieser Auswahl, z. B. „Teeschale mit rotbraun geflammter Glasur …“) | z. B. “Tea bowl with a russet flashed glaze, light blue brush marks and dark iron speckles” | fehlt – Vorschlag | – |

### 2.6 Ausstellungsorte (Karte)

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H2: Ausstellungsorte | Exhibition venues | fehlt – Vorschlag (alt: „Exhibitions“) | `/en/youngjae-lee/exhibitions/` |
| Ausstellungen seit 1980 in Europa, Korea, Japan und den USA. | Exhibitions since 1980 in Europe, Korea, Japan and the USA. | fehlt – Vorschlag | – |
| Link: Alle Ausstellungen | All exhibitions | fehlt – Vorschlag | – |
| Auf eine Stadt klicken/tippen, um die Ausstellungen dort zu sehen. | Click or tap a city to see the exhibitions there. | fehlt – Vorschlag | – |
| „7 Ausstellungen“ / „1 Ausstellung“ | 7 exhibitions / 1 exhibition | fehlt – Vorschlag | – |
| Städtenamen: Köln, München, Tokio, Essen, Korea, Boston, Krakau und Breslau, Chemnitz, Bonn, New York, Düsseldorf, Wien, Zürich | Cologne, Munich, Tokyo, Essen, Korea, Boston, Kraków and Wrocław, Chemnitz, Bonn, New York, Düsseldorf, Vienna, Zurich | alt* (Altbestand: Kraków, Wrocław/Wroclaw, Vienna, Zurich, Cologne, Munich) | `/en/youngjae-lee/exhibitions/` |
| Ausstellungseinträge (z. B. „2026 Museum für Ostasiatische Kunst „99 Schalen – ein Kosmos““) | Museum für Ostasiatische Kunst, “99 bowls – a cosmos” usw. | alt (Ausstellungsliste 2016–2026 englisch vorhanden, Titel zum Teil nur deutsch) | `/en/youngjae-lee/exhibitions/`, `/en/news/past/…` |
| Städte und Zahlen nach der Ausstellungsliste 2016 bis 2026. | Cities and figures based on the exhibition list, 2016 to 2026. | fehlt – Vorschlag | – |
| Schließen | Close | fehlt – Vorschlag | – |

### 2.7 Haltung, Kosmos, Manufaktur, Feuer

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| Die Herstellung jedes neuen Gefäßes gleicht einer Meditation. | The making of each new vessel is like a meditation. | alt | `/en/masterworks/` |
| Für Young-Jae Lee ist – in Anlehnung an die koreanische Tradition – nicht die ständige Neuerfindung von Formen entscheidend, sondern die vollkommene Beherrschung des vorhandenen Repertoires. Erst mit der Verinnerlichung der Formen wird die tägliche Arbeit an der Drehscheibe jenseits aller Routine zu einer Art Exerzitium. Die Persönlichkeit beginnt einzufließen, das Individuelle drückt sich im Handwerklichen aus. | For Young-Jae Lee – following the Korean tradition – it is not the constant reinvention of forms that is decisive, but the perfect mastery of the existing repertoire. Only with the internalization of the forms can the daily work on the wheel become a kind of retreat beyond all routine. The personality begins to flow in, the individual expresses itself in the craftsmanship. | alt* („becomes a kind of retreat“ statt „can become“; „retreat“ für Exerzitium, siehe Glossar) | `/en/masterworks/` |
| H2: Ein Ring aus Teilchen um eine leere Mitte. / Dieselbe Form, immer wieder. | A ring of particles around an empty center. / The same form, again and again. | fehlt – Rechte (Überschrift ist Wagner-Zitat) / fehlt – Vorschlag | – |
| Zitat Wagner: „Schalen über Schalen, einfach auf den Boden gestellt. Ein Meer aus Schalen, ein Feld aus Kelchen, ein Ring aus Teilchen um eine leere Mitte, eine kleine Milchstraße voll schimmernder Gefäße.“ | “Bowls upon bowls, simply set on the floor. A sea of bowls, a field of chalices, a ring of particles around an empty center, a small Milky Way full of shimmering vessels.” | fehlt – Rechte (Thomas Wagner, „Die aufgehobene Zeit“) | `/en/youngjae-lee/texts/` |
| Quelle: Thomas Wagner, »Die aufgehobene Zeit?« | Thomas Wagner, “Die aufgehobene Zeit” (“Time Suspended”) | fehlt – Vorschlag (Titelübersetzung; Fragezeichen im Titel auf der alten Seite nicht vorhanden, DE-Fassung vereinheitlichen) | – |
| 99 Schalen | 99 bowls | alt | `/en/news/current/` |
| Zu sehen im Museum für Ostasiatische Kunst, Köln, bis 25. Oktober 2026 / Link: Zur Ausstellung | On view at the Museum für Ostasiatische Kunst, Cologne, through October 25, 2026 / To the exhibition | fehlt – Vorschlag | – |
| H2: Keiner Mode, keinem Zeitgeist unterworfen. | Not subject to fashion or the Zeitgeist. | alt* („not subject to changes in fashion or Zeitgeist“) | `/en/workshop/method/` |
| Unter Rückbesinnung auf die Grundprinzipien des Bauhauses entwickelte Young-Jae Lee mit Hildegard Eggemann, Michael Schmandt und Claudia Neumann die Formensprache des Manufakturprogramms: zuerst 25 Grundelemente eines Geschirrs – Teller, Schalen, Krüge. | Returning to the basic formal principles of the Bauhaus, Young-Jae Lee, together with Hildegard Eggemann, Michael Schmandt and Claudia Neumann, developed the formal language of the collection: first the 25 basic elements of a tableware set – plates, bowls, pitchers. | alt* | `/en/workshop/method/` |
| „Jedes Stück muss gut zu drehen sein und auch zu benutzen. Alle Teile eines Geschirrs, gleich welcher Farbe, sollten miteinander kombinierbar sein.“ | “Every piece had to be easy to throw, and functional. All parts of a tableware set, no matter the color, were to be mix-and-matchable.” | alt* (Altbestand im Indirekten, kein Zitat; in der V3 als Zitat gesetzt, Anführungszeichen prüfen) | `/en/workshop/method/` |
| Farbskala: weiß / hellgrün matt / hellgrün glänzend / dunkelgrün glänzend / dunkelgrün matt / rostbraun | white / light green matte / light green glossy / dark green glossy / dark green matte / russet brown | alt* („light green mat / light green shiny / dark green mat / dark green shiny / russet brown“; „mat“ und „shiny“ vereinheitlichen zu „matte“ und „glossy“) | `/en/collection/colors/` |
| In monatelangen Experimenten entstand die sechstonige Farbskala – von Schattierungen des Jadegrün über ein gebrochenes Weiß bis zu Rostbraun. | The six-tone range of colors, from shades of jade-green to an off-white to a rust-brown, was the result of months of experimentation. | alt | `/en/workshop/method/` |
| Masse: Westerwälder Steinzeug, auf der Töpferscheibe gedreht | Clay body: Westerwald stoneware, thrown on the potter’s wheel | alt* | `/en/workshop/method/` |
| Schrühbrand: Elektroofen, etwa 950 °C | Bisque firing: electric kiln, about 950 °C | alt* | `/en/workshop/method/` |
| Glasurbrand: Gasofen, ca. 1300 °C, reduzierende Atmosphäre | Glaze firing: gas kiln, ca. 1300 °C, reducing atmosphere | alt* | `/en/workshop/method/` |
| Programm: Vom Teller bis zum Krug, dazu die Edition mit Vasen, Pflanzgefäßen und Dosen | Range: from plates to pitchers, plus the editions with vases, planters and jars | fehlt – Vorschlag | – |
| Gebrauch: Alle Stücke sind spülmaschinenfest | Use: all pieces are dishwasher safe | alt* | `/en/workshop/method/` |
| Zum Programm | To the collection | fehlt – Vorschlag | – |
| H2: Neun bis zehn Stunden Feuer. | Nine to ten hours of fire. | fehlt – Vorschlag | – |
| Im Holzofen wird über neun bis zehn Stunden kontinuierlich bis auf 1300 °C gefeuert – für einen Brand braucht es etwa 1,5 Festmeter Holz. Die Tönung wird reicher, manche Verfärbung lässt sich nicht steuern. | In the wood kiln, the furnace is fired continuously up to 1300 °C over nine to ten hours; one firing needs about 1.5 solid cubic meters of wood. The tint becomes richer, and some colorations cannot be controlled. | alt* („A richer tint and coloration effects, which are often not to be controlled, arise in the wood kiln. […] about 1.5 solic [sic] cubic meters of wood“) | `/en/masterworks/method/` |
| Wie die Glasur ihre Farbe bekommt | How the glaze gets its color | fehlt – Vorschlag | – |

### 2.8 Chronik (Kurzfassung) und Besuch

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H2: Hundert Jahre an der Scheibe. | A hundred years at the wheel. | fehlt – Vorschlag | – |
| Von der Siedlungswerkstatt in Essen zur Manufaktur auf Zollverein: neun Stationen in 82 Jahren. | From a housing-estate workshop in Essen to a manufactory at Zollverein: nine milestones in 82 years. | fehlt – Vorschlag | – |
| 1924 bis 2006 / Wischen (Hinweis „swipe“) | 1924 to 2006 / Swipe | fehlt – Vorschlag | – |
| 1924 Siedlungswerkstatt – Margarete Krupp realisiert die Siedlung Margaretenhöhe in Essen. Hermann Kätelhön initiiert eine Keramikwerkstatt auf dem Gelände, Leiter wird Will Lammert. | 1924 Estate workshop – Margarete Krupp realizes the Margaretenhöhe housing project in Essen. Hermann Kätelhön initiates a ceramics workshop on the site; Will Lammert becomes head of the workshop. | alt* (gekürzt, nach Altbestand) | `/en/workshop/history/` |
| 1927 Bauhaus im Ruhrgebiet – Johannes Leßmann, Schüler des Bauhaus-Keramikers Otto Lindig, stellt auf Serienkeramik um – und verschafft der Bauhaus-Idee im Ruhrgebiet Breitenwirkung. | 1927 The Bauhaus in the Ruhr region – Johannes Leßmann, a student of the Bauhaus ceramist Otto Lindig, switches the workshop to serial ceramics and gives the Bauhaus idea a broad impact in the Ruhr region. | alt* | `/en/workshop/history/` |
| 1933 Auf Zollverein – Umzug in ein Gebäude der Zeche Zollverein. | 1933 At Zollverein – move to a building at the Zollverein colliery. | alt* | `/en/workshop/history/` |
| 1944 Neue Leitung – Walburga Külz, ebenfalls Schülerin Otto Lindigs, übernimmt die Leitung. | 1944 New management – Walburga Külz, also a student of Otto Lindig, takes over the management. | alt* | `/en/workshop/history/` |
| 1953 Baukeramik – Helmut Gniesmer stellt das Programm vorwiegend auf Baukeramik um. | 1953 Building ceramics – Helmut Gniesmer switches the program primarily to building ceramics. | alt* | `/en/workshop/history/` |
| 1968 Ruhrkohle – Die Werkstatt geht in den Besitz der Ruhrkohle AG über, später RAG Aktiengesellschaft. | 1968 Ruhrkohle – the workshop becomes the property of Ruhrkohle AG (later RAG Aktiengesellschaft). | alt* | `/en/workshop/history/` |
| 1986 Zurück zum Gefäß – Young-Jae Lee und Hildegard Eggemann übernehmen die Leitung und nehmen das Manufakturprogramm wieder auf. | 1986 Back to the vessel – Young-Jae Lee and Hildegard Eggemann take over the management and resume the manufactory program. | alt* | `/en/workshop/history/` |
| 1987 Das Baulager – Umzug in das Baulager der Zeche Zollverein, heute Weltkulturerbe. | 1987 The construction warehouse – move to the construction warehouse of the Zeche Zollverein, today a World Heritage Site. | alt* | `/en/workshop/history/` |
| 2006 In eigener Verantwortung – Young-Jae Lee übernimmt die Werkstatt von der RAG Aktiengesellschaft und führt sie als Geschäftsführerin. | 2006 On her own responsibility – Young-Jae Lee takes over the workshop from RAG Aktiengesellschaft and runs it as managing director. | alt* | `/en/workshop/history/` |
| Die Zwischentitel der Stationen (Siedlungswerkstatt, Bauhaus im Ruhrgebiet, Zurück zum Gefäß …) | siehe die englischen Titel in der Zeile oben | fehlt – Vorschlag | – |
| H2: Die Werkstatt ist offen. | The workshop is open. | fehlt – Vorschlag | – |
| Wenn Sie Stücke aus unserem Programm erwerben möchten, senden wir Ihnen gerne weitere Informationen oder ein Angebot zu. Oder Sie kommen vorbei. | If you would like to purchase pieces from our program, we will gladly send you further information or an estimate. Or come and visit us. | alt* („If you have questions or would like to purchase items, we would be happy to send you additional information or an Estimate. Of course, you are also welcome to visit our workshop.“) | `/en/business/contact/` |
| Öffnungszeiten – Montag bis Freitag 9–17 Uhr / Samstag 11–15 Uhr / Sonst nach Vereinbarung | Opening hours – Monday to Friday 9 a.m.–5 p.m. / Saturday 11 a.m.–3 p.m. / Otherwise by appointment | alt* | `/en/business/contact/` |
| Lieber anrufen: +49 201 30 50 80 / Anfahrt und Besuch | Prefer to call: +49 201 30 50 80 / Directions and visit | fehlt – Vorschlag | – |
| Anfrageband (Partial `anfrage-band.html`): „Anfrage schreiben“ | Write an inquiry | fehlt – Vorschlag | – |

---

## 3. Meisterstücke (`meisterstuecke.html`)

Altbestand: `/en/masterworks/` (Einstieg), `/en/masterworks/method/`, `/en/masterworks/bowls/…`, `/en/masterworks/vases/…`, `/en/masterworks/vessels/`. Der Bereich „Vessels“ im Altbestand entspricht dem V3-Abschnitt „Kummen“.

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H1: Meisterstücke | Masterworks | alt | `/en/masterworks/` |
| Alle hier gezeigten Meisterstücke stammen aus der Hand Young-Jae Lees und wurden von ihr selbst gedreht, bemalt und glasiert. | All the masterworks shown here come from Young-Jae Lee’s hand and were turned, painted and glazed by her herself. | alt* | `/en/masterworks/` |
| Alt-Text/Bildunterschrift: Schalen von Young-Jae Lee | Bowls by Young-Jae Lee | fehlt – Vorschlag | – |
| In Anlehnung an die koreanische Tradition: nicht die ständige Neuerfindung von Formen, sondern die vollkommene Beherrschung des vorhandenen Repertoires. | Following the Korean tradition: not the constant reinvention of forms, but the perfect mastery of the existing repertoire. | alt* | `/en/masterworks/` |
| Young-Jae Lee ist eine international anerkannte, mehrfach ausgezeichnete Künstlerin und leitet als Geschäftsführerin die Keramische Werkstatt Margaretenhöhe in Essen. Zusammen mit Hildegard Eggemann entwickelte sie ab 1986 den Formen- und Farbkanon des Manufakturprogramms, das seitdem nahezu unverändert von den Mitarbeitern der Werkstatt hergestellt wird. | Young-Jae Lee is an internationally recognized artist who has won several awards. She is the managing director of the Margaretenhöhe Ceramic Workshop in Essen. Together with Hildegard Eggemann, she developed the form and color canon of the manufactory program starting in 1986, which has been produced almost unchanged by the workshop staff ever since. | alt | `/en/masterworks/` |
| Die Herstellung jedes neuen Gefäßes gleicht einer Meditation. Erst mit der Verinnerlichung der Formen kann die tägliche Arbeit an der Drehscheibe jenseits aller Routine zu einer Art Exerzitium werden. Die Persönlichkeit beginnt einzufließen, das Individuelle drückt sich im Handwerklichen aus. | The making of each new vessel is like a meditation. Only with the internalization of the forms can the daily work on the wheel become a kind of retreat beyond all routine. The personality begins to flow in, the individual expresses itself in the craftsmanship. | alt | `/en/masterworks/` |
| Kapitel: Schalen / Arbeitsweise / Kummen / Vasen | Bowls / Method / Kummen / Vases | alt* („Bowls“, „Method“, „Vases“; „Vessels“ für Kummen, siehe Glossar) | `/en/masterworks/…` |
| H2: Schalen | Bowls | alt | `/en/masterworks/bowls/` |
| Spitz zulaufende Schalen in fünf Größen, gedreht zwischen 2003 und 2005, dazu eine große, weite Schale von 1994. Glasiert mit Feldspatglasuren, zum Teil mit Eichenasche. | V-shaped bowls in five sizes, thrown between 2003 and 2005, plus a large, wide bowl from 1994. Glazed with feldspathic glazes, some with oak ash. | fehlt – Vorschlag | – |
| Werkangaben Schalen (11 Stück): „Schale, spitz, XXL · H 16 cm, D 29,5 cm · Petalit-Eichenasche-Glasur · 2003–2005“ usw. | „Bowl, V-shaped, XXL · H 16 cm, D 29.5 cm · petalite oak ash glaze · 2003–2005“ usw. | alt* (alle Maße, Glasuren und Jahre stehen im Altbestand, Format `Bowl | glaze | H, D | year`; in V3 wird die Reihenfolge Titel · Maße · Glasur · Jahr vereinheitlicht) | `/en/masterworks/bowls/*` |
| Große Schale · H 9,5 cm, D 53,5 cm · Wollastonit-Feldspat-Glasur · Gasofen · Essen 1994 | Large bowl · H 9.5 cm, D 53.5 cm · wollastonite feldspathic glaze · gas kiln · Essen 1994 | alt | `/en/masterworks/bowls/large-bowl/` |
| Zitat Jahn: „Vom Volumen bezieht die Schale ihre Kraft, ihre Präsenz.“ | “The bowl draws its power, its presence, from volume.” | fehlt – Rechte (Gisela Jahn) | – |
| Quelle: Gisela Jahn, »Gefäße drehen, Gefäße betrachten, Gefäße benutzen« | Gisela Jahn, “Turning vessels, looking at vessels, using vessels” | fehlt – Vorschlag | – |
| Zu diesem Stück anfragen (Link, 30 Mal) | Inquire about this piece | fehlt – Vorschlag | – |
| Bildunterschrift: Schalen von Young-Jae Lee · Foto: Christopher Clem Franken | Bowls by Young-Jae Lee · Photo: Christopher Clem Franken | fehlt – Vorschlag | – |
| H2: Östlich gedreht, westlich abgedreht. | Thrown the Eastern way, trimmed the Western way. | fehlt – Vorschlag (Überschrift neu, Inhalt aus `/en/masterworks/method/`) | – |
| Wie ein Meisterstück entsteht – von der Masse bis zum Holzbrand. | How a masterwork is made – from the clay body to the wood firing. | fehlt – Vorschlag | – |
| Bildunterschrift: Young-Jae Lee, Teeschale, ohne Titel, 2023 | Young-Jae Lee, tea bowl, untitled, 2023 | fehlt – Vorschlag | – |
| Masse: Young-Jae Lee verwendet Porzellan- und Steinzeugmassen. Zum Teil mischt sie die Massen, um eine optimale Drehfähigkeit und Tondichte zu erreichen. Porzellan liefert einen weißen oder nahezu weißen Scherben, Steinzeugton einen beigen, eher erdigen Farbton. | Clay body: Young-Jae Lee uses porcelain and stoneware for her ceramics. In part, she mixes the clay bodies in order to achieve optimal throwability and density. Porcelain makes a white (or almost white) biscuit; stoneware has a beige and rather earthy hue. | alt* („rotability“ zu „throwability“; „masses“ zu „clay bodies“) | `/en/masterworks/method/` |
| Drehen: Die Gefäße werden auf der elektrischen Scheibe nach der östlichen Drehweise gegen den Uhrzeigersinn gedreht. | Throwing: The vessels are thrown on the electric wheel counterclockwise, in the Eastern manner. | alt* | `/en/masterworks/method/` |
| Abdrehen: Das Abdrehen erfolgt nach der westlichen Weise im Uhrzeigersinn: Der lederharte – feuchte, aber nicht mehr weiche – Ton wird mit einem Dreheisen spanweise abgetragen. | Trimming: The trimming is done clockwise, in the Western manner: the leather-hard clay (moist, but no longer soft) is removed in shavings with a metal trimming tool. | alt* | `/en/masterworks/method/` |
| Engobe: Im ungebrannten, noch feuchten Zustand werden die Zylindervasen mit Engoben, dickflüssigem Tonschlicker, bemalt. Sie müssen auf den Schrumpfungsgrad der Tonmasse abgestimmt sein, damit die Bemalung nach dem Trocknen oder dem Brand nicht abplatzt. | Engobe: In the unfired, still leather-hard state, the cylinder vases are painted with engobes (viscous clay slurry). These engobes have to suit the degree of shrinkage of the clay body, so that the painting does not flake off after drying or firing. | alt* („splinter off“ zu „flake off“) | `/en/masterworks/method/` |
| Schrühbrand und Glasur: Nach dem ersten Brand bei etwa 950 °C werden die Gefäße glasiert: größere übergossen, kleinere Schalen zumeist in die Glasur getaucht. Bemalungen mit Kobalt-, Eisen- oder Kupferoxiden werden zuvor mit dem Pinsel aufgetragen. Die Glasuren sind Feldspatglasuren, zum Teil mit Asche versetzt; als färbendes Mittel beschränkt sich Young-Jae Lee auf Eisenoxid. | Bisque firing and glaze: After the first firing at about 950 °C, which hardens the biscuit, the vessels are glazed. The glaze is poured over the larger vessels; smaller bowls are usually dipped in the glaze. Paintings with cobalt, iron or copper oxides are applied with a brush beforehand. The glazes are feldspathic glazes, some with ash mixed in. As a coloring agent, Young-Jae Lee confines herself to iron oxide. | alt* | `/en/masterworks/method/` |
| Ofenatmosphäre: Eisenoxid färbt in oxidierender Atmosphäre gelb bis braun, in reduzierender grün, während Kupfer von Grün nach Rot umschlägt. Die Glasurbrände erfolgen im Gasofen bei etwa 1300 °C. | Kiln atmosphere: Iron oxide imparts a coloring between yellow and brown in an oxidizing (oxygen-rich) atmosphere and green in a reducing (oxygen-deficient) atmosphere, while copper turns from green to red. The glaze firing is carried out in the gas kiln at about 1300 °C. | alt* | `/en/masterworks/method/` |
| Holzbrand: Eine reichere Tönung und oft nicht zu steuernde Verfärbungen ergeben sich im Holzbrand. Über neun bis zehn Stunden wird kontinuierlich bis auf 1300 °C gefeuert – für einen Brand braucht es etwa 1,5 Festmeter Holz. | Wood firing: A richer tint and coloration effects, which are often not controllable, arise in the wood kiln. The kiln is fired continuously up to 1300 °C over nine to ten hours; one firing needs about 1.5 solid cubic meters of wood. | alt* | `/en/masterworks/method/` |
| H2: Kummen | Kummen | fehlt – Vorschlag (alt: „Vessels“, siehe Glossar) | `/en/masterworks/vessels/` |
| Drei Gefäße aus den Jahren 1987 bis 1995 – im Gasofen und im Holzofen gebrannt, eines auf weißer Engobe. | Three vessels from 1987 to 1995, fired in the gas kiln and the wood kiln, one on white engobe. | fehlt – Vorschlag | – |
| Kummen · H 18 cm, D 14,6 cm · H 18 cm, D 14 cm · Petalit-Eichenasche-Glasur · Holzofen · Essen 1995 | Kummen · H 18 cm, D 14.6 cm · H 18 cm, D 14 cm · petalite oak ash glaze · wood kiln · Essen 1995 | alt* („Vessels | H 18 cm, D 14.6 cm | H 18 cm, D 14 cm | petalite oak ash glaze | wood-fired kiln | Essen 1995“) | `/en/masterworks/vessels/` |
| Kumme · H 16 cm, D 12,2 cm · Wollastonit-Feldspat-Glasur auf weißer Engobe · Gasofen · Essen 1987 | Kumme · H 16 cm, D 12.2 cm · wollastonite feldspathic glaze over white engobe · gas kiln · Essen 1987 | alt* | `/en/masterworks/vessels/` |
| Bettelmönchschale · H 10,2 cm, D 13,6 cm · Barium-Feldspat-Glasur · Gasofen · Essen 1988 | Mendicant’s bowl · H 10.2 cm, D 13.6 cm · barium feldspathic glaze · gas kiln · Essen 1988 | alt | `/en/masterworks/vessels/` |
| Zitat Wagner: „Bauchige Becher, die ihr Inneres verbergen und es im kecken Schwung ihrer Lippe doch noch anbieten.“ | “Bulbous beakers that conceal their interior and yet still offer it in the jaunty curve of their lip.” | fehlt – Rechte (Thomas Wagner) | – |
| H2: Vasen | Vases | alt | `/en/masterworks/vases/` |
| Zylindervasen, im feuchten Zustand mit Engoben bemalt, eine Kugelvase aus dem Holzofen und die Serie der Spindelvasen von 2006/07. | Cylinder vases painted with engobes while still moist, a spherical vase from the wood kiln and the series of spindle vases from 2006/07. | fehlt – Vorschlag | – |
| Bildunterschrift: Vasen von Young-Jae Lee in der Ausstellung in Chemnitz, 2025 | Vases by Young-Jae Lee in the exhibition in Chemnitz, 2025 | fehlt – Vorschlag | – |
| Zylindervasen, XL · H ca. 49 cm, D ca. 15 cm · Petalit-Eichenasche-Glasur · Holzofen · Essen 2003 | Cylinder vases, XL · H ca. 49 cm, D ca. 15 cm · petalite oak ash glaze · wood kiln · Essen 2003 | alt | `/en/masterworks/vases/cylinder-vase-xl/` |
| Zylindervasen, groß · H ca. 30 cm, D ca. 11,5 cm · … Essen 2003 | Cylinder vases, large · H ca. 30 cm, D ca. 11.5 cm · … Essen 2003 | alt | `/en/masterworks/vases/cylinder-vase-large/` |
| Zylindervasen, mittel · 6 Maße · Petalit-Eichenasche-Glasur · Holzofen · Essen 2003 | Cylinder vases, medium · 6 sizes · petalite oak ash glaze · wood kiln · Essen 2003 | alt | `/en/masterworks/vases/cylinder-vase-medium/` |
| Kleines Zylindervasenpaar · H 14,5 cm, D 14,5 cm · H 13,3 cm, D 14,5 cm · Kalkspat-Glasur · Gasofen · Kassel 1984/85 | Pair of cylinder vases, small · H 14.5 cm, D 14.5 cm · H 13.3 cm, D 14.5 cm · calcite glaze · gas kiln · Kassel 1984/85 | alt | `/en/masterworks/vases/cylinder-vase-small/` |
| Zitat Jahn: „Das sinnliche Gespür […] reifte in der frühen Essener Zeit mit der Wiederannäherung an die koreanische Keramik.“ | “The sensuous feeling […] matured in the early Essen period with a renewed approach to Korean ceramics.” | fehlt – Rechte (Gisela Jahn) | – |
| Kugelvase · H 25 cm, D 32,5 cm · Barium-Feldspat-Glasur · Holzofen · Essen 1996 | Spherical vase · H 25 cm, D 32.5 cm · barium feldspathic glaze · wood kiln · Essen 1996 | alt | `/en/masterworks/vases/spherical-vase-large/` |
| H3: Spindelvasen, 2006/07 | Spindle vases, 2006/07 | alt* | `/en/masterworks/vases/spindle-vase/` |
| Gebrannt im Holzofen bei 1260 °C oder im Gasofen bei rund 1280 °C, jeweils in reduzierender Atmosphäre. | Fired in the wood kiln at 1260 °C or in the gas kiln at about 1280 °C, in each case in a reducing atmosphere. | alt* (Daten aus den Werkangaben) | `/en/masterworks/vases/spindle-vase/` |
| Spindelvase · H 35,5 cm, D 37 cm · Petalit-Eichenasche-Feldspat-Glasur · Holzofen 1260 °C · Reduktion (und 7 weitere Zeilen) | Spindle vase · H 35.5 cm, D 37 cm · petalite oak ash feldspathic glaze · wood-fired kiln 1260 °C · reduction (and 7 more lines) | alt | `/en/masterworks/vases/spindle-vase/` |
| 28 Alt-Texte (Bildbeschreibungen) | z. B. “Large pointed bowl with a pink glaze gradient” | fehlt – Vorschlag | – |

---

## 4. Manufaktur (`manufaktur.html`)

Altbestand: `/en/collection/…` (Tableware, Editions, Colors) sowie `/en/workshop/method/`.

### 4.1 Einstieg und Arbeitsweise

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H1: Manufakturprogramm | Collection (Untertitel: Manufactory program) | alt* (Nav „Collection“; Fließtext „manufactory program“) | `/en/collection/` |
| Vom Teller bis zur Schüssel, von der Tasse bis zum Krug hin zu Salz-, Pfeffer-, Milch- und Zuckergefäßen – unsere Geschirr-Serie umfasst alle Bestandteile eines Speisegeschirrs. | From plates to bowls, from cups to pitchers, including salt, pepper, milk and sugar containers: our tableware series comprises all the components of a dinner service. | fehlt – Vorschlag | – |
| Kategorien: Teller / Krüge und Kannen / Becher und Tassen / Töpfe und Dosen | Plates / Pitchers and teapots / Mugs and cups / Pots and jars | alt* | `/en/collection/tableware/` |
| Zitat: „Jedes Stück muss gut zu drehen sein und auch zu benutzen. Alle Teile eines Geschirrs, gleich welcher Farbe, sollten miteinander kombinierbar sein.“ | “Every piece had to be easy to throw, and functional. All parts of a tableware set, no matter the color, were to be mix-and-matchable.” | alt* | `/en/workshop/method/` |
| Quelle: Die wichtigsten Vorgaben für das Manufakturprogramm | The most important requirements for the collection | alt* („Their most important requirements“) | `/en/workshop/method/` |
| Bildunterschrift: Teekanne, Teeschale und Plattenteller | Teapot, tea bowl and serving dish | fehlt – Vorschlag | – |
| Unter Rückbesinnung auf die formalen Grundprinzipien des Bauhauses hat Young-Jae Lee mit Hildegard Eggemann, Michael Schmandt und Claudia Neumann die charakteristische Formensprache des Manufakturprogramms entwickelt. | Returning to the basic formal principles of the Bauhaus, Young-Jae Lee together with Hildegard Eggemann, Michael Schmandt and Claudia Neumann developed the characteristic formal language of the collection. | alt* | `/en/workshop/method/` |
| Zunächst wurden die 25 Grundelemente eines Geschirrs entworfen: Teller, Schalen, Krüge. In monatelangen Experimenten entstand die sechstonige Farbskala, von Schattierungen des Jadegrün über ein gebrochenes Weiß bis zu Rostbraun. | The twenty-five basic elements of a tableware set were designed first: plates, bowls, pitchers. The six-tone range of colors, from shades of jade green to an off-white to a rust-brown, was the result of months of experimentation. | alt | `/en/workshop/method/` |
| Kapitel: Geschirr / Edition / Farben / Arbeitsweise | Tableware / Editions / Colors / Method | alt | `/en/collection/` |
| H2: Geschirr | Tableware | alt | `/en/collection/tableware/` |
| Alle Teile eines Geschirrs, gleich welcher Farbe, lassen sich miteinander kombinieren – einzeln oder im Set. | All parts of a tableware set, no matter the color, can be combined with one another – singly or as a set. | fehlt – Vorschlag | – |
| Alle Stücke werden in unserer Werkstatt in Handarbeit gefertigt. Sie sind einzeln oder im Set zu erwerben. | All pieces are made by hand in our workshop. They are available individually or as a set. | fehlt – Vorschlag | – |
| Bildunterschrift: Im Regal der Werkstatt · Foto: Haydar Koyupinar | On the workshop shelf · Photo: Haydar Koyupinar | fehlt – Vorschlag | – |
| Die Viereckteller werden aus Platten über Gipsmodellen geformt – alle anderen Stücke entstehen auf der Töpferscheibe. | The square plates are formed from slabs over plaster models; all other pieces are thrown on the potter’s wheel. | alt* („the square plates are formed from slabs via plaster models“) | `/en/workshop/method/` |
| Neue Serie | New series | fehlt – Vorschlag (alt: „Neue Serie“ unübersetzt) | `/en/collection/tableware/plates/` |
| nicht mehr im Programm / ohne Abbildung | no longer in the program / no picture | alt („no longer in the program“, „without picture“) | `/en/collection/tableware/` |
| Nr. (Artikelnummer) | art. no. | alt | `/en/collection/tableware/` |
| Abmessungen H × Ø / Ø / H × B: „2,8 × 28 cm“, „Ø 22,5 cm“ | „H 2.8 × D 28 cm“, „D 22.5 cm“ | alt* (alt ohne Ø-Zeichen und mit Mischformat; Vorschlag: Format „H × D“ einheitlich, siehe Hinweis unten) | `/en/collection/tableware/` |

Hinweis zu den Maßen: Das Altbestand-Format ist uneinheitlich (`2.8 x 28 cm`, `6,0 x Ø 13,5 cm`, `13 x 34 cm`). Die V3 ergänzt kein „H“ oder „B“. Empfehlung für die Sanity-Felder: `height`, `diameter`/`width`/`length` getrennt speichern und je Sprache nur die Darstellung formatieren (Dezimalpunkt, „H“, „D“).

### 4.2 Produktnamen Geschirr (V3 DE gegen Altbestand EN)

Übernahme als Begriffstabelle. Die Artikelnummern sind in beiden Sprachen identisch.

| DE | EN | Nr. | Quelle | Anmerkung |
|---|---|---|---|---|
| Brotschmierteller | Bread and butter plate | 15 | alt | |
| Brotteller | Bread plate | 14 | alt | |
| Unterteller | Bottom plate | 13 | alt | Besser: „Saucer“ oder „Underplate“, wenn das Stück als Unterteller dient (bei der Werkstatt klären) |
| Essteller | Dinner plate | 16 | alt | |
| Platzteller | Service plate | 17 | alt | |
| Dessertschale, hoch | Dessert plate, deep | 50 | alt | |
| Dessertschale, flach | Dessert plate, shallow | 51 | alt | Maßabweichung: DE Ø 15 cm, EN Ø 13 cm, Werkstatt fragen |
| Suppenteller | Soup bowl | 49 | alt | |
| Vorspeisenteller | Starter plate | 52 | alt | nicht mehr im Programm |
| Essteller (neue Serie) | Plate | 53 | alt | Eindeutiger: „Dinner plate (new series)“ |
| Großer Anrichteteller | Large serving plate | 54 | alt | |
| Viereckteller, groß/mittel/klein | Square plate, large/medium/small | 18, 19, 20 | alt | Altnavigation: „Angular Plates“ |
| Rechteckteller | Rectangular plate | 21 | alt | |
| Salatschüssel | Salad bowl | 1 | alt | |
| Salatschüssel, medium | Salad bowl, medium | 2 | alt | |
| Koreanische Suppenschale | Korean soup bowl | 3 | alt | |
| Kugeldose | Spherical jar with lid | – (2020) | alt | |
| Salatschüssel, flach, mittel / flach | Salad bowl, shallow, small / shallow | 48a, 48 | alt* | „medium“ in DE entspricht „small“ in EN; angleichen |
| Müslischale, spitz (klein/groß/flach) | Cereal bowl, V-shaped (small/large/shallow) | 6, 6a, 7, 8 | alt | |
| Schüssel, spitz | Bowl, V-shaped | 9 | alt | |
| Müslischale, breit | Cereal bowl, wide | 11 | alt | |
| Spaghettiteller | Spaghetti bowl | 10 | alt | DE „Teller“, EN „bowl“ |
| Schüssel, breit | Bowl, wide | 12 | alt | nicht mehr im Programm |
| Espresso-/Cappuccinotasse und -untertasse | Espresso/cappuccino cup and saucer | 33, 34, 31, 32 | alt | nicht mehr im Programm |
| Kaffeetasse | Coffee cup | 30 | alt | |
| Teebecher / Teebecher, groß | Tea cup / Tea cup, large | 23, 22 | alt | „Becher“ eher „mug“; Empfehlung: „Tea mug“ |
| Trinkbecher, klein | Drinking cup, small | 24 | alt | |
| Deckeldose | Lidded jar | 39 | alt | |
| Deckeltopf, klein/mittel/groß | Lidded jar, small/medium/large | 40, 40a, 41 | alt* | im Altbestand „klein/mittel/groß“ unübersetzt |
| Koreanische Dose | Korean jar | 42 | alt | |
| Suppentopf (klein/mittel/groß, extra klein) | Soup bowl (small…) | 43, 44, 45, 43a | alt* | Fehlübersetzung: Es ist ein Topf mit Deckel, besser „Soup pot, lidded“ |
| Krug 2 l / 1 l / 0,5 l | Pitcher, 2 liter / 1 liter / 0.5 liter | 25, 26, 27 | alt | |
| Krug 0,75 Liter | Pitcher, 0.75 liter | 26a | fehlt – Vorschlag | fehlt im Altbestand |
| Teekanne, extraklein/klein/groß | Tea pot, extra small / small / large | 35a, 35, 36 | alt* | „Teapot“ als ein Wort |
| Flasche, klein/groß | Bottle, small/large | 37, 38 | alt | |
| Sieb, klein/groß | Colander, small/large | 5, 4 | alt | |
| Milch / Zucker | Milk bowl / Sugar bowl | 28, 29 | alt* | Maße weichen ab (DE Zucker 5 × 7,5, EN 5.7 × 5), klären |
| Pfefferstreuer / Salzstreuer | Pepper shaker / Salt shaker | 47, 46 | alt | nicht mehr im Programm |
| Unterkategorien: Teller / Viereckteller / Schalen und Schüsseln / Becher und Tassen / Töpfe und Dosen / Flaschen, Krüge, Kannen / Weitere Stücke | Plates / Square plates / Bowls / Mugs and cups / Pots and jars / Bottles, pitchers, teapots / Additional items | alt* | |
| Alt-Texte (38 Stück) | z. B. “Plates in dark green, light green and russet brown, seen from above” | fehlt – Vorschlag | – |

### 4.3 Edition und Farben

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H2: Edition | Editions | alt | `/en/collection/editions/` |
| In unserer Edition sind weitere ergänzende Geschirrstücke erhältlich, wie zum Beispiel Sushi- oder Plattenteller, sowie Pflanzengefäße und Vasen. Sie unterscheiden sich in der Farbgebung von unserem Geschirr. | Our editions comprise further complementary tableware, such as sushi or serving dishes, as well as planters and vases. Their colors differ from those of our tableware. | fehlt – Vorschlag (Aussage aus `/en/collection/colors/`: „The pieces of the edition differ in the color of our dishes“) | `/en/collection/colors/` |
| Vasen: Zylindervase, klein H 14 cm / Kugelvase, klein H ca. 14 cm / Kugelvasen H ca. 20 cm / Wandvase H 39 cm / Tulpenvase H 20,0 cm, Ø 16,0 cm / Zylindervase, groß H 27,0 cm, Ø 16,0 cm | Vases: Cylinder vase, small, H 14 cm / Spherical vase, small, H ca. 14 cm / Spherical vases, H ca. 20 cm / Wall vase, H 39 cm / Tulip vase, H 20.0 cm, D 16.0 cm / Cylinder vase, large, H 27.0 cm, D 16.0 cm | alt* | `/en/collection/editions/vases/` |
| Plattenteller: 21 × 42 / lang 16,5 × 42 / klein 14,5 × 17 / mittel 18 × 24 / groß 23 × 31 / extragroß 27,5 × 35 | Serving dishes: 21 × 42 cm / long 16.5 × 42 / small 14.5 × 17 / medium 18 × 24 / large 23 × 31 / extra large 27.5 × 35 | alt | `/en/collection/editions/serving-dishes/` |
| Pflanzgefäße: Pflanzenübertopf (klein/mittel/groß, zylindrisch) / Pflanzgefäß, weit H 43 cm, D 50 cm | Planters: Cachepot (small/medium/large, cylinder) / Planter, wide H 43 cm, D 50 cm | alt* | `/en/collection/editions/planters/` |
| Schalen und Dosen: Große Schale H 6,5 cm, Ø 36,5 cm / Kugeldose Ø 6–11 cm | Bowls and jar: Large bowl H 6.5 cm, D 36.5 cm / Spherical jar with lid, D 6–11 cm | alt* (Seite „Jar“ und „Bowls“) | `/en/collection/editions/bowls/`, `/en/collection/editions/jar/` |
| Abgebildet unter Schalen und Schüsseln. | Shown under Bowls. | fehlt – Vorschlag | – |
| H2: Sechs Töne für das Geschirr. | Six tones for the tableware. | fehlt – Vorschlag | – |
| Die Farben der Edition unterscheiden sich vom Geschirr und können je nach Brand unterschiedlich ausfallen. Wählen Sie eine Glasurprobe. | The colors of the editions differ from those of the tableware and may vary from firing to firing. Choose a glaze sample. | alt* („The pieces of the edition differ in the color of our dishes. They are available in the following colors, which however may vary according to the fire“) | `/en/collection/colors/` |
| Geschirr: weiß, hellgrün matt, hellgrün glänzend, dunkelgrün glänzend, dunkelgrün matt, rostbraun | Tableware: white, light green matte, light green glossy, dark green glossy, dark green matte, russet brown | alt* | `/en/collection/colors/` |
| Edition: hellblau, weiß, hellgrün, dunkelgrün | Editions: light blue, white, light green, dark green | alt | `/en/collection/colors/` |
| Die Glasurproben antippen zum Vergrößern (aria-label) | Tap a glaze sample to enlarge it | fehlt – Vorschlag | – |
| Arbeitsweise: Die Grundzüge des Manufakturprogramms haben sich bis heute nicht verändert. Mit der Edition wurde es um zusätzliche Stücke erweitert, darunter Vasen, Pflanzengefäße und Dosen. | The basic features of the collection have remained unchanged to this day. The editions have since added further pieces, including vases, planters and jars. | fehlt – Vorschlag | – |
| Masse: Westerwälder Steinzeugmasse, auf der Töpferscheibe gedreht. Die Viereckteller werden aus Platten über Gipsmodellen geformt. | Clay body: Westerwald stoneware clay, thrown on the potter’s wheel. The square plates are formed from slabs over plaster models. | alt* | `/en/workshop/method/` |
| 950 °C: Schrühbrand im Elektroofen. | 950 °C: bisque firing in an electric kiln. | alt* | `/en/workshop/method/` |
| 1300 °C: Glasurbrand im Gasofen in reduzierender Atmosphäre – für matte bis glänzende Oberflächen und aufeinander abgestimmte Farben. | 1300 °C: glaze firing in a gas kiln in a reducing atmosphere, for matte to glossy surfaces and coordinated colors. | alt* | `/en/workshop/method/` |
| Umwelt: Es werden ausschließlich umweltschonende Materialien und Fertigungsverfahren angewendet. | Environment: only environmentally friendly materials and production processes are used. | alt* | `/en/workshop/method/` |
| Gebrauch: Alle Stücke sind spülmaschinenfest. | Use: all pieces are dishwasher safe. | alt | `/en/workshop/method/` |

---

## 5. Young-Jae Lee (`young-jae-lee.html`)

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H1: Young-Jae Lee | Young-Jae Lee | alt | `/en/youngjae-lee/` |
| Geboren 1951 in Seoul, Studium in Seoul und Wiesbaden. Seit 1987 leitet sie die Keramische Werkstatt Margaretenhöhe in Essen – alle Meisterstücke stammen aus ihrer Hand. | Born in Seoul in 1951, she studied in Seoul and Wiesbaden. Since 1987 she has directed the Keramische Werkstatt Margaretenhöhe in Essen – all the masterworks come from her hand. | fehlt – Vorschlag | – |
| Kapitel: Haltung / Biografie / Texte / Ausstellungen / Sammlungen / Auszeichnungen / Publikationen | Approach / Biography / Texts / Exhibitions / Collections / Awards / Publications | alt* („Biography, Awards, Exhibitions, Publications, Texts about Young-Jae Lee“; „Haltung“ und „Sammlungen“ neu) | `/en/youngjae-lee/` |
| Zitat Jahn: „Die minimale Veränderung ist Young-Jae Lees unbegrenzter Freiraum – in der Form wie in der Farbigkeit der Glasur und der Bemalung.“ | “Young-Jae Lee finds boundless freedom in minimal change—both in form and in the color of the glaze and decoration.” | alt | `/en/youngjae-lee/` |
| Bildunterschrift: Ohne Titel (Teeschale), 2023 | Untitled (tea bowl), 2023 | fehlt – Vorschlag | – |
| H2: Bauhaus und koreanisches Erbe. | The Bauhaus and a Korean heritage. | fehlt – Vorschlag | – |
| „Die Schönheit in den Dienst des Funktionalen zu stellen, geometrische Formen wie den Kubus, Quader, Kegel und Kugel als Gestaltungsgrundlage zu nehmen ist eine der Ideen des Bauhauses. Eine Tradition, der sich Young-Jae Lee verpflichtet fühlt. Da ist aber noch ihr koreanisches Erbe, das heitere, schwerelose Empfinden für die Form und die subtilen Farben.“ | “To put beauty in the service of the functional, to take geometric forms such as the cube, cuboid, cone and sphere as the basis of design is one of the ideas of the Bauhaus. Young-Jae Lee feels committed to this tradition. But there is also her Korean heritage, the cheerful, weightless sense of form and the subtle colors.” | fehlt – Rechte (Gisela Jahn) | – |
| „Das sinnliche Gespür reifte in der frühen Essener Zeit mit der Wiederannäherung an die koreanische Keramik, vor allem an die anscheinend unerreichbare Schönheit jener zweiteiligen Vasen. Für Young-Jae Lee war das eine existenzielle Auseinandersetzung.“ | “The sensuous feeling matured in the early Essen period with a renewed approach to Korean ceramics, above all to the seemingly unattainable beauty of those two-part vases. For Young-Jae Lee this was an existential confrontation.” | fehlt – Rechte (Gisela Jahn) | – |
| Quelle: Gisela Jahn, »Gefäße drehen, Gefäße betrachten, Gefäße benützen« | Gisela Jahn, “Turning vessels, looking at vessels, using vessels” | fehlt – Vorschlag (V3 schreibt „benützen“ und „benutzen“ uneinheitlich) | – |
| H2: Eine nach der anderen. | One after another. | fehlt – Rechte (Titel ist Catoir-Zitat) | – |
| Zitat Catoir (lang): „Sie erzählte von den Zeremonien … ohne je das Gefühl gehabt zu haben, dass sie ins Monotone verfalle.“ | “She told of the ceremonies in the temples … without ever having had the feeling that she was lapsing into monotony.” | fehlt – Rechte (Barbara Catoir) | – |
| H2: Biografie | Biography | alt | `/en/youngjae-lee/biography/` |
| Von Seoul über Wiesbaden, Sandhausen und Kassel nach Essen. | From Seoul by way of Wiesbaden, Sandhausen and Kassel to Essen. | fehlt – Vorschlag | – |
| 1951 Geboren in Seoul | 1951 Born in Seoul | alt | `/en/youngjae-lee/biography/` |
| 1968–72 Studium an der Hochschule für Kunsterziehung in Seoul | 1968–72 Studied art education in Seoul | alt | `/en/youngjae-lee/biography/` |
| 1972–73 Praktikum bei Christine Tappermann in Wallrabenstein | 1972–73 Internship with Christine Tappermann in Wallrabenstein, Germany | alt | `/en/youngjae-lee/biography/` |
| 1973–78 Studium der Keramik bei Margot Münster und der Formgestaltung bei Erwin Schutzbach an der Fachhochschule Wiesbaden | 1973–78 Studied ceramics with Margot Münster and design with Erwin Schutzbach at the Fachhochschule Wiesbaden | alt | `/en/youngjae-lee/biography/` |
| 1976–77 Praktikum bei Ralf Busz in Friedrichsfeld | 1976–77 Internship with Ralf Busz in Friedrichsfeld | alt | `/en/youngjae-lee/biography/` |
| 1978–87 Eigene Werkstatt in Sandhausen bei Heidelberg | 1978–87 Own workshop in Sandhausen near Heidelberg | alt | `/en/youngjae-lee/biography/` |
| 1984–87 Künstlerisch-wissenschaftliche Mitarbeiterin an der Gesamthochschule Kassel | 1984–87 Artistic and research associate at the Gesamthochschule Kassel | alt | `/en/youngjae-lee/biography/` |
| seit 1987 Leitung der Keramischen Werkstatt Margaretenhöhe GmbH, Essen | Since 1987 Director of the Keramische Werkstatt Margaretenhöhe GmbH, Essen | alt | `/en/youngjae-lee/biography/` |
| 2015 Gastprofessur (Sommersemester) an der Abteilung für Keramik des Kollegs für Kunst und Design an der EWHA Womans University in Seoul, Korea | 2015 Visiting professor (summer semester) at the department of ceramics, College of Art and Design, Ewha Womans University, Seoul, Korea | alt* („EWHA“ zu „Ewha“, offizielle Schreibweise der Hochschule prüfen) | `/en/youngjae-lee/biography/` |
| 2016 Ehrendoktorwürde der Eugeniusz-Geppert-Akademie der Schönen Künste in Breslau | 2016 Honorary doctorate (doctor honoris causa) of the Eugeniusz Geppert Academy of Art and Design, Wrocław | alt* | `/en/youngjae-lee/biography/` |
| H2: Texte über Young-Jae Lee | Texts about Young-Jae Lee | alt | `/en/youngjae-lee/texts/` |
| Essays aus Katalogen und Büchern, vollständig zu lesen auf der bisherigen Website. | Essays from catalogs and books, available in full on the previous website (in German). | fehlt – Vorschlag | – |
| Text-Einträge: Barbara Catoir, „Gespannte Lebendigkeit“; Gisela Jahn, „Gefäße drehen …“; P. Friedhelm Mennekes S. J., „Wie erlange ich Erkenntnis der Liebe?“; Prof. Dr. Willibald Veit, „Young-Jae Lee – Die Töpferin“; Thomas Wagner, „Die aufgehobene Zeit“ und „Galaxie 333“ | Titel unverändert lassen und die Sprache der Texte kennzeichnen („in German“) | alt (Titel, deutsch; auch die alte EN-Seite verlinkt nur deutsche Texte) | `/en/youngjae-lee/texts/` |
| Teaser-Zitate unter jedem Text (4 Stück) und Texte selbst | Übersetzung nötig | fehlt – Rechte | – |
| Online lesen / PDF | Read online / PDF | alt* („Text online lesen | Als PDF herunterladen“ → „Read text online | Download as PDF“) | `/en/youngjae-lee/texts/` |
| H2: Ausstellungen | Exhibitions | alt | `/en/youngjae-lee/exhibitions/` |
| Eine Auswahl der letzten zehn Jahre. Ausstellungen seit 1980 in Europa, Korea, Japan und den USA. | A selection from the past ten years. Exhibitions since 1980 in Europe, Korea, Japan and the USA. | fehlt – Vorschlag | – |
| Jahreslisten 2016–2026 und Gesamtliste 1980–2026 (ca. 330 Zeilen) | alle Einträge auf der Altseite englisch (Titel gemischt) | alt | `/en/youngjae-lee/exhibitions/` |
| Alle Ausstellungen seit 1980 / Schließen | All exhibitions since 1980 / Close | fehlt – Vorschlag | – |
| Zitat Wagner: „Immer sind es Schalen, und doch ist keine wie die andere.“ | “It is always bowls, and yet no bowl is like another.” | fehlt – Rechte | – |
| H2: Werke in Sammlungen | Works in collections | fehlt – Vorschlag (die Altseite hat keine „Sammlungen“-Seite) | – |
| Gefäße von Young-Jae Lee befinden sich in Museen und Sammlungen in Deutschland, Österreich, Israel und den USA. | Vessels by Young-Jae Lee are in museums and collections in Germany, Austria, Israel and the USA. | fehlt – Vorschlag | – |
| 18 Museen: Museum für Asiatische Kunst, Berlin; Museum of Fine Arts, Boston; Art Institute of Chicago; Hetjens-Museum, Düsseldorf; Museum für Angewandte Kunst, Frankfurt am Main; Keramion, Frechen; Sammlung Ingrid und Werner Welle, Gera; Museum für Kunst und Gewerbe, Hamburg; Israel Museum, Jerusalem; Badisches Landesmuseum, Karlsruhe; Museum für Ostasiatische Kunst, Köln; Kunst-Station Sankt Peter, Köln; Grassi Museum, Leipzig; Pinakothek der Moderne, München; Offene Kirche St. Klara, Nürnberg; Philadelphia Museum of Art; Peabody Essex Museum, Salem; Österreichisches Museum für angewandte Kunst, Wien | Eigennamen bleiben, Städte englisch (Cologne, Munich, Nuremberg, Vienna, Leipzig, Frankfurt am Main) | fehlt – Vorschlag (keine Altseite) | – |
| H2: Auszeichnungen | Awards | alt | `/en/youngjae-lee/awards/` |
| 1980 1. Preis der Frechener Kulturstiftung | 1980 Frechener Kulturstiftung, Germany, 1st prize | alt | `/en/youngjae-lee/awards/` |
| 1981 2. Preis des Richard-Bampi-Preises zur Förderung junger Keramiker, Osnabrück | 1981 Richard-Bampi-Preis zur Förderung junger Keramiker (Richard Bampi Award for Young Ceramists), Osnabrück, Germany, 2nd prize | alt | `/en/youngjae-lee/awards/` |
| 1989 Goldmedaille des Bayerischen Staatspreises | 1989 Bayerischer Staatspreis (Bavarian State Award), gold medal | alt | `/en/youngjae-lee/awards/` |
| 2016 Verleihung der Ehrendoktorwürde (Doktorat honoris causa) der Eugeniusz Geppert Academy of Art and Design in Wrocław | 2016 Honorary doctorate (honoris causa) of the Eugeniusz Geppert Academy of Art and Design in Wrocław | alt | `/en/youngjae-lee/awards/` |
| H2: Publikationen | Publications | alt | `/en/youngjae-lee/publications/` |
| Kataloge, Bücher und Artikel, 1981 bis 2020. | Catalogs, books and articles, 1981 to 2020. | fehlt – Vorschlag | – |
| 21 Titel 1981–2014 (Titel in Originalsprache; „hrsg. von“, „Ausst.-Kat.“) | Titel unverändert; „Edited by“, „Exh. cat.“ | alt | `/en/youngjae-lee/publications/` |
| „Young-Jae Lee – das Grün in den Schalen, hrsg. Museum Folkwang, Essen 2020“ | Young-Jae Lee – das Grün in den Schalen. Edited by Museum Folkwang. Essen, 2020. | fehlt – Vorschlag (Titel fehlt auf der Altseite) | – |

Auffälligkeiten in den Listen:

- Publikationen: V3 schreibt „Victoria Scheinler“, die Altseite „Victoria Scheibler“. Eine der beiden Schreibweisen ist ein Tippfehler. Ebenso „Sylvia Ueberle“ (V3) gegen „Sylvia Veberle“ (EN).
- Die Ausstellungsliste der Altseite wirkt im Bereich 1996–1999 verschoben (sehr viele Einträge unter 1997, einzelne Galerien wie Nichinichi Tsuta Salon unter 1998 und 1999 doppelt). Die V3 übernimmt die Gruppierung. Vor dem Import von der Werkstatt prüfen lassen.
- Das Jahr 2014 steht in der V3 ohne Anker (`<li>` statt `<li id="ausst-2014">`).

---

## 6. Werkstatt (`werkstatt.html`)

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H1: Die Werkstatt | The Workshop | alt | `/en/workshop/` |
| Handwerkliche Ästhetik in ihrer Zurückgenommenheit, Konzentriertheit, formalen Perfektion. Aus der ständigen Wiederholung einer handwerklichen Technik, dem Drehen auf der Töpferscheibe, erwächst die vollkommene Schönheit einer Form. | Craftsmanship aesthetics in its restraint, concentration, formal perfection. From the constant repetition of a craft technique, the turning on the potter’s wheel, grows the perfect beauty of a form. | alt (erster Satz holprig; Vorschlag: „The aesthetics of craft: restraint, concentration, formal perfection.“) | `/en/workshop/` |
| Bildunterschrift: Young-Jae Lee in der Werkstatt | Young-Jae Lee in the workshop | fehlt – Vorschlag | – |
| Kapitel: Arbeitsweise / Glasurfarben / Chronik / Team / Auszeichnungen / Zeche Zollverein | Method / Glaze colors / History / Team / Awards / Zeche Zollverein | alt* („Team, History, Awards, Method“) | `/en/workshop/` |
| H2: Arbeitsweise | Method | alt | `/en/workshop/method/` |
| Das Manufakturprogramm der Werkstatt – vor über zwanzig Jahren entwickelt, bis heute unverändert. | The workshop’s collection – developed more than twenty years ago, unchanged to this day. | fehlt – Vorschlag | – |
| Zitat: „Jedes Stück muss gut zu drehen sein und auch zu benutzen.“ | “Every piece had to be easy to throw, and functional.” | alt* | `/en/workshop/method/` |
| Unter Rückbesinnung auf die formalen Grundprinzipien des Bauhauses hat Young-Jae Lee mit Hildegard Eggemann, Michael Schmandt und Claudia Neumann vor über zwanzig Jahren die charakteristische Formensprache des Manufakturprogramms der Keramischen Werkstatt Margaretenhöhe entwickelt. | Returning to the basic formal principles of the Bauhaus, Young-Jae Lee together with Hildegard Eggemann, Michael Schmandt and Claudia Neumann developed the characteristic formal language of the Keramische Werkstatt Margaretenhöhe’s collection more than twenty years ago. | alt | `/en/workshop/method/` |
| Ihre wichtigsten Vorgaben waren: Jedes Stück muss gut zu drehen sein und auch zu benutzen. Alle Teile eines Geschirrs, gleich welcher Farbe, sollten miteinander kombinierbar sein. | Their most important requirements were that every piece had to be easy to throw, and functional. All parts of a tableware set, no matter the color, were to be mix-and-matchable. | alt | `/en/workshop/method/` |
| Zunächst wurden die 25 Grundelemente … nicht verändert und sind keiner Mode, keinem Zeitgeist unterworfen. | The twenty-five basic elements of a tableware set were designed first: plates, bowls, pitchers. The six-tone range of colors, from shades of jade green to an off-white to a rust-brown, was the result of months of experimentation. The characteristic features of the collection remain the same to this day and are not subject to changes in fashion or Zeitgeist. | alt | `/en/workshop/method/` |
| Mit der Edition wurde das Programm mittlerweile um zusätzliche Stücke erweitert, darunter Vasen, Pflanzengefäße und Dosen. Es werden ausschließlich umweltschonende Materialien und Fertigungsverfahren angewendet. Alle Stücke sind spülmaschinenfest. | The editions have since added further pieces, including vases, planters and jars. All materials and production processes are environmentally friendly, and all pieces are dishwasher safe. | alt* (Satz 1 neu, Sätze 2–3 alt) | `/en/workshop/method/` |
| Zum Manufakturprogramm | To the collection | fehlt – Vorschlag | – |
| Masse / Viereckteller / Schrühbrand / Glasurbrand (Datenliste) | Clay body / Square plates / Bisque firing / Glaze firing | alt* | `/en/workshop/method/` |
| H2: Wie die Glasur ihre Farbe bekommt. | How the glaze gets its color. | fehlt – Vorschlag | – |
| Ob ein Metalloxid gelb, grün oder rot färbt, entscheidet die Atmosphäre im Ofen. | Whether a metal oxide colors a glaze yellow, green or red depends on the atmosphere in the kiln. | fehlt – Vorschlag | – |
| H3: Dieselbe Glasur, andere Farbe | The same glaze, a different color | fehlt – Vorschlag | – |
| Dasselbe Metalloxid färbt eine Glasur je nach Ofenatmosphäre unterschiedlich. Wählen Sie Oxid und Atmosphäre: Die Schale bleibt gleich, nur die Farbe wechselt. | The same metal oxide colors a glaze differently depending on the kiln atmosphere. Choose an oxide and an atmosphere: the bowl stays the same, only the color changes. | fehlt – Vorschlag | – |
| Eisenoxid, oxidierend: färbt gelb bis braun – sauerstoffreiche Ofenatmosphäre. | Iron oxide, oxidizing: colors yellow to brown – oxygen-rich kiln atmosphere. | alt* | `/en/masterworks/method/` |
| Eisenoxid, reduzierend: färbt grün – sauerstoffarme Ofenatmosphäre. | Iron oxide, reducing: colors green – oxygen-deficient kiln atmosphere. | alt* | `/en/masterworks/method/` |
| Kupfer, oxidierend: grün. / Kupfer, reduzierend: rot. | Copper, oxidizing: green. / Copper, reducing: red. | alt* | `/en/masterworks/method/` |
| H2: Hundert Jahre an der Scheibe. | A hundred years at the wheel. | fehlt – Vorschlag | – |
| Von der Siedlung Margaretenhöhe über die Bauhaus-Manufaktur bis in das Baulager der Zeche Zollverein. | From the Margaretenhöhe housing estate by way of the Bauhaus manufactory to the construction warehouse of the Zeche Zollverein. | fehlt – Vorschlag | – |
| 1924 Margarete Krupp realisiert ein Siedlungsvorhaben … Will Lammert … | Margarete Krupp realizes a housing project in the city of Essen. This is named “Margaretenhöhe” after her. The buildings are to be decorated with ceramics. Hermann Kätelhön, her artistic adviser, initiates the founding of a ceramics workshop on the site and appoints Will Lammert as head of the workshop. | alt | `/en/workshop/history/` |
| 1925 Eintragung der „Keramische Werkstatt Margaretenhöhe“ in das Handelsregister. | Registration of the “Keramische Werkstatt Margaretenhöhe” in the commercial register. | alt | `/en/workshop/history/` |
| 1927 Johannes Leßmann wird Nachfolger von Will Lammert … Breitenwirkung verschafft zu haben. | Johannes Leßmann becomes Will Lammert’s successor. He is a student of Otto Lindig, the important Bauhaus ceramist. The workshop switches its production program to the manufacture of mass-produced ceramics and, while strictly adhering to the shaping principles of the Bauhaus, establishes the tradition of a manufactory for sophisticated tableware. It is to Leßmann’s credit that he gave the Bauhaus idea a broad impact in the Ruhr region. | alt | `/en/workshop/history/` |
| 1933 Umzug in ein Gebäude der Zeche Zollverein. Krupp scheidet aus … Rheinelbe Bergbau AG. | Move to a building at the Zollverein colliery. Krupp leaves the company. New shareholders are the city of Essen, the Association for Mining Interests and the Association for the Cultivation of Art in the Rhenish-Westphalian Industrial District. Later takeover of the shares of the city of Essen by Rheinelbe Bergbau AG. | alt | `/en/workshop/history/` |
| 1944 Johannes Leßmann fällt im Krieg. Übernahme der Werkstattleitung durch Walburga Külz … | Johannes Leßmann is killed in the war. Walburga Külz, who like Johannes Leßmann is a student of Otto Lindig, takes over the management of the workshop. | alt | `/en/workshop/history/` |
| 1953 Walburga Külz … übergibt die Leitung an Helmut Gniesmer … Baukeramik | Walburga Külz, who has once again consolidated the workshop economically, hands over the management to Helmut Gniesmer, who again switches the workshop program primarily to building ceramics. | alt | `/en/workshop/history/` |
| 1968 Durch Übernahme der Rheinelbe Bergbau AG geht die Werkstatt in den Besitz der Ruhrkohle AG … über. | Through the takeover of Rheinelbe Bergbau AG, the workshop becomes the property of Ruhrkohle AG (later RAG Aktiengesellschaft). | alt | `/en/workshop/history/` |
| 1986 Young-Jae Lee und Hildegard Eggemann übernehmen die Leitung … Blindstempel … | Young-Jae Lee and Hildegard Eggemann take over the management of the workshop. Resumption of the manufactory program with series production of specially designed tableware, returning to the basic formal principles of the Bauhaus. This is also made clear by the press mark or blind stamp, which the workshop products bear from 1930 to the present day. | alt | `/en/workshop/history/` |
| 1987 Umzug der Werkstatt in das Baulager der Zeche Zollverein (Weltkulturerbe). | The workshop moves into the construction warehouse of the Zeche Zollverein (World Heritage Site). | alt | `/en/workshop/history/` |
| 1993 Leitung der Werkstatt durch Young-Jae Lee. | Workshop under Young-Jae Lee’s directorship. | alt* (Satz ohne Verb; Vorschlag: „Young-Jae Lee directs the workshop.“) | `/en/workshop/history/` |
| 2006 Übernahme der Keramischen Werkstatt Margaretenhöhe GmbH von der RAG Aktiengesellschaft durch Young-Jae Lee. Geschäftsführung Young-Jae Lee. | Young-Jae Lee takes over the Keramische Werkstatt Margaretenhöhe GmbH from the RAG Aktiengesellschaft and becomes managing director. | alt | `/en/workshop/history/` |
| 2025 Abschied: Unsere langjährige Mitarbeiterin Hildegard Eggemann (geb. 1949 in Essen) ist nach kurzer Krankheit am 12. Mai 2025 in Essen verstorben. | 2025 In memoriam: Our longtime colleague Hildegard Eggemann (born 1949 in Essen) passed away after a brief illness on May 12, 2025, in Essen. | fehlt – Vorschlag (Eintrag neu, nicht im Altbestand) | – |
| Chronik-Titel (Siedlungswerkstatt, Im Handelsregister, Bauhaus im Ruhrgebiet, Auf Zollverein, Neue Leitung, Baukeramik, Ruhrkohle, Zurück zum Gefäß, Das Baulager, Die Leitung, In eigener Verantwortung, Abschied) | Estate workshop, In the commercial register, The Bauhaus in the Ruhr region, At Zollverein, New management, Building ceramics, Ruhrkohle, Back to the vessel, The construction warehouse, Management, On her own responsibility, In memoriam | fehlt – Vorschlag | – |
| 1924 bis 2025 / Wischen | 1924 to 2025 / Swipe | fehlt – Vorschlag | – |
| H2: Team | Team | alt | `/en/workshop/team/` |
| Die Menschen hinter dem Manufakturprogramm – manche seit Jahrzehnten in der Werkstatt. | The people behind the collection – some of them in the workshop for decades. | fehlt – Vorschlag | – |
| Young-Jae Lee – Werkstatt-Leitung | Director of the Workshop | alt | `/en/workshop/team/` |
| Geboren 1951 in Seoul. Seit 1987 Leitung der Keramischen Werkstatt Margaretenhöhe. / Link: Biografie | Born in Seoul in 1951. Director of the Keramische Werkstatt Margaretenhöhe since 1987. / Biography | fehlt – Vorschlag | – |
| Daniela Glattki – Mitarbeiterin seit 2003 | Daniela Glattki – on staff since 2003 | fehlt – Vorschlag | – |
| 1975 geboren in Malapane, Polen | 1975 Born in Ozimek (Malapane), Poland | alt* (alt „Ozimek“, V3 „Malapane“, derselbe Ort) | `/en/workshop/team/` |
| 1996–1999 Töpferlehre bei Annette Dannhus in Celle | 1996–1999 Apprenticeship as a potter with Annette Dannhus in Celle, Germany | alt | `/en/workshop/team/` |
| 2000–2003 Fachschule für Keramikgestaltung in Höhr-Grenzhausen | 2000–2003 Fachschule für Keramikgestaltung in Höhr-Grenzhausen (technical school for ceramic design) | alt* | `/en/workshop/team/` |
| 2005 Meisterprüfung | 2005 Examination for master craftsman’s diploma | alt | `/en/workshop/team/` |
| Shoko Ishioka – Mitarbeiterin seit 2004 | Shoko Ishioka – on staff since 2004 | fehlt – Vorschlag | – |
| 1973 geboren in Tokyo, Japan / 1992–1997 Studium der Kunstgeschichte bei Takahiko Okada in Tokyo / 1997–2003 Studium der Kunst an der Burg Giebichenstein, Kunsthochschule bei Azade Köker | 1973 Born in Tokyo, Japan / 1992–1997 Studied art history with Takahiko Okada in Tokyo / 1997–2003 Studied art at the Burg Giebichenstein Kunsthochschule, Halle (Saale), Germany, with Azade Köker | alt | `/en/workshop/team/` |
| Michael Schmandt – Geselle seit 1979 | Michael Schmandt – journeyman since 1979 | alt* („Journeyman at the Keramische Werkstatt Margaretenhöhe since 1979“) | `/en/workshop/team/` |
| 1957 geboren in Essen / 1976 Ausbildung zum Scheibentöpfer … bei Helmut Gniesmer | 1957 Born in Essen, Germany / 1976 Trained in wheel pottery at the Keramische Werkstatt with Helmut Gniesmer | alt | `/en/workshop/team/` |
| Claudia Prien – Bilanzbuchhalterin seit 2006 | Claudia Prien – accounting specialist since 2006 | alt* („Accounting Specialist“) | `/en/workshop/team/` |
| 1969 geboren in Moers / 1988–1991 Ausbildung zur Industriekauffrau und Betriebswirtin (VWA) bei der RAG Aktiengesellschaft in Essen / 1995 Abschluss zur staatlich geprüften Bilanzbuchhalterin | 1969 Born in Moers, Germany / 1988–1991 Trained as industrial manager at RAG Aktiengesellschaft, Essen, Germany; graduate in business administration / 1995 Graduation as certified accounting specialist | alt | `/en/workshop/team/` |
| Alt-Text Team: Das Team der Werkstatt vor Regalen mit Keramik | The workshop team in front of shelves of ceramics | fehlt – Vorschlag | – |
| H2: Auszeichnungen | Awards | alt | `/en/workshop/awards/` |
| 1997 Hessischer Staatspreis, 1. Preis | 1997 Hessischer Staatspreis (Hessian State Award), 1st prize | alt | `/en/workshop/awards/` |
| 2001 Bayerischer Staatspreis für Gestaltung, 1. Preis / Dießener Keramikpreis, 1. Preis / Käuferpreis les Must de scènes d’intérieur, Septembre, Messe Maison & Objet, Paris | 2001 Bayerischer Staatspreis für Gestaltung (Bavarian State Award for Design), 1st prize / Diessener Keramikpreis (Ceramic Award Diessen), 1st prize / Käuferpreis les Must de scènes d’interieur, Septembre (Customer Award …), Fair Maison & Objet, Paris | alt* („interieur“ zu „intérieur“) | `/en/workshop/awards/` |
| 2005 Hessischer Staatspreis, 1. Preis | 2005 Hessischer Staatspreis (Hessian State Award), 1st prize | alt | `/en/workshop/awards/` |
| H2: Auf Zollverein. | At Zollverein. | fehlt – Vorschlag | – |
| 1933 zog die Werkstatt in ein Gebäude der Zeche Zollverein, 1987 in das Baulager der Zeche – heute Weltkulturerbe. Hier wird gedreht, glasiert und gebrannt, und hier können Sie die Werkstatt besuchen. | In 1933 the workshop moved into a building at the Zeche Zollverein, and in 1987 into the colliery’s construction warehouse, today a World Heritage Site. Here we throw, glaze and fire, and here you can visit the workshop. | fehlt – Vorschlag | – |
| Adresse / Öffnungszeiten / Nahverkehr / Kontakt (Beschriftungen) | Address / Opening hours / Public transport / Contact | alt* | `/en/business/contact/` |
| Haltestelle Katernberg Süd | Stop: Katernberg Süd | alt* („stop Katernberg Süd“) | `/en/business/contact/` |

---

## 7. Aktuelles (`aktuelles.html`)

Altbestand: `/en/news/current/`, `/en/news/past/…` (11 Jahresseiten), `/en/news/publications/`. Die Altseiten 2017–2022 sind **großteils deutsch** (Beispiel: „Weihnachtsausstellung in der Keramischen Werkstatt“, „Öffnungszeiten“, „Montag – Freitag“, Beschreibungen von „1000°“). Dort gibt es keine verwertbare englische Fassung.

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H1: Aktuelles | News (Current) | alt | `/en/news/` |
| Liebe Freunde der Keramischen Werkstatt, besuchen Sie und freuen Sie sich auf die folgenden Ausstellungen. | Dear friends of the Keramische Werkstatt, please visit and look forward to the following exhibitions. | alt* („Look forward to the upcoming exhibitions:“) | `/en/news/current/` |
| Kapitel: Ausstellungen 2026 / Vergangene Ausstellungen / Veröffentlichungen | Exhibitions 2026 / Past exhibitions / Publications | alt* („Current / Publications / Past“) | `/en/news/` |
| „99 Schalen – ein Kosmos“, MOK (23. April –25. Oktober 2026) | “99 bowls – a cosmos”, MOK (April 23 – October 25, 2026) | alt | `/en/news/current/` |
| „Kummerschalen“ – Der Niederrheinische Kunstverein … (Absatz, Ort, Eröffnung, Öffnungszeiten Dom) | siehe Abschnitt 2.2; zusätzlich: „The artist will be present.“ | fehlt – Vorschlag | – |
| Die Künstlerin wird anwesend sein. | The artist will be present. | fehlt – Vorschlag | – |
| „Bildnachweis: Fotografie: Christopher Clem Franken, © Kunst-Station Sankt Peter, Köln“ | Photograph: Christopher Clem Franken, © Kunst-Station Sankt Peter, Cologne | fehlt – Vorschlag | – |
| Mode, Taschen, Keramik & Licht im Dialog (Pop-up) | siehe Abschnitt 2.2 | alt* | `/en/news/current/` |
| H2: Vergangene Ausstellungen | Past exhibitions | alt | `/en/news/past/` |
| Von Kyoto bis Boston, von Breslau bis in die eigene Werkstatt: eine Auswahl der Ausstellungen seit 2016. Ein Jahr öffnen, um die Stationen zu sehen. | From Kyoto to Boston, from Wrocław to our own workshop: a selection of exhibitions since 2016. Open a year to see the venues. | fehlt – Vorschlag | – |
| Jahres-Kurzzeilen („2026 Umbrella, Dänemark · …“) | 2026 Umbrella, Denmark · Künstlerzeche Unser Fritz, Herne · Galerie Jahn und Jahn, Munich | fehlt – Vorschlag | – |
| „Young-Jae Lee – Schalen“, Umbrella, west coast exhibitions, Nørre Nebel, Dänemark (7. März – 24. Mai) | “Young-Jae Lee – Bowls”, Umbrella, west coast exhibitions, Nørre Nebel, Denmark (March 7 – May 24) | alt | `/en/news/past/2026-2/` |
| Mode, Taschen, Keramik und Licht im Dialog, No Nonsense – Pop Up Store, Köln (28.–30. Mai) | Fashion, bags, ceramics and lighting in dialogue, No Nonsense – Pop Up Store, Cologne (May 28–30) | alt | `/en/news/past/2026-2/` |
| „Stille Gäste“, Künstlerzeche Unser Fritz, Herne (13. Juni – 5. Juli) | “Silent guests”, Künstlerzeche Unser Fritz, Herne (June 13 – July 5) | alt | `/en/news/past/2026-2/` |
| „Young-Jae Lee“, Galerie Jahn und Jahn (14. Juli – 12. September) | “Young-Jae Lee”, Galerie Jahn und Jahn, Munich (July 14 – September 12) | alt | `/en/news/current/` |
| Link: Alle Angaben zu 2026 (…2016) | All details for 2026 | fehlt – Vorschlag (Link geht in der V3 noch auf die deutsche Altseite; EN-Altseite siehe URL) | `/en/news/past/2026-2/` |
| 2025: Weihnachtsausstellung 2025 / „OPEN House“ – Future Heritage / „Lee Young-Jae“ Gallery Tokyo / „100 + 1 Übungsstücke“ / „Young-Jae Lee: Keramik“ / „Young-Jae Lee: Vasen“ / „Young-Jae Lee: SCHALEN“ / Messe „Ambiente“ | 2025: Christmas Exhibition 2025 / “OPEN House” – Future Heritage / “Lee Young-Jae” at Gallery Tokyo / “100 + 1 Exercises” / “Young-Jae Lee: Keramik” / “Young-Jae Lee: Vases” / “Young-Jae Lee: BOWLS” / Ambiente trade fair | alt* (Altseite mit Tippfehlern: „Exhibiton“, „EXCERCISES“, „Hontent/uploads“ als Müllzeile) | `/en/news/past/2025-2/` |
| Weihnachtsausstellung 2025 … mit Christine Atmer de Reig (Keramik), Vivien Reig Atmer (Schmuck) und Masami Takeuchi (Kintsugi) | Christmas exhibition 2025 at the workshop, with Christine Atmer de Reig (ceramics), Vivien Reig Atmer (jewelry) and Masami Takeuchi (kintsugi) | alt* | `/en/news/past/2025-2/` |
| 2024: Weihnachtsausstellung – Editionen / „Forms from the Earth“ / „TEE“ / „100 Jahre …“ / Bayerischer Kunstgewerbeverein / Diessener Töpfermarkt / „50 Jahre – 50 Schätze“ | Christmas exhibition – editions / “Forms from the Earth” / “TEA” / “100 years Keramische Werkstatt Margaretenhöhe – Young-Jae Lee at Hetjens” / Bayerischer Kunstgewerbeverein / Diessener Töpfermarkt (Diessen pottery market) / “50 Jahre – 50 Schätze” (“50 Years – 50 Treasures”) | alt* | `/en/news/past/2024-2/` |
| 2023: „CONTEMPORARY CRAFT – Young-Jae Lee“ MKG / „Gefäße – retrospektiv“ / Raum 49 / Goldschmiede & Galerie Udo Adam-Pasquale / Gallery Toukyo | “CONTEMPORARY CRAFT – Young-Jae Lee”, Museum für Kunst und Gewerbe Hamburg (MKG) / “Vessels – retrospective” / Raum 49, Zurich, vernissage March 30, 2023 / Goldsmith’s and gallery Udo Adam-Pasquale, Cologne-Sülz / Gallery Toukyo | alt* (Teil englisch) | `/en/news/past/year_2023/` |
| 2022: Yui Tombana – Zeichnungen / „HOME! 3/5 Identitäten“ / „Spindelvasen und Spinatschalen“ / „Hope / Hoffnung“ / „Vessels are Sculpture“ / „WIR. Bilder für eine neue Kunst des Zusammenlebens“ | Yui Tombana – drawings, an exhibition at our workshop / “HOME! 3/5 Identities” / “Spindle Vases and Spinach Bowls” / “Hope / Hoffnung – Works by Young-Jae Lee” / “Vessels are Sculpture” / “WIR. Pictures for a New Art of Living Together” | alt* nur für Hope und Vessels are Sculpture; übrige fehlt – Vorschlag | `/en/news/past/year_2022/` |
| 2021: Weihnachtsausstellung / „In collaboration with KDK“ / „Gefässe“ / „Viereckig“ / Gallery Toukyo / „1000°“ | Christmas exhibition at the workshop, with jewelry by Karin Kolster-Kelly and Ulrika Mertens / “In collaboration with KDK” / “Vessels” / “Square” / Gallery Toukyo / “1000°” | fehlt – Vorschlag (Altseite deutsch, nur „In collaboration with KDK“ englisch) | `/en/news/past/2021-2/` |
| Beschreibung „1000°“: „Zeitgenössische Kunst zu alten und neuen Techniken des Keramischen … “ (Altseite, langer deutscher Ausstellungstext) | Übersetzung nötig | fehlt – Rechte (Text des Kunsthaus Dresden; ggf. bei Kunsthaus Dresden eine englische Fassung anfragen) | `/en/news/past/year_2020/` |
| 2020: „Spinatschalen“ / Buchpräsentation „Das Grün in den Schalen“ / „es grünt“ / „ENTERVENTIONALE #2020“ / „Schönheit !?“ | “Spinach Bowls” / book presentation “The Green in the Bowls” / “It’s Getting Green” / “ENTERVENTIONALE #2020” / “Beauty !?” | fehlt – Vorschlag (Altseite deutsch) | `/en/news/past/year_2020/` |
| 2019: Weihnachtsausstellung/Ausverkauf, „Emptying, Filling and Emptying“ / Buchvorstellung und Installation / „Fine Choices 2019“ / „MATERIAL ZU FORM – Körper zu Körper“ / Museum Folkwang / „WerkKunst“ / „Who´s afraid of Bauhaus?“ | Clearance sale (“We are renovating – we need space!”, Sept. 27 – Dec. 23) / “Emptying, Filling and Emptying” / book presentation and installation / “Fine Choices 2019 Featuring Young-Jae Lee” / “MATERIAL TO FORM – Body to Body” / Museum Folkwang / “WerkKunst – Vessels by Young-Jae Lee” / “Who’s afraid of Bauhaus?” | alt* nur englische Titel; Rest fehlt – Vorschlag | `/en/news/past/year_2019/` |
| 2018: Weihnachten / „Young-Jae Lee – Ceramics“ / „Young-Jae Lee – Céramique“ / „Arbeiten in Keramik“ | Christmas at the workshop / “Young-Jae Lee – Ceramics” / “Young-Jae Lee – Céramique” / “Works in Ceramics” | alt* (Titel) / fehlt – Vorschlag | `/en/news/past/2018-2/` |
| 2017: Shinsegae Gallery / Gallery Kan / „HINGABE“ / Gallery Tohkyo / „Gefäße“ | Shinsegae Gallery, Daegu, Incheon, Busan, Korea / Gallery Kan, Fukushima / “HINGABE” (“Devotion”) – Vessels by Young-Jae Lee, Garden Pavilion of Kloster Beuerberg, Freising Diocesan Museum / Gallery Tohkyo, Tokyo / “Vessels”, Octagon of the Hochschule für Bildende Künste Dresden | alt* (Orte) / fehlt – Vorschlag (Titel) | `/en/news/past/2017-2/` |
| 2016: „Das Geschirr der KWM“ / Ehrendoktorwürde / „Geschirr der Keramischen Werkstatt Margaretenhöhe GmbH“ / „Werkstatt Gefäßkeramik“ / „Young-Jae Lee – Gefäße“ / „Young-Jae Lee Schalen“ / „NICHT SCHÖN“ / Welterbetag / Sonderschicht / „WITNESS TO AN ANCIENT TRUTH“ / „Gefäße der Keramischen Werkstatt“ / Schmuckausstellung / Schatzkammer | “The Tableware of the KWM” / Honorary doctorate presented to Young-Jae Lee by the Eugeniusz Geppert Academy of Art and Design in Wrocław / “Tableware of the Keramische Werkstatt Margaretenhöhe GmbH” / “Studio Vessel Ceramics” / “Young-Jae Lee – Vessels” / “Young-Jae Lee Bowls” / “NICHT SCHÖN” (“Not Beautiful”) – Vases by and with Young-Jae Lee / UNESCO World Heritage Day, open 11 a.m.–7 p.m. / Extra shift, open 6 p.m. to midnight / “WITNESS TO AN ANCIENT TRUTH” / “Vessels of the Ceramic Workshop” / Jewelry exhibition in our workshop / Our treasure chamber is opened | alt* (Hauptseite 2016 weitgehend englisch; Ausstellungstitel in Anführungszeichen gemischt) | `/en/news/past/year_2016/` |
| Hinweis: Plakate und Einladungs-PDFs der Altseite sind in der V3 nicht übernommen | – | – | – |
| H2: Veröffentlichungen | Publications | alt | `/en/news/publications/` |
| Berichte und Gespräche über die Werkstatt. | Reports and interviews about the workshop. | fehlt – Vorschlag | – |
| „Der Ruf des Bauhaus“ · Interview bei Urbanana · von Ilona Marx · 25. Januar 2023 · Interview lesen | “Der Ruf des Bauhaus” (“The Call of the Bauhaus”) · Interview with Urbanana · by Ilona Marx · January 25, 2023 · Read the interview (in German) | alt* („Interview with Urbanana by Ilona Marx | 25. Januar 2023“) | `/en/news/publications/` |
| „Vom Stolz, eine Töpferin zu sein“ · Handwerkskammer Düsseldorf, Geschäftsbericht „Werkstatt 2019“ zum Schwerpunkt „In Frauenhand“ · Zum Hinweis im Archiv | “Vom Stolz, eine Töpferin zu sein” (“On the Pride of Being a Potter”) · Düsseldorf Chamber of Crafts, annual report “Werkstatt 2019”, focus theme “In Frauenhand” (“In Women’s Hands”) · To the note in the archive | fehlt – Vorschlag | – |

---

## 8. Besuch (`besuch.html`) und Anfrageformular

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H1: Besuchen Sie die Werkstatt. | Visit the workshop. | fehlt – Vorschlag | – |
| Wir danken Ihnen für Ihr Interesse. Wenn Sie Fragen haben oder Stücke aus unserem Programm erwerben möchten, senden wir Ihnen natürlich gerne weitere Informationen oder ein Angebot zu. Selbstverständlich können Sie unsere Werkstatt auch besuchen. | Thank you for your interest in our website. If you have questions or would like to purchase items, we would be happy to send you additional information or an estimate. Of course, you are also welcome to visit our workshop. | alt | `/en/business/contact/` |
| Öffnungszeiten: Montag bis Freitag 9–17 Uhr / Samstag 11–15 Uhr / Ansonsten nach Vereinbarung | Opening hours: Monday to Friday 9 a.m.–5 p.m. / Saturday 11 a.m.–3 p.m. / Otherwise by appointment | alt* („or by appointment“) | `/en/business/contact/` |
| H2: Adresse | Address | fehlt – Vorschlag (alt: ohne Überschrift) | `/en/business/contact/` |
| Keramische Werkstatt Margaretenhöhe GmbH, Bullmannaue 19, 45327 Essen | Keramische Werkstatt Margaretenhöhe GmbH, Bullmannaue 19, 45327 Essen, Germany | alt | `/en/business/contact/` |
| Seit 1987 im Baulager der Zeche Zollverein, heute Weltkulturerbe. | Since 1987 in the construction warehouse of the Zeche Zollverein, today a World Heritage Site. | fehlt – Vorschlag | – |
| Route planen / Route in OpenStreetMap öffnen | Plan your route / Open route in OpenStreetMap | fehlt – Vorschlag (alt: „Larger map“) | `/en/business/contact/` |
| H2: So erreichen Sie uns. | How to find us. | alt („HOW TO FIND US“) | `/en/business/contact/` |
| Die Werkstatt liegt auf dem Zechengelände. Nach der Einfahrt links abbiegen, nach etwa 100 Metern auf der linken Seite. | The workshop is on the colliery grounds. After entering, turn left; after about 100 meters it is on the left. | fehlt – Vorschlag (Sinn aus den Routenschritten) | – |
| Mit dem Auto von Norden | By car from the north | alt | `/en/business/contact/` |
| A 42, Ausfahrt Gelsenkirchen-Heßler / Essen-Katernberg | A 42, take exit Gelsenkirchen-Heßler / Essen-Katernberg | alt | `/en/business/contact/` |
| im Kreisverkehr Ausfahrt Richtung Katernberg, Stoppenberg (Schalker Straße, Katernberger Str.) | at the roundabout take the exit towards Katernberg, Stoppenberg (Schalker Straße, Katernberger Straße) | alt | `/en/business/contact/` |
| ca. 2,7 Kilometer dem Straßenverlauf folgen (durch Katernberg) | continue a total of ca. 2.7 kilometers (through Katernberg) | alt* | `/en/business/contact/` |
| an der ersten Ampel nach der S-Bahn-Unterführung rechts in die Bullmannaue abbiegen | at the first traffic light after the railway underpass, turn right on to Bullmannaue | alt | `/en/business/contact/` |
| weiterfahren bis auf das Zechengelände – dann links abbiegen | continue driving until you reach the coal mine complex (Zeche) – then keep left | alt | `/en/business/contact/` |
| nach ca. 100 m liegt auf der linken Seite die Werkstatt | the workshop is in two low buildings after 100 m | alt | `/en/business/contact/` |
| Mit dem Auto von Süden (6 Schritte) | By car from the south | alt (komplett) | `/en/business/contact/` |
| Mit dem Auto aus der Essener Innenstadt (6 Schritte) | By car from downtown Essen | alt (komplett) | `/en/business/contact/` |
| Mit öffentlichen Verkehrsmitteln: Haltestelle Katernberg Süd | By public transportation: stop Katernberg Süd | alt | `/en/business/contact/` |
| Fahrplanauskünfte erhalten Sie beim Verkehrsverbund Rhein-Ruhr. | Schedule information can be obtained from the Rhein-Ruhr transportation system Verkehrsverbund Rhein-Ruhr. | alt | `/en/business/contact/` |
| H2: Anfrage | Inquiry | alt („Inquiries / Orders“) | `/en/inquiries-orders/` |
| Schreiben Sie uns, welches Stück oder welches Programm Sie interessiert. Wir melden uns mit weiteren Informationen oder einem Angebot. | Tell us which piece or which program interests you. We will get back to you with further information or an estimate. | fehlt – Vorschlag | – |
| Für Geschirr und Edition gibt es zusätzlich ein Formular zum Ausdrucken. Zu den Meisterstücken von Young-Jae Lee antworten wir gern auf Ihre Nachricht. | For tableware and editions there is also a form you can print out. For the masterworks by Young-Jae Lee, we are happy to reply to your message. | alt* („If you would like to receive more information about our manufactory program (tableware and edition), please open the respective form. […] Should you be interested in receiving information about Young-Jae Lee’s masterworks, please send us your inquiry by e-mail or fax. We will process your request immediately.“) | `/en/inquiries-orders/` |
| Anfrage – Geschirr (Formular, PDF) / Anfrage – Edition (Formular, PDF) | Inquiry – Tableware (form, PDF) / Inquiry – Editions (form, PDF) | alt („Inquiry – TABLEWARE“, „Inquiry – EDITION“) | `/en/inquiries-orders/` |
| Telefon / Zeiten / E-Mail / Fax | Phone / Hours / E-mail / Fax | alt* („Tel.“, „Fax“, „E-Mail“) | `/en/business/contact/` |
| H2: Zahlung (Kurzfassung) / Banküberweisung / PayPal | Payment / Bank transfer / PayPal | alt | `/en/business/payment/` |
| Links: Verpackung und Transport / AGB / Impressum | Packing and transport / Terms and conditions / Legal notice | alt | `/en/business/tac/` |

### 8.1 Anfrageformular (`partials/anfrage-form.html`, `anfrage-band.html`, `site/v3/js/sig-anfrage.js`)

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| Name | Name | fehlt – Vorschlag | – |
| E-Mail | E-mail | fehlt – Vorschlag | – |
| Telefon (freiwillig) | Phone (optional) | fehlt – Vorschlag | – |
| Anliegen oder Stück (freiwillig) | Your request or piece (optional) | fehlt – Vorschlag | – |
| Platzhalter: z. B. Geschirr, Edition oder ein Meisterstück | e.g. tableware, an edition or a masterwork | fehlt – Vorschlag | – |
| Nachricht | Message | fehlt – Vorschlag | – |
| Ihre Angaben verwenden wir nur, um Ihre Anfrage zu beantworten. Verantwortlich ist die Keramische Werkstatt Margaretenhöhe, siehe Datenschutz. | We use your details only to answer your inquiry. The controller is the Keramische Werkstatt Margaretenhöhe; see our Privacy policy. | fehlt – Vorschlag | – |
| Button: Anfrage senden | Send inquiry | fehlt – Vorschlag | – |
| Bitte nennen Sie uns Ihren Namen. | Please tell us your name. | fehlt – Vorschlag | – |
| Bitte geben Sie Ihre E-Mail-Adresse an, damit wir antworten können. | Please enter your e-mail address so that we can reply. | fehlt – Vorschlag | – |
| Diese E-Mail-Adresse scheint nicht zu stimmen. Bitte prüfen Sie sie, z. B. name@beispiel.de. | This e-mail address does not look right. Please check it, e.g. name@example.com. | fehlt – Vorschlag | – |
| Bitte nur Ziffern, Leerzeichen und + ( ) / - verwenden. | Please use only digits, spaces and + ( ) / - . | fehlt – Vorschlag | – |
| Bitte schreiben Sie uns kurz, worum es geht. | Please tell us briefly what this is about. | fehlt – Vorschlag | – |
| Ein Feld braucht noch Ihre Angabe. / 3 Felder brauchen noch Ihre Angabe. | One field still needs your input. / 3 fields still need your input. | fehlt – Vorschlag (Pluralform je Sprache, ICU-Regel) | – |
| Danke, Ihre Anfrage ist vorbereitet. | Thank you, your inquiry is ready. | fehlt – Vorschlag | – |
| Ihr E-Mail-Programm öffnet sich mit der vorbereiteten Anfrage. Bitte senden Sie die Nachricht dort ab. | Your e-mail program will open with the prepared inquiry. Please send the message from there. | fehlt – Vorschlag | – |
| Es öffnet sich nichts? Schreiben Sie an kontakt@kwm1924.de oder rufen Sie an: +49 201 30 50 80. | Nothing opens? Write to kontakt@kwm1924.de or call +49 201 30 50 80. | fehlt – Vorschlag | – |
| Angaben ändern | Edit your details | fehlt – Vorschlag | – |
| Ohne JavaScript: Bitte schreiben Sie uns an kontakt@kwm1924.de oder rufen Sie an | Please write to us at kontakt@kwm1924.de or call us at … | fehlt – Vorschlag | – |
| Vorbelegter Betreff / E-Mail-Text (mailto) | Subject: Inquiry · Your inquiry about: … | fehlt – Vorschlag (im JS prüfen, was die Mail enthält) | – |
| Anfrageband: „Zu diesem Stück anfragen“, „Anfrage schreiben“, Hinweis `{{hinweis}}` | Inquire about this piece / Write an inquiry / … | fehlt – Vorschlag | – |

---

## 9. Service- und Rechtsseiten

### 9.1 Zahlung (`zahlung.html`)

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H1: Zahlungsmöglichkeiten | Payment methods | alt | `/en/business/payment/` |
| Per Überweisung oder PayPal. | By bank transfer or PayPal. | fehlt – Vorschlag | – |
| Banküberweisung: Sparkasse Essen, IBAN DE84 3605 0105 0000 2649 37 | Bank transfer: Sparkasse Essen, IBAN DE84 3605 0105 0000 2649 37 | alt (IBAN im Altbestand `DE84 3605 01 05 0000 264937`; Gruppierung angleichen) | `/en/business/payment/` |
| PayPal: kontakt@kwm1924.de | PayPal: kontakt@kwm1924.de | alt | `/en/business/payment/` |
| Alt-Text: QR-Code für die Zahlung per PayPal an kontakt@kwm1924.de | QR code for payment via PayPal to kontakt@kwm1924.de | fehlt – Vorschlag | – |
| (nicht vorhanden) BIC (SWIFT) für Auslandsüberweisungen | BIC: von der Werkstatt zu liefern | fehlt – Vorschlag (für Kundschaft außerhalb des Euroraums wichtig; weder DE noch EN nennen ihn) | – |

### 9.2 Verpackung und Transport (`versand.html`)

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H1: Verpackung und Transportkosten | Packing and transport costs | alt | `/en/business/tac/packing-and-transport/` |
| So berechnen sich Versand und Verpackung. | How shipping and packing costs are calculated. | fehlt – Vorschlag | – |
| Die Verpackungs- und Transportkosten richten sich nach Anzahl und Gewicht der zu versendenden Pakete. Bei Auslandslieferungen kommen ggfs. Kosten für die Zollabfertigung hinzu. Die Kosten für die Einfuhr werden von den Zollbehörden direkt an den Kunden erhoben. | Packaging and delivery costs depend on the number and weight of the parcels to be sent. For international deliveries, customs clearance charges may apply. Import charges are charged directly to the customer by the customs authorities. | alt | `/en/business/tac/packing-and-transport/` |

### 9.3 Impressum (`impressum.html`)

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H1: Impressum | Legal notice (alt: „About this site“) | alt* | `/en/business/about-this-site/` |
| Anbieterangaben: Keramische Werkstatt Margaretenhöhe GmbH, Bullmannaue 19, 45327 Essen, Telefon, E-Mail, Vertreten durch die Geschäftsführung Young-Jae Griepentrog, geb. Lee, Sitz Essen, Amtsgericht Essen HRB 19479, USt-IdNr. | Keramische Werkstatt Margaretenhöhe GmbH, Bullmannaue 19, 45327 Essen, Germany, telephone, e-mail, represented by the managing director Young-Jae Griepentrog, née Lee, registered in Essen, Amtsgericht Essen commercial register B 19479, VAT identification number | alt | `/en/business/about-this-site/` |
| Copyright-/Credit-Zeile (Fotos, Übersetzung ins Englische: Alison Gallup, Lektorat, Webentwicklung) | © Keramische Werkstatt Margaretenhöhe GmbH, as of: October 2009 · Texts © … and the authors · Photographs © 2007 George Meister, 2008 Haydar Koyupinar (V3 ergänzt 2015 Moon Dukgwan) · English translation: Alison Gallup · Copyediting of English texts: Alix Sharma-Weigold and Bish Sharma | alt* | `/en/business/about-this-site/` |
| H2: Rechtlicher Hinweis (Haftung für Inhalte, Links, Urheberrecht, Marken, deutsches Recht) | Legal Notice (13 Absätze) | alt | `/en/business/about-this-site/` |
| H2: Datenschutz: Ihr gutes Recht – unsere Verpflichtung und 11 Unterabschnitte (Informationen, die wir erheben, Technische Zugriffsdaten, Persönliche Daten, Kinderschutz, Verwendung, Auskunft, Sicherheit, Links, Ansprechpartner, Geltungsbereich, Öffentliches Verfahrensverzeichnis) | Protection of Data Privacy: Your Right—Our Obligation / Information We Collect / Technical Access Data / Personal Data / Children’s Online Privacy Protection / How We Use Your Data / Information About, Modification and Deletion of Your Data / The Security of Your Data / Links and References to Other Websites / Your Contact Regarding Data Protection / Applicability / Public Index of Procedures | alt (Stand 10.03.2008) | `/en/business/about-this-site/` |

Warnung: Der Datenschutztext der Altseite stammt von 2008 und beruft sich auf § 4e BDSG a. F. (inzwischen durch DSGVO und BDSG n. F. überholt). Er ist **kein Ersatz** für die neue Datenschutzerklärung. Englische Rechtstexte sollten nicht ungeprüft übernommen werden.

### 9.4 AGB (`agb.html`)

Die englischen AGB der Altseite (`/en/business/tac/`, „As at 01 May 2013“) sind **keine Übersetzung der aktuellen deutschen AGB** (Stand 01.10.2026). Beispiele für Abweichungen:

| Stelle | DE (V3, Stand 01.10.2026) | EN (Altseite, Stand 01.05.2013) |
|---|---|---|
| § 3 (5) Skonto | „Ein Abzug von Skonto wird nicht gewährt.“ | „The deduction of a cash discount is subject to a specific written agreement.“ |
| § 3 (6) Fälligkeit | sofort fällig | 7 Tage ab Rechnungsdatum |
| § 6 Widerruf | zwei Wochen (Verbraucher) | 2 weeks, aber veraltet gegenüber 14-Tage-Regelung (§ 355 BGB) |
| Kontakt § 6 | `kontakt@kwm1924.de` | Tippfehler `kontkt@kwm1924.de` |

Qualität der Altübersetzung: viele Tippfehler und Zeichenfehler („exc1usive“, „payrnent“, „cornpensation“, „VA T“, „li ability“, „kontkt“). Empfehlung: **keine automatische Übernahme.** Falls die Werkstatt englische AGB braucht, die aktuelle deutsche Fassung durch eine Rechtsübersetzung ersetzen lassen und im Text festhalten, dass die deutsche Fassung maßgeblich ist (§ 12 (2) der AGB sagt dies bereits: Vertragssprache ist Deutsch). Alternativ den EN-AGB-Link auf die deutsche Seite mit Hinweis „The legally binding version is in German“ setzen.

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H1: Allgemeine Geschäftsbedingungen | General Terms and Conditions | alt | `/en/business/tac/` |
| Für Verbraucher und Unternehmer. | For consumers and businesses. | fehlt – Vorschlag | – |
| Allgemeine Verkaufs- und Lieferbedingungen der Keramische Werkstatt Margaretenhöhe GmbH (AVL), Stand: 01.10.2026 | General Terms of Sale and Delivery of Keramische Werkstatt Margaretenhöhe GmbH, as at October 1, 2026 | alt* (Titel); Stand fehlt | `/en/business/tac/` |
| § 1 … § 12 (Überschriften) | § 1 General Provisions, Scope of Application / § 2 Conclusion of Agreement / § 3 Prices and Terms of Payment / § 4 Set-off, Right of Retention / § 5 Delivery and Delivery Period / § 6 Information on Revocation for Consumers / § 7 Retention of Title / § 8 Passing of Risk, Packaging Costs / § 9 Warranty / § 10 Data Privacy Protection / § 11 Partial Invalidity / § 12 Place of Performance, Language, Place of Jurisdiction, Governing Law | alt (nur Überschriften) | `/en/business/tac/` |
| Paragraphentexte | siehe Warnung oben | fehlt – Rechte (Rechtsübersetzung nötig) | – |

### 9.5 Datenschutz (`datenschutz.html`) und 404

| DE | EN | Quelle | Quell-URL |
|---|---|---|---|
| H1: Datenschutz | Privacy policy | fehlt – Vorschlag | – |
| Hier steht die Datenschutzerklärung dieser Website. | The privacy policy of this website appears here. | fehlt – Vorschlag | – |
| Text folgt | Text to follow | fehlt – Vorschlag | – |
| Die Datenschutzerklärung wird von der Werkstatt geliefert und hier veröffentlicht, sobald sie vorliegt. | The privacy policy will be provided by the workshop and published here once available. | fehlt – Vorschlag | – |
| Verantwortliche Stelle | Controller | fehlt – Vorschlag | – |
| Bisherige Hinweise: Bis zur neuen Erklärung gelten die bisherigen Datenschutzhinweise im Impressum. | Previous notices: until the new policy is published, the previous data protection notices in the Legal notice apply. | fehlt – Vorschlag | – |
| 404: Diese Schale ist leer. | This bowl is empty. | fehlt – Vorschlag | – |
| Die Seite gibt es nicht oder nicht mehr. Vielleicht führt einer dieser Wege weiter. | This page does not exist, or no longer does. One of these paths may help. | fehlt – Vorschlag | – |
| Zur Startseite / Meisterstücke / Manufaktur / Besuch und Anfahrt | Home / Masterworks / Collection / Visit and directions | fehlt – Vorschlag | – |

---

## 10. Werkangaben: Muster und Vokabular

Die Werkangaben im Altbestand folgen `Typ | Maße | Glasur | Ofen | Ort Jahr`. Die V3 setzt `Typ · Maße · Glasur · Ofen · Ort Jahr`. Für den Import in Sanity empfiehlt sich ein strukturiertes Objekt je Werk (Typ, Höhe, Durchmesser, Glasur, Ofen, Atmosphäre, Temperatur, Ort, Jahr), die Zeichenkette wird je Sprache gebaut.

| DE | EN | Quelle |
|---|---|---|
| Petalit-Eichenasche-Glasur / Petalit-Eichenasche-Feldspat-Glasur | petalite oak ash glaze / petalite oak ash feldspathic glaze | alt |
| Wollastonit-Feldspat-Glasur | wollastonite feldspathic glaze | alt |
| Strontium-Feldspat-Glasur | strontium feldspathic glaze | alt |
| Barium-Feldspat-Glasur | barium feldspathic glaze | alt |
| Spodumen-Feldspat-Glasur | spodumene feldspathic glaze | alt |
| Magnesium-Zinn-Feldspat-Glasur | magnesium tin feldspathic glaze | alt |
| Kalkspat-Glasur | calcite glaze | alt |
| auf weißer Engobe | over white engobe | alt |
| Holzofen / Gasofen | wood kiln (alt auch „wood-fired kiln“) / gas kiln | alt* (einheitlich „wood kiln“) |
| Reduktion | reduction | alt |
| Essen 1994 / Kassel 1984/85 | Essen 1994 / Kassel 1984/85 | alt |
| H / D / ca. | H / D / ca. | alt |
| Teeschale, ohne Titel, 2023 | Tea bowl, untitled, 2023 | fehlt – Vorschlag |
| Schale, spitz, XXL/XL/groß/mittel/klein | Bowl, V-shaped, XXL/XL/large/medium/small | alt |
| Zylindervase XL/groß/mittel/klein | Cylinder vase XL/large/medium/small | alt |
| Kugelvase | Spherical vase | alt |
| Spindelvase | Spindle vase | alt |
| Bettelmönchschale | Mendicant’s bowl | alt |
| Kumme | Kumme (Altseite: „Vessel“) | alt* |

---

## 11. UI-Texte, Status, Datum

### 11.1 Status und Datumsformat

Die Texte stehen **fest im JavaScript** (`sig-aktuell.js`, `sig-buehne.js`): `Läuft`, `Läuft · bis …`, `Läuft · nur noch bis …`, `Demnächst`, `Demnächst · ab …`, `Ab …`, `Beendet`, `Beendet am …`, `Nur noch bis …`. Die Monatsnamen sind in beiden Dateien als deutsches Array doppelt hinterlegt (`MONTHS`).

| DE | EN (Vorschlag) |
|---|---|
| Läuft · bis 25. Oktober | On view · through October 25 |
| Läuft | On view |
| Läuft · nur noch bis 25. Oktober | On view · last days, through October 25 |
| Nur noch bis 25. Oktober | Through October 25 only |
| Demnächst | Coming soon |
| Demnächst · ab 3. Oktober | Coming soon · from October 3 |
| Ab 3. Oktober | From October 3 |
| Beendet | Ended |
| Beendet am 12. Dezember | Ended December 12 |
| Mehr zur Ausstellung / Weniger anzeigen | More about the exhibition / Show less |
| Alle Ausstellungen seit 1980 / Schließen | All exhibitions since 1980 / Close |
| Wischen | Swipe |

Datumsformat EN: `October 25` (ohne Jahr, in der Statuszeile), `March 7 – May 24, 2026` (Spanne), `November 6–8, 2026`, `from 2:30 p.m.` Monatsnamen mit `Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' })` erzeugen, nicht als Array pflegen. Die Sonderregel „bei einer Spanne im selben Monat Monat nur einmal nennen“ per `formatRange`.

### 11.2 Button-, Link- und Hilfetexte (gesammelt)

| DE | EN | Quelle |
|---|---|---|
| Meisterstücke ansehen | See the masterworks | fehlt – Vorschlag |
| Manufakturprogramm / Zum Programm | The collection / To the collection | fehlt – Vorschlag |
| Alle Meisterstücke | All masterworks | fehlt – Vorschlag |
| Alle Ausstellungen | All exhibitions | fehlt – Vorschlag |
| Alle Ausstellungen und Termine | All exhibitions and events | fehlt – Vorschlag |
| Zur Ausstellung | To the exhibition | fehlt – Vorschlag |
| Anfahrt zur Werkstatt / Anfahrt und Besuch | Directions to the workshop / Directions and visit | fehlt – Vorschlag |
| Lieber anrufen | Prefer to call | fehlt – Vorschlag |
| Route planen | Plan your route | fehlt – Vorschlag |
| Zu diesem Stück anfragen | Inquire about this piece | fehlt – Vorschlag |
| Anfrage senden | Send inquiry | fehlt – Vorschlag |
| Online lesen / PDF | Read online / PDF | alt* |
| Interview lesen | Read the interview | fehlt – Vorschlag |
| Werke in Sammlungen | Works in collections | fehlt – Vorschlag |
| Auf eine Stadt klicken/tippen … | Click or tap a city … | fehlt – Vorschlag |
| Glasurprobe antippen zum Vergrößern | Tap a glaze sample to enlarge it | fehlt – Vorschlag |

### 11.3 Alt-Texte (Bildbeschreibungen)

Die V3 enthält rund 100 deutsche Alt-Texte (Startseite 22, Meisterstücke 28, Manufaktur 38, Young-Jae Lee 4, Werkstatt 4, Aktuelles 3, Besuch 1; gezählt per Skript). Der Altbestand hat **keine** englischen Alt-Texte. Alle fehlen. Vorschlag: In Sanity je Bild ein lokalisiertes Feld `alt` (de/en) pflegen und die EN-Texte maschinell vorübersetzen lassen, danach von einer Person lesen lassen (Farbwörter: seladon = celadon, rotbraun = russet brown, rosé = pink, Seladon-Craquelé = celadon crackle).

---

## 12. Glossar und Begriffsempfehlung

| DE | EN Altbestand | Empfehlung | Begründung |
|---|---|---|---|
| Meisterstücke | Masterworks (Nav, URL), „masterpieces“ im Fließtext | **Masterworks** (Nav und Überschrift), im Text „masterworks“ | Altbestand uneinheitlich (Nav Masterworks, Text masterpieces). „Masterworks“ klingt weniger nach Meisterprüfung (masterpiece = Gesellenstück) und passt zu den Unikaten. Der Bereich trägt auch die URL `/masterworks/` |
| Manufakturprogramm | Collection (Nav), „manufactory program“ im Text | Nav und Bereich: **Collection**; im Fließtext „manufactory program“ nur beim ersten Vorkommen als Erklärung | „Collection“ ist verständlich und deckt Tableware, Editions und Colors ab. Das Wort „Manufaktur“ (V3-Navigation) ließe sich auch als „Manufactory“ übernehmen, wirkt aber im Englischen fremd |
| Manufaktur (Nav, Kurzwort) | – | **Collection** | siehe oben |
| Geschirr | Tableware | **Tableware** | Altbestand |
| Edition | Editions | **Editions** (Plural als Bereichsname) | Altbestand |
| Glasur | glaze | **glaze** | |
| Glasurbrand | glost firing / glaze firing | **glaze firing** | „glost“ ist veraltet |
| Schrühbrand | first firing / bisque firing | **bisque firing** (alt: „biscuit“ für den gebrannten Scherben, beides zulässig; ein Begriff wählen: „bisque“) | amerikanisches Englisch |
| Brand | fire / firing | **firing** (die Handlung), **kiln load** für einen Ofengang | |
| Holzbrand / Holzofen | wood kiln / wood-fired kiln | **wood firing** / **wood kiln** | |
| Gasofen | gas kiln | **gas kiln** | |
| Kumme | Vessel / (Mendicant’s bowl) | **Kumme** mit Beschreibung beim ersten Vorkommen: „Kumme, a deep, rounded bowl“ | Eine „Kumme“ ist ein tiefer Napf, kein exaktes englisches Wort. Altbestand deckt den Abschnitt nur als „Vessels“ ab |
| Kummerschalen (Wesel) | “Kummerschalen” | Titel unverändert, Erklärung bei der Werkstatt einholen (Wortspiel „Kummer“ = Sorge / Kumme) | |
| Schale, spitz | bowl, V-shaped | **bowl, V-shaped** | Altbestand |
| Zylindervase / Kugelvase / Spindelvase | cylinder vase / spherical vase / spindle vase | wie Altbestand | |
| Gefäß | vessel | **vessel** | |
| Scheibe / Drehscheibe | (potter’s) wheel | **potter’s wheel**, kurz „wheel“ | |
| drehen / abdrehen | to throw / to trim | **throw** / **trim** | Altbestand verwendet „turn“ und „turning“; „throw“ ist der Fachbegriff |
| Dreheisen | metal trim tool | **trimming tool** | |
| lederhart | leather-hard | **leather-hard** | |
| Scherben | biscuit | **bisque ware** oder **body** | |
| Engobe | engobe (viscous clay slurry) | **engobe** (beim ersten Vorkommen „(slip)“) | |
| Masse (Ton) | mass / clay body | **clay body** | |
| Steinzeug / Porzellan | stoneware / porcelain | **stoneware** / **porcelain** | |
| reduzierend / oxidierend | reducing / oxidizing | **reducing** / **oxidizing** | |
| Feldspatglasur | feldspathic glaze | **feldspathic glaze** (nicht „feldspar glaze“; im Altbestand beides) | |
| Eichenasche | oak ash | **oak ash** | |
| Seladon | – | **celadon** | |
| Rostbraun | rust-brown / russet | **russet brown** | |
| Viereckteller | angular plates / square plate | **square plates** | |
| Plattenteller | serving dish | **serving dish** (Altbestand) | |
| Übertopf | cachepot | **cachepot** | |
| Zeche | colliery / coal mine complex | **colliery** (kurz), **Zollverein Coal Mine Industrial Complex** (UNESCO-Name) | |
| Baulager | construction warehouse | **construction warehouse** | |
| Weltkulturerbe | World Heritage Site | **UNESCO World Heritage Site** | |
| Geschäftsführerin | managing director | **managing director** | |
| Werkstatt | workshop | **workshop** (Eigenname bleibt deutsch) | |
| Geselle | journeyman | **journeyman** | |
| Ehrendoktorwürde | honorary doctorate | **honorary doctorate** | |
| Staatspreis | State Award | **State Award** | |
| Kunsthandwerk | arts and crafts / applied art | **crafts** / **applied arts** | |
| Töpfermarkt | pottery fair / pottery market | **pottery fair** | |
| Vernissage / Eröffnung | vernissage / opening | **opening** (Vernissage in Titeln beibehalten) | |
| Anfrage | inquiry | **inquiry** (nicht „enquiry“) | |
| Angebot | estimate | **estimate** (oder „quote“) | |
| Verpackung und Transport | packing and transport | **packing and transport** | |
| Besuch | – | **Visit** | |
| Haltung (Kapitel) | – | **Approach** | „Attitude“ wäre missverständlich |
| Exerzitium | retreat | **retreat** (oder „spiritual exercise“) | Altbestand „retreat“; die Pointe „Übung“ geht verloren, bei Bedarf „a kind of spiritual exercise“ |

---

## 13. Quellen und Rechte der Zitate

| Autor / Text | Fundstelle in V3 | Englische Fassung veröffentlicht? | Empfehlung |
|---|---|---|---|
| Gisela Jahn, Zitat „minimale Veränderung …“ | index, young-jae-lee | **ja**, auf `/en/youngjae-lee/` | Übernehmen, Quelle nennen |
| Gisela Jahn, weitere Stellen (Bauhaus-Absatz, „Vom Volumen …“, „Das sinnliche Gespür …“, „heitere, schwerelose Empfinden“) | index, meisterstuecke, young-jae-lee | nicht gefunden (Aufsatz nur deutsch online) | Übersetzung nötig, Rechte klären (Autorin / Verlag / Katalog) |
| Barbara Catoir, „Gespannte Lebendigkeit“ | index, young-jae-lee | nicht gefunden | Übersetzung nötig, Rechte klären (Katalog Kunst-Station St. Peter, Köln 2002) |
| Thomas Wagner, „Die aufgehobene Zeit“ | index (Hero, Kosmos), meisterstuecke, young-jae-lee | nicht gefunden | Übersetzung nötig, Rechte klären; prüfen, ob der Katalog „Young-Jae Lee: 1111 Schalen“ (Ostfildern 2006) eine englische Fassung enthält |
| Thomas Wagner, „Galaxie 333“ | young-jae-lee (Teaser) | nicht gefunden | wie oben |
| P. Friedhelm Mennekes, Teaser | young-jae-lee | nicht gefunden | wie oben |
| Prof. Dr. Willibald Veit (kein Teaser) | young-jae-lee | nicht gefunden | nur Titel und PDF verlinken |
| Texte der Altseite als Ganzes | – | nein, die EN-Seite verlinkt auf die deutschen Texte | Bei der EN-Version „(in German)“ am Link vermerken, bis Übersetzungen vorliegen |
| Ausstellungstext „1000°“ (Kunsthaus Dresden) | aktuelles (Archiv 2021) | nein | Kürzen oder weglassen |

Hinweis: Die EN-Seiten weisen als Übersetzerin Alison Gallup und als Lektoren Alix Sharma-Weigold und Bish Sharma aus. Wer Urheber und Rechteinhaber der englischen Fassungen ist (und ob die Werkstatt die Rechte an der Jahn-Übersetzung hat), sollte mit der Werkstatt geklärt werden.

---

## 14. Empfehlung zum Vorgehen (Übersetzung in Sanity)

Hinweis vorab: Die Aussagen zu Sanity unten sind Einschätzungen aus dem Gedächtnis. Vor der Umsetzung gegen die Doku und den **Sanity-MCP** prüfen (Projektregel in `CLAUDE.md`) sowie die Skills `sanity-best-practices` und `content-modeling-best-practices` befragen. Ich habe das in dieser Aufgabe nicht getan.

**1. Feldübersetzung oder Dokumentübersetzung?**

- **Feldübersetzung (je Feld `de`/`en`)** passt für kurze, strukturierte Inhalte: Navigationslabels, Buttons, Formular- und Fehlertexte, Werkangaben, Alt-Texte, Kurzfassungen, Ausstellungstitel. Alle Sprachen stehen im selben Dokument und werden mit demselben Datum veröffentlicht. Nachteil: Ein DE-Dokument lässt sich nicht ohne EN veröffentlichen, wenn man nicht auf Teilvalidierung setzt. Nachteil bei langen Texten: Dokumente werden groß.
- **Dokumentübersetzung (ein Dokument je Sprache, verbunden über `translation.metadata`)** passt für lange Texte und eigenständige Seiten: Texte über Young-Jae Lee, Biografie, Arbeitsweise, Impressum, AGB, Datenschutz, Seiten mit Portable Text. Vorteil: sprachspezifischer Publikationsstatus (EN darf später kommen), eigene Versionen, eigene Slugs, getrennte Rechte für Zitate.
- **Empfehlung (Mischform):** Dokumentübersetzung für `page`, `exhibition`, `legalPage`, `work`; Feldübersetzung für UI-Strings (ein Singleton `uiStrings`), Alt-Texte und Kurzfelder an Bildern. Rechtstexte (AGB) werden **nur auf Deutsch** gepflegt, bis eine Rechtsübersetzung vorliegt.
- Plugins: `@sanity/document-internationalization` (Dokumentebene) und `sanity-plugin-internationalized-array` (Feldebene) sind dafür verbreitet. Aktuellen Stand, Kompatibilität mit der Studio-Version und Alternativen vor der Wahl prüfen.

**2. Strukturierte Daten statt Strings**

- Maße (`height`, `diameter`), Glasur, Ofen, Jahr getrennt speichern und in der Anzeige je Sprache formatieren (Dezimalpunkt, Reihenfolge, Einheiten). Das löst die Mischformate des Altbestands.
- Datum: ISO-Datum speichern, Anzeige per `Intl.DateTimeFormat` je Locale. Die festen Monatslisten in `sig-aktuell.js` und `sig-buehne.js` entfallen.
- Status (Läuft, Demnächst, Beendet) als Schlüssel plus Übersetzungstabelle, nicht als Text im Skript.

**3. Hilfsmittel**

- **DeepL (Glossar-Funktion)** mit den Begriffen aus Abschnitt 12 für den Erstentwurf langer Texte. Das Glossar erzwingt Begriffe wie „Masterworks“, „bisque firing“, „kumme“.
- **Sanity AI Assist** kann Felder im Studio übersetzen und Anweisungen pro Feld speichern. Ob der Tarif des Projekts das enthält und welche Kosten entstehen, vor Einsatz prüfen. Auf keinen Fall ohne Prüfung für Rechtstexte oder Autorenzitate einsetzen.
- Jeder maschinelle Entwurf braucht eine **menschliche Endkontrolle** durch eine Muttersprachlerin oder einen Muttersprachler mit Fachwissen Keramik. Der Altbestand ist von Alison Gallup übersetzt und lektoriert. Eine Rückfrage, ob sie weiterhin zur Verfügung steht, lohnt.
- Ein Status-Feld je Übersetzung (`machine`, `reviewed`, `approved`) im Schema, damit nur freigegebene EN-Inhalte im Build landen.

**4. Reihenfolge**

1. Altbestand (Spalte `alt`) per Skript in die EN-Felder importieren, Normalisierung nach Abschnitt 0 (Dezimalpunkt, Datum, Uhrzeit, Schreibweisen).
2. UI-Strings und Navigation (Abschnitte 1, 8.1, 11) übersetzen und freigeben lassen. Das ist wenig Text und trägt die ganze Seite.
3. Kerntexte (Startseite, Werkstatt, Meisterstücke, Manufaktur) aus Altbestand plus Vorschlägen von der Werkstatt prüfen lassen.
4. Autorenzitate nur mit geklärten Rechten, bis dahin deutsches Original mit Hinweis „(in German)“ oder ganz weglassen.
5. Rechtsseiten EN: Datenschutz neu übersetzen lassen, AGB nur per Rechtsübersetzung, Impressum nach Abgleich mit der aktuellen DE-Fassung.
6. `hreflang`, EN-Titel und Meta-Beschreibungen, EN-Sitemap, Sprachumschalter pro Seite statt Link auf die Altseite. Dazu eine Weiterleitung `/en/…` der Altseite auf die neuen EN-URLs vorsehen (siehe `SITEMAP-V3.md`, Abschnitt 6).

**5. Offene Fragen an die Werkstatt**

- Amerikanisches Englisch freigeben?
- „Masterworks“ und „Collection“ als Bereichsnamen freigeben?
- Wer ist für die EN-Freigabe zuständig?
- Gibt es englische Fassungen der Aufsätze (Jahn, Catoir, Wagner, Mennekes, Veit) oder der Kataloge, und wem gehören die Rechte?
- Welche Maße stimmen: Dessertschale flach (Ø 15 cm oder Ø 13 cm), Zucker- und Milchgefäß, Krug 0,75 l (Nr. 26a)?
- Wie heißt die Kooperationspartnerin der Pop-up-Schau: „Burggraf Burggraf“ oder „Elena Burggraf-Reusch“?
- Erklärung zum Titel „Kummerschalen“ für die englische Beschreibung.
- Sollen die EN-AGB bestehen bleiben, rechtlich neu übersetzt werden oder entfallen?
- BIC für Auslandsüberweisungen ergänzen?
