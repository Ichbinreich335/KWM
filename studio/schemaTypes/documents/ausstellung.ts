import { CalendarIcon } from '@sanity/icons/Calendar';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { altFeld, bildOptionen, nachweisFeld } from '../objects/bild';

export const ausstellung = defineType({
  name: 'ausstellung',
  title: 'Ausstellung',
  type: 'document',
  icon: CalendarIcon,
  fieldsets: [
    { name: 'zeit', title: 'Wann?', options: { columns: 2 } },
    { name: 'ortAngaben', title: 'Wo?' },
  ],
  fields: [
    defineField({
      name: 'titel',
      title: 'Titel',
      description: 'So heißt die Ausstellung, zum Beispiel „99 Schalen“.',
      type: 'string',
      validation: (rule) => rule.required().error('Bitte geben Sie einen Titel ein.'),
    }),
    defineField({
      name: 'art',
      title: 'Art der Ausstellung',
      type: 'string',
      options: {
        list: [
          { title: 'Museum', value: 'museum' },
          { title: 'Galerie', value: 'galerie' },
          { title: 'Werkstatt', value: 'werkstatt' },
          { title: 'Messe', value: 'messe' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required().error('Bitte wählen Sie eine Art.'),
    }),
    defineField({
      name: 'start',
      title: 'Beginn',
      description: 'Der erste Tag der Ausstellung.',
      type: 'date',
      fieldset: 'zeit',
      validation: (rule) => rule.required().error('Bitte geben Sie den ersten Tag ein.'),
    }),
    defineField({
      name: 'ende',
      title: 'Ende',
      description: 'Der letzte Tag der Ausstellung. Danach wandert sie automatisch ins Archiv.',
      type: 'date',
      fieldset: 'zeit',
      validation: (rule) =>
        rule
          .required()
          .error('Bitte geben Sie den letzten Tag ein.')
          .custom((ende, kontext) => {
            const start = (kontext.document as { start?: string } | undefined)?.start;
            if (ende && start && ende < start) return 'Das Ende darf nicht vor dem Beginn liegen.';
            return true;
          }),
    }),
    defineField({
      name: 'eroeffnung',
      title: 'Eröffnung',
      description: 'Wann ist die Eröffnung? Zum Beispiel „Samstag, 10. Oktober, 15 Uhr“. Leer lassen, wenn es keine gibt.',
      type: 'string',
    }),
    defineField({
      name: 'ort',
      title: 'Ort',
      description: 'Die Stadt, in der die Ausstellung stattfindet. Fehlt sie in der Liste, legen Sie unter „Orte und Galerien“ einen neuen Ort an.',
      type: 'reference',
      to: [{ type: 'ort' }],
      fieldset: 'ortAngaben',
      validation: (rule) => rule.required().error('Bitte wählen Sie einen Ort.'),
    }),
    defineField({
      name: 'galerie',
      title: 'Galerie',
      description: 'Nur auswählen, wenn die Ausstellung in einer Galerie stattfindet, die wir vertreten oder die uns zeigt.',
      type: 'reference',
      to: [{ type: 'galerie' }],
      fieldset: 'ortAngaben',
    }),
    defineField({
      name: 'haus',
      title: 'Name des Hauses',
      description: 'Zum Beispiel „Museum für Ostasiatische Kunst (MOK)“.',
      type: 'string',
      fieldset: 'ortAngaben',
      validation: (rule) => rule.required().error('Bitte geben Sie den Namen des Hauses ein.'),
    }),
    defineField({
      name: 'adresse',
      title: 'Adresse',
      description: 'Straße, Hausnummer, Postleitzahl und Stadt.',
      type: 'string',
      fieldset: 'ortAngaben',
    }),
    defineField({
      name: 'oeffnungszeiten',
      title: 'Öffnungszeiten',
      description: 'Wann ist die Ausstellung geöffnet? Zum Beispiel „Di–So 10–18 Uhr“.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'beschreibung',
      title: 'Beschreibung',
      description: 'Ein kurzer Text zur Ausstellung. Erlaubt sind Absätze, fett, kursiv und Links.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [
              { title: 'Fett', value: 'strong' },
              { title: 'Kursiv', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'Adresse des Links',
                    type: 'url',
                    validation: (rule) => rule.uri({ scheme: ['http', 'https', 'mailto'] }).required(),
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'hauptbild',
      title: 'Hauptbild',
      description: 'Das wichtigste Foto der Ausstellung. Mit dem Fadenkreuz („Hotspot“) legen Sie fest, was beim Zuschneiden immer sichtbar bleibt.',
      type: 'image',
      options: bildOptionen,
      fields: [altFeld, nachweisFeld],
      validation: (rule) => rule.required().error('Bitte laden Sie ein Hauptbild hoch.'),
    }),
    defineField({
      name: 'bilder',
      title: 'Weitere Bilder',
      description: 'Zusätzliche Fotos. Jedes braucht eine Bildbeschreibung und einen Nachweis.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: bildOptionen,
          fields: [altFeld, nachweisFeld],
        }),
      ],
    }),
    defineField({
      name: 'flyer',
      title: 'Flyer',
      description: 'Der Flyer oder die Einladungskarte als Bild. Die Besucher sehen eine Vorschau und können sie vergrößern.',
      type: 'image',
      fields: [
        defineField({
          ...altFeld,
          description: 'Titel, Datum und Ort, wie sie auf dem Flyer stehen. Zum Beispiel: „Flyer: 99 Schalen, 10. Oktober bis 3. Januar, Köln“.',
        }),
      ],
    }),
    defineField({
      name: 'link',
      title: 'Link zur Ausstellung',
      description: 'Die Internetadresse des Hauses oder der Ausstellung, mit „https://“ am Anfang.',
      type: 'url',
      validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'spotlight',
      title: 'Groß auf der Startseite zeigen',
      description:
        'Ja: Diese Ausstellung steht groß und mit allen Angaben auf der Startseite. Es sollte immer nur eine laufende Ausstellung so markiert sein.',
      type: 'boolean',
      initialValue: false,
      validation: (rule) =>
        rule.custom(async (spotlight, kontext) => {
          if (!spotlight) return true;
          const dokument = kontext.document as { _id: string; ende?: string } | undefined;
          if (!dokument) return true;
          const id = dokument._id.replace(/^drafts\./, '');
          const heute = new Date().toISOString().slice(0, 10);
          const andere = await kontext
            .getClient({ apiVersion: '2026-10-01' })
            .fetch<number>(
              'count(*[_type == "ausstellung" && spotlight == true && ende >= $heute && !(_id in [$id, "drafts." + $id])])',
              { heute, id },
            );
          return andere > 0 ? 'Es ist schon eine andere laufende Ausstellung groß markiert. Eine Ausstellung reicht.' : true;
        }).warning(),
    }),
  ],
  orderings: [
    { title: 'Beginn, neueste zuerst', name: 'startDesc', by: [{ field: 'start', direction: 'desc' }] },
    { title: 'Beginn, älteste zuerst', name: 'startAsc', by: [{ field: 'start', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'titel', haus: 'haus', start: 'start', ende: 'ende', media: 'hauptbild' },
    prepare: ({ title, haus, start, ende, media }) => ({
      title,
      subtitle: [haus, start && ende ? `${start} bis ${ende}` : undefined].filter(Boolean).join(' · '),
      media,
    }),
  },
});
