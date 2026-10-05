import { HomeIcon } from '@sanity/icons/Home';
import { defineField, defineType } from 'sanity';

export const galerie = defineType({
  name: 'galerie',
  title: 'Galerie',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name der Galerie',
      type: 'string',
      validation: (rule) => rule.required().error('Bitte geben Sie den Namen ein.'),
    }),
    defineField({
      name: 'stadt',
      title: 'Stadt',
      type: 'string',
      validation: (rule) => rule.required().error('Bitte geben Sie die Stadt ein.'),
    }),
    defineField({
      name: 'adresse',
      title: 'Adresse',
      description: 'Straße, Hausnummer, Postleitzahl und Stadt.',
      type: 'string',
    }),
    defineField({
      name: 'link',
      title: 'Internetadresse',
      description: 'Mit „https://“ am Anfang.',
      type: 'url',
      validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'vertretung',
      title: 'Vertritt Young-Jae Lee',
      description: 'Ja: Diese Galerie vertritt Young-Jae Lee. Die Website führt sie dann im Kopf der Ausstellungsorte.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'vertretungSeit',
      title: 'Vertretung seit (Jahr)',
      description: 'Zum Beispiel 2019. Leer lassen, wenn unbekannt.',
      type: 'number',
      hidden: ({ parent }) => !parent?.vertretung,
      validation: (rule) => rule.integer().min(1900).max(2100),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'stadt' },
  },
});
