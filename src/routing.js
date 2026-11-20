const pages = new Set(['/', '/about', '/projects', '/contact']);
export function clientDestination(anchor, event, currentHref) {
  if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
    || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return null;
  const current = new URL(currentHref);
  const next = new URL(anchor.href, current);
  if (next.origin !== current.origin || !pages.has(next.pathname.replace(/\/$/, '') || '/')) return null;
  // Native same-page anchors retain scrolling and browser history behavior.
  if (next.pathname === current.pathname && next.hash) return null;
  if (next.pathname === '/about' && next.hash === '#connect') { next.pathname = '/contact'; next.hash = ''; }
  return next;
}
