const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/leoch/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const results = [];
  for (const route of ['/', '/sobre-karol-massagista/', '/depoimentos/', '/galeria/', '/blog/massagem-prostatica-saude/']) {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await context.route(/google-analytics\.com\/.*collect/, r => r.fulfill({ status: 204 }));
    await page.goto('http://127.0.0.1:4323' + route, { waitUntil: 'networkidle' });
    for (let y = 0; y < await page.evaluate(() => document.body.scrollHeight); y += 700) {
      await page.evaluate(y => scrollTo(0, y), y);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(300);
    results.push(await page.evaluate(route => ({
      route, overflow: document.documentElement.scrollWidth > innerWidth,
      text: document.querySelector('main')?.innerText || document.body.innerText,
      gtag: typeof window.gtag,
      resources: performance.getEntriesByType('resource').filter(r => new URL(r.name).origin === location.origin).map(r => ({ url: new URL(r.name).pathname, bytes: r.encodedBodySize })),
      claims: [...document.querySelectorAll('h1,h2,h3,p,li,span')].filter(e => /certifica|700|prostatite|especializa|formação|127|16 avaliações|Avaliação 5/i.test(e.textContent) && e.textContent.length < 700).map(e => e.outerHTML)
    }), route));
    await context.close();
  }
  await browser.close();
  const directory = path.resolve('reports/seo-2026-10-08/correcoes');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, (process.argv[2] || 'after') + '.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results.map(r => ({ route: r.route, bytes: r.resources.reduce((s, x) => s + x.bytes, 0), gtag: r.gtag, overflow: r.overflow, claims: r.claims })), null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
