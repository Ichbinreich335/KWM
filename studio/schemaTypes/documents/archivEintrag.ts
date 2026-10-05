import { ArchiveIcon } from '@sanity/icons/Archive';
import { defineField, defineType } from 'sanity';

/**
 * Schlanker Eintrag für vergangene Ausstellungen seit 2016: Er speist die Liste „Vergangene Ausstellungen“
 * auf der Seite Aktuelles und, zusammen mit den Ausstellungen, die Zahlen der Ausstellungsorte.
 */
export const archivEintrag = defineType({
  name: 'archivEintrag',
  title: 'Archiv-Eintrag',
  type: 'document',
  icon: ArchiveIcon,
  fields: [
    defineField({
      name: 'jahr',
      title: 'Jahr in der Liste',
      description: 'Unter diesem Jahr steht der Eintrag in der Liste, in der Regel das Jahr des Endes.',
      type: 'number',
      validation: (rule) => rule.required().integer().min(1980).max(2100).error('Bitte geben Sie ein Jahr ein.'),
    }),
    defineField({
      name: 'beginnJahr',
      title: 'Jahr des Beginns',
      description:
        'Nur ausfüllen, wenn die Ausstellung in einem früheren Jahr begann. Die Ausstellungsorte zählen nach dem Jahr des Beginns.',
      type: 'number',
      validation: (rule) => rule.integer().min(1980).max(2100),
    }),
    defineField({
      name: 'reihenfolge',
      title: 'Reihenfolge im Jahr',
      description: 'Die kleinste Zahl steht zuerst. Zum Beispiel 10, 20, 30; so bleibt Platz für Einschübe.',
      type: 'number',
      validation: (rule) => rule.required().integer().min(0).error('Bitte geben Sie eine Zahl ein.'),
    }),
    defineField({
      name: 'inListe',
      title: 'In der Liste zeigen',
      description: 'Nein: Der Eintrag zählt nur für die Ausstellungsorte und steht nicht in der Liste.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'titel',
      title: 'Titel',
      description: 'Zum Beispiel „Young-Jae Lee: Keramik“. Fehlt ein Titel, steht der Name des Hauses an seiner Stelle.',
      type: 'string',
    }),
    defineField({
      name: 'ortszeile',
      title: 'Ort in der Liste',
      description: 'Die Zeile unter dem Titel, zum Beispiel „Galerie Jahn und Jahn, München“.',
      type: 'string',
      hidden: ({ document }) => document?.inListe === false,
    }),
    defineField({
      name: 'datum',
      title: 'Zeitraum in der Liste',
      description: 'Ohne Jahr, wenn es aus dem Jahr der Liste folgt, zum Beispiel „14. März – 26. April“.',
      type: 'string',
      hidden: ({ document }) => document?.inListe === false,
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'object',
      hidden: ({ document }) => document?.inListe === false,
      fields: [
        defineField({ name: 'text', title: 'Text des Links', type: 'string', validation: (rule) => rule.required() }),
        defineField({
          name: 'url',
          title: 'Internetadresse',
          description: 'Mit „https://“ am Anfang.',
          type: 'url',
          validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] }),
        }),
      ],
    }),
    defineField({
      name: 'ort',
      title: 'Ort',
      description: 'Nur auswählen, wenn die Stadt als Ausstellungsort auf der Startseite steht.',
      type: 'reference',
      to: [{ type: 'ort' }],
    }),
    defineField({
      name: 'haus',
      title: 'Haus',
      description: 'Name des Hauses, wie er in der Kachel des Ortes steht. Pflicht, wenn ein Ort gewählt ist.',
      type: 'string',
      validation: (rule) =>
        rule.custom((haus, kontext) =>
          (kontext.document as { ort?: unknown } | undefined)?.ort && !haus ? 'Bitte geben Sie das Haus ein.' : true,
        ),
    }),
    defineField({
      name: 'galerie',
      title: 'Galerie',
      description: 'Nur auswählen, wenn die Ausstellung in einer Galerie stattfand, die in „Galerien“ steht.',
      type: 'reference',
      to: [{ type: 'galerie' }],
    }),
  ],
  orderings: [
    {
      title: 'Jahr, neueste zuerst',
      name: 'jahrDesc',
      by: [
        { field: 'jahr', direction: 'desc' },
        { field: 'reihenfolge', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: { titel: 'titel', haus: 'haus', zeile: 'ortszeile', jahr: 'jahr' },
    prepare: ({ titel, haus, zeile, jahr }) => ({
      title: titel ?? haus ?? zeile ?? 'Eintrag',
      subtitle: [jahr, zeile].filter(Boolean).join(' · '),
    }),
  },
});
