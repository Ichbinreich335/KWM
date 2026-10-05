/** Standard-Produktions-Branch; in Workers Builds per Build-Variable `PRODUKTIONS_BRANCH` überschreibbar. */
const STANDARD_PRODUKTIONS_BRANCH = 'main';

interface BuildUmgebung {
  WORKERS_CI?: string | undefined;
  WORKERS_CI_BRANCH?: string | undefined;
  PRODUKTIONS_BRANCH?: string | undefined;
}

/**
 * Vorschau-Build: läuft in Workers Builds auf einem anderen Branch als dem Produktions-Branch.
 * Workers Builds setzt WORKERS_CI und WORKERS_CI_BRANCH (Cloudflare-Doku „Build configuration“).
 * Lokale Builds sind streng wie Produktion.
 */
export function istVorschauBuild(umgebung: BuildUmgebung): boolean {
  const branch = umgebung.WORKERS_CI_BRANCH;
  const produktion = umgebung.PRODUKTIONS_BRANCH || STANDARD_PRODUKTIONS_BRANCH;
  return umgebung.WORKERS_CI === '1' && branch !== undefined && branch !== '' && branch !== produktion;
}

/** Wird beim Build ausgewertet (Astro-Frontmatter, Node). */
export const vorschauBuild: boolean = istVorschauBuild(process.env);
