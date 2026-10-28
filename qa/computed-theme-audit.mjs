// Read-only browser audit. Pass this function to the documented CUA evaluate API.
// Gradient endpoints and translucent ancestors give conservative contrast bounds.
export function scanComputedTheme() {
  const rgba = value => {
    const parts = value.match(/[\d.]+/g)?.map(Number);
    return parts && parts.length >= 3 ? [...parts.slice(0, 3), parts[3] ?? 1] : [0, 0, 0, 0];
  };
  const blend = (top, base) => [...top.slice(0, 3).map((v, i) => v * top[3] + base[i] * (1 - top[3])), 1];
  const lum = c => c.slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((v, x, i) => v + x * [.2126, .7152, .0722][i], 0);
  const ratio = (a, b) => (Math.max(lum(a), lum(b)) + .05) / (Math.min(lum(a), lum(b)) + .05);
  const backgrounds = el => {
    const chain = []; for (let e = el; e; e = e.parentElement) chain.unshift(e);
    let colors = [[255, 255, 255, 1]];
    for (const e of chain) {
      const style = getComputedStyle(e); const bg = rgba(style.backgroundColor);
      colors = colors.map(c => blend(bg, c));
      const stops = style.backgroundImage.match(/rgba?\([^)]+\)/g);
      if (stops) colors = colors.flatMap(c => stops.map(s => blend(rgba(s), c)));
      // All assessed layers are flat surfaces/gradients. Limit repeated equivalent endpoints.
      colors = [...new Map(colors.map(c => [c.map(v => Math.round(v)).join(','), c])).values()].slice(0, 32);
    }
    return colors;
  };
  const visible = el => {
    if (!el.getClientRects().length || el.closest('[hidden],[inert],.sr-only')) return false;
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e); if (s.visibility === 'hidden' || s.display === 'none' || s.opacity === '0') return false;
    }
    return true;
  };
  const text = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el) || ['SCRIPT', 'STYLE', 'OPTION', 'SVG', 'PATH', 'TITLE'].includes(el.tagName)) continue;
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').trim();
    const form = el.matches('input:not([type=radio]):not([type=checkbox]),textarea,select');
    if (!own && !form) continue;
    const s = getComputedStyle(el); const bg = backgrounds(el); const fg = rgba(s.color);
    const minimum = Math.min(...bg.map(b => ratio(blend(fg, b), b)));
    const large = Number(s.fontSize.replace('px','')) >= 24 || (Number(s.fontSize.replace('px','')) >= 18.66 && Number(s.fontWeight) >= 700);
    text.push({ selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().replace(/\s+/g, '.') : ''), text: (own || el.value || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').slice(0, 100), foreground: s.color, backgrounds: bg.map(b => b.slice(0, 3).map(Math.round)), ratio: +minimum.toFixed(2), target: large ? 3 : 4.5, disabled: !!el.closest(':disabled'), pass: minimum >= (large ? 3 : 4.5) });
  }
  const controls = [];
  for (const el of document.querySelectorAll('.input,.select,.textarea,.writing-editor,.option,.choice-card,.exam-type-choice,.exam-check-option,.question-pills button,.mobile-workspace-tabs button')) {
    if (!visible(el)) continue;
    const s = getComputedStyle(el); const border = rgba(s.borderTopColor);
    if (Number(s.borderTopWidth.replace('px','')) === 0 || s.borderTopStyle === 'none') continue;
    const outside = backgrounds(el.parentElement);
    const borderContrast = Math.min(...outside.map(b => ratio(blend(border, b), b)));
    const fillContrast = Math.min(...backgrounds(el).flatMap(a => outside.map(b => ratio(a, b))));
    const minimum = Math.max(borderContrast, fillContrast);
    controls.push({ selector: el.className, border: s.borderTopColor, ratio: +minimum.toFixed(2), pass: minimum >= 3, disabled: !!el.closest(':disabled') });
  }
  return { url: location.href, theme: document.documentElement.dataset.theme, width: innerWidth, horizontalOverflow: document.documentElement.scrollWidth > innerWidth, text, controls, failures: text.filter(x => !x.pass).map(x => ({...x})), boundaryFailures: controls.filter(x => !x.pass && !x.disabled).map(x => ({...x})) };
}
