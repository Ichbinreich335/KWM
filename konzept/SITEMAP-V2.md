# Sitemap und Seitenstruktur – Entwurf für Design V2

Stand: 02.10.2026, Branch `design-v2`. Entwurf zur Abstimmung mit der Werkstatt. Er gilt für den HTML-Prototyp in `src/v2/` und als Vorlage für den Umzug nach Astro.

## Ausgangslage
- Die Navigation hat sechs Punkte. Für Besucher ist nicht klar, was „Meisterstücke“, „Manufaktur“ und „Werkstatt“ voneinander trennt.
- Die Arbeitsweise (östlich drehen, westlich abdrehen) wird dreimal erzählt: auf der Startseite, auf „Meisterstücke“ und auf „Werkstatt“.
- Auf der Startseite stand „Aktuell“ vor dem ersten Werk. Dort lief außerdem ein Termin weiter, der schon beendet war.

## Grundsatz: eine Frage pro Bereich

| Bereich | Frage der Besucher | Inhalt |
|---|---|---|
| **Meisterstücke** | Was macht Young-Jae Lee? | Unikate aus ihrer Hand: Schalen, Kummen, Vasen |
| **Manufaktur** | Was kann ich für den Tisch bestellen? | Geschirr nach Bauhaus-Formprinzipien, in der Werkstatt gedreht und glasiert, Farbskala |
| **Young-Jae Lee** | Wer ist sie? | Biografie, Texte, Ausstellungen, Sammlungen, Auszeichnungen, Publikationen |
| **Werkstatt** | Woher kommt das Haus? | Seit 1924, Bauhaus-Linie, Arbeitsweise, Chronik, Team, Zollverein |
| **Aktuelles** | Wann und wo ist etwas zu sehen? | Ausstellungen und Termine, Archiv, Veröffentlichungen |
| **Besuch** | Wie komme ich hin, wie erreiche ich jemanden? | Öffnungszeiten, Anfahrt, Kontakt, Anfrage |

- Die Reihenfolge der Navigation bleibt: zuerst die beiden Werklinien, dann die Person, dann Haus, Zeit und Ort.
- Im Mobil-Menü steht unter jedem Punkt eine Zeile, die diese Frage beantwortet.
- Auf der Startseite trennt direkt nach dem Einstieg ein Abzweig (`.lines`) die beiden Werklinien.

## Seitenbaum

```
/                      Startseite: erzählt, jeder Abschnitt führt zu genau einer Seite
├─ meisterstuecke      Schalen · Kummen · Vasen · (später: Werkseiten)
│  └─ /<werk>          geplant: Werkseite mit Fotos, Werkangaben, „Zu diesem Stück anfragen“
├─ manufaktur          Geschirr · Edition · Farben · Anfrage
├─ young-jae-lee       Haltung · Biografie · Texte · Ausstellungen · Sammlungen · Auszeichnungen · Publikationen
├─ werkstatt           Arbeitsweise · Chronik · Team · Auszeichnungen · Zollverein
├─ aktuelles           Ausstellungen des Jahres · Vergangene Ausstellungen · Veröffentlichungen
├─ besuch              Öffnungszeiten und Adresse · Anfahrt · Anfrage · Zahlung
└─ 404
```

## Startseite: Reihenfolge und Aufgabe der Abschnitte

| # | Abschnitt | Aufgabe | führt zu |
|---|---|---|---|
| 1 | Einstieg mit generativer Schale | Haltung: „keine ist wie die andere“ | Meisterstücke, Manufaktur |
| 2 | Lede und Abzweig „Zwei Linien“ | Wer wir sind, was es gibt | Meisterstücke, Manufaktur |
| 3 | Young-Jae Lee | Die Person hinter den Stücken | Young-Jae Lee |
| 4 | Meisterstücke, Werkschau | Die Stücke selbst | Meisterstücke |
| 5 | Gegen den Uhrzeigersinn (Drehen und Abdrehen) | Wie ein Stück entsteht | Werkstatt (Arbeitsweise) |
| 6 | Meditation | Haltung, Zitat | – |
| 7 | Kosmos, 99 Schalen | Aktuelle Ausstellung im MOK | Aktuelles |
| 8 | Außerdem zu sehen | Weitere laufende Termine | Aktuelles |
| 9 | Feuer | Brand und Glasur | – |
| 10 | Manufaktur mit Farbskala | Geschirr und Farben | Manufaktur |
| 11 | Chronik | Hundert Jahre Haus | Werkstatt |
| 12 | Besuch | Öffnungszeiten, Anfrage | Besuch |

Damit ist jede Unterseite von der Startseite aus mindestens einmal verlinkt. Meisterstücke und Manufaktur, die beiden wichtigsten Seiten, sind mehrfach verlinkt.

## Doppelungen auflösen
- **Arbeitsweise:** Die ausführliche Fassung steht auf „Werkstatt“. Die Startseite zeigt sie nur als Signatur-Element (Drehen und Abdrehen). Der Abschnitt „Östlich gedreht, westlich abgedreht.“ auf „Meisterstücke“ soll zu zwei Sätzen und einem Link auf „Werkstatt“ schrumpfen. Das ist in V2 noch nicht umgesetzt, weil die Inhalte noch nicht final sind.
- **Porträt und Kummerschalen:** Jedes Foto bekommt eine Hauptstelle. Mehrfachverwendung nur als Anschnitt oder mit erkennbar anderem Ausschnitt.

## Später, mit Sanity und der Lager-App
- **Werkseiten:** Pro Meisterstück ein Dokument (Slug, Titel, Werkangaben, Fotos aus der Fotoecke, Galeriefotos). Nur freigegebene Felder kommen in den Build, also nie Preis, Bestand, Lagerort oder Inventarnummer. Der Button „Zu diesem Stück anfragen“ übergibt den Werknamen.
- **Termine:** Termine mit Start- und Enddatum. Die Startseite zeigt nur laufende und kommende Termine. Beim nächtlichen oder manuellen Neubau rutschen beendete Termine automatisch ins Archiv.
- **Anfrageformular:** Kann `mailto:` ablösen. Dafür braucht es einen Formular-Worker mit Turnstile, also Server-Code, und deshalb ein Security-Review.

## Offene Fragen an die Werkstatt
1. Sollen Stücke anderer Werkstatt-Mitglieder (nicht von Young-Jae Lee) gezeigt werden? Falls ja: als dritter Bereich, etwa „Aus der Werkstatt“, oder innerhalb der Manufaktur?
2. Ist die Edition ein eigener Bereich oder Teil der Manufaktur, wie bisher?
3. Wer beantwortet Anfragen? Name und Foto einer Ansprechperson auf der Besuchsseite würden Vertrauen schaffen.
4. Startjahr: Die Lede nennt „seit 1986 geprägt“, Biografie und Werkstatt nennen „seit 1987 Leitung“. Ist beides richtig, also erst Mitarbeit und dann Leitung, oder muss eine Angabe korrigiert werden?
