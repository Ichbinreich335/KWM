// Flyer: Auslöser öffnen das native <dialog> (Esc und Fokusfalle bringt der Browser mit).
// Dazu: Schließen-Knopf, Klick auf den Hintergrund, Fokus zurück auf den Auslöser, gewählte Seite ins Bild.
export default function init(el: Element) {
  const dialog = el.querySelector('dialog');
  if (!dialog) return;
  const ausloeser = el.querySelectorAll<HTMLButtonElement>('[data-flyer-oeffnen]');
  const schliessen = dialog.querySelector<HTMLButtonElement>('[data-flyer-schliessen]');
  if (ausloeser.length === 0 || !schliessen) return;

  let zuletzt: HTMLButtonElement | undefined;
  ausloeser.forEach((knopf) =>
    knopf.addEventListener('click', () => {
      zuletzt = knopf;
      dialog.showModal();
      const seite = dialog.querySelector(`[data-flyer-seite="${knopf.dataset['flyerOeffnen'] ?? ''}"]`);
      if (seite && knopf.dataset['flyerOeffnen'] !== 'vorne') seite.scrollIntoView({ block: 'start' });
    }),
  );
  schliessen.addEventListener('click', () => dialog.close());
  // Der Dialog hat keinen Innenabstand: Ein Klick, der den Dialog selbst trifft, liegt auf dem Hintergrund.
  dialog.addEventListener('click', (ereignis) => {
    if (ereignis.target === dialog) dialog.close();
  });
  // Esc und Schließen: Fokus ausdrücklich zurückgeben
  dialog.addEventListener('close', () => zuletzt?.focus());
}
