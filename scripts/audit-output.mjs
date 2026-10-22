import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('dist');
const htmlFiles = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(filePath);
    else if (entry.name.endsWith('.html')) htmlFiles.push(filePath);
  }
}

walk(root);
const missingDimensions = new Map();
const referencedImages = new Set();
const schemaTypes = {};
let islands = 0;
let scripts = 0;
let jsonLd = 0;
let duplicateJsonLd = 0;
const islandComponents = {};

for (const filePath of htmlFiles) {
  const html = fs.readFileSync(filePath, 'utf8');
  islands += (html.match(/<astro-island\b/g) || []).length;
  for (const match of html.matchAll(/<astro-island[^>]*component-url=["']([^"']+)/g)) {
    islandComponents[match[1]] = (islandComponents[match[1]] || 0) + 1;
  }
  scripts += (html.match(/<script\b/g) || []).length;

  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = match[0];
    const source = tag.match(/\bsrc=["']([^"']+)/)?.[1]?.split('?')[0];
    if (!source) continue;
    referencedImages.add(source);
    if (!/\bwidth=/.test(tag) || !/\bheight=/.test(tag)) {
      const files = missingDimensions.get(source) || [];
      files.push(path.relative(root, filePath).replaceAll('\\', '/'));
      missingDimensions.set(source, files);
    }
  }

  const seen = new Set();
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)) {
    jsonLd += 1;
    try {
      const data = JSON.parse(match[1]);
      const key = JSON.stringify(data);
      if (seen.has(key)) duplicateJsonLd += 1;
      seen.add(key);
      for (const object of Array.isArray(data) ? data : [data]) {
        const objectTypes = Array.isArray(object?.['@type']) ? object['@type'] : [object?.['@type']];
        for (const type of objectTypes) if (type) schemaTypes[type] = (schemaTypes[type] || 0) + 1;
      }
    } catch {}
  }
}

console.log({ html: htmlFiles.length, islands, islandComponents, scripts, jsonLd, duplicateJsonLd, schemaTypes });
console.log('\nMISSING_DIMENSIONS');
for (const [source, files] of missingDimensions) {
  let metadata = '';
  const relativeSource = decodeURI(source).replace(/^\//, '');
  for (const base of ['public', 'dist']) {
    const filePath = path.resolve(base, relativeSource);
    if (!fs.existsSync(filePath)) continue;
    try {
      const image = await sharp(filePath).metadata();
      metadata = `${image.width}x${image.height} ${Math.round(fs.statSync(filePath).size / 1024)}KB`;
      break;
    } catch {}
  }
  console.log(source, metadata, [...new Set(files)].join(','));
}

console.log('\nREFERENCED_LARGE_IMAGES');
for (const source of referencedImages) {
  const filePath = path.resolve('dist', decodeURI(source).replace(/^\//, ''));
  if (!fs.existsSync(filePath) || !/\.(webp|png|jpe?g|avif)$/i.test(filePath)) continue;
  const size = fs.statSync(filePath).size;
  if (size <= 100 * 1024) continue;
  const image = await sharp(filePath).metadata();
  console.log(source, `${Math.round(size / 1024)}KB`, `${image.width}x${image.height}`);
}

console.log('\nINVALID_INLINE_SCRIPTS');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
let scriptIndex = 0;
for (const match of home.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
  scriptIndex += 1;
  if (/application\/ld\+json|type=["']text\/partytown|\bsrc=/.test(match[1])) continue;
  try { new Function(match[2]); }
  catch (error) { console.log(scriptIndex, error.message, match[2].slice(0, 180).replace(/\s+/g, ' ')); }
}
