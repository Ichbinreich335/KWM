import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { handleAnfrage } from './anfrage';
import { alsKopfzeile, baueMail } from './mail';
import { istErlaubterHostname, istErlaubterUrsprung } from './anfrage-pruefung';
import worker from './index';

const URSPRUNG = 'https://kwm-1924.de';
const GUELTIGER_BODY = {
  name: 'Erika Mustermann',
  email: 'erika@beispiel.de',
  telefon: '',
  stueck: 'Teeschale',
  nachricht: 'Gibt es die Schale in Blau?',
  'cf-turnstile-response': 'XXXX.DUMMY.TOKEN.XXXX',
  website: '',
};

const senden = vi.fn();
const limit = vi.fn();
const assetsFetch = vi.fn();
let fehlerLog: MockInstance<typeof console.error>;

const testEnv = (): Env =>
  ({
    ANFRAGE_MAIL: { send: senden },
    ANFRAGE_LIMIT: { limit },
    ASSETS: { fetch: assetsFetch },
    ANFRAGE_ABSENDER: 'anfrage@kwm-1924.de',
    ANFRAGE_ZIEL: 'ziel@example.invalid',
    ERLAUBTE_ORIGINS: `${URSPRUNG},https://www.kwm-1924.de,https://*.workers.dev`,
    TURNSTILE_HOSTNAMES: 'kwm-1924.de',
    TURNSTILE_SECRET: '1x0000000000000000000000000000000AA',
  }) as unknown as Env;

function anfrage(body: unknown, kopf: Record<string, string> = {}, methode = 'POST'): Request {
  const roh = typeof body === 'string' ? body : JSON.stringify(body);
  return new Request('https://kwm-1924.de/api/anfrage', {
    method: methode,
    headers: { 'Content-Type': 'application/json', Origin: URSPRUNG, 'CF-Connecting-IP': '203.0.113.7', ...kopf },
    ...(methode === 'POST' ? { body: roh } : {}),
  });
}

const siteverify = (antwort: object, status = 200) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(antwort, { status }));

beforeEach(() => {
  senden.mockReset().mockResolvedValue({ messageId: 'test' });
  limit.mockReset().mockResolvedValue({ success: true });
  assetsFetch.mockReset().mockResolvedValue(new Response('seite'));
  siteverify({ success: true, hostname: 'kwm-1924.de' });
  fehlerLog = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => vi.restoreAllMocks());

describe('POST /api/anfrage im Vorschau-Modus', () => {
  const vorschauEnv = (): Env => ({ ...testEnv(), ANFRAGE_MODUS: 'vorschau' });

  it('antwortet mit Erfolg, ohne Turnstile zu prüfen und ohne zu senden', async () => {
    const spy = siteverify({ success: false });
    const ohneToken = { ...GUELTIGER_BODY, 'cf-turnstile-response': '' };
    const antwort = await handleAnfrage(anfrage(ohneToken), vorschauEnv());
    expect(antwort.status).toBe(200);
    expect(await antwort.json()).toEqual({ ok: true });
    expect(spy).not.toHaveBeenCalled();
    expect(senden).not.toHaveBeenCalled();
  });

  it('prüft Felder, Ursprung und Rate Limit weiterhin', async () => {
    expect((await handleAnfrage(anfrage({ ...GUELTIGER_BODY, email: 'kaputt' }), vorschauEnv())).status).toBe(400);
    expect(
      (await handleAnfrage(anfrage(GUELTIGER_BODY, { Origin: 'https://boese.example' }), vorschauEnv())).status,
    ).toBe(403);
    limit.mockResolvedValue({ success: false });
    expect((await handleAnfrage(anfrage(GUELTIGER_BODY), vorschauEnv())).status).toBe(429);
  });

  it('bleibt in Produktion streng: ohne Token 403', async () => {
    const ohneToken = { ...GUELTIGER_BODY, 'cf-turnstile-response': '' };
    const env = { ...testEnv(), ANFRAGE_MODUS: 'produktion' } as Env;
    expect((await handleAnfrage(anfrage(ohneToken), env)).status).toBe(403);
  });
});

describe('POST /api/anfrage', () => {
  it('sendet eine gültige Anfrage als Text-Mail mit Reply-To', async () => {
    const antwort = await handleAnfrage(anfrage(GUELTIGER_BODY), testEnv());
    expect(antwort.status).toBe(200);
    expect(await antwort.json()).toEqual({ ok: true });
    expect(antwort.headers.get('Cache-Control')).toBe('no-store');
    expect(antwort.headers.get('X-Content-Type-Options')).toBe('nosniff');
    const mail = senden.mock.calls[0]?.[0] as EmailMessageBuilder;
    expect(mail.to).toBe('ziel@example.invalid');
    expect(mail.subject).toBe('Anfrage: Teeschale');
    expect(mail.replyTo).toEqual({ email: 'erika@beispiel.de', name: 'Erika Mustermann' });
    expect(mail).not.toHaveProperty('html');
    expect(mail.text).toContain('Gibt es die Schale in Blau?');
  });

  it('prüft das Token bei Turnstile mit Secret, Token und IP', async () => {
    const spy = siteverify({ success: true, hostname: 'kwm-1924.de' });
    await handleAnfrage(anfrage(GUELTIGER_BODY), testEnv());
    const [url, init] = spy.mock.calls[0] ?? [];
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    const formular = (init as RequestInit).body as URLSearchParams;
    expect(formular.get('response')).toBe('XXXX.DUMMY.TOKEN.XXXX');
    expect(formular.get('secret')).toBe('1x0000000000000000000000000000000AA');
    expect(formular.get('remoteip')).toBe('203.0.113.7');
  });

  it('antwortet 405 auf GET', async () => {
    const antwort = await handleAnfrage(anfrage('', {}, 'GET'), testEnv());
    expect(antwort.status).toBe(405);
    expect(antwort.headers.get('Allow')).toBe('POST');
  });

  it.each([[{ Origin: 'https://boese.example' }], [{ Origin: '' }]])(
    'antwortet 403 bei fremdem Ursprung %j',
    async (kopf) => {
      const antwort = await handleAnfrage(anfrage(GUELTIGER_BODY, kopf), testEnv());
      expect(antwort.status).toBe(403);
      expect(senden).not.toHaveBeenCalled();
    },
  );

  it('antwortet 429 bei überschrittenem Limit, ohne den Body zu lesen', async () => {
    limit.mockResolvedValue({ success: false });
    const antwort = await handleAnfrage(anfrage(GUELTIGER_BODY), testEnv());
    expect(antwort.status).toBe(429);
    expect(limit).toHaveBeenCalledWith({ key: '203.0.113.7' });
  });

  it('antwortet 413 bei zu großem Body', async () => {
    const antwort = await handleAnfrage(anfrage({ ...GUELTIGER_BODY, nachricht: 'x'.repeat(20_000) }), testEnv());
    expect(antwort.status).toBe(413);
  });

  it('antwortet 413 auch ohne Content-Length bei zu großem Strom', async () => {
    const strom = new ReadableStream({
      pull(controller) {
        controller.enqueue(new TextEncoder().encode('x'.repeat(8192)));
      },
    });
    const request = new Request('https://kwm-1924.de/api/anfrage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: URSPRUNG },
      body: strom,
      duplex: 'half',
    } as RequestInit);
    expect((await handleAnfrage(request, testEnv())).status).toBe(413);
  });

  it.each([
    ['kein JSON', '{kaputt'],
    ['eine Liste', '[1]'],
  ])('antwortet 400 bei %s', async (_name, body) => {
    expect((await handleAnfrage(anfrage(body), testEnv())).status).toBe(400);
  });

  it('antwortet 400 bei anderem Content-Type', async () => {
    const antwort = await handleAnfrage(anfrage(GUELTIGER_BODY, { 'Content-Type': 'text/plain' }), testEnv());
    expect(antwort.status).toBe(400);
  });

  it('meldet Feldfehler je Feld auf Deutsch und fragt Turnstile nicht an', async () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    const antwort = await handleAnfrage(anfrage({ ...GUELTIGER_BODY, name: '', email: 'kaputt' }), testEnv());
    expect(antwort.status).toBe(400);
    const body = (await antwort.json()) as { felder: Record<string, string> };
    expect(Object.keys(body.felder).sort()).toEqual(['email', 'name']);
    expect(body.felder.name).toBe('Bitte nennen Sie uns Ihren Namen.');
    expect(spy).not.toHaveBeenCalled();
  });

  it('tut bei ausgefülltem Honigtopf so, als wäre alles gut, und sendet nichts', async () => {
    const antwort = await handleAnfrage(anfrage({ ...GUELTIGER_BODY, website: 'http://spam.example' }), testEnv());
    expect(antwort.status).toBe(200);
    expect(senden).not.toHaveBeenCalled();
  });

  it.each([[undefined], [''], [42]])('antwortet 403 bei fehlendem Token %j', async (token) => {
    const antwort = await handleAnfrage(anfrage({ ...GUELTIGER_BODY, 'cf-turnstile-response': token }), testEnv());
    expect(antwort.status).toBe(403);
    expect(senden).not.toHaveBeenCalled();
  });

  it('antwortet 403, wenn Turnstile das Token ablehnt', async () => {
    siteverify({ success: false, 'error-codes': ['invalid-input-response'] });
    expect((await handleAnfrage(anfrage(GUELTIGER_BODY), testEnv())).status).toBe(403);
    expect(senden).not.toHaveBeenCalled();
  });

  it('antwortet 403, wenn das Token von einem fremden Hostnamen stammt', async () => {
    siteverify({ success: true, hostname: 'boese.example' });
    expect((await handleAnfrage(anfrage(GUELTIGER_BODY), testEnv())).status).toBe(403);
  });

  it('antwortet 502, wenn Turnstile nicht erreichbar ist', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Netz weg'));
    expect((await handleAnfrage(anfrage(GUELTIGER_BODY), testEnv())).status).toBe(502);
  });

  it('antwortet 502, protokolliert ohne Nachrichtentext, wenn der Versand scheitert', async () => {
    senden.mockRejectedValue(
      Object.assign(new Error('Zieladresse erika@beispiel.de abgelehnt'), { code: 'E_RECIPIENT' }),
    );
    const antwort = await handleAnfrage(anfrage(GUELTIGER_BODY), testEnv());
    expect(antwort.status).toBe(502);
    const meldung = ((await antwort.json()) as { meldung: string }).meldung;
    expect(meldung).not.toContain('beispiel.de');
    const protokoll = String(fehlerLog.mock.calls[0]?.[0]);
    expect(protokoll).toContain('E_RECIPIENT');
    expect(protokoll).not.toContain('beispiel.de');
    expect(protokoll).not.toContain('Schale');
  });
});

describe('Routing des Workers', () => {
  it('reicht alles außer /api/anfrage an die Assets', async () => {
    const antwort = await worker.fetch(new Request('https://kwm-1924.de/besuch'), testEnv());
    expect(await antwort.text()).toBe('seite');
  });

  it('antwortet unter /api/ mit 404 als JSON', async () => {
    const antwort = await worker.fetch(new Request('https://kwm-1924.de/api/anderes'), testEnv());
    expect(antwort.status).toBe(404);
    expect(antwort.headers.get('Content-Type')).toContain('application/json');
  });
});

describe('E-Mail', () => {
  it('schleust keine Kopfzeilen über Name oder Anliegen ein', () => {
    const mail = baueMail(
      {
        name: 'Eva\r\nBcc: spam@beispiel.de',
        email: 'eva@beispiel.de',
        telefon: '',
        stueck: 'Schale\nBcc: spam@beispiel.de',
        nachricht: 'Zeile 1\r\nZeile 2',
      },
      'anfrage@kwm-1924.de',
      'ziel@example.invalid',
    );
    expect(mail.subject).not.toMatch(/[\r\n]/);
    expect((mail.replyTo as { name: string }).name).not.toMatch(/[\r\n]/);
    expect(mail.text).not.toContain('\r');
    expect(mail.text).toContain('Zeile 1\nZeile 2');
  });

  it('nutzt „Allgemein“ ohne Anliegen und kürzt den Betreff', () => {
    expect(
      baueMail({ name: 'A', email: 'a@b.de', telefon: '', stueck: '', nachricht: 'x' }, 'a@b.de', 'z@b.de').subject,
    ).toBe('Anfrage: Allgemein');
    expect(alsKopfzeile('a"<b>\u0000c')).toBe('a b c');
    const lang = baueMail(
      { name: 'A', email: 'a@b.de', telefon: '', stueck: 'x'.repeat(400), nachricht: 'x' },
      'a@b.de',
      'z@b.de',
    );
    expect(lang.subject.length).toBeLessThanOrEqual(120);
  });
});

describe('Ursprung und Hostname', () => {
  const liste = 'https://kwm-1924.de, https://*.workers.dev';
  it.each([
    ['https://kwm-1924.de', true],
    ['https://vorschau-kwm.konto.workers.dev', true],
    ['http://kwm-1924.de', false],
    ['https://kwm-1924.de.boese.example', false],
    ['https://workers.dev', false],
    ['kein url', false],
    [null, false],
  ])('Ursprung %s -> %s', (ursprung, erwartet) => {
    expect(istErlaubterUrsprung(ursprung, liste)).toBe(erwartet);
  });

  it('vergleicht Hostnamen exakt', () => {
    expect(istErlaubterHostname('kwm-1924.de', 'kwm-1924.de,www.kwm-1924.de')).toBe(true);
    expect(istErlaubterHostname('x.kwm-1924.de', 'kwm-1924.de')).toBe(false);
    expect(istErlaubterHostname(undefined, 'kwm-1924.de')).toBe(false);
  });
});
