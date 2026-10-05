import { CalendarIcon } from '@sanity/icons/Calendar';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { altFeld, bildOptionen, bildunterschriftFeld, nachweisFeld } from '../objects/bild';

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
          { title: 'Kirche', value: 'kirche' },
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
      description:
        'Eine Zeile pro Abschnitt, zum Beispiel „Sonntag, 16. August 2026, 11 Uhr“ und darunter „Gottesdienst zur Ausstellung, 12.15 Uhr Eröffnung“. Leer lassen, wenn es keine Eröffnung gibt.',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
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
      description: 'Eine Zeile pro Abschnitt, zum Beispiel „Universitätsstraße 100“ und darunter „50674 Köln“.',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      fieldset: 'ortAngaben',
    }),
    defineField({
      name: 'oeffnungszeiten',
      title: 'Öffnungszeiten',
      description: 'Eine Zeile pro Zeitraum, zum Beispiel „Di–So 14.30–17.00 Uhr“ und darunter „Mi und Sa 10–12 Uhr“.',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'oeffnungszeitenBezeichnung',
      title: 'Überschrift der Öffnungszeiten',
      description: 'Nur ausfüllen, wenn es nicht einfach „Öffnungszeiten“ heißen soll, zum Beispiel „Öffnungszeiten Dom“ oder „Geöffnet“.',
      type: 'string',
      hidden: ({ document }) => !(document?.oeffnungszeiten as unknown[] | undefined)?.length,
    }),
    defineField({
      name: 'kooperation',
      title: 'In Kooperation mit',
      description: 'Eine Zeile pro Partner, zum Beispiel „Joachim Kern (Mode)“. Leer lassen, wenn es keine Partner gibt.',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
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
      description: 'Das wichtigste Foto der Ausstellung. Jedes Foto braucht eine Bildbeschreibung und einen Bildnachweis. Mit dem Fadenkreuz („Hotspot“) legen Sie fest, was beim Zuschneiden immer sichtbar bleibt.',
      type: 'image',
      options: bildOptionen,
      fields: [altFeld, bildunterschriftFeld, nachweisFeld],
      validation: (rule) => rule.required().error('Bitte laden Sie ein Hauptbild hoch.'),
    }),
    defineField({
      name: 'bilder',
      title: 'Weitere Bilder',
      description: 'Zusätzliche Fotos, zum Beispiel Ansichten der Ausstellung. Jedes braucht eine Bildbeschreibung und einen Bildnachweis.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: bildOptionen,
          fields: [altFeld, bildunterschriftFeld, nachweisFeld],
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
      description: 'Ein Verweis auf die Seite des Hauses oder auf eine Seite dieser Website. Leer lassen, wenn es keinen gibt.',
      type: 'object',
      fields: [
        defineField({
          name: 'text',
          title: 'Text des Links',
          description: 'Zum Beispiel „Zur Ausstellung im MOK“.',
          type: 'string',
          validation: (rule) => rule.required().error('Bitte geben Sie an, was auf dem Link stehen soll.'),
        }),
        defineField({
          name: 'url',
          title: 'Internetadresse',
          description: 'Mit „https://“ am Anfang. Für eine Seite dieser Website genügt zum Beispiel „/besuch“.',
          type: 'url',
          validation: (rule) =>
            rule
              .required()
              .uri({ scheme: ['http', 'https'], allowRelative: true })
              .error('Bitte geben Sie eine Internetadresse mit „https://“ oder eine Seite wie „/besuch“ ein.'),
        }),
      ],
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
