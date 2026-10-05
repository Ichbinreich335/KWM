import { MAX_BODY_BYTES } from '../src/lib/anfrage';

const liste = (wert: string) =>
  wert
    .split(',')
    .map((eintrag) => eintrag.trim())
    .filter(Boolean);

/** Trifft ein Ursprung (`Origin`) einen Eintrag? Einträge sind exakte Ursprünge oder `https://*.beispiel.de`. */
function passtZuEintrag(ursprung: URL, eintrag: string): boolean {
  const [protokoll, rest] = eintrag.split('//');
  if (protokoll !== ursprung.protocol || !rest) return false;
  if (rest.startsWith('*.')) return ursprung.hostname.endsWith(rest.slice(1));
  return ursprung.host === rest;
}

export function istErlaubterUrsprung(header: string | null, erlaubt: string): boolean {
  if (!header) return false;
  let ursprung: URL;
  try {
    ursprung = new URL(header);
  } catch {
    return false;
  }
  return liste(erlaubt).some((eintrag) => passtZuEintrag(ursprung, eintrag));
}

export const istErlaubterHostname = (hostname: string | undefined, erlaubt: string): boolean =>
  hostname !== undefined && liste(erlaubt).includes(hostname);

/** Liest den Body höchstens bis zur Obergrenze; `null` heißt zu groß. */
export async function liesBegrenzt(request: Request, maxBytes = MAX_BODY_BYTES): Promise<string | null> {
  const angekuendigt = Number(request.headers.get('Content-Length'));
  if (angekuendigt > maxBytes) return null;
  const leser = request.body?.getReader();
  if (!leser) return '';
  const teile: Uint8Array[] = [];
  let summe = 0;
  for (;;) {
    const { done, value } = await leser.read();
    if (done) break;
    summe += value.byteLength;
    if (summe > maxBytes) {
      await leser.cancel();
      return null;
    }
    teile.push(value);
  }
  const gesamt = new Uint8Array(summe);
  let versatz = 0;
  for (const teil of teile) {
    gesamt.set(teil, versatz);
    versatz += teil.byteLength;
  }
  return new TextDecoder().decode(gesamt);
}
