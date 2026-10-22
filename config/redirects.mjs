export const canonicalHost = 'karolmassagista.com.br';

export const legacyRedirects = new Map([
  ['/serviços', '/servicos/'],
  ['/massagem-quatro-maos-campinas', '/massagem-4-maos-campinas/'],
  ['/massagem-quatro-maos', '/massagem-4-maos-campinas/'],
  ['/massagem-4-maos', '/massagem-4-maos-campinas/'],
  ['/massagem-duas-massagistas-campinas', '/massagem-4-maos-campinas/'],
  ['/casa-de-massagem-em-campinas', '/'],
  ['/casa-de-massagem-campinas', '/'],
  ['/casa-de-massagem-campinas-cambui', '/'],
  ['/casa-de-massagem', '/'],
  ['/massagista-campinas', '/'],
  ['/massagista-em-campinas', '/'],
  ['/massagista-tantrica-campinas', '/massagem-tantrica-campinas/'],
  ['/massagem-erotica-campinas', '/massagem-sensual-campinas/'],
  ['/massagem-erotica', '/massagem-sensual-campinas/'],
  ['/massagem-relaxante-campinas', '/'],
]);

export function normalizeContentPath(pathname) {
  const collapsed = pathname.replace(/\/{2,}/g, '/');
  const key = collapsed.replace(/\/$/, '');
  let decoded = key;
  try { decoded = decodeURI(key); } catch { /* Malformed escapes remain a normal 404. */ }
  const target = legacyRedirects.get(decoded);
  if (target) return target;
  if (collapsed === '/' || /\.[^/]+$/.test(collapsed) || collapsed.startsWith('/_astro/')) return collapsed;
  return `${key}/`;
}

export function redirectLocation(input) {
  const url = new URL(input);
  const production = [canonicalHost, `www.${canonicalHost}`, 'karolmassagista.netlify.app'].includes(url.hostname);
  const pathname = normalizeContentPath(url.pathname);
  if (pathname === url.pathname && (!production || (url.hostname === canonicalHost && url.protocol === 'https:'))) return null;
  url.pathname = pathname;
  if (production) {
    url.host = canonicalHost;
    url.protocol = 'https:';
  }
  return url.href;
}
