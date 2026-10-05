import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { istVorschauBuild } from './umgebung';

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
