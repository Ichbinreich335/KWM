import { defineCliConfig } from 'sanity/cli';

// Projekt „KWM“ (öffentliches Dataset): Es dürfen nur Website-Inhalte darin liegen,
// nie Preise, Bestand, Lagerorte, Verfügbarkeit oder Inventarnummern.
export default defineCliConfig({
  api: {
    projectId: '135lyh9t',
    dataset: 'production',
  },
  studioHost: 'kwm',
  deployment: {
    appId: 'v5029gqsmdi4cr5sk2rdlna1',
  },
  typegen: {
    // Die Website liegt eine Ebene höher; die Typen landen dort.
    path: '../src/**/*.{ts,tsx,astro}',
    schema: 'schema.json',
    generates: '../src/sanity/sanity.types.ts',
    overloadClientMethods: true,
  },
});
