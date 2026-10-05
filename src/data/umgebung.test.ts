import { describe, expect, it } from 'vitest';
import { istVorschauBuild } from './umgebung';

describe('istVorschauBuild', () => {
  it('erkennt einen Workers-Builds-Lauf auf einem anderen Branch als main', () => {
    expect(istVorschauBuild({ WORKERS_CI: '1', WORKERS_CI_BRANCH: 'gesamtstand' })).toBe(true);
  });

  it('behandelt main als Produktion', () => {
    expect(istVorschauBuild({ WORKERS_CI: '1', WORKERS_CI_BRANCH: 'main' })).toBe(false);
  });

  it('behandelt lokale Builds und fehlende Branch-Angaben als Produktion (streng)', () => {
    expect(istVorschauBuild({})).toBe(false);
    expect(istVorschauBuild({ WORKERS_CI: '1' })).toBe(false);
    expect(istVorschauBuild({ WORKERS_CI: '1', WORKERS_CI_BRANCH: '' })).toBe(false);
    expect(istVorschauBuild({ WORKERS_CI_BRANCH: 'gesamtstand' })).toBe(false);
  });
});
