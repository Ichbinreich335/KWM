# Übergabe: Website und Lager-App für die Keramische Werkstatt Margaretenhöhe (KWM)

Stand: 02.10.2026, **v3 nach externer Prüfung**; Website-Stand ergänzt am 04.10.2026. Abschnitt 0 ist maßgeblich und hat Vorrang vor älteren Aussagen weiter unten.

## 0. Aktueller Stand (v3, nach externer Prüfung) – Entscheidung: Softr-Test, Baserow Reserve

**Noch nicht final.** Endgültig entschieden wird nach dem Test-Abend anhand der Kriterien unten.
Kennzeichnung in diesem Abschnitt: [V] = heute (02.10.2026) vom externen Prüfer an der Herstellerseite geprüft, [U] = offen.

### Entscheidungen
1. **Website:** Astro statisch. Neubau per **Cloudflare Deploy Hook** (Workers Builds, verfügbar seit 01.04.2026) [V]. Kein SSR und kein Teil-Neubau nur für „Aktuelles“.
2. **Website-CMS: Sanity Free**, nicht Storyblok.
   - **Storyblok Starter:** laut Preisseite „for testing and personal projects“, Versionsverlauf 1 Tag, Gratis-Tarif laut AGB §15.4 jederzeit kündbar [V].
   - **Sanity Free:** gewerblich nutzbar („internal business purposes“), 20 Logins, 100 GB Assets, 2 Webhooks, Content Agent inklusive [V].
   - **KI-Zugriff:** offizieller Sanity-MCP (`mcp.sanity.io`) zum Anlegen von Entwürfen, Hochladen von Bildern und Veröffentlichen [V]. Ablauf: KI legt den Entwurf an → Admin prüft im Studio → Veröffentlichen → Webhook → Neubau.
3. **Lager:** kein Eigenbau, kein Selbst-Hosting.
   - **Reihenfolge:** (1) **Softr testen**, (2) **Baserow Cloud Free** als Reserve für 0 €, (3) Eigenbau auf Cloudflare nur, wenn beides scheitert.
   - **Begründung:** Der Admin baut einmal, die Werkstatt bedient nur. Kein eigener Code und kein Feinschliff durch uns.
4. **Directus gestrichen:** 2026 gab es 34 Sicherheitswarnungen, davon 1 kritische im August [V]. Der Test lief auf v11 (EOL seit 04/2026). Im Betrieb wäre es v12 mit Lizenzschlüssel für 3 Plätze [V].
5. **Buchungsjournal und Aufträge vorerst raus.** Bestand ist eine Zahl pro Modell, Glasur und Zustand (siehe `konzept/test-import/`).

### Geprüfte Fakten
**Softr** [V]
- **Basic:** 19 $/Monat bei Jahreszahlung, 25 $ bei monatlicher Zahlung. Enthalten: 1 Builder, „5 + 5“ App-Nutzer, 50.000 Datensätze, automatische Backups.
  - *Hinweis:* Mehrere Vergleichsseiten nennen 49 $. Softr hat die Tarife am 05.08.2026 umgestellt. Die Angabe des Prüfers stammt von der Herstellerseite und gilt.
- Daten in der AWS-EU-Region, Firma in Berlin.
- MCP (`https://mcp.softr.io/mcp`) „included on every plan, including Free“, verbraucht keine AI-Credits.
- 2FA laut Tarifliste erst im Business-Tarif (329 $).

**Baserow Cloud Free** [V]
- 3.000 Zeilen, 2 GB, Server in Deutschland.
- Ansichten Grid, Formular und Galerie, dazu Dashboards, 2FA, CSV-Export, Snapshots, Zeilenverlauf 14 Tage.
- Rollen und Rechte pro Ansicht und Feld erst ab Advanced (18 $ pro Nutzer). Werkstatt-Konten könnten also Ansichten und Felder verändern.
- App Builder: bis 500 App-Nutzer gratis (alle Tarife), aber das Datei-Upload-Element erst ab Advanced.
- Ein Webhook „Conditional row update“ kann den Cloudflare Deploy Hook auslösen.
- MIT-Lizenz: Ausweg über Selbst-Hosting. Firma in Amsterdam, 5 Mio. € Startkapital 2022, Fallstudie mit der Charité.

**Fotos**
- Die Fotobox exportiert ca. 2.000 px bzw. ~1 MB JPEG. Eine eigene Verkleinerungs-Kette wird nicht gebaut.
- *Rechnung prüfen:* 2 GB / 1 MB sind rechnerisch ca. 2.000 Bilder. Die Angabe „400 Bilder“ gilt eher für ~5 MB pro Bild.

### Offene Fragen vor bzw. beim Softr-Test [U]
1. Speichergrenze für Dateien und Fotos im Basic-Tarif (steht nicht auf der Preisseite).
2. Bedeutung von „5 + 5“ App-Nutzern (vermutlich intern + extern).
3. Gibt es 2FA für das Builder-/Admin-Konto im Basic-Tarif? Für den Admin ist das Pflicht.
4. Ist der Export vollständig, also Daten **und** Fotos? Das ist der Ausweg, falls Softr wegfällt.
5. Kann ein Softr-Workflow eine URL aufrufen? Nötig für den Website-Neubau beim „Ausstellen“.
6. Sind geteilte Werkstatt-Logins laut AGB erlaubt?
7. Funktioniert der Kamera-Upload vom iPhone (HEIC)?

### Testkriterien (Test-Abend: 20 echte Stücke, echtes Werkstatt-Gerät)
- Eine Mitarbeiterin oder ein Mitarbeiter erfasst ein Stück mit Foto **ohne Hilfe in < 2 Min.**
- Sie oder er findet ein bestimmtes Stück in der Übersicht **in < 30 Sek.**
- Der CSV-Export funktioniert. Der Preis ist in der Lager-App für alle Mitarbeitenden sichtbar (Entscheidung 02.10.2026), erscheint aber **nie auf der Website**.
- Claude baut die App **per MCP**, ohne dass der Admin klicken muss (Auftrag: `konzept/SOFTR-AUFTRAG.md`).

### Entscheidungsregel
- Kriterien erfüllt und offene Fragen 1 und 3 geklärt → **Softr final**.
- Sonst → **Baserow Cloud Free**:
  - Erfassung über die Formular-Ansicht.
  - Die Werkstatt arbeitet in vorgefertigten Ansichten.
  - Das Risiko, dass jemand Ansichten oder Felder verstellt, fangen Snapshots ab.
- Erst wenn beides scheitert → Eigenbau auf Cloudflare (D1, R2, Access).

### Website: Stand Astro-Umbau (04.10.2026)
- **Phase A fertig, wartet auf Abnahme:** Die V3-Website läuft 1:1 als statische Astro-Seite (Branch `astro-umbau`, Draft-PR #4, Vorschau `https://astro-umbau-kwm-redesign.entwicklung-7f3.workers.dev`). Bericht: `konzept/ASTRO-BERICHT.md`. Das Entwurf-Panel ist schon entfernt. Der alte Prototyp liegt in `archiv/`.
- **Was der Admin tun oder abnehmen muss:** immer aktuell in `konzept/ADMIN-OFFEN.md`.
- **Arbeitsweise (Admin, 04.10.2026):** Opus plant jede Phase fein und orchestriert; Sonnet-Subagents führen aus; Opus nur für sehr schwere Fälle und die Endprüfung. Pro Phase ein Branch mit Draft-PR und Vorschau; der Admin nimmt gesammelt ab.
- **Phasen:**

| Phase | Inhalt | Plan | Stand |
|---|---|---|---|
| A | Astro-Gerüst 1:1 | `konzept/PLAN-ASTRO-UMBAU.md` §7 | fertig, Abnahme offen |
| B | Varianten festschreiben (B-1), Fehler aus dem Audit beheben (B-2) | `konzept/PLAN-PHASE-B.md` | in Arbeit (Branch `phase-b-varianten`) |
| C | Asset-Pipeline: CSS/JS gebündelt, TypeScript strict, Bilder über `astro:assets`, Schriften über die Fonts API | `konzept/PLAN-PHASE-C.md` | Feinplanung fertig, startet nach B-1 |
| D | Komponenten-Bibliothek nach `DESIGN.md` §11, Inhalte als typisierte Daten in Sanity-Form | §10, Feinplanung folgt | offen |
| E | Technisches SEO und Härtung (Sitemap, Canonical/OG, JSON-LD, Sicherheits-Header, CSP) | `konzept/PLAN-PHASE-E.md` | Feinplanung fertig; E1–E3 nach B möglich, E4 nach C2 |
| 2–5 | Sanity, Formular-Worker, Einwilligung + GTM, Go-live | `konzept/AUFTRAG-ASTRO.md`, je eigener Plan | offen |

### Sonstiges
- Die MCP-Server stehen in `.mcp.json` (Astro, Cloudflare, Sanity, Softr). In dieser Cloud-Umgebung blockiert das Netzwerk sie. Lokal oder nach einer Freigabe der Domains funktionieren sie.
- Eine Live-Vorschau der lokalen Demos ist nicht möglich. Die Screenshots liegen in `konzept/vergleich/`, der Baserow-Export in `konzept/baserow-demo/`.
- Die Abschnitte 1–10 unten sind ältere Stände. Wo sie Abschnitt 0 widersprechen, gilt Abschnitt 0.
- Ab 04.10.2026 Design-Freeze für `src/v3/`. Änderungen erst nach dem Astro-Merge.

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
- `.agents/skills`: installierte Skills (Matt Pocock, Cloudflare, Sanity), `.claude/skills` verlinkt darauf. Stand in `skills-lock.json`
