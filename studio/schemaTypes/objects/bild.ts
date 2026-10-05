import { defineField } from 'sanity';

/**
 * Gemeinsame Felder für Bilder. Ohne Alternativtext und Nachweis lässt sich ein Foto nicht veröffentlichen.
 * Die Felder stehen unter dem Bild im Studio.
 */
export const altFeld = defineField({
  name: 'alt',
  title: 'Bildbeschreibung (Alternativtext)',
  description:
    'Ein Satz, der das Bild beschreibt, für Menschen, die es nicht sehen können. Zum Beispiel: „Drei Schalen in Rot, Weiß und Braun auf einem Holztisch“.',
  type: 'string',
  validation: (rule) => rule.required().error('Bitte beschreiben Sie das Bild in einem Satz.'),
});

export const nachweisFeld = defineField({
  name: 'nachweis',
  title: 'Bildnachweis',
  description: 'Wer hat das Foto gemacht? Zum Beispiel: „Foto: Christopher Clem Franken“. Ist es unbekannt, schreiben Sie „Nachweis fehlt“.',
  type: 'string',
  validation: (rule) => rule.required().error('Bitte tragen Sie den Bildnachweis ein.'),
});

/** Gemeinsame Bildoptionen: Hotspot erlaubt das Festlegen des wichtigen Bildausschnitts. */
export const bildOptionen = { hotspot: true } as const;
