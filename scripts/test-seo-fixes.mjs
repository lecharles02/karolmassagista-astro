import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { canonicalHost, legacyRedirects, redirectLocation } from '../config/redirects.mjs';
import { onRequest } from '../functions/_middleware.js';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/leoch/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const site = `https://${canonicalHost}`;
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4323';
const directory = path.resolve('reports/seo-2026-10-08/correcoes');
fs.mkdirSync(directory, { recursive: true });
const rules = fs.readFileSync('dist/_redirects', 'utf8').split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split(/\s+/));
const redirects = [];

for (const [source, destination, status] of rules) {
  assert.equal(status, '301');
  assert.notEqual(source, destination);
  assert.ok(fs.existsSync(path.join('dist', destination, 'index.html')), `Destino ausente: ${destination}`);
  assert.equal(redirectLocation(`${site}${source}?utm_source=teste`), `${site}${destination}?utm_source=teste`);
  assert.equal(redirectLocation(`${site}${destination}`), null, `Loop: ${destination}`);
  for (const method of ['GET', 'HEAD']) {
    const response = onRequest({ request: new Request(`${site}${encodeURI(decodeURI(source))}?utm_source=teste`, { method }), next: () => new Response('OK') });
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), `${site}${destination}?utm_source=teste`);
  }
  redirects.push({ source, destination, status: 301 });
}
for (const prefix of [`http://${canonicalHost}`, `http://www.${canonicalHost}`, `https://www.${canonicalHost}`]) {
  assert.equal(redirectLocation(`${prefix}/blog/massagem-prostatica-saude?x=1`), `${site}/blog/massagem-prostatica-saude/?x=1`);
}
assert.equal(redirectLocation('https://preview.pages.dev/galeria/'), null);
assert.equal(redirectLocation('https://preview.pages.dev/galeria'), 'https://preview.pages.dev/galeria/');
assert.equal(redirectLocation(`${site}/imagens/galeria/karol-galeria-01.webp`), null);
assert.equal(redirectLocation(`${site}//blog///massagem-prostatica-saude`), `${site}/blog/massagem-prostatica-saude/`);
assert.equal(onRequest({ request: new Request(`${site}/servicos`, { method: 'POST' }), next: () => new Response('OK') }).status, 200);

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const requests = [];
  const errors = [];
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
  await context.route(/google-analytics\.com\/.*collect/, route => {
    const request = route.request();
    const parameters = new URL(request.url()).searchParams;
    const body = new URLSearchParams(request.postData() || '');
    requests.push({ measurementId: parameters.get('tid') || body.get('tid'), event: parameters.get('en') || body.get('en'), path: parameters.get('dl') || body.get('dl') });
    return route.fulfill({ status: 204 });
  });
  const page = await context.newPage();
  const googleRequests = [];
  page.on('request', request => { if (/googletagmanager|google-analytics/.test(request.url())) googleRequests.push({ url: request.url(), method: request.method() }); });
  page.on('pageerror', error => errors.push(error.message));
  for (const route of ['/massagista-em-campinas/', '/blog/homens-casados-massagem-tantrica', '/blog/massagem-prostatica-saude']) {
    const response = await context.request.get(base + route, { maxRedirects: 0 });
    assert.equal(response.status(), 301, `Redirecionamento HTTP local incorreto: ${route}`);
    const destination = response.headers().location;
    assert.equal((await context.request.get(new URL(destination, base).href)).status(), 200);
  }
  const routes = ['/', '/depoimentos/', '/sobre-karol-massagista/', '/blog/massagem-prostatica-saude/', '/galeria/', '/massagem-sensual-sumare/'];
  const rendered = [];
  for (const route of routes) {
    const response = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 45000 });
    assert.equal(response.status(), 200);
    await page.waitForFunction(() => typeof window.gtag === 'function');
    await page.waitForTimeout(5500);
    const data = await page.evaluate(() => ({
      title: document.title,
      overflow: document.documentElement.scrollWidth > innerWidth,
      h1: [...document.querySelectorAll('h1')].map(e => e.textContent.trim()),
      text: document.body.innerText,
      oldImagePreloads: [...document.querySelectorAll('link[rel="preload"][as="image"]')].filter(e => e.href.includes('karol-massagista-tantrica-hero-campinas')).length,
      configs: window.dataLayer.filter(item => item[0] === 'config').map(item => item[1]),
      partytown: document.querySelectorAll('script[type="text/partytown"]').length,
      brokenImages: [...document.images].filter(image => image.complete && image.naturalWidth === 0).map(image => image.src),
      schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map(e => JSON.parse(e.textContent))
    }));
    assert.equal(data.overflow, false, `Overflow: ${route}`);
    assert.equal(data.h1.length, 1);
    assert.deepEqual(data.configs, ['G-Q489ZNZEBV']);
    assert.equal(data.partytown, 0);
    assert.equal(data.oldImagePreloads, 0);
    assert.deepEqual(data.brokenImages, []);
    assert.ok(!/127 avaliações|16 avaliações|Avaliação 5\.0|700\+|Certificação em Massagem|30%|prevenção de prostatite/.test(data.text));
    const inspect = item => {
      if (!item || typeof item !== 'object') return;
      assert.ok(!['Review', 'AggregateRating'].includes(item['@type']));
      assert.ok(!item.aggregateRating && !item.review);
      if ([item['@type']].flat().includes('LocalBusiness')) assert.ok(!item.geo && !item.address?.streetAddress && !item.address?.postalCode);
      Object.values(item).forEach(inspect);
    };
    data.schemas.forEach(inspect);
    rendered.push({ route, h1: data.h1[0], overflow: data.overflow, config: data.configs[0], schemaCount: data.schemas.length });
    if (route === '/') {
      const question = page.locator('#faq summary').first();
      await question.click();
      assert.equal(await question.locator('..').getAttribute('open'), '');
      await question.click();
      const heroLogo = page.locator('.home-hero__logo img');
      assert.equal(await heroLogo.evaluate(image => Math.round(image.getBoundingClientRect().width)), 72);
      const originals = page.locator('#galeria .karol-carousel__slide:not([aria-hidden="true"])');
      assert.equal(await originals.count(), 10);
      assert.ok((await originals.nth(5).locator('img').getAttribute('srcset')).includes('karol-galeria-massagem-spa'));
      await page.locator('#galeria').scrollIntoViewIfNeeded();
      const transform = await page.locator('#galeria .karol-carousel__track').evaluate(e => e.style.transform);
      await page.waitForTimeout(700);
      assert.notEqual(await page.locator('#galeria .karol-carousel__track').evaluate(e => e.style.transform), transform);
      await page.locator('#galeria [data-carousel-next]').click();
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(directory, 'home-mobile.png'), fullPage: false });
    }
    if (route === '/depoimentos/') await page.screenshot({ path: path.join(directory, 'avaliacoes-mobile.png'), fullPage: false });
  }
  await page.waitForTimeout(1500);
  const views = requests.filter(request => request.event === 'page_view');
  fs.writeFileSync(path.join(directory, 'analytics-diagnostics.json'), JSON.stringify({ requests, googleRequests, errors }, null, 2));
  assert.ok(views.length >= routes.length, `page_view não observado em todas as navegações: ${JSON.stringify(requests)}`);
  assert.ok(views.every(request => request.measurementId === 'G-Q489ZNZEBV'));
  assert.deepEqual(errors, []);
  const desktop = await context.newPage();
  await desktop.setViewportSize({ width: 1440, height: 900 });
  await desktop.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await desktop.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await desktop.screenshot({ path: path.join(directory, 'home-desktop.png'), fullPage: false });
  await context.close();
  fs.writeFileSync(path.join(directory, 'tests.json'), JSON.stringify({ redirects, rendered, analytics: { requests: views, network: 'Pedidos GA4 interceptados com HTTP 204 para não poluir a propriedade real.' }, javascriptErrors: errors }, null, 2));
  console.log(`Aprovados: ${redirects.length} regras, GET/HEAD, domínio/HTTPS/query string, ${rendered.length} páginas em 375px, desktop 1440px e ${views.length} page_view GA4.`);
} finally {
  await browser.close();
}
