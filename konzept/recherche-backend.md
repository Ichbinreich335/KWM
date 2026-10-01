# Recherche Backend: Lager-App und Website-Verwaltung (Stand 2026-10-01)

Konsolidiert aus vier Recherche-Läufen. Die Herstellerseiten waren für den Abruf gesperrt, daher stammen fast alle Preise aus Sekundärquellen. **Vor einer Entscheidung auf der Herstellerseite gegenprüfen.**

## Anforderungen (Stand Interview Runde 1)

- **Lager-App:** 1–5 Bearbeiter (Laien). Eine Tabelle mit Auswahlfeldern und Filtern. Felder und Ansichten legt nur der Admin fest. Fotos vom Handy, Bestand und Stückzahlen. Interne Preise dürfen nie öffentlich werden.
- **Website-Verwaltung:** nur der Admin. Mitarbeitende haben dort keinen Zugriff, die Trennung muss hart sein.
- **Verknüpfung Lager → Website** (Ausstellungsstücke): Kein Entscheidungskriterium, muss aber technisch möglich sein.
- **Betrieb:** am liebsten ein fertiger Dienst in der EU mit automatischen Updates. Höchstens 10–20 €/Monat. Soll 5 Jahre stabil laufen.

## Kernbefunde

| Kandidat | Rechte-Trennung im Budget | Kosten (1 Admin + 1–5) | Betrieb | Kernproblem |
|---|---|---|---|---|
| Sanity | nein (Custom Roles vermutlich nur Enterprise) | 30–90 $ | voll verwaltet | Kosten pro Platz, keine Trennung |
| Storyblok (AT) | erst ab 349 € | 0–99 € | voll verwaltet | Rollen teuer, kein Tabellen-Lager |
| Hygraph (DE) | nur Enterprise | 0 / 199 $ | voll verwaltet | Rollen |
| DatoCMS (IT) | ab 149 € | 0 / 149 € | voll verwaltet | Free: nur 200 MB Dateien, 300 Einträge |
| Prismic (FR) | ab 150 $ | – | voll verwaltet | Rollen |
| Contentful | nur Premium | ab 300 $ | voll verwaltet | Kosten, Übernahme durch Salesforce |
| **Strapi Cloud (FR)** | **ja (Custom Roles + Feldrechte kostenlos)** | **15–18 $** | halb verwaltet (Versions-Updates macht der Admin) | Plätze, EU-Region und Schemaänderung nur per Code: offen |
| Directus | ja (selbst gehostet, Förderprogramm/OIG) | 0 Lizenz + Hosting ~11–17 $ (Elestio) | selbst gehostet / Elestio | Lizenz (MSCL, Förderprogramm jährlich), US-Firma |
| Payload | ja (im Code) | ~7–18 € Hosting | selbst betreiben, kein verwalteter Dienst | Payload Cloud geschlossen, viele kritische Lücken 2026, Cloudflare-Variante instabil |
| Kirby (DE) | ja (Blueprints) | 99 € einmalig + PHP-Hosting | selbst gehostet, Updates manuell | Betrieb |
| EmDash | nein (5 feste Rollen) | ~5 $ | eigenes Cloudflare-Konto | Rechte zu grob, jung (1.1.0 vom 1.10.2026) |
| SeaTable (DE) | ja, ab Plus | 7 € pro Nutzer (~21–35 €) | voll verwaltet, Rechenzentrum DE | Kosten pro Nutzer; Spalten-Schutz für Bearbeiter testen |
| Baserow (NL) | erst Advanced (18 $ pro Nutzer) | ~54–90 $ | voll verwaltet | Kosten |
| Grist | ja (Access Rules) | self-hosted ~11–17 $ | Elestio | SaaS nur USA, Galerie schwach |
| Airtable | – | – | – | EU nur Enterprise, Übernahme durch Bending Spoons |

## Querbefunde

- **Lesezugriff für die Website:** Keine Datenbank-App (SeaTable, Baserow, Airtable, NocoDB) bietet einen Lese-Zugang, der sich auf einzelne Spalten beschränken lässt. Interne Preise lassen sich dort also nicht per API ausblenden. CMS-Systeme mit Feldrechten (Strapi, Directus, Payload) können das.
- **Payload:** Payload Cloud nimmt keine neuen Projekte an. 2026 gab es mehrere kritische Lücken in der Rechteverwaltung, zuletzt 18.–29.09.2026, darunter das Auslesen gesperrter Felder. Auf Cloudflare ist der D1-Adapter Beta, und Issue #18274 (Admin-Login nach Sicherheits-Update kaputt) ist offen.
- **Elestio (IE, Server bei Hetzner DE):** Kleine Updates und tägliche Backups automatisch, große Versionssprünge löst man selbst aus. AVV öffentlich. Ab ca. 11–17 $.
- **Preisstabilität:** Fast alle Anbieter haben 2025/26 ihre Tarife geändert. Am kleinsten ist das Risiko bei MIT-Software und Einmal-Lizenzen.

## Offene Prüfpunkte

1. Strapi Cloud Essential: Wie viele Admin-Nutzer sind enthalten? Ist eine EU-Region wählbar? Gibt es einen AVV?
2. Sanity Growth: Gibt es Custom Roles? Wird pro Projekt oder pro Organisation abgerechnet?
3. Directus: Bedingungen des Förderprogramms (Schwelle in USD, Widerruf), aktuelle Cloud-Tarife nach v12.
4. SeaTable Plus: Kann ein Bearbeiter Spalten ändern? Was sieht ein API-Token?
5. Sanity Free, Hygraph Hobby: Ist gewerbliche Nutzung erlaubt?
