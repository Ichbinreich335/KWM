import { describe, expect, it } from 'vitest';
import { liesAnfrage, MAX_ZEICHEN, pruefeAnfrage, pruefeFeld, type Anfrage } from '../src/lib/anfrage';

const gueltig: Anfrage = {
  name: 'Erika Mustermann',
  email: 'erika@beispiel.de',
  telefon: '+49 201 30 50 80',
  stueck: 'Teeschale',
  nachricht: 'Gibt es die Schale in Blau?',
};

describe('gemeinsame Regeln', () => {
  it('akzeptiert eine vollständige Anfrage', () => {
    expect(pruefeAnfrage(gueltig)).toEqual({});
  });

  it('verlangt Name, E-Mail und Nachricht, Telefon und Anliegen sind freiwillig', () => {
    const fehler = pruefeAnfrage({ name: '', email: '', telefon: '', stueck: '', nachricht: '' });
    expect(Object.keys(fehler).sort()).toEqual(['email', 'nachricht', 'name']);
  });

  it.each(['ohne-at.de', 'a@b', 'a b@c.de', 'a@b.c', 'a<b@c.de', 'a@c.de>', 'a,b@c.de', '"a"@c.de'])(
    'lehnt die E-Mail-Adresse %s ab',
    (email) => {
      expect(pruefeFeld('email', email)).toMatch(/E-Mail-Adresse/);
    },
  );

  it('lehnt Buchstaben in der Telefonnummer ab', () => {
    expect(pruefeFeld('telefon', '0201 abc')).toMatch(/Ziffern/);
  });

  it('trimmt Werte vor der Prüfung', () => {
    expect(pruefeFeld('name', '   ')).toMatch(/Namen/);
  });

  it.each(Object.entries(MAX_ZEICHEN))('begrenzt %s auf %i Zeichen', (schluessel, max) => {
    const wert =
      schluessel === 'email'
        ? `${'a'.repeat(max)}@beispiel.de`
        : schluessel === 'telefon'
          ? '1'.repeat(max + 1)
          : 'x'.repeat(max + 1);
    expect(pruefeFeld(schluessel as keyof Anfrage, wert)).toMatch(/zu lang/);
  });

  it('liest unbekannte Daten nur als Zeichenketten', () => {
    expect(liesAnfrage({ name: ' Eva ', email: 5, nachricht: ['x'] })).toEqual({
      name: 'Eva',
      email: '',
      telefon: '',
      stueck: '',
      nachricht: '',
    });
    expect(liesAnfrage(null).name).toBe('');
  });
});
