/* Expander: Auf- und Zuklappen für alle [data-expander] (siehe src/styles/expander.css).
   Lang: beim Schließen springt die Ansicht ruhig zurück an den Knopf. */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const expanders = [...document.querySelectorAll<HTMLElement>('[data-expander]')];

const setOpen = (root: HTMLElement, open: boolean) => {
  const btn = root.querySelector('.expander__btn');
  if (!btn) return;
  root.classList.toggle('is-open', open);
  btn.setAttribute('aria-expanded', String(open));
};

const stickyTop = (root: HTMLElement) => {
  const bar = root.querySelector('.expander__bar');
  if (!bar) return 0;
  return parseFloat(getComputedStyle(bar).top) || 0;
};

const toggle = (root: HTMLElement) => {
  const open = !root.classList.contains('is-open');
  if (!open && root.classList.contains('expander--lang') && root.getBoundingClientRect().top < stickyTop(root) - 1) {
    root.scrollIntoView({ block: 'start', behavior: reduced.matches ? 'auto' : 'smooth' });
  }
  setOpen(root, open);
};

for (const root of expanders) {
  const btn = root.querySelector('.expander__btn');
  if (!btn) continue;
  setOpen(root, btn.getAttribute('aria-expanded') === 'true');
  btn.addEventListener('click', () => toggle(root));
}

/* Sprung auf #jahr-XXXX (auch aus alten Jahres-Links) öffnet das passende Element */
const openFromHash = () => {
  const target = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  const root = target && target.closest<HTMLElement>('[data-expander]');
  if (root) setOpen(root, true);
};
openFromHash();
window.addEventListener('hashchange', openFromHash);
