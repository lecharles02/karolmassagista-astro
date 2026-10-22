const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/leoch/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://127.0.0.1:4321';
  const artifacts = path.resolve('test-artifacts');
  fs.mkdirSync(artifacts, { recursive: true });
  const errors = [];
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
  mobile.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  mobile.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  mobile.on('response', (response) => { if (response.status() === 404) errors.push(`404: ${response.url()}`); });
  await mobile.goto(baseUrl, { waitUntil: 'networkidle' });

  if (!await mobile.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)) throw new Error('overflow horizontal na home mobile');
  const openButton = mobile.getByLabel('Abrir menu');
  await openButton.click();
  const menu = openButton.locator('xpath=ancestor::nav[1]').locator('.fixed.inset-0');
  if ((await menu.getAttribute('class') || '').includes('translate-x-full')) throw new Error('menu mobile não abriu');
  await mobile.getByLabel('Fechar menu').click();
  if (!(await menu.getAttribute('class') || '').includes('translate-x-full')) throw new Error('menu mobile não fechou');
  await mobile.waitForTimeout(600);

  const faqButton = mobile.getByRole('button', { name: /É tudo com sigilo/ });
  if (await faqButton.count()) {
    await faqButton.click();
    if ((await faqButton.getAttribute('aria-expanded')) !== 'true') throw new Error(`FAQ não expandiu: ${errors.join(' | ')}`);
  }

  await mobile.screenshot({ path: path.join(artifacts, 'home-mobile.png'), fullPage: true });
  for (const route of ['/servicos/', '/blog/', '/massagem-tantrica-campinas/', '/massagem-sensual-campinas/']) {
    await mobile.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    if ((await mobile.locator('h1').count()) !== 1) throw new Error(`H1 inválido em ${route}`);
    if (!await mobile.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)) throw new Error(`overflow horizontal em ${route}`);
  }

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await desktop.goto(baseUrl, { waitUntil: 'networkidle' });
  await desktop.screenshot({ path: path.join(artifacts, 'home-desktop.png'), fullPage: false });
  await browser.close();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Teste visual/funcional concluído: menu, FAQ, 5 rotas e responsividade sem erros.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
