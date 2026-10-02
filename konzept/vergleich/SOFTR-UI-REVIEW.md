# UI/UX-Review „KWM Lager“ (Softr), Stand 2. Oktober 2026

Geprüft wurde nur der jeweils oberste neue Block (`#vibe-coding1`). Ich habe mich mit Playwright als Admin durchgeklickt, auf Desktop (1440×900), Tablet (820×1180) und Mobil (390×844). Dabei habe ich nichts gespeichert. Die Quelltexte unter `KWM-softr/konzept/softr/blocks/*.tsx` habe ich nur gelesen.
Screenshots liegen unter `/private/tmp/claude-501/-Users-marc-Documents-GitHub-KWM/d859cdb3-405a-4a67-be94-c0ccabdf4f0c/scratchpad/review/` (Kürzel im Dateinamen: `-d` Desktop, `-t` Tablet, `-m` Mobil). Skripte: `review/r-erfassen.mjs`, `r-bestand.mjs`, `r-tabelle.mjs`, `r-uebersicht.mjs`.
Refero war erreichbar. Die Referenzen stehen am Ende.

---

## 1. Kurzurteil je Seite

| Seite | Urteil | Note (10-Minuten-Verständlichkeit) |
|---|---|---|
| **/erfassen** | Klar gegliedert, große Chips und ein guter Foto-Einstieg. Der Unikat/Editionsware-Umschalter funktioniert. Am Handy verfehlt die Fehlerbehandlung aber das Ziel: Nach „Speichern“ stehen die Fehler 1.400 px weiter oben. Außerdem ist das Formular für die Hauptaufgabe zu lang, weil Admin-Felder (Preis, Website) mitten drin stehen. | **2** |
| **/bestand** | Die Karten sind gut lesbar, Suche und „Schnell ändern“ sind der richtige Ansatz. Drei Dinge trüben das Bild: Die Schnellreiter vermischen drei Dimensionen (Status, Typ, Art). Status und ±1 werden ohne Rückgängig sofort gespeichert. Auf dem Tablet brechen die Namen mitten im Wort um. | **3** |
| **/tabelle** | Der Funktionsumfang ist für Profis gut: Filter „Feld · Bedingung · Wert“, Und/Oder, Spalten, Summen, CSV. Am Handy ist die Seite aber kaum bedienbar, weil Werkzeugleiste und Filterzeilen über 5 bis 8 Zeilen umbrechen. Sogar bei 1440 px scrollt die Tabelle quer, und Preis und Preissumme sind nicht sichtbar. | **3** (für Profis 2, für Neue 4) |
| **/uebersicht** | Ruhig und gut lesbar. Zwei von sechs Kacheln führen ins Leere: „Reserviert“ und „Verkauft“ zeigen „Alle 14“. Es fehlt eine Liste mit Dingen, die zu erledigen sind. Bei den Farben gibt es Konflikte mit dem Status-Farbschema. | **3** |

---

## 2. Befunde nach Priorität

### P1: verwirrt oder blockiert Mitarbeitende bzw. verletzt die Checkliste

**P1-1 · Übersicht · alle Viewports · Kacheln „Reserviert“ und „Verkauft 2026“ führen zum falschen Ziel**
- *Was:* Die Links lauten `/bestand?tab=tabelle&status=reserviert` bzw. `…status=verkauft`. Den Reiter `tabelle` gibt es im Bestand nicht mehr, und den Parameter `status` wertet der Bestand gar nicht aus. Ergebnis gemessen: „14 von 14 Unikaten · aktiver Reiter: Alle 14“.
- *Warum:* Wer auf „2 reserviert“ tippt und 14 Stücke sieht, verliert das Vertrauen in die Zahlen.
- *Vorschlag:* In `uebersicht.tsx` die Links auf `/tabelle?status=reserviert` bzw. `/tabelle?status=verkauft` ändern. `tabelle.tsx` liest `status` schon in `initialConditions()` aus. Besser noch: Im Bestand einen Status-Chip „Reserviert“ ergänzen (siehe P2-1) und dann `/bestand?tab=reserviert` verlinken.
- *Screens:* `review/ueb-02-block-d.png`, `review/ueb-03-nach-kachel-d.png`

**P1-2 · Erfassen · Mobil · Fehlermeldungen nach „Speichern“ sind nicht sichtbar**
- *Was:* Beim Speichern ohne Eingaben bleibt die Seite bei scrollY = 1452. Die drei Fehler (Foto, Name, Typ) stehen ganz oben. Sichtbar ist nur der Toast „Bitte die markierten Felder prüfen.“, und der verdeckt die Softr-Leiste unten.
- *Warum:* Die Mitarbeiterin weiß nicht, *was* fehlt, und muss suchen. Das widerspricht der Checkliste („Fehlermeldungen verständlich“).
- *Vorschlag:* In `submit()` nach `setErrors(e)` das erste fehlerhafte Feld anspringen: `document.getElementById(firstKey)?.scrollIntoView({block:'center'})` plus `focus()`. Achtung: Der Block liegt im Shadow DOM, also über eine `ref` auf den Formular-Wurzelknoten und `root.querySelector('[aria-invalid=true], [data-error]')` suchen. Zusätzlich direkt über dem Button eine Zusammenfassung zeigen: „Es fehlen: Foto, Name, Typ“ (`role="alert"`, `text-destructive`). Den Toast dann weglassen.
- *Screens:* `review/erf-03-fehler-viewport-m.png`, `review/erf-04-fehler-block-m.png`

**P1-3 · Bestand und Tabelle · alle, vor allem Mobil · Schließen-Knopf der Seitenpanels ist englisch und winzig**
- *Was:* Das Standard-X von `SheetContent` hat den Namen „Close“ und misst 16×16 px. Unten im Panel gibt es keinen Knopf zum Schließen. Am Handy deckt das Panel den ganzen Bildschirm ab.
- *Warum:* Das verletzt die Checkliste (Deutsch, mindestens 44 px). Am iPhone ist es der einzige Weg zurück, abgesehen vom Wischen, das niemand kennt.
- *Vorschlag:* `SheetContent` mit `className="… [&>button:last-child]:size-11 [&>button:last-child]:top-3 [&>button:last-child]:right-3"` versehen und das sr-only-„Close“ überschreiben. Falls das nicht geht, das Standard-X ausblenden und im `SheetHeader` einen eigenen `Button variant="ghost" size="icon" className="size-11" aria-label="Schließen"` setzen. Zusätzlich am Ende des Panels einen breiten Knopf „Fertig“ (`h-12 w-full variant="outline"`) ergänzen.
- *Screens:* `review/bes-04-detail-m.png`, `review/tab-07-detail-m.png`

**P1-4 · Bestand · alle · „Schnell ändern“ speichert den Status sofort, ohne Rückgängig**
- *Was:* Ein Tipp auf „verkauft“ speichert sofort und setzt `verkauftAm = heute`. Wer danach auf „verfügbar“ zurückstellt, löscht `verkauftAm` **nicht**, und auch die Galerie bleibt geleert. Es gibt weder Bestätigung noch Rückgängig.
- *Warum:* Am Handy wird beim Scrollen leicht versehentlich getippt. Ein falsches „verkauft“ verfälscht Umsatz und Bestand und ist für Laien nicht vollständig rückgängig zu machen.
- *Vorschlag:* In `changeStatus()` den alten Zustand merken (`status`, `verkauftAm`, `galerie`) und `toast.success("Status: verkauft", { action: { label: "Rückgängig", onClick: () => quickSave(alt, "Rückgängig gemacht") }, duration: 6000 })` zeigen. Wird ein Status ungleich „verkauft“ gesetzt, `verkauftAm: null` mitschicken. *Referenz:* MonoDesk „Mark complete“ mit Undo-Toast.
- *Screen:* `review/bes-05-detail-unten-m.png`

**P1-5 · Bestand / Editionsware · Mobil · ±1 speichert sofort, ohne Rückmeldung und ohne Rückgängig**
- *Was:* `adjustEdition` schreibt sofort, zeigt keinen Toast und kein Rückgängig. Die Knöpfe liegen dicht untereinander, nämlich zehn Karten mit je zwei Knöpfen von 44 px.
- *Warum:* Beim Scrollen am iPhone wird schnell auf „–“ getippt, und dann stimmt der Bestand unbemerkt nicht mehr.
- *Vorschlag:* Nach jedem Schreiben `toast("Becher „Salbei“ · Seladon: 18 → 17", { action: { label: "Rückgängig", … } })` zeigen. Die Zahl kurz hervorheben (`transition-colors bg-amber-50`). *Referenz:* Shopify iOS „Adjust inventory“: Dort wird die Menge mit Stepper eingestellt, ein Grund gewählt und erst dann gespeichert.
- *Screen:* `review/bes-08-edition-block-m.png`

**P1-6 · Bestand · Tablet 820 px · Namen brechen mitten im Wort um, Badge stößt an den Kartenrand**
- *Was:* Neben der festen Softr-Seitenleiste bleiben rund 500 px. `sm:grid-cols-2` ergibt Karten von etwa 240 px, und `break-words` erzeugt „Aschenglas|ur“, „Pflaumenblü|te“ und ein allein stehendes „““. Das Badge „in Kommission“ berührt den rechten Rand.
- *Warum:* Das widerspricht der Checkliste (keine abgeschnittenen Texte) und sieht unfertig aus. Das Tablet ist ein Hauptgerät.
- *Vorschlag:* Das Grid an der Breite des Containers statt am Viewport ausrichten: `grid grid-cols-[repeat(auto-fill,minmax(19rem,1fr))] gap-3`. Für den Namen `hyphens-auto` statt `break-words` verwenden (Block-Wurzel mit `lang="de"`). Das Thumbnail bei schmalen Karten auf `w-20 h-20` setzen.
- *Screen:* `review/bes-01-start-t.png`

**P1-7 · Bestand · Mobil · abgeschnittene Texte**
- *Was:* (a) Platzhalter der Suche: „Name, Inventarnummer, Glasur … such“. (b) Lagerorte in den Editionszeilen: „Regal C – Roh…“, „Regal A – Sch…“. (c) Modellnamen umbrechen über drei Zeilen („Becher / „Salbei“ 300 / ml“), weil der Stepper 140 px belegt.
- *Warum:* Das widerspricht der Checkliste. Gerade der Lagerort ist die Information, die man beim Suchen braucht.
- *Vorschlag:* (a) Kürzerer Platzhalter: „Suchen: Name, Nummer, Glasur“. (b, c) `EditionRow` auf Mobil zweizeilig aufbauen: `flex-col sm:flex-row`. Oben Thumbnail mit Name, Badge und Lagerort, ohne `truncate`. Darunter rechtsbündig der Stepper `– 18 +`.
- *Screens:* `review/bes-01-start-m.png`, `review/bes-08-edition-block-m.png`

**P1-8 · Erfassen und Bestand · alle · Die Markenfarbe Blau als „ausgewählt“ widerspricht dem Status-Farbschema**
- *Was:* Ein aktiver Chip ist immer `bg-primary` in Dunkelblau, also auch „verfügbar“ (eigentlich grün). Blau bedeutet laut Vorgabe aber „in Kommission“. Im Detailpanel steht oben ein grünes Badge „verfügbar“ und darunter derselbe Status als blauer Chip.
- *Warum:* Farben sollen Status bedeuten. Hier sagt dieselbe Farbe zweierlei.
- *Vorschlag:* Status-Chips (Erfassen → Status, Detail → Schnell ändern) im aktiven Zustand mit der Statusfarbe füllen. Zum Beispiel aktiv verfügbar `bg-emerald-600 text-white border-emerald-600`, reserviert `bg-amber-400 text-amber-950`, verkauft `bg-zinc-500 text-white`, in Kommission `bg-sky-600 text-white`. Dazu ein `Check`-Icon, damit der Zustand nicht nur über die Farbe erkennbar ist. Das doppelte Badge über „Schnell ändern“ entfernen. `bg-primary` bleibt für Typ, Glasur und Aktionen.
- *Screens:* `review/erf-01-start-d.png`, `review/bes-04-detail-m.png`

**P1-9 · Erfassen · alle · Schalter „Auf Website zeigen“ ist zu klein und kaum sichtbar**
- *Was:* Der Switch misst 32×18 px. Ausgeschaltet ist er hellgrau auf Weiß und praktisch unsichtbar (siehe `erf-03-fehler-viewport-m.png`).
- *Warum:* Das widerspricht der Checkliste (Tippfläche, Kontrast).
- *Vorschlag:* Die ganze Zeile als `<label>` klickbar machen (`htmlFor` bzw. die Zeile als Button mit `role="switch"`) und dem Switch `className="scale-125 data-[state=unchecked]:bg-zinc-300"` geben. Noch besser ist der Vorschlag in P2-6: Das Feld gehört nicht in das Formular für Mitarbeitende.

**P1-10 · Bestand · Mobil · „Schnell ändern“ liegt unter einem großen Foto, der Lagerort unter dem Falz**
- *Was:* Das Foto ist rund 320 px hoch, „Schnell ändern“ beginnt bei y ≈ 500, der Lagerort erst bei ≈ 745 von 844 px.
- *Warum:* Status und Lagerort sind die Hauptaufgabe. Beides muss ohne Scrollen erreichbar sein.
- *Vorschlag:* Im `UnikatDetail` diese Reihenfolge verwenden: Titel → „Schnell ändern“ → Foto (`max-h-56`) → Fakten. Alternativ das Foto als 96-px-Thumbnail neben den Titel setzen und per Tipp vergrößern.
- *Screen:* `review/bes-04-detail-m.png`

### P2: deutlich besser

**P2-1 · Bestand · alle · Die Schnellreiter mischen Status, Typ und Art**
- *Was:* „Alle · Verfügbar · Schalen · Vasen · Teller · In Kommission · Editionsware“. Becher, Karaffe, Obertopf und Krug fehlen, „Reserviert“ und „Verkauft“ auch. „Editionsware“ tauscht das ganze Seitenmodell aus (andere Liste, andere Filter, andere Zählzeile).
- *Warum:* Neue Nutzerinnen erwarten, dass Reiter gleichartige Dinge filtern. Wer „Schalen“ wählt und dann „verfügbar“ will, findet keine Kombination.
- *Vorschlag:* Oben derselbe Umschalter wie im Erfassen: Segment „Unikate | Editionsware“, damit beide Seiten dasselbe Denkmodell haben. Darunter eine Zeile mit Status-Chips in Statusfarbe: „Im Haus“ (Standard, verfügbar + reserviert) · Verfügbar · Reserviert · In Kommission · Verkauft. Daneben ein kompaktes `select` „Alle Typen ▾“. Die Typen kommen aus `useFieldOptions` und sind nicht fest verdrahtet.
- *Screen:* `review/bes-01-start-d.png`

**P2-2 · Bestand · alle · „Alle“ zeigt verkaufte Stücke mit „Kein Lagerort“**
- *Was:* Verkaufte Stücke stehen gleichrangig zwischen den vorrätigen, zum Beispiel Teller „Aschenglasur“ und Vase „Stille“, jeweils mit „Kein Lagerort“.
- *Warum:* Bei der Frage „Wo ist das Stück?“ stören sie. „Kein Lagerort“ klingt dort wie ein Fehler.
- *Vorschlag:* Standardfilter „Im Haus“ (siehe P2-1). Bei verkauften Karten statt des Lagerorts „verkauft am 12.09.2026“ zeigen, die Karte mit `opacity-70`.

**P2-3 · Bestand · Mobil · Der Kopfbereich frisst den halben Bildschirm**
- *Was:* „Alles als Tabelle“ und „CSV-Export“ stehen untereinander, darunter Reiter, Suche und Sortierung. Die erste Karte beginnt erst bei y ≈ 405 von 780 sichtbaren px.
- *Vorschlag:* „CSV-Export“ aus dem Bestand entfernen, er gehört in die Tabelle. „Alles als Tabelle →“ als kleinen Textlink rechts neben die Zählzeile setzen. Suche und Sortierung in eine Zeile bringen (`flex gap-2`, die Sortierung als Icon-Button `size-12` mit `ArrowUpDown` und `aria-label="Sortieren"`).
- *Screen:* `review/bes-01-start-m.png`

**P2-4 · Bestand · Mobil · Reiterleiste scrollt quer, ohne dass man es erkennt**
- *Was:* Die Breite beträgt 867 px bei 366 px sichtbarer Fläche. „Teller“, „In Kommission“ und „Editionsware“ liegen unsichtbar rechts.
- *Vorschlag:* Mit P2-1 sinkt die Zahl der Chips. Zusätzlich rechts ein Verlauf `after:absolute after:right-0 after:w-8 after:bg-gradient-to-l after:from-background` als Hinweis, alternativ `flex-wrap`.

**P2-5 · Erfassen · alle · Der Lagerort steht an achter Stelle und ist optional**
- *Was:* Die Reihenfolge ist Foto, Name, Typ, Status, Künstler:in/Jahr, Glasur, Maße, **Lagerort**, Preis …
- *Warum:* Der Lagerort ist die Grundlage für „ein Stück finden“. In der Übersicht haben bereits mehrere Stücke „Kein Lagerort“.
- *Vorschlag:* Den Lagerort direkt nach dem Status platzieren (bei „in Kommission“ wird daraus die Galerie). Den zuletzt gewählten Lagerort und die zuletzt gewählte Künstler:in pro Gerät vorbelegen (`localStorage`, in try/catch). Leer lassen ist erlaubt, löst aber einen weichen Hinweis aus: „Ohne Lagerort ist das Stück später schwer zu finden.“

**P2-6 · Erfassen · alle · Admin-Felder im Formular für Mitarbeitende, Rollen widersprüchlich**
- *Was:* „Preis intern“, „Bildnachweis“ und „Auf Website zeigen“ stehen für alle im Formular. Im Bestand dürfen aber nur Admins „Preis und Website ändern (Admin)“.
- *Warum:* Das Formular ist doppelt so lang wie nötig (2.408 px am Handy), und die Regeln wirken willkürlich.
- *Vorschlag:* Unter Notiz einen einklappbaren Bereich `<details>` „Weitere Angaben (optional)“ mit Maße, Bildnachweis und Notiz. Preis und Website nur für die Admin-Rolle rendern, über dieselbe Prüfung `isAdmin` wie in `bestand.tsx`. *Referenz:* Mela „Add recipe“: Bilder zuerst, nur wenige Pflichtfelder sichtbar.

**P2-7 · Erfassen · Mobil · Der Speichern-Knopf liegt nur ganz unten, hinter der Softr-Leiste**
- *Vorschlag:* Eine feste Aktionsleiste: `sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] sm:bottom-0 bg-background/95 backdrop-blur border-t -mx-4 px-4 py-3`, darin „Speichern“ (h-12) und links die Fehlerzusammenfassung aus P1-2. *Referenz:* Mela, Shopify Produkt bearbeiten (Speichern immer erreichbar).
- *Screen:* `review/erf-04-fehler-block-m.png`

**P2-8 · Erfassen · alle · Beim Wechsel Unikat ↔ Editionsware werden die Fotos still gelöscht**
- *Was:* `onClick` ruft `setFiles([])` auf. Wer zuerst fotografiert und dann merkt, dass es Editionsware ist, verliert das Foto ohne Hinweis.
- *Vorschlag:* Das erste Foto übernehmen (`multiple=false` → `files.slice(0,1)`) oder vorher fragen: „Fotos verwerfen?“.

**P2-9 · Erfassen · alle · Fehler bleiben nach der Korrektur stehen**
- *Was:* Nach Auswahl eines Modells steht weiterhin „Bitte ein Modell wählen.“ da, ebenso „Bitte einen Typ wählen.“ nach Auswahl eines Typs.
- *Vorschlag:* In `setU` und `setE` den Fehler des betroffenen Felds löschen: `setErrors(({[key]:_, ...rest}) => rest)`. Für Fotos genauso in `setFiles`.
- *Screens:* `review/erf-07-edition-glasiert-m.png`, `review/erf-05-neuer-typ-dup-m.png`

**P2-10 · Bestand / Editionsware · alle · Zwei Speichermodelle für dieselbe Zahl**
- *Was:* In der Liste speichert ±1 sofort. Im Detailpanel braucht derselbe Stepper „Änderungen speichern“.
- *Vorschlag:* Im Detailpanel den Stepper ebenfalls sofort speichern lassen (mit Toast und Rückgängig), „Änderungen speichern“ nur für Lagerort und Notiz verwenden. Alternativ in der Liste ± nur vormerken und einen Knopf „Speichern (2 Änderungen)“ einblenden. Wichtig ist, dass beides gleich funktioniert.
- *Screen:* `review/bes-09-edition-detail-m.png`

**P2-11 · Bestand und Übersicht · „knapp“ ist nicht erklärt und unvollständig**
- *Was:* Zahlen unter 5 werden in der Liste ohne Legende bernsteinfarben. „Nachschub nötig“ meldet „Alles ausreichend vorrätig“, obwohl es Karaffe „Quelle“ nur mit 5 Rohlingen und 0 glasierten gibt. Fehlende Varianten zählen nicht als 0.
- *Vorschlag:* Bei knappen Zeilen den Text „knapp“ neben die Zahl setzen (`text-amber-800 text-sm`). Im Modell ein Feld „Mindestbestand“ anlegen (Admin) und je Modell vergleichen, nicht je Zeile. Ein Modell ganz ohne glasierte Variante als „0 glasiert“ melden.
- *Screens:* `review/ueb-02-block-d.png`, `review/bes-08-edition-block-m.png`

**P2-12 · Tabelle · Mobil · Werkzeugleiste und Filter sind kaum bedienbar**
- *Was:* Die Werkzeugleiste belegt fünf Zeilen (CSV, Suche+Filter, Spalten, Ansichten, Ansicht speichern). Jede Filterbedingung bricht auf drei Zeilen um, und das Entfernen-X steht verwaist in einer eigenen Zeile. Die Checkboxen im Werte-Popover haben kaum Kontrast.
- *Vorschlag:* Am Handy den Filter als `Sheet side="bottom"` (`max-h-[85vh]`) öffnen. Je Bedingung eine Karte mit Feld, Bedingung und Wert in voller Breite untereinander, X oben rechts in der Karte. Unten eine feste Leiste „Alles zurücksetzen“ und „Anwenden (4 Treffer)“. Aktive Bedingungen über der Tabelle als entfernbare Chips zeigen („Typ: Schale ✕“, „Preis ≥ 300 ✕“). „Spalten“, „Ansichten“ und „CSV“ in ein Menü „Mehr ⋯“ legen. *Referenzen:* Appwrite „Filters“-Modal (Feld/Operator/Wert, Chips der aktiven Filter, Clear all / Apply), Artsy iOS „Filters“ (Vollbild, Chips, unten „Set Filters“).
- *Screens:* `review/tab-01-start-m.png`, `review/tab-02-filter-leer-m.png`, `review/tab-04-filter-2-m.png`, `review/tab-03-filter-popover-m.png`

**P2-13 · Tabelle · alle · Wichtige Spalten liegen außerhalb des Bildes, auch auf dem Desktop**
- *Was:* Bei 1440 px ist die Tabelle 1198 px breit, sichtbar sind 1030 px. „Preis intern“ und die Preissumme sind nicht zu sehen. Am Handy sieht man nur Foto, Art, Inv.-Nr. und einen angeschnittenen Namen.
- *Vorschlag:* Spaltenreihenfolge: Foto, **Name** (`sticky left-0 bg-card z-[1]`), Status, Lagerort, Anzahl, Preis, Typ, Glasur, Inv.-Nr. „Art“ als kleines Kürzel-Badge in der Namenszelle zeigen („E“ für Edition) statt als eigene Spalte. Die Summenzeile zusätzlich als Text über der Tabelle: „4 Einträge · 4 Stück · 3.260 € intern“.
- *Screen:* `review/tab-04-filter-2-d.png`

**P2-14 · Tabelle · alle · Fachsprache im Filter**
- *Was:* „Wo“ (übersetzt aus Airtables „Where“) und die Operatoren „=, ≠, >, ≥, <, ≤“.
- *Vorschlag:* „Wo“ durch „Zeige, wenn“ ersetzen, die Verknüpfung durch „und zusätzlich“ / „oder“. Zahlen: „ist gleich“, „ist nicht“, „mehr als“, „mindestens“, „weniger als“, „höchstens“. Datum: „am“, „vor dem“, „nach dem“ (passt schon).

**P2-15 · Tabelle · alle · Gespeicherte Ansichten: Duplikate und Löschen ohne Rückfrage**
- *Was:* Im Auswahlfeld steht dreimal „Seladon-Stücke verfügbar ab 2026“. „Ansicht entfernen“ löscht eine Ansicht, die alle Mitarbeitenden sehen, sofort und ohne Bestätigung.
- *Vorschlag:* Beim Speichern doppelte Namen erkennen und „Ansicht „…“ überschreiben?“ anbieten. Entfernen nur für Ersteller:in oder Admin zulassen, mit `AlertDialog` „Ansicht „…“ für alle entfernen?“ oder mit Rückgängig-Toast. „Ansicht speichern“ erst anzeigen, wenn Filter, Spalten oder Sortierung vom Standard abweichen.

**P2-16 · Übersicht · Startseite · Die Mitarbeitenden landen auf dem Dashboard**
- *Was:* `start-weiterleitung.tsx` leitet alle auf `/uebersicht` um. Dort gibt es keine Suche und keinen Knopf „Stück erfassen“.
- *Warum:* Die Hauptarbeit ist Erfassen, Status ändern und Finden. Das Dashboard ist Admin- und Monatsarbeit.
- *Vorschlag:* Je nach Rolle umleiten: Werkstatt nach `/bestand`, Admin nach `/uebersicht`. Oder oben in die Übersicht zwei große Aktionen setzen: „+ Stück erfassen“ (primär) und ein Suchfeld, das nach `/bestand?q=…` springt.

**P2-17 · Übersicht · alle · Es fehlt eine Liste „Zu erledigen“**
- *Was:* Datenprobleme werden nicht als Aufgaben gezeigt. Viele Unikate haben kein Foto, mehrere keinen Lagerort. „2 verkaufte Stücke haben kein Verkaufsdatum“ steht nur als grauer Satz ohne Link.
- *Vorschlag:* Eine Sektion „Zu erledigen“ ganz oben mit klickbaren Zeilen und Zahl: „3 Stücke ohne Lagerort →“, „7 ohne Foto →“, „2 verkauft ohne Datum →“, später auch „reserviert seit über 30 Tagen“. Jede Zeile verlinkt auf eine vorgefilterte Tabelle (`/tabelle?lagerort=leer` usw.; dafür `initialConditions` um `op=empty` erweitern). *Referenz:* Runey-Dashboard (Kennzahlen plus Aufgabenkarte).

**P2-18 · Übersicht · alle · Zu viel Editionsware und doppelte Farbbedeutung**
- *Was:* Die Editionsware erscheint viermal: zwei Kacheln, das Diagramm „je Modell“ und 8 von 10 Einträgen in „Zuletzt“. Im Diagramm ist „glasiert“ blau, also dieselbe Farbe wie „in Kommission“ im Nachbardiagramm, und „Rohlinge“ ist orange. In den Badges sind Rohling Steingrau und glasiert Petrol.
- *Vorschlag:* Die beiden Editionskacheln zu einer zusammenfassen: „Editionsware 200 Stück · 122 Rohlinge · 78 glasiert“. Die Diagrammfarben an die Badges angleichen (Rohling `#a8a29e`/stone-400, glasiert `#0f766e`/teal-700). „Zuletzt“ auf 5 Einträge kürzen und Unikate und Editionsware getrennt zeigen.

### P3: Feinschliff

**P3-1 · Erfassen und Bestand · Desktop · uneinheitliche Schriftgröße in Feldern.** `Input` aus shadcn bringt `md:text-sm` mit. Deshalb ist „z. B. Mondvase“ bzw. „2026“ 14 px groß, die Selects daneben 16 px. Bei allen Inputs `md:text-base` ergänzen. *Screen:* `review/erf-01-start-d.png`

**P3-2 · alle · Groß- und Kleinschreibung der Werte.** „Rohling“ und „glasiert“ (Chips in Erfassen) gegenüber „Rohlinge“ und „Glasiert“ (Filter im Bestand). Einheitlich klein für Zustände (rohling/glasiert) oder einheitlich groß. Das muss in Baserow/Softr an den Optionen gelöst werden, nicht im Code.

**P3-3 · Bestand · Detail · viele „–“.** „Galerie –“, „Verkauft am –“ und „Bildnachweis –“ stehen auch bei Stücken, auf die das nie zutrifft. Leere Fakten ausblenden (`facts.filter(([,v]) => v)`) und am Ende einen Link „Fehlende Angaben ergänzen“ setzen, der „Alle Angaben bearbeiten“ öffnet. *Screen:* `review/bes-05-detail-unten-m.png`

**P3-4 · Erfassen · „+ Neuer Typ“ mit einem vorhandenen Namen.** Die Meldung „„Schale“ gibt es schon. Bitte oben auswählen.“ ist gut. Besser wäre ein Knopf „„Schale“ auswählen“ in der Meldung, der wählt und das Feld schließt. *Screen:* `review/erf-05-neuer-typ-dup-m.png`

**P3-5 · Erfassen · Fachjargon im Hinweis.** „Nur für die spätere Anbindung an die Website.“ ersetzen durch „Eingeschaltet: Das Stück darf später auf der Website erscheinen.“

**P3-6 · Erfassen · Typ-Fehler unter „+ Neuer Typ“.** Die Fehlermeldung steht unter dem gestrichelten Knopf und wirkt, als gehöre sie dazu. `ErrorText` direkt unter die Chips setzen, vor `AddNew`.

**P3-7 · Übersicht · Sprungziele zu ungenau.** „Rohlinge gesamt“ öffnet den Editionsreiter ohne Filter „Rohlinge“. Die Einträge der Editionsware unter „Zuletzt“ führen nur auf den Reiter, nicht zur Zeile. Bestand um `?zustand=Rohling` und `?edition=<id>` erweitern (`initialParam`).

**P3-8 · Tabelle · Detail · Status ohne Farbe.** Im Detailpanel steht „Status / Zustand: verfügbar“ als reiner Text. Dort dasselbe `Badge` wie in der Tabelle verwenden. *Screen:* `review/tab-07-detail-m.png`

**P3-9 · Tabelle · Fußhinweis.** „Tipp: Spaltenkopf antippen …“ steht unter einer bis zu 70vh hohen Tabelle und wird nie gelesen. Als Text unter der Überschrift setzen oder ganz weglassen. Die Pfeile an sortierbaren Köpfen dauerhaft blass zeigen (`ArrowUpDown opacity-40`).

**P3-10 · Bestand · Sortierung „Preis absteigend“.** Am Handy steht sie in der Mitte der Sortierliste. Wer mit Lagerort sucht, braucht eher „Lagerort“ und „Name A–Z“. Reihenfolge: Neueste zuerst, Name A–Z, Lagerort, Inventarnummer, Preis.

---

## 3. Informationsarchitektur

**Aufteilung Erfassen / Bestand / Tabelle / Übersicht: grundsätzlich richtig, mit zwei Korrekturen.**
- *Erfassen* (schreiben), *Bestand* (finden und schnell ändern) und *Tabelle* (freie Auswertung) sind sauber getrennt. Das trifft die Leitfrage: einfach für alle, volle Funktion für die, die wollen.
- **Korrektur 1, Navigation:** In der Softr-Navigation fehlt „Tabelle“ (Seitenleiste und Leiste unten zeigen nur Erfassen, Bestand, Übersicht). Das ist für die 10-Minuten-Regel richtig. Dann muss der Link im Bestand aber gut sichtbar sein (siehe P2-3), und die Tabelle braucht oben einen Link „← Zurück zum Bestand“. Auf dem Desktop darf „Tabelle“ als vierter Punkt in die Seitenleiste.
- **Korrektur 2, Startseite:** Für Mitarbeitende `/bestand` als Start (siehe P2-16), die Übersicht für den Admin bzw. als dritter Punkt.
- **Doppelte Funktionen abbauen:** CSV gibt es im Bestand und in der Tabelle. Nur in der Tabelle behalten. Das Detailpanel der Tabelle ist schreibgeschützt und verweist auf den Bestand. Das ist konsequent, bitte so lassen.

**Umschalter „Unikat / Editionsware“ oben in Erfassen: sinnvoll, bitte beibehalten.** Die beiden Arten haben völlig verschiedene Felder (Foto/Name/Typ gegenüber Modell/Zustand/Anzahl). Ein Segment-Umschalter ganz oben ist die richtige Entscheidung, die vor allem anderen fällt. Verbesserungen:
1. Unter jedes Segment eine Zeile Erklärung (`text-xs text-muted-foreground`): „Unikat: Einzelstück mit Inventarnummer“ bzw. „Editionsware: Serienteil, wird gezählt“. Das Wort „Editionsware“ kennen Neue nicht.
2. Die letzte Wahl je Gerät merken. Wer an einem Tag 30 Becher einbucht, will nicht jedes Mal umschalten.
3. Dasselbe Segment im Bestand verwenden statt des Reiters „Editionsware“ (siehe P2-1), damit es in der ganzen App ein gemeinsames Modell gibt.
4. Fotos beim Wechsel nicht still löschen (siehe P2-8).

**Dashboard: was fehlt, was zu viel ist**
- *Fehlt:* „Zu erledigen“ (siehe P2-17), Schnellaktionen „Stück erfassen“ und Suche (siehe P2-16). Optional: „Reserviert für wen, seit wann“, dafür fehlen heute die Felder.
- *Zu viel:* zwei Editionskacheln, das Diagramm „Unikate nach Typ“ bei 14 Stücken (jede Zeile 1 Stück, also kaum Aussage) und 10 Einträge unter „Zuletzt“. Vorschlag: Das Typ-Diagramm erst ab etwa 50 Unikaten zeigen oder durch eine einfache Zählzeile ersetzen.
- *Falsch:* zwei kaputte Kachel-Links (siehe P1-1) und die Farbkonflikte (siehe P2-18).

---

## 4. Hinweise für den Admin (nicht im Code lösbar)

- **Softr-Badge „Made with softr“** überdeckt am Handy Inhalte, etwa Status-Chips und Diagrammzeilen. Lösung über den Softr-Tarif oder die Einstellungen. Löschen und Kosten sind Admin-Entscheidungen.
- **Testdaten** liegen im echten Bestand: „Test-Krug „Playwright““, „Test-Schale „Playwright““, der Typ „Krug“ und dreimal die Ansicht „Seladon-Stücke verfügbar ab 2026“. Sie verfälschen Zähler und „Zuletzt“. Bitte bereinigen (Löschen = Admin).
- **Datenlücken:** viele Unikate ohne Foto, mehrere ohne Lagerort, 2 verkaufte ohne Datum. Deshalb zeigt „Verkauft 2026“ 0 und „Umsatz 0 €“.
- **Konsolenfehler** „`DialogContent` requires a `DialogTitle`“ tritt im Bestand und in der Tabelle auf. Die Sheets der neuen Blöcke haben einen `SheetTitle`. Vermutlich stammt der Fehler aus den alten Blöcken darunter und verschwindet mit deren Löschung. Danach erneut prüfen.
- **Seitenleiste auf dem Tablet:** Die feste Softr-Leiste von 280 px nimmt bei 820 px ein Drittel der Breite. Wenn Softr es erlaubt, die Leiste unterhalb von 1024 px einklappen oder auf die Leiste unten umstellen.

---

## 5. Refero-Referenzen

| Referenz | Wofür |
|---|---|
| Shopify iOS · Bestand anpassen (Stepper, Grund, Übersicht) · https://refero.design/screens/91ce0a5a-7b18-46a6-a06c-5698b6fce337 | P1-5, P2-10: Mengenänderung bewusst bestätigen statt still speichern |
| Appwrite · Filters-Modal (Feld/Operator/Wert, Filter-Chips, „Clear all / Apply“) · https://refero.design/pages/0c000937-bc1a-4288-8c84-5b7f6dc6f660 | P2-12, P2-14: Filter-Builder gebündelt, aktive Filter als Chips |
| Artsy iOS · Filters (Vollbild, Chips, Knopf unten) · https://refero.design/screens/55b1dae4-4a59-4a0c-9a30-08edcc1bd8ad | P2-12: Filter am Handy als eigenes Sheet mit „Anwenden“ |
| Mela iOS · Rezept anlegen (Bilder zuerst, Cancel/Save immer sichtbar) · https://refero.design/screens/6c962602-5025-41b1-9242-f79ab6a5c80f | P2-6, P2-7: kurzes Pflichtformular, Speichern immer erreichbar |
| MonoDesk · Aufgabe erledigt mit Undo-Toast · https://refero.design/pages/40328ed9-2806-4791-9063-35c5dd8d3497 | P1-4, P1-5: sofort speichern nur mit „Rückgängig“ |
| Runey · Dashboard mit Kennzahlen und Aufgaben · https://refero.design/pages/8ad3187f-c4ce-484a-8762-d09f5d68ce94 | P2-17: „Zu erledigen“ neben den Kennzahlen |

---

## 6. Die 10 wichtigsten Punkte

1. **Kachel-Links reparieren** („Reserviert“ und „Verkauft“ zeigen alle 14 Stücke). Auf `/tabelle?status=…` umstellen. (P1-1)
2. **Fehler im Erfassen am Handy sichtbar machen:** zum ersten Fehler springen, Zusammenfassung „Es fehlen: …“ am Knopf. (P1-2)
3. **Rückgängig für sofortige Änderungen:** Status-Chips und ±1 mit Undo-Toast, bei „verkauft“ das Datum korrekt zurücksetzen. (P1-4, P1-5)
4. **Schließen-Knopf der Panels:** deutsch, 44 px, zusätzlich „Fertig“ unten. (P1-3)
5. **Tablet-Karten:** Grid nach Containerbreite, `hyphens-auto` statt Umbruch mitten im Wort. Am Handy Editionszeilen zweizeilig, nichts abschneiden. (P1-6, P1-7)
6. **Status-Farben konsequent:** aktive Status-Chips in Statusfarbe statt Markenblau, Diagrammfarben angleichen. (P1-8, P2-18)
7. **Bestand neu ordnen:** Segment „Unikate | Editionsware“ wie im Erfassen, Status-Chips mit Standard „Im Haus“, Typ als Auswahl. Detail: „Schnell ändern“ über das Foto. (P2-1, P2-2, P1-10)
8. **Erfassen verkürzen:** Lagerort nach oben und vorbelegen, Preis und Website nur für den Admin, Rest unter „Weitere Angaben“, Speichern-Leiste fest unten. (P2-5, P2-6, P2-7, P1-9)
9. **Tabelle am Handy:** Filter als Bottom-Sheet mit Chips und „Anwenden“, Name als feste erste Spalte, Klartext statt „Wo“ und „≥“, keine doppelten Ansichten und kein Löschen ohne Rückfrage. (P2-12 bis P2-15)
10. **Start und Dashboard:** Mitarbeitende starten im Bestand. Die Übersicht bekommt „Zu erledigen“ (ohne Lagerort, ohne Foto, verkauft ohne Datum) und weniger Editionswiederholung. (P2-16, P2-17)
