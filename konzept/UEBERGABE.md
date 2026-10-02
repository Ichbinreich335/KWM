# Übergabe: Website und Lager-App für die Keramische Werkstatt Margaretenhöhe (KWM)

Stand: 02.10.2026, **v2 nach unabhängigem Review**. Abschnitt 0 enthält die aktuellen Empfehlungen und hat Vorrang vor älteren Aussagen weiter unten.

## 0. Aktueller Stand (v2)

- **Website:** Astro statisch. Neubau über einen **Cloudflare Deploy Hook** (für Workers verfügbar seit 01.04.2026 [V laut Review]). Schlägt der Neubau fehl, bleibt die alte Version online. Die ganze Seite wird neu gebaut, nicht nur „Aktuelles“. Das ist einfacher und braucht weder SSR noch nachladendes JavaScript.
- **Website-Editor: Sanity Free.**
  - Laut Nutzungsbedingungen für „internal business purposes“ nutzbar. Bis 20 Logins, 100 GB Assets, Visual Editing [V laut Review].
  - **KI-Zugriff über den offiziellen gehosteten Sanity-MCP-Server**: Entwürfe anlegen und ändern, veröffentlichen, Bilder hochladen, Schema ändern [V laut Review]. Ablauf: Admin gibt Claude Dokumente und Bilder, Claude legt einen Entwurf an, Admin prüft und veröffentlicht, Webhook löst den Neubau aus. Selbst pflegen geht weiterhin über das Studio.
  - Offen [U]: Ist der MCP-Server im Free-Tarif voll nutzbar? Gehen Bild-Uploads auch lokal und nicht nur per URL?
  - **Storyblok Starter ist herabgestuft.** Laut Preisseite gilt der Tarif nur für „testing and personal projects“. Der Versionsverlauf reicht 1 Tag zurück, und laut AGB §15.4 kann Storyblok den Free-Tarif jederzeit beenden [V laut Review].
- **Lager-App:**
  - **Baserow Cloud** (Server in Deutschland, verwaltet, MIT-Software). Free: 3.000 Zeilen und 2 GB pro Workspace, Galerie, Formular und Application Builder sind enthalten. Premium kostet 10 $ pro Nutzer [V laut Review]. Ausweg: Dieselbe Software lässt sich mit denselben Daten selbst hosten.
  - **Softr Basic** (Berlin, AWS EU) für 19 $ pauschal: 1 Builder, 5+5 App-Nutzer, 50.000 Datensätze, automatische Backups. Wirkt am stärksten wie eine eigene App. Nachteile: proprietär, **2FA für den Builder erst im Business-Tarif** [V laut Review].
  - Entscheidung zwischen beiden über einen **Praxistest des Admins**. CSV-Vorlagen liegen in `konzept/test-import/`.
- **Directus ist gestrichen.** Gründe:
  - 2026 gab es bisher 34 GitHub-Sicherheitswarnungen, darunter im August eine kritische WebSocket-Lücke. Damit gilt derselbe Maßstab wie bei Payload.
  - Die lokale Demo lief noch auf v11. In Produktion wäre es v12 mit Lizenzschlüssel und harter Grenze von 3 Plätzen.
  - Die Preise ändern sich erneut [V laut Review].
- **Ninox:** Die Preisangabe war veraltet. Aktuell 25 € pro Nutzer im Team-Tarif, also raus.
- **Buchungsjournal ist nicht mehr nötig.** Vorerst reicht der Bestand als Zahl pro Modell, Glasur und Zustand. Buchungen sind höchstens später ein nice to have. Damit spielen auch die Zeilenlimits keine Rolle.
- **Offen [U]:** Sind geteilte Logins (2 Werkstatt-Zugänge für 4 Personen) laut AGB von Baserow und Softr erlaubt?
- **Live-Vorschau** der lokalen Demos ist nicht möglich: Ein öffentlicher Tunnel aus der Cloud-Umgebung wurde blockiert. Die Screenshots liegen in `konzept/vergleich/`.

--- Dieses Dokument richtet sich an eine KI oder einen Entwickler, der übernimmt. Es fasst Anforderungen, getroffene Entscheidungen, Optionen und offene Punkte zusammen.

Kennzeichnung: **[V]** = an einer Primärquelle geprüft, **[S]** = nur Sekundärquelle oder Suchtreffer, **[U]** = unverifiziert. Fast alle Preise sind [S] und müssen vor einer Entscheidung auf der Herstellerseite gegengeprüft werden. Die Herstellerseiten waren für den Abruf gesperrt.

---

## 1. Ausgangslage

- **Kunde:** Keramische Werkstatt Margaretenhöhe in Essen, Manufaktur. Hochwertige Unikate (bis ca. 5.000 €) und Editionsware, die auf Bestellung glasiert wird (z. B. 12 Schalen à ~200 €). Weniger als 50 Mitarbeitende, Umsatz unter 5 Mio. €.
- **Betreuer / Admin:** Gründer ohne technischen Hintergrund, arbeitet mit KI (Claude Code). Betreut monatlich und pflegt Inhalte ein.
- **Repo:** `Ichbinreich335/KWM`, Branch `claude/dreamy-goldberg-ba30hd`.
- **Heutige Website:** Prototyp aus 7 handgeschriebenen HTML-Seiten in `src/`. Partials (Head, Header, Footer) werden über ein Build-Skript mit 33 Zeilen (`tools/build.mjs`) zusammengesetzt und nach `site/` ausgegeben.
  - Deploy als statische Assets auf Cloudflare Workers (`wrangler.jsonc`, Name `kwm-redesign`).
  - Kein Framework, kein TypeScript.
  - Die Seite gefällt dem Kunden. Feinschliff an Flows, Visuals und Texten folgt noch.
- **Bisheriges System beim Kunden:** WordPress. Soll abgelöst werden.
- **Kernproblem im Lager:** Die Werkstatt weiß nicht, was sie auf Lager hat. Auf Kundenfragen wie „Was habt ihr noch?“ kann sie nicht antworten. Vorhanden ist eine Fotobox für Produktfotos mit weißem Hintergrund.

---

## 2. Anforderungen

### 2.1 Website (öffentlich)
- **Framework:** Migration auf **Astro (statisch)**. Das bestehende HTML und CSS wird übernommen. Entschieden.
- **Pflege:** Inhalte wie Aktuelles, Ausstellungen und Galerie-Partnerseiten sollen sich **von Hand ohne KI** über eine Oberfläche pflegen lassen. Danach wird die Seite **automatisch neu gebaut** (Webhook).
- **Änderungsfrequenz:** wöchentlich bis monatlich. Statisch plus Neubau genügt, SSR ist **nicht** gewünscht, weil es mehr Angriffsfläche bedeutet.
- **Feste Seitentexte und Design** (Werkstatt, Geschichte) bleiben im Code. Änderungen daran laufen per KI und Git mit Vorschau.
- **Kein Warenkorb.** Später ist eventuell eine **Präsentation bzw. ein Schaufenster** mit „Preis auf Anfrage“ und Anfrage-Button denkbar.
  - **Edition und Unikat sind klar zu trennen.** Bei Editionsware wird z. B. „12 in Grün“ angefragt, bei Unikaten läuft es individuell.
  - **Rechtlicher Prüfpunkt (Preisangabenverordnung) [U]:** Eine reine Präsentation ohne Kasse ist wohl in Ordnung. Mit Kasse wäre die Preisangabe Pflicht.
- **Hosting:** Der Admin hat Hostinger ins Spiel gebracht. Cloudflare ist bereits eingerichtet und kostenlos. Beides geht, offen.

### 2.2 Website-Editor
- **Nutzer:** nur der Admin, ggf. später ein Nachfolger.
- **Bedienung:** einfach, ohne Code. Bilder hochladen, Texte, Ausstellungen anlegen.
- **Betrieb:** am liebsten **verwaltet** (keine Updates durch den Admin), EU bevorzugt.

### 2.3 Lager-App (intern)
- **Nutzer:** 4 Mitarbeitende, **2 gemeinsame Logins reichen**, dazu der Admin. Keine IT-Affinität.
- **Geräte:** **offen**, ob Tablet, Handy oder Laptop.
- **Zugang:** einfacher Login, **sicher und robust**.
- **Rechte:** feine Rechte sind **nicht wichtig**. Nur der Admin legt Felder und Ansichten an, die Mitarbeitenden nutzen die Vorgaben.
- **Eingabe:** einfache **Einpflege-Maske mit Fotos**, auch vom Handy.
- **Ansichten:** Tabelle, Kacheln oder Galerie, Filter, z. B. „Typ“ als Auswahlfeld (Teller, Karaffe …).
- **Optik:** muss modern aussehen, wie Airtable. **SeaTable wurde wegen altbackener Optik abgelehnt.**
- **Bestand und Stückzahlen** inklusive **Editions-Ablauf**:
  1. **Getöpfert:** Rohlinge werden erfasst.
  2. **Kundenbestellung:** z. B. „12 grüne“.
  3. **Glasur und zweiter Brand:** Die glasierte Ware wird ebenfalls erfasst. Rohlinge gehen dabei ab, Fertigware kommt hinzu, Bruch wird mitgezählt.
- **Interne Preise** dürfen nicht öffentlich werden. Die Website liest nur beim Build (serverseitig, Token nie im Browser) und gibt nur freigegebene Felder aus.
- **Kein Entscheidungskriterium:** Anfragen bzw. CRM sind nice to have, PDF-Export bauen wir selbst.
- **Grenzfall:** Die Verknüpfung Lager → Website (Ausstellungs- oder Schaufensterstücke) ist **kein Entscheidungskriterium**, muss aber **technisch möglich** sein.

### 2.4 Übergreifend
- **Budget:** möglichst **≤ 10–20 €/Monat gesamt**.
- **Stabilität:** soll **5 Jahre** halten. Updates sollen möglichst automatisch kommen, nicht vom Admin.
- **Datenschutz:** DSGVO und EU bevorzugt, aber kein Muss.
- **Bevorzugt:** namhafte Anbieter oder Referenzen.
- **Architektur:** **zwei getrennte Apps** (Website-Editor und Lager-App). Das ist der aktuelle Konsens. Ein System für beides geht nur mit Directus und ist Plan B.

---

## 3. Getroffene Entscheidungen

| Thema | Entscheidung |
|---|---|
| Website-Technik | Astro, statisch, Neubau per Webhook |
| Eigenbau Lager (z. B. Supabase + selbst gebautes Frontend) | **Nein.** Zu hoher Wartungsaufwand für Formulare, Ansichten und Uploads |
| Odoo, ERP, PIM | Nein, zu schwer |
| Website-Baukästen (Webflow, Framer, Wix, Jimdo) | Nein. Das Design ist bereits als Code gebaut, Inventar passt dort nicht hinein |
| WordPress | Nein |
| Architektur | Zwei Apps: Website-Editor und Lager-App |
| SeaTable | Nur Reserve (Optik) |

---

## 4. Optionen Website-Editor (Top 5)

| # | Tool | Herkunft | Kosten | Vorteile | Nachteile |
|---|---|---|---|---|---|
| 1 | **Storyblok Starter** | AT | 0 € | Visueller Editor (Klick auf die Seite), offizielles Astro-SDK, **gewerbliche Nutzung im Free-Tarif laut Storyblok-Support erlaubt** [S], verwaltet | 1 Login, max. 2 (+15 €). Asset-Limits im Starter-Tarif ungeprüft. Preissprung auf Growth 99 € |
| 2 | **Sanity Free** | NO/US | 0 € | Bis 20 Logins, starke Bildverarbeitung, Schema im Code (KI-freundlich), Studio aktualisiert sich selbst, offizielle Astro-Integration | Gewerbliche Nutzung im Free-Tarif **nicht belegt** [U]. Free-Datasets sind öffentlich, für Website-Inhalte aber unkritisch |
| 3 | DatoCMS Free | IT | 0 € | Nur EU-Hosting, Bild-CDN | Free sehr knapp (~300 Einträge, wenig Speicher) [S] |
| 4 | Directus (gemeinsam mit dem Lager) | US | Hosting | Ein System für alles | Selbst gehostet. Visueller Editor nur mit Aufwand |
| 5 | Keystatic / Decap (Git-basiert) | – | 0 € | Kein Anbieter nötig | Bilder im Git, GitHub-Login, Keystatic „experimental“ |

Ausgeschieden: Contentful (Salesforce, EU nur Premium), Hygraph (Free für persönliche Projekte), Prismic, Strapi, Payload (siehe 6).

**Aktuelle Empfehlung:** Storyblok Starter. Alternative: Sanity Free.

---

## 5. Optionen Lager-App (Top 5)

| # | Tool | Herkunft | Kosten | Vorteile | Nachteile |
|---|---|---|---|---|---|
| 1 | **Directus** (selbst gehostet) | US | Lizenz: **Core kostenlos, 3 Plätze, 25 Tabellen, 5 Flows** (passt zu 2 Logins + Admin). Hosting ~7–10 € (Hostinger VPS) oder ~11–17 $ (Elestio, halb verwaltet) | Per Klick am stärksten formbar (Stufe 1 reicht laut Admin): Formulare mit Gruppen und bedingten Feldern, Kacheln mit Fotos, Lesezeichen-Ansichten, Insights-Dashboards, Flows (Automationen), Bildbibliothek, Versionen, 2FA. Daten in Standard-Postgres oder SQLite | **Nicht voll verwaltet.** Lizenz MSCL (seit v12) mit zwei Lizenzwechseln. Ob geteilte Logins pro Platz erlaubt sind, ist ungeprüft [U]. Mehr als 3 Plätze nur mit jährlichem Förderprogramm |
| 2 | **Baserow** (selbst gehostet) | NL | 0 € Lizenz (MIT, unbegrenzt), Hosting ~7–10 € (Hostinger-Ein-Klick-Vorlage) | Wie Airtable, sofort vertraut. Galerie, Formular, Application Builder, verknüpfte Tabellen, Formeln und Rollups für Bestand | Weniger formbar als Directus. Selbst gehostet und damit nicht verwaltet. Cloud Free: nur 3.000 Zeilen und 2 GB |
| 3 | Budibase | UK | Cloud Free bis 5 Nutzer [S] | Touch-optimierte App-Masken (große Buttons) | Masken müssen selbst gebaut werden. UK-Firma, Limits ungeprüft |
| 4 | Ninox | DE | ~10 € pro Login [S] | Verwaltet, AVV vorhanden, native iPhone-App | Proprietär, ~20–30 € bei 2–3 Logins |
| 5 | SeaTable | DE | Free (2 GB Dateien) / Plus 7 € pro Nutzer | Verwaltet, Rechenzentrum in Deutschland, Universal App | **Vom Admin wegen Optik abgelehnt.** Free zu wenig Speicher für Fotos |

Weitere geprüfte Tools:
- **Grist:** gute Logik, nüchterne Oberfläche, SaaS nur USA.
- **InvenTree:** Stücklisten-Logik passt, Oberfläche industriell.
- **Zoho Inventory:** Stücklisten passen, wenig Fokus auf Galerie.
- **Airtable:** EU nur Enterprise, ~20 $ pro Editor, Übernahme durch Bending Spoons.
- **NocoDB:** keine OSS-Lizenz mehr.
- **Teable:** unbelegt.
- **PocketBase:** pre-1.0.
- **Strapi:** Formulare redaktionell, 2FA fehlt.
- **Payload:** siehe 6.

**Aktueller Stand:** Directus oder Baserow, je nachdem, wie die echte Oberfläche wirkt. Ein Vergleichstest läuft (siehe 9).

---

## 6. Wichtige Einzelbefunde

- **Payload CMS** ist für das Projekt nicht geeignet:
  - Payload Cloud nimmt seit der Übernahme durch Figma (Juni 2025) keine neuen Projekte an [S].
  - 2026 gab es mehrere kritische Sicherheitslücken im Kern der Rechte- und Abfragelogik, zuletzt 18.–29.09.2026, darunter das Auslesen versteckter Felder [V: GitHub-Advisories].
  - Die Cloudflare-Variante hat einen Beta-D1-Adapter und das offene Issue #18274 (Admin-Anlage nach Security-Fix kaputt) [V].
  - Es braucht einen Next.js-Server neben Astro.
- **Directus:** Die Cloud kostet 99 $ bzw. 499 $ und ist zu teuer. Selbst gehostet ist Core kostenlos (3 Plätze). Das Förderprogramm (Open Innovation Grant) für Firmen unter 5 Mio. $ Umsatz und unter 50 Mitarbeitenden gibt Vollzugriff, ist aber jährlich zu erneuern und widerrufbar [S].
- **Sanity für das Lager:** Free hat nur öffentliche Datasets. Bestand und Preise wären dann für jeden mit Projekt-ID abrufbar. Growth kostet 15 $ pro Login. Daher nicht fürs Lager.
- **Hostinger** (Litauen, EU):
  - VPS ab ~6,50 $, **unverwaltet**.
  - Docker-Vorlagen für **Baserow und Directus** [S].
  - Offizieller Astro-Deploy-Guide für Hostinger [S].
  - Lockpreise gelten nur mit langer Vorauszahlung, Verlängerungen sind teurer.
- **Elestio** (IE, Server bei Hetzner in Deutschland): Minor-Updates und tägliche Backups automatisch, Major-Updates manuell. AVV öffentlich. Ab ~11–17 $ [S].
- **Cloudflare:** Die Website läuft bereits dort, kostenlos. Astro gehört seit 01/2026 zu Cloudflare. EmDash (CMS von Cloudflare) ist seit 01.10.2026 in Version 1.1, hat aber nur 5 feste Rollen und ist jung. Beobachten.

---

## 7. Datenmodell-Vorschlag Lager (mit Buchungsjournal)

Bestände werden **nicht von Hand überschrieben**, sondern aus Buchungen berechnet (append-only).

```
Modelle      (Editionsware: Name, Typ, Ton, Maße, Foto, Künstler:in)
Glasuren     (Name, Farbe, Foto)
Lagerorte    (feste Liste, nur der Admin pflegt sie)
Buchungen    (Datum, Art: Zugang Rohlinge | Glasurbrand | Verkauf | Bruch,
              Modell, Glasur, Menge, Bruch, Auftrag, Mitarbeiter:in, Notiz)
Aufträge     (Kunde, Modell, Glasur, Menge, Status: offen → in Glasur → gebrannt → abgeholt, Termin)
Unikate      (Inventarnummer, Name, Typ, Künstler:in, Jahr, Glasur, Maße, Fotos,
              Status: verfügbar | reserviert | verkauft | in Kommission,
              Lagerort, Preis intern, Auf Website [ja/nein])
Berechnet:   Rohlinge vor Ort je Modell, Fertigware je Modell × Glasur
```

Masken für die Werkstatt: „Neues Stück erfassen“ (mit Kamera), „Brand buchen“ (Rohling, Anzahl, Glasur, Anzahl geglückt, Bruch) und eine Bestandsübersicht als Kacheln mit Foto.

---

## 8. Schnittstelle Lager → Website (optional, später)

- **Freigabe:** Ein Feld „Auf Website“ bzw. „Rotation der Woche“ im Lager markiert die Stücke.
- **Build:** Astro liest die markierten Stücke beim Build per API, mit einem Token **nur in der Build-Umgebung**. Übernommen werden **nur freigegebene Felder**.
- **Stolperfallen:**
  - Bild-URLs können ablaufen oder Authentifizierung brauchen. Bilder deshalb beim Build herunterladen, verkleinern und selbst ausliefern, keine Originale.
  - Wird eine Spalte umbenannt, bricht der Build. Schema-Validierung im Build einbauen, die letzte gute Version bleibt online.
  - Verkaufte Stücke bleiben bis zum nächsten Build sichtbar. Statusänderung als Auslöser für den Build nehmen.
  - GitHub-Cron-Workflows werden in öffentlichen Repos nach 60 Tagen Inaktivität deaktiviert. Privates Repo oder Cron beim Hoster nutzen.

---

## 9. Laufend und als Nächstes

1. **Laufend:** Directus 11 und Baserow laufen lokal (Docker) mit dem obigen Datenmodell und den Beispielfotos aus `keramik/`. Screenshots entstehen unter `konzept/vergleich/` (`directus-*.png`, `baserow-*.png`). Danach entscheidet der Admin anhand der echten Oberflächen.
2. **Entscheiden:** Lager = Directus oder Baserow. Hosting dafür bei Hostinger, Elestio oder Hetzner.
3. **Entscheiden:** Website-Editor = Storyblok Starter oder Sanity Free. Vorher prüfen, ob gewerbliche Nutzung erlaubt ist.
4. **Umsetzen:** Astro-Migration der bestehenden Seite (unabhängig von allem anderen, kann sofort starten).
5. **Einrichten** des Lager-Servers:
   - automatische Sicherheitsupdates des Betriebssystems
   - App-Updates innerhalb der Major-Version automatisch, Image-Tag gepinnt
   - tägliches Backup außer Haus
   - 2FA
6. **Offene Interview-Fragen** (Antworten des Admins fehlen noch):
   - **Wireframe:** Feedback zum Wireframe (`konzept/wireframes/index.html`).
   - **Editionsware:** Varianten pro Farbe, also Modell × Glasur?
   - **Kommission:** Nur Ort und Datum, oder mit Abrechnung?
   - **Fotos:** Fototypen Fotobox und Stimmung, mit Bildrechten?
   - **Löschen:** Löschen oder nur Archivieren?
   - **Bestehende Nummern:** Gibt es schon Nummern oder eine Excel-Liste für den Import?
   - **Geräte:** Tablet, Handy oder iPhone (HEIC-Format)?
   - **Umfang Website-Editor:** Aktuelles, Ausstellungen, Galerien, Schaufenster?

---

## 10. Dateien im Repo

- `konzept/wireframes/index.html`: Low-Fidelity-Wireframe mit 7 Screens (Lager-App und Website-Verwaltung)
- `konzept/recherche-backend.md`: Rechercheergebnisse in kompakter Form
- `konzept/vergleich/`: Screenshots Directus und Baserow (in Arbeit)
- `.agents/skills`, `.claude/skills`, `agent/skills`: installierte Matt-Pocock-Skills (u. a. `grilling`, `prototype`, `research`)
