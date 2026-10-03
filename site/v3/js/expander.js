/* Expander: Auf- und Zuklappen für alle [data-expander] (siehe css/expander.css).
   Lang: beim Schließen springt die Ansicht ruhig zurück an den Knopf. */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const expanders = [...document.querySelectorAll('[data-expander]')];

const setOpen = (root, open) => {
  const btn = root.querySelector('.expander__btn');
  root.classList.toggle('is-open', open);
  btn.setAttribute('aria-expanded', String(open));
};

const stickyTop = (root) => {
  const bar = root.querySelector('.expander__bar');
  return parseFloat(getComputedStyle(bar).top) || 0;
};

const toggle = (root) => {
  const open = !root.classList.contains('is-open');
  if (!open && root.classList.contains('expander--lang') && root.getBoundingClientRect().top < stickyTop(root) - 1) {
    root.scrollIntoView({ block: 'start', behavior: reduced.matches ? 'auto' : 'smooth' });
  }
  setOpen(root, open);
};

for (const root of expanders) {
  const btn = root.querySelector('.expander__btn');
  setOpen(root, btn.getAttribute('aria-expanded') === 'true');
  btn.addEventListener('click', () => toggle(root));
}

/* Sprung auf #jahr-XXXX (auch aus alten Jahres-Links) öffnet das passende Element */
const openFromHash = () => {
  const target = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  const root = target && target.closest('[data-expander]');
  if (root) setOpen(root, true);
};
openFromHash();
window.addEventListener('hashchange', openFromHash);
