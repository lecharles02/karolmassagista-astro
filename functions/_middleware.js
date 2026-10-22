import { redirectLocation } from '../config/redirects.mjs';

export { normalizeContentPath } from '../config/redirects.mjs';

export function onRequest({ request, next }) {
  if (!['GET', 'HEAD'].includes(request.method)) return next();
  const destination = redirectLocation(request.url);
  return destination ? Response.redirect(destination, 301) : next();
}
