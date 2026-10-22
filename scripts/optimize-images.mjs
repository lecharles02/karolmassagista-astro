import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const images = [
  'public/imagens/hero/karol-massagista-tantrica-hero-campinas-v2.webp',
  'public/imagens/sobre-mim/foto-placeholder.webp',
];

for (const relativePath of images) {
  const sourcePath = path.resolve(relativePath);
  const temporaryPath = `${sourcePath}.optimized.webp`;
  const before = (await fs.stat(sourcePath)).size;
  await sharp(sourcePath).webp({ quality: 80, effort: 6, smartSubsample: true }).toFile(temporaryPath);
  const after = (await fs.stat(temporaryPath)).size;
  if (after < before) await fs.rename(temporaryPath, sourcePath);
  else await fs.unlink(temporaryPath);
  console.log(`${relativePath}: ${Math.round(before / 1024)} KB -> ${Math.round(Math.min(before, after) / 1024)} KB`);
}
