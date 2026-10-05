import { BellIcon } from '@sanity/icons/Bell';
import { defineField, defineType } from 'sanity';

export const hinweis = defineType({
  name: 'hinweis',
  title: 'Hinweis',
  type: 'document',
  icon: BellIcon,
  fields: [
    defineField({
      name: 'text',
      title: 'Text',
      description: 'Eine kurze Mitteilung für die Besucher, zum Beispiel „Am 3. Oktober geschlossen“.',
      type: 'string',
      validation: (rule) => rule.required().max(160).error('Bitte geben Sie einen kurzen Text ein (höchstens 160 Zeichen).'),
    }),
    defineField({
      name: 'gueltigVon',
      title: 'Gültig ab',
      description: 'Ab diesem Tag steht der Hinweis auf der Website.',
      type: 'date',
      validation: (rule) => rule.required().error('Bitte geben Sie den ersten Tag ein.'),
    }),
    defineField({
      name: 'gueltigBis',
      title: 'Gültig bis',
      description: 'Nach diesem Tag verschwindet der Hinweis von selbst. Die Seite wird dafür jede Nacht neu gebaut.',
      type: 'date',
      validation: (rule) =>
        rule
          .required()
          .error('Bitte geben Sie den letzten Tag ein.')
          .custom((bis, kontext) => {
            const von = (kontext.document as { gueltigVon?: string } | undefined)?.gueltigVon;
            if (bis && von && bis < von) return 'Das Ende darf nicht vor dem Beginn liegen.';
            return true;
          }),
    }),
    defineField({
      name: 'wichtig',
      title: 'Hervorheben',
      description: 'Ja: Der Hinweis wird auffälliger dargestellt.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'text', von: 'gueltigVon', bis: 'gueltigBis', wichtig: 'wichtig' },
    prepare: ({ title, von, bis, wichtig }) => ({
      title: `${wichtig ? '! ' : ''}${title}`,
      subtitle: von && bis ? `${von} bis ${bis}` : undefined,
    }),
  },
});
