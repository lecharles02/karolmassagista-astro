import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { request } = require('C:/Users/leoch/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const directory = path.resolve('reports/seo-2026-10-08/correcoes');
const routes = [
  '/blog/como-apimentar-relacao-tantra/', '/blog/comunicacao-nao-verbal-toque/',
  '/blog/guia-massagem-lingam-campinas/', '/blog/guia-relaxamento-pos-trabalho-campinas/',
  '/blog/liberacao-miofascial-vs-tantrica/', '/blog/massagem-nuru-alivia-estresse/',
  '/blog/melhores-spas-vs-atendimento-privado/', '/blog/nuru-vs-tantrica/',
  '/blog/turismo-bem-estar-rmc/', '/blog/yoga-e-tantra-conexao/',
  '/depoimentos/', '/massagem-sensual-hortolandia/', '/massagem-sensual-sumare/',
  '/massagem-sensual-valinhos/', '/sobre-karol-massagista/',
];
const published = 'https://karolmassagista.com.br';
const local = 'http://127.0.0.1:4323';
const context = await request.newContext();
const sitemap = fs.readFileSync('dist/sitemap-0.xml', 'utf8');
const allPages = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name === 'index.html') allPages.push({ file: fullPath, html: fs.readFileSync(fullPath, 'utf8') });
  }
}
walk('dist');
async function chain(url) {
  const steps = [];
  for (let index = 0; index < 6; index++) {
    const response = await context.get(url, { maxRedirects: 0, timeout: 30000 });
    steps.push({ url, status: response.status(), location: response.headers().location || null });
    if (response.status() < 300 || response.status() >= 400 || !response.headers().location) break;
    url = new URL(response.headers().location, url).href;
  }
  return steps;
}
try {
  const coverage = await Promise.all(routes.map(async route => {
    const html = fs.readFileSync(path.join('dist', route, 'index.html'), 'utf8');
    const incoming = allPages.filter(page => !page.file.replaceAll('\\', '/').endsWith(route + 'index.html') && page.html.includes(`href="${route}"`)).length;
    return {
      route, live: await chain(published + route), local: await chain(local + route),
      canonical: html.match(/<link rel="canonical" href="([^"]*)"/)?.[1],
      h1: html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]*>/g, '').trim(),
      inSitemap: sitemap.includes(`<loc>${published}${route}</loc>`),
      noindex: /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html),
      incomingPages: incoming,
      action: 'Manter publicada nesta etapa; rastreamento, indexação e qualidade editorial devem ser acompanhados separadamente no GSC.'
    };
  }));
  const reportedErrors = [];
  for (const route of ['/massagista-em-campinas/', '/blog/homens-casados-massagem-tantrica', '/blog/massagem-prostatica-saude']) {
    reportedErrors.push({ route, live: await chain(published + route), local: await chain(local + route) });
  }
  const domains = [];
  for (const base of ['http://www.karolmassagista.com.br', 'https://www.karolmassagista.com.br']) domains.push({ base, live: await chain(base + '/') });
  fs.writeFileSync(path.join(directory, 'gsc-urls.json'), JSON.stringify({ checkedAt: new Date().toISOString(), coverage, reportedErrors, domains }, null, 2));
  console.log(JSON.stringify({ coverage: coverage.map(page => ({ route: page.route, live: page.live.at(-1).status, local: page.local.at(-1).status, sitemap: page.inSitemap, noindex: page.noindex, incoming: page.incomingPages })), reportedErrors, domains }, null, 2));
} finally { await context.dispose(); }
