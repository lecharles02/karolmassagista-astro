import type { MiddlewareHandler } from 'astro';
import { redirectLocation } from '../config/redirects.mjs';

export const onRequest: MiddlewareHandler = (context, next) => {
  if (!['GET', 'HEAD'].includes(context.request.method)) return next();
  const destination = redirectLocation(context.url.href);
  return destination ? context.redirect(destination, 301) : next();
};
