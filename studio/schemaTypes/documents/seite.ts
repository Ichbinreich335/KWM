import { DocumentIcon } from '@sanity/icons/Document';
import { defineField, defineType } from 'sanity';

export const seite = defineType({
  name: 'seite',
  title: 'Seite',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'titel',
      title: 'Überschrift',
      description: 'Die große Überschrift ganz oben auf der Seite.',
      type: 'string',
      validation: (rule) => rule.required().error('Bitte geben Sie eine Überschrift ein.'),
    }),
    defineField({
      name: 'einleitung',
      title: 'Einleitung',
      description: 'Der Text direkt unter der Überschrift.',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'beschreibung',
      title: 'Beschreibung für Suchmaschinen',
      description:
        'Zwei Sätze, die Google & Co. unter dem Seitentitel anzeigen. Am besten höchstens 160 Zeichen, sonst wird der Text abgeschnitten.',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(160).warning('Länger als 160 Zeichen: Suchmaschinen schneiden den Rest ab.'),
    }),
  ],
  preview: {
    select: { title: 'titel', subtitle: 'einleitung' },
  },
});
