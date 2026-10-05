// Anfrage-Formular: prüft die Felder mit den gemeinsamen Regeln (src/lib/anfrage.ts) und schickt sie per POST an
// den Worker (/api/anfrage). Turnstile lädt erst beim ersten Antippen eines Feldes.
import {
  ANFRAGE_PFAD,
  FELD_SCHLUESSEL,
  HONIGTOPF_FELD,
  pruefeFeld,
  TURNSTILE_FELD,
  type AnfrageAntwort,
  type FeldFehler,
  type FeldSchluessel,
} from '../lib/anfrage';

const TURNSTILE_SKRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TOKEN_WARTEZEIT_MS = 20_000;
const SENDE_ZEITLIMIT_MS = 30_000;

const TEXT = {
  sendet: 'Wird gesendet …',
  pruefung: 'Sicherheitsprüfung läuft …',
  einFeld: 'Ein Feld braucht noch Ihre Angabe.',
  mehrereFelder: (anzahl: number) => `${anzahl} Felder brauchen noch Ihre Angabe.`,
  keinePruefung:
    'Die Sicherheitsprüfung konnte nicht abgeschlossen werden. Bitte laden Sie die Seite neu und senden Sie noch einmal.',
  keinVersand: 'Ihre Anfrage konnte gerade nicht gesendet werden.',
};

type Feld = HTMLInputElement | HTMLTextAreaElement;

interface TurnstileApi {
  render(
    container: HTMLElement,
    optionen: {
      sitekey: string;
      language: string;
      theme: 'light';
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
    },
  ): string;
  reset(widgetId: string): void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let turnstileGeladen: Promise<TurnstileApi> | undefined;

/** Lädt das Turnstile-Skript einmal pro Seite. */
function ladeTurnstile(): Promise<TurnstileApi> {
  turnstileGeladen ??= new Promise((aufloesen, ablehnen) => {
    const skript = document.createElement('script');
    skript.src = TURNSTILE_SKRIPT;
    skript.async = true;
    skript.onload = () => (window.turnstile ? aufloesen(window.turnstile) : ablehnen(new Error('Turnstile fehlt')));
    skript.onerror = () => ablehnen(new Error('Turnstile nicht ladbar'));
    document.head.append(skript);
  });
  return turnstileGeladen;
}

interface Sicherheitspruefung {
  /** Liefert das Token (wartet auf das Widget) oder `null`, wenn die Prüfung nicht möglich ist. */
  token(): Promise<string | null>;
  /** Tokens gelten nur einmal: nach jedem Absenden ein neues anfordern. */
  erneuern(): void;
}

type PruefZustand = { art: 'wartet' } | { art: 'fertig'; token: string } | { art: 'fehler' };

function starteSicherheitspruefung(behaelter: HTMLElement, sitekey: string): Sicherheitspruefung {
  let zustand: PruefZustand = { art: 'wartet' };
  let wartende: Array<() => void> = [];
  let widgetId: string | undefined;

  const setze = (neu: PruefZustand) => {
    zustand = neu;
    const aufgeweckt = wartende;
    wartende = [];
    aufgeweckt.forEach((wecke) => wecke());
  };

  ladeTurnstile().then(
    (turnstile) => {
      widgetId = turnstile.render(behaelter, {
        sitekey,
        language: 'de',
        theme: 'light', // passt zum Papiergrund (Widget-Optionen laut Cloudflare-Doku)
        callback: (token) => setze({ art: 'fertig', token }),
        'expired-callback': () => setze({ art: 'wartet' }),
        'error-callback': () => setze({ art: 'fehler' }),
      });
    },
    () => setze({ art: 'fehler' }),
  );

  return {
    token: () =>
      new Promise((aufloesen) => {
        const pruefe = () => aufloesen(zustand.art === 'fertig' ? zustand.token : null);
        if (zustand.art !== 'wartet') return pruefe();
        const frist = setTimeout(pruefe, TOKEN_WARTEZEIT_MS);
        wartende.push(() => {
          clearTimeout(frist);
          pruefe();
        });
      }),
    erneuern: () => {
      if (!widgetId || !window.turnstile) return;
      setze({ art: 'wartet' });
      window.turnstile.reset(widgetId);
    },
  };
}

export default function init(el: Element) {
  if (!(el instanceof HTMLElement)) return;
  const root = el;
  const form = root.querySelector('form');
  const done = root.querySelector<HTMLElement>('.anfrage__done');
  const summary = root.querySelector<HTMLElement>('.anfrage__summary');
  const status = root.querySelector<HTMLElement>('.anfrage__status');
  const fail = root.querySelector<HTMLElement>('.anfrage__fail');
  const failText = root.querySelector<HTMLElement>('.anfrage__fail-text');
  const turnstileBehaelter = root.querySelector<HTMLElement>('[data-turnstile]');
  const sendeKnopf = root.querySelector<HTMLButtonElement>('button[type="submit"]');
  const sitekey = root.dataset['sitekey'];
  if (!form || !done || !summary || !status || !fail || !failText || !turnstileBehaelter || !sendeKnopf || !sitekey) {
    return;
  }

  const felder = {} as Record<FeldSchluessel, Feld>;
  for (const schluessel of FELD_SCHLUESSEL) {
    const element = form.elements.namedItem(schluessel);
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) return;
    felder[schluessel] = element;
  }

  const stueck = new URLSearchParams(location.search).get('stueck');
  if (stueck) felder.stueck.value = stueck.trim().slice(0, felder.stueck.maxLength);

  const zeigeFehler = (schluessel: FeldSchluessel, meldung: string) => {
    const eingabe = felder[schluessel];
    const ausgabe = root.querySelector<HTMLElement>(`#${eingabe.id}-fehler`);
    if (!ausgabe) return;
    ausgabe.textContent = meldung;
    ausgabe.hidden = !meldung;
    if (meldung) eingabe.setAttribute('aria-invalid', 'true');
    else eingabe.removeAttribute('aria-invalid');
  };
  const pruefe = (schluessel: FeldSchluessel) => {
    const meldung = pruefeFeld(schluessel, felder[schluessel].value);
    zeigeFehler(schluessel, meldung);
    return !meldung;
  };
  /** Zeigt Fehler an den Feldern und im Sammelhinweis; der Fokus geht ans erste fehlerhafte Feld. */
  const zeigeFeldFehler = (fehler: FeldFehler) => {
    const betroffen = FELD_SCHLUESSEL.filter((schluessel) => fehler[schluessel]);
    FELD_SCHLUESSEL.forEach((schluessel) => zeigeFehler(schluessel, fehler[schluessel] ?? ''));
    summary.hidden = betroffen.length === 0;
    const [erstes] = betroffen;
    if (!erstes) return;
    summary.textContent = betroffen.length === 1 ? TEXT.einFeld : TEXT.mehrereFelder(betroffen.length);
    felder[erstes].focus();
  };
  const zeigeVersandfehler = (meldung: string) => {
    failText.textContent = meldung;
    fail.hidden = false;
  };
  const setzeBeschaeftigt = (text: string) => {
    sendeKnopf.disabled = text !== '';
    form.setAttribute('aria-busy', String(text !== ''));
    status.textContent = text;
  };

  FELD_SCHLUESSEL.forEach((schluessel) => {
    felder[schluessel].addEventListener('blur', () => felder[schluessel].value && pruefe(schluessel));
    felder[schluessel].addEventListener('input', () => {
      if (!felder[schluessel].hasAttribute('aria-invalid')) return;
      pruefe(schluessel);
      if (!form.querySelector('[aria-invalid]')) summary.hidden = true;
    });
  });

  // Erst beim ersten Antippen eines Feldes Kontakt zu Cloudflare aufnehmen
  let sicherheit: Sicherheitspruefung | undefined;
  const sicherheitStarten = () => {
    if (!sicherheit) {
      turnstileBehaelter.replaceChildren();
      sicherheit = starteSicherheitspruefung(turnstileBehaelter, sitekey);
    }
    return sicherheit;
  };
  form.addEventListener('focusin', sicherheitStarten, { once: true });

  const sende = async (token: string): Promise<void> => {
    const daten = Object.fromEntries(new FormData(form));
    const antwort = await fetch(ANFRAGE_PFAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...daten, [HONIGTOPF_FELD]: daten[HONIGTOPF_FELD] ?? '', [TURNSTILE_FELD]: token }),
      signal: AbortSignal.timeout(SENDE_ZEITLIMIT_MS),
    });
    const inhalt = (await antwort.json().catch(() => null)) as AnfrageAntwort | null;
    if (inhalt?.ok) {
      form.hidden = true;
      done.hidden = false;
      done.focus();
      return;
    }
    if (inhalt?.felder) return zeigeFeldFehler(inhalt.felder);
    zeigeVersandfehler(inhalt?.meldung ?? TEXT.keinVersand);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    fail.hidden = true;
    const ungueltig = FELD_SCHLUESSEL.filter((schluessel) => !pruefe(schluessel));
    summary.hidden = ungueltig.length === 0;
    const [erstes] = ungueltig;
    if (erstes) {
      summary.textContent = ungueltig.length === 1 ? TEXT.einFeld : TEXT.mehrereFelder(ungueltig.length);
      felder[erstes].focus();
      return;
    }
    const pruefung = sicherheitStarten();
    setzeBeschaeftigt(TEXT.pruefung);
    try {
      const token = await pruefung.token();
      if (!token) return zeigeVersandfehler(TEXT.keinePruefung);
      setzeBeschaeftigt(TEXT.sendet);
      await sende(token);
    } catch {
      zeigeVersandfehler(TEXT.keinVersand);
    } finally {
      pruefung.erneuern();
      setzeBeschaeftigt('');
    }
  });

  root.querySelector('.anfrage__again')?.addEventListener('click', () => {
    form.reset();
    FELD_SCHLUESSEL.forEach((schluessel) => zeigeFehler(schluessel, ''));
    done.hidden = true;
    form.hidden = false;
    felder.name.focus();
  });
}
