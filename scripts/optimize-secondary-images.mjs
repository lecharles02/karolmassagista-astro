import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const files = [
  ...Array.from({ length: 9 }, (_, i) => `imagens/galeria/karol-galeria-${String(i + 1).padStart(2, '0')}.webp`),
  'imagens/galeria/karol-galeria-massagem-spa.webp',
  'imagens/meu-espaco/ambiente-recepcao.webp',
  'imagens/meu-espaco/ambiente-sala.webp',
  'imagens/meu-espaco/ambiente-maca.webp',
  'imagens/sobre-mim/karol-foto-sobre-outubro.webp',
];
const images = {};
for (const file of files) {
  const source = path.join('public', file);
  const original = await fs.stat(source);
  const metadata = await sharp(source).metadata();
  const variants = [];
  for (const width of [480, 800]) {
    if (width >= metadata.width) continue;
    const target = file.replace('.webp', `-w${width}-v1.webp`);
    const info = await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(path.join('public', target));
    if (info.size < original.size) variants.push({ src: '/' + target, width: info.width, height: info.height, bytes: info.size });
  }
  images['/' + file] = { width: metadata.width, height: metadata.height, bytes: original.size, variants };
}
const logo = 'imagens/hero/karol-logo-site.webp';
const logoInfo = { bytes: (await fs.stat('public/' + logo)).size, variants: [] };
for (const width of [96, 192]) {
  const target = `imagens/hero/karol-logo-w${width}-v1.webp`;
  const info = await sharp('public/' + logo).resize({ width }).webp({ quality: 90, effort: 6 }).toFile('public/' + target);
  logoInfo.variants.push({ src: '/' + target, width: info.width, bytes: info.size });
}
await fs.writeFile('src/lib/responsive-images.json', JSON.stringify({ images, logo: logoInfo }, null, 2) + '\n');
console.log(JSON.stringify({ images: Object.keys(images).length, logo: logoInfo }, null, 2));
