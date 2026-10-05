// Portable Text der Beschreibungen schlank in HTML-Absätze übersetzen: Absatz, fett, kursiv, Link.
import { escapeHTML, toHTML, uriLooksSafe } from '@portabletext/to-html';
import type { PortableTextBlock } from '@portabletext/types';
import type { AUSSTELLUNGEN_QUERY_RESULT } from './sanity.types';

type Block = NonNullable<NonNullable<AUSSTELLUNGEN_QUERY_RESULT[number]['beschreibung']>[number]>;

/** Der Block aus der Abfrage mit den Pflichtfeldern, die der Renderer verlangt */
const alsBlock = (block: Block): PortableTextBlock => ({
  _type: 'block',
  _key: block._key,
  style: 'normal',
  markDefs: (block.markDefs ?? []).map((definition) => ({ ...definition })),
  children: (block.children ?? []).map((kind) => ({
    _type: 'span',
    _key: kind._key,
    text: kind.text ?? '',
    marks: kind.marks ?? [],
  })),
});

/** Jeder Block wird ein Absatz (Inhalt für `<p>`); das Schema erlaubt nur Absatz, fett, kursiv und Link */
export function absaetze(blocks: readonly Block[] | null | undefined): string[] {
  return (blocks ?? [])
    .filter((block) => (block.children ?? []).some((kind) => (kind.text ?? '').trim() !== ''))
    .map((block) =>
      toHTML(alsBlock(block), {
        onMissingComponent: false,
        components: {
          block: { normal: ({ children }) => String(children ?? '') },
          marks: {
            strong: ({ children }) => `<strong>${children}</strong>`,
            em: ({ children }) => `<em>${children}</em>`,
            link: ({ children, value }) => {
              const href = String(value?.['href'] ?? '');
              return uriLooksSafe(href) ? `<a href="${escapeHTML(href)}">${children}</a>` : String(children);
            },
          },
        },
      }),
    );
}
