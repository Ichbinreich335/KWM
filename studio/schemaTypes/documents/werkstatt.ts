import { CogIcon } from '@sanity/icons/Cog';
import { defineArrayMember, defineField, defineType } from 'sanity';

const wochentage = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].map((tag) => ({ title: tag, value: tag }));
const wochentagIndex = (tag: string) => wochentage.findIndex((eintrag) => eintrag.value === tag);
const UHRZEIT = /^([01]\d|2[0-3]):[0-5]\d$/;
const UHRZEIT_FEHLER = 'Bitte schreiben Sie die Uhrzeit mit zwei Ziffern, zum Beispiel 09:00.';

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
      description: 'Ein Eintrag pro Zeitraum, zum Beispiel „Montag bis Freitag, 09:00 bis 17:00“. Die Website schreibt die Tage selbst aus oder kürzt sie.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'zeitraum',
          title: 'Zeitraum',
          fields: [
            defineField({
              name: 'tagVon',
              title: 'Von Tag',
              description: 'Der erste Tag. Gilt der Eintrag nur für einen Tag, lassen Sie „Bis Tag“ leer.',
              type: 'string',
              options: { list: wochentage, layout: 'dropdown' },
              validation: (rule) => rule.required().error('Bitte wählen Sie einen Tag.'),
            }),
            defineField({
              name: 'tagBis',
              title: 'Bis Tag',
              description: 'Der letzte Tag, zum Beispiel Freitag. Leer lassen für einen einzelnen Tag.',
              type: 'string',
              options: { list: wochentage, layout: 'dropdown' },
              validation: (rule) =>
                rule.custom((tagBis, kontext) => {
                  const tagVon = (kontext.parent as { tagVon?: string } | undefined)?.tagVon;
                  if (!tagBis || !tagVon) return true;
                  return wochentagIndex(tagBis) > wochentagIndex(tagVon) ? true : '„Bis Tag“ muss nach „Von Tag“ liegen.';
                }),
            }),
            defineField({
              name: 'von',
              title: 'Von (Uhr)',
              description: 'Uhrzeit mit zwei Ziffern, zum Beispiel 09:00 oder 09:30.',
              type: 'string',
              validation: (rule) => rule.required().regex(UHRZEIT, { name: 'Uhrzeit' }).error(UHRZEIT_FEHLER),
            }),
            defineField({
              name: 'bis',
              title: 'Bis (Uhr)',
              description: 'Uhrzeit mit zwei Ziffern, zum Beispiel 17:00.',
              type: 'string',
              validation: (rule) =>
                rule
                  .required()
                  .regex(UHRZEIT, { name: 'Uhrzeit' })
                  .error(UHRZEIT_FEHLER)
                  .custom((bis, kontext) => {
                    const von = (kontext.parent as { von?: string } | undefined)?.von;
                    if (bis && von && UHRZEIT.test(bis) && UHRZEIT.test(von) && bis <= von) return '„Bis“ muss nach „Von“ liegen.';
                    return true;
                  }),
            }),
          ],
          preview: {
            select: { tagVon: 'tagVon', tagBis: 'tagBis', von: 'von', bis: 'bis' },
            prepare: ({ tagVon, tagBis, von, bis }) => ({
              title: tagBis ? `${tagVon} bis ${tagBis}` : tagVon,
              subtitle: `${von}–${bis} Uhr`,
            }),
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
