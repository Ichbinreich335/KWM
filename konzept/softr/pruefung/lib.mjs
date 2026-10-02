import { chromium } from 'playwright';
export const VIEWPORTS = { d: { width: 1440, height: 900 }, m: { width: 390, height: 844 } };
// Öffnet die Vorschau (Login per Token), danach direkt die App-URL ohne Studio-Leiste.
export async function openApp(browser, vp, asUser) {
  const ctx = await browser.newContext({ viewport: vp, locale: 'de-DE', deviceScaleFactor: 1, hasTouch: vp.width < 500, isMobile: vp.width < 500 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 250)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message.slice(0, 250)));
  const url = process.env.PREVIEW_URL;
  if (!url) throw new Error('PREVIEW_URL fehlt (Link aus application_preview, nie ins Repo).');
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  if (asUser) {
    await page.getByText('KWM', { exact: true }).first().click();
    await page.getByText(asUser, { exact: true }).first().click();
    await page.waitForTimeout(5000);
  }
  const inner = page.frames().find(f => f !== page.mainFrame() && f.url().includes('autoUser'));
  const origin = new URL(page.url()).origin;
  const innerUrl = new URL(inner ? inner.url() : page.url());
  const go = async (path) => {
    const u = new URL(path, origin); innerUrl.searchParams.forEach((v, k) => u.searchParams.set(k, v));
    await page.goto(u.toString(), { waitUntil: 'networkidle', timeout: 90000 });
    await page.waitForTimeout(2500);
  };
  return { ctx, page, errs, go };
}
export async function metrics(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const roots = [document, ...[...document.querySelectorAll('[data-role=vibe-block-root]')].map(h => h.shadowRoot).filter(Boolean)];
    const all = roots.flatMap(r => [...r.querySelectorAll('*')]);
    const visibleBox = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' ? r : null; };
    const inScroller = el => { for (let p = el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll') return true; } return false; };
    const overflow = all.filter(el => { const r = visibleBox(el); return r && r.right > vw + 1 && !inScroller(el) && !['HTML','BODY'].includes(el.tagName); })
      .map(el => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} r=${Math.round(el.getBoundingClientRect().right)}`);
    const small = all.filter(el => el.matches('button, a, input, select, textarea, [role=tab], [role=radio]') && !el.classList.contains('sr-only'))
      .filter(el => { const r = visibleBox(el); return r && (r.height < 44 || r.width < 44) && el.type !== 'checkbox'; })
      .map(el => `${el.tagName.toLowerCase()}:${(el.innerText || el.getAttribute('aria-label') || el.placeholder || '').trim().slice(0, 30)} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);
    const text = roots.map(r => (r.body || r).innerText || '').join(' ');
    const english = text.match(/\b(Search|Upload|Ask AI|Submit|Loading|Cancel|Save|Next|Previous|No results|Filter by|Sort by|Close)\b/g) || [];
    return { horizontalScroll: document.documentElement.scrollWidth > vw, overflow: overflow.slice(0, 10), small: [...new Set(small)].slice(0, 30), english: [...new Set(english)] };
  });
}
export { chromium };
