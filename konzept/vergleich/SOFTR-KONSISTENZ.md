# KWM Lager: Konsistenzprüfung der Logik

Stand 02.10.2026. Geprüft wurden `erfassen.tsx`, `bestand.tsx`, `bestand-admin.tsx`, `tabelle.tsx`, `uebersicht.tsx` und `start-weiterleitung.tsx` im Code. Zusätzlich habe ich die Tabellenstruktur und die Datensätze der Datenbank gelesen (nur lesend, nichts geändert). Die Oberfläche selbst habe ich nicht geöffnet (kein `PREVIEW_URL`). Zeilennummern beziehen sich auf den Stand im Branch `claude/softr-lager-app`.

Aufbau: 27 Befunde, nach Priorität sortiert (hoch 4, mittel 14, niedrig 9). Am Ende steht eine Liste der Stellen, die ich geprüft habe und die in Ordnung sind.

## Übersicht Statuswechsel (Ist-Zustand)

| Wechsel | Status | Partner | Außer Haus seit | Rückgabe bis | Verkauft am | Lagerort |
|---|---|---|---|---|---|---|
| Bestand, Schnell: beliebig → in Kommission/ausgestellt | gesetzt | bleibt leer, wird nachgewählt | heute (nur wenn vorher im Haus) | bleibt | geleert | unverändert (Befund 1) |
| Bestand, Schnell: Außer Haus → verfügbar/reserviert | gesetzt | geleert | geleert | geleert | geleert | unverändert, bleibt "Außer Haus" (Befund 1) |
| Bestand, Schnell: → verkauft | gesetzt | geleert (Befund 15) | geleert | geleert | heute (UTC, Befund 12) | unverändert (Befund 1) |
| Erfassen mit Status in Kommission/ausgestellt | gesetzt | wählbar, nicht Pflicht | nie gesetzt (Befund 3) | nicht erfassbar | – | frei wählbar |
| Erfassen mit Status verkauft | gesetzt | – | – | – | nie gesetzt (Befund 3) | frei wählbar |
| "Alle Angaben bearbeiten" | unverändert | wird mit altem Formularstand überschrieben (Befund 2) | – | – | – | – |
| Admin-Panel | – | – | – | – | nur bei verkauft änderbar | – |

---

## Hohe Priorität

### 1. Status und Lagerort sind nicht gekoppelt, in keiner Richtung (Beispiel des Auftraggebers)
- **Stelle:** `bestand.tsx` `changeStatus` (Z. 507–520) und Lagerort-Auswahl (Z. 597–607); `erfassen.tsx` Status-Chips (Z. 661–671) und Lagerort-Auswahl (Z. 673–682).
- **Was passiert:** Beim Wechsel auf "in Kommission" oder "ausgestellt" bleibt der alte Lagerort stehen. Beim Rückweg (Stück kommt zurück, Status wird "verfügbar") bleibt "Außer Haus" als Lagerort stehen, obwohl das Stück wieder im Haus ist. Bei "verkauft" bleibt das Regal eingetragen, obwohl das Stück weg ist. Die Lagerort-Auswahl bietet "Außer Haus" auch für Stücke im Haus an. In den echten Daten ist das schon sichtbar: U-2026-003 ist "ausgestellt" bei Galerie Nord, hat aber den Lagerort "Vitrine Eingang". In der Tabelle zeigt der Lagerort-Filter "Außer Haus" dann 6 Stücke, der Status-Filter (Kommission/ausgestellt) 7 Stücke. Die Übersicht "Zu erledigen: Ohne Lagerort" erkennt den Rückweg nicht, weil dort "Außer Haus" ja ein gültiger Lagerort ist.
- **Erwartet:**
  - Hinein: Status außer Haus setzt den Lagerort auf "Außer Haus".
  - Zurück: Der Lagerort "Außer Haus" wird geleert, damit die Aufgabe "Ohne Lagerort" erscheint (oder die Werkstatt wählt direkt den neuen Ort).
  - Verkauft: Lagerort leeren oder bewusst belassen (Rückfrage an die Werkstatt, ob verkaufte Stücke bis zur Abholung am Ort bleiben).
  - Die Auswahl bietet "Außer Haus" nur bei den Status Kommission/ausgestellt an. Bei diesen Status ist der Lagerort gesperrt.
- **Vorschlag:**
```ts
const AUSSER_HAUS_ORT = "Außer Haus";
const ausserHausId = lagerorte.find((l) => l.label === AUSSER_HAUS_ORT)?.id;

function changeStatus(status: string) {
  // ...
  const nowOut = isAusserHaus(status);
  const wasOut = isAusserHaus(u.status);
  if (nowOut && ausserHausId) fields.lagerort = [ausserHausId];
  if (!nowOut && u.lagerort?.id === ausserHausId) fields.lagerort = [];   // Rückkehr: Ort neu wählen
  before.lagerort = link(u.lagerort?.id);                                  // gehört auch in "Rückgängig"
}
// Lagerort-Select: options={lagerorte.filter((l) => isAusserHaus(u.status) ? l.id === ausserHausId : l.id !== ausserHausId)}
```
  Dasselbe in `erfassen.tsx` beim Absenden: bei Kommission/ausgestellt `lagerort: [ausserHausId]`, sonst "Außer Haus" aus den Optionen entfernen. Ein Knopf "Zurück im Haus" im Panel (Status verfügbar plus Lagerort wählen in einem Schritt) wäre der saubere Rückweg.
- **Priorität:** hoch

### 2. "Alle Angaben bearbeiten" überschreibt den Partner mit dem alten Stand
- **Stelle:** `bestand.tsx` `UnikatDetail`, Formularstart (Z. 466–478) und `saveAll` (Z. 545: `galerie: isAusserHaus(u.status) ? link(form.galerieId) : []`).
- **Was passiert:** Das Formular übernimmt `galerieId` nur einmal beim Öffnen des Panels und hat gar kein Partner-Feld. Der Ablauf "Panel öffnen, Schnell ändern: Status auf in Kommission, Partner wählen, dann Alle Angaben bearbeiten, Name ändern, Speichern" schreibt `galerie: []` zurück. Der Partner ist weg, ohne Hinweis. Genauso wird ein im Schnellbereich geänderter Partner durch den alten Wert ersetzt.
- **Erwartet:** Das Bearbeitungsformular fasst Felder nicht an, die es nicht anbietet.
- **Vorschlag:** `galerie` und `galerieId` aus `EditForm` und `saveAll` streichen. Der Partner wird nur im Schnellbereich gepflegt.
- **Priorität:** hoch

### 3. Erfassen mit Status "verkauft", "in Kommission" oder "ausgestellt" lässt die Folgefelder leer
- **Stelle:** `erfassen.tsx` `submit` (Z. 533–552), Felder Z. 27–43.
- **Was passiert:**
  - Status "verkauft" beim Erfassen setzt kein "Verkauft am" (im Bestand wird es automatisch gesetzt). Das Stück landet in "Zu erledigen: Verkauft ohne Datum" und zählt nicht zu "Verkauft {Jahr}". In den echten Daten sind U-2026-009 und U-2026-012 genau so.
  - Status "in Kommission" oder "ausgestellt" beim Erfassen setzt weder "Außer Haus seit" noch bietet das Formular "Rückgabe bis" an. Im Bestand wird "seit" nur beim Übergang von "im Haus" zu "außer Haus" gesetzt (Z. 511), also wird es für ein so erfasstes Stück nie nachgetragen.
- **Erwartet:** Erfassen verhält sich wie der Statuswechsel im Bestand. Dieselbe Funktion, nicht zwei Kopien.
- **Vorschlag:** Die Folgefelder-Logik aus `changeStatus` in eine gemeinsame Funktion `statusFolgen(vorher, nachher)` auslagern (jede Block-Datei ist eigenständig, also in beiden Dateien identisch halten oder die Regel im Erfassen so nachbauen):
```ts
const folgen = {
  verkauftAm: status === VERKAUFT ? today() : undefined,
  seit: isAusserHaus(status) ? today() : undefined,
};
```
  Zusätzlich im Formular bei Kommission/ausgestellt das Feld "Rückgabe bis" anzeigen und "Partner" zur Pflicht machen oder zumindest nachfragen.
- **Priorität:** hoch

### 4. Preis wird in Erfassen anders gelesen als im Admin-Panel
- **Stelle:** `erfassen.tsx` Z. 501 und 534 (`Number(preis.replace(",", "."))`) gegen `parseNumber` in `bestand-admin.tsx` Z. 34–38 und `tabelle.tsx` Z. 236–240 (entfernt zuerst alle Punkte).
- **Was passiert:** Die Eingabe "1.200" ergibt im Erfassen 1,2 €, im Admin-Panel 1200 €. "1.200,50" wird im Erfassen als Fehler abgelehnt, im Admin-Panel akzeptiert. Außerdem sind negative Preise und "1e3" erlaubt.
- **Erwartet:** Eine Regel für alle Seiten: deutsche Schreibweise (Punkt als Tausendertrenner, Komma als Dezimalzeichen), nur positive Zahlen. Das Feld "Preis intern" hat Genauigkeit 0, also am besten auf ganze Euro runden und das anzeigen.
- **Vorschlag:** `parseNumber` mit Prüfung `n >= 0` überall verwenden, im Erfassen statt der Inline-Rechnung. Fehlermeldung "Bitte einen Betrag wie 1.200 oder 480,50 eingeben."
- **Priorität:** hoch

---

## Mittlere Priorität

### 5. "Außer Haus seit" kann nirgends gepflegt oder angesehen werden
- **Stelle:** `bestand.tsx` Schnellbereich (Z. 609–638) hat nur Partner und "Rückgabe bis"; `tabelle.tsx` `unikatSelect` (Z. 15–37) und `COLUMNS` (Z. 121–141) haben kein "seit"; beide CSV-Exporte (`bestand.tsx` Z. 290–312, `tabelle.tsx` Z. 409–441) lassen "seit" und "Rückgabe bis" weg.
- **Was passiert:** Das Feld wird nur automatisch auf "heute" gesetzt. Wer ein Stück rückwirkend außer Haus einträgt, kann das Datum nicht korrigieren. In der Tabelle gibt es keine Spalte und keinen Filter "seit", und der Export verliert beide Daten.
- **Erwartet:** Datum in Schnellbereich änderbar, Spalte und Filter in der Tabelle, beide Daten im CSV.
- **Vorschlag:** Neben "Rückgabe bis" ein zweites Datumsfeld "Außer Haus seit". In `tabelle.tsx` `seit: "Evxm2"` ergänzen, Spalte `{ key: "seit", label: "Außer Haus seit", type: "date", ... }`, im CSV beide Felder.
- **Priorität:** mittel

### 6. Kachel "Verkauft {Jahr}" zählt anders als die Seite, auf die sie verweist
- **Stelle:** `uebersicht.tsx` Z. 303 und Z. 444 (`href="/tabelle?status=verkauft"`).
- **Was passiert:** Die Kachel zählt nur Stücke mit Verkaufsdatum im laufenden Jahr. Der Link öffnet die Tabelle mit allen verkauften Stücken, aller Jahre und auch solcher ohne Datum. Die Zahl auf der Kachel und die Zeilenzahl in der Tabelle passen nicht zusammen (in den echten Daten: Kachel 0, Tabelle 2).
- **Erwartet:** Gleiche Menge oder ein Hinweis.
- **Vorschlag:** Link mit zweiter Bedingung `?status=verkauft&verkauftAm=2026` (in `initialConditions` als `after`/`before` auf 01.01. und 31.12. auswerten) oder die Kachel umbenennen in "Verkauft (gesamt)" mit Unterzeile "davon {n} in {Jahr}".
- **Priorität:** mittel

### 7. Zähler der Editionsware rechnen je nach Stelle in Zeilen oder in Stück
- **Stelle:** `bestand.tsx` Z. 987 (Kopfzeile), Z. 934 (Tab-Zähler); `uebersicht.tsx` Z. 313–314, 421.
- **Was passiert:**
  - Kopfzeile im Bestand: "{gefilterte Zeilen} Zeilen · {alle Rohlinge} Rohlinge · {alle glasiert} glasiert". Die Zeilen folgen Filter und Suche, die Summen nicht. Bei aktivem Filter "Rohlinge" steht dort z. B. "5 Zeilen · 122 Rohlinge · 78 glasiert".
  - Der Tab "Editionsware 10" zählt Zeilen, die Übersicht nennt "Stück" (122 + 78).
  - Der Tab "Alle" des Bestands zählt Unikate, der Tab "Editionsware" Zeilen: zwei Einheiten nebeneinander.
- **Erwartet:** Eine Einheit je Zahl, und Summen folgen demselben Filter wie die Liste.
- **Vorschlag:** Summen aus `visibleEdition` berechnen, Tab-Zähler als Stückzahl ("Editionsware 218 Stück") oder Zeile weglassen:
```ts
const rohlinge = visibleEdition.filter((e) => e.zustand === ROHLING).reduce((n, e) => n + e.anzahl, 0);
```
- **Priorität:** mittel

### 8. "Bestand", "Außer Haus" und "verfügbar" bedeuten je nach Seite etwas anderes
- **Stelle:** `uebersicht.tsx` Z. 421 (Kopfzeile), Z. 534 ("Unikate im Bestand, ohne verkaufte"); `bestand.tsx` Tab "Alle" (Z. 143) und Z. 987; `erfassen.tsx` Z. 552 ("ist im Bestand").
- **Was passiert:**
  - "14 Unikate" in der Übersicht und "14 von 14 Unikaten" im Bestand enthalten verkaufte Stücke, das Diagramm "im Bestand" nicht. Der Bestand-Tab "Alle" enthält verkaufte Stücke (und die Meldung nach dem Erfassen sagt "ist im Bestand").
  - "Außer Haus" ist an drei Stellen definiert: Status (Tab, Kachel), Lagerort "Außer Haus" (Tabelle, Auswahl) und Partner gesetzt (Unterzeile "bei N Partnern"). Die Unterzeile zählt nur Stücke mit Partner und weicht von der Kartenzahl ab, wenn Stücke "Ohne Partner" dabei sind.
  - "Verfügbar" ist überall nur der Status "verfügbar" (einheitlich), "reserviert" taucht in keiner Summe als Bestand im Haus auf.
- **Erwartet:** Eine Definition je Begriff, im Code als Konstanten und in der Oberfläche beschriftet.
- **Vorschlag:** "Unikate" in der Kopfzeile als "{n} Unikate, davon {m} verkauft" ausweisen. "Außer Haus" ausschließlich über den Status definieren (mit Befund 1 deckt sich dann der Lagerort). Unterzeile "bei {n} Partnern, {k} ohne Partner".
- **Priorität:** mittel

### 9. Links auf Editionsware öffnen nur den Tab, nicht die Zeile; Kacheln setzen keinen Filter
- **Stelle:** `uebersicht.tsx` Z. 445–446 (Kacheln), Z. 552 (Nachschub), Z. 399 (Zuletzt); `tabelle.tsx` Z. 569 ("Im Bestand bearbeiten"); `bestand.tsx` liest nur `tab` und `id` (Z. 887–893), `editionId` startet immer leer.
- **Was passiert:** "Rohlinge gesamt" und "Glasierte Editionsware" führen beide auf dieselbe ungefilterte Liste. Ein Eintrag unter "Nachschub nötig" öffnet die Liste, nicht den Eintrag. Bei Unikaten funktioniert `?id=` dagegen.
- **Erwartet:** Gleiches Verhalten wie bei Unikaten: Klick öffnet genau das, was angeklickt wurde.
- **Vorschlag:** In `bestand.tsx` `?tab=edition&eid=<id>` und `?tab=edition&zustand=Rohling|glasiert` auswerten:
```ts
const [editionId, setEditionId] = useState(() => initialParam("eid"));
const [zustandFilter, setZustandFilter] = useState(() => initialParam("zustand"));
```
  Links in Übersicht und Tabelle entsprechend setzen.
- **Priorität:** mittel

### 10. Tabellenfilter "ist leer" trifft bei Unikat-Feldern alle Editionsware
- **Stelle:** `tabelle.tsx` `matches` (Z. 313–351) und `toEditionRow` (Z. 283–311: `preis: null`, `kuenstler: ""`, `jahr: null`, `masse: ""`, `galerie: ""`, `verkauftAm: ""`).
- **Was passiert:** "Preis ist leer" (gedacht: Unikate ohne Preis) liefert zusätzlich jede Editionszeile. Ebenso "Künstler:in ist leer", "Jahr ist leer", "Verkauft am ist leer", "Rückgabe bis ist leer". "Auf Website ist nein" schließt Editionsware dagegen aus, also uneinheitlich.
- **Erwartet:** Felder, die es bei der Art nicht gibt, sind weder "leer" noch "nicht leer".
- **Vorschlag:** Pro Spalte `appliesTo: ["Unikat"]` hinterlegen. Zeilen anderer Art liefern in `matches` bei `empty` und `notEmpty` `false`:
```ts
if (col.onlyUnikat && r.art !== UNIKAT) return false;
```
- **Priorität:** mittel

### 11. Es gibt keine Umbuchung "Rohling wird glasiert"
- **Stelle:** `bestand.tsx` `EditionRow`/`adjustEdition` (Z. 798–829, 946–967), `erfassen.tsx` Edition-Zweig (Z. 553–575).
- **Was passiert:** Der fachliche Hauptfall der Editionsware (Rohlinge werden glasiert) braucht zwei Schritte auf zwei Seiten: im Bestand bei der Rohling-Zeile minus, im Erfassen bei der glasierten Zeile plus. Dazwischen stimmen die Summen nicht, und ein vergessener Schritt bleibt unbemerkt. Zustand und Glasur einer bestehenden Zeile sind nicht änderbar (Fehleingabe nur über Softr selbst korrigierbar).
- **Erwartet:** Eine Aktion "Glasiert: n Stück" an der Rohling-Zeile, die beide Zeilen im Zug ändert.
- **Vorschlag:** Im Edition-Panel Knopf "Glasieren": Anzahl und Glasur wählen, dann `Rohling.anzahl -= n` und glasierte Zeile erhöhen oder anlegen (gleiche Suche wie `existingRow`). Bei Fehlschlag des zweiten Schritts den ersten zurücknehmen.
- **Priorität:** mittel

### 12. "Heute" wird in UTC bestimmt (Verkaufsdatum und "seit" um einen Tag verschoben)
- **Stelle:** `bestand.tsx` `today()` (Z. 190–192), `uebersicht.tsx` `fristStatus` (Z. 133–138).
- **Was passiert:** `new Date().toISOString().slice(0, 10)` ist das UTC-Datum. Zwischen 0:00 und 1:59 Uhr (Sommerzeit) beziehungsweise 0:00 und 0:59 Uhr (Winterzeit) deutscher Zeit ist das der Vortag. Ein Verkauf in der Silvesternacht landet im alten Jahr und fehlt in "Verkauft {Jahr}". Die Fälligkeit "überfällig/bald" wird in diesem Zeitfenster ebenfalls um einen Tag verschoben.
- **Erwartet:** Lokales Datum (Europe/Berlin).
- **Vorschlag:**
```ts
const today = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date()); // YYYY-MM-DD
```
  In `fristStatus` dieselbe Funktion für "heute" verwenden.
- **Priorität:** mittel

### 13. "Rückgabe bis" speichert bei jeder Eingabe sofort und prüft nichts
- **Stelle:** `bestand.tsx` Z. 628–634 (`onChange` ruft `quickSave`).
- **Was passiert:** Ein Datumsfeld löst beim Eintippen der Jahreszahl mehrere Änderungsereignisse aus (je nach Browser mit Zwischenwerten wie 0002 oder 0202). Jedes davon schreibt sofort und zeigt eine Meldung. Außerdem sind Datum vor "Außer Haus seit" oder in der Vergangenheit erlaubt; das Stück erscheint dann sofort als "überfällig".
- **Erwartet:** Speichern erst nach Abschluss der Eingabe, mit Plausibilitätsprüfung.
- **Vorschlag:** Auf `onBlur` oder einen kleinen Knopf "Datum übernehmen" umstellen. Prüfen: `value >= seit` und Jahr zwischen 2000 und 2100. Bei Datum in der Vergangenheit nachfragen "Das Datum liegt in der Vergangenheit. Trotzdem speichern?".
- **Priorität:** mittel

### 14. Die Liste "Zu erledigen" erkennt die wichtigsten Widersprüche nicht
- **Stelle:** `uebersicht.tsx` `aufgaben` (Z. 345–353).
- **Was passiert:** Es gibt vier Prüfungen. Es fehlen:
  - Außer Haus ohne Partner (die Karte "Ohne Partner" existiert, wird aber nicht als Aufgabe gemeldet).
  - Status passt nicht zum Lagerort ("Außer Haus" bei Stücken im Haus, anderer Ort bei Stücken außer Haus; Befund 1, echtes Beispiel U-2026-003).
  - Unikat ohne Preis (Werkstatt kann keinen Preis erfassen, der Admin hat keine Liste dazu; Wert- und Umsatzsummen sind dadurch zu niedrig).
  - Auf Website zeigen ohne Foto (echte Daten: U-2026-004 und U-2026-011 haben `Auf Website = ja`, aber kein Foto).
  - Doppelte Editionszeilen (gleiches Modell, gleicher Zustand, gleiche Glasur).
- **Erwartet:** Die Aufgabenliste prüft die Regeln des Fachmodells.
- **Vorschlag:**
```ts
{ titel: "Außer Haus ohne Partner", items: unikate.filter((u) => ausser(u) && !u.galerieId) },
{ titel: "Status und Lagerort passen nicht", items: unikate.filter((u) => ausser(u) !== (u.lagerort === "Außer Haus") && u.status !== VERKAUFT) },
{ titel: "Ohne Preis", items: unikate.filter((u) => u.preis === 0 && u.status !== VERKAUFT) },
{ titel: "Website ohne Foto", items: unikate.filter((u) => u.website && !u.foto) },
```
  (`website` muss dafür in `unikatSelect` aufgenommen werden; "Ohne Preis" besser mit `preis: null`, siehe Befund 18.)
- **Priorität:** mittel

### 15. "verkauft" löscht den Partner, auch bei Verkauf über die Galerie
- **Stelle:** `bestand.tsx` Z. 510 (`galerie: [], seit: null, rueckgabe: null`) und Z. 545.
- **Was passiert:** Wer ein Stück aus "in Kommission" auf "verkauft" setzt, verliert die Angabe, über welche Galerie es verkauft wurde. Für die Abrechnung mit der Galerie wäre das genau die wichtige Information. "Rückgängig" stellt den Partner nur für zehn Sekunden wieder her.
- **Erwartet:** Beim Wechsel Kommission zu verkauft bleibt der Partner stehen (Rückgabe und "seit" werden geleert).
- **Vorschlag:**
```ts
if (!isAusserHaus(status) && status !== VERKAUFT) fields.galerie = [];
```
  Die Übersicht zählt verkaufte Stücke nicht zu "Außer Haus"; das passt bereits. Das Feld "Partner" im Panel dann auch bei verkauft anzeigen, wenn gesetzt. Rückfrage an den Auftraggeber, ob das gewünscht ist.
- **Priorität:** mittel

### 16. Editionsware wird beim Erfassen und Buchen auf veraltetem Stand gerechnet
- **Stelle:** `erfassen.tsx` Z. 456–470 und 557–560; `bestand.tsx` `adjustEdition` (Z. 946–967), `EditionDetail` (Z. 867–871).
- **Was passiert:**
  - Das Erfassen lädt nur die ersten 100 Editionszeilen (`count: MAX_EDITION_ROWS`, ohne Seitenwechsel wie in den anderen Blöcken). Bei mehr Zeilen wird eine vorhandene Kombination nicht erkannt und eine Doppelzeile angelegt.
  - Beide Seiten schreiben einen absoluten Wert (`bestehend + n`, `anzahl + delta`) auf Basis der zuletzt geladenen Zahl. Buchen zwei Personen gleichzeitig (Handy im Lager, Rechner im Büro), gewinnt die letzte, die andere Buchung geht verloren. Zwei gleichzeitige Erfassungen derselben Kombination legen zwei Zeilen an.
  - "Rückgängig" setzt ebenfalls den alten absoluten Wert und überschreibt dazwischen erfolgte Buchungen.
- **Erwartet:** Frischer Wert direkt vor dem Schreiben, und die Doppelzeilenprüfung sieht alle Zeilen.
- **Vorschlag:** In `erfassen.tsx` den `useAllPages`-Mechanismus der anderen Blöcke übernehmen. Vor dem Schreiben den Datensatz neu laden (`useRecord`/`refetch`) und `neu = frisch + delta` rechnen. "Rückgängig" als Gegenbuchung (`-delta`) statt als Rücksetzen auf den alten Wert. Die Aufgabe "Doppelte Editionszeilen" (Befund 14) fängt Reste ab.
- **Priorität:** mittel

### 17. Typ-Reiter im Bestand sind fest verdrahtet
- **Stelle:** `bestand.tsx` Z. 142–150 (`Schale`, `Vase`, `Teller`).
- **Was passiert:** Becher, Karaffe, Obertopf und das neue "Krug" haben keinen Reiter und sind nur unter "Alle" zu finden. Die Übersicht kennt dagegen alle Typen (`TYP_ORDER` plus alle weiteren, Z. 319–330). Wird ein Typ über "Neuer Typ" im Erfassen angelegt, kennt ihn der Bestand nicht als Reiter.
- **Erwartet:** Reiter folgen den vorhandenen Typen.
- **Vorschlag:** Typ-Reiter aus `typen` (Feldoptionen) erzeugen, oder die Typen als zweiten Filter (Auswahlfeld) neben der Sortierung anbieten statt als Reiter. Das löst auch den offenen Punkt "Reiter Status vs. Typ ordnen" (P2-1).
- **Priorität:** mittel

### 18. Fehlender Preis zählt in Summen als 0 €, ohne Hinweis
- **Stelle:** `uebersicht.tsx` `num()` (Z. 120–122), `sum` (Z. 304), Wert je Partner (Z. 377, 475); `tabelle.tsx` `summePreis` (Z. 706).
- **Was passiert:** Stücke ohne Preis (Werkstatt kann keinen erfassen) fließen mit 0 € in "Wert verfügbar", "Umsatz" und in den Warenwert je Partner ein. Die Karte zeigt "0 €", als wäre das ein echter Preis. Im Bestand fehlt der Preis auf der Karte dagegen einfach, also uneinheitlich.
- **Erwartet:** Unterzeile "Wert 4.200 €, bei 3 Stücken ohne Preis" und bei Karten ohne Preise "Preis fehlt".
- **Vorschlag:** `preis: number | null` beibehalten und `ohnePreis = list.filter((u) => u.preis === null).length` mitführen und anzeigen.
- **Priorität:** mittel

---

## Niedrige Priorität

### 19. Werkstatt sieht Umsatz und alle Preise (Rückfrage)
- **Stelle:** `uebersicht.tsx` Z. 436–444 (Wert, Umsatz), `bestand.tsx` Z. 423 und 578, `tabelle.tsx` Spalte "Preis intern" (Z. 128) samt Summe.
- **Was passiert:** Die Rechte-Regel beschränkt das Ändern von Preis, Website und Verkaufsdatum auf den Admin. Lesen dürfen alle (das Admin-Panel sagt das auch: "Sehen alle Mitarbeitenden"). Die Übersicht zeigt aber Gesamtumsatz und Warenwerte ungefiltert. Falls "intern" nur für den Admin gilt, passt das nicht. Das Erfassen blendet das Preisfeld für die Werkstatt aus, das spricht eher für "nicht gedacht für die Werkstatt".
- **Erwartet:** Klare Aussage. Rückfrage an den Auftraggeber.
- **Vorschlag:** Wenn nur Admin: `isAdmin` aus `useCurrentUser` (wie im Erfassen) und Wert, Umsatz, Preisspalte und Preissummen ausblenden.
- **Priorität:** niedrig

### 20. Editionsware kann den Lagerort "Außer Haus" haben und zählt trotzdem als Bestand
- **Stelle:** `bestand.tsx` `EditionDetail` (Z. 855–858), `erfassen.tsx` Z. 901–909, `uebersicht.tsx` Z. 313–314, 355.
- **Was passiert:** Für Editionsware gibt es keinen Partner und keine Rückgabe, aber die Lagerort-Auswahl enthält "Außer Haus". Diese Stücke zählen in "Rohlinge gesamt", "Glasierte Editionsware" und beim Nachschub als Vorrat, obwohl sie nicht im Haus sind.
- **Erwartet:** Entweder "Außer Haus" für Editionsware nicht anbieten oder Anzahl mit "davon außer Haus" ausweisen.
- **Vorschlag:** `lagerorte.filter((l) => l.label !== "Außer Haus")` für Editionsware, bis der Auftraggeber entscheidet, ob Editionsware außer Haus erfasst werden soll.
- **Priorität:** niedrig

### 21. Begriffe und Schreibweisen weichen voneinander ab
- **Stellen und Abweichungen:**
  - Partner/Galerie: In Oberfläche und Tabelle steht "Partner", beide CSV-Exporte schreiben die Spalte "Galerie" (`bestand.tsx` Z. 293, `tabelle.tsx` Z. 410). Das Feld im Erfassen heißt "Partner (Galerie, Museum …)", die Übersicht spricht in Texten von Galerien, Museen oder Ausstellungen.
  - Rohling/Rohlinge: Zustand und Badge "Rohling", Filter und Kachel "Rohlinge"; "glasiert" klein (Badge, Legende, Auswahl), "Glasiert" groß (Filter-Chip, `bestand.tsx` Z. 1038), "Glasierte Editionsware" (Kachel).
  - Editionsware/Edition/Editionsbestand: Reiter und Tabelle "Editionsware", Chip in "Zuletzt" "Edition" (`uebersicht.tsx` Z. 402), Dateiname `editionsbestand-…csv`.
  - Einheiten: "Zeilen" (Bestand-Kopf), "Einträge" (Tabelle), "Stück" (Übersicht), "Unikate".
  - "Auf Website zeigen" (Erfassen, Panel) gegen "Auf Website" (Tabelle); "Geändert am" (Unikate) gegen "Zuletzt geändert" (Datenbankfeld der Editionsware).
  - Leerer Lagerort: "Kein Lagerort" (Karte, Panel), "Bitte wählen" (Erfassen), "Ohne Lagerort" (Übersicht).
- **Vorschlag:** Wörterbuch festlegen: "Partner", "Rohlinge"/"glasiert" immer gleich geschrieben (klein bei Zuständen wie bei Status), "Editionsware", "Stück". Zentrale Konstanten je Block oder gemeinsame Beschriftungstabelle in der Übergabe-Doku.
- **Priorität:** niedrig

### 22. Die beiden CSV-Exporte liefern verschiedene Spalten
- **Stelle:** `bestand.tsx` Z. 290–319, `tabelle.tsx` Z. 409–441.
- **Was passiert:** Der Bestand-Export enthält Maße und Verkaufsdatum, der Tabellen-Export zusätzlich Art und Anzahl; beide lassen "Außer Haus seit" und "Rückgabe bis" weg, und der Tabellen-Export hat kein "Bildnachweis". Der Export folgt in der Tabelle nicht den sichtbaren Spalten (Spaltenauswahl wirkt nicht), im Bestand nicht dem sichtbaren Reiter inklusive Suche (er folgt ihm, aber das ist nirgends beschriftet).
- **Vorschlag:** Beim Tabellen-Export die sichtbaren Spalten ausgeben ("exportiert, was du siehst"), beim Bestand-Export die Beschriftung "CSV-Export (aktuelle Liste)".
- **Priorität:** niedrig

### 23. URL-Parameter folgen keiner einheitlichen Regel
- **Stelle:** `bestand.tsx` Z. 887–893, `tabelle.tsx` Z. 450–458, `uebersicht.tsx` Z. 436–446, `bestand.tsx` Z. 992.
- **Was passiert:**
  - Bestand: `tab` mit internen Schlüsseln (`verfuegbar`, `kommission`), unbekannte Werte fallen still auf "Alle". Der Reiter heißt "Außer Haus", der Schlüssel `kommission`.
  - Tabelle: `status` mit exakter Beschriftung (`verfügbar`, `in Kommission`), `art` mit exaktem Wort (`Unikat`). Großschreibung oder Tippfehler ergeben eine leere Tabelle, es kann nur ein Wert übergeben werden, und es gibt keinen Parameter für "Außer Haus" (Kommission und ausgestellt zusammen). Ein `partner`-Parameter, wie in der Übergabe geplant, wird nicht ausgewertet.
  - Der Knopf "Alles als Tabelle" im Bestand (Z. 992) verliert Reiter und Suche.
  - Die Kachel "Außer Haus" springt nur zum Anker auf der Seite.
- **Vorschlag:** Beide Seiten akzeptieren `status=a,b` (kommagetrennt, ohne Beachtung der Großschreibung) und `tab`/`art` einheitlich. "Alles als Tabelle" übergibt den aktuellen Reiter (`kommission` wird zu `status=in Kommission,ausgestellt`). Die Partnerkarten in der Übersicht können `?partner=` bekommen, sobald die Tabelle es versteht.
- **Priorität:** niedrig

### 24. Eingabeprüfung beim Jahr, bei der Anzahl und bei leeren Pflichtfeldern
- **Stelle:** `erfassen.tsx` Z. 712–719 und 540; `bestand.tsx` Z. 740–743 und 849.
- **Was passiert:**
  - Jahr: Es wird nur auf Ziffern geprüft. "0", "20" oder "9999" werden gespeichert (Erfassen: `"0"` ist ein nicht leerer Text und wird zu 0).
  - Anzahl im Edition-Panel: ein leeres Feld wird still als 0 gespeichert (`Number("") || 0`), im Erfassen ist 0 dagegen verboten.
- **Vorschlag:** Jahr 1900 bis aktuelles Jahr + 1 prüfen, sonst leer lassen. Im Panel leere Anzahl abfangen ("Bitte eine Zahl eingeben").
- **Priorität:** niedrig

### 25. Leerzustände und Randfälle in Karten und Listen
- **Stelle:** `bestand.tsx` Z. 419 und 425, Z. 1066–1068; `uebersicht.tsx` Z. 470.
- **Was passiert:**
  - Fehlt die Inventarnummer, steht in der Karte eine Zeile " · Vase" mit führendem Trennpunkt.
  - Die Karte eines Stücks außer Haus ohne Partner zeigt "Außer Haus" als Ort (aus dem Lagerort), nicht "Partner fehlt".
  - Der Leerzustand der Editionsware ("Keine Editionsware gefunden") hat keinen Knopf "Suche zurücksetzen", die Unikat-Liste schon. Die Suche bleibt beim Reiterwechsel erhalten, sodass man in einer scheinbar leeren Liste landet.
  - In der Übersicht steht bei Partnern ohne Art und Ort eine leere Zeile.
- **Vorschlag:** `[u.inv, u.typ].filter(Boolean).join(" · ")`; Karte "Partner fehlt" in Warnfarbe; Reset-Knopf auch bei Editionsware; leere Unterzeile weglassen.
- **Priorität:** niedrig

### 26. Fotos wandern beim Wechsel zwischen Unikat und Editionsware
- **Stelle:** `erfassen.tsx` Z. 614–618, 557–561.
- **Was passiert:** Beim Wechsel von Unikat zu Editionsware werden mehrere Fotos still auf eines gekürzt, beim Zurückwechseln fehlen die anderen. Wird bei Editionsware eine bereits vorhandene Kombination gewählt, verschwindet das Fotofeld, aber ein vorher gewähltes Foto wird trotzdem hochgeladen und danach verworfen. Außerdem erscheint es beim Wechsel zurück zu Unikat als Foto.
- **Vorschlag:** Je Art eigener Foto-Zustand (`filesUnikat`, `filesEdition`) und Upload nur, wenn die Zeile neu angelegt wird.
- **Priorität:** niedrig

### 27. Testdatensätze im Livebestand verfälschen Zähler
- **Stelle:** Datenbank, Tabelle Unikate: U-2026-013 "Test-Schale „Playwright“" und U-2026-014 "Test-Krug „Playwright“" (beide "ausgestellt", Galerie Nord).
- **Was passiert:** Beide Stücke zählen in "Außer Haus" (7 statt 5), in der Karte "Galerie Nord" und im Warenwert. Der Typ "Krug" (nur durch den Test entstanden) steht in der Typ-Auswahl.
- **Erwartet:** Vor der Veröffentlichung entfernen. Das Löschen ist dem Admin vorbehalten (Regel "Gelöscht wird nichts" gilt für den Betrieb). Zum Entfernen im Softr-Studio Datensatz löschen, Typ "Krug" ebenfalls.
- **Priorität:** niedrig

---

## Befunde, die bewusst nicht aufgeführt sind, weil sie in Ordnung sind
- Rechte im Code: Erfassen blendet Preis und Website für Nicht-Admins aus, das Admin-Panel sitzt in eigenem Block mit Admin-Rechten. Verkaufsdatum setzt die App automatisch (Feldbeschreibung deckt sich damit), nur das Admin-Panel kann es ändern.
- Es gibt nirgends eine Löschfunktion für Bestandsdaten. Das Entfernen von Tabellenansichten ist ein separater Datensatz und steht unter Rechten.
- Editionsware: Rohling hat im Erfassen keine Glasur (Auswahl ausgeblendet, `glasur: []` beim Speichern). Die Suche nach bestehenden Zeilen berücksichtigt Rohling ohne Glasur korrekt. Bezeichnung entsteht nach dem Muster der vorhandenen Daten ("Modell · Glasur" beziehungsweise "Modell · Rohling"). Im Edition-Panel sind Zustand und Glasur nicht änderbar, also ist kein verbotener Zustand über das Panel erzeugbar.
- "Verkauft am" wird beim Wechsel weg von "verkauft" geleert; "Rückgabe bis" und "seit" werden beim Verlassen von "außer Haus" geleert.
- Zähler "Verfügbar" ist in Kachel und Reiter identisch; Außer-Haus-Zähler in Reiter und Kachel sind identisch (beide nach Status).
- Schwelle für "Nachschub nötig" (< 5) gilt in Übersicht und Bestand (Farbe der Zahl) gleich.
- `start-weiterleitung.tsx` hängt die Suchparameter an und nutzt `replace`, es entsteht keine Rückwärts-Schleife.
- Alle Links `/bestand?id=…` werden ausgewertet (`selectedId`, Z. 893), ebenso `?tab=` (Z. 887–890) und in der Tabelle `?status=`/`?art=` (Z. 450–458).
