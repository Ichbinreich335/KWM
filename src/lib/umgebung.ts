// Build-Umgebung: Vorschau oder Produktion, Site-Key des Turnstile-Widgets.
// Die Variablen sind in astro.config.mjs (env.schema) beschrieben und werden beim Build über astro:env gelesen.
import { PRODUKTIONS_BRANCH, PUBLIC_TURNSTILE_SITEKEY, WORKERS_CI, WORKERS_CI_BRANCH } from 'astro:env/server';

/** Turnstile-Testschlüssel „immer gültig“ (Cloudflare-Doku „Test your Turnstile implementation“): nur für Vorschau und lokale Entwicklung. */
const TESTSCHLUESSEL_IMMER_GUELTIG = '1x00000000000000000000AA';
/** Form der Turnstile-Testschlüssel (1x…AA, 2x…AB, 1x…BB, 2x…BB, 3x…FF) */
const TESTSCHLUESSEL = /^[123]x0{20}[A-F]{2}$/;

export interface BuildUmgebung {
  WORKERS_CI?: string | undefined;
  WORKERS_CI_BRANCH?: string | undefined;
  PRODUKTIONS_BRANCH?: string | undefined;
  PUBLIC_TURNSTILE_SITEKEY?: string | undefined;
}

/** Branch des Builds in Workers Builds (setzt WORKERS_CI und WORKERS_CI_BRANCH, Cloudflare-Doku „Build configuration“); lokal undefined. */
function ciBranch(umgebung: BuildUmgebung): string | undefined {
  const branch = umgebung.WORKERS_CI_BRANCH;
  return umgebung.WORKERS_CI === '1' && branch !== undefined && branch !== '' ? branch : undefined;
}

/** Produktions-Branch; ein leerer Wert gilt als nicht gesetzt. */
function produktionsBranch(umgebung: BuildUmgebung): string {
  return umgebung.PRODUKTIONS_BRANCH || 'main';
}

/** Vorschau-Build: läuft in Workers Builds auf einem anderen Branch als dem Produktions-Branch. Lokale Builds sind streng wie Produktion. */
export function istVorschauBuild(umgebung: BuildUmgebung): boolean {
  const branch = ciBranch(umgebung);
  return branch !== undefined && branch !== produktionsBranch(umgebung);
}

/** Site-Key des Widgets; ohne Angabe (oder leer) der Testschlüssel „immer gültig“. */
export function sitekey(umgebung: BuildUmgebung): string {
  return umgebung.PUBLIC_TURNSTILE_SITEKEY || TESTSCHLUESSEL_IMMER_GUELTIG;
}

/**
 * Warnung für das Build-Log: Der Produktions-Build in Workers Builds läuft ohne echten Site-Key.
 * Bis zum Go-live ist das gewollt (Formular mit Testschlüssel), danach ein Fehler in der Konfiguration.
 */
export function sitekeyWarnung(umgebung: BuildUmgebung): string | undefined {
  const branch = ciBranch(umgebung);
  if (branch === undefined || branch !== produktionsBranch(umgebung)) return undefined;
  if (!TESTSCHLUESSEL.test(sitekey(umgebung))) return undefined;
  return `Produktions-Build (Branch ${branch}) ohne echten Turnstile-Site-Key: Das Anfrageformular nutzt den Testschlüssel. Vor dem Go-live die Build-Variable PUBLIC_TURNSTILE_SITEKEY setzen (konzept/GO-LIVE.md).`;
}

const umgebung: BuildUmgebung = { WORKERS_CI, WORKERS_CI_BRANCH, PRODUKTIONS_BRANCH, PUBLIC_TURNSTILE_SITEKEY };

/** Werte dieses Builds */
export const vorschauBuild: boolean = istVorschauBuild(umgebung);
export const turnstileSitekey: string = sitekey(umgebung);
export const turnstileWarnung: string | undefined = sitekeyWarnung(umgebung);
