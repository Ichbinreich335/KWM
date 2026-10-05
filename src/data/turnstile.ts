/** Turnstile-Testschlüssel „immer gültig“ (Cloudflare-Doku „Test your Turnstile implementation“): nur für Vorschau und lokale Entwicklung. */
const TESTSCHLUESSEL_IMMER_GUELTIG = '1x00000000000000000000AA';

/** Öffentlicher Site-Key des Widgets; Produktion setzt PUBLIC_TURNSTILE_SITEKEY beim Build (siehe .env.example). */
export const turnstileSitekey: string = import.meta.env.PUBLIC_TURNSTILE_SITEKEY ?? TESTSCHLUESSEL_IMMER_GUELTIG;
