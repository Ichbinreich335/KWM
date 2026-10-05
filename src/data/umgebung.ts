/** Produktions-Branch: nur Builds von hier gelten als echt (Workers Builds setzt WORKERS_CI_BRANCH, siehe Cloudflare-Doku „Build configuration“). */
const PRODUKTIONS_BRANCH = 'main';

interface BuildUmgebung {
  WORKERS_CI?: string | undefined;
  WORKERS_CI_BRANCH?: string | undefined;
}

/** Vorschau-Build: läuft in Workers Builds auf einem anderen Branch als `main`. Lokale Builds sind streng wie Produktion. */
export function istVorschauBuild(umgebung: BuildUmgebung): boolean {
  const branch = umgebung.WORKERS_CI_BRANCH;
  return umgebung.WORKERS_CI === '1' && branch !== undefined && branch !== '' && branch !== PRODUKTIONS_BRANCH;
}

/** Wird beim Build ausgewertet (Astro-Frontmatter, Node). */
export const vorschauBuild: boolean = istVorschauBuild(process.env);
