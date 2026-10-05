import { baueMail } from './mail';
import { antwort, fehler, MELDUNGEN } from './antwort';
import { istErlaubterUrsprung, liesBegrenzt } from './anfrage-pruefung';
import { pruefeTurnstile } from './turnstile';
import { HONIGTOPF_FELD, liesAnfrage, MAX_TOKEN_ZEICHEN, pruefeAnfrage, TURNSTILE_FELD } from '../src/lib/anfrage';

/** Ein Ereignis pro Fehler in Workers Logs, bewusst ohne Nachrichtentext und Besucherdaten. */
function protokolliere(ereignis: string, details: Record<string, string | number | undefined> = {}): void {
  console.error(JSON.stringify({ ereignis, ...details }));
}

async function liesJson(request: Request): Promise<Record<string, unknown> | 'zu_gross' | 'ungueltig'> {
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return 'ungueltig';
  const text = await liesBegrenzt(request);
  if (text === null) return 'zu_gross';
  try {
    const daten: unknown = JSON.parse(text);
    return typeof daten === 'object' && daten !== null && !Array.isArray(daten)
      ? (daten as Record<string, unknown>)
      : 'ungueltig';
  } catch {
    return 'ungueltig';
  }
}

/** POST /api/anfrage: Methode, Ursprung, Rate Limit, Größe, Felder, Honigtopf, Turnstile, Versand. */
export async function handleAnfrage(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return fehler(405, MELDUNGEN.methode, { Allow: 'POST' });
  if (!istErlaubterUrsprung(request.headers.get('Origin'), env.ERLAUBTE_ORIGINS)) {
    return fehler(403, MELDUNGEN.ursprung);
  }
  const ip = request.headers.get('CF-Connecting-IP');
  if (!(await env.ANFRAGE_LIMIT.limit({ key: ip ?? 'unbekannt' })).success) return fehler(429, MELDUNGEN.zuViele);

  const daten = await liesJson(request);
  if (daten === 'zu_gross') return fehler(413, MELDUNGEN.zuGross);
  if (daten === 'ungueltig') return fehler(400, MELDUNGEN.format);

  // Honigtopf ausgefüllt: Bot. Erfolg vortäuschen, nichts senden.
  if (typeof daten[HONIGTOPF_FELD] === 'string' && daten[HONIGTOPF_FELD] !== '') return antwort(200, { ok: true });

  const anfrage = liesAnfrage(daten);
  const feldFehler = pruefeAnfrage(anfrage);
  if (Object.keys(feldFehler).length > 0) {
    return antwort(400, { ok: false, meldung: MELDUNGEN.felder, felder: feldFehler });
  }

  const token = daten[TURNSTILE_FELD];
  if (typeof token !== 'string' || token === '' || token.length > MAX_TOKEN_ZEICHEN) {
    return fehler(403, MELDUNGEN.turnstile);
  }
  const turnstile = await pruefeTurnstile(token, env.TURNSTILE_SECRET, ip, env.TURNSTILE_HOSTNAMES);
  if (turnstile === 'ungueltig') return fehler(403, MELDUNGEN.turnstile);
  if (turnstile === 'nicht_erreichbar') {
    protokolliere('turnstile_nicht_erreichbar');
    return fehler(502, MELDUNGEN.versand);
  }

  try {
    await env.ANFRAGE_MAIL.send(baueMail(anfrage, env.ANFRAGE_ABSENDER, env.ANFRAGE_ZIEL));
  } catch (ursache) {
    const code = ursache instanceof Error && 'code' in ursache ? String(ursache.code) : undefined;
    protokolliere('versand_fehlgeschlagen', { code });
    return fehler(502, MELDUNGEN.versand);
  }
  return antwort(200, { ok: true });
}
