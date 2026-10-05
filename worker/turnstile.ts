import { istErlaubterHostname } from './anfrage-pruefung';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const SITEVERIFY_TIMEOUT_MS = 10_000;

/** `ungueltig`: Token falsch, abgelaufen oder von anderer Seite. `nicht_erreichbar`: Prüfung selbst fehlgeschlagen. */
export type TurnstileErgebnis = 'gueltig' | 'ungueltig' | 'nicht_erreichbar';

interface SiteverifyAntwort {
  success?: boolean;
  hostname?: string;
}

export async function pruefeTurnstile(
  token: string,
  geheimnis: string,
  ip: string | null,
  erlaubteHostnames: string,
): Promise<TurnstileErgebnis> {
  const formular = new URLSearchParams({ secret: geheimnis, response: token });
  if (ip) formular.set('remoteip', ip);
  let antwort: SiteverifyAntwort;
  try {
    const rohantwort = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body: formular,
      signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
    });
    if (!rohantwort.ok) return 'nicht_erreichbar';
    antwort = await rohantwort.json<SiteverifyAntwort>();
  } catch {
    return 'nicht_erreichbar';
  }
  return antwort.success === true && istErlaubterHostname(antwort.hostname, erlaubteHostnames)
    ? 'gueltig'
    : 'ungueltig';
}
