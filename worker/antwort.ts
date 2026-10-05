import type { AnfrageAntwort } from '../src/lib/anfrage';

/** Header für jede API-Antwort: `_headers` der Assets gilt für Worker-Antworten nicht. */
const SICHERHEITS_HEADER = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
};

export function antwort(status: number, body: AnfrageAntwort, zusaetzlich: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...SICHERHEITS_HEADER, ...zusaetzlich } });
}

export const fehler = (status: number, meldung: string, zusaetzlich?: Record<string, string>) =>
  antwort(status, { ok: false, meldung }, zusaetzlich);

/** Deutsche Meldungen je Fehlerfall; sie nennen nie interne Details. */
export const MELDUNGEN = {
  methode: 'Diese Adresse nimmt nur Anfragen per POST an.',
  ursprung: 'Die Anfrage kam nicht von unserer Website und wurde abgelehnt.',
  zuViele: 'Es kamen zu viele Anfragen in kurzer Zeit. Bitte versuchen Sie es in einer Minute noch einmal.',
  zuGross: 'Die Anfrage ist zu groß. Bitte kürzen Sie Ihre Nachricht.',
  format: 'Die Anfrage konnte nicht gelesen werden. Bitte laden Sie die Seite neu und versuchen Sie es noch einmal.',
  felder: 'Bitte prüfen Sie die markierten Felder.',
  turnstile:
    'Die Sicherheitsprüfung fehlt oder ist abgelaufen. Bitte laden Sie die Seite neu und senden Sie noch einmal.',
  versand: 'Ihre Anfrage konnte gerade nicht zugestellt werden.',
  unbekannt: 'Diese Adresse gibt es nicht.',
} as const;
