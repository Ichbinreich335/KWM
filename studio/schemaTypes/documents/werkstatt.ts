import { CogIcon } from '@sanity/icons/Cog';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const werkstatt = defineType({
  name: 'werkstatt',
  title: 'Werkstatt (Kontakt und Zeiten)',
  type: 'document',
  icon: CogIcon,
  fieldsets: [
    { name: 'anschrift', title: 'Anschrift' },
    { name: 'kontakt', title: 'Kontakt' },
  ],
  fields: [
    defineField({
      name: 'firma',
      title: 'Name der Firma',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'strasse',
      title: 'Straße und Hausnummer',
      type: 'string',
      fieldset: 'anschrift',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'plz',
      title: 'Postleitzahl',
      type: 'string',
      fieldset: 'anschrift',
      validation: (rule) => rule.required().regex(/^\d{5}$/, { name: 'PLZ', invert: false }).error('Die Postleitzahl hat fünf Ziffern.'),
    }),
    defineField({
      name: 'ort',
      title: 'Ort',
      type: 'string',
      fieldset: 'anschrift',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'adresszusatz',
      title: 'Zusatz zur Adresse',
      description: 'Zum Beispiel „auf dem Gelände der Zeche Zollverein“.',
      type: 'string',
      fieldset: 'anschrift',
    }),
    defineField({
      name: 'telefon',
      title: 'Telefon',
      description: 'Mit Landesvorwahl, zum Beispiel „+49 201 30 50 80“.',
      type: 'string',
      fieldset: 'kontakt',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'E-Mail',
      type: 'string',
      fieldset: 'kontakt',
      validation: (rule) => rule.required().email().error('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
    }),
    defineField({
      name: 'englischeSeite',
      title: 'Englische Website',
      description: 'Die Internetadresse der englischen Seite, mit „https://“ am Anfang.',
      type: 'url',
      fieldset: 'kontakt',
      validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'nahverkehr',
      title: 'Nahverkehr',
      description: 'Die nächste Haltestelle, zum Beispiel „Haltestelle Katernberg Süd“.',
      type: 'string',
      fieldset: 'anschrift',
    }),
    defineField({
      name: 'oeffnungszeiten',
      title: 'Öffnungszeiten',
      description: 'Eine Zeile pro Zeitraum, zum Beispiel „Montag bis Freitag, 9 bis 17“.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'zeitraum',
          title: 'Zeitraum',
          fields: [
            defineField({
              name: 'wochentage',
              title: 'Wochentage',
              description: 'Zum Beispiel „Montag bis Freitag“ oder „Samstag“.',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'von',
              title: 'Von (Uhr)',
              description: 'Zum Beispiel 9 oder 9:30.',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'bis',
              title: 'Bis (Uhr)',
              description: 'Zum Beispiel 17.',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'wochentage', von: 'von', bis: 'bis' },
            prepare: ({ title, von, bis }) => ({ title, subtitle: `${von}–${bis} Uhr` }),
          },
        }),
      ],
    }),
    defineField({
      name: 'hinweisZeiten',
      title: 'Hinweis zu den Zeiten',
      description: 'Zum Beispiel „sonst nach Vereinbarung“.',
      type: 'string',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Werkstatt (Kontakt und Zeiten)' }),
  },
});
