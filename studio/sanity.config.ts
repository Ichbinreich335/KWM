import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { deDELocale } from '@sanity/locale-de-de';
import { schemaTypes } from './schemaTypes';
import { structure } from './src/structure';
import { EINZELNE_DOKUMENTE } from './src/singletons';

export default defineConfig({
  name: 'kwm',
  title: 'Keramische Werkstatt Margaretenhöhe',
  projectId: '135lyh9t',
  dataset: 'production',
  plugins: [structureTool({ structure }), deDELocale(), visionTool()],
  schema: {
    types: schemaTypes,
    // Einzeldokumente (Seiten, Werkstatt) gibt es genau einmal: kein Neu-Menü.
    templates: (templates) => templates.filter(({ schemaType }) => !EINZELNE_DOKUMENTE.has(schemaType)),
  },
  document: {
    // Einzeldokumente lassen sich bearbeiten und veröffentlichen, aber nicht löschen oder duplizieren.
    actions: (aktionen, { schemaType }) =>
      EINZELNE_DOKUMENTE.has(schemaType)
        ? aktionen.filter(({ action }) => action && !['delete', 'duplicate', 'unpublish'].includes(action))
        : aktionen,
  },
});
