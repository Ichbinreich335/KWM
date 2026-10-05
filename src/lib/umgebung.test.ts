import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { istVorschauBuild, sitekey, sitekeyWarnung } from './umgebung';

describe('istVorschauBuild', () => {
  it('erkennt einen Workers-Builds-Lauf auf einem anderen Branch als main', () => {
    expect(istVorschauBuild({ WORKERS_CI: '1', WORKERS_CI_BRANCH: 'gesamtstand' })).toBe(true);
  });

  it('behandelt main als Produktion', () => {
    expect(istVorschauBuild({ WORKERS_CI: '1', WORKERS_CI_BRANCH: 'main' })).toBe(false);
  });

  it('nimmt den Produktions-Branch aus PRODUKTIONS_BRANCH', () => {
    const umgebung = { WORKERS_CI: '1', PRODUKTIONS_BRANCH: 'live' };
    expect(istVorschauBuild({ ...umgebung, WORKERS_CI_BRANCH: 'live' })).toBe(false);
    expect(istVorschauBuild({ ...umgebung, WORKERS_CI_BRANCH: 'main' })).toBe(true);
    expect(istVorschauBuild({ WORKERS_CI: '1', WORKERS_CI_BRANCH: 'main', PRODUKTIONS_BRANCH: '' })).toBe(false);
  });

  it('behandelt lokale Builds und fehlende Branch-Angaben als Produktion (streng)', () => {
    expect(istVorschauBuild({})).toBe(false);
    expect(istVorschauBuild({ WORKERS_CI: '1' })).toBe(false);
    expect(istVorschauBuild({ WORKERS_CI: '1', WORKERS_CI_BRANCH: '' })).toBe(false);
    expect(istVorschauBuild({ WORKERS_CI_BRANCH: 'gesamtstand' })).toBe(false);
  });
});

describe('sitekey', () => {
  it('nimmt PUBLIC_TURNSTILE_SITEKEY, sonst (auch leer) den Testschlüssel „immer gültig“', () => {
    expect(sitekey({ PUBLIC_TURNSTILE_SITEKEY: '0x4AAAAAAAecht' })).toBe('0x4AAAAAAAecht');
    expect(sitekey({})).toBe('1x00000000000000000000AA');
    expect(sitekey({ PUBLIC_TURNSTILE_SITEKEY: '' })).toBe('1x00000000000000000000AA');
  });
});

describe('sitekeyWarnung', () => {
  const produktion = { WORKERS_CI: '1', WORKERS_CI_BRANCH: 'main' };

  it('warnt beim Produktions-Build ohne echten Site-Key', () => {
    expect(sitekeyWarnung(produktion)).toContain('PUBLIC_TURNSTILE_SITEKEY');
    expect(sitekeyWarnung({ ...produktion, PUBLIC_TURNSTILE_SITEKEY: '' })).toBeDefined();
    expect(sitekeyWarnung({ ...produktion, PUBLIC_TURNSTILE_SITEKEY: '3x00000000000000000000FF' })).toBeDefined();
    expect(sitekeyWarnung({ WORKERS_CI: '1', WORKERS_CI_BRANCH: 'live', PRODUKTIONS_BRANCH: 'live' })).toBeDefined();
  });

  it('schweigt mit echtem Site-Key, in Vorschauen und lokal', () => {
    expect(sitekeyWarnung({ ...produktion, PUBLIC_TURNSTILE_SITEKEY: '0x4AAAAAAAecht' })).toBeUndefined();
    expect(sitekeyWarnung({ WORKERS_CI: '1', WORKERS_CI_BRANCH: 'gesamtstand' })).toBeUndefined();
    expect(sitekeyWarnung({})).toBeUndefined();
  });
});

describe('wrangler.jsonc: ANFRAGE_MODUS', () => {
  interface Konfiguration {
    vars?: { ANFRAGE_MODUS?: string };
    previews?: { vars?: { ANFRAGE_MODUS?: string } };
  }
  const gelesen = ts.parseConfigFileTextToJson('wrangler.jsonc', readFileSync('wrangler.jsonc', 'utf8'));
  const konfiguration = gelesen.config as Konfiguration;

  it('ist oben (Produktion) streng', () => {
    expect(gelesen.error).toBeUndefined();
    expect(konfiguration.vars?.ANFRAGE_MODUS).toBe('produktion');
  });

  it('ist nur im previews-Block auf vorschau gestellt', () => {
    expect(konfiguration.previews?.vars?.ANFRAGE_MODUS).toBe('vorschau');
  });
});
