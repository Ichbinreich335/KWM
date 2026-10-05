import { describe, expect, it } from 'vitest';
import { absaetze } from './text';

const block = (
  children: { text: string; marks?: string[] }[],
  markDefs: { _key: string; _type: 'link'; href: string }[] = [],
) => ({
  _type: 'block' as const,
  _key: 'b',
  style: 'normal' as const,
  markDefs,
  children: children.map((kind, i) => ({ _type: 'span' as const, _key: `s${i}`, marks: [], ...kind })),
});

describe('absaetze', () => {
  it('macht aus jedem Block einen Absatz mit fett, kursiv und Link', () => {
    const html = absaetze([
      block(
        [{ text: 'Mit ' }, { text: 'fett', marks: ['strong'] }, { text: ' und ' }, { text: 'Link', marks: ['k'] }],
        [{ _key: 'k', _type: 'link', href: 'https://example.org/?a=1&b=2' }],
      ),
    ]);
    expect(html).toEqual(['Mit <strong>fett</strong> und <a href="https://example.org/?a=1&amp;b=2">Link</a>']);
  });
  it('maskiert HTML im Text und verwirft unsichere Links', () => {
    const html = absaetze([
      block([{ text: '<b>x</b>', marks: ['k'] }], [{ _key: 'k', _type: 'link', href: 'javascript:alert(1)' }]),
    ]);
    expect(html).toEqual(['&lt;b&gt;x&lt;/b&gt;']);
  });
  it('lässt leere Absätze weg und verträgt fehlende Beschreibung', () => {
    expect(absaetze([block([{ text: '  ' }])])).toEqual([]);
    expect(absaetze(null)).toEqual([]);
  });
});
