// Anfrage-Formular: prüft die Felder und öffnet eine vorbereitete E-Mail.
// Später ersetzt ein POST an /api/anfrage (Worker mit Mail-Dienst und Turnstile) den mailto-Schritt.
import { kontakt } from '../data/kontakt';

const RECIPIENT = kontakt.mail;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[0-9 +()\/.\-]{5,}$/;

const CHECK_KEYS = ['name', 'email', 'telefon', 'nachricht'] as const;
type CheckKey = (typeof CHECK_KEYS)[number];
type Feld = HTMLInputElement | HTMLTextAreaElement;
type Anfrage = Partial<Record<CheckKey | 'stueck', string>>;

const checks: Record<CheckKey, (v: string) => string> = {
  name: (v) => (v ? '' : 'Bitte nennen Sie uns Ihren Namen.'),
  email: (v) => {
    if (!v) return 'Bitte geben Sie Ihre E-Mail-Adresse an, damit wir antworten können.';
    return EMAIL_PATTERN.test(v)
      ? ''
      : 'Diese E-Mail-Adresse scheint nicht zu stimmen. Bitte prüfen Sie sie, z. B. name@beispiel.de.';
  },
  telefon: (v) => (!v || PHONE_PATTERN.test(v) ? '' : 'Bitte nur Ziffern, Leerzeichen und + ( ) / - verwenden.'),
  nachricht: (v) => (v ? '' : 'Bitte schreiben Sie uns kurz, worum es geht.'),
};

function buildMailto(data: Anfrage) {
  const subject = `Anfrage: ${data.stueck || 'Allgemein'}`;
  const lines = [
    data.nachricht,
    '',
    '---',
    `Name: ${data.name}`,
    `E-Mail: ${data.email}`,
    `Telefon: ${data.telefon || '-'}`,
    `Anliegen: ${data.stueck || 'Allgemein'}`,
  ];
  return `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\r\n'))}`;
}

export default function init(el: Element) {
  if (!(el instanceof HTMLElement)) return;
  const root = el;
  const form = root.querySelector('form');
  const done = root.querySelector<HTMLElement>('.anfrage__done');
  const summary = root.querySelector<HTMLElement>('.anfrage__summary');
  if (!form || !done || !summary) return;

  const field = (name: string): Feld | null => {
    const element = form.elements.namedItem(name);
    return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement ? element : null;
  };
  const name = field('name');
  const email = field('email');
  const telefon = field('telefon');
  const nachricht = field('nachricht');
  if (!name || !email || !telefon || !nachricht) return;
  const fields: Record<CheckKey, Feld> = { name, email, telefon, nachricht };

  const stueck = new URLSearchParams(location.search).get('stueck');
  const stueckField = field('stueck');
  if (stueck && stueckField) stueckField.value = stueck.trim().slice(0, 400);

  const showError = (key: CheckKey, message: string) => {
    const input = fields[key];
    const out = root.querySelector<HTMLElement>(`#${input.id}-fehler`);
    if (!out) return;
    out.textContent = message;
    out.hidden = !message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  };
  const validate = (key: CheckKey) => {
    const message = checks[key](fields[key].value.trim());
    showError(key, message);
    return !message;
  };

  CHECK_KEYS.forEach((key) => {
    fields[key].addEventListener('blur', () => fields[key].value && validate(key));
    fields[key].addEventListener('input', () => fields[key].hasAttribute('aria-invalid') && validate(key));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const invalid = CHECK_KEYS.filter((key) => !validate(key));
    summary.hidden = invalid.length === 0;
    const [first] = invalid;
    if (first) {
      summary.textContent =
        invalid.length === 1
          ? 'Ein Feld braucht noch Ihre Angabe.'
          : `${invalid.length} Felder brauchen noch Ihre Angabe.`;
      fields[first].focus();
      return;
    }
    const data: Record<string, string> = {};
    new FormData(form).forEach((value, key) => {
      data[key] = String(value).trim();
    });
    const url = buildMailto(data);
    root.dispatchEvent(new CustomEvent('kwm:anfrage', { bubbles: true, detail: { url } }));
    location.href = url;
    form.hidden = true;
    done.hidden = false;
    done.focus();
  });

  root.querySelector('.anfrage__again')?.addEventListener('click', () => {
    done.hidden = true;
    form.hidden = false;
    fields.name.focus();
  });
}
