# Recherche: Klicken und Bearbeiten ohne Server-Rendering

Stand: 05.10.2026. Recherche durch Sonnet, Quellen am Ende nummeriert [1] bis [26]. Aussagen ohne Fundstelle sind als „nicht belegt“ oder „eigene Schlussfolgerung“ markiert.

> **Korrektur Controller (Opus, 05.10.2026):** Die Recherche las `public/_headers` auf dem Branch `astro-umbau`. Im Branch `phase-e-seo` (PR #12) stehen `Content-Security-Policy: frame-ancestors 'none'` und `X-Frame-Options: DENY`. Für (b+), (c) und (d) muss die Seite im iframe des Studios laufen dürfen: `frame-ancestors 'self' https://kwm.sanity.studio` und `X-Frame-Options` entfernen (der veraltete Header kennt keine Ausnahmen). Das gilt für die Seiten, die das Presentation Tool lädt; am einfachsten sitewide.

## Kurzfazit und Empfehlung

1. Der Admin hat im Kern recht: Eine statische Seite kann Entwürfe im Browser anzeigen, **wenn die Entwürfe vom Studio kommen** und nicht aus einer Abfrage mit Token. Sanity hat dafür einen eigenen Weg („Live Mode“ über `@sanity/core-loader`): Das Studio führt die Abfrage mit der Anmeldung des Redakteurs aus und schickt das Ergebnis per `postMessage` an die Seite im iframe [5][6]. Ein Token im Browser ist dafür nicht nötig.
2. Die Sanity-Anleitung für Astro verlangt SSR nur, weil sie Entwürfe über Cookie und Server-Token holt. Das ist ein Bauweg, kein Zwang [1][8]. Die Doku sagt für „Vanilla TypeScript oder jedes Framework“ aber ausdrücklich nur „Basic“-Unterstützung, und eine fertige Anleitung für rein statische Seiten gibt es nicht [4]. Dass die Kette auf Cloudflare Static Assets funktioniert, ist deshalb **plausibel, aber noch nicht geprüft** (siehe Spike).
3. Astro-Komponenten laufen nur beim Bauen und können im Browser nicht neu gerendert werden. Das gilt bei allen verglichenen CMS: Sanity, Storyblok und Tina brauchen für „live neu rendern“ einen Server [1][12][14]. Im Browser kann man nur gezielt Texte, Bild-Adressen und Attribute austauschen.
4. **Empfehlung:** Stufenweise vorgehen. Zuerst (b+) das Presentation Tool mit Klick-Markierungen (`data-sanity`) auf der veröffentlichten statischen Seite einrichten (ca. 1 Tag, null Laufzeitkosten, kein Server). Danach in einem halben Tag Spike prüfen, ob (c) die Entwurfs-Texte live einspielt. Nur wenn der Spike scheitert, kommt (d) die SSR-Vorschau als Rückfall.
5. Kosten: Alles bleibt im Sanity-Free- und Cloudflare-Free-Tarif (Details Abschnitt Kosten). Ein Wechsel des CMS lohnt nicht: Kein anderes geprüftes Free-Angebot bietet Klicken und Bearbeiten ohne Server besser, bei Contentful ist die gewerbliche Nutzung im Free-Tarif laut Hilfeseite ausgeschlossen [24].

## Was genau geht ohne Server (Befunde)

- **Overlays (Klick-Rahmen) sind reines Browser-JavaScript.** `enableVisualEditing()` aus `@sanity/visual-editing` scannt das DOM nach unsichtbaren Zeichen (stega) **oder** nach `data-sanity`-Attributen und legt Rahmen darüber. Die Doku sagt wörtlich, der Overlay-Controller sei „framework-agnostic JavaScript“ [3]. Wichtig: `data-sanity` funktioniert **ohne** stega und lässt sich beim Bauen ins statische HTML schreiben (Dokument-ID, Typ, Feldpfad) [3][2].
- **Die Verbindung Studio zu Seite** läuft über `@sanity/comlink` (`postMessage`), mit Prüfung der erlaubten Herkunft (`allowOrigins`) [2][7]. Kein Cookie und kein Server nötig.
- **Presentation Tool ohne Entwurfsmodus:** `previewUrl` darf ein reiner Text sein (`previewUrl: 'https://…'`); der Block `previewMode` mit `enable`-Adresse ist optional [7]. Ohne ihn ruft das Studio keine Server-Route auf.
- **Live Mode:** `queryStore.enableLiveMode()` tauscht beim Verbinden den Abrufer aus. Danach liefert das Studio die Ergebnisse, auch für Entwürfe und Perspektiven [5]. Die Doku nennt diesen Weg „Path 1: via the Presentation Tool (live mode)“, der „requires your frontend to be running inside the Presentation Tool iframe“ [5]. Ein Token wird dort nirgends verlangt; der Token-Hinweis der Doku betrifft den Server-Weg [1][5].
- **Abfragen des Studios sind frei von Kontingent:** „Requests made by Sanity's own applications and tooling, such as Sanity Studio … are also exempt“ [9].
- **Grenze 1:** Beim Wiedereinspielen kann man nur ersetzen, was man gezielt austauscht. Neue Einträge, geänderte Reihenfolge, andere Layouts (Struktur) sieht man erst nach Veröffentlichen und Neubau. Das Neu-Laden der Seite hilft nicht, weil die statische Seite nur den veröffentlichten Stand enthält.
- **Grenze 2:** Rich Text (Portable Text) und Bilder lassen sich im Browser nur mit eigenem Zusatzcode neu zeichnen (`@portabletext/to-html`, `@sanity/image-url`). Das doppelt die Darstellung. Empfehlung: nur Textfelder live, Rest nach Veröffentlichen.

## Vergleich der Varianten

| | (a) Kein Visual Editing | (b) Presentation nur Ansicht + Zuordnung | **(b+) Klick-Rahmen auf statischer Seite** | **(c) Clientseitige Vorschau, Entwürfe aus dem Studio** | (d) Eigene SSR-Vorschau (Worker) | (e) Lokal `astro dev` |
|---|---|---|---|---|---|---|
| Was der Redakteur sieht | Formular. Ergebnis nach Veröffentlichen und ca. 1 Min Neubau | Seite im Studio, „Verwendet auf“-Links. Kein Klicken, keine Entwürfe | Seite im Studio, Klick auf Text springt zum Feld. Entwürfe erst nach Veröffentlichen und Neubau | Wie (b+), zusätzlich ändern sich **Textfelder** beim Tippen sofort. Struktur, Bilder, Rich Text erst nach Neubau | Volle Seite mit Entwürfen, Klick, Neuladen nach Änderung. Eigene URL | Entwurf nur auf dem eigenen Rechner |
| Aufwand einmalig (grob, eigene Schätzung) | 0 | ca. 0,5 Tag (Studio-Konfiguration) | ca. 1 Tag (Attribut-Helfer in den Komponenten, Browser-Skript, `_headers`) | ca. 3 bis 5 Tage inkl. Spike (Patch-Skript, Pfadauflösung, Tests) | ca. 2 bis 3 Tage plus zweiter Build, Secrets, Pflege [8] | Einrichtung pro Rechner, Node, Git, `.env` |
| Wartung | keine | gering | gering (jede neue Komponente muss Attribut setzen) | mittel: Patch-Skript muss zu den Komponenten passen, zwei Wege (Bau und Browser) | mittel bis hoch: zweiter Worker, Adapter, Token, Doppel-Deploy bei jeder Änderung | hoch, nicht für die Werkstatt |
| Sicherheit | kein Zusatzrisiko | kein Token, nur iframe-Erlaubnis nötig | wie (b), Skript lädt nur im iframe | **kein Token im Browser** (Entwürfe nur über die Studio-Sitzung) [5]; `allowOrigins` begrenzt Herkunft [7] | Lese-Token als Cloudflare-Secret, Route `/api/draft-mode/enable` mit Geheimnis-Prüfung [8]; mehr Angriffsfläche | Token auf dem Rechner |
| Kosten | 0 | 0 | 0 | 0 | 0 (Workers Free: 100.000 Anfragen/Tag [20]) | 0 |
| Grenzen | keine Vorschau | siehe oben | Keine Live-Entwürfe | Siehe „Grenze 1 und 2“; Spike offen | Zweite Umgebung, Abweichungen zwischen Vorschau und Live möglich; SSR-Zwang nur dort | Admin muss Technik bedienen; kein „Klick im Studio“ |
| Belegt? | ja | ja [7] | Teile belegt [2][3][7] | **Kette nicht als Ganzes in der Doku, nicht getestet** | ja, offizieller Weg [1][8] | eigene Schlussfolgerung |

## So würde (c) technisch funktionieren

Alles Folgende ist ein Entwurf, **noch nicht gebaut oder getestet**. Er setzt die Doku-Bausteine [2][3][5][7] zusammen.

**Pakete (nur im Browser, nur im iframe geladen):** `@sanity/visual-editing` (Overlays; braucht laut Doku `react`, `react-dom`, `styled-components` als Peer-Pakete [3]), `@sanity/core-loader` und `@sanity/client` (Live Mode [5]). Optional später `@portabletext/to-html`, `@sanity/image-url`. Alles per dynamischem `import()`, damit normale Besucher nichts davon laden.

**Ablauf:**
1. **Beim Bauen (Astro, wie bisher statisch):** Jede bearbeitbare Stelle bekommt ein `data-sanity`-Attribut mit Dokument-ID, Typ und Feldpfad (Helfer `createDataAttribute` [3]). Kein stega, also keine unsichtbaren Zeichen im HTML und in `<title>`/Meta. Preise und Lagerorte sind gar nicht im Dataset (Regel aus CLAUDE.md), also auch nicht in den Attributen.
2. **Studio (`kwm.sanity.studio`):** `presentationTool({ previewUrl: 'https://<Website>', resolve: { mainDocuments, locations }, allowOrigins: [...] })`, ohne `previewMode` [7]. `mainDocuments` ordnet Adressen Dokumenten zu, `locations` zeigt „Verwendet auf“ [7].
3. **Website, `_headers`:** `Content-Security-Policy: frame-ancestors https://kwm.sanity.studio` (die Doku warnt vor `X-Frame-Options`/CSP, die das Einbetten verbieten [7]). Aktuell setzt `public/_headers` keine solche Sperre.
4. **Browser-Skript, Erkennung:** `if (window.self !== window.top)` dann `import('./vorschau')`. Außerhalb eines iframes passiert nichts.
5. **`vorschau.ts`:** `enableVisualEditing({ history, refresh })` für Rahmen und Navigation (Muster aus [3]). Danach `queryStore.enableLiveMode({})` [5]. Doku-Hinweis: nicht zusammen mit `usePresentationQuery` einsetzen [3][5].
6. **Live-Text:** Das Skript sammelt alle `data-sanity`-Attribute der Seite, bildet je Dokument-ID einen Store (`createFetcherStore('*[_id == $id][0]', { id })`) und abonniert ihn [5]. Sobald das Studio Ergebnisse schickt, werden für alle Elemente mit Markierung „nur Text“ (`data-kwm-live="text"`) `textContent` bzw. `alt` aus dem Pfad gesetzt. Fremde Felder bleiben unverändert.
7. **Nach Veröffentlichen:** Webhook, Deploy Hook, ca. 1 Minute, dann zeigt die echte Seite den neuen Stand.

**Offene Prüfpunkte (Spike, ca. 0,5 Tag, Erfolg = Titel ändern im Studio ändert die H1 im iframe ohne Token und ohne Server):**
- Lädt das Presentation Tool die statische Seite ohne `previewMode` und baut die Comlink-Verbindung auf? (Doku erlaubt die einfache `previewUrl`, ein Praxistest für statische Seiten fehlt.)
- Liefert der Live-Store im Studio-Betrieb auch Entwürfe für eine reine ID-Abfrage ohne Token? (Doku: Studio liefert Ergebnisse; Perspektive über `onPerspective` [5].)
- Kommen Pfade aus `data-sanity` mit dem Ergebnisformat überein (Array-Pfade mit `_key`)? Dafür gibt es `defineEncodeDataAttribute` im Core-Loader [5].
- Reicht die Stabilität von `@sanity/visual-editing` 5.x (Doku nennt 5.5.0 [2][3])? Der alte `mutation`-Refresh gilt als veraltet; Live Mode ist der vorgesehene Ersatz [3][5].

**Abbruchregel:** Gelingt die Kette im Spike nicht, ist (b+) trotzdem fertig und nützlich; (d) wäre dann der dokumentierte Ausweg [8].

## Kosten

**Sanity Free (Preisseite [10], Doku Tarife [9]):** 20 Plätze (nur Rollen Administrator und Viewer), 2 Datasets, 10.000 Dokumente, 250.000 API-Anfragen, 1 Mio. CDN-Anfragen, 100 GB Bandbreite, 1.000 Live-Verbindungen je Dataset. „Live Preview“ und „Visual Editing“ sind laut Preisseite im Free-Tarif enthalten [10]. Free hat **harte Grenzen**, keine Überziehung: Bei 100 % antwortet die API mit HTTP 402, das Studio bleibt benutzbar [9].
- Anfragen des Studios (inklusive der Live-Mode-Abfragen, die das Studio ausführt) sind vom Kontingent ausgenommen [9]. Browser-Abfragen im iframe (veröffentlichter Stand über CDN) kommen nur von Redakteuren und sind verschwindend gering (eigene Schätzung).
- Der Neubau holt beim Bauen je Seite ein paar Abfragen; selbst 100 Veröffentlichungen im Monat bleiben weit unter 250.000 (eigene Schätzung, abhängig von der Zahl der Abfragen).
- **Live-Verbindungen (1.000):** Diese Zahl bezieht sich auf die Live Content API und Listener. (c) nutzt sie nicht (Daten kommen über Comlink aus dem Studio [5]). Ob Studio-eigene Listener mitzählen, ist nicht belegt; bei einer Werkstatt mit wenigen Redakteuren irrelevant.
- **Rollen:** Im Free-Tarif gibt es nur Administrator und Viewer [10]. Jeder Redakteur wäre Administrator. Eigene Anmerkung für den Admin, keine Kostenfrage.

**Cloudflare Free:** Anfragen an statische Dateien sind kostenlos und unbegrenzt [20]. Workers Free: 100.000 Anfragen/Tag, 10 ms CPU, 50 Unteranfragen je Anfrage [20][21]; für (d) reicht das, da nur Redakteure die Vorschau aufrufen. Statische Dateien: höchstens 20.000 je Version [21] (Website liegt weit darunter, nicht neu gemessen).

## Andere CMS (nur Free-Tarif, Offizielle Seiten, Stand 05.10.2026)

Das Ergebnis vorweg: Keines liefert „Klicken und Bearbeiten auf statischer Seite ohne Server“ besser als Sanity. Wo die Seite beim Direktabruf nicht erreichbar war (HTTP 429/404), steht „nicht belegt“.

| CMS | Free-Tarif (Fundstelle) | Gewerbliche Nutzung | Visual Editing für statische Astro-Seite ohne Server |
|---|---|---|---|
| **Storyblok** | Kostenlos, 1 Platz, 100 GB Traffic, 2.000 Assets, 20.000 Stories, 100k API-Anfragen, Visual Editor enthalten [11] | Preisseite nennt „testing and personal projects“; Forum-Antwort und Suchtreffer sagen, Free dürfe für Webseiten genutzt werden, mit Fair-Use-Grenzen [13]. **Uneindeutig, Nutzungsbedingungen prüfen** | **Nein.** Astro-Anleitung: Vorschau-Umgebung mit `output: 'server'`; „Deploy in client-side or server-side rendering mode“; Entwürfe mit Preview-Token [12]. Token muss serverseitig bleiben [14] |
| **TinaCMS** | Free: 2 Nutzer, 2 Rollen [15] | nicht belegt | **Teilweise.** `output: 'static'` wird unterstützt, die Brücke lädt nur im Editor-iframe; aber das neue Rendern pro Tastendruck läuft über `/tina-island/[name]`, das auf einen Server (Adapter/Funktionen) angewiesen ist [16][17]. Zusätzlich Tina Cloud oder eigener Daten-Layer nötig [16] |
| **Prismic** | 0 $/Monat, 1 Nutzer, 4 Mio. API-Aufrufe, 100 GB CDN, 2 Sprachen; Page Builder, Vorschauen, Slice Machine enthalten [18] | nicht belegt („personal websites or PoC“) | nicht belegt |
| **DatoCMS** | Free: 2 Editoren, 300 Datensätze, 100k API-Aufrufe, 10 GB, 200 MB Dateien; harte Grenzen [19] | nicht belegt | Visual Editing laut Vergleichstabelle erst im Professional-Tarif [19] (aus Seitenzusammenfassung, im Original nachprüfen) |
| **Contentful** | Free: 10 Nutzer, 10k Datensätze, 100k Aufrufe, 50 GB, Live Preview als Funktion [24] | **Laut Contentful-Hilfe nur zum Testen und Lernen, nicht für gewerbliche Fälle** [24] (Direktabruf 429, Aussage aus Suchtreffer der offiziellen Hilfeseite) | nicht belegt |
| **Keystatic** | Open Source, Speicher lokal oder GitHub; Preise von Keystatic Cloud nicht erreichbar (404), nicht belegt [22] | nicht belegt | **Nein.** Astro-Anbindung braucht einen Adapter (Server); Live-Vorschau für Astro nicht dokumentiert [23] |
| **Decap CMS** | Open Source (MIT), Git-basiert, kostenlos [25] | MIT-Lizenz, ja [25] | Vorschau im Editor („real-time preview“) laut Doku; ob das die echte Seite ist oder eine nachgebaute Vorschau-Ansicht, ist **nicht belegt** [25] |

## Fazit für die Entscheidung

- Bei Sanity bleiben und **(b+) jetzt**, **(c) nach kurzem Spike** entscheiden, (d) nur als Rückfall.
- Dem Admin gegenüber ehrlich sagen: „Sofort sichtbar“ gilt in (c) nur für Textfelder; neue Einträge, Reihenfolge und Bilder zeigt die Seite nach Veröffentlichen und ca. 1 Minute Neubau.
- Wenn „alles sofort“ zwingend ist, bleibt nur ein serverseitiger Weg (d) oder ein anderes CMS mit Server-Vorschau; alle geprüften Wettbewerber brauchen dafür ebenfalls einen Server [12][16].

## Quellen

Sanity (über MCP `sanity`, offizielle Doku, abgerufen 05.10.2026)
1. Visual Editing with Astro: https://www.sanity.io/docs/visual-editing/astro-visual-editing (Voraussetzung `output: "server"`, Cookie-Draft-Mode, `SANITY_API_READ_TOKEN` nur serverseitig)
2. Visual editing architecture overview: https://www.sanity.io/docs/visual-editing/visual-editing-architecture (7 Schichten, Comlink, Tabelle der Framework-Unterstützung, `enableVisualEditing`)
3. Overlays and click-to-edit: https://www.sanity.io/docs/visual-editing/visual-editing-overlays (framework-agnostisches JS, `data-sanity`, `createDataAttribute`, `history`, `refresh`, Hinweis zu `usePresentationQuery`)
4. Build a complete visual editing integration (Vanilla TypeScript): https://www.sanity.io/docs/visual-editing/build-a-visual-editing-integration (Beispiel mit Node-Server, Draft Mode)
5. Live preview content updates: https://www.sanity.io/docs/visual-editing/live-preview-content-updates (Live Mode über Presentation Tool, `@sanity/core-loader`, `enableLiveMode`, Pfad 1 und 2, `defineEncodeDataAttribute`)
6. Client setup and stega: https://www.sanity.io/docs/visual-editing/visual-editing-client-stega (stega-Filter, Perspektiven, Token-Hinweis)
7. Configuring the Presentation Tool: https://www.sanity.io/docs/visual-editing/configuring-the-presentation-tool (`previewUrl` als Text möglich, `previewMode` optional, `allowOrigins`, Locations, iframe-Hinweise)
8. Implementing draft mode: https://www.sanity.io/docs/visual-editing/implementing-draft-mode (Abschnitt „Static site generators“: separate Vorschau-Instanz mit SSR; Cookie, Token, Secret mit 1 h Gültigkeit)
9. Plans and payments: https://www.sanity.io/docs/platform-management/plans-and-payments (harte Grenzen im Free-Tarif, HTTP 402, Studio-Anfragen ausgenommen)
10. Sanity Preisseite: https://www.sanity.io/pricing (Free-Limits, Visual Editing im Free-Tarif; Seite sagt nichts zur gewerblichen Nutzung)

Andere CMS (WebFetch/WebSearch, Zusammenfassungen der offiziellen Seiten)
11. Storyblok Preise: https://www.storyblok.com/pricing
12. Storyblok „Visual Preview in Astro“: https://www.storyblok.com/docs/guides/astro/visual-preview
13. Storyblok Nutzungsbedingungen und Forum (Free für Webseiten): https://www.storyblok.com/legal/terms und https://forum.storyblok.com/t/am-i-allowed-to-use-storybloks-free-account-for-commercial-websites/91
14. Storyblok Visual Editor Konzept (Token nicht im Client): https://www.storyblok.com/docs/concepts/visual-editor
15. Tina Preise: https://tina.io/pricing
16. Tina „Visual Editing Setup for Astro“: https://tina.io/docs/contextual-editing/astro
17. Tina Astro-Anleitung: https://tina.io/docs/frameworks/astro
18. Prismic Preise: https://prismic.io/pricing
19. DatoCMS Preise: https://www.datocms.com/pricing
20. Cloudflare Pages Functions Pricing (statische Anfragen frei, Workers Free 100.000/Tag): https://developers.cloudflare.com/pages/functions/pricing/
21. Cloudflare Workers Limits: https://developers.cloudflare.com/workers/platform/limits/
22. Keystatic Einführung: https://keystatic.com/docs/introduction
23. Keystatic Astro-Installation: https://keystatic.com/docs/installation-astro
24. Contentful Free-Plan-FAQ: https://www.contentful.com/help/admin/billing-subscription/contentful-free-plan/ und Preise https://www.contentful.com/pricing/ (Direktabruf 429; Inhalt aus Suchergebnis der offiziellen Seiten)
25. Decap CMS Einführung: https://decapcms.org/docs/intro/
26. Cloudflare Workers Static Assets, Headers (`_headers`, 100 Regeln): https://developers.cloudflare.com/workers/platform/limits/ (Tabelle „Static Assets“)
