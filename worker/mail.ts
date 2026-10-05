import type { Anfrage } from '../src/lib/anfrage';

const MAX_BETREFF_ZEICHEN = 120;
// Steuerzeichen (auch Zeilenumbrüche) und Anführungszeichen/Klammern, die in Kopfzeilen nichts zu suchen haben
// eslint-disable-next-line no-control-regex
const KOPFZEILE_UNERWUENSCHT = /[\u0000-\u001f\u007f"<>]+/g;

/** Wert für Betreff oder Anzeigename: eine Zeile, keine Steuerzeichen, damit keine Kopfzeilen eingeschleust werden. */
export const alsKopfzeile = (wert: string): string =>
  wert.replace(KOPFZEILE_UNERWUENSCHT, ' ').replace(/\s+/g, ' ').trim();

const zeilenumbruecheNormalisieren = (text: string) => text.replace(/\r\n?/g, '\n');

/** Reiner Text (nie HTML); alle Werte stehen als Text im Körper. */
export function baueMail(anfrage: Anfrage, absender: string, ziel: string): EmailMessageBuilder {
  const anliegen = anfrage.stueck || 'Allgemein';
  const betreff = alsKopfzeile(`Anfrage: ${anliegen}`).slice(0, MAX_BETREFF_ZEICHEN);
  const text = [
    zeilenumbruecheNormalisieren(anfrage.nachricht),
    '',
    '---',
    `Name: ${alsKopfzeile(anfrage.name)}`,
    `E-Mail: ${anfrage.email}`,
    `Telefon: ${anfrage.telefon || '-'}`,
    `Anliegen: ${alsKopfzeile(anliegen)}`,
  ].join('\n');
  return {
    from: { email: absender, name: 'Anfrage-Formular KWM' },
    to: ziel,
    replyTo: { email: anfrage.email, name: alsKopfzeile(anfrage.name) },
    subject: betreff,
    text,
  };
}
