# Task 2.1: Studio, Schema, Entwürfe (Teil 1)

Commit: 7b24652 (Branch phase-2-sanity, gepusht). Studio: https://kwm.sanity.studio/ (App-ID v5029gqsmdi4cr5sk2rdlna1, in studio/sanity.cli.ts).

Schema (studio/schemaTypes): ausstellung, ort, galerie, hinweis, seite, werkstatt nach Plan-Tabelle. Bilder mit Hotspot, alt und nachweis Pflicht (Flyer, Ortsbild: nur alt). Kein Feld für Preis, Bestand, Lagerort, Verfügbarkeit, Inventarnummer.
Abweichungen: werkstatt hat zusätzlich `adresszusatz` (Zeche Zollverein steht in kontakt.ts); Werkstatt-Dokument-ID ist `werkstatt-kontakt`, weil `werkstatt` als Seiten-ID belegt ist; Meta-Beschreibung max. 160 nur als Warnung (heutige Texte sind teils länger); Spotlight-Prüfung ist Warnung.
Structure: Ausstellungen (Laufend und kommend / Archiv per GROQ auf `ende`), Orte und Galerien, Hinweise, Seiten (7 feste IDs), Werkstatt. Einzeldokumente ohne Neu, Löschen, Duplizieren, Rückgängig-Veröffentlichen. Oberfläche Deutsch (@sanity/locale-de-de).
Website-Werkzeuge: studio/ in Prettier-, ESLint-Ignore und tsconfig-Exclude; `npm run check` ruft zuletzt `check:studio` (tsc, schemas validate, sanity build). CI installiert vorher `npm run studio:install`. Hinweis: `sanity build` braucht die Wurzel-node_modules (findet sonst die Astro-tsconfig nicht), in CI ist das gegeben.
TypeGen: src/sanity/sanity.types.ts, schema.json im Repo (studio/). `npm --prefix studio run typegen`.
Geprüft: sanity schemas validate 0 Fehler/0 Warnungen, sanity build grün, npm run check grün (Wurzel, 13 Seiten gebaut), Schema und Studio per CLI deployt (MCP deploy_schema nicht genutzt, da lokales Studio vorhanden).
Entwürfe (nicht veröffentlicht, wörtlich aus src/pages und kontakt.ts): seite startseite, aktuelles, meisterstuecke, manufaktur, young-jae-lee, werkstatt, besuch; werkstatt `werkstatt-kontakt`.
Screens .shots/sanity-studio/: nur Login-Seiten (lokal 3333 und gehostet, 1440 und 390), da das Studio ohne Login nicht einsehbar ist. Studio-Inneres ungesehen; Admin sollte einmal einloggen und prüfen.
Blocker: keine. Offen für Admin: Login im Studio prüfen; Kontaktzeiten als "9"/"17" gespeichert (Website formatiert später); CORS-Eintrag für die Website folgt in Teil 2; Seite besuch-Titel "Besuchen Sie die Werkstatt." ist wörtlich übernommen.
