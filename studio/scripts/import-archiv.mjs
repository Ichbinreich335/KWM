// Einmaliger Import der Archiv-Auswahl 2016–2026 als ENTWÜRFE (drafts.*), dazu die Häuser der Orte.
// Aufruf: node scripts/import-archiv.mjs [--replace]
// Daten: scripts/archiv-daten.json (aus der früheren Datei src/data/archiv.ts und den Auftritten in src/data/orte.ts).
// Token: Umgebungsvariable SANITY_AUTH_TOKEN, sonst die Anmeldung der Sanity-CLI. Es wird nichts veröffentlicht.
// Ohne --replace bleiben vorhandene Entwürfe unangetastet, damit Änderungen im Studio nicht überschrieben werden.
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ersetzen = process.argv.includes('--replace');
const daten = JSON.parse(readFileSync(new URL('./archiv-daten.json', import.meta.url), 'utf8'));
const token =
  process.env.SANITY_AUTH_TOKEN ??
  JSON.parse(readFileSync(join(homedir(), '.config/sanity/config.json'), 'utf8')).authToken;
const client = createClient({ projectId: '135lyh9t', dataset: 'production', apiVersion: '2026-10-01', token, useCdn: false });

// Wie im Studio: schwache Referenz auf die veröffentlichte ID, wird beim Veröffentlichen des Ziels fest.
const ref = (id, typ) => ({ _type: 'reference', _ref: id, _weak: true, _strengthenOnPublish: { type: typ } });

const tx = client.transaction();
for (const { id, ort, galerie, ...felder } of daten.eintraege) {
  const dokument = {
    _id: `drafts.${id}`,
    _type: 'archivEintrag',
    ...felder,
    ...(ort ? { ort: ref(`ort-${ort}`, 'ort') } : {}),
    ...(galerie ? { galerie: ref(`galerie-${galerie}`, 'galerie') } : {}),
  };
  if (ersetzen) tx.createOrReplace(dokument);
  else tx.createIfNotExists(dokument);
}
// Häuser der Ortskacheln: nur setzen, wo noch keine stehen (ohne --replace).
for (const [ort, haeuser] of Object.entries(daten.haeuser)) {
  tx.patch(`drafts.ort-${ort}`, (patch) =>
    (ersetzen ? patch.set({ haeuser }) : patch.setIfMissing({ haeuser })),
  );
}
const ergebnis = await tx.commit();
console.log(`${daten.eintraege.length} Archiv-Entwürfe, ${Object.keys(daten.haeuser).length} Orte, ${ergebnis.results.length} Schreibvorgänge.`);
