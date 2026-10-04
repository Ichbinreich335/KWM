// Feste Fassung der Seite (Entscheidung E5: jeweils die erste Option des früheren Entwurf-Panels).
// Setzt die Attribute, an denen CSS und Signaturen hängen, und blendet nicht gewählte Abschnitte aus.
// Phase B entfernt die nicht gewählten Abschnitte aus dem Markup und danach dieses Skript.
const FASSUNG = {
  einstieg: 'foto',
  einzelwerk: 'spindelvase',
  haltung: 'getrennt',
  lebensweg: 'scrollen',
  feuertext: 'haftend',
  farbskala: 'kachel',
};

const root = document.documentElement;
Object.entries(FASSUNG).forEach(([schluessel, wert]) => {
  root.dataset[schluessel] = wert;
});
document.querySelectorAll('[data-variant]').forEach((el) => {
  const regeln = el.dataset.variant.split(/\s+/).map((r) => r.split(':'));
  el.hidden = !regeln.every(([schluessel, wert]) => FASSUNG[schluessel] === wert);
});
document.dispatchEvent(new CustomEvent('kwm:varianten'));
