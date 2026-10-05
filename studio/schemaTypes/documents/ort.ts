import { PinIcon } from '@sanity/icons/Pin';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { altFeld, bildOptionen } from '../objects/bild';

export const ort = defineType({
  name: 'ort',
  title: 'Ort',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'stadt',
      title: 'Stadt',
      description: 'Zum Beispiel „Köln“. Die Zahl der Ausstellungen pro Ort zählt die Website selbst.',
      type: 'string',
      validation: (rule) => rule.required().error('Bitte geben Sie die Stadt ein.'),
    }),
    defineField({
      name: 'land',
      title: 'Land',
      description: 'Zum Beispiel „Deutschland“ oder „Schweiz“.',
      type: 'string',
      validation: (rule) => rule.required().error('Bitte geben Sie das Land ein.'),
    }),
    defineField({
      name: 'kurztext',
      title: 'Kurztext',
      description: 'Ein bis zwei Sätze zu diesem Ort.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'bild',
      title: 'Bild',
      description: 'Ein Foto des Ortes oder Raumes. Es wird gedämpft dargestellt.',
      type: 'image',
      options: bildOptionen,
      fields: [altFeld],
    }),
    defineField({
      name: 'haeuser',
      title: 'Häuser',
      description:
        'Die Museen, Galerien und Räume, in denen Young-Jae Lee hier gezeigt wurde, eine Zeile pro Haus. Sie stehen so in der Kachel.',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'reihenfolge',
      title: 'Reihenfolge',
      description: 'Die kleinste Zahl steht zuerst. Zum Beispiel 1, 2, 3.',
      type: 'number',
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  orderings: [{ title: 'Reihenfolge', name: 'reihenfolge', by: [{ field: 'reihenfolge', direction: 'asc' }] }],
  preview: {
    select: { title: 'stadt', subtitle: 'land', media: 'bild' },
  },
});
