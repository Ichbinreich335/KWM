// Anfrage-Formular: prüft die Felder und öffnet eine vorbereitete E-Mail.
// Später ersetzt ein POST an /api/anfrage (Worker mit Mail-Dienst und Turnstile) den mailto-Schritt.
const RECIPIENT = 'kontakt@kwm1924.de';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[0-9 +()\/.\-]{5,}$/;

const checks = {
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

function buildMailto(data) {
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

export default function init(root) {
  const form = root.querySelector('form');
  const done = root.querySelector('.anfrage__done');
  const summary = root.querySelector('.anfrage__summary');
  const fields = Object.fromEntries(Object.keys(checks).map((key) => [key, form.elements[key]]));

  const stueck = new URLSearchParams(location.search).get('stueck');
  if (stueck) form.elements.stueck.value = stueck.trim().slice(0, 400);

  const showError = (key, message) => {
    const input = fields[key];
    const out = root.querySelector(`#${input.id}-fehler`);
    out.textContent = message;
    out.hidden = !message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  };
  const validate = (key) => {
    const message = checks[key](fields[key].value.trim());
    showError(key, message);
    return !message;
  };

  Object.keys(checks).forEach((key) => {
    fields[key].addEventListener('blur', () => fields[key].value && validate(key));
    fields[key].addEventListener('input', () => fields[key].hasAttribute('aria-invalid') && validate(key));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const invalid = Object.keys(checks).filter((key) => !validate(key));
    summary.hidden = invalid.length === 0;
    if (invalid.length) {
      summary.textContent =
        invalid.length === 1
          ? 'Ein Feld braucht noch Ihre Angabe.'
          : `${invalid.length} Felder brauchen noch Ihre Angabe.`;
      fields[invalid[0]].focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    Object.keys(data).forEach((key) => {
      data[key] = String(data[key]).trim();
    });
    const url = buildMailto(data);
    root.dispatchEvent(new CustomEvent('kwm:anfrage', { bubbles: true, detail: { url } }));
    location.href = url;
    form.hidden = true;
    done.hidden = false;
    done.focus();
  });

  root.querySelector('.anfrage__again').addEventListener('click', () => {
    done.hidden = true;
    form.hidden = false;
    fields.name.focus();
  });
}
