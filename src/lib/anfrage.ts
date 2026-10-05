// Gemeinsame Regeln des Anfrageformulars: Das Browser-Skript (sig-anfrage.ts) und der Worker (worker/) importieren
// dieses Modul. Ohne DOM- und Workers-Abhängigkeit, damit beide Tsconfigs es übersetzen können.

export const ANFRAGE_PFAD = '/api/anfrage';

/** Feld mit dem Turnstile-Token im Anfrage-Body (Name, den das Turnstile-Widget selbst verwendet) */
export const TURNSTILE_FELD = 'cf-turnstile-response';
/** Honigtopf-Feld: Menschen sehen es nicht und lassen es leer, Bots füllen es oft aus. */
export const HONIGTOPF_FELD = 'website';

/** Obergrenze für den gesamten Body: 4000 Zeichen Nachricht mit Umlauten plus die übrigen Felder und das Token. */
export const MAX_BODY_BYTES = 16 * 1024;
/** Turnstile-Tokens sind laut Doku höchstens 2048 Zeichen lang. */
export const MAX_TOKEN_ZEICHEN = 2048;

export const FELD_SCHLUESSEL = ['name', 'email', 'telefon', 'stueck', 'nachricht'] as const;
export type FeldSchluessel = (typeof FELD_SCHLUESSEL)[number];
export type Anfrage = Record<FeldSchluessel, string>;
export type FeldFehler = Partial<Record<FeldSchluessel, string>>;

export const MAX_ZEICHEN: Record<FeldSchluessel, number> = {
  name: 100,
  email: 254,
  telefon: 40,
  stueck: 400,
  nachricht: 4000,
};

const EMAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEFON_MUSTER = /^[0-9 +()/.-]{5,}$/;

const zuLang = (feld: string, max: number) => `${feld} ist zu lang (höchstens ${max} Zeichen).`;

/** Pro Feld eine Prüfung; leere Rückgabe heißt gültig. Die Werte sind schon getrimmt. */
const PRUEFUNGEN: Record<FeldSchluessel, (wert: string) => string> = {
  name: (v) => {
    if (!v) return 'Bitte nennen Sie uns Ihren Namen.';
    return v.length > MAX_ZEICHEN.name ? zuLang('Der Name', MAX_ZEICHEN.name) : '';
  },
  email: (v) => {
    if (!v) return 'Bitte geben Sie Ihre E-Mail-Adresse an, damit wir antworten können.';
    if (v.length > MAX_ZEICHEN.email) return zuLang('Die E-Mail-Adresse', MAX_ZEICHEN.email);
    return EMAIL_MUSTER.test(v)
      ? ''
      : 'Diese E-Mail-Adresse scheint nicht zu stimmen. Bitte prüfen Sie sie, z. B. name@beispiel.de.';
  },
  telefon: (v) => {
    if (!v) return '';
    if (v.length > MAX_ZEICHEN.telefon) return zuLang('Die Telefonnummer', MAX_ZEICHEN.telefon);
    return TELEFON_MUSTER.test(v) ? '' : 'Bitte nur Ziffern, Leerzeichen und + ( ) / - verwenden.';
  },
  stueck: (v) => (v.length > MAX_ZEICHEN.stueck ? zuLang('Das Anliegen', MAX_ZEICHEN.stueck) : ''),
  nachricht: (v) => {
    if (!v) return 'Bitte schreiben Sie uns kurz, worum es geht.';
    return v.length > MAX_ZEICHEN.nachricht ? zuLang('Die Nachricht', MAX_ZEICHEN.nachricht) : '';
  },
};

/** Prüft ein einzelnes Feld (für die Prüfung beim Verlassen und Tippen im Browser). */
export function pruefeFeld(schluessel: FeldSchluessel, wert: string): string {
  return PRUEFUNGEN[schluessel](wert.trim());
}

/** Prüft alle Felder; leeres Objekt heißt gültig. */
export function pruefeAnfrage(anfrage: Anfrage): FeldFehler {
  const fehler: FeldFehler = {};
  for (const schluessel of FELD_SCHLUESSEL) {
    const meldung = pruefeFeld(schluessel, anfrage[schluessel]);
    if (meldung) fehler[schluessel] = meldung;
  }
  return fehler;
}

/** Liest die Felder aus unbekannten Daten: nur Zeichenketten, getrimmt, fehlende Felder leer. */
export function liesAnfrage(daten: unknown): Anfrage {
  const quelle = typeof daten === 'object' && daten !== null ? (daten as Record<string, unknown>) : {};
  const wert = (schluessel: string) => (typeof quelle[schluessel] === 'string' ? quelle[schluessel].trim() : '');
  return {
    name: wert('name'),
    email: wert('email'),
    telefon: wert('telefon'),
    stueck: wert('stueck'),
    nachricht: wert('nachricht'),
  };
}

/** Antwort von POST /api/anfrage: Erfolg oder eine deutsche Meldung, bei Feldfehlern zusätzlich je Feld. */
export type AnfrageAntwort = { ok: true } | { ok: false; meldung: string; felder?: FeldFehler };
