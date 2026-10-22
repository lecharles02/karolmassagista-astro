import fs from 'node:fs';
import path from 'node:path';

const site = 'https://karolmassagista.com.br';
const root = path.resolve('dist');
const htmlFiles = [];
const errors = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(filePath);
    else if (entry.name === 'index.html' || entry.name === '404.html') htmlFiles.push(filePath);
  }
}

function routeFromFile(filePath) {
  const relative = path.relative(root, filePath).replaceAll('\\', '/');
  if (relative === 'index.html') return '/';
  if (relative === '404.html') return '/404.html';
  return `/${relative.replace(/index\.html$/, '')}`;
}

function attribute(html, selector) {
  return html.match(selector)?.[1] || '';
}

walk(root);
const routes = new Set(htmlFiles.map(routeFromFile));
const titles = new Map();
const descriptions = new Map();

for (const filePath of htmlFiles) {
  const route = routeFromFile(filePath);
  if (route === '/404.html') continue;
  const html = fs.readFileSync(filePath, 'utf8');
  const readableText = html
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  const title = attribute(html, /<title>([^<]*)<\/title>/);
  const description = attribute(html, /<meta name="description" content="([^"]*)"/);
  const canonical = attribute(html, /<link rel="canonical" href="([^"]*)"/);
  const ogUrl = attribute(html, /<meta property="og:url" content="([^"]*)"/);
  const ogTitle = attribute(html, /<meta property="og:title" content="([^"]*)"/);
  const ogDescription = attribute(html, /<meta property="og:description" content="([^"]*)"/);
  const twitterTitle = attribute(html, /<meta name="twitter:title" content="([^"]*)"/);
  const twitterDescription = attribute(html, /<meta name="twitter:description" content="([^"]*)"/);
  const expectedCanonical = `${site}${route}`;

  if (title.length < 35 || title.length > 65) errors.push(`${route}: title com ${title.length} caracteres`);
  if (description.length < 120 || description.length > 170) errors.push(`${route}: description com ${description.length} caracteres`);
  if (canonical !== expectedCanonical) errors.push(`${route}: canonical incorreta (${canonical})`);
  if (ogUrl !== canonical) errors.push(`${route}: og:url diferente da canonical`);
  if (ogTitle !== title || twitterTitle !== title) errors.push(`${route}: títulos sociais divergentes`);
  if (ogDescription !== description || twitterDescription !== description) errors.push(`${route}: descriptions sociais divergentes`);
  if ((html.match(/<h1\b/g) || []).length !== 1) errors.push(`${route}: quantidade de H1 diferente de 1`);
  if (html.includes('\uFFFD') || html.includes('[CONTEÚDO:') || /[\p{L}]\?[\p{L}]/u.test(readableText)) errors.push(`${route}: conteúdo corrompido ou placeholder`);
  if (html.includes('<astro-island')) errors.push(`${route}: hidratação Astro desnecessária presente`);
  if (html.includes('"@type":"AggregateRating"')) errors.push(`${route}: AggregateRating autodeclarado presente`);
  if (html.includes('type="text/partytown"')) errors.push(`${route}: script Analytics sem execução`);
  if ((html.match(/gtag\("config","G-Q489ZNZEBV"\)/g) || []).length !== 1) errors.push(`${route}: inicialização GA4 ausente ou duplicada`);
  if (route !== '/' && /<link\b(?=[^>]*as="image")(?=[^>]*karol-massagista-tantrica-hero-campinas)[^>]*>/.test(html)) errors.push(`${route}: preload de imagem não utilizada`);
  if (/127 avaliações|16 avaliações|Avaliação 5\.0|700\+|Certificação em Massagem/.test(readableText)) errors.push(`${route}: informação não confirmada publicada`);

  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(match[1]);
      function checkNested(item) {
        if (!item || typeof item !== 'object') return;
        if (['Review', 'AggregateRating'].includes(item['@type']) || item.aggregateRating || item.review) errors.push(`${route}: avaliações sem fonte verificável no schema`);
        if ([item['@type']].flat().includes('LocalBusiness') && (item.geo || item.address?.streetAddress || item.address?.postalCode)) errors.push(`${route}: localização não confirmada no schema`);
        Object.values(item).forEach(checkNested);
      }
      checkNested(data);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
        if (types.includes('WebPage') && (item.name !== title || item.description !== description || item.url !== canonical)) {
          errors.push(`${route}: WebPage divergente dos metadados`);
        }
        if ((types.includes('BlogPosting') || types.includes('Article')) && item.headline !== title) {
          errors.push(`${route}: artigo divergente do title`);
        }
        if (types.includes('LocalBusiness')) {
          if (item.aggregateRating) errors.push(`${route}: avaliação autodeclarada no LocalBusiness`);
          if (item.address?.streetAddress || item.address?.postalCode) errors.push(`${route}: endereço detalhado não confirmado no LocalBusiness`);
          if (Array.isArray(item.sameAs) && item.sameAs.some((url) => /wa\.me/.test(url))) errors.push(`${route}: WhatsApp usado como sameAs`);
        }
      }
    } catch { errors.push(`${route}: JSON-LD inválido`); }
  }

  for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/application\/ld\+json|text\/partytown|type=["']module|\bsrc=/.test(match[1])) continue;
    try { new Function(match[2]); } catch (error) { errors.push(`${route}: JavaScript inline inválido (${error.message})`); }
  }

  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = match[0];
    if (!/\balt=/.test(tag)) errors.push(`${route}: imagem sem alt`);
    if (!/\bwidth=/.test(tag) || !/\bheight=/.test(tag)) errors.push(`${route}: imagem sem dimensões`);
    if (!/\bdecoding=/.test(tag)) errors.push(`${route}: imagem sem decoding`);
    const srcset = tag.match(/\bsrcset="([^"]*)"/)?.[1];
    if (srcset) for (const candidate of srcset.split(',')) {
      const asset = candidate.trim().split(/\s+/)[0];
      if (asset.startsWith('/') && !fs.existsSync(path.join(root, asset))) errors.push(`${route}: variante de imagem inexistente (${asset})`);
    }
  }

  for (const match of html.matchAll(/href=["'](\/[^"']*)/g)) {
    const href = match[1];
    const clean = decodeURI(href.split('#')[0].split('?')[0]);
    if (!clean || clean.startsWith('/_astro/') || /\.[a-z0-9]+$/i.test(clean)) continue;
    const target = clean === '/' ? '/' : `${clean.replace(/\/+$/, '')}/`;
    if (!routes.has(target)) errors.push(`${route}: link interno sem página (${href})`);
  }

  for (const match of html.matchAll(/(?:href|src)=["'](\/[^"']+)/g)) {
    const asset = decodeURI(match[1].split('#')[0].split('?')[0]);
    if (!/\.[a-z0-9]+$/i.test(asset)) continue;
    if (!fs.existsSync(path.join(root, asset.replace(/^\//, '')))) errors.push(`${route}: recurso local inexistente (${asset})`);
  }

  if (titles.has(title)) errors.push(`${route}: title duplicado com ${titles.get(title)}`);
  else titles.set(title, route);
  if (descriptions.has(description)) errors.push(`${route}: description duplicada com ${descriptions.get(description)}`);
  else descriptions.set(description, route);
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap-0.xml'), 'utf8');
const sitemapRoutes = new Set([...sitemap.matchAll(/<loc>https:\/\/karolmassagista\.com\.br([^<]*)<\/loc>/g)].map((match) => match[1] || '/'));
for (const route of routes) if (route !== '/404.html' && !sitemapRoutes.has(route)) errors.push(`${route}: ausente do sitemap`);
for (const route of sitemapRoutes) if (!routes.has(route)) errors.push(`${route}: sitemap aponta para página inexistente`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Validação concluída: ${routes.size - 1} páginas, ${sitemapRoutes.size} URLs no sitemap, 0 erros.`);
